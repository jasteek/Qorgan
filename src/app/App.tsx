import { useState, useEffect, useRef, useCallback, createContext, useContext } from "react";
import { Map } from "./components/screens/Map";

// ═══════════════════════════════════════════════════════════
// TRANSLATIONS
// ═══════════════════════════════════════════════════════════
const translations = {
  en: {
    home: "Home", path: "Path", shield: "Shield", sos: "SOS", rituals: "Rituals", tips: "Tips", health: "Health", fitness: "Fitness",
    underProtection: "Under Protection", active: "ACTIVE", inactive: "INACTIVE",
    safeZones: "Safe Zones", guardians: "Guardians", daysSafe: "Days Safe",
    activateProtection: "Touch to Activate", deactivateProtection: "Touch to Deactivate",
    aiShieldTitle: "AI Shield", samrukOnline: "Samruk is online", typeMessage: "Write to Samruk…",
    needHelp: "I need help", imSafe: "I'm safe", checkRoute: "Check route",
    sosActivated: "SOS Activated!", alertingSOS: "Alerting your trusted contacts…",
    holdToActivate: "Hold 2 sec to activate SOS", close: "Close",
    ritualsTitle: "Emotional Cleansing", ritualsSubtitle: "Kobyz Breath Ritual",
    breathIn: "Breathe In", hold: "Hold", breathOut: "Breathe Out",
    safetyTitle: "Support", safetySubtitle: "Safety tips for you",
    healthTitle: "Health Passport", editData: "Edit", saveData: "Save",
    fitnessTitle: "Exercise", notifications: "Notifications", soundEffects: "Sound Effects",
    hapticFeedback: "Haptic Feedback", menu: "Menu", settings: "Settings",
    language: "Language", emergency: "Emergency Call 112", sosContacts: "SOS Contacts", manageContacts: "Emergency Contacts",
  },
  ru: {
    home: "Главная", path: "Маршрут", shield: "Щит", sos: "SOS", rituals: "Ритуалы", tips: "Советы", health: "Здоровье", fitness: "Фитнес",
    underProtection: "Под защитой", active: "АКТИВНО", inactive: "НЕ АКТИВНО",
    safeZones: "Безоп. зоны", guardians: "Стражи", daysSafe: "Дней безоп.",
    activateProtection: "Нажмите для активации", deactivateProtection: "Нажмите для отключения",
    aiShieldTitle: "ИИ Щит", samrukOnline: "Самрұқ онлайн", typeMessage: "Написать Самрұқу…",
    needHelp: "Нужна помощь", imSafe: "Я в безопасности", checkRoute: "Проверить маршрут",
    sosActivated: "SOS Активирован!", alertingSOS: "Оповещаем ваши доверенные контакты…",
    holdToActivate: "Удержите 2 сек для SOS", close: "Закрыть",
    ritualsTitle: "Эмоц. очищение", ritualsSubtitle: "Дыхательный ритуал Кобыза",
    breathIn: "Вдох", hold: "Задержка", breathOut: "Выдох",
    safetyTitle: "Поддержка", safetySubtitle: "Советы по безопасности",
    healthTitle: "Паспорт здоровья", editData: "Редакт.", saveData: "Сохранить",
    fitnessTitle: "Упражнения", notifications: "Уведомления", soundEffects: "Звуки", hapticFeedback: "Вибрация",
    menu: "Меню", settings: "Настройки", language: "Язык", emergency: "Экстр. вызов 112",
    sosContacts: "SOS Контакты", manageContacts: "Контакты экстренной помощи",
  },
  kk: {
    home: "Үй", path: "Жол", shield: "Қалқан", sos: "SOS", rituals: "Рәсім", tips: "Кеңестер", health: "Денсаулық", fitness: "Жаттығу",
    underProtection: "Қорғалудасың", active: "БЕЛСЕНДІ", inactive: "БЕЛСЕНДІ ЕМЕС",
    safeZones: "Қауіпсіз аймақ", guardians: "Қорғаушылар", daysSafe: "Күн қауіпсіз",
    activateProtection: "Белсендіру үшін басыңыз", deactivateProtection: "Өшіру үшін басыңыз",
    aiShieldTitle: "ИИ Қалқан", samrukOnline: "Самрұқ онлайн", typeMessage: "Самрұққа жаз…",
    needHelp: "Көмек керек", imSafe: "Мен қауіпсіздемін", checkRoute: "Маршрутты тексеру",
    sosActivated: "SOS белсендірілді!", alertingSOS: "Сенімді контактілеріңе хабарлануда…",
    holdToActivate: "SOS үшін 2 сек ұстаңыз", close: "Жабу",
    ritualsTitle: "Эмоциялық тазарту", ritualsSubtitle: "Қобыз демалыс рәсімі",
    breathIn: "Дем ал", hold: "Ұста", breathOut: "Шығар",
    safetyTitle: "Қолдау", safetySubtitle: "Қауіпсіздік кеңестері",
    healthTitle: "Денсаулық паспорты", editData: "Өңдеу", saveData: "Сақтау",
    fitnessTitle: "Жаттығулар", notifications: "Хабарландырулар", soundEffects: "Дыбыстар", hapticFeedback: "Діріл",
    menu: "Мәзір", settings: "Параметрлер", language: "Тіл", emergency: "Жедел қоңырау 112",
    sosContacts: "SOS Контактілер", manageContacts: "Жедел контактілер",
  },
};

// ═══════════════════════════════════════════════════════════
// CONTEXTS
// ═══════════════════════════════════════════════════════════
const LangCtx = createContext<any>(null);
const AppCtx = createContext<any>(null);

function LangProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<"en" | "ru" | "kk">("ru");
  const t = (key: string) => (translations[language] as any)[key] || key;
  return <LangCtx.Provider value={{ language, setLanguage, t }}>{children}</LangCtx.Provider>;
}
function useLang() { return useContext(LangCtx); }

function AppProvider({ children }: { children: React.ReactNode }) {
  const [isProtectionActive, setIsProtectionActive] = useState(true);
  const [emergencyContacts, setEmergencyContacts] = useState(() => {
    const saved = localStorage.getItem("qorgan_sos_contacts");
    return saved ? JSON.parse(saved) : [];
  });
  
  // Persist emergency contacts to localStorage
  useEffect(() => {
    localStorage.setItem("qorgan_sos_contacts", JSON.stringify(emergencyContacts));
  }, [emergencyContacts]);
  const [settings, setSettings] = useState({ notifications: true, soundEffects: true, hapticFeedback: true });
  const [healthData, setHealthData] = useState({ age: "25", height: "165", weight: "58", bloodType: "A+", sleepHours: "7", waterIntake: "2", exerciseFrequency: "3 раза в неделю", stressLevel: "Средний" });
  const toggleProtection = () => setIsProtectionActive(p => !p);
  const addContact = (c: any) => setEmergencyContacts(p => [...p, { ...c, id: Date.now().toString() }]);
  const removeContact = (id: string) => setEmergencyContacts(p => p.filter(c => c.id !== id));
  const updateSettings = (s: any) => setSettings(p => ({ ...p, ...s }));
  return (
    <AppCtx.Provider value={{ isProtectionActive, toggleProtection, emergencyContacts, addContact, removeContact, settings, updateSettings, healthData, setHealthData }}>
      {children}
    </AppCtx.Provider>
  );
}
function useApp() { return useContext(AppCtx); }

// ═══════════════════════════════════════════════════════════
// KAZAKH ORNAMENTS SVG
// ═══════════════════════════════════════════════════════════
function KazakhOrnament({ variant = "koshkar", size = 100, className = "", color = "#C9A84C" }: any) {
  const g = `<linearGradient id="og${variant}" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="${color}" stopOpacity="0.85"/><stop offset="100%" stopColor="${color}" stopOpacity="0.3"/></linearGradient>`;
  if (variant === "koshkar") return (
    <svg width={size} height={size} viewBox="0 0 100 100" className={className}>
      <defs dangerouslySetInnerHTML={{ __html: g }} />
      <path d="M30 50Q25 40 20 35Q15 30 15 25Q15 20 20 18" fill="none" stroke={`url(#og${variant})`} strokeWidth="2" strokeLinecap="round" />
      <path d="M70 50Q75 40 80 35Q85 30 85 25Q85 20 80 18" fill="none" stroke={`url(#og${variant})`} strokeWidth="2" strokeLinecap="round" />
      <path d="M30 50Q25 60 20 65Q15 70 15 75Q15 80 20 82" fill="none" stroke={`url(#og${variant})`} strokeWidth="2" strokeLinecap="round" />
      <path d="M70 50Q75 60 80 65Q85 70 85 75Q85 80 80 82" fill="none" stroke={`url(#og${variant})`} strokeWidth="2" strokeLinecap="round" />
      <circle cx="50" cy="50" r="12" fill="none" stroke={`url(#og${variant})`} strokeWidth="1.5" />
      <circle cx="50" cy="50" r="6" fill="none" stroke={`url(#og${variant})`} strokeWidth="1" />
    </svg>
  );
  if (variant === "umai") return (
    <svg width={size} height={size} viewBox="0 0 100 100" className={className}>
      <defs dangerouslySetInnerHTML={{ __html: g }} />
      <path d="M50 20L70 50L50 80L30 50Z" fill="none" stroke={`url(#og${variant})`} strokeWidth="2" />
      <path d="M50 10L50 30" stroke={`url(#og${variant})`} strokeWidth="2" />
      <path d="M50 70L50 90" stroke={`url(#og${variant})`} strokeWidth="2" />
      <path d="M10 50L30 50" stroke={`url(#og${variant})`} strokeWidth="2" />
      <path d="M70 50L90 50" stroke={`url(#og${variant})`} strokeWidth="2" />
      <circle cx="50" cy="35" r="3" fill={`url(#og${variant})`} />
      <circle cx="50" cy="65" r="3" fill={`url(#og${variant})`} />
      <circle cx="35" cy="50" r="3" fill={`url(#og${variant})`} />
      <circle cx="65" cy="50" r="3" fill={`url(#og${variant})`} />
    </svg>
  );
  if (variant === "geometric") return (
    <svg width={size} height={size} viewBox="0 0 100 100" className={className}>
      <defs dangerouslySetInnerHTML={{ __html: g }} />
      <path d="M50 10L80 30L80 70L50 90L20 70L20 30Z" fill="none" stroke={`url(#og${variant})`} strokeWidth="2" />
      <path d="M50 25L70 37.5L70 62.5L50 75L30 62.5L30 37.5Z" fill="none" stroke={`url(#og${variant})`} strokeWidth="1.5" />
      <circle cx="50" cy="50" r="8" fill="none" stroke={`url(#og${variant})`} strokeWidth="1.5" />
      {[{ cx: 50, cy: 10 }, { cx: 80, cy: 30 }, { cx: 80, cy: 70 }, { cx: 50, cy: 90 }, { cx: 20, cy: 70 }, { cx: 20, cy: 30 }].map((p, i) =>
        <circle key={i} cx={p.cx} cy={p.cy} r="3" fill={`url(#og${variant})`} />
      )}
    </svg>
  );
  if (variant === "border") return (
    <svg width={size} height={size / 4} viewBox="0 0 200 50" className={className} preserveAspectRatio="none">
      <defs><linearGradient id={"bgborder" + variant} x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor={color} stopOpacity="0.2" /><stop offset="50%" stopColor={color} stopOpacity="0.8" /><stop offset="100%" stopColor={color} stopOpacity="0.2" /></linearGradient></defs>
      <path d="M0 25Q25 10 50 25Q75 40 100 25Q125 10 150 25Q175 40 200 25" fill="none" stroke={"url(#bgborder" + variant + ")"} strokeWidth="2" />
      <path d="M0 25Q25 40 50 25Q75 10 100 25Q125 40 150 25Q175 10 200 25" fill="none" stroke={"url(#bgborder" + variant + ")"} strokeWidth="1" opacity="0.5" />
    </svg>
  );
  return null;
}

// ═══════════════════════════════════════════════════════════
// GLASS CARD
// ═══════════════════════════════════════════════════════════
function GlassCard({ children, className = "", gold = false, onClick }: any) {
  return (
    <div
      onClick={onClick}
      className={`backdrop-blur-xl rounded-2xl border transition-all ${gold
        ? "bg-amber-500/8 border-amber-400/30 shadow-[0_0_20px_rgba(201,168,76,0.12)]"
        : "bg-white/5 border-white/10"
        } ${onClick ? "cursor-pointer hover:scale-[1.02] active:scale-[0.98]" : ""} ${className}`}
    >
      {children}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// BACKGROUND SVGS
// ═══════════════════════════════════════════════════════════
function TumarSVG({ active, pulsing }: any) {
  return (
    <svg width="150" height="190" viewBox="0 0 150 190" className={`relative z-10 transition-all duration-500 ${pulsing ? "drop-shadow-[0_0_35px_rgba(201,168,76,1)]" : active
      ? "drop-shadow-[0_0_18px_rgba(201,168,76,0.7)]"
      : "drop-shadow-[0_0_10px_rgba(255,255,255,0.25)]"
      }`}>
      <defs>
        <linearGradient id="tg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={active ? "#FFD700" : "#FFFFFF"} stopOpacity="1" />
          <stop offset="50%" stopColor={active ? "#C9A84C" : "#CCCCCC"} stopOpacity="1" />
          <stop offset="100%" stopColor={active ? "#A8893A" : "#999"} stopOpacity="1" />
        </linearGradient>
        <filter id="tglow"><feGaussianBlur stdDeviation="3" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
      </defs>
      <path d="M75 18 L128 145 L75 168 L22 145 Z" fill="url(#tg)" stroke={active ? "#FFD700" : "#FFF"} strokeWidth="2" filter="url(#tglow)" />
      <circle cx="75" cy="75" r="28" fill="none" stroke="#6B0F2B" strokeWidth="2.2" />
      <circle cx="75" cy="75" r="17" fill="none" stroke="#6B0F2B" strokeWidth="1.8" />
      <path d="M75 52Q63 58 58 70Q53 82 58 92Q63 98 75 98" fill="none" stroke="#6B0F2B" strokeWidth="1.8" />
      <path d="M75 52Q87 58 92 70Q97 82 92 92Q87 98 75 98" fill="none" stroke="#6B0F2B" strokeWidth="1.8" />
      <path d="M75 115L69 132L75 126L81 132Z" fill="#6B0F2B" />
      {active && <>
        <circle cx="75" cy="52" r="3" fill="#C9A84C" opacity="0.6" />
        <circle cx="75" cy="98" r="3" fill="#C9A84C" opacity="0.6" />
        <circle cx="58" cy="75" r="3" fill="#C9A84C" opacity="0.6" />
        <circle cx="92" cy="75" r="3" fill="#C9A84C" opacity="0.6" />
      </>}
    </svg>
  );
}

function SamrukWing({ size = 80 }: any) {
  return (
    <svg width={size} height={size * 0.45} viewBox="0 0 80 36" className="drop-shadow-[0_0_18px_rgba(201,168,76,0.9)]">
      <defs>
        <linearGradient id="swL" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#FFD700" /><stop offset="100%" stopColor="#6B3A12" /></linearGradient>
        <linearGradient id="swR" x1="100%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor="#FFD700" /><stop offset="100%" stopColor="#6B3A12" /></linearGradient>
      </defs>
      <path d="M40 18Q30 8 10 4Q18 12 22 18Q14 16 4 18Q12 20 18 24Q10 24 4 28Q14 26 22 28Q16 33 10 35Q20 31 30 25Q36 22 40 18Z" fill="url(#swL)" opacity="0.9" />
      <path d="M40 18Q50 8 70 4Q62 12 58 18Q66 16 76 18Q68 20 62 24Q70 24 76 28Q66 26 58 28Q64 33 70 35Q60 31 50 25Q44 22 40 18Z" fill="url(#swR)" opacity="0.9" />
      <ellipse cx="40" cy="14" rx="5" ry="6" fill="#C9A84C" />
      <path d="M38 20L36 23L40 21.5L44 23L42 20" fill="#A8893A" />
      <circle cx="38" cy="12" r="1.2" fill="#0a0208" />
    </svg>
  );
}

function SplashScreen({ onComplete }: any) {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const iv = setInterval(() => {
      setProgress(p => {
        if (p >= 100) { clearInterval(iv); setTimeout(onComplete, 400); return 100; }
        return p + 2;
      });
    }, 22);
    return () => clearInterval(iv);
  }, [onComplete]);
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#3D0818] overflow-hidden">
      <div className="absolute inset-0 opacity-8">
        <svg className="w-full h-full"><defs><pattern id="sp" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse"><path d="M50,10L60,30L80,30L65,45L70,65L50,50L30,65L35,45L20,30L40,30Z" fill="none" stroke="#C9A84C" strokeWidth="1" opacity="0.3" /></pattern></defs><rect width="100%" height="100%" fill="url(#sp)" /></svg>
      </div>
      <div className="relative z-10 flex flex-col items-center">
        <div className="mb-8 animate-pulse">
          <svg width="100" height="130" viewBox="0 0 100 130" className="drop-shadow-[0_0_30px_rgba(201,168,76,0.9)]">
            <defs>
              <linearGradient id="sgold" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFD700" /><stop offset="50%" stopColor="#C9A84C" /><stop offset="100%" stopColor="#A8893A" />
              </linearGradient>
              <filter id="sg"><feGaussianBlur stdDeviation="4" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
            </defs>
            <path d="M50 12 L90 110 L50 128 L10 110 Z" fill="url(#sgold)" stroke="#FFD700" strokeWidth="1.5" filter="url(#sg)" />
            <circle cx="50" cy="52" r="22" fill="none" stroke="#3D0818" strokeWidth="2" />
            <circle cx="50" cy="52" r="13" fill="none" stroke="#3D0818" strokeWidth="1.5" />
          </svg>
        </div>
        <h1 className="text-5xl font-light tracking-[0.35em] text-amber-400 mb-2" style={{ fontFamily: "'Cormorant Garamond', serif" }}>QORǴAN</h1>
        <p className="text-white/50 text-sm tracking-[0.45em] uppercase mb-10">Your Guardian</p>
        <div className="w-56 h-1 bg-white/10 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-amber-500 to-teal-400 rounded-full transition-all duration-100" style={{ width: `${progress}%` }} />
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// SCREENS
// ═══════════════════════════════════════════════════════════

function HomeScreen() {
  const { t } = useLang();
  const { isProtectionActive, toggleProtection } = useApp();
  const [isPulsing, setIsPulsing] = useState(false);

  const handleTumar = () => {
    setIsPulsing(true);
    toggleProtection();
    setTimeout(() => setIsPulsing(false), 1600);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 pt-16 pb-28 relative overflow-hidden">
      <div className="absolute top-8 left-5 opacity-18 pointer-events-none animate-spin" style={{ animationDuration: "22s" }}><KazakhOrnament variant="koshkar" size={65} /></div>
      <div className="absolute top-8 right-5 opacity-18 pointer-events-none" style={{ animation: "spin 22s linear infinite reverse" }}><KazakhOrnament variant="umai" size={65} /></div>
      <div className="absolute bottom-28 left-1/2 -translate-x-1/2 opacity-8 pointer-events-none"><KazakhOrnament variant="umai" size={90} /></div>

      <div className="mb-10 text-center">
        <h1 className="text-5xl font-light tracking-[0.22em] mb-3" style={{ fontFamily: "'Cormorant Garamond', serif", color: "#C9A84C", textShadow: "0 0 30px rgba(201,168,76,0.5), 0 0 60px rgba(201,168,76,0.2)" }}>QORǴAN</h1>
        <KazakhOrnament variant="border" size={220} className="mx-auto opacity-55" />
      </div>

      <div className="relative mb-10">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ animation: "spin 38s linear infinite" }}>
          {[0, 60, 120, 180, 240, 300].map(a => <div key={a} className="absolute" style={{ transform: `rotate(${a}deg) translateY(-145px)` }}><KazakhOrnament variant="umai" size={18} className="opacity-28" /></div>)}
        </div>
        {isPulsing && [1, 2, 3].map(i => <div key={i} className="absolute inset-0 rounded-full border-2 border-amber-400 pointer-events-none" style={{ animation: `ringPulse 1.4s ease-out ${i * 0.18}s forwards` }} />)}
        <div className={`absolute inset-0 rounded-full blur-3xl transition-all duration-700 ${isProtectionActive ? "bg-amber-400/20 scale-125" : "bg-white/5"}`} />
        <button onClick={handleTumar} className={`relative rounded-full w-64 h-64 flex items-center justify-center backdrop-blur-xl border-2 shadow-2xl transition-all duration-500 active:scale-95 ${isProtectionActive ? "bg-white/5 border-amber-400/40 shadow-[0_0_50px_rgba(201,168,76,0.3)]" : "bg-white/8 border-white/20"}`}>
          <div className={`absolute inset-4 rounded-full bg-gradient-to-br to-transparent transition-all ${isProtectionActive ? "from-amber-400/18" : "from-white/8"}`} />
          <div className="absolute top-7 right-7">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isProtectionActive ? "bg-teal-400/20" : "bg-white/8"}`}>
              <svg className={`w-5 h-5 ${isProtectionActive ? "text-teal-400" : "text-white/50"}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                {isProtectionActive ? <path d="M12 2L3 7V13C3 17.4 7 21.4 12 22C17 21.4 21 17.4 21 13V7L12 2Z" fill="currentColor" fillOpacity="0.3" /> : <path d="M12 2L3 7V13C3 17.4 7 21.4 12 22C17 21.4 21 17.4 21 13V7L12 2Z" />}
              </svg>
            </div>
          </div>
          <TumarSVG active={isProtectionActive} pulsing={isPulsing} />
        </button>
        <p className="text-center text-white/50 text-xs mt-3 tracking-wider animate-pulse">{isProtectionActive ? t("deactivateProtection") : t("activateProtection")}</p>
      </div>

      <div className="text-center mb-8">
        <p className="text-2xl text-white/90 tracking-wide mb-2" style={{ fontFamily: "'Cormorant Garamond', serif" }}>{t("underProtection")}</p>
        <div className="flex items-center justify-center gap-2">
          <div className={`w-2 h-2 rounded-full transition-all ${isProtectionActive ? "bg-teal-400 shadow-[0_0_10px_rgba(64,224,208,0.8)]" : "bg-white/35"}`} style={isProtectionActive ? { animation: "pulse 1.5s ease-in-out infinite" } : {}} />
          <p className={`text-sm tracking-wider ${isProtectionActive ? "text-teal-400" : "text-white/50"}`}>{isProtectionActive ? t("active") : t("inactive")}</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 w-full max-w-sm">
        {[{ label: t("safeZones"), val: "12" }, { label: t("guardians"), val: "5" }, { label: t("daysSafe"), val: "247" }].map((s, i) => (
          <GlassCard key={i} gold className="p-4 text-center group hover:bg-white/8">
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-8 transition-opacity"><KazakhOrnament variant="geometric" size={55} /></div>
            <p className="text-2xl font-light relative z-10" style={{ color: "#C9A84C" }}>{s.val}</p>
            <p className="text-xs text-white/55 mt-1 relative z-10">{s.label}</p>
          </GlassCard>
        ))}
      </div>
      <button onClick={() => {
        import("./services/soundService").then(m => m.toggleBackgroundMusic());
      }} className="mt-8 px-6 py-2 rounded-full border border-amber-400/30 text-amber-400 text-xs tracking-widest uppercase hover:bg-amber-400/10 active:scale-95 transition-all outline-none">
        Музыка 🎵
      </button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// MAP SCREEN
// ═══════════════════════════════════════════════════════════
function MapScreen() {
  const { t } = useLang();

  // Interactive States
  const [is2GisLinked, setIs2GisLinked] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginStep, setLoginStep] = useState(1);
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');

  // Advanced Features
  const [isRouting, setIsRouting] = useState(false);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [showProfile, setShowProfile] = useState(false);

  const mapInstance = useRef<any>(null);

  // 1. Get Real Location
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([position.coords.latitude, position.coords.longitude]);
        },
        (error) => {
          console.warn("Geolocation failed. Defaults to Almaty.", error);
          setUserLocation([43.2567, 76.9286]); // Default Almaty
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    } else {
      setUserLocation([43.2567, 76.9286]);
    }
  }, []);

  // 2. Init Map when location is ready
  useEffect(() => {
    if (!userLocation) return;

    const container = document.getElementById('qorgan-map');
    if (container) container.innerHTML = '';

    const script = document.createElement("script");
    script.src = "https://maps.api.2gis.ru/2.0/loader.js?pkg=full";
    script.async = true;
    document.body.appendChild(script);

    let map: any;

    script.onload = () => {
      if ((window as any).DG) {
        (window as any).DG.then(() => {
          map = (window as any).DG.map('qorgan-map', {
            center: userLocation,
            zoom: 14,
            fullscreenControl: false,
            zoomControl: false
          });
          mapInstance.current = map;

          // User Marker
          (window as any).DG.marker(userLocation).addTo(map).bindPopup('Ваша позиция');
        });
      }
    };

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
      if (mapInstance.current && mapInstance.current.remove) {
        mapInstance.current.remove();
      }
    };
  }, [userLocation]);

  const handleLoginSubmit = (e: any) => {
    e.preventDefault();
    if (loginStep === 1 && phone.length > 3) {
      setLoginStep(2);
    } else if (loginStep === 2 && code.length >= 4) {
      setShowLoginModal(false);
      setIs2GisLinked(true);
      setShowProfile(true); // Open profile automatically after login

      // Add fake friends to map!
      const DG = (window as any).DG;
      if (DG && mapInstance.current && userLocation) {
        const f1 = [userLocation[0] + 0.005, userLocation[1] + 0.005];
        const f2 = [userLocation[0] - 0.003, userLocation[1] + 0.008];
        DG.marker(f1).addTo(mapInstance.current).bindPopup('Айгерим (Подруга)');
        DG.marker(f2).addTo(mapInstance.current).bindPopup('Сабина (Подруга)');
      }
    }
  };

  const handleRoute = () => {
    setIsRouting(true);
    const DG = (window as any).DG;
    if (DG && mapInstance.current && userLocation) {
      const destination = [userLocation[0] + 0.008, userLocation[1] - 0.005];

      const polyline = DG.polyline([userLocation, destination], {
        color: '#A4E32A',
        weight: 5,
        opacity: 0.8
      }).addTo(mapInstance.current);

      DG.marker(destination).addTo(mapInstance.current).bindPopup('Ближайший Safe Haven');
      mapInstance.current.fitBounds(polyline.getBounds(), { padding: [50, 50] });
    }
  };

  return (
    <div className="min-h-screen relative pb-20 overflow-hidden" style={{ background: "#07100a" }}>
      {!userLocation ? (
        <div className="absolute inset-0 flex items-center justify-center text-[#A4E32A] flex-col gap-4 animate-pulse z-20 bg-[#07100a]">
          <svg className="w-8 h-8 animate-spin" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="30 60" strokeLinecap="round" /></svg>
          <p className="text-sm font-medium tracking-widest uppercase">Поиск GPS...</p>
        </div>
      ) : null}

      <div id="qorgan-map" className="absolute inset-0 w-full h-full [&>div]:!h-full" style={{ filter: "brightness(0.9) contrast(1.1)" }} />

      <div className="absolute top-20 left-4 right-4 z-10 flex justify-between items-start pointer-events-none">
        <div>
          <p className="text-black/80 font-bold px-3 py-1 bg-amber-400 rounded-full text-xs tracking-widest uppercase mb-1 shadow-lg shadow-amber-400/20">{t("path")}</p>
          <h2 className="text-3xl text-amber-500 tracking-wider drop-shadow-md" style={{ fontFamily: "'Cormorant Garamond',serif", textShadow: "0 2px 10px rgba(0,0,0,0.8)" }}>Карта</h2>
        </div>

        <div className="pointer-events-auto flex flex-col items-end gap-2">
          {!is2GisLinked ? (
            <button onClick={() => setShowLoginModal(true)} className="bg-[#A4E32A]/90 hover:bg-[#A4E32A] text-black font-semibold text-xs px-4 py-2.5 rounded-xl shadow-[0_0_15px_rgba(164,227,42,0.3)] transition-all active:scale-95 flex items-center gap-2 border border-[#A4E32A]/50 backdrop-blur-md">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" /></svg>
              Войти в 2GIS
            </button>
          ) : (
            <button onClick={() => setShowProfile(!showProfile)} className="bg-black/50 backdrop-blur-md border border-[#A4E32A]/50 text-[#A4E32A] font-semibold text-xs py-1.5 pl-1.5 pr-4 rounded-full flex items-center gap-2 shadow-[0_0_15px_rgba(164,227,42,0.15)] active:scale-95 transition-all outline-none">
              <div className="w-8 h-8 bg-[#A4E32A] rounded-full flex items-center justify-center text-black">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
              </div>
              Структура
            </button>
          )}
        </div>
      </div>

      {/* Route popup */}
      {is2GisLinked && (
        <div className="absolute bottom-28 left-4 right-4 z-10 pointer-events-none animate-fade">
          <GlassCard className="p-3 pointer-events-auto shadow-[0_10px_30px_rgba(0,0,0,0.5)] bg-black/60 border-amber-400/20 backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-amber-400 text-sm font-semibold mb-0.5">Safe Haven (Укрытие)</h4>
                <p className="text-white/60 text-xs">Проверено Qorǵan x 2GIS • 750м</p>
              </div>
              <button onClick={handleRoute} disabled={isRouting} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${isRouting ? 'bg-white/20 text-white/50' : 'bg-amber-500 text-black shadow-lg shadow-amber-500/20 active:scale-95'}`}>
                {isRouting ? 'В пути' : 'Маршрут'}
              </button>
            </div>
          </GlassCard>
        </div>
      )}

      {/* 2GIS Extended Profile Drawer */}
      <div className={`absolute bottom-0 left-0 right-0 z-40 bg-[#121212] rounded-t-3xl border-t border-[#A4E32A]/30 transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${showProfile ? 'translate-y-0' : 'translate-y-full'}`} style={{ height: '70vh' }}>
        <div className="w-full flex justify-center py-3" onClick={() => setShowProfile(false)}>
          <div className="w-12 h-1.5 bg-white/20 rounded-full" />
        </div>
        <div className="px-6 py-2 overflow-y-auto h-full pb-32" style={{ scrollbarWidth: 'none' }}>
          <h3 className="text-2xl text-white font-bold mb-6 flex items-center gap-3">
            <svg className="text-[#A4E32A]" width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" /></svg>
            Мой 2GIS
          </h3>

          <div className="bg-white/5 rounded-2xl p-4 mb-4 border border-white/5">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 bg-gradient-to-tr from-[#A4E32A] to-amber-400 rounded-full flex items-center justify-center text-black font-bold text-xl">П</div>
              <div>
                <h4 className="text-white font-semibold text-lg">{phone || "Пользователь"}</h4>
                <p className="text-white/50 text-xs">Рейтинг безопасности: <span className="text-[#A4E32A]">Высокий</span></p>
              </div>
            </div>
          </div>

          <h4 className="text-white/40 text-xs font-bold uppercase tracking-widest mb-3 px-2 mt-6">Друзья на карте</h4>
          <div className="space-y-3 mb-6">
            <div className="bg-[#1a2315]/50 border border-[#A4E32A]/20 rounded-xl p-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-500/20 rounded-full border border-indigo-500/50 flex justify-center items-center text-indigo-400 font-bold">А</div>
                <div>
                  <p className="text-white text-sm font-medium">Айгерим</p>
                  <p className="text-[#A4E32A]/80 text-xs tracking-wide">Рядом • В сети</p>
                </div>
              </div>
              <button className="bg-white/10 p-2 rounded-full text-white active:scale-95"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10z" /></svg></button>
            </div>
            <div className="bg-[#1a2315]/50 border border-[#A4E32A]/20 rounded-xl p-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-rose-500/20 rounded-full border border-rose-500/50 flex justify-center items-center text-rose-400 font-bold">С</div>
                <div>
                  <p className="text-white text-sm font-medium">Сабина</p>
                  <p className="text-white/50 text-xs tracking-wide">850 м • Был(а) 10 м. назад</p>
                </div>
              </div>
              <button className="bg-white/10 p-2 rounded-full text-white active:scale-95"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10z" /></svg></button>
            </div>
            <button className="w-full text-center text-[#A4E32A] text-xs font-semibold py-3 border border-[#A4E32A]/20 rounded-xl bg-[#A4E32A]/5 mt-2 active:scale-95 transition-all">Добавить друзей...</button>
          </div>

          <h4 className="text-white/40 text-xs font-bold uppercase tracking-widest mb-3 px-2">Избранные места</h4>
          <div className="bg-white/5 rounded-2xl border border-white/5 p-2 overflow-hidden mb-6">
            <div className="p-2 flex items-center gap-3 border-b border-white/5 pb-3 mb-1">
              <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /></svg></div>
              <p className="text-white text-sm font-medium">Дом</p>
            </div>
            <div className="p-2 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400"><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path fillRule="evenodd" clipRule="evenodd" d="M12 18l-5.8 3.3l1.5-6.6L2.5 10l6.8-0.6L12 3.2L14.7 9.4L21.5 10l-5.2 4.7l1.5 6.6L12 18z" /></svg></div>
              <p className="text-white text-sm font-medium">Qorǵan Safe Space</p>
            </div>
          </div>
        </div>
      </div>

      {/* Login Modal Overlay */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-fade pointer-events-auto">
          <GlassCard className="w-full max-w-sm p-7 bg-[#121212]/95 border-[#A4E32A]/30 relative shadow-[0_20px_50px_rgba(164,227,42,0.1)]">
            <button onClick={() => setShowLoginModal(false)} className="absolute top-4 right-4 text-white/50 hover:text-white pb-1 px-2 text-2xl">×</button>
            <div className="flex flex-col items-center justify-center gap-2 mb-8 mt-2">
              <div className="w-14 h-14 rounded-2xl bg-[#A4E32A]/10 flex items-center justify-center text-[#A4E32A] mb-2 border border-[#A4E32A]/20">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" /></svg>
              </div>
              <h3 className="text-2xl font-bold tracking-wide text-white">2GIS ID</h3>
              <p className="text-white/40 text-xs text-center">Единый аккаунт для карт и экосистемы безопасности</p>
            </div>

            <form onSubmit={handleLoginSubmit} className="space-y-6">
              {loginStep === 1 ? (
                <div className="animate-fade">
                  <label className="block text-white/60 text-xs mb-2 ml-1 uppercase tracking-widest font-semibold">Телефон или Email</label>
                  <input autoFocus type="text" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+7 (___) ___-__-__" className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white placeholder-white/20 outline-none focus:border-[#A4E32A]/50 transition-colors shadow-inner" />
                  <button type="submit" disabled={phone.length < 4} className="w-full bg-[#A4E32A] text-black font-bold text-[15px] py-4 rounded-2xl disabled:opacity-50 active:scale-95 transition-all mt-6">Получить код</button>
                </div>
              ) : (
                <div className="animate-fade">
                  <label className="block text-white/60 text-xs mb-2 ml-1 uppercase tracking-widest font-semibold">Код подтверждения из SMS</label>
                  <input autoFocus type="text" value={code} onChange={e => setCode(e.target.value)} placeholder="0000" className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white placeholder-white/20 outline-none focus:border-[#A4E32A]/50 tracking-[1em] text-center text-2xl transition-colors font-mono shadow-inner" />
                  <button type="submit" disabled={code.length < 4} className="w-full bg-[#A4E32A] text-black font-bold text-[15px] py-4 rounded-2xl disabled:opacity-50 active:scale-95 transition-all mt-6 shadow-[0_0_20px_rgba(164,227,42,0.3)]">Войти в экосистему</button>
                </div>
              )}
            </form>
          </GlassCard>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// AI SHIELD SCREEN (MOCKED API FOR LOCAL FUNCTIONALITY)
// ═══════════════════════════════════════════════════════════
function AIShieldScreen() {
  const { t, language } = useLang();
  const [messages, setMessages] = useState<any[]>([
    {
      id: 1, text: language === "kk"
        ? "Сәлем! Мен Самрұқ, сенің қорғаушыңмын. Бүгін сені қалай қорғай аламын?"
        : language === "en"
          ? "Hello! I'm Samruk, your AI guardian. How can I protect you today?"
          : "Сәлем! Я — Самрұқ, твой защитник. Как могу помочь тебе сегодня?",
      sender: "ai", time: new Date()
    }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef<any>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, isTyping]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || isTyping) return;
    setMessages(p => [...p, { id: Date.now(), text, sender: "user", time: new Date() }]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      let reply = "";
      const lower = text.toLowerCase();
      if (language === "kk") {
        if (lower.includes("көмек") || lower.includes("sos") || lower.includes("қауіп")) {
          reply = "Мен сізге көмектесуге дайынмын. Жедел байланысқа (112) хабарласып немесе сенімді контактілеріңізге геолокация жіберейін бе?";
        } else if (lower.includes("маршрут") || lower.includes("жол")) {
          reply = "Қазір сіздің орналасқан жеріңізге ең қауіпсіз әрі жарық маршрутты іздеп жатырмын. Картаға өтіп бақылай аласыз.";
        } else {
          reply = "Түсіндім. Мен үнемі қасыңыздамын. Қауіп сезсеңіз, бірден маған жазыңыз.";
        }
      } else if (language === "en") {
        if (lower.includes("help") || lower.includes("sos") || lower.includes("danger")) {
          reply = "I am ready to help. Should I call emergency services (112) or send your location to your trusted contacts?";
        } else if (lower.includes("route") || lower.includes("path")) {
          reply = "I am finding the safest and most well-lit route for you right now. You can check the Map section.";
        } else {
          reply = "Understood. I am always by your side. Let me know immediately if you feel unsafe.";
        }
      } else {
        if (lower.includes("помощ") || lower.includes("sos") || lower.includes("опасн")) {
          reply = "Я готов помочь. Связаться со службой спасения (112) или отправить локацию доверенным контактам?";
        } else if (lower.includes("маршрут") || lower.includes("пут")) {
          reply = "Я подбираю для вас самый безопасный и освещенный маршрут. Можете открыть карту для просмотра.";
        } else {
          reply = "Понял вас. Я всегда рядом. Пишите сразу, если почувствуете угрозу.";
        }
      }
      setMessages(p => [...p, { id: Date.now() + 1, text: reply, sender: "ai", time: new Date() }]);
      setIsTyping(false);
    }, 1500);
  };

  const fmt = (d: Date) => d.getHours().toString().padStart(2, "0") + ":" + d.getMinutes().toString().padStart(2, "0");

  return (
    <div className="min-h-screen flex flex-col pt-20 pb-24 relative">
      <div className="absolute top-28 left-3 opacity-12 pointer-events-none"><KazakhOrnament variant="koshkar" size={50} /></div>
      <div className="px-5 mb-4 relative z-10">
        <h2 className="text-3xl tracking-[0.16em]" style={{ fontFamily: "'Cormorant Garamond',serif", color: "#C9A84C" }}>{t("aiShieldTitle")}</h2>
        <p className="text-white/55 text-sm">{t("samrukOnline")}</p>
        <KazakhOrnament variant="border" size={200} className="opacity-28" />
      </div>

      <div className="flex-1 mx-4 mb-3 overflow-y-auto relative z-10 scrollbar-none" style={{ maxHeight: "calc(100vh - 360px)" }}>
        <div className="space-y-3 pb-2">
          {messages.map(msg => (
            <div key={msg.id} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[82%] rounded-2xl p-3.5 relative overflow-hidden ${msg.sender === "user" ? "bg-amber-500/18 border border-amber-400/28" : "bg-white/8 border border-white/15"}`}>
                <p className="text-white/90 text-sm leading-relaxed relative z-10 whitespace-pre-wrap">{msg.text}</p>
                <p className="text-white/35 text-xs mt-1.5 relative z-10">{fmt(msg.time)}</p>
              </div>
            </div>
          ))}
          {isTyping && <div className="text-white/50 text-xs ml-4">Samruk is typing...</div>}
          <div ref={bottomRef} />
        </div>
      </div>

      <div className="mx-4 relative z-10">
        <GlassCard gold className="p-3 flex items-end gap-3 shadow-[0_0_20px_rgba(201,168,76,0.18)]">
          <textarea value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }} placeholder={t("typeMessage")} rows={1} className="flex-1 bg-transparent text-white placeholder-white/35 outline-none text-sm resize-none" style={{ maxHeight: "100px" }} />
          <button onClick={sendMessage} disabled={!input.trim() || isTyping} className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-700 flex items-center justify-center flex-shrink-0 transition-all active:scale-90 disabled:opacity-35"><svg className="w-5 h-5 text-stone-900" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M2 12H22M22 12L16 6M22 12L16 18" /></svg></button>
        </GlassCard>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// OTHER SCREENS & COMPONENTS
// ═══════════════════════════════════════════════════════════

function HiddenSOSScreen() {
  const { t } = useLang();
  const [active, setActive] = useState(false);
  const [progress, setProgress] = useState(0);
  const pressTimer = useRef<any>(null);

  const startSOS = () => {
    // Only works when holding
    pressTimer.current = setInterval(() => {
      setProgress(p => {
        if (p >= 100) { clearInterval(pressTimer.current); setActive(true); return 100; }
        return p + 5;
      });
    }, 100);
  };
  const cancelSOS = () => {
    clearInterval(pressTimer.current);
    if (!active) setProgress(0);
  };

  return (
    <div className="min-h-screen pt-20 pb-24 px-6 flex flex-col items-center justify-center">
      <div className="text-center mb-12">
        <h2 className="text-3xl text-white/60 font-light mb-2" style={{ fontFamily: "'Cormorant Garamond',serif" }}>{active ? t("sosActivated") : "Music Player"}</h2>
        <p className="text-white/40 text-sm">{active ? t("alertingSOS") : t("holdToActivate")}</p>
      </div>

      <div
        className={`relative w-64 h-64 rounded-full flex items-center justify-center transition-all duration-300 ${active ? 'bg-red-500/20 shadow-[0_0_50px_rgba(239,68,68,0.4)]' : 'bg-white/5'}`}
        onPointerDown={startSOS}
        onPointerUp={cancelSOS}
        onPointerLeave={cancelSOS}
        style={{ touchAction: 'none' }}
      >
        <svg className="absolute inset-0 w-full h-full -rotate-90">
          <circle cx="128" cy="128" r="120" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="4" />
          <circle cx="128" cy="128" r="120" fill="none" stroke={active ? "#ef4444" : "#C9A84C"} strokeWidth="4" strokeDasharray="754" strokeDashoffset={754 - (754 * progress) / 100} className="transition-all duration-100" />
        </svg>
        <div className={`w-48 h-48 rounded-full flex items-center justify-center ${active ? 'bg-red-500/40 animate-pulse' : 'bg-white/10'}`}>
          <svg className={`w-12 h-12 ${active ? 'text-white' : 'text-white/50'}`} viewBox="0 0 24 24" fill="currentColor">
            {active ? <path d="M12 2L1 21h22M12 6l7.5 13h-15M11 10h2v4h-2M11 16h2v2h-2" /> : <path d="M8 5v14l11-7z" />}
          </svg>
        </div>
      </div>
    </div>
  );
}

function RitualsScreen() {
  const { t } = useLang();
  return (
    <div className="min-h-screen pt-20 pb-24 px-6 relative">
      <div className="absolute top-20 right-5 opacity-10 pointer-events-none"><KazakhOrnament variant="umai" size={150} /></div>
      <h2 className="text-3xl tracking-[0.15em] mb-2" style={{ fontFamily: "'Cormorant Garamond',serif", color: "#C9A84C" }}>{t("ritualsTitle")}</h2>
      <p className="text-white/50 mb-8">{t("ritualsSubtitle")}</p>

      <div className="flex flex-col items-center mt-16 relative">
        <div className="w-48 h-48 rounded-full border border-amber-400/30 flex items-center justify-center relative animate-[pulse_4s_ease-in-out_infinite]">
          <div className="absolute inset-0 rounded-full bg-amber-400/10 scale-150 blur-xl" />
          <TumarSVG active={true} pulsing={false} />
        </div>
        <p className="text-amber-400 mt-12 text-xl tracking-widest uppercase">{t("breathIn")}</p>
      </div>
    </div>
  );
}

function SafetyTipsScreen() {
  const { t } = useLang();
  const tips = [
    { title: "Маршруты", desc: "Старайтесь избегать неосвещенных улиц и переулков в темное время суток." },
    { title: "Транспорт", desc: "Садясь в такси, сверяйте номера машины с приложением и отправляйте маршрут близким." },
    { title: "Внимание", desc: "Не слушайте музыку в обоих наушниках в безлюдных местах." },
    { title: "Помощь", desc: "Если вам кажется, что за вами следят, зайдите в ближайший оживленный магазин." }
  ];
  return (
    <div className="min-h-screen pt-20 pb-24 px-6">
      <h2 className="text-3xl tracking-[0.15em] mb-2" style={{ fontFamily: "'Cormorant Garamond',serif", color: "#C9A84C" }}>{t("safetyTitle")}</h2>
      <p className="text-white/50 mb-8">{t("safetySubtitle")}</p>
      <div className="space-y-4">
        {tips.map((tip, i) => (
          <GlassCard key={i} className="p-5">
            <h3 className="text-amber-300 text-lg mb-2">{tip.title}</h3>
            <p className="text-white/70 text-sm leading-relaxed">{tip.desc}</p>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}

function HealthPassportScreen() {
  const { t } = useLang();
  const { healthData } = useApp();
  return (
    <div className="min-h-screen pt-20 pb-24 px-6 relative">
      <div className="absolute top-40 left-10 opacity-5 pointer-events-none"><KazakhOrnament variant="geometric" size={180} /></div>
      <div className="flex justify-between items-end mb-8 relative z-10">
        <div>
          <h2 className="text-3xl tracking-[0.15em] mb-1" style={{ fontFamily: "'Cormorant Garamond',serif", color: "#C9A84C" }}>{t("healthTitle")}</h2>
          <p className="text-white/50">{t("editData")} <span>✎</span></p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 relative z-10">
        {Object.entries(healthData).map(([k, v]: any) => (
          <GlassCard key={k} className="p-4" onClick={() => { }}>
            <p className="text-white/40 text-xs mb-1 uppercase tracking-wider">{k}</p>
            <p className="text-white/90 text-lg">{v}</p>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}

function FitnessScreen() {
  const { t } = useLang();
  const exercises = [
    { name: "Қарапайым созылу - Базалық", time: "5 мин", cat: "Flexibility" },
    { name: "Таңертеңгілік сергек", time: "10 мин", cat: "Cardio" },
    { name: "Күштік жаттығу үй жағдайында", time: "15 мин", cat: "Strength" }
  ];
  return (
    <div className="min-h-screen pt-20 pb-24 px-6 relative">
      <h2 className="text-3xl tracking-[0.15em] mb-2" style={{ fontFamily: "'Cormorant Garamond',serif", color: "#C9A84C" }}>{t("fitnessTitle")}</h2>
      <p className="text-white/50 mb-8">Жаттығулар тізімі</p>

      <div className="space-y-4">
        {exercises.map((e, i) => (
          <GlassCard key={i} className="p-5 flex items-center justify-between group cursor-pointer hover:bg-white/10 transition-colors">
            <div>
              <p className="text-teal-400/70 text-xs tracking-wider mb-1 uppercase">{e.cat}</p>
              <h3 className="text-white/90 text-lg">{e.name}</h3>
              <p className="text-white/50 text-sm mt-1">{e.time}</p>
            </div>
            <button className="w-12 h-12 rounded-full border border-amber-400/30 flex items-center justify-center group-hover:bg-amber-400 group-hover:text-black text-amber-400 transition-all">
              <svg className="w-5 h-5 ml-1" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
            </button>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}

function BurgerMenu({ isOpen, onClose }: any) {
  const { language, setLanguage, t } = useLang();
  const { emergencyContacts } = useApp();
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/65 z-50 flex animate-fade">
      <div className="w-80 bg-[#1a0510] h-full p-5 relative border-r border-[#C9A84C]/20 shadow-[0_0_30px_rgba(201,168,76,0.15)] flex flex-col">
        <button onClick={onClose} className="absolute top-5 right-5 text-amber-400/50 hover:text-amber-400 text-4xl transition-colors">×</button>
        <h2 className="text-[#C9A84C] text-3xl tracking-[0.2em] mt-2 mb-8 text-center" style={{ fontFamily: "'Cormorant Garamond',serif" }}>QORǴAN</h2>

        <div className="space-y-6 flex-1 overflow-y-auto scrollbar-none pb-8">
          <div>
            <p className="text-white/40 text-xs tracking-widest uppercase mb-3">{t("language")}</p>
            <div className="flex gap-2">
              {["en", "ru", "kk"].map(l => (
                <button key={l} onClick={() => setLanguage(l as any)} className={`flex-1 py-2 rounded-lg text-sm transition-all ${language === l ? "bg-amber-400/20 text-amber-400 border border-amber-400/40" : "bg-white/5 text-white/60 border border-white/10 hover:bg-white/10"}`}>{l.toUpperCase()}</button>
              ))}
            </div>
          </div>

          <button onClick={() => window.location.href = "tel:112"} className="w-full py-4 rounded-xl relative overflow-hidden group active:scale-95 transition-all">
            <div className="absolute inset-0 bg-[#6B0F2B] peer" />
            <div className="absolute inset-0 bg-red-600/20 group-hover:bg-red-600/40 transition-colors" />
            <div className="relative z-10 flex items-center justify-center gap-2">
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" /></svg>
              <span className="text-white tracking-wider font-semibold">{t("emergency")}</span>
            </div>
          </button>

          <div>
            <p className="text-white/40 text-xs tracking-widest uppercase mb-3">{t("sosContacts")}</p>
            <div className="space-y-2">
              {emergencyContacts.map((c: any) => (
                <div key={c.id} className="bg-white/5 p-3 rounded-lg border border-white/10 flex justify-between items-center group">
                  <div><p className="text-white/90 text-sm">{c.name}</p><p className="text-white/40 text-xs">{c.phone}</p></div>
                  <button className="text-white/20 hover:text-red-400 group-hover:text-white/50 transition-colors"><svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg></button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="flex-1" onClick={onClose} />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// NAV ICONS
// ═══════════════════════════════════════════════════════════
const NAV_ICONS: any = {
  home: ({ active }: any) => <svg className={`w-6 h-6 ${active ? "text-amber-400" : "text-white/45"}`} viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8"><path d="M3 9L12 2L21 9V20H15V14H9V20H3V9Z" /></svg>,
  map: ({ active }: any) => <svg className={`w-6 h-6 ${active ? "text-amber-400" : "text-white/45"}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="3" fill={active ? "currentColor" : "none"} /></svg>,
  shield: ({ active }: any) => <svg className={`w-6 h-6 ${active ? "text-amber-400" : "text-white/45"}`} viewBox="0 0 24 24" fill={active ? "rgba(201,168,76,0.2)" : "none"} stroke="currentColor" strokeWidth="1.8"><path d="M12 2L3 7V13C3 18 7 21.4 12 22C17 21.4 21 18 21 13V7L12 2Z" /></svg>,
  sos: ({ active }: any) => <svg className={`w-6 h-6 ${active ? "text-amber-400" : "text-white/45"}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="9" /><path d="M9.09 9C9.09 7.5 10.27 6.5 12 6.5C13.73 6.5 14.91 7.5 14.91 9C14.91 10.5 14 11.2 12 12V12M12 16H12.01" /></svg>,
  rituals: ({ active }: any) => <svg className={`w-6 h-6 ${active ? "text-amber-400" : "text-white/45"}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 22C12 22 4 18 4 12V5L12 2L20 5V12C20 18 12 22 12 22Z" /><path d="M9 12L11 14L15 10" /></svg>,
  tips: ({ active }: any) => <svg className={`w-6 h-6 ${active ? "text-amber-400" : "text-white/45"}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20V22H6.5A2.5 2.5 0 0 1 4 19.5V4.5A2.5 2.5 0 0 1 6.5 2Z" /></svg>,
  health: ({ active }: any) => <svg className={`w-6 h-6 ${active ? "text-amber-400" : "text-white/45"}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M9 5H7C5.9 5 5 5.9 5 7V19C5 20.1 5.9 21 7 21H17C18.1 21 19 20.1 19 19V7C19 5.9 18.1 5 17 5H15M9 5C9 5.6 9.4 6 10 6H14C14.6 6 15 5.6 15 5C15 4.4 14.6 4 14 4H10C9.4 4 9 4.4 9 5ZM12 12V16M10 14H14" /></svg>,
  fitness: ({ active }: any) => <svg className={`w-6 h-6 ${active ? "text-amber-400" : "text-white/45"}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M6.5 6.5L17.5 17.5M6.5 6.5L4 9M6.5 6.5L9 4M17.5 17.5L20 15M17.5 17.5L15 20M8 16L4 20M16 8L20 4" /></svg>,
};


// ═══════════════════════════════════════════════════════════
// ROOT LAYOUT
// ═══════════════════════════════════════════════════════════
const SCREENS: any = { home: HomeScreen, map: Map, shield: AIShieldScreen, sos: HiddenSOSScreen, rituals: RitualsScreen, tips: SafetyTipsScreen, health: HealthPassportScreen, fitness: FitnessScreen };
const NAV = [{ id: "home", key: "home" }, { id: "map", key: "path" }, { id: "shield", key: "shield" }, { id: "sos", key: "sos" }, { id: "rituals", key: "rituals" }, { id: "tips", key: "tips" }, { id: "health", key: "health" }, { id: "fitness", key: "fitness" }];

function RootLayout() {
  const { t } = useLang();
  const [screen, setScreen] = useState("home");
  const [menuOpen, setMenuOpen] = useState(false);
  const [splash, setSplash] = useState(true);

  if (splash) return <SplashScreen onComplete={() => setSplash(false)} />;

  const ScreenComp = SCREENS[screen];

  return (
    <div className="relative min-h-screen overflow-hidden" style={{ background: "#1a0510" }}>
      <div className="fixed inset-0 pointer-events-none z-0 opacity-8"><svg className="w-full h-full"><defs><pattern id="bgp" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse"><path d="M50,10L60,30L80,30L65,45L70,65L50,50L30,65L35,45L20,30L40,30Z" fill="none" stroke="#C9A84C" strokeWidth="1" opacity="0.35" /></pattern></defs><rect width="100%" height="100%" fill="url(#bgp)" /></svg></div>
      <div className="fixed inset-0 pointer-events-none z-0" style={{ background: "radial-gradient(ellipse 110% 55% at 50% 0%,rgba(107,15,43,0.5) 0%,transparent 65%)" }} />
      <div className="fixed top-0 left-0 opacity-12 pointer-events-none z-0"><KazakhOrnament variant="koshkar" size={115} /></div>
      <div className="fixed top-0 right-0 opacity-12 pointer-events-none z-0"><KazakhOrnament variant="umai" size={115} /></div>
      <div className="fixed bottom-28 left-0 opacity-7 pointer-events-none z-0"><KazakhOrnament variant="geometric" size={95} /></div>
      <div className="fixed bottom-28 right-0 opacity-7 pointer-events-none z-0"><KazakhOrnament variant="geometric" size={95} /></div>

      <button onClick={() => setMenuOpen(true)} className="fixed top-5 left-5 z-40 w-12 h-12 rounded-xl backdrop-blur-xl bg-white/8 border border-amber-400/28 flex items-center justify-center hover:bg-white/14 hover:scale-105 transition-all shadow-[0_0_18px_rgba(201,168,76,0.25)]">
        <svg className="w-6 h-6 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M4 6H20M4 12H20M4 18H20" />
        </svg>
      </button>

      <BurgerMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />

      <div className="relative z-10 pb-24"><ScreenComp /></div>

      <nav className="fixed bottom-0 left-0 right-0 z-50">
        <div className="max-w-lg mx-auto px-4 pb-5">
          <div className="backdrop-blur-2xl rounded-3xl border border-amber-400/12 shadow-2xl relative overflow-hidden" style={{ background: "rgba(0,0,0,0.45)" }}>
            <div className="absolute inset-0 flex items-center justify-center opacity-4 pointer-events-none"><KazakhOrnament variant="border" size={500} /></div>
            <div className="flex items-center overflow-x-auto py-3 px-2 relative z-10 scrollbar-none">
              {NAV.map(item => {
                const Icon = NAV_ICONS[item.id];
                const active = screen === item.id;
                return (
                  <button key={item.id} onClick={() => setScreen(item.id)} className="flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all flex-shrink-0 min-w-[56px]">
                    <Icon active={active} />
                    <span className={`text-[9px] whitespace-nowrap tracking-wide transition-all ${active ? "text-amber-400 drop-shadow-[0_0_6px_rgba(201,168,76,0.8)]" : "text-white/40"}`}>{t(item.key)}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </nav>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=Rajdhani:wght@300;400;500;600&display=swap');
        * { font-family: 'Rajdhani', system-ui, sans-serif; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.55;transform:scale(1.1)} }
        @keyframes ringPulse { 0%{transform:scale(1);opacity:0.8} 100%{transform:scale(3);opacity:0} }
        @keyframes fade { from{opacity:0;transform:scale(0.88)} to{opacity:1;transform:scale(1)} }
        .animate-fade { animation: fade 0.35s ease-out; }
        .scrollbar-none { scrollbar-width:none; -ms-overflow-style:none; }
        .scrollbar-none::-webkit-scrollbar { display:none; }
      `}</style>
    </div>
  );
}

export default function App() {
  return <LangProvider><AppProvider><RootLayout /></AppProvider></LangProvider>;
}