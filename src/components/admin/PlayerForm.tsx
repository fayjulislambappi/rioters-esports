"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { calculateOVR, getOVRColor, ROLE_BONUSES_DEFAULT, GENRE_CONFIG, getGenreByGame } from "@/lib/ovr-utils";

import Button from "@/components/ui/Button";
import { ArrowLeft, Save, Trash2, Plus, Gamepad, X } from "lucide-react";
import ImageUpload from "@/components/ui/ImageUpload";
import PlayerCard from "@/components/features/PlayerCard";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface PlayerFormProps {
    initialData?: any;
    isEdit?: boolean;
}

const DEFAULT_STATS = {
    dmg: 0,
    scr: 0,
    fks: 0,
    hs: 0,
    ast: 0,
    clu: 0,
};

const DEFAULT_GAME_PROFILE = {
    game: "Valorant",
    role: "Duelist",
    team: undefined,
    stats: { ...DEFAULT_STATS },
    overall: 60,
    isActive: true
};

export default function PlayerForm({ initialData, isEdit = false }: PlayerFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [roleBonuses, setRoleBonuses] = useState<Record<string, number>>(ROLE_BONUSES_DEFAULT);
    const [activeGameIndex, setActiveGameIndex] = useState(0);
    const [teams, setTeams] = useState<any[]>([]);
    const [users, setUsers] = useState<any[]>([]);
    const [allGames, setAllGames] = useState<any[]>([]);

    // Form State
    const [formData, setFormData] = useState({
        name: "",
        ign: "",
        slug: "",
        image: "",
        country: "US",
        userId: "",
        games: [{ ...DEFAULT_GAME_PROFILE }],
        socials: {
            twitter: "",
            twitch: "",
            instagram: ""
        }
    });

    // Initialize Data
    useEffect(() => {
        if (initialData) {
            setFormData({
                ...initialData,
                userId: initialData.userId?._id || initialData.userId || "",
                games: initialData.games && initialData.games.length > 0
                    ? initialData.games
                    : [{ ...DEFAULT_GAME_PROFILE }]
            });
        }

        // Fetch current role bonuses for accurate preview
        fetch("/api/admin/settings/role-bonuses")
            .then(res => res.json())
            .then(data => {
                if (!data.error) setRoleBonuses(data);
            });

        // Fetch teams for selection
        fetch("/api/admin/teams")
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) setTeams(data);
            });

        // Fetch users for linking
        fetch("/api/admin/users")
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) setUsers(data);
            });

        // Fetch games for selection
        fetch("/api/admin/games")
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setAllGames(data);
                }
            });
    }, [initialData]);

    // Recalculate OVR for active game whenever stats or role changes
    useEffect(() => {
        const activeGame = formData.games[activeGameIndex];
        if (activeGame) {
            const gameData = allGames.find(g => g.title === activeGame.game);
            const ovr = calculateOVR(activeGame.stats, activeGame.role, roleBonuses, gameData?.category || "FPS");
            if (ovr !== activeGame.overall) {
                updateActiveGame("overall", ovr);
            }
        }
    }, [formData.games[activeGameIndex]?.stats, formData.games[activeGameIndex]?.role, roleBonuses, activeGameIndex, allGames]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        if (name.startsWith("socials.")) {
            const socialName = name.split(".")[1];
            setFormData(prev => ({
                ...prev,
                socials: {
                    ...prev.socials,
                    [socialName]: value
                }
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const updateActiveGame = (field: string, value: any) => {
        setFormData(prev => {
            const newGames = [...prev.games];
            if (field.startsWith("stats.")) {
                const statKey = field.split(".")[1];
                newGames[activeGameIndex] = {
                    ...newGames[activeGameIndex],
                    stats: {
                        ...newGames[activeGameIndex].stats,
                        [statKey]: value
                    }
                };
            } else {
                newGames[activeGameIndex] = {
                    ...newGames[activeGameIndex],
                    [field]: value
                };
            }
            return { ...prev, games: newGames };
        });
    };

    const addGameProfile = () => {
        if (formData.games.length >= 3) return;
        setFormData(prev => ({
            ...prev,
            games: [...prev.games, { ...DEFAULT_GAME_PROFILE }]
        }));
        setActiveGameIndex(formData.games.length);
    };

    const removeGameProfile = (index: number) => {
        if (formData.games.length <= 1) return;
        setFormData(prev => ({
            ...prev,
            games: prev.games.filter((_, i) => i !== index)
        }));
        if (activeGameIndex >= index && activeGameIndex > 0) {
            setActiveGameIndex(activeGameIndex - 1);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const url = isEdit ? `/api/admin/players/${initialData._id}` : "/api/admin/players";
            const method = isEdit ? "PUT" : "POST";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (!res.ok) throw new Error("Failed to save player");

            router.push("/admin/players");
            router.refresh();
        } catch (error) {
            console.error(error);
            alert("Error saving player");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this player?")) return;
        setLoading(true);
        try {
            await fetch(`/api/admin/players/${initialData._id}`, { method: "DELETE" });
            router.push("/admin/players");
            router.refresh();
        } catch (error) {
            console.error(error);
            alert("Error deleting player");
        } finally {
            setLoading(false);
        }
    };

    const activeProfile = formData.games[activeGameIndex] || DEFAULT_GAME_PROFILE;

    return (
        <div className="max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <Link href="/admin/players" className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors">
                        <ArrowLeft className="w-5 h-5 text-white" />
                    </Link>
                    <h1 className="text-3xl font-bold uppercase tracking-wider text-white">
                        {isEdit ? `Edit Player: ${formData.ign}` : "New Player"}
                    </h1>
                </div>
                <div className="flex gap-4">
                    {isEdit && (
                        <button
                            type="button"
                            onClick={handleDelete}
                            className="flex items-center gap-2 px-4 py-2 bg-red-500/20 text-red-500 border border-red-500/50 hover:bg-red-500 hover:text-white transition-all rounded"
                        >
                            <Trash2 className="w-4 h-4" />
                            Delete
                        </button>
                    )}
                    <Button
                        onClick={handleSubmit}
                        isLoading={loading}
                        variant="primary"
                        className="min-w-[150px]"
                    >
                        <Save className="w-4 h-4 mr-2" />
                        Save Player
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* LEFT COLUMN: Info & Games */}
                <div className="lg:col-span-2 space-y-6">
                    {/* SHARED INFO */}
                    <section className="bg-white/5 border border-white/10 p-6 rounded-lg space-y-4">
                        <h2 className="text-xl font-bold text-white mb-4 border-b border-white/10 pb-2 uppercase tracking-wide">Shared Profile</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">IGN (In-Game Name)</label>
                                <input
                                    name="ign"
                                    value={formData.ign}
                                    onChange={handleChange}
                                    className="w-full bg-black/50 border border-white/10 rounded p-3 text-white focus:border-primary focus:outline-none"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Real Name</label>
                                <input
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full bg-black/50 border border-white/10 rounded p-3 text-white focus:border-primary focus:outline-none"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Country</label>
                                <input
                                    name="country"
                                    value={formData.country}
                                    onChange={handleChange}
                                    className="w-full bg-black/50 border border-white/10 rounded p-3 text-white focus:border-primary focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Link User Account (Optional)</label>
                                <select
                                    name="userId"
                                    value={formData.userId}
                                    onChange={handleChange}
                                    className="w-full bg-black/50 border border-white/10 rounded p-3 text-white focus:border-primary focus:outline-none"
                                >
                                    <option value="">No Account Linked</option>
                                    {users.map(u => (
                                        <option key={u._id} value={u._id}>
                                            {u.name} ({u.email})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="md:col-span-2 space-y-2 pt-2">
                                <ImageUpload
                                    label="Shared Player Photo"
                                    value={formData.image}
                                    onChange={(url) => setFormData(prev => ({ ...prev, image: url }))}
                                    aspectRatio={1}
                                />
                            </div>
                        </div>
                    </section>

                    {/* GAME PROFILES TABS */}
                    <section className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold text-white uppercase tracking-wide flex items-center gap-2">
                                <Gamepad className="w-5 h-5 text-primary" /> Game Profiles ({formData.games.length}/3)
                            </h2>
                            {formData.games.length < 3 && (
                                <button
                                    type="button"
                                    onClick={addGameProfile}
                                    className="text-xs font-bold text-primary hover:text-white flex items-center gap-1 transition-colors"
                                >
                                    <Plus className="w-4 h-4" /> Add Another Game
                                </button>
                            )}
                        </div>

                        {/* Tabs Navigation */}
                        <div className="flex gap-2 border-b border-white/10 overflow-x-auto pb-px">
                            {formData.games.map((profile, index) => (
                                <div key={index} className="relative group">
                                    <button
                                        type="button"
                                        onClick={() => setActiveGameIndex(index)}
                                        className={cn(
                                            "px-6 py-3 text-sm font-bold uppercase tracking-wider transition-all border-b-2",
                                            activeGameIndex === index
                                                ? "text-primary border-primary bg-primary/5"
                                                : "text-gray-500 border-transparent hover:text-white hover:bg-white/5"
                                        )}
                                    >
                                        {profile.game || `Game ${index + 1}`}
                                    </button>
                                    {formData.games.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={(e) => { e.stopPropagation(); removeGameProfile(index); }}
                                            className="absolute -top-1 -right-1 p-0.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Active Profile Content */}
                        <div className="bg-white/5 border border-white/10 p-6 rounded-b-lg space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Game</label>
                                    <select
                                        value={activeProfile.game}
                                        onChange={(e) => updateActiveGame("game", e.target.value)}
                                        className="w-full bg-black/50 border border-white/10 rounded p-3 text-white focus:border-primary focus:outline-none"
                                    >
                                        {allGames.length > 0 ? (
                                            allGames.map((gameObj) => (
                                                <option key={gameObj._id} value={gameObj.title}>
                                                    {gameObj.title} ({gameObj.category || "FPS"})
                                                </option>
                                            ))
                                        ) : (
                                            <>
                                                <option value="Valorant">Valorant</option>
                                                <option value="Counter-Strike 2">Counter-Strike 2</option>
                                            </>
                                        )}
                                    </select>
                                </div>
                                {activeProfile.game !== "Counter-Strike 2" && (
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase mb-1">
                                            {activeProfile.game.toLowerCase().includes("efootball") ? "Division Rank" : "Role"}
                                        </label>
                                        <select
                                            value={activeProfile.role}
                                            onChange={(e) => updateActiveGame("role", e.target.value)}
                                            className="w-full bg-black/50 border border-white/10 rounded p-3 text-white focus:border-primary focus:outline-none"
                                        >
                                            {(() => {
                                                const genreName = getGenreByGame(activeProfile.game);
                                                const genreRoles = GENRE_CONFIG[genreName]?.roles || [];
                                                return genreRoles.map(role => (
                                                    <option key={role} value={role}>{role}</option>
                                                ));
                                            })()}
                                            <option value="Other">Other</option>
                                        </select>
                                        <p className="text-[10px] text-gray-500 mt-1">
                                            Role Bonus: <span className="text-primary">+{roleBonuses[activeProfile.role] ?? 0} OVR</span>
                                        </p>
                                    </div>
                                )}
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Representing Team</label>
                                    <select
                                        value={activeProfile.team || ""}
                                        onChange={(e) => updateActiveGame("team", e.target.value || undefined)}
                                        className="w-full bg-black/50 border border-white/10 rounded p-3 text-white focus:border-primary focus:outline-none"
                                    >
                                        <option value="">No Team / Free Agent</option>
                                        {teams.map(team => (
                                            <option key={team._id} value={team._id}>
                                                {team.name} ({team.gameFocus || "General"})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-white/5">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-sm font-bold text-white uppercase tracking-widest">Performance Stats</h3>
                                    <span className="text-[10px] text-gray-500 uppercase">0 - 100 Scale</span>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                                    {(() => {
                                        const genreName = getGenreByGame(activeProfile.game);
                                        const genre = GENRE_CONFIG[genreName] || GENRE_CONFIG["FPS"];
                                        return Object.entries(genre.labels).map(([key, label]) => (
                                            <div key={key} className="space-y-2">
                                                <div className="flex justify-between">
                                                    <label className="text-xs font-bold text-gray-300 uppercase">{label}</label>
                                                    <span className="text-[10px] text-gray-600">
                                                        {activeProfile.stats?.[key as keyof typeof DEFAULT_STATS] || 0}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="number"
                                                        value={activeProfile.stats?.[key as keyof typeof DEFAULT_STATS] || 0}
                                                        onChange={(e) => updateActiveGame(`stats.${key}`, Number(e.target.value))}
                                                        min="0"
                                                        max="100"
                                                        className="w-full bg-black/50 border border-white/10 rounded p-2 text-white text-center font-mono focus:border-primary focus:outline-none"
                                                    />
                                                </div>
                                                <input
                                                    type="range"
                                                    value={activeProfile.stats?.[key as keyof typeof DEFAULT_STATS] || 0}
                                                    onChange={(e) => updateActiveGame(`stats.${key}`, Number(e.target.value))}
                                                    min="0" max="100"
                                                    className="w-full accent-primary h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                                                />
                                            </div>
                                        ));
                                    })()}
                                </div>
                            </div>
                        </div>
                    </section>
                </div>

                {/* RIGHT COLUMN: Live Preview & Socials */}
                <div className="space-y-6">
                    <div className="sticky top-8">
                        {/* OVR Card Preview */}
                        {/* OVR Card Preview */}
                        <div className="mb-6">
                            <h3 className="text-sm font-black text-gray-500 uppercase tracking-widest mb-4 text-center">Live Preview</h3>
                            <PlayerCard
                                ign={formData.ign || "PLAYER"}
                                name={formData.name || "Full Name"}
                                image={formData.image}
                                game={activeProfile.game}
                                role={activeProfile.role}
                                rank={activeProfile.role}
                                overall={activeProfile.overall}
                                score={activeProfile.overall.toString()}
                                stats={activeProfile.stats}
                                teamName={teams.find(t => t._id === activeProfile.team)?.name || "Free Agent"}
                                teamLogo={teams.find(t => t._id === activeProfile.team)?.logo}
                            />
                        </div>

                        {/* Stats Breakdown (Keep this for detailed admin view) */}
                        <div className="bg-[#0A0A0A] border border-white/10 rounded-lg p-4 shadow-xl">
                            <div className="flex justify-between text-sm mb-2">
                                <span className="text-gray-400">Role Bonus</span>
                                <span className="text-primary font-bold">+{roleBonuses[activeProfile.role] ?? 0}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-400">Base Stats</span>
                                <span className="text-white font-bold">{Math.round(activeProfile.overall - (roleBonuses[activeProfile.role] ?? 0))}</span>
                            </div>
                        </div>

                        {/* Socials */}
                        <div className="bg-white/5 border border-white/10 rounded-lg p-6 mt-6">
                            <h3 className="text-sm font-bold text-white uppercase mb-4">Socials</h3>
                            <div className="space-y-3">
                                <input
                                    name="socials.twitter"
                                    value={formData.socials?.twitter}
                                    onChange={handleChange}
                                    placeholder="Twitter URL"
                                    className="w-full bg-black/50 border border-white/10 rounded p-2 text-xs text-white"
                                />
                                <input
                                    name="socials.twitch"
                                    value={formData.socials?.twitch}
                                    onChange={handleChange}
                                    placeholder="Twitch URL"
                                    className="w-full bg-black/50 border border-white/10 rounded p-2 text-xs text-white"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
