"use client";

import { useParams } from "next/navigation";
import Image from "next/image";
import Button from "@/components/ui/Button";
import { MoveLeft, Trophy, Calendar, Users, Shield, Clock, CheckCircle } from "lucide-react";
import Link from "next/link";

export default function TournamentDetails() {
    const params = useParams();

    // Mock Data (Would fetch based on params.id)
    const tournament = {
        id: params.id,
        title: "Valorant Champions 2024",
        game: "Valorant",
        description: "The ultimate showdown for the best Valorant teams in the region. Compete for glory and a massive prize pool.",
        rules: [
            "5v5 Competitive Mode",
            "Single Elimination Bracket",
            "All agents allowed",
            "Map pool: Ascent, Bind, Haven, Split, Icebox"
        ],
        prizePool: {
            total: "$10,000",
            breakdown: [
                { place: "1st", amount: "$6,000" },
                { place: "2nd", amount: "$3,000" },
                { place: "3rd", amount: "$1,000" }
            ]
        },
        schedule: "August 15th - August 20th, 2024",
        image: "https://images.unsplash.com/photo-1624138784181-dc7cc7539698?q=80&w=1500&auto=format&fit=crop",
    };

    return (
        <div className="min-h-screen pb-20">
            {/* Hero Banner */}
            <div className="relative h-[400px] w-full">
                <Image src={tournament.image} alt={tournament.title} fill className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
                <div className="absolute inset-0 bg-black/50" />

                <div className="container mx-auto px-4 h-full flex flex-col justify-end pb-12 relative z-10">
                    <Link href="/tournaments" className="inline-block mb-6">
                        <span className="flex items-center text-white/60 hover:text-white transition-colors text-sm font-bold uppercase tracking-wider">
                            <MoveLeft className="w-4 h-4 mr-2" /> Back to Tournaments
                        </span>
                    </Link>
                    <span className="text-primary font-bold uppercase tracking-widest mb-2">{tournament.game}</span>
                    <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-4">{tournament.title}</h1>
                    <div className="flex flex-wrap gap-6 text-sm font-bold uppercase tracking-wide">
                        <span className="flex items-center text-white"><Trophy className="w-5 h-5 mr-2 text-yellow-400" /> Prize: {tournament.prizePool.total}</span>
                        <span className="flex items-center text-white"><Calendar className="w-5 h-5 mr-2" /> {tournament.schedule}</span>
                        <span className="flex items-center text-white"><Users className="w-5 h-5 mr-2" /> 16/32 Teams</span>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 mt-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-12">
                        <section>
                            <h3 className="text-2xl font-bold uppercase mb-4 flex items-center">
                                <Shield className="w-6 h-6 mr-3 text-primary" /> About
                            </h3>
                            <p className="text-white/70 leading-relaxed text-lg">
                                {tournament.description}
                            </p>
                        </section>

                        <section>
                            <h3 className="text-2xl font-bold uppercase mb-4 flex items-center">
                                <CheckCircle className="w-6 h-6 mr-3 text-secondary" /> Rules & Format
                            </h3>
                            <ul className="grid gap-3">
                                {tournament.rules.map((rule, i) => (
                                    <li key={i} className="flex items-center text-white/70 bg-white/5 p-3 rounded-lg border border-white/5">
                                        <span className="w-2 h-2 bg-secondary rounded-full mr-3" />
                                        {rule}
                                    </li>
                                ))}
                            </ul>
                        </section>

                        <section>
                            <h3 className="text-2xl font-bold uppercase mb-4 flex items-center">
                                <Trophy className="w-6 h-6 mr-3 text-yellow-400" /> Prize Distribution
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {tournament.prizePool.breakdown.map((prize, i) => (
                                    <div key={i} className="bg-white/5 p-6 rounded-xl border border-white/10 text-center">
                                        <div className="text-3xl font-black text-yellow-500 mb-2">{prize.place}</div>
                                        <div className="text-xl font-bold">{prize.amount}</div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        <div className="glass-card sticky top-24">
                            <h3 className="text-xl font-bold uppercase mb-6">Registration</h3>

                            <div className="space-y-4 mb-8">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-white/60">Entry Fee</span>
                                    <span className="font-bold text-primary">Free</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-white/60">Registration Ends</span>
                                    <span className="font-bold text-white">Aug 14, 2024</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-white/60">Slots Available</span>
                                    <span className="font-bold text-white">16</span>
                                </div>
                            </div>

                            <Button variant="neon" className="w-full text-lg py-6 neon-box">
                                Register Team
                            </Button>
                            <p className="text-xs text-white/40 text-center mt-4">
                                You must be a team captain to register.
                            </p>
                        </div>

                        <div className="glass-card">
                            <h3 className="text-xl font-bold uppercase mb-4">Admin Contacts</h3>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center text-primary font-bold">A</div>
                                <div>
                                    <div className="font-bold text-sm">AdminUser</div>
                                    <div className="text-xs text-white/60">Tournament Admin</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
