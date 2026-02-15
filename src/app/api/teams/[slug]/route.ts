import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import Team from "@/models/Team";
import TeamApplication from "@/models/TeamApplication";
import Player from "@/models/Player";

export async function GET(req: Request, props: { params: Promise<{ slug: string }> }) {
    const params = await props.params;
    const { slug } = params;
    try {
        await connectDB();

        const team = await Team.findOne({ slug })
            .populate({
                path: "members",
                select: "name image role roles teams playerId",
                populate: {
                    path: "playerId",
                    select: "games ign"
                }
            })
            .populate("captainId", "name image")
            .lean();

        if (!team) {
            return NextResponse.json({ error: "Team not found" }, { status: 404 });
        }

        // Fetch player data by IGN from lineup and substitutes
        const allIGNs = [
            ...(team.lineup || []).map(p => p.ign),
            ...(team.substitutes || []).map(p => p.ign)
        ];

        const players = await Player.find({ ign: { $in: allIGNs } }).lean();

        // Create a map of IGN -> Player data
        const playerMap = new Map(players.map(p => [p.ign, p]));

        // Merge player data into members
        const enrichedMembers = team.members.map((member: any) => {
            // Try to find player data by IGN (check if member has a matching IGN in lineup/subs)
            const matchingLineup = team.lineup?.find(l => l.userId?.toString() === member._id.toString());
            const matchingSub = team.substitutes?.find(s => s.userId?.toString() === member._id.toString());
            const ign = matchingLineup?.ign || matchingSub?.ign;

            if (ign && playerMap.has(ign)) {
                return {
                    ...member,
                    playerData: playerMap.get(ign)
                };
            }
            return member;
        });

        team.members = enrichedMembers;

        // Check if current user has applied
        const session = await getServerSession(authOptions);
        let hasApplied = false;

        if (session?.user?.id) {
            const application = await TeamApplication.findOne({
                teamId: team._id,
                userId: session.user.id,
                status: "PENDING"
            });
            hasApplied = !!application;
        }

        return NextResponse.json({
            ...team,
            hasApplied
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
