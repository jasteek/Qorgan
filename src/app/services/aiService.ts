import { Language } from "../contexts/LanguageContext";

interface AIResponse {
  text: string;
  sentiment: "positive" | "neutral" | "concerned";
}

// AI responses in multiple languages
const responses: Record<Language, {
  greetings: string[];
  helpResponses: string[];
  safetyResponses: string[];
  supportResponses: string[];
  routeResponses: string[];
  emergency: string[];
  fallback: string[];
}> = {
  en: {
    greetings: [
      "Hello! I'm Samruk, your AI guardian. How can I protect you today?",
      "Sәlem! I'm here to ensure your safety. What do you need?",
      "Greetings! Your AI protector is ready. How may I assist you?",
    ],
    helpResponses: [
      "I'm here to help. Your safety is my top priority. Can you tell me more about your situation?",
      "I understand you need assistance. Are you in immediate danger? If yes, I can alert your emergency contacts.",
      "I'm listening. Please share what's concerning you, and I'll do everything I can to help.",
      "Your well-being matters to me. Let me know how I can support you right now.",
    ],
    safetyResponses: [
      "I'm glad you're safe! Remember, I'm always here if you need me.",
      "That's wonderful to hear! Your security is important. Stay aware of your surroundings.",
      "Excellent! If anything changes or you feel uncomfortable, don't hesitate to reach out.",
      "I'm here watching over you. You're doing great staying vigilant.",
    ],
    supportResponses: [
      "You're not alone. I'm here with you every step of the way.",
      "It's okay to feel worried. Let's work through this together.",
      "Remember to breathe. You're stronger than you think.",
      "I'm proud of you for reaching out. That takes courage.",
    ],
    routeResponses: [
      "Let me check the safest route for you. I'll look for well-lit areas with more people.",
      "I've analyzed your path. I recommend staying on main streets with good visibility.",
      "Your route looks safe. I'll continue monitoring your location. Stay alert!",
      "I suggest taking the route through the city center - it's more populated at this hour.",
    ],
    emergency: [
      "Emergency detected! I'm alerting your trusted contacts immediately.",
      "I'm sending your location to emergency services and your guardians right now.",
      "Help is on the way. Stay calm, I've notified everyone who can assist you.",
    ],
    fallback: [
      "I'm here to support you. Could you clarify what you need?",
      "I want to help you the best I can. Can you tell me more?",
      "I'm listening. Please share more details so I can assist you properly.",
    ],
  },
  ru: {
    greetings: [
      "Привет! Я Самрук, твой AI защитник. Как я могу защитить тебя сегодня?",
      "Сәлем! Я здесь, чтобы обеспечить твою безопасность. Что тебе нужно?",
      "Приветствую! Твой AI защитник готов. Чем могу помочь?",
    ],
    helpResponses: [
      "Я здесь, чтобы помочь. Твоя безопасность - мой главный приоритет. Можешь рассказать больше о своей ситуации?",
      "Я понимаю, тебе нужна помощь. Ты в непосредственной опасности? Если да, я могу оповестить твои экстренные контакты.",
      "Я слушаю. Пожалуйста, поделись тем, что тебя беспокоит, и я сделаю все возможное, чтобы помочь.",
      "Твое благополучие важно для меня. Дай мне знать, как я могу поддержать тебя прямо сейчас.",
    ],
    safetyResponses: [
      "Я рада, что ты в безопасности! Помни, я всегда рядом, если понадоблюсь.",
      "Замечательно слышать! Твоя безопасность важна. Будь внимательна к окружению.",
      "Отлично! Если что-то изменится или почувствуешь дискомфорт, не стесняйся обратиться.",
      "Я здесь и присматриваю за тобой. Ты молодец, что остаешься бдительной.",
    ],
    supportResponses: [
      "Ты не одна. Я с тобой на каждом шагу.",
      "Это нормально - чувствовать беспокойство. Давай справимся с этим вместе.",
      "Помни о дыхании. Ты сильнее, чем думаешь.",
      "Я горжусь тобой за то, что обратилась. Это требует смелости.",
    ],
    routeResponses: [
      "Позволь мне проверить самый безопасный маршрут для тебя. Я поищу хорошо освещенные места с большим количеством людей.",
      "Я проанализировала твой путь. Рекомендую оставаться на главных улицах с хорошей видимостью.",
      "Твой маршрут выглядит безопасным. Я продолжу отслеж��вать твое местоположение. Будь начеку!",
      "Я предлагаю пройти через центр города - там более людно в это время.",
    ],
    emergency: [
      "Обнаружена чрезвычайная ситуация! Немедленно оповещаю твои доверенные контакты.",
      "Отправляю твое местоположение в экстренные службы и твоим защитникам прямо сейчас.",
      "Помощь уже в пути. Сохраняй спокойствие, я уведомила всех, кто может помочь.",
    ],
    fallback: [
      "Я здесь, чтобы поддержать тебя. Можешь уточнить, что тебе нужно?",
      "Я хочу помочь тебе как можно лучше. Можешь рассказать подробнее?",
      "Я слушаю. Пожалуйста, поделись подробностями, чтобы я могла помочь должным образом.",
    ],
  },
  kk: {
    greetings: [
      "Сәлем! Мен Самұрық, сенің AI қорғаушыңмын. Бүгін сені қалай қорғай аламын?",
      "Сәлем! Мен сенің қауіпсіздігіңді қамтамасыз ету үшін мұндамын. Саған не керек?",
      "Сәлеметсіз бе! Сенің AI қорғаушың дайын. Қалай көмектесе аламын?",
    ],
    helpResponses: [
      "Мен көмектесу үшін мұндамын. Сенің қауіпсіздігің менің басты приоритетім. Жағдайың туралы көбірек айта аласың ба?",
      "Саған көмек керек екенін түсінемін. Тікелей қауіп бар ма? Егер иә болса, жедел контактілеріңе хабарлай аламын.",
      "Мен тыңдап тұрмын. Сені не алаңдатып тұрғанын айтшы, мен көмектесу үшін барлығын жасаймын.",
      "Сенің әл-ауқатың маған маңызды. Қазір сені қалай қолдай алатынымды айтшы.",
    ],
    safetyResponses: [
      "Сен қауіпсіз екеніңе қуаныштымын! Есіңде болсын, егер керек болса мен әрқашан мұндамын.",
      "Бұл тамаша! Сенің қауіпсіздігің маңызды. Айналаңа назар аударып отыр.",
      "Керемет! Егер бірдеме өзгерсе немесе ыңғайсыз сезінсең, хабарласудан тартынба.",
      "Мен мұнда сені бақылап отырмын. Сақ болуың өте жақсы.",
    ],
    supportResponses: [
      "Сен жалғыз емессің. Мен сенімен әр қадамда.",
      "Алаңдау қалыпты. Келіңіз, бұны бірге шешейік.",
      "Тыныс алуды ұмытпа. Сен ойлағаннан әлдеқайда күштісің.",
      "Хабарласқаның үшін мақтанамын. Бұл батылдықты талап етеді.",
    ],
    routeResponses: [
      "Саған ең қауіпсіз жолды тексеруге рұқсат ет. Мен көп адамдары бар жарық жерлерді іздеймін.",
      "Жолыңды талдадым. Жақсы көрінісі бар негізгі көшелерде қалуды ұсынамын.",
      "Жолың қауіпсіз көрінеді. Орныңды бақылауды жалғастырамын. Сақ бол!",
      "Қала орталығы арқылы өтуді ұсынамын - бұл уақытта көп адам жүреді.",
    ],
    emergency: [
      "Төтенше жағдай анықталды! Сенімді контактілеріңе дереу хабарлап жатырмын.",
      "Орныңды жедел қызметтерге және қорғаушыларыңа қазір жіберіп жатырмын.",
      "Көмек жолда. Сабырлы бол, көмектесе алатын барлығына хабарладым.",
    ],
    fallback: [
      "Мен сені қолдау үшін мұндамын. Не керек екенін нақтылай аласың ба?",
      "Саған барынша жақсы көмектескім келеді. Толығырақ айта аласың ба?",
      "Мен тыңдап тұрмын. Дұрыс көмектесу үшін толығырақ айтшы.",
    ],
  },
};

// Sentiment analysis keywords
const keywords = {
  help: ["help", "помощь", "помогите", "көмек", "көмектесіңіз", "need help", "керек"],
  danger: ["danger", "опасность", "қауіп", "scared", "боюсь", "қорқамын", "emergency", "чп"],
  safe: ["safe", "безопасн", "қауіпсіз", "okay", "ok", "хорошо", "жақсы"],
  route: ["route", "way", "path", "маршрут", "путь", "дорога", "жол"],
  support: ["support", "alone", "scared", "поддержка", "одна", "страшно", "қолдау", "жалғыз"],
};

function detectIntent(message: string): string {
  const lowerMessage = message.toLowerCase();
  
  if (keywords.help.some(kw => lowerMessage.includes(kw)) || 
      keywords.danger.some(kw => lowerMessage.includes(kw))) {
    return "help";
  }
  
  if (keywords.safe.some(kw => lowerMessage.includes(kw))) {
    return "safety";
  }
  
  if (keywords.route.some(kw => lowerMessage.includes(kw))) {
    return "route";
  }
  
  if (keywords.support.some(kw => lowerMessage.includes(kw))) {
    return "support";
  }
  
  return "fallback";
}

function getRandomResponse(arr: string[]): string {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function getAIResponse(message: string, language: Language): AIResponse {
  const intent = detectIntent(message);
  const langResponses = responses[language];
  
  let text: string;
  let sentiment: AIResponse["sentiment"] = "neutral";
  
  switch (intent) {
    case "help":
      text = getRandomResponse(langResponses.helpResponses);
      sentiment = "concerned";
      break;
    case "safety":
      text = getRandomResponse(langResponses.safetyResponses);
      sentiment = "positive";
      break;
    case "route":
      text = getRandomResponse(langResponses.routeResponses);
      sentiment = "neutral";
      break;
    case "support":
      text = getRandomResponse(langResponses.supportResponses);
      sentiment = "positive";
      break;
    default:
      text = getRandomResponse(langResponses.fallback);
      sentiment = "neutral";
  }
  
  return { text, sentiment };
}

export function getGreeting(language: Language): string {
  return getRandomResponse(responses[language].greetings);
}
