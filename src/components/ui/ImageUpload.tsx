import { useState, useRef, useCallback } from "react";
import Image from "next/image";
import { Upload, X, Loader, ImageIcon, Scissors, Check } from "lucide-react";
import Button from "@/components/ui/Button";
import { toast } from "react-hot-toast";
import Cropper from "react-easy-crop";
import getCroppedImg from "@/lib/cropImage";

interface ImageUploadProps {
    value: string;
    onChange: (url: string) => void;
    label?: string;
    aspectRatio?: number; // Added optional aspect ratio
    outputFormat?: "image/jpeg" | "image/png";
    cropShape?: "rect" | "round";
}

export default function ImageUpload({ value, onChange, label, aspectRatio = 1, outputFormat = "image/jpeg", cropShape = "round" }: ImageUploadProps) {
    const [uploading, setUploading] = useState(false);
    const [imageToCrop, setImageToCrop] = useState<string | null>(null);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const onCropComplete = useCallback((_croppedArea: any, croppedAreaPixels: any) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 2 * 1024 * 1024) {
            toast.error("File size must be less than 2MB");
            return;
        }

        const reader = new FileReader();
        reader.onload = () => {
            setImageToCrop(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    const handleSaveCrop = async () => {
        if (!imageToCrop || !croppedAreaPixels) return;

        try {
            setUploading(true);
            const croppedImageBlob = await getCroppedImg(imageToCrop, croppedAreaPixels, 0, { horizontal: false, vertical: false }, outputFormat);

            if (!croppedImageBlob) {
                toast.error("Failed to crop image");
                return;
            }

            const formData = new FormData();
            const extension = outputFormat === "image/png" ? "png" : "jpg";
            formData.append("file", croppedImageBlob, `cropped-image.${extension}`);

            const res = await fetch("/api/admin/upload", {
                method: "POST",
                body: formData,
            });

            const data = await res.json();
            if (res.ok) {
                onChange(data.url);
                setImageToCrop(null);
                toast.success("Image updated successfully");
            } else {
                toast.error(data.error || "Upload failed");
            }
        } catch (error) {
            console.error(error);
            toast.error("An error occurred during upload");
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="space-y-4">
            {label && (
                <label className="text-xs font-bold uppercase text-white/40 mb-2 tracking-widest block">{label}</label>
            )}

            <div className="relative group items-center justify-center border-2 border-dashed border-white/10 rounded-xl p-4 bg-white/5 hover:border-primary/50 transition-colors">
                {value && value.trim() !== "" ? (
                    <div className="relative w-full aspect-square max-w-[320px] mx-auto rounded-lg overflow-hidden border border-white/10 shadow-lg bg-black/40">
                        <Image src={value} alt="Preview" fill className="object-cover" />
                        <button
                            type="button"
                            onClick={() => onChange("")}
                            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:scale-110 transition-transform shadow-lg z-10"
                        >
                            <X className="w-4 h-4" />
                        </button>
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                            <Button size="sm" variant="ghost" className="text-white" onClick={() => fileInputRef.current?.click()}>
                                <Scissors className="w-3 h-3 mr-2" /> Change
                            </Button>
                        </div>
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
                                <span className="text-[10px] uppercase font-bold text-white/20 mt-1">MAX 2MB | SQUARE PREFERRED</span>
                            </>
                        )}
                    </div>
                )}

                <input
                    type="file"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    accept="image/*"
                />
            </div>

            {/* Cropping Dialog */}
            {imageToCrop && (
                <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center p-4 bg-black/90 backdrop-blur-md">
                    <div className="relative w-full max-w-2xl aspect-square bg-zinc-900 rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
                        <Cropper
                            image={imageToCrop}
                            crop={crop}
                            zoom={zoom}
                            aspect={aspectRatio}
                            onCropChange={setCrop}
                            onCropComplete={onCropComplete}
                            onZoomChange={setZoom}
                            cropShape={cropShape}
                            showGrid={false}
                        />
                    </div>

                    <div className="w-full max-w-2xl mt-6 p-6 bg-zinc-900 rounded-2xl border border-white/10 flex flex-col gap-4 shadow-xl">
                        <div className="flex items-center gap-4">
                            <span className="text-xs font-bold uppercase text-white/40 tracking-widest">Zoom</span>
                            <input
                                type="range"
                                value={zoom}
                                min={1}
                                max={3}
                                step={0.1}
                                aria-labelledby="Zoom"
                                onChange={(e) => setZoom(Number(e.target.value))}
                                className="flex-1 accent-primary"
                            />
                        </div>

                        <div className="flex gap-4">
                            <Button
                                type="button"
                                variant="ghost"
                                className="flex-1"
                                onClick={() => setImageToCrop(null)}
                            >
                                <X className="w-4 h-4 mr-2" /> Cancel
                            </Button>
                            <Button
                                type="button"
                                variant="primary"
                                className="flex-1"
                                onClick={handleSaveCrop}
                                isLoading={uploading}
                            >
                                <Check className="w-4 h-4 mr-2" /> Apply Crop
                            </Button>
                        </div>
                    </div>

                    <p className="mt-4 text-[10px] font-bold uppercase text-white/20 tracking-widest animate-pulse">
                        Move and zoom to adjust your profile photo
                    </p>
                </div>
            )}
        </div>
    );
}
