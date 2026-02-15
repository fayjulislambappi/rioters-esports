"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Trophy, Sword, ChevronLeft } from "lucide-react";
import Image from "next/image";

interface PlayerStatsModalProps {
    isOpen: boolean;
    onClose: () => void;
    player: {
        name: string;
        ign: string;
        roles: string[];
        image?: string;
        teamLogo?: string;
        teamName?: string;
        game: string;
    };
    stats?: {
        kills?: number | string;
        kda?: number | string;
        goldPct?: number | string;
        dmgPct?: number | string;
        dpm?: number | string;

        // New OVR Stats
        dmg?: number | string;
        scr?: number | string;
        fks?: number | string;
        hs?: number | string;
        ast?: number | string;
        clu?: number | string;

        [key: string]: any;
    };
    overall?: number;
}

const defaultStats = {
    kills: "12",
    kda: "7.2",
    goldPct: "39.3%",
    dmgPct: "43.2%",
    dpm: "859",
};

import { createPortal } from "react-dom";
import { useState, useEffect } from "react";
import { getOVRColor, getGenreByGame, GENRE_CONFIG } from "@/lib/ovr-utils";

export default function PlayerStatsModal({ isOpen, onClose, player, stats, overall }: PlayerStatsModalProps) {
    const [mounted, setMounted] = useState(false);

    // Merge defaults
    const displayStats = { ...defaultStats, ...stats };

    // Formatting helpers
    const formatPct = (val: number | string) => typeof val === 'number' ? `${val}%` : val;
    const formatNum = (val: number | string) => typeof val === 'number' ? val.toString() : val;

    useEffect(() => {
        setMounted(true);
    }, []);

    const genreKey = getGenreByGame(player.game);
    const genre = GENRE_CONFIG[genreKey] || GENRE_CONFIG["FPS"];
    const labels = genre.labels;

    if (!mounted) return null;

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/95 backdrop-blur-sm"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative w-full max-w-4xl bg-[#0A0A0A] overflow-y-auto overflow-x-hidden max-h-[90vh] md:max-h-[85vh] rounded-sm border border-white/10 shadow-2xl flex flex-col md:flex-row md:overflow-hidden overscroll-y-contain touch-pan-y no-scrollbar"
                    >
                        {/* Legendaries Framing Accents */}
                        <div className="absolute inset-0 border-[4px] md:border-[8px] border-primary/10 pointer-events-none z-20" />
                        <div className="absolute top-0 right-0 w-24 h-24 bg-primary/20 bg-gradient-to-bl from-primary to-transparent z-30 clip-path-legendary-corner pointer-events-none" />

                        {/* Sticky Navigation Header (Mobile Only primarily, but useful on desktop too) */}
                        <div className="sticky top-0 left-0 right-0 z-[60] flex justify-between items-start p-4 bg-gradient-to-b from-black/80 to-transparent pointer-events-none md:absolute md:w-full">
                            <button
                                onClick={onClose}
                                className="pointer-events-auto text-white/60 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center gap-1 pr-4"
                            >
                                <ChevronLeft className="w-5 h-5" />
                                <span className="text-xs font-bold uppercase tracking-wider">Back</span>
                            </button>

                            <button
                                onClick={onClose}
                                className="pointer-events-auto text-white/40 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-full bg-black/20 backdrop-blur-md border border-white/10"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Left Section: Player Portrait & Name */}
                        <div className="relative flex-1 bg-zinc-900/50 flex flex-col md:flex-row min-h-[50vh] md:min-h-0">
                            {/* Vertical Labels */}
                            <div className="w-full md:w-32 flex flex-col justify-end p-8 md:p-12 border-b md:border-b-0 md:border-r border-white/5 relative z-10">
                                <div className="md:rotate-[-90deg] md:origin-bottom-left md:whitespace-nowrap md:translate-y-[-10px]">
                                    <span className="text-4xl md:text-8xl font-black uppercase tracking-tighter text-white block drop-shadow-2xl">
                                        {player.ign}
                                    </span>
                                    <span className="text-primary text-[10px] md:text-sm font-bold uppercase tracking-[0.4em] block mt-2">
                                        {player.name}
                                    </span>
                                    <div className="flex flex-wrap gap-2 mt-4">
                                        {player.roles.map((r, i) => (
                                            <span key={i} className="text-[10px] font-black uppercase bg-primary/20 text-primary px-3 py-1 skew-x-[-10deg] border border-primary/30">
                                                {r}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Portrait Area */}
                            <div className="relative flex-1 bg-gradient-to-b from-transparent to-black/60 overflow-hidden">
                                {player.image ? (
                                    <Image
                                        src={player.image}
                                        alt={player.ign}
                                        fill
                                        sizes="(max-width: 768px) 100vw, 50vw"
                                        className="object-cover object-center translate-x-[5%] md:translate-x-[15%] brightness-110"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center opacity-10">
                                        <Sword className="w-48 h-48" />
                                    </div>
                                )}

                                {/* Floating Skill Score in Modal */}
                                <div className="absolute top-8 left-0 z-40 bg-primary px-4 py-2">
                                    <span className={`text-4xl font-black italic ${overall ? getOVRColor(overall) : 'text-white'} leading-none`}>
                                        {overall || "104"}
                                    </span>
                                </div>

                                {/* Team Watermark Logo (Center/Background) */}
                                {player.teamLogo && (
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4/5 h-4/5 opacity-5 pointer-events-none">
                                        <Image
                                            src={player.teamLogo}
                                            alt="Team Logo Watermark"
                                            fill
                                            className="object-contain grayscale contrast-200"
                                        />
                                    </div>
                                )}

                                {/* Sponsorships at bottom of photo */}
                                <div className="absolute bottom-6 left-8 right-8 flex items-center justify-between opacity-30 scale-75 md:scale-90 origin-left">
                                    <div className="flex gap-4 md:gap-6 items-center grayscale">
                                        <span className="text-[10px] md:text-xs font-black uppercase border border-white/20 px-2 md:px-3 py-1">KIA</span>
                                        <span className="text-[10px] md:text-xs font-black uppercase border border-white/20 px-2 md:px-3 py-1">LOGITECH</span>
                                        <span className="text-[10px] md:text-xs font-black uppercase border border-white/20 px-2 md:px-3 py-1">RED BULL</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Section: Statistics */}
                        <div className="w-full md:w-[42%] bg-primary flex flex-col p-6 md:p-14 relative overflow-visible md:overflow-hidden">
                            {/* Large Vertical Team Name Background Wrapper */}
                            <div className="absolute top-0 right-0 h-full w-24 overflow-hidden pointer-events-none opacity-10">
                                <span className="rotate-90 origin-top-left absolute top-0 left-0 whitespace-nowrap text-9xl font-black uppercase text-black">
                                    {player.teamName || "RIOTERS"}
                                </span>
                            </div>

                            <div className="relative z-10 space-y-6 md:space-y-8">
                                <div className="space-y-1">
                                    <div className="flex justify-between items-end border-b-2 border-black/10 pb-2">
                                        <span className="text-black/60 font-black uppercase text-[10px] md:text-xs tracking-[0.2em]">{labels.dmg}</span>
                                        <span className="text-black text-4xl md:text-7xl font-black italic leading-none drop-shadow-sm">{formatNum(displayStats.dmg || 0)}</span>
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <div className="flex justify-between items-end border-b-2 border-black/10 pb-2">
                                        <span className="text-black/60 font-black uppercase text-[10px] md:text-xs tracking-[0.2em]">{labels.scr}</span>
                                        <span className="text-black text-4xl md:text-7xl font-black italic leading-none drop-shadow-sm">{formatNum(displayStats.scr || 0)}</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-6 md:gap-8">
                                    <div className="space-y-1">
                                        <div className="flex justify-between items-end border-b border-black/10 pb-2">
                                            <span className="text-black/60 font-black uppercase text-[10px] tracking-widest">{labels.fks}</span>
                                            <span className="text-black text-3xl md:text-4xl font-black italic leading-none">{formatPct(displayStats.fks || 0)}</span>
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <div className="flex justify-between items-end border-b border-black/10 pb-2">
                                            <span className="text-black/60 font-black uppercase text-[10px] tracking-widest">{labels.hs}</span>
                                            <span className="text-black text-3xl md:text-4xl font-black italic leading-none">{formatPct(displayStats.hs || 0)}</span>
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <div className="flex justify-between items-end border-b border-black/10 pb-2">
                                            <span className="text-black/60 font-black uppercase text-[10px] tracking-widest">{labels.ast}</span>
                                            <span className="text-black text-3xl md:text-4xl font-black italic leading-none">{formatNum(displayStats.ast || 0)}</span>
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <div className="flex justify-between items-end border-b border-black/10 pb-2">
                                            <span className="text-black/60 font-black uppercase text-[10px] tracking-widest">{labels.clu}</span>
                                            <span className="text-black text-3xl md:text-4xl font-black italic leading-none">{formatNum(displayStats.clu || 0)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Tournament Label */}
                            <div className="mt-auto pt-12 flex items-center gap-5">
                                <div className="w-16 h-16 bg-black flex items-center justify-center p-3 rounded-sm italic shadow-xl">
                                    <span className="text-primary font-black text-[10px] leading-tight text-center uppercase tracking-tighter">
                                        Rioters<br />League
                                    </span>
                                </div>
                                <div className="space-y-1">
                                    <div className="text-[10px] font-black text-black/50 uppercase tracking-[0.3em] leading-none">World Series 2024</div>
                                    <div className="text-lg font-black text-black uppercase tracking-tighter leading-none italic">Legendaries Invite</div>
                                </div>
                            </div>

                            {/* Decorative Background Icon */}
                            <Trophy className="absolute -bottom-10 -right-10 w-48 h-48 text-black/5 rotate-12" />
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>,
        document.body
    );
}
