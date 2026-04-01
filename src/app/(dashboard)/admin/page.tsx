"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ShieldCheck, Users, CreditCard, CheckCircle, XCircle, Clock, Search, Crown, Ban, VolumeX, Volume2, RefreshCw, User, Trash2, UserCheck, UserX, DollarSign } from "lucide-react";

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
  const [activeTab, setActiveTab] = useState<"users" | "payments">("payments");
  const [paymentsList, setPaymentsList] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

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

  // Stats
  const totalUsers = paymentsList.length || 0;
  const totalRevenue = paymentsList.filter(p => p.status === "approved").reduce((sum, p) => sum + (p.amount || 0), 0);
  const pendingPayments = paymentsList.filter(p => p.status === "pending").length;
  const approvedPayments = paymentsList.filter(p => p.status === "approved").length;

  // Filter
  const filteredPayments = paymentsList.filter(p => 
    p.username?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.amount?.toString().includes(searchTerm)
  );

  // Login screen
  if (!authorized) {
    return (
      <div className="flex flex-col h-full bg-zinc-950 text-zinc-100 p-4 md:p-8 overflow-y-auto">
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
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-500 text-xs font-bold uppercase tracking-widest">
              <ShieldCheck size={14} />
              <span>System Authority</span>
            </div>
            <h2 className="text-4xl font-extrabold text-white tracking-tight">Admin Console</h2>
            <p className="text-orange-500 font-bold text-xs uppercase tracking-widest">Admin Panel</p>
            <p className="text-zinc-500 max-w-md">Comprehensive control over users, transactions, and platform-wide security protocols.</p>
          </div>

          {/* Tab Buttons */}
          <div className="flex items-center gap-2 bg-zinc-900/80 p-1.5 rounded-2xl border border-zinc-800">
            <button
              onClick={() => setActiveTab("users")}
              className={`flex items-center gap-2.5 px-6 py-3 rounded-xl font-bold transition-all ${activeTab === "users" ? "bg-orange-500 text-white shadow-lg" : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50"}`}
            >
              <Users size={18} />
              <span className="hidden sm:inline">User Base</span>
            </button>
            <button
              onClick={() => setActiveTab("payments")}
              className={`flex items-center gap-2.5 px-6 py-3 rounded-xl font-bold transition-all ${activeTab === "payments" ? "bg-orange-500 text-white shadow-lg" : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50"}`}
            >
              <CreditCard size={18} />
              <span className="hidden sm:inline">Revenue</span>
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total Intelligence", value: totalUsers, sub: "Active Nodes", icon: Users, color: "from-blue-500/20 to-blue-600/5", iconColor: "text-blue-500" },
            { label: "Elite Members", value: approvedPayments, sub: "Premium Access", icon: Crown, color: "from-orange-500/20 to-orange-600/5", iconColor: "text-orange-500" },
            { label: "Pending Verification", value: pendingPayments, sub: "Awaiting Review", icon: Clock, color: "from-amber-500/20 to-amber-600/5", iconColor: "text-amber-500" },
            { label: "Total Revenue", value: `${totalRevenue.toLocaleString()} Ks`, sub: "Platform Growth", icon: DollarSign, color: "from-green-500/20 to-green-600/5", iconColor: "text-green-500" },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`p-5 bg-gradient-to-br border border-zinc-800/50 rounded-3xl space-y-4 group hover:border-zinc-700 transition-all ${stat.color}`}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-zinc-950/50 border border-zinc-800 ${stat.iconColor}`}>
                <stat.icon size={24} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">{stat.label}</p>
                <p className="text-2xl font-black text-white mt-1">{stat.value}</p>
                <p className="text-[10px] text-zinc-600 font-bold uppercase">{stat.sub}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search users or amounts..."
            className="w-full pl-12 pr-4 py-4 bg-zinc-900 border border-zinc-800 rounded-2xl text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-orange-500/50"
          />
        </div>

        {/* Refresh Button */}
        <div className="flex justify-end">
          <button onClick={fetchData} className="flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-xl hover:bg-zinc-800 transition-all">
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            <span className="text-sm font-bold">Refresh</span>
          </button>
        </div>

        {/* Content */}
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-zinc-500">
              <RefreshCw size={32} className="animate-spin mx-auto mb-4" />
              <p>Loading...</p>
            </div>
          ) : activeTab === "payments" ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-zinc-900 border-b border-zinc-800">
                  <tr>
                    <th className="text-left px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-widest">User</th>
                    <th className="text-left px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-widest">Amount</th>
                    <th className="text-left px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-widest">Status</th>
                    <th className="text-left px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-widest">Date</th>
                    <th className="text-left px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-widest">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPayments.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-zinc-500">No payments found</td>
                    </tr>
                  ) : (
                    filteredPayments.map((payment, idx) => (
                      <motion.tr 
                        key={payment.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="border-b border-zinc-800/50 hover:bg-white/[0.02]"
                      >
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-zinc-800 rounded-xl flex items-center justify-center">
                              <User size={18} className="text-zinc-500" />
                            </div>
                            <span className="font-bold text-white">{payment.username || `User #${payment.user_id}`}</span>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <span className="text-lg font-black text-orange-500">{payment.amount?.toLocaleString() || 0} Ks</span>
                        </td>
                        <td className="px-6 py-5">
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
                        <td className="px-6 py-5 text-sm text-zinc-400">
                          {payment.created_at ? new Date(payment.created_at).toLocaleDateString() : "-"}
                        </td>
                        <td className="px-6 py-5">
                          {payment.status === "pending" && (
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleApprovePayment(payment.id)}
                                disabled={processing === payment.id}
                                className="px-5 py-2.5 bg-green-600 hover:bg-green-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all"
                              >
                                {processing === payment.id ? <RefreshCw size={14} className="animate-spin" /> : "Approve"}
                              </button>
                              <button
                                onClick={() => handleRejectPayment(payment.id)}
                                disabled={processing === payment.id}
                                className="px-5 py-2.5 bg-zinc-800 hover:bg-red-600 text-zinc-400 hover:text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all border border-zinc-700 hover:border-red-500"
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
