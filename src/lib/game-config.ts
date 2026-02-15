export interface GameRosterLimit {
    maxTotal: number;
    maxSubstitutes: number;
    starters: number;
}

export const GAME_ROSTER_LIMITS: Record<string, GameRosterLimit> = {
    "Counter-Strike 2": { maxTotal: 7, maxSubstitutes: 2, starters: 5 },
    "CS2": { maxTotal: 7, maxSubstitutes: 2, starters: 5 },
    "Valorant": { maxTotal: 7, maxSubstitutes: 2, starters: 5 },
    "eFootball": { maxTotal: 3, maxSubstitutes: 2, starters: 1 },
    "FC26": { maxTotal: 18, maxSubstitutes: 7, starters: 11 },
};

export const DEFAULT_LIMIT: GameRosterLimit = {
    maxTotal: 7,
    maxSubstitutes: 2,
    starters: 5
};

export function getGameRosterLimit(gameName?: string): GameRosterLimit {
    if (!gameName) return DEFAULT_LIMIT;

    const normalized = gameName.toLowerCase().trim();

    // Exact or partial match
    for (const key in GAME_ROSTER_LIMITS) {
        if (key.toLowerCase() === normalized ||
            normalized.includes(key.toLowerCase()) ||
            key.toLowerCase().includes(normalized)) {
            return GAME_ROSTER_LIMITS[key];
        }
    }

    return DEFAULT_LIMIT;
}
