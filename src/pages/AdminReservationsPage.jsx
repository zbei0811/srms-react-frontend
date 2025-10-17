import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";

export default function AdminReservationsPage() {
    const [reservations, setReservations] = useState([]);

    useEffect(() => {
        fetchReservations();
    }, []);

    const fetchReservations = async () => {
        try {
            const res = await axios.get("http://localhost:5000/api/reservations");
            setReservations(res.data);
        } catch (err) {
            console.error("❌ Failed to fetch reservations", err);
        }
    };

    const handleDelete = async (id) => {
        Swal.fire({
            title: "Cancel this reservation?",
            text: "This action cannot be undone.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#A678E3",
            cancelButtonColor: "#aaa",
            confirmButtonText: "Yes, cancel it!",
        }).then(async (result) => {
            if (result.isConfirmed) {
                await axios.delete(`http://localhost:5000/api/reservations/${id}`);
                fetchReservations();
                Swal.fire("Cancelled!", "Reservation removed.", "success");
            }
        });
    };

    return (
        <div className="max-w-5xl mx-auto py-10">
            <h1 className="text-3xl font-bold text-center mb-8 text-[#A678E3]">
                📅 Admin: Reservations
            </h1>

            <div className="overflow-x-auto bg-white rounded-xl shadow">
                <table className="w-full border-collapse">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="p-3 border-b">Name</th>
                            <th className="p-3 border-b">Date</th>
                            <th className="p-3 border-b">Time</th>
                            <th className="p-3 border-b">Guests</th>
                            <th className="p-3 border-b text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {reservations.map((r) => (
                            <tr key={r._id} className="hover:bg-gray-50">
                                <td className="p-3">{r.name}</td>
                                <td className="p-3">{r.date}</td>
                                <td className="p-3">{r.time}</td>
                                <td className="p-3">{r.guests}</td>
                                <td className="p-3 text-center">
                                    <button
                                        onClick={() => handleDelete(r._id)}
                                        className="px-3 text-xs font-medium rounded-full bg-[#E57373] text-white hover:bg-[#D64F4F] transition"
                                        style={{ height: "24px", lineHeight: "24px" }}
                                    >
                                        Cancel
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
