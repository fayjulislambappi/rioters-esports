"use client";

import { useState, useEffect, use } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Card from "@/components/ui/Card";
import { ShoppingCart, Zap, Loader, Minus, Plus, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useSession, signIn } from "next-auth/react";
import SizeChart from "@/components/shop/SizeChart";

export default function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = use(params);
    const { data: session } = useSession();
    const router = useRouter();
    const { addToCart } = useCart();
    const [product, setProduct] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [selections, setSelections] = useState<{ [groupName: string]: any }>({});
    const [totalPrice, setTotalPrice] = useState(0);
    const [quantity, setQuantity] = useState(1);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const res = await fetch(`/api/products/${slug}`, {
                    cache: 'no-store'
                });
                const data = await res.json();
                if (res.ok) {
                    setProduct(data);

                    // Initialize selections
                    const initialSelections: { [groupName: string]: any } = {};

                    // Add size selection if required
                    if (data.requiresSize && data.sizeType) {
                        const sizes = data.sizeType === 'footwear'
                            ? ['6', '6.5', '7', '7.5', '8', '8.5', '9', '9.5', '10', '10.5', '11', '11.5', '12']
                            : ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];

                        // Find first in-stock size
                        const sizeGroup = data.optionGroups?.find((g: any) => g.name === 'Size');
                        const firstInStockName = sizes.find(s => {
                            const sizeOption = sizeGroup?.options?.find((o: any) => o.name === s);
                            return sizeOption?.inStock !== false;
                        }) || sizes[0];

                        const selectedSizeOption = sizeGroup?.options?.find((o: any) => o.name === firstInStockName);
                        initialSelections['Size'] = {
                            name: firstInStockName,
                            price: 0,
                            inStock: selectedSizeOption ? selectedSizeOption.inStock !== false : true
                        };
                    }

                    data.optionGroups?.forEach((group: any) => {
                        if (group.type === 'selection' && group.options?.length > 0) {
                            // Find first in-stock option
                            const firstInStock = group.options.find((o: any) => o.inStock !== false) || group.options[0];
                            initialSelections[group.name] = firstInStock;
                        } else if (group.type === 'input') {
                            initialSelections[group.name] = "";
                        }
                    });
                    setSelections(initialSelections);
                } else {
                    console.error("Product not found");
                }
            } catch (error) {
                console.error("Failed to fetch product:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [slug]);

    useEffect(() => {
        if (product) {
            let price = product.price || 0;
            Object.values(selections).forEach(val => {
                if (typeof val === 'object' && val.price !== undefined && val.inStock !== false) {
                    price += val.price;
                }
            });
            setTotalPrice(price * quantity);
        }
    }, [selections, product, quantity]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-black">
                <Loader className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-black text-center p-4">
                <h1 className="text-4xl font-black uppercase text-white/20 mb-4">Product Not Found</h1>
                <Link href="/shop">
                    <Button variant="outline">Back to Shop</Button>
                </Link>
            </div>
        );
    }

    const handleSelection = (groupName: string, option: any) => {
        setSelections(prev => ({ ...prev, [groupName]: option }));
    };

    const handleInputChange = (groupName: string, value: string) => {
        setSelections(prev => ({ ...prev, [groupName]: value }));
    };

    const handleAddToCart = (checkout: boolean = false) => {
        const missingFields = product.optionGroups?.filter((group: any) =>
            group.required && group.type === 'input' && !selections[group.name]
        );

        if (missingFields?.length > 0) {
            alert(`Please fill in: ${missingFields.map((f: any) => f.name).join(', ')}`);
            return;
        }

        addToCart(product, selections, quantity);
        if (checkout) {
            router.push("/checkout");
        }
    };

    return (
        <main className="min-h-screen pt-32 pb-20 px-4 bg-black">
            <div className="max-w-6xl mx-auto">
                {/* Breadcrumbs */}
                <nav className="flex items-center gap-2 mb-8 text-[10px] font-black uppercase tracking-widest text-white/40">
                    <Link href="/shop" className="hover:text-primary transition-colors">Shop</Link>
                    <ChevronRight className="w-3 h-3" />
                    <span className="text-white/20">{product.category}</span>
                    <ChevronRight className="w-3 h-3" />
                    <span className="text-primary">{product.name}</span>
                </nav>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                    {/* Left Column: Image and Description */}
                    <div className="space-y-8">
                        <div className="relative aspect-square bg-white/5 border border-white/10 rounded-3xl overflow-hidden group">
                            <Image
                                src={product.image}
                                alt={product.name}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-700"
                            />
                        </div>

                        <div className="space-y-4">
                            <h1 className="text-3xl md:text-4xl font-black uppercase leading-tight tracking-tighter">
                                {product.name}
                            </h1>
                            <div className="h-1 w-20 bg-primary rounded-full" />
                            <p className="text-white/60 leading-relaxed text-sm md:text-base">
                                {product.description || "Premium quality digital goods. Experience instant delivery and 24/7 customer support for all your gaming needs."}
                            </p>
                        </div>
                    </div>

                    {/* Right Column: Customization and Checkout */}
                    <div className="bg-zinc-900/50 border border-white/10 rounded-3xl p-8 space-y-8 backdrop-blur-sm">
                        <div className="space-y-6 text-left">
                            {/* Size Selection */}
                            {product.requiresSize && product.sizeType && (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-[12px] font-black uppercase tracking-widest text-white/40 flex items-center gap-2">
                                            Size
                                            <span className="text-primary">*</span>
                                        </h3>
                                        <SizeChart sizeType={product.sizeType} />
                                    </div>

                                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                                        {(product.sizeType === 'footwear'
                                            ? ['6', '6.5', '7', '7.5', '8', '8.5', '9', '9.5', '10', '10.5', '11', '11.5', '12']
                                            : ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL']
                                        ).filter(size => {
                                            const sizeGroup = product.optionGroups?.find((g: any) => g.name === 'Size');
                                            return sizeGroup?.options?.some((o: any) => o.name === size);
                                        }).map((size) => {
                                            // Check stock status
                                            const sizeGroup = product.optionGroups?.find((g: any) => g.name === 'Size');
                                            const sizeOption = sizeGroup?.options?.find((o: any) => o.name === size);
                                            const isOutOfStock = sizeOption?.inStock === false;
                                            const isSelected = selections['Size']?.name === size;

                                            return (
                                                <button
                                                    key={size}
                                                    onClick={() => handleSelection('Size', { name: size, price: 0, inStock: !isOutOfStock })}
                                                    className={`px-3 py-3 rounded-xl border text-xs font-black uppercase transition-all duration-300 relative ${isSelected
                                                        ? "bg-primary text-black border-primary shadow-[0_0_20px_rgba(255,50,50,0.3)]"
                                                        : "bg-white/5 text-white/60 border-white/10 hover:border-primary/50"
                                                        }`}
                                                >
                                                    <span>{size}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {product.optionGroups?.filter((g: any) => g.name !== 'Size').map((group: any) => (
                                <div key={group.name} className="space-y-4">
                                    <h3 className="text-[12px] font-black uppercase tracking-widest text-white/40 flex items-center gap-2">
                                        {group.name}
                                        {group.required && <span className="text-primary">*</span>}
                                    </h3>

                                    {group.type === 'selection' ? (
                                        <div className="grid grid-cols-2 sm:grid-cols-2 gap-3">
                                            {group.options?.map((opt: any) => {
                                                const isSelected = selections[group.name]?.name === opt.name;
                                                return (
                                                    <button
                                                        key={opt.name}
                                                        onClick={() => handleSelection(group.name, opt)}
                                                        className={`px-4 py-3 rounded-xl border text-xs font-black uppercase transition-all duration-300 flex flex-col items-start gap-1 group relative ${isSelected
                                                            ? "bg-primary text-black border-primary shadow-[0_0_20px_rgba(255,50,50,0.3)]"
                                                            : "bg-white/5 text-white/60 border-white/10 hover:border-primary/50"
                                                            }`}
                                                    >
                                                        <span>{opt.name}</span>
                                                        {opt.price > 0 && (
                                                            <span className={isSelected ? "text-black/60" : "text-primary group-hover:text-primary transition-colors"}>
                                                                {product.price > 0 ? `+${opt.price}` : opt.price} Tk
                                                            </span>
                                                        )}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <Input
                                            placeholder={group.placeholder || `Enter ${group.name}...`}
                                            value={selections[group.name] || ""}
                                            onChange={(e) => handleInputChange(group.name, e.target.value)}
                                            className="h-14 bg-black/40 border-white/10 text-white rounded-xl focus:border-primary transition-all font-bold"
                                        />
                                    )}
                                </div>
                            ))}

                            {/* Quantity and Price */}
                            <div className="pt-6 border-t border-white/10">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                    <div className="space-y-3">
                                        <span className="text-[10px] font-black uppercase text-white/40 tracking-widest block">Select Quantity</span>
                                        <div className="flex items-center gap-1 bg-black/40 border border-white/10 rounded-xl p-1 w-fit">
                                            <button
                                                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                                className="w-10 h-10 flex items-center justify-center hover:bg-white/5 rounded-lg transition-colors text-white/60 hover:text-white"
                                            >
                                                <Minus className="w-4 h-4" />
                                            </button>
                                            <span className="w-12 text-center font-black text-lg">{quantity}</span>
                                            <button
                                                onClick={() => setQuantity(quantity + 1)}
                                                className="w-10 h-10 flex items-center justify-center hover:bg-white/5 rounded-lg transition-colors text-white/60 hover:text-white"
                                            >
                                                <Plus className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="text-right">
                                        <span className="text-[10px] font-black uppercase text-white/40 tracking-widest block mb-1">Total Amount</span>
                                        <div className="flex flex-col items-end">
                                            <span className="text-4xl font-black text-primary drop-shadow-[0_0_15px_rgba(255,50,50,0.5)]">
                                                {Object.values(selections).some((sel: any) => sel?.inStock === false)
                                                    ? "OUT OF STOCK"
                                                    : `${totalPrice} Tk`
                                                }
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Buttons */}
                            <div className="pt-4">
                                {session ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                                        <Button
                                            variant="outline"
                                            className="h-16 rounded-2xl border-white/10 hover:border-primary/50 font-black uppercase text-xs transition-all flex items-center justify-center gap-3"
                                            onClick={() => handleAddToCart(false)}
                                        >
                                            <ShoppingCart className="w-5 h-5" />
                                            Add To Cart
                                        </Button>
                                        <Button
                                            variant="neon"
                                            className="h-16 rounded-2xl font-black uppercase text-xs shadow-[0_0_30px_rgba(255,50,50,0.2)] hover:shadow-[0_0_40px_rgba(255,50,50,0.4)] transition-all flex items-center justify-center gap-3"
                                            onClick={() => handleAddToCart(true)}
                                        >
                                            <Zap className="w-5 h-5" />
                                            Buy It Now
                                        </Button>
                                    </div>
                                ) : (
                                    <Button
                                        variant="neon"
                                        className="w-full h-16 rounded-2xl font-black uppercase text-xs shadow-[0_0_30px_rgba(255,50,50,0.2)] hover:shadow-[0_0_40px_rgba(255,50,50,0.4)] transition-all flex items-center justify-center gap-3"
                                        onClick={() => signIn()}
                                    >
                                        <Zap className="w-5 h-5" />
                                        Login to Place Order
                                    </Button>
                                )}
                            </div>

                            <p className="text-center text-[10px] font-black uppercase text-white/20 tracking-widest pt-4">
                                Secure Checkout • Instant Delivery • 24/7 Support
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
