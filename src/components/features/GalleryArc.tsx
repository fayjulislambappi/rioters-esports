"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import NextImage from "next/image";

export default function GalleryArc() {
    const [images, setImages] = useState<string[]>([]);
    const [mode, setMode] = useState("INDIVIDUAL");
    const [masterImage, setMasterImage] = useState("");

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await fetch("/api/admin/settings");
                const data = await res.json();
                if (res.ok) {
                    if (data.galleryImages) setImages(data.galleryImages);
                    if (data.galleryMode) setMode(data.galleryMode);
                    if (data.slicedImageUrl) setMasterImage(data.slicedImageUrl);
                }
            } catch (error) {
                console.error("Failed to fetch gallery images:", error);
            }
        };
        fetchSettings();
    }, []);

    // Helper to calculate Y offset for the arch (Parabolic curve)
    // Formula: y = intensity * (index - center)^2
    const getTranslateY = (index: number) => {
        const center = 4.5; // Midpoint of 0-9
        const intensity = 8; // Adjust for arch "steepness"
        const offset = Math.pow(index - center, 2) * intensity;
        return offset;
    };

    return (
        <section className="py-24 bg-black overflow-hidden relative">
            <div className="container mx-auto px-4">
                <div className="text-center mb-24">
                    <span className="text-primary text-sm font-bold uppercase tracking-[0.3em]">Visual Chronicles</span>
                    <h2 className="text-4xl md:text-5xl font-black uppercase mt-4">
                        Elite <span className="text-outline">Gallery</span>
                    </h2>
                </div>

                <div className="flex md:justify-center items-end gap-2 md:gap-4 overflow-x-auto md:overflow-visible pb-8 px-4 snap-x no-scrollbar">
                    {Array.from({ length: 10 }).map((_, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 100 }}
                            whileInView={{
                                opacity: 1,
                                y: getTranslateY(index)
                            }}
                            viewport={{ once: true }}
                            transition={{
                                duration: 0.8,
                                delay: index * 0.1,
                                ease: "easeOut"
                            }}
                            className="relative group cursor-pointer shrink-0 snap-center"
                            style={{
                                width: '80px',
                                height: '410px'
                            }}
                        >
                            {/* Inner Box with Border & Glow */}
                            <div className="absolute inset-0 border border-white/10 rounded-lg overflow-hidden transition-all duration-500 group-hover:border-primary group-hover:shadow-[0_0_30px_rgba(255,46,46,0.3)] bg-white/5">
                                {mode === "SLICED" && masterImage ? (
                                    <div
                                        className="w-full h-full"
                                        style={{
                                            backgroundImage: `url(${masterImage})`,
                                            backgroundSize: `${(10 * 80) + (9 * 16)}px 410px`,
                                            backgroundPosition: `-${index * (80 + 16)}px ${-getTranslateY(index)}px`,
                                            backgroundRepeat: 'no-repeat'
                                        }}
                                    />
                                ) : images[index] ? (
                                    <NextImage
                                        src={images[index]}
                                        alt={`Gallery ${index + 1}`}
                                        fill
                                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center opacity-10">
                                        <span className="text-[10px] font-black uppercase -rotate-90">No Data</span>
                                    </div>
                                )}

                                {/* Overlay Gradient */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />

                                {/* Hover Indicator */}
                                <div className="absolute bottom-4 left-0 right-0 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <div className="w-1 h-4 bg-primary rounded-full animate-bounce" />
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Background decorative line */}
            <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
        </section>
    );
}
