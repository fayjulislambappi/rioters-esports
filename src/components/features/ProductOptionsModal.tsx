"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, ShoppingCart } from "lucide-react";
import Button from "@/components/ui/Button";
import Image from "next/image";

interface ProductOptionsModalProps {
    product: any;
    isOpen: boolean;
    onClose: () => void;
    onAddToCart: (product: any, options: { variant: any, addOns: any[] }) => void;
}

export default function ProductOptionsModal({ product, isOpen, onClose, onAddToCart }: ProductOptionsModalProps) {
    const [selectedVariant, setSelectedVariant] = useState(product?.variants?.[0] || null);
    const [selectedAddOns, setSelectedAddOns] = useState<any[]>([]);

    if (!product) return null;

    const toggleAddOn = (addon: any) => {
        if (selectedAddOns.find(a => a.name === addon.name)) {
            setSelectedAddOns(selectedAddOns.filter(a => a.name !== addon.name));
        } else {
            setSelectedAddOns([...selectedAddOns, addon]);
        }
    };

    const totalPrice = (selectedVariant?.price || product.price) +
        selectedAddOns.reduce((sum, a) => sum + a.price, 0);

    const handleAddClick = () => {
        onAddToCart(product, { variant: selectedVariant, addOns: selectedAddOns });
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/80 backdrop-blur-md"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative w-full max-w-lg bg-zinc-900 border border-white/10 rounded-2xl overflow-hidden shadow-2xl"
                    >
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full z-10 transition-colors"
                        >
                            <X className="w-5 h-5 text-white/50" />
                        </button>

                        <div className="grid grid-cols-1 md:grid-cols-2">
                            <div className="relative aspect-square md:h-full bg-white/5">
                                <Image
                                    src={product.image}
                                    alt={product.name}
                                    fill
                                    className="object-cover"
                                />
                            </div>

                            <div className="p-6 flex flex-col">
                                <div className="mb-6">
                                    <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-1 block">
                                        Customize Merch
                                    </span>
                                    <h3 className="text-2xl font-black uppercase leading-tight mb-2">
                                        {product.name}
                                    </h3>
                                    <p className="text-white/40 text-xs leading-relaxed">
                                        {product.description || "Premium quality Rioters Esports official merchandise. Designed for the elite."}
                                    </p>
                                </div>

                                {product.variants && product.variants.length > 0 && (
                                    <div className="mb-6">
                                        <label className="text-[10px] font-black text-white/40 uppercase mb-3 block">Sleeve Option</label>
                                        <div className="grid grid-cols-2 gap-2">
                                            {product.variants.map((v: any) => (
                                                <button
                                                    key={v.name}
                                                    onClick={() => setSelectedVariant(v)}
                                                    className={`px-4 py-3 rounded-xl border text-xs font-bold uppercase transition-all flex flex-col items-center justify-center gap-1 ${selectedVariant?.name === v.name ? "bg-white text-black border-white" : "bg-white/5 text-white/60 border-white/10 hover:border-white/30"}`}
                                                >
                                                    <span>{v.name}</span>
                                                    <span className={selectedVariant?.name === v.name ? "text-black/40" : "text-primary text-[10px]"}>{v.price} Tk</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {product.addOns && product.addOns.length > 0 && (
                                    <div className="mb-8">
                                        <label className="text-[10px] font-black text-white/40 uppercase mb-3 block">Add-ons</label>
                                        <div className="space-y-2">
                                            {product.addOns.map((a: any) => (
                                                <button
                                                    key={a.name}
                                                    onClick={() => toggleAddOn(a)}
                                                    className={`w-full px-4 py-3 rounded-xl border text-xs font-bold uppercase transition-all flex items-center justify-between ${selectedAddOns.some(sa => sa.name === a.name) ? "bg-primary/20 text-primary border-primary" : "bg-white/5 text-white/60 border-white/10 hover:border-white/30"}`}
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <div className={`w-4 h-4 rounded border flex items-center justify-center ${selectedAddOns.some(sa => sa.name === a.name) ? "bg-primary border-primary" : "border-white/20"}`}>
                                                            {selectedAddOns.some(sa => sa.name === a.name) && <Check className="w-3 h-3 text-black" />}
                                                        </div>
                                                        <span>{a.name}</span>
                                                    </div>
                                                    <span>+{a.price} Tk</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="mt-auto flex items-center justify-between gap-4 pt-6 border-t border-white/5">
                                    <div>
                                        <span className="text-[10px] font-black text-white/40 uppercase block mb-1">Total Price</span>
                                        <span className="text-2xl font-black text-primary">{totalPrice} Tk</span>
                                    </div>
                                    <Button variant="neon" className="flex-1" onClick={handleAddClick}>
                                        <ShoppingCart className="w-4 h-4 mr-2" /> Add to Cart
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
