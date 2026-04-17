import React, { createContext, useContext, useState } from "react";

export const translations = {
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

type Language = "en" | "ru" | "kk";

interface LangContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LangCtx = createContext<LangContextType | null>(null);

export function LangProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>("ru");
  
  const t = (key: string) => {
    return (translations[language] as any)[key] || key;
  };
  
  return (
    <LangCtx.Provider value={{ language, setLanguage, t }}>
      {children}
    </LangCtx.Provider>
  );
}

export function useLang() {
  const context = useContext(LangCtx);
  if (!context) throw new Error("useLang must be used within a LangProvider");
  return context;
}
