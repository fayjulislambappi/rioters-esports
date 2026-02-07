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

        if (user.teamId) {
            return NextResponse.json({ error: "You are already in a team. Leave your current team to create a new one." }, { status: 400 });
        }

        const body = await req.json();
        const { name, slug, gameFocus, discord, logo, description, recruiting, sub1, sub2, p2, p3, p4, p5 } = body;

        // Basic Validation
        if (!name || !slug || !gameFocus || !discord) {
            return NextResponse.json({ error: "Name, Slug, Game Focus, and Discord are required." }, { status: 400 });
        }

        // Game Specific Validation (5v5 Roster)
        const is5v5 = gameFocus === "Valorant" || gameFocus === "Counter-Strike 2" || gameFocus === "CS2";
        if (is5v5) {
            if (!p2 || !p3 || !p4 || !p5 || !sub1 || !sub2) {
                return NextResponse.json({
                    error: `For ${gameFocus}, a full starting lineup (Player 2-5) and 2 substitutes are required.`
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
        if (sub1 && sub1.trim()) substitutes.push(sub1.trim());
        if (sub2 && sub2.trim()) substitutes.push(sub2.trim());

        // Prepare Lineup (Captain + 4 others)
        // Captain is implied as Player 1 (User), here we store the recruited IGNs
        const lineup = [];
        if (p2 && p2.trim()) lineup.push(p2.trim());
        if (p3 && p3.trim()) lineup.push(p3.trim());
        if (p4 && p4.trim()) lineup.push(p4.trim());
        if (p5 && p5.trim()) lineup.push(p5.trim());

        // Create Team
        const newTeam = await Team.create({
            name,
            slug,
            gameFocus,
            socials: { discord },
            logo,
            description,
            recruiting: recruiting || false,
            substitutes,
            lineup,
            captainId: session.user.id,
            members: [session.user.id] // Only the creator is a real member initially
        });

        // Update User
        user.teamId = newTeam._id;
        user.role = "TEAM_MANAGER"; // Upgrade role to manager/captain
        await user.save();

        return NextResponse.json(newTeam, { status: 201 });

    } catch (error) {
        console.error("Error creating team:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
