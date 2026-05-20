import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import Home from './pages/Home';
import ThemeToggle from './components/ThemeToggle';

// Lazy load non-critical pages for code splitting
const Anime = lazy(() => import('./pages/Anime'));
const Games = lazy(() => import('./pages/Games'));
const Code = lazy(() => import('./pages/Code'));
const AdminIndex = lazy(() => import('./pages/Admin/Index'));
const AdminAnime = lazy(() => import('./pages/Admin/Anime'));
const AdminGames = lazy(() => import('./pages/Admin/Games'));
const AdminGuestbook = lazy(() => import('./pages/Admin/Guestbook'));
const NotFound = lazy(() => import('./pages/NotFound'));

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center font-black uppercase italic text-4xl animate-pulse">
      Loading Module...
    </div>
  );
}

function App() {
  return (
    <HelmetProvider>
      <BrowserRouter>
        <div className="fixed top-4 right-4 z-[100]">
          <ThemeToggle />
        </div>
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/anime" element={<Anime />} />
            <Route path="/games" element={<Games />} />
            <Route path="/code" element={<Code />} />
            <Route path="/admin" element={<AdminIndex />} />
            <Route path="/admin/anime" element={<AdminAnime />} />
            <Route path="/admin/games" element={<AdminGames />} />
            <Route path="/admin/guestbook" element={<AdminGuestbook />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </HelmetProvider>
  );
}

export default App;
