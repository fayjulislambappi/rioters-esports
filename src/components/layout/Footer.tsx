"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Twitter, Twitch, Youtube, Instagram, Mail } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

export default function Footer() {
    const [logoUrl, setLogoUrl] = useState("/logo.png");
    const [siteName, setSiteName] = useState("RIOTERS ESPORTS");

    useEffect(() => {
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

    return (
        <footer className="bg-black border-t border-white/10 pt-16 pb-8">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                    {/* Brand */}
                    <div className="space-y-6">
                        <Link href="/" className="block">
                            <div className="relative w-72 h-32">
                                <Image src={logoUrl} alt={siteName} fill className="object-contain object-left" />
                            </div>
                        </Link>
                        <p className="text-white/60 text-sm max-w-xs">
                            The ultimate platform for competitive gaming. Join tournaments,
                            build teams, and rise to the top of the leaderboard.
                        </p>
                        <div className="flex space-x-4">
                            <a href="#" className="text-white/60 hover:text-primary transition-colors">
                                <Twitter className="w-5 h-5" />
                            </a>
                            <a href="#" className="text-white/60 hover:text-secondary transition-colors">
                                <Twitch className="w-5 h-5" />
                            </a>
                            <a href="#" className="text-white/60 hover:text-accent transition-colors">
                                <Youtube className="w-5 h-5" />
                            </a>
                            <a href="#" className="text-white/60 hover:text-white transition-colors">
                                <Instagram className="w-5 h-5" />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-white font-bold uppercase mb-6">Platform</h3>
                        <ul className="space-y-3 text-sm text-white/60">
                            <li><Link href="/tournaments" className="hover:text-primary transition-colors">Tournaments</Link></li>
                            <li><Link href="/games" className="hover:text-primary transition-colors">Games</Link></li>
                            <li><Link href="/teams" className="hover:text-primary transition-colors">Teams</Link></li>
                            <li><Link href="/shop" className="hover:text-primary transition-colors">Shop</Link></li>
                        </ul>
                    </div>

                    {/* Support */}
                    <div>
                        <h3 className="text-white font-bold uppercase mb-6">Support</h3>
                        <ul className="space-y-3 text-sm text-white/60">
                            <li><Link href="/faq" className="hover:text-primary transition-colors">FAQ</Link></li>
                            <li><Link href="/rules" className="hover:text-primary transition-colors">Rules & Regulations</Link></li>
                            <li><Link href="/contact" className="hover:text-primary transition-colors">Contact Us</Link></li>
                            <li><Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
                        </ul>
                    </div>

                    {/* Newsletter */}
                    <div>
                        <h3 className="text-white font-bold uppercase mb-6">Newsletter</h3>
                        <p className="text-white/60 text-sm mb-4">
                            Subscribe to get the latest tournament updates and gaming news.
                        </p>
                        <div className="flex flex-col space-y-2">
                            <Input placeholder="Enter your email" className="bg-white/5 border-white/10" />
                            <Button variant="primary">Subscribe</Button>
                        </div>
                    </div>
                </div>

                <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-white/40">
                    <p>&copy; {new Date().getFullYear()} {siteName}. All rights reserved.</p>
                    <div className="flex space-x-6 mt-4 md:mt-0">
                        <Link href="/terms" className="hover:text-white">Terms of Service</Link>
                        <Link href="/privacy" className="hover:text-white">Privacy Policy</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
