import { useState, useRef, useEffect } from "react";
import { Send } from "lucide-react";
import { KazakhOrnament } from "../KazakhOrnament";
import { useLanguage } from "../../contexts/LanguageContext";
import { useAuth } from "../../../contexts/AuthContext";
import { playNotification, playUIClick } from "../../services/soundService";

type Message = {
  id: number;
  text: string;
  sender: "user" | "ai";
  time: Date;
};

const SYSTEM_PROMPT = `Ты — Самрұқ (Samruk), AI-ассистент по безопасности в приложении Qorǵan, предназначенном для защиты женщин в Казахстане.

Твои задачи:
- Помогать пользователю в экстренных ситуациях (советовать обращаться по номеру 112, на карте отмечены ближайшие безопасные места).
- Предлагать безопасные маршруты (через функцию карты в приложении).
- Оказывать психологическую поддержку, давать советы по безопасности.
- Отвечать на вопросы о здоровье, фитнесе, правах женщин, юридической помощи в Казахстане.
- Если пользователь в опасности — немедленно предложить вызов 112 и отправку геолокации.

Ты всегда дружелюбный, заботливый и профессиональный. Отвечай на том языке, на котором пишет пользователь.`;

async function callAI(messages: { role: string; content: string }[], language: string): Promise<string> {
  // Call our backend proxy which handles the OpenAI API call server-side
  const res = await fetch("/api/ai/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages, language }),
  });

  if (!res.ok) {
    throw new Error(`Server error: ${res.status}`);
  }

  const data = await res.json();
  if (data.message === 'Ошибка ответа ИИ' || data.message === 'Ошибка обработки ответа ИИ') {
    throw new Error('AI API Error');
  }
  return data.message || "...";
}

// Offline fallback AI responses per language per topic
function getOfflineReply(input: string, lang: string): string {
  const low = input.toLowerCase();
  if (lang === "kk") {
    if (/көмек|sos|қауіп|жаман|қорқамын/.test(low))
      return "Мен сізге дереу көмектесуге дайынмын! 112 жедел қызметін шақырайын ба, әлде сенімді контактілеріңізге орналасқан жеріңізді жіберейін бе?";
    if (/маршрут|жол|бар/.test(low))
      return "Картада сізге ең қауіпсіз бағытты іздеп жатырмын. Жарық, адам көп жолдарды таңдаймын.";
    if (/қалай|жақсы|сал/.test(low))
      return "Мен сіздің жайыңызды білгім келеді. Бүгін қандай сезімдесіз?";
    return "Мен Самрұқ — сіздің AI қорғаушыңызмын. Кез-келген мезетте маған хабарласа аласыз.";
  } else if (lang === "en") {
    if (/yes|send|sure|please|do it/.test(low))
      return "Location safely transmitted to your emergency contacts. A covert signal has been sent.";
    if (/no|im fine|okay|safe/.test(low))
      return "I'm glad you're safe. I will keep standing by. Let me know if you need to use the map or SOS features.";
    if (/help|sos|danger|scared/.test(low))
      return "I'm ready to help you right away! Should I call emergency services (112) or send your location to your trusted contacts?";
    if (/route|path|go|walk/.test(low))
      return "I'm finding the safest route for you — well-lit streets with high footfall. Check the Map screen.";
    if (/hello|hi|hey/.test(low))
      return "Hello! I am Samruk, your Qorgan AI. How are you feeling today?";
    if (/how|feeling|okay/.test(low))
      return "I care about you. How are you feeling right now? I'm always here.";
    return "I hear you, and I am here for you 24/7. What do you need?";
  } else {
    if (/да|отправь|скинь|конечно|пожалуйста/.test(low))
      return "Геолокация успешно и безопасно отправлена вашим экстренным контактам. Я продолжаю следить за вашей безопасностью.";
    if (/нет|в порядке|безопасно|хорошо/.test(low))
      return "Я очень рада, что вы в безопасности. Буду на связи, если вдруг понадоблюсь!";
    if (/помощ|sos|опасн|страшн|боюсь/.test(low))
      return "Я готова помочь немедленно! Позвонить в экстренные службы (112) или отправить вашу геолокацию доверенным контактам?";
    if (/маршрут|путь|иду|пойти/.test(low))
      return "Ищу для вас самый безопасный маршрут — освещённые улицы с большим потоком людей. Откройте карту.";
    if (/привет|здравствуй|салем|сәлем/.test(low))
      return "Здравствуйте! Я Самрұқ — ваш надежный AI-охранник в Qorgan. Что я могу для вас сделать?";
    if (/как|хорошо|нормально|чувству/.test(low))
      return "Мне важно ваше самочувствие. В безопасности ли вы сейчас?";
    return "Я внимательно слушаю. Вы можете доверить мне свои переживания, я всегда на вашей стороне.";
  }
}

export function AIShield() {
  const { t, language } = useLanguage();
  const { phone } = useAuth();

  const greeting: Record<string, string> = {
    ru: "Сәлем! Я — Самрұқ, ваш AI-защитник. Как я могу помочь вам сегодня?",
    kk: "Сәлем! Мен — Самрұқ, сіздің AI қорғаушыңызмын. Бүгін сізге қалай көмектесе аламын?",
    en: "Sәlem! I am Samruk, your AI guardian. How can I protect you today?",
  };

  const [messages, setMessages] = useState<Message[]>([
    { id: 1, text: greeting[language] || greeting.ru, sender: "ai", time: new Date() }
  ]);
  const [chatHistory, setChatHistory] = useState<{ role: string; content: string }[]>([]);

  // Reset chat when language changes so Gemini doesn't get confused by old history in a different language
  useEffect(() => {
    setMessages([{ id: Date.now(), text: greeting[language] || greeting.ru, sender: "ai", time: new Date() }]);
    setChatHistory([]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const quickActions = [
    { ru: "Нужна помощь", kk: "Көмек керек", en: "I need help" },
    { ru: "Я в безопасности", kk: "Мен қауіпсізбін", en: "I'm safe" },
    { ru: "Проверь маршрут", kk: "Маршрутты тексер", en: "Check my route" },
  ];

  const send = async () => {
    const text = input.trim();
    if (!text || isTyping) return;
    playUIClick();
    setMessages(prev => [...prev, { id: Date.now(), text, sender: "user", time: new Date() }]);
    setInput("");
    setIsTyping(true);

    const newHistory = [...chatHistory, { role: "user", content: text }];
    setChatHistory(newHistory);

    try {
      const reply = await callAI(newHistory, language);
      setMessages(prev => [...prev, { id: Date.now() + 1, text: reply, sender: "ai", time: new Date() }]);
      setChatHistory(prev => [...prev, { role: "assistant", content: reply }]);
      playNotification();
    } catch (err) {
      console.warn("OpenAI failed, using offline fallback:", err);
      const reply = getOfflineReply(text, language);
      setMessages(prev => [...prev, { id: Date.now() + 1, text: reply, sender: "ai", time: new Date() }]);
      setChatHistory(prev => [...prev, { role: "assistant", content: reply }]);
      playNotification();
    } finally {
      setIsTyping(false);
    }
  };

  const fmt = (d: Date) => d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="min-h-screen flex flex-col pt-20 pb-28 relative" style={{ background: "linear-gradient(180deg,#130418 0%,#0b0215 100%)" }}>
      {/* BG ornaments */}
      <div className="absolute top-28 left-3 opacity-[0.12] pointer-events-none">
        <KazakhOrnament variant="koshkar" size={55} />
      </div>
      <div className="absolute top-40 right-3 opacity-[0.12] pointer-events-none">
        <KazakhOrnament variant="geometric" size={55} />
      </div>

      {/* Diagonal ornament pattern */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.04]">
        <svg className="w-full h-full">
          <defs>
            <pattern id="ai_pat" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
              <path d="M15 40Q10 32 5 28Q0 24 0 17" fill="none" stroke="#C9A84C" strokeWidth="1" opacity="0.6"/>
              <path d="M65 40Q70 32 75 28Q80 24 80 17" fill="none" stroke="#C9A84C" strokeWidth="1" opacity="0.6"/>
              <circle cx="40" cy="40" r="8" fill="none" stroke="#C9A84C" strokeWidth="0.7" opacity="0.4"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#ai_pat)"/>
        </svg>
      </div>

      {/* Header */}
      <div className="px-5 mb-4 relative z-10">
        <div className="flex items-center gap-4 mb-3">
          {/* Samruk eagle icon */}
          <div className="relative">
            <svg width="52" height="52" viewBox="0 0 60 60" className="drop-shadow-[0_0_12px_rgba(218,165,32,0.8)]">
              <defs>
                <linearGradient id="eagle_g" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FFD700"/><stop offset="100%" stopColor="#C9A84C"/>
                </linearGradient>
              </defs>
              <path d="M10 30Q15 20 25 15Q30 10 35 12Q38 14 40 18L42 25Q40 30 35 32Q30 28 25 30Q20 32 15 35Q12 33 10 30Z"
                fill="url(#eagle_g)" stroke="#DAA520" strokeWidth="1.2"/>
              <path d="M35 32L40 40M30 32L33 42M25 33L26 43" stroke="#DAA520" strokeWidth="1.8" strokeLinecap="round"/>
              <circle cx="38" cy="14" r="2" fill="#DAA520"/>
            </svg>
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-teal-400 border-2 border-[#130418] animate-pulse"/>
          </div>
          <div>
            <h2 className="text-3xl font-light tracking-[0.12em]"
              style={{ fontFamily: "'Cormorant Garamond', serif", color: "#C9A84C" }}>
              {t("aiShieldTitle")}
            </h2>
            <p className="text-teal-400/80 text-xs flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-400 inline-block"/>
              {t("samrukOnline")}
            </p>
          </div>
        </div>
        {/* Ornament border */}
        <svg width="100%" height="18" viewBox="0 0 300 18" className="opacity-40">
          <defs>
            <linearGradient id="ai_border" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#C9A84C" stopOpacity="0"/>
              <stop offset="50%" stopColor="#C9A84C" stopOpacity="0.8"/>
              <stop offset="100%" stopColor="#C9A84C" stopOpacity="0"/>
            </linearGradient>
          </defs>
          <path d="M0 9 Q75 3 150 9 Q225 15 300 9" fill="none" stroke="url(#ai_border)" strokeWidth="1.4"/>
          {[75,150,225].map((x,i)=>(
            <path key={i} d={`M${x} 7 L${x+3} 9 L${x} 11 L${x-3} 9 Z`} fill="#C9A84C" opacity="0.5"/>
          ))}
        </svg>
      </div>

      {/* Messages area */}
      <div className="flex-1 mx-4 overflow-y-auto relative z-10 space-y-3 pb-2" style={{ scrollbarWidth: "none" }}>
        {messages.map(msg => (
          <div key={msg.id} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
            {msg.sender === "ai" && (
              <div className="w-7 h-7 rounded-full bg-amber-400/15 border border-amber-400/30 flex items-center justify-center text-sm mr-2 flex-shrink-0 mt-1">
                🦅
              </div>
            )}
            <div className={`max-w-[80%] rounded-2xl p-3.5 relative ${
              msg.sender === "user"
                ? "bg-amber-500/15 border border-amber-400/25 rounded-tr-sm"
                : "bg-white/8 border border-white/12 rounded-tl-sm"
            }`}>
              {msg.sender === "ai" && (
                <p className="text-amber-400/70 text-[10px] font-bold tracking-widest mb-1.5 uppercase">SAMRUK</p>
              )}
              <p className="text-white/90 text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
              <p className="text-white/30 text-[10px] mt-1.5 text-right">{fmt(msg.time)}</p>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex items-center gap-2 ml-12">
            <div className="flex gap-1 bg-white/8 border border-white/12 rounded-xl px-3 py-2.5">
              {[0,1,2].map(i => (
                <div key={i} className="w-1.5 h-1.5 rounded-full bg-amber-400/60 animate-bounce"
                  style={{ animationDelay: `${i * 0.15}s` }}/>
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef}/>
      </div>

      {/* Quick action chips */}
      <div className="px-4 mb-3 relative z-10">
        <div className="flex gap-2 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
          {quickActions.map((a, i) => {
            const label = language === "kk" ? a.kk : language === "en" ? a.en : a.ru;
            return (
              <button key={i} onClick={() => { setInput(label); playUIClick(); }}
                className="flex-shrink-0 px-3 py-1.5 rounded-xl text-xs text-white/60 transition-all active:scale-95 hover:text-white/80"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Input */}
      <div className="mx-4 relative z-10">
        <div className="flex items-end gap-2 rounded-2xl p-3"
          style={{ background: "rgba(201,168,76,0.06)", border: "1px solid rgba(201,168,76,0.22)", backdropFilter: "blur(16px)" }}>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }}}
            placeholder={t("typeMessage")}
            rows={1}
            className="flex-1 bg-transparent text-white text-sm placeholder-white/30 outline-none resize-none"
            style={{ maxHeight: 80 }}/>
          <button onClick={send} disabled={!input.trim() || isTyping}
            className="w-10 h-10 rounded-xl flex items-center justify-center transition-all active:scale-90 disabled:opacity-30 flex-shrink-0"
            style={{ background: "linear-gradient(135deg, #C9A84C, #DAA520)" }}>
            <Send className="w-4 h-4 text-black"/>
          </button>
        </div>
      </div>
    </div>
  );
}