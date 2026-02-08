import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import Team from "@/models/Team";
import User from "@/models/User";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        await connectDB();
        const team = await Team.findById(id).populate('captainId', 'name email').populate('members', 'name email image role');

        if (!team) {
            return NextResponse.json({ error: "Team not found" }, { status: 404 });
        }

        // Filter out null members (e.g. if a user was deleted)
        const teamObj = team.toObject();
        if (teamObj.members) {
            teamObj.members = teamObj.members.filter((m: any) => m !== null);
        }

        return NextResponse.json(teamObj);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PUT(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const body = await req.json();

        if (body.captainId === "") {
            body.captainId = null;
        }

        await connectDB();
        const team = await Team.findByIdAndUpdate(id, body, { new: true });

        if (!team) {
            return NextResponse.json({ error: "Team not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, team });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;

        await connectDB();
        const team = await Team.findByIdAndDelete(id);

        if (!team) {
            return NextResponse.json({ error: "Team not found" }, { status: 404 });
        }

        return NextResponse.json({ message: "Team deleted successfully" });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
