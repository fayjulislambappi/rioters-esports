"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import React, { useState, useEffect } from "react";

interface AuthLayoutProps {
    children: React.ReactNode;
    title: React.ReactNode;
    subtitle: string;
    brandTag?: string;
}

export default function AuthLayout({ children, title, subtitle, brandTag = "Access Protocol" }: AuthLayoutProps) {
    const [logoUrl, setLogoUrl] = useState("/logo.png");
    const [siteName, setSiteName] = useState("RIOTERS ESPORTS");

    React.useEffect(() => {
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
                    {parts[0]}<span className="text-primary ml-1 group-hover:text-white transition-colors duration-300">{parts.slice(1).join(" ")}</span>
                </>
            );
        }
        return siteName;
    };

    return (
        <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-[#050505] py-4 px-4 sm:px-6 lg:px-8">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 z-0">
                {/* Large Background Glows */}
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.15, 0.25, 0.15],
                    }}
                    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-primary/20 rounded-full blur-[120px]"
                />
                <motion.div
                    animate={{
                        scale: [1, 1.3, 1],
                        opacity: [0.1, 0.2, 0.1],
                    }}
                    transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                    className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-white/5 rounded-full blur-[100px]"
                />

                {/* Grid Overlay */}
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none" />
                <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/80 pointer-events-none" />
            </div>

            {/* Content Container */}
            <div className="relative z-10 w-full max-w-md">
                {/* Branding */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="text-center mb-8"
                >
                    <Link href="/" className="inline-flex flex-col items-center group">
                        <div className="relative w-48 h-48 mb-1 transform group-hover:scale-110 transition-transform duration-500">
                            <Image src={logoUrl} alt={siteName} fill className="object-contain drop-shadow-[0_0_15px_rgba(255,46,46,0.5)]" />
                        </div>
                        <span className="text-3xl font-black uppercase tracking-[0.2em] text-white italic" style={{ fontFamily: 'var(--font-orbitron)' }}>
                            {renderSiteName()}
                        </span>
                    </Link>
                </motion.div>

                {/* Auth Card */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2, ease: [0.23, 1, 0.32, 1] }}
                    className="glass-card border border-white/10 p-8 sm:p-10 relative overflow-hidden group shadow-2xl"
                >
                    {/* Corner Tech Accents */}
                    <div className="absolute top-0 right-0 w-16 h-16 pointer-events-none">
                        <div className="absolute top-0 right-0 w-full h-px bg-gradient-to-l from-primary/50 to-transparent" />
                        <div className="absolute top-0 right-0 w-px h-full bg-gradient-to-b from-primary/50 to-transparent" />
                    </div>
                    <div className="absolute bottom-0 left-0 w-16 h-16 pointer-events-none">
                        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-white/20 to-transparent" />
                        <div className="absolute bottom-0 left-0 w-px h-full bg-gradient-to-t from-white/20 to-transparent" />
                    </div>

                    <div className="relative z-10">
                        <div className="mb-8">
                            <motion.span
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.5 }}
                                className="block text-xs font-bold text-primary uppercase tracking-[0.3em] mb-2"
                            >
                                {brandTag}
                            </motion.span>
                            <h2 className="text-3xl font-black uppercase tracking-tighter text-white">
                                {title}
                            </h2>
                            <p className="mt-2 text-white/50 text-sm">
                                {subtitle}
                            </p>
                        </div>

                        {children}
                    </div>
                </motion.div>

                {/* Footer Link (Back to Home) */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                    className="text-center mt-8"
                >
                    <Link href="/" className="text-xs font-bold uppercase tracking-widest text-white/40 hover:text-white transition-colors flex items-center justify-center gap-2">
                        ← RETURN TO HOME
                    </Link>
                </motion.div>
            </div>
        </div>
    );
}
