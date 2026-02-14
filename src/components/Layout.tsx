import { NavLink, Outlet } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import ThemeToggle from './ThemeToggle';

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `px-3 py-2 rounded-md text-sm font-medium ${
    isActive
      ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300'
      : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100'
  }`;

export default function Layout() {
  const { signOut, user } = useAuthStore();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <nav className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="mx-auto max-w-5xl flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-1">
            <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400 mr-6">Trackly</span>
            <NavLink to="/" className={linkClass}>Timer</NavLink>
            <NavLink to="/entries" className={linkClass}>Entries</NavLink>
            <NavLink to="/projects" className={linkClass}>Projects</NavLink>
            <NavLink to="/tags" className={linkClass}>Tags</NavLink>
            <NavLink to="/stats" className={linkClass}>Stats</NavLink>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <span className="text-sm text-gray-500 dark:text-gray-400">{user?.email}</span>
            <button
              onClick={signOut}
              className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              Sign out
            </button>
          </div>
        </div>
      </nav>
      <main className="mx-auto max-w-5xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
