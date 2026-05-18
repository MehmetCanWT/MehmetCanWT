import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Anime from './pages/Anime';
import Games from './pages/Games';
import AdminIndex from './pages/Admin/Index';
import AdminAnime from './pages/Admin/Anime';
import AdminGames from './pages/Admin/Games';
import ThemeToggle from './components/ThemeToggle';

function App() {
  return (
    <BrowserRouter>
      <div className="fixed top-4 right-4 z-[100]">
        <ThemeToggle />
      </div>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/anime" element={<Anime />} />
        <Route path="/games" element={<Games />} />
        <Route path="/admin" element={<AdminIndex />} />
        <Route path="/admin/anime" element={<AdminAnime />} />
        <Route path="/admin/games" element={<AdminGames />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
