"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import ImageUpload from "@/components/ui/ImageUpload";
import { MoveLeft, Save, Shield, Gamepad2, MessageCircle, CheckCircle } from "lucide-react";
import Link from "next/link";
import { toast } from "react-hot-toast";

export default function CreateTeamPage() {
    const router = useRouter();
    const { data: session, status } = useSession();
    const [loading, setLoading] = useState(false);
    const [games, setGames] = useState<any[]>([]);

    const [formData, setFormData] = useState({
        name: "",
        slug: "",
        gameFocus: "",
        discord: "",
        logo: "",
        recruiting: true,
        sub1: "",
        sub2: "",
        p2: "",
        p3: "",
        p4: "",
        p5: ""
    });

    // Redirect if not logged in
    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login?callbackUrl=/teams/create");
        }
    }, [status, router]);

    // Fetch Games for Dropdown
    useEffect(() => {
        const fetchGames = async () => {
            try {
                const res = await fetch("/api/admin/games");
                const data = await res.json();
                if (res.ok) {
                    setGames(data);
                    if (data.length > 0) {
                        setFormData(prev => ({ ...prev, gameFocus: data[0].title }));
                    }
                }
            } catch (error) {
                console.error("Failed to fetch games");
            }
        };
        fetchGames();
    }, []);

    // Auto-generate slug from name
    useEffect(() => {
        const slug = formData.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)+/g, "");
        setFormData(prev => ({ ...prev, slug }));
    }, [formData.name]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch("/api/teams/create", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            if (res.ok) {
                toast.success("Team created successfully! Assemble your squad.");
                router.push(`/teams/${data.slug}`);
                router.refresh();
            } else {
                toast.error(data.error || "Failed to create team");
            }
        } catch (error) {
            toast.error("Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    if (status === "loading") {
        return <div className="min-h-screen flex items-center justify-center text-white/40">Loading...</div>;
    }

    const is5v5 = formData.gameFocus === "Valorant" || formData.gameFocus === "Counter-Strike 2" || formData.gameFocus === "CS2";

    return (
        <div className="container mx-auto px-4 py-12 max-w-2xl">
            <Link href="/teams" className="inline-block mb-6">
                <Button variant="ghost" size="sm" className="pl-0 hover:bg-transparent hover:text-primary">
                    <MoveLeft className="mr-2 h-4 w-4" /> Back to Teams
                </Button>
            </Link>

            <div className="glass-card p-8 border-primary/20 shadow-[0_0_50px_rgba(255,46,46,0.1)]">
                <div className="flex items-center gap-4 mb-8">
                    <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 text-primary">
                        <Shield className="w-8 h-8" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black uppercase tracking-tighter text-glow">Create Your Team</h1>
                        <p className="text-white/60 text-sm">Establish your organization and recruit members.</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Info */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-bold uppercase text-white/80 border-b border-white/10 pb-2">Identity</h3>

                        <div>
                            <label className="block text-sm font-bold uppercase text-white/60 mb-2">Team Name <span className="text-primary">*</span></label>
                            <Input
                                placeholder="e.g. Shadow Strikers"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold uppercase text-white/60 mb-2">Team Handle (Slug)</label>
                            <div className="flex">
                                <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-white/20 bg-white/5 text-white/40 text-sm">
                                    /teams/
                                </span>
                                <Input
                                    className="rounded-l-none"
                                    placeholder="shadow-strikers"
                                    required
                                    value={formData.slug}
                                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold uppercase text-white/60 mb-2">Logo</label>
                            <ImageUpload
                                label="Team Logo"
                                value={formData.logo}
                                onChange={(url) => setFormData({ ...formData, logo: url })}
                            />
                        </div>
                    </div>

                    {/* Game & Verification */}
                    <div className="space-y-4 pt-4">
                        <h3 className="text-lg font-bold uppercase text-white/80 border-b border-white/10 pb-2 flex items-center justify-between">
                            <span>Focus & Verification</span>
                            <span className="text-xs font-normal text-white/40 bg-white/5 px-2 py-1 rounded">Required</span>
                        </h3>

                        <div>
                            <label className="block text-sm font-bold uppercase text-white/60 mb-2">
                                <Gamepad2 className="w-4 h-4 inline mr-2" /> Primary Game Focus
                            </label>
                            <select
                                className="flex h-10 w-full rounded-md border border-white/20 bg-black/20 px-3 py-2 text-sm text-foreground focus:border-primary/50 focus:outline-none"
                                value={formData.gameFocus}
                                required
                                onChange={(e) => setFormData({ ...formData, gameFocus: e.target.value })}
                            >
                                <option value="" disabled>Select a Game</option>
                                {games.map(game => (
                                    <option key={game._id} value={game.title}>{game.title}</option>
                                ))}
                            </select>
                            <p className="text-xs text-white/40 mt-1">Which game will your team primarily compete in?</p>
                        </div>

                        <div>
                            <label className="block text-sm font-bold uppercase text-white/60 mb-2">
                                <span className="w-4 h-4 inline-block mr-2 text-[#5865F2] fill-current">
                                    <svg viewBox="0 0 127.14 96.36" className="w-3 h-3 inline fill-current"><path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.11,77.11,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22c.12-9.23-1.69-19-4.89-27.42C118.52,43.27,113.88,24.78,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5-12.74,11.44-12.74S96.23,46,96.12,53,91.08,65.69,84.69,65.69Z" /></svg>
                                </span>
                                Discord Server Invite
                            </label>
                            <Input
                                placeholder="https://discord.gg/..."
                                required
                                value={formData.discord}
                                onChange={(e) => setFormData({ ...formData, discord: e.target.value })}
                            />
                            <p className="text-xs text-white/40 mt-1">Required for tournament verification and communication.</p>
                        </div>
                    </div>

                    {/* Roster / Subs */}
                    <div className="space-y-4 pt-4">
                        <h3 className="text-lg font-bold uppercase text-white/80 border-b border-white/10 pb-2">Roster</h3>

                        {is5v5 && (
                            <div className="bg-primary/10 border border-primary/20 p-4 rounded-lg mb-4">
                                <p className="text-primary text-sm font-bold uppercase flex items-center">
                                    <Shield className="w-4 h-4 mr-2" /> 5v5 Roster Required
                                </p>
                                <p className="text-xs text-white/60 mt-1">
                                    A full starting lineup (You + 4 others) and 2 substitutes are required for {formData.gameFocus}.
                                </p>
                            </div>
                        )}

                        {is5v5 && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block text-sm font-bold uppercase text-white/60 mb-2">Player 2 (Main) <span className="text-primary">*</span></label>
                                    <Input
                                        placeholder="IGN"
                                        required
                                        value={formData.p2}
                                        onChange={(e) => setFormData({ ...formData, p2: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold uppercase text-white/60 mb-2">Player 3 (Main) <span className="text-primary">*</span></label>
                                    <Input
                                        placeholder="IGN"
                                        required
                                        value={formData.p3}
                                        onChange={(e) => setFormData({ ...formData, p3: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold uppercase text-white/60 mb-2">Player 4 (Main) <span className="text-primary">*</span></label>
                                    <Input
                                        placeholder="IGN"
                                        required
                                        value={formData.p4}
                                        onChange={(e) => setFormData({ ...formData, p4: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold uppercase text-white/60 mb-2">Player 5 (Main) <span className="text-primary">*</span></label>
                                    <Input
                                        placeholder="IGN"
                                        required
                                        value={formData.p5}
                                        onChange={(e) => setFormData({ ...formData, p5: e.target.value })}
                                    />
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold uppercase text-white/60 mb-2">
                                    Substitute Player 1
                                    {is5v5 ? <span className="text-primary ml-1">*</span> : " (Optional)"}
                                </label>
                                <Input
                                    placeholder="IGN or Username"
                                    required={is5v5}
                                    value={formData.sub1}
                                    onChange={(e) => setFormData({ ...formData, sub1: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold uppercase text-white/60 mb-2">
                                    Substitute Player 2
                                    {is5v5 ? <span className="text-primary ml-1">*</span> : " (Optional)"}
                                </label>
                                <Input
                                    placeholder="IGN or Username"
                                    required={is5v5}
                                    value={formData.sub2}
                                    onChange={(e) => setFormData({ ...formData, sub2: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-white/10">
                        <div className="flex items-center mb-6">
                            <input
                                type="checkbox"
                                id="recruiting"
                                className="w-5 h-5 rounded border-white/20 bg-black/40 text-primary focus:ring-primary"
                                checked={formData.recruiting}
                                onChange={(e) => setFormData({ ...formData, recruiting: e.target.checked })}
                            />
                            <label htmlFor="recruiting" className="ml-2 text-sm text-white/80 cursor-pointer">
                                Open to new members? (Recruiting)
                            </label>
                        </div>

                        <Button type="submit" variant="neon" className="w-full py-6 neon-box" isLoading={loading}>
                            <Save className="w-4 h-4 mr-2" /> Create Team
                        </Button>
                        <p className="text-center text-xs text-white/40 mt-4">
                            By creating a team, you agree to become the Captain and manage tournament entries.
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
}
