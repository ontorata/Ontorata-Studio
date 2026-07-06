import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Group, Panel, Separator, usePanelRef } from 'react-resizable-panels';
import { useWorkspaceBasePath } from '../../hooks/useWorkspacePath';
import { WorkspaceTabsProvider, useWorkspaceTabs } from '../../hooks/useWorkspaceTabs';
import { WorkspaceActivityBar } from './WorkspaceActivityBar';
import { WorkspaceAiPanel } from './WorkspaceAiPanel';
import { WorkspaceEditor } from './WorkspaceEditor';
import { WorkspaceExplorer } from './WorkspaceExplorer';
import { WorkspaceKeyboardShortcuts } from './WorkspaceKeyboardShortcuts';
import { WorkspaceTerminal } from './WorkspaceTerminal';
import { WorkspaceToolbar } from './WorkspaceToolbar';

function RouteSync({ pathSuffix }: { pathSuffix: string }) {
  const { syncRoute } = useWorkspaceTabs();

  useEffect(() => {
    syncRoute(pathSuffix);
  }, [pathSuffix, syncRoute]);

  return null;
}

function CollapsiblePanel({
  show,
  id,
  className,
  defaultSize,
  minSize,
  maxSize,
  children,
}: {
  show: boolean;
  id: string;
  className?: string;
  defaultSize: number | string;
  minSize: number | string;
  maxSize: number | string;
  children: React.ReactNode;
}) {
  const panelRef = usePanelRef();

  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;

    if (!show) {
      panel.collapse();
      return;
    }

    panel.expand();
    requestAnimationFrame(() => {
      const size = panel.getSize();
      const current = size.asPercentage;
      const target = typeof defaultSize === 'number' ? defaultSize : 30;
      if (current < target * 0.5) {
        panel.resize(target);
      }
    });
  }, [show, panelRef, defaultSize]);

  return (
    <Panel
      id={id}
      panelRef={panelRef}
      defaultSize={defaultSize}
      minSize={minSize}
      maxSize={maxSize}
      collapsible
      collapsedSize={0}
      groupResizeBehavior="preserve-pixel-size"
      className={className}
    >
      <div className={`ws-panel-fill ${className ?? ''}`}>
        <div className="ws-panel-inner">{children}</div>
      </div>
    </Panel>
  );
}

function WorkspacePanels() {
  const location = useLocation();
  const base = useWorkspaceBasePath();
  const { showTerminal, showAiPanel, showSidebar } = useWorkspaceTabs();
  const terminalRef = usePanelRef();

  const pathSuffix = location.pathname.startsWith(`${base}/`)
    ? location.pathname.slice(base.length + 1)
    : '';

  useEffect(() => {
    const panel = terminalRef.current;
    if (!panel) return;
    if (showTerminal) panel.expand();
    else panel.collapse();
  }, [showTerminal, terminalRef]);

  return (
    <div className="ws-shell">
      <WorkspaceToolbar />
      <div className="ws-body">
        <WorkspaceActivityBar />
        <Group
          id="ws-vertical"
          orientation="vertical"
          className="ws-panel-root"
          defaultLayout={{ main: 72, terminal: 28 }}
        >
          <Panel id="main" minSize={40} className="ws-panel-main">
            <Group
              id="ws-horizontal"
              orientation="horizontal"
              className="ws-panel-row"
              defaultLayout={{ sidebar: 18, editor: 52, ai: 30 }}
            >
              <CollapsiblePanel
                show={showSidebar}
                id="sidebar"
                className="ws-panel-sidebar"
                defaultSize={18}
                minSize="200px"
                maxSize="360px"
              >
                <WorkspaceExplorer />
              </CollapsiblePanel>

              <Separator id="sep-sidebar" className="ws-resize-handle ws-resize-vertical" />

              <Panel id="editor" minSize="28%" className="ws-panel-editor">
                <div className="ws-panel-fill ws-panel-editor">
                  <div className="ws-panel-inner">
                    <WorkspaceEditor pathSuffix={pathSuffix} />
                  </div>
                </div>
              </Panel>

              <Separator id="sep-ai" className="ws-resize-handle ws-resize-vertical" />

              <CollapsiblePanel
                show={showAiPanel}
                id="ai"
                className="ws-panel-ai"
                defaultSize={30}
                minSize="280px"
                maxSize="480px"
              >
                <WorkspaceAiPanel />
              </CollapsiblePanel>
            </Group>
          </Panel>

          <Separator id="sep-terminal" className="ws-resize-handle ws-resize-horizontal" />

          <Panel
            id="terminal"
            panelRef={terminalRef}
            defaultSize={28}
            minSize="120px"
            maxSize="50%"
            collapsible
            collapsedSize={0}
            className="ws-panel-terminal"
          >
            <div className="ws-panel-fill ws-panel-terminal">
              <div className="ws-panel-inner">
                <WorkspaceTerminal />
              </div>
            </div>
          </Panel>
        </Group>
      </div>
    </div>
  );
}

function WorkspacePanelsWithSync() {
  const base = useWorkspaceBasePath();
  const location = useLocation();
  const pathSuffix = location.pathname.startsWith(`${base}/`)
    ? location.pathname.slice(base.length + 1)
    : '';

  return (
    <>
      <RouteSync pathSuffix={pathSuffix} />
      <WorkspacePanels />
    </>
  );
}

/** IDE-style workspace — resizable panels, AI right, terminal bottom. */
export function WorkspaceShell() {
  return (
    <WorkspaceTabsProvider>
      <WorkspaceKeyboardShortcuts />
      <WorkspacePanelsWithSync />
    </WorkspaceTabsProvider>
  );
}
