import { useState, memo } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { User, Trophy } from "lucide-react";
import PlayerStatsModal from "./PlayerStatsModal";
import { getOVRColor } from "@/lib/ovr-utils";

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
    overall?: number; // New OVR prop
    stats?: any; // New Stats prop
}

const PlayerCard = memo(function PlayerCard({
    ign,
    role,
    rank,
    image,
    game,
    name = "Pro Player",
    teamName = "RIOTERS",
    teamLogo = "/logo.png",
    score = "100",
    overall,
    stats
}: PlayerCardProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const rawRoles = Array.isArray(role) ? role : [role];
    const roles = rawRoles.filter(r => r !== "USER");

    // Name splitting logic for [FirstName] [Nickname] [LastName]
    const fullName = (name || ign || "Pro Player").trim();
    const nameParts = fullName.split(/\s+/);
    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(" ") || "";

    // Determine Score Display
    const displayScore = overall ? overall.toString() : score;
    const scoreColorClass = overall ? getOVRColor(overall) : "text-white";

    return (
        <>
            <motion.div
                whileHover={{ y: -5, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setIsModalOpen(true)}
                className="relative cursor-pointer group w-full h-full"
            >
                {/* Tech Border Container (Sentinels Style) */}
                <div
                    className="relative aspect-[9/16] bg-zinc-800 p-[1px] overflow-hidden"
                    style={{
                        clipPath: 'polygon(12% 0%, 88% 0%, 100% 7%, 100% 93%, 88% 100%, 12% 100%, 0% 93%, 0% 7%)'
                    }}
                >
                    {/* Inner Content Area */}
                    <div
                        className="relative h-full w-full bg-[#050505] flex flex-col overflow-hidden"
                        style={{
                            clipPath: 'polygon(12% 0%, 88% 0%, 100% 7%, 100% 93%, 88% 100%, 12% 100%, 0% 93%, 0% 7%)'
                        }}
                    >
                        {/* Corner Accents (Red Ticks) */}
                        <div className="absolute top-6 left-4 w-1 h-1 bg-[#FF0040]" />
                        <div className="absolute top-6 right-4 w-1 h-1 bg-[#FF0040]" />
                        <div className="absolute bottom-16 left-4 w-1 h-1 bg-[#FF0040]/40" />
                        <div className="absolute bottom-16 right-4 w-1 h-1 bg-[#FF0040]/40" />

                        {/* Side Glowing Bars (Static Accents) */}
                        <div className="absolute left-0 top-[40%] w-[3px] h-[20%] bg-[#FF0040] shadow-[0_0_20px_#FF0040] z-50 rounded-r-full" />
                        <div className="absolute right-0 top-[25%] w-[3px] h-[30%] bg-[#FF0040] shadow-[0_0_20px_#FF0040] z-50 rounded-l-full" />

                        {/* Top/Bottom Chamfer Accents */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-1.5 bg-[#FF0040] rounded-b-md shadow-[0_0_10px_#FF0040]" />
                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-1.5 bg-[#FF0040] rounded-t-md shadow-[0_0_10px_#FF0040]" />

                        {/* Top Header Section */}
                        <div className="flex flex-col items-center justify-center pt-4 pb-2 space-y-2 px-4">
                            {/* Logo Row */}
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 relative">
                                    <Image
                                        src={teamLogo || "/logo.svg"}
                                        alt={teamName}
                                        fill
                                        sizes="24px"
                                        className="object-contain"
                                    />
                                </div>
                            </div>

                            {/* Team Name Box */}
                            <div className="w-full bg-white py-1 flex justify-center items-center shadow-[0_4px_10px_rgba(255,255,255,0.1)]">
                                <span className="text-black font-black text-[7px] md:text-xs uppercase tracking-[0.3em] block">
                                    {teamName}
                                </span>
                            </div>
                        </div>

                        {/* Player Photo Area */}
                        <div className="relative flex-1 bg-[#111] overflow-hidden mx-4 border border-white/5">
                            {image ? (
                                <Image
                                    src={image}
                                    alt={ign}
                                    fill
                                    sizes="(max-width: 768px) 220px, 280px"
                                    className="object-contain object-center group-hover:scale-105 transition-transform duration-1000 ease-out"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center opacity-10">
                                    <User className="w-24 h-24" />
                                </div>
                            )}

                            {/* Gradients to blend portrait */}
                            <div className="absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-[#050505] to-transparent opacity-60" />
                            <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#050505] to-transparent" />
                        </div>

                        {/* Player Name Stack */}
                        <div className="py-1.5 flex flex-col items-center justify-center text-center space-y-0 px-4 mb-1">
                            {/* Full Name on One Line */}
                            {(firstName || lastName) && (
                                <span className={`text-white font-black uppercase tracking-tighter leading-none ${(firstName + lastName).length > 10 ? 'text-sm md:text-base' : 'text-base md:text-lg'}`}>
                                    {firstName} {lastName}
                                </span>
                            )}

                            {/* Nickname with Red Outline Style */}
                            <div className="flex justify-center items-center gap-1 whitespace-nowrap">
                                <span className="text-[#FF0040] font-black text-lg md:text-xl opacity-50">"</span>
                                <span
                                    className={`font-black uppercase italic tracking-tighter leading-none drop-shadow-[0_0_2px_rgba(255,0,64,0.3)] whitespace-nowrap ${ign.length > 15 ? 'text-base md:text-lg' :
                                        ign.length > 12 ? 'text-lg md:text-xl' :
                                            ign.length > 8 ? 'text-xl md:text-2xl' :
                                                'text-2xl md:text-[2.5rem]'
                                        }`}
                                    style={{
                                        color: 'transparent',
                                        WebkitTextStroke: '1px #FF0040'
                                    }}
                                >
                                    {ign}
                                </span>
                                <span className="text-[#FF0040] font-black text-lg md:text-xl opacity-50">"</span>
                            </div>
                        </div>

                        {/* Bottom Info Row */}
                        <div className="flex justify-between items-end px-6 pb-6 mt-auto relative">
                            {/* Role Watermark in the middle */}
                            <div className="absolute left-1/2 -translate-x-1/2 bottom-5 pointer-events-none select-none">
                                <span className="text-xl md:text-3xl font-black uppercase text-white/[0.03] tracking-tighter whitespace-nowrap italic">
                                    {roles[0] || "Player"}
                                </span>
                            </div>

                            <div className="flex flex-col z-10">
                                <span className="text-[7px] font-black uppercase text-white/40 tracking-[0.2em] mb-0.5">Rating</span>
                                <span className={`text-xl font-black italic leading-none ${scoreColorClass} animate-pulse`}>
                                    {displayScore}
                                </span>
                            </div>

                            {/* Static Square Accents */}
                            <div className="flex gap-1 mb-1 z-10">
                                <div className="w-1 h-1 bg-[#FF0040]" />
                                <div className="w-1 h-1 bg-[#FF0040]/30" />
                            </div>

                            <div className="flex flex-col items-end z-10">
                                <span className="text-[7px] font-black uppercase text-white/40 tracking-[0.2em] mb-0.5">
                                    {game?.toLowerCase().includes("efootball") ? "Division" : "Rank"}
                                </span>
                                <span className="text-[10px] font-black text-white uppercase leading-none">
                                    {rank}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Outer Glow on Hover */}
                <div className="absolute inset-0 -z-10 bg-[#FF0040]/10 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </motion.div>

            <PlayerStatsModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                player={{
                    name,
                    ign,
                    roles: roles.map(r => r.replace('_', ' ')),
                    image,
                    teamLogo,
                    teamName,
                    game
                }}
                stats={stats}
                overall={overall}
            />
        </>
    );
});

export default PlayerCard;
