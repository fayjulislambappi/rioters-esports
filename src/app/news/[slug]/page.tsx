"use client";

import { useState, useEffect, use } from "react";
import NextImage from "next/image";
import Link from "next/link";
import { ArrowLeft, Calendar, User, Share2, Tag, Loader } from "lucide-react";
import Button from "@/components/ui/Button";
import { format } from "date-fns";
import Card from "@/components/ui/Card";

export default function ArticleDetailPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = use(params);
    const [article, setArticle] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchArticle = async () => {
            try {
                const res = await fetch(`/api/news/${slug}`);
                const data = await res.json();
                if (res.ok) {
                    setArticle(data);
                }
            } catch (error) {
                console.error("Failed to fetch article:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchArticle();
    }, [slug]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-black">
                <div className="flex flex-col items-center gap-4">
                    <Loader className="w-12 h-12 animate-spin text-primary" />
                    <p className="text-white/20 font-black uppercase tracking-[0.3em] animate-pulse">Relaying Intel...</p>
                </div>
            </div>
        );
    }

    if (!article) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-black px-4 text-center">
                <h1 className="text-6xl font-black uppercase text-white/5 mb-4">404</h1>
                <p className="text-2xl font-bold uppercase text-white/40 mb-8 italic">Intel Lost. This article no longer exists.</p>
                <Link href="/news">
                    <Button variant="outline">Back to News</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black pb-32">
            {/* ARTICLE HERO */}
            <div className="relative h-[50vh] md:h-[70vh] lg:h-[80vh] w-full">
                <NextImage
                    src={article.image || "/logo.svg"}
                    alt={article.title}
                    fill
                    className="object-cover opacity-60"
                    priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

                <div className="absolute inset-0 flex flex-col justify-end">
                    <div className="container mx-auto px-4 pb-8 md:pb-16 lg:pb-24">
                        <Link href="/news" className="inline-flex items-center text-white/60 hover:text-primary mb-6 md:mb-8 transition-colors font-bold uppercase text-[10px] md:text-xs tracking-widest group">
                            <ArrowLeft className="w-3 h-3 md:w-4 md:h-4 mr-2 group-hover:-translate-x-1 transition-transform" /> Back to Intelligence
                        </Link>

                        <div className="flex items-center gap-3 mb-4 md:mb-6">
                            <span className="bg-primary text-black text-[9px] md:text-xs font-black px-2 md:px-3 py-0.5 md:py-1 rounded uppercase tracking-wider">
                                {article.category}
                            </span>
                            <span className="text-white/40 text-[9px] md:text-xs font-bold uppercase tracking-widest flex items-center">
                                <Calendar className="w-3 h-3 md:w-4 md:h-4 mr-1.5 md:mr-2" /> {format(new Date(article.createdAt), "MMMM dd, yyyy")}
                            </span>
                        </div>

                        <h1 className="text-2xl md:text-6xl lg:text-8xl font-black uppercase tracking-tighter leading-[0.9] mb-6 md:mb-8 max-w-5xl">
                            {article.title}
                        </h1>

                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-2.5 md:gap-3">
                                <div className="w-8 h-8 md:w-12 md:h-12 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center">
                                    <User className="w-4 h-4 md:w-6 md:h-6 text-primary" />
                                </div>
                                <div>
                                    <p className="text-[8px] md:text-[10px] font-bold text-white/40 uppercase tracking-widest leading-tight">Reporting</p>
                                    <p className="text-xs md:text-base font-black uppercase text-white tracking-wide">{article.author}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Visual Accent */}
                <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent shadow-[0_0_20px_rgba(255,18,65,0.5)]" />
            </div>

            {/* CONTENT SECTION */}
            <div className="container mx-auto px-4 pt-8 md:pt-16 lg:pt-24">
                <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8 md:gap-12 lg:gap-16">
                    {/* Main Story */}
                    <div className="lg:flex-1">
                        <div className="max-w-4xl">
                            <p className="text-lg md:text-2xl text-white font-bold italic mb-8 md:mb-12 border-l-2 md:border-l-4 border-primary pl-4 md:pl-6 leading-relaxed bg-white/5 py-4 pr-4 rounded-r-lg">
                                {article.excerpt}
                            </p>

                            <div className="prose prose-invert prose-sm md:prose-lg max-w-none space-y-6 md:space-y-10">
                                {article.content.split('\n').map((paragraph: string, i: number) => {
                                    if (!paragraph.trim()) return <br key={i} />;

                                    // 1. Handle Gallery Images [[IMG:0]]
                                    const imgMatch = paragraph.match(/\[\[IMG:(\d+)\]\]/);
                                    if (imgMatch) {
                                        const imgIdx = parseInt(imgMatch[1]);
                                        const imgUrl = article.gallery?.[imgIdx];
                                        if (imgUrl) {
                                            return (
                                                <div key={i} className="my-8 md:my-16 relative group px-2 md:px-0">
                                                    <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-2xl blur-lg opacity-25 group-hover:opacity-60 transition duration-1000 group-hover:duration-200"></div>
                                                    <div className="relative aspect-[16/9] md:aspect-video rounded-lg md:rounded-xl overflow-hidden border border-white/10 bg-black">
                                                        <NextImage
                                                            src={imgUrl}
                                                            alt={`${article.title} visual ${imgIdx}`}
                                                            fill
                                                            className="object-cover hover:scale-105 transition-transform duration-700"
                                                        />
                                                    </div>
                                                    <div className="absolute -bottom-3 right-4 md:right-6 px-3 py-1.5 bg-black md:backdrop-blur-md border border-white/10 rounded-full text-[8px] md:text-[10px] font-black uppercase text-primary tracking-[0.2em] shadow-2xl">
                                                        Intel Visual {imgIdx + 1}
                                                    </div>
                                                </div>
                                            );
                                        }
                                    }

                                    // 2. Handle AI-refined spans/HTML or fallback to paragraph
                                    return (
                                        <div
                                            key={i}
                                            className="text-white/80 leading-relaxed font-medium tracking-wide selection:bg-primary selection:text-white"
                                            dangerouslySetInnerHTML={{ __html: paragraph }}
                                        />
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar / Sharing */}
                    <div className="lg:w-80 space-y-6 md:space-y-8 mt-12 lg:mt-0 pt-12 lg:pt-0 border-t lg:border-t-0 border-white/5">
                        <Card className="p-6 md:p-8 border-white/10 sticky top-24 bg-black/40 backdrop-blur-md">
                            <h3 className="text-xs md:text-sm font-black uppercase mb-6 flex items-center tracking-[0.2em] text-white">
                                <Share2 className="w-3.5 h-3.5 md:w-4 md:h-4 mr-2 text-primary" /> Transmission
                            </h3>
                            <div className="grid grid-cols-2 gap-3 md:gap-4">
                                <a href="https://x.com/rioters_gamingX" target="_blank" rel="noopener noreferrer" className="block w-full">
                                    <Button variant="outline" size="sm" className="w-full text-[10px] md:text-xs hover:bg-white hover:text-black transition-colors">X</Button>
                                </a>
                                <a href="https://discord.gg/chCdqeuF7a" target="_blank" rel="noopener noreferrer" className="block w-full">
                                    <Button variant="outline" size="sm" className="w-full text-[10px] md:text-xs hover:bg-[#5865F2] hover:text-white transition-colors">Discord</Button>
                                </a>
                            </div>

                            <div className="mt-8 pt-8 border-t border-white/5">
                                <h3 className="text-xs md:text-sm font-black uppercase mb-4 flex items-center tracking-[0.2em] text-white/60">
                                    <Tag className="w-3.5 h-3.5 md:w-4 md:h-4 mr-2 text-primary/60" /> Intelligence
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    <span className="text-[9px] md:text-[10px] bg-white/10 border border-white/5 px-2.5 py-1 rounded uppercase font-bold text-white/50 hover:text-white transition-colors cursor-default">#esports</span>
                                    <span className="text-[9px] md:text-[10px] bg-white/10 border border-white/5 px-2.5 py-1 rounded uppercase font-bold text-white/50 hover:text-white transition-colors cursor-default">#rioters</span>
                                    <span className="text-[9px] md:text-[10px] bg-white/10 border border-white/5 px-2.5 py-1 rounded uppercase font-bold text-white/50 hover:text-white transition-colors cursor-default">#{article.category.toLowerCase()}</span>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
