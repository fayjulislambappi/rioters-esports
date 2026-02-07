"use client";

import { useState, useEffect, use } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { MoveLeft, Save } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import ImageUpload from "@/components/ui/ImageUpload";

export default function EditGamePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        title: "",
        slug: "",
        category: "FPS",
        coverImage: "",
        description: "",
        active: true,
        isFeatured: false
    });

    useEffect(() => {
        const fetchGame = async () => {
            try {
                const res = await fetch(`/api/admin/games/${id}?t=${Date.now()}`);
                const data = await res.json();
                if (res.ok) {
                    setFormData({
                        title: data.title,
                        slug: data.slug,
                        category: data.category || "FPS",
                        coverImage: data.coverImage,
                        description: data.description,
                        active: data.active !== false,
                        isFeatured: !!data.isFeatured
                    });
                } else {
                    toast.error("Failed to fetch game data");
                }
            } catch (error) {
                toast.error("An error occurred while fetching game data");
            } finally {
                setLoading(false);
            }
        };

        fetchGame();
    }, [id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            const res = await fetch(`/api/admin/games/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                toast.success("Game updated successfully");
                router.push("/admin/games");
                router.refresh();
            } else {
                const data = await res.json();
                toast.error(data.error || "Failed to update game");
            }
        } catch (error) {
            toast.error("An error occurred");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="p-8 text-center animate-pulse uppercase font-black tracking-widest text-white/20">Loading Game Data...</div>;
    }

    return (
        <div className="max-w-2xl mx-auto">
            <Link href="/admin/games" className="inline-block mb-6">
                <Button variant="ghost" size="sm" className="pl-0 hover:bg-transparent hover:text-primary">
                    <MoveLeft className="mr-2 h-4 w-4" /> Back to Games
                </Button>
            </Link>

            <div className="glass-card p-8">
                <h1 className="text-2xl font-black uppercase tracking-tighter mb-8">Edit Game</h1>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold uppercase text-white/60 mb-2">Game Title</label>
                            <Input
                                placeholder="e.g. Valorant"
                                required
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold uppercase text-white/60 mb-2">Slug (URL)</label>
                            <Input
                                placeholder="e.g. valorant"
                                required
                                value={formData.slug}
                                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold uppercase text-white/60 mb-2">Category</label>
                            <select
                                className="flex h-10 w-full rounded-md border border-white/20 bg-black/20 px-3 py-2 text-sm text-foreground focus:border-primary/50 focus:outline-none"
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            >
                                <option>FPS</option>
                                <option>MOBA</option>
                                <option>Sports</option>
                                <option>Battle Royale</option>
                                <option>Strategy</option>
                            </select>
                        </div>

                        <div className="space-y-4">
                            <ImageUpload
                                label="Cover Image"
                                value={formData.coverImage}
                                onChange={(url) => setFormData({ ...formData, coverImage: url })}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold uppercase text-white/60 mb-2">Description</label>
                            <textarea
                                className="flex min-h-[100px] w-full rounded-md border border-white/20 bg-black/20 px-3 py-2 text-sm text-foreground focus:border-primary/50 focus:outline-none"
                                placeholder="Game description..."
                                required
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>

                        <div className="flex items-center gap-4 pt-2">
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="isFeatured"
                                    className="w-4 h-4 rounded border-white/20 bg-black/20 text-primary focus:ring-primary/50"
                                    checked={formData.isFeatured}
                                    onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                                />
                                <label htmlFor="isFeatured" className="text-sm font-bold uppercase text-white/60 cursor-pointer">
                                    Featured
                                </label>
                            </div>
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="active"
                                    className="w-4 h-4 rounded border-white/20 bg-black/20 text-primary focus:ring-primary/50"
                                    checked={formData.active}
                                    onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                                />
                                <label htmlFor="active" className="text-sm font-bold uppercase text-white/60 cursor-pointer">
                                    Active
                                </label>
                            </div>
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
