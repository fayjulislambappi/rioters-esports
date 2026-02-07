import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import TeamApplication from "@/models/TeamApplication";
import Team from "@/models/Team";
import User from "@/models/User";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await connectDB();
        const applications = await TeamApplication.find({ status: "PENDING" })
            .populate("userId", "name email image")
            .populate("teamId", "name slug logo")
            .sort({ createdAt: -1 });

        return NextResponse.json(applications);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PATCH(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id, status } = await req.json();

        if (!id || !status) {
            return NextResponse.json({ error: "ID and Status required" }, { status: 400 });
        }

        await connectDB();

        const application = await TeamApplication.findById(id);
        if (!application) {
            return NextResponse.json({ error: "Application not found" }, { status: 404 });
        }

        application.status = status;
        await application.save();

        if (status === "APPROVED") {
            // Add member to the team
            await Team.findByIdAndUpdate(application.teamId, {
                $addToSet: { members: application.userId }
            });

            // Update user's teamId
            await User.findByIdAndUpdate(application.userId, {
                teamId: application.teamId,
                role: "TEAM_MANAGER" // Optional: Promote to manager or keep as user
            });
        }

        return NextResponse.json({ success: true, application });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
