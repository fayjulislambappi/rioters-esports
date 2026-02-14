"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Link from "next/link";
import { Mail, AlertCircle, CheckCircle2, ArrowLeft } from "lucide-react";
import AuthLayout from "@/components/auth/AuthLayout";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

export default function ForgotPasswordPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await fetch("/api/auth/forgot-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "An error occurred");
            } else {
                setSuccess(true);
                toast.success("Reset code sent!");
                // Redirect after a short delay
                setTimeout(() => {
                    router.push(`/reset-password?email=${encodeURIComponent(email)}`);
                }, 2000);
            }
        } catch (err) {
            setError("An unexpected error occurred");
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout
            title={<>Reset <span className="text-primary italic">Password</span></>}
            subtitle="Enter your email to receive a 6-digit verification code."
            brandTag="Security"
        >
            <form className="space-y-6" onSubmit={handleSubmit}>
                {error && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex items-center gap-2 text-red-500 bg-red-500/10 p-3 rounded border border-red-500/20 text-sm"
                    >
                        <AlertCircle className="w-4 h-4" /> {error}
                    </motion.div>
                )}

                {success && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex items-center gap-2 text-green-500 bg-green-500/10 p-3 rounded border border-green-500/20 text-sm font-medium"
                    >
                        <CheckCircle2 className="w-4 h-4" /> Verification code sent! Redirecting...
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
                            id="email"
                            name="email"
                            type="email"
                            required
                            placeholder="Email Address"
                            className="pl-11 bg-white/5 border-white/10 focus:border-primary/50 transition-all duration-300"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
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
                        disabled={success}
                    >
                        Send Code
                    </Button>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="text-center"
                >
                    <Link href="/login" className="text-white/40 hover:text-white flex items-center justify-center gap-2 text-sm transition-colors group">
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        Back to Login
                    </Link>
                </motion.div>
            </form>
        </AuthLayout>
    );
}
