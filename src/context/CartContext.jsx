import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";

const CartContext = createContext();
export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState([]);
    const API_BASE = "http://localhost:5000";

    // 本地存储加载
    useEffect(() => {
        const saved = localStorage.getItem("cart");
        if (saved) setCart(JSON.parse(saved));
    }, []);

    useEffect(() => {
        localStorage.setItem("cart", JSON.stringify(cart));
    }, [cart]);

    const addToCart = (item) => {
        setCart((prev) => {
            const existing = prev.find((i) => i._id === item._id);
            return existing
                ? prev.map((i) =>
                    i._id === item._id ? { ...i, qty: i.qty + 1 } : i
                )
                : [...prev, { ...item, qty: 1 }];
        });
    };

    const removeFromCart = (id) =>
        setCart((prev) => prev.filter((i) => i._id !== id));

    const clearCart = () => setCart([]);

    const checkout = async () => {
        if (cart.length === 0) {
            Swal.fire("Your cart is empty!", "", "info");
            return;
        }

        try {
            const res = await axios.post(`${API_BASE}/api/orders`, {
                items: cart,
                total: cart.reduce((sum, i) => sum + i.price * i.qty, 0),
            });
            if (res.data) {
                Swal.fire("Order placed successfully!", "", "success");
                setCart([]);
                localStorage.removeItem("cart");
            }
        } catch (err) {
            console.error("❌ Failed to submit order:", err);
            Swal.fire("Failed to send order", "Please try again", "error");
        }
    };

    return (
        <CartContext.Provider
            value={{ cart, addToCart, removeFromCart, clearCart, checkout }}
        >
            {children}
        </CartContext.Provider>
    );
};
