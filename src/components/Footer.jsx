import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Landmark,
  Home,
  BookOpen,
  HelpCircle,
  Trophy,
  Info,
  Mail,
  FileText,
  ShieldCheck,
  Bug,
  Heart
} from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-primary-light border-t border-gold/15 py-12 mt-16 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-8 border-b border-white/5">
          {/* Brand */}
          <div className="flex flex-col gap-3">
            <NavLink to="/" className="flex items-center gap-2 text-gold font-display font-bold text-lg">
              <Landmark className="w-5 h-5 text-gold" />
              <span>SEJARAH.ID</span>
            </NavLink>
            <p className="text-text-muted leading-relaxed max-w-sm">
              Platform edukasi sejarah Indonesia berbasis teknologi 3D interaktif.
              Belajar sejarah jadi lebih seru, visual, dan mudah dipahami.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="font-display font-semibold text-gold tracking-wider uppercase text-xs mb-4">
              Navigasi Utama
            </h4>
            <ul className="flex flex-col gap-2.5 text-text-muted">
              <li>
                <NavLink to="/" className="hover:text-gold transition-colors flex items-center gap-2">
                  <Home className="w-4 h-4 text-gold" />
                  <span>Beranda</span>
                </NavLink>
              </li>
              <li>
                <NavLink to="/materi" className="hover:text-gold transition-colors flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-gold" />
                  <span>Materi Sejarah</span>
                </NavLink>
              </li>
              <li>
                <NavLink to="/museum" className="hover:text-gold transition-colors flex items-center gap-2">
                  <Landmark className="w-4 h-4 text-gold" />
                  <span>Museum 3D</span>
                </NavLink>
              </li>
              <li>
                <NavLink to="/quiz" className="hover:text-gold transition-colors flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-gold" />
                  <span>Kuis Interaktif</span>
                </NavLink>
              </li>
              <li>
                <NavLink to="/peringkat" className="hover:text-gold transition-colors flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-gold" />
                  <span>Peringkat Pejuang</span>
                </NavLink>
              </li>
              <li>
                <NavLink to="/about" className="hover:text-gold transition-colors flex items-center gap-2">
                  <Info className="w-4 h-4 text-gold" />
                  <span>Tentang Kami</span>
                </NavLink>
              </li>
            </ul>
          </div>

          {/* Info */}
          <div>
            <h4 className="font-display font-semibold text-gold tracking-wider uppercase text-xs mb-4">
              Informasi & Dukungan
            </h4>
            <ul className="flex flex-col gap-2.5 text-text-muted">
              <li>
                <span className="hover:text-gold cursor-pointer transition-colors flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gold" />
                  <span>Kontak Kami</span>
                </span>
              </li>
              <li>
                <span className="hover:text-gold cursor-pointer transition-colors flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-gold" />
                  <span>Kebijakan Privasi</span>
                </span>
              </li>
              <li>
                <span className="hover:text-gold cursor-pointer transition-colors flex items-center gap-2">
                  <FileText className="w-4 h-4 text-gold" />
                  <span>Syarat & Ketentuan</span>
                </span>
              </li>
              <li>
                <span className="hover:text-gold cursor-pointer transition-colors flex items-center gap-2">
                  <Bug className="w-4 h-4 text-gold" />
                  <span>Laporkan Bug</span>
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-text-dim">
          <p className="flex items-center gap-1.5">
            <span>© 2026 SEJARAH.ID — Dibuat untuk Pelajar Indonesia</span>
            <Heart className="w-3.5 h-3.5 text-danger inline fill-danger" />
          </p>
          <p>Teknologi: React · Tailwind CSS · Three.js · Supabase</p>
        </div>
      </div>
    </footer>
  );
}
