"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Trophy, Target, Zap, Coins, Sword } from "lucide-react";
import Image from "next/image";
import Button from "@/components/ui/Button";

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
        kills: string;
        kda: string;
        goldPct: string;
        dmgPct: string;
        dpm: string;
    };
}

const defaultStats = {
    kills: "12",
    kda: "7.2",
    goldPct: "39.3%",
    dmgPct: "43.2%",
    dpm: "859",
};

export default function PlayerStatsModal({ isOpen, onClose, player, stats = defaultStats }: PlayerStatsModalProps) {
    return (
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
                        className="relative w-full max-w-3xl bg-[#0A0A0A] overflow-hidden rounded-sm border border-white/5 shadow-2xl flex flex-col md:flex-row min-h-[400px]"
                    >
                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            className="absolute top-3 right-3 z-50 text-white/40 hover:text-white transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        {/* Left Section: Player Portrait & Name */}
                        <div className="relative flex-1 bg-zinc-900/50 flex flex-row min-h-[300px] md:min-h-0">
                            {/* Vertical Labels */}
                            <div className="w-16 md:w-24 flex flex-col justify-end p-4 md:p-8 border-r border-white/5">
                                <div className="rotate-[-90deg] origin-bottom-left whitespace-nowrap translate-y-[-5px]">
                                    <span className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-white block">
                                        {player.ign}
                                    </span>
                                    <span className="text-primary text-[10px] md:text-xs font-bold uppercase tracking-[0.3em] block mt-1">
                                        {player.name}
                                    </span>
                                </div>
                            </div>

                            {/* Portrait */}
                            <div className="relative flex-1 bg-gradient-to-b from-transparent to-black/40 overflow-hidden">
                                {player.image ? (
                                    <Image
                                        src={player.image}
                                        alt={player.ign}
                                        fill
                                        className="object-cover object-top filter brightness-90 contrast-110"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center opacity-10">
                                        <Sword className="w-32 h-32" />
                                    </div>
                                )}

                                {/* Team Watermark Logo (Center/Background) */}
                                {player.teamLogo && (
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4/5 h-4/5 opacity-10 pointer-events-none">
                                        <Image
                                            src={player.teamLogo}
                                            alt="Team Logo Watermark"
                                            fill
                                            className="object-contain grayscale contrast-200"
                                        />
                                    </div>
                                )}

                                {/* Sponsorships at bottom of photo */}
                                <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between opacity-40 scale-75 origin-left">
                                    <div className="flex gap-4 items-center grayscale">
                                        <span className="text-[10px] font-black uppercase border border-white/20 px-2 py-1">KIA</span>
                                        <span className="text-[10px] font-black uppercase border border-white/20 px-2 py-1">LOGITECH</span>
                                        <span className="text-[10px] font-black uppercase border border-white/20 px-2 py-1">RED BULL</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Section: Statistics */}
                        <div className="w-full md:w-[40%] bg-primary flex flex-col p-6 md:p-10 relative">
                            {/* Large Vertical Team Name Background Wrapper */}
                            <div className="absolute top-0 right-0 h-full w-16 overflow-hidden pointer-events-none opacity-10">
                                <span className="rotate-90 origin-top-left absolute top-0 left-0 whitespace-nowrap text-7xl font-black uppercase text-black">
                                    {player.teamName || "RIOTERS"}
                                </span>
                            </div>

                            <div className="relative z-10 space-y-4 md:space-y-6">
                                <div className="space-y-0.5">
                                    <div className="flex justify-between items-end border-b border-black/10 pb-1">
                                        <span className="text-black/60 font-black uppercase text-[10px] tracking-widest">Kills</span>
                                        <span className="text-black text-4xl md:text-5xl font-black italic leading-none">{stats.kills}</span>
                                    </div>
                                </div>

                                <div className="space-y-0.5">
                                    <div className="flex justify-between items-end border-b border-black/10 pb-1">
                                        <span className="text-black/60 font-black uppercase text-[10px] tracking-widest">K/D/A</span>
                                        <span className="text-black text-4xl md:text-5xl font-black italic leading-none">{stats.kda}</span>
                                    </div>
                                </div>

                                <div className="space-y-0.5">
                                    <div className="flex justify-between items-end border-b border-black/10 pb-1">
                                        <span className="text-black/60 font-black uppercase text-[10px] tracking-widest">Gold %</span>
                                        <span className="text-black text-2xl md:text-3xl font-black italic leading-none">{stats.goldPct}</span>
                                    </div>
                                </div>

                                <div className="space-y-0.5">
                                    <div className="flex justify-between items-end border-b border-black/10 pb-1">
                                        <span className="text-black/60 font-black uppercase text-[10px] tracking-widest">DMG %</span>
                                        <span className="text-black text-2xl md:text-3xl font-black italic leading-none">{stats.dmgPct}</span>
                                    </div>
                                </div>

                                <div className="space-y-0.5">
                                    <div className="flex justify-between items-end border-b border-black/10 pb-1">
                                        <span className="text-black/60 font-black uppercase text-[10px] tracking-widest">DPM</span>
                                        <span className="text-black text-2xl md:text-3xl font-black italic leading-none">{stats.dpm}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Tournament Label */}
                            <div className="mt-auto flex items-center gap-4">
                                <div className="w-12 h-12 bg-black flex items-center justify-center p-2 rounded-sm italic">
                                    <span className="text-primary font-black text-[8px] leading-tight text-center uppercase tracking-tighter">
                                        Rioters<br />League
                                    </span>
                                </div>
                                <div>
                                    <div className="text-[10px] font-black text-black/60 uppercase tracking-widest leading-none">Season 2024</div>
                                    <div className="text-sm font-black text-black uppercase tracking-tighter">Pro Championship</div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
