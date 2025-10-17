import React, { useEffect } from "react";
import { Link } from "react-router-dom";

export default function HomePage() {
    // ✅ 禁止首页滚动条
    useEffect(() => {
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = "auto";
        };
    }, []);

    return (
        <section
            className="relative w-full h-screen overflow-hidden text-white"
            style={{
                backgroundImage: "url('/images/bg.jpg')",
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundAttachment: "fixed",
                animation: "bgZoom 15s ease-in-out infinite alternate", // ✅ 背景轻微放大
            }}
        >
            {/* ✅ 轻柔白色蒙版（增加雾感） */}
            <div className="absolute inset-0 bg-white opacity-[0.08]"></div>

            {/* ✅ 半透明黑遮罩（增加对比） */}
            <div className="absolute inset-0 bg-black bg-opacity-25"></div>

            {/* ✅ 内容居中 */}
            <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-6">
                <h1 className="text-5xl md:text-6xl font-bold mb-4 drop-shadow-2xl">
                    <span style={{ color: "#D6CCFF" }}>Welcome to</span>{" "}
                    <span className="text-white">Smart Restaurant</span>
                </h1>

                <p className="text-lg md:text-xl text-gray-200 mb-10 max-w-2xl mx-auto leading-relaxed">
                    Where fine dining meets modern simplicity — explore, reserve, and taste excellence.
                </p>

                {/* ✅ 按钮组 */}
                <div className="flex flex-wrap justify-center gap-4">
                    <Link
                        to="/menu"
                        className="px-6 py-3 rounded-lg font-semibold transition shadow-lg"
                        style={{
                            backgroundColor: "#D6CCFF",
                            color: "#000",
                        }}
                        onMouseEnter={(e) =>
                            (e.currentTarget.style.backgroundColor = "#C8B7FF")
                        }
                        onMouseLeave={(e) =>
                            (e.currentTarget.style.backgroundColor = "#D6CCFF")
                        }
                    >
                        View Menu
                    </Link>

                    <Link
                        to="/reservation"
                        className="px-6 py-3 rounded-lg font-semibold border-2 transition shadow-lg"
                        style={{
                            borderColor: "#FFFFFF",
                            color: "#FFFFFF",
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = "#FFFFFF";
                            e.currentTarget.style.color = "#000000";
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = "transparent";
                            e.currentTarget.style.color = "#FFFFFF";
                        }}
                    >
                        Book a Table
                    </Link>
                </div>
            </div>

            {/* ✅ 背景缩放动画 */}
            <style>{`
        @keyframes bgZoom {
          0% {
            transform: scale(1);
            filter: brightness(0.9);
          }
          100% {
            transform: scale(1.05);
            filter: brightness(1);
          }
        }
      `}</style>
        </section>
    );
}
