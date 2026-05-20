'use client';

import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { Tooltip } from '../tooltip';
import { ChipStrip } from './chip-strip';
import { SourcePane } from './source-pane';
import { SOURCE_LABELS, type SourceKind } from './types';

export interface SourceContent {
  reactMarkup: string;
  prettyMarkup: string;
  plainText: string;
  fixture:
    | {
        found: true;
        data: unknown;
      }
    | {
        found: false;
        path: string;
      }
    | undefined;
  basename: string;
}

interface SourceAreaProps {
  active: SourceKind[];
  onToggle: (kind: SourceKind) => void;
  content: SourceContent;
}

function dataPaneContent(fixture: SourceContent['fixture'], basename: string): string {
  if (fixture?.found) {
    return JSON.stringify(fixture.data, null, 2);
  }
  return `// No fixture found at:\n//   ${fixture?.found === false ? fixture.path : '(unknown)'}\n//\n// Create the file with sample data to enable the preview.\n// The file must share the basename of the template, e.g.\n//   ${basename}.tsx + ${basename}.json`;
}

function paneContentFor(kind: SourceKind, c: SourceContent): string {
  switch (kind) {
    case 'react':
      return c.reactMarkup;
    case 'html':
      return c.prettyMarkup;
    case 'plain':
      return c.plainText;
    case 'data':
      return dataPaneContent(c.fixture, c.basename);
  }
}

export function SourceArea({ active, onToggle, content }: SourceAreaProps) {
  return (
    <div className="h-full w-full flex flex-col">
      <ChipStrip active={active} onToggle={onToggle} />

      {active.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="flex-1 p-3 overflow-hidden">
          <Tooltip.Provider>
            <PanelGroup
              direction="horizontal"
              autoSaveId={`reb-source-panes-${active.join('-')}`}
              className="w-full h-full"
            >
              {active.map((kind, i) => {
                const minSize = Math.min(15, 100 / active.length);
                return [
                  i > 0 ? (
                    <PanelResizeHandle
                      key={`handle-${kind}`}
                      className="group relative w-1 mx-0.5 bg-slate-6 hover:bg-slate-8 transition-colors data-[resize-handle-state=drag]:bg-cyan-9 rounded-full"
                    >
                      <div className="absolute inset-y-0 -left-1 -right-1" />
                    </PanelResizeHandle>
                  ) : null,
                  <Panel
                    key={`pane-${kind}`}
                    id={kind}
                    order={i + 1}
                    minSize={minSize}
                    defaultSize={100 / active.length}
                  >
                    <SourcePane
                      kind={kind}
                      basename={content.basename}
                      content={paneContentFor(kind, content)}
                      onClose={active.length > 1 ? () => onToggle(kind) : undefined}
                    />
                  </Panel>,
                ].filter(Boolean);
              })}
            </PanelGroup>
          </Tooltip.Provider>
        </div>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex-1 flex items-center justify-center p-6">
      <div className="text-center text-slate-10 text-sm max-w-xs">
        <p className="mb-2 text-slate-11 font-medium">No source panes open</p>
        <p>
          Click a chip above to open one of {SOURCE_LABELS.react}, {SOURCE_LABELS.html},{' '}
          {SOURCE_LABELS.plain}, or {SOURCE_LABELS.data} alongside the preview.
        </p>
      </div>
    </div>
  );
}
