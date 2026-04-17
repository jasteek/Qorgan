import { useState, useEffect, useRef } from "react";
import { useLanguage } from "../../contexts/LanguageContext";
import { playBreathIn, playBreathHold, playBreathOut, playUIClick } from "../../services/soundService";

type Phase = "inhale" | "hold" | "exhale" | "idle";

const PHASES: Phase[] = ["inhale", "hold", "exhale"];
const DURATIONS: Record<Phase, number> = { inhale: 4, hold: 4, exhale: 6, idle: 0 };

export function Rituals() {
  const { t, language } = useLanguage();
  const [isBreathing, setIsBreathing] = useState(false);
  const [phase, setPhase] = useState<Phase>("inhale");
  const [seconds, setSeconds] = useState(DURATIONS.inhale);
  const [cycles, setCycles] = useState(0);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const phaseRef = useRef<Phase>("inhale");
  const secondsRef = useRef(DURATIONS.inhale);

  // Animated circle scale: 1 → 1.4 on inhale/hold, back to 1 on exhale
  const [circleScale, setCircleScale] = useState(1);

  const phaseLabel = {
    inhale: language === "ru" ? "Вдох" : language === "kk" ? "Дем алу" : "Breathe In",
    hold:   language === "ru" ? "Задержка" : language === "kk" ? "Ұстау" : "Hold",
    exhale: language === "ru" ? "Выдох" : language === "kk" ? "Дем шығару" : "Breathe Out",
    idle:   "",
  };

  const advancePhase = () => {
    const curr = phaseRef.current;
    let next: Phase;
    if (curr === "inhale") {
      next = "hold";
      playBreathHold();
      setCircleScale(1.4);
    } else if (curr === "hold") {
      next = "exhale";
      playBreathOut();
      setCircleScale(1);
    } else {
      next = "inhale";
      setCycles(c => c + 1);
      playBreathIn();
      setCircleScale(1.25);
    }
    phaseRef.current = next;
    setPhase(next);
    secondsRef.current = DURATIONS[next];
    setSeconds(DURATIONS[next]);
  };

  useEffect(() => {
    if (!isBreathing) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      secondsRef.current -= 1;
      setSeconds(secondsRef.current);
      if (secondsRef.current <= 0) {
        advancePhase();
      }
    }, 1000);

    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isBreathing]);

  const toggle = () => {
    playUIClick();
    if (!isBreathing) {
      setPhase("inhale");
      phaseRef.current = "inhale";
      setSeconds(DURATIONS.inhale);
      secondsRef.current = DURATIONS.inhale;
      setCircleScale(1.15);
      playBreathIn();
    } else {
      setCircleScale(1);
    }
    setIsBreathing(b => !b);
  };

  const reset = () => {
    playUIClick();
    setIsBreathing(false);
    setPhase("inhale");
    phaseRef.current = "inhale";
    setSeconds(DURATIONS.inhale);
    secondsRef.current = DURATIONS.inhale;
    setCycles(0);
    setCircleScale(1);
  };

  const phaseColor = phase === "inhale" ? "#C9A84C" : phase === "hold" ? "#40E0D0" : "#9B6BDF";
  const phaseGlow = phase === "inhale"
    ? "rgba(201,168,76,0.35)"
    : phase === "hold"
    ? "rgba(64,224,208,0.35)"
    : "rgba(155,107,223,0.35)";

  return (
    <div className="min-h-screen flex flex-col items-center px-6 pt-20 pb-28 relative overflow-hidden"
      style={{ background: "#0e0720" }}>

      {/* Background ornament rings */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[200, 300, 420].map((r, i) => (
          <div key={i} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border"
            style={{
              width: r, height: r,
              borderColor: `${phaseColor}18`,
              transition: "border-color 1s ease",
              animation: `spin ${20 + i * 8}s linear infinite ${i % 2 === 0 ? "" : "reverse"}`,
            }} />
        ))}
      </div>

      {/* Kazakh pattern BG */}
      <div className="absolute inset-0 pointer-events-none opacity-4">
        <svg className="w-full h-full">
          <defs>
            <pattern id="rit_pattern" x="0" y="0" width="90" height="90" patternUnits="userSpaceOnUse">
              <path d="M25 45Q20 37 14 33Q8 29 8 23Q8 17 14 16" fill="none" stroke="#C9A84C" strokeWidth="1" opacity="0.6" />
              <path d="M65 45Q70 37 76 33Q82 29 82 23Q82 17 76 16" fill="none" stroke="#C9A84C" strokeWidth="1" opacity="0.6" />
              <circle cx="45" cy="45" r="10" fill="none" stroke="#C9A84C" strokeWidth="0.7" opacity="0.4" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#rit_pattern)" />
        </svg>
      </div>

      {/* Header */}
      <div className="relative z-10 text-center mb-10 w-full">
        <h2 className="text-4xl font-light tracking-[0.15em] mb-1"
          style={{ fontFamily: "'Cormorant Garamond', serif", color: "#C9A84C",
            textShadow: "0 0 30px rgba(201,168,76,0.4)" }}>
          {t("ritualsTitle")}
        </h2>
        <p className="text-white/45 text-sm">{t("ritualsSubtitle")}</p>
        {/* Ornament border */}
        <svg width="100%" height="24" viewBox="0 0 300 24" className="mt-3 opacity-50">
          <defs>
            <linearGradient id="borderGr" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#C9A84C" stopOpacity="0" />
              <stop offset="50%" stopColor="#C9A84C" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#C9A84C" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d="M0 12 Q37 4 75 12 Q112 20 150 12 Q187 4 225 12 Q262 20 300 12"
            fill="none" stroke="url(#borderGr)" strokeWidth="1.5" />
          {[75, 150, 225].map((x, i) => (
            <path key={i} d={`M${x} 9 L${x + 4} 12 L${x} 15 L${x - 4} 12 Z`} fill="#C9A84C" opacity="0.6" />
          ))}
        </svg>
      </div>

      {/* Breathing Circle */}
      <div className="relative z-10 flex items-center justify-center mb-10">
        {/* Expanding glow rings */}
        {isBreathing && [1, 2, 3].map(i => (
          <div key={i} className="absolute rounded-full"
            style={{
              width: `${200 + i * 45}px`, height: `${200 + i * 45}px`,
              border: `1px solid ${phaseColor}`,
              opacity: 0.15 / i,
              transition: "all 1s ease",
            }} />
        ))}

        {/* Main breathing circle */}
        <div
          className="relative flex items-center justify-center transition-all rounded-full"
          style={{
            width: 200,
            height: 200,
            transform: `scale(${circleScale})`,
            transition: `transform ${phase === "inhale" ? DURATIONS.inhale : phase === "hold" ? 0.3 : DURATIONS.exhale}s ease-in-out`,
            background: `radial-gradient(circle at center, ${phaseColor}22, transparent 70%)`,
            border: `2px solid ${phaseColor}55`,
            boxShadow: `0 0 40px ${phaseGlow}, inset 0 0 30px ${phaseGlow}`,
          }}>

          {/* Kazhakh ornament inner */}
          <svg width="120" height="120" viewBox="0 0 120 120" className="absolute opacity-25">
            <circle cx="60" cy="60" r="45" fill="none" stroke={phaseColor} strokeWidth="1"
              style={{ animation: "spin 12s linear infinite" }} />
            <circle cx="60" cy="60" r="30" fill="none" stroke={phaseColor} strokeWidth="0.8"
              style={{ animation: "spin 8s linear infinite reverse" }} />
            {[0, 60, 120, 180, 240, 300].map((deg, i) => (
              <line key={i} x1="60" y1="60"
                x2={60 + 40 * Math.cos(deg * Math.PI / 180)}
                y2={60 + 40 * Math.sin(deg * Math.PI / 180)}
                stroke={phaseColor} strokeWidth="0.6" opacity="0.5" />
            ))}
          </svg>

          {/* Text center */}
          <div className="relative z-10 text-center">
            <p className="text-sm font-semibold tracking-widest uppercase mb-1 transition-all duration-500"
              style={{ color: phaseColor }}>
              {isBreathing ? phaseLabel[phase] : (language === "ru" ? "Готов" : language === "kk" ? "Дайын" : "Ready")}
            </p>
            <p className="text-5xl font-light text-white/90">
              {isBreathing ? seconds : "∞"}
            </p>
          </div>
        </div>
      </div>

      {/* Cycle counter */}
      <div className="relative z-10 grid grid-cols-3 gap-3 w-full max-w-xs mb-8">
        {[
          { label: language === "ru" ? "Циклы" : language === "kk" ? "Циклдар" : "Cycles", value: String(cycles) },
          { label: language === "ru" ? "Вдох" : language === "kk" ? "Дем алу" : "Inhale", value: `${DURATIONS.inhale}s` },
          { label: language === "ru" ? "Выдох" : language === "kk" ? "Дем шығару" : "Exhale", value: `${DURATIONS.exhale}s` },
        ].map((s, i) => (
          <div key={i} className="rounded-2xl text-center p-3"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <p className="text-xl font-light" style={{ color: "#C9A84C" }}>{s.value}</p>
            <p className="text-white/40 text-xs mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="relative z-10 flex items-center gap-4">
        {/* Reset */}
        <button onClick={reset}
          className="w-14 h-14 rounded-full flex items-center justify-center transition-all active:scale-90"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)" }}>
          <svg className="w-6 h-6 text-white/50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
            <path d="M3 3v5h5" />
          </svg>
        </button>

        {/* Play/Pause */}
        <button onClick={toggle}
          className="w-20 h-20 rounded-full flex items-center justify-center text-black font-bold text-3xl transition-all active:scale-90 shadow-2xl"
          style={{
            background: `linear-gradient(135deg, ${phaseColor} 0%, ${phaseColor}AA 100%)`,
            boxShadow: `0 0 30px ${phaseGlow}`,
            transition: "background 1s ease, box-shadow 1s ease",
          }}>
          {isBreathing ? (
            <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor"><path d="M6 4h4v16H6zM14 4h4v16h-4z" /></svg>
          ) : (
            <svg className="w-8 h-8 ml-1" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
          )}
        </button>

        {/* Sound indicator */}
        <div className="w-14 h-14 rounded-full flex items-center justify-center"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)" }}>
          <svg className={`w-6 h-6 ${isBreathing ? "text-amber-400" : "text-white/30"}`}
            viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
            {isBreathing && <>
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14" /><path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
            </>}
          </svg>
        </div>
      </div>

      {/* Phase description */}
      {isBreathing && (
        <div className="relative z-10 mt-8 text-center max-w-xs">
          <p className="text-white/40 text-sm leading-relaxed">
            {phase === "inhale"
              ? (language === "ru" ? "Медленно вдыхайте через нос, наполняя лёгкие воздухом"
                : language === "kk" ? "Мұрыннан баяу дем алып, өкпеңізді ауамен толтырыңыз"
                : "Slowly breathe in through your nose, filling your lungs")
              : phase === "hold"
              ? (language === "ru" ? "Задержите дыхание и почувствуйте покой"
                : language === "kk" ? "Демді ұстап, тыныштықты сезіңіз"
                : "Hold your breath and feel the stillness")
              : (language === "ru" ? "Медленно выдыхайте через рот, отпуская всё напряжение"
                : language === "kk" ? "Ауызыңыздан баяу дем шығарып, барлық шиеленісті жіберіңіз"
                : "Slowly exhale through your mouth, releasing all tension")}
          </p>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
