'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
    Cpu, 
    ChevronRight, 
    ArrowRight,
    Search,
    Clock,
    Layers,
    Database,
    Wrench,
    Network,
    Terminal,
    Zap,
    HelpCircle,
    ExternalLink,
    PlayCircle
} from 'lucide-react';
import Image from 'next/image';
import { useRouter } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { LanguageSwitcher } from '@/components/language-switcher';

const LandingHub = () => {
    const router = useRouter();
    const t = useTranslations('home');

    // Integration items are now handled directly in the JSX for better readability with i18n keys

    return (
        <div id="landing-hub-root" className="min-h-screen bg-background text-foreground selection:bg-primary/30 overflow-x-hidden relative scroll-smooth industrial-grid">
            <div className="scanline-overlay fixed inset-0 pointer-events-none" aria-hidden="true" />
            
            {/* Ambient Background Lights */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden mix-blend-screen" aria-hidden="true">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px]" />
            </div>

            {/* Navigation */}
            <nav className="relative z-50 border-b border-white/5 bg-black/40 backdrop-blur-xl">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-3"
                    >
                        <Image 
                            src="/logos/aluplan-logo-white.svg" 
                            alt="Aluplan Logo" 
                            width={160} 
                            height={40} 
                            className="h-9 w-auto hover:opacity-80 transition-opacity cursor-pointer"
                            onClick={() => router.push('/')}
                        />
                    </motion.div>

                    <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-6"
                    >
                        <LanguageSwitcher />
                        <button 
                            id="nav-login-btn"
                            onClick={() => router.push('/login')}
                            className="text-sm font-bold tracking-widest text-white/50 hover:text-white transition-colors uppercase"
                        >
                            {t('cta_login')}
                        </button>
                    </motion.div>
                </div>
            </nav>

            <main className="relative z-10 max-w-7xl mx-auto px-6 pt-24 pb-32">
                {/* 1. Hero Section */}
                <section id="hero-section" className="mb-40">
                    <div className="text-center space-y-8">
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 border border-primary/30 text-primary text-[10px] font-black tracking-[0.3em] uppercase mb-4 wireframe-corner wireframe-corner-tl wireframe-corner-br"
                        >
                            <Cpu className="w-3.5 h-3.5" aria-hidden="true" />
                            {t('hero.badge')}
                        </motion.div>

                        <motion.h1 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-5xl md:text-8xl font-black tracking-tighter leading-[0.85] uppercase"
                        >
                            {t('hero.title').split(' ').map((word, i) => (
                                <span key={i} className={i === 0 ? "text-primary" : "text-white"}>
                                    {word}{' '}
                                </span>
                            ))}
                        </motion.h1>

                        <motion.p 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="max-w-2xl mx-auto text-lg text-white/40 leading-relaxed font-medium"
                        >
                            {t('hero.subtitle')}
                        </motion.p>
                        
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.25 }}
                            className="flex justify-center flex-wrap gap-4 pt-4"
                        >
                             <button 
                                id="hero-login-btn"
                                onClick={() => router.push('/login')}
                                aria-label={t('hero.cta_primary')}
                                className="px-8 py-4 bg-primary text-black font-black text-sm tracking-widest uppercase flex items-center gap-2 hover:bg-primary/90 transition-all wireframe-corner wireframe-corner-tr wireframe-corner-bl"
                            >
                                {t('hero.cta_primary')}
                                <ArrowRight className="w-4 h-4" id="hero-login-icon" aria-hidden="true" />
                            </button>
                             <button 
                                id="hero-trial-btn"
                                onClick={() => window.open('https://www.allplan.com/tr/deneme-surumu/', '_blank')}
                                className="px-8 py-4 border border-white/10 bg-white/5 text-white/60 font-black text-sm tracking-widest uppercase hover:bg-white/10 hover:text-white transition-all wireframe-corner wireframe-corner-tl wireframe-corner-br"
                            >
                                {t('hero.cta_secondary')}
                            </button>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className="mt-12 flex justify-center"
                        >
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 text-[9px] tracking-[0.4em] uppercase text-white/40 wireframe-corner wireframe-corner-tr wireframe-corner-bl" aria-hidden="true">
                                <span className="w-1 h-1 bg-primary animate-pulse" />
                                {t('hero.ai_badge')}
                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* 2. Getting Started & Training Section */}
                <section id="training-section" className="mb-40 space-y-12 relative">
                    <div className="absolute inset-0 bg-primary/2 h-full w-full pointer-events-none -mx-6 md:-mx-20" />
                    <div className="flex items-center gap-4">
                        <div className="h-px flex-1 bg-white/10" />
                        <h2 className="text-sm font-black tracking-[0.4em] text-white/40 uppercase">{t('training.title')}</h2>
                        <div className="h-px flex-1 bg-white/10" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Training Card 1: Hello Allplan */}
                         <motion.div
                            id="training-card-youtube"
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="p-8 bg-black/40 border border-white/5 hover:bg-black/60 transition-all group relative overflow-hidden"
                        >
                            <div className="absolute top-0 left-0 w-1 h-full bg-primary/20 group-hover:bg-primary transition-all" />
                            <div className="flex justify-between items-start mb-6">
                                <PlayCircle className="w-12 h-12 text-primary/40 group-hover:text-primary transition-colors" aria-hidden="true" />
                                <span className="text-[10px] font-black tracking-widest text-primary/60">YOUTUBE_DEMO</span>
                            </div>
                            <h3 className="text-xl font-black tracking-tight text-white mb-4 uppercase">{t('training.card1_title')}</h3>
                            <p className="text-white/40 text-sm leading-relaxed mb-8">{t('training.card1_desc')}</p>
                            <button 
                                onClick={() => window.open('https://www.youtube.com/@AllplanTurkey', '_blank')}
                                aria-label={`${t('training.card1_title')} - ${t('training.card1_cta')}`}
                                className="px-6 py-3 bg-white/5 border border-white/10 text-white text-xs font-black tracking-widest uppercase hover:bg-primary hover:text-black transition-all flex items-center gap-2"
                            >
                                {t('training.card1_cta')}
                                <ChevronRight className="w-4 h-4" aria-hidden="true" />
                            </button>
                        </motion.div>

                        {/* Training Card 2: Student Licenses */}
                         <motion.div
                            id="training-card-campus"
                            initial={{ opacity: 0, x: 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="p-8 bg-black/40 border border-white/5 hover:bg-black/60 transition-all group relative overflow-hidden"
                        >
                            <div className="absolute top-0 left-0 w-1 h-full bg-blue-500/20 group-hover:bg-blue-500 transition-all" />
                            <div className="flex justify-between items-start mb-6">
                                <ExternalLink className="w-12 h-12 text-blue-500/40 group-hover:text-blue-500 transition-colors" aria-hidden="true" />
                                <span className="text-[10px] font-black tracking-widest text-blue-500/60">ACADEMIC_LICENSE</span>
                            </div>
                            <h3 className="text-xl font-black tracking-tight text-white mb-4 uppercase">{t('training.card2_title')}</h3>
                            <p className="text-white/40 text-sm leading-relaxed mb-8">{t('training.card2_desc')}</p>
                            <button 
                                onClick={() => window.open('https://campus.allplan.com/index.html', '_blank')}
                                aria-label={`${t('training.card2_title')} - ${t('training.card2_cta')}`}
                                className="px-6 py-3 bg-white/5 border border-white/10 text-white text-xs font-black tracking-widest uppercase hover:bg-blue-500 hover:text-white transition-all flex items-center gap-2"
                            >
                                {t('training.card2_cta')}
                                <ChevronRight className="w-4 h-4" aria-hidden="true" />
                            </button>
                        </motion.div>
                    </div>
                </section>

                {/* 3. Highlighted FAQs (Public Troubleshooting) */}
                <section id="faq-section" className="mb-40">
                    <div className="max-w-4xl mx-auto space-y-12">
                        <div className="text-center space-y-4">
                            <HelpCircle className="w-8 h-8 text-primary mx-auto opacity-50" />
                            <h2 className="text-3xl font-black tracking-tighter uppercase">{t('faq.title')}</h2>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {[1, 2, 3].map((i) => (
                                 <motion.div
                                    key={i}
                                    id={`faq-item-${i}`}
                                    initial={{ opacity: 0, y: 10 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.1 }}
                                    className="p-6 bg-black/40 border border-white/5 hover:border-primary/20 transition-all group cursor-pointer"
                                >
                                    <div className="mb-4 text-primary opacity-40 group-hover:opacity-100 transition-opacity">
                                        {i === 1 && <Zap className="w-6 h-6" aria-hidden="true" />}
                                        {i === 2 && <Layers className="w-6 h-6" aria-hidden="true" />}
                                        {i === 3 && <Cpu className="w-6 h-6" aria-hidden="true" />}
                                    </div>
                                    <h4 className="font-bold text-white mb-3 uppercase text-sm group-hover:text-primary transition-colors">
                                        {t(`faq.item${i}_title`)}
                                    </h4>
                                    <p className="text-white/40 text-xs leading-relaxed">
                                        {t(`faq.item${i}_desc`)}
                                    </p>
                                    <div className="mt-4 flex items-center gap-2 text-[10px] font-black text-primary/60 group-hover:text-primary tracking-widest uppercase opacity-0 group-hover:opacity-100 transition-all">
                                        REHBERİ_GÖRÜNTÜLE <ArrowRight className="w-3 h-3" aria-hidden="true" />
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* 4. Local Integrations & Add-ons */}
                <section id="integrations-section">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.98 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="bg-primary/5 border border-primary/20 p-12 wireframe-corner wireframe-corner-tl wireframe-corner-br relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[80px] pointer-events-none" />
                        <div className="relative z-10 flex flex-col md:flex-row items-center gap-12">
                            <div className="md:w-1/3 text-center md:text-left space-y-4">
                                <h2 className="text-xs font-black tracking-[0.4em] text-primary uppercase">{t('integrations.title')}</h2>
                                <p className="text-white/40 text-sm leading-relaxed font-medium">
                                    Türkiye pazarı için özel olarak geliştirilmiş Allplan eklentileri ve yerel hakediş entegrasyonları.
                                </p>
                            </div>
                            
                            <div className="md:w-2/3 grid grid-cols-1 md:grid-cols-2 gap-6">
                                 <div 
                                    id="integration-oska" 
                                    onClick={() => window.open(t('integrations.oska_link'), '_blank')}
                                    className="p-6 bg-black/40 border border-white/5 group hover:border-primary/30 transition-all cursor-pointer relative overflow-hidden"
                                >
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 blur-2xl group-hover:bg-primary/10 transition-all pointer-events-none" />
                                    <div className="w-10 h-10 bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-4 group-hover:bg-primary group-hover:text-black transition-all">
                                        <Database className="w-5 h-5" id="integration-oska-icon" aria-hidden="true" />
                                    </div>
                                    <h4 className="font-black text-white text-sm tracking-widest uppercase mb-2 group-hover:text-primary transition-colors flex items-center gap-2">
                                        {t('integrations.oska_title')}
                                        <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-all" aria-hidden="true" />
                                    </h4>
                                    <p className="text-white/30 text-xs leading-relaxed group-hover:text-white/50 transition-colors">
                                        {t('integrations.oska_desc')}
                                    </p>
                                </div>
                                 <div 
                                    id="integration-plugins" 
                                    onClick={() => window.open(t('integrations.imar_link'), '_blank')}
                                    className="p-6 bg-black/40 border border-white/5 group hover:border-primary/30 transition-all cursor-pointer relative overflow-hidden"
                                >
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 blur-2xl group-hover:bg-primary/10 transition-all pointer-events-none" />
                                    <div className="w-10 h-10 bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-4 group-hover:bg-primary group-hover:text-black transition-all">
                                        <Wrench className="w-5 h-5" id="integration-plugins-icon" aria-hidden="true" />
                                    </div>
                                    <h4 className="font-black text-white text-sm tracking-widest uppercase mb-2 group-hover:text-primary transition-colors flex items-center gap-2">
                                        {t('integrations.plugins_title')}
                                        <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-all" aria-hidden="true" />
                                    </h4>
                                    <p className="text-white/30 text-xs leading-relaxed group-hover:text-white/50 transition-colors">
                                        {t('integrations.plugins_desc')}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </section>
            </main>

            {/* 5. Platform Stats */}
            <section id="stats-section" className="mb-40">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[1, 2, 3].map((i) => (
                             <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="p-10 bg-gradient-to-br from-white/5 to-transparent border border-white/5 wireframe-corner wireframe-corner-tl wireframe-corner-br"
                            >
                                <div className="text-4xl font-black tracking-tighter text-primary mb-2">
                                    {i === 1 && t('stats.users')}
                                    {i === 2 && t('stats.projects')}
                                    {i === 3 && t('stats.support')}
                                </div>
                                <div className="text-[10px] font-black tracking-[0.3em] text-white/40 uppercase">
                                    {i === 1 && t('stats.users_label')}
                                    {i === 2 && t('stats.projects_label')}
                                    {i === 3 && t('stats.support_label')}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 6. Social Proof / Trusted By */}
            <section id="social-proof-section" className="mb-40 overflow-hidden">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-12">
                        <div className="space-y-4 md:w-1/2">
                            <h2 className="text-2xl font-black tracking-tighter uppercase leading-tight">
                                {t('social_proof.title')}
                            </h2>
                            <p className="text-white/40 text-sm font-medium leading-relaxed">
                                {t('social_proof.subtitle')}
                            </p>
                        </div>
                        <div className="md:w-1/2 grid grid-cols-3 gap-8 opacity-20 grayscale transition-all hover:opacity-100 hover:grayscale-0">
                            {/* Symbols instead of real logos for now */}
                            {[1, 2, 3, 4, 5, 6].map((i) => (
                                <div key={i} className="flex items-center justify-center p-4 border border-white/5">
                                    <Cpu className="w-8 h-8" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="relative z-10 border-t border-white/5 bg-black/60 shadow-2xl py-12">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="flex items-center gap-3 opacity-30 grayscale hover:grayscale-0 transition-all cursor-pointer group">
                        <Cpu className="w-5 h-5 group-hover:text-primary transition-colors" aria-hidden="true" />
                        <span className="font-black text-[10px] tracking-widest uppercase">ALUPLAN SUPPORT</span>
                    </div>
                    <p className="text-[10px] text-white/20 font-black tracking-widest uppercase">
                        {t('footer_copy')}
                    </p>
                    <div className="flex items-center gap-8 text-[9px] text-white/30 font-black tracking-[0.2em] uppercase">
                        <span className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                            {t('footer_status')}
                        </span>
                        <span className="flex items-center gap-2">
                            <Zap className="w-3 h-3" aria-hidden="true" />
                            {t('footer_encryption')}
                        </span>
                    </div>
                </div>
            </footer>

            <style jsx global>{`
                .industrial-grid {
                    background-image: 
                        linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px);
                    background-size: 40px 40px;
                }
                .scanline-overlay {
                    background: linear-gradient(
                        to bottom,
                        transparent,
                        rgba(0, 0, 0, 0.05) 50%,
                        transparent
                    );
                    background-size: 100% 4px;
                }
                .wireframe-corner {
                    position: relative;
                }
                .wireframe-corner::before,
                .wireframe-corner::after {
                    content: '';
                    position: absolute;
                    width: 4px;
                    height: 4px;
                    background: currentColor;
                    opacity: 0.3;
                }
                .wireframe-corner-tl::before { top: -1px; left: -1px; }
                .wireframe-corner-tr::before { top: -1px; right: -1px; }
                .wireframe-corner-bl::after { bottom: -1px; left: -1px; }
                .wireframe-corner-br::after { bottom: -1px; right: -1px; }
            `}</style>
        </div>
    );
};

export default LandingHub;
