"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { MoveRight, Calendar, Trophy, Users, Filter, Loader } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

import { motion, AnimatePresence } from "framer-motion"; // Added import

export default function TournamentsPage() {
    const [filter, setFilter] = useState("ALL");
    const [isFilterOpen, setIsFilterOpen] = useState(false); // Added state
    const [tournaments, setTournaments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTournaments = async () => {
            try {
                const res = await fetch("/api/admin/tournaments");
                const data = await res.json();
                if (res.ok) {
                    setTournaments(data);
                }
            } catch (error) {
                console.error("Failed to fetch tournaments:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchTournaments();
    }, []);

    const filteredTournaments = tournaments.filter(t => filter === "ALL" || t.status === filter);

    return (
        <div className="container mx-auto px-4 py-12">
            <div className="flex flex-col md:flex-row justify-between items-end mb-12">
                <div>
                    <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-4">
                        Active <span className="text-secondary text-outline">Tournaments</span>
                    </h1>
                    <p className="text-white/60 max-w-2xl">
                        Join the battle. Prove your skills. Win big prizes.
                    </p>
                </div>

                <div className="relative mt-6 md:mt-0 z-20">
                    <div className="flex items-center space-x-2">
                        <span className="text-sm font-bold uppercase text-white/60 mr-2 md:hidden">Filter:</span>
                        <button
                            onClick={() => setIsFilterOpen(!isFilterOpen)}
                            className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-lg hover:bg-white/10 transition-colors"
                        >
                            <Filter className="w-4 h-4 text-primary" />
                            <span className="text-sm font-bold uppercase">{filter}</span>
                        </button>
                    </div>

                    <AnimatePresence>
                        {isFilterOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                className="absolute right-0 top-full mt-2 min-w-[200px] bg-black/90 backdrop-blur-xl border border-white/10 rounded-xl p-2 shadow-2xl flex flex-col gap-1"
                            >
                                {["ALL", "UPCOMING", "ONGOING", "COMPLETED"].map((status) => (
                                    <button
                                        key={status}
                                        onClick={() => {
                                            setFilter(status);
                                            setIsFilterOpen(false);
                                        }}
                                        className={`w-full text-left px-4 py-3 rounded-lg text-xs font-bold uppercase transition-colors flex items-center justify-between ${filter === status
                                            ? "bg-primary text-black"
                                            : "text-white/60 hover:bg-white/5 hover:text-white"
                                            }`}
                                    >
                                        {status}
                                        {filter === status && <div className="w-2 h-2 rounded-full bg-black" />}
                                    </button>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {loading ? (
                <div className="grid gap-6">
                    {[...Array(3)].map((_, i) => (
                        <Card key={i} className="p-8 animate-pulse flex items-center justify-center h-48">
                            <Loader className="w-8 h-8 animate-spin text-white/10" />
                        </Card>
                    ))}
                </div>
            ) : filteredTournaments.length === 0 ? (
                <div className="py-20 text-center">
                    <h2 className="text-2xl font-black uppercase text-white/10 italic">No tournaments in your proximity.</h2>
                </div>
            ) : (
                <div className="grid gap-6">
                    {filteredTournaments.map((tournament) => (
                        <div
                            key={tournament._id}
                            className="group relative flex flex-col md:flex-row bg-white/5 border border-white/5 rounded-xl overflow-hidden hover:border-primary/50 transition-colors"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />

                            <div className="relative w-full md:w-64 h-48 shrink-0">
                                <Image
                                    fill
                                    src={tournament.image || "/logo.svg"}
                                    alt={tournament.title}
                                    className="object-cover"
                                    sizes="(max-width: 768px) 100vw, 256px"
                                />
                                <div className="absolute top-2 left-2 px-2 py-1 bg-black/80 backdrop-blur-md rounded text-[10px] font-black uppercase text-primary border border-primary/20">
                                    {tournament.status}
                                </div>
                            </div>

                            <div className="flex-1 p-6 flex flex-col justify-center">
                                <span className="text-xs font-bold text-white/40 uppercase tracking-wider mb-2">
                                    {tournament.gameId?.title || "Unknown Game"}
                                </span>
                                <h3 className="text-2xl font-bold uppercase mb-4 group-hover:text-primary transition-colors">{tournament.title}</h3>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                                    <div className="flex items-center text-sm text-white/60">
                                        <Calendar className="w-4 h-4 mr-2" />
                                        <span>{new Date(tournament.startDate).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex items-center text-sm text-white/60">
                                        <Trophy className="w-4 h-4 mr-2 text-yellow-400" />
                                        <span className="text-yellow-400 font-bold">{tournament.prizePool}</span>
                                    </div>
                                    <div className="flex items-center text-sm text-white/60">
                                        <Users className="w-4 h-4 mr-2" />
                                        <span>{tournament.registeredTeams?.length || 0}/{tournament.maxTeams} Teams</span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="text-xs text-white/40 italic uppercase font-medium">
                                        Registration status: <span className="text-white font-bold">{tournament.status === "UPCOMING" ? "OPEN" : "CLOSED"}</span>
                                    </div>
                                    <Link href={`/tournaments/${tournament._id}`}>
                                        <Button asDiv variant="neon" size="sm">
                                            View Details <MoveRight className="ml-2 w-4 h-4" />
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

// Helper Card component for loading state if needed
function Card({ children, className }: { children: React.ReactNode, className?: string }) {
    return (
        <div className={`bg-white/5 border border-white/5 rounded-xl overflow-hidden ${className}`}>
            {children}
        </div>
    );
}
