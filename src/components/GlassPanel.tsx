import type { CSSProperties, ReactNode } from 'react';
import { DragDismissBar } from './DragDismissBar';
import { useDragDismiss } from '../hooks/useDragDismiss';

interface GlassPanelProps {
  children: ReactNode;
  className?: string;
  onDismiss?: () => void;
  dismissHint?: string;
  style?: CSSProperties;
}

/** Frosted glass container with optional drag-to-dismiss handle. */
export function GlassPanel({
  children,
  className = '',
  onDismiss,
  dismissHint,
  style,
}: GlassPanelProps) {
  const drag = useDragDismiss({
    onDismiss: onDismiss ?? (() => undefined),
    threshold: 72,
  });

  const mergedStyle = onDismiss ? { ...style, ...drag.panelStyle } : style;

  return (
    <div className={`glass-panel ${className}`.trim()} style={mergedStyle}>
      {onDismiss && (
        <DragDismissBar
          {...drag.handleProps}
          hint={dismissHint}
          className={drag.dragging ? 'is-dragging' : undefined}
        />
      )}
      {children}
    </div>
  );
}
