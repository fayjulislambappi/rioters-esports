"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Button from "@/components/ui/Button";
import Link from "next/link";
import { MoveLeft, Trophy, Users, Globe, Twitter, Share2, Loader } from "lucide-react";
import PlayerCard from "@/components/features/PlayerCard";
import { toast } from "react-hot-toast";

export default function TeamProfile() {
    const params = useParams();
    const [team, setTeam] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [showApplyModal, setShowApplyModal] = useState(false);

    const [submitting, setSubmitting] = useState(false);

    // Valorant Questionnaire State
    // Dynamic Questionnaire State
    const [questionnaireData, setQuestionnaireData] = useState<Record<string, any>>({});

    // Reset questionnaire when team changes
    useEffect(() => {
        if (team?.gameFocus) {
            setQuestionnaireData({});
        }
    }, [team]);

    useEffect(() => {
        const fetchTeam = async () => {
            try {
                const res = await fetch(`/api/teams/${params.slug}`);
                const data = await res.json();
                if (res.ok) {
                    setTeam(data);
                } else {
                    toast.error(data.error || "Team not found");
                }
            } catch (error) {
                console.error("Failed to fetch team:", error);
            } finally {
                setLoading(false);
            }
        };
        if (params.slug) fetchTeam();
    }, [params.slug]);

    const handleApply = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const res = await fetch("/api/teams/apply", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    teamId: team._id,
                    data: questionnaireData
                }),
            });

            const data = await res.json();
            if (res.ok) {
                toast.success("Application submitted successfully!");
                setShowApplyModal(false);
            } else {
                toast.error(data.error || "Failed to submit application");
            }
        } catch (error) {
            toast.error("An error occurred");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader className="w-12 h-12 animate-spin text-primary" />
            </div>
        );
    }

    if (!team) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center">
                <h1 className="text-4xl font-black uppercase mb-4">Team Not Found</h1>
                <Link href="/teams">
                    <Button variant="outline">Back to Teams</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen pb-20">
            {/* Banner */}
            <div className="relative h-[300px] w-full">
                <Image
                    src={team.banner || "https://images.unsplash.com/photo-1542751110-97427bbecf20?q=80&w=1500&auto=format&fit=crop"}
                    alt={team.name}
                    fill
                    className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
            </div>

            <div className="container mx-auto px-4 -mt-20 relative z-10">
                <div className="flex flex-col md:flex-row items-end mb-8">
                    <div className="w-32 h-32 md:w-40 md:h-40 relative rounded-xl overflow-hidden border-4 border-background bg-black shadow-2xl shrink-0">
                        <Image src={team.logo || "/logo.png"} alt={team.name} fill className="object-cover" />
                    </div>

                    <div className="flex-1 md:ml-8 mt-4 md:mt-0">
                        <div className="flex items-center gap-4 mb-2">
                            <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter">{team.name}</h1>
                            {team.isBanned && (
                                <span className="text-sm font-black bg-red-500 text-white px-3 py-1 rounded skew-x-[-10deg] border border-red-400/50 shadow-[0_0_15px_rgba(239,68,68,0.5)]">
                                    BANNED
                                </span>
                            )}
                            {team.gameFocus && (
                                <span className="py-1 px-3 rounded bg-primary/20 text-primary text-xs font-bold uppercase border border-primary/20">
                                    {team.gameFocus}
                                </span>
                            )}
                        </div>
                        <p className="text-white/60 max-w-xl">{team.description}</p>
                    </div>

                    <div className="flex gap-4 mt-6 md:mt-0">
                        {team.captainDiscord && (
                            <div className="flex items-center gap-2 bg-[#5865F2]/20 text-[#5865F2] border border-[#5865F2]/50 px-4 py-2 rounded-md">
                                <span className="w-4 h-4 inline-block fill-current">
                                    <svg viewBox="0 0 127.14 96.36" className="w-full h-full"><path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.11,77.11,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22c.12-9.23-1.69-19-4.89-27.42C118.52,43.27,113.88,24.78,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5-12.74,11.44-12.74S96.23,46,96.12,53,91.08,65.69,84.69,65.69Z" /></svg>
                                </span>
                                <span className="font-bold text-sm">Captain: {team.captainDiscord}</span>
                            </div>
                        )}
                        {team.socials?.twitter && (
                            <Link href={`https://twitter.com/${team.socials.twitter}`} target="_blank">
                                <Button variant="outline" size="sm">
                                    <Twitter className="w-4 h-4 mr-2" /> Follow
                                </Button>
                            </Link>
                        )}
                        <Button variant="primary" size="sm" onClick={() => setShowApplyModal(true)}>
                            Apply to Join
                        </Button>
                    </div>
                </div>

                <div className="border-t border-white/10 pt-12">
                    <h2 className="text-2xl font-bold uppercase mb-8 flex items-center">
                        <Users className="w-6 h-6 mr-3 text-primary" /> Active Roster
                    </h2>

                    {team.members?.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                            {team.members.filter((m: any) => m !== null).map((member: any) => {
                                const isCaptain = member?._id === (typeof team.captainId === 'string' ? team.captainId : team.captainId?._id);
                                return (
                                    <PlayerCard
                                        key={member._id}
                                        ign={member.name}
                                        role={member.roles || [member.role || 'TEAM_MEMBER']}
                                        rank="Elite"
                                        image={member.image}
                                        game={team.gameFocus || "General"}
                                    />
                                );
                            })}
                        </div>
                    ) : (
                        <div className="bg-white/5 border border-white/10 rounded-xl p-12 text-center text-white/20 italic font-bold">
                            No roster members yet.
                        </div>
                    )}

                    {/* Starting Lineup Section (from Team Creation) */}
                    {team.lineup && team.lineup.length > 0 && (
                        <div className="mb-12">
                            <h3 className="text-xl font-bold uppercase mb-6 flex items-center text-white/60">
                                <Users className="w-5 h-5 mr-3" /> Starting Lineup
                            </h3>
                            <div className="flex flex-wrap gap-4">
                                {team.lineup.map((player: any, i: number) => (
                                    <div key={i} className="bg-primary/5 border border-primary/20 rounded-lg px-6 py-4 flex items-center min-w-[240px]">
                                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center mr-4 text-primary font-bold shrink-0">
                                            {i + 2}
                                        </div>
                                        <div>
                                            <span className="block font-bold uppercase text-lg text-primary">{player.ign}</span>
                                            <span className="text-[10px] text-white/40 uppercase tracking-widest block">Main Roster</span>
                                            <span className="text-xs text-white/60 flex items-center mt-1">
                                                <span className="w-3 h-3 mr-1 inline-block fill-current text-[#5865F2]">
                                                    <svg viewBox="0 0 127.14 96.36" className="w-full h-full"><path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.11,77.11,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22c.12-9.23-1.69-19-4.89-27.42C118.52,43.27,113.88,24.78,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5-12.74,11.44-12.74S96.23,46,96.12,53,91.08,65.69,84.69,65.69Z" /></svg>
                                                </span>
                                                {player.discord}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Substitutes Section */}
                    {team.substitutes && team.substitutes.length > 0 && (
                        <div className="mt-12">
                            <h3 className="text-xl font-bold uppercase mb-6 flex items-center text-white/60">
                                <Users className="w-5 h-5 mr-3" /> Substitutes / Reserves
                            </h3>
                            <div className="flex flex-wrap gap-4">
                                {team.substitutes.map((sub: any, i: number) => (
                                    <div key={i} className="bg-white/5 border border-white/10 rounded-lg px-6 py-4 flex items-center min-w-[200px]">
                                        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center mr-4 shrink-0">
                                            <Users className="w-5 h-5 text-white/40" />
                                        </div>
                                        <div>
                                            <span className="block font-bold uppercase text-sm">{sub.ign}</span>
                                            <span className="text-[10px] text-white/40 uppercase tracking-widest block">Reserve</span>
                                            <span className="text-xs text-white/60 flex items-center mt-1">
                                                <span className="w-3 h-3 mr-1 inline-block fill-current text-[#5865F2]">
                                                    <svg viewBox="0 0 127.14 96.36" className="w-full h-full"><path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.11,77.11,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22c.12-9.23-1.69-19-4.89-27.42C118.52,43.27,113.88,24.78,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5-12.74,11.44-12.74S96.23,46,96.12,53,91.08,65.69,84.69,65.69Z" /></svg>
                                                </span>
                                                {sub.discord}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Apply Modal */}
            {showApplyModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                    <div className="bg-zinc-900 border border-white/10 rounded-xl p-8 w-full max-w-md">
                        <h2 className="text-2xl font-black uppercase mb-2">Join {team.name}</h2>
                        <p className="text-white/40 text-sm mb-6 uppercase font-bold tracking-widest">Submit your application</p>

                        <form onSubmit={handleApply} className="space-y-4">




                            {/* Dynamic Game Questionnaires */}
                            {team.gameFocus?.toLowerCase() === "valorant" && (
                                <div className="space-y-4 border-t border-white/10 pt-4">
                                    <h3 className="text-xs font-black uppercase text-primary mb-2 tracking-widest">Valorant Stats</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-[10px] font-bold uppercase text-white/40 mb-1">Riot ID Name</label>
                                            <input type="text" required placeholder="Name" className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm focus:outline-none focus:border-primary"
                                                value={questionnaireData.ign || ""} onChange={(e) => setQuestionnaireData({ ...questionnaireData, ign: e.target.value })} />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold uppercase text-white/40 mb-1">Tag Line</label>
                                            <input type="text" required placeholder="#NA1" className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm focus:outline-none focus:border-primary"
                                                value={questionnaireData.tag || ""} onChange={(e) => setQuestionnaireData({ ...questionnaireData, tag: e.target.value })} />
                                        </div>
                                    </div>
                                    <div className="mb-4">
                                        <label className="block text-[10px] font-bold uppercase text-white/40 mb-1">Preferred Server</label>
                                        <input type="text" required placeholder="e.g. Mumbai, Singapore" className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm focus:outline-none focus:border-primary"
                                            value={questionnaireData.server || ""} onChange={(e) => setQuestionnaireData({ ...questionnaireData, server: e.target.value })} />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-[10px] font-bold uppercase text-white/40 mb-1">Current Rank</label>
                                            <input type="text" required placeholder="e.g. Ascendant 1" className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm focus:outline-none focus:border-primary"
                                                value={questionnaireData.rank || ""} onChange={(e) => setQuestionnaireData({ ...questionnaireData, rank: e.target.value })} />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold uppercase text-white/40 mb-1">Peak Rank</label>
                                            <input type="text" required placeholder="e.g. Immortal 3" className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm focus:outline-none focus:border-primary"
                                                value={questionnaireData.peakRank || ""} onChange={(e) => setQuestionnaireData({ ...questionnaireData, peakRank: e.target.value })} />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-[10px] font-bold uppercase text-white/40 mb-1">Main Role</label>
                                            <select className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm focus:outline-none focus:border-primary"
                                                value={questionnaireData.role || "Duelist"} onChange={(e) => setQuestionnaireData({ ...questionnaireData, role: e.target.value })}>
                                                <option value="Duelist">Duelist</option>
                                                <option value="Initiator">Initiator</option>
                                                <option value="Controller">Controller</option>
                                                <option value="Sentinel">Sentinel</option>
                                                <option value="Flex">Flex</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold uppercase text-white/40 mb-1">Favorite Agent</label>
                                            <input type="text" required placeholder="e.g. Jett" className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm focus:outline-none focus:border-primary"
                                                value={questionnaireData.agent || ""} onChange={(e) => setQuestionnaireData({ ...questionnaireData, agent: e.target.value })} />
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex items-center mb-2">
                                            <input type="checkbox" id="exp" className="w-4 h-4 rounded border-white/20 bg-black/40 text-primary focus:ring-primary mr-2"
                                                checked={questionnaireData.experience || false} onChange={(e) => setQuestionnaireData({ ...questionnaireData, experience: e.target.checked })} />
                                            <label htmlFor="exp" className="text-[10px] font-bold uppercase text-white/60 cursor-pointer">Tournament Experience? (Optional)</label>
                                        </div>
                                        {questionnaireData.experience && (
                                            <textarea className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-primary transition-colors min-h-[80px] text-xs"
                                                placeholder="List previous tournaments or teams..."
                                                value={questionnaireData.experienceDetails || ""} onChange={(e) => setQuestionnaireData({ ...questionnaireData, experienceDetails: e.target.value })} />
                                        )}
                                    </div>
                                </div>
                            )}

                            {(team.gameFocus?.toLowerCase() === "cs2" || team.gameFocus?.toLowerCase() === "counter-strike 2") && (
                                <div className="space-y-4 border-t border-white/10 pt-4">
                                    <h3 className="text-xs font-black uppercase text-primary mb-2 tracking-widest">CS2 Stats</h3>
                                    <div className="mb-4">
                                        <label className="block text-[10px] font-bold uppercase text-white/40 mb-1">In-Game Name</label>
                                        <input type="text" required placeholder="Steam Name" className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm focus:outline-none focus:border-primary"
                                            value={questionnaireData.ign || ""} onChange={(e) => setQuestionnaireData({ ...questionnaireData, ign: e.target.value })} />
                                    </div>
                                    <div className="mb-4">
                                        <label className="block text-[10px] font-bold uppercase text-white/40 mb-1">Preferred Server</label>
                                        <input type="text" required placeholder="e.g. Singapore, Dubai" className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm focus:outline-none focus:border-primary"
                                            value={questionnaireData.server || ""} onChange={(e) => setQuestionnaireData({ ...questionnaireData, server: e.target.value })} />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-[10px] font-bold uppercase text-white/40 mb-1">Faceit Level</label>
                                            <select className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm focus:outline-none focus:border-primary"
                                                value={questionnaireData.faceitLevel || "10"} onChange={(e) => setQuestionnaireData({ ...questionnaireData, faceitLevel: e.target.value })}>
                                                {[...Array(10)].map((_, i) => <option key={i} value={i + 1}>{i + 1}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold uppercase text-white/40 mb-1">Premier Rating</label>
                                            <input type="text" placeholder="e.g. 15,000" className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm focus:outline-none focus:border-primary"
                                                value={questionnaireData.premierRating || ""} onChange={(e) => setQuestionnaireData({ ...questionnaireData, premierRating: e.target.value })} />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-[10px] font-bold uppercase text-white/40 mb-1">Main Role</label>
                                            <select className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm focus:outline-none focus:border-primary"
                                                value={questionnaireData.role || "Rifler"} onChange={(e) => setQuestionnaireData({ ...questionnaireData, role: e.target.value })}>
                                                <option value="Rifler">Rifler</option>
                                                <option value="AWPer">AWPer</option>
                                                <option value="IGL">IGL</option>
                                                <option value="Entry">Entry Fragger</option>
                                                <option value="Support">Support</option>
                                                <option value="Lurker">Lurker</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold uppercase text-white/40 mb-1">Steam Profile Link</label>
                                            <input type="text" required placeholder="https://steamcommunity.com/id/..." className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm focus:outline-none focus:border-primary"
                                                value={questionnaireData.steamLink || ""} onChange={(e) => setQuestionnaireData({ ...questionnaireData, steamLink: e.target.value })} />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {team.gameFocus?.toLowerCase() === "league of legends" && (
                                <div className="space-y-4 border-t border-white/10 pt-4">
                                    <h3 className="text-xs font-black uppercase text-primary mb-2 tracking-widest">LoL Stats</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-[10px] font-bold uppercase text-white/40 mb-1">Riot ID Name</label>
                                            <input type="text" required placeholder="Name" className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm focus:outline-none focus:border-primary"
                                                value={questionnaireData.ign || ""} onChange={(e) => setQuestionnaireData({ ...questionnaireData, ign: e.target.value })} />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold uppercase text-white/40 mb-1">Tag Line</label>
                                            <input type="text" required placeholder="#NA1" className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm focus:outline-none focus:border-primary"
                                                value={questionnaireData.tag || ""} onChange={(e) => setQuestionnaireData({ ...questionnaireData, tag: e.target.value })} />
                                        </div>
                                    </div>
                                    <div className="mb-4">
                                        <label className="block text-[10px] font-bold uppercase text-white/40 mb-1">Preferred Server</label>
                                        <input type="text" required placeholder="e.g. EU West, NA East" className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm focus:outline-none focus:border-primary"
                                            value={questionnaireData.server || ""} onChange={(e) => setQuestionnaireData({ ...questionnaireData, server: e.target.value })} />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-[10px] font-bold uppercase text-white/40 mb-1">Solo/Duo Rank</label>
                                            <select className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm focus:outline-none focus:border-primary"
                                                value={questionnaireData.rank || "Emerald"} onChange={(e) => setQuestionnaireData({ ...questionnaireData, rank: e.target.value })}>
                                                {["Iron", "Bronze", "Silver", "Gold", "Platinum", "Emerald", "Diamond", "Master", "Grandmaster", "Challenger"].map(r => (
                                                    <option key={r} value={r}>{r}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold uppercase text-white/40 mb-1">Primary Role</label>
                                            <select className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm focus:outline-none focus:border-primary"
                                                value={questionnaireData.role || "Mid"} onChange={(e) => setQuestionnaireData({ ...questionnaireData, role: e.target.value })}>
                                                <option value="Top">Top Lane</option>
                                                <option value="Jungle">Jungle</option>
                                                <option value="Mid">Mid Lane</option>
                                                <option value="Bot">Bot Lane (ADC)</option>
                                                <option value="Support">Support</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold uppercase text-white/40 mb-1">op.gg Link</label>
                                        <input type="text" required placeholder="https://www.op.gg/summoners/..." className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm focus:outline-none focus:border-primary"
                                            value={questionnaireData.opgg || ""} onChange={(e) => setQuestionnaireData({ ...questionnaireData, opgg: e.target.value })} />
                                    </div>
                                </div>
                            )}

                            {team.gameFocus?.toLowerCase() === "dota 2" && (
                                <div className="space-y-4 border-t border-white/10 pt-4">
                                    <h3 className="text-xs font-black uppercase text-primary mb-2 tracking-widest">Dota 2 Stats</h3>
                                    <div className="mb-4">
                                        <label className="block text-[10px] font-bold uppercase text-white/40 mb-1">In-Game Name</label>
                                        <input type="text" required placeholder="Dota Name" className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm focus:outline-none focus:border-primary"
                                            value={questionnaireData.ign || ""} onChange={(e) => setQuestionnaireData({ ...questionnaireData, ign: e.target.value })} />
                                    </div>
                                    <div className="mb-4">
                                        <label className="block text-[10px] font-bold uppercase text-white/40 mb-1">Preferred Server</label>
                                        <input type="text" required placeholder="e.g. SE Asia, India" className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm focus:outline-none focus:border-primary"
                                            value={questionnaireData.server || ""} onChange={(e) => setQuestionnaireData({ ...questionnaireData, server: e.target.value })} />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-[10px] font-bold uppercase text-white/40 mb-1">MMR</label>
                                            <input type="text" required placeholder="e.g. 6500" className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm focus:outline-none focus:border-primary"
                                                value={questionnaireData.mmr || ""} onChange={(e) => setQuestionnaireData({ ...questionnaireData, mmr: e.target.value })} />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold uppercase text-white/40 mb-1">Primary Role</label>
                                            <select className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm focus:outline-none focus:border-primary"
                                                value={questionnaireData.role || "Pos 1"} onChange={(e) => setQuestionnaireData({ ...questionnaireData, role: e.target.value })}>
                                                <option value="Pos 1">Carry (Pos 1)</option>
                                                <option value="Pos 2">Mid (Pos 2)</option>
                                                <option value="Pos 3">Offlane (Pos 3)</option>
                                                <option value="Pos 4">Soft Support (Pos 4)</option>
                                                <option value="Pos 5">Hard Support (Pos 5)</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold uppercase text-white/40 mb-1">Dotabuff Link</label>
                                        <input type="text" required placeholder="https://www.dotabuff.com/players/..." className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm focus:outline-none focus:border-primary"
                                            value={questionnaireData.dotabuff || ""} onChange={(e) => setQuestionnaireData({ ...questionnaireData, dotabuff: e.target.value })} />
                                    </div>
                                </div>
                            )}

                            {team.gameFocus?.toLowerCase() === "overwatch 2" && (
                                <div className="space-y-4 border-t border-white/10 pt-4">
                                    <h3 className="text-xs font-black uppercase text-primary mb-2 tracking-widest">OW2 Stats</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-[10px] font-bold uppercase text-white/40 mb-1">BattleTag Name</label>
                                            <input type="text" required placeholder="Name" className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm focus:outline-none focus:border-primary"
                                                value={questionnaireData.ign || ""} onChange={(e) => setQuestionnaireData({ ...questionnaireData, ign: e.target.value })} />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold uppercase text-white/40 mb-1">#</label>
                                            <input type="text" required placeholder="#1234" className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm focus:outline-none focus:border-primary"
                                                value={questionnaireData.tag || ""} onChange={(e) => setQuestionnaireData({ ...questionnaireData, tag: e.target.value })} />
                                        </div>
                                    </div>
                                    <div className="mb-4">
                                        <label className="block text-[10px] font-bold uppercase text-white/40 mb-1">Preferred Region/Server</label>
                                        <input type="text" required placeholder="e.g. Americas, Asia" className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm focus:outline-none focus:border-primary"
                                            value={questionnaireData.server || ""} onChange={(e) => setQuestionnaireData({ ...questionnaireData, server: e.target.value })} />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-[10px] font-bold uppercase text-white/40 mb-1">Current Rank</label>
                                            <select className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm focus:outline-none focus:border-primary"
                                                value={questionnaireData.rank || "Diamond"} onChange={(e) => setQuestionnaireData({ ...questionnaireData, rank: e.target.value })}>
                                                {["Bronze", "Silver", "Gold", "Platinum", "Diamond", "Master", "Grandmaster", "Champion"].map(r => (
                                                    <option key={r} value={r}>{r}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold uppercase text-white/40 mb-1">Main Role</label>
                                            <select className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm focus:outline-none focus:border-primary"
                                                value={questionnaireData.role || "Damage"} onChange={(e) => setQuestionnaireData({ ...questionnaireData, role: e.target.value })}>
                                                <option value="Tank">Tank</option>
                                                <option value="Damage">Damage (DPS)</option>
                                                <option value="Support">Support</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold uppercase text-white/40 mb-1">Top 3 Heroes</label>
                                        <input type="text" required placeholder="e.g. Tracer, Genji, Cassidy" className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm focus:outline-none focus:border-primary"
                                            value={questionnaireData.heroes || ""} onChange={(e) => setQuestionnaireData({ ...questionnaireData, heroes: e.target.value })} />
                                    </div>
                                </div>
                            )}
                            <div className="flex gap-4 pt-4">
                                <Button type="button" variant="ghost" className="flex-1" onClick={() => setShowApplyModal(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit" variant="primary" className="flex-1" disabled={submitting}>
                                    {submitting ? "Submitting..." : "Submit App"}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
