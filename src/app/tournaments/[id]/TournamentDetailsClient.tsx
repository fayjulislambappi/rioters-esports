"use client";

import Image from "next/image";
import Button from "@/components/ui/Button";
import { MoveLeft, Trophy, Calendar, Users, Shield, CheckCircle, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { format } from "date-fns";

interface TournamentDetailsClientProps {
    tournament: any;
    userTeam: any;
    userId?: string;
}

export default function TournamentDetailsClient({ tournament, userTeam, userId }: TournamentDetailsClientProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    // Logic checks
    const isRegistered = userTeam && tournament.registeredTeams.some((t: any) => t._id === userTeam._id);
    const isFull = tournament.registeredTeams.length >= tournament.maxTeams;
    const isCaptain = userTeam?.captainId === userId;
    const canRegister = userId && isCaptain && !isRegistered && !isFull && tournament.status === "UPCOMING";

    // Parsing helpers
    const rulesList = tournament.rules ? tournament.rules.split("\n").filter((r: string) => r.trim() !== "") : [];
    // Handle prize pool if string or object (legacy vs new)
    const prizeTotal = typeof tournament.prizePool === 'string' ? tournament.prizePool : tournament.prizePool?.total || "TBD";

    // Parse Date safely
    const formatDate = (date: string) => {
        try {
            return format(new Date(date), "MMM do, yyyy");
        } catch (e) {
            return date;
        }
    };

    const handleRegister = async () => {
        if (!confirm(`Register your team "${userTeam.name}" for this tournament?`)) return;
        setLoading(true);
        try {
            const res = await fetch("/api/tournaments/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    tournamentId: tournament._id,
                    teamId: userTeam._id
                })
            });
            const data = await res.json();
            if (res.ok) {
                toast.success("Successfully registered!");
                router.refresh();
            } else {
                toast.error(data.error || "Registration failed");
            }
        } catch (error) {
            toast.error("Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen pb-20">
            {/* Hero Banner */}
            <div className="relative h-[400px] w-full">
                <Image
                    src={tournament.image || "/hero-bg.jpg"}
                    alt={tournament.title}
                    fill
                    className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
                <div className="absolute inset-0 bg-black/50" />

                <div className="container mx-auto px-4 h-full flex flex-col justify-end pb-12 relative z-10">
                    <Link href="/tournaments" className="inline-block mb-6">
                        <span className="flex items-center text-white/60 hover:text-white transition-colors text-sm font-bold uppercase tracking-wider">
                            <MoveLeft className="w-4 h-4 mr-2" /> Back to Tournaments
                        </span>
                    </Link>
                    <span className="text-primary font-bold uppercase tracking-widest mb-2">
                        {tournament.gameId?.title || "Esports Event"}
                    </span>
                    <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-4">
                        {tournament.title}
                    </h1>
                    <div className="flex flex-wrap gap-6 text-sm font-bold uppercase tracking-wide">
                        <span className="flex items-center text-white">
                            <Trophy className="w-5 h-5 mr-2 text-yellow-400" /> Prize: {prizeTotal}
                        </span>
                        <span className="flex items-center text-white">
                            <Calendar className="w-5 h-5 mr-2" /> {formatDate(tournament.startDate)}
                        </span>
                        <span className="flex items-center text-white">
                            <Users className="w-5 h-5 mr-2" /> {tournament.registeredTeams.length}/{tournament.maxTeams} Teams
                        </span>
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
                            <p className="text-white/70 leading-relaxed text-lg whitespace-pre-wrap">
                                {tournament.description}
                            </p>
                        </section>

                        <section>
                            <h3 className="text-2xl font-bold uppercase mb-4 flex items-center">
                                <CheckCircle className="w-6 h-6 mr-3 text-secondary" /> Rules & Format
                            </h3>
                            {rulesList.length > 0 ? (
                                <ul className="grid gap-3">
                                    {rulesList.map((rule: string, i: number) => (
                                        <li key={i} className="flex items-center text-white/70 bg-white/5 p-3 rounded-lg border border-white/5">
                                            <span className="w-2 h-2 bg-secondary rounded-full mr-3" />
                                            {rule}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-white/40 italic">No specific rules listed.</p>
                            )}
                        </section>

                        {/* Registered Teams List */}
                        <section>
                            <h3 className="text-2xl font-bold uppercase mb-4 flex items-center">
                                <Users className="w-6 h-6 mr-3 text-blue-400" /> Registered Teams
                            </h3>
                            {tournament.registeredTeams.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {tournament.registeredTeams.map((team: any) => (
                                        <div key={team._id} className="flex items-center bg-white/5 p-4 rounded-xl border border-white/10">
                                            <div className="w-10 h-10 rounded bg-black/40 relative overflow-hidden border border-white/10 mr-4">
                                                <Image src={team.logo || "/logo.png"} alt={team.name} fill className="object-cover" />
                                            </div>
                                            <div>
                                                <div className="font-bold uppercase tracking-wider">{team.name}</div>
                                                <div className="text-xs text-white/40">{team.members?.length || 0} Members</div>
                                            </div>
                                            {team._id === userTeam?._id && (
                                                <span className="ml-auto text-xs font-bold text-green-400 border border-green-400/20 bg-green-400/10 px-2 py-1 rounded">YOU</span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-8 text-center border-2 border-dashed border-white/10 rounded-xl text-white/40">
                                    No teams registered yet. Be the first!
                                </div>
                            )}
                        </section>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        <div className="glass-card sticky top-24">
                            <h3 className="text-xl font-bold uppercase mb-6">Registration</h3>

                            <div className="space-y-4 mb-8">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-white/60">Entry Fee</span>
                                    <span className="font-bold text-primary">{tournament.entryFee || "Free"}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-white/60">Registration Ends</span>
                                    <span className="font-bold text-white">{formatDate(tournament.registrationDeadline)}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-white/60">Slots Available</span>
                                    <span className="font-bold text-white">
                                        {tournament.maxTeams - tournament.registeredTeams.length} / {tournament.maxTeams}
                                    </span>
                                </div>
                            </div>

                            {userId ? (
                                !userTeam ? (
                                    <div className="text-center">
                                        <p className="text-sm text-yellow-400 mb-4 flex items-center justify-center gap-2">
                                            <AlertCircle className="w-4 h-4" /> You need a team to register.
                                        </p>
                                        <Link href="/teams/create">
                                            <Button variant="outline" className="w-full">Create a Team</Button>
                                        </Link>
                                    </div>
                                ) : !isCaptain ? (
                                    <div className="text-center p-4 bg-white/5 rounded-lg border border-white/10">
                                        <p className="text-sm text-white/60">
                                            Only the captain <strong>{userTeam.captainId?.name || "Captain"}</strong> can register the team.
                                        </p>
                                    </div>
                                ) : isRegistered ? (
                                    <div className="w-full py-4 bg-green-500/10 border border-green-500/20 text-green-400 text-center font-bold rounded-lg uppercase tracking-wide">
                                        <CheckCircle className="w-5 h-5 inline-block mr-2" /> Registered
                                    </div>
                                ) : isFull ? (
                                    <Button disabled className="w-full opacity-50 cursor-not-allowed">
                                        Tournament Full
                                    </Button>
                                ) : (
                                    <Button
                                        onClick={handleRegister}
                                        variant="neon"
                                        className="w-full text-lg py-6 neon-box"
                                        isLoading={loading}
                                    >
                                        Register Team
                                    </Button>
                                )
                            ) : (
                                <Link href="/login">
                                    <Button variant="primary" className="w-full">Login to Register</Button>
                                </Link>
                            )}

                            {userId && isCaptain && !isRegistered && (
                                <p className="text-xs text-white/40 text-center mt-4">
                                    Registering as <strong>{userTeam.name}</strong>
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
