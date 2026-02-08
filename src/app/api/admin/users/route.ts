import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import User from "@/models/User";

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await connectDB();

        const { searchParams } = new URL(req.url);
        const search = searchParams.get("search");

        let query = {};
        if (search) {
            query = {
                $or: [
                    { name: { $regex: search, $options: "i" } },
                    { email: { $regex: search, $options: "i" } }
                ]
            };
        }

        const users = await User.find(query).sort({ createdAt: -1 });
        return NextResponse.json(users);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json({ error: "User ID required" }, { status: 400 });
        }

        await connectDB();
        await User.findByIdAndDelete(id);

        return NextResponse.json({ message: "User deleted successfully" });
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

        const { id, isBanned, role, roles } = await req.json();

        if (!id) {
            return NextResponse.json({ error: "User ID required" }, { status: 400 });
        }

        const updateData: any = {};
        if (typeof isBanned !== "undefined") updateData.isBanned = isBanned;

        if (roles && Array.isArray(roles)) {
            updateData.roles = roles;
            // Sync primary role for backup compatibility
            const precedence = ["ADMIN", "TEAM_CAPTAIN", "TEAM_MEMBER", "PLAYER", "TOURNAMENT_PARTICIPANT", "USER"];
            updateData.role = precedence.find(r => roles.includes(r as any)) || "USER";
        } else if (role) {
            updateData.role = role;
            updateData.roles = [role];
        }

        await connectDB();
        const user = await User.findByIdAndUpdate(
            id,
            updateData,
            { new: true }
        );

        return NextResponse.json({ success: true, user });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
