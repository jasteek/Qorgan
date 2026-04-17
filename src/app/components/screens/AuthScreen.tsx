import { useState, useEffect } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import { useLanguage } from "../../contexts/LanguageContext";
import { playSuccess, playUIClick } from "../../services/soundService";

// ── Kazakh Tumar Amulet SVG ───────────────────────────────
function TumarIcon({ size = 80 }: { size?: number }) {
  return (
    <svg width={size} height={size * 1.3} viewBox="0 0 80 104" className="drop-shadow-[0_0_24px_rgba(201,168,76,0.8)]">
      <defs>
        <linearGradient id="tg_auth" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFD700" />
          <stop offset="50%" stopColor="#C9A84C" />
          <stop offset="100%" stopColor="#8B6914" />
        </linearGradient>
        <filter id="tglow_auth">
          <feGaussianBlur stdDeviation="3" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      <path d="M40 6 L72 82 L40 96 L8 82 Z" fill="url(#tg_auth)" stroke="#FFD700" strokeWidth="1.5" filter="url(#tglow_auth)" />
      <circle cx="40" cy="40" r="18" fill="none" stroke="#6B0F2B" strokeWidth="2" />
      <circle cx="40" cy="40" r="11" fill="none" stroke="#6B0F2B" strokeWidth="1.5" />
      <path d="M40 28Q32 33 29 40Q26 47 29 53Q32 57 40 57" fill="none" stroke="#6B0F2B" strokeWidth="1.8" />
      <path d="M40 28Q48 33 51 40Q54 47 51 53Q48 57 40 57" fill="none" stroke="#6B0F2B" strokeWidth="1.8" />
      <path d="M40 66L36 76L40 72L44 76Z" fill="#6B0F2B" />
    </svg>
  );
}

// ── Decorative Border Band ────────────────────────────────
function KazakhBorder({ color = "#C9A84C" }: { color?: string }) {
  return (
    <svg width="100%" height="28" viewBox="0 0 400 28" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="borderGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={color} stopOpacity="0" />
          <stop offset="20%" stopColor={color} stopOpacity="0.7" />
          <stop offset="50%" stopColor={color} stopOpacity="1" />
          <stop offset="80%" stopColor={color} stopOpacity="0.7" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d="M0 14 Q25 4 50 14 Q75 24 100 14 Q125 4 150 14 Q175 24 200 14 Q225 4 250 14 Q275 24 300 14 Q325 4 350 14 Q375 24 400 14"
        fill="none" stroke="url(#borderGrad)" strokeWidth="1.8" />
      <path d="M0 18 Q25 8 50 18 Q75 28 100 18 Q125 8 150 18 Q175 28 200 18 Q225 8 250 18 Q275 28 300 18 Q325 8 350 18 Q375 28 400 18"
        fill="none" stroke="url(#borderGrad)" strokeWidth="0.8" opacity="0.5" />
      {/* Diamond accents */}
      {[50, 150, 200, 250, 350].map((x, i) => (
        <path key={i} d={`M${x} 11 L${x+4} 14 L${x} 17 L${x-4} 14 Z`} fill={color} opacity="0.6" />
      ))}
    </svg>
  );
}

// ── Full ornamental background pattern ───────────────────
function OrnamentBg() {
  return (
    <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="auth_bg_pattern" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
          {/* Ram's horn (koshkar-muiyz) */}
          <path d="M20 40Q16 34 12 31Q8 28 8 24Q8 20 12 19" fill="none" stroke="#C9A84C" strokeWidth="1" opacity="0.25" />
          <path d="M60 40Q64 34 68 31Q72 28 72 24Q72 20 68 19" fill="none" stroke="#C9A84C" strokeWidth="1" opacity="0.25" />
          <path d="M20 40Q16 46 12 49Q8 52 8 56Q8 60 12 61" fill="none" stroke="#C9A84C" strokeWidth="1" opacity="0.25" />
          <path d="M60 40Q64 46 68 49Q72 52 72 56Q72 60 68 61" fill="none" stroke="#C9A84C" strokeWidth="1" opacity="0.25" />
          <circle cx="40" cy="40" r="8" fill="none" stroke="#C9A84C" strokeWidth="0.8" opacity="0.2" />
          {/* Star accent */}
          <path d="M40 10 L42 17 L49 17 L43 21 L45 28 L40 24 L35 28 L37 21 L31 17 L38 17 Z"
            fill="none" stroke="#C9A84C" strokeWidth="0.6" opacity="0.15" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#auth_bg_pattern)" />
    </svg>
  );
}

// ── Authentication Screen ─────────────────────────────────
export function AuthScreen() {
  const { login, sendCode } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const [step, setStep] = useState<"welcome" | "phone" | "otp" | "success">("welcome");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [demoCode, setDemoCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [countdown, setCountdown] = useState(0);

  // Countdown for OTP resend
  useEffect(() => {
    if (countdown > 0) {
      const t = setTimeout(() => setCountdown(c => c - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [countdown]);

  const goToPhone = () => {
    playUIClick();
    setStep("phone");
  };

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || phone.length < 7) return;
    setError("");
    setLoading(true);
    const res = await sendCode(phone);
    setLoading(false);
    if (!res.success) {
      setError(res.error || "Error");
      return;
    }
    if (res.code) setDemoCode(res.code);
    playUIClick();
    setStep("otp");
    setCountdown(30);
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length < 4) return;
    setLoading(true);
    setError("");
    try {
      const ok = await login(phone, otp, name);
      if (ok.success) {
        playSuccess();
        setStep("success");
        setTimeout(() => {}, 2000); // success screen stays briefly
      } else {
        setError(language === "ru" ? "Неверный код" : language === "kk" ? "Код қате" : "Invalid code");
        setLoading(false);
      }
    } catch {
      setError("Error. Try again.");
      setLoading(false);
    }
  };

  const langLabels: Record<string, string> = { ru: "РУС", kk: "ҚАЗ", en: "ENG" };
  const langs = ["ru", "kk", "en"] as const;

  return (
    <div className="fixed inset-0 bg-[#150310] overflow-hidden flex flex-col">
      {/* Ornament background */}
      <div className="absolute inset-0 opacity-100">
        <OrnamentBg />
      </div>

      {/* Radial glow */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse 70% 50% at 50% 20%, rgba(107,15,43,0.55) 0%, transparent 70%)" }} />

      {/* Top ornament band */}
      <div className="relative z-10 pt-2">
        <KazakhBorder />
      </div>

      {/* Language switcher */}
      <div className="relative z-10 flex justify-center gap-2 mt-3">
        {langs.map(l => (
          <button key={l} onClick={() => { setLanguage(l); playUIClick(); }}
            className={`px-3 py-1 rounded-lg text-xs font-semibold tracking-widest transition-all ${
              language === l
                ? "bg-amber-400/20 text-amber-400 border border-amber-400/50"
                : "bg-white/5 text-white/40 border border-white/10 hover:bg-white/10"
            }`}>
            {langLabels[l]}
          </button>
        ))}
      </div>

      {/* WELCOME STEP */}
      {step === "welcome" && (
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-8">
          <div className="animate-[pulse_3s_ease-in-out_infinite] mb-6">
            <TumarIcon size={85} />
          </div>

          <h1 className="text-6xl font-light tracking-[0.35em] mb-2"
            style={{ fontFamily: "'Cormorant Garamond', serif", color: "#C9A84C",
              textShadow: "0 0 40px rgba(201,168,76,0.6), 0 0 80px rgba(201,168,76,0.2)" }}>
            QORǴAN
          </h1>

          <KazakhBorder />

          <p className="text-white/50 tracking-[0.3em] text-xs uppercase mt-4 mb-12">
            {language === "ru" ? "Ваш цифровой защитник"
              : language === "kk" ? "Сіздің цифрлық қорғаушыңыз"
              : "Your Digital Guardian"}
          </p>

          {/* Feature pills */}
          <div className="flex flex-wrap justify-center gap-2 mb-12 max-w-xs">
            {[
              { icon: "🛡️", label: language === "ru" ? "SOS защита" : language === "kk" ? "SOS қорғаныс" : "SOS Shield" },
              { icon: "📍", label: language === "ru" ? "Карта" : language === "kk" ? "Карта" : "Map" },
              { icon: "🤖", label: language === "ru" ? "AI Самрук" : language === "kk" ? "AI Самрұқ" : "AI Samruk" },
              { icon: "🌬️", label: language === "ru" ? "Дыхание" : language === "kk" ? "Тыныс" : "Breathing" },
            ].map((f, i) => (
              <div key={i} className="flex items-center gap-1.5 bg-white/5 border border-amber-400/20 rounded-full px-3 py-1.5">
                <span className="text-sm">{f.icon}</span>
                <span className="text-white/70 text-xs">{f.label}</span>
              </div>
            ))}
          </div>

          <button onClick={goToPhone}
            className="w-full max-w-xs py-5 rounded-2xl font-semibold tracking-wider text-black text-base transition-all active:scale-95 shadow-[0_0_30px_rgba(201,168,76,0.4)]"
            style={{ background: "linear-gradient(135deg, #FFD700 0%, #C9A84C 50%, #DAA520 100%)" }}>
            {language === "ru" ? "Начать" : language === "kk" ? "Бастау" : "Get Started"}
          </button>

          <p className="text-white/25 text-xs mt-4 text-center">
            {language === "ru" ? "Для женщин"
              : language === "kk" ? "Әйелдер үшін"
              : "For women"}
          </p>
        </div>
      )}

      {/* PHONE STEP */}
      {step === "phone" && (
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-8">
          <div className="mb-6"><TumarIcon size={55} /></div>
          <h2 className="text-2xl font-light tracking-widest mb-1"
            style={{ fontFamily: "'Cormorant Garamond', serif", color: "#C9A84C" }}>
            {language === "ru" ? "Регистрация" : language === "kk" ? "Тіркелу" : "Register"}
          </h2>
          <KazakhBorder />
          <p className="text-white/40 text-sm text-center mt-3 mb-8">
            {language === "ru" ? "Введите ваше имя и номер телефона"
              : language === "kk" ? "Атыңызды және телефон нөмірін енгізіңіз"
              : "Enter your name and phone number"}
          </p>

          <form onSubmit={handlePhoneSubmit} className="w-full max-w-sm space-y-4">
            <div>
              <label className="block text-white/50 text-xs uppercase tracking-widest mb-2">
                {language === "ru" ? "Имя" : language === "kk" ? "Аты" : "Name"}
              </label>
              <input
                autoFocus
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder={language === "ru" ? "Ваше имя" : language === "kk" ? "Сіздің атыңыз" : "Your name"}
                className="w-full bg-white/5 border border-amber-400/20 rounded-2xl px-5 py-4 text-white placeholder-white/20 outline-none focus:border-amber-400/60 transition-colors"
                style={{ fontFamily: "inherit" }}
              />
            </div>

            <div>
              <label className="block text-white/50 text-xs uppercase tracking-widest mb-2">
                {language === "ru" ? "Телефон" : language === "kk" ? "Телефон" : "Phone"}
              </label>
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="+7 (___) ___-__-__"
                className="w-full bg-white/5 border border-amber-400/20 rounded-2xl px-5 py-4 text-white placeholder-white/20 outline-none focus:border-amber-400/60 transition-colors"
                style={{ fontFamily: "inherit" }}
              />
            </div>

            {error && <p className="text-red-400 text-sm text-center">{error}</p>}

            <button type="submit" disabled={!name.trim() || phone.length < 7}
              className="w-full py-4 rounded-2xl font-semibold text-black tracking-wider transition-all disabled:opacity-40 active:scale-95 mt-2 shadow-[0_0_20px_rgba(201,168,76,0.3)]"
              style={{ background: "linear-gradient(135deg, #FFD700 0%, #C9A84C 100%)" }}>
              {language === "ru" ? "Получить код" : language === "kk" ? "Код алу" : "Get Code"}
            </button>
          </form>

          <button onClick={() => setStep("welcome")} className="mt-6 text-white/30 text-sm hover:text-white/60 transition-colors">
            ← {language === "ru" ? "Назад" : language === "kk" ? "Артқа" : "Back"}
          </button>
        </div>
      )}

      {/* OTP STEP */}
      {step === "otp" && (
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-8">
          <div className="mb-6"><TumarIcon size={55} /></div>
          <h2 className="text-2xl font-light tracking-widest mb-1"
            style={{ fontFamily: "'Cormorant Garamond', serif", color: "#C9A84C" }}>
            {language === "ru" ? "Код из SMS" : language === "kk" ? "SMS коды" : "SMS Code"}
          </h2>
          <KazakhBorder />
          <p className="text-white/40 text-sm text-center mt-3 mb-8">
            {language === "ru" ? `Для входа (демо) используйте код: ${demoCode}`
              : language === "kk" ? `Кіру үшін (демо) кодты пайдаланыңыз: ${demoCode}`
              : `For demo access use code: ${demoCode}`}
          </p>

          <form onSubmit={handleOtpSubmit} className="w-full max-w-sm">
            <input
              autoFocus
              type="text"
              maxLength={4}
              value={otp}
              onChange={e => setOtp(e.target.value.replace(/\D/g, ""))}
              placeholder="● ● ● ●"
              className="w-full bg-white/5 border border-amber-400/20 rounded-2xl px-5 py-5 text-white placeholder-white/20 outline-none focus:border-amber-400/60 transition-colors text-center text-3xl tracking-[0.5em] font-light"
              style={{ letterSpacing: "0.5em" }}
            />

            {error && <p className="text-red-400 text-sm text-center mt-3">{error}</p>}

            <button type="submit" disabled={otp.length < 4 || loading}
              className="w-full py-4 rounded-2xl font-semibold text-black tracking-wider transition-all disabled:opacity-40 active:scale-95 mt-5 shadow-[0_0_20px_rgba(201,168,76,0.3)]"
              style={{ background: "linear-gradient(135deg, #FFD700 0%, #C9A84C 100%)" }}>
              {loading
                ? (language === "ru" ? "Проверка..." : language === "kk" ? "Тексеруде..." : "Checking...")
                : (language === "ru" ? "Войти" : language === "kk" ? "Кіру" : "Enter")}
            </button>

            <div className="flex justify-between items-center mt-4">
              <button type="button" onClick={() => setStep("phone")} className="text-white/30 text-sm hover:text-white/60">
                ← {language === "ru" ? "Назад" : language === "kk" ? "Артқа" : "Back"}
              </button>
              {countdown > 0 ? (
                <p className="text-white/30 text-sm">{countdown}s</p>
              ) : (
                <button type="button" onClick={() => { setCountdown(30); playUIClick(); }}
                  className="text-amber-400/70 text-sm hover:text-amber-400">
                  {language === "ru" ? "Отправить снова" : language === "kk" ? "Қайта жіберу" : "Resend"}
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      {/* SUCCESS STEP */}
      {step === "success" && (
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-8">
          <div className="relative mb-8">
            <div className="absolute inset-0 rounded-full bg-teal-400/20 blur-3xl scale-150" />
            <div className="relative w-28 h-28 rounded-full bg-teal-400/20 border-2 border-teal-400/60 flex items-center justify-center shadow-[0_0_40px_rgba(64,224,208,0.5)]">
              <svg className="w-14 h-14 text-teal-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M20 6L9 17L4 12" />
              </svg>
            </div>
          </div>

          <h2 className="text-3xl font-light tracking-widest mb-2"
            style={{ fontFamily: "'Cormorant Garamond', serif", color: "#C9A84C" }}>
            {language === "ru" ? `Добро пожаловать, ${name}!`
              : language === "kk" ? `Қош келдіңіз, ${name}!`
              : `Welcome, ${name}!`}
          </h2>
          <KazakhBorder />
          <p className="text-white/50 text-sm text-center mt-4">
            {language === "ru" ? "Qorǵan теперь защищает вас"
              : language === "kk" ? "Qorǵan сізді қорғайды"
              : "Qorǵan is now protecting you"}
          </p>

          <div className="mt-8 flex gap-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="w-2 h-2 rounded-full bg-amber-400 animate-bounce"
                style={{ animationDelay: `${i * 0.2}s` }} />
            ))}
          </div>
        </div>
      )}

      {/* Bottom ornament band */}
      <div className="relative z-10 pb-2">
        <KazakhBorder />
      </div>
    </div>
  );
}
