import { useState } from "react";
import { useLanguage } from "../../contexts/LanguageContext";

interface Tip {
  icon: string;
  titleRu: string;
  titleKk: string;
  titleEn: string;
  descRu: string;
  descKk: string;
  descEn: string;
}

const CATEGORIES = [
  {
    id: "personal",
    iconRu: "🛡️",
    labelRu: "Личная безопасность",
    labelKk: "Жеке қауіпсіздік",
    labelEn: "Personal Safety",
    color: "#C9A84C",
    tips: [
      {
        icon: "🌙", titleRu: "Тёмные маршруты", titleKk: "Қараңғы жолдар", titleEn: "Dark Routes",
        descRu: "Избегайте неосвещённых улиц и переулков в тёмное время суток. Выбирайте оживлённые дороги.",
        descKk: "Қараңғы уақытта жарықсыз көшелер мен жол бастарынан аулақ болыңыз. Адамды жолдарды таңдаңыз.",
        descEn: "Avoid unlit streets and alleys at night. Choose well-populated roads when possible.",
      },
      {
        icon: "🚕", titleRu: "Безопасное такси", titleKk: "Қауіпсіз такси", titleEn: "Safe Taxi",
        descRu: "Всегда проверяйте номер машины в приложении. Отправляйте маршрут близкому человеку перед поездкой.",
        descKk: "Қолданбада машина нөмірін тексеріп, жолыңызды жақынынызға жіберіңіз.",
        descEn: "Always verify the car number in the app. Send your route to a trusted person before riding.",
      },
      {
        icon: "🎧", titleRu: "Оба наушника", titleKk: "Екі құлақаспаб", titleEn: "Both Earphones",
        descRu: "В безлюдных местах не слушайте музыку в обоих наушниках — это снижает ситуационную осведомлённость.",
        descKk: "Адамсыз жерлерде екі құлақаспапта музыка тыңдамаңыз — бұл жағдайды бақылауды азайтады.",
        descEn: "In quiet areas, don't use both earphones — it reduces your situational awareness.",
      },
    ] as Tip[],
  },
  {
    id: "mental",
    iconRu: "💚",
    labelRu: "Психологическая поддержка",
    labelKk: "Психологиялық қолдау",
    labelEn: "Mental Wellbeing",
    color: "#40E0D0",
    tips: [
      {
        icon: "🧘", titleRu: "Дыхательные техники", titleKk: "Тыныс алу техникалары", titleEn: "Breathing Techniques",
        descRu: "Практика 4-7-8: вдох на 4 сек, задержка на 7 сек, выдох на 8 сек. Снимает стресс за минуты.",
        descKk: "4-7-8 техникасы: 4 секунд дем алу, 7 секунд ұстау, 8 секунд дем шығару.",
        descEn: "The 4-7-8 technique: inhale 4 sec, hold 7 sec, exhale 8 sec. Relieves stress in minutes.",
      },
      {
        icon: "📞", titleRu: "Позвоните близким", titleKk: "Жақынынызға қоңырау шалыңыз", titleEn: "Call Someone",
        descRu: "Если вам плохо — позвоните другу или родственнику. Не оставайтесь в одиночестве с тяжёлыми мыслями.",
        descKk: "Жаман сезінсеңіз — досыңызға немесе туысыңызға қоңырау шалыңыз.",
        descEn: "If you feel overwhelmed, call a friend or family member. Don't stay alone with heavy thoughts.",
      },
      {
        icon: "✍️", titleRu: "Дневник эмоций", titleKk: "Эмоция күнделігі", titleEn: "Emotion Journal",
        descRu: "Записывайте свои чувства каждый день. Это помогает осознать и переработать трудные эмоции.",
        descKk: "Күн сайын сезімдеріңізді жазыңыз. Бұл қиын эмоцияларды осознауға және өңдеуге көмектеседі.",
        descEn: "Write down your feelings daily. This helps process and understand difficult emotions.",
      },
    ] as Tip[],
  },
  {
    id: "emergency",
    iconRu: "🚨",
    labelRu: "Экстренные ситуации",
    labelKk: "Төтенше жағдайлар",
    labelEn: "Emergency",
    color: "#ef4444",
    tips: [
      {
        icon: "🏪", titleRu: "Зайдите в магазин", titleKk: "Дүкенге кіріңіз", titleEn: "Enter a Store",
        descRu: "Если вам кажется, что за вами следят — зайдите в ближайший оживлённый магазин или кафе.",
        descKk: "Сізді қадағалап журген сияқты сезінсеңіз — жақын дүкенге немесе кафеге кіріңіз.",
        descEn: "If you think you're being followed, enter the nearest busy store or café.",
      },
      {
        icon: "📢", titleRu: "Кричите громко", titleKk: "Қатты айқайлаңыз", titleEn: "Shout Loudly",
        descRu: "При нападении — громко кричите «Пожар!» или «Помогите!». Это привлечёт внимание окружающих.",
        descKk: "Шабуыл кезінде «Өрт!» немесе «Көмек!» деп қатты айқайлаңыз.",
        descEn: "During an attack — shout 'Fire!' or 'Help!' loudly. This attracts bystander attention.",
      },
      {
        icon: "📍", titleRu: "Местоположение", titleKk: "Орналасқан жер", titleEn: "Location",
        descRu: "Всегда сообщайте близким, куда идёте и когда планируете вернуться.",
        descKk: "Қайда баратыныңызды және қашан оралатыныңызды жақындарыңызға хабарлаңыз.",
        descEn: "Always tell someone where you're going and when you plan to return.",
      },
    ] as Tip[],
  },
  {
    id: "fraud",
    iconRu: "🔐",
    labelRu: "Защита от мошенников",
    labelKk: "Алаяқтардан қорғану",
    labelEn: "Anti-Fraud",
    color: "#9B6BDF",
    tips: [
      {
        icon: "📱", titleRu: "Не давайте код", titleKk: "Кодты бермеңіз", titleEn: "Never Share Codes",
        descRu: "Никогда не сообщайте SMS-коды, пароли и данные карты по телефону — это всегда мошенники.",
        descKk: "Телефон арқылы SMS-кодтарды, парольдерді және карта деректерін ешқашан бермеңіз.",
        descEn: "Never share SMS codes, passwords or card details by phone — it's always a scam.",
      },
      {
        icon: "🤔", titleRu: "Проверяйте профили", titleKk: "Профильдерді тексеріңіз", titleEn: "Verify Profiles",
        descRu: "При знакомстве в интернете — проверяйте профиль собеседника. Не спешите с личными встречами.",
        descKk: "Интернетте танысу кезінде — сұхбаттасушының профилін тексеріп, жеке кездесуге асықпаңыз.",
        descEn: "When meeting people online, verify their profile. Don't rush into in-person meetings.",
      },
      {
        icon: "💰", titleRu: "Банковские звонки", titleKk: "Банк қоңыраулары", titleEn: "Bank Calls",
        descRu: "Настоящий банк никогда не спрашивает данные карты по телефону. Всегда перезванивайте на официальный номер.",
        descKk: "Шынайы банк ешқашан телефон арқылы карта деректерін сұрамайды.",
        descEn: "Real banks never ask for card details by phone. Always call back on the official number.",
      },
    ] as Tip[],
  },
];

export function SafetyTips() {
  const { language } = useLanguage();
  const [activeCat, setActiveCat] = useState(0);
  const [openTip, setOpenTip] = useState<number | null>(null);

  const cat = CATEGORIES[activeCat];

  const getLabel = (obj: any) =>
    language === "ru" ? obj.labelRu : language === "kk" ? obj.labelKk : obj.labelEn;

  const getTitle = (tip: Tip) =>
    language === "ru" ? tip.titleRu : language === "kk" ? tip.titleKk : tip.titleEn;

  const getDesc = (tip: Tip) =>
    language === "ru" ? tip.descRu : language === "kk" ? tip.descKk : tip.descEn;

  return (
    <div className="min-h-screen pt-20 pb-28 px-5 relative"
      style={{ background: "linear-gradient(180deg, #150310 0%, #0a0215 100%)" }}>

      {/* Ornament BG */}
      <div className="absolute inset-0 pointer-events-none opacity-4">
        <svg className="w-full h-full">
          <defs>
            <pattern id="tips_pat" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
              <path d="M15 40Q10 33 5 29Q0 25 0 19" fill="none" stroke="#C9A84C" strokeWidth="1" opacity="0.5" />
              <path d="M65 40Q70 33 75 29Q80 25 80 19" fill="none" stroke="#C9A84C" strokeWidth="1" opacity="0.5" />
              <circle cx="40" cy="40" r="9" fill="none" stroke="#C9A84C" strokeWidth="0.7" opacity="0.4" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#tips_pat)" />
        </svg>
      </div>

      {/* Header */}
      <div className="relative z-10 mb-6">
        <h2 className="text-4xl font-light tracking-[0.15em] mb-1"
          style={{ fontFamily: "'Cormorant Garamond', serif", color: "#C9A84C" }}>
          {language === "ru" ? "Поддержка" : language === "kk" ? "Қолдау" : "Support"}
        </h2>
        <p className="text-white/45 text-sm">
          {language === "ru" ? "Советы по безопасности"
            : language === "kk" ? "Қауіпсіздік кеңестері"
            : "Safety tips for you"}
        </p>
        {/* Ornament line */}
        <svg width="100%" height="20" viewBox="0 0 300 20" className="mt-2 opacity-50">
          <defs>
            <linearGradient id="tips_gr" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#C9A84C" stopOpacity="0" />
              <stop offset="50%" stopColor="#C9A84C" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#C9A84C" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d="M0 10 Q75 3 150 10 Q225 17 300 10" fill="none" stroke="url(#tips_gr)" strokeWidth="1.5" />
        </svg>
      </div>

      {/* Category tabs */}
      <div className="relative z-10 flex gap-2 overflow-x-auto scrollbar-none mb-6 pb-1">
        {CATEGORIES.map((c, i) => (
          <button key={c.id} onClick={() => { setActiveCat(i); setOpenTip(null); }}
            className="flex-shrink-0 flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium transition-all active:scale-95"
            style={{
              background: activeCat === i ? `${c.color}22` : "rgba(255,255,255,0.04)",
              border: `1px solid ${activeCat === i ? c.color + "55" : "rgba(255,255,255,0.08)"}`,
              color: activeCat === i ? c.color : "rgba(255,255,255,0.5)",
            }}>
            <span>{c.iconRu}</span>
            <span className="whitespace-nowrap">{getLabel(c)}</span>
          </button>
        ))}
      </div>

      {/* Tips list */}
      <div className="relative z-10 space-y-3">
        {cat.tips.map((tip, i) => (
          <div key={i}  
            className="rounded-2xl overflow-hidden cursor-pointer transition-all active:scale-[0.99]"
            style={{
              background: openTip === i ? `${cat.color}10` : "rgba(255,255,255,0.04)",
              border: `1px solid ${openTip === i ? cat.color + "40" : "rgba(255,255,255,0.08)"}`,
            }}
            onClick={() => setOpenTip(openTip === i ? null : i)}>

            {/* Tip header */}
            <div className="flex items-center gap-4 p-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                style={{ background: `${cat.color}18`, border: `1px solid ${cat.color}30` }}>
                {tip.icon}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold" style={{ color: openTip === i ? cat.color : "rgba(255,255,255,0.85)" }}>
                  {getTitle(tip)}
                </h3>
                {openTip !== i && (
                  <p className="text-white/40 text-xs mt-0.5 truncate">{getDesc(tip)}</p>
                )}
              </div>
              <div className="ml-2 flex-shrink-0 transition-transform duration-300"
                style={{ transform: openTip === i ? "rotate(180deg)" : "rotate(0deg)" }}>
                <svg className="w-4 h-4 text-white/30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </div>
            </div>

            {/* Expanded description */}
            {openTip === i && (
              <div className="px-4 pb-4">
                <div className="h-px w-full mb-3" style={{ background: `${cat.color}22` }} />
                <p className="text-white/70 text-sm leading-relaxed">{getDesc(tip)}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Emergency Banner */}
      <div className="relative z-10 mt-6">
        <button onClick={() => (window.location.href = "tel:112")}
          className="w-full rounded-2xl overflow-hidden relative active:scale-95 transition-all"
          style={{
            background: "linear-gradient(135deg, rgba(107,15,43,0.8), rgba(60,0,20,0.9))",
            border: "2px solid rgba(239,68,68,0.4)",
            boxShadow: "0 0 20px rgba(239,68,68,0.15)",
          }}>
          <div className="flex items-center gap-4 p-4">
            <div className="w-12 h-12 rounded-xl bg-red-500/20 border border-red-500/40 flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6z" />
              </svg>
            </div>
            <div className="text-left">
              <p className="text-white font-bold">
                {language === "ru" ? "Экстренный вызов 112"
                  : language === "kk" ? "Жедел қоңырау 112"
                  : "Emergency Call 112"}
              </p>
              <p className="text-red-300/70 text-xs mt-0.5">
                {language === "ru" ? "Полиция • Скорая • Пожарные"
                  : language === "kk" ? "Полиция • Жедел жәрдем • Өрт сөндіру"
                  : "Police • Ambulance • Fire"}
              </p>
            </div>
            <div className="ml-auto">
              <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.8)]" />
            </div>
          </div>
        </button>
      </div>
    </div>
  );
}
