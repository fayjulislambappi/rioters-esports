"use client";

import { Shield, Hammer, Users, AlertTriangle, CheckCircle } from "lucide-react";

export default function RulesPage() {
    const sections = [
        {
            title: "Code of Conduct",
            icon: Users,
            content: [
                "Respect all participants, staff, and viewers at all times.",
                "Discrimination, hate speech, or harassment of any kind will result in an immediate and permanent ban.",
                "Maintain professional sportsmanship during both winning and losing scenarios.",
                "Obscene or offensive usernames and team names are strictly prohibited."
            ]
        },
        {
            title: "Fair Play & Integrity",
            icon: Shield,
            content: [
                "Any form of cheating, including but not limited to aimbots, wallhacks, or macro scripts, is strictly forbidden.",
                "Exploiting game bugs or unintended mechanics to gain an advantage is grounds for disqualification.",
                "Match-fixing or intentionally throwing games for any reason will lead to lifetime bans.",
                "Smurfing or playing on an account other than your registered one is a serious violation."
            ]
        },
        {
            title: "Tournament Protocols",
            icon: Hammer,
            content: [
                "Players must be present and ready 15 minutes before their scheduled match time.",
                "Proof of results (screenshots/video) must be provided upon request by tournament officials.",
                "Roster changes after the registration deadline are not permitted without explicit admin approval.",
                "The decision of the Rioters Gaming Lead Official is final in all dispute scenarios."
            ]
        }
    ];

    return (
        <div className="min-h-screen bg-black pt-32 pb-24">
            <div className="container mx-auto px-4">
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-16 px-4">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full text-primary text-[10px] font-black uppercase tracking-[0.3em] mb-6">
                            <Shield className="w-3 h-3" /> Standard Operating Procedure
                        </div>
                        <h1 className="text-4xl md:text-7xl font-black uppercase tracking-tighter text-white mb-6 leading-tight">
                            Rules & <span className="text-primary">Regulations</span>
                        </h1>
                        <p className="text-white/40 font-bold uppercase tracking-widest text-[10px] max-w-xl mx-auto leading-loose">
                            The official competitive framework governing all Rioters Gaming operations and tournament cycles.
                        </p>
                    </div>

                    {/* Content Blocks */}
                    <div className="space-y-8 md:space-y-12">
                        {sections.map((section, idx) => (
                            <div key={section.title} className="relative group">
                                <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-transparent rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
                                <div className="relative bg-white/5 border border-white/10 rounded-3xl p-6 md:p-12 overflow-hidden">
                                    <div className="flex flex-col md:flex-row items-center md:items-start gap-4 mb-8 text-center md:text-left">
                                        <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
                                            <section.icon className="w-6 h-6 text-primary" />
                                        </div>
                                        <h2 className="text-xl md:text-3xl font-black uppercase tracking-tight text-white leading-tight">
                                            0{idx + 1}. <span className="block md:inline">{section.title}</span>
                                        </h2>
                                    </div>

                                    <ul className="grid gap-6">
                                        {section.content.map((rule, ruleIdx) => (
                                            <li key={ruleIdx} className="flex gap-4">
                                                <div className="mt-1.5 shrink-0">
                                                    <CheckCircle className="w-4 h-4 text-primary opacity-50" />
                                                </div>
                                                <p className="text-white/70 font-medium leading-relaxed tracking-wide text-sm md:text-lg">
                                                    {rule}
                                                </p>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Enforcement Footer */}
                    <div className="mt-16 p-8 border border-red-500/20 bg-red-500/5 rounded-3xl flex flex-col md:flex-row items-center gap-6">
                        <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center shrink-0">
                            <AlertTriangle className="w-8 h-8 text-red-500" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black uppercase text-red-500 mb-2">Enforcement Protocol</h3>
                            <p className="text-white/40 font-medium leading-relaxed">
                                Violation of these regulations may result in immediate disqualification, forfeiture of prizes, and permanent exclusion from all future Rioters Gaming events.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
