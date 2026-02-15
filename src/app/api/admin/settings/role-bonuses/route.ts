import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Setting from "@/models/Setting";
import Player from "@/models/Player";
import { calculateOVR, ROLE_BONUSES_DEFAULT } from "@/lib/ovr-utils";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(request: NextRequest) {
    try {
        await connectDB();
        const setting = await Setting.findOne({ key: "roleBonuses" });
        // Merge saved settings with code defaults to ensure new keys appear
        const mergedBonuses = { ...ROLE_BONUSES_DEFAULT, ...(setting?.value || {}) };
        return NextResponse.json(mergedBonuses);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch role bonuses" }, { status: 500 });
    }
}

export async function PUT(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (session?.user?.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await connectDB();
        const body = await request.json(); // Expected: Record<string, number>

        // 1. Update Settings
        await Setting.findOneAndUpdate(
            { key: "roleBonuses" },
            { value: body },
            { upsert: true, new: true }
        );

        // 2. Trigger Partial Recalculation (or Full)
        // Since bonuses changed, ALL players' OVR might change.
        // We fetch all players, recalculate, and bulk save.
        // Helper to normalize category lookup (matches sync logic)
        // In a real app, this should be a shared utility or joined from Game model
        const games = await import("@/models/Game").then(m => m.default.find({}));
        const gameMap = new Map<string, string>();
        games.forEach((g: any) => {
            gameMap.set(g.title.toLowerCase(), g.category || "FPS");
            gameMap.set(g.slug.toLowerCase(), g.category || "FPS");
        });

        const getGameCategory = (gameName: string) => {
            if (!gameName) return "FPS";
            return gameMap.get(gameName.toLowerCase()) || "FPS";
        };

        const players = await Player.find({});

        const bulkOps = players.flatMap(player => {
            if (!player.games || !Array.isArray(player.games)) return [];

            // Recalculate OVR for each game profile
            player.games.forEach((game: any) => {
                const genre = getGameCategory(game.game);
                game.overall = calculateOVR(game.stats, game.role, body, genre);
            });

            return [{
                updateOne: {
                    filter: { _id: player._id },
                    update: { games: player.games }
                }
            }];
        });

        if (bulkOps.length > 0) {
            await Player.bulkWrite(bulkOps);
        }

        return NextResponse.json({ message: "Role bonuses updated and players recalculated", count: bulkOps.length });
    } catch (error: any) {
        return NextResponse.json({ error: error.message || "Failed to update role bonuses" }, { status: 500 });
    }
}
