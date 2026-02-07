import { notFound } from "next/navigation";
import Image from "next/image";
import Button from "@/components/ui/Button";
import Link from "next/link";
import { MoveLeft, Trophy, Users, Calendar, AlertCircle } from "lucide-react";
import connectDB from "@/lib/db";
import Game from "@/models/Game";
import Tournament from "@/models/Tournament";

// Force dynamic rendering to ensure fresh data on every request
export const dynamic = "force-dynamic";

export default async function GameDetails({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    await connectDB();

    // 1. Fetch Game Details
    const game = await Game.findOne({ slug }).lean();

    if (!game) {
        return notFound();
    }

    // 2. Fetch Active Tournaments for this Game
    // Show UPCOMING and ONGOING tournaments, sorted by accumulated urgency
    const tournaments = await Tournament.find({
        gameId: game._id,
        status: { $in: ["UPCOMING", "ONGOING"] }
    }).sort({ startDate: 1 }).lean();

    // Helper to format currency if it's a number, or just show string
    const formatPrize = (prize: any) => {
        if (typeof prize === 'string') return prize;
        if (typeof prize === 'object' && prize.total) return prize.total;
        return "TBD";
    };

    return (
        <div className="min-h-screen pb-20">
            {/* Hero Banner */}
            <div className="relative h-[500px] w-full">
                <Image
                    src={game.coverImage || "/hero-bg.jpg"}
                    alt={game.title}
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
                        {game.category || "Esports"}
                    </span>
                    <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter mb-6 text-glow">{game.title}</h1>
                    <p className="text-lg text-white/80 max-w-2xl">{game.description}</p>
                </div>
            </div>

            <div className="container mx-auto px-4 mt-12">
                <div className="flex flex-col md:flex-row justify-between items-end mb-8 border-b border-white/10 pb-4">
                    <h2 className="text-3xl font-bold uppercase">Active <span className="text-secondary">Tournaments</span></h2>
                    <Link href="/tournaments">
                        <Button variant="ghost">View All Tournaments</Button>
                    </Link>
                </div>

                {tournaments.length > 0 ? (
                    <div className="grid gap-6">
                        {tournaments.map((tournament: any) => (
                            <div key={tournament._id} className="bg-white/5 border border-white/5 rounded-xl p-6 flex flex-col md:flex-row items-center hover:border-primary/50 transition-colors">
                                <div className="relative w-full md:w-48 h-32 rounded-lg overflow-hidden shrink-0 mb-4 md:mb-0 md:mr-8 bg-black/50">
                                    <Image
                                        fill
                                        src={tournament.image || game.coverImage || "/logo.png"}
                                        alt={tournament.title}
                                        className="object-cover"
                                    />
                                </div>

                                <div className="flex-1">
                                    <h3 className="text-xl font-bold uppercase mb-2">{tournament.title}</h3>
                                    <div className="flex flex-wrap gap-4 text-sm text-white/60">
                                        <span className="flex items-center">
                                            <Calendar className="w-4 h-4 mr-2" />
                                            {new Date(tournament.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </span>
                                        <span className="flex items-center">
                                            <Trophy className="w-4 h-4 mr-2 text-yellow-500" />
                                            {formatPrize(tournament.prizePool)}
                                        </span>
                                        <span className="flex items-center">
                                            <Users className="w-4 h-4 mr-2" />
                                            {tournament.registeredTeams?.length || 0} / {tournament.maxTeams} Teams
                                        </span>
                                    </div>
                                </div>

                                <div className="mt-4 md:mt-0 flex flex-col items-center gap-2">
                                    <div className={`px-2 py-1 rounded text-[10px] font-bold uppercase border ${tournament.status === 'ONGOING' ? 'bg-green-500/20 text-green-400 border-green-500/20' : 'bg-blue-500/20 text-blue-400 border-blue-500/20'}`}>
                                        {tournament.status}
                                    </div>
                                    <Link href={`/tournaments/${tournament._id.toString()}`}>
                                        <Button variant="primary">View Details</Button>
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="py-12 text-center border border-dashed border-white/10 rounded-xl bg-white/5">
                        <AlertCircle className="w-12 h-12 text-white/20 mx-auto mb-4" />
                        <h3 className="text-xl font-bold uppercase text-white/40 mb-2">No Active Tournaments</h3>
                        <p className="text-white/30 max-w-md mx-auto">
                            There are currently no upcoming tournaments for {game.title}. Check back later or browse other games!
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
