"use client";

import { useState, useEffect, use } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { MoveLeft, Save } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import ImageUpload from "@/components/ui/ImageUpload";

export default function EditTournamentPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [games, setGames] = useState<any[]>([]);
    const [formData, setFormData] = useState({
        title: "",
        gameId: "",
        description: "",
        rules: "",
        prizePool: "",
        entryFee: "Free",
        startDate: "",
        endDate: "",
        registrationDeadline: "",
        maxTeams: 32,
        status: "UPCOMING",
        image: ""
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch games for the dropdown
                const gamesRes = await fetch("/api/admin/games");
                const gamesData = await gamesRes.json();
                if (gamesRes.ok) {
                    setGames(gamesData);
                }

                // Fetch tournament data
                const tourneyRes = await fetch(`/api/admin/tournaments/${id}`);
                const tourneyData = await tourneyRes.json();
                if (tourneyRes.ok) {
                    setFormData({
                        title: tourneyData.title,
                        gameId: tourneyData.gameId,
                        description: tourneyData.description,
                        rules: tourneyData.rules,
                        prizePool: tourneyData.prizePool,
                        entryFee: tourneyData.entryFee || "Free",
                        startDate: tourneyData.startDate ? new Date(tourneyData.startDate).toISOString().slice(0, 16) : "",
                        endDate: tourneyData.endDate ? new Date(tourneyData.endDate).toISOString().slice(0, 16) : "",
                        registrationDeadline: tourneyData.registrationDeadline ? new Date(tourneyData.registrationDeadline).toISOString().slice(0, 16) : "",
                        maxTeams: tourneyData.maxTeams,
                        status: tourneyData.status,
                        image: tourneyData.image || ""
                    });
                } else {
                    toast.error("Failed to fetch tournament data");
                }
            } catch (error) {
                toast.error("An error occurred while fetching data");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            const res = await fetch(`/api/admin/tournaments/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                toast.success("Tournament updated successfully");
                router.push("/admin/tournaments");
                router.refresh();
            } else {
                const data = await res.json();
                toast.error(data.error || "Failed to update tournament");
            }
        } catch (error) {
            toast.error("An error occurred");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="p-8 text-center animate-pulse uppercase font-black tracking-widest text-white/20">Loading Tournament Data...</div>;
    }

    return (
        <div className="max-w-2xl mx-auto">
            <Link href="/admin/tournaments" className="inline-block mb-6">
                <Button variant="ghost" size="sm" className="pl-0 hover:bg-transparent hover:text-primary">
                    <MoveLeft className="mr-2 h-4 w-4" /> Back to Tournaments
                </Button>
            </Link>

            <div className="glass-card p-8">
                <h1 className="text-2xl font-black uppercase tracking-tighter mb-8">Edit Tournament</h1>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold uppercase text-white/60 mb-2">Tournament Name</label>
                            <Input
                                placeholder="e.g. Summer Championship 2024"
                                required
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold uppercase text-white/60 mb-2">Game</label>
                            <select
                                className="flex h-10 w-full rounded-md border border-white/20 bg-black/20 px-3 py-2 text-sm text-foreground focus:border-primary/50 focus:outline-none"
                                value={formData.gameId}
                                required
                                onChange={(e) => setFormData({ ...formData, gameId: e.target.value })}
                            >
                                <option value="" disabled>Select a Game</option>
                                {games.map(game => (
                                    <option key={game._id} value={game._id}>{game.title}</option>
                                ))}
                            </select>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold uppercase text-white/60 mb-2">Start Date</label>
                                <Input
                                    type="datetime-local"
                                    required
                                    value={formData.startDate}
                                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold uppercase text-white/60 mb-2">End Date</label>
                                <Input
                                    type="datetime-local"
                                    required
                                    value={formData.endDate}
                                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold uppercase text-white/60 mb-2">Registration Deadline</label>
                                <Input
                                    type="datetime-local"
                                    required
                                    value={formData.registrationDeadline}
                                    onChange={(e) => setFormData({ ...formData, registrationDeadline: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold uppercase text-white/60 mb-2">Status</label>
                                <select
                                    className="flex h-10 w-full rounded-md border border-white/20 bg-black/20 px-3 py-2 text-sm text-foreground focus:border-primary/50 focus:outline-none"
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                >
                                    <option value="UPCOMING">UPCOMING</option>
                                    <option value="ONGOING">ONGOING</option>
                                    <option value="COMPLETED">COMPLETED</option>
                                    <option value="CANCELLED">CANCELLED</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold uppercase text-white/60 mb-2">Prize Pool</label>
                                <Input
                                    placeholder="e.g. $10,000"
                                    required
                                    value={formData.prizePool}
                                    onChange={(e) => setFormData({ ...formData, prizePool: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold uppercase text-white/60 mb-2">Max Teams</label>
                                <Input
                                    type="number"
                                    placeholder="32"
                                    required
                                    value={formData.maxTeams}
                                    onChange={(e) => setFormData({ ...formData, maxTeams: parseInt(e.target.value) })}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold uppercase text-white/60 mb-2">Description</label>
                            <textarea
                                className="flex min-h-[100px] w-full rounded-md border border-white/20 bg-black/20 px-3 py-2 text-sm text-foreground focus:border-primary/50 focus:outline-none"
                                placeholder="Tournament description..."
                                required
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>

                        <div>
                            <ImageUpload
                                label="Tournament Banner"
                                value={formData.image}
                                onChange={(url) => setFormData({ ...formData, image: url })}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold uppercase text-white/60 mb-2">Rules</label>
                            <textarea
                                className="flex min-h-[100px] w-full rounded-md border border-white/20 bg-black/20 px-3 py-2 text-sm text-foreground focus:border-primary/50 focus:outline-none"
                                placeholder="Tournament rules..."
                                required
                                value={formData.rules}
                                onChange={(e) => setFormData({ ...formData, rules: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="flex justify-end pt-4 border-t border-white/10">
                        <Button type="submit" variant="primary" isLoading={saving}>
                            <Save className="w-4 h-4 mr-2" /> Save Changes
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
