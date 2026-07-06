import { Outlet } from 'react-router-dom';
import { AppChrome } from './AppChrome';
import { LauncherGrid } from './LauncherGrid';
import { StatusBar } from './StatusBar';
import { useIsLauncherHome } from '../hooks/useIsLauncherHome';

/** Android tablet shell — status bar + launcher grid or app window. */
export function Layout() {
  const isHome = useIsLauncherHome();

  return (
    <div className="android-shell wallpaper-bg">
      <StatusBar />
      {isHome ? (
        <LauncherGrid />
      ) : (
        <AppChrome>
          <Outlet />
        </AppChrome>
      )}
    </div>
  );
}
