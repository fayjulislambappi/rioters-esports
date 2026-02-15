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
import UpcomingTournaments from "@/components/features/UpcomingTournaments";

import Setting from "@/models/Setting";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

export default async function Home() {
  await connectDB();
  const session = await getServerSession(authOptions);

  // Fetch settings for Hero
  const settings = await Setting.find({}).lean();
  const settingsObj = settings.reduce((acc: any, curr: any) => {
    acc[curr.key] = curr.value;
    return acc;
  }, {});

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

  // No blocked fetching for tournaments here


  return (
    <div className="flex flex-col min-h-screen">
      <Hero
        galleryImages={settingsObj.galleryImages}
        galleryStyle={settingsObj.galleryStyle}
        galleryMode={settingsObj.galleryMode}
        slicedImageUrl={settingsObj.slicedImageUrl}
        mobileHeroUrl={settingsObj.mobileHeroUrl}
      />

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
      <Suspense fallback={
        <section className="py-20 bg-background relative overflow-hidden">
          <div className="container mx-auto px-4 text-center">
            <div className="h-8 w-64 bg-white/5 rounded mx-auto mb-4 animate-pulse" />
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-32 bg-white/5 rounded-xl animate-pulse" />
              ))}
            </div>
          </div>
        </section>
      }>
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

            <UpcomingTournaments />

            <div className="mt-10 text-center">
              <Link href="/tournaments">
                <Button variant="outline" size="lg">View All Tournaments</Button>
              </Link>
            </div>
          </div>
        </section>
      </Suspense>

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
              <Button asDiv size="lg" variant="neon" className="px-12 py-8 text-xl">
                Join Rioters Esports
              </Button>
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}
