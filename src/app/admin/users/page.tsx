"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { Search, User, Ban } from "lucide-react";

import { useEffect } from "react";
import { toast } from "react-hot-toast";

export default function AdminUsersPage() {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    const fetchUsers = async () => {
        try {
            const res = await fetch("/api/admin/users");
            const data = await res.json();
            if (res.ok) {
                setUsers(data);
            } else {
                toast.error(data.error || "Failed to fetch users");
            }
        } catch (error) {
            toast.error("An error occurred while fetching users");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Are you sure you want to remove ${name}?`)) return;

        try {
            const res = await fetch(`/api/admin/users?id=${id}`, {
                method: "DELETE",
            });

            if (res.ok) {
                toast.success("User removed successfully");
                fetchUsers();
            } else {
                const data = await res.json();
                toast.error(data.error || "Failed to remove user");
            }
        } catch (error) {
            toast.error("An error occurred");
        }
    };

    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div>
            <h1 className="text-3xl font-black uppercase tracking-tighter mb-8">Manage Users</h1>

            <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                <div className="p-4 border-b border-white/10 relative">
                    <Search className="absolute left-7 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                    <Input
                        placeholder="Search users..."
                        className="pl-10 bg-black/20"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="p-8 text-center text-white/40 font-bold uppercase tracking-widest animate-pulse">
                            Loading Users...
                        </div>
                    ) : filteredUsers.length === 0 ? (
                        <div className="p-8 text-center text-white/40 font-bold uppercase tracking-widest">
                            No Users Found
                        </div>
                    ) : (
                        <table className="w-full text-left">
                            <thead className="bg-white/5 text-xs uppercase font-bold text-white/60">
                                <tr>
                                    <th className="p-4">User</th>
                                    <th className="p-4">Email</th>
                                    <th className="p-4">Role</th>
                                    <th className="p-4">Status</th>
                                    <th className="p-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/10">
                                {filteredUsers.map((user) => (
                                    <tr key={user._id} className="hover:bg-white/5 transition-colors">
                                        <td className="p-4 font-bold flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center overflow-hidden">
                                                {user.image ? (
                                                    <img src={user.image} alt={user.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <User className="w-4 h-4 text-white/40" />
                                                )}
                                            </div>
                                            {user.name}
                                        </td>
                                        <td className="p-4 text-sm text-white/60">{user.email}</td>
                                        <td className="p-4 text-sm font-bold">
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] ${user.role === 'ADMIN' ? 'bg-primary/20 text-primary' : 'bg-secondary/20 text-secondary'}`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="p-4 text-sm">
                                            {user.isBanned ? (
                                                <span className="text-red-500 font-bold uppercase text-[10px] flex items-center">
                                                    <Ban className="w-3 h-3 mr-1" /> Banned
                                                </span>
                                            ) : (
                                                <span className="text-green-500 font-bold uppercase text-[10px]">Active</span>
                                            )}
                                        </td>
                                        <td className="p-4 text-right space-x-2">
                                            {user.role !== "ADMIN" && (
                                                <>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className={user.isBanned ? "text-green-500 hover:bg-green-500/10" : "text-red-500 hover:bg-red-500/10"}
                                                        onClick={async () => {
                                                            try {
                                                                const res = await fetch("/api/admin/users", {
                                                                    method: "PATCH",
                                                                    headers: { "Content-Type": "application/json" },
                                                                    body: JSON.stringify({ id: user._id, isBanned: !user.isBanned }),
                                                                });
                                                                if (res.ok) {
                                                                    toast.success(user.isBanned ? "User unbanned" : "User banned");
                                                                    fetchUsers();
                                                                }
                                                            } catch (error) {
                                                                toast.error("Failed to update user status");
                                                            }
                                                        }}
                                                    >
                                                        {user.isBanned ? "Unban" : <Ban className="w-4 h-4" />}
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="text-white/20 hover:text-red-500 hover:bg-red-500/10"
                                                        onClick={() => handleDelete(user._id, user.name)}
                                                    >
                                                        Delete
                                                    </Button>
                                                </>
                                            )}
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
