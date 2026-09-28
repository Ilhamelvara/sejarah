import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Landmark,
  Target,
  Rocket,
  Lightbulb,
  Cpu,
  Palette,
  Globe,
  Zap,
  Compass,
  FileCode,
  Database,
  HardDrive,
  BookOpen,
  HelpCircle,
  Info,
  FileText,
  Sparkles,
  Check
} from 'lucide-react';
import SectionHeader from '../components/ui/SectionHeader';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

export default function About() {
  const TECH_STACK = [
    { name: 'React 19', desc: 'UI Framework', icon: Cpu },
    { name: 'Tailwind v4', desc: 'Modern Styling Engine', icon: Palette },
    { name: 'Three.js', desc: '3D WebGL Rendering', icon: Globe },
    { name: 'Vite', desc: 'Next-Gen Build Tool', icon: Zap },
    { name: 'React Router', desc: 'Client-Side Navigation', icon: Compass },
    { name: 'HTML5 & CSS3', desc: 'Semantic Structure', icon: FileCode },
    { name: 'JSON Data', desc: 'Dynamic Content', icon: Database },
    { name: 'LocalStorage', desc: 'Local Preferences', icon: HardDrive },
  ];

  const REFERENCES = [
    'Museum Nasional Indonesia, Jakarta',
    'Kemdikbud RI — Kurikulum Sejarah Indonesia',
    'Balai Arkeologi Yogyakarta',
    'Museum Sonobudoyo, Yogyakarta',
    'Museum Trowulan, Mojokerto',
    'Arsip Nasional Republik Indonesia (ANRI)',
    'Museum Balaputra Dewa, Palembang',
    'UNESCO World Heritage List',
    'Museum Bahari, Jakarta',
  ];

  return (
    <div className="pt-24 pb-16 min-h-screen">

      {/* HERO ABOUT */}
      <section className="py-16 text-center">
        <div className="max-w-4xl mx-auto px-4">
          <div className="w-16 h-16 rounded-2xl bg-gold/15 border border-gold/30 flex items-center justify-center text-gold mx-auto mb-4">
            <Landmark className="w-8 h-8" />
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-widest text-gold bg-gold/10 border border-gold/20 uppercase mb-3">
            <Info className="w-3.5 h-3.5" />
            <span>Tentang Kami</span>
          </span>
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-app-text mb-4">
            SEJARAH.ID
          </h1>
          <p className="text-text-muted text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            Platform edukasi sejarah Indonesia berbasis teknologi 3D interaktif yang dirancang untuk membuat belajar sejarah menjadi pengalaman yang menarik, visual, dan tak terlupakan.
          </p>
        </div>
      </section>

      {/* VISI MISI NILAI */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            {/* Visi */}
            <Card className="p-8">
              <div className="w-12 h-12 rounded-xl bg-gold/15 border border-gold/30 flex items-center justify-center text-gold mb-4">
                <Target className="w-6 h-6" />
              </div>
              <h2 className="font-display font-bold text-gold text-lg tracking-wider uppercase mb-3">
                Visi
              </h2>
              <p className="text-text-muted text-sm leading-relaxed">
                Menjadi platform edukasi sejarah digital terdepan di Indonesia yang memberdayakan generasi muda untuk mengenal, memahami, dan mencintai sejarah bangsa melalui teknologi modern.
              </p>
            </Card>

            {/* Misi */}
            <Card className="p-8">
              <div className="w-12 h-12 rounded-xl bg-amber/15 border border-amber/30 flex items-center justify-center text-amber mb-4">
                <Rocket className="w-6 h-6" />
              </div>
              <h2 className="font-display font-bold text-gold text-lg tracking-wider uppercase mb-3">
                Misi
              </h2>
              <ul className="text-text-muted text-sm leading-relaxed space-y-2">
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-gold shrink-0" /><span>Menyajikan sejarah secara visual & interaktif</span></li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-gold shrink-0" /><span>Membuat belajar sejarah jadi menyenangkan</span></li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-gold shrink-0" /><span>Mendukung kurikulum Merdeka Belajar</span></li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-gold shrink-0" /><span>Mudah diakses tanpa biaya apapun</span></li>
              </ul>
            </Card>

            {/* Nilai */}
            <Card className="p-8">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-4">
                <Lightbulb className="w-6 h-6" />
              </div>
              <h2 className="font-display font-bold text-gold text-lg tracking-wider uppercase mb-3">
                Nilai
              </h2>
              <ul className="text-text-muted text-sm leading-relaxed space-y-2">
                <li className="flex items-center gap-2"><Sparkles className="w-4 h-4 text-gold shrink-0" /><span>Akurat & berdasarkan sumber terpercaya</span></li>
                <li className="flex items-center gap-2"><Sparkles className="w-4 h-4 text-gold shrink-0" /><span>Inovatif dalam penyajian konten</span></li>
                <li className="flex items-center gap-2"><Sparkles className="w-4 h-4 text-gold shrink-0" /><span>Inklusif untuk semua kalangan</span></li>
                <li className="flex items-center gap-2"><Sparkles className="w-4 h-4 text-gold shrink-0" /><span>Berkelanjutan & terus berkembang</span></li>
              </ul>
            </Card>

          </div>
        </div>
      </section>

      {/* TEKNOLOGI STACK */}
      <section className="py-16 bg-primary-light/50 border-y border-gold/15">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            label="Arsitektur"
            title="Dibangun dengan Teknologi Modern"
            subtitle="Kombinasi React, Tailwind CSS v4, dan Three.js untuk performa tinggi"
          />

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {TECH_STACK.map((item, i) => {
              const IconComp = item.icon;
              return (
                <Card key={i} className="text-center p-6 hover:border-gold/50 flex flex-col items-center">
                  <div className="w-12 h-12 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center text-gold mb-3">
                    <IconComp className="w-6 h-6" />
                  </div>
                  <h4 className="font-display font-bold text-gold text-sm mb-0.5">{item.name}</h4>
                  <p className="text-xs text-text-muted">{item.desc}</p>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* SUMBER DATA & REFERENSI */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4">
          <SectionHeader
            label="Referensi"
            title="Sumber Data & Informasi"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {REFERENCES.map((ref, idx) => (
              <div
                key={idx}
                className="glass-panel p-4 rounded-xl border border-gold/20 flex items-center gap-3 text-sm text-text-muted"
              >
                <FileText className="w-4 h-4 text-gold shrink-0" />
                <span>{ref}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12">
        <div className="max-w-5xl mx-auto px-4">
          <Card className="text-center p-10 sm:p-14 border border-gold/30">
            <h2 className="font-display text-3xl font-bold text-app-text mb-3">
              Mari Belajar Sejarah!
            </h2>
            <p className="text-text-muted text-sm sm:text-base max-w-md mx-auto mb-6">
              Mulai perjalananmu mengenal sejarah bangsa Indonesia sekarang
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <NavLink to="/materi">
                <Button variant="primary" className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  <span>Baca Materi</span>
                </Button>
              </NavLink>
              <NavLink to="/museum">
                <Button variant="outline" className="flex items-center gap-2">
                  <Landmark className="w-4 h-4" />
                  <span>Museum 3D</span>
                </Button>
              </NavLink>
              <NavLink to="/quiz">
                <Button variant="ghost" className="flex items-center gap-2">
                  <HelpCircle className="w-4 h-4" />
                  <span>Ikuti Kuis</span>
                </Button>
              </NavLink>
            </div>
          </Card>
        </div>
      </section>

    </div>
  );
}
