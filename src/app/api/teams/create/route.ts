import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import Team from "@/models/Team";
import User from "@/models/User";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user || !session.user.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await connectDB();

        // Check if user already has a team
        const user = await User.findById(session.user.id);
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Check constraint: Can only be in ONE team per game -> REMOVED
        // NEW CONSTRAINT: One user can have only ONE `CAPTAIN` role across ALL teams
        const body = await req.json();
        const { gameFocus } = body;

        const isAlreadyCaptain = user.teams?.some((t: any) => t.role === "CAPTAIN");

        if (isAlreadyCaptain) {
            return NextResponse.json({
                error: `You are already a Captain of another team. You cannot create a new team (as creators become captains).`
            }, { status: 400 });
        }

        const {
            name, slug, logo, description, recruiting,
            captainDiscord, captainIgn,
            sub1_ign, sub1_discord,
            sub2_ign, sub2_discord,
            sub3_ign, sub3_discord,
            sub4_ign, sub4_discord,
            sub5_ign, sub5_discord,
            sub6_ign, sub6_discord,
            sub7_ign, sub7_discord,
            p2_ign, p2_discord,
            p3_ign, p3_discord,
            p4_ign, p4_discord,
            p5_ign, p5_discord,
            p6_ign, p6_discord,
            p7_ign, p7_discord,
            p8_ign, p8_discord,
            p9_ign, p9_discord,
            p10_ign, p10_discord,
            p11_ign, p11_discord
        } = body;

        // Basic Validation
        if (!name || !slug || !gameFocus || !captainDiscord || !captainIgn) {
            return NextResponse.json({ error: "Name, Slug, Game Focus, Captain Discord, and Captain IGN are required." }, { status: 400 });
        }

        // Game Specific Validation
        const { getGameRosterLimit } = require("@/lib/game-config");
        const limits = getGameRosterLimit(gameFocus);

        // Prepare Lineup (Starting Players)
        const lineup = [];
        if (captainIgn && captainIgn.trim()) lineup.push({ ign: captainIgn.trim(), discord: captainDiscord.trim() });

        // Add other players based on limits (Starting lineup excluding captain)
        const playerKeys = [
            { ign: p2_ign, discord: p2_discord },
            { ign: p3_ign, discord: p3_discord },
            { ign: p4_ign, discord: p4_discord },
            { ign: p5_ign, discord: p5_discord },
            { ign: p6_ign, discord: p6_discord },
            { ign: p7_ign, discord: p7_discord },
            { ign: p8_ign, discord: p8_discord },
            { ign: p9_ign, discord: p9_discord },
            { ign: p10_ign, discord: p10_discord },
            { ign: p11_ign, discord: p11_discord }
        ];

        // Check required starters
        for (let i = 0; i < limits.starters - 1; i++) {
            const p = playerKeys[i];
            if (!p || !p.ign || !p.ign.trim() || !p.discord || !p.discord.trim()) {
                return NextResponse.json({
                    error: `For ${gameFocus}, a full starting lineup of ${limits.starters} players is required.`
                }, { status: 400 });
            }
            lineup.push({ ign: p.ign.trim(), discord: p.discord.trim() });
        }

        // Prepare Substitutes
        const substitutes = [];
        const subKeys = [
            { ign: sub1_ign, discord: sub1_discord },
            { ign: sub2_ign, discord: sub2_discord },
            { ign: sub3_ign, discord: sub3_discord },
            { ign: sub4_ign, discord: sub4_discord },
            { ign: sub5_ign, discord: sub5_discord },
            { ign: sub6_ign, discord: sub6_discord },
            { ign: sub7_ign, discord: sub7_discord }
        ];

        for (const s of subKeys) {
            if (s.ign && s.ign.trim()) {
                substitutes.push({ ign: s.ign.trim(), discord: s.discord?.trim() });
            }
        }

        if (substitutes.length > limits.maxSubstitutes) {
            return NextResponse.json({
                error: `For ${gameFocus}, you can have a maximum of ${limits.maxSubstitutes} substitutes.`
            }, { status: 400 });
        }

        // Check for duplicate name or slug
        const existingTeam = await Team.findOne({
            $or: [{ name: name }, { slug: slug }]
        });

        if (existingTeam) {
            return NextResponse.json({ error: "Team name or handle already taken." }, { status: 400 });
        }


        // 1. Create Team with PENDING status
        const newTeam = await Team.create({
            name,
            slug,
            gameFocus,
            captainDiscord,
            logo,
            description,
            recruiting: recruiting || false,
            substitutes,
            lineup,
            captainId: session.user.id,
            members: [session.user.id, ...(body.memberIds || [])], // Add captain and selected members
            status: "PENDING" // Default to PENDING
        });

        // 2. Update Captain's User Profile
        if (!user.teams) user.teams = [];
        user.teams.push({
            teamId: newTeam._id,
            game: gameFocus,
            role: "CAPTAIN"
        });

        // Update global roles for Captain
        if (user.roles && user.roles.includes("USER")) {
            user.roles = user.roles.filter((r: string) => r !== "USER");
        }
        if (!user.roles) user.roles = [];
        if (!user.roles.includes("TEAM_CAPTAIN")) {
            user.roles.push("TEAM_CAPTAIN");
        }
        // Legacy role update
        user.role = "TEAM_CAPTAIN";
        await user.save();

        // 3. Update Selected Members' User Profiles
        if (body.memberIds && body.memberIds.length > 0) {
            const memberIds = body.memberIds;
            await User.updateMany(
                { _id: { $in: memberIds } },
                {
                    $push: {
                        teams: {
                            teamId: newTeam._id,
                            game: gameFocus,
                            role: "MEMBER"
                        },
                        roles: "TEAM_MEMBER" // Add TEAM_MEMBER role logic needs to be careful not to dupe or leave USER if we want to be strict, but for now simple push is okay or we can do a more complex update.
                    }
                }
            );

            // Fetch and clean up USER role for these members (more robust)
            const members = await User.find({ _id: { $in: memberIds } });
            for (const member of members) {
                if (member.roles && member.roles.includes("USER")) {
                    member.roles = member.roles.filter((r: string) => r !== "USER");
                    await member.save();
                }
            }
        }

        await user.save();

        return NextResponse.json(newTeam, { status: 201 });

    } catch (error: any) {
        console.error("Team Creation Error:", error);
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
}
