"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Card from "@/components/ui/Card";
import { Package, ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import ImageUpload from "@/components/ui/ImageUpload";
import ProductOptionsEditor from "@/components/admin/ProductOptionsEditor";

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState<any>({
        name: "",
        price: "",
        category: "Game Top-up",
        image: "",
        description: "",
        optionGroups: []
    });

    const categories = [
        "Valorant Points",
        "Steam Wallet Codes",
        "Discord Nitro",
        "Game Top-up",
        "Subscriptions",
        "Gift Cards",
        "Merchandise",
        "Other digital goods"
    ];

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const res = await fetch(`/api/admin/products/${id}`, {
                    cache: 'no-store'
                });
                const data = await res.json();
                if (res.ok) {
                    setFormData({
                        name: data.name,
                        price: data.price.toString(),
                        category: data.category || "Game Top-up",
                        image: data.image || "",
                        description: data.description || "",
                        optionGroups: data.optionGroups || []
                    });
                } else {
                    toast.error("Failed to fetch product data");
                }
            } catch (error) {
                toast.error("An error occurred while fetching product data");
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            const payload = {
                ...formData,
                id: id,
                price: parseFloat(formData.price),
            };

            console.log("=== FRONTEND SAVE ===");
            console.log("Sending option groups:", formData.optionGroups?.length || 0);
            console.log("Full payload:", JSON.stringify(payload, null, 2));

            const res = await fetch("/api/admin/products", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (res.ok) {
                toast.success("Product updated successfully!");
                router.push("/admin/shop");
                router.refresh();
            } else {
                const data = await res.json();
                toast.error(data.error || "Failed to update product");
            }
        } catch (error) {
            toast.error("An error occurred");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="p-8 text-center animate-pulse uppercase font-black tracking-widest text-white/20">Loading Product Data...</div>;
    }

    return (
        <div className="max-w-4xl mx-auto mb-20">
            <Link href="/admin/shop" className="inline-flex items-center text-white/60 hover:text-white mb-6 transition-colors font-bold uppercase text-xs">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Shop
            </Link>

            <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center border border-primary/20">
                    <Package className="w-6 h-6 text-primary" />
                </div>
                <div>
                    <h1 className="text-3xl font-black uppercase tracking-tighter">Edit Product</h1>
                    <p className="text-white/40 text-sm italic uppercase font-bold">Update item details</p>
                </div>
            </div>

            <Card className="p-8 border-white/10">
                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-2 space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold uppercase text-white/60">Product Name</label>
                                <Input
                                    placeholder="e.g. Valorant Points"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold uppercase text-white/60 block">
                                        Base Price (Tk)
                                    </label>
                                    <Input
                                        type="number"
                                        placeholder="0"
                                        required
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                    />
                                    <p className="text-[10px] text-white/30 uppercase font-bold italic">
                                        Set to 0 if package options define the total price.
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold uppercase text-white/60">Category</label>
                                    <select
                                        className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary text-white"
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    >
                                        {categories.map(cat => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold uppercase text-white/60">Description / Delivery Instructions</label>
                                <textarea
                                    className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary text-white min-h-[100px]"
                                    placeholder="Enter product details or instructions for the user..."
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <ImageUpload
                                label="Product Image"
                                value={formData.image}
                                onChange={(url) => setFormData({ ...formData, image: url })}
                            />
                        </div>
                    </div>

                    <div className="pt-6 border-t border-white/5">
                        <ProductOptionsEditor
                            value={formData.optionGroups}
                            onChange={(optionGroups) => setFormData({ ...formData, optionGroups })}
                        />
                    </div>

                    <Button variant="neon" className="w-full py-6" disabled={saving}>
                        <Save className="w-4 h-4 mr-2" /> {saving ? "Saving..." : "Save Changes"}
                    </Button>
                </form>
            </Card>
        </div>
    );
}
