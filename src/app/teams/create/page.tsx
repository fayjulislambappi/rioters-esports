"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import ImageUpload from "@/components/ui/ImageUpload";
import { MoveLeft, Send, Shield, Gamepad2, Search, X, UserPlus, Check } from "lucide-react";
import Link from "next/link";
import { toast } from "react-hot-toast";

export default function CreateTeamPage() {
    const router = useRouter();
    const { data: session, status } = useSession();
    const [loading, setLoading] = useState(false);
    const [games, setGames] = useState<any[]>([]);

    // Search & Member State
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [selectedMembers, setSelectedMembers] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        slug: "",
        gameFocus: "",
        captainDiscord: "",
        captainIgn: "",
        logo: "",
        recruiting: true,
        // Legacy fields for lineup display (optional, can be auto-filled from selected members if needed, but for now we keep separate inputs for specific roles if user wants, or we simplify)
        // For this request flow, we will simplify and prioritize adding registered members. 
    });

    // Redirect if not logged in
    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login?callbackUrl=/teams/create");
        }
    }, [status, router]);

    // Fetch Games
    useEffect(() => {
        const fetchGames = async () => {
            try {
                const res = await fetch("/api/admin/games");
                const data = await res.json();
                if (res.ok && data.length > 0) {
                    setGames(data);
                    setFormData(prev => ({ ...prev, gameFocus: data[0].title }));
                }
            } catch (error) {
                console.error("Failed to fetch games");
            }
        };
        fetchGames();
    }, []);

    // Auto-slug
    useEffect(() => {
        const slug = formData.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
        setFormData(prev => ({ ...prev, slug }));
    }, [formData.name]);

    // Search Users
    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (searchQuery.length < 2) {
                setSearchResults([]);
                return;
            }
            setIsSearching(true);
            try {
                const res = await fetch(`/api/users/search?q=${searchQuery}`);
                const data = await res.json();
                if (res.ok) {
                    // Filter out already selected members and self
                    setSearchResults(data.filter((u: any) =>
                        u._id !== session?.user?.id &&
                        !selectedMembers.some(m => m._id === u._id)
                    ));
                }
            } catch (error) {
                console.error("Search failed", error);
            } finally {
                setIsSearching(false);
            }
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery, session?.user?.id, selectedMembers]);

    const handleAddMember = (user: any) => {
        setSelectedMembers([...selectedMembers, user]);
        setSearchResults([]);
        setSearchQuery("");
    };

    const handleRemoveMember = (userId: string) => {
        setSelectedMembers(selectedMembers.filter(m => m._id !== userId));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const payload = {
                ...formData,
                memberIds: selectedMembers.map(m => m._id),
                // Auto-fill lineup display data from captain + selected members (simplified for now)
                // In a real app, you might want specific role assignment per selected member here.
            };

            const res = await fetch("/api/teams/create", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const data = await res.json();

            if (res.ok) {
                toast.success("Team request submitted! Awaiting approval.");
                router.push("/teams");
            } else {
                toast.error(data.error || "Failed to submit request");
            }
        } catch (error) {
            toast.error("Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    if (status === "loading") return <div className="min-h-screen pt-24 text-center">Loading...</div>;

    return (
        <div className="container mx-auto px-4 py-12 max-w-3xl">
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
                        <h1 className="text-3xl font-black uppercase tracking-tighter text-glow">Request Team Creation</h1>
                        <p className="text-white/60 text-sm">Submit your organization for admin approval.</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Info */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-bold uppercase text-white/80 border-b border-white/10 pb-2">Identity</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                <label className="block text-sm font-bold uppercase text-white/60 mb-2">Team Handle</label>
                                <Input
                                    placeholder="shadow-strikers"
                                    required
                                    value={formData.slug}
                                    readOnly
                                    className="opacity-60 cursor-not-allowed"
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

                    {/* Game & Captain */}
                    <div className="space-y-4 pt-4">
                        <h3 className="text-lg font-bold uppercase text-white/80 border-b border-white/10 pb-2">Details</h3>

                        <div>
                            <label className="block text-sm font-bold uppercase text-white/60 mb-2">Primary Game <span className="text-primary">*</span></label>
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
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold uppercase text-white/60 mb-2">Captain Discord <span className="text-primary">*</span></label>
                                <Input
                                    placeholder="username#1234"
                                    required
                                    value={formData.captainDiscord}
                                    onChange={(e) => setFormData({ ...formData, captainDiscord: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold uppercase text-white/60 mb-2">Captain IGN <span className="text-primary">*</span></label>
                                <Input
                                    placeholder="In-Game Name"
                                    required
                                    value={formData.captainIgn}
                                    onChange={(e) => setFormData({ ...formData, captainIgn: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Member Selection */}
                    <div className="space-y-4 pt-4">
                        <h3 className="text-lg font-bold uppercase text-white/80 border-b border-white/10 pb-2 flex items-center justify-between">
                            <span>Roster Members</span>
                            <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded">{selectedMembers.length} Selected</span>
                        </h3>

                        <div className="relative">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                                <Input
                                    placeholder="Search registered users by name or email..."
                                    className="pl-10"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>

                            {/* Search Results Dropdown */}
                            {searchResults.length > 0 && (
                                <div className="absolute top-full left-0 right-0 mt-2 bg-zinc-900 border border-white/10 rounded-lg shadow-xl z-50 max-h-60 overflow-y-auto">
                                    {searchResults.map(user => (
                                        <div
                                            key={user._id}
                                            className="p-3 hover:bg-white/5 cursor-pointer flex items-center justify-between transition-colors"
                                            onClick={() => handleAddMember(user)}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-white/10 overflow-hidden">
                                                    {user.image ? (
                                                        <img src={user.image} alt={user.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-xs font-bold text-white/40">
                                                            {user.name.charAt(0)}
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-sm text-white">{user.name}</p>
                                                    <p className="text-xs text-white/40">{user.email}</p>
                                                </div>
                                            </div>
                                            <UserPlus className="w-4 h-4 text-primary" />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Selected Members List */}
                        {selectedMembers.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                                {selectedMembers.map(member => (
                                    <div key={member._id} className="bg-white/5 border border-white/10 rounded-lg p-3 flex items-center justify-between group">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-white/10 overflow-hidden">
                                                {member.image ? (
                                                    <img src={member.image} alt={member.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-xs font-bold text-white/40">
                                                        {member.name.charAt(0)}
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-bold text-sm text-white">{member.name}</p>
                                                <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded text-white/60">MEMBER</span>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveMember(member._id)}
                                            className="text-white/20 hover:text-red-500 transition-colors p-2"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 border border-dashed border-white/10 rounded-lg text-white/20 text-sm">
                                No members added yet. Search above to build your roster.
                            </div>
                        )}
                    </div>

                    <div className="pt-6 border-t border-white/10">
                        <Button type="submit" variant="neon" className="w-full py-4 neon-box" isLoading={loading}>
                            <Send className="w-4 h-4 mr-2" /> Submit Team Request
                        </Button>
                        <p className="text-center text-xs text-white/40 mt-4">
                            Your team will be reviewed by an administrator before going live.
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
}
