import { ShieldCheck, Scale, Gavel, AlertTriangle, FileText } from "lucide-react";
import Card from "@/components/ui/Card";

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-black pb-32">
            {/* HERO HEADER */}
            <div className="relative py-24 md:py-32 overflow-hidden border-b border-white/5">
                <div className="absolute inset-0 bg-primary/5 blur-[120px] -mr-32 -mt-32" />
                <div className="container mx-auto px-4 relative z-10 text-center">
                    <span className="text-primary text-xs md:text-sm font-black uppercase tracking-[0.4em] mb-4 block animate-pulse">
                        Operational Protocol
                    </span>
                    <h1 className="text-5xl md:text-8xl font-black uppercase tracking-tighter leading-tight mb-8 italic">
                        Terms of <span className="text-white text-outline">Engagement</span>
                    </h1>
                </div>
            </div>

            <div className="container mx-auto px-4 mt-16">
                <div className="max-w-4xl mx-auto space-y-12">

                    {/* SECTION 1: ACCEPTANCE */}
                    <div className="relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-transparent rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-500"></div>
                        <Card className="p-8 md:p-12 border-white/10 relative bg-zinc-900/50 backdrop-blur-sm shadow-2xl">
                            <h2 className="text-2xl font-black uppercase mb-6 flex items-center text-primary italic">
                                <ShieldCheck className="w-6 h-6 mr-3" /> 01. Code of Conduct
                            </h2>
                            <div className="prose prose-invert prose-sm md:prose-lg max-w-none space-y-6">
                                <p className="text-white/80 leading-relaxed italic">
                                    By accessing the Rioters Gaming platform, you enter a high-stakes competitive environment. Every agent is expected to maintain peak professional standards of sportsmanship.
                                </p>
                                <ul className="space-y-4 text-white/60">
                                    <li className="flex items-start gap-3">
                                        <span className="text-primary font-black mt-1">/</span> No toxic behavior, harassment, or hate speech will be tolerated under any circumstances.
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <span className="text-primary font-black mt-1">/</span> Exploiting game mechanics or using third-party unauthorized software is an immediate breach of engagement.
                                    </li>
                                </ul>
                            </div>
                        </Card>
                    </div>

                    {/* SECTION 2: TOURNAMENTS */}
                    <div className="relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-secondary/20 to-transparent rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-500"></div>
                        <Card className="p-8 md:p-12 border-white/10 relative bg-zinc-900/50 backdrop-blur-sm">
                            <h2 className="text-2xl font-black uppercase mb-6 flex items-center text-white italic">
                                <Scale className="w-6 h-6 mr-3 text-secondary" /> 02. Tournament Participation
                            </h2>
                            <div className="prose prose-invert prose-sm md:prose-lg max-w-none space-y-6">
                                <p className="text-white/80 leading-relaxed">
                                    All tournament entries are subject to validation by Rioters Operations. Organizers reserve the right to disqualify any participant found in violation of specific event protocols.
                                </p>
                                <div className="p-6 bg-primary/5 border border-primary/20 rounded-xl">
                                    <p className="text-xs font-black uppercase tracking-widest text-primary mb-2">Notice to Agents</p>
                                    <p className="text-sm text-white/60">Prize allocations are subject to verification and may take up to 30 tactical days for processing after event conclusion.</p>
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* SECTION 3: INTELLECTUAL PROPERTY */}
                    <div className="relative group">
                        <Card className="p-8 md:p-12 border-white/10 relative bg-zinc-900/50 backdrop-blur-sm">
                            <h2 className="text-2xl font-black uppercase mb-6 flex items-center text-white/60 italic">
                                <FileText className="w-6 h-6 mr-3 text-primary/40" /> 03. Tactical Assets
                            </h2>
                            <p className="text-white/60 leading-relaxed">
                                All branding, tactical graphics, and platform intel are the exclusive property of Rioters Gaming. Unauthorized duplication or redistribution of HQ assets is strictly prohibited.
                            </p>
                        </Card>
                    </div>

                    {/* DISKLAIMER FOOTER */}
                    <div className="pt-20 text-center space-y-6">
                        <div className="inline-flex items-center px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-full text-red-500 text-[10px] font-black uppercase tracking-[0.2em]">
                            <AlertTriangle className="w-3 h-3 mr-2" /> Breach of Protocol will result in immediate termination
                        </div>
                        <p className="text-white/20 text-[10px] font-bold uppercase tracking-[0.3em]">
                            Last Updated: February 15, 2026 • Headquarters Clearance level 4
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
