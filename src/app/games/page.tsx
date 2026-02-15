"use client";

import { useState, useEffect } from "react";
import GameCard from "@/components/features/GameCard";
import { MoveLeft, Loader } from "lucide-react";
import Link from "next/link";
import Button from "@/components/ui/Button";

export default function GamesPage() {
    const [games, setGames] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchGames = async () => {
            try {
                const res = await fetch("/api/admin/games");
                const data = await res.json();
                if (res.ok) {
                    setGames(data);
                }
            } catch (error) {
                console.error("Failed to fetch games:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchGames();
    }, []);

    return (
        <div className="container mx-auto px-4 py-12">
            <div className="mb-8">
                <Link href="/">
                    <Button asDiv variant="ghost" size="sm" className="mb-4 pl-0 hover:bg-transparent hover:text-primary">
                        <MoveLeft className="mr-2 h-4 w-4" /> Back to Home
                    </Button>
                </Link>
                <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-4">
                    All <span className="text-primary text-outline">Games</span>
                </h1>
                <p className="text-white/60 max-w-2xl">
                    Explore our supported games and find tournament opportunities.
                </p>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="bg-white/5 border border-white/5 rounded-xl aspect-video animate-pulse flex items-center justify-center">
                            <Loader className="w-8 h-8 animate-spin text-white/10" />
                        </div>
                    ))}
                </div>
            ) : games.length === 0 ? (
                <div className="py-20 text-center">
                    <h2 className="text-2xl font-black uppercase text-white/10 italic">The arena is empty. No games registered.</h2>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {games.map((game) => (
                        <GameCard
                            key={game._id}
                            title={game.title}
                            image={game.coverImage}
                            category={game.category}
                            slug={game.slug}
                            tournamentsCount={game.tournamentsCount || 0}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
