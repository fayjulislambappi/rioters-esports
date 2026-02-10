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

        const { id, status, role = "MEMBER" } = await req.json();

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
            // Fetch team to get game focus
            const team = await Team.findById(application.teamId);
            if (!team) {
                return NextResponse.json({ error: "Team not found" }, { status: 404 });
            }

            // Check if user is already in a team for this game
            const user = await User.findById(application.userId);
            if (!user) {
                return NextResponse.json({ error: "User not found" }, { status: 404 });
            }

            const existingTeamForGame = user.teams?.find((t: any) => t.game === team.gameFocus);

            if (existingTeamForGame) {
                return NextResponse.json({
                    error: `User is already in a team for ${team.gameFocus}. Cannot approve application.`
                }, { status: 400 });
            }

            // Add member to the team
            await Team.findByIdAndUpdate(application.teamId, {
                $addToSet: { members: application.userId }
            });

            // If role is CAPTAIN, update team captainId
            if (role === "CAPTAIN") {
                await Team.findByIdAndUpdate(application.teamId, {
                    captainId: application.userId
                });
            }

            // FETCH USER TO UPDATE
            const userToUpdate = await User.findById(application.userId);
            if (userToUpdate) {
                // Define roles to add
                const rolesToAdd: string[] = ["TEAM_MEMBER"];
                if (role === "CAPTAIN") {
                    rolesToAdd.push("TEAM_CAPTAIN");
                }

                // 1. Update roles: Remove USER, Add others
                if (userToUpdate.roles && userToUpdate.roles.includes("USER")) {
                    userToUpdate.roles = userToUpdate.roles.filter((r: string) => r !== "USER");
                }
                if (!userToUpdate.roles) userToUpdate.roles = []; // Initialize if null

                rolesToAdd.forEach((r: string) => {
                    if (!userToUpdate.roles.includes(r as any)) userToUpdate.roles.push(r as any);
                });

                // 2. Update teams array
                if (!userToUpdate.teams) userToUpdate.teams = [];
                userToUpdate.teams.push({
                    teamId: application.teamId,
                    game: team.gameFocus as string,
                    role: role as "MEMBER" | "CAPTAIN"
                });

                // 3. Update primary role
                const precedence = ["ADMIN", "TEAM_CAPTAIN", "TEAM_MEMBER", "PLAYER", "TOURNAMENT_PARTICIPANT", "USER"];
                const primaryRole = precedence.find(r => userToUpdate.roles.includes(r as any)) || "USER";
                userToUpdate.role = primaryRole;

                await userToUpdate.save();
            }
        }

        return NextResponse.json({ success: true, application });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
