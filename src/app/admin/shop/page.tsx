"use client";

import { useState, useEffect } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { Search, ShoppingCart, Trash2, Plus, Tag, Edit } from "lucide-react";
import Card from "@/components/ui/Card";
import Link from "next/link";
import { toast } from "react-hot-toast";

export default function AdminShopPage() {
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    const fetchProducts = async () => {
        try {
            const res = await fetch("/api/admin/products");
            const data = await res.json();
            if (res.ok) {
                setProducts(data);
            } else {
                toast.error("Failed to fetch products");
            }
        } catch (error) {
            toast.error("An error occurred");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Delete product "${name}"?`)) return;

        try {
            const res = await fetch(`/api/admin/products/${id}`, {
                method: "DELETE",
            });

            if (res.ok) {
                toast.success("Product deleted");
                fetchProducts();
            } else {
                toast.error("Failed to delete product");
            }
        } catch (error) {
            toast.error("An error occurred");
        }
    };

    const getPriceRange = (product: any) => {
        if (!product.optionGroups || product.optionGroups.length === 0) {
            return `${product.price} Tk`;
        }

        const priceGroup = product.optionGroups.find((g: any) => g.options?.some((o: any) => o.price > 0));

        if (priceGroup && priceGroup.options) {
            const prices = priceGroup.options.map((o: any) => o.price + (product.price || 0));
            const min = Math.min(...prices);
            const max = Math.max(...prices);
            return min === max ? `${min} Tk` : `${min} - ${max} Tk`;
        }

        return `${product.price} Tk`;
    };

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-black uppercase tracking-tighter">Shop Management</h1>
                <Link href="/admin/shop/new">
                    <Button variant="neon">
                        <Plus className="w-4 h-4 mr-2" /> New Product
                    </Button>
                </Link>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden mb-8">
                <div className="p-4 border-b border-white/10 relative">
                    <Search className="absolute left-7 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                    <Input
                        placeholder="Search products..."
                        className="pl-10 bg-black/20"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="p-12 text-center text-white/20 animate-pulse font-bold uppercase">
                            Loading Products...
                        </div>
                    ) : filteredProducts.length === 0 ? (
                        <div className="p-12 text-center text-white/20 font-bold uppercase">
                            No Products Found
                        </div>
                    ) : (
                        <table className="w-full text-left">
                            <thead className="bg-white/5 text-xs uppercase font-bold text-white/60">
                                <tr>
                                    <th className="p-4">Product</th>
                                    <th className="p-4">Category</th>
                                    <th className="p-4">Price</th>
                                    <th className="p-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/10">
                                {filteredProducts.map((product) => (
                                    <tr key={product._id} className="hover:bg-white/5 transition-colors">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded bg-white/5 overflow-hidden">
                                                    <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                                                </div>
                                                <span className="font-bold">{product.name}</span>
                                            </div>
                                        </td>
                                        <td className="p-4 text-sm">
                                            <span className="bg-white/5 px-2 py-1 rounded text-white/60">{product.category}</span>
                                        </td>
                                        <td className="p-4 font-bold text-primary whitespace-nowrap">{getPriceRange(product)}</td>
                                        <td className="p-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <Link href={`/admin/shop/edit/${product._id}`}>
                                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                        <Edit className="w-4 h-4" />
                                                    </Button>
                                                </Link>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-red-500 hover:bg-red-500/10"
                                                    onClick={() => handleDelete(product._id, product.name)}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}
