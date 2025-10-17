import React from "react";
import { Routes, Route } from "react-router-dom";
import NavBar from "./components/NavBar";
import FloatingCart from "./components/FloatingCart";

// Pages
import HomePage from "./pages/HomePage";
import MenuPage from "./pages/MenuPage";
import CartPage from "./pages/CartPage";
import ReservationPage from "./pages/ReservationPage";
import AdminMenuPage from "./pages/AdminMenuPage";
import AdminOrdersPage from "./pages/AdminOrdersPage";
import AdminReservationsPage from "./pages/AdminReservationsPage";

export default function App() {
    return (
        <>
            <NavBar />
            <FloatingCart />
            <main className="pt-20 bg-[#F7F7F8] min-h-screen px-4 sm:px-8">
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/menu" element={<MenuPage />} />
                    <Route path="/cart" element={<CartPage />} />
                    <Route path="/reservation" element={<ReservationPage />} />
                    <Route path="/admin/menu" element={<AdminMenuPage />} />
                    <Route path="/admin/orders" element={<AdminOrdersPage />} />
                    <Route path="/admin/reservations" element={<AdminReservationsPage />} />
                </Routes>
            </main>
        </>
    );
}
