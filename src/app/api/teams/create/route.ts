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

        // Check constraint: Can only be in ONE team per game
        const { gameFocus } = await req.json(); // We need gameFocus early for validation
        // Re-parse body
        const body = await req.clone().json();

        const existingTeamForGame = user.teams?.find((t: any) => t.game === gameFocus);

        if (existingTeamForGame) {
            return NextResponse.json({
                error: `You are already in a team for ${gameFocus}. You cannot create or join another team for this game.`
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
        if (!name || !slug || !gameFocus || !captainDiscord) {
            return NextResponse.json({ error: "Name, Slug, Game Focus, and Captain Discord are required." }, { status: 400 });
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
        if (captainIgn && captainIgn.trim()) lineup.push({ ign: captainIgn.trim(), discord: captainDiscord.trim() }); // Captain is first
        if (p2_ign && p2_ign.trim()) lineup.push({ ign: p2_ign.trim(), discord: p2_discord?.trim() });
        if (p3_ign && p3_ign.trim()) lineup.push({ ign: p3_ign.trim(), discord: p3_discord?.trim() });
        if (p4_ign && p4_ign.trim()) lineup.push({ ign: p4_ign.trim(), discord: p4_discord?.trim() });
        if (p5_ign && p5_ign.trim()) lineup.push({ ign: p5_ign.trim(), discord: p5_discord?.trim() });

        // Create Team
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
            members: [session.user.id] // Only the creator is a real member initially
        });

        // Update User
        // user.teamId = newTeam._id; // DEPRECATED
        if (!user.teams) user.teams = [];
        user.teams.push({
            teamId: newTeam._id,
            game: gameFocus,
            role: "CAPTAIN"
        });

        user.role = "TEAM_CAPTAIN"; // Update global role to captain if not already
        await user.save();

        return NextResponse.json(newTeam, { status: 201 });

    } catch (error) {
        console.error("Error creating team:", error);
        const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
