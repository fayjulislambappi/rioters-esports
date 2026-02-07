"use client";

import { useCart } from "@/context/CartContext";
import { useState } from "react";
import { motion } from "framer-motion";
import Input from "@/components/ui/Input";
import Image from "next/image";
import Link from "next/link";
import { CreditCard } from "lucide-react";
import ManualPaymentForm from "@/components/features/ManualPaymentForm";
import Button from "@/components/ui/Button";

export default function CheckoutPage() {
    const { cart, cartTotal } = useCart();

    // State to hold shipping details to pass to payment form
    const [shippingDetails, setShippingDetails] = useState({
        firstName: "",
        lastName: "",
        email: "",
        address: "",
        city: "",
        zip: ""
    });

    const handleShippingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setShippingDetails(prev => ({ ...prev, [name]: value }));
    };

    if (cart.length === 0) {
        return (
            <div className="container mx-auto px-4 py-24 text-center">
                <h1 className="text-3xl font-black uppercase mb-4">Your Cart is Empty</h1>
                <p className="text-white/60 mb-8">Looks like you haven't added anything yet.</p>
                <Link href="/shop">
                    <Button variant="primary">Go to Shop</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-12">
            <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-12 text-center">
                Check<span className="text-primary">out</span>
            </h1>

            <div className="grid lg:grid-cols-3 gap-12">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Shipping Info */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white/5 border border-white/10 p-6 rounded-xl backdrop-blur-sm"
                    >
                        <h2 className="text-xl font-bold uppercase mb-6 flex items-center">
                            1. Shipping Information
                        </h2>
                        <form className="grid md:grid-cols-2 gap-4">
                            <Input name="firstName" placeholder="First Name" value={shippingDetails.firstName} onChange={handleShippingChange} />
                            <Input name="lastName" placeholder="Last Name" value={shippingDetails.lastName} onChange={handleShippingChange} />
                            <Input name="email" type="email" placeholder="Email Address" className="md:col-span-2" value={shippingDetails.email} onChange={handleShippingChange} />
                            <Input name="address" placeholder="Street Address" className="md:col-span-2" value={shippingDetails.address} onChange={handleShippingChange} />
                            <Input name="city" placeholder="City" value={shippingDetails.city} onChange={handleShippingChange} />
                            <Input name="zip" placeholder="ZIP / Postal Code" value={shippingDetails.zip} onChange={handleShippingChange} />
                        </form>
                    </motion.div>

                    {/* Payment Section - Manual Payment */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white/5 border border-white/10 p-6 rounded-xl backdrop-blur-sm"
                    >
                        <h2 className="text-xl font-bold uppercase mb-6 flex items-center">
                            <CreditCard className="mr-2" /> 2. Payment Details
                        </h2>
                        <ManualPaymentForm amount={cartTotal} shippingDetails={shippingDetails} />
                    </motion.div>
                </div>

                {/* Order Summary */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="lg:col-span-1"
                >
                    <div className="bg-white/5 border border-white/10 p-6 rounded-xl sticky top-24 backdrop-blur-sm">
                        <h2 className="text-xl font-bold uppercase mb-6">Order Summary</h2>

                        <div className="space-y-4 mb-6 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                            {cart.map(item => (
                                <div key={item.id} className="flex gap-4 items-center">
                                    <div className="relative w-16 h-16 rounded overflow-hidden bg-white/10 shrink-0">
                                        <Image src={item.image} alt={item.name} fill className="object-cover" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-bold uppercase line-clamp-1">{item.name}</p>
                                        <div className="flex justify-between text-xs text-white/50 mt-1">
                                            <span>Qty: {item.quantity}</span>
                                            <span>${(item.price * item.quantity).toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="space-y-2 border-t border-white/10 pt-4 text-sm">
                            <div className="flex justify-between">
                                <span className="text-white/60">Subtotal</span>
                                <span>${cartTotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-white/60">Tax (8%)</span>
                                <span>${(cartTotal * 0.08).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between border-t border-white/10 pt-4 text-lg font-black text-primary">
                                <span>Total</span>
                                <span>${(cartTotal * 1.08).toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
