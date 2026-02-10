"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { User, Shield, Crosshair, Trophy } from "lucide-react";
import PlayerStatsModal from "./PlayerStatsModal";

interface PlayerCardProps {
    ign: string;
    role: string | string[];
    rank: string;
    image?: string;
    game: string;
    name?: string;
    teamName?: string;
    teamLogo?: string;
    score?: string;
}

export default function PlayerCard({
    ign,
    role,
    rank,
    image,
    game,
    name = "Pro Player",
    teamName = "RIOTERS",
    teamLogo = "/logo.png",
    score = "100"
}: PlayerCardProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const rawRoles = Array.isArray(role) ? role : [role];
    const roles = rawRoles.filter(r => r !== "USER");

    return (
        <>
            <motion.div
                whileHover={{ y: -10, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setIsModalOpen(true)}
                className="relative cursor-pointer group"
            >
                {/* Main Card Container with Legendaries Framing */}
                <div className="relative w-full aspect-[2/3] bg-[#0A0A0A] rounded-sm overflow-hidden border border-white/10 group-hover:border-primary/50 transition-colors shadow-2xl">

                    {/* Metallic Gold/Primary Border Accent */}
                    <div className="absolute inset-0 border-[6px] border-primary/20 pointer-events-none z-20" />
                    <div className="absolute inset-0 border-t-[1px] border-l-[1px] border-white/20 pointer-events-none z-20" />

                    {/* Angled Corner Details */}
                    <div className="absolute top-0 right-0 w-12 h-12 bg-primary/20 bg-gradient-to-bl from-primary to-transparent z-30 clip-path-polygon-[100%_0,100%_100%,0_0]" />

                    {/* Skill Score Badge (Top Left) */}
                    <div className="absolute top-4 left-4 z-40">
                        <div className="relative">
                            <span className="text-3xl md:text-4xl font-black italic tracking-tighter text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                                {score}
                            </span>
                            <div className="absolute -bottom-1 left-0 w-full h-[2px] bg-primary" />
                        </div>
                    </div>

                    {/* Team/League Logo (Top Right) */}
                    <div className="absolute top-4 right-4 z-40 w-8 h-8 opacity-60 group-hover:opacity-100 transition-opacity">
                        <Image src={teamLogo} alt="Team" width={32} height={32} className="object-contain grayscale group-hover:grayscale-0 transition-all" />
                    </div>

                    {/* Portrait Backdrop/Glow */}
                    <div className="absolute inset-0 bg-gradient-to-t from-primary/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                    {/* Player Portrait */}
                    <div className="relative h-full w-full mt-8 overflow-hidden">
                        {image ? (
                            <Image
                                src={image}
                                alt={ign}
                                fill
                                className="object-cover object-top scale-110 group-hover:scale-125 transition-transform duration-700 filter brightness-90 group-hover:brightness-100"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center opacity-10">
                                <User className="w-32 h-32" />
                            </div>
                        )}
                    </div>

                    {/* Info Overlay (Bottom) */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 pt-20 bg-gradient-to-t from-black via-black/80 to-transparent z-40">
                        <div className="space-y-0.5">
                            <div className="text-[10px] font-black uppercase text-primary tracking-widest leading-none mb-1">
                                {game}
                            </div>
                            <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tighter text-white italic leading-tight group-hover:text-primary transition-colors">
                                {ign}
                            </h3>
                            <div className="flex items-center gap-2 mt-2">
                                {roles.map((r, i) => (
                                    <span key={i} className="text-[9px] font-black uppercase bg-white/10 px-2 py-0.5 rounded-sm text-white/60 group-hover:text-white transition-colors">
                                        {r.replace('_', ' ')}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Vertical "LEGENDARIES" Text Side Border */}
                    <div className="absolute top-1/2 right-2 -translate-y-1/2 rotate-90 origin-right opacity-20 pointer-events-none group-hover:opacity-40 transition-opacity">
                        <span className="text-[10px] font-black tracking-[0.5em] text-white uppercase whitespace-nowrap">
                            LEGENDARIES // {rank}
                        </span>
                    </div>
                </div>

                {/* Hover Glow Effect Layer */}
                <div className="absolute inset-0 -z-10 bg-primary/20 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 scale-90" />
            </motion.div>

            <PlayerStatsModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                player={{
                    name,
                    ign,
                    roles,
                    image,
                    teamLogo,
                    teamName,
                    game
                }}
            />
        </>
    );
}
