"use client";

import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import ScrollToTop from "../ui/ScrollToTop";

export default function ConditionalLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const { data: session, status } = useSession();

    const isAdminRoute = pathname.startsWith("/admin");
    const isAdminLogin = pathname === "/admin-login";
    const isAuthRoute = pathname === "/login" || pathname === "/register";

    // Client-side protection: redirect admins from public routes to admin panel
    useEffect(() => {
        if (status === "authenticated" && session?.user?.role === "ADMIN") {
            // If admin is trying to access a public route (not admin panel or admin login)
            if (!isAdminRoute && !isAdminLogin) {
                router.push("/admin");
            }
        }
    }, [status, session, isAdminRoute, isAdminLogin, router]);

    if (isAdminRoute || isAdminLogin) {
        return <main className="flex-1">{children}</main>;
    }

    return (
        <div className="flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1 pt-20">{children}</main>
            <Footer />
            <ScrollToTop />
        </div>
    );
}
