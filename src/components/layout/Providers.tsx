"use client";

import { SessionProvider } from "next-auth/react";
import { CartProvider } from "@/context/CartContext";
import CartSidebar from "@/components/features/CartSidebar";

export default function Providers({
    children,
    session
}: {
    children: React.ReactNode,
    session?: any
}) {
    return (
        <SessionProvider session={session}>
            <CartProvider>
                {children}
                <CartSidebar />
            </CartProvider>
        </SessionProvider>
    );
}
