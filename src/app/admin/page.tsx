"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Users, DollarSign, Check, X, Eye, RefreshCw, LogOut } from "lucide-react";
import Link from "next/link";

interface Payment {
  id: number;
  user_id: number;
  username: string;
  amount: number;
  screenshot_url: string;
  status: string;
  created_at: string;
}

export default function AdminPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<number | null>(null);
  const [stats, setStats] = useState({ totalUsers: 0, pendingPayments: 0, totalRevenue: 0 });

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/payments?admin=true");
      if (res.ok) {
        const data = await res.json();
        setPayments(data.payments || []);
        setStats(data.stats || stats);
      }
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const handleApprove = async (paymentId: number) => {
    setProcessing(paymentId);
    try {
      const res = await fetch("/api/payments", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payment_id: paymentId, status: "approved" }),
      });
      if (res.ok) fetchPayments();
    } catch (err) { console.error(err); }
    setProcessing(null);
  };

  const handleReject = async (paymentId: number) => {
    setProcessing(paymentId);
    try {
      const res = await fetch("/api/payments", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payment_id: paymentId, status: "rejected" }),
      });
      if (res.ok) fetchPayments();
    } catch (err) { console.error(err); }
    setProcessing(null);
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Link href="/" className="p-2 rounded-lg hover:bg-white/5 text-2xl">←</Link>
            <h1 className="text-2xl font-bold">🔧 Admin Dashboard</h1>
          </div>
          <button onClick={fetchPayments} className="p-2 rounded-lg hover:bg-white/5">
            <RefreshCw className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Users className="w-4 h-4" /> Total Users
            </div>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <DollarSign className="w-4 h-4" /> Pending
            </div>
            <div className="text-2xl font-bold text-orange-400">{stats.pendingPayments}</div>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <DollarSign className="w-4 h-4" /> Revenue
            </div>
            <div className="text-2xl font-bold text-green-400">{stats.totalRevenue} MMK</div>
          </div>
        </div>

        {/* Payments Table */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="p-4 border-b border-border">
            <h2 className="font-semibold">Payment Requests</h2>
          </div>
          
          {loading ? (
            <div className="p-8 text-center text-muted-foreground">Loading...</div>
          ) : payments.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">No pending payments</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-4 text-sm font-medium">User</th>
                    <th className="text-left p-4 text-sm font-medium">Amount</th>
                    <th className="text-left p-4 text-sm font-medium">Screenshot</th>
                    <th className="text-left p-4 text-sm font-medium">Status</th>
                    <th className="text-left p-4 text-sm font-medium">Date</th>
                    <th className="text-left p-4 text-sm font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((payment) => (
                    <motion.tr key={payment.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      className="border-t border-border">
                      <td className="p-4">{payment.username || `User #${payment.user_id}`}</td>
                      <td className="p-4 font-mono text-orange-400">{payment.amount} MMK</td>
                      <td className="p-4">
                        {payment.screenshot_url && (
                          <button className="text-blue-400 hover:underline flex items-center gap-1">
                            <Eye className="w-4 h-4" /> View
                          </button>
                        )}
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          payment.status === "pending" ? "bg-orange-500/20 text-orange-400" :
                          payment.status === "approved" ? "bg-green-500/20 text-green-400" :
                          "bg-red-500/20 text-red-400"
                        }`}>
                          {payment.status}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-muted-foreground">
                        {new Date(payment.created_at).toLocaleDateString()}
                      </td>
                      <td className="p-4">
                        {payment.status === "pending" && (
                          <div className="flex gap-2">
                            <button onClick={() => handleApprove(payment.id)} disabled={processing === payment.id}
                              className="p-2 rounded-lg bg-green-500/20 hover:bg-green-500/30 text-green-400">
                              {processing === payment.id ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                            </button>
                            <button onClick={() => handleReject(payment.id)} disabled={processing === payment.id}
                              className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400">
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}