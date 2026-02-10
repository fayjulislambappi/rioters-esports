"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { Search, ShoppingCart, Loader } from "lucide-react";
import Card from "@/components/ui/Card";
import { useCart } from "@/context/CartContext";
import ProductOptionsModal from "@/components/features/ProductOptionsModal";

export default function ShopPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [filter, setFilter] = useState("All");
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedProduct, setSelectedProduct] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { addToCart } = useCart();

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
        (filter === "All" || p.category === filter) &&
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const categories = ["All", "Game Currency", "Game Pass", "Merchandise", "Subscription"];

    return (
        <div className="container mx-auto px-4 py-12">
            <div className="flex flex-col md:flex-row justify-between items-end mb-12">
                <div>
                    <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-4">
                        Digital <span className="text-primary text-outline">Market</span>
                    </h1>
                    <p className="text-white/60 max-w-2xl">
                        Get the latest skins, passes, and merch.
                    </p>
                </div>

                <div className="flex flex-col gap-4 mt-6 md:mt-0 w-full md:w-auto">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                        <Input
                            placeholder="Search products..."
                            className="pl-10 w-full md:w-64"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-8">
                {categories.map((cat) => (
                    <button
                        key={cat}
                        onClick={() => setFilter(cat)}
                        className={`px-4 py-2 rounded-full text-sm font-bold uppercase transition-colors border ${filter === cat ? "bg-white text-black border-white" : "bg-transparent text-white/60 border-white/20 hover:border-white/60 hover:text-white"}`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[...Array(8)].map((_, i) => (
                        <Card key={i} className="p-4 animate-pulse aspect-[3/4] flex items-center justify-center">
                            <Loader className="w-8 h-8 animate-spin text-white/10" />
                        </Card>
                    ))}
                </div>
            ) : filteredProducts.length === 0 ? (
                <div className="py-20 text-center">
                    <h2 className="text-2xl font-black uppercase text-white/20 italic">No products matched your hunt.</h2>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {filteredProducts.map((product) => (
                        <Card key={product._id} className="p-4 group">
                            <div className="relative aspect-square mb-4 rounded-lg overflow-hidden bg-white/5">
                                <Image src={product.image} alt={product.name} fill className="object-cover group-hover:scale-110 transition-transform duration-500" />
                            </div>

                            <h3 className="font-bold uppercase text-lg mb-1">{product.name}</h3>
                            <div className="flex items-center justify-between mt-4">
                                <span className="text-xl font-bold text-primary">{product.price} Tk</span>
                                <Button
                                    variant="neon"
                                    size="sm"
                                    className="h-8"
                                    onClick={() => {
                                        if (product.optionGroups?.length > 0) {
                                            setSelectedProduct(product);
                                            setIsModalOpen(true);
                                        } else {
                                            addToCart(product);
                                        }
                                    }}
                                >
                                    <ShoppingCart className="w-4 h-4 mr-2" />
                                    {product.optionGroups?.length > 0 ? "Select Options" : "Add"}
                                </Button>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            <ProductOptionsModal
                product={selectedProduct}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onAddToCart={addToCart}
            />
        </div>
    );
}
