import React from "react";
import {
  Instagram,
  Facebook,
  Youtube,
  Twitter,
  Globe,
  Mail,
} from "lucide-react";
import { Config } from "../../types";

interface FooterProps {
  social?: Config["social"];
  config?: Config;
}

export const Footer: React.FC<FooterProps> = ({ social, config }) => {
  const icons: Record<string, React.ReactNode> = {
    instagram: <Instagram size={18} />,
    facebook: <Facebook size={18} />,
    youtube: <Youtube size={18} />,
    twitter: <Twitter size={18} />,
    website: <Globe size={18} />,
    email: <Mail size={18} />,
  };

  return (
    <footer className="bg-[#0d0d0d] border-t border-white/5 py-12 relative overflow-hidden">
      <div className="absolute top-0 left-1/4 w-px h-full bg-linear-to-b from-brand-red/20 to-transparent" />
      <div className="max-w-275 mx-auto px-4 sm:px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              {config?.logoUrl && (
                <img
                  src={config.logoUrl}
                  alt="Logo"
                  className="w-6 h-6 object-contain"
                />
              )}
              <h3 className="font-display font-black text-2xl uppercase tracking-tighter italic">
                <span className="text-brand-red">
                  {config?.club?.split(" ")[0]}
                </span>{" "}
                {config?.club?.split(" ").slice(1).join(" ")}
              </h3>
              <a
                href={social?.affiliationUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className="text-xs text-text-muted uppercase tracking-widest">
                  {social?.affiliation}
                </span>
              </a>
            </div>
          </div>

          <div className="space-y-6 md:text-right md:flex md:flex-col md:items-end">
            <div>
              <p className="text-[0.65rem] font-bold uppercase tracking-widest text-text-muted mb-4 md:text-right">
                Connect
              </p>
              <div className="flex gap-4 md:justify-end">
                {Object.entries(social || {}).map(([key, url]) => {
                  if (icons[key] && url) {
                    return (
                      <a
                        key={key}
                        href={
                          key === "email" ? `mailto:${url}` : (url as string)
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 border border-white/10 text-text-muted hover:text-brand-red hover:border-brand-red/50 transition-all"
                      >
                        {icons[key]}
                      </a>
                    );
                  }
                  return null;
                })}
              </div>
            </div>
            <p className="text-[0.6rem] text-text-muted uppercase tracking-widest pt-4 opacity-50">
              © {new Date().getFullYear()} {config?.club}.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};
