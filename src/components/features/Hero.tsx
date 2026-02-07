"use client";

import { motion } from "framer-motion";
import Button from "@/components/ui/Button";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { ChevronDown } from "lucide-react";
import { useState, useEffect } from "react";
import NextImage from "next/image";

export default function Hero() {
    const { status } = useSession();
    const [images, setImages] = useState<string[]>([]);
    const [style, setStyle] = useState("ARCH");
    const [mode, setMode] = useState("INDIVIDUAL");
    const [masterImage, setMasterImage] = useState("");

    useEffect(() => {
        const fetchBranding = async () => {
            try {
                const res = await fetch("/api/admin/settings");
                const data = await res.json();
                if (res.ok) {
                    if (data.galleryImages) setImages(data.galleryImages);
                    if (data.galleryStyle) setStyle(data.galleryStyle);
                    if (data.galleryMode) setMode(data.galleryMode);
                    if (data.slicedImageUrl) setMasterImage(data.slicedImageUrl);
                }
            } catch (error) {
                console.error("Failed to fetch gallery images:", error);
            }
        };
        fetchBranding();
    }, []);

    const scrollToNext = () => {
        window.scrollTo({
            top: window.innerHeight,
            behavior: "smooth"
        });
    };

    const getLayoutProps = (index: number) => {
        const center = 4.5;
        const diff = Math.abs(index - center);

        if (style === "EYE") {
            // "Eye" (Diamond) style: Outer boxes scale down to form an eye shape
            const scale = 1 - (diff * 0.08);
            return { y: 0, scaleY: scale };
        } else {
            // "ARCH" style: Parabolic curve (Bridge)
            const intensity = 8;
            const translateY = Math.pow(diff, 2) * intensity;
            return { y: translateY, scaleY: 1 };
        }
    };

    return (
        <section className="relative h-[90vh] flex flex-col items-center justify-center overflow-hidden bg-black">
            {/* Arched/Diamond Gallery Background */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <style jsx global>{`
                    :root {
                        --hero-slice-w: 60px;
                        --hero-slice-h: 270px;
                        --hero-gap: 8px;
                    }
                    @media (min-width: 768px) {
                        :root {
                            --hero-slice-w: 80px;
                            --hero-slice-h: 360px;
                            --hero-gap: 12px;
                        }
                    }
                    @media (min-width: 1024px) {
                        :root {
                            --hero-slice-w: 120px;
                            --hero-slice-h: 541.9px;
                            --hero-gap: 16px;
                        }
                    }
                `}</style>
                <div className="flex justify-center items-center gap-[var(--hero-gap)] flex-nowrap pt-10">
                    {Array.from({ length: 10 }).map((_, index) => {
                        const { y, scaleY } = getLayoutProps(index);
                        // Visibility logic: 
                        // Mobile: Show 4 center items (3,4,5,6)
                        // Tablet: Show 6 items (2,3,4,5,6,7)
                        // Desktop: Show all
                        const isHiddenMobile = index < 3 || index > 6;
                        const isHiddenTablet = index < 2 || index > 7;

                        return (
                            <motion.div
                                key={`${style}-${index}`}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{
                                    opacity: 1,
                                    scale: 1,
                                    y: y,
                                    scaleY: scaleY
                                }}
                                transition={{
                                    duration: 1.2,
                                    delay: index * 0.05,
                                    ease: [0.2, 0.65, 0.3, 0.9]
                                }}
                                className={`relative overflow-hidden border border-white/10 rounded-lg bg-white/5 shrink-0 ${isHiddenMobile ? 'hidden sm:block' : ''} ${isHiddenTablet ? 'sm:hidden lg:block' : ''}`}
                                style={{
                                    width: 'var(--hero-slice-w)',
                                    height: 'var(--hero-slice-h)',
                                }}
                            >
                                {mode === "SLICED" && masterImage ? (
                                    <div
                                        className="w-full h-full"
                                        style={{
                                            backgroundImage: `url(${masterImage})`,
                                            // Calculate total width based on 10 items regardless of visibility to keep alignment correct
                                            backgroundSize: `calc((10 * var(--hero-slice-w)) + (9 * var(--hero-gap))) calc(var(--hero-slice-h) / ${scaleY})`,
                                            backgroundPosition: `calc(-1 * ${index} * (var(--hero-slice-w) + var(--hero-gap))) calc(-1 * ${y}px / ${scaleY})`,
                                            backgroundRepeat: 'no-repeat'
                                        }}
                                    />
                                ) : images[index] && (
                                    <NextImage
                                        src={images[index]}
                                        alt={`Hero Gallery ${index + 1}`}
                                        fill
                                        className="object-cover"
                                        priority={index > 3 && index < 7}
                                    />
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-40" />
                            </motion.div>
                        );
                    })}
                </div>
            </div>

            {/* Overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent pointer-events-none z-10" />

            {/* Content Container */}
            <div className="container px-4 text-center z-20 mt-auto mb-32">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link href="/tournaments">
                            <Button size="lg" variant="primary" className="w-full sm:w-auto px-12 py-7 text-xl tracking-[0.2em] uppercase font-black italic hover:scale-105 transition-transform shadow-[0_0_50px_rgba(255,46,46,0.3)]">
                                Enter Arena
                            </Button>
                        </Link>
                        {status !== "authenticated" && (
                            <Link href="/register">
                                <Button size="lg" variant="outline" className="w-full sm:w-auto px-12 py-7 text-xl tracking-[0.2em] uppercase font-black italic hover:scale-105 transition-transform">
                                    Join Squad
                                </Button>
                            </Link>
                        )}
                    </div>
                </motion.div>
            </div>

            {/* Scroll Down Indicator */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5, duration: 1 }}
                className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 cursor-pointer"
                onClick={scrollToNext}
            >
                <motion.div
                    animate={{ y: [0, 10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="flex flex-col items-center gap-2"
                >
                    <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/40">Initiate</span>
                    <div className="w-6 h-10 border-2 border-white/20 rounded-full flex justify-center p-1">
                        <motion.div
                            animate={{ y: [0, 12, 0] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                            className="w-1 h-2 bg-primary rounded-full"
                        />
                    </div>
                    <ChevronDown className="w-4 h-4 text-primary" />
                </motion.div>
            </motion.div>
        </section>
    );
}
