import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";

export default function NavBar() {
    const [open, setOpen] = useState(false);
    const dropdownRef = useRef(null);
    const location = useLocation();

    // ✅ 点击菜单外部自动关闭
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // ✅ 路径高亮逻辑
    const isActive = (path) =>
        location.pathname === path ? "text-[#A678E3] font-semibold" : "";

    return (
        <nav className="fixed top-0 left-0 w-full bg-white shadow-sm z-50">
            <div className="max-w-7xl mx-auto flex justify-between items-center px-6 py-3">

                {/* ✅ Logo 可点击回首页 */}
                <Link
                    to="/"
                    className="flex items-center space-x-2 hover:opacity-80 transition"
                >
                    <img
                        src="/logo192.png"
                        alt="logo"
                        className="w-6 h-6"
                        style={{
                            filter:
                                "brightness(0) saturate(100%) invert(68%) sepia(36%) saturate(661%) hue-rotate(221deg) brightness(101%) contrast(96%)",
                        }}
                    />


                    <span className="font-bold text-black text-lg">SRMS</span>
                </Link>

                {/* ✅ 导航菜单 */}
                <div className="flex space-x-6 font-medium text-gray-700 items-center">
                    <Link to="/" className={`hover:text-[#A678E3] transition ${isActive("/")}`}>
                        Home
                    </Link>
                    <Link
                        to="/menu"
                        className={`hover:text-[#A678E3] transition ${isActive("/menu")}`}
                    >
                        Menu
                    </Link>
                    <Link
                        to="/reservation"
                        className={`hover:text-[#A678E3] transition ${isActive("/reservation")}`}
                    >
                        Reservation
                    </Link>
                    <Link
                        to="/cart"
                        className={`hover:text-[#A678E3] transition ${isActive("/cart")}`}
                    >
                        Cart
                    </Link>

                    {/* ✅ Admin 下拉菜单 */}
                    <div className="relative" ref={dropdownRef}>
                        <button
                            onClick={() => setOpen(!open)}
                            className={`hover:text-[#A678E3] transition ${location.pathname.includes("/admin") ? "text-[#A678E3]" : ""
                                }`}
                        >
                            Admin ▾
                        </button>

                        {open && (
                            <div className="absolute right-0 mt-2 w-44 bg-white border rounded-lg shadow-md animate-fadeIn">
                                <Link
                                    to="/admin/menu"
                                    onClick={() => setOpen(false)}
                                    className="block px-4 py-2 hover:bg-gray-100"
                                >
                                    Manage Menu
                                </Link>
                                <Link
                                    to="/admin/orders"
                                    onClick={() => setOpen(false)}
                                    className="block px-4 py-2 hover:bg-gray-100"
                                >
                                    View Orders
                                </Link>
                                <Link
                                    to="/admin/reservations"
                                    onClick={() => setOpen(false)}
                                    className="block px-4 py-2 hover:bg-gray-100"
                                >
                                    Reservations
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
