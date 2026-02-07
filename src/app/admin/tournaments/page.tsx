"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Search, Edit, Trash2 } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

import { useEffect } from "react";
import { toast } from "react-hot-toast";

export default function AdminTournamentsPage() {
    const [tournaments, setTournaments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    const fetchTournaments = async () => {
        try {
            const res = await fetch("/api/admin/tournaments");
            const data = await res.json();
            if (res.ok) {
                setTournaments(data);
            } else {
                toast.error(data.error || "Failed to fetch tournaments");
            }
        } catch (error) {
            toast.error("An error occurred while fetching tournaments");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTournaments();
    }, []);

    const handleDelete = async (id: string, title: string) => {
        if (!confirm(`Are you sure you want to delete ${title}?`)) return;

        try {
            const res = await fetch(`/api/admin/tournaments/${id}`, {
                method: "DELETE",
            });

            if (res.ok) {
                toast.success("Tournament deleted successfully");
                fetchTournaments();
            } else {
                const data = await res.json();
                toast.error(data.error || "Failed to delete tournament");
            }
        } catch (error) {
            toast.error("An error occurred");
        }
    };

    const filteredTournaments = tournaments.filter(t =>
        t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.gameId?.title?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-black uppercase tracking-tighter">Manage Tournaments</h1>
                <Link href="/admin/tournaments/new">
                    <Button variant="primary">
                        <Plus className="w-4 h-4 mr-2" /> Add Tournament
                    </Button>
                </Link>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                <div className="p-4 border-b border-white/10 flex gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                        <Input
                            placeholder="Search tournaments..."
                            className="pl-10 bg-black/20"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="p-8 text-center text-white/40 font-bold uppercase tracking-widest animate-pulse">
                            Loading Tournaments...
                        </div>
                    ) : filteredTournaments.length === 0 ? (
                        <div className="p-8 text-center text-white/40 font-bold uppercase tracking-widest">
                            No Tournaments Found
                        </div>
                    ) : (
                        <table className="w-full text-left">
                            <thead className="bg-white/5 text-xs uppercase font-bold text-white/60">
                                <tr>
                                    <th className="p-4">Tournament Name</th>
                                    <th className="p-4">Game</th>
                                    <th className="p-4">Teams Registered</th>
                                    <th className="p-4">Status</th>
                                    <th className="p-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/10">
                                {filteredTournaments.map((t) => (
                                    <tr key={t._id} className="hover:bg-white/5 transition-colors">
                                        <td className="p-4 font-bold">{t.title}</td>
                                        <td className="p-4 text-sm text-white/60">{t.gameId?.title || "Unknown Game"}</td>
                                        <td className="p-4 text-sm">{t.registeredTeams?.length || 0} / {t.maxTeams}</td>
                                        <td className="p-4">
                                            <span className={`text-xs font-bold px-2 py-1 rounded 
                                                ${t.status === 'UPCOMING' ? 'bg-blue-500/20 text-blue-500' :
                                                    t.status === 'ONGOING' ? 'bg-green-500/20 text-green-500' : 'bg-gray-500/20 text-gray-500'}`}>
                                                {t.status}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <Link href={`/admin/tournaments/edit/${t._id}`}>
                                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                        <Edit className="w-4 h-4" />
                                                    </Button>
                                                </Link>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-8 w-8 p-0 text-red-500 hover:text-red-500 hover:bg-red-500/10"
                                                    onClick={() => handleDelete(t._id, t.title)}
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
