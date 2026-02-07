"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Card from "@/components/ui/Card";
import { Package, ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import ImageUpload from "@/components/ui/ImageUpload";

export default function NewProductPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        price: "",
        category: "Game Currency",
        image: "",
    });

    const categories = ["Game Currency", "Game Pass", "Merchandise", "Subscription"];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch("/api/admin/products", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...formData,
                    price: parseFloat(formData.price),
                }),
            });

            if (res.ok) {
                toast.success("Product created successfully!");
                router.push("/admin/shop");
                router.refresh();
            } else {
                const data = await res.json();
                toast.error(data.error || "Failed to create product");
            }
        } catch (error) {
            toast.error("An error occurred");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <Link href="/admin/shop" className="inline-flex items-center text-white/60 hover:text-white mb-6 transition-colors font-bold uppercase text-xs">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Shop
            </Link>

            <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center border border-primary/20">
                    <Package className="w-6 h-6 text-primary" />
                </div>
                <div>
                    <h1 className="text-3xl font-black uppercase tracking-tighter">Add New Product</h1>
                    <p className="text-white/40 text-sm italic uppercase font-bold">Register a new item in the market</p>
                </div>
            </div>

            <Card className="p-8 border-white/10">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-bold uppercase text-white/60">Product Name</label>
                        <Input
                            placeholder="e.g. Valorant Points (1000)"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-bold uppercase text-white/60">Price ($)</label>
                            <Input
                                type="number"
                                step="0.01"
                                placeholder="9.99"
                                required
                                value={formData.price}
                                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                            />
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

                    <div className="space-y-4">
                        <ImageUpload
                            label="Product Image"
                            value={formData.image}
                            onChange={(url) => setFormData({ ...formData, image: url })}
                        />
                    </div>

                    <Button variant="neon" className="w-full py-6" disabled={loading}>
                        <Save className="w-4 h-4 mr-2" /> {loading ? "Creating..." : "Create Product"}
                    </Button>
                </form>
            </Card>
        </div>
    );
}
