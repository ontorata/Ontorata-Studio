import { useEffect, useRef } from 'react';
import type { OutputChannelId } from '../../config/output-channels';
import type { OutputLine } from '../../hooks/useOutputChannels';

interface WorkspaceOutputPanelProps {
  channelId: OutputChannelId;
  lines: OutputLine[];
  scrollLock: boolean;
  wordWrap: boolean;
}

export function WorkspaceOutputPanel({
  channelId,
  lines,
  scrollLock,
  wordWrap,
}: WorkspaceOutputPanelProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollLock) return;
    bottomRef.current?.scrollIntoView({ behavior: 'auto' });
  }, [lines, channelId, scrollLock]);

  return (
    <div
      className={`ws-output-body ws-terminal-body ws-terminal-panel${wordWrap ? ' ws-output-wrap' : ' ws-output-nowrap'}`}
      role="tabpanel"
      aria-label="Output"
      data-output-channel={channelId}
    >
      {lines.length === 0 ? (
        <div className="ws-terminal-empty">The selected output channel has no messages yet.</div>
      ) : (
        <pre className="ws-output-log" aria-live="polite">
          {lines.map((line) => (
            <div key={line.id} className="ws-output-line">
              {line.text}
            </div>
          ))}
        </pre>
      )}
      <div ref={bottomRef} />
    </div>
  );
}
