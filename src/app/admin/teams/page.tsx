"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input"; // Assuming Input component exists
import { Search, Shield, Ban, Edit } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { useEffect } from "react";
import { toast } from "react-hot-toast";

export default function AdminTeamsPage() {
    const [teams, setTeams] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    const fetchTeams = async () => {
        try {
            const res = await fetch("/api/admin/teams");
            const data = await res.json();
            if (res.ok) {
                setTeams(data);
            } else {
                toast.error(data.error || "Failed to fetch teams");
            }
        } catch (error) {
            toast.error("An error occurred while fetching teams");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTeams();
        fetchGames();
    }, []);

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Are you sure you want to disband ${name}?`)) return;

        try {
            const res = await fetch(`/api/admin/teams?id=${id}`, {
                method: "DELETE",
            });

            if (res.ok) {
                toast.success("Team disbanded successfully");
                fetchTeams();
            } else {
                const data = await res.json();
                toast.error(data.error || "Failed to disband team");
            }
        } catch (error) {
            toast.error("An error occurred");
        }
    };

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newTeam, setNewTeam] = useState({ name: "", tag: "", description: "", gameFocus: "" });
    const [availableGames, setAvailableGames] = useState<any[]>([]);

    const fetchGames = async () => {
        try {
            const res = await fetch("/api/admin/games");
            const data = await res.json();
            if (res.ok) {
                setAvailableGames(data);
            }
        } catch (error) {
            console.error("Failed to fetch games");
        }
    };

    const handleCreateTeam = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch("/api/admin/teams", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newTeam),
            });

            if (res.ok) {
                toast.success("Team created successfully");
                setShowCreateModal(false);
                setNewTeam({ name: "", tag: "", description: "", gameFocus: "" });
                fetchTeams();
            } else {
                const data = await res.json();
                toast.error(data.error || "Failed to create team");
            }
        } catch (error) {
            toast.error("An error occurred");
        }
    };

    const filteredTeams = teams.filter(team =>
        team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        team.tag?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-black uppercase tracking-tighter">Manage Teams</h1>
                <div className="flex gap-4">
                    <Link href="/admin/teams/applications">
                        <Button variant="outline" className="flex items-center gap-2">
                            Applications
                        </Button>
                    </Link>
                    <Button variant="primary" onClick={() => setShowCreateModal(true)}>
                        Create Team
                    </Button>
                </div>
            </div>

            {showCreateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-zinc-900 border border-white/10 rounded-xl p-8 w-full max-w-md shadow-2xl">
                        <h2 className="text-2xl font-black uppercase mb-6">Create New Team</h2>
                        <form onSubmit={handleCreateTeam} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold uppercase text-white/40 mb-2">Team Name</label>
                                <Input
                                    required
                                    placeholder="e.g. Alpha Squad"
                                    value={newTeam.name}
                                    onChange={(e) => setNewTeam({ ...newTeam, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase text-white/40 mb-2">Team Tag</label>
                                <Input
                                    required
                                    placeholder="e.g. ASQD"
                                    value={newTeam.tag}
                                    onChange={(e) => setNewTeam({ ...newTeam, tag: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase text-white/40 mb-2">Description</label>
                                <textarea
                                    className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-primary transition-colors min-h-[100px]"
                                    placeholder="Tell us about the team..."
                                    value={newTeam.description}
                                    onChange={(e) => setNewTeam({ ...newTeam, description: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase text-white/40 mb-2">Game Focus</label>
                                <select
                                    required
                                    className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-primary transition-colors"
                                    value={newTeam.gameFocus}
                                    onChange={(e) => setNewTeam({ ...newTeam, gameFocus: e.target.value })}
                                >
                                    <option value="" className="bg-zinc-900 text-white/40 select-none">Select a game</option>
                                    {availableGames.map(game => (
                                        <option key={game._id} value={game.title} className="bg-zinc-900 text-white">
                                            {game.title}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex gap-4 pt-4">
                                <Button type="button" variant="ghost" className="flex-1" onClick={() => setShowCreateModal(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit" variant="primary" className="flex-1">
                                    Create
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                <div className="p-4 border-b border-white/10 relative">
                    <Search className="absolute left-7 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                    <Input
                        placeholder="Search teams..."
                        className="pl-10 bg-black/20"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="p-8 text-center text-white/40 font-bold uppercase tracking-widest animate-pulse">
                            Loading Teams...
                        </div>
                    ) : filteredTeams.length === 0 ? (
                        <div className="p-8 text-center text-white/40 font-bold uppercase tracking-widest">
                            No Teams Found
                        </div>
                    ) : (
                        <table className="w-full text-left">
                            <thead className="bg-white/5 text-xs uppercase font-bold text-white/60">
                                <tr>
                                    <th className="p-4">Team</th>
                                    <th className="p-4">Tag</th>
                                    <th className="p-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/10">
                                {filteredTeams.map((team) => (
                                    <tr key={team._id} className="hover:bg-white/5 transition-colors">
                                        <td className="p-4 font-bold flex items-center gap-2">
                                            <div className="w-8 h-8 rounded bg-white/10 flex items-center justify-center overflow-hidden">
                                                {team.logo ? (
                                                    <img src={team.logo} alt={team.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <Shield className="w-4 h-4 text-primary" />
                                                )}
                                            </div>
                                            {team.name}
                                        </td>
                                        <td className="p-4 text-sm text-white/60">{team.tag}</td>
                                        <td className="p-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <Link href={`/admin/teams/edit/${team._id}`}>
                                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                        <Edit className="w-4 h-4" />
                                                    </Button>
                                                </Link>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-red-500 hover:bg-red-500/10"
                                                    onClick={() => handleDelete(team._id, team.name)}
                                                >
                                                    <Ban className="w-4 h-4" />
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
