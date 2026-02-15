import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Player from "@/models/Player";
import Setting from "@/models/Setting";
import { calculateOVR, ROLE_BONUSES_DEFAULT } from "@/lib/ovr-utils";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        await connectDB();
        const { id } = await params;
        const player = await Player.findById(id);
        if (!player) {
            return NextResponse.json({ error: "Player not found" }, { status: 404 });
        }
        return NextResponse.json(player);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch player" }, { status: 500 });
    }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getServerSession(authOptions);
        if (session?.user?.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await connectDB();
        const body = await request.json();

        // 1. Fetch Role Bonuses
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

        const { id } = await params;
        const updatedPlayer = await Player.findByIdAndUpdate(
            id,
            { ...body, games: processedGames },
            { new: true, runValidators: true }
        );

        if (!updatedPlayer) {
            return NextResponse.json({ error: "Player not found" }, { status: 404 });
        }

        // If a userId was provided, link the User to this Player too
        if (body.userId) {
            const User = (await import("@/models/User")).default;
            await User.findByIdAndUpdate(body.userId, { $set: { playerId: updatedPlayer._id } });
        }

        return NextResponse.json(updatedPlayer);
    } catch (error: any) {
        return NextResponse.json({ error: error.message || "Failed to update player" }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getServerSession(authOptions);
        if (session?.user?.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await connectDB();
        const { id } = await params;
        const deletedPlayer = await Player.findByIdAndDelete(id);

        if (!deletedPlayer) {
            return NextResponse.json({ error: "Player not found" }, { status: 404 });
        }

        return NextResponse.json({ message: "Player deleted successfully" });
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete player" }, { status: 500 });
    }
}
// Force rebuild for schema update
