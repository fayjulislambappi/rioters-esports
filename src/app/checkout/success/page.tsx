"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { motion } from "framer-motion";
import { CheckCircle } from "lucide-react";
import Button from "@/components/ui/Button";
import Link from "next/link";

function SuccessContent() {
    const searchParams = useSearchParams();
    const { clearCart } = useCart();
    const [status, setStatus] = useState<string | null>(null);

    // Retrieve the "payment_intent_client_secret" from the URL OR "order_id" for manual payments
    const clientSecret = searchParams.get("payment_intent_client_secret");
    const orderId = searchParams.get("order_id");

    useEffect(() => {
        if (clientSecret || orderId) {
            setStatus("succeeded");
            clearCart();
        }
    }, [clientSecret, orderId, clearCart]);

    if (!clientSecret && !orderId) {
        return (
            <div className="container mx-auto px-4 py-24 text-center">
                <h1 className="text-2xl font-bold mb-4">Invalid Request</h1>
                <Link href="/">
                    <Button variant="primary">Return Home</Button>
                </Link>
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-24 flex items-center justify-center min-h-[60vh]">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white/5 border border-primary/20 p-8 rounded-2xl max-w-lg w-full text-center backdrop-blur-md"
            >
                <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-10 h-10 text-primary" />
                </div>
                <h1 className="text-3xl font-black uppercase text-white mb-2">Payment Successful!</h1>
                <p className="text-white/60 mb-8">
                    Your order has been placed. You will receive a confirmation email shortly.
                </p>
                <Link href="/shop">
                    <Button variant="neon" className="w-full">
                        Continue Shopping
                    </Button>
                </Link>
            </motion.div>
        </div>
    );
}

export default function SuccessPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
            <SuccessContent />
        </Suspense>
    );
}
