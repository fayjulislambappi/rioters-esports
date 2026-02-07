"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Smartphone, Building2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";

type PaymentMethod = "bkash" | "nagad" | "bank";

// Define the structure for instructions first
interface InstructionStep {
    text: string;
}

interface PaymentInstruction {
    title: string;
    icon: React.ReactNode;
    color: string;
    steps: string[];
}

const instructions: Record<PaymentMethod, PaymentInstruction> = {
    bkash: {
        title: "bKash Payment",
        icon: <Smartphone className="w-5 h-5" />,
        color: "bg-pink-600",
        steps: [
            "Go to your bKash Mobile Menu by dialing *247#",
            "Choose 'Send Money'",
            "Enter the Personal Number: 01700-000000",
            "Enter Amount: BDT {amount}",
            "Enter Reference: Order",
            "Enter PIN to confirm",
            "Copy the Transaction ID from the SMS and paste it below."
        ]
    },
    nagad: {
        title: "Nagad Payment",
        icon: <Send className="w-5 h-5" />,
        color: "bg-orange-600",
        steps: [
            "Go to your Nagad Mobile Menu by dialing *167#",
            "Choose 'Send Money'",
            "Enter the Receiver Number: 01800-000000",
            "Enter Amount: BDT {amount}",
            "Enter Reference: Order",
            "Enter PIN to confirm",
            "Copy the Transaction ID from the SMS and paste it below."
        ]
    },
    bank: {
        title: "Bank Transfer",
        icon: <Building2 className="w-5 h-5" />,
        color: "bg-blue-600",
        steps: [
            "Transfer amount to the following account:",
            "Bank Name: City Bank",
            "Account Name: Rioters Esports Ltd.",
            "Account Number: 1234-5678-9012",
            "Branch: Gulshan 1",
            "Enter the Transaction ID / Reference No. below."
        ]
    }
};

interface ManualPaymentFormProps {
    amount: number;
    shippingDetails: any;
}

export default function ManualPaymentForm({ amount, shippingDetails }: ManualPaymentFormProps) {
    const router = useRouter();
    const { cart, clearCart } = useCart();
    const [method, setMethod] = useState<PaymentMethod>("bkash");
    const [senderNumber, setSenderNumber] = useState("");
    const [transactionId, setTransactionId] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const response = await fetch("/api/create-order", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    items: cart,
                    totalAmount: amount,
                    paymentMethod: method,
                    paymentDetails: {
                        senderNumber,
                        transactionId
                    },
                    shippingDetails
                })
            });

            if (response.ok) {
                clearCart();
                router.push("/checkout/success?order_id=manual");
            } else {
                alert("Failed to place order. Please try again.");
            }
        } catch (error) {
            console.error("Payment Error:", error);
            alert("An error occurred. Please contact support.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Payment Method Selector */}
            <div className="grid grid-cols-3 gap-2">
                {(Object.keys(instructions) as PaymentMethod[]).map((key) => (
                    <button
                        key={key}
                        type="button"
                        onClick={() => setMethod(key)}
                        className={`flex flex-col items-center justify-center p-4 rounded-lg border transition-all ${method === key
                            ? "bg-white/10 border-primary text-primary"
                            : "bg-black/20 border-white/10 text-white/60 hover:bg-white/5"
                            }`}
                    >
                        <div className={`p-2 rounded-full mb-2 ${instructions[key].color} text-white`}>
                            {instructions[key].icon}
                        </div>
                        <span className="text-xs font-bold uppercase">{key}</span>
                    </button>
                ))}
            </div>

            {/* Instructions */}
            <div className="bg-white/5 border border-white/10 p-4 rounded-lg text-sm">
                <h3 className="font-bold text-white mb-2 flex items-center gap-2">
                    {instructions[method].title} Instructions
                </h3>
                <ul className="list-disc list-inside space-y-1 text-white/70">
                    {instructions[method].steps.map((step, idx) => (
                        <li key={idx}>
                            {step.replace("{amount}", amount.toFixed(2))}
                        </li>
                    ))}
                </ul>
            </div>

            {/* Form Inputs */}
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                    <Input
                        required
                        placeholder={method === 'bank' ? "Account Number" : "Sender Mobile Number"}
                        value={senderNumber}
                        onChange={(e) => setSenderNumber(e.target.value)}
                    />
                    <Input
                        required
                        placeholder="Transaction ID (TrxID)"
                        value={transactionId}
                        onChange={(e) => setTransactionId(e.target.value)}
                        className="uppercase font-mono"
                    />
                </div>

                <Button
                    variant="neon"
                    className="w-full py-4 text-lg"
                    isLoading={isLoading}
                >
                    Confirm Payment (BDT {amount.toFixed(2)})
                </Button>
            </form>
        </div>
    );
}
