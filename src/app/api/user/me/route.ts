import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import User from "@/models/User";
import Team from "@/models/Team"; // Import Team model to populate if needed

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user || !session.user.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await connectDB();

        let user = await User.findById(session.user.id)
            .populate("teams.teamId", "name slug logo")
            .lean();

        if (!user) {
            console.log("User not found for session ID:", session.user.id);
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // --- AUTO-SYNC LOGIC ---
        // Find all teams where this user is a member
        const userTeamsFromDB = await Team.find({ members: session.user.id });

        const existingTeamIds = new Set(user?.teams?.map((t: any) => t.teamId?._id?.toString() || t.teamId?.toString()));
        let needsSync = false;
        const newTeamsToPush: any[] = [];

        for (const team of userTeamsFromDB) {
            if (!existingTeamIds.has(team._id.toString())) {
                const isCaptain = team.captainId?.toString() === session.user.id;
                newTeamsToPush.push({
                    teamId: team._id,
                    game: team.gameFocus,
                    role: isCaptain ? "CAPTAIN" : "MEMBER"
                });
                needsSync = true;
            }
        }

        if (needsSync) {
            console.log(`Syncing ${newTeamsToPush.length} missing teams for user ${user.name}`);
            const updatedUser = await User.findByIdAndUpdate(
                session.user.id,
                { $push: { teams: { $each: newTeamsToPush } } },
                { new: true }
            ).populate("teams.teamId", "name slug logo").lean();

            if (updatedUser) {
                user = updatedUser;
            }
        }

        // --- MULTI-ROLE MIGRATION & SYNC ---
        let rolesChanged = false;
        const currentRoles = user.roles || [];
        const newRoles = [...currentRoles];

        // 1. Migration: if roles array is empty but legacy role exists
        if (newRoles.length === 0 && user.role) {
            newRoles.push(user.role as any);
            rolesChanged = true;
        }

        // 2. Team-based Sync: Ensure TEAM_MEMBER and TEAM_CAPTAIN are presence-accurate
        const hasTeams = user.teams && user.teams.length > 0;
        const hasCaptainRole = user.teams?.some((t: any) => t.role === "CAPTAIN");

        // Sync TEAM_MEMBER
        if (hasTeams && !newRoles.includes("TEAM_MEMBER")) {
            newRoles.push("TEAM_MEMBER");
            rolesChanged = true;
        } else if (!hasTeams && newRoles.includes("TEAM_MEMBER")) {
            const index = newRoles.indexOf("TEAM_MEMBER");
            newRoles.splice(index, 1);
            rolesChanged = true;
        }

        // Sync TEAM_CAPTAIN
        if (hasCaptainRole && !newRoles.includes("TEAM_CAPTAIN")) {
            newRoles.push("TEAM_CAPTAIN");
            rolesChanged = true;
        } else if (!hasCaptainRole && newRoles.includes("TEAM_CAPTAIN")) {
            const index = newRoles.indexOf("TEAM_CAPTAIN");
            newRoles.splice(index, 1);
            rolesChanged = true;
        }

        // 3. Ensure USER role if no specialized roles
        if (newRoles.length === 0) {
            newRoles.push("USER");
            rolesChanged = true;
        }

        if (rolesChanged) {
            // Update primary role field for backup compatibility (highest precedence)
            const precedence = ["ADMIN", "TEAM_CAPTAIN", "TEAM_MEMBER", "PLAYER", "TOURNAMENT_PARTICIPANT", "USER"];
            const primaryRole = precedence.find(r => newRoles.includes(r as any)) || "USER";

            const updatedUser = await User.findByIdAndUpdate(
                session.user.id,
                { $set: { roles: newRoles, role: primaryRole } },
                { new: true }
            ).populate("teams.teamId", "name slug logo").lean();

            if (updatedUser) {
                user = updatedUser;
            }
        }
        // --- END MULTI-ROLE ---
        // --- END AUTO-SYNC ---

        return NextResponse.json(user);

    } catch (error) {
        console.error("Error fetching user:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function PATCH(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user || !session.user.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { name, image } = body;

        if (!name && !image) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        await connectDB();

        const updateData: any = {};
        if (name) updateData.name = name;
        if (image) updateData.image = image;

        const updatedUser = await User.findByIdAndUpdate(
            session.user.id,
            { $set: updateData },
            { new: true }
        ).lean();

        if (!updatedUser) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        return NextResponse.json(updatedUser);

    } catch (error) {
        console.error("Error updating user:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
