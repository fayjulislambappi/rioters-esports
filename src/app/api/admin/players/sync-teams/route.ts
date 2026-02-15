import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Team from "@/models/Team";
import Player from "@/models/Player";
import User from "@/models/User";
import Game from "@/models/Game";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import mongoose from "mongoose";
import Setting from "@/models/Setting";
import { calculateOVR, ROLE_BONUSES_DEFAULT } from "@/lib/ovr-utils";

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (session?.user?.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await connectDB();

        // Fetch generic Role Bonuses
        const roleBonusSetting = await Setting.findOne({ key: "roleBonuses" });
        const roleBonuses = roleBonusSetting?.value || ROLE_BONUSES_DEFAULT;

        // 0. Build game title normalization map
        const games = await mongoose.model("Game").find({});
        const gameMap = new Map<string, any>();
        games.forEach((g: any) => {
            gameMap.set(g.title.toLowerCase(), g);
            gameMap.set(g.slug.toLowerCase(), g);
            // Aliases
            if (g.title === "Counter-Strike 2") {
                gameMap.set("cs2", g);
                gameMap.set("cs 2", g);
                gameMap.set("counter-strike", g);
                gameMap.set("counter strike 2", g);
            }
        });

        const normalizeGame = (focus: string) => {
            if (!focus) return "Valorant";
            const val = focus.toLowerCase().trim();
            return gameMap.get(val)?.title || focus;
        };

        const getGameCategory = (focus: string) => {
            if (!focus) return "FPS";
            const val = focus.toLowerCase().trim();
            return gameMap.get(val)?.category || "FPS";
        };

        const allTeams = await Team.find({});
        let createdCount = 0;
        let updatedCount = 0;
        let linkedCount = 0;

        for (const team of allTeams) {
            const game = normalizeGame(team.gameFocus || "Valorant");

            // Build a list of all members with their roles
            const memberMap = new Map<string, { userId?: mongoose.Types.ObjectId, ign: string, role: string }>();

            // 1. Captain (Priority)
            if (team.captainId) {
                const captainUser = await User.findById(team.captainId);
                if (captainUser) {
                    memberMap.set(String(team.captainId), {
                        userId: team.captainId,
                        ign: captainUser.name, // Fallback to name if no player profile yet
                        role: "CAPTAIN"
                    });
                }
            }

            // 2. Lineup
            for (const m of (team.lineup || [])) {
                if (!m.ign) continue;
                const key = m.userId ? String(m.userId) : `ign:${m.ign}`;
                if (!memberMap.has(key)) {
                    memberMap.set(key, { userId: m.userId as any, ign: m.ign, role: "PLAYER" });
                }
            }

            // 3. Substitutes
            for (const m of (team.substitutes || [])) {
                if (!m.ign) continue;
                const key = m.userId ? String(m.userId) : `ign:${m.ign}`;
                if (!memberMap.has(key)) {
                    memberMap.set(key, { userId: m.userId as any, ign: m.ign, role: "SUBSTITUTE" });
                }
            }

            // 4. All other members (from team.members array)
            if (team.members && team.members.length > 0) {
                const members = await User.find({ _id: { $in: team.members } });
                for (const member of members) {
                    const key = String(member._id);
                    if (!memberMap.has(key)) {
                        memberMap.set(key, {
                            userId: member._id as any,
                            ign: member.name,
                            role: "MEMBER"
                        });
                    }
                }
            }

            // Process membership map
            for (const [key, data] of memberMap) {
                // Find or Create Player
                const findQueries: any[] = [{ ign: { $regex: new RegExp(`^${data.ign}$`, "i") } }];
                if (data.userId) findQueries.push({ userId: data.userId });

                let player = await Player.findOne({ $or: findQueries });

                const category = getGameCategory(game);
                const gameProfile = {
                    game,
                    role: "PLAYER", // Default role for sync
                    team: team._id,
                    stats: { dmg: 60, scr: 60, fks: 60, hs: 60, ast: 60, clu: 60 }, // Baseline for new sync
                    overall: calculateOVR({ dmg: 60, scr: 60, fks: 60, hs: 60, ast: 60, clu: 60 }, "PLAYER", roleBonuses, category),
                    isActive: true
                };

                if (!player) {
                    player = await Player.create({
                        name: data.ign,
                        ign: data.ign,
                        slug: data.ign.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
                        userId: data.userId,
                        games: [gameProfile],
                        country: "US"
                    });
                    createdCount++;
                } else {
                    // Update existing player's game profile
                    player.games = player.games || [];

                    // 1. Data Migration/Cleanup: Normalize existing game titles
                    player.games.forEach((g: any) => {
                        g.game = normalizeGame(g.game);
                    });

                    // 2. Deduplicate: Merge profiles with the same normalized game title
                    const uniqueGames: any[] = [];
                    const seenGames = new Set<string>();
                    for (const g of player.games) {
                        if (!seenGames.has(g.game)) {
                            uniqueGames.push(g);
                            seenGames.add(g.game);
                        } else {
                            // Merge logic: If we have multiple, keep the one with a team if possible
                            const existing = uniqueGames.find(ug => ug.game === g.game);
                            if (!existing.team && g.team) existing.team = g.team;
                        }
                    }
                    player.games = uniqueGames;

                    const existingGame = player.games.find(g => g.game === game);
                    if (existingGame) {
                        existingGame.team = team._id as any;
                    } else if (player.games.length < 3) {
                        player.games.push(gameProfile as any);
                    }

                    if (data.userId && !player.userId) player.userId = data.userId;

                    // Recalculate all OVRs for this player to ensure they use the new formula and correct genre
                    player.games.forEach((g: any) => {
                        const cat = getGameCategory(g.game);
                        g.overall = calculateOVR(g.stats, g.role, roleBonuses, cat);
                    });

                    await player.save();
                    updatedCount++;
                }

                // Update User model: playerId and teams array
                if (data.userId) {
                    const user = await User.findById(data.userId);
                    if (user) {
                        let changed = false;
                        if (!user.playerId) {
                            user.playerId = player._id as any;
                            changed = true;
                            linkedCount++;
                        }

                        // Sync User.teams array
                        user.teams = user.teams || [];
                        const existingTeamEntry = user.teams.find(t =>
                            String(t.teamId) === String(team._id) || (t.game === game)
                        );

                        if (existingTeamEntry) {
                            if (String(existingTeamEntry.teamId) !== String(team._id)) {
                                existingTeamEntry.teamId = team._id as any;
                            }
                            existingTeamEntry.role = data.role as any;
                            existingTeamEntry.game = game;
                        } else {
                            user.teams.push({
                                teamId: team._id as any,
                                game: game,
                                role: data.role as any
                            });
                        }

                        // Ensure they don't have multiple entries for same game focus unless it's the current team
                        user.teams = user.teams.filter(t =>
                            t.game !== game || String(t.teamId) === String(team._id)
                        );

                        await user.save();
                    }
                }
            }
        }

        return NextResponse.json({
            success: true,
            summary: {
                teamsProcessed: allTeams.length,
                playersCreated: createdCount,
                playersUpdated: updatedCount,
                usersLinked: linkedCount
            }
        });

    } catch (error: any) {
        console.error("Sync Error:", error);
        return NextResponse.json({ error: error.message || "Failed to sync players" }, { status: 500 });
    }
}
