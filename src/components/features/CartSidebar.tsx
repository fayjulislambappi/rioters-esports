"use client";

import { useCart } from "@/context/CartContext";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Minus, Trash2, ShoppingBag } from "lucide-react";
import Button from "@/components/ui/Button";
import Image from "next/image";
import Link from "next/link";

export default function CartSidebar() {
    const { cart, isCartOpen, toggleCart, removeFromCart, updateQuantity, cartTotal, clearCart } = useCart();

    return (
        <AnimatePresence>
            {isCartOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={toggleCart}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                    />

                    {/* Sidebar */}
                    <motion.div
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="fixed top-0 right-0 h-full w-full md:w-[400px] bg-black border-l border-white/10 z-50 flex flex-col shadow-2xl"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-white/10">
                            <h2 className="text-xl font-black uppercase tracking-wider flex items-center">
                                <ShoppingBag className="mr-3 text-primary" /> Your Cart
                            </h2>
                            <button
                                onClick={toggleCart}
                                className="p-2 hover:bg-white/10 rounded-full transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Cart Items */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            {cart.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-white/40">
                                    <ShoppingBag className="w-16 h-16 mb-4 opacity-20" />
                                    <p className="text-lg font-medium">Your cart is empty</p>
                                    <Button variant="outline" className="mt-6" onClick={toggleCart}>
                                        Continue Shopping
                                    </Button>
                                </div>
                            ) : (
                                cart.map((item) => (
                                    <motion.div
                                        key={item.itemKey}
                                        layout
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        className="flex gap-4 bg-white/5 p-4 rounded-xl border border-white/5"
                                    >
                                        <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-white/5 shrink-0">
                                            <Image
                                                src={item.image}
                                                alt={item.name}
                                                fill
                                                className="object-cover"
                                            />
                                        </div>
                                        <div className="flex-1 flex flex-col justify-between">
                                            <div>
                                                <h3 className="font-bold text-sm uppercase leading-tight mb-1">
                                                    {item.name}
                                                </h3>
                                                {item.selectedOptions && Object.entries(item.selectedOptions).map(([group, val]) => (
                                                    <p key={group} className="text-[10px] text-white/40 uppercase font-black">
                                                        {group}: <span className="text-white">{typeof val === 'object' ? val.name : val}</span>
                                                    </p>
                                                ))}
                                                <p className="text-primary font-bold mt-1">
                                                    {item.price.toFixed(0)} Tk
                                                </p>
                                            </div>

                                            <div className="flex items-center justify-between mt-2">
                                                <div className="flex items-center bg-white/10 rounded-lg">
                                                    <button
                                                        onClick={() => updateQuantity(item.itemKey, item.quantity - 1)}
                                                        className="p-1 hover:text-primary transition-colors disabled:opacity-50"
                                                        disabled={item.quantity <= 1}
                                                    >
                                                        <Minus className="w-3 h-3" />
                                                    </button>
                                                    <span className="w-8 text-center text-xs font-bold">
                                                        {item.quantity}
                                                    </span>
                                                    <button
                                                        onClick={() => updateQuantity(item.itemKey, item.quantity + 1)}
                                                        className="p-1 hover:text-primary transition-colors"
                                                    >
                                                        <Plus className="w-3 h-3" />
                                                    </button>
                                                </div>

                                                <button
                                                    onClick={() => removeFromCart(item.itemKey)}
                                                    className="text-white/40 hover:text-red-500 transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </div>

                        {/* Footer / Checkout */}
                        {cart.length > 0 && (
                            <div className="p-6 border-t border-white/10 bg-black/50 backdrop-blur-md">
                                <div className="flex justify-between items-center mb-4">
                                    <span className="text-white/60 uppercase text-sm font-bold">Subtotal</span>
                                    <span className="text-2xl font-black text-primary">
                                        {cartTotal.toFixed(0)} Tk
                                    </span>
                                </div>
                                <div className="grid gap-3">
                                    <Link href="/checkout" onClick={toggleCart}>
                                        <Button asDiv variant="neon" className="w-full py-4 text-lg">
                                            Checkout Now
                                        </Button>
                                    </Link>
                                    <Button variant="ghost" className="w-full" onClick={clearCart}>
                                        Clear Cart
                                    </Button>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
