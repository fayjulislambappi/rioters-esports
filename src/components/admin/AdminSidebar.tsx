"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
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

    return (
        <div className="w-64 bg-black/50 border-r border-white/10 h-screen fixed left-0 top-0 flex flex-col backdrop-blur-xl">
            <div className="p-6">
                <h2 className="text-xl font-black uppercase tracking-widest text-white/50 mb-8">
                    Admin <span className="text-primary">Panel</span>
                </h2>

                <nav className="space-y-2">
                    {adminNavItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;

                        return (
                            <Link key={item.href} href={item.href}>
                                <div className={cn(
                                    "flex items-center px-4 py-3 rounded-lg transition-colors group",
                                    isActive
                                        ? "bg-primary/20 text-primary border border-primary/20"
                                        : "text-white/60 hover:bg-white/5 hover:text-white"
                                )}>
                                    <Icon className={cn("w-5 h-5 mr-3", isActive ? "text-primary" : "text-white/40 group-hover:text-white")} />
                                    <span className="font-bold text-sm uppercase tracking-wide">{item.name}</span>
                                </div>
                            </Link>
                        );
                    })}
                    <button
                        onClick={() => signOut({ callbackUrl: "/admin-login" })}
                        className="w-full flex items-center px-4 py-3 rounded-lg transition-colors group text-white/60 hover:bg-white/5 hover:text-white"
                    >
                        <LogOut className="w-5 h-5 mr-3 text-white/40 group-hover:text-white" />
                        <span className="font-bold text-sm uppercase tracking-wide">Logout</span>
                    </button>
                </nav>
            </div>

            <div className="mt-auto p-6 border-t border-white/10">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                        AD
                    </div>
                    <div>
                        <div className="text-sm font-bold">Admin User</div>
                        <div className="text-xs text-white/40">Super Admin</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
