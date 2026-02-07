"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const { data: session, status } = useSession();
    const router = useRouter();

    // Basic client-side protection (Server-side Middleware recommended for production)
    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        } else if (status === "authenticated" && session?.user?.role !== "ADMIN") {
            router.push("/");
        }
    }, [status, session, router]);

    if (status === "loading") return <div className="h-screen flex items-center justify-center text-primary">Loading Admin Panel...</div>;

    if (session?.user?.role !== "ADMIN") return null;

    return (
        <div className="min-h-screen bg-background">
            <AdminSidebar />
            <div className="ml-64 p-8">
                {children}
            </div>
        </div>
    );
}
