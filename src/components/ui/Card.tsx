"use client";

import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";
import React from "react";

interface CardProps extends HTMLMotionProps<"div"> {
    hoverEffect?: boolean;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
    ({ className, hoverEffect = true, children, ...props }, ref) => {
        return (
            <motion.div
                ref={ref}
                initial={hoverEffect ? { opacity: 0, y: 20 } : undefined}
                whileInView={hoverEffect ? { opacity: 1, y: 0 } : undefined}
                viewport={{ once: true }}
                whileHover={
                    hoverEffect
                        ? {
                            y: -5,
                            boxShadow: "0 10px 30px -10px rgba(0, 255, 153, 0.3)",
                            borderColor: "rgba(0, 255, 153, 0.3)",
                        }
                        : undefined
                }
                className={cn(
                    "bg-white/5 backdrop-blur-md border border-white/10 rounded-xl overflow-hidden transition-colors",
                    className,
                )}
                {...props}
            >
                {children}
            </motion.div>
        );
    },
);

Card.displayName = "Card";

export default Card;
