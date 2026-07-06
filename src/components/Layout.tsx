import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { StudioHeader } from './StudioHeader';
import { StudioSidebar } from './StudioSidebar';

/** Enterprise shell — persistent sidebar + header, comfortable long sessions. */
export function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className={`studio-shell${sidebarOpen ? ' sidebar-open' : ''}`}>
      <button
        type="button"
        className="studio-sidebar-scrim"
        aria-label="Close menu"
        onClick={() => setSidebarOpen(false)}
      />
      <StudioSidebar onNavigate={() => setSidebarOpen(false)} />
      <div className="studio-main">
        <StudioHeader onMenuToggle={() => setSidebarOpen((v) => !v)} />
        <div className="studio-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
