'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Monitor, Cpu, HardDrive, Smartphone, Globe, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Section {
    name: string;
    items: string[];
}

interface Requirement {
    title: string;
    sections: Section[];
}

interface RequirementAccordionProps {
    locale: string;
}

const RequirementAccordion: React.FC<RequirementAccordionProps> = ({ locale }) => {
    const [requirements, setRequirements] = useState<Requirement[]>([]);
    const [expandedIndex, setExpandedIndex] = useState<number | null>(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRequirements = async () => {
            try {
                const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
                const res = await fetch(`${baseUrl}/auth/system-requirements?locale=${locale}`);
                const data = await res.json();
                setRequirements(data);
            } catch (error) {
                console.error('Failed to fetch system requirements:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchRequirements();
    }, [locale]);

    const getIcon = (title: string) => {
        const t = title.toLowerCase();
        if (t.includes('allplan')) return <Monitor className="w-5 h-5" />;
        if (t.includes('frilo') || t.includes('scia')) return <Cpu className="w-5 h-5" />;
        if (t.includes('virtual') || t.includes('sanal')) return <ShieldCheck className="w-5 h-5" />;
        if (t.includes('servis') || t.includes('service') || t.includes('exchange')) return <Globe className="w-5 h-5" />;
        return <Smartphone className="w-5 h-5" />;
    };

    if (loading) {
        return (
            <div className="space-y-4 animate-pulse">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="h-12 bg-white/5 rounded-lg border border-white/10" />
                ))}
            </div>
        );
    }

    if (requirements.length === 0) return null;

    return (
        <div data-testid="requirement-accordion" className="space-y-3 w-full max-w-2xl mx-auto lg:mx-0">
            {requirements.map((req, idx) => (
                <div
                    key={idx}
                    className={cn(
                        "group overflow-hidden rounded-xl border transition-all duration-300",
                        expandedIndex === idx
                            ? "bg-white/10 border-white/20 shadow-[0_0_20px_rgba(255,255,255,0.05)]"
                            : "bg-white/5 border-white/10 hover:bg-white/8 hover:border-white/15"
                    )}
                >
                    <button
                        onClick={() => setExpandedIndex(expandedIndex === idx ? null : idx)}
                        className="w-full flex items-center justify-between p-4 text-left"
                    >
                        <div className="flex items-center gap-3">
                            <div className={cn(
                                "p-2 rounded-lg transition-colors",
                                expandedIndex === idx ? "bg-white/20 text-white" : "bg-white/5 text-gray-400 group-hover:text-white"
                            )}>
                                {getIcon(req.title)}
                            </div>
                            <span className={cn(
                                "font-semibold text-lg tracking-tight transition-colors",
                                expandedIndex === idx ? "text-white" : "text-gray-300 group-hover:text-white"
                            )}>
                                {req.title}
                            </span>
                        </div>
                        <ChevronDown className={cn(
                            "w-5 h-5 text-gray-500 transition-transform duration-300",
                            expandedIndex === idx && "rotate-180 text-white"
                        )} />
                    </button>

                    <AnimatePresence initial={false}>
                        {expandedIndex === idx && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.3, ease: "easeInOut" }}
                            >
                                <div className="px-4 pb-5 pt-1 space-y-4 border-t border-white/5 bg-white/[0.02]">
                                    {req.sections.map((section, sIdx) => (
                                        <div key={sIdx} className="space-y-2">
                                            <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                                <span className="w-1 h-3 bg-white/30 rounded-full" />
                                                {section.name}
                                            </h4>
                                            <ul className="grid grid-cols-1 gap-2">
                                                {section.items.map((item, iIdx) => {
                                                    // Simple markdown parsing for **bold**
                                                    const parts = item.split(/(\*\*.*?\*\*)/g);
                                                    return (
                                                        <li key={iIdx} className="text-sm text-gray-300 leading-relaxed flex gap-2">
                                                            <span className="text-white/40 mt-1">•</span>
                                                            <span>
                                                                {parts.map((part, pIdx) => (
                                                                    part.startsWith('**') && part.endsWith('**')
                                                                        ? <strong key={pIdx} className="text-white font-semibold">{part.slice(2, -2)}</strong>
                                                                        : part
                                                                ))}
                                                            </span>
                                                        </li>
                                                    );
                                                })}
                                            </ul>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            ))}
        </div>
    );
};

export default RequirementAccordion;
