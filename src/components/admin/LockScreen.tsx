import React, { useState } from "react";
import { Lock, AlertCircle, Loader2, Save } from "lucide-react";

interface LockScreenProps {
  onUnlock: (password: string) => void;
  error: string | null;
  isVerifying: boolean;
}

export const LockScreen: React.FC<LockScreenProps> = ({
  onUnlock,
  error,
  isVerifying,
}) => {
  const [password, setPassword] = useState("");

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-[#050505] p-4">
      <div className="bg-[#111] border border-[#222] rounded-3xl w-full max-w-sm p-8 space-y-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-brand-red shadow-[0_0_15px_rgba(255,0,0,0.5)]" />

        <div className="text-center space-y-2">
          <div className="inline-flex p-3 bg-brand-red/10 rounded-2xl border border-brand-red/20 text-brand-red mb-2">
            <Lock size={32} />
          </div>
          <h2 className="font-display font-black text-2xl uppercase tracking-tighter">
            Admin Access
          </h2>
          <p className="text-text-muted text-xs uppercase tracking-widest font-bold">
            Secure Zone • Authenticate to Manage
          </p>
        </div>

        {error && (
          <div className="bg-red-950/30 border border-red-500/50 rounded-xl p-3 flex items-center gap-3 animate-in fade-in zoom-in duration-300">
            <AlertCircle className="text-red-400 shrink-0" size={16} />
            <div className="text-red-200 text-[0.7rem] font-bold leading-tight">
              {error}
            </div>
          </div>
        )}

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-[0.65rem] font-bold tracking-widest uppercase text-text-muted ml-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && onUnlock(password)}
              placeholder="••••••••"
              autoFocus
              className="w-full bg-[#0a0a0a] border border-[#333] rounded-xl px-4 py-4 text-white focus:border-brand-red focus:ring-1 focus:ring-brand-red outline-none transition-all font-mono text-center tracking-[0.5em]"
            />
          </div>

          <button
            onClick={() => onUnlock(password)}
            disabled={isVerifying || !password}
            className="w-full py-4 font-display font-black text-sm uppercase tracking-[0.2em] bg-brand-red hover:bg-brand-red-dark text-white rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-brand-red/20 active:scale-95"
          >
            {isVerifying ? (
              <Loader2 className="animate-spin w-5 h-5" />
            ) : (
              <Save className="w-5 h-5" />
            )}
            {isVerifying ? "Verifying..." : "Unlock Console"}
          </button>
        </div>
      </div>
    </div>
  );
};
