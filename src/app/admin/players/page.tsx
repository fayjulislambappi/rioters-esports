"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Edit2, Search, RefreshCw, Calculator } from "lucide-react";
import Button from "@/components/ui/Button";
import { getOVRColor } from "@/lib/ovr-utils";
import { IPlayer } from "@/models/Player";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";

export default function AdminPlayersPage() {
    const [players, setPlayers] = useState<IPlayer[]>([]);
    const [games, setGames] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [syncing, setSyncing] = useState(false);
    const [recalculating, setRecalculating] = useState(false);
    const [activeTab, setActiveTab] = useState("ALL"); // ALL or Game Title

    const fetchData = async () => {
        setLoading(true);
        try {
            const [playersRes, gamesRes] = await Promise.all([
                fetch("/api/admin/players"),
                fetch("/api/admin/games")
            ]);

            const playersData = await playersRes.json();
            const gamesData = await gamesRes.json();

            if (!playersData.error) setPlayers(playersData);
            if (Array.isArray(gamesData)) setGames(gamesData);
        } catch (error) {
            console.error("Failed to fetch players or games", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const fetchPlayers = async () => {
        try {
            const res = await fetch("/api/admin/players");
            const data = await res.json();
            if (!data.error) setPlayers(data);
        } catch (error) {
            console.error("Failed to fetch players", error);
        }
    };

    const handleSyncFromTeams = async () => {
        if (!confirm("This will scan all teams and create/link player profiles for all members. Continue?")) return;

        setSyncing(true);
        try {
            const res = await fetch("/api/admin/players/sync-teams", { method: "POST" });
            const data = await res.json();
            if (data.success) {
                toast.success(`Sync complete! Teams: ${data.summary.teamsProcessed}, Created: ${data.summary.playersCreated}, Updated: ${data.summary.playersUpdated}`);
                fetchPlayers();
            } else {
                toast.error(data.error || "Sync failed");
            }
        } catch (error) {
            toast.error("Failed to sync");
        } finally {
            setSyncing(false);
        }
    };

    const handleRecalculateOVR = async () => {
        if (!confirm("This will recalculate the Overall Rating (OVR) for ALL players based on their current stats. Continue?")) return;

        setRecalculating(true);
        try {
            const res = await fetch("/api/admin/players/recalculate-ovr", { method: "POST" });
            const data = await res.json();

            if (res.ok && data.success) {
                toast.success(data.message || "OVR Recalculation complete!");
                fetchPlayers(); // Refresh the list to show new OVRs if any changed
            } else {
                toast.error(data.error || "Recalculation failed");
            }
        } catch (error) {
            console.error("Recalculation request failed", error);
            toast.error("Failed to connect to server");
        } finally {
            setRecalculating(false);
        }
    };

    const filteredPlayers = players.filter(p => {
        const matchesSearch = p.ign.toLowerCase().includes(search.toLowerCase()) ||
            p.name.toLowerCase().includes(search.toLowerCase());

        if (activeTab === "ALL") return matchesSearch;

        const normalizeStr = (s: string) => s?.toLowerCase().replace(/[^a-z0-9]/g, "");
        const target = normalizeStr(activeTab);
        const hasGame = p.games?.some(g => normalizeStr(g.game) === target);
        return matchesSearch && hasGame;
    });

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-white uppercase tracking-wider">Player Database</h1>
                <div className="flex gap-4">
                    <Button
                        variant="outline"
                        onClick={handleSyncFromTeams}
                        isLoading={syncing}
                        className="bg-white/5 border-white/10 hover:border-primary/50"
                    >
                        <RefreshCw className={cn("w-4 h-4 mr-2", syncing && "animate-spin")} />
                        Sync Teams to Players
                    </Button>
                    <Button
                        variant="outline"
                        onClick={handleRecalculateOVR}
                        isLoading={recalculating}
                        className="bg-white/5 border-white/10 hover:border-primary/50"
                    >
                        <Calculator className={cn("w-4 h-4 mr-2", recalculating && "animate-spin")} />
                        Recalculate OVRs
                    </Button>
                    <Link href="/admin/players/new">
                        <Button variant="primary">
                            <Plus className="w-4 h-4 mr-2" />
                            Add New Player
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Game Tabs */}
            <div className="flex flex-wrap gap-2 border-b border-white/10 pb-4">
                <button
                    onClick={() => setActiveTab("ALL")}
                    className={cn(
                        "px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all",
                        activeTab === "ALL"
                            ? "bg-primary text-black"
                            : "bg-white/5 text-white/60 hover:bg-white/10"
                    )}
                >
                    All Players ({players.length})
                </button>
                {games.map(game => {
                    const normalizeStr = (s: string) => s?.toLowerCase().replace(/[^a-z0-9]/g, "");
                    const target = normalizeStr(game.title);

                    const count = players.filter(p =>
                        p.games?.some(g => normalizeStr(g.game) === target)
                    ).length;

                    return (count > 0 || game.active) ? (
                        <button
                            key={game._id}
                            onClick={() => setActiveTab(game.title)}
                            className={cn(
                                "px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all text-nowrap",
                                activeTab === game.title
                                    ? "bg-primary text-black"
                                    : "bg-white/5 text-white/60 hover:bg-white/10"
                            )}
                        >
                            {game.title} ({count})
                        </button>
                    ) : null;
                })}
            </div>

            {/* Search Bar */}
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                <input
                    type="text"
                    placeholder={`Search ${activeTab === "ALL" ? "all" : activeTab} players...`}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-lg py-3 pl-12 text-white focus:outline-none focus:border-primary"
                />
            </div>

            {/* Players Table */}
            <div className="bg-[#0A0A0A] border border-white/10 rounded-lg overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-white/5 text-gray-400 text-xs font-bold uppercase tracking-wider">
                        <tr>
                            <th className="p-4">Rank</th>
                            <th className="p-4">Player</th>
                            <th className="p-4">Role</th>
                            <th className="p-4">Country</th>
                            <th className="p-4 text-center">OVR</th>
                            <th className="p-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {loading ? (
                            <tr><td colSpan={6} className="p-8 text-center text-gray-500">Loading players...</td></tr>
                        ) : filteredPlayers.length === 0 ? (
                            <tr><td colSpan={6} className="p-8 text-center text-gray-500">No players found.</td></tr>
                        ) : (
                            filteredPlayers.map((player, index) => {
                                // Find relevant game profile for active tab
                                const relevantGames = activeTab === "ALL"
                                    ? player.games
                                    : player.games?.filter(g => g.game === activeTab);

                                return (
                                    <tr key={String(player._id)} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                        <td className="p-4 font-mono text-gray-500">#{index + 1}</td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                {player.image ? (
                                                    <img src={player.image} alt={player.ign} className="w-10 h-10 rounded object-cover" />
                                                ) : (
                                                    <div className="w-10 h-10 bg-white/10 rounded flex items-center justify-center text-xs">
                                                        N/A
                                                    </div>
                                                )}
                                                <div>
                                                    <div className="font-bold text-white">{player.ign}</div>
                                                    <div className="text-xs text-gray-500">{player.name}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex flex-wrap gap-2">
                                                {relevantGames?.map((g, i) => {
                                                    const hideRole = g.game === "Counter-Strike 2" || g.game === "Valorant";
                                                    return (
                                                        <span key={i} className="bg-white/10 text-white text-[10px] px-2 py-1 rounded uppercase font-bold tracking-wide">
                                                            {activeTab === "ALL"
                                                                ? `${g.game}${!hideRole ? `: ${g.role}` : ""}`
                                                                : (!hideRole ? g.role : "")}
                                                            {activeTab !== "ALL" && hideRole && "-"}
                                                        </span>
                                                    );
                                                })}
                                                {(!relevantGames || relevantGames.length === 0) && (
                                                    <span className="text-gray-600 italic text-xs">No Games</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="p-4 text-sm text-gray-400 uppercase">{player.country}</td>
                                        <td className="p-4 text-center">
                                            <div className="flex justify-center gap-2">
                                                {relevantGames?.map((g, i) => (
                                                    <span key={i} className={`text-xl font-black italic ${getOVRColor(g.overall)}`}>
                                                        {g.overall}
                                                    </span>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="p-4 text-right">
                                            <Link href={`/admin/players/${player._id}`}>
                                                <button className="p-2 hover:bg-white/10 rounded text-gray-400 hover:text-white transition-colors">
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                            </Link>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
