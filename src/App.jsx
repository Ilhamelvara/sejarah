import React, { useEffect } from 'react';
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Toast from './components/Toast';

import Home from './pages/Home';
import Materi from './pages/Materi';
import Museum from './pages/Museum';
import Quiz from './pages/Quiz';
import Leaderboard from './pages/Leaderboard';
import About from './pages/About';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function AppLayout() {
  return (
    <AppProvider>
      <div className="flex flex-col min-h-screen bg-primary text-app-text font-sans antialiased selection:bg-gold/30 selection:text-gold">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/materi" element={<Materi />} />
            <Route path="/museum" element={<Museum />} />
            <Route path="/quiz" element={<Quiz />} />
            <Route path="/peringkat" element={<Leaderboard />} />
            <Route path="/about" element={<About />} />
          </Routes>
        </main>
        <Footer />
        <Toast />
      </div>
    </AppProvider>
  );
}

export default function App() {
  return (
    <HashRouter>
      <ScrollToTop />
      <AuthProvider>
        <AppLayout />
      </AuthProvider>
    </HashRouter>
  );
}
