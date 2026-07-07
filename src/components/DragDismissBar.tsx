import type { HTMLAttributes } from 'react';

interface DragDismissBarProps extends HTMLAttributes<HTMLDivElement> {
  hint?: string;
}

/** Android-style pill — drag vertically to dismiss parent panel. */
export function DragDismissBar({ hint = 'Drag to close', className = '', ...props }: DragDismissBarProps) {
  return (
    <div className={`drag-dismiss-bar ${className}`.trim()} {...props}>
      <span className="drag-dismiss-pill" />
      <span className="drag-dismiss-hint">{hint}</span>
    </div>
  );
}
