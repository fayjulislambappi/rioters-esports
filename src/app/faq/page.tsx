"use client";

import { useState } from "react";
import { ChevronDown, HelpCircle, Trophy, Shield, User, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const faqs = [
    {
        category: "General",
        icon: HelpCircle,
        questions: [
            {
                q: "What is Rioters Gaming?",
                a: "Rioters Gaming is a premier esports organization dedicated to fostering competitive excellence and community growth. We host professional tournaments, manage elite teams, and provide a platform for players to showcase their skills."
            },
            {
                q: "How can I join the community?",
                a: "Join our official Discord server (https://discord.gg/chCdqeuF7a), follow us on our social media channels (Facebook, X, YouTube, Instagram), and keep an eye on our 'Teams' and 'Recruitment' sections for opportunities."
            }
        ]
    },
    {
        category: "Tournaments",
        icon: Trophy,
        questions: [
            {
                q: "How do I register for a tournament?",
                a: "Navigate to the 'Tournaments' section, select the event you're interested in, and click the 'Register Now' button. Ensure your team meets the roster requirements for that specific game."
            },
            {
                q: "Are there entry fees for tournaments?",
                a: "Entry fees vary by event. Some are free-to-play 'Open Intelligence' tournaments, while major competitive events may have a small entry fee that contributes directly to the prize pool."
            }
        ]
    },
    {
        category: "Account & Security",
        icon: Shield,
        questions: [
            {
                q: "Why should I create an account?",
                a: "An account allows you to track your tournament stats, manage your team profile, participate in our shop, and receive exclusive updates from Rioters HQ."
            },
            {
                q: "How do I verify my account?",
                a: "Account verification is handled through email confirmation. For competitive play, we may require additional ID verification to ensure fair play and prevent smurfing."
            }
        ]
    }
];

export default function FAQPage() {
    const [openIndex, setOpenIndex] = useState<string | null>("General-0");

    const toggleAccordion = (id: string) => {
        setOpenIndex(openIndex === id ? null : id);
    };

    return (
        <div className="min-h-screen bg-black pt-32 pb-24">
            <div className="container mx-auto px-4">
                <div className="max-w-4xl mx-auto">
                    <div className="flex flex-col md:flex-row items-center md:items-start gap-6 text-center md:text-left mb-16">
                        <div className="w-16 h-16 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0">
                            <HelpCircle className="w-8 h-8 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-4xl md:text-7xl font-black uppercase tracking-tighter text-white leading-none">
                                FAQ <span className="text-primary">Intelligence</span>
                            </h1>
                            <p className="text-white/40 font-bold uppercase tracking-[0.3em] text-[10px] mt-4">
                                Resolving operational transmissions
                            </p>
                        </div>
                    </div>

                    <div className="space-y-16">
                        {faqs.map((group) => (
                            <div key={group.category} className="space-y-8">
                                <div className="flex items-center gap-4 border-b border-white/10 pb-6">
                                    <group.icon className="w-5 h-5 text-primary opacity-50" />
                                    <h2 className="text-sm font-black uppercase tracking-[0.4em] text-white/40">
                                        {group.category} Group
                                    </h2>
                                </div>

                                <div className="space-y-4">
                                    {group.questions.map((item, idx) => {
                                        const id = `${group.category}-${idx}`;
                                        const isOpen = openIndex === id;

                                        return (
                                            <div
                                                key={id}
                                                className={cn(
                                                    "border border-white/5 rounded-3xl overflow-hidden transition-all duration-500",
                                                    isOpen ? "bg-white/5 border-primary/20 shadow-[0_0_50px_rgba(255,18,65,0.05)]" : "bg-white/2 hover:bg-white/5"
                                                )}
                                            >
                                                <button
                                                    onClick={() => toggleAccordion(id)}
                                                    className="w-full flex items-center justify-between p-6 md:p-8 text-left"
                                                >
                                                    <span className="font-bold text-lg md:text-2xl text-white/90 pr-8 leading-tight">
                                                        {item.q}
                                                    </span>
                                                    <ChevronDown className={cn(
                                                        "w-5 h-5 text-primary transition-transform duration-300 shrink-0",
                                                        isOpen && "rotate-180"
                                                    )} />
                                                </button>

                                                <div
                                                    className={cn(
                                                        "transition-all duration-300 ease-in-out",
                                                        isOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
                                                    )}
                                                >
                                                    <div className="p-6 pt-0 text-white/60 leading-relaxed font-medium text-lg">
                                                        {item.a}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Support Contact Prompt */}
                    <div className="mt-20 p-8 rounded-3xl bg-gradient-to-br from-primary/10 via-transparent to-transparent border border-white/10 text-center">
                        <MessageCircle className="w-10 h-10 text-primary mx-auto mb-4" />
                        <h3 className="text-2xl font-black uppercase text-white mb-2">Still need help?</h3>
                        <p className="text-white/40 mb-8 max-w-md mx-auto">
                            Our command center is standing by to assist with complex inquiries.
                        </p>
                        <a href="/contact">
                            <button className="px-8 py-4 bg-primary text-black font-black uppercase tracking-widest rounded-xl hover:bg-white transition-colors">
                                Contact Intelligence
                            </button>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
