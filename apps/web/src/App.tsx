import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import Home from './pages/Home';
import Anime from './pages/Anime';
import Games from './pages/Games';
import Code from './pages/Code';
import AdminIndex from './pages/Admin/Index';
import AdminAnime from './pages/Admin/Anime';
import AdminGames from './pages/Admin/Games';
import AdminGuestbook from './pages/Admin/Guestbook';
import ThemeToggle from './components/ThemeToggle';

function App() {
  return (
    <HelmetProvider>
      <BrowserRouter>
        <div className="fixed top-4 right-4 z-[100]">
          <ThemeToggle />
        </div>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/anime" element={<Anime />} />
          <Route path="/games" element={<Games />} />
          <Route path="/code" element={<Code />} />
          <Route path="/admin" element={<AdminIndex />} />
          <Route path="/admin/anime" element={<AdminAnime />} />
          <Route path="/admin/games" element={<AdminGames />} />
          <Route path="/admin/guestbook" element={<AdminGuestbook />} />
        </Routes>
      </BrowserRouter>
    </HelmetProvider>
  );
}

export default App;
