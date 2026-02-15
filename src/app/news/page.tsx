"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import Button from "@/components/ui/Button";
import { ArrowRight, Calendar, User, Loader } from "lucide-react";
import Card from "@/components/ui/Card";
import { format } from "date-fns";

export default function NewsPage() {
    const [articles, setArticles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNews = async () => {
            try {
                const res = await fetch("/api/admin/news");
                const data = await res.json();
                if (res.ok) {
                    setArticles(data);
                }
            } catch (error) {
                console.error("Failed to fetch news:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchNews();
    }, []);

    return (
        <div className="container mx-auto px-4 py-12">
            <div className="mb-12 text-center">
                <span className="text-secondary text-sm font-bold uppercase tracking-widest mb-2 block">Latest Updates</span>
                <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter">
                    Rioters <span className="text-white text-outline">News</span>
                </h1>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[...Array(3)].map((_, i) => (
                        <Card key={i} className="p-0 overflow-hidden animate-pulse aspect-[4/5] flex items-center justify-center">
                            <Loader className="w-8 h-8 animate-spin text-white/10" />
                        </Card>
                    ))}
                </div>
            ) : articles.length === 0 ? (
                <div className="py-20 text-center">
                    <h2 className="text-2xl font-black uppercase text-white/10 italic">Quiet on the battlefield. No news yet.</h2>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {articles.map((article) => (
                        <Link key={article._id} href={`/news/${article.slug}`}>
                            <Card className="p-0 overflow-hidden flex flex-col h-full group cursor-pointer border-white/5 hover:border-primary/30 transition-all duration-300">
                                <div className="relative h-48 w-full overflow-hidden">
                                    <Image src={article.image || "/logo.svg"} alt={article.title} fill className="object-cover group-hover:scale-110 transition-transform duration-500" />
                                    <div className="absolute top-4 left-4 bg-primary text-black text-[10px] font-black px-2 py-0.5 rounded uppercase">
                                        {article.category}
                                    </div>
                                </div>

                                <div className="p-6 flex-1 flex flex-col">
                                    <div className="flex items-center text-xs text-white/40 mb-3 space-x-3">
                                        <span className="flex items-center"><Calendar className="w-3 h-3 mr-1" /> {format(new Date(article.createdAt), "MMM dd, yyyy")}</span>
                                        <span className="flex items-center"><User className="w-3 h-3 mr-1" /> {article.author}</span>
                                    </div>

                                    <h2 className="text-xl font-bold uppercase mb-3 leading-tight group-hover:text-primary transition-colors line-clamp-2">
                                        {article.title}
                                    </h2>
                                    <p className="text-white/60 text-sm mb-6 flex-1 line-clamp-3">
                                        {article.excerpt}
                                    </p>

                                    <Button variant="outline" size="sm" className="w-full group-hover:bg-primary group-hover:text-black transition-colors">
                                        Read More
                                    </Button>
                                </div>
                            </Card>
                        </Link>
                    ))}
                </div>
            )}
            {/* Join Community CTA */}
            {!loading && articles.length > 0 && (
                <div className="mt-20 relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-blue-500/20 to-primary/20 rounded-[2rem] blur-xl opacity-30 group-hover:opacity-60 transition duration-1000"></div>
                    <div className="relative bg-[#0a0a0a] border border-white/5 p-8 md:p-16 rounded-[2rem] text-center overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[100px] -mr-32 -mt-32" />
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/5 blur-[100px] -ml-32 -mb-32" />

                        <div className="relative z-10 max-w-2xl mx-auto space-y-8">
                            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter leading-tight">
                                Stay Synced with <br /> <span className="text-primary text-outline">The Intelligence Hub</span>
                            </h2>
                            <p className="text-white/40 font-bold uppercase tracking-[0.2em] text-xs md:text-sm">
                                Join our official channels for real-time tournament alerts, <br className="hidden md:block" /> community events, and tactical field reports.
                            </p>
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                <a href="https://discord.gg/chCdqeuF7a" target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
                                    <Button variant="primary" className="w-full sm:px-12 py-6 h-auto text-lg">Join Discord</Button>
                                </a>
                                <a href="https://x.com/rioters_gamingX" target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
                                    <Button variant="outline" className="w-full sm:px-12 py-6 h-auto text-lg hover:bg-white hover:text-black transition-all">Follow on X</Button>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
