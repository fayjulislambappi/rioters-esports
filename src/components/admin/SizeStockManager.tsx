"use client";

import { useEffect } from "react";
import Button from "../ui/Button";

interface SizeStockManagerProps {
    sizeType: 'footwear' | 'apparel' | null;
    optionGroups: any[];
    onChange: (optionGroups: any[]) => void;
}

export default function SizeStockManager({ sizeType, optionGroups, onChange }: SizeStockManagerProps) {
    const sizes = sizeType === 'footwear'
        ? ['6', '6.5', '7', '7.5', '8', '8.5', '9', '9.5', '10', '10.5', '11', '11.5', '12']
        : ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];

    const sizeGroup = optionGroups?.find((g: any) => g.name === 'Size');

    // Auto-generate Size option group if it contains NO options yet (initial setup)
    useEffect(() => {
        if (!sizeType) return;

        if (!sizeGroup || !sizeGroup.options || sizeGroup.options.length === 0) {
            const sizeOptions = sizes.map(size => ({
                name: size,
                price: 0,
                inStock: true
            }));

            const otherGroups = optionGroups?.filter((g: any) => g.name !== 'Size') || [];
            onChange([
                { name: 'Size', type: 'selection', options: sizeOptions, required: true },
                ...otherGroups
            ]);
        }
    }, [sizeType]);

    if (!sizeType) return null;

    const handleToggleKeep = (size: string, keep: boolean) => {
        const otherGroups = optionGroups?.filter((g: any) => g.name !== 'Size') || [];
        const currentOptions = sizeGroup?.options || [];

        let newOptions;
        if (keep) {
            // Add if not exists
            if (!currentOptions.find((o: any) => o.name === size)) {
                newOptions = [...currentOptions, { name: size, price: 0, inStock: true }];
                // Maintain order if possible (sort by standard size array)
                newOptions.sort((a, b) => sizes.indexOf(a.name) - sizes.indexOf(b.name));
            } else {
                newOptions = currentOptions;
            }
        } else {
            // Remove
            newOptions = currentOptions.filter((o: any) => o.name !== size);
        }

        onChange([
            { ...(sizeGroup || { name: 'Size', type: 'selection', required: true }), options: newOptions },
            ...otherGroups
        ]);
    };

    const handleToggleStock = (size: string, inStock: boolean) => {
        if (!sizeGroup) return;

        const updatedOptions = sizeGroup.options.map((o: any) =>
            o.name === size ? { ...o, inStock } : o
        );

        const updatedGroups = optionGroups.map((g: any) =>
            g.name === 'Size' ? { ...g, options: updatedOptions } : g
        );

        onChange(updatedGroups);
    };

    const handleSelectAll = () => {
        const allOptions = sizes.map(size => ({
            name: size,
            price: 0,
            inStock: true
        }));

        const otherGroups = optionGroups?.filter((g: any) => g.name !== 'Size') || [];
        onChange([
            { ...(sizeGroup || { name: 'Size', type: 'selection', required: true }), options: allOptions },
            ...otherGroups
        ]);
    };

    return (
        <div className="space-y-4 mt-6 p-4 bg-white/5 border border-white/10 rounded-2xl">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-sm font-black uppercase text-white tracking-widest">Customize Sizes</h3>
                    <p className="text-[10px] text-white/40 italic">Select which sizes to include and manage their stock status.</p>
                </div>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 text-[10px] font-black uppercase"
                    onClick={handleSelectAll}
                >
                    Select All
                </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {sizes.map((size) => {
                    const sizeOption = sizeGroup?.options?.find((o: any) => o.name === size);
                    const isKept = !!sizeOption;
                    const isInStock = sizeOption?.inStock !== false;

                    return (
                        <div
                            key={size}
                            className={`p-3 rounded-xl border transition-all flex items-center justify-between ${isKept ? 'bg-primary/5 border-primary/20' : 'bg-black/20 border-white/5 opacity-60'
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    checked={isKept}
                                    onChange={(e) => handleToggleKeep(size, e.target.checked)}
                                    className="w-4 h-4 rounded border-white/10 bg-white/5 text-primary cursor-pointer"
                                />
                                <span className={`text-xs font-black uppercase ${isKept ? 'text-primary' : 'text-white/40'}`}>
                                    {size}
                                </span>
                            </div>

                            {isKept && (
                                <label className="flex items-center gap-2 cursor-pointer group">
                                    <span className={`text-[10px] font-bold uppercase transition-colors ${isInStock ? 'text-white' : 'text-white/40 line-through'}`}>
                                        {isInStock ? 'In Stock' : 'Out of Stock'}
                                    </span>
                                    <input
                                        type="checkbox"
                                        checked={isInStock}
                                        onChange={(e) => handleToggleStock(size, e.target.checked)}
                                        className="w-4 h-4 rounded border-white/10 bg-white/5 text-primary"
                                    />
                                </label>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
