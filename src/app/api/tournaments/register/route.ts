import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import Tournament from "@/models/Tournament";
import Team from "@/models/Team";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { tournamentId, teamId } = await req.json();

        if (!tournamentId || !teamId) {
            return NextResponse.json({ error: "Missing tournamentId or teamId" }, { status: 400 });
        }

        await connectDB();

        // 1. Verify Team Ownership
        const team = await Team.findById(teamId);
        if (!team) {
            return NextResponse.json({ error: "Team not found" }, { status: 404 });
        }

        // Ensure the current user is the captain of the team
        if (team.captainId.toString() !== session.user.id) {
            return NextResponse.json({ error: "Only the team captain can register for tournaments" }, { status: 403 });
        }

        // 2. Check if the team is BANNED
        if (team.isBanned) {
            return NextResponse.json({
                error: "This team is currently banned and cannot participate in tournaments."
            }, { status: 403 });
        }

        // 3. Verify Tournament Availability
        const tournament = await Tournament.findById(tournamentId);
        if (!tournament) {
            return NextResponse.json({ error: "Tournament not found" }, { status: 404 });
        }

        if (tournament.status !== "UPCOMING") {
            return NextResponse.json({ error: "Tournament is not open for registration" }, { status: 400 });
        }

        if (tournament.registeredTeams.length >= tournament.maxTeams) {
            return NextResponse.json({ error: "Tournament is full" }, { status: 400 });
        }

        // Check if already registered
        const isAlreadyRegistered = tournament.registeredTeams.some(
            (tId) => tId.toString() === teamId
        );

        if (isAlreadyRegistered) {
            return NextResponse.json({ error: "Team is already registered" }, { status: 400 });
        }

        // 3. Register Team
        tournament.registeredTeams.push(teamId);
        await tournament.save();

        return NextResponse.json({ message: "Successfully registered for the tournament" }, { status: 200 });

    } catch (error: any) {
        console.error("Registration error:", error);
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
}
