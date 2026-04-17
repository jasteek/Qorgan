import { useState } from "react";
import { useLanguage } from "../../contexts/LanguageContext";
import { playSuccess, playUIClick } from "../../services/soundService";
import { KazakhOrnament } from "../KazakhOrnament";

interface HealthData {
  age: string;
  height: string;
  weight: string;
  bloodType: string;
  sleepHours: string;
  waterIntake: string;
  exerciseFrequency: string;
  stressLevel: string;
}

const DEFAULT: HealthData = {
  age: "25", height: "165", weight: "58",
  bloodType: "A+", sleepHours: "7",
  waterIntake: "1.5", exerciseFrequency: "3",
  stressLevel: "medium",
};

function calcBMI(h: string, w: string): number | null {
  const hm = parseFloat(h) / 100;
  const wk = parseFloat(w);
  if (!hm || !wk || hm <= 0) return null;
  return Math.round((wk / (hm * hm)) * 10) / 10;
}

function bmiCategory(bmi: number, lang: string) {
  if (bmi < 18.5) return { label: lang === "ru" ? "Недостаточный вес" : lang === "kk" ? "Салмақ жеткіліксіз" : "Underweight", color: "#60a5fa" };
  if (bmi < 25)   return { label: lang === "ru" ? "Норма" : lang === "kk" ? "Норма" : "Normal", color: "#34d399" };
  if (bmi < 30)   return { label: lang === "ru" ? "Избыточный вес" : lang === "kk" ? "Артық салмақ" : "Overweight", color: "#fbbf24" };
  return { label: lang === "ru" ? "Ожирение" : lang === "kk" ? "Семіздік" : "Obese", color: "#f87171" };
}

export function HealthPassport() {
  const { language, t } = useLanguage();
  const [data, setData] = useState<HealthData>(() => {
    try {
      const saved = localStorage.getItem("qorgan_health");
      return saved ? JSON.parse(saved) : DEFAULT;
    } catch { return DEFAULT; }
  });
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<HealthData>(data);

  const bmi = calcBMI(data.height, data.weight);
  const bmiInfo = bmi ? bmiCategory(bmi, language) : null;

  const stressLabels: Record<string, Record<string, string>> = {
    low:    { ru: "Низкий", kk: "Төмен", en: "Low" },
    medium: { ru: "Средний", kk: "Орташа", en: "Medium" },
    high:   { ru: "Высокий", kk: "Жоғары", en: "High" },
  };

  const save = () => {
    setData(draft);
    localStorage.setItem("qorgan_health", JSON.stringify(draft));
    setEditing(false);
    playSuccess();
  };

  const cancelEdit = () => { setDraft(data); setEditing(false); playUIClick(); };

  const bloodTypes = ["A+","A−","B+","B−","AB+","AB−","O+","O−"];
  const stressOpts = ["low","medium","high"];

  const fields: { key: keyof HealthData; label: Record<string,string>; unit?: string; type?: "select"; opts?: string[] }[] = [
    { key: "age",       label: { ru: "Возраст", kk: "Жасы", en: "Age" }, unit: language === "ru" ? "лет" : language === "kk" ? "жыл" : "yrs" },
    { key: "height",    label: { ru: "Рост", kk: "Бойы", en: "Height" }, unit: "cm" },
    { key: "weight",    label: { ru: "Вес", kk: "Салмағы", en: "Weight" }, unit: "kg" },
    { key: "bloodType", label: { ru: "Группа крови", kk: "Қан тобы", en: "Blood type" }, type: "select", opts: bloodTypes },
    { key: "sleepHours",     label: { ru: "Сон", kk: "Ұйқы", en: "Sleep" }, unit: language === "ru" ? "ч" : "h" },
    { key: "waterIntake",    label: { ru: "Вода", kk: "Су", en: "Water" }, unit: "л" },
    { key: "exerciseFrequency", label: { ru: "Тренировки", kk: "Жаттығу", en: "Exercise" }, unit: language === "ru" ? "×/нед" : language === "kk" ? "×/апта" : "×/wk" },
    { key: "stressLevel", label: { ru: "Стресс", kk: "Стресс", en: "Stress" }, type: "select", opts: stressOpts },
  ];

  // Personalized recommendations
  const recs: string[] = [];
  const sl = parseFloat(data.sleepHours);
  const wi = parseFloat(data.waterIntake);
  const ex = parseFloat(data.exerciseFrequency);
  if (sl < 7) recs.push(language === "ru" ? "💤 Старайтесь спать 7-9 часов для восстановления" : language === "kk" ? "💤 Тәулігіне 7-9 сағат ұйықтауға тырысыңыз" : "💤 Aim for 7-9 hours of sleep for recovery");
  if (wi < 1.5) recs.push(language === "ru" ? "💧 Пейте не менее 1.5-2 литра воды в день" : language === "kk" ? "💧 Күніне кем дегенде 1.5-2 л су ішіңіз" : "💧 Drink at least 1.5-2 liters of water daily");
  if (ex < 3) recs.push(language === "ru" ? "🏃 Рекомендуется 3-5 тренировок в неделю" : language === "kk" ? "🏃 Аптасына 3-5 жаттығу ұсынылады" : "🏃 3-5 exercise sessions per week recommended");
  if (data.stressLevel === "high") recs.push(language === "ru" ? "🧘 Попробуйте breathing rituals для снятия стресса" : language === "kk" ? "🧘 Стрессті азайту үшін тыныс алу жаттығуларын қолданып көріңіз" : "🧘 Try breathing rituals to reduce stress");
  if (bmi && bmi > 25) recs.push(language === "ru" ? "🥗 Рекомендуется сбалансированное питание" : language === "kk" ? "🥗 Теңгерімді тамақтану ұсынылады" : "🥗 A balanced diet is recommended");

  return (
    <div className="min-h-screen pt-20 pb-28 px-5 relative" style={{ background: "linear-gradient(180deg,#0e1a12 0%,#060d08 100%)" }}>
      {/* Ornament BG */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.05]">
        <svg className="w-full h-full">
          <defs>
            <pattern id="hp_pat" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
              <path d="M15 40Q10 32 5 28Q0 24 0 17" fill="none" stroke="#40E0D0" strokeWidth="1" opacity="0.6"/>
              <path d="M65 40Q70 32 75 28Q80 24 80 17" fill="none" stroke="#40E0D0" strokeWidth="1" opacity="0.6"/>
              <circle cx="40" cy="40" r="8" fill="none" stroke="#40E0D0" strokeWidth="0.7" opacity="0.4"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#hp_pat)"/>
        </svg>
      </div>
      <div className="absolute top-40 right-3 opacity-[0.1] pointer-events-none">
        <KazakhOrnament variant="geometric" size={110}/>
      </div>

      {/* Header */}
      <div className="relative z-10 mb-6">
        <div className="flex items-end justify-between mb-1">
          <div>
            <h2 className="text-4xl font-light tracking-[0.12em]"
              style={{ fontFamily: "'Cormorant Garamond',serif", color: "#40E0D0" }}>
              {t("healthTitle")}
            </h2>
            <p className="text-white/45 text-sm">{t("healthSubtitle") || (language==="ru"?"Паспорт здоровья":language==="kk"?"Денсаулық паспорты":"Health Passport")}</p>
          </div>
          {!editing ? (
            <button onClick={() => { setDraft(data); setEditing(true); playUIClick(); }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all active:scale-95"
              style={{ background: "rgba(64,224,208,0.1)", border: "1px solid rgba(64,224,208,0.3)", color: "#40E0D0" }}>
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4z"/>
              </svg>
              {t("editData")}
            </button>
          ) : (
            <div className="flex gap-2">
              <button onClick={cancelEdit} className="px-3 py-2 rounded-xl text-sm text-white/50 border border-white/10 active:scale-95 transition-all">
                {t("cancel")}
              </button>
              <button onClick={save}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-black active:scale-95 transition-all"
                style={{ background: "linear-gradient(135deg,#40E0D0,#20B2AA)" }}>
                {t("saveData")}
              </button>
            </div>
          )}
        </div>
        {/* Teal ornament border */}
        <svg width="100%" height="18" viewBox="0 0 300 18" className="mt-2 opacity-40">
          <defs>
            <linearGradient id="hp_border" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#40E0D0" stopOpacity="0"/>
              <stop offset="50%" stopColor="#40E0D0" stopOpacity="0.8"/>
              <stop offset="100%" stopColor="#40E0D0" stopOpacity="0"/>
            </linearGradient>
          </defs>
          <path d="M0 9 Q75 3 150 9 Q225 15 300 9" fill="none" stroke="url(#hp_border)" strokeWidth="1.4"/>
        </svg>
      </div>

      {/* BMI Card */}
      {bmi && bmiInfo && (
        <div className="relative z-10 mb-5 rounded-2xl p-4 overflow-hidden"
          style={{ background: `${bmiInfo.color}12`, border: `1px solid ${bmiInfo.color}35` }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/50 text-xs uppercase tracking-widest mb-1">{t("bmiIndex") || "BMI"}</p>
              <p className="text-4xl font-light" style={{ color: bmiInfo.color }}>{bmi}</p>
            </div>
            <div className="text-right">
              <p className="font-semibold" style={{ color: bmiInfo.color }}>{bmiInfo.label}</p>
              <p className="text-white/40 text-xs mt-1">
                {language === "ru" ? "Норма: 18.5 — 24.9" : language === "kk" ? "Норма: 18.5 — 24.9" : "Normal: 18.5 — 24.9"}
              </p>
            </div>
          </div>
          {/* BMI bar */}
          <div className="mt-3 h-2 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all"
              style={{ width: `${Math.min((bmi / 40) * 100, 100)}%`, background: bmiInfo.color }}/>
          </div>
        </div>
      )}

      {/* Data fields grid */}
      <div className="relative z-10 grid grid-cols-2 gap-3 mb-5">
        {fields.map(field => {
          const label = field.label[language] || field.label.en;
          const val = editing ? draft[field.key] : data[field.key];

          return (
            <div key={field.key} className="rounded-2xl p-4"
              style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${editing ? "rgba(64,224,208,0.2)" : "rgba(255,255,255,0.08)"}` }}>
              <p className="text-white/40 text-[10px] uppercase tracking-widest mb-2">{label}</p>

              {editing ? (
                field.type === "select" ? (
                  <select
                    value={draft[field.key]}
                    onChange={e => setDraft(d => ({ ...d, [field.key]: e.target.value }))}
                    className="w-full bg-transparent text-teal-400 text-lg font-light outline-none"
                    style={{ fontFamily: "inherit" }}>
                    {(field.key === "bloodType" ? bloodTypes : stressOpts).map(o => (
                      <option key={o} value={o} style={{ background: "#0e1a12" }}>
                        {field.key === "stressLevel"
                          ? stressLabels[o][language] || stressLabels[o].en
                          : o}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={draft[field.key]}
                    onChange={e => setDraft(d => ({ ...d, [field.key]: e.target.value }))}
                    className="w-full bg-transparent text-teal-400 text-lg font-light outline-none border-b border-teal-400/30"
                    style={{ fontFamily: "inherit" }}/>
                )
              ) : (
                <div className="flex items-baseline gap-1">
                  <p className="text-white/90 text-xl font-light">
                    {field.key === "stressLevel"
                      ? stressLabels[val]?.[language] || stressLabels[val]?.en || val
                      : val}
                  </p>
                  {field.unit && <span className="text-white/35 text-xs">{field.unit}</span>}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Personalized recommendations */}
      {recs.length > 0 && (
        <div className="relative z-10">
          <p className="text-white/40 text-xs uppercase tracking-widest mb-3">
            {t("recommendations") || (language==="ru"?"Рекомендации":language==="kk"?"Ұсыныстар":"Recommendations")}
          </p>
          <div className="space-y-2">
            {recs.map((rec, i) => (
              <div key={i} className="rounded-xl px-4 py-3 flex items-start gap-3"
                style={{ background: "rgba(64,224,208,0.05)", border: "1px solid rgba(64,224,208,0.15)" }}>
                <p className="text-white/75 text-sm leading-relaxed">{rec}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
