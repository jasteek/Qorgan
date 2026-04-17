import React, { createContext, useContext, useState, useEffect } from "react";

export type Language = "en" | "ru" | "kk";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Translation dictionary
const translations: Record<Language, Record<string, string>> = {
  en: {
    // Navigation
    home: "Home",
    path: "Path",
    shield: "Shield",
    sos: "SOS",
    rituals: "Rituals",
    tips: "Tips",
    health: "Health",
    fitness: "Fitness",
    
    // Home screen
    underProtection: "Under Protection",
    active: "ACTIVE",
    inactive: "INACTIVE",
    safeZones: "Safe Zones",
    guardians: "Guardians",
    daysSafe: "Days Safe",
    activateProtection: "Activate Protection",
    deactivateProtection: "Deactivate Protection",
    
    // Menu
    menu: "Menu",
    settings: "Settings",
    language: "Language",
    emergency: "Emergency Call 112",
    sosContacts: "SOS Contacts",
    manageContacts: "Manage Emergency Contacts",
    
    // AI Shield
    aiShieldTitle: "AI Shield",
    samrukOnline: "Samruk is online",
    typeMessage: "Type your message...",
    needHelp: "I need help",
    imSafe: "I'm safe",
    checkRoute: "Check route",
    aiGreeting: "Sәlem! I am Samruk, your AI guardian. How can I protect you today?",
    
    // Safety Tips
    safetyTitle: "Support",
    safetySubtitle: "Safety tips for you",
    personalSafety: "Personal Safety",
    mentalWellbeing: "Mental Wellbeing",
    emergencySituations: "Emergency Situations",
    supportResources: "Support & Resources",
    
    // Health Passport
    healthTitle: "Health",
    healthSubtitle: "Health Passport",
    editData: "Edit Data",
    saveData: "Save",
    basicInfo: "Basic Information",
    age: "Age (years)",
    bloodType: "Blood Type",
    height: "Height (cm)",
    weight: "Weight (kg)",
    lifestyle: "Lifestyle",
    sleepHours: "Sleep (hours per day)",
    waterIntake: "Water (liters per day)",
    exerciseFrequency: "Physical Activity",
    stressLevel: "Stress Level",
    bmiIndex: "Body Mass Index (BMI)",
    recommendations: "Personalized Recommendations",
    
    // Fitness
    fitnessTitle: "Exercise",
    fitnessSubtitle: "Fitness exercises",
    progressToday: "Progress today",
    all: "All",
    strength: "Strength",
    cardio: "Cardio",
    flexibility: "Flexibility",
    balance: "Balance",
    seconds: "seconds",
    easy: "Easy",
    medium: "Medium",
    hard: "Hard",
    start: "Start",
    pause: "Pause",
    completed: "Completed",
    close: "Close",
    
    // Map
    mapTitle: "Nomad Path",
    mapSubtitle: "Safe navigation",
    searchPlaces: "Search places in Almaty...",
    safeHavens: "Safe Havens",
    nearYou: "Near You",
    
    // SOS
    sosTitle: "Hidden SOS",
    sosSubtitle: "Press and hold for 3 seconds",
    holdToActivate: "Hold to activate SOS",
    sosActivated: "SOS Activated!",
    alertingSOS: "Alerting your emergency contacts...",
    
    // Rituals
    ritualsTitle: "Rituals",
    ritualsSubtitle: "Breathing exercises",
    breathIn: "Breathe In",
    hold: "Hold",
    breathOut: "Breathe Out",
    
    // Settings
    notifications: "Notifications",
    soundEffects: "Sound Effects",
    hapticFeedback: "Haptic Feedback",
    darkMode: "Dark Mode",
    
    // Contacts
    addContact: "Add Contact",
    contactName: "Contact Name",
    contactPhone: "Phone Number",
    contactRelation: "Relation",
    save: "Save",
    cancel: "Cancel",
    noContacts: "No emergency contacts yet",
    addFirstContact: "Add your first emergency contact",
  },
  ru: {
    // Navigation
    home: "Главная",
    path: "Путь",
    shield: "Щит",
    sos: "SOS",
    rituals: "Ритуалы",
    tips: "Советы",
    health: "Здоровье",
    fitness: "Фитнес",
    
    // Home screen
    underProtection: "Под защитой",
    active: "АКТИВНО",
    inactive: "НЕАКТИВНО",
    safeZones: "Безопасные зоны",
    guardians: "Защитники",
    daysSafe: "Дней в безопасности",
    activateProtection: "Активировать защиту",
    deactivateProtection: "Деактивировать защиту",
    
    // Menu
    menu: "Меню",
    settings: "Настройки",
    language: "Язык",
    emergency: "Экстренный вызов 112",
    sosContacts: "SOS Контакты",
    manageContacts: "Управление экстренными контактами",
    
    // AI Shield
    aiShieldTitle: "AI Щит",
    samrukOnline: "Самрук онлайн",
    typeMessage: "Введите сообщение...",
    needHelp: "Мне нужна помощь",
    imSafe: "Я в безопасности",
    checkRoute: "Проверить маршрут",
    aiGreeting: "Сәлем! Я Самрук, твой AI защитник. Как я могу защитить тебя сегодня?",
    
    // Safety Tips
    safetyTitle: "Поддержка",
    safetySubtitle: "Советы для твоей безопасности",
    personalSafety: "Личная безопасность",
    mentalWellbeing: "Психологическое благополучие",
    emergencySituations: "Экстренные ситуации",
    supportResources: "Поддержка и ресурсы",
    
    // Health Passport
    healthTitle: "Здоровье",
    healthSubtitle: "Паспорт здоровья",
    editData: "Редактировать данные",
    saveData: "Сохранить",
    basicInfo: "Основная информация",
    age: "Возраст (лет)",
    bloodType: "Группа крови",
    height: "Рост (см)",
    weight: "Вес (кг)",
    lifestyle: "Образ жизни",
    sleepHours: "Сон (часов в сутки)",
    waterIntake: "Вода (литров в день)",
    exerciseFrequency: "Физическая активность",
    stressLevel: "Уровень стресса",
    bmiIndex: "Индекс массы тела (ИМТ)",
    recommendations: "Персональные рекомендации",
    
    // Fitness
    fitnessTitle: "Упражнения",
    fitnessSubtitle: "Фитнес упражнения",
    progressToday: "Прогресс сегодня",
    all: "Все",
    strength: "Сила",
    cardio: "Кардио",
    flexibility: "Гибкость",
    balance: "Баланс",
    seconds: "секунд",
    easy: "Легко",
    medium: "Средне",
    hard: "Сложно",
    start: "Старт",
    pause: "Пауза",
    completed: "Завершено",
    close: "Закрыть",
    
    // Map
    mapTitle: "Путь кочевника",
    mapSubtitle: "Безопасная навигация",
    searchPlaces: "Поиск мест в Алматы...",
    safeHavens: "Безопасные убежища",
    nearYou: "Рядом с вами",
    
    // SOS
    sosTitle: "Скрытый SOS",
    sosSubtitle: "Удерживайте 3 секунды",
    holdToActivate: "Удерживайте для активации SOS",
    sosActivated: "SOS Активирован!",
    alertingSOS: "Оповещение экстренных контактов...",
    
    // Rituals
    ritualsTitle: "Ритуалы",
    ritualsSubtitle: "Дыхательные упражнения",
    breathIn: "Вдох",
    hold: "Задержка",
    breathOut: "Выдох",
    
    // Settings
    notifications: "Уведомления",
    soundEffects: "Звуковые эффекты",
    hapticFeedback: "Тактильная обратная связь",
    darkMode: "Темный режим",
    
    // Contacts
    addContact: "Добавить контакт",
    contactName: "Имя контакта",
    contactPhone: "Номер телефона",
    contactRelation: "Родство",
    save: "Сохранить",
    cancel: "Отмена",
    noContacts: "Нет экстренных контактов",
    addFirstContact: "Добавьте первый экстренный контакт",
  },
  kk: {
    // Navigation
    home: "Басты",
    path: "Жол",
    shield: "Қалқан",
    sos: "SOS",
    rituals: "Рәсімдер",
    tips: "Кеңестер",
    health: "Денсаулық",
    fitness: "Фитнес",
    
    // Home screen
    underProtection: "Қорғаныста",
    active: "БЕЛСЕНДІ",
    inactive: "БЕЛСЕНДІ ЕМЕС",
    safeZones: "Қауіпсіз аймақтар",
    guardians: "Қорғаушылар",
    daysSafe: "Қауіпсіз күндер",
    activateProtection: "Қорғанысты қосу",
    deactivateProtection: "Қорғанысты өшіру",
    
    // Menu
    menu: "Мәзір",
    settings: "Баптаулар",
    language: "Тіл",
    emergency: "Жедел қоңырау 112",
    sosContacts: "SOS Контактілер",
    manageContacts: "Жедел контактілерді басқару",
    
    // AI Shield
    aiShieldTitle: "AI Қалқан",
    samrukOnline: "Самұрық желіде",
    typeMessage: "Хабарламаңызды жазыңыз...",
    needHelp: "Маған көмек керек",
    imSafe: "Мен қауіпсізбін",
    checkRoute: "Маршрутты тексеру",
    aiGreeting: "Сәлем! Мен Самұрық, сенің AI қорғаушыңмын. Бүгін сені қалай қорғай аламын?",
    
    // Safety Tips
    safetyTitle: "Қолдау",
    safetySubtitle: "Сенің қауіпсіздігің үшін кеңестер",
    personalSafety: "Жеке қауіпсіздік",
    mentalWellbeing: "Психологиялық әл-ауқат",
    emergencySituations: "Төтенше жағдайлар",
    supportResources: "Қолдау және ресурстар",
    
    // Health Passport
    healthTitle: "Денсаулық",
    healthSubtitle: "Денсаулық паспорты",
    editData: "Деректерді өңдеу",
    saveData: "Сақтау",
    basicInfo: "Негізгі ақпарат",
    age: "Жасы (жыл)",
    bloodType: "Қан тобы",
    height: "Бойы (см)",
    weight: "Салмағы (кг)",
    lifestyle: "Өмір салты",
    sleepHours: "Ұйқы (сағат)",
    waterIntake: "Су (литр)",
    exerciseFrequency: "Дене белсенділігі",
    stressLevel: "Стресс деңгейі",
    bmiIndex: "Дене салмағы индексі (ДСИ)",
    recommendations: "Жеке ұсыныстар",
    
    // Fitness
    fitnessTitle: "Жаттығулар",
    fitnessSubtitle: "Фитнес жаттығулары",
    progressToday: "Бүгінгі прогресс",
    all: "Барлығы",
    strength: "Күш",
    cardio: "Кардио",
    flexibility: "Иілгіштік",
    balance: "Тепе-теңдік",
    seconds: "секунд",
    easy: "Оңай",
    medium: "Орташа",
    hard: "Қиын",
    start: "Бастау",
    pause: "Тоқтату",
    completed: "Аяқталды",
    close: "Жабу",
    
    // Map
    mapTitle: "Көшпенділер жолы",
    mapSubtitle: "Қауіпсіз навигация",
    searchPlaces: "Алматыда орындарды іздеу...",
    safeHavens: "Қауіпсіз жерлер",
    nearYou: "Сізге жақын",
    
    // SOS
    sosTitle: "Жасырын SOS",
    sosSubtitle: "3 секунд басып тұрыңыз",
    holdToActivate: "SOS белсендіру үшін басып тұрыңыз",
    sosActivated: "SOS Белсендірілді!",
    alertingSOS: "Жедел контактілерге хабарлау...",
    
    // Rituals
    ritualsTitle: "Рәсімдер",
    ritualsSubtitle: "Тыныс алу жаттығулары",
    breathIn: "Дем алу",
    hold: "Ұстау",
    breathOut: "Дем шығару",
    
    // Settings
    notifications: "Хабарландырулар",
    soundEffects: "Дыбыстық эффектілер",
    hapticFeedback: "Тактильді кері байланыс",
    darkMode: "Қараңғы режим",
    
    // Contacts
    addContact: "Контакт қосу",
    contactName: "Контакт аты",
    contactPhone: "Телефон номері",
    contactRelation: "Туыстығы",
    save: "Сақтау",
    cancel: "Болдырмау",
    noContacts: "Жедел контактілер жоқ",
    addFirstContact: "Бірінші жедел контактіңізді қосыңыз",
  },
};

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem("qorgan_language");
    return (saved as Language) || "ru";
  });

  useEffect(() => {
    localStorage.setItem("qorgan_language", language);
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return context;
}
