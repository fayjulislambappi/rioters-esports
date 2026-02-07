"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Search, Edit, Trash2, Star } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Image from "next/image";
import { useEffect } from "react";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function AdminGamesPage() {
    const router = useRouter();
    const [games, setGames] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [togglingId, setTogglingId] = useState<string | null>(null);

    const fetchGames = async () => {
        try {
            const res = await fetch(`/api/admin/games?t=${Date.now()}`, {
                cache: 'no-store'
            });
            const data = await res.json();
            if (res.ok) {
                setGames(data);
            } else {
                toast.error(data.error || "Failed to fetch games");
            }
        } catch (error) {
            toast.error("An error occurred while fetching games");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGames();
    }, []);

    const handleToggleFeatured = async (id: string, currentStatus: boolean) => {
        if (togglingId) return;
        setTogglingId(id);
        const newStatus = !currentStatus;

        // Optimistic update
        setGames(prev => prev.map(g => g._id === id ? { ...g, isFeatured: newStatus } : g));

        try {
            const res = await fetch(`/api/admin/games/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ isFeatured: newStatus }),
            });

            if (res.ok) {
                const updatedGame = await res.json();
                toast.success(`Game ${updatedGame.isFeatured ? "featured" : "unfeatured"}`);

                // Final sync with server data
                setGames(prev => prev.map(g => g._id === id ? { ...g, isFeatured: !!updatedGame.isFeatured } : g));
            } else {
                const data = await res.json();
                toast.error(data.error || "Failed to update status");
                // Rollback
                setGames(prev => prev.map(g => g._id === id ? { ...g, isFeatured: currentStatus } : g));
            }
        } catch (error) {
            toast.error("An error occurred");
            // Rollback
            setGames(prev => prev.map(g => g._id === id ? { ...g, isFeatured: currentStatus } : g));
        } finally {
            setTogglingId(null);
        }
    };

    const handleDelete = async (id: string, title: string) => {
        if (!confirm(`Are you sure you want to delete ${title}?`)) return;

        try {
            const res = await fetch(`/api/admin/games/${id}`, {
                method: "DELETE",
            });

            if (res.ok) {
                toast.success("Game deleted successfully");
                fetchGames();
            } else {
                const data = await res.json();
                toast.error(data.error || "Failed to delete game");
            }
        } catch (error) {
            toast.error("An error occurred");
        }
    };

    const filteredGames = games.filter(game =>
        game.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        game.category?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-black uppercase tracking-tighter">Manage Games</h1>
                <Link href="/admin/games/new">
                    <Button variant="primary">
                        <Plus className="w-4 h-4 mr-2" /> Add Game
                    </Button>
                </Link>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                <div className="p-4 border-b border-white/10 flex gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                        <Input
                            placeholder="Search games..."
                            className="pl-10 bg-black/20"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="p-8 text-center text-white/40 font-bold uppercase tracking-widest animate-pulse">
                            Loading Assets...
                        </div>
                    ) : filteredGames.length === 0 ? (
                        <div className="p-8 text-center text-white/40 font-bold uppercase tracking-widest">
                            No Games Found
                        </div>
                    ) : (
                        <table className="w-full text-left">
                            <thead className="bg-white/5 text-xs uppercase font-bold text-white/60">
                                <tr>
                                    <th className="p-4">Game</th>
                                    <th className="p-4">Category</th>
                                    <th className="p-4">Featured</th>
                                    <th className="p-4">Status</th>
                                    <th className="p-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/10">
                                {filteredGames.map((game) => (
                                    <tr key={game._id} className="hover:bg-white/5 transition-colors">
                                        <td className="p-4 flex items-center gap-3">
                                            <div className="w-10 h-10 rounded bg-white/10 overflow-hidden relative">
                                                <Image src={game.coverImage || "/hero-bg.jpg"} alt={game.title} fill className="object-cover" />
                                            </div>
                                            <span className="font-bold">{game.title}</span>
                                        </td>
                                        <td className="p-4">
                                            <span className="text-xs font-bold uppercase tracking-wider text-white/40 bg-white/5 px-2 py-1 rounded">
                                                {game.category || "General"}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <button
                                                disabled={togglingId === game._id}
                                                onClick={() => handleToggleFeatured(game._id, !!game.isFeatured)}
                                                className={`p-2 rounded-full transition-all duration-300 ${game.isFeatured ? 'text-yellow-400 bg-yellow-400/10 shadow-[0_0_15px_rgba(250,204,21,0.2)]' : 'text-white/20 hover:text-white/40 hover:bg-white/5'} ${togglingId === game._id ? 'animate-pulse opacity-50' : ''}`}
                                            >
                                                <Star
                                                    fill={game.isFeatured ? "currentColor" : "none"}
                                                    className={`w-4 h-4 transition-all ${game.isFeatured ? 'scale-110' : ''} ${togglingId === game._id ? 'animate-spin opacity-50' : ''}`}
                                                />
                                            </button>
                                        </td>
                                        <td className="p-4">
                                            <span className={`text-xs font-bold px-2 py-1 rounded ${game.active ? 'bg-primary/20 text-primary' : 'bg-red-500/20 text-red-500'}`}>
                                                {game.active ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <Link href={`/admin/games/edit/${game._id}`}>
                                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                        <Edit className="w-4 h-4" />
                                                    </Button>
                                                </Link>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-8 w-8 p-0 text-red-500 hover:text-red-500 hover:bg-red-500/10"
                                                    onClick={() => handleDelete(game._id, game.title)}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}
