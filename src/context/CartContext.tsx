"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface CartItem {
    id: string | number;
    name: string;
    price: number;
    image: string;
    quantity: number;
    selectedOptions?: { [groupName: string]: any };
    itemKey: string; // Unique key to distinguish items with different options
}

interface CartContextType {
    cart: CartItem[];
    addToCart: (product: any, selections?: { [groupName: string]: any }, quantity?: number) => void;
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

    const addToCart = (product: any, selections?: { [groupName: string]: any }, qty: number = 1) => {
        // Construct a unique key from all selections to differentiate cart items
        const selectionKey = selections
            ? Object.entries(selections)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([group, val]) => `${group}:${typeof val === 'object' ? val.name : val}`)
                .join('|')
            : 'default';

        const itemKey = `${product.id || product._id}-${selectionKey}`;

        setCart((prevCart) => {
            const existingItem = prevCart.find((item) => item.itemKey === itemKey);

            if (existingItem) {
                return prevCart.map((item) =>
                    item.itemKey === itemKey
                        ? { ...item, quantity: item.quantity + qty }
                        : item
                );
            } else {
                let finalPrice = product.price || 0;

                if (selections) {
                    Object.values(selections).forEach(val => {
                        if (typeof val === 'object' && val.price !== undefined) {
                            finalPrice += val.price;
                        }
                    });
                }

                const newItem: CartItem = {
                    id: product.id || product._id,
                    itemKey,
                    name: product.name,
                    image: product.image,
                    price: finalPrice,
                    quantity: qty,
                    selectedOptions: selections
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
