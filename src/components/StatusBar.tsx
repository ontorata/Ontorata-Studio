import { useEffect, useState } from 'react';
import { useConnection } from '../hooks/useConnection';

function formatClock(now: Date) {
  return now.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
}

function formatDate(now: Date) {
  return now.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
}

/** Android-style top status bar — time, date, connection. */
export function StatusBar() {
  const { hasActiveConnection } = useConnection();
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const tick = () => setNow(new Date());
    tick();
    const id = window.setInterval(tick, 10_000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <header className="status-bar glass-bar" role="banner">
      <div className="status-bar-left">
        <span className="status-clock">{formatClock(now)}</span>
        <span className="status-date">{formatDate(now)}</span>
      </div>
      <div className="status-bar-center">
        <span className="status-brand">Ontorata</span>
      </div>
      <div className="status-bar-right">
        <span className={`status-dot ${hasActiveConnection ? 'online' : 'offline'}`} title="Ratary" />
        <span className="status-label">Ratary</span>
      </div>
    </header>
  );
}
