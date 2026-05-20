'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { flushSync } from 'react-dom';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { Toaster } from 'sonner';
import { useDebouncedCallback } from 'use-debounce';
import { Topbar } from '../../../components';
import { CodeContainer } from '../../../components/code-container';
import { MissingFixtureBanner } from '../../../components/missing-fixture-banner';
import {
  makeIframeDocumentBubbleEvents,
  ResizableWrapper,
} from '../../../components/resizable-wrapper';
import { Send } from '../../../components/send';
import { useToolbarState } from '../../../components/toolbar';
import { Tooltip } from '../../../components/tooltip';
import { EmulatedDarkModeToggle } from '../../../components/topbar/emulated-dark-mode-toggle';
import { ViewSizeControls } from '../../../components/topbar/view-size-controls';
import { usePreviewContext } from '../../../contexts/preview';
import { useClampedState } from '../../../hooks/use-clamped-state';
import { cn } from '../../../utils';
import { EmailFrame } from './email-frame';
import { ErrorOverlay } from './error-overlay';

interface PreviewProps extends React.ComponentProps<'div'> {
  emailTitle: string;
}

const Preview = ({ emailTitle, className, ...props }: PreviewProps) => {
  const { renderingResult, renderedEmailMetadata, emailPath } =
    usePreviewContext();
  const fixtureMissing =
    renderedEmailMetadata?.fixture && !renderedEmailMetadata.fixture.found;

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const isDarkModeEnabled = searchParams.get('dark') !== null;
  const activeLang = searchParams.get('lang') ?? 'tsx';

  const handleDarkModeChange = (enabled: boolean) => {
    const params = new URLSearchParams(searchParams);
    if (enabled) {
      params.set('dark', '');
    } else {
      params.delete('dark');
    }
    router.push(`${pathname}?${params.toString()}${location.hash}`);
  };

  const handleLangChange = (lang: string) => {
    const params = new URLSearchParams(searchParams);
    params.set('lang', lang);
    const isSameLang = searchParams.get('lang') === lang;
    // Drop legacy ?view (UI v2 always shows Source + Preview side-by-side;
    // see ADR-0004). Migration is one-shot via URL rewrite on first nav.
    params.delete('view');
    router.push(
      `${pathname}?${params.toString()}${isSameLang ? location.hash : ''}`,
    );
  };

  const hasRenderingMetadata = typeof renderedEmailMetadata !== 'undefined';
  const hasErrors = 'error' in renderingResult;

  const [maxWidth, setMaxWidth] = useState(Number.POSITIVE_INFINITY);
  const [maxHeight, setMaxHeight] = useState(Number.POSITIVE_INFINITY);
  const minWidth = 220;
  const minHeight = minWidth * 1.6;
  const storedWidth = searchParams.get('width');
  const storedHeight = searchParams.get('height');
  const [width, setWidth] = useClampedState(
    storedWidth ? Number.parseInt(storedWidth, 10) : 1024,
    minWidth,
    maxWidth,
  );
  const [height, setHeight] = useClampedState(
    storedHeight ? Number.parseInt(storedHeight, 10) : 600,
    minHeight,
    maxHeight,
  );

  const handleSaveViewSize = useDebouncedCallback(() => {
    const params = new URLSearchParams(searchParams);
    params.set('width', width.toString());
    params.set('height', height.toString());
    router.push(`${pathname}?${params.toString()}${location.hash}`);
  }, 300);

  const { toggled: toolbarToggled } = useToolbarState();

  // Multi-pane layout (ADR-0004 / UI-1): Source(React) + Preview side-by-side,
  // both always visible. The previous ?view=preview|source toggle is gone;
  // the chip strip in UI-2 will replace `?lang` with `?source=` for selecting
  // which Source variants are open. For UI-1, the Source pane shows whichever
  // single lang the existing CodeContainer is on.

  return (
    <>
      <Topbar emailTitle={emailTitle}>
        <EmulatedDarkModeToggle
          enabled={isDarkModeEnabled}
          onChange={(enabled) => handleDarkModeChange(enabled)}
        />
        <ViewSizeControls
          setViewHeight={(height) => {
            setHeight(height);
            flushSync(() => {
              handleSaveViewSize();
            });
          }}
          setViewWidth={(width) => {
            setWidth(width);
            flushSync(() => {
              handleSaveViewSize();
            });
          }}
          viewHeight={height}
          viewWidth={width}
          minWidth={minWidth}
          minHeight={minHeight}
        />
        {hasRenderingMetadata ? (
          <div className="flex justify-end">
            <Send markup={renderedEmailMetadata.markup} />
          </div>
        ) : null}
      </Topbar>

      <div
        {...props}
        className={cn(
          'h-[calc(100%-3.5rem-2.375rem)] will-change-[height] flex transition-[height] duration-300 relative',
          toolbarToggled && 'h-[calc(100%-3.5rem-13rem)]',
          className,
        )}
      >
        {hasErrors ? <ErrorOverlay error={renderingResult.error} /> : null}

        {hasRenderingMetadata ? (
          <PanelGroup
            direction="horizontal"
            autoSaveId="reb-source-preview-split"
            className="w-full h-full"
          >
            <Panel id="source" defaultSize={50} minSize={20} order={1}>
              <div className="h-full w-full p-4">
                <div className="h-full flex">
                  <Tooltip.Provider>
                    <CodeContainer
                      activeLang={activeLang}
                      basename={renderedEmailMetadata.basename}
                      markups={[
                        {
                          language: 'tsx',
                          extension: renderedEmailMetadata.extname,
                          content: renderedEmailMetadata.reactMarkup,
                        },
                        {
                          language: 'html',
                          content: renderedEmailMetadata.prettyMarkup,
                        },
                        {
                          language: 'markdown',
                          extension: 'md',
                          content: renderedEmailMetadata.plainText,
                        },
                        {
                          language: 'json',
                          content: renderedEmailMetadata.fixture?.found
                            ? JSON.stringify(
                                renderedEmailMetadata.fixture.data,
                                null,
                                2,
                              )
                            : `// No fixture found at:\n//   ${renderedEmailMetadata.fixture?.path ?? '(unknown)'}\n//\n// Create the file with sample data to enable the preview.\n// The file must share the basename of the template, e.g.\n//   ${renderedEmailMetadata.basename}.tsx + ${renderedEmailMetadata.basename}.json`,
                        },
                      ]}
                      setActiveLang={handleLangChange}
                    />
                  </Tooltip.Provider>
                </div>
              </div>
            </Panel>

            <PanelResizeHandle className="group relative w-1.5 bg-slate-6 hover:bg-slate-8 transition-colors data-[resize-handle-state=drag]:bg-cyan-9">
              <div className="absolute inset-y-0 -left-1 -right-1" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-8 w-0.5 rounded-full bg-slate-8 opacity-0 group-hover:opacity-100 group-data-[resize-handle-state=drag]:opacity-100 transition-opacity" />
            </PanelResizeHandle>

            <Panel id="preview" defaultSize={50} minSize={20} order={2}>
              <div
                className={cn(
                  'h-full w-full p-4 relative',
                  'bg-gray-200',
                  isDarkModeEnabled && 'bg-gray-400',
                )}
                ref={(element) => {
                  if (!element) return;
                  const observer = new ResizeObserver((entry) => {
                    const [elementEntry] = entry;
                    if (elementEntry) {
                      setMaxWidth(elementEntry.contentRect.width);
                      setMaxHeight(elementEntry.contentRect.height);
                    }
                  });
                  observer.observe(element);
                  return () => observer.disconnect();
                }}
              >
                {fixtureMissing ? (
                  <div className="absolute top-4 left-4 right-4 z-20 pointer-events-none flex justify-center">
                    <div className="max-w-[800px] w-full pointer-events-auto">
                      <MissingFixtureBanner
                        emailPath={emailPath}
                        fixturePath={renderedEmailMetadata.fixture!.path}
                      />
                    </div>
                  </div>
                ) : null}

                <ResizableWrapper
                  minHeight={minHeight}
                  minWidth={minWidth}
                  maxHeight={maxHeight}
                  maxWidth={maxWidth}
                  height={height}
                  onResizeEnd={() => {
                    handleSaveViewSize();
                  }}
                  onResize={(value, direction) => {
                    const isHorizontal =
                      direction === 'east' || direction === 'west';
                    if (isHorizontal) {
                      setWidth(Math.round(value));
                    } else {
                      setHeight(Math.round(value));
                    }
                  }}
                  width={width}
                >
                  <EmailFrame
                    className="max-h-full rounded-lg bg-white [color-scheme:auto]"
                    darkMode={isDarkModeEnabled}
                    markup={renderedEmailMetadata.markup}
                    width={width}
                    height={height}
                    title={emailTitle}
                    ref={(iframe) => {
                      if (!iframe) return;
                      return makeIframeDocumentBubbleEvents(iframe);
                    }}
                  />
                </ResizableWrapper>
              </div>
            </Panel>
          </PanelGroup>
        ) : null}

        <Toaster />
      </div>
    </>
  );
};

export default Preview;
