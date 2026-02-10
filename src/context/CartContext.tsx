"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface CartItem {
    id: string | number;
    name: string;
    price: number;
    image: string;
    quantity: number;
    selectedVariant?: { name: string, price: number };
    selectedAddOns?: { name: string, price: number }[];
    itemKey: string; // Unique key to distinguish items with different options
}

interface CartContextType {
    cart: CartItem[];
    addToCart: (product: any, options?: { variant?: any, addOns?: any[] }) => void;
    removeFromCart: (itemKey: string) => void;
    updateQuantity: (itemKey: string, quantity: number) => void;
    clearCart: () => void;
    isCartOpen: boolean;
    toggleCart: () => void;
    cartTotal: number;
    cartCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [cart, setCart] = useState<CartItem[]>([]);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        const savedCart = localStorage.getItem("cart");
        if (savedCart) {
            try {
                setCart(JSON.parse(savedCart));
            } catch (e) {
                console.error("Failed to parse cart from local storage", e);
            }
        }
    }, []);

    useEffect(() => {
        if (isMounted) {
            localStorage.setItem("cart", JSON.stringify(cart));
        }
    }, [cart, isMounted]);

    const addToCart = (product: any, options?: { variant?: any, addOns?: any[] }) => {
        const itemKey = `${product.id || product._id}-${options?.variant?.name || 'default'}-${(options?.addOns || []).map(a => a.name).sort().join(',')}`;

        setCart((prevCart) => {
            const existingItem = prevCart.find((item) => item.itemKey === itemKey);

            if (existingItem) {
                return prevCart.map((item) =>
                    item.itemKey === itemKey
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            } else {
                // Calculate base price from product or selected variant
                let finalPrice = options?.variant ? options.variant.price : product.price;

                // Add add-on prices
                if (options?.addOns) {
                    options.addOns.forEach(addon => {
                        finalPrice += addon.price;
                    });
                }

                const newItem: CartItem = {
                    id: product.id || product._id,
                    itemKey,
                    name: product.name,
                    image: product.image,
                    price: finalPrice,
                    quantity: 1,
                    selectedVariant: options?.variant,
                    selectedAddOns: options?.addOns
                };

                return [...prevCart, newItem];
            }
        });
        setIsCartOpen(true);
    };

    const removeFromCart = (itemKey: string) => {
        setCart((prevCart) => prevCart.filter((item) => item.itemKey !== itemKey));
    };

    const updateQuantity = (itemKey: string, quantity: number) => {
        if (quantity < 1) return;
        setCart((prevCart) =>
            prevCart.map((item) => (item.itemKey === itemKey ? { ...item, quantity } : item))
        );
    };

    const clearCart = () => {
        setCart([]);
    };

    const toggleCart = () => {
        setIsCartOpen((prev) => !prev);
    };

    const cartTotal = cart.reduce(
        (total, item) => total + item.price * item.quantity,
        0
    );

    const cartCount = cart.reduce((count, item) => count + item.quantity, 0);

    return (
        <CartContext.Provider
            value={{
                cart,
                addToCart,
                removeFromCart,
                updateQuantity,
                clearCart,
                isCartOpen,
                toggleCart,
                cartTotal,
                cartCount,
            }}
        >
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error("useCart must be used within a CartProvider");
    }
    return context;
}
