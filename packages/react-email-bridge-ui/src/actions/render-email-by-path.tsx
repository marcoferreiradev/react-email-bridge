'use server';

import fs from 'node:fs';
import path from 'node:path';
import logSymbols from 'log-symbols';
import type React from 'react';
import {
  substituteSentinels,
  unescapeMarkers,
} from 'react-email-bridge';
import { previewWithFixture } from 'react-email-bridge/hbs';
import {
  isBuilding,
  isPreviewDevelopment,
  previewServerLocation,
  userProjectLocation,
} from '../app/env';
import { convertStackWithSourceMap } from '../utils/convert-stack-with-sourcemap';
import { createJsxRuntime } from '../utils/create-jsx-runtime';
import { getEmailComponent } from '../utils/get-email-component';
import { registerSpinnerAutostopping } from '../utils/register-spinner-autostopping';
import {
  createSpinner,
  type Spinner,
  stopSpinnerAndPersist,
} from '../utils/spinner';
import { styleText } from '../utils/style-text';
import type { ErrorObject } from '../utils/types/error-object';

export interface RenderedEmailMetadata {
  /** Pretty-printed HBS source (markers literal). Shown in code view "HTML" tab. */
  prettyMarkup: string;
  /** HTML interpolated against fixture (Handlebars ran). Shown in iframe. */
  markup: string;
  markupWithReferences?: string;
  /** Plain text with markers literal. Shown in code view "Plain Text" tab. */
  plainText: string;
  /** Source .tsx, shown in code view "React" tab. */
  reactMarkup: string;

  basename: string;
  extname: string;

  /** Bridge-specific: state of the adjacent `.json` fixture. */
  fixture?: {
    found: boolean;
    path: string;
    data?: Record<string, unknown>;
    error?: string;
  };
  /** Bridge-specific: Handlebars compile/render error against fixture. */
  hbsError?: { message: string; line?: number; column?: number };
}

export type EmailRenderingResult =
  | RenderedEmailMetadata
  | {
      error: ErrorObject;
    };

const cache = new Map<string, EmailRenderingResult>();

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function renderFixtureErrorHtml(
  error: { message: string; line?: number; column?: number },
  fixture: { found: boolean; path: string; error?: string }
): string {
  const banner = !fixture.found
    ? `
      <div style="background:#fff3cd;border:1px solid #ffc107;padding:16px;border-radius:8px;margin-bottom:24px">
        <strong>No fixture found.</strong>
        <p style="margin:8px 0 0">Create <code style="background:#f4f4f4;padding:2px 6px;border-radius:3px">${escapeHtml(fixture.path)}</code> with sample data to enable preview.</p>
        ${fixture.error ? `<p style="margin:8px 0 0;color:#dc3545"><strong>JSON parse error:</strong> ${escapeHtml(fixture.error)}</p>` : ''}
      </div>
    `
    : '';
  return `<!doctype html><html><body style="font-family:ui-monospace,'SF Mono',Menlo,monospace;padding:32px;color:#1f2328;line-height:1.5;max-width:900px;margin:0 auto">
    ${banner}
    <h2 style="margin:0 0 16px;font-family:system-ui;color:#b00020">Handlebars error</h2>
    <pre style="background:#fff5f5;border:1px solid #ffdddd;padding:16px;border-radius:8px;white-space:pre-wrap;font-size:13px;margin:0">${escapeHtml(error.message)}</pre>
    ${error.line ? `<p style="margin:12px 0 0;color:#666;font-size:12px">at line ${error.line}${error.column ? `, column ${error.column}` : ''}</p>` : ''}
  </body></html>`;
}

const createLogBufferer = (
  originalLogger: (...args: any[]) => void,
  overwriteLogger: (logger: (...args: any[]) => void) => void,
) => {
  let logs: Array<any[]> = [];

  let timesCorked = 0;

  return {
    buffer: () => {
      timesCorked += 1;
      overwriteLogger((...args: any[]) => logs.push(args));
    },
    flush: () => {
      timesCorked = Math.max(timesCorked - 1, 0);
      // This ensures that, only once flushing has been called as many times as
      // buffering, that the logs are actually flushed.
      if (timesCorked === 0) {
        for (const logArgs of logs) {
          originalLogger(...logArgs);
        }
        logs = [];
        overwriteLogger(originalLogger);
      }
    },
  };
};

const logBufferer = createLogBufferer(
  console.log,
  (logger) => (console.log = logger),
);
const errorBufferer = createLogBufferer(
  console.error,
  (logger) => (console.error = logger),
);
const infoBufferer = createLogBufferer(
  console.info,
  (logger) => (console.info = logger),
);
const warnBufferer = createLogBufferer(
  console.warn,
  (logger) => (console.warn = logger),
);

export const renderEmailByPath = async (
  emailPath: string,
  invalidatingCache = false,
): Promise<EmailRenderingResult> => {
  if (invalidatingCache) {
    cache.delete(emailPath);
  }

  if (cache.has(emailPath)) {
    return cache.get(emailPath)!;
  }

  const emailFilename = path.basename(emailPath);
  let spinner: Spinner | undefined;
  if (!isBuilding && !isPreviewDevelopment) {
    logBufferer.buffer();
    errorBufferer.buffer();
    infoBufferer.buffer();
    warnBufferer.buffer();
    spinner = createSpinner({
      text: `Rendering email template ${emailFilename}\n`,
      prefixText: ' ',
      stream: process.stderr,
    });
    spinner.start();
    registerSpinnerAutostopping(spinner);
  }

  const originalJsxRuntimePath = path.resolve(
    previewServerLocation,
    'jsx-runtime',
  );
  const jsxRuntimePath = await createJsxRuntime(
    userProjectLocation,
    originalJsxRuntimePath,
  );

  const timeBeforeEmailBundled = performance.now();
  const componentResult = await getEmailComponent(emailPath, jsxRuntimePath);
  const millisecondsToBundled = performance.now() - timeBeforeEmailBundled;

  if ('error' in componentResult) {
    stopSpinnerAndPersist(spinner, {
      symbol: logSymbols.error,
      text: `Failed while rendering ${emailFilename}`,
    });
    logBufferer.flush();
    errorBufferer.flush();
    infoBufferer.flush();
    warnBufferer.flush();
    return { error: componentResult.error };
  }

  const {
    emailComponent: Email,
    createElement,
    render,
    renderWithReferences,
    sourceMapToOriginalFile,
  } = componentResult;

  // D4: PreviewProps dropped. Component always receives empty props; markers are
  // string literals, fixture is fed to Handlebars at the next step.
  const EmailComponent = Email as React.FunctionComponent;
  try {
    const timeBeforeEmailRendered = performance.now();
    const element = createElement(EmailComponent, {});
    const rawMarkupWithReferences = await renderWithReferences(element, {
      pretty: true,
    });
    const rawPrettyMarkup = await render(element, {
      pretty: true,
    });
    const rawMarkup = await render(element, {
      pretty: false,
    });
    const rawPlainText = await render(element, {
      plainText: true,
    });

    // ── react-email-bridge HBS pipeline ────────────────────────────
    // Each render output passes through: substituteSentinels (hbs() in style
    // attrs → {{path}}) then unescapeMarkers (decode HTML entities INSIDE
    // markers, since React escapes `"`, `'`, `>` in text nodes). Result is
    // the marker-literal output that gets pasted into VTEX/Mandrill/etc.
    const exportMarkup = unescapeMarkers(substituteSentinels(rawMarkup));
    const exportPrettyMarkup = unescapeMarkers(substituteSentinels(rawPrettyMarkup));
    const exportPlainText = unescapeMarkers(substituteSentinels(rawPlainText));
    const exportMarkupWithReferences = unescapeMarkers(
      substituteSentinels(rawMarkupWithReferences)
    );

    // Load adjacent fixture `<basename>.json`.
    const fixturePath = emailPath.replace(/\.(tsx|jsx|ts|js)$/, '.json');
    let fixture: NonNullable<RenderedEmailMetadata['fixture']> = {
      found: false,
      path: fixturePath,
    };
    if (fs.existsSync(fixturePath)) {
      try {
        const raw = await fs.promises.readFile(fixturePath, 'utf-8');
        fixture = {
          found: true,
          path: fixturePath,
          data: JSON.parse(raw),
        };
      } catch (e) {
        fixture = {
          found: false,
          path: fixturePath,
          error: `Failed to parse JSON: ${(e as Error).message}`,
        };
      }
    }

    // Run Handlebars against fixture for the iframe preview.
    const previewResult = previewWithFixture(
      exportMarkup,
      fixture.data ?? {},
      { strict: false }
    );
    const interpolatedMarkup = previewResult.error
      ? renderFixtureErrorHtml(previewResult.error, fixture)
      : previewResult.html;

    const reactMarkup = await fs.promises.readFile(emailPath, 'utf-8');

    const millisecondsToRendered = performance.now() - timeBeforeEmailRendered;
    let timeForConsole = `${millisecondsToRendered.toFixed(0)}ms`;
    if (millisecondsToRendered <= 450) {
      timeForConsole = styleText('green', timeForConsole);
    } else if (millisecondsToRendered <= 1000) {
      timeForConsole = styleText('yellow', timeForConsole);
    } else {
      timeForConsole = styleText('red', timeForConsole);
    }
    stopSpinnerAndPersist(spinner, {
      symbol: logSymbols.success,
      text: `Successfully rendered ${emailFilename} in ${timeForConsole} (bundled in ${millisecondsToBundled.toFixed(0)}ms)`,
    });
    logBufferer.flush();
    errorBufferer.flush();
    infoBufferer.flush();
    warnBufferer.flush();

    const renderingResult: RenderedEmailMetadata = {
      prettyMarkup: exportPrettyMarkup,
      // `markup` is the INTERPOLATED HTML (Handlebars + fixture) shown in iframe.
      // React 18 nullbyte sanitization preserved.
      markup: interpolatedMarkup.replaceAll('\0', ''),
      markupWithReferences: exportMarkupWithReferences.replaceAll('\0', ''),
      plainText: exportPlainText,
      reactMarkup,

      basename: path.basename(emailPath, path.extname(emailPath)),
      extname: path.extname(emailPath).slice(1),

      fixture,
      hbsError: previewResult.error,
    };

    cache.set(emailPath, renderingResult);

    return renderingResult;
  } catch (exception) {
    const error = exception as Error;

    stopSpinnerAndPersist(spinner, {
      symbol: logSymbols.error,
      text: `Failed while rendering ${emailFilename}`,
    });
    logBufferer.flush();
    errorBufferer.flush();
    infoBufferer.flush();
    warnBufferer.flush();

    if (exception instanceof SyntaxError) {
      interface SpanPosition {
        file: {
          content: string;
        };
        offset: number;
        line: number;
        col: number;
      }
      // means the email's HTML was invalid and prettier threw this error
      // TODO: always throw when the HTML is invalid during `render`
      const cause = exception.cause as {
        msg: string;
        span: {
          start: SpanPosition;
          end: SpanPosition;
        };
      };

      const sourceFileAttributeMatches = cause.span.start.file.content.matchAll(
        /data-source-file="(?<file>[^"]*)"/g,
      );
      let closestSourceFileAttribute: RegExpExecArray | undefined;
      for (const sourceFileAttributeMatch of sourceFileAttributeMatches) {
        if (closestSourceFileAttribute === undefined) {
          closestSourceFileAttribute = sourceFileAttributeMatch;
        }
        if (
          Math.abs(sourceFileAttributeMatch.index - cause.span.start.offset) <
          Math.abs(closestSourceFileAttribute.index - cause.span.start.offset)
        ) {
          closestSourceFileAttribute = sourceFileAttributeMatch;
        }
      }

      const findClosestAttributeValue = (
        attributeName: string,
      ): string | undefined => {
        const attributeMatches = cause.span.start.file.content.matchAll(
          new RegExp(`${attributeName}="(?<value>[^"]*)"`, 'g'),
        );
        let closestAttribute: RegExpExecArray | undefined;
        for (const attributeMatch of attributeMatches) {
          if (closestAttribute === undefined) {
            closestAttribute = attributeMatch;
          }
          if (
            Math.abs(attributeMatch.index - cause.span.start.offset) <
            Math.abs(closestAttribute.index - cause.span.start.offset)
          ) {
            closestAttribute = attributeMatch;
          }
        }
        return closestAttribute?.groups?.value;
      };

      let stack = convertStackWithSourceMap(
        error.stack,
        emailPath,
        sourceMapToOriginalFile,
      );

      const sourceFile = findClosestAttributeValue('data-source-file');
      const sourceLine = findClosestAttributeValue('data-source-line');
      if (sourceFile && sourceLine) {
        stack = ` at ${sourceFile}:${sourceLine}\n${stack}`;
      }

      return {
        error: {
          name: exception.name,
          message: cause.msg,
          stack,
          cause: error.cause ? JSON.parse(JSON.stringify(cause)) : undefined,
        },
      };
    }

    return {
      error: {
        name: error.name,
        message: error.message,
        stack: convertStackWithSourceMap(
          error.stack,
          emailPath,
          sourceMapToOriginalFile,
        ),
        cause: error.cause
          ? JSON.parse(JSON.stringify(error.cause))
          : undefined,
      },
    };
  }
};
