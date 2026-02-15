"use client";

import { Lock, Eye, Database, Globe, Scale } from "lucide-react";

export default function PrivacyPage() {
    const sections = [
        {
            title: "Information We Collect",
            icon: Database,
            content: "We collect information you provide directly to us, such as when you create an account, register for a tournament, or contact HQ. This includes your name, email address, gaming handles (IGNs), and competitive history."
        },
        {
            title: "Intelligence Utilization",
            icon: Eye,
            content: "Your data is used to facilitate professional tournament matchmaking, verify competitive integrity, process shop orders, and provide critical platform updates. We do not sell your personal data to Third-Party entities."
        },
        {
            title: "Data Security",
            icon: Lock,
            content: "We implement robust security measures to protect your identification. All sensitive transmissions are encrypted, and access to player data is restricted to high-level Rioters Gaming officials only."
        },
        {
            title: "Player Rights",
            icon: Scale,
            content: "You have the right to access, rectify, or request the deletion of your personal intelligence artifacts. Contact our data protection officer via the 'Contact' page to exercise these operational rights."
        }
    ];

    return (
        <div className="min-h-screen bg-black pt-32 pb-24">
            <div className="container mx-auto px-4">
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="mb-16 text-center md:text-left">
                        <h1 className="text-4xl md:text-8xl font-black uppercase tracking-tighter text-white mb-6 leading-none">
                            Privacy <span className="text-primary">Policy</span>
                        </h1>
                        <p className="text-white/40 font-bold uppercase tracking-widest text-[10px] md:text-xs border-l-2 md:border-l-4 border-primary pl-4 md:pl-6 max-w-2xl mx-auto md:mx-0">
                            Strategic documentation regarding the collection, utilization, and protection of player intelligence within the Rioters Gaming ecosystem.
                        </p>
                    </div>

                    {/* Policy Content */}
                    <div className="space-y-12 md:space-y-16">
                        {sections.map((section) => (
                            <div key={section.title} className="flex flex-col md:flex-row gap-6 items-center md:items-start text-center md:text-left">
                                <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                                    <section.icon className="w-6 h-6 text-primary" />
                                </div>
                                <div className="space-y-4">
                                    <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight text-white/90">
                                        {section.title}
                                    </h2>
                                    <p className="text-white/60 leading-relaxed font-medium text-base md:text-lg italic">
                                        {section.content}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Legal Footer */}
                    <div className="mt-24 pt-8 border-t border-white/10 text-center">
                        <div className="flex items-center justify-center gap-2 text-white/20 mb-4">
                            <Globe className="w-4 h-4" />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Global Operational Directive 2026.4.1</span>
                        </div>
                        <p className="text-[10px] text-white/10 font-bold uppercase tracking-widest max-w-lg mx-auto leading-loose">
                            This document is subject to periodic updates. Continued utilization of Rioters Gaming services constitutes acceptance of all intelligence protocols.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
