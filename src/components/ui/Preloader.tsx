"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Orbitron } from "next/font/google";
import Image from "next/image";

const orbitron = Orbitron({
    subsets: ["latin"],
    weight: ["400", "900"],
});

export default function Preloader({ logoUrl }: { logoUrl?: string }) {
    const [progress, setProgress] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Precise progress timing for a "system boot" feel
        const interval = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 100) {
                    clearInterval(interval);
                    setTimeout(() => setIsLoading(false), 800);
                    return 100;
                }

                // Varied increments for realism
                const diff = Math.random() * 15;
                return Math.min(prev + diff, 100);
            });
        }, 120);

        return () => clearInterval(interval);
    }, []);

    return (
        <AnimatePresence mode="wait">
            {isLoading && (
                <motion.div
                    initial={{ opacity: 1 }}
                    exit={{
                        opacity: 0,
                        scale: 1.1,
                        filter: "blur(10px)",
                        transition: { duration: 0.8, ease: "circIn" }
                    }}
                    className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black overflow-hidden font-sans"
                >
                    {/* Retro Grid Background */}
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(255,46,46,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,46,46,0.05)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

                    {/* Content Container */}
                    <div className="relative flex flex-col items-center">
                        {/* Central Glow */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary/20 rounded-full blur-[100px] animate-pulse" />

                        {/* Tech Ring & Logo */}
                        <div className="relative flex items-center justify-center w-48 h-48">
                            <motion.div
                                initial={{ rotate: 0 }}
                                animate={{ rotate: 360 }}
                                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                                className="absolute inset-0 border-2 border-primary/20 border-t-primary rounded-full"
                            >
                                <div className="absolute inset-4 border border-white/5 border-b-primary/40 rounded-full animate-[spin_4s_linear_reverse_infinite]" />
                            </motion.div>

                            {/* Central Logo */}
                            {logoUrl && (
                                <motion.div
                                    initial={{ scale: 0.5, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ delay: 0.3, duration: 0.5 }}
                                    className="relative w-24 h-24 z-10"
                                >
                                    <Image
                                        src={logoUrl}
                                        alt="Logo"
                                        fill
                                        className="object-contain drop-shadow-[0_0_15px_rgba(255,46,46,0.5)]"
                                        priority
                                    />
                                </motion.div>
                            )}
                        </div>

                        {/* Branding */}
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="mt-8 text-center"
                        >
                            <h2 className={`text-2xl font-black tracking-[0.3em] text-white uppercase italic ${orbitron.className}`}>
                                RIOTERS <span className="text-primary">CORE</span>
                            </h2>
                            <div className="flex items-center justify-center gap-2 mt-2">
                                <div className="h-[2px] w-8 bg-primary/40" />
                                <span className="text-[10px] font-bold text-primary tracking-widest uppercase">System Initialization</span>
                                <div className="h-[2px] w-8 bg-primary/40" />
                            </div>
                        </motion.div>

                        {/* Progress Display */}
                        <div className="mt-12 w-64 flex flex-col items-center">
                            <div className="flex justify-between w-full mb-2">
                                <span className="text-[10px] font-black text-white/40 tracking-tighter uppercase">Syncing Data...</span>
                                <span className="text-[10px] font-black text-primary tracking-widest">{Math.round(progress)}%</span>
                            </div>

                            {/* Progress Bar Container */}
                            <div className="w-full h-[6px] bg-white/5 rounded-full overflow-hidden border border-white/10 relative">
                                <motion.div
                                    className="h-full bg-primary relative"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progress}%` }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <div className="absolute top-0 right-0 h-full w-4 bg-white/40 blur-sm" />
                                </motion.div>
                            </div>

                            {/* Dynamic Log Entries */}
                            <div className="mt-4 h-4 overflow-hidden text-center">
                                <motion.p
                                    key={Math.floor(progress / 20)}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="text-[8px] font-mono text-white/30 uppercase tracking-widest"
                                >
                                    {progress < 25 && "> INITIALIZING MODULES..."}
                                    {progress >= 25 && progress < 50 && "> CONNECTING TO DATABASE..."}
                                    {progress >= 50 && progress < 75 && "> LOADING PLAYER PROFILES..."}
                                    {progress >= 75 && progress < 100 && "> RENDERING USER INTERFACE..."}
                                    {progress >= 100 && "> SYSTEM ONLINE"}
                                </motion.p>
                            </div>
                        </div>
                    </div>

                    {/* Corner Tech Decor */}
                    <div className="absolute top-8 left-8 w-12 h-12 border-t-2 border-l-2 border-primary/40" />
                    <div className="absolute top-8 right-8 w-12 h-12 border-t-2 border-r-2 border-primary/10" />
                    <div className="absolute bottom-8 left-8 w-12 h-12 border-b-2 border-l-2 border-primary/10" />
                    <div className="absolute bottom-8 right-8 w-12 h-12 border-b-2 border-r-2 border-primary/40" />
                </motion.div>
            )}
        </AnimatePresence>
    );
}
