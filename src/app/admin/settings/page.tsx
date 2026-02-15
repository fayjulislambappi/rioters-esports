"use client";

import { useState, useEffect } from "react";
import Button from "@/components/ui/Button";
import { Save, RefreshCw, Image as ImageIcon, Globe, Type, Layout, Trash2, Plus } from "lucide-react";
import ImageUpload from "@/components/ui/ImageUpload";
import Image from "next/image";

export default function AdminSettingsPage() {
    // Branding
    const [siteName, setSiteName] = useState("RIOTERS ESPORTS");
    const [logoUrl, setLogoUrl] = useState("/logo.png");
    const [faviconUrl, setFaviconUrl] = useState("/favicon.ico");

    // Hero Gallery
    const [galleryImages, setGalleryImages] = useState<string[]>([]);
    const [galleryStyle, setGalleryStyle] = useState("ARCH"); // ARCH, EYE
    const [galleryMode, setGalleryMode] = useState("INDIVIDUAL"); // INDIVIDUAL, SLICED
    const [slicedImageUrl, setSlicedImageUrl] = useState("");

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    useEffect(() => {
        fetch("/api/admin/settings")
            .then(res => res.json())
            .then(data => {
                if (!data.error) {

                    // Branding
                    if (data.siteName) setSiteName(data.siteName);
                    if (data.logoUrl) setLogoUrl(data.logoUrl);
                    if (data.faviconUrl) setFaviconUrl(data.faviconUrl);

                    // Gallery
                    if (data.galleryImages) setGalleryImages(data.galleryImages);
                    if (data.galleryStyle) setGalleryStyle(data.galleryStyle);
                    if (data.galleryMode) setGalleryMode(data.galleryMode);
                    if (data.slicedImageUrl) setSlicedImageUrl(data.slicedImageUrl);
                }
            });
    }, []);

    const handleAddGalleryImage = (url: string) => {
        if (url) {
            setGalleryImages(prev => [...prev, url]);
        }
    };

    const handleRemoveGalleryImage = (index: number) => {
        setGalleryImages(prev => prev.filter((_, i) => i !== index));
    };

    const handleSave = async () => {
        setLoading(true);
        setMessage("");

        const payload = {
            settings: {
                siteName,
                logoUrl,
                faviconUrl,
                galleryImages,
                galleryStyle,
                galleryMode,
                slicedImageUrl
            }
        };

        try {
            // 1. Update Settings
            const res = await fetch("/api/admin/settings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            const data = await res.json();

            // 2. Trigger OVR Recalculation (Backend handles this if we call the specific endpoint, 
            // but here we are using the generic settings endpoint. 
            // The generic endpoint doesn't automatically trigger OVR recalc.
            // So we should ideally call the branding update AND the role bonus update separately 
            // OR update the generic endpoint to handle side effects.
            // For now, let's just make a separate call to the role-bonuses endpoint to trigger the recalc logic if needed
            // efficiently, or just rely on the generic save.
            // ... Actually, the generic save in /api/admin/settings just saves the kv pairs. 
            // The OVR calculation is triggered by PUT /api/admin/settings/role-bonuses.
            // So let's double tap: Save all settings, then call the role-bonus update to trigger calculation.

            if (res.ok) {
                setMessage("Settings saved successfully!");
            } else {
                setMessage("Error: " + data.error);
            }
        } catch (error) {
            setMessage("Failed to save settings.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto space-y-12 pb-20">
            <h1 className="text-4xl font-bold text-white uppercase tracking-wider mb-8">System Settings</h1>

            {/* BRANDING SECTION */}
            <section className="bg-[#0A0A0A] border border-white/10 rounded-xl p-8 shadow-2xl">
                <div className="flex items-center gap-3 mb-6 border-b border-white/5 pb-4">
                    <Globe className="w-6 h-6 text-primary" />
                    <h2 className="text-2xl font-bold text-white uppercase tracking-wide">Identity & Branding</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="space-y-4 md:col-span-1">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-400 uppercase tracking-wider">Site Name</label>
                            <input
                                type="text"
                                value={siteName}
                                onChange={e => setSiteName(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-primary focus:outline-none transition-colors"
                            />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <ImageUpload
                            label="Logo"
                            value={logoUrl}
                            onChange={setLogoUrl}
                            aspectRatio={1}
                        />
                    </div>

                    <div className="space-y-4">
                        <ImageUpload
                            label="Favicon"
                            value={faviconUrl}
                            onChange={setFaviconUrl}
                            aspectRatio={1}
                            outputFormat="image/png"
                            cropShape="rect"
                        />
                    </div>
                </div>
            </section>

            {/* HERO GALLERY SECTION */}
            <section className="bg-[#0A0A0A] border border-white/10 rounded-xl p-8 shadow-2xl">
                <div className="flex items-center gap-3 mb-6 border-b border-white/5 pb-4">
                    <ImageIcon className="w-6 h-6 text-primary" />
                    <h2 className="2xl font-bold text-white uppercase tracking-wide">Home Page Gallery</h2>
                </div>

                <div className="grid grid-cols-1 gap-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-sm font-bold text-gray-400 uppercase tracking-wider">
                                <Layout className="w-4 h-4" /> Gallery Style
                            </label>
                            <select
                                value={galleryStyle}
                                onChange={e => setGalleryStyle(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-primary focus:outline-none"
                            >
                                <option value="ARCH">Arch (Bridge)</option>
                                <option value="EYE">Eye (Diamond)</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-sm font-bold text-gray-400 uppercase tracking-wider">
                                <Type className="w-4 h-4" /> Display Mode
                            </label>
                            <select
                                value={galleryMode}
                                onChange={e => setGalleryMode(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-primary focus:outline-none"
                            >
                                <option value="INDIVIDUAL">Individual Images</option>
                                <option value="SLICED">Sliced Master Image</option>
                            </select>
                        </div>
                    </div>

                    {galleryMode === "SLICED" ? (
                        <div className="space-y-4">
                            <ImageUpload
                                label="Master Sliced Image"
                                value={slicedImageUrl}
                                onChange={setSlicedImageUrl}
                                aspectRatio={16 / 9}
                            />
                            <p className="text-xs text-gray-500">This image will be sliced across the gallery cards.</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <label className="text-sm font-bold text-gray-400 uppercase tracking-wider">Gallery Images ({galleryImages.length})</label>

                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                {galleryImages.map((url, index) => (
                                    <div key={index} className="relative group aspect-[2/3] bg-white/5 rounded-lg overflow-hidden border border-white/10">
                                        {url ? (
                                            <Image src={url} alt={`Gallery ${index}`} fill className="object-cover" />
                                        ) : (
                                            <div className="absolute inset-0 flex items-center justify-center text-white/5">
                                                <ImageIcon className="w-12 h-12" />
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                            <button
                                                onClick={() => handleRemoveGalleryImage(index)}
                                                className="p-2 bg-red-500/80 hover:bg-red-500 text-white rounded-full transition-colors"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                ))}

                                <div className="aspect-[2/3] bg-white/5 rounded-lg border-2 border-dashed border-white/10 flex flex-col items-center justify-center p-2">
                                    {/* Hack: Use ImageUpload but resetting it immediately after upload to act as an "Add" button */}
                                    {/* Actually a cleaner way: Just have a standalone Upload button state */}
                                    <div className="w-full h-full flex flex-col items-center justify-center">
                                        <ImageUpload
                                            value=""
                                            onChange={handleAddGalleryImage}
                                            label="Add New"
                                            aspectRatio={2 / 3}
                                        />
                                    </div>
                                </div>
                            </div>
                            <p className="text-xs text-gray-500">Provide at least 10 images for best results in the Arch/Eye animation.</p>
                        </div>
                    )}
                </div>
            </section>

            {/* SAVE ACTION */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-black/80 backdrop-blur-lg border-t border-white/10 z-50 flex justify-end items-center gap-6 container mx-auto">
                {message && (
                    <span className={`text-sm font-bold uppercase tracking-wider ${message.startsWith("Error") ? "text-red-500" : "text-green-500"}`}>
                        {message}
                    </span>
                )}
                <Button
                    onClick={handleSave}
                    isLoading={loading}
                    variant="primary"
                    size="lg"
                    className="shadow-[0_0_20px_rgba(255,46,46,0.5)]"
                >
                    <Save className="w-5 h-5 mr-2" />
                    Save System Settings
                </Button>
            </div>
        </div>
    );
}
