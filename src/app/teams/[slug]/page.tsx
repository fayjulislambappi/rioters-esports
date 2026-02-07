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
    const [applyMessage, setApplyMessage] = useState("");
    const [submitting, setSubmitting] = useState(false);

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
                body: JSON.stringify({ teamId: team._id, message: applyMessage }),
            });

            const data = await res.json();
            if (res.ok) {
                toast.success("Application submitted successfully!");
                setShowApplyModal(false);
                setApplyMessage("");
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
                            {team.gameFocus && (
                                <span className="py-1 px-3 rounded bg-primary/20 text-primary text-xs font-bold uppercase border border-primary/20">
                                    {team.gameFocus}
                                </span>
                            )}
                        </div>
                        <p className="text-white/60 max-w-xl">{team.description}</p>
                    </div>

                    <div className="flex gap-4 mt-6 md:mt-0">
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
                            {team.members.map((member: any) => (
                                <PlayerCard
                                    key={member._id}
                                    ign={member.name}
                                    role={member.role === 'ADMIN' ? 'Owner' : 'Member'}
                                    rank="Elite"
                                    image={member.image}
                                    game={team.gameFocus || "General"}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white/5 border border-white/10 rounded-xl p-12 text-center text-white/20 italic font-bold">
                            No roster members yet.
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
                            <div>
                                <label className="block text-[10px] font-black uppercase text-white/40 mb-2 tracking-widest">Why should you join?</label>
                                <textarea
                                    required
                                    className="w-full bg-white/5 border border-white/10 rounded-lg p-4 text-white focus:outline-none focus:border-primary transition-colors min-h-[150px] text-sm"
                                    placeholder="Tell the captain about your skills, rank, and past experience..."
                                    value={applyMessage}
                                    onChange={(e) => setApplyMessage(e.target.value)}
                                />
                            </div>
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
