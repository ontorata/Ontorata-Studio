import { useCallback, useRef, useState } from 'react';

export interface UseDragDismissOptions {
  onDismiss: () => void;
  /** Pixels dragged before dismiss fires (default 72). */
  threshold?: number;
  /** 1 = down/close, -1 = up (default 1). */
  direction?: 1 | -1;
}

export function useDragDismiss({
  onDismiss,
  threshold = 72,
  direction = 1,
}: UseDragDismissOptions) {
  const [offset, setOffset] = useState(0);
  const [dragging, setDragging] = useState(false);
  const startY = useRef(0);
  const active = useRef(false);

  const onPointerDown = useCallback((event: React.PointerEvent) => {
    active.current = true;
    startY.current = event.clientY;
    setDragging(true);
    (event.target as HTMLElement).setPointerCapture(event.pointerId);
  }, []);

  const onPointerMove = useCallback(
    (event: React.PointerEvent) => {
      if (!active.current) return;
      const delta = (event.clientY - startY.current) * direction;
      setOffset(Math.max(0, delta));
    },
    [direction],
  );

  const endDrag = useCallback(() => {
    if (!active.current) return;
    active.current = false;
    setDragging(false);
    if (offset >= threshold) {
      setOffset(0);
      onDismiss();
      return;
    }
    setOffset(0);
  }, [offset, onDismiss, threshold]);

  const onPointerUp = useCallback(() => endDrag(), [endDrag]);
  const onPointerCancel = useCallback(() => endDrag(), [endDrag]);

  const panelStyle: React.CSSProperties = {
    transform: offset > 0 ? `translateY(${offset * direction}px)` : undefined,
    opacity: offset > 0 ? Math.max(0.55, 1 - offset / (threshold * 2)) : undefined,
    transition: dragging ? 'none' : 'transform 0.28s ease, opacity 0.28s ease',
  };

  return {
    offset,
    dragging,
    panelStyle,
    handleProps: {
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onPointerCancel,
      role: 'button' as const,
      'aria-label': 'Drag to close',
    },
  };
}
