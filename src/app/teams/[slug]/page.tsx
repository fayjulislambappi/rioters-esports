"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import Button from "@/components/ui/Button";
import Link from "next/link";
import { MoveLeft, Trophy, Users, Globe, Twitter, Share2, Loader } from "lucide-react";
import PlayerCard from "@/components/features/PlayerCard";
import RosterCard3D from "@/components/features/RosterCard3D";
import EpicRoster from "@/components/features/EpicRoster";
import VerticalRoster from "@/components/features/VerticalRoster";
import { toast } from "react-hot-toast";
import { useSession } from "next-auth/react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { getGameRosterLimit } from "@/lib/game-config";

export default function TeamProfile() {
    const params = useParams();
    const [team, setTeam] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [showApplyModal, setShowApplyModal] = useState(false);
    const [showRosterModal, setShowRosterModal] = useState(false);
    const { data: session } = useSession();

    const [submitting, setSubmitting] = useState(false);
    const [updatingRoster, setUpdatingRoster] = useState(false);
    const [rosterView, setRosterView] = useState<"carousel" | "vertical">("vertical");

    const [editRoster, setEditRoster] = useState<{
        lineup: { ign: string; discord: string; userId?: string }[];
        substitutes: { ign: string; discord: string; userId?: string }[];
    }>({ lineup: [], substitutes: [] });

    const isCaptain =
        session?.user?.role === "ADMIN" ||
        (session?.user?.id && (
            team?.captainId?._id?.toString() === session.user.id ||
            team?.captainId?.toString() === session.user.id
        ));

    // Valorant Questionnaire State
    // Dynamic Questionnaire State
    const [questionnaireData, setQuestionnaireData] = useState<Record<string, any>>({});

    // Reset questionnaire when team changes
    useEffect(() => {
        if (team?.gameFocus) {
            setQuestionnaireData({});
            // Initialize edit roster from team data
            setEditRoster({
                lineup: team.lineup || [],
                substitutes: team.substitutes || []
            });
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
                // Update local state to hide button immediately
                setTeam((prev: any) => ({ ...prev, hasApplied: true }));
            } else {
                toast.error(data.error || "Failed to submit application");
            }
        } catch (error) {
            toast.error("An error occurred");
        } finally {
            setSubmitting(false);
        }
    };

    const handleRosterUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setUpdatingRoster(true);
        try {
            const res = await fetch(`/api/teams/${params.slug}/roster`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(editRoster),
            });

            const data = await res.json();
            if (res.ok) {
                toast.success("Roster updated successfully!");
                setTeam(data.team);
                setShowRosterModal(false);
            } else {
                toast.error(data.error || "Failed to update roster");
            }
        } catch (error) {
            toast.error("An error occurred");
        } finally {
            setUpdatingRoster(false);
        }
    };

    const onDragEnd = (result: DropResult) => {
        const { source, destination } = result;
        if (!destination) return;

        // Source is 'members' list
        if (source.droppableId === "members") {
            const playerIndex = source.index;
            const availableMembers = team?.members || [];
            const player = availableMembers[playerIndex];

            if (!player) return;

            // Target is a lineup slot
            if (destination.droppableId.startsWith("lineup-")) {
                const index = parseInt(destination.droppableId.split("-")[1]);
                const newLineup = [...editRoster.lineup];
                newLineup[index] = {
                    ign: player.name || "",
                    discord: "",
                    userId: player._id?.toString()
                };
                setEditRoster({ ...editRoster, lineup: newLineup });
            }
            // Target is a sub slot
            else if (destination.droppableId.startsWith("sub-")) {
                const index = parseInt(destination.droppableId.split("-")[1]);
                const newSubs = [...editRoster.substitutes];
                newSubs[index] = {
                    ign: player.name || "",
                    discord: "",
                    userId: player._id?.toString()
                };
                setEditRoster({ ...editRoster, substitutes: newSubs });
            }
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
                    sizes="100vw"
                    className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
            </div>

            <div className="container mx-auto px-4 -mt-20 relative z-10">
                <div className="flex flex-col md:flex-row items-end mb-8">
                    <div className="w-32 h-32 md:w-40 md:h-40 relative rounded-xl overflow-hidden border-4 border-background bg-black shadow-2xl shrink-0">
                        <Image
                            src={team.logo || "/logo.svg"}
                            alt={team.name}
                            fill
                            sizes="(max-width: 768px) 128px, 160px"
                            className="object-cover"
                        />
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
                        {!team.members?.some((m: any) => (m._id || m) === session?.user?.id) && team.captainId?._id !== session?.user?.id && team.captainId !== session?.user?.id && (
                            <>
                                {team.hasApplied ? (
                                    <div className="flex items-center gap-2 px-4 py-2 rounded-md bg-yellow-500/10 text-yellow-500 border border-yellow-500/30 font-black uppercase text-[10px] tracking-widest shadow-[0_0_15px_rgba(234,179,8,0.2)]">
                                        <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
                                        Application Pending
                                    </div>
                                ) : (() => {
                                    const limits = getGameRosterLimit(team.gameFocus);
                                    const isFull = (team.members || []).length >= limits.maxTotal;

                                    return isFull ? (
                                        <div className="flex items-center gap-2 px-4 py-2 rounded-md bg-white/5 text-white/40 border border-white/10 font-black uppercase text-[10px] tracking-widest">
                                            Team Full
                                        </div>
                                    ) : (
                                        <Button variant="primary" size="sm" onClick={() => setShowApplyModal(true)}>
                                            Apply to Join
                                        </Button>
                                    );
                                })()}
                            </>
                        )}
                        {isCaptain && (
                            <Button variant="neon" size="sm" onClick={() => setShowRosterModal(true)}>
                                Manage Roster
                            </Button>
                        )}
                    </div>
                </div>

                <div className="border-t border-white/10 pt-12">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                        <h2 className="text-2xl font-bold uppercase flex items-center">
                            <Users className="w-6 h-6 mr-3 text-primary" /> Active Roster
                        </h2>

                        {/* View Toggle */}
                        <div className="flex bg-white/5 p-1 rounded-lg border border-white/10 self-start md:self-auto relative z-30">
                            <button
                                onClick={() => setRosterView("carousel")}
                                className={`px-4 py-1.5 rounded-md text-[10px] font-black uppercase tracking-widest transition-all ${rosterView === "carousel" ? "bg-primary text-white shadow-[0_0_15px_rgba(var(--primary-rgb),0.5)]" : "text-white/40 hover:text-white"
                                    }`}
                            >
                                Roster Card
                            </button>
                            <button
                                onClick={() => setRosterView("vertical")}
                                className={`px-4 py-1.5 rounded-md text-[10px] font-black uppercase tracking-widest transition-all ${rosterView === "vertical" ? "bg-primary text-white shadow-[0_0_15px_rgba(var(--primary-rgb),0.5)]" : "text-white/40 hover:text-white"
                                    }`}
                            >
                                Vertical View
                            </button>
                        </div>
                    </div>

                    {team.members?.length > 0 ? (
                        <div className="relative pt-6 pb-10 overflow-hidden md:overflow-visible">
                            {(() => {
                                const registeredMap = new Map();
                                (team.members || []).forEach((m: any) => {
                                    if (m._id) registeredMap.set(m._id.toString(), m);
                                    if (m.name) registeredMap.set(m.name.toLowerCase(), m);
                                    if (m.ign) registeredMap.set(m.ign.toLowerCase(), m);
                                });

                                const fullRoster: any[] = [];
                                const seenIds = new Set<string>();

                                // 1. Process Lineup (Starting 5) - Strictly follow the lineup order
                                (team.lineup || []).forEach((p: any, idx: number) => {
                                    const registered = (p.userId && registeredMap.get(p.userId.toString())) || registeredMap.get(p.ign?.toLowerCase());

                                    // Merge: Lineup data (ign, discord) + Registered Member data (image, stats, overall)
                                    const member = {
                                        ...p,
                                        ...(registered || {}),
                                        _id: p._id || registered?._id || `lineup-${idx}-${p.ign?.replace(/\s+/g, '-').toLowerCase()}`,
                                        name: registered?.name || p.ign,
                                        ign: p.ign || registered?.ign,
                                        isLineup: true,
                                        role: "PLAYER"
                                    };

                                    fullRoster.push(member);
                                    if (registered?._id) seenIds.add(registered._id.toString());
                                });

                                // 2. Process Substitutes
                                (team.substitutes || []).forEach((p: any, idx: number) => {
                                    const registered = (p.userId && registeredMap.get(p.userId.toString())) || registeredMap.get(p.ign?.toLowerCase());

                                    if (registered?._id && seenIds.has(registered._id.toString())) return;

                                    const member = {
                                        ...p,
                                        ...(registered || {}),
                                        _id: p._id || registered?._id || `sub-${idx}-${p.ign?.replace(/\s+/g, '-').toLowerCase()}`,
                                        name: registered?.name || p.ign,
                                        ign: p.ign || registered?.ign,
                                        isSubstitute: true,
                                        role: "SUBSTITUTE"
                                    };

                                    fullRoster.push(member);
                                    if (registered?._id) seenIds.add(registered._id.toString());
                                });

                                // 3. Finally add any registered members who aren't in lineup/subs (e.g. general members)
                                (team.members || []).forEach((m: any) => {
                                    if (m._id && !seenIds.has(m._id.toString())) {
                                        fullRoster.push(m);
                                    }
                                });

                                if (rosterView === "carousel") {
                                    return (
                                        // Perspective Container
                                        <div className="flex justify-center items-start perspective-[2000px] md:h-[600px] h-[450px] cursor-grab active:cursor-grabbing md:-mt-24 -mt-12">
                                            <div className="relative w-full h-full group">
                                                <EpicRoster teamMembers={fullRoster} teamInfo={team} />
                                            </div>

                                            {/* Carousel Navigation Hints (Visual only) */}
                                            <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 flex items-center justify-center gap-4 md:gap-8 opacity-20 pointer-events-none w-full px-4">
                                                <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-white" />
                                                <span className="text-[10px] font-black uppercase tracking-[0.8em] text-center whitespace-nowrap">Scroll Roster</span>
                                                <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-white" />
                                            </div>
                                        </div>
                                    );
                                } else {
                                    return <VerticalRoster teamMembers={fullRoster} teamInfo={team} />;
                                }
                            })()}
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
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
                                {team.lineup.map((player: any, i: number) => (
                                    <div key={i} className="bg-primary/5 border border-primary/20 rounded-lg px-3 py-3 md:px-6 md:py-4 flex items-center">
                                        <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-primary/20 flex items-center justify-center mr-3 md:mr-4 text-primary font-bold shrink-0 text-xs md:text-base">
                                            {i + 2}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <span className="block font-bold uppercase text-sm md:text-lg text-primary truncate">{player.ign}</span>
                                            <span className="text-[8px] md:text-[10px] text-white/40 uppercase tracking-widest block truncate">Main Roster</span>
                                            <span className="text-[10px] md:text-xs text-white/60 flex items-center mt-1 truncate">
                                                <span className="w-2.5 h-2.5 md:w-3 md:h-3 mr-1 inline-block fill-current text-[#5865F2] shrink-0">
                                                    <svg viewBox="0 0 127.14 96.36" className="w-full h-full"><path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.11,77.11,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22c.12-9.23-1.69-19-4.89-27.42C118.52,43.27,113.88,24.78,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5-12.74,11.44-12.74S96.23,46,96.12,53,91.08,65.69,84.69,65.69Z" /></svg>
                                                </span>
                                                <span className="truncate">{player.discord}</span>
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
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
                                {team.substitutes.map((sub: any, i: number) => (
                                    <div key={i} className="bg-white/5 border border-white/10 rounded-lg px-3 py-3 md:px-6 md:py-4 flex items-center">
                                        <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-white/10 flex items-center justify-center mr-3 md:mr-4 shrink-0">
                                            <Users className="w-4 h-4 md:w-5 md:h-5 text-white/40" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <span className="block font-bold uppercase text-xs md:text-sm truncate">{sub.ign}</span>
                                            <span className="text-[8px] md:text-[10px] text-white/40 uppercase tracking-widest block truncate">Reserve</span>
                                            <span className="text-[10px] md:text-xs text-white/60 flex items-center mt-1 truncate">
                                                <span className="w-2.5 h-2.5 md:w-3 md:h-3 mr-1 inline-block fill-current text-[#5865F2] shrink-0">
                                                    <svg viewBox="0 0 127.14 96.36" className="w-full h-full"><path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.11,77.11,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22c.12-9.23-1.69-19-4.89-27.42C118.52,43.27,113.88,24.78,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5-12.74,11.44-12.74S96.23,46,96.12,53,91.08,65.69,84.69,65.69Z" /></svg>
                                                </span>
                                                <span className="truncate">{sub.discord}</span>
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
                            {team.gameFocus?.toLowerCase().includes("valorant") && (
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
                                            <select className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-primary"
                                                value={questionnaireData.role || "Duelist"} onChange={(e) => setQuestionnaireData({ ...questionnaireData, role: e.target.value })}>
                                                <option className="bg-zinc-900 text-white" value="Duelist">Duelist</option>
                                                <option className="bg-zinc-900 text-white" value="Initiator">Initiator</option>
                                                <option className="bg-zinc-900 text-white" value="Controller">Controller</option>
                                                <option className="bg-zinc-900 text-white" value="Sentinel">Sentinel</option>
                                                <option className="bg-zinc-900 text-white" value="Flex">Flex</option>
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

                            {(team.gameFocus?.toLowerCase().includes("cs2") || team.gameFocus?.toLowerCase().includes("counter-strike")) && (
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
                                            <select className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-primary"
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
                                            <select className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-primary"
                                                value={questionnaireData.role || "Rifler"} onChange={(e) => setQuestionnaireData({ ...questionnaireData, role: e.target.value })}>
                                                <option className="bg-zinc-900 text-white" value="Rifler">Rifler</option>
                                                <option className="bg-zinc-900 text-white" value="AWPer">AWPer</option>
                                                <option className="bg-zinc-900 text-white" value="IGL">IGL</option>
                                                <option className="bg-zinc-900 text-white" value="Entry">Entry Fragger</option>
                                                <option className="bg-zinc-900 text-white" value="Support">Support</option>
                                                <option className="bg-zinc-900 text-white" value="Lurker">Lurker</option>
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

                            {team.gameFocus?.toLowerCase().includes("league of legends") && (
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
                                            <select className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-primary"
                                                value={questionnaireData.rank || "Emerald"} onChange={(e) => setQuestionnaireData({ ...questionnaireData, rank: e.target.value })}>
                                                {["Iron", "Bronze", "Silver", "Gold", "Platinum", "Emerald", "Diamond", "Master", "Grandmaster", "Challenger"].map(r => (
                                                    <option className="bg-zinc-900 text-white" key={r} value={r}>{r}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold uppercase text-white/40 mb-1">Primary Role</label>
                                            <select className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-primary"
                                                value={questionnaireData.role || "Mid"} onChange={(e) => setQuestionnaireData({ ...questionnaireData, role: e.target.value })}>
                                                <option className="bg-zinc-900 text-white" value="Top">Top Lane</option>
                                                <option className="bg-zinc-900 text-white" value="Jungle">Jungle</option>
                                                <option className="bg-zinc-900 text-white" value="Mid">Mid Lane</option>
                                                <option className="bg-zinc-900 text-white" value="Bot">Bot Lane (ADC)</option>
                                                <option className="bg-zinc-900 text-white" value="Support">Support</option>
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

                            {team.gameFocus?.toLowerCase().includes("dota") && (
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
                                            <select className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-primary"
                                                value={questionnaireData.role || "Pos 1"} onChange={(e) => setQuestionnaireData({ ...questionnaireData, role: e.target.value })}>
                                                <option className="bg-zinc-900 text-white" value="Pos 1">Carry (Pos 1)</option>
                                                <option className="bg-zinc-900 text-white" value="Pos 2">Mid (Pos 2)</option>
                                                <option className="bg-zinc-900 text-white" value="Pos 3">Offlane (Pos 3)</option>
                                                <option className="bg-zinc-900 text-white" value="Pos 4">Soft Support (Pos 4)</option>
                                                <option className="bg-zinc-900 text-white" value="Pos 5">Hard Support (Pos 5)</option>
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

                            {team.gameFocus?.toLowerCase().includes("overwatch") && (
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
                                            <select className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-primary"
                                                value={questionnaireData.rank || "Diamond"} onChange={(e) => setQuestionnaireData({ ...questionnaireData, rank: e.target.value })}>
                                                {["Bronze", "Silver", "Gold", "Platinum", "Diamond", "Master", "Grandmaster", "Champion"].map(r => (
                                                    <option className="bg-zinc-900 text-white" key={r} value={r}>{r}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold uppercase text-white/40 mb-1">Main Role</label>
                                            <select className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-primary"
                                                value={questionnaireData.role || "Damage"} onChange={(e) => setQuestionnaireData({ ...questionnaireData, role: e.target.value })}>
                                                <option className="bg-zinc-900 text-white" value="Tank">Tank</option>
                                                <option className="bg-zinc-900 text-white" value="Damage">Damage (DPS)</option>
                                                <option className="bg-zinc-900 text-white" value="Support">Support</option>
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

                            {(team.gameFocus?.toLowerCase().includes("efootball") || team.gameFocus?.toLowerCase().includes("fc26") || team.gameFocus?.toLowerCase().includes("fifa")) && (
                                <div className="space-y-4 border-t border-white/10 pt-4">
                                    <h3 className="text-xs font-black uppercase text-primary mb-2 tracking-widest">{team.gameFocus} Stats</h3>
                                    <div className="mb-4">
                                        <label className="block text-[10px] font-bold uppercase text-white/40 mb-1">In-Game Name</label>
                                        <input type="text" required placeholder="e.g. ProGamer123" className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm focus:outline-none focus:border-primary"
                                            value={questionnaireData.ign || ""} onChange={(e) => setQuestionnaireData({ ...questionnaireData, ign: e.target.value })} />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-[10px] font-bold uppercase text-white/40 mb-1">Present Rank</label>
                                            {team.gameFocus?.toLowerCase().includes("efootball") ? (
                                                <select className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-primary"
                                                    value={questionnaireData.rank || "Division 10"} onChange={(e) => setQuestionnaireData({ ...questionnaireData, rank: e.target.value })}>
                                                    {[...Array(10)].map((_, i) => (
                                                        <option className="bg-zinc-900 text-white" key={i} value={`Division ${i + 1}`}>Division {i + 1}</option>
                                                    ))}
                                                </select>
                                            ) : (
                                                <input type="text" required placeholder="e.g. Division 1" className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm focus:outline-none focus:border-primary"
                                                    value={questionnaireData.rank || ""} onChange={(e) => setQuestionnaireData({ ...questionnaireData, rank: e.target.value })} />
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold uppercase text-white/40 mb-1">Peak Rank</label>
                                            {team.gameFocus?.toLowerCase().includes("efootball") ? (
                                                <select className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-primary"
                                                    value={questionnaireData.peakRank || "Division 10"} onChange={(e) => setQuestionnaireData({ ...questionnaireData, peakRank: e.target.value })}>
                                                    {[...Array(10)].map((_, i) => (
                                                        <option className="bg-zinc-900 text-white" key={i} value={`Division ${i + 1}`}>Division {i + 1}</option>
                                                    ))}
                                                </select>
                                            ) : (
                                                <input type="text" required placeholder="e.g. Elite 1" className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm focus:outline-none focus:border-primary"
                                                    value={questionnaireData.peakRank || ""} onChange={(e) => setQuestionnaireData({ ...questionnaireData, peakRank: e.target.value })} />
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* General Fallback Questionnaire (if no game matches) */}
                            {!["valorant", "cs2", "counter-strike", "league of legends", "dota", "overwatch", "efootball", "fc26", "fifa"].some(g => team.gameFocus?.toLowerCase().includes(g)) && (
                                <div className="space-y-4 border-t border-white/10 pt-4">
                                    <h3 className="text-xs font-black uppercase text-primary mb-2 tracking-widest">General Stats</h3>
                                    <div className="mb-4">
                                        <label className="block text-[10px] font-bold uppercase text-white/40 mb-1">In-Game Name</label>
                                        <input type="text" required placeholder="e.g. PlayerOne" className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm focus:outline-none focus:border-primary"
                                            value={questionnaireData.ign || ""} onChange={(e) => setQuestionnaireData({ ...questionnaireData, ign: e.target.value })} />
                                    </div>
                                    <div className="mb-4">
                                        <label className="block text-[10px] font-bold uppercase text-white/40 mb-1">Primary Role / Rank</label>
                                        <input type="text" required placeholder="e.g. Support / Diamond" className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm focus:outline-none focus:border-primary"
                                            value={questionnaireData.rank || ""} onChange={(e) => setQuestionnaireData({ ...questionnaireData, rank: e.target.value })} />
                                    </div>
                                    <div className="mb-4">
                                        <label className="block text-[10px] font-bold uppercase text-white/40 mb-1">Additional Info</label>
                                        <textarea className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-primary transition-colors min-h-[80px] text-xs"
                                            placeholder="Tell us why you want to join..."
                                            value={questionnaireData.info || ""} onChange={(e) => setQuestionnaireData({ ...questionnaireData, info: e.target.value })} />
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
            {/* Manage Roster Modal */}
            {showRosterModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => !updatingRoster && setShowRosterModal(false)}
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        className="relative w-full max-w-2xl bg-zinc-900 border border-white/10 rounded-2xl p-8 shadow-2xl overflow-y-auto max-h-[90vh]"
                    >
                        <h2 className="text-2xl font-black uppercase tracking-tighter mb-6 flex items-center gap-3">
                            <Users className="w-6 h-6 text-primary" /> Manage Team Roster
                        </h2>

                        <DragDropContext onDragEnd={onDragEnd}>
                            <form onSubmit={handleRosterUpdate} className="space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {/* Left Column: Available Members */}
                                    <div className="space-y-4">
                                        <h3 className="text-sm font-bold uppercase text-white/40 border-b border-white/5 pb-2">Available Players</h3>
                                        <Droppable droppableId="members">
                                            {(provided) => (
                                                <div
                                                    {...provided.droppableProps}
                                                    ref={provided.innerRef}
                                                    className="bg-black/20 rounded-xl p-4 min-h-[400px] border border-white/5 space-y-2 max-h-[500px] overflow-y-auto"
                                                >
                                                    {team?.members?.map((member: any, index: number) => (
                                                        <Draggable key={member._id} draggableId={member._id} index={index}>
                                                            {(provided, snapshot) => (
                                                                <div
                                                                    ref={provided.innerRef}
                                                                    {...provided.draggableProps}
                                                                    {...provided.dragHandleProps}
                                                                    className={`p-3 rounded-lg border flex items-center gap-3 transition-colors ${snapshot.isDragging
                                                                        ? "bg-primary/20 border-primary shadow-[0_0_15px_rgba(var(--primary-rgb),0.3)]"
                                                                        : "bg-white/5 border-white/10 hover:border-white/20"
                                                                        }`}
                                                                >
                                                                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center overflow-hidden shrink-0 border border-white/10">
                                                                        {member.image ? (
                                                                            <Image src={member.image} alt={member.name} width={32} height={32} />
                                                                        ) : (
                                                                            <Users className="w-4 h-4 text-white/40" />
                                                                        )}
                                                                    </div>
                                                                    <div className="flex-1 min-w-0">
                                                                        <span className="block font-bold truncate text-sm">{member.name}</span>
                                                                        <span className="block text-[8px] uppercase tracking-widest text-white/40">Member</span>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </Draggable>
                                                    ))}
                                                    {provided.placeholder}
                                                    {(!team?.members || team.members.length === 0) && (
                                                        <div className="text-center py-20 text-white/20 italic text-sm">No members found.</div>
                                                    )}
                                                </div>
                                            )}
                                        </Droppable>
                                    </div>

                                    {/* Right Column: Roster Slots */}
                                    <div className="space-y-6">
                                        {/* Lineup Section */}
                                        <div className="space-y-4">
                                            <h3 className="text-sm font-bold uppercase text-white/40 border-b border-white/5 pb-2">Starting Lineup (5 Slots)</h3>
                                            <div className="space-y-3">
                                                {[...Array(5)].map((_, i) => {
                                                    const player = editRoster.lineup[i] || { ign: "", discord: "" };
                                                    return (
                                                        <Droppable key={`lineup-${i}`} droppableId={`lineup-${i}`}>
                                                            {(provided, snapshot) => (
                                                                <div
                                                                    {...provided.droppableProps}
                                                                    ref={provided.innerRef}
                                                                    className={`group relative border-2 border-dashed rounded-xl p-3 transition-all ${snapshot.isDraggingOver
                                                                        ? "border-primary bg-primary/5 animate-pulse"
                                                                        : player.ign ? "border-primary/30 bg-primary/5 h-auto" : "border-white/5 h-[68px] hover:border-white/20"
                                                                        }`}
                                                                >
                                                                    {player.ign ? (
                                                                        <div className="flex items-center gap-3">
                                                                            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center text-primary font-black shrink-0">
                                                                                {i + 1}
                                                                            </div>
                                                                            <div className="flex-1 space-y-1">
                                                                                <input
                                                                                    className="w-full bg-transparent border-none outline-none font-bold text-sm text-primary p-0 h-auto focus:ring-0"
                                                                                    value={player.ign}
                                                                                    onChange={(e) => {
                                                                                        const newLineup = [...editRoster.lineup];
                                                                                        newLineup[i] = { ...player, ign: e.target.value };
                                                                                        setEditRoster({ ...editRoster, lineup: newLineup });
                                                                                    }}
                                                                                />
                                                                                <input
                                                                                    className="w-full bg-transparent border-none outline-none text-[10px] text-white/40 p-0 h-auto focus:ring-0 placeholder:text-white/20"
                                                                                    placeholder="Enter Discord..."
                                                                                    value={player.discord}
                                                                                    onChange={(e) => {
                                                                                        const newLineup = [...editRoster.lineup];
                                                                                        newLineup[i] = { ...player, discord: e.target.value };
                                                                                        setEditRoster({ ...editRoster, lineup: newLineup });
                                                                                    }}
                                                                                />
                                                                            </div>
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => {
                                                                                    const newLineup = [...editRoster.lineup];
                                                                                    newLineup[i] = { ign: "", discord: "", userId: undefined };
                                                                                    setEditRoster({ ...editRoster, lineup: newLineup });
                                                                                }}
                                                                                className="opacity-0 group-hover:opacity-100 p-2 hover:text-red-500 transition-all"
                                                                            >
                                                                                <Globe className="w-4 h-4 rotate-45" /> {/* Close-like icon */}
                                                                            </button>
                                                                        </div>
                                                                    ) : (
                                                                        <div className="flex items-center justify-center h-full gap-2 text-white/20 group-hover:text-white/40 transition-colors">
                                                                            <Users className="w-4 h-4" />
                                                                            <span className="text-[10px] uppercase font-black tracking-widest">Drop Player {i + 1} Here</span>
                                                                        </div>
                                                                    )}
                                                                    {provided.placeholder}
                                                                </div>
                                                            )}
                                                        </Droppable>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        {/* Substitutes Section */}
                                        <div className="space-y-4">
                                            <h3 className="text-sm font-bold uppercase text-white/40 border-b border-white/5 pb-2">Substitutes (2 Slots)</h3>
                                            <div className="space-y-3">
                                                {[...Array(2)].map((_, i) => {
                                                    const player = editRoster.substitutes[i] || { ign: "", discord: "" };
                                                    return (
                                                        <Droppable key={`sub-${i}`} droppableId={`sub-${i}`}>
                                                            {(provided, snapshot) => (
                                                                <div
                                                                    {...provided.droppableProps}
                                                                    ref={provided.innerRef}
                                                                    className={`group relative border-2 border-dashed rounded-xl p-3 transition-all ${snapshot.isDraggingOver
                                                                        ? "border-blue-500 bg-blue-500/5 animate-pulse"
                                                                        : player.ign ? "border-blue-500/30 bg-blue-500/5 h-auto" : "border-white/5 h-[68px] hover:border-white/20"
                                                                        }`}
                                                                >
                                                                    {player.ign ? (
                                                                        <div className="flex items-center gap-3">
                                                                            <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-500 font-black shrink-0">
                                                                                S
                                                                            </div>
                                                                            <div className="flex-1 space-y-1">
                                                                                <input
                                                                                    className="w-full bg-transparent border-none outline-none font-bold text-sm text-blue-500 p-0 h-auto focus:ring-0"
                                                                                    value={player.ign}
                                                                                    onChange={(e) => {
                                                                                        const newSubs = [...editRoster.substitutes];
                                                                                        newSubs[i] = { ...player, ign: e.target.value };
                                                                                        setEditRoster({ ...editRoster, substitutes: newSubs });
                                                                                    }}
                                                                                />
                                                                                <input
                                                                                    className="w-full bg-transparent border-none outline-none text-[10px] text-white/40 p-0 h-auto focus:ring-0 placeholder:text-white/20"
                                                                                    placeholder="Enter Discord..."
                                                                                    value={player.discord}
                                                                                    onChange={(e) => {
                                                                                        const newSubs = [...editRoster.substitutes];
                                                                                        newSubs[i] = { ...player, discord: e.target.value };
                                                                                        setEditRoster({ ...editRoster, substitutes: newSubs });
                                                                                    }}
                                                                                />
                                                                            </div>
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => {
                                                                                    const newSubs = [...editRoster.substitutes];
                                                                                    newSubs[i] = { ign: "", discord: "", userId: undefined };
                                                                                    setEditRoster({ ...editRoster, substitutes: newSubs });
                                                                                }}
                                                                                className="opacity-0 group-hover:opacity-100 p-2 hover:text-red-500 transition-all"
                                                                            >
                                                                                <Globe className="w-4 h-4 rotate-45" />
                                                                            </button>
                                                                        </div>
                                                                    ) : (
                                                                        <div className="flex items-center justify-center h-full gap-2 text-white/20 group-hover:text-white/40 transition-colors">
                                                                            <Users className="w-4 h-4" />
                                                                            <span className="text-[10px] uppercase font-black tracking-widest">Drop Substitute Here</span>
                                                                        </div>
                                                                    )}
                                                                    {provided.placeholder}
                                                                </div>
                                                            )}
                                                        </Droppable>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-4 pt-6 border-t border-white/10">
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        className="flex-1"
                                        onClick={() => setShowRosterModal(false)}
                                        disabled={updatingRoster}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        variant="primary"
                                        className="flex-1"
                                        isLoading={updatingRoster}
                                    >
                                        Save Roster Changes
                                    </Button>
                                </div>
                            </form>
                        </DragDropContext>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
