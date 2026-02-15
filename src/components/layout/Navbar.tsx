"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, User as UserIcon, ShoppingCart } from "lucide-react";
import Button from "@/components/ui/Button";
import { useSession, signOut } from "next-auth/react";
import { useCart } from "@/context/CartContext";

const navItems = [
    { name: "Home", href: "/" },
    { name: "Games", href: "/games" },
    { name: "Tournaments", href: "/tournaments" },
    { name: "Teams", href: "/teams" },
    { name: "News", href: "/news" },
    { name: "Shop", href: "/shop" },
];

export default function Navbar({ initialBranding }: { initialBranding?: { siteName: string, logoUrl: string } }) {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);
    const { data: session } = useSession();
    const { toggleCart, cartCount } = useCart();
    const [logoUrl, setLogoUrl] = useState(initialBranding?.logoUrl || "/logo.png");
    const [siteName, setSiteName] = useState(initialBranding?.siteName || "RIOTERS ESPORTS");

    useEffect(() => {
        // Only fetch if initial branding wasn't provided (fallback)
        if (initialBranding) return;

        const fetchBranding = async () => {
            try {
                const res = await fetch("/api/admin/settings");
                const data = await res.json();
                if (res.ok) {
                    if (data.logoUrl) setLogoUrl(data.logoUrl);
                    if (data.siteName) setSiteName(data.siteName);
                }
            } catch (error) {
                console.error("Failed to fetch branding:", error);
            }
        };
        fetchBranding();
    }, []);

    const renderSiteName = () => {
        const parts = siteName.split(" ");
        if (parts.length > 1) {
            return (
                <>
                    {parts[0]}<span className="text-primary ml-1 group-hover:text-white transition-colors">{parts.slice(1).join(" ")}</span>
                </>
            );
        }
        return siteName;
    };

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-black/50 backdrop-blur-xl">
            <div className="container mx-auto px-4">
                <div className="flex h-20 items-center justify-between">
                    {/* Logo */}
                    <Link href="/" className="flex items-center space-x-2 group shrink-0">
                        <div className="relative w-12 h-12 mr-2">
                            <Image src={logoUrl || "/logo.svg"} alt={siteName} fill className="object-contain" sizes="48px" />
                        </div>
                        <span className="text-lg md:text-2xl font-black uppercase tracking-widest text-white italic" style={{ fontFamily: 'var(--font-orbitron)' }}>
                            {renderSiteName()}
                        </span>
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden xl:flex items-center space-x-8">
                        {navItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`text-sm font-bold uppercase tracking-wide transition-colors hover:text-primary ${pathname === item.href ? "text-primary" : "text-white/70"
                                    }`}
                            >
                                {item.name}
                            </Link>
                        ))}
                    </div>

                    {/* Cart & Auth */}
                    <div className="hidden xl:flex items-center space-x-4">
                        <button
                            onClick={toggleCart}
                            className="relative p-2 text-white hover:text-primary transition-colors"
                        >
                            <ShoppingCart className="w-6 h-6" />
                            {cartCount > 0 && (
                                <span className="absolute -top-1 -right-1 bg-primary text-black text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full">
                                    {cartCount}
                                </span>
                            )}
                        </button>

                        {session ? (
                            <div className="flex items-center gap-4">
                                <Link href="/profile" className="text-white hover:text-primary">
                                    <UserIcon className="w-6 h-6" />
                                </Link>
                                {session.user.roles?.includes("ADMIN") && (
                                    <Link href="/admin">
                                        <Button asDiv variant="neon" size="sm">Admin</Button>
                                    </Link>
                                )}
                                <Button variant="ghost" size="sm" onClick={() => signOut()}>
                                    Logout
                                </Button>
                            </div>
                        ) : (
                            <>
                                <Link href="/login">
                                    <Button asDiv variant="ghost" size="sm">
                                        Login
                                    </Button>
                                </Link>
                                <Link href="/register">
                                    <Button asDiv variant="primary" size="sm">
                                        Join Now
                                    </Button>
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        className="xl:hidden text-white"
                        onClick={() => setIsOpen(!isOpen)}
                    >
                        {isOpen ? <X /> : <Menu />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "100vh" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="xl:hidden fixed top-20 left-0 right-0 bottom-0 bg-black/95 backdrop-blur-xl border-t border-white/10 z-40 overflow-y-auto"
                    >
                        <div className="container mx-auto px-4 py-8 flex flex-col space-y-6">
                            {navItems.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setIsOpen(false)}
                                    className={`text-2xl font-black uppercase tracking-widest transition-colors ${pathname === item.href ? "text-primary italic" : "text-white/70 hover:text-white"
                                        }`}
                                >
                                    {item.name}
                                </Link>
                            ))}
                            <hr className="border-white/10 my-4" />
                            {session ? (
                                <div className="flex flex-col gap-4">
                                    <div className="flex items-center justify-between">
                                        <Link href="/profile" onClick={() => setIsOpen(false)} className="text-xl font-bold uppercase text-white hover:text-primary">Profile</Link>
                                    </div>
                                    {session.user.roles?.includes("ADMIN") && (
                                        <Link href="/admin" onClick={() => setIsOpen(false)}>
                                            <Button asDiv variant="neon" size="lg" className="w-full">Admin Panel</Button>
                                        </Link>
                                    )}
                                    <Button variant="outline" onClick={() => signOut()} className="w-full">Logout Protocol</Button>
                                </div>
                            ) : (
                                <div className="flex flex-col space-y-4">
                                    <Link href="/login" onClick={() => setIsOpen(false)}>
                                        <Button asDiv variant="ghost" className="w-full text-lg h-12">
                                            Login
                                        </Button>
                                    </Link>
                                    <Link href="/register" onClick={() => setIsOpen(false)}>
                                        <Button asDiv variant="primary" className="w-full text-lg h-12">
                                            Join Now
                                        </Button>
                                    </Link>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}
