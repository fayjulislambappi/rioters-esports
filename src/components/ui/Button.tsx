"use client";

import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";
import React from "react";

interface ButtonProps extends HTMLMotionProps<"button"> {
    variant?: "primary" | "secondary" | "outline" | "ghost" | "neon";
    size?: "sm" | "md" | "lg";
    isLoading?: boolean;
    children: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    (
        { className, variant = "primary", size = "md", isLoading, children, ...props },
        ref,
    ) => {
        const variants = {
            primary: "bg-primary text-black hover:bg-primary/90 shadow-[0_0_15px_rgba(0,255,153,0.5)] border-transparent",
            secondary: "bg-secondary text-white hover:bg-secondary/90 shadow-[0_0_15px_rgba(112,0,255,0.5)] border-transparent",
            outline: "bg-transparent border-2 border-primary text-primary hover:bg-primary/10",
            ghost: "bg-transparent hover:bg-white/5 text-white border-transparent",
            neon: "bg-transparent border border-accent text-accent shadow-[0_0_10px_#ff0066] hover:bg-accent hover:text-white hover:shadow-[0_0_20px_#ff0066]",
        };

        const sizes = {
            sm: "h-8 px-4 text-xs",
            md: "h-10 px-6 text-sm",
            lg: "h-12 px-8 text-base",
        };

        return (
            <motion.button
                ref={ref}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={cn(
                    "relative inline-flex items-center justify-center rounded-md font-bold uppercase tracking-wider transition-colors disabled:opacity-50 disabled:pointer-events-none",
                    variants[variant],
                    sizes[size],
                    className,
                )}
                disabled={isLoading}
                {...props}
            >
                {isLoading && (
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                )}
                {children}
            </motion.button>
        );
    },
);

Button.displayName = "Button";

export default Button;
