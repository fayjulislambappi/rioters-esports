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
            p2_ign, p2_discord,
            p3_ign, p3_discord,
            p4_ign, p4_discord,
            p5_ign, p5_discord
        } = body;

        // Basic Validation
        if (!name || !slug || !gameFocus || !captainDiscord || !captainIgn) {
            return NextResponse.json({ error: "Name, Slug, Game Focus, Captain Discord, and Captain IGN are required." }, { status: 400 });
        }

        // Game Specific Validation (5v5 Roster)
        const is5v5 = gameFocus === "Valorant" || gameFocus === "Counter-Strike 2" || gameFocus === "CS2";
        if (is5v5) {
            if (!captainIgn) {
                return NextResponse.json({
                    error: `Captain IGN is required for ${gameFocus}.`
                }, { status: 400 });
            }
            if (!p2_ign || !p2_discord || !p3_ign || !p3_discord || !p4_ign || !p4_discord || !p5_ign || !p5_discord) {
                return NextResponse.json({
                    error: `For ${gameFocus}, a full starting lineup (Player 2-5) with Discord IDs is required.`
                }, { status: 400 });
            }

        }

        // Check for duplicate name or slug
        const existingTeam = await Team.findOne({
            $or: [{ name: name }, { slug: slug }]
        });

        if (existingTeam) {
            return NextResponse.json({ error: "Team name or handle already taken." }, { status: 400 });
        }

        // Prepare Substitutes
        const substitutes = [];
        if (sub1_ign && sub1_ign.trim()) substitutes.push({ ign: sub1_ign.trim(), discord: sub1_discord?.trim() });
        if (sub2_ign && sub2_ign.trim()) substitutes.push({ ign: sub2_ign.trim(), discord: sub2_discord?.trim() });

        // Prepare Lineup (Captain + 4 others)
        const lineup = [];
        if (captainIgn && captainIgn.trim()) lineup.push({ ign: captainIgn.trim(), discord: captainDiscord.trim() });
        // Lineup logic remains for display, but real member links are handled below

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
