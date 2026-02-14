import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import Team from "@/models/Team";
import TeamApplication from "@/models/TeamApplication";

export async function GET(req: Request, props: { params: Promise<{ slug: string }> }) {
    const params = await props.params;
    const { slug } = params;
    try {
        await connectDB();

        const team = await Team.findOne({ slug })
            .populate("members", "name image role roles teams")
            .populate("captainId", "name image")
            .lean();

        if (!team) {
            return NextResponse.json({ error: "Team not found" }, { status: 404 });
        }

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
