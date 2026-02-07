"use client";

import { useSession } from "next-auth/react";
import Image from "next/image";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { User, Settings, LogOut, Shield, Trophy } from "lucide-react";
import { signOut } from "next-auth/react";

export default function ProfilePage() {
    const { data: session } = useSession();

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
                            {session.user?.image ? (
                                <Image src={session.user.image} alt={session.user.name || "User"} fill className="object-cover" />
                            ) : (
                                <div className="w-full h-full bg-white/10 flex items-center justify-center">
                                    <User className="w-16 h-16 text-white/40" />
                                </div>
                            )}
                        </div>

                        <h1 className="text-2xl font-black uppercase tracking-wider mb-1">{session.user?.name}</h1>
                        <span className="text-xs font-bold bg-primary/20 text-primary py-1 px-3 rounded uppercase border border-primary/20 mb-6">
                            {session.user?.role || "Agent"}
                        </span>

                        <div className="w-full space-y-3">
                            <Button variant="outline" className="w-full justify-start">
                                <Settings className="w-4 h-4 mr-2" /> Settings
                            </Button>
                            <Button variant="ghost" className="w-full justify-start text-red-500 hover:bg-red-500/10 hover:text-red-500" onClick={() => signOut()}>
                                <LogOut className="w-4 h-4 mr-2" /> Logout
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
                            <div className="text-2xl font-black">Member</div>
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
                    <div className="space-y-4">
                        <div className="flex justify-between items-center bg-white/5 p-4 rounded-lg">
                            <div className="flex items-center">
                                <Shield className="w-10 h-16 mr-4 text-white/20" />
                                <div>
                                    <h3 className="font-bold uppercase">No Team</h3>
                                    <p className="text-sm text-white/60">You are currently a free agent.</p>
                                </div>
                            </div>
                            <Button variant="neon" size="sm">Find Team</Button>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
