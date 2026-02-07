"use client";

import { useState, useEffect } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import ImageUpload from "@/components/ui/ImageUpload";
import { toast } from "react-hot-toast";
import { Save, Loader, Globe, Palette, Trash2, ImageIcon } from "lucide-react";

export default function AdminSettingsPage() {
    const [loading, setLoading] = useState(true);
    const [savingIdentity, setSavingIdentity] = useState(false);
    const [savingGeneral, setSavingGeneral] = useState(false);
    const [savingGallery, setSavingGallery] = useState(false);

    const [settings, setSettings] = useState({
        logoUrl: "",
        faviconUrl: "",
        heroImages: [] as string[],
        galleryImages: Array(10).fill(""),
        galleryStyle: "ARCH",
        galleryMode: "INDIVIDUAL", // INDIVIDUAL or SLICED
        slicedImageUrl: "",
        siteName: "Rioters Esports",
        primaryColor: "#FF2E2E",
    });

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await fetch("/api/admin/settings");
                const data = await res.json();
                if (res.ok) {
                    setSettings((prev) => ({ ...prev, ...data }));
                }
            } catch (error) {
                toast.error("Failed to load settings");
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, []);

    const saveSection = async (sectionKeys: string[], setLoadingState: (val: boolean) => void, sectionName: string) => {
        try {
            setLoadingState(true);
            const batchSettings: any = {};
            sectionKeys.forEach(key => {
                batchSettings[key] = (settings as any)[key];
            });

            const res = await fetch("/api/admin/settings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ settings: batchSettings }),
            });

            if (res.ok) {
                toast.success(`${sectionName} saved successfully`);
            } else {
                toast.error(`Failed to save ${sectionName}`);
            }
        } catch (error) {
            toast.error("An error occurred");
        } finally {
            setLoadingState(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader className="w-10 h-10 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-12">
                <h1 className="text-3xl font-black uppercase tracking-tighter mb-2">Platform Branding</h1>
                <p className="text-white/40 text-sm uppercase font-bold tracking-widest">Global Identity & Assets</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                {/* Visual Assets */}
                <Card className="p-0 border-primary/20 bg-black/40 backdrop-blur-xl overflow-hidden flex flex-col">
                    <div className="p-8 pb-0">
                        <div className="flex items-center gap-3 mb-6">
                            <Palette className="w-5 h-5 text-primary" />
                            <h2 className="text-lg font-black uppercase tracking-tight">Identity Assets</h2>
                        </div>

                        <div className="space-y-6">
                            <ImageUpload
                                label="Main Logo"
                                value={settings.logoUrl}
                                onChange={(url) => setSettings({ ...settings, logoUrl: url })}
                            />

                            <ImageUpload
                                label="Favicon (32x32)"
                                value={settings.faviconUrl}
                                onChange={(url) => setSettings({ ...settings, faviconUrl: url })}
                            />

                            <div className="pt-6 border-t border-white/5">
                                <label className="text-sm font-bold uppercase text-white/60 tracking-widest block mb-4">Hero Slider Photos</label>
                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    {settings.heroImages.length > 0 ? (
                                        settings.heroImages.map((url, index) => (
                                            <div key={index} className="relative aspect-video rounded-lg overflow-hidden border border-white/10 group bg-white/5">
                                                <img src={url} alt={`Hero ${index + 1}`} className="w-full h-full object-cover" />
                                                <button
                                                    onClick={() => {
                                                        const next = [...settings.heroImages];
                                                        next.splice(index, 1);
                                                        setSettings({ ...settings, heroImages: next });
                                                    }}
                                                    className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110 shadow-lg"
                                                >
                                                    <Trash2 className="w-3 h-3" />
                                                </button>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="col-span-2 py-8 border-2 border-dashed border-white/5 rounded-xl flex flex-col items-center justify-center text-white/20">
                                            <ImageIcon className="w-8 h-8 mb-2" />
                                            <span className="text-[10px] font-bold uppercase tracking-widest">No slider photos uploaded</span>
                                        </div>
                                    )}
                                </div>
                                <ImageUpload
                                    label="Add New Hero Photo"
                                    value=""
                                    onChange={(url) => {
                                        if (url) {
                                            setSettings({ ...settings, heroImages: [...settings.heroImages, url] });
                                        }
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                    <div className="p-4 bg-white/5 border-t border-white/10 mt-8 flex justify-end">
                        <Button
                            size="sm"
                            variant="primary"
                            onClick={() => saveSection(['logoUrl', 'faviconUrl', 'heroImages'], setSavingIdentity, "Identity Assets")}
                            disabled={savingIdentity}
                        >
                            {savingIdentity ? <Loader className="w-3 h-3 mr-2 animate-spin" /> : <Save className="w-3 h-3 mr-2" />}
                            Save Identity
                        </Button>
                    </div>
                </Card>

                {/* General Settings */}
                <Card className="p-0 border-secondary/20 bg-black/20 overflow-hidden flex flex-col">
                    <div className="p-8 pb-0">
                        <div className="flex items-center gap-3 mb-6">
                            <Globe className="w-5 h-5 text-secondary" />
                            <h2 className="text-lg font-black uppercase tracking-tight">General Info</h2>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label className="text-sm font-bold uppercase text-white/60 tracking-widest block mb-2">Site Name</label>
                                <input
                                    type="text"
                                    value={settings.siteName}
                                    onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-primary focus:outline-none transition-colors"
                                />
                            </div>

                            <div>
                                <label className="text-sm font-bold uppercase text-white/60 tracking-widest block mb-2">Primary Accent</label>
                                <div className="flex gap-4 items-center">
                                    <input
                                        type="color"
                                        value={settings.primaryColor}
                                        onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                                        className="w-12 h-12 rounded-lg bg-transparent border-none cursor-pointer"
                                    />
                                    <span className="text-mono uppercase font-black tracking-tighter text-2xl">{settings.primaryColor}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="p-4 bg-white/5 border-t border-white/10 mt-8 flex justify-end">
                        <Button
                            size="sm"
                            variant="primary"
                            onClick={() => saveSection(['siteName', 'primaryColor'], setSavingGeneral, "General Settings")}
                            disabled={savingGeneral}
                        >
                            {savingGeneral ? <Loader className="w-3 h-3 mr-2 animate-spin" /> : <Save className="w-3 h-3 mr-2" />}
                            Save Info
                        </Button>
                    </div>
                </Card>
            </div>

            {/* Arched Gallery Management */}
            <Card className="mt-8 p-0 border-accent/20 bg-black/20 overflow-hidden flex flex-col">
                <div className="p-8 pb-0">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                        <div className="flex items-center gap-3">
                            <ImageIcon className="w-5 h-5 text-primary" />
                            <div>
                                <h2 className="text-lg font-black uppercase tracking-tight">Home Page Gallery</h2>
                                <p className="text-white/40 text-[10px] uppercase font-bold tracking-widest mt-1">Layout & Mode configuration</p>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-4">
                            {/* Layout Style */}
                            <div className="flex items-center gap-2 bg-white/5 p-1 rounded-lg border border-white/10">
                                <button
                                    onClick={() => setSettings({ ...settings, galleryStyle: "ARCH" })}
                                    className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-md transition-all ${settings.galleryStyle === "ARCH"
                                        ? "bg-primary text-black"
                                        : "text-white/40 hover:text-white"
                                        }`}
                                >
                                    Arch
                                </button>
                                <button
                                    onClick={() => setSettings({ ...settings, galleryStyle: "EYE" })}
                                    className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-md transition-all ${settings.galleryStyle === "EYE"
                                        ? "bg-primary text-black"
                                        : "text-white/40 hover:text-white"
                                        }`}
                                >
                                    Eye
                                </button>
                            </div>

                            {/* Mode Toggle */}
                            <div className="flex items-center gap-2 bg-white/5 p-1 rounded-lg border border-white/10">
                                <button
                                    onClick={() => setSettings({ ...settings, galleryMode: "INDIVIDUAL" })}
                                    className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-md transition-all ${settings.galleryMode === "INDIVIDUAL"
                                        ? "bg-accent text-black"
                                        : "text-white/40 hover:text-white"
                                        }`}
                                >
                                    Individual
                                </button>
                                <button
                                    onClick={() => setSettings({ ...settings, galleryMode: "SLICED" })}
                                    className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-md transition-all ${settings.galleryMode === "SLICED"
                                        ? "bg-accent text-black"
                                        : "text-white/40 hover:text-white"
                                        }`}
                                >
                                    Sliced Photo
                                </button>
                            </div>
                        </div>
                    </div>

                    {settings.galleryMode === "SLICED" ? (
                        <div className="max-w-xl mx-auto py-8">
                            <div className="mb-6 p-4 rounded-lg bg-secondary/10 border border-secondary/20 flex gap-4 items-center">
                                <div className="p-2 bg-secondary/20 rounded-lg">
                                    <ImageIcon className="w-6 h-6 text-secondary" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-black uppercase tracking-tight">Sliced Master Photo</h3>
                                    <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest">A single image will be spread across all 10 boxes automatically.</p>
                                </div>
                            </div>
                            <ImageUpload
                                value={settings.slicedImageUrl}
                                onChange={(url) => setSettings({ ...settings, slicedImageUrl: url })}
                                label="Upload High-Res Master Image"
                            />
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                            {settings.galleryImages.map((url, index) => (
                                <div key={index} className="space-y-4">
                                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-white/40">
                                        <span>Slot {index + 1}</span>
                                        {index === 4 || index === 5 ? (
                                            <span className="text-primary">Center</span>
                                        ) : index === 0 || index === 9 ? (
                                            <span>Outer</span>
                                        ) : null}
                                    </div>
                                    <ImageUpload
                                        value={url}
                                        onChange={(newUrl) => {
                                            const next = [...settings.galleryImages];
                                            next[index] = newUrl;
                                            setSettings({ ...settings, galleryImages: next });
                                        }}
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                <div className="p-4 bg-white/5 border-t border-white/10 mt-8 flex justify-end">
                    <Button
                        size="sm"
                        variant="neon"
                        onClick={() => saveSection(['galleryImages', 'galleryStyle', 'galleryMode', 'slicedImageUrl'], setSavingGallery, "Gallery Settings")}
                        disabled={savingGallery}
                    >
                        {savingGallery ? <Loader className="w-3 h-3 mr-2 animate-spin" /> : <Save className="w-3 h-3 mr-2" />}
                        Save Gallery
                    </Button>
                </div>
            </Card>

            <div className="mt-12 p-6 rounded-xl border border-white/5 bg-white/5 text-center text-white/40 text-xs font-black uppercase tracking-widest italic">
                Changes applied to identity assets may take a moment to propagate globally across Cached components.
            </div>
        </div>
    );
}
