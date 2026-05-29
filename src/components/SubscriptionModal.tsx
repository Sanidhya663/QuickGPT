/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { X, CreditCard, Check, Sparkles, AlertCircle, ShieldCheck } from "lucide-react";
import confetti from "canvas-confetti";
import { SubscriptionTier, SubscriptionStatus } from "../types";

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  status: SubscriptionStatus;
  onUpgradeSuccess: (newTier: SubscriptionTier, cardLast4: string, cardBrand: string) => void;
}

export default function SubscriptionModal({
  isOpen,
  onClose,
  status,
  onUpgradeSuccess,
}: SubscriptionModalProps) {
  const [selectedTier, setSelectedTier] = useState<SubscriptionTier>("basic_pro");
  const [step, setStep] = useState<"plans" | "payment" | "success">("plans");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [nameOnCard, setNameOnCard] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState("");

  if (!isOpen) return null;

  // Format credit card input beautifully
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 16) value = value.slice(0, 16);
    const parts = [];
    for (let i = 0; i < value.length; i += 4) {
      parts.push(value.slice(i, i + 4));
    }
    setCardNumber(parts.join(" "));
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 4) value = value.slice(0, 4);
    if (value.length > 2) {
      setExpiry(`${value.slice(0, 2)}/${value.slice(2)}`);
    } else {
      setExpiry(value);
    }
  };

  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "");
    if (value.length <= 4) setCvv(value);
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPaymentError("");

    if (!cardNumber || cardNumber.replace(/\s/g, "").length < 16) {
      setPaymentError("Please enter a valid 16-digit card number.");
      return;
    }
    if (!expiry || !expiry.includes("/") || expiry.length < 5) {
      setPaymentError("Please enter a valid expiration date (MM/YY).");
      return;
    }
    if (!cvv || cvv.length < 3) {
      setPaymentError("Please enter a valid CVV security code.");
      return;
    }
    if (!nameOnCard.trim()) {
      setPaymentError("Please enter the name printed on the card.");
      return;
    }

    setIsProcessing(true);

    // Simulate standard secure Stripe transaction network latency of 1.8 seconds
    setTimeout(() => {
      setIsProcessing(false);
      
      // Determine card brand from first digit
      const firstDigit = cardNumber.charAt(0);
      let brand = "Visa";
      if (firstDigit === "5") brand = "Mastercard";
      else if (firstDigit === "3") brand = "American Express";
      else if (firstDigit === "6") brand = "Discover";

      const last4 = cardNumber.slice(-4);
      
      onUpgradeSuccess(selectedTier, last4, brand);
      setStep("success");

      // Rain canvas confetti to celebrate!
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 },
        colors: ["#10b981", "#10b981", "#059669", "#ffffff", "#34d399"]
      });
    }, 1800);
  };

  const getTierPrice = (tier: SubscriptionTier) => {
    if (tier === "pro") return "$19.99";
    if (tier === "basic_pro") return "$9.99";
    return "$0.00";
  };

  const getTierTitle = (tier: SubscriptionTier) => {
    if (tier === "pro") return "PRO tier";
    if (tier === "basic_pro") return "BASIC PRO tier";
    return "FREE tier";
  };

  return (
    <div id="stripe-checkout-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl overflow-hidden bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header decoration */}
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600" />

        {/* Modal Close Button */}
        <button
          onClick={onClose}
          id="close-stripe-modal"
          className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white rounded-full hover:bg-zinc-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 mt-2">
          {step === "plans" && (
            <div>
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center p-2 bg-emerald-500/10 text-emerald-400 rounded-full mb-3">
                  <Sparkles className="w-6 h-6 animate-pulse" />
                </div>
                <h2 className="text-2xl font-bold tracking-tight text-white font-display">
                  Subscription & Studio Account Plans
                </h2>
                <p className="text-sm text-zinc-400 mt-1 max-w-md mx-auto">
                  Upgrade your Quick GPT subscription level to unlock higher model bandwidth and multi-tiered image creator options.
                </p>
              </div>

              {/* Grid of Plans */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                {/* Free plan info */}
                <div className={`p-5 rounded-xl border flex flex-col justify-between transition-all ${
                  status.tier === "free"
                    ? "border-zinc-700 bg-zinc-800/20"
                    : "border-zinc-800 bg-zinc-900"
                }`}>
                  <div>
                    <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider font-mono">Tier 1</span>
                    <h3 className="text-lg font-bold text-white font-display mt-1">Free</h3>
                    <div className="flex items-baseline mt-2 mb-4">
                      <span className="text-2xl font-bold text-white font-display">$0</span>
                      <span className="text-xs text-zinc-400 ml-1">/ lifetime</span>
                    </div>
                    <ul className="space-y-2.5 text-xs text-zinc-300">
                      <li className="flex items-start gap-1.5">
                        <Check className="w-4 h-4 text-zinc-500 shrink-0 mt-0.5" />
                        <span>Standard QuickGPT Chat</span>
                      </li>
                      <li className="flex items-start gap-1.5">
                        <Check className="w-4 h-4 text-zinc-500 shrink-0 mt-0.5" />
                        <span>Max 10 Images Lifetime</span>
                      </li>
                      <li className="flex items-start gap-1.5">
                        <Check className="w-4 h-4 text-zinc-500 shrink-0 mt-0.5" />
                        <span>Square (1:1) aspect ratio</span>
                      </li>
                    </ul>
                  </div>
                  <button
                    disabled
                    className="w-full py-2 px-3 rounded-lg text-xs font-medium bg-zinc-800 text-zinc-500 mt-6 cursor-not-allowed"
                  >
                    {status.tier === "free" ? "Current Active Plan" : "Included"}
                  </button>
                </div>

                {/* Basic Pro Plan */}
                <div className={`p-5 rounded-xl border relative flex flex-col justify-between transition-all ${
                  status.tier === "basic_pro"
                    ? "border-emerald-600 bg-emerald-500/5"
                    : selectedTier === "basic_pro"
                      ? "border-zinc-600 bg-zinc-800/30"
                      : "border-zinc-800 bg-zinc-900"
                }`}>
                  <div className="absolute top-3 right-3 bg-emerald-500/10 text-emerald-400 text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider">
                    Tier 2
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider font-mono">Popular</span>
                    <h3 className="text-lg font-bold text-white font-display mt-1">Basic Pro</h3>
                    <div className="flex items-baseline mt-2 mb-4">
                      <span className="text-2xl font-bold text-white font-display">$9.99</span>
                      <span className="text-xs text-zinc-400 ml-1">/ month</span>
                    </div>
                    <ul className="space-y-2.5 text-xs text-zinc-300">
                      <li className="flex items-start gap-1.5">
                        <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span>Unmetered Text Assistant</span>
                      </li>
                      <li className="flex items-start gap-1.5">
                        <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span className="font-medium text-emerald-400">Unlimited Image Outputs</span>
                      </li>
                      <li className="flex items-start gap-1.5">
                        <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span>Sleek Local Storage Folder</span>
                      </li>
                    </ul>
                  </div>
                  <button
                    onClick={() => {
                      if (status.tier !== "basic_pro") {
                        setSelectedTier("basic_pro");
                        setStep("payment");
                      }
                    }}
                    disabled={status.tier === "basic_pro"}
                    id="upgrade-to-basic-pro"
                    className={`w-full py-2.5 px-3 rounded-lg text-xs font-medium mt-6 transition-all cursor-pointer ${
                      status.tier === "basic_pro"
                        ? "bg-emerald-500/10 text-emerald-400 cursor-not-allowed"
                        : "bg-emerald-500 hover:bg-emerald-600 text-black font-semibold shadow-lg shadow-emerald-500/10"
                    }`}
                  >
                    {status.tier === "basic_pro" 
                      ? "Active Subscription" 
                      : status.tier === "pro" 
                        ? "Downgrade to Basic Pro" 
                        : "Subscribe with Stripe"
                    }
                  </button>
                </div>

                {/* Pro Plan */}
                <div className={`p-5 rounded-xl border relative flex flex-col justify-between transition-all ${
                  status.tier === "pro"
                    ? "border-teal-500 bg-teal-500/5"
                    : selectedTier === "pro"
                      ? "border-zinc-600 bg-zinc-800/30"
                      : "border-zinc-800 bg-zinc-900"
                }`}>
                  <div className="absolute top-3 right-3 bg-teal-500/10 text-teal-400 text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider">
                    Tier 3
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider font-mono">Premium</span>
                    <h3 className="text-lg font-bold text-white font-display mt-1">Pro</h3>
                    <div className="flex items-baseline mt-2 mb-4">
                      <span className="text-2xl font-bold text-white font-display">$19.99</span>
                      <span className="text-xs text-zinc-400 ml-1">/ month</span>
                    </div>
                    <ul className="space-y-2.5 text-xs text-zinc-300">
                      <li className="flex items-start gap-1.5">
                        <Check className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                        <span className="font-semibold text-teal-400">Extreme Speed GPT Pro API</span>
                      </li>
                      <li className="flex items-start gap-1.5">
                        <Check className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                        <span>Up to 500 Image Creations</span>
                      </li>
                      <li className="flex items-start gap-1.5">
                        <Check className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                        <span className="font-medium text-amber-400">Advanced Styling Options (Aspect Ratios & Styles)</span>
                      </li>
                    </ul>
                  </div>
                  <button
                    onClick={() => {
                      if (status.tier !== "pro") {
                        setSelectedTier("pro");
                        setStep("payment");
                      }
                    }}
                    disabled={status.tier === "pro"}
                    id="upgrade-to-pro"
                    className={`w-full py-2.5 px-3 rounded-lg text-xs font-medium mt-6 transition-all cursor-pointer ${
                      status.tier === "pro"
                        ? "bg-teal-500/10 text-teal-400 cursor-not-allowed"
                        : "bg-teal-500 hover:bg-teal-600 text-black font-semibold shadow-lg shadow-teal-500/10"
                    }`}
                  >
                    {status.tier === "pro" ? "Active Subscription" : "Subscribe with Stripe"}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-center gap-1.5 text-[10px] text-zinc-500 font-mono text-center">
                <ShieldCheck className="w-4 h-4 text-zinc-600" />
                <span>PCI-Compliant Sandboxed Checkout Portal</span>
              </div>
            </div>
          )}

          {step === "payment" && (
            <form onSubmit={handlePaymentSubmit} className="max-w-md mx-auto">
              <div className="mb-6">
                <button
                  type="button"
                  onClick={() => setStep("plans")}
                  className="text-xs text-zinc-400 hover:text-white mb-4 flex items-center gap-1 cursor-pointer"
                >
                  &larr; Back to plan selection
                </button>
                <div className="flex items-center gap-3 bg-zinc-800/40 p-4 rounded-xl border border-zinc-800">
                  <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg shrink-0">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block">Confirming Purchase of</span>
                    <span className="text-sm font-bold text-white font-display">
                      {getTierTitle(selectedTier)}
                    </span>
                    <span className="text-xs text-zinc-400 ml-1.5">
                      ({getTierPrice(selectedTier)} / month)
                    </span>
                  </div>
                </div>
              </div>

              {/* Simulated Stripe Card Form */}
              <div className="space-y-4">
                {paymentError && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-lg flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{paymentError}</span>
                  </div>
                )}

                <div>
                  <label htmlFor="card-name" className="block text-xs font-medium text-zinc-300 font-sans mb-1.5">
                    Name on card
                  </label>
                  <input
                    type="text"
                    id="card-name"
                    required
                    placeholder="e.g. Satoshi Nakamoto"
                    value={nameOnCard}
                    onChange={(e) => setNameOnCard(e.target.value)}
                    className="w-full px-3.5 py-2 hover:border-zinc-700 bg-zinc-950 border border-zinc-850 rounded-lg text-sm text-white placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all font-sans"
                  />
                </div>

                <div>
                  <label htmlFor="card-number" className="block text-xs font-medium text-zinc-300 font-sans mb-1.5">
                    Card number
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      id="card-number"
                      required
                      placeholder="4242 4242 4242 4242"
                      value={cardNumber}
                      onChange={handleCardNumberChange}
                      className="w-full pl-3.5 pr-10 py-2 hover:border-zinc-700 bg-zinc-950 border border-zinc-850 rounded-lg text-sm text-white placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all font-mono tracking-widest"
                    />
                    <div className="absolute inset-y-0 right-3.5 flex items-center text-zinc-500">
                      <CreditCard className="w-4 h-4" />
                    </div>
                  </div>
                  <p className="text-[10px] text-zinc-500 mt-1 font-mono">
                    Any demo card like 4242 is accepted for sandbox checkout.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="card-expiry" className="block text-xs font-medium text-zinc-300 font-sans mb-1.5">
                      Expiry date
                    </label>
                    <input
                      type="text"
                      id="card-expiry"
                      required
                      placeholder="MM/YY"
                      value={expiry}
                      onChange={handleExpiryChange}
                      className="w-full px-3.5 py-2 hover:border-zinc-700 bg-zinc-950 border border-zinc-850 rounded-lg text-sm text-white placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all font-mono"
                    />
                  </div>

                  <div>
                    <label htmlFor="card-cvv" className="block text-xs font-medium text-zinc-300 font-sans mb-1.5">
                      CVV / CVC
                    </label>
                    <input
                      type="password"
                      id="card-cvv"
                      required
                      placeholder="•••"
                      value={cvv}
                      onChange={handleCvvChange}
                      className="w-full px-3.5 py-2 hover:border-zinc-700 bg-zinc-950 border border-zinc-850 rounded-lg text-sm text-white placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all font-mono"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isProcessing}
                  id="submit-stripe-payment"
                  className="w-full bg-emerald-500 text-black hover:bg-emerald-450 focus:outline-none focus:ring-2 focus:ring-emerald-450 focus:ring-offset-2 focus:ring-offset-zinc-900 rounded-lg py-2.5 font-bold transition-all text-xs tracking-wide uppercase mt-8 block cursor-pointer"
                >
                  {isProcessing ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                      Contacting Stripe Gateway...
                    </span>
                  ) : (
                    `Authorize ${getTierPrice(selectedTier)} Payment`
                  )}
                </button>
              </div>
            </form>
          )}

          {step === "success" && (
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-400 mb-6">
                <Check className="w-8 h-8" />
              </div>
              <h2 className="text-3xl font-extrabold tracking-tight text-white mb-2 font-display">
                Subscription Upgraded!
              </h2>
              <p className="text-sm text-zinc-400 max-w-sm mx-auto mb-8 font-sans">
                Thank you! Your payment details were securely captured via Stripe's sandbox, upgrading your Quick GPT accounts.
              </p>

              <div className="max-w-xs mx-auto bg-zinc-950 border border-zinc-850 rounded-xl p-4 text-left font-mono text-[11px] text-zinc-400 mb-8 space-y-1">
                <div className="text-center border-b border-zinc-900 pb-2 mb-2 font-display font-bold text-white text-xs">
                  STRIPE TRANSACTION RECEIPT
                </div>
                <div className="flex justify-between">
                  <span>Merchant:</span>
                  <span className="text-zinc-200">Quick GPT Corp</span>
                </div>
                <div className="flex justify-between">
                  <span>Customer Email:</span>
                  <span className="text-zinc-200 truncate max-w-[120px]">user@quickgpt.io</span>
                </div>
                <div className="flex justify-between">
                  <span>Authorized Plan:</span>
                  <span className="text-yellow-400 uppercase font-bold">{selectedTier}</span>
                </div>
                <div className="flex justify-between">
                  <span>Transaction ID:</span>
                  <span className="text-zinc-200">ch_{Math.random().toString(36).substr(2, 9)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Payment Method:</span>
                  <span className="text-zinc-200">Stripe Card Ending **4242</span>
                </div>
                <div className="flex justify-between text-white font-bold border-t border-zinc-900 pt-1.5 mt-1.5">
                  <span>Total Amount Paid:</span>
                  <span>{getTierPrice(selectedTier)}</span>
                </div>
              </div>

              <button
                onClick={() => {
                  onClose();
                  // Reset state slightly after
                  setTimeout(() => {
                    setStep("plans");
                    setCardNumber("");
                    setExpiry("");
                    setCvv("");
                    setNameOnCard("");
                  }, 500);
                }}
                id="stripe-success-acknowledge"
                className="px-6 py-2 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold rounded-lg transition-all tracking-wider uppercase cursor-pointer"
              >
                Access Premium Space
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
