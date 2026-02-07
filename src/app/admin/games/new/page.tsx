"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { MoveLeft, Save } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import ImageUpload from "@/components/ui/ImageUpload";

export default function CreateGamePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: "",
        slug: "",
        category: "FPS",
        coverImage: "",
        description: "",
        active: true,
        isFeatured: false
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch("/api/admin/games", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                toast.success("Game created successfully");
                router.push("/admin/games");
                router.refresh();
            } else {
                const data = await res.json();
                toast.error(data.error || "Failed to create game");
            }
        } catch (error) {
            toast.error("An error occurred");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <Link href="/admin/games" className="inline-block mb-6">
                <Button variant="ghost" size="sm" className="pl-0 hover:bg-transparent hover:text-primary">
                    <MoveLeft className="mr-2 h-4 w-4" /> Back to Games
                </Button>
            </Link>

            <div className="glass-card p-8">
                <h1 className="text-2xl font-black uppercase tracking-tighter mb-8">Add New Game</h1>

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

                        <div className="flex items-center gap-2 pt-2">
                            <input
                                type="checkbox"
                                id="isFeatured"
                                className="w-4 h-4 rounded border-white/20 bg-black/20 text-primary focus:ring-primary/50"
                                checked={formData.isFeatured}
                                onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                            />
                            <label htmlFor="isFeatured" className="text-sm font-bold uppercase text-white/60 cursor-pointer">
                                Feature on Home Page
                            </label>
                        </div>
                    </div>

                    <div className="flex justify-end pt-4 border-t border-white/10">
                        <Button type="submit" variant="primary" isLoading={loading}>
                            <Save className="w-4 h-4 mr-2" /> Save Game
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
