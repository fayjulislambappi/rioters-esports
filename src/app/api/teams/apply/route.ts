import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import TeamApplication from "@/models/TeamApplication";
import Team from "@/models/Team";
import User from "@/models/User";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "You must be logged in to apply" }, { status: 401 });
        }

        const { teamId, message, data } = await req.json();

        if (!teamId) {
            return NextResponse.json({ error: "Team ID is required" }, { status: 400 });
        }

        await connectDB();

        // Check if already applied
        const existingApp = await TeamApplication.findOne({
            userId: session.user.id,
            teamId,
            status: "PENDING"
        });

        if (existingApp) {
            return NextResponse.json({ error: "You already have a pending application for this team" }, { status: 400 });
        }

        // Check if user is already in a team for this game
        const team = await Team.findById(teamId);
        if (!team) return NextResponse.json({ error: "Team not found" }, { status: 404 });

        const user = await User.findById(session.user.id);
        const existingTeamForGame = user?.teams?.find((t: any) => t.game === team.gameFocus);

        if (existingTeamForGame) {
            return NextResponse.json({
                error: `You are already in a team for ${team.gameFocus}. You cannot apply to another team for this game.`
            }, { status: 400 });
        }

        const application = await TeamApplication.create({
            userId: session.user.id,
            teamId,
            message: message || "",
            status: "PENDING",
            data: data || {} // Optional data field
        });

        return NextResponse.json({ success: true, application });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
