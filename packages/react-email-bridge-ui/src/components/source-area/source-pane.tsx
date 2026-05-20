'use client';

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import { copyTextToClipboard } from '../../utils';
import { Code } from '../code';
import { IconButton } from '../icons/icon-button';
import { IconCheck } from '../icons/icon-check';
import { IconClipboard } from '../icons/icon-clipboard';
import { IconDownload } from '../icons/icon-download';
import { Tooltip } from '../tooltip';
import {
  SOURCE_EXTENSIONS,
  SOURCE_LABELS,
  SOURCE_PRISM_LANGUAGES,
  type SourceKind,
} from './types';

interface SourcePaneProps {
  kind: SourceKind;
  basename: string;
  content: string;
  onClose?: () => void;
}

export function SourcePane({ kind, basename, content, onClose }: SourcePaneProps) {
  const filename = `${basename}.${SOURCE_EXTENSIONS[kind]}`;

  return (
    <div
      className="relative w-full h-full rounded-md border border-slate-6 text-sm overflow-hidden flex flex-col"
      style={{
        lineHeight: '130%',
        background:
          'linear-gradient(145.37deg, rgba(255, 255, 255, 0.09) -8.75%, rgba(255, 255, 255, 0.027) 83.95%)',
        boxShadow: 'rgb(0 0 0 / 10%) 0px 5px 30px -5px',
      }}
    >
      <div className="h-9 border-b border-slate-6 shrink-0 flex items-center px-3 gap-2">
        <span className="text-xs font-medium text-slate-12">
          {SOURCE_LABELS[kind]}
        </span>
        <span className="text-xs text-slate-9 truncate">{filename}</span>
        <div className="ml-auto flex items-center gap-1">
          <CopyButton content={content} />
          <DownloadButton content={content} filename={filename} />
          {onClose ? (
            <Tooltip>
              <Tooltip.Trigger asChild>
                <IconButton onClick={onClose} aria-label="Close pane">
                  <span className="leading-none text-[14px]">×</span>
                </IconButton>
              </Tooltip.Trigger>
              <Tooltip.Content>Close pane</Tooltip.Content>
            </Tooltip>
          ) : null}
        </div>
      </div>
      <div className="flex-1 overflow-hidden">
        <Code language={SOURCE_PRISM_LANGUAGES[kind]}>{content}</Code>
      </div>
    </div>
  );
}

function CopyButton({ content }: { content: string }) {
  const [isCopied, setIsCopied] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    setIsCopied(false);
    clearTimeout(timeoutRef.current);
  }, [content]);

  return (
    <Tooltip>
      <Tooltip.Trigger asChild>
        <IconButton
          onClick={async () => {
            setIsCopied(true);
            await copyTextToClipboard(content);
            timeoutRef.current = setTimeout(() => setIsCopied(false), 3000);
          }}
          aria-label="Copy to clipboard"
        >
          {isCopied ? <IconCheck /> : <IconClipboard />}
        </IconButton>
      </Tooltip.Trigger>
      <Tooltip.Content>Copy to clipboard</Tooltip.Content>
    </Tooltip>
  );
}

function DownloadButton({ content, filename }: { content: string; filename: string }) {
  const generatedUrl = useMemo(() => {
    const file = new File([content], filename);
    return URL.createObjectURL(file);
  }, [content, filename]);

  const url = useSyncExternalStore(
    () => () => {},
    () => generatedUrl,
    () => undefined,
  );

  return (
    <Tooltip>
      <Tooltip.Trigger asChild>
        <a
          className="text-slate-11 transition-colors hover:text-slate-12 inline-flex w-7 h-7 items-center justify-center"
          download={filename}
          href={url}
          aria-label="Download"
        >
          <IconDownload />
        </a>
      </Tooltip.Trigger>
      <Tooltip.Content>Download</Tooltip.Content>
    </Tooltip>
  );
}
