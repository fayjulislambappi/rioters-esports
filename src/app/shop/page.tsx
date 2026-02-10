"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { Search, ShoppingCart, Loader } from "lucide-react";
import Card from "@/components/ui/Card";
import { useRouter } from "next/navigation";

export default function ShopPage() {
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState("");
    const [filter, setFilter] = useState("All");
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const res = await fetch("/api/admin/products"); // Accessible for list
                const data = await res.json();
                if (res.ok) {
                    setProducts(data);
                }
            } catch (error) {
                console.error("Failed to fetch products:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Group products by category
    const groupedProducts = filteredProducts.reduce((acc: any, product) => {
        const cat = product.category || "Other";
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(product);
        return acc;
    }, {});

    const getPriceRange = (product: any) => {
        if (!product.optionGroups || product.optionGroups.length === 0) {
            return `${product.price} Tk`;
        }

        // Find the group that has prices (usually 'Package' or 'Amount')
        const priceGroup = product.optionGroups.find((g: any) => g.options?.some((o: any) => o.price > 0));

        if (priceGroup && priceGroup.options) {
            const prices = priceGroup.options.map((o: any) => o.price + (product.price || 0));
            const min = Math.min(...prices);
            const max = Math.max(...prices);
            return min === max ? `${min} Tk` : `${min} - ${max} Tk`;
        }

        return `${product.price} Tk`;
    };

    return (
        <main className="min-h-screen pt-32 pb-20 px-4">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                    <div>
                        <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-4">
                            Premium <span className="text-primary">Shop</span>
                        </h1>
                        <p className="text-white/40 uppercase text-xs font-bold tracking-[0.2em]">
                            Global standards. local delivery. instant top-up.
                        </p>
                    </div>

                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
                        <Input
                            placeholder="SEARCH PRODUCTS..."
                            className="pl-12 bg-white/5 border-white/10"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[...Array(8)].map((_, i) => (
                            <Card key={i} className="p-4 animate-pulse aspect-[3/4] flex items-center justify-center">
                                <Loader className="w-8 h-8 animate-spin text-white/10" />
                            </Card>
                        ))}
                    </div>
                ) : (
                    <div className="space-y-16">
                        {Object.entries(groupedProducts).length === 0 ? (
                            <div className="text-center py-20 bg-white/5 border border-white/10 rounded-2xl">
                                <p className="text-white/20 font-black uppercase">No products matching your search</p>
                            </div>
                        ) : (
                            Object.entries(groupedProducts).map(([category, items]: [string, any]) => (
                                <section key={category}>
                                    <div className="flex items-center gap-4 mb-8">
                                        <h2 className="text-2xl font-black uppercase tracking-tighter whitespace-nowrap">
                                            {category}
                                        </h2>
                                        <div className="h-px w-full bg-gradient-to-r from-primary/30 to-transparent" />
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                        {items.map((product: any) => (
                                            <Card
                                                key={product._id}
                                                className="group relative overflow-hidden flex flex-col h-full border-white/5 bg-zinc-900/50 hover:border-primary/50 transition-all duration-500"
                                            >
                                                <div
                                                    className="relative aspect-[4/3] overflow-hidden cursor-pointer"
                                                    onClick={() => router.push(`/shop/${product.slug || product._id}`)}
                                                >
                                                    <Image
                                                        src={product.image}
                                                        alt={product.name}
                                                        fill
                                                        className="object-cover group-hover:scale-110 transition-transform duration-700"
                                                    />
                                                    <div className="absolute top-3 left-3">
                                                        <span className="bg-primary px-2 py-1 text-[10px] font-black uppercase text-black">
                                                            {product.category}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="p-4 flex flex-col flex-1">
                                                    <h3
                                                        className="text-lg font-black uppercase line-clamp-1 mb-1 cursor-pointer hover:text-primary transition-colors"
                                                        onClick={() => router.push(`/shop/${product.slug || product._id}`)}
                                                    >
                                                        {product.name}
                                                    </h3>
                                                    <p className="text-primary font-black text-sm mb-4">
                                                        {getPriceRange(product)}
                                                    </p>

                                                    <Button
                                                        variant="neon"
                                                        className="w-full mt-auto h-10 text-[10px] font-black uppercase"
                                                        onClick={() => router.push(`/shop/${product.slug || product._id}`)}
                                                    >
                                                        <ShoppingCart className="w-4 h-4 mr-2" />
                                                        View Details
                                                    </Button>
                                                </div>
                                            </Card>
                                        ))}
                                    </div>
                                </section>
                            ))
                        )}
                    </div>
                )}
            </div>
        </main>
    );
}
