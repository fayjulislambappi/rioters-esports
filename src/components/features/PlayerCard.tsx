"use client";

import { useState } from "react";
import Image from "next/image";
import { User, Shield, Crosshair } from "lucide-react";
import Card from "@/components/ui/Card";
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
}

export default function PlayerCard({
    ign,
    role,
    rank,
    image,
    game,
    name = "Pro Player",
    teamName = "RIOTERS",
    teamLogo = "/logo.png"
}: PlayerCardProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const roles = Array.isArray(role) ? role : [role];

    return (
        <>
            <Card
                className="flex flex-col items-center text-center p-6 group hover:border-primary/50 transition-all duration-300 cursor-pointer active:scale-95"
                onClick={() => setIsModalOpen(true)}
            >
                <div className="relative w-24 h-24 mb-4 rounded-full overflow-hidden border-2 border-white/10 group-hover:border-primary transition-colors">
                    {image ? (
                        <Image src={image} alt={ign} fill className="object-cover" />
                    ) : (
                        <div className="w-full h-full bg-white/10 flex items-center justify-center">
                            <User className="w-10 h-10 text-white/40" />
                        </div>
                    )}
                </div>

                <h3 className="text-xl font-bold uppercase tracking-wider mb-1 text-white group-hover:text-primary transition-colors">
                    {ign}
                </h3>
                <span className="text-xs font-bold text-white/40 uppercase mb-4">{game}</span>

                <div className="flex flex-wrap gap-2 w-full justify-center">
                    {roles.map((r, i) => (
                        <div key={i} className="bg-white/5 py-1 px-3 rounded text-[9px] font-black uppercase border border-white/5 flex items-center tracking-tighter">
                            <Shield className="w-3 h-3 mr-1 text-secondary" /> {r.replace('_', ' ')}
                        </div>
                    ))}
                    <div className="bg-white/5 py-1 px-3 rounded text-[9px] font-black uppercase border border-white/5 flex items-center tracking-tighter">
                        <Crosshair className="w-3 h-3 mr-1 text-accent" /> {rank}
                    </div>
                </div>
            </Card>

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
