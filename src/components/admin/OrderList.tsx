"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Search, Filter, CheckCircle, XCircle, Clock, Loader } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

interface Order {
    orderId: string;
    totalAmount: number;
    paymentMethod: string;
    paymentDetails: {
        senderNumber: string;
        transactionId: string;
    };
    shippingDetails: {
        email: string;
        firstName: string;
        lastName: string;
    };
    status: string;
    createdAt: string;
    items: any[];
}

export default function OrderList() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const res = await fetch("/api/admin/orders");
            const data = await res.json();
            if (data.success) {
                setOrders(data.orders);
            }
        } catch (error) {
            console.error("Failed to fetch orders:", error);
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (orderId: string, newStatus: string) => {
        try {
            const res = await fetch("/api/admin/orders", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ orderId, status: newStatus }),
            });
            const data = await res.json();
            if (data.success) {
                // Optimistic update
                setOrders(orders.map(o => o.orderId === orderId ? { ...o, status: newStatus } : o));
            }
        } catch (error) {
            console.error("Failed to update status:", error);
        }
    };

    const filteredOrders = orders.filter(order => {
        const matchesSearch =
            order.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.paymentDetails.transactionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.shippingDetails.email.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = filterStatus === "all" || order.status === filterStatus;

        return matchesSearch && matchesStatus;
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case "completed": return "text-green-500 bg-green-500/10 border-green-500/20";
            case "pending": return "text-yellow-500 bg-yellow-500/10 border-yellow-500/20";
            case "cancelled": return "text-red-500 bg-red-500/10 border-red-500/20";
            default: return "text-white/50 bg-white/5 border-white/10";
        }
    };

    if (loading) {
        return <div className="text-center py-12"><Loader className="w-8 h-8 animate-spin mx-auto text-primary" /></div>;
    }

    return (
        <div className="bg-black/40 border border-white/10 rounded-xl overflow-hidden backdrop-blur-sm">
            {/* Header / Controls */}
            <div className="p-6 border-b border-white/10 flex flex-col md:flex-row gap-4 justify-between items-center">
                <h2 className="text-xl font-bold uppercase">Recent Orders</h2>

                <div className="flex gap-4 w-full md:w-auto">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                        <Input
                            placeholder="Search Order ID or TrxID..."
                            className="pl-10 w-full md:w-64 bg-black/20"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <select
                        className="bg-black/20 border border-white/10 rounded-md px-4 py-2 text-sm focus:outline-none focus:border-primary"
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                    >
                        <option value="all">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-white/5 text-white/60 uppercase text-xs font-bold">
                        <tr>
                            <th className="px-6 py-4">Order ID</th>
                            <th className="px-6 py-4">Customer</th>
                            <th className="px-6 py-4">Amount</th>
                            <th className="px-6 py-4">Payment Info</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {filteredOrders.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-8 text-center text-white/40">No orders found.</td>
                            </tr>
                        ) : (
                            filteredOrders.map((order) => (
                                <tr key={order.orderId} className="hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4 font-mono text-white/80">{order.orderId}</td>
                                    <td className="px-6 py-4">
                                        <div className="font-bold">{order.shippingDetails.firstName} {order.shippingDetails.lastName}</div>
                                        <div className="text-xs text-white/40">{order.shippingDetails.email}</div>
                                    </td>
                                    <td className="px-6 py-4 font-bold text-primary">{order.totalAmount} Tk</td>
                                    <td className="px-6 py-4">
                                        <div className="space-y-1">
                                            {order.items.map((item, idx) => (
                                                <div key={idx} className="text-xs">
                                                    <span className="font-bold">{item.name} x{item.quantity}</span>
                                                    {item.selectedOptions && (
                                                        <div className="pl-2 border-l border-white/10 mt-1 text-[10px] text-white/40 uppercase">
                                                            {Object.entries(item.selectedOptions).map(([k, v]: [string, any]) => (
                                                                <div key={k}>{k}: {typeof v === 'object' ? v.name : v}</div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-xs uppercase font-bold mb-1 opacity-70">{order.paymentMethod}</div>
                                        <div className="font-mono text-xs text-white/60">Trx: {order.paymentDetails.transactionId}</div>
                                        <div className="font-mono text-xs text-white/60">Sender: {order.paymentDetails.senderNumber}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${getStatusColor(order.status)} capitalize`}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {order.status === "pending" && (
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => updateStatus(order.orderId, "completed")}
                                                    className="p-1 hover:text-green-500 transition-colors"
                                                    title="Approve"
                                                >
                                                    <CheckCircle className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={() => updateStatus(order.orderId, "cancelled")}
                                                    className="p-1 hover:text-red-500 transition-colors"
                                                    title="Reject"
                                                >
                                                    <XCircle className="w-5 h-5" />
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
