"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, ShoppingCart } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Image from "next/image";

interface ProductOptionsModalProps {
    product: any;
    isOpen: boolean;
    onClose: () => void;
    onAddToCart: (product: any, selections: { [groupName: string]: any }) => void;
}

export default function ProductOptionsModal({ product, isOpen, onClose, onAddToCart }: ProductOptionsModalProps) {
    const [selections, setSelections] = useState<{ [groupName: string]: any }>({});
    const [totalPrice, setTotalPrice] = useState(0);

    useEffect(() => {
        if (product && product.optionGroups) {
            const initialSelections: { [groupName: string]: any } = {};
            product.optionGroups.forEach((group: any) => {
                if (group.type === 'selection' && group.options?.length > 0) {
                    initialSelections[group.name] = group.options[0];
                } else if (group.type === 'input') {
                    initialSelections[group.name] = "";
                }
            });
            setSelections(initialSelections);
        }
    }, [product]);

    useEffect(() => {
        if (product) {
            let price = product.price || 0;
            Object.values(selections).forEach(val => {
                if (typeof val === 'object' && val.price !== undefined) {
                    price += val.price;
                }
            });
            setTotalPrice(price);
        }
    }, [selections, product]);

    if (!product) return null;

    const handleSelection = (groupName: string, option: any) => {
        setSelections(prev => ({ ...prev, [groupName]: option }));
    };

    const handleInputChange = (groupName: string, value: string) => {
        setSelections(prev => ({ ...prev, [groupName]: value }));
    };

    const handleAddClick = () => {
        // Validate required inputs
        const missingFields = product.optionGroups?.filter((group: any) =>
            group.required && group.type === 'input' && !selections[group.name]
        );

        if (missingFields?.length > 0) {
            alert(`Please fill in: ${missingFields.map((f: any) => f.name).join(', ')}`);
            return;
        }

        onAddToCart(product, selections);
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
                        className="relative w-full max-w-2xl bg-zinc-900 border border-white/10 rounded-2xl overflow-hidden shadow-2xl"
                    >
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full z-10 transition-colors"
                        >
                            <X className="w-5 h-5 text-white/50" />
                        </button>

                        <div className="grid grid-cols-1 md:grid-cols-[250px_1fr]">
                            <div className="relative aspect-square md:h-full bg-white/5">
                                <Image
                                    src={product.image}
                                    alt={product.name}
                                    fill
                                    className="object-cover"
                                />
                            </div>

                            <div className="p-6 flex flex-col max-h-[80vh] overflow-y-auto custom-scrollbar">
                                <div className="mb-6">
                                    <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-1 block">
                                        Customize Order
                                    </span>
                                    <h3 className="text-2xl font-black uppercase leading-tight mb-2">
                                        {product.name}
                                    </h3>
                                    <p className="text-white/40 text-xs leading-relaxed">
                                        {product.description || "Premium quality digital goods. Fast delivery guaranteed."}
                                    </p>
                                </div>

                                <div className="space-y-6">
                                    {product.optionGroups?.map((group: any) => (
                                        <div key={group.name} className="space-y-3">
                                            <label className="text-[10px] font-black text-white/40 uppercase block">
                                                {group.name} {group.required && <span className="text-primary">*</span>}
                                            </label>

                                            {group.type === 'selection' ? (
                                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                                    {group.options?.map((opt: any) => (
                                                        <button
                                                            key={opt.name}
                                                            onClick={() => handleSelection(group.name, opt)}
                                                            className={`px-3 py-2 rounded-lg border text-[10px] font-bold uppercase transition-all flex flex-col items-center justify-center gap-1 ${selections[group.name]?.name === opt.name ? "bg-white text-black border-white" : "bg-white/5 text-white/60 border-white/10 hover:border-white/30"}`}
                                                        >
                                                            <span className="text-center">{opt.name}</span>
                                                            {opt.price > 0 && (
                                                                <span className={selections[group.name]?.name === opt.name ? "text-black/40" : "text-primary"}>
                                                                    +{opt.price} Tk
                                                                </span>
                                                            )}
                                                        </button>
                                                    ))}
                                                </div>
                                            ) : (
                                                <Input
                                                    placeholder={group.placeholder || `Enter ${group.name}...`}
                                                    value={selections[group.name] || ""}
                                                    onChange={(e) => handleInputChange(group.name, e.target.value)}
                                                    className="bg-white/5 border-white/10 text-white"
                                                />
                                            )}
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-8 flex items-center justify-between gap-4 pt-6 border-t border-white/5">
                                    <div>
                                        <span className="text-[10px] font-black text-white/40 uppercase block mb-1">Total Price</span>
                                        <span className="text-2xl font-black text-primary">{totalPrice} Tk</span>
                                    </div>
                                    <Button variant="neon" className="flex-1 h-14" onClick={handleAddClick}>
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
