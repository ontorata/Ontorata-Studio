import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useWorkspaceBasePath } from '../../hooks/useWorkspacePath';
import { WorkspaceTabsProvider, useWorkspaceTabs } from '../../hooks/useWorkspaceTabs';
import { WorkspaceKeyboardShortcuts } from './WorkspaceKeyboardShortcuts';
import { WorkspaceActivityBar } from './WorkspaceActivityBar';
import { WorkspaceAiPanel } from './WorkspaceAiPanel';
import { WorkspaceEditor } from './WorkspaceEditor';
import { WorkspaceExplorer } from './WorkspaceExplorer';
import { WorkspaceTerminal } from './WorkspaceTerminal';
import { WorkspaceToolbar } from './WorkspaceToolbar';
import { Group, Panel, Separator } from 'react-resizable-panels';

function RouteSync({ pathSuffix }: { pathSuffix: string }) {
  const { syncRoute } = useWorkspaceTabs();

  useEffect(() => {
    syncRoute(pathSuffix);
  }, [pathSuffix, syncRoute]);

  return null;
}

function WorkspacePanels() {
  const base = useWorkspaceBasePath();
  const location = useLocation();
  const { showTerminal, showAiPanel, showSidebar } = useWorkspaceTabs();

  const pathSuffix = location.pathname.startsWith(`${base}/`)
    ? location.pathname.slice(base.length + 1)
    : '';

  return (
    <div className="ws-shell">
      <WorkspaceToolbar />
      <div className="ws-body">
        <WorkspaceActivityBar />
        <Group orientation="vertical" className="ws-panel-root">
          <Panel defaultSize={showTerminal ? 72 : 100} minSize={35}>
            <Group orientation="horizontal" className="ws-panel-row">
              {showSidebar && (
                <>
                  <Panel defaultSize={18} minSize={12} maxSize={35} className="ws-panel-sidebar">
                    <WorkspaceExplorer />
                  </Panel>
                  <Separator className="ws-resize-handle ws-resize-vertical" />
                </>
              )}
              <Panel minSize={30} className="ws-panel-editor">
                <WorkspaceEditor pathSuffix={pathSuffix} />
              </Panel>
              {showAiPanel && (
                <>
                  <Separator className="ws-resize-handle ws-resize-vertical" />
                  <Panel defaultSize={26} minSize={18} maxSize={45} className="ws-panel-ai">
                    <WorkspaceAiPanel />
                  </Panel>
                </>
              )}
            </Group>
          </Panel>
          {showTerminal && (
            <>
              <Separator className="ws-resize-handle ws-resize-horizontal" />
              <Panel defaultSize={28} minSize={12} maxSize={55} className="ws-panel-terminal">
                <WorkspaceTerminal />
              </Panel>
            </>
          )}
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
