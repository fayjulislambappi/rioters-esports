"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { User, Settings, Shield, Trophy, X, Camera } from "lucide-react";
import { signOut } from "next-auth/react";
import toast from "react-hot-toast";
import ImageUpload from "@/components/ui/ImageUpload";

export default function ProfilePage() {
    const { data: session, update } = useSession();
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editName, setEditName] = useState("");
    const [editImage, setEditImage] = useState("");
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        const fetchUser = async () => {
            if (session?.user?.id) {
                try {
                    const res = await fetch("/api/user/me");
                    if (res.ok) {
                        const data = await res.json();
                        setUser(data);
                        setEditName(data.name || "");
                        setEditImage(data.image || "");
                    }
                } catch (error) {
                    console.error("Failed to fetch user");
                } finally {
                    setLoading(false);
                }
            }
        };
        fetchUser();
    }, [session]);

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setUpdating(true);

        try {
            const res = await fetch("/api/user/me", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: editName, image: editImage }),
            });

            if (res.ok) {
                const updatedUser = await res.json();
                setUser(updatedUser);
                // Update the global session so navbar etc. reflect the change
                await update();
                toast.success("Profile updated successfully!");
                setIsEditModalOpen(false);
            } else {
                const error = await res.json();
                toast.error(error.error || "Failed to update profile");
            }
        } catch (error) {
            toast.error("Something went wrong");
        } finally {
            setUpdating(false);
        }
    };

    if (!session) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
                    <Button variant="primary" onClick={() => window.location.href = '/login'}>
                        Login to View Profile
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-12">
            <div className="flex flex-col md:flex-row gap-8">

                {/* Sidebar / User Info */}
                <div className="w-full md:w-1/3 space-y-6">
                    <Card className="flex flex-col items-center text-center p-8 border-primary/20">
                        <div className="relative w-32 h-32 mb-6 rounded-full overflow-hidden border-2 border-primary shadow-[0_0_20px_rgba(0,255,153,0.3)]">
                            {(user?.image || session.user?.image) ? (
                                <Image src={user?.image || session.user.image!} alt={user?.name || session.user.name || "User"} fill className="object-cover" />
                            ) : (
                                <div className="w-full h-full bg-white/10 flex items-center justify-center">
                                    <User className="w-16 h-16 text-white/40" />
                                </div>
                            )}
                        </div>

                        <h1 className="text-2xl font-black uppercase tracking-wider mb-1">{user?.name || session.user?.name}</h1>
                        <span className="text-xs font-bold bg-primary/20 text-primary py-1 px-3 rounded uppercase border border-primary/20 mb-6">
                            {user?.role || session.user?.role || "Agent"}
                        </span>

                        <div className="w-full space-y-3">
                            <Button variant="primary" className="w-full justify-start" onClick={() => setIsEditModalOpen(true)}>
                                <User className="w-4 h-4 mr-2" /> Edit Profile
                            </Button>
                            <Button variant="outline" className="w-full justify-start">
                                <Settings className="w-4 h-4 mr-2" /> Settings
                            </Button>
                        </div>
                    </Card>
                </div>

                {/* Main Content */}
                <div className="w-full md:w-2/3 space-y-8">

                    {/* Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                        <Card className="p-6 text-center border-secondary/20">
                            <Trophy className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                            <div className="text-2xl font-black">0</div>
                            <div className="text-xs uppercase font-bold text-white/40">Tournament Wins</div>
                        </Card>
                        <Card className="p-6 text-center border-secondary/20">
                            <Shield className="w-8 h-8 text-secondary mx-auto mb-2" />
                            <div className="text-2xl font-black">
                                {loading ? "..." : (
                                    user?.teams && user.teams.length > 0
                                        ? (user.teams.some((t: any) => t.role === "CAPTAIN") ? "TEAM_CAPTAIN" : "TEAM_MEMBER")
                                        : "Free Agent"
                                )}
                            </div>
                            <div className="text-xs uppercase font-bold text-white/40">Team Role</div>
                        </Card>
                        <Card className="p-6 text-center border-secondary/20">
                            <User className="w-8 h-8 text-primary mx-auto mb-2" />
                            <div className="text-2xl font-black">Active</div>
                            <div className="text-xs uppercase font-bold text-white/40">Status</div>
                        </Card>
                    </div>

                    {/* Recent Activity */}
                    <div className="space-y-4">
                        <h2 className="text-xl font-bold uppercase border-l-4 border-primary pl-4">Recent Activity</h2>
                        <Card className="p-0 overflow-hidden">
                            <div className="p-8 text-center text-white/40 italic">
                                No recent matches or tournament entries found.
                            </div>
                        </Card>
                    </div>

                    {/* Team Status */}
                    {/* Team Status */}
                    <div className="space-y-4">
                        {loading ? (
                            <div className="bg-white/5 p-4 rounded-lg animate-pulse h-24"></div>
                        ) : user?.teams && user.teams.length > 0 ? (
                            <div className="space-y-4">
                                <h3 className="font-bold uppercase text-white/60">My Teams</h3>
                                {user.teams.map((teamEntry: any, index: number) => (
                                    <div key={index} className="flex justify-between items-center bg-white/5 border border-white/10 p-5 rounded-2xl group hover:border-primary/50 transition-all duration-300">
                                        <div className="flex items-center">
                                            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mr-4 border border-primary/20 group-hover:scale-110 transition-transform overflow-hidden">
                                                {teamEntry.teamId?.logo ? (
                                                    <Image
                                                        src={teamEntry.teamId.logo}
                                                        alt={teamEntry.teamId.name}
                                                        width={48}
                                                        height={48}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <Shield className="w-6 h-6 text-primary" />
                                                )}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2 mb-0.5">
                                                    <h3 className="font-black uppercase text-white group-hover:text-primary transition-colors">{teamEntry.teamId?.name || "Unknown Team"}</h3>
                                                    <span className="text-[10px] font-black bg-white/10 text-white/40 px-2 py-0.5 rounded uppercase tracking-tighter">Active</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-xs text-white/40 font-bold uppercase tracking-widest">
                                                    <span>{teamEntry.game}</span>
                                                    <span className="w-1 h-1 rounded-full bg-white/20"></span>
                                                    <span className="text-primary/60">{teamEntry.role}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <Link href={`/teams/${teamEntry.teamId?.slug}`}>
                                            <Button variant="outline" size="sm" className="group-hover:bg-primary group-hover:text-black group-hover:border-primary transition-all">Go to Team HQ</Button>
                                        </Link>
                                    </div>
                                ))}
                                {/* Allow creating new team if not in all games (simplified check) */}
                                <div className="pt-4 border-t border-white/10">
                                    <Link href="/teams/create">
                                        <Button variant="outline" size="sm" className="w-full">Register Another Team</Button>
                                    </Link>
                                </div>
                            </div>
                        ) : (
                            <div className="flex justify-between items-center bg-white/5 p-4 rounded-lg">
                                <div className="flex items-center">
                                    <Shield className="w-10 h-16 mr-4 text-white/20" />
                                    <div>
                                        <h3 className="font-bold uppercase">No Teams</h3>
                                        <p className="text-sm text-white/60">You are currently a free agent.</p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <Link href="/teams">
                                        <Button variant="neon" size="sm">Find Team</Button>
                                    </Link>
                                    <Link href="/teams/create">
                                        <Button variant="primary" size="sm">Create Team</Button>
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>

                </div>
            </div>

            {/* Edit Profile Modal */}
            {isEditModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-zinc-900 border border-white/10 rounded-2xl w-full max-w-md overflow-hidden relative shadow-2xl animate-in zoom-in duration-300">
                        <button
                            onClick={() => setIsEditModalOpen(false)}
                            className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors z-10"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        <div className="p-8">
                            <h2 className="text-2xl font-black uppercase tracking-wider mb-6 flex items-center">
                                <User className="w-6 h-6 mr-3 text-primary" /> Edit Profile
                            </h2>

                            <form onSubmit={handleUpdateProfile} className="space-y-6">
                                <div>
                                    <label className="block text-xs font-bold uppercase text-white/40 mb-2 tracking-widest">Profile Photo</label>
                                    <div className="flex justify-center mb-4">
                                        <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-primary/20 bg-white/5">
                                            {editImage ? (
                                                <Image src={editImage} alt="Preview" fill className="object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <Camera className="w-8 h-8 text-white/20" />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <ImageUpload
                                        value={editImage}
                                        onChange={(url: string) => setEditImage(url)}
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase text-white/40 mb-2 tracking-widest">Display Name</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors"
                                        placeholder="Your Name"
                                        value={editName}
                                        onChange={(e) => setEditName(e.target.value)}
                                    />
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        className="flex-1"
                                        onClick={() => setIsEditModalOpen(false)}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        variant="primary"
                                        className="flex-1"
                                        isLoading={updating}
                                    >
                                        Save Changes
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
