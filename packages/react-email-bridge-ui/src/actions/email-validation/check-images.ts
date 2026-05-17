'use server';

import type { IncomingMessage } from 'node:http';
import { parse } from 'node-html-parser';
import {
  type CodeLocation,
  getCodeLocationFromAstElement,
} from './get-code-location-from-ast-element';
import { quickFetch } from './quick-fetch';
import { isTemplateMarker } from '../../utils/is-template-marker';

export type ImageCheck = { passed: boolean } & (
  | {
      type: 'accessibility';
      metadata: {
        alt: string | undefined;
      };
    }
  | {
      type: 'fetch_attempt';
      metadata: {
        fetchStatusCode: number | undefined;
      };
    }
  | {
      type: 'image_size';
      metadata: {
        byteCount: number | undefined;
      };
    }
  | {
      type: 'syntax';
    }
  | {
      type: 'security';
    }
);

export interface ImageCheckingResult {
  status: 'success' | 'warning' | 'error';
  source: string;
  codeLocation: CodeLocation;
  checks: ImageCheck[];
}

const getResponseSizeInBytes = async (res: IncomingMessage) => {
  let totalBytes = 0;
  for await (const chunk of res) {
    totalBytes += chunk.byteLength;
  }
  return totalBytes;
};

export const checkImages = async (code: string, base: string) => {
  const ast = parse(code);

  const readableStream = new ReadableStream<ImageCheckingResult>({
    async start(controller) {
      const images = ast.querySelectorAll('img');
      for await (const image of images) {
        const rawSource = image.attributes.src;
        if (!rawSource) continue;
        // Skip dynamic markers ({{logoUrl}}, *|IMG|*, etc) — they're filled
        // at send time on the destination platform; we can't validate them.
        if (isTemplateMarker(rawSource)) continue;

        const source = rawSource?.startsWith('/')
          ? `${base}${rawSource}`
          : rawSource;

        const result: ImageCheckingResult = {
          source: rawSource,
          codeLocation: getCodeLocationFromAstElement(image, code),
          status: 'success',
          checks: [],
        };

        const alt = image.attributes.alt;
        // Dynamic alt (alt={`{{name}}`}) is treated as present — the platform
        // supplies the real text at send time.
        const altPresent = alt !== undefined && alt.length > 0;
        const altIsDynamic = isTemplateMarker(alt);
        result.checks.push({
          passed: altPresent || altIsDynamic,
          type: 'accessibility',
          metadata: {
            alt,
          },
        });
        if (!altPresent && !altIsDynamic) {
          result.status = 'warning';
        }

        try {
          const url = new URL(source);
          result.checks.push({
            passed: true,
            type: 'syntax',
          });

          if (rawSource.startsWith('http://')) {
            result.checks.push({
              passed: false,
              type: 'security',
            });
            result.status = 'warning';
          } else {
            result.checks.push({
              passed: true,
              type: 'security',
            });
          }

          let res: IncomingMessage | undefined;
          try {
            res = await quickFetch(url);
            const hasSucceeded =
              res.statusCode?.toString().startsWith('2') ?? false;
            result.checks.push({
              type: 'fetch_attempt',
              passed: hasSucceeded,
              metadata: {
                fetchStatusCode: res.statusCode,
              },
            });
            if (!hasSucceeded) {
              result.status = res.statusCode?.toString().startsWith('3')
                ? 'warning'
                : 'error';
            }

            const responseSizeBytes = await getResponseSizeInBytes(res);
            result.checks.push({
              type: 'image_size',
              passed: responseSizeBytes < 1_048_576, // 1024 x 1024 bytes
              metadata: {
                byteCount: responseSizeBytes,
              },
            });
            if (responseSizeBytes > 1_048_576 && result.status !== 'error') {
              result.status = 'warning';
            }
          } catch {
            result.checks.push({
              type: 'fetch_attempt',
              passed: false,
              metadata: {
                fetchStatusCode: undefined,
              },
            });
            result.status = 'error';
          }
        } catch {
          result.checks.push({
            passed: false,
            type: 'syntax',
          });
          result.status = 'error';
        }

        controller.enqueue(result);
      }
      controller.close();
    },
  });

  return readableStream;
};
