"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Card from "@/components/ui/Card";
import { FileText, ArrowLeft, Save, Globe, X, Sparkles } from "lucide-react";
import Link from "next/link";
import NextImage from "next/image";
import ImageUpload from "@/components/ui/ImageUpload";

export default function NewArticlePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: "",
        excerpt: "",
        content: "",
        image: "",
        author: "Rioters Editorial",
        category: "General",
        gallery: [] as string[],
    });

    const categories = ["Tournament", "Update", "Competition", "General"];

    const refineContent = () => {
        let content = formData.content;

        // Auto-refine headings: Convert # Heading to styled HTML
        content = content.replace(/^#\s+(.+)$/gm, '<span class="text-primary font-black uppercase tracking-tighter text-3xl md:text-5xl block my-8 md:my-12">$1</span>');
        content = content.replace(/^##\s+(.+)$/gm, '<span class="text-primary/80 font-black uppercase tracking-tight text-xl md:text-3xl block my-6 md:my-8">$1</span>');
        content = content.replace(/^###\s+(.+)$/gm, '<span class="text-white font-bold uppercase tracking-wide text-lg md:text-xl block my-4 md:my-6">$1</span>');

        setFormData(prev => ({ ...prev, content }));
        toast.success("AI refinement complete! Headings styled.");
    };

    const handleAddGalleryImage = (url: string) => {
        if (url) {
            setFormData(prev => ({ ...prev, gallery: [...prev.gallery, url] }));
        }
    };

    const handleRemoveGalleryImage = (index: number) => {
        setFormData(prev => ({ ...prev, gallery: prev.gallery.filter((_, i) => i !== index) }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch("/api/admin/news", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                toast.success("Article published!");
                router.push("/admin/content");
                router.refresh();
            } else {
                const data = await res.json();
                toast.error(data.error || "Failed to publish article");
            }
        } catch (error) {
            toast.error("An error occurred");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto pb-20">
            <Link href="/admin/content" className="inline-flex items-center text-white/60 hover:text-white mb-6 transition-colors font-bold uppercase text-xs">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Articles
            </Link>

            <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-xl bg-secondary/20 flex items-center justify-center border border-secondary/20">
                    <FileText className="w-6 h-6 text-secondary" />
                </div>
                <div>
                    <h1 className="text-3xl font-black uppercase tracking-tighter">Publish New Article</h1>
                    <p className="text-white/40 text-sm italic uppercase font-bold">Share the latest news with the community</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <Card className="p-8 border-white/10">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold uppercase text-white/60">Article Title</label>
                                <Input
                                    placeholder="e.g. Valorant Champions 2024 Final Standings"
                                    required
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold uppercase text-white/60">Excerpt (Short Summary)</label>
                                <textarea
                                    className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary text-white h-24 text-sm resize-none"
                                    placeholder="A brief summary of the article..."
                                    required
                                    value={formData.excerpt}
                                    onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                                />
                            </div>

                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <label className="text-sm font-bold uppercase text-white/60">Full Content</label>
                                    <Button
                                        type="button"
                                        size="sm"
                                        variant="ghost"
                                        onClick={refineContent}
                                        className="text-primary hover:text-white border border-primary/20 hover:border-primary transition-all px-2 h-7"
                                    >
                                        <Sparkles className="w-3 h-3 mr-1.5" /> Refine Style with AI
                                    </Button>
                                </div>
                                <textarea
                                    className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary text-white h-96 text-sm font-sans"
                                    placeholder="Write the full story here... Use # for main headers and [[IMG:0]] to place images."
                                    required
                                    value={formData.content}
                                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                />
                                <div className="p-4 bg-primary/5 border border-primary/10 rounded-lg">
                                    <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">Editor Pro-Tips</p>
                                    <ul className="text-[10px] text-white/30 space-y-1 list-disc pl-4 uppercase">
                                        <li>Use <span className="text-primary"># Heading</span> then click "Refine" to auto-style.</li>
                                        <li>Inject gallery images anywhere with <span className="text-primary">[[IMG:0]]</span>, <span className="text-primary">[[IMG:1]]</span>, etc.</li>
                                        <li>Separate paragraphs with empty lines for the best reading experience.</li>
                                    </ul>
                                </div>
                            </div>
                        </form>
                    </Card>
                </div>

                <div className="space-y-8">
                    <Card className="p-6 border-white/10">
                        <h3 className="text-sm font-black uppercase mb-4 flex items-center">
                            <Globe className="w-4 h-4 mr-2 text-primary" /> Settings
                        </h3>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase text-white/40">Category</label>
                                <select
                                    className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 focus:outline-none focus:border-primary text-white text-sm"
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                >
                                    {categories.map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase text-white/40">Author</label>
                                <Input
                                    className="h-10 text-sm"
                                    value={formData.author}
                                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                                />
                            </div>

                            <div className="space-y-6 pt-4 border-t border-white/5">
                                <label className="text-[10px] font-bold uppercase text-white/40 tracking-widest">Article Gallery</label>
                                <div className="grid grid-cols-2 gap-3">
                                    {formData.gallery.map((url, idx) => (
                                        <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-white/10 group bg-white/5">
                                            <NextImage src={url} alt={`Gallery ${idx}`} fill className="object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
                                            <div className="absolute top-1 left-1 bg-black/60 px-1.5 py-0.5 rounded text-[8px] font-black uppercase text-primary border border-primary/20">
                                                IMG:{idx}
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveGalleryImage(idx)}
                                                className="absolute top-1 right-1 p-1 bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <X className="w-2 h-2 text-white" />
                                            </button>
                                        </div>
                                    ))}
                                    <div className="aspect-square">
                                        <ImageUpload
                                            value=""
                                            onChange={handleAddGalleryImage}
                                            aspectRatio={16 / 9}
                                        />
                                    </div>
                                </div>
                                <p className="text-[8px] text-white/20 uppercase font-bold italic">Add supplemental images to embed in your story.</p>
                            </div>
                            <div className="space-y-4">
                                <ImageUpload
                                    label="Header Image"
                                    value={formData.image}
                                    onChange={(url) => setFormData({ ...formData, image: url })}
                                />
                            </div>
                        </div>
                    </Card>

                    <Button variant="neon" className="w-full py-6" onClick={handleSubmit} disabled={loading}>
                        <Save className="w-4 h-4 mr-2" /> {loading ? "Publishing..." : "Publish Article"}
                    </Button>
                </div>
            </div>
        </div>
    );
}
