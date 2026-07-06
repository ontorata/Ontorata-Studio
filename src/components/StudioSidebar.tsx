import { NavLink } from 'react-router-dom';
import { NAV_GROUPS } from '../config/navigation';
import { useCapabilities } from '../hooks/useCapabilities';
import { useWorkspaceBasePath } from '../hooks/useWorkspacePath';
import { NavIcon } from './NavIcon';

const linkClass = ({ isActive }: { isActive: boolean }) =>
  isActive ? 'studio-nav-link active' : 'studio-nav-link';

interface StudioSidebarProps {
  onNavigate?: () => void;
}

/** Grouped sidebar — calm enterprise navigation. */
export function StudioSidebar({ onNavigate }: StudioSidebarProps) {
  const base = useWorkspaceBasePath();
  const { capabilities } = useCapabilities();

  return (
    <aside className="studio-sidebar">
      <div className="studio-sidebar-brand">
        <span className="brand-mark">O</span>
        <div>
          <strong>Ontorata</strong>
          <small>Studio</small>
        </div>
      </div>

      <nav className="studio-nav" aria-label="Main">
        <NavLink to={base} end className={linkClass} onClick={onNavigate}>
          <NavIcon name="home" />
          <span>Home</span>
        </NavLink>

        {NAV_GROUPS.map((group) => {
          const items = group.items.filter((item) => {
            if (!item.capabilityFlag) return true;
            return capabilities[item.capabilityFlag] === true;
          });
          if (!items.length) return null;

          return (
            <div key={group.id} className="studio-nav-group">
              <span className="studio-nav-group-label">{group.label}</span>
              {items.map((item) => (
                <NavLink
                  key={item.id}
                  to={`${base}/${item.path}`}
                  className={linkClass}
                  onClick={onNavigate}
                >
                  <NavIcon name={item.icon} />
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
