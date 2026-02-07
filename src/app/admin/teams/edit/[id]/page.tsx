"use client";

import { useState, useEffect, use } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { MoveLeft, Save } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import ImageUpload from "@/components/ui/ImageUpload";

export default function EditTeamPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        tag: "",
        logo: "",
        description: "",
    });

    useEffect(() => {
        const fetchTeam = async () => {
            try {
                const res = await fetch(`/api/admin/teams/${id}`);
                const data = await res.json();
                if (res.ok) {
                    setFormData({
                        name: data.name,
                        tag: data.tag,
                        logo: data.logo || "",
                        description: data.description || "",
                    });
                } else {
                    toast.error("Failed to fetch team data");
                }
            } catch (error) {
                toast.error("An error occurred while fetching team data");
            } finally {
                setLoading(false);
            }
        };

        fetchTeam();
    }, [id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            const res = await fetch(`/api/admin/teams/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                toast.success("Team updated successfully");
                router.push("/admin/teams");
                router.refresh();
            } else {
                const data = await res.json();
                toast.error(data.error || "Failed to update team");
            }
        } catch (error) {
            toast.error("An error occurred");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="p-8 text-center animate-pulse uppercase font-black tracking-widest text-white/20">Loading Team Data...</div>;
    }

    return (
        <div className="max-w-2xl mx-auto">
            <Link href="/admin/teams" className="inline-block mb-6">
                <Button variant="ghost" size="sm" className="pl-0 hover:bg-transparent hover:text-primary">
                    <MoveLeft className="mr-2 h-4 w-4" /> Back to Teams
                </Button>
            </Link>

            <div className="glass-card p-8">
                <h1 className="text-2xl font-black uppercase tracking-tighter mb-8">Edit Team</h1>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold uppercase text-white/60 mb-2">Team Name</label>
                            <Input
                                placeholder="e.g. Alpha Squad"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold uppercase text-white/60 mb-2">Team Tag</label>
                            <Input
                                placeholder="e.g. ASQD"
                                required
                                value={formData.tag}
                                onChange={(e) => setFormData({ ...formData, tag: e.target.value })}
                            />
                        </div>

                        <div>
                            <ImageUpload
                                label="Team Logo"
                                value={formData.logo}
                                onChange={(url) => setFormData({ ...formData, logo: url })}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold uppercase text-white/60 mb-2">Description</label>
                            <textarea
                                className="flex min-h-[100px] w-full rounded-md border border-white/20 bg-black/20 px-3 py-2 text-sm text-foreground focus:border-primary/50 focus:outline-none"
                                placeholder="Team description..."
                                required
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="flex justify-end pt-4 border-t border-white/10">
                        <Button type="submit" variant="primary" isLoading={saving}>
                            <Save className="w-4 h-4 mr-2" /> Save Changes
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
