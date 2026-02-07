"use client";

import { useParams } from "next/navigation";
import Image from "next/image";
import Button from "@/components/ui/Button";
import Link from "next/link";
import { MoveLeft, Trophy, Users, Calendar } from "lucide-react";

// Mock Data
const gameDetails = {
    slug: "valorant",
    title: "Valorant",
    description: "A 5v5 character-based tactical shooter where precise gunplay meets unique agent abilities. Valorant is the fastest growing esport in the world.",
    coverImage: "https://images.unsplash.com/photo-1624138784181-dc7cc7539698?q=80&w=1500&auto=format&fit=crop",
    category: "FPS",
    platforms: ["PC"],
    publisher: "Riot Games",
    activeTournaments: [
        {
            id: 1,
            title: "Valorant Champions 2024",
            date: "Aug 15, 2024",
            prize: "$10,000",
            teams: "16/32",
            image: "https://images.unsplash.com/photo-1624138784181-dc7cc7539698?q=80&w=500&auto=format&fit=crop",
        },
        {
            id: 5,
            title: "Valorant Community Cup",
            date: "Every Friday",
            prize: "$200",
            teams: "Open",
            image: "https://images.unsplash.com/photo-1624138784181-dc7cc7539698?q=80&w=500&auto=format&fit=crop",
        }
    ]
};

export default function GameDetails() {
    const params = useParams();
    // In real app, fetch game by params.slug

    return (
        <div className="min-h-screen pb-20">
            {/* Hero Banner */}
            <div className="relative h-[500px] w-full">
                <Image
                    src={gameDetails.coverImage}
                    alt={gameDetails.title}
                    fill
                    className="object-cover"
                    priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
                <div className="absolute inset-0 bg-black/40" />

                <div className="container mx-auto px-4 h-full flex flex-col justify-end pb-12 relative z-10">
                    <Link href="/games" className="inline-block mb-6">
                        <span className="flex items-center text-white/60 hover:text-white transition-colors text-sm font-bold uppercase tracking-wider">
                            <MoveLeft className="w-4 h-4 mr-2" /> Back to Games
                        </span>
                    </Link>
                    <span className="inline-block py-1 px-3 rounded bg-primary/20 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest mb-4 w-fit">
                        {gameDetails.category}
                    </span>
                    <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter mb-6 text-glow">{gameDetails.title}</h1>
                    <p className="text-lg text-white/80 max-w-2xl">{gameDetails.description}</p>
                </div>
            </div>

            <div className="container mx-auto px-4 mt-12">
                <div className="flex flex-col md:flex-row justify-between items-end mb-8 border-b border-white/10 pb-4">
                    <h2 className="text-3xl font-bold uppercase">Active <span className="text-secondary">Tournaments</span></h2>
                    <Link href="/tournaments">
                        <Button variant="ghost">View All Tournaments</Button>
                    </Link>
                </div>

                <div className="grid gap-6">
                    {gameDetails.activeTournaments.map((tournament) => (
                        <div key={tournament.id} className="bg-white/5 border border-white/5 rounded-xl p-6 flex flex-col md:flex-row items-center hover:border-primary/50 transition-colors">
                            <div className="relative w-full md:w-48 h-32 rounded-lg overflow-hidden shrink-0 mb-4 md:mb-0 md:mr-8">
                                <Image fill src={tournament.image} alt={tournament.title} className="object-cover" />
                            </div>

                            <div className="flex-1">
                                <h3 className="text-xl font-bold uppercase mb-2">{tournament.title}</h3>
                                <div className="flex flex-wrap gap-4 text-sm text-white/60">
                                    <span className="flex items-center"><Calendar className="w-4 h-4 mr-2" /> {tournament.date}</span>
                                    <span className="flex items-center"><Trophy className="w-4 h-4 mr-2 text-yellow-500" /> {tournament.prize}</span>
                                    <span className="flex items-center"><Users className="w-4 h-4 mr-2" /> {tournament.teams}</span>
                                </div>
                            </div>

                            <div className="mt-4 md:mt-0">
                                <Link href={`/tournaments/${tournament.id}`}>
                                    <Button variant="primary">Join Tournament</Button>
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
