import { motion, AnimatePresence } from "motion/react";
import { useState } from "react";
import { KazakhOrnament } from "../KazakhOrnament";
import { useLanguage } from "../../contexts/LanguageContext";
import { useApp } from "../../contexts/AppContext";
import { Shield, ShieldOff, Sparkles } from "lucide-react";

export function Home() {
  const [isPulsing, setIsPulsing] = useState(false);
  const { t } = useLanguage();
  const { isProtectionActive, toggleProtection } = useApp();

  const handleTumarTouch = () => {
    setIsPulsing(true);
    toggleProtection();
    setTimeout(() => setIsPulsing(false), 1500);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 pt-16 relative">
      {/* Decorative ornaments in corners - animated */}
      <motion.div
        className="absolute top-8 left-6 opacity-20"
        animate={{
          rotate: [0, 360],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear",
        }}
      >
        <KazakhOrnament variant="koshkar" size={60} />
      </motion.div>
      <motion.div
        className="absolute top-8 right-6 opacity-20"
        animate={{
          rotate: [360, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear",
        }}
      >
        <KazakhOrnament variant="umai" size={60} />
      </motion.div>

      {/* App Title */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="mb-12"
      >
        <motion.h1
          className="text-5xl font-light tracking-[0.2em] text-[#DAA520] text-center"
          animate={{
            textShadow: [
              "0 0 20px rgba(218, 165, 32, 0.3)",
              "0 0 40px rgba(218, 165, 32, 0.5)",
              "0 0 20px rgba(218, 165, 32, 0.3)",
            ],
          }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          QORǴAN
        </motion.h1>
        <div className="mt-4">
          <KazakhOrnament variant="border" size={200} className="mx-auto opacity-60" />
        </div>
      </motion.div>

      {/* Tumar Amulet Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, delay: 0.3 }}
        className="relative mb-12"
      >
        {/* Outer glow rings */}
        <AnimatePresence>
          {isPulsing && (
            <>
              <motion.div
                initial={{ scale: 1, opacity: 0.8 }}
                animate={{ scale: 2, opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className="absolute inset-0 rounded-full border-2 border-[#DAA520]"
              />
              <motion.div
                initial={{ scale: 1, opacity: 0.6 }}
                animate={{ scale: 2.5, opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.5, delay: 0.2, ease: "easeOut" }}
                className="absolute inset-0 rounded-full border-2 border-[#DAA520]"
              />
              <motion.div
                initial={{ scale: 1, opacity: 0.4 }}
                animate={{ scale: 3, opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.5, delay: 0.4, ease: "easeOut" }}
                className="absolute inset-0 rounded-full border-2 border-[#DAA520]"
              />
            </>
          )}
        </AnimatePresence>

        {/* Rotating ornament ring */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          animate={{ rotate: 360 }}
          transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
        >
          {[0, 60, 120, 180, 240, 300].map((angle) => (
            <div
              key={angle}
              className="absolute"
              style={{
                transform: `rotate(${angle}deg) translateY(-140px)`,
              }}
            >
              <KazakhOrnament variant="umai" size={20} className="opacity-30" />
            </div>
          ))}
        </motion.div>

        {/* Tumar Amulet */}
        <motion.button
          onClick={handleTumarTouch}
          whileTap={{ scale: 0.95 }}
          whileHover={{ scale: 1.05 }}
          className="relative group cursor-pointer"
        >
          {/* 3D Base Shadow */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#DAA520]/30 to-transparent blur-3xl transform translate-y-8 scale-110"></div>

          {/* Glass Card */}
          <motion.div
            className={`relative backdrop-blur-xl border-2 rounded-full w-64 h-64 flex items-center justify-center shadow-2xl ${
              isProtectionActive
                ? "bg-white/5 border-[#DAA520]/40"
                : "bg-white/10 border-white/20"
            }`}
            animate={{
              boxShadow: isProtectionActive
                ? [
                    "0 0 40px rgba(218, 165, 32, 0.3)",
                    "0 0 60px rgba(218, 165, 32, 0.5)",
                    "0 0 40px rgba(218, 165, 32, 0.3)",
                  ]
                : "0 0 20px rgba(255, 255, 255, 0.1)",
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {/* Inner glow */}
            <div
              className={`absolute inset-4 rounded-full bg-gradient-to-br to-transparent ${
                isProtectionActive
                  ? "from-[#DAA520]/20 animate-pulse"
                  : "from-white/10"
              }`}
            ></div>

            {/* Protection status icon */}
            <div className="absolute top-8 right-8">
              {isProtectionActive ? (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-8 h-8 rounded-full bg-[#40E0D0]/20 flex items-center justify-center"
                >
                  <Shield className="w-5 h-5 text-[#40E0D0]" />
                </motion.div>
              ) : (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center"
                >
                  <ShieldOff className="w-5 h-5 text-white/60" />
                </motion.div>
              )}
            </div>

            {/* Tumar SVG */}
            <svg
              width="140"
              height="180"
              viewBox="0 0 140 180"
              className={`relative z-10 transition-all duration-500 ${
                isPulsing
                  ? "drop-shadow-[0_0_30px_rgba(218,165,32,1)]"
                  : isProtectionActive
                  ? "drop-shadow-[0_0_15px_rgba(218,165,32,0.6)]"
                  : "drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]"
              }`}
            >
              {/* Tumar shape - traditional triangular amulet */}
              <defs>
                <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop
                    offset="0%"
                    stopColor={isProtectionActive ? "#FFD700" : "#FFFFFF"}
                    stopOpacity="1"
                  />
                  <stop
                    offset="50%"
                    stopColor={isProtectionActive ? "#DAA520" : "#CCCCCC"}
                    stopOpacity="1"
                  />
                  <stop
                    offset="100%"
                    stopColor={isProtectionActive ? "#B8860B" : "#999999"}
                    stopOpacity="1"
                  />
                </linearGradient>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                  <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Main triangular body */}
              <path
                d="M 70 20 L 120 140 L 70 160 L 20 140 Z"
                fill="url(#goldGradient)"
                stroke={isProtectionActive ? "#FFD700" : "#FFFFFF"}
                strokeWidth="2"
                filter="url(#glow)"
              />

              {/* Inner decorative patterns */}
              <circle cx="70" cy="70" r="25" fill="none" stroke="#8B0A1D" strokeWidth="2" />
              <circle cx="70" cy="70" r="15" fill="none" stroke="#8B0A1D" strokeWidth="1.5" />

              {/* Koshkar-muyiz pattern (ram's horn) */}
              <path
                d="M 70 50 Q 60 55 55 65 Q 50 75 55 85 Q 60 90 70 90"
                fill="none"
                stroke="#8B0A1D"
                strokeWidth="1.5"
              />
              <path
                d="M 70 50 Q 80 55 85 65 Q 90 75 85 85 Q 80 90 70 90"
                fill="none"
                stroke="#8B0A1D"
                strokeWidth="1.5"
              />

              {/* Bottom ornament */}
              <path d="M 70 110 L 65 125 L 70 120 L 75 125 Z" fill="#8B0A1D" />
            </svg>

            {/* Sparkle effect when active */}
            {isProtectionActive && (
              <motion.div
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              >
                {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, idx) => (
                  <motion.div
                    key={angle}
                    className="absolute"
                    style={{
                      transform: `rotate(${angle}deg) translateY(-90px)`,
                    }}
                    animate={{
                      opacity: [0, 1, 0],
                      scale: [0.5, 1, 0.5],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: idx * 0.2,
                    }}
                  >
                    <Sparkles className="w-3 h-3 text-[#DAA520]" />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </motion.div>
        </motion.button>

        {/* Tap instruction */}
        <motion.p
          className="text-center text-white/60 text-xs mt-4"
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          {isProtectionActive ? t("deactivateProtection") : t("activateProtection")}
        </motion.p>
      </motion.div>

      {/* Status Text */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.6 }}
        className="text-center"
      >
        <p className="text-2xl text-white/90 tracking-wide mb-2">{t("underProtection")}</p>
        <div className="flex items-center justify-center gap-2">
          <motion.div
            className={`w-2 h-2 rounded-full ${
              isProtectionActive ? "bg-[#40E0D0]" : "bg-white/40"
            }`}
            animate={
              isProtectionActive
                ? {
                    scale: [1, 1.2, 1],
                    opacity: [1, 0.7, 1],
                  }
                : {}
            }
            transition={{ duration: 1.5, repeat: Infinity }}
            style={{
              boxShadow: isProtectionActive
                ? "0 0 10px rgba(64,224,208,0.8)"
                : "none",
            }}
          />
          <p
            className={`text-sm tracking-wider ${
              isProtectionActive ? "text-[#40E0D0]" : "text-white/60"
            }`}
          >
            {isProtectionActive ? t("active") : t("inactive")}
          </p>
        </div>
      </motion.div>

      {/* Quick Stats Glass Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.9 }}
        className="grid grid-cols-3 gap-4 mt-12 w-full max-w-sm"
      >
        {[
          { label: t("safeZones"), value: "12" },
          { label: t("guardians"), value: "5" },
          { label: t("daysSafe"), value: "247" },
        ].map((stat, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 + idx * 0.1 }}
            whileHover={{ scale: 1.05, y: -5 }}
            className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-4 text-center relative overflow-hidden group cursor-pointer"
          >
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-10 transition-opacity">
              <KazakhOrnament variant="geometric" size={60} />
            </div>
            <p className="text-2xl text-[#DAA520] font-light relative z-10">{stat.value}</p>
            <p className="text-xs text-white/60 mt-1 relative z-10">{stat.label}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Bottom decorative ornaments */}
      <motion.div
        className="absolute bottom-24 left-1/2 -translate-x-1/2 opacity-10"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.1, 0.2, 0.1],
        }}
        transition={{ duration: 4, repeat: Infinity }}
      >
        <KazakhOrnament variant="umai" size={80} />
      </motion.div>
    </div>
  );
}
