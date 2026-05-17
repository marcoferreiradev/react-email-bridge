import { useState } from 'react';
import { getEmailPathFromSlug } from '../actions/get-email-path-from-slug';
import {
  type EmailRenderingResult,
  renderEmailByPath,
} from '../actions/render-email-by-path';
import { isBuilding, isPreviewDevelopment } from '../app/env';
import { useEmails } from '../contexts/emails';
import { containsEmailTemplate } from '../utils/contains-email-template';
import { useHotreload } from './use-hot-reload';

export const useEmailRenderingResult = (
  emailPath: string,
  serverEmailRenderedResult: EmailRenderingResult,
) => {
  const [renderingResult, setRenderingResult] = useState(
    serverEmailRenderedResult,
  );

  const { emailsDirectoryMetadata } = useEmails();

  if (!isBuilding && !isPreviewDevelopment) {
    useHotreload(async (changes) => {
      for await (const change of changes) {
        const relativePathForChangedFile = change.filename;

        // react-email-bridge: .json fixtures live adjacent to the .tsx and
        // share the basename. If the changed file is a .json with the same
        // basename as the current template, trigger a re-render too.
        const isFixtureForCurrentEmail =
          relativePathForChangedFile.endsWith('.json') &&
          relativePathForChangedFile
            .replace(/\.json$/, '')
            .split(/[\\/]/)
            .at(-1) ===
            emailPath
              .replace(/\.(tsx|jsx|ts|js)$/, '')
              .split(/[\\/]/)
              .at(-1);

        const isTemplateInMetadata = containsEmailTemplate(
          relativePathForChangedFile,
          emailsDirectoryMetadata,
        );

        if (!isTemplateInMetadata && !isFixtureForCurrentEmail) {
          continue;
        }

        const pathForChangedEmail = isFixtureForCurrentEmail
          ? emailPath
          : await getEmailPathFromSlug(relativePathForChangedFile);
        if (!pathForChangedEmail) {
          continue;
        }

        const newRenderingResult = await renderEmailByPath(
          pathForChangedEmail,
          true
        );

        if (pathForChangedEmail === emailPath) {
          setRenderingResult(newRenderingResult);
        }
      }
    });
  }

  return renderingResult;
};
