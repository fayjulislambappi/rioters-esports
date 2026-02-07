"use client";

import Image from "next/image";
import { User, Shield, Crosshair } from "lucide-react";
import Card from "@/components/ui/Card";

interface PlayerCardProps {
    ign: string;
    role: string;
    rank: string;
    image?: string;
    game: string;
}

export default function PlayerCard({ ign, role, rank, image, game }: PlayerCardProps) {
    return (
        <Card className="flex flex-col items-center text-center p-6 group hover:border-primary/50 transition-all duration-300">
            <div className="relative w-24 h-24 mb-4 rounded-full overflow-hidden border-2 border-white/10 group-hover:border-primary transition-colors cursor-pointer">
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

            <div className="flex gap-2 w-full justify-center">
                <div className="bg-white/5 py-1 px-3 rounded text-xs font-bold uppercase border border-white/5 flex items-center">
                    <Shield className="w-3 h-3 mr-1 text-secondary" /> {role}
                </div>
                <div className="bg-white/5 py-1 px-3 rounded text-xs font-bold uppercase border border-white/5 flex items-center">
                    <Crosshair className="w-3 h-3 mr-1 text-accent" /> {rank}
                </div>
            </div>
        </Card>
    );
}
