"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Link from "next/link";
import { Lock, Mail, AlertCircle, CheckCircle2, KeyRound, ArrowLeft } from "lucide-react";
import AuthLayout from "@/components/auth/AuthLayout";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

function ResetPasswordForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [email, setEmail] = useState("");
    const [code, setCode] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        const emailParam = searchParams.get("email");
        if (emailParam) {
            setEmail(emailParam);
        }
    }, [searchParams]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        if (newPassword !== confirmPassword) {
            setError("Passwords do not match");
            setLoading(false);
            return;
        }

        try {
            const res = await fetch("/api/auth/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, code, newPassword }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "An error occurred");
            } else {
                setSuccess(true);
                toast.success("Password reset successful!");
                setTimeout(() => {
                    router.push("/login");
                }, 3000);
            }
        } catch (err) {
            setError("An unexpected error occurred");
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout
            title={<>Set New <span className="text-primary italic">Password</span></>}
            subtitle="Enter the 6-digit code from your email and your new password."
            brandTag="Secure Reset"
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
                        <CheckCircle2 className="w-4 h-4" /> Password reset successful! Redirecting to login...
                    </motion.div>
                )}

                <div className="space-y-4">
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            required
                            placeholder="Email Address"
                            readOnly={!!searchParams.get("email")}
                            className="pl-11 bg-white/5 border-white/10 focus:border-primary/50 transition-all duration-300 transition-all duration-300"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div className="relative">
                        <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                        <Input
                            id="code"
                            name="code"
                            type="text"
                            required
                            maxLength={6}
                            placeholder="6-Digit Reset Code"
                            className="pl-11 bg-white/5 border-white/10 focus:border-primary/50 transition-all duration-300"
                            value={code}
                            onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                        />
                    </div>

                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                        <Input
                            id="newPassword"
                            name="newPassword"
                            type="password"
                            required
                            placeholder="New Password"
                            className="pl-11 bg-white/5 border-white/10 focus:border-primary/50 transition-all duration-300"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                        />
                    </div>

                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                        <Input
                            id="confirmPassword"
                            name="confirmPassword"
                            type="password"
                            required
                            placeholder="Confirm New Password"
                            className="pl-11 bg-white/5 border-white/10 focus:border-primary/50 transition-all duration-300"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                    </div>
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
                        Reset Password
                    </Button>
                </motion.div>

                <div className="text-center">
                    <Link href="/forgot-password" title="Go back to request another code" className="text-white/40 hover:text-white flex items-center justify-center gap-2 text-sm transition-colors group">
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        Wrong email or need another code?
                    </Link>
                </div>
            </form>
        </AuthLayout>
    );
}

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-black text-white">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div>
            </div>
        }>
            <ResetPasswordForm />
        </Suspense>
    );
}
