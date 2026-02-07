import Hero from "@/components/features/Hero";
import GameCard from "@/components/features/GameCard";
import Button from "@/components/ui/Button";
import NextImage from "next/image";
import Link from "next/link";
import { ArrowRight, Trophy, Users, Calendar } from "lucide-react";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import Game from "@/models/Game";
import Tournament from "@/models/Tournament";

export const dynamic = "force-dynamic";

export default async function Home() {
  await connectDB();
  const session = await getServerSession(authOptions);

  // Fetch featured and active games
  const gamesData = await Game.find({ isFeatured: true, active: true }).lean();

  // Fetch tournament counts for each game
  const featuredGames = await Promise.all(
    gamesData.map(async (game: any) => {
      const tournamentsCount = await Tournament.countDocuments({
        gameId: game._id,
        status: { $in: ["UPCOMING", "ONGOING"] }
      });

      return {
        title: game.title,
        image: game.coverImage,
        category: game.category || "FPS",
        tournamentsCount,
        slug: game.slug,
      };
    })
  );

  const upcomingTournaments = [
    {
      id: 1,
      title: "Valorant Champions 2024",
      game: "Valorant",
      date: "Aug 15, 2024",
      prize: "$10,000",
      teams: "16/32",
      image: "https://images.unsplash.com/photo-1624138784181-dc7cc7539698?q=80&w=200&auto=format&fit=crop",
    },
    {
      id: 2,
      title: "CS2 Major GLL",
      game: "Counter-Strike 2",
      date: "Sep 01, 2024",
      prize: "$25,000",
      teams: "8/16",
      image: "https://images.unsplash.com/photo-1605901309584-818e25960b8f?q=80&w=200&auto=format&fit=crop",
    },
    {
      id: 3,
      title: "League Summer Split",
      game: "League of Legends",
      date: "July 20, 2024",
      prize: "$50,000",
      teams: "10/10",
      image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=200&auto=format&fit=crop",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Hero />

      {/* Featured Games Section */}
      <section className="py-20 bg-black relative">
        <div className="absolute top-0 w-full h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-end mb-12">
            <div>
              <span className="text-primary text-sm font-bold uppercase tracking-widest">
                Choose Your Arena
              </span>
              <h2 className="text-4xl md:text-5xl font-black uppercase mt-2">
                Featured <span className="text-outline">Games</span>
              </h2>
            </div>
            <Link href="/games" className="hidden md:block">
              <Button variant="ghost">
                View All Games <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredGames.length > 0 ? (
              featuredGames.map((game) => (
                <GameCard key={game.slug} {...game} />
              ))
            ) : (
              <div className="col-span-full py-20 text-center border-2 border-dashed border-white/5 rounded-2xl">
                <p className="text-white/20 font-black uppercase tracking-[0.2em]">No Featured Games Selected</p>
              </div>
            )}
          </div>

          <div className="mt-8 text-center md:hidden">
            <Link href="/games">
              <Button variant="ghost">View All Games</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Upcoming Tournaments Section */}
      <section className="py-20 bg-background relative overflow-hidden">
        <div className="absolute top-1/2 -right-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

        <div className="container mx-auto px-4">
          <div className="flex justify-between items-end mb-12">
            <div>
              <span className="text-secondary text-sm font-bold uppercase tracking-widest">
                Compete & Win
              </span>
              <h2 className="text-4xl md:text-5xl font-black uppercase mt-2">
                Upcoming <span className="text-outline">Tournaments</span>
              </h2>
            </div>
          </div>

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
          <div className="mt-10 text-center">
            <Link href="/tournaments">
              <Button variant="outline" size="lg">View All Tournaments</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {!session && (
        <section className="py-32 relative flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-primary/10" />
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center opacity-10" />

          <div className="container px-4 text-center relative z-10">
            <h2 className="text-5xl md:text-7xl font-black uppercase italic mb-8">
              Ready to become a <br />
              <span className="text-primary neon-text">Legend?</span>
            </h2>
            <Link href="/register">
              <Button size="lg" variant="neon" className="px-12 py-8 text-xl">
                Join Rioters Esports
              </Button>
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}
