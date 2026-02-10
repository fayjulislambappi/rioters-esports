import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import Team from "@/models/Team";
import User from "@/models/User";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session || (session.user.role !== "ADMIN" && !session.user.roles?.includes("ADMIN"))) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await connectDB();
        const teams = await Team.find({}).sort({ createdAt: -1 });
        return NextResponse.json(teams);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || (session.user.role !== "ADMIN" && !session.user.roles?.includes("ADMIN"))) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json({ error: "Team ID required" }, { status: 400 });
        }

        await connectDB();

        // 1. Get the team to find all members
        const team = await Team.findById(id);
        if (!team) {
            return NextResponse.json({ error: "Team not found" }, { status: 404 });
        }

        // 2. Clean up all members
        if (team.members && team.members.length > 0) {
            const memberIds = team.members;

            // Remove team from all members' teams array
            await User.updateMany(
                { _id: { $in: memberIds } },
                { $pull: { teams: { teamId: id } } }
            );

            // Recalculate roles for all affected members
            for (const memberId of memberIds) {
                const user = await User.findById(memberId);
                if (user) {
                    const hasTeams = user.teams && user.teams.length > 0;
                    const hasAnyCaptainRole = user.teams.some((t: any) => t.role === "CAPTAIN");

                    const newRoles = [...(user.roles || [])];

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

                    await User.findByIdAndUpdate(memberId, {
                        $set: { roles: newRoles, role: primaryRole }
                    });
                }
            }
        }

        // 3. Delete the team
        await Team.findByIdAndDelete(id);

        return NextResponse.json({ message: "Team deleted successfully" });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || (session.user.role !== "ADMIN" && !session.user.roles?.includes("ADMIN"))) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();

        if (body.captainId === "") {
            body.captainId = null;
        }

        await connectDB();

        if (!body.slug && body.name) {
            body.slug = body.name.toLowerCase().replace(/ /g, "-").replace(/[^\w-]+/g, "");
        }

        const team = await Team.create(body);

        // SYNC USER ROLE IF CAPTAIN IS ASSIGNED
        if (body.captainId) {
            // Check if user is already a captain
            const proposedCaptain = await User.findById(body.captainId);
            if (!proposedCaptain) {
                return NextResponse.json({ error: "Captain user not found" }, { status: 404 });
            }
            if (proposedCaptain.teams?.some((t: any) => t.role === "CAPTAIN")) {
                return NextResponse.json({ error: "Selected user is already a Captain of another team." }, { status: 400 });
            }

            // Add to team members
            await Team.findByIdAndUpdate(team._id, {
                $addToSet: { members: body.captainId }
            });

            // Update user's teams and primary role
            await User.findByIdAndUpdate(body.captainId, {
                $addToSet: {
                    teams: {
                        teamId: team._id,
                        game: team.gameFocus,
                        role: "CAPTAIN"
                    },
                    roles: { $each: ["TEAM_MEMBER", "TEAM_CAPTAIN"] }
                },
                $set: { role: "TEAM_CAPTAIN" }
            });
        }

        return NextResponse.json({ success: true, team });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || (session.user.role !== "ADMIN" && !session.user.roles?.includes("ADMIN") && !session.user.roles?.includes("SUPER_ADMIN"))) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { id, status, ...updateData } = body;

        await connectDB();

        // 1. STATUS UPDATE (APPROVE/REJECT)
        if (id && status) {
            if (!["APPROVED", "REJECTED", "PENDING"].includes(status)) {
                return NextResponse.json({ error: "Invalid status" }, { status: 400 });
            }
            const team = await Team.findByIdAndUpdate(id, { status }, { new: true });
            return NextResponse.json({ success: true, team });
        }

        // 2. GENERAL UPDATE (EXISTING LOGIC)
        if (!id) {
            return NextResponse.json({ error: "Team ID required" }, { status: 400 });
        }

        // Get old team data to check if captain changed
        const oldTeam = await Team.findById(id);
        if (!oldTeam) return NextResponse.json({ error: "Team not found" }, { status: 404 });

        const team = await Team.findByIdAndUpdate(id, updateData, { new: true });

        // HANDLE CAPTAIN CHANGE CLEANUP
        if (updateData.captainId && oldTeam.captainId && updateData.captainId !== oldTeam.captainId.toString()) {
            const oldCaptainId = oldTeam.captainId;

            // 1. Update old captain's team role to MEMBER in their User profile
            await User.updateOne(
                { _id: oldCaptainId, "teams.teamId": id },
                { $set: { "teams.$.role": "MEMBER" } }
            );

            // 2. Recalculate roles for old captain
            const oldUser = await User.findById(oldCaptainId);
            if (oldUser) {
                const hasAnyCaptainRole = oldUser.teams.some((t: any) => t.role === "CAPTAIN");
                const newRoles = [...(oldUser.roles || [])];

                if (!hasAnyCaptainRole && newRoles.includes("TEAM_CAPTAIN")) {
                    const i = newRoles.indexOf("TEAM_CAPTAIN");
                    newRoles.splice(i, 1);
                }

                if (newRoles.length === 0) newRoles.push("USER");
                const precedence = ["ADMIN", "TEAM_CAPTAIN", "TEAM_MEMBER", "PLAYER", "TOURNAMENT_PARTICIPANT", "USER"];
                const primaryRole = precedence.find(r => newRoles.includes(r as any)) || "USER";

                await User.findByIdAndUpdate(oldCaptainId, {
                    $set: { roles: newRoles, role: primaryRole }
                });
            }
        }

        // ALWAYS ENSURE CAPTAIN IS IN MEMBERS LIST
        if (updateData.captainId || oldTeam.captainId) {
            const currentCaptainId = updateData.captainId || oldTeam.captainId;

            // Strict Role Check: If setting a NEW captain, verify they aren't already a captain
            if (updateData.captainId && updateData.captainId !== oldTeam.captainId?.toString()) {
                const proposedCaptain = await User.findById(updateData.captainId);
                if (proposedCaptain?.teams?.some((t: any) => t.role === "CAPTAIN")) {
                    return NextResponse.json({ error: "Selected user is already a Captain of another team." }, { status: 400 });
                }
            }

            await Team.findByIdAndUpdate(id, {
                $addToSet: { members: currentCaptainId }
            });

            if (currentCaptainId) {
                // Check if user already has this team entry
                const targetUser = await User.findById(currentCaptainId);
                const hasTeam = targetUser?.teams?.some((t: any) => t.teamId.toString() === id);

                if (hasTeam) {
                    // Update existing entry to CAPTAIN
                    await User.updateOne(
                        { _id: currentCaptainId, "teams.teamId": id },
                        {
                            $set: { "teams.$.role": "CAPTAIN" },
                            $addToSet: { roles: { $each: ["TEAM_MEMBER", "TEAM_CAPTAIN"] } }
                        }
                    );
                } else {
                    // Add new entry as CAPTAIN
                    await User.findByIdAndUpdate(currentCaptainId, {
                        $addToSet: {
                            teams: {
                                teamId: id,
                                game: team?.gameFocus,
                                role: "CAPTAIN"
                            },
                            roles: { $each: ["TEAM_MEMBER", "TEAM_CAPTAIN"] }
                        }
                    });
                }

                // Recalculate primary role for the new captain
                const finalUser = await User.findById(currentCaptainId);
                if (finalUser) {
                    const precedence = ["ADMIN", "TEAM_CAPTAIN", "TEAM_MEMBER", "PLAYER", "TOURNAMENT_PARTICIPANT", "USER"];
                    const primaryRole = precedence.find(r => finalUser.roles.includes(r as any)) || "USER";
                    await User.findByIdAndUpdate(currentCaptainId, { $set: { role: primaryRole } });
                }
            }
        }

        return NextResponse.json({ success: true, team });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
