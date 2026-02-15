
import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Team from "@/models/Team";
import Player from "@/models/Player";

export async function GET() {
    try {
        await connectDB();
        const slug = "rioters-esports";

        // Ensure models are registered
        const _p = Player;

        const team = await Team.findOne({ slug })
            .populate("members", "name ign games")
            .lean();

        if (!team) {
            return NextResponse.json({ error: "Team not found" });
        }

        return NextResponse.json({
            gameFocus: team.gameFocus,
            members: team.members
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message });
    }
}
