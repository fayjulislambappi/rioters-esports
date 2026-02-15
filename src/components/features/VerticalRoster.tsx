"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import React, { useState } from "react";
import { getOVRColor } from "@/lib/ovr-utils";
import PlayerStatsModal from "@/components/features/PlayerStatsModal";
import { X, ArrowLeft } from "lucide-react";

interface VerticalRosterProps {
    teamMembers: any[];
    teamInfo: any;
}

export default function VerticalRoster({ teamMembers, teamInfo }: VerticalRosterProps) {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
    const [selectedPlayer, setSelectedPlayer] = useState<any | null>(null);

    // Helper function to get OVR for a member
    const getOVR = (member: any) => {
        const normalize = (s: string) => s?.toLowerCase().replace(/[^a-z0-9]/g, "") || "";
        const target = normalize(teamInfo.gameFocus);
        const gamesArray = member.playerId?.games || member.playerData?.games;
        const gameProfile = gamesArray?.find((g: any) => {
            const current = normalize(g.game);
            return current === target || current.includes(target) || target.includes(current);
        }) || gamesArray?.find((g: any) => g.game === "Counter-Strike 2" || g.game === "Valorant") || gamesArray?.[0];
        return gameProfile?.overall || 60;
    };

    // Sort players by OVR (low to high) and take first 5
    const sortedMembers = [...teamMembers].sort((a, b) => getOVR(a) - getOVR(b));
    const activeLineup = sortedMembers.slice(0, 5);

    const isCS2 = teamInfo.gameFocus?.toLowerCase().includes("counter-strike") || teamInfo.gameFocus?.toLowerCase().includes("cs2");
    const currentSeason = isCS2 ? "Season 4" : "Season 2026";

    return (
        <div className="w-full bg-black py-16 px-4 overflow-hidden">
            {/* Header Section */}
            <div className="container mx-auto mb-8 flex flex-col items-center">
                <div className="flex items-center gap-4 mb-2 opacity-50">
                    <span className="text-white font-black text-lg italic tracking-tighter uppercase">
                        {teamInfo.gameFocus || "General"}
                    </span>
                    <div className="w-[1px] h-6 bg-white/20" />
                    <span className="text-white font-black text-lg italic tracking-tighter uppercase">
                        Lineup
                    </span>
                </div>
                <h2 className="text-3xl md:text-5xl font-black uppercase text-center text-white tracking-tighter leading-none mb-2">
                    Active <span className="text-primary italic">Roster</span>
                </h2>
                <div className="text-white/40 uppercase font-bold tracking-[0.3em] text-[8px] md:text-[10px]">
                    Rioters Esports // {currentSeason}
                </div>
            </div>

            {/* Vertical Strips Container */}
            <div className="relative flex w-full max-w-6xl mx-auto h-[350px] sm:h-[450px] md:h-[550px] lg:h-[600px] gap-1.5 sm:gap-2 md:gap-3 items-end justify-center overflow-x-auto sm:overflow-x-visible px-4 sm:px-0">
                {activeLineup.map((member, index) => {
                    const isHovered = hoveredIndex === index;

                    // Find game-specific stats and OVR
                    const normalize = (s: string) => s?.toLowerCase().replace(/[^a-z0-9]/g, "") || "";
                    const target = normalize(teamInfo.gameFocus);

                    // Check both playerId and playerData for games
                    const gamesArray = member.playerId?.games || member.playerData?.games;
                    const gameProfile = gamesArray?.find((g: any) => {
                        const current = normalize(g.game);
                        return current === target || current.includes(target) || target.includes(current);
                    }) || gamesArray?.find((g: any) => g.game === "Counter-Strike 2" || g.game === "Valorant") || gamesArray?.[0];
                    const overall = gameProfile?.overall || 60;

                    // Show OVR directly to match admin panel
                    const displayRating = overall;
                    const scoreColorClass = getOVRColor(overall);

                    // Get stats and role for player card
                    const stats = gameProfile?.stats || {};

                    const captId = teamInfo.captainId?._id || teamInfo.captainId;
                    const isCaptain = (member._id?.toString() === captId?.toString()) ||
                        ((member.userId || member.registeredUserId)?.toString() === captId?.toString());

                    let displayRole = "PLAYER";
                    if (isCaptain) {
                        displayRole = "CAPTAIN";
                    } else if (member.isSubstitute || member.role === "SUBSTITUTE") {
                        displayRole = "SUBSTITUTE";
                    } else if (member.role && member.role !== "MEMBER" && member.role !== "USER") {
                        displayRole = member.role.toUpperCase();
                    }

                    // Calculate dynamic height based on OVR (60-99 scale)
                    // Min height: 50%, Max height: 100%
                    const heightPercentage = 50 + ((overall - 60) / 39) * 50;

                    return (
                        <motion.div
                            key={member._id || index}
                            className={`relative transition-all duration-500 ease-out cursor-pointer flex flex-col group ${hoveredIndex === null
                                ? 'w-full max-w-[120px] sm:max-w-[160px] md:max-w-[200px] lg:max-w-[220px]'
                                : isHovered
                                    ? 'w-full max-w-[140px] sm:max-w-[200px] md:max-w-[240px] lg:max-w-[280px]'
                                    : 'w-full max-w-[100px] sm:max-w-[130px] md:max-w-[160px] lg:max-w-[180px]'
                                }`}
                            style={{ height: `${heightPercentage}%` }}
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: `${heightPercentage}%`, opacity: 1 }}
                            transition={{ duration: 0.8, delay: index * 0.15, ease: "easeOut" }}
                            onMouseEnter={() => setHoveredIndex(index)}
                            onMouseLeave={() => setHoveredIndex(null)}
                            onClick={() => setSelectedPlayer({ member, gameProfile, overall, stats, displayRole })}
                        >
                            {/* Rating Display - Fixed at top */}
                            <div className="absolute -top-12 sm:-top-14 md:-top-16 left-0 right-0 flex flex-col items-center z-10">
                                <span className={`font-black text-2xl sm:text-3xl md:text-4xl lg:text-5xl italic tracking-tighter leading-none transition-colors duration-300 ${scoreColorClass}`}>
                                    {displayRating}
                                </span>
                                <span className="text-[7px] sm:text-[8px] md:text-[9px] font-black uppercase text-white/30 tracking-[0.25em] mt-0.5 sm:mt-1">
                                    OVR RATING
                                </span>
                            </div>

                            {/* Main Card Area */}
                            <div className="relative flex-1 bg-gradient-to-b from-zinc-900 to-black overflow-hidden border-2 border-white/10 flex flex-col justify-end shadow-2xl">
                                {/* Player Image */}
                                {member.image ? (
                                    <Image
                                        src={member.image}
                                        alt={member.name}
                                        fill
                                        sizes="(max-width: 768px) 160px, 220px"
                                        className={`object-cover object-center transition-all duration-700 ${isHovered ? 'scale-105 brightness-110' : 'scale-100 brightness-90'
                                            }`}
                                    />
                                ) : (
                                    <div className="absolute inset-0 flex items-center justify-center bg-zinc-800">
                                        <div className="text-white/20 text-7xl font-black">{member.name?.[0]}</div>
                                    </div>
                                )}

                                {/* Gradient Overlays */}
                                <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black to-transparent" />

                                {/* Vertical IGN */}
                                <div className="absolute left-1/2 -translate-x-1/2 bottom-4 flex flex-col items-center pointer-events-none px-2 z-10 transition-all duration-500">
                                    <span
                                        className="text-white font-black text-base sm:text-lg md:text-xl lg:text-2xl uppercase italic whitespace-nowrap"
                                        style={{
                                            writingMode: 'vertical-rl',
                                            transform: 'rotate(180deg)'
                                        }}
                                    >
                                        {member.ign || member.name}
                                    </span>
                                </div>

                                {/* Bottom Accent Line (Hover Only) */}
                                {isHovered && (
                                    <motion.div
                                        initial={{ scaleX: 0 }}
                                        animate={{ scaleX: 1 }}
                                        className="absolute bottom-0 left-0 w-full h-[3px] bg-white opacity-50 origin-left"
                                    />
                                )}
                            </div>

                            {/* Hover Shadow Effect */}
                            {isHovered && (
                                <div className="absolute inset-0 bg-primary/10 pointer-events-none" />
                            )}
                        </motion.div>
                    );
                })}
            </div>

            {/* Legend Tickers */}
            <div className="max-w-7xl mx-auto mt-12 flex justify-between items-center px-4 border-t border-white/10 pt-8 opacity-20">
                <div className="flex gap-12 font-black uppercase text-[10px] tracking-[0.4em] text-white">
                    <span>Active Roster</span>
                    <span>{currentSeason}</span>
                    <span>Competitive</span>
                </div>
                <div className="text-white font-black italic text-sm md:text-xl">
                    RIOTERS // EWC
                </div>
            </div>

            {/* Mobile Player Detail Modal */}
            {selectedPlayer && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black z-50 flex items-center justify-center md:hidden"
                    onClick={() => setSelectedPlayer(null)}
                >

                    {/* Player Stats Modal */}
                    <div onClick={(e) => e.stopPropagation()} className="w-full h-full">
                        <PlayerStatsModal
                            isOpen={true}
                            onClose={() => setSelectedPlayer(null)}
                            player={{
                                name: selectedPlayer.member.name,
                                ign: selectedPlayer.member.ign || selectedPlayer.member.name,
                                roles: [selectedPlayer.displayRole],
                                image: selectedPlayer.member.image,
                                teamLogo: teamInfo.logo || "/logo.png",
                                teamName: teamInfo.name,
                                game: selectedPlayer.gameProfile?.game || teamInfo.gameFocus || "General"
                            }}
                            stats={selectedPlayer.stats}
                            overall={selectedPlayer.overall}
                        />
                    </div>
                </motion.div>
            )}
        </div>
    );
}
