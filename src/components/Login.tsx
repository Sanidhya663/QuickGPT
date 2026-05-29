/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { Zap, Mail, Lock, ArrowRight, ShieldCheck, Sparkles } from "lucide-react";

interface LoginProps {
  onLoginSuccess: (email: string) => void;
}

export default function Login({ onLoginSuccess }: LoginProps) {
  const [email, setEmail] = useState("sanidhyaj563@gmail.com");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!email.trim() || !email.includes("@")) {
      setErrorMsg("Please enter a valid work or personal email address.");
      return;
    }

    if (password.length > 0 && password.length < 6) {
      setErrorMsg("Security threshold: Password must be at least 6 characters.");
      return;
    }

    setIsLoading(true);

    // Simulate authenticating server handshake
    setTimeout(() => {
      setIsLoading(false);
      onLoginSuccess(email.trim());
    }, 1200);
  };

  return (
    <div className="min-h-screen w-full bg-[#0a0a0a] text-[#ececec] flex items-center justify-center p-4 relative overflow-hidden font-sans select-none">
      
      {/* Immersive background glow elements */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-purple-500/5 blur-[120px] rounded-full pointer-events-none" />
      
      {/* Floating grid mesh */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

      {/* Main glass wrapper card */}
      <div className="w-full max-w-md bg-white/[0.02] border border-white/10 p-6 md:p-8 rounded-3xl backdrop-blur-xl shadow-2xl z-10 space-y-6 relative">
        
        {/* Decorative corner tag */}
        <div className="absolute top-4 right-4 flex items-center gap-1 bg-white/5 border border-white/10 px-2.5 py-1 rounded-full text-[9px] font-mono text-white/50 uppercase tracking-widest">
          <ShieldCheck className="w-3 h-3 text-emerald-400" />
          <span>Secured Sandbox</span>
        </div>

        {/* Brand header */}
        <div className="text-center pt-4">
          <div className="inline-flex p-3 bg-gradient-to-tr from-amber-400 to-[#ea580c] text-black rounded-2xl shadow-xl shadow-amber-500/10 mb-4 animate-pulse">
            <Zap className="w-6 h-6 fill-black" />
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight text-white font-display uppercase tracking-wider">
            Quick GPT Workspace
          </h2>
          <p className="text-xs text-white/40 mt-1 font-sans">
            Enter your credentials to initiate high-speed AI tools
          </p>
        </div>

        {/* Input/form structure */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {errorMsg && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-red-400 text-xs text-center font-medium">
              {errorMsg}
            </div>
          )}

          {/* Email input field */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-white/40 font-display uppercase tracking-widest pl-1">
              Work Email
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/20">
                <Mail className="w-4 h-4" />
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="w-full pl-10 pr-4 py-3 bg-black/40 border border-white/10 hover:border-white/25 focus:border-amber-500 rounded-xl outline-none text-white text-sm transition-all focus:ring-1 focus:ring-amber-500"
              />
            </div>
          </div>

          {/* Password field */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center px-1">
              <label className="text-xs font-bold text-white/40 font-display uppercase tracking-widest">
                Password
              </label>
              <span className="text-[10px] text-white/30 font-sans cursor-help hover:text-white transition-colors">
                Required for workspace mapping
              </span>
            </div>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/20">
                <Lock className="w-4 h-4" />
              </span>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-black/40 border border-white/10 hover:border-white/25 focus:border-amber-500 rounded-xl outline-none text-white text-sm transition-all focus:ring-1 focus:ring-amber-500"
              />
            </div>
          </div>

          {/* Quick instructions and login presets info */}
          <div className="p-3 bg-white/[0.01] border border-white/5 rounded-xl space-y-1">
            <span className="block text-[10px] text-white/50 uppercase tracking-widest font-mono">
              ⚡ Pre-authorized User Access
            </span>
            <p className="text-[10px] text-white/35 leading-normal">
              For testing in this environment, you can use email <strong className="text-white/60">sanidhyaj563@gmail.com</strong> and any password of your choosing.
            </p>
          </div>

          {/* CTA triggers */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-3 bg-white hover:bg-amber-400 text-black font-semibold text-sm rounded-xl leading-none tracking-widest uppercase transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer border border-transparent shadow hover:shadow-lg hover:shadow-amber-500/5 hover:-translate-y-0.5 active:translate-y-0"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-4 w-4 text-black" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Syncing Identity...
              </>
            ) : (
              <>
                <span>Enter Intelligent Workspace</span>
                <ArrowRight className="w-4 h-4 text-black" />
              </>
            )}
          </button>
        </form>

        {/* Footer info */}
        <div className="flex items-center justify-center gap-1.5 text-[10px] text-white/30 font-mono text-center pt-2">
          <Sparkles className="w-3 h-3 text-amber-500 animate-spin" style={{ animationDuration: '6s' }} />
          <span>POWERED BY GOOGLE DEEPMIND & GEMINI FLASH</span>
        </div>
      </div>
    </div>
  );
}
