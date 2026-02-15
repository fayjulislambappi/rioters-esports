import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Player from "@/models/Player";
import Setting from "@/models/Setting";
import { calculateOVR, ROLE_BONUSES_DEFAULT } from "@/lib/ovr-utils";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(request: NextRequest) {
    try {
        await connectDB();
        // Sorting by name since 'overall' is now per-game
        const players = await Player.find({}).sort({ name: 1 });
        return NextResponse.json(players);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch players" }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (session?.user?.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await connectDB();
        const body = await request.json();

        // 1. Fetch generic Role Bonuses
        const roleBonusSetting = await Setting.findOne({ key: "roleBonuses" });
        const roleBonuses = roleBonusSetting?.value || ROLE_BONUSES_DEFAULT;

        // 2. Fetch all games to determine categories
        const Game = (await import("@/models/Game")).default;
        const games = await Game.find({});
        const gameCategoryMap = new Map();
        games.forEach((g: any) => gameCategoryMap.set(g.title, g.category));

        // 3. Process Games array (calculate OVR for each profile)
        const processedGames = (body.games || []).map((profile: any) => ({
            ...profile,
            overall: calculateOVR(profile.stats, profile.role, roleBonuses, gameCategoryMap.get(profile.game) || "FPS")
        })).slice(0, 3); // Enforce max 3

        const slug = body.slug || body.ign.toLowerCase().replace(/[^a-z0-9]+/g, "-");

        const newPlayer = await Player.create({
            ...body,
            slug,
            games: processedGames
        });

        // If a userId was provided, link the User to this Player too
        if (body.userId) {
            const User = (await import("@/models/User")).default;
            await User.findByIdAndUpdate(body.userId, { $set: { playerId: newPlayer._id } });
        }

        return NextResponse.json(newPlayer, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message || "Failed to create player" }, { status: 500 });
    }
}
// Force rebuild for schema update
