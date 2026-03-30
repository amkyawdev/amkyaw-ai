"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { CreditCard, Check, Loader2, Phone, Upload, Wallet, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function PaymentPage() {
  const [amount, setAmount] = useState("3000");
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) setUser(JSON.parse(stored));
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const reader = new FileReader();
    reader.onload = () => {
      setScreenshot(reader.result as string);
      setUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !screenshot) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user.id,
          amount: parseFloat(amount),
          screenshot_url: screenshot,
        }),
      });
      if (res.ok) setSubmitted(true);
    } catch (err) { console.error(err); }
    setSubmitting(false);
  };

  const plans = [
    { days: 30, price: 3000, name: "Monthly" },
    { days: 90, price: 8000, name: "3 Months" },
    { days: 180, price: 15000, name: "6 Months" },
    { days: 365, price: 25000, name: "Yearly" },
  ];

  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          className="max-w-md w-full bg-card border border-border rounded-2xl p-8 text-center">
          <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-green-500" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Payment Submitted!</h1>
          <p className="text-muted-foreground mb-6">Your payment is pending approval.</p>
          <Link href="/chat" className="inline-flex items-center gap-2 px-6 py-3 bg-orange-500 rounded-lg font-medium">
            Go to Chat <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Link href="/" className="p-2 rounded-lg hover:bg-white/5 text-2xl">←</Link>
          <h1 className="text-2xl font-bold">💎 Premium Payment</h1>
        </div>

        {!user ? (
          <div className="bg-card border border-border rounded-2xl p-8 text-center">
            <p className="text-muted-foreground">Please login first to purchase premium.</p>
            <Link href="/login" className="mt-4 inline-block px-6 py-2 bg-orange-500 rounded-lg">Login</Link>
          </div>
        ) : user.is_premium ? (
          <div className="bg-card border border-green-500/30 rounded-2xl p-8 text-center">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-green-500" />
            </div>
            <h2 className="text-xl font-bold text-green-400">You are Premium!</h2>
            <p className="text-muted-foreground mt-2">Enjoy unlimited AI chats.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Select Plan</h2>
              <div className="grid grid-cols-2 gap-3">
                {plans.map((plan) => (
                  <button key={plan.days} onClick={() => setAmount(String(plan.price))}
                    className={`p-4 rounded-xl border transition-all ${amount === String(plan.price) 
                      ? "border-orange-500 bg-orange-500/10" : "border-border hover:border-orange-500/50"}`}>
                    <div className="font-bold text-lg">{plan.name}</div>
                    <div className="text-orange-400">{plan.price} MMK</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-card border border-border rounded-2xl p-6">
              <h2 className="text-lg font-semibold mb-4">KBZPay Payment</h2>
              <div className="bg-muted rounded-lg p-4 mb-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <Phone className="w-4 h-4" /> KBZPay Number
                </div>
                <div className="text-xl font-mono">09 123 456 789</div>
              </div>
              <div className="bg-muted rounded-lg p-4 mb-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <Wallet className="w-4 h-4" /> Amount to Pay
                </div>
                <div className="text-2xl font-bold text-orange-400">{amount} MMK</div>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm mb-2">Upload Screenshot</label>
                  <label className="border-2 border-dashed border-border rounded-lg p-4 text-center cursor-pointer hover:border-orange-500/50 transition-colors block">
                    {screenshot ? (
                      <img src={screenshot} alt="Receipt" className="max-h-40 mx-auto rounded-lg" />
                    ) : uploading ? (
                      <Loader2 className="w-8 h-8 animate-spin mx-auto text-orange-500" />
                    ) : (
                      <>
                        <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground">Click to upload</p>
                      </>
                    )}
                    <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                  </label>
                </div>
                <button type="submit" disabled={!screenshot || submitting}
                  className="w-full py-3 bg-gradient-to-r from-orange-500 to-amber-500 rounded-lg font-medium disabled:opacity-50 flex items-center justify-center gap-2">
                  {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <CreditCard className="w-5 h-5" />}
                  Submit Payment
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}