"use client";

import { useState } from "react";
import { Mail, Phone, User, MessageSquare, Send, CheckCircle2, AlertCircle, ShieldCheck } from "lucide-react";
import { toast } from "react-hot-toast";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { cn } from "@/lib/utils";

export default function ContactUsPage() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        message: ""
    });
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const res = await fetch("/api/contact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                setSubmitted(true);
                toast.success("Transmission Received at HQ!");
            } else {
                toast.error("Transmission Intercepted. System Error.");
            }
        } catch (error) {
            console.error("Submission error:", error);
            toast.error("Critical Failure. Check Uplink.");
        } finally {
            setSubmitting(false);
        }
    };

    if (submitted) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center p-4">
                <div className="max-w-md w-full text-center space-y-8 p-12 rounded-[2rem] bg-white/5 border border-primary/20 relative overflow-hidden group">
                    <div className="absolute -top-24 -left-24 w-48 h-48 bg-primary/20 blur-[100px] rounded-full" />
                    <div className="w-20 h-20 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center mx-auto mb-8 shadow-[0_0_30px_rgba(255,18,65,0.2)]">
                        <CheckCircle2 className="w-10 h-10 text-primary" />
                    </div>
                    <h2 className="text-4xl font-black uppercase tracking-tighter text-white">Transmission <span className="text-primary">Secured</span></h2>
                    <p className="text-white/40 font-bold uppercase tracking-widest text-sm leading-relaxed">
                        Your intelligence has been relayed to HQ officials. Stand by for a tactical response shortly.
                    </p>
                    <button
                        onClick={() => setSubmitted(false)}
                        className="w-full py-4 rounded-xl bg-white/5 border border-white/10 text-white font-black uppercase tracking-widest hover:bg-white/10 transition-colors"
                    >
                        Send Another Sync
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black pt-32 pb-24 relative overflow-hidden">
            {/* Visual Background Elements */}
            <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-primary/5 blur-[150px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-blue-500/5 blur-[150px] pointer-events-none" />

            <div className="container mx-auto px-4 relative z-10">
                <div className="max-w-6xl mx-auto">
                    <div className="grid lg:grid-cols-[1fr_500px] gap-16 lg:gap-24">
                        {/* Information Side */}
                        <div className="space-y-12">
                            <div className="text-center lg:text-left">
                                <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary/20 rounded-full text-primary text-[10px] font-black uppercase tracking-[0.25em] mb-6">
                                    <ShieldCheck className="w-3 h-3" /> Secure HQ Uplink
                                </div>
                                <h1 className="text-5xl md:text-8xl lg:text-9xl font-black uppercase tracking-tighter leading-none text-white mb-8">
                                    Contact <br className="hidden md:block" /> <span className="text-primary">Intelligence</span>
                                </h1>
                                <p className="text-white/40 font-bold uppercase tracking-[.2em] text-xs md:text-lg max-w-xl leading-relaxed italic border-l-2 border-primary pl-6 mx-auto lg:mx-0">
                                    Established communication protocols for tournament inquiries, sponsorship proposals, and tactical support.
                                </p>
                            </div>

                            <div className="grid sm:grid-cols-2 gap-6 md:gap-8">
                                <div className="p-6 md:p-8 rounded-3xl bg-white/5 border border-white/10 space-y-4 hover:border-primary/20 transition-colors group">
                                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors mx-auto md:mx-0">
                                        <Mail className="w-6 h-6 text-primary" />
                                    </div>
                                    <div className="text-center md:text-left">
                                        <p className="text-white/40 font-black uppercase text-[10px] tracking-widest mb-1">HQ Email</p>
                                        <p className="text-sm md:text-lg font-black text-white uppercase tracking-tight break-all">riotersgaming43@gmail.com</p>
                                    </div>
                                </div>
                                <div className="p-6 md:p-8 rounded-3xl bg-white/5 border border-white/10 space-y-4 hover:border-blue-500/20 transition-colors group">
                                    <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors mx-auto md:mx-0">
                                        <Phone className="w-6 h-6 text-blue-500" />
                                    </div>
                                    <div className="text-center md:text-left">
                                        <p className="text-white/40 font-black uppercase text-[10px] tracking-widest mb-1">Tactical Line</p>
                                        <p className="text-lg font-black text-white uppercase tracking-tight">01622815214</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                                <a href="https://discord.gg/chCdqeuF7a" target="_blank" rel="noopener noreferrer" className="px-6 py-3 rounded-full bg-white/5 border border-white/10 text-white/40 text-[10px] font-black uppercase tracking-widest hover:text-[#5865F2] hover:border-[#5865F2]/30 cursor-pointer transition-all">
                                    Discord
                                </a>
                                <a href="https://x.com/rioters_gamingX" target="_blank" rel="noopener noreferrer" className="px-6 py-3 rounded-full bg-white/5 border border-white/10 text-white/40 text-[10px] font-black uppercase tracking-widest hover:text-white hover:border-white/30 cursor-pointer transition-all">
                                    X
                                </a>
                                <a href="https://www.facebook.com/riotersgaming13/" target="_blank" rel="noopener noreferrer" className="px-6 py-3 rounded-full bg-white/5 border border-white/10 text-white/40 text-[10px] font-black uppercase tracking-widest hover:text-[#1877F2] hover:border-[#1877F2]/30 cursor-pointer transition-all">
                                    Facebook
                                </a>
                                <a href="https://www.instagram.com/riotersgaming13" target="_blank" rel="noopener noreferrer" className="px-6 py-3 rounded-full bg-white/5 border border-white/10 text-white/40 text-[10px] font-black uppercase tracking-widest hover:text-[#E4405F] hover:border-[#E4405F]/30 cursor-pointer transition-all">
                                    Instagram
                                </a>
                            </div>
                        </div>

                        {/* Form Side */}
                        <div className="relative">
                            <div className="absolute -inset-4 bg-primary/10 rounded-[3rem] blur-2xl opacity-50 hidden md:block" />
                            <div className="relative bg-[#0a0a0a] border border-white/10 p-6 md:p-12 rounded-[2rem] md:rounded-[2.5rem] shadow-2xl">
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-white/40 tracking-widest ml-4">Personnel Name</label>
                                        <div className="relative group">
                                            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-primary transition-colors">
                                                <User className="w-5 h-5" />
                                            </div>
                                            <input
                                                required
                                                placeholder="ENTER FULL NAME"
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-14 pr-6 text-white font-bold placeholder:text-white/10 focus:outline-none focus:border-primary/50 focus:bg-white/10 transition-all uppercase tracking-wider text-sm md:text-base"
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase text-white/40 tracking-widest ml-4">Identity (Email)</label>
                                            <div className="relative group">
                                                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-primary transition-colors">
                                                    <Mail className="w-5 h-5" />
                                                </div>
                                                <input
                                                    required
                                                    type="email"
                                                    placeholder="EMAIL@HQ.COM"
                                                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-14 pr-6 text-white font-bold placeholder:text-white/10 focus:outline-none focus:border-primary/50 focus:bg-white/10 transition-all uppercase tracking-wider"
                                                    value={formData.email}
                                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase text-white/40 tracking-widest ml-4">Comm Link (Phone)</label>
                                            <div className="relative group">
                                                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-primary transition-colors">
                                                    <Phone className="w-5 h-5" />
                                                </div>
                                                <input
                                                    placeholder="+880..."
                                                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-14 pr-6 text-white font-bold placeholder:text-white/10 focus:outline-none focus:border-primary/50 focus:bg-white/10 transition-all uppercase tracking-wider"
                                                    value={formData.phone}
                                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-white/40 tracking-widest ml-4">Transmission Content</label>
                                        <div className="relative group">
                                            <div className="absolute left-5 top-6 text-white/20 group-focus-within:text-primary transition-colors">
                                                <MessageSquare className="w-5 h-5" />
                                            </div>
                                            <textarea
                                                required
                                                rows={5}
                                                placeholder="STATE YOUR INQUIRY OR INTEL..."
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-14 pr-6 text-white font-bold placeholder:text-white/10 focus:outline-none focus:border-primary/50 focus:bg-white/10 transition-all uppercase tracking-wider resize-none"
                                                value={formData.message}
                                                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <button
                                        disabled={submitting}
                                        type="submit"
                                        className={cn(
                                            "group relative w-full overflow-hidden rounded-2xl bg-primary py-6 transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100",
                                            submitting && "animate-pulse"
                                        )}
                                    >
                                        <div className="relative z-10 flex items-center justify-center gap-3">
                                            <span className="text-black font-black uppercase tracking-[.3em] text-sm">
                                                {submitting ? "Initiating Transmission..." : "Begin Relay"}
                                            </span>
                                            {!submitting && <Send className="w-5 h-5 text-black group-hover:translate-x-1 transition-transform" />}
                                        </div>
                                        <div className="absolute inset-0 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-300 pointer-events-none" />
                                    </button>

                                    <div className="flex items-center justify-center gap-2 text-white/10 py-2">
                                        <AlertCircle className="w-3 h-3" />
                                        <span className="text-[8px] font-black uppercase tracking-widest">End-to-End Encrypted Relay Protocol</span>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
