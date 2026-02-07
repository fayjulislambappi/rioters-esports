"use client";

import Image from "next/image";
import Link from "next/link";
import { MoveRight } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

interface GameCardProps {
    title: string;
    image: string;
    category: string;
    tournamentsCount: number;
    slug: string;
}

export default function GameCard({ title, image, category, tournamentsCount, slug }: GameCardProps) {
    return (
        <Card className="group relative h-[400px] flex flex-col justify-end p-0 border-0 overflow-hidden">
            <div className="absolute inset-0">
                {/* Use a placeholder if image fails, or real image */}
                <Image
                    src={image || "/logo.png"}
                    alt={title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
            </div>

            <div className="relative p-6 z-10 translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                <span className="text-primary text-xs font-bold uppercase tracking-wider mb-2 block">
                    {category}
                </span>
                <h3 className="text-3xl font-black uppercase italic mb-2 text-white group-hover:text-primary transition-colors">
                    {title}
                </h3>
                <p className="text-white/60 text-sm mb-6 opacity-0 group-hover:opacity-100 transition-opacity delay-100">
                    {tournamentsCount} Active Tournaments
                </p>

                <Link href={`/games/${slug}`}>
                    <Button variant="neon" size="sm" className="w-full group-hover:bg-accent group-hover:text-white">
                        View Details <MoveRight className="ml-2 w-4 h-4" />
                    </Button>
                </Link>
            </div>
        </Card>
    );
}
