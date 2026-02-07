"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, Users, Trophy, Loader } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

export default function TeamsPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [teams, setTeams] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTeams = async () => {
            try {
                const res = await fetch("/api/admin/teams");
                const data = await res.json();
                if (res.ok) {
                    setTeams(data);
                }
            } catch (error) {
                console.error("Failed to fetch teams:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchTeams();
    }, []);

    const filteredTeams = teams.filter(team =>
        team.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="container mx-auto px-4 py-12">
            <div className="flex flex-col md:flex-row justify-between items-end mb-12">
                <div>
                    <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-4">
                        Pro <span className="text-primary text-outline">Teams</span>
                    </h1>
                    <p className="text-white/60 max-w-2xl">
                        Find the best squads or create your own legacy.
                    </p>
                </div>

                <div className="w-full md:w-auto mt-6 md:mt-0 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 w-4 h-4" />
                    <Input
                        placeholder="Search teams..."
                        className="pl-10 w-full md:w-64"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[...Array(8)].map((_, i) => (
                        <div key={i} className="bg-white/5 border border-white/5 rounded-xl p-8 aspect-square animate-pulse flex items-center justify-center">
                            <Loader className="w-8 h-8 animate-spin text-white/10" />
                        </div>
                    ))}
                </div>
            ) : filteredTeams.length === 0 ? (
                <div className="py-20 text-center">
                    <h2 className="text-2xl font-black uppercase text-white/10 italic">No squads found in this sector.</h2>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {filteredTeams.map((team) => (
                        <Link key={team._id} href={`/teams/${team.slug}`}>
                            <div className="group bg-white/5 border border-white/5 rounded-xl p-6 hover:border-primary/50 transition-all duration-300 hover:-translate-y-1 h-full min-h-[200px] flex flex-col">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-white/10 group-hover:border-primary transition-colors bg-black/40">
                                        <Image src={team.logo || "/logo.png"} alt={team.name} fill className="object-cover" />
                                    </div>
                                    <div className="text-right">
                                        <span className="text-[10px] font-black text-white/40 uppercase block mb-1">Elite Squad</span>
                                        <div className="flex items-center justify-end text-yellow-500 font-bold text-xs">
                                            <Trophy className="w-3 h-3 mr-1" /> ACTIVE
                                        </div>
                                    </div>
                                </div>

                                <h3 className="text-xl font-bold uppercase mb-4 group-hover:text-primary transition-colors">{team.name}</h3>

                                <div className="flex items-center justify-between mt-auto">
                                    <span className="flex items-center text-[10px] font-black text-white/60 uppercase">
                                        <Users className="w-3 h-3 mr-1 text-primary" /> {team.members?.length || 0} Members
                                    </span>
                                    <span className="text-[10px] font-black text-primary opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0 uppercase">
                                        Profile
                                    </span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
