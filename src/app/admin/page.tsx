"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, Users, CreditCard, CheckCircle, XCircle, Clock, Search, Crown, Ban, VolumeX, Volume2, RefreshCw, ChevronDown } from "lucide-react";
import { useUsage } from "@/components/layout/Sidebar";

interface User {
  id: number;
  username: string;
  email: string;
  isPremium: boolean;
  isBlocked: boolean;
  isMuted: boolean;
  createdAt: string;
}

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
  const [authorized, setAuthorized] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"users" | "payments">("users");
  const [usersList, setUsersList] = useState<User[]>([]);
  const [paymentsList, setPaymentsList] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<number | null>(null);

  const ADMIN_PASSWORD = "amkyaw2024";

  const handleLogin = () => {
    if (password === ADMIN_PASSWORD) {
      setAuthorized(true);
      localStorage.setItem("admin_auth", "true");
    } else {
      setError("Invalid password");
    }
  };

  useEffect(() => {
    const stored = localStorage.getItem("admin_auth");
    if (stored === "true") setAuthorized(true);
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/payments?admin=true");
      if (res.ok) {
        const data = await res.json();
        setPaymentsList(data.payments || []);
      }
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  useEffect(() => {
    if (authorized) fetchData();
  }, [authorized]);

  const handleApprovePayment = async (id: number) => {
    setProcessing(id);
    try {
      const res = await fetch("/api/payments", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payment_id: id, status: "approved" }),
      });
      if (res.ok) fetchData();
    } catch (err) { console.error(err); }
    setProcessing(null);
  };

  const handleRejectPayment = async (id: number) => {
    setProcessing(id);
    try {
      const res = await fetch("/api/payments", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payment_id: id, status: "rejected" }),
      });
      if (res.ok) fetchData();
    } catch (err) { console.error(err); }
    setProcessing(null);
  };

  // Login screen
  if (!authorized) {
    return (
      <div className="flex flex-col h-full bg-zinc-950 text-zinc-100 p-8 overflow-y-auto">
        <div className="max-w-md mx-auto w-full">
          <div className="text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-500 text-xs font-bold uppercase tracking-widest">
              <ShieldCheck size={14} />
              <span>System Authority</span>
            </div>
            <h2 className="text-4xl font-extrabold text-white">Admin Console</h2>
            <p className="text-zinc-500">Comprehensive control over users and transactions.</p>
          </div>
          
          <div className="mt-10 p-6 bg-zinc-900 border border-zinc-800 rounded-2xl">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter admin password"
              className="w-full p-4 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-orange-500/50"
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            />
            {error && <p className="text-red-500 text-sm mt-3">{error}</p>}
            <button onClick={handleLogin} className="w-full mt-4 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl transition-all">
              Access Console
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-zinc-950 text-zinc-100 p-4 md:p-8 overflow-y-auto">
      <div className="max-w-6xl mx-auto w-full space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-500 text-xs font-bold uppercase tracking-widest">
              <ShieldCheck size={14} />
              <span>System Authority</span>
            </div>
            <h2 className="text-4xl font-extrabold text-white tracking-tight">Admin Console</h2>
            <p className="text-zinc-500 max-w-md">Comprehensive control over users, transactions, and platform-wide security protocols.</p>
          </div>
          <button onClick={fetchData} className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl hover:bg-zinc-800 transition-all">
            <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 border-b border-zinc-800 pb-4">
          <button
            onClick={() => setActiveTab("users")}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${
              activeTab === "users" 
                ? "bg-orange-500 text-white" 
                : "bg-zinc-900 text-zinc-500 hover:text-zinc-300"
            }`}
          >
            <Users size={18} />
            Users
          </button>
          <button
            onClick={() => setActiveTab("payments")}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${
              activeTab === "payments" 
                ? "bg-orange-500 text-white" 
                : "bg-zinc-900 text-zinc-500 hover:text-zinc-300"
            }`}
          >
            <CreditCard size={18} />
            Payments
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-4">
          <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-2xl">
            <div className="flex items-center gap-2 text-zinc-500 text-sm mb-2">
              <Users size={16} /> Total Users
            </div>
            <div className="text-3xl font-extrabold text-white">{paymentsList.length}</div>
          </div>
          <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-2xl">
            <div className="flex items-center gap-2 text-zinc-500 text-sm mb-2">
              <Clock size={16} /> Pending
            </div>
            <div className="text-3xl font-extrabold text-orange-500">
              {paymentsList.filter(p => p.status === "pending").length}
            </div>
          </div>
          <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-2xl">
            <div className="flex items-center gap-2 text-zinc-500 text-sm mb-2">
              <CreditCard size={16} /> Revenue
            </div>
            <div className="text-3xl font-extrabold text-green-500">
              {paymentsList.filter(p => p.status === "approved").reduce((sum, p) => sum + p.amount, 0)} Ks
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-zinc-500">Loading...</div>
          ) : activeTab === "payments" ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-zinc-900 border-b border-zinc-800">
                  <tr>
                    <th className="text-left px-8 py-4 text-xs font-bold text-zinc-500 uppercase tracking-widest">User</th>
                    <th className="text-left px-8 py-4 text-xs font-bold text-zinc-500 uppercase tracking-widest">Amount</th>
                    <th className="text-left px-8 py-4 text-xs font-bold text-zinc-500 uppercase tracking-widest">Status</th>
                    <th className="text-left px-8 py-4 text-xs font-bold text-zinc-500 uppercase tracking-widest">Date</th>
                    <th className="text-left px-8 py-4 text-xs font-bold text-zinc-500 uppercase tracking-widest">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paymentsList.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-8 py-12 text-center text-zinc-500">No payments found</td>
                    </tr>
                  ) : (
                    paymentsList.map((payment, idx) => (
                      <motion.tr 
                        key={payment.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="border-b border-zinc-800/50 hover:bg-white/[0.02]"
                      >
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-zinc-800 rounded-xl flex items-center justify-center">
                              <Users size={18} className="text-zinc-500" />
                            </div>
                            <span className="font-bold text-white">{payment.username || `User #${payment.user_id}`}</span>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <span className="text-lg font-black text-orange-500">{payment.amount} Ks</span>
                        </td>
                        <td className="px-8 py-6">
                          {payment.status === "approved" ? (
                            <span className="flex items-center gap-2 px-4 py-1.5 bg-green-500/10 text-green-500 rounded-full text-xs font-bold uppercase">
                              <CheckCircle size={14} /> Verified
                            </span>
                          ) : payment.status === "rejected" ? (
                            <span className="flex items-center gap-2 px-4 py-1.5 bg-red-500/10 text-red-500 rounded-full text-xs font-bold uppercase">
                              <XCircle size={14} /> Declined
                            </span>
                          ) : (
                            <span className="flex items-center gap-2 px-4 py-1.5 bg-amber-500/10 text-amber-500 rounded-full text-xs font-bold uppercase animate-pulse">
                              <Clock size={14} /> In Review
                            </span>
                          )}
                        </td>
                        <td className="px-8 py-6 text-sm text-zinc-400">
                          {new Date(payment.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-8 py-6">
                          {payment.status === "pending" && (
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleApprovePayment(payment.id)}
                                disabled={processing === payment.id}
                                className="px-5 py-2.5 bg-green-600 hover:bg-green-500 text-white rounded-xl text-xs font-bold uppercase tracking-widest transition-all"
                              >
                                {processing === payment.id ? <RefreshCw size={14} className="animate-spin" /> : "Approve"}
                              </button>
                              <button
                                onClick={() => handleRejectPayment(payment.id)}
                                disabled={processing === payment.id}
                                className="px-5 py-2.5 bg-zinc-800 hover:bg-red-600 text-zinc-400 hover:text-white rounded-xl text-xs font-bold uppercase tracking-widest transition-all border border-zinc-700 hover:border-red-500"
                              >
                                Reject
                              </button>
                            </div>
                          )}
                        </td>
                      </motion.tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center text-zinc-500">
              <Users size={48} className="mx-auto mb-4 opacity-50" />
              <p>User management coming soon</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}