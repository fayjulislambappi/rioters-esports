"use client";

import { useState, useEffect } from "react";
import Button from "@/components/ui/Button";
import { Check, X, Shield, User, Loader, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { toast } from "react-hot-toast";

export default function AdminApplicationsPage() {
    const [applications, setApplications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchApplications = async () => {
        try {
            const res = await fetch("/api/admin/teams/applications");
            const data = await res.json();
            if (res.ok) {
                setApplications(data);
            } else {
                toast.error(data.error || "Failed to fetch applications");
            }
        } catch (error) {
            toast.error("An error occurred");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchApplications();
    }, []);

    const handleAction = async (id: string, status: "APPROVED" | "REJECTED") => {
        try {
            const res = await fetch("/api/admin/teams/applications", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, status }),
            });

            if (res.ok) {
                toast.success(`Application ${status === "APPROVED" ? "approved" : "rejected"}`);
                fetchApplications();
            } else {
                const data = await res.json();
                toast.error(data.error || "Failed to update application");
            }
        } catch (error) {
            toast.error("An error occurred");
        }
    };

    return (
        <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-4 mb-8">
                <Link href="/admin/teams">
                    <Button variant="ghost" size="sm">
                        <ArrowLeft className="w-4 h-4 mr-2" /> Back
                    </Button>
                </Link>
                <h1 className="text-3xl font-black uppercase tracking-tighter">Team Applications</h1>
            </div>

            <div className="grid gap-6">
                {loading ? (
                    <div className="p-20 flex flex-col items-center justify-center text-white/20">
                        <Loader className="w-12 h-12 animate-spin mb-4" />
                        <span className="font-bold uppercase tracking-widest">Loading Requests...</span>
                    </div>
                ) : applications.length === 0 ? (
                    <div className="bg-white/5 border border-white/10 rounded-xl p-20 text-center">
                        <Shield className="w-16 h-16 text-white/5 mx-auto mb-4" />
                        <h2 className="text-xl font-bold uppercase text-white/40 italic">All quiet. No pending applications.</h2>
                    </div>
                ) : (
                    applications.map((app) => (
                        <div key={app._id} className="bg-white/5 border border-white/10 rounded-xl p-6 hover:border-primary/30 transition-colors flex flex-col md:flex-row items-center gap-6">
                            <div className="flex items-center gap-4 flex-1">
                                <div className="w-12 h-12 rounded-full overflow-hidden bg-white/10 shrink-0">
                                    {app.userId.image ? (
                                        <img src={app.userId.image} alt={app.userId.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <User className="w-6 h-6 text-white/20" />
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg">{app.userId.name}</h3>
                                    <p className="text-sm text-white/40">{app.userId.email}</p>
                                </div>
                                <div className="mx-4 text-primary">
                                    <ArrowLeft className="w-4 h-4 rotate-180" />
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded bg-white/10 flex items-center justify-center">
                                        {app.teamId.logo ? (
                                            <img src={app.teamId.logo} alt={app.teamId.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <Shield className="w-5 h-5 text-primary" />
                                        )}
                                    </div>
                                    <span className="font-black uppercase italic">{app.teamId.name}</span>
                                </div>
                            </div>

                            <div className="flex-1 px-6 border-l border-white/10">
                                <span className="text-[10px] font-black uppercase text-white/20 block mb-1">Message from Player</span>
                                <p className="text-sm text-white/60 italic">"{app.message}"</p>
                            </div>

                            <div className="flex gap-2">
                                <Button
                                    variant="ghost"
                                    className="text-red-500 hover:bg-red-500/10"
                                    onClick={() => handleAction(app._id, "REJECTED")}
                                >
                                    <X className="w-5 h-5" />
                                </Button>
                                <Button
                                    variant="primary"
                                    className="px-8"
                                    onClick={() => handleAction(app._id, "APPROVED")}
                                >
                                    <Check className="w-5 h-5 mr-2" /> Approve
                                </Button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
