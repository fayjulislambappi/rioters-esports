"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { MoveLeft, Save } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { useEffect } from "react";
import ImageUpload from "@/components/ui/ImageUpload";

export default function CreateTournamentPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
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
        const fetchGames = async () => {
            try {
                const res = await fetch("/api/admin/games");
                const data = await res.json();
                if (res.ok) {
                    setGames(data);
                    if (data.length > 0) {
                        setFormData(prev => ({ ...prev, gameId: data[0]._id }));
                    }
                }
            } catch (error) {
                console.error("Failed to fetch games");
            }
        };
        fetchGames();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch("/api/admin/tournaments", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                toast.success("Tournament created successfully");
                router.push("/admin/tournaments");
                router.refresh();
            } else {
                const data = await res.json();
                toast.error(data.error || "Failed to create tournament");
            }
        } catch (error) {
            toast.error("An error occurred");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <Link href="/admin/tournaments" className="inline-block mb-6">
                <Button variant="ghost" size="sm" className="pl-0 hover:bg-transparent hover:text-primary">
                    <MoveLeft className="mr-2 h-4 w-4" /> Back to Tournaments
                </Button>
            </Link>

            <div className="glass-card p-8">
                <h1 className="text-2xl font-black uppercase tracking-tighter mb-8">Create Tournament</h1>

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

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold uppercase text-white/60 mb-2">Start Date</label>
                                <Input
                                    type="date"
                                    required
                                    value={formData.startDate}
                                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
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
                            <label className="block text-sm font-bold uppercase text-white/60 mb-2">Prize Pool</label>
                            <Input
                                placeholder="e.g. $10,000"
                                required
                                value={formData.prizePool}
                                onChange={(e) => setFormData({ ...formData, prizePool: e.target.value })}
                            />
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
                        <Button type="submit" variant="primary" isLoading={loading}>
                            <Save className="w-4 h-4 mr-2" /> Create Tournament
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
