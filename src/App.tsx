import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { supabase, supabaseMisconfigured } from './lib/supabase';
import { useAuthStore } from './stores/authStore';
import AuthGuard from './components/AuthGuard';
import Layout from './components/Layout';
import SignInPage from './pages/SignInPage';
import SignUpPage from './pages/SignUpPage';
import TimerPage from './pages/TimerPage';
import ProjectsPage from './pages/ProjectsPage';
import EntriesPage from './pages/EntriesPage';
import StatsPage from './pages/StatsPage';

export default function App() {
  const setSession = useAuthStore((s) => s.setSession);

  useEffect(() => {
    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      }
    );

    return () => subscription.unsubscribe();
  }, [setSession]);

  if (supabaseMisconfigured) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="max-w-md space-y-4 text-center">
          <h1 className="text-2xl font-bold text-red-600">Missing Configuration</h1>
          <p className="text-gray-600">
            Set <code className="bg-gray-100 px-1 rounded">VITE_SUPABASE_URL</code> and{' '}
            <code className="bg-gray-100 px-1 rounded">VITE_SUPABASE_ANON_KEY</code> environment
            variables, then redeploy.
          </p>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/signin" element={<SignInPage />} />
        <Route path="/signup" element={<SignUpPage />} />

        {/* Protected routes */}
        <Route element={<AuthGuard />}>
          <Route element={<Layout />}>
            <Route path="/" element={<TimerPage />} />
            <Route path="/entries" element={<EntriesPage />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/stats" element={<StatsPage />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
