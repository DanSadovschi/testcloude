import { NavLink, Outlet } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `px-3 py-2 rounded-md text-sm font-medium ${
    isActive ? 'bg-indigo-100 text-indigo-700' : 'text-gray-600 hover:text-gray-900'
  }`;

export default function Layout() {
  const { signOut, user } = useAuthStore();

  return (
    <div className="min-h-screen">
      <nav className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-5xl flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-1">
            <span className="text-lg font-bold text-indigo-600 mr-6">Trackly</span>
            <NavLink to="/" className={linkClass}>Timer</NavLink>
            <NavLink to="/entries" className={linkClass}>Entries</NavLink>
            <NavLink to="/projects" className={linkClass}>Projects</NavLink>
            <NavLink to="/stats" className={linkClass}>Stats</NavLink>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">{user?.email}</span>
            <button
              onClick={signOut}
              className="text-sm text-gray-500 hover:text-gray-700"
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
