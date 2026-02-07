import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import TeamApplication from "@/models/TeamApplication";
import Team from "@/models/Team";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "You must be logged in to apply" }, { status: 401 });
        }

        const { teamId, message } = await req.json();

        if (!teamId || !message) {
            return NextResponse.json({ error: "Team ID and message are required" }, { status: 400 });
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

        const application = await TeamApplication.create({
            userId: session.user.id,
            teamId,
            message,
            status: "PENDING"
        });

        return NextResponse.json({ success: true, application });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
