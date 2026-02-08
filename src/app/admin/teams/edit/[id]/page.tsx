"use client";

import { useState, useEffect, use } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { MoveLeft, Save, Search, Ban, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import ImageUpload from "@/components/ui/ImageUpload";

interface Captain {
    _id: string;
    name: string;
    email: string;
}

export default function EditTeamPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        tag: "",
        logo: "",
        description: "",
        captainId: "",
        isOfficial: false,
        isBanned: false,
    });

    const [captainSearch, setCaptainSearch] = useState("");
    const [captainSearchResults, setCaptainSearchResults] = useState<Captain[]>([]);
    const [selectedCaptain, setSelectedCaptain] = useState<Captain | null>(null);

    const [members, setMembers] = useState<any[]>([]);
    const [memberSearch, setMemberSearch] = useState("");
    const [memberSearchResults, setMemberSearchResults] = useState<Captain[]>([]);
    const [selectedMemberToAdd, setSelectedMemberToAdd] = useState<Captain | null>(null);
    const [selectedRole, setSelectedRole] = useState("MEMBER");

    useEffect(() => {
        const fetchTeam = async () => {
            try {
                const res = await fetch(`/api/admin/teams/${id}`);
                const data = await res.json();
                if (res.ok) {
                    setFormData({
                        name: data.name,
                        tag: data.tag || "",
                        logo: data.logo || "",
                        description: data.description || "",
                        captainId: data.captainId?._id || data.captainId || "",
                        isOfficial: data.isOfficial || false,
                        isBanned: data.isBanned || false,
                    });

                    if (data.captainId && typeof data.captainId === 'object') {
                        setSelectedCaptain(data.captainId as Captain);
                    }
                    if (data.members) {
                        setMembers(data.members);
                    }
                } else {
                    toast.error("Failed to fetch team data");
                }
            } catch (_error) {
                toast.error("An error occurred while fetching team data");
            } finally {
                setLoading(false);
            }
        };

        fetchTeam();
    }, [id]);

    const handleCaptainSearch = async (query: string) => {
        setCaptainSearch(query);
        if (query.length > 1) {
            try {
                const res = await fetch(`/api/admin/users?search=${query}`);
                const data = await res.json();
                if (res.ok) {
                    setCaptainSearchResults(data.slice(0, 5));
                }
            } catch (_error) {
                console.error("Failed to search users");
            }
        } else {
            setCaptainSearchResults([]);
        }
    };

    const handleMemberSearch = async (query: string) => {
        setMemberSearch(query);
        if (query.length > 1) {
            try {
                const res = await fetch(`/api/admin/users?search=${query}`);
                const data = await res.json();
                if (res.ok) {
                    setMemberSearchResults(data.slice(0, 5));
                }
            } catch (_error) {
                console.error("Failed to search users");
            }
        } else {
            setMemberSearchResults([]);
        }
    };

    const selectCaptain = (user: Captain) => {
        setSelectedCaptain(user);
        setFormData({ ...formData, captainId: user._id });
        setCaptainSearch("");
        setCaptainSearchResults([]);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            const res = await fetch(`/api/admin/teams/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                toast.success("Team updated successfully");
                router.push("/admin/teams");
                router.refresh();
            } else {
                const data = await res.json();
                toast.error(data.error || "Failed to update team");
            }
        } catch (_error) {
            toast.error("An error occurred");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm(`Are you sure you want to delete this team? This action cannot be undone and will remove all members from the roster.`)) return;
        setSaving(true);
        try {
            const res = await fetch(`/api/admin/teams?id=${id}`, {
                method: "DELETE",
            });

            if (res.ok) {
                toast.success("Team deleted successfully");
                router.push("/admin/teams");
                router.refresh();
            } else {
                const data = await res.json();
                toast.error(data.error || "Failed to delete team");
            }
        } catch (_error) {
            toast.error("An error occurred");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="p-8 text-center animate-pulse uppercase font-black tracking-widest text-white/20">Loading Team Data...</div>;
    }

    return (
        <div className="max-w-2xl mx-auto">
            <Link href="/admin/teams" className="inline-block mb-6">
                <Button variant="ghost" size="sm" className="pl-0 hover:bg-transparent hover:text-primary">
                    <MoveLeft className="mr-2 h-4 w-4" /> Back to Teams
                </Button>
            </Link>

            <div className="glass-card p-8">
                <h1 className="text-2xl font-black uppercase tracking-tighter mb-8">Edit Team</h1>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold uppercase text-white/60 mb-2">Team Name</label>
                            <Input
                                placeholder="e.g. Alpha Squad"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold uppercase text-white/60 mb-2">Team Tag</label>
                            <Input
                                placeholder="e.g. ASQD"
                                required
                                value={formData.tag}
                                onChange={(e) => setFormData({ ...formData, tag: e.target.value })}
                            />
                        </div>

                        <div>
                            <ImageUpload
                                label="Team Logo"
                                value={formData.logo}
                                onChange={(url) => setFormData({ ...formData, logo: url })}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold uppercase text-white/60 mb-2">Captain (Optional)</label>
                            {!selectedCaptain ? (
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                                    <Input
                                        placeholder="Search for a user..."
                                        className="pl-10"
                                        value={captainSearch}
                                        onChange={(e) => handleCaptainSearch(e.target.value)}
                                    />
                                    {captainSearchResults.length > 0 && (
                                        <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-zinc-900 border border-white/10 rounded-md shadow-xl max-h-48 overflow-y-auto">
                                            {captainSearchResults.map(user => (
                                                <div
                                                    key={user._id}
                                                    className="p-2 hover:bg-white/5 cursor-pointer flex items-center gap-2"
                                                    onClick={() => selectCaptain(user)}
                                                >
                                                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-[10px] uppercase font-bold text-primary">
                                                        {user.name?.[0] || "U"}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-bold truncate">{user.name}</p>
                                                        <p className="text-xs text-white/40 truncate">{user.email}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="flex items-center justify-between p-3 bg-primary/10 border border-primary/20 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs uppercase font-bold text-primary">
                                            {selectedCaptain.name?.[0] || "U"}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-white">{selectedCaptain.name}</p>
                                            <p className="text-xs text-primary">Selected Captain</p>
                                        </div>
                                    </div>
                                    <Button size="sm" variant="ghost" onClick={() => { setSelectedCaptain(null); setFormData({ ...formData, captainId: "" }); }}>
                                        <Ban className="w-4 h-4 text-white/40 hover:text-red-500" />
                                    </Button>
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-bold uppercase text-white/60 mb-2">Description (Optional)</label>
                            <textarea
                                className="flex min-h-[100px] w-full rounded-md border border-white/20 bg-black/20 px-3 py-2 text-sm text-foreground focus:border-primary/50 focus:outline-none"
                                placeholder="Team description..."
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>

                        <div className="flex items-center gap-2 bg-white/5 p-3 rounded-lg border border-white/10">
                            <input
                                type="checkbox"
                                id="isOfficial"
                                className="w-4 h-4 rounded border-white/20 bg-black/20 text-primary focus:ring-primary"
                                checked={formData.isOfficial}
                                onChange={(e) => setFormData({ ...formData, isOfficial: e.target.checked })}
                            />
                            <label htmlFor="isOfficial" className="text-sm font-bold uppercase text-white cursor-pointer select-none">
                                Official / Top Team
                            </label>
                        </div>
                    </div>

                    {/* Team Members Management */}
                    <div className="pt-8 border-t border-white/10">
                        <h2 className="text-lg font-black uppercase mb-6">Team Members</h2>

                        <div className="space-y-3 mb-8">
                            {(() => {
                                const displayMembers = [...members.filter((m: any) => m !== null)];
                                if (selectedCaptain && !displayMembers.some(m => m._id === selectedCaptain._id)) {
                                    displayMembers.unshift(selectedCaptain);
                                }

                                return displayMembers.length > 0 ? (
                                    displayMembers.map((member) => (
                                        <div key={member._id} className="flex items-center justify-between bg-white/5 border border-white/10 p-3 rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center overflow-hidden">
                                                    {member.image ? (
                                                        <img src={member.image} alt={member.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-white/40 uppercase">
                                                            {member.name?.[0] || "U"}
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <p className="font-bold text-sm">{member.name}</p>
                                                        {(member.role === 'CAPTAIN' || member._id === formData.captainId || (typeof formData.captainId === 'object' && (formData.captainId as any)?._id === member._id)) && (
                                                            <span className="text-[9px] font-black bg-primary/20 text-primary px-1.5 py-0.5 rounded leading-none border border-primary/20">TEAM_LEADER</span>
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-white/40 uppercase">{member.role === 'MEMBER' ? 'TEAM_MEMBER' : member.role || "TEAM_MEMBER"}</p>
                                                </div>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                type="button"
                                                className="text-white/40 hover:text-red-500 transition-colors"
                                                onClick={async () => {
                                                    if (!confirm("Are you sure you want to remove this member?")) return;
                                                    try {
                                                        const res = await fetch(`/api/admin/teams/${id}/members?userId=${member._id}`, { method: 'DELETE' });
                                                        if (res.ok) {
                                                            toast.success("Member removed");
                                                            setMembers(members.filter(m => m._id !== member._id));
                                                        } else {
                                                            const data = await res.json();
                                                            toast.error(data.error || "Failed to remove member");
                                                        }
                                                    } catch (_e) { toast.error("Error removing member"); }
                                                }}
                                                disabled={member._id === (typeof formData.captainId === 'string' ? formData.captainId : (formData.captainId as any)?._id)}
                                            >
                                                <Ban className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-8 border-2 border-dashed border-white/5 rounded-xl text-center">
                                        <p className="text-white/20 font-bold uppercase tracking-widest text-sm italic">
                                            No members in this team yet
                                        </p>
                                    </div>
                                );
                            })()}
                        </div>

                        {/* Add Member Form */}
                        <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-4">
                            <h3 className="text-sm font-bold uppercase text-white/60 mb-1">Add New Member</h3>
                            <div className="space-y-4">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                                    <Input
                                        placeholder="Search user to add..."
                                        className="pl-10"
                                        value={memberSearch}
                                        onChange={(e) => handleMemberSearch(e.target.value)}
                                    />
                                    {memberSearchResults.length > 0 && (
                                        <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-zinc-900 border border-white/10 rounded-md shadow-xl max-h-48 overflow-y-auto">
                                            {memberSearchResults.map(user => (
                                                <div
                                                    key={user._id}
                                                    className="p-2 hover:bg-white/5 cursor-pointer flex items-center gap-2"
                                                    onClick={() => {
                                                        setSelectedMemberToAdd(user);
                                                        setMemberSearchResults([]);
                                                        setMemberSearch(user.name);
                                                    }}
                                                >
                                                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-[10px] uppercase font-bold text-primary">
                                                        {user.name?.[0] || "U"}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-bold truncate">{user.name}</p>
                                                        <p className="text-xs text-white/40 truncate">{user.email}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    <select
                                        className="bg-black/20 border border-white/20 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-primary"
                                        value={selectedRole}
                                        onChange={(e) => setSelectedRole(e.target.value)}
                                    >
                                        <option value="MEMBER">TEAM_MEMBER</option>
                                        <option value="CAPTAIN">Captain</option>
                                    </select>
                                    <Button
                                        type="button"
                                        variant="primary"
                                        disabled={!selectedMemberToAdd}
                                        onClick={async () => {
                                            if (!selectedMemberToAdd) return;
                                            try {
                                                const res = await fetch(`/api/admin/teams/${id}/members`, {
                                                    method: 'POST',
                                                    headers: { 'Content-Type': 'application/json' },
                                                    body: JSON.stringify({ userId: selectedMemberToAdd._id, role: selectedRole })
                                                });
                                                if (res.ok) {
                                                    toast.success("Member added successfully");
                                                    setMembers([...members, { ...selectedMemberToAdd, role: selectedRole }]);
                                                    setSelectedMemberToAdd(null);
                                                    setMemberSearch("");
                                                } else {
                                                    const data = await res.json();
                                                    toast.error(data.error || "Failed to add member");
                                                }
                                            } catch (_e) { toast.error("Error adding member"); }
                                        }}
                                    >
                                        Add Member
                                    </Button>
                                </div>
                            </div>
                            <div className="pt-2">
                                <div className="flex items-center gap-2 bg-white/5 p-3 rounded-lg border border-white/10">
                                    <input
                                        type="checkbox"
                                        id="isBanned"
                                        className="w-4 h-4 rounded border-white/20 bg-black/20 text-red-500 focus:ring-red-500"
                                        checked={formData.isBanned || false}
                                        onChange={(e) => setFormData({ ...formData, isBanned: e.target.checked })}
                                    />
                                    <label htmlFor="isBanned" className="text-sm font-bold uppercase text-red-500 cursor-pointer select-none flex items-center gap-2">
                                        <Ban className="w-4 h-4" /> Ban Team - Cannot Participate in Tournaments
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-between items-center pt-4 border-t border-white/10">
                        <Button
                            type="button"
                            variant="ghost"
                            className="text-red-500 hover:bg-red-500/10"
                            onClick={handleDelete}
                            disabled={saving}
                        >
                            <Trash2 className="w-4 h-4 mr-2" /> Delete Team
                        </Button>
                        <Button type="submit" variant="primary" isLoading={saving}>
                            <Save className="w-4 h-4 mr-2" /> Save Changes
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
