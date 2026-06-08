/**
 * AdminLogin.tsx
 * Malazone.com — Secure CEO Gateway
 * © 2026 Malazone Technologies PLC
 */

import React, { useState } from "react";
import { ShieldCheck, Lock, User, ArrowRight, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

const AdminLogin: React.FC = () => {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate secure CEO handshake
    setTimeout(() => {
      if (password === "admin") { // CEO would have a real secure password
        localStorage.setItem("malazone_admin_token", "ceo_active_session");
        navigate("/admin/dashboard");
      } else {
        alert("Access Denied: Invalid CEO Credentials");
      }
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-green-600/5 blur-[120px] -z-10" />
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-emerald-600/5 blur-[80px] -z-10" />

      <div className="w-full max-w-md bg-slate-900 border border-white/10 rounded-[2.5rem] p-12 shadow-[0_50px_100px_rgba(0,0,0,0.5)] space-y-10 animate-zoom-in">
        
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-green-600/10 border border-green-600/20 text-green-500 text-[10px] font-black uppercase tracking-[0.3em]">
            <ShieldCheck className="w-4 h-4" />
            CEO Command Center
          </div>
          <h1 className="text-4xl font-black text-white uppercase italic tracking-tighter">
            Malazone <span className="text-green-500 not-italic">Admin</span>
          </h1>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Authorized Access Only</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">CEO Identity</label>
            <div className="relative group">
              <User className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600 group-focus-within:text-green-500 transition-colors" />
              <input 
                disabled
                value="Luwa Tesemma Kakawo"
                className="w-full bg-white/5 border border-white/5 rounded-2xl py-5 pl-14 pr-6 text-white text-sm font-bold opacity-50 cursor-not-allowed"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Security Key</label>
            <div className="relative group">
              <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600 group-focus-within:text-green-500 transition-colors" />
              <input 
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter Password..."
                className="w-full bg-white/5 border border-white/5 focus:border-green-500/50 rounded-2xl py-5 pl-14 pr-6 text-white placeholder:text-slate-700 focus:outline-none focus:ring-4 focus:ring-green-500/5 transition-all"
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-4 py-6 rounded-2xl bg-green-600 hover:bg-green-500 text-white shadow-[0_20px_40px_rgba(22,163,74,0.2)] transition-all group active:scale-95"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <span className="text-xs font-black uppercase tracking-[0.3em]">Initialize Console</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
              </>
            )}
          </button>
        </form>

        <div className="text-center">
          <button 
            onClick={() => navigate("/")}
            className="text-[10px] font-black text-slate-600 hover:text-slate-400 uppercase tracking-widest transition-colors"
          >
            ← Back to Marketplace
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
