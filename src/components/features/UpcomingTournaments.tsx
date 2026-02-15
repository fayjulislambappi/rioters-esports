import Link from "next/link";
import NextImage from "next/image";
import { Calendar, Trophy, Users } from "lucide-react";
import Button from "@/components/ui/Button";
import connectDB from "@/lib/db";
import Tournament from "@/models/Tournament";

export default async function UpcomingTournaments() {
    await connectDB();

    const upcomingTournamentsData = await Tournament.find({ status: "UPCOMING" })
        .sort({ startDate: 1 })
        .limit(3)
        .populate("gameId")
        .lean();

    const upcomingTournaments = upcomingTournamentsData.map((t: any) => ({
        id: t._id.toString(),
        title: t.title,
        game: t.gameId?.title || "Unknown Game",
        date: new Date(t.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        prize: t.prizePool,
        teams: `${t.registeredTeams?.length || 0}/${t.maxTeams}`,
        image: t.image || "https://images.unsplash.com/photo-1624138784181-dc7cc7539698?q=80&w=200&auto=format&fit=crop",
    }));

    return (
        <div className="grid gap-4">
            {upcomingTournaments.map((tournament) => (
                <div
                    key={tournament.id}
                    className="group relative flex flex-col md:flex-row items-center bg-white/5 border border-white/5 rounded-xl p-4 md:p-6 hover:border-primary/50 transition-colors overflow-hidden"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />

                    <div className="relative w-full md:w-32 h-32 md:h-24 rounded-lg overflow-hidden shrink-0 mb-4 md:mb-0 md:mr-6">
                        <NextImage fill src={tournament.image} alt={tournament.game} className="object-cover" />
                    </div>

                    <div className="flex-1 text-center md:text-left mb-4 md:mb-0">
                        <span className="text-xs font-bold text-primary uppercase tracking-wider mb-1 block">
                            {tournament.game}
                        </span>
                        <h3 className="text-xl font-bold uppercase mb-2">{tournament.title}</h3>
                        <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm text-white/60">
                            <span className="flex items-center"><Calendar className="w-4 h-4 mr-2" /> {tournament.date}</span>
                            <span className="flex items-center"><Trophy className="w-4 h-4 mr-2 text-yellow-400" /> {tournament.prize}</span>
                            <span className="flex items-center"><Users className="w-4 h-4 mr-2" /> {tournament.teams} Teams</span>
                        </div>
                    </div>

                    <div className="relative shrink-0">
                        <Link href={`/tournaments/${tournament.id}`}>
                            <Button variant="primary">Register Now</Button>
                        </Link>
                    </div>
                </div>
            ))}
        </div>
    );
}
