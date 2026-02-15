"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
    LayoutDashboard,
    Gamepad,
    Trophy,
    Users,
    Shield,
    Settings,
    LogOut,
    ShoppingBag,
    FileText,
    ClipboardList
} from "lucide-react";
import { cn } from "@/lib/utils";
import Button from "@/components/ui/Button";

const adminNavItems = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Games", href: "/admin/games", icon: Gamepad },
    { name: "Tournaments", href: "/admin/tournaments", icon: Trophy },
    { name: "Teams", href: "/admin/teams", icon: Shield },
    { name: "Players", href: "/admin/players", icon: Users },
    { name: "Applications", href: "/admin/teams/applications", icon: ClipboardList },
    { name: "Users", href: "/admin/users", icon: Users },
    { name: "Shop", href: "/admin/shop", icon: ShoppingBag },
    { name: "Content", href: "/admin/content", icon: FileText },
    { name: "Settings", href: "/admin/settings", icon: Settings },
];

export default function AdminSidebar() {
    const pathname = usePathname();
    const { data: session } = useSession();

    // Get initials or first char of name
    const getInitials = () => {
        if (session?.user?.name) {
            return session.user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
        }
        return "AD";
    };

    return (
        <div className="w-64 bg-black/80 border-r border-white/10 h-screen fixed left-0 top-0 flex flex-col backdrop-blur-2xl z-[100] overflow-hidden">
            {/* BRANDING - FIXED */}
            <div className="p-6 pb-4 shrink-0">
                <h2 className="text-xl font-black uppercase tracking-widest text-white/50">
                    Admin <span className="text-primary">Panel</span>
                </h2>
            </div>

            {/* NAVIGATION - SCROLLABLE */}
            <div className="flex-1 overflow-y-auto px-6 py-2 scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent">
                <nav className="space-y-1 pb-8">
                    {adminNavItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;

                        return (
                            <Link key={item.href} href={item.href}>
                                <div className={cn(
                                    "flex items-center px-4 py-2.5 rounded-lg transition-all duration-200 group",
                                    isActive
                                        ? "bg-primary text-black font-black"
                                        : "text-white/60 hover:bg-white/5 hover:text-white"
                                )}>
                                    <Icon className={cn("w-4 h-4 mr-3", isActive ? "text-black" : "text-white/40 group-hover:text-white")} />
                                    <span className="text-[11px] uppercase tracking-wider">{item.name}</span>
                                </div>
                            </Link>
                        );
                    })}
                    <button
                        onClick={() => signOut({ callbackUrl: "/admin-login" })}
                        className="w-full flex items-center px-4 py-2.5 rounded-lg transition-all duration-200 group text-white/40 hover:bg-red-500/10 hover:text-red-500 mt-4"
                    >
                        <LogOut className="w-4 h-4 mr-3 transition-colors" />
                        <span className="text-[11px] font-bold uppercase tracking-wider">Logout Protocol</span>
                    </button>
                </nav>
            </div>

            {/* PROFILE - FIXED BOTTOM */}
            <div className="p-4 border-t border-white/10 bg-black/60 shrink-0">
                <div className="flex items-center gap-3 p-2 rounded-xl bg-white/5 border border-white/5 shadow-2xl">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-black font-black text-sm shadow-[0_0_15px_rgba(255,18,65,0.3)]">
                        {getInitials()}
                    </div>
                    <div className="overflow-hidden">
                        <div className="text-[11px] font-black text-white uppercase tracking-tight truncate">
                            {session?.user?.name || "Admin Personnel"}
                        </div>
                        <div className="text-[9px] text-primary/80 uppercase font-black tracking-[0.15em] animate-pulse">
                            Secure Access
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
