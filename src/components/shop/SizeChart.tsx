"use client";

import { useState } from "react";
import { X, Ruler } from "lucide-react";
import Button from "../ui/Button";

interface SizeChartProps {
    sizeType: 'footwear' | 'apparel';
}

export default function SizeChart({ sizeType }: SizeChartProps) {
    const [isOpen, setIsOpen] = useState(false);

    const footwearSizes = [
        { us: "6", eu: "39", uk: "5.5", cm: "24" },
        { us: "6.5", eu: "39.5", uk: "6", cm: "24.5" },
        { us: "7", eu: "40", uk: "6.5", cm: "25" },
        { us: "7.5", eu: "40.5", uk: "7", cm: "25.5" },
        { us: "8", eu: "41", uk: "7.5", cm: "26" },
        { us: "8.5", eu: "42", uk: "8", cm: "26.5" },
        { us: "9", eu: "42.5", uk: "8.5", cm: "27" },
        { us: "9.5", eu: "43", uk: "9", cm: "27.5" },
        { us: "10", eu: "44", uk: "9.5", cm: "28" },
        { us: "10.5", eu: "44.5", uk: "10", cm: "28.5" },
        { us: "11", eu: "45", uk: "10.5", cm: "29" },
        { us: "11.5", eu: "45.5", uk: "11", cm: "29.5" },
        { us: "12", eu: "46", uk: "11.5", cm: "30" },
    ];

    const apparelSizes = [
        { size: "XS", chest: "32-34", waist: "26-28", hips: "32-34" },
        { size: "S", chest: "35-37", waist: "29-31", hips: "35-37" },
        { size: "M", chest: "38-40", waist: "32-34", hips: "38-40" },
        { size: "L", chest: "41-43", waist: "35-37", hips: "41-43" },
        { size: "XL", chest: "44-46", waist: "38-40", hips: "44-46" },
        { size: "XXL", chest: "47-49", waist: "41-43", hips: "47-49" },
        { size: "XXXL", chest: "50-52", waist: "44-46", hips: "50-52" },
    ];

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="text-xs font-bold text-primary hover:text-primary/80 transition-colors uppercase tracking-wider flex items-center gap-2"
            >
                <Ruler className="w-4 h-4" />
                View Size Chart
            </button>

            {isOpen && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-zinc-900 border border-white/10 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
                        <div className="flex items-center justify-between p-6 border-b border-white/10">
                            <h2 className="text-2xl font-black uppercase tracking-tighter">
                                {sizeType === 'footwear' ? 'Footwear' : 'Apparel'} Size Chart
                            </h2>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="w-10 h-10 flex items-center justify-center hover:bg-white/5 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6 overflow-auto max-h-[calc(90vh-140px)]">
                            {sizeType === 'footwear' ? (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b border-white/10">
                                                <th className="text-left py-3 px-4 font-black uppercase text-xs text-white/60">US</th>
                                                <th className="text-left py-3 px-4 font-black uppercase text-xs text-white/60">EU</th>
                                                <th className="text-left py-3 px-4 font-black uppercase text-xs text-white/60">UK</th>
                                                <th className="text-left py-3 px-4 font-black uppercase text-xs text-white/60">CM</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {footwearSizes.map((size, idx) => (
                                                <tr key={idx} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                                    <td className="py-3 px-4 font-bold">{size.us}</td>
                                                    <td className="py-3 px-4 font-bold">{size.eu}</td>
                                                    <td className="py-3 px-4 font-bold">{size.uk}</td>
                                                    <td className="py-3 px-4 font-bold">{size.cm}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b border-white/10">
                                                <th className="text-left py-3 px-4 font-black uppercase text-xs text-white/60">Size</th>
                                                <th className="text-left py-3 px-4 font-black uppercase text-xs text-white/60">Chest (inch)</th>
                                                <th className="text-left py-3 px-4 font-black uppercase text-xs text-white/60">Waist (inch)</th>
                                                <th className="text-left py-3 px-4 font-black uppercase text-xs text-white/60">Hips (inch)</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {apparelSizes.map((size, idx) => (
                                                <tr key={idx} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                                    <td className="py-3 px-4 font-black text-primary">{size.size}</td>
                                                    <td className="py-3 px-4 font-bold">{size.chest}</td>
                                                    <td className="py-3 px-4 font-bold">{size.waist}</td>
                                                    <td className="py-3 px-4 font-bold">{size.hips}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            <div className="mt-6 p-4 bg-white/5 rounded-xl border border-white/10">
                                <p className="text-xs text-white/60 leading-relaxed">
                                    <span className="font-black text-white uppercase block mb-2">Sizing Guide:</span>
                                    {sizeType === 'footwear'
                                        ? "Measure your foot length from heel to toe. If between sizes, we recommend sizing up for comfort."
                                        : "All measurements are in inches. Measure around the fullest part of your chest, natural waistline, and hips. If between sizes, size up for a relaxed fit."
                                    }
                                </p>
                            </div>
                        </div>

                        <div className="p-6 border-t border-white/10">
                            <Button
                                variant="outline"
                                className="w-full"
                                onClick={() => setIsOpen(false)}
                            >
                                Close
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
