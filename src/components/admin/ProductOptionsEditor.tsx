"use client";

import { useState } from "react";
import { Plus, Trash2, GripVertical, ChevronDown, ChevronUp } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

interface Option {
    name: string;
    price: number;
    inStock?: boolean;
}

interface OptionGroup {
    name: string;
    type: 'selection' | 'input';
    options?: Option[];
    placeholder?: string;
    required: boolean;
}

interface ProductOptionsEditorProps {
    value: OptionGroup[];
    onChange: (value: OptionGroup[]) => void;
}

export default function ProductOptionsEditor({ value, onChange }: ProductOptionsEditorProps) {
    const addGroup = () => {
        const newGroup: OptionGroup = {
            name: "New Group",
            type: "selection",
            options: [],
            required: true
        };
        onChange([...value, newGroup]);
    };

    const removeGroup = (index: number) => {
        onChange(value.filter((_, i) => i !== index));
    };

    const updateGroup = (index: number, updates: Partial<OptionGroup>) => {
        const newValue = [...value];
        newValue[index] = { ...newValue[index], ...updates };
        onChange(newValue);
    };

    const addOption = (groupIndex: number) => {
        const group = value[groupIndex];
        const newOptions = [...(group.options || []), { name: "", price: 0, inStock: true }];
        updateGroup(groupIndex, { options: newOptions });
    };

    const removeOption = (groupIndex: number, optionIndex: number) => {
        const group = value[groupIndex];
        const newOptions = (group.options || []).filter((_, i) => i !== optionIndex);
        updateGroup(groupIndex, { options: newOptions });
    };

    const updateOption = (groupIndex: number, optionIndex: number, updates: Partial<Option>) => {
        const group = value[groupIndex];
        const newOptions = [...(group.options || [])];
        newOptions[optionIndex] = { ...newOptions[optionIndex], ...updates };
        updateGroup(groupIndex, { options: newOptions });
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold uppercase text-white/60">Product Option Groups</h3>
                <Button variant="outline" size="sm" onClick={addGroup} type="button">
                    <Plus className="w-4 h-4 mr-2" /> Add Group
                </Button>
            </div>

            <div className="space-y-4">
                {value.map((group, gIdx) => (
                    <div key={gIdx} className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-4">
                        <div className="flex flex-col md:flex-row gap-4 items-start">
                            <div className="flex-1 space-y-2">
                                <label className="text-[10px] font-black uppercase text-white/40">Group Name</label>
                                <Input
                                    value={group.name}
                                    onChange={(e) => updateGroup(gIdx, { name: e.target.value })}
                                />
                            </div>
                            <div className="w-32 space-y-2">
                                <label className="text-[10px] font-black uppercase text-white/40">Type</label>
                                <select
                                    className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white"
                                    value={group.type}
                                    onChange={(e) => updateGroup(gIdx, { type: e.target.value as any })}
                                >
                                    <option value="selection">Selection</option>
                                    <option value="input">Input</option>
                                </select>
                            </div>
                            <div className="flex items-center gap-2 pt-8">
                                <input
                                    type="checkbox"
                                    checked={group.required}
                                    onChange={(e) => updateGroup(gIdx, { required: e.target.checked })}
                                    className="w-4 h-4 rounded border-white/10 bg-white/5 text-primary"
                                />
                                <span className="text-[10px] font-black uppercase text-white/40">Required</span>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-500 mt-7"
                                onClick={() => removeGroup(gIdx)}
                                type="button"
                            >
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </div>

                        {group.type === 'selection' ? (
                            <div className="space-y-3 pl-4 border-l-2 border-primary/20">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-[10px] font-black uppercase text-white/40">Options</h4>
                                    <Button variant="ghost" size="sm" onClick={() => addOption(gIdx)} type="button" className="text-[10px] h-6">
                                        <Plus className="w-3 h-3 mr-1" /> Add Option
                                    </Button>
                                </div>
                                <div className="space-y-2">
                                    {group.options?.map((opt, oIdx) => (
                                        <div key={oIdx} className="flex gap-2 items-center">
                                            <Input
                                                placeholder="Option Name"
                                                value={opt.name}
                                                onChange={(e) => updateOption(gIdx, oIdx, { name: e.target.value })}
                                            />
                                            <Input
                                                type="number"
                                                placeholder="Price"
                                                className="w-24"
                                                value={opt.price}
                                                onChange={(e) => updateOption(gIdx, oIdx, { price: parseFloat(e.target.value) || 0 })}
                                            />
                                            <label className="flex items-center gap-2 px-3 py-2 bg-white/5 border border-white/10 rounded-lg cursor-pointer hover:bg-white/10 transition-colors">
                                                <input
                                                    type="checkbox"
                                                    checked={opt.inStock !== false}
                                                    onChange={(e) => updateOption(gIdx, oIdx, { inStock: e.target.checked })}
                                                    className="w-4 h-4 rounded border-white/10 bg-white/5 text-primary"
                                                />
                                                <span className="text-[10px] font-bold uppercase text-white/60 whitespace-nowrap">In Stock</span>
                                            </label>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-white/20 hover:text-red-500"
                                                onClick={() => removeOption(gIdx, oIdx)}
                                                type="button"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-2 pl-4 border-l-2 border-primary/20">
                                <label className="text-[10px] font-black uppercase text-white/40">Placeholder Text</label>
                                <Input
                                    placeholder="Enter Player ID..."
                                    value={group.placeholder || ""}
                                    onChange={(e) => updateGroup(gIdx, { placeholder: e.target.value })}
                                />
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {value.length === 0 && (
                <div className="py-12 border-2 border-dashed border-white/5 rounded-2xl text-center">
                    <p className="text-white/20 text-xs font-bold uppercase">No option groups defined yet</p>
                </div>
            )}
        </div>
    );
}
