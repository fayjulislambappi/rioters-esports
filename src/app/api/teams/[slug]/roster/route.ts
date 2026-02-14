import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import Team from "@/models/Team";

export async function PUT(req: Request, props: { params: Promise<{ slug: string }> }) {
    const params = await props.params;
    const { slug } = params;

    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user || !session.user.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await connectDB();
        const User = (await import("@/models/User")).default;

        const team = await Team.findOne({ slug });

        if (!team) {
            return NextResponse.json({ error: "Team not found" }, { status: 404 });
        }

        // Verify that the user is authorized:
        // 1. Admin bypass
        // 2. Primary captain check
        // 3. Team-specific captain role check
        const isAuthorized =
            session.user.role === "ADMIN" ||
            team.captainId?.toString() === session.user.id ||
            await User.findOne({
                _id: session.user.id,
                "teams": {
                    $elemMatch: {
                        teamId: team._id,
                        role: "CAPTAIN"
                    }
                }
            });

        if (!isAuthorized) {
            return NextResponse.json({ error: "Only the team captain or leader can manage the roster" }, { status: 403 });
        }

        const { lineup, substitutes } = await req.json();

        // Validation (Basic)
        if (!lineup || !Array.isArray(lineup)) {
            return NextResponse.json({ error: "Invalid lineup data" }, { status: 400 });
        }

        // Update the team
        team.lineup = lineup.map((p: any) => ({
            ign: p.ign?.trim(),
            discord: p.discord?.trim(),
            userId: p.userId || null
        })).filter(p => p.ign);

        if (substitutes && Array.isArray(substitutes)) {
            team.substitutes = substitutes.map((p: any) => ({
                ign: p.ign?.trim(),
                discord: p.discord?.trim(),
                userId: p.userId || null
            })).filter(p => p.ign);
        }

        await team.save();

        // Populate members for the frontend
        const populatedTeam = await Team.findById(team._id)
            .populate("members", "name image email teams roles")
            .lean();

        return NextResponse.json({ success: true, team: populatedTeam });
    } catch (error: any) {
        console.error("Roster Update Error:", error);
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
}
