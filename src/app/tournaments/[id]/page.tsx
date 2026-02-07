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
            // Find the team where the user is a member (includes captain)
            userTeam = await Team.findOne({ members: session.user.id })
                .populate("captainId", "name") // Populate captain name for display
                .lean();
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
