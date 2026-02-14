import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import Team from "@/models/Team";
import User from "@/models/User";

export async function POST(req: Request, props: { params: Promise<{ slug: string }> }) {
    try {
        const { slug } = await props.params;
        const session = await getServerSession(authOptions);

        if (!session || !session.user || !session.user.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await connectDB();

        const team = await Team.findOne({ slug });

        if (!team) {
            return NextResponse.json({ error: "Team not found" }, { status: 404 });
        }

        const userId = session.user.id;

        // Security check: Check if user is actually in the team
        if (!team.members.includes(userId as any)) {
            return NextResponse.json({ error: "You are not a member of this team" }, { status: 400 });
        }

        // Check if user is the captain
        if (team.captainId?.toString() === userId) {
            return NextResponse.json({
                error: "Captains cannot leave the team. Please transfer ownership or disband the team instead."
            }, { status: 400 });
        }

        // 1. Remove from Team.members
        team.members = team.members.filter(m => m.toString() !== userId);

        // 2. Remove from Team.lineup
        if (team.lineup) {
            team.lineup = team.lineup.filter(l => l.userId?.toString() !== userId);
        }

        // 3. Remove from Team.substitutes
        if (team.substitutes) {
            team.substitutes = team.substitutes.filter(s => s.userId?.toString() !== userId);
        }

        await team.save();

        // 4. Remove from User.teams
        await User.findByIdAndUpdate(userId, {
            $pull: { teams: { teamId: team._id } }
        });

        return NextResponse.json({
            success: true,
            message: "You have left the team successfully."
        });

    } catch (error: any) {
        console.error("Leave Team Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
