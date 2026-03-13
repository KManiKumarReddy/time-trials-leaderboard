import React from "react";
import { Link, useLocation } from "react-router-dom";

interface NavBarProps {
  clubName?: string;
  logoUrl?: string;
}

export const NavBar: React.FC<NavBarProps> = ({ clubName, logoUrl }) => {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith("/admin");

  return (
    <header className="sticky top-0 z-50 bg-[#0d0d0d]/80 backdrop-blur-md border-b-[3px] border-brand-red">
      <div className="max-w-[1100px] mx-auto px-4 sm:px-6 h-[56px] sm:h-[64px] flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 no-underline group">
          {logoUrl && (
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg overflow-hidden bg-white/5 border border-white/10 group-hover:border-brand-red/50 transition-colors">
              <img
                src={logoUrl}
                alt="Logo"
                className="w-full h-full object-contain p-1"
              />
            </div>
          )}
          <div className="font-display font-black text-[1rem] sm:text-[1.2rem] tracking-wider uppercase text-white">
            <span className="text-brand-red">
              {clubName ? clubName.split(" ")[0] : "Time"}
            </span>{" "}
            {clubName ? clubName.split(" ").slice(1).join(" ") : "Trials"}
          </div>
        </Link>
        <nav className="flex gap-4 sm:gap-6 items-center">
          {!isAdmin ? (
            <Link
              to="/admin"
              className="font-display font-bold text-[0.7rem] sm:text-[0.8rem] tracking-widest uppercase text-[#0d0d0d] bg-brand-red px-3 py-1.5 rounded-sm transition-all hover:bg-brand-red-dark hover:text-white hover:scale-105 active:scale-95"
            >
              Admin ↗
            </Link>
          ) : (
            <Link
              to="/"
              className="font-display font-bold text-[0.7rem] sm:text-[0.8rem] tracking-widest text-text-muted border-b-2 border-transparent hover:text-white hover:border-brand-red transition-all"
            >
              ← View Leaderboard
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
};
