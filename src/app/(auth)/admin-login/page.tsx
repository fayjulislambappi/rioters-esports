"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { Lock, Mail, ShieldAlert, Terminal } from "lucide-react";
import AuthLayout from "@/components/auth/AuthLayout";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";

export default function AdminLoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await signIn("credentials", {
                redirect: false,
                email,
                password,
            });

            if (res?.error) {
                setError("Authorization Denied: Invalid Access Key");
                toast.error("Access Denied");
            } else {
                toast.success("Security Clearance Verified");
                router.push("/admin");
                router.refresh();
            }
        } catch (err) {
            setError("Critical Failure: System Unresponsive");
            toast.error("System Error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout
            title={<>Command <span className="text-primary italic">Center</span></>}
            subtitle="Restricted Access. Administrative override required."
            brandTag="Level 5 Clearance"
        >
            <form className="space-y-6" onSubmit={handleSubmit}>
                {error && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex items-center gap-2 text-red-500 bg-red-500/10 p-3 rounded border border-red-500/20 text-sm font-bold uppercase"
                    >
                        <ShieldAlert className="w-4 h-4" /> {error}
                    </motion.div>
                )}

                <div className="space-y-4">
                    <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                        className="relative"
                    >
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                        <Input
                            id="email-address"
                            name="email"
                            type="email"
                            required
                            placeholder="Admin Identifier"
                            className="pl-11 bg-white/5 border-white/10 focus:border-primary/50 transition-all duration-300"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 }}
                        className="relative"
                    >
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                        <Input
                            id="password"
                            name="password"
                            type="password"
                            required
                            placeholder="Passcode"
                            className="pl-11 bg-white/5 border-white/10 focus:border-primary/50 transition-all duration-300"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </motion.div>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                >
                    <Button
                        type="submit"
                        variant="primary"
                        className="w-full justify-center group h-12 text-base font-bold uppercase tracking-widest bg-primary hover:bg-black hover:text-primary border-primary transition-all duration-500 shadow-[0_0_20px_rgba(255,46,46,0.3)] hover:shadow-[0_0_30px_rgba(255,46,46,0.5)]"
                        isLoading={loading}
                    >
                        <Terminal className="w-5 h-5 mr-2 group-hover:animate-pulse" /> Initialize Override
                    </Button>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="text-center text-xs opacity-40 hover:opacity-100 transition-opacity"
                >
                    Unauthorized access attempts are monitored and logged.
                </motion.div>
            </form>
        </AuthLayout>
    );
}
