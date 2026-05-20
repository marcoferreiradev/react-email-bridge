'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { flushSync } from 'react-dom';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { Toaster } from 'sonner';
import { useDebouncedCallback } from 'use-debounce';
import type { CompatibilityCheckingResult } from '../../../actions/email-validation/check-compatibility';
import { Topbar } from '../../../components';
import { IconDock } from '../../../components/icons/icon-dock';
import { MissingFixtureBanner } from '../../../components/missing-fixture-banner';
import {
  makeIframeDocumentBubbleEvents,
  ResizableWrapper,
} from '../../../components/resizable-wrapper';
import { Send } from '../../../components/send';
import {
  SourceArea,
  type SourceKind,
  parseSourceParam,
  serializeSourceParam,
} from '../../../components/source-area';
import { Toolbar, useToolbarState } from '../../../components/toolbar';
import type { LintingRow } from '../../../components/toolbar/linter';
import type { SpamCheckingResult } from '../../../components/toolbar/spam-assassin';
import { EmulatedDarkModeToggle } from '../../../components/topbar/emulated-dark-mode-toggle';
import { ViewSizeControls } from '../../../components/topbar/view-size-controls';
import { usePreviewContext } from '../../../contexts/preview';
import { useClampedState } from '../../../hooks/use-clamped-state';
import { useInspectionDock } from '../../../hooks/use-inspection-dock';
import { useUrlMigration } from '../../../hooks/use-url-migration';
import { cn } from '../../../utils';
import { EmailFrame } from './email-frame';
import { ErrorOverlay } from './error-overlay';

interface PreviewProps extends React.ComponentProps<'div'> {
  emailTitle: string;
  serverLintingRows: LintingRow[] | undefined;
  serverSpamCheckingResult: SpamCheckingResult | undefined;
  serverCompatibilityResults: CompatibilityCheckingResult[] | undefined;
}

const Preview = ({
  emailTitle,
  className,
  serverLintingRows,
  serverSpamCheckingResult,
  serverCompatibilityResults,
  ...props
}: PreviewProps) => {
  const { renderingResult, renderedEmailMetadata, emailPath } =
    usePreviewContext();
  const fixtureMissing =
    renderedEmailMetadata?.fixture && !renderedEmailMetadata.fixture.found;

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const isDarkModeEnabled = searchParams.get('dark') !== null;
  const activeSources = parseSourceParam(searchParams.get('source'));

  const handleDarkModeChange = (enabled: boolean) => {
    const params = new URLSearchParams(searchParams);
    if (enabled) {
      params.set('dark', '');
    } else {
      params.delete('dark');
    }
    router.push(`${pathname}?${params.toString()}${location.hash}`);
  };

  const handleToggleSource = (kind: SourceKind) => {
    const next = activeSources.includes(kind)
      ? activeSources.filter((k) => k !== kind)
      : [...activeSources, kind];
    const params = new URLSearchParams(searchParams);
    params.set('source', serializeSourceParam(next));
    // Drop legacy ?view + ?lang (UI v2 uses ?source for the chip strip; see ADR-0004).
    params.delete('view');
    params.delete('lang');
    router.push(`${pathname}?${params.toString()}${location.hash}`);
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
  const [dockPosition, setDockPosition] = useInspectionDock();
  useUrlMigration();

  // Multi-pane layout (ADR-0004). Source Area (chip-driven panes) and Preview
  // live in a horizontal PanelGroup. The Inspection panel (Linter, Compatibility,
  // Spam, Resend) can dock to bottom (default, absolute-positioned overlay),
  // right, left, or be hidden — see useInspectionDock + InspectionDockMenu.

  const inspectionAtSide =
    dockPosition === 'right' || dockPosition === 'left';
  const inspectionPanel = (
    <Panel
      id={`inspection-${dockPosition}`}
      order={dockPosition === 'left' ? 0 : 3}
      defaultSize={25}
      minSize={15}
    >
      <div className="h-full w-full border-slate-6 border-x">
        <Toolbar
          serverLintingRows={serverLintingRows}
          serverSpamCheckingResult={serverSpamCheckingResult}
          serverCompatibilityResults={serverCompatibilityResults}
          dockPosition={dockPosition}
          onDockChange={setDockPosition}
        />
      </div>
    </Panel>
  );
  const inspectionResizeHandle = (
    <PanelResizeHandle
      key="handle-inspect"
      className="group relative w-1.5 bg-slate-6 hover:bg-slate-8 transition-colors data-[resize-handle-state=drag]:bg-cyan-9"
    >
      <div className="absolute inset-y-0 -left-1 -right-1" />
    </PanelResizeHandle>
  );

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
        {dockPosition === 'hidden' ? (
          <button
            type="button"
            onClick={() => setDockPosition('bottom')}
            className="flex items-center gap-1.5 px-2.5 h-7 rounded-md text-xs font-medium text-slate-11 hover:text-slate-12 hover:bg-slate-4 transition-colors outline-none"
          >
            <IconDock position="bottom" size={12} />
            Show inspection
          </button>
        ) : null}
        {hasRenderingMetadata ? (
          <div className="flex justify-end">
            <Send markup={renderedEmailMetadata.markup} />
          </div>
        ) : null}
      </Topbar>

      {/* Mobile fallback (M1, ADR-0004): below lg the multi-pane layout
          collapses to Preview-only with a hint about desktop. The
          authoring loop is desktop-first; mobile is read-only glance. */}
      {hasRenderingMetadata ? (
        <div
          className={cn(
            'lg:hidden flex flex-col items-center gap-3 p-4 overflow-auto',
            'h-[calc(100%-3.5rem)]',
            isDarkModeEnabled ? 'bg-gray-400' : 'bg-gray-200',
          )}
        >
          <div className="w-full max-w-[800px] px-3 py-2 rounded-md bg-slate-3 border border-slate-6 text-xs text-slate-11 text-center">
            Multi-pane authoring is desktop-only. Open this URL on a wider
            display to see Source, Preview and Inspection side-by-side.
          </div>
          <iframe
            srcDoc={renderedEmailMetadata.markup}
            title={emailTitle}
            className="w-full max-w-[600px] flex-1 min-h-[400px] rounded-lg bg-white"
          />
        </div>
      ) : null}

      <div
        {...props}
        className={cn(
          'hidden lg:flex',
          'will-change-[height] transition-[height] duration-300 relative',
          dockPosition === 'bottom'
            ? toolbarToggled
              ? 'h-[calc(100%-3.5rem-13rem)]'
              : 'h-[calc(100%-3.5rem-2.375rem)]'
            : 'h-[calc(100%-3.5rem)]',
          className,
        )}
      >
        {hasErrors ? <ErrorOverlay error={renderingResult.error} /> : null}

        {hasRenderingMetadata ? (
          <PanelGroup
            direction="horizontal"
            autoSaveId={`reb-main-split-${dockPosition}`}
            className="w-full h-full"
          >
            {dockPosition === 'left' ? inspectionPanel : null}
            {dockPosition === 'left' ? inspectionResizeHandle : null}

            <Panel id="source" defaultSize={50} minSize={20} order={1}>
              <SourceArea
                active={activeSources}
                onToggle={handleToggleSource}
                content={{
                  reactMarkup: renderedEmailMetadata.reactMarkup,
                  prettyMarkup: renderedEmailMetadata.prettyMarkup,
                  plainText: renderedEmailMetadata.plainText,
                  fixture: renderedEmailMetadata.fixture?.found
                    ? { found: true, data: renderedEmailMetadata.fixture.data }
                    : renderedEmailMetadata.fixture
                      ? { found: false, path: renderedEmailMetadata.fixture.path }
                      : undefined,
                  basename: renderedEmailMetadata.basename,
                }}
              />
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

            {dockPosition === 'right' ? inspectionResizeHandle : null}
            {dockPosition === 'right' ? inspectionPanel : null}
          </PanelGroup>
        ) : null}

        <Toaster />
      </div>

      {/* Toolbar is desktop-only — mobile fallback hides Inspection too. */}
      {dockPosition === 'bottom' ? (
        <div className="hidden lg:contents">
          <Toolbar
            serverLintingRows={serverLintingRows}
            serverSpamCheckingResult={serverSpamCheckingResult}
            serverCompatibilityResults={serverCompatibilityResults}
            dockPosition="bottom"
            onDockChange={setDockPosition}
          />
        </div>
      ) : null}
    </>
  );
};

export default Preview;
