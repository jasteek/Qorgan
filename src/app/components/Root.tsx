import { Outlet, useLocation, useNavigate } from "react-router";
import { Home, Map, Shield, Music, Heart, BookOpen, Activity, Clipboard } from "lucide-react";
import { useState } from "react";
import { SplashScreen } from "./SplashScreen";
import { BurgerMenu } from "./BurgerMenu";
import { KazakhOrnament } from "./KazakhOrnament";
import { AuthScreen } from "./screens/AuthScreen";
import { useLanguage } from "../contexts/LanguageContext";
import { useAuth } from "../../contexts/AuthContext";

// ── Full-repeat Kazakh ornament band ──────────────────────
function OrnamentBand({ position = "top" }: { position?: "top" | "bottom" }) {
  return (
    <div className={`fixed ${position === "top" ? "top-0" : "bottom-[72px]"} left-0 right-0 h-[28px] pointer-events-none z-20 overflow-hidden`}>
      <svg width="100%" height="28" viewBox="0 0 400 28" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id={`band_${position}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#C9A84C" stopOpacity="0.05" />
            <stop offset="30%" stopColor="#C9A84C" stopOpacity="0.35" />
            <stop offset="70%" stopColor="#C9A84C" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#C9A84C" stopOpacity="0.05" />
          </linearGradient>
        </defs>
        {/* Wave line */}
        <path d="M0 14 Q25 5 50 14 Q75 23 100 14 Q125 5 150 14 Q175 23 200 14 Q225 5 250 14 Q275 23 300 14 Q325 5 350 14 Q375 23 400 14"
          fill="none" stroke={`url(#band_${position})`} strokeWidth="1.5" />
        <path d="M0 18 Q25 9 50 18 Q75 27 100 18 Q125 9 150 18 Q175 27 200 18 Q225 9 250 18 Q275 27 300 18 Q325 9 350 18 Q375 27 400 18"
          fill="none" stroke={`url(#band_${position})`} strokeWidth="0.7" opacity="0.5" />
        {/* Diamond accents every 50px */}
        {[25, 75, 125, 175, 225, 275, 325, 375].map((x, i) => (
          <path key={i} d={`M${x} 11 L${x + 3.5} 14 L${x} 17 L${x - 3.5} 14 Z`}
            fill="#C9A84C" opacity="0.5" />
        ))}
      </svg>
    </div>
  );
}

export function Root() {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { isAuthenticated } = useAuth();
  const [showSplash, setShowSplash] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  const navItems = [
    { path: "/", icon: Home, labelKey: "home" },
    { path: "/map", icon: Map, labelKey: "path" },
    { path: "/ai-shield", icon: Shield, labelKey: "shield" },
    { path: "/hidden-sos", icon: Music, labelKey: "sos" },
    { path: "/rituals", icon: Heart, labelKey: "rituals" },
    { path: "/safety-tips", icon: BookOpen, labelKey: "tips" },
    { path: "/health-passport", icon: Clipboard, labelKey: "health" },
    { path: "/fitness", icon: Activity, labelKey: "fitness" },
  ];

  // 1. Splash screen
  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  // 2. Auth gate
  if (!isAuthenticated) {
    return <AuthScreen />;
  }

  // 3. Main app
  return (
    <div className="relative min-h-screen overflow-hidden" style={{ background: "#1a0510" }}>
      {/* ── Multi-layer background ── */}

      {/* Dense ornament tile pattern */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-[0.07]">
        <svg className="w-full h-full">
          <defs>
            <pattern id="root_bg" x="0" y="0" width="90" height="90" patternUnits="userSpaceOnUse">
              {/* Koshkar-muiyz (ram's horn) motif */}
              <path d="M18 45Q13 37 8 33Q3 29 3 22Q3 15 8 14" fill="none" stroke="#C9A84C" strokeWidth="1.1" opacity="0.7" />
              <path d="M72 45Q77 37 82 33Q87 29 87 22Q87 15 82 14" fill="none" stroke="#C9A84C" strokeWidth="1.1" opacity="0.7" />
              <path d="M18 45Q13 53 8 57Q3 61 3 68Q3 75 8 76" fill="none" stroke="#C9A84C" strokeWidth="1.1" opacity="0.7" />
              <path d="M72 45Q77 53 82 57Q87 61 87 68Q87 75 82 76" fill="none" stroke="#C9A84C" strokeWidth="1.1" opacity="0.7" />
              {/* Center diamond */}
              <path d="M45 35 L52 45 L45 55 L38 45 Z" fill="none" stroke="#C9A84C" strokeWidth="0.8" opacity="0.5" />
              {/* Center dot */}
              <circle cx="45" cy="45" r="3" fill="#C9A84C" opacity="0.35" />
              {/* Corner stars */}
              <path d="M0 0 L4 0 L2 4 Z" fill="#C9A84C" opacity="0.3" />
              <path d="M90 0 L86 0 L88 4 Z" fill="#C9A84C" opacity="0.3" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#root_bg)" />
        </svg>
      </div>

      {/* Radial gradient glow top */}
      <div className="fixed inset-0 pointer-events-none z-0"
        style={{ background: "radial-gradient(ellipse 100% 50% at 50% 0%, rgba(107,15,43,0.55) 0%, transparent 65%)" }} />

      {/* Subtle bottom glow */}
      <div className="fixed bottom-0 left-0 right-0 h-48 pointer-events-none z-0"
        style={{ background: "radial-gradient(ellipse 80% 100% at 50% 100%, rgba(60,0,100,0.18) 0%, transparent 70%)" }} />

      {/* Corner ornaments */}
      <div className="fixed top-0 left-0 opacity-[0.18] pointer-events-none z-0">
        <KazakhOrnament variant="koshkar" size={130} />
      </div>
      <div className="fixed top-0 right-0 opacity-[0.18] pointer-events-none z-0">
        <KazakhOrnament variant="umai" size={130} />
      </div>
      <div className="fixed bottom-24 left-0 opacity-[0.12] pointer-events-none z-0">
        <KazakhOrnament variant="geometric" size={105} />
      </div>
      <div className="fixed bottom-24 right-0 opacity-[0.12] pointer-events-none z-0">
        <KazakhOrnament variant="geometric" size={105} />
      </div>

      {/* ── Ornament bands ── */}
      <OrnamentBand position="top" />
      <OrnamentBand position="bottom" />

      {/* ── Burger menu button ── */}
      <button
        onClick={() => setMenuOpen(true)}
        className="fixed top-4 left-4 z-40 w-11 h-11 rounded-xl flex items-center justify-center transition-all active:scale-90 hover:scale-105"
        style={{
          background: "rgba(255,255,255,0.07)",
          border: "1px solid rgba(201,168,76,0.35)",
          backdropFilter: "blur(16px)",
          boxShadow: "0 0 16px rgba(201,168,76,0.2)",
        }}>
        <svg className="w-5 h-5" style={{ color: "#C9A84C" }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M4 6H20M4 12H20M4 18H20" />
        </svg>
      </button>

      {/* ── Burger Menu ── */}
      <BurgerMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />

      {/* ── Screen content ── */}
      <div className="relative z-10 pt-0 pb-24">
        <Outlet />
      </div>

      {/* ── Bottom Navigation ── */}
      <nav className="fixed bottom-0 left-0 right-0 z-50">
        <div className="max-w-lg mx-auto px-3 pb-4">
          <div className="relative rounded-3xl overflow-hidden shadow-2xl"
            style={{
              background: "rgba(10, 2, 15, 0.78)",
              border: "1px solid rgba(201,168,76,0.2)",
              backdropFilter: "blur(24px)",
              boxShadow: "0 -4px 30px rgba(0,0,0,0.5), 0 0 0 1px rgba(201,168,76,0.1)",
            }}>
            {/* subtle ornament strip inside nav */}
            <div className="absolute inset-x-0 top-0 h-[2px]"
              style={{ background: "linear-gradient(90deg, transparent, rgba(201,168,76,0.4) 30%, rgba(201,168,76,0.4) 70%, transparent)" }} />

            <div className="flex items-center overflow-x-auto py-2.5 px-1" style={{ scrollbarWidth: "none" }}>
              {navItems.map(({ path, icon: Icon, labelKey }) => {
                const active = location.pathname === path;
                return (
                  <button
                    key={path}
                    onClick={() => navigate(path)}
                    className="flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all flex-shrink-0 min-w-[56px] active:scale-90"
                    style={{
                      background: active ? "rgba(201,168,76,0.12)" : "transparent",
                      border: active ? "1px solid rgba(201,168,76,0.25)" : "1px solid transparent",
                    }}>
                    <Icon
                      className="w-5 h-5 transition-all"
                      style={{
                        color: active ? "#C9A84C" : "rgba(255,255,255,0.38)",
                        filter: active ? "drop-shadow(0 0 6px rgba(201,168,76,0.7))" : "none",
                      }}
                    />
                    <span
                      className="text-[9px] whitespace-nowrap transition-all"
                      style={{
                        color: active ? "#C9A84C" : "rgba(255,255,255,0.33)",
                        textShadow: active ? "0 0 8px rgba(201,168,76,0.6)" : "none",
                      }}>
                      {t(labelKey)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </nav>

      {/* Global styles */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300&family=Rajdhani:wght@300;400;500;600&display=swap');
        * { font-family: 'Rajdhani', system-ui, sans-serif; }
        .scrollbar-none { scrollbar-width: none; -ms-overflow-style: none; }
        .scrollbar-none::-webkit-scrollbar { display: none; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}