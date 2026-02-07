"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Upload, X, Loader, ImageIcon } from "lucide-react";
import Button from "@/components/ui/Button";
import { toast } from "react-hot-toast";

interface ImageUploadProps {
    value: string;
    onChange: (url: string) => void;
    label?: string;
}

export default function ImageUpload({ value, onChange, label }: ImageUploadProps) {
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 2 * 1024 * 1024) {
            toast.error("File size must be less than 2MB");
            return;
        }

        try {
            setUploading(true);
            const formData = new FormData();
            formData.append("file", file);

            const res = await fetch("/api/admin/upload", {
                method: "POST",
                body: formData,
            });

            const data = await res.json();
            if (res.ok) {
                onChange(data.url);
                toast.success("Image uploaded successfully");
            } else {
                toast.error(data.error || "Upload failed");
            }
        } catch (error) {
            toast.error("An error occurred while uploading");
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="space-y-2">
            {label && (
                <label className="text-sm font-bold uppercase text-white/60 tracking-widest">{label}</label>
            )}

            <div className="relative group flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-xl p-4 bg-white/5 hover:border-primary/50 transition-colors">
                {value ? (
                    <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-white/10">
                        <Image src={value} alt="Preview" fill className="object-contain" />
                        <button
                            type="button"
                            onClick={() => onChange("")}
                            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:scale-110 transition-transform shadow-lg"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                ) : (
                    <div
                        className="flex flex-col items-center justify-center py-8 cursor-pointer w-full text-white/40 hover:text-white transition-colors"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        {uploading ? (
                            <Loader className="w-10 h-10 animate-spin text-primary" />
                        ) : (
                            <>
                                <Upload className="w-10 h-10 mb-2" />
                                <span className="text-xs font-black uppercase tracking-widest">Select Image</span>
                                <span className="text-[10px] uppercase font-bold text-white/20 mt-1">MAX 2MB | PNG, JPG, WEBP</span>
                            </>
                        )}
                    </div>
                )}

                <input
                    type="file"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handleUpload}
                    accept="image/*"
                />
            </div>
        </div>
    );
}
