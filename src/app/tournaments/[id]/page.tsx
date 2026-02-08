import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import Tournament from "@/models/Tournament";
import Team from "@/models/Team";
import TournamentDetailsClient from "./TournamentDetailsClient"; // Ensure this matches filename
import { notFound } from "next/navigation";

export default async function TournamentDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    await connectDB();

    try {
        const tournament = await Tournament.findById(id)
            .populate("gameId")
            .populate({
                path: "registeredTeams",
                select: "name logo members" // Select only needed fields
            })
            .lean();

        if (!tournament) return notFound();

        const session = await getServerSession(authOptions);
        let userTeam = null;

        if (session && session.user) {
            // Find ALL teams where user is a member
            const userTeams = await Team.find({ members: session.user.id })
                .populate("captainId", "name")
                .lean();

            // Select the team that matches the tournament's game
            // We assume tournament.gameId is populated and has a title/name that matches Team.gameFocus
            const gameTitle = (tournament.gameId as any).title || (tournament.gameId as any).name;

            // First try to find a team for this specific game
            userTeam = userTeams.find((t: any) => t.gameFocus === gameTitle);

            // If not found, but user has teams, maybe just pick the first one?
            // No, for strict rules, we should only return the relevant team.
            // If they don't have a team for this game, userTeam remains null.
        }

        // Serialization helper to convert _id and Date objects to strings
        const serialize = (obj: any): any => {
            return JSON.parse(JSON.stringify(obj));
        };

        return (
            <TournamentDetailsClient
                tournament={serialize(tournament)}
                userTeam={serialize(userTeam)}
                userId={session?.user?.id}
            />
        );
    } catch (error) {
        console.error("Error fetching tournament details:", error);
        return notFound();
    }
}
