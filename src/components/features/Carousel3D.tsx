"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import React, { useRef, useEffect } from "react";
import RosterCard3D from "./RosterCard3D";
import PlayerCard from "./PlayerCard";

interface Carousel3DProps {
    teamMembers: any[];
    teamInfo: any;
}

export default function Carousel3D({ teamMembers, teamInfo }: Carousel3DProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const rotation = useMotionValue(0);
    const smoothRotation = useSpring(rotation, { stiffness: 60, damping: 20, mass: 1 });

    const handlePan = (event: MouseEvent | TouchEvent | PointerEvent, info: any) => {
        // Drag to rotate logic
        // Delta X determines rotation direction and speed
        const newRotation = rotation.get() + info.delta.x * 0.2;
        rotation.set(newRotation);
    };

    const count = teamMembers.length;

    // Dynamic radius based on count to keep gaps consistent, minimum 300
    const radius = Math.max(300, count * 110);

    return (
        <motion.div
            ref={containerRef}
            className="w-full h-full absolute inset-0 flex justify-center items-center preserve-3d cursor-grab active:cursor-grabbing" // Absolute to fill parent
            onPan={handlePan}
        >
            {teamMembers.map((member, index) => {
                const isCaptain = member?._id === (typeof teamInfo.captainId === 'string' ? teamInfo.captainId : teamInfo.captainId?._id);

                return (
                    <CarouselItem
                        key={member._id || index}
                        index={index}
                        count={count}
                        rotation={smoothRotation}
                        radius={radius}
                    >
                        <RosterCard3D
                            initialValues={{ x: 0, z: 0, rotateY: 0, scale: 1 }}
                            indexZ={10} // Base Z-index, will be overridden by parent for sorting
                        >
                            <div className="pointer-events-auto"> {/* Ensure click events pass through */}
                                <PlayerCard
                                    ign={member.name}
                                    role={member.roles || [member.role || 'TEAM_MEMBER']}
                                    rank={isCaptain ? "Captain" : "Pro"}
                                    image={member.image}
                                    game={teamInfo.gameFocus || "General"}
                                    score={(95 + (index % 5)).toString()}
                                    teamLogo={teamInfo.logo || "/logo.png"}
                                    teamName={teamInfo.name}
                                />
                                <div className="mt-4 text-center pointer-events-none">
                                    <div className="text-[10px] font-black uppercase text-white/20 tracking-[0.4em]">
                                        {isCaptain ? "Leadership" : "Main Roster"}
                                    </div>
                                </div>
                            </div>
                        </RosterCard3D>
                    </CarouselItem>
                );
            })}
        </motion.div>
    );
}

function CarouselItem({ index, count, rotation, radius, children }: any) {
    const angleStep = 360 / count;
    const baseAngle = index * angleStep;

    const angle = useTransform(rotation, (r: number) => baseAngle + r);

    // Calculate Position on a Circle/Cylinder
    // x = r * sin(theta)
    // z = r * cos(theta) - r (shift back so front is at 0, or just center at 0)
    // Let's center at 0,0,0. Front item is at z = radius. Back is at -radius.
    // Framer Motion uses degrees for rotation but Math uses radians.

    const x = useTransform(angle, (a) => radius * Math.sin(a * Math.PI / 180));
    const z = useTransform(angle, (a) => radius * Math.cos(a * Math.PI / 180));

    // Rotate the card to face outward
    const rotateY = useTransform(angle, (a) => a);

    // Dynamic Z-Index for simple layering (imperfect but works for circle)
    // We want items with largest Z (closest to viewer) to have highest index.
    const zIndex = useTransform(z, (currentZ) => Math.round(currentZ + radius + 100));

    // Opacity/Scale fade for items in back
    const opacity = useTransform(z, [-radius, radius], [0.3, 1]);
    const scale = useTransform(z, [-radius, radius], [0.6, 1]);

    return (
        <motion.div
            style={{
                x,
                z,
                rotateY,
                zIndex,
                opacity,
                scale,
                position: 'absolute',
                width: 280, // Match card width to ensure centering
                // height: 400, // Optional
                transformStyle: 'preserve-3d',
            }}
            className="flex justify-center items-center"
        >
            {children}
        </motion.div>
    );
}
