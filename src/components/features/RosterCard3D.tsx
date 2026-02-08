"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import React, { useRef, useState } from "react";

interface RosterCard3DProps {
    children: React.ReactNode;
    initialValues: {
        x: number;
        z: number;
        rotateY: number;
        scale: number;
    };
    indexZ: number; // Base z-index
}

export default function RosterCard3D({ children, initialValues, indexZ }: RosterCard3DProps) {
    const ref = useRef<HTMLDivElement>(null);
    const [isHovered, setIsHovered] = useState(false);

    // Mouse position relative to card center - range [-0.5, 0.5]
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    // Smooth physics for tilt
    const mouseXSpring = useSpring(x, { stiffness: 400, damping: 30 });
    const mouseYSpring = useSpring(y, { stiffness: 400, damping: 30 });

    // Map mouse position to rotation (Tilt)
    // RotateX is controlled by mouseY (up/down)
    const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["15deg", "-15deg"]);
    // RotateY is controlled by mouseX (left/right)
    const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-15deg", "15deg"]);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!ref.current) return;

        const rect = ref.current.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;

        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        // Calculate percentage from center
        const xPct = mouseX / width - 0.5;
        const yPct = mouseY / height - 0.5;

        x.set(xPct);
        y.set(yPct);
    };

    const handleMouseLeave = () => {
        setIsHovered(false);
        x.set(0);
        y.set(0);
    };

    const handleMouseEnter = () => {
        setIsHovered(true);
    };

    return (
        <motion.div
            ref={ref}
            initial={{
                opacity: 0,
                x: initialValues.x,
                z: initialValues.z, // Start at computed Z
                rotateY: initialValues.rotateY,
                scale: 0.8 // Start small for entry animation consistency
            }}
            animate={{
                opacity: 1,
                x: initialValues.x,
                // If hovered, pop forward significantly. If not, use fan Z.
                z: isHovered ? 200 : initialValues.z,
                // If hovered, rotate to face front (0). If not, use fan angle.
                rotateY: isHovered ? 0 : initialValues.rotateY,
                scale: isHovered ? 1.15 : initialValues.scale,
                transition: {
                    type: "spring",
                    stiffness: 300,
                    damping: 30
                }
            }}
            style={{
                // Ensure zIndex pops on hover to prevent clipping
                zIndex: isHovered ? 100 : indexZ,
                perspective: 1000,
                transformStyle: "preserve-3d"
            }}
            onMouseMove={handleMouseMove}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className="absolute w-[240px] md:w-[280px] shrink-0 cursor-pointer will-change-transform"
        >
            {/* Inner container for the TILT effect. 
                 Using a separate div prevents conflict with the main layout animations. */}
            <motion.div
                style={{
                    rotateX: rotateX,
                    rotateY: rotateY, // Additional tilt on top of the parent's rotation
                    transformStyle: "preserve-3d",
                }}
                className="w-full h-full"
            >
                {children}
            </motion.div>
        </motion.div>
    );
}
