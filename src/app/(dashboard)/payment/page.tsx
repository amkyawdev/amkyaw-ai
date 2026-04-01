"use client";

import { useState, useEffect } from "react";
import { CreditCard, ShieldCheck, CheckCircle, Smartphone, Wallet, Building2, Upload, ArrowRight, Info, Phone, User, Sparkles, Zap, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

// Pricing Plans
const PRICING_PLANS = [
  {
    id: "monthly",
    name: "Monthly",
    duration: "1 Month",
    price: 5000,
    priceDisplay: "5,000",
    features: ["Unlimited Chat", "4K Image Generation", "Priority Support"],
    popular: false,
  },
  {
    id: "6months",
    name: "6 Months",
    duration: "6 Months",
    price: 25000,
    priceDisplay: "25,000",
    features: ["Everything in Monthly", "2 Months Free", "Early Access"],
    popular: true,
  },
  {
    id: "yearly",
    name: "Yearly",
    duration: "1 Year",
    price: 50000,
    priceDisplay: "50,000",
    features: ["Everything in 6 Months", "4 Months Free", "Exclusive Features"],
    popular: false,
  },
];

export default function PaymentPage() {
  const [step, setStep] = useState(1);
  const [method, setMethod] = useState<"kpay" | "wave" | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [screenshotUrl, setScreenshotUrl] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [selectedPlan, setSelectedPlan] = useState<typeof PRICING_PLANS[0] | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) setUser(JSON.parse(stored));
  }, []);

  const paymentMethods = [
    { id: "kpay", name: "KBZPay", icon: Smartphone, color: "bg-blue-600", account: "09677740154", owner: "U AUNG MYO KYAW" },
    { id: "wave", name: "WaveMoney", icon: Wallet, color: "bg-yellow-500", account: "09677740154", owner: "U AUNG MYO KYAW" },
  ];

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setScreenshotUrl(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!method || !screenshotUrl || !selectedPlan) return;

    setIsLoading(true);
    try {
      const userId = user?.id || 1;
      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          amount: selectedPlan.price,
          plan: selectedPlan.id,
          screenshot_url: screenshotUrl,
        }),
      });

      if (res.ok) {
        setStep(3);
      }
    } catch (error) {
      console.error("Payment submission error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlanSelect = (plan: typeof PRICING_PLANS[0]) => {
    setSelectedPlan(plan);
    setStep(1.5); // Go to payment method selection
  };

  return (
    <div className="flex flex-col h-full bg-zinc-950 text-zinc-100 p-4 md:p-8 overflow-y-auto relative">
      {/* Background Effects */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-orange-500/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-amber-500/10 rounded-full blur-[120px] animate-pulse [animation-delay:2s]" />
      </div>

      <div className="max-w-5xl mx-auto w-full space-y-12 relative z-10">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-500 text-xs font-bold uppercase tracking-widest"
          >
            <ShieldCheck size={14} />
            <span>Elite Membership</span>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-black text-white tracking-tight"
          >
            Unlock <span className="text-orange-500">Pro</span> Potential
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-orange-500 font-bold text-sm uppercase tracking-widest"
          >
            Upgrade to Premium
          </motion.p>
          <motion.p
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-zinc-500 max-w-2xl mx-auto text-lg"
          >
            Unlimited AI conversations, 4K image generation, and priority access to new features for just <span className="text-white font-bold">5,000 Ks</span> per month.
          </motion.p>
        </div>

        {/* Steps Indicator */}
        <div className="flex items-center justify-center gap-4 md:gap-6">
          {[(step < 2 ? 1 : 1.5), 2, 3].filter((s, i, arr) => s !== undefined).map((s, idx, arr) => (
            <div key={idx} className="flex items-center gap-4">
              <div className={cn(
                "w-10 md:w-12 h-10 md:h-12 rounded-2xl flex items-center justify-center font-bold transition-all duration-500 border-2",
                (step >= 2 && idx === 0) || (step >= 2 && idx === 1) ? "bg-orange-500 border-orange-400 text-white shadow-lg shadow-orange-500/30 scale-110" : 
                step >= (s as number) ? "bg-orange-500 border-orange-400 text-white shadow-lg shadow-orange-500/30 scale-110" : "bg-zinc-900 text-zinc-600 border-zinc-800"
              )}>
                {step > (s as number) ? <CheckCircle size={20} /> : <span className="text-lg">{idx === 0 && step < 2 ? 1 : idx === 0 ? '1' : idx === 1 ? 2 : 3}</span>}
              </div>
              {idx < arr.length - 1 && <div className={cn("w-8 md:w-16 h-1 bg-zinc-800 rounded-full", step > (s as number) && "bg-orange-500/20")}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: step > (s as number) ? "100%" : "0%" }}
                  className="h-full bg-orange-500"
                />
              </div>}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* Step 1: Select Plan */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-8"
            >
              <div className="text-center">
                <h3 className="text-2xl font-bold text-white mb-2">Choose Your Plan</h3>
                <p className="text-zinc-500">Choose the perfect plan for you</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                {PRICING_PLANS.map((plan) => (
                  <button
                    key={plan.id}
                    onClick={() => handlePlanSelect(plan)}
                    className={cn(
                      "relative group p-6 bg-zinc-900/50 backdrop-blur-xl border rounded-3xl transition-all text-left space-y-4 hover:border-orange-500/50",
                      plan.popular ? "border-orange-500/50 ring-2 ring-orange-500/20" : "border-zinc-800"
                    )}
                  >
                    {plan.popular && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-orange-500 text-white text-xs font-bold rounded-full">
                        Best Value
                      </div>
                    )}
                    <div className="text-center space-y-2">
                      <h4 className="text-xl font-bold text-white">{plan.name}</h4>
                      <p className="text-zinc-500 text-sm">{plan.duration}</p>
                    </div>
                    <div className="text-center">
                      <span className="text-3xl md:text-4xl font-black text-orange-500">{plan.priceDisplay}</span>
                      <span className="text-zinc-500 text-sm"> Ks</span>
                    </div>
                    <div className="space-y-2 pt-4 border-t border-zinc-800">
                      {plan.features.map((feature, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm text-zinc-400">
                          <CheckCircle size={14} className="text-orange-500" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                    <div className={cn(
                      "w-full py-3 rounded-xl font-bold transition-all",
                      plan.popular ? "bg-orange-500 text-white hover:bg-orange-600" : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                    )}>
                      Select
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Step 1.5: Select Payment Method */}
          {step === 1.5 && selectedPlan && (
            <motion.div
              key="step1.5"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-6"
            >
              {/* Selected Plan Summary */}
              <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-2xl flex items-center justify-between max-w-md mx-auto">
                <div>
                  <p className="text-zinc-400 text-sm">Selected Plan</p>
                  <p className="text-white font-bold">{selectedPlan.name} ({selectedPlan.duration})</p>
                </div>
                <div className="text-right">
                  <p className="text-zinc-400 text-sm">Plan Price</p>
                  <p className="text-orange-500 font-bold text-xl">{selectedPlan.priceDisplay} Ks</p>
                </div>
              </div>

              <div className="text-center space-y-2">
                <h3 className="text-2xl font-bold text-white">Select Payment Method</h3>
                <p className="text-zinc-500">Thank you for your purchase!</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
                {paymentMethods.map((pm) => (
                  <button
                    key={pm.id}
                    onClick={() => { setMethod(pm.id as any); setStep(2); }}
                    className="group relative p-8 md:p-10 bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-[40px] hover:border-orange-500/50 transition-all text-left space-y-6 overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-24 h-24 bg-white/[0.02] rounded-bl-[100px] -z-10" />
                    <div className={cn("w-16 md:w-20 h-16 md:h-20 rounded-3xl flex items-center justify-center text-white shadow-2xl transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-500", pm.color)}>
                      <pm.icon size={32} />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-2xl md:text-3xl font-black text-white group-hover:text-orange-500 transition-colors">{pm.name}</h3>
                      <p className="text-zinc-500 text-sm">Fast and secure transfer via the official {pm.name} application.</p>
                    </div>
                    <div className="flex items-center justify-between text-zinc-500 group-hover:text-white pt-4 border-t border-zinc-800/50">
                      <span className="text-xs font-bold uppercase tracking-wider">Select</span>
                      <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-xl mx-auto"
            >
              <div className="p-8 bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-[40px] space-y-6">
                <div className="text-center space-y-2">
                  <h3 className="text-2xl font-bold text-white">Transfer Details</h3>
                  <p className="text-zinc-500">Send payment to the account below</p>
                </div>

                {paymentMethods.filter(pm => pm.id === method).map((pm) => (
                  <div key={pm.id} className="p-6 bg-zinc-950/50 rounded-2xl space-y-4 border border-zinc-800">
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-500 text-sm">Account Name</span>
                      <span className="text-white font-bold">{pm.owner}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-500 text-sm">Phone Number</span>
                      <span className="text-orange-500 font-bold">{pm.account}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-500 text-sm">Amount</span>
                      <span className="text-white font-bold">{selectedPlan ? selectedPlan.priceDisplay : '5,000'} Ks</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-500 text-sm">Plan</span>
                      <span className="text-orange-400 font-bold">{selectedPlan?.name || 'Monthly'} ( {selectedPlan?.duration || '1 Month'})</span>
                    </div>
                  </div>
                ))}

                <div className="space-y-2">
                  <label className="text-sm font-bold text-zinc-400">Upload Payment Screenshot</label>
                  <div className="relative border-2 border-dashed border-zinc-800 rounded-2xl p-8 text-center hover:border-orange-500/50 transition-all">
                    <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                    {screenshotUrl ? (
                      <img src={screenshotUrl} alt="Screenshot" className="max-h-48 mx-auto rounded-xl" />
                    ) : (
                      <div className="space-y-2">
                        <Upload size={32} className="mx-auto text-zinc-600" />
                        <p className="text-zinc-500 text-sm">Click to upload screenshot</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-4">
                  <button onClick={() => setStep(1)} className="flex-1 py-4 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-2xl transition-all">
                    Back
                  </button>
                  <button 
                    onClick={handlePaymentSubmit} 
                    disabled={!screenshotUrl || isLoading}
                    className="flex-1 py-4 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-bold rounded-2xl transition-all flex items-center justify-center gap-2"
                  >
                    {isLoading ? <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}><Loader2 size={20} /></motion.div> : "Submit Payment"}
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-md mx-auto text-center"
            >
              <div className="p-12 bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-[40px] space-y-8">
                <div className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle size={48} className="text-green-500" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-3xl font-black text-white">Payment Submitted!</h3>
                  <p className="text-zinc-500">Your payment is pending approval. We'll notify you once verified.</p>
                </div>
                <button onClick={() => { setStep(1); setScreenshotUrl(null); }} className="px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-2xl transition-all">
                  Done
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}

function Loader2({ size }: { size: number }) {
  return <div style={{ width: size, height: size, border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%' }} className="animate-spin" />;
}
