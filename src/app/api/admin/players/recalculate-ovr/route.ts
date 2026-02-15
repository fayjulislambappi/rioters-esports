import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Player from "@/models/Player";
import Setting from "@/models/Setting";
import { calculateOVR, ROLE_BONUSES_DEFAULT } from "@/lib/ovr-utils";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (session?.user?.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await connectDB();

        // 1. Fetch generic Role Bonuses
        const roleBonusSetting = await Setting.findOne({ key: "roleBonuses" });
        const roleBonuses = roleBonusSetting?.value || ROLE_BONUSES_DEFAULT;

        // 2. Fetch all games to determine categories
        const Game = (await import("@/models/Game")).default;
        const games = await Game.find({});
        const gameCategoryMap = new Map();
        games.forEach((g: any) => gameCategoryMap.set(g.title, g.category));

        // 3. Fetch all players
        const players = await Player.find({});

        let updatedCount = 0;

        // 4. Recalculate OVR for each player
        for (const player of players) {
            let changed = false;

            // Recalculate for each game profile
            if (player.games && player.games.length > 0) {
                player.games = player.games.map((profile: any) => {
                    const newOvr = calculateOVR(
                        profile.stats,
                        profile.role,
                        roleBonuses,
                        gameCategoryMap.get(profile.game) || "FPS"
                    );

                    if (newOvr !== profile.overall) {
                        changed = true;
                        return { ...profile, overall: newOvr };
                    }
                    return profile;
                });
            }

            if (changed) {
                await player.save();
                updatedCount++;
            }
        }

        return NextResponse.json({
            success: true,
            message: `Processed ${players.length} players. Updated ${updatedCount}.`,
            stats: {
                total: players.length,
                updated: updatedCount
            }
        });

    } catch (error: any) {
        console.error("OVR Recalculation Error:", error);
        return NextResponse.json({ error: error.message || "Failed to recalculate OVRs" }, { status: 500 });
    }
}
