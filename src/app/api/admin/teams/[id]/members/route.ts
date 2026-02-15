import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import Team from "@/models/Team";
import User from "@/models/User";
import mongoose from "mongoose";

export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || (session.user.role !== "ADMIN" && !session.user.roles?.includes("ADMIN"))) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const { userId, role } = await req.json();

        if (!userId || !role) {
            return NextResponse.json({ error: "User ID and Role are required" }, { status: 400 });
        }

        await connectDB();

        const team = await Team.findById(id);
        if (!team) return NextResponse.json({ error: "Team not found" }, { status: 404 });

        const user = await User.findById(userId);
        if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

        // Strict Role Check: If proposed role is CAPTAIN or ADMIN, verify they aren't already that in another team
        if (role === "CAPTAIN" || role === "ADMIN") {
            const isAlreadyThatRole = user.teams?.some((t: any) => t.role === role && t.teamId.toString() !== id);
            if (isAlreadyThatRole) {
                return NextResponse.json({
                    error: `User is already a ${role === "CAPTAIN" ? "Captain" : "Admin"} of another team.`
                }, { status: 400 });
            }
        }

        // Check if user is already in this team
        const existingTeamEntry = user.teams.find((t: any) => t.teamId.toString() === id);

        if (existingTeamEntry) {
            // IF ALREADY IN TEAM: Update their role instead of erroring
            await User.updateOne(
                { _id: userId, "teams.teamId": id },
                { $set: { "teams.$.role": role } }
            );

            // Sync Team Captain if role is set to CAPTAIN
            if (role === "CAPTAIN") {
                await Team.findByIdAndUpdate(id, { captainId: userId });
            } else if (team.captainId?.toString() === userId && role !== "CAPTAIN") {
                // If they WERE captain but now demoted
                await Team.findByIdAndUpdate(id, { captainId: null });
            }
        } else {
            // Check Roster Limits for NEW members
            const { getGameRosterLimit } = require("@/lib/game-config");
            const limits = getGameRosterLimit(team.gameFocus);
            const currentTotal = (team.members || []).length;

            if (currentTotal >= limits.maxTotal) {
                return NextResponse.json({
                    error: `This team is already full. Maximum players for ${team.gameFocus} is ${limits.maxTotal}.`
                }, { status: 400 });
            }
            // IF NEW TO TEAM: (Remove the game-focus restriction as per requested logic which allows multiple teams)
            /*
            const existingTeamForGame = user.teams.find((t: any) => t.game === team.gameFocus);
            if (existingTeamForGame) {
                return NextResponse.json({
                    error: `User is already in a team for ${team.gameFocus}. They must leave that team first.`
                }, { status: 400 });
            }
            */

            // Add to Team
            await Team.findByIdAndUpdate(id, {
                $addToSet: { members: userId }
            });

            // Add to User
            await User.findByIdAndUpdate(userId, {
                $push: {
                    teams: {
                        teamId: team._id,
                        game: team.gameFocus,
                        role: role
                    }
                }
            });

            // Sync Team Captain if role is set to CAPTAIN
            if (role === "CAPTAIN") {
                await Team.findByIdAndUpdate(id, { captainId: userId });
            }
        }

        // Final step: Sync user's primary role badge
        const refetchedUser = await User.findById(userId);
        if (refetchedUser) {
            const hasTeams = refetchedUser.teams && refetchedUser.teams.length > 0;
            const hasAnyCaptainRole = refetchedUser.teams.some((t: any) => t.role === "CAPTAIN");
            const hasAnyAdminRole = refetchedUser.teams.some((t: any) => t.role === "ADMIN");

            const newRoles = [...(refetchedUser.roles || [])];

            // Sync TEAM_MEMBER
            if (hasTeams && !newRoles.includes("TEAM_MEMBER")) newRoles.push("TEAM_MEMBER");
            else if (!hasTeams && newRoles.includes("TEAM_MEMBER")) {
                const i = newRoles.indexOf("TEAM_MEMBER");
                newRoles.splice(i, 1);
            }

            // Sync TEAM_CAPTAIN
            if (hasAnyCaptainRole && !newRoles.includes("TEAM_CAPTAIN")) newRoles.push("TEAM_CAPTAIN");
            else if (!hasAnyCaptainRole && newRoles.includes("TEAM_CAPTAIN")) {
                const i = newRoles.indexOf("TEAM_CAPTAIN");
                if (i > -1) newRoles.splice(i, 1);
            }

            // Sync TEAM_ADMIN
            if (hasAnyAdminRole && !newRoles.includes("TEAM_ADMIN")) newRoles.push("TEAM_ADMIN");
            else if (!hasAnyAdminRole && newRoles.includes("TEAM_ADMIN")) {
                const i = newRoles.indexOf("TEAM_ADMIN");
                if (i > -1) newRoles.splice(i, 1);
            }

            if (newRoles.length === 0) newRoles.push("USER");

            const precedence = ["ADMIN", "TEAM_ADMIN", "TEAM_CAPTAIN", "TEAM_MEMBER", "PLAYER", "TOURNAMENT_PARTICIPANT", "USER"];
            const primaryRole = precedence.find(r => newRoles.includes(r as any)) || "USER";

            await User.findByIdAndUpdate(userId, {
                $set: { roles: newRoles, role: primaryRole }
            });
        }

        return NextResponse.json({ success: true });

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
        if (!session || (session.user.role !== "ADMIN" && !session.user.roles?.includes("ADMIN"))) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get("userId");

        if (!userId) {
            return NextResponse.json({ error: "User ID is required" }, { status: 400 });
        }

        await connectDB();

        const team = await Team.findById(id);
        if (!team) return NextResponse.json({ error: "Team not found" }, { status: 404 });

        // Remove from Team
        await Team.findByIdAndUpdate(id, {
            $pull: { members: userId }
        });

        // Remove from User
        const updatedUser = await User.findByIdAndUpdate(userId, {
            $pull: { teams: { teamId: id } }
        }, { new: true });

        // If user has no teams left, update their roles
        if (updatedUser) {
            const hasTeams = updatedUser.teams && updatedUser.teams.length > 0;
            const hasAnyCaptainRole = updatedUser.teams.some((t: any) => t.role === "CAPTAIN");

            const newRoles = [...(updatedUser.roles || [])];

            // Sync TEAM_MEMBER
            if (hasTeams && !newRoles.includes("TEAM_MEMBER")) newRoles.push("TEAM_MEMBER");
            else if (!hasTeams && newRoles.includes("TEAM_MEMBER")) {
                const i = newRoles.indexOf("TEAM_MEMBER");
                newRoles.splice(i, 1);
            }

            // Sync TEAM_CAPTAIN
            if (hasAnyCaptainRole && !newRoles.includes("TEAM_CAPTAIN")) newRoles.push("TEAM_CAPTAIN");
            else if (!hasAnyCaptainRole && newRoles.includes("TEAM_CAPTAIN")) {
                const i = newRoles.indexOf("TEAM_CAPTAIN");
                newRoles.splice(i, 1);
            }

            if (newRoles.length === 0) newRoles.push("USER");

            const precedence = ["ADMIN", "TEAM_CAPTAIN", "TEAM_MEMBER", "PLAYER", "TOURNAMENT_PARTICIPANT", "USER"];
            const primaryRole = precedence.find(r => newRoles.includes(r as any)) || "USER";

            await User.findByIdAndUpdate(userId, {
                $set: { roles: newRoles, role: primaryRole }
            });

            // If they were the team captain, clear the Team.captainId
            if (team.captainId?.toString() === userId) {
                await Team.findByIdAndUpdate(id, { captainId: null });
            }
        }

        return NextResponse.json({ success: true });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
