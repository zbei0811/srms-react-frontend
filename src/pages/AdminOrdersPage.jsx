import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/orders");
      setOrders(res.data);
    } catch (err) {
      console.error("❌ Failed to fetch orders", err);
    }
  };

  // ✅ 更新状态为“已完成”
  const markCompleted = async (id) => {
    await axios.put(`http://localhost:5000/api/orders/${id}`, { status: "Completed" });
    fetchOrders();
    Swal.fire({
      icon: "success",
      title: "✅ Order Completed!",
      confirmButtonColor: "#A678E3",
    });
  };

  // ✅ 删除订单（可选）
  const handleDelete = async (id) => {
    Swal.fire({
      title: "Delete this order?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#A678E3",
      cancelButtonColor: "#aaa",
      confirmButtonText: "Yes, delete it",
    }).then(async (result) => {
      if (result.isConfirmed) {
        await axios.delete(`http://localhost:5000/api/orders/${id}`);
        fetchOrders();
        Swal.fire("Deleted!", "Order has been removed.", "success");
      }
    });
  };

  // ✅ 颜色显示逻辑（只两种状态）
  const getStatusStyle = (status) => {
    const normalized = (status || "").toLowerCase();
    if (normalized === "completed" || normalized === "delivered") {
      return "bg-[#84C784] text-black";
    }
    return "bg-[#F6D96B] text-black";
  };

  const getStatusLabel = (status) => {
    const normalized = (status || "").toLowerCase();
    if (normalized === "completed" || normalized === "delivered") return "Completed";
    return "In Progress";
  };

  return (
    <div className="max-w-5xl mx-auto py-10">
      <h1 className="text-3xl font-bold text-center mb-8 text-[#A678E3]">
        📦 Admin: Orders
      </h1>

      <div className="overflow-x-auto bg-white rounded-xl shadow">
        <table className="w-full border-collapse">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 border-b">Customer</th>
              <th className="p-3 border-b">Items</th>
              <th className="p-3 border-b">Total ($)</th>
              <th className="p-3 border-b">Status</th>
              <th className="p-3 border-b text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o._id} className="hover:bg-gray-50">
                <td className="p-3">{o.customerName || "N/A"}</td>
                <td className="p-3">
                  {Array.isArray(o.items)
                    ? o.items.join(", ")
                    : String(o.items || "N/A")}
                </td>
                <td className="p-3">{o.total?.toFixed(2)}</td>
                <td className="p-3">
                  <span
                    className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusStyle(
                      o.status
                    )}`}
                  >
                    {getStatusLabel(o.status)}
                  </span>
                </td>
                <td className="p-3 text-center space-x-2">
                  {o.status?.toLowerCase() !== "completed" &&
                    o.status?.toLowerCase() !== "delivered" && (
                      <button
                        onClick={() => markCompleted(o._id)}
                        className="px-3 text-xs font-medium rounded-full bg-[#A678E3] text-white hover:bg-[#8C5DD8] transition"
                        style={{ height: "26px", lineHeight: "26px" }}
                      >
                        Mark Completed
                      </button>
                    )}
                  <button
                    onClick={() => handleDelete(o._id)}
                    className="px-3 text-xs font-medium rounded-full bg-[#E57373] text-white hover:bg-[#D64F4F] transition"
                    style={{ height: "26px", lineHeight: "26px" }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
