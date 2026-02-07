"use client";

import { SessionProvider } from "next-auth/react";
import { CartProvider } from "@/context/CartContext";
import CartSidebar from "@/components/features/CartSidebar";

export default function Providers({ children }: { children: React.ReactNode }) {
    return (
        <SessionProvider>
            <CartProvider>
                {children}
                <CartSidebar />
            </CartProvider>
        </SessionProvider>
    );
}
