"use client";

import { useState, useEffect } from "react";
import Card from "@/components/ui/Card";
import { Users, Trophy, Shield, DollarSign, Loader } from "lucide-react";
import OrderList from "@/components/admin/OrderList";
import { toast } from "react-hot-toast";

export default function AdminDashboard() {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await fetch("/api/admin/stats");
                const data = await res.json();
                if (res.ok) {
                    setStats(data.stats);
                } else {
                    toast.error(data.error || "Failed to fetch stats");
                }
            } catch (error) {
                toast.error("An error occurred while fetching statistics");
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    const statConfig = stats ? [
        { title: "Total Users", value: stats.totalUsers, icon: Users, color: "text-primary", border: "border-primary/20" },
        { title: "Active Tournaments", value: stats.activeTournaments, icon: Trophy, color: "text-yellow-400", border: "border-yellow-400/20" },
        { title: "Registered Teams", value: stats.totalTeams, icon: Shield, color: "text-secondary", border: "border-secondary/20" },
        { title: "Total Revenue", value: stats.totalRevenue, icon: DollarSign, color: "text-green-400", border: "border-green-400/20" },
    ] : [];

    return (
        <div>
            <h1 className="text-3xl font-black uppercase tracking-tighter mb-8">Dashboard Overview</h1>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {[...Array(4)].map((_, i) => (
                        <Card key={i} className="p-6 border border-white/5 animate-pulse min-h-[120px] flex items-center justify-center">
                            <Loader className="w-5 h-5 animate-spin text-white/20" />
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {statConfig.map((stat, index) => {
                        const Icon = stat.icon;
                        return (
                            <Card key={index} className={`p-6 border ${stat.border}`}>
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-sm font-bold uppercase text-white/60">{stat.title}</h3>
                                    <Icon className={`w-6 h-6 ${stat.color}`} />
                                </div>
                                <p className="text-3xl font-black">{stat.value}</p>
                            </Card>
                        );
                    })}
                </div>
            )}

            <div className="grid grid-cols-1 gap-8">
                <OrderList />
            </div>
        </div>
    );
}
