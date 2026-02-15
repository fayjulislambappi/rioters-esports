export const GENRE_CONFIG: Record<string, { labels: Record<string, string>, weights: Record<string, number>, roles: string[] }> = {
    "FPS": {
        labels: {
            dmg: "Damage (DMG)",
            scr: "Score (SCR)",
            fks: "First Kills (FKS)",
            hs: "Headshot % (HS)",
            ast: "Assists (AST)",
            clu: "Clutch (CLU)"
        },
        weights: {
            dmg: 0.25,
            scr: 0.25,
            fks: 0.15,
            hs: 0.15,
            ast: 0.10,
            clu: 0.10
        },
        roles: ["Duelist", "Flex", "Initiator", "Smoker", "Sentinel"]
    },
    "SPORTS": {
        labels: {
            dmg: "Goals (GOL)",
            scr: "Assists (AST)",
            fks: "Pass % (PAS)",
            hs: "Tackles (TCK)",
            ast: "Saves (SAV)",
            clu: "Rating (RAT)"
        },
        weights: {
            dmg: 0.30,
            scr: 0.20,
            fks: 0.15,
            hs: 0.10,
            ast: 0.10,
            clu: 0.15
        },
        roles: ["Attacker", "Midfielder", "Defender", "Goalkeeper"]
    },
    "EFOOTBALL": {
        labels: {
            dmg: "Matches (MAT)",
            scr: "Wins (WIN)",
            fks: "Draws (DRW)",
            hs: "Losses (LOS)",
            ast: "Leaderboard Standing (POS)", // Lower is better
            clu: "N/A" // Unused
        },
        weights: {
            dmg: 0.10, // Matches
            scr: 0.35, // Wins
            fks: 0.05, // Draws
            hs: -0.15, // Losses (High negative impact)
            ast: 0.50, // Leaderboard Standing (Heavy weighting)
            clu: 0.00  // Unused
        },
        roles: [
            "Division 1", "Division 2", "Division 3", "Division 4", "Division 5",
            "Division 6", "Division 7", "Division 8", "Division 9", "Division 10",
            "Unranked"
        ]
    }
};

export const ROLE_BONUSES_DEFAULT: Record<string, number> = {
    "Duelist": 14,
    "Flex": 12,
    "Initiator": 10,
    "Smoker": 9,
    "Sentinel": 8,
    "Attacker": 12,
    "Midfielder": 10,
    "Defender": 8,
    "Goalkeeper": 15,
    "Division 1": 20, // Top tier
    "Division 2": 18,
    "Division 3": 16,
    "Division 4": 14,
    "Division 5": 12,
    "Division 6": 10,
    "Division 7": 8,
    "Division 8": 6,
    "Division 9": 4,
    "Division 10": 2,
    "Unranked": 0,
    "Default": 10
};

export function calculateOVR(
    stats: { dmg: number; scr: number; fks: number; hs: number; ast: number; clu: number },
    role: string,
    roleBonuses: Record<string, number> = ROLE_BONUSES_DEFAULT,
    category: string = "FPS"
): number {
    const genre = GENRE_CONFIG[category] || GENRE_CONFIG["FPS"];
    const weights = genre.weights;

    let baseScore = 0;

    if (category === "EFOOTBALL") {
        // Custom Logic for eFootball
        // 1. Matches, Wins, Draws (Positive)
        const activityScore = (stats.dmg * weights.dmg) + (stats.scr * weights.scr) + (stats.fks * weights.fks);

        // 2. Losses (Negative)
        const lossPenalty = stats.hs * Math.abs(weights.hs);

        // 3. Leaderboard Standing Sensitivity (Rank 1 = 100pts, Rank 2000 = 0pts)
        // Formula: 100 - (Rank / 20).
        // e.g. Rank 1 -> 99.95, Rank 100 -> 95, Rank 1000 -> 50, Rank 2000 -> 0.
        const rankInput = stats.ast;
        // If not ranked (0) or Rank > 2000, score is 0.
        const rankScore = (rankInput > 0 && rankInput <= 2000) ? Math.max(0, 100 - (rankInput / 20)) : 0;
        const leaderboardContribution = rankScore * weights.ast;

        baseScore = activityScore - lossPenalty + leaderboardContribution;

    } else {
        // Standard Weighted Sum for FPS/SPORTS
        baseScore =
            (stats.dmg * (weights.dmg || 0)) +
            (stats.scr * (weights.scr || 0)) +
            (stats.fks * (weights.fks || 0)) +
            (stats.hs * (weights.hs || 0)) +
            (stats.ast * (weights.ast || 0)) +
            (stats.clu * (weights.clu || 0));
    }

    // 2. Apply Role Bonus (reduced impact to keep OVR in 60-99 range naturally)
    const bonus = roleBonuses[role] ?? roleBonuses["Default"] ?? 0;

    // 3. Final Calculation: Baseline 60 + ~40 point range from stats + small bonus
    // This formula ensures 0 stats = 60+ (with bonus), and max stats = 99
    const ovr = Math.round(60 + (baseScore * 0.35) + (bonus / 2));

    // 4. Clamping (60 - 99)
    return Math.min(Math.max(ovr, 60), 99);
}

export function getGenreByGame(gameTitle: string): string {
    const title = (gameTitle || "").toLowerCase();

    // Specific check first
    if (title.includes("efootball")) {
        return "EFOOTBALL";
    }

    if (title.includes("valorant") || title.includes("counter-strike") || title.includes("cs2")) {
        return "FPS";
    }
    if (title.includes("football") || title.includes("fc 26") || title.includes("soccer") || title.includes("fifa")) {
        return "SPORTS";
    }
    return "FPS"; // Default
}

export function getOVRColor(ovr: number): string {
    // FIFA-style card colors
    if (ovr >= 90) return "text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-red-500"; // Icon/TOTY
    if (ovr >= 86) return "text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-orange-400 to-red-500"; // Special/Inform
    if (ovr >= 75) return "text-yellow-400"; // Gold
    if (ovr >= 65) return "text-gray-300"; // Silver
    return "text-amber-700"; // Bronze
}

export function getOVRBorderColor(ovr: number): string {
    if (ovr >= 90) return "border-purple-500"; // Icon
    if (ovr >= 86) return "border-orange-500"; // Special
    if (ovr >= 75) return "border-yellow-400"; // Gold
    if (ovr >= 65) return "border-gray-300"; // Silver
    return "border-amber-700"; // Bronze
}
