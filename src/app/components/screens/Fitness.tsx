import { motion, AnimatePresence } from "motion/react";
import { useState } from "react";
import { Play, Pause, CheckCircle, Timer, Flame } from "lucide-react";
import { KazakhOrnament } from "../KazakhOrnament";
import { useLanguage } from "../../contexts/LanguageContext";

interface Exercise {
  id: string;
  name: string;
  nameKz: string;
  duration: number; // in seconds
  description: string;
  benefits: string;
  difficulty: "easy" | "medium" | "hard";
  category: "strength" | "cardio" | "flexibility" | "balance";
}

type Category = "all" | "strength" | "cardio" | "flexibility" | "balance";

const getExercises = (lang: string): Exercise[] => [
  {
    id: "1",
    name: lang === "kk" ? "Тақта (Планка)" : lang === "en" ? "Plank" : "Планка",
    nameKz: "Тақта",
    duration: 30,
    description: lang === "kk" ? "Білекке сүйеніп тұрыңыз, денені тік ұстаңыз." : lang === "en" ? "Keep your body in a straight line resting on your forearms." : "Примите упор лежа на предплечьях, держите тело прямо, напрягите корпус.",
    benefits: lang === "kk" ? "Денені қатайтады, мүсінді түзейді" : lang === "en" ? "Strengthens core, improves posture" : "Укрепляет мышцы кора, улучшает осанку",
    difficulty: "medium", category: "strength",
  },
  {
    id: "2",
    name: lang === "kk" ? "Отырып-тұру" : lang === "en" ? "Squats" : "Приседания",
    nameKz: "Отыру",
    duration: 45,
    description: lang === "kk" ? "Аяқты иық деңгейінде ұстап, тізеңізді бүгіп отырыңыз." : lang === "en" ? "Stand with feet shoulder-width apart, lower your hips, and stand back up." : "Ноги на ширине плеч, присядьте до параллели с полом, вернитесь в исходное.",
    benefits: lang === "kk" ? "Аяқ пен бөксе бұлшықеттерін қатайтады" : lang === "en" ? "Strengthens legs and glutes, improves balance" : "Укрепляет ноги и ягодицы, улучшает баланс",
    difficulty: "easy", category: "strength",
  },
  {
    id: "3",
    name: lang === "kk" ? "Секіру" : lang === "en" ? "Jumping Jacks" : "Прыжки с разведением",
    nameKz: "Секіру",
    duration: 30,
    description: lang === "kk" ? "Қолды жоғары көтеріп, аяқты екі жаққа ашып секіріңіз." : lang === "en" ? "Jump while spreading your arms and legs, then return to starting position." : "Прыгайте, разводя ноги в стороны и поднимая руки над головой.",
    benefits: lang === "kk" ? "Кардио жаттығу, калория жағады" : lang === "en" ? "Cardio workout, burns calories" : "Кардио тренировка, сжигание калорий",
    difficulty: "medium", category: "cardio",
  },
  {
    id: "4",
    name: lang === "kk" ? "Алға қадам (Выпады)" : lang === "en" ? "Lunges" : "Выпады",
    nameKz: "Алға қадам",
    duration: 40,
    description: lang === "kk" ? "Бір аяқпен алға қадам жасап, тізеңізді еденге жақындатыңыз." : lang === "en" ? "Step forward with one leg and lower your hips until both knees are bent." : "Шагните вперед, опустите колено задней ноги к полу, вернитесь.",
    benefits: lang === "kk" ? "Аяқты қатайтады, координацияны жақсартады" : lang === "en" ? "Strengthens legs, improves coordination" : "Укрепляет ноги, улучшает координацию",
    difficulty: "medium", category: "strength",
  },
  {
    id: "5",
    name: lang === "kk" ? "Серіппе" : lang === "en" ? "Push-ups" : "Отжимания",
    nameKz: "Серіппе",
    duration: 30,
    description: lang === "kk" ? "Қолмен тіреліп, денені төмен түсіріп, қайта көтеріңіз." : lang === "en" ? "Lower your body until your chest is close to the floor, then push back up." : "Упор лежа, опустите тело к полу, отожмитесь вверх.",
    benefits: lang === "kk" ? "Кеуде, иық, трицепс бұлшықеттерін қатайтады" : lang === "en" ? "Strengthens chest, shoulders, and triceps" : "Укрепляет грудь, плечи, трицепсы",
    difficulty: "medium", category: "strength",
  },
  {
    id: "6",
    name: lang === "kk" ? "Көбелек" : lang === "en" ? "Butterfly Stretch" : "Растяжка бабочка",
    nameKz: "Көбелек",
    duration: 60,
    description: lang === "kk" ? "Отырып, табандарды біріктіріңіз және алға еңкейіңіз." : lang === "en" ? "Sit with the soles of your feet together and knees bent outward, lean forward." : "Сидя, соедините стопы, мягко наклонитесь вперед, растягивая бедра.",
    benefits: lang === "kk" ? "Санның ішкі жағын созады" : lang === "en" ? "Stretches inner thighs" : "Растяжка внутренней поверхности бедер",
    difficulty: "easy", category: "flexibility",
  },
  {
    id: "7",
    name: lang === "kk" ? "Бурпи" : lang === "en" ? "Burpees" : "Берпи",
    nameKz: "Бурпи",
    duration: 45,
    description: lang === "kk" ? "Отырыңыз, серіппе жасап секіріңіз және жоғарыда шапалақтаңыз." : lang === "en" ? "Drop to a squat, kick feet back, do a push-up, jump up with arms raised." : "Присядьте, упор лежа, отжимание, прыжок вверх с хлопком над головой.",
    benefits: lang === "kk" ? "Жоғары қарқынды, бүкіл денені шынықтырады" : lang === "en" ? "Full body workout, high intensity" : "Полная тренировка тела, высокая интенсивность",
    difficulty: "hard", category: "cardio",
  },
  {
    id: "8",
    name: lang === "kk" ? "Ағаш тұрысы" : lang === "en" ? "Tree Pose" : "Поза дерева",
    nameKz: "Ағаш",
    duration: 40,
    description: lang === "kk" ? "Бір аяқпен тұрып, екінші аяқтың табанын санға қойыңыз, қол жоғары." : lang === "en" ? "Stand on one leg, place the other foot on your inner thigh, hands up." : "Встаньте на одну ногу, стопу другой ноги прижмите к бедру, руки вверх.",
    benefits: lang === "kk" ? "Тепе-теңдік пен зейінді жақсартады" : lang === "en" ? "Improves balance and focus" : "Улучшает баланс и концентрацию",
    difficulty: "medium", category: "balance",
  },
  {
    id: "9",
    name: lang === "kk" ? "Велосипед" : lang === "en" ? "Bicycle Crunches" : "Велосипед",
    nameKz: "Велосипед",
    duration: 45,
    description: lang === "kk" ? "Арқада жатып, тізеңізді алма-кезек шынтақпен жанастырыңыз." : lang === "en" ? "Lie on your back, bring opposite elbow to opposite knee in a pedaling motion." : "Лежа на спине, имитируйте езду на велосипеде, касаясь локтями противоположных колен.",
    benefits: lang === "kk" ? "Іш бұлшықеттерін қатайтады" : lang === "en" ? "Strengthens abs and obliques" : "Укрепляет пресс, особенно косые мышцы",
    difficulty: "medium", category: "strength",
  },
  {
    id: "10",
    name: lang === "kk" ? "Мысық-сиыр" : lang === "en" ? "Cat-Cow Stretch" : "Поза кошки-коровы",
    nameKz: "Мысық-сиыр",
    duration: 60,
    description: lang === "kk" ? "Төрттағандап тұрып, арқаны кезекп-кезек дөңгелетіп және ішке тартыңыз." : lang === "en" ? "On hands and knees, alternate between arching and rounding your back." : "На четвереньках, чередуйте прогиб и округление спины с дыханием.",
    benefits: lang === "kk" ? "Омыртқаны созады, кернеуді басады" : lang === "en" ? "Stretches spine, relieves tension" : "Растяжка позвоночника, снятие напряжения",
    difficulty: "easy", category: "flexibility",
  },
];

export function Fitness() {
  const { language } = useLanguage();
  const exercises = getExercises(language);
  const [activeCategory, setActiveCategory] = useState<Category>("all");
  const [activeExercise, setActiveExercise] = useState<Exercise | null>(null);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [completedExercises, setCompletedExercises] = useState<Set<string>>(new Set());

  const filteredExercises =
    activeCategory === "all"
      ? exercises
      : exercises.filter((ex) => ex.category === activeCategory);

  const startExercise = (exercise: Exercise) => {
    setActiveExercise(exercise);
    setTimeRemaining(exercise.duration);
    setIsTimerRunning(false);
  };

  const toggleTimer = () => {
    if (isTimerRunning) {
      setIsTimerRunning(false);
    } else {
      setIsTimerRunning(true);
      const interval = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setIsTimerRunning(false);
            if (activeExercise) {
              setCompletedExercises((prev) => new Set([...prev, activeExercise.id]));
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  };

  const closeExercise = () => {
    setActiveExercise(null);
    setIsTimerRunning(false);
    setTimeRemaining(0);
  };

  const getDifficultyColor = (difficulty: Exercise["difficulty"]) => {
    switch (difficulty) {
      case "easy":
        return "#4ADE80";
      case "medium":
        return "#DAA520";
      case "hard":
        return "#8B0A1D";
    }
  };

  const getCategoryIcon = (category: Exercise["category"]) => {
    switch (category) {
      case "strength":
        return "💪";
      case "cardio":
        return "❤️";
      case "flexibility":
        return "🧘";
      case "balance":
        return "⚖️";
    }
  };

  const categories: { key: Category; label: string }[] = [
    { key: "all", label: language === "kk" ? "Барлығы" : language === "en" ? "All" : "Все" },
    { key: "strength", label: language === "kk" ? "Күш" : language === "en" ? "Strength" : "Сила" },
    { key: "cardio", label: language === "kk" ? "Кардио" : language === "en" ? "Cardio" : "Кардио" },
    { key: "flexibility", label: language === "kk" ? "Иілгіштік" : language === "en" ? "Flexibility" : "Гибкость" },
    { key: "balance", label: language === "kk" ? "Тепе-теңдік" : language === "en" ? "Balance" : "Баланс" },
  ];

  const completedCount = completedExercises.size;
  const totalExercises = exercises.length;
  const progressPercent = (completedCount / totalExercises) * 100;

  return (
    <div className="min-h-screen px-6 pt-8 pb-24">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 text-center relative"
      >
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <KazakhOrnament variant="koshkar" size={80} className="opacity-20" />
        </div>
        <h1 className="text-3xl font-light tracking-[0.15em] text-[#DAA520] mb-2 relative z-10">
          {language === "kk" ? "ЖАТТЫҒУ" : language === "en" ? "WORKOUT" : "ТРЕНИРОВКА"}
        </h1>
        <p className="text-white/70 text-sm tracking-wide">
          {language === "kk" ? "Фитнес жаттығулары" : language === "en" ? "Fitness Exercises" : "Фитнес упражнения"}
        </p>
        <KazakhOrnament variant="border" size={200} className="mt-4 mx-auto opacity-40" />
      </motion.div>

      {/* Progress Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 mb-6 relative overflow-hidden"
      >
        <div className="absolute top-2 right-2">
          <KazakhOrnament variant="umai" size={60} className="opacity-10" />
        </div>
        <div className="flex items-center justify-between mb-3 relative z-10">
          <div>
            <p className="text-white/60 text-xs mb-1">
              {language === "kk" ? "Бүгінгі прогресс" : language === "en" ? "Today's Progress" : "Прогресс сегодня"}
            </p>
            <p className="text-2xl text-white font-light">
              {completedCount} / {totalExercises}
            </p>
          </div>
          <div className="w-16 h-16 rounded-full bg-[#DAA520]/20 flex items-center justify-center">
            <Flame className="w-8 h-8 text-[#DAA520]" />
          </div>
        </div>
        <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden relative z-10">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.5 }}
            className="h-full bg-gradient-to-r from-[#DAA520] to-[#40E0D0]"
          />
        </div>
      </motion.div>

      {/* Category Filter */}
      <div className="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-hide">
        {categories.map((cat) => (
          <motion.button
            key={cat.key}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveCategory(cat.key)}
            className={`flex-shrink-0 px-4 py-2 rounded-xl border transition-all ${
              activeCategory === cat.key
                ? "bg-white/10 border-[#DAA520] text-[#DAA520]"
                : "bg-white/5 border-white/10 text-white/60 hover:border-white/20"
            }`}
          >
            <span className="text-sm">{cat.label}</span>
          </motion.button>
        ))}
      </div>

      {/* Exercise List */}
      <div className="grid gap-4">
        {filteredExercises.map((exercise, idx) => (
          <motion.button
            key={exercise.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            onClick={() => startExercise(exercise)}
            className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-5 hover:bg-white/10 transition-all text-left relative overflow-hidden group"
          >
            {completedExercises.has(exercise.id) && (
              <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-[#4ADE80]/20 flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-[#4ADE80]" />
              </div>
            )}

            <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-20 transition-opacity">
              <KazakhOrnament variant="geometric" size={50} />
            </div>

            <div className="flex items-start gap-4 relative z-10">
              <div className="text-3xl flex-shrink-0">{getCategoryIcon(exercise.category)}</div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-white font-medium">{exercise.name}</h3>
                </div>
                <p className="text-white/70 text-sm mb-2 line-clamp-2">
                  {exercise.description}
                </p>
                <div className="flex items-center gap-3 text-xs">
                  <div className="flex items-center gap-1">
                    <Timer className="w-3 h-3 text-[#40E0D0]" />
                    <span className="text-white/60">{exercise.duration}s</span>
                  </div>
                  <div
                    className="px-2 py-0.5 rounded-full"
                    style={{
                      backgroundColor: `${getDifficultyColor(exercise.difficulty)}20`,
                      color: getDifficultyColor(exercise.difficulty),
                    }}
                  >
                    {exercise.difficulty === "easy"
                      ? (language === "kk" ? "Оңай" : language === "en" ? "Easy" : "Легко")
                      : exercise.difficulty === "medium"
                      ? (language === "kk" ? "Орташа" : language === "en" ? "Medium" : "Средне")
                      : (language === "kk" ? "Қиын" : language === "en" ? "Hard" : "Сложно")}
                  </div>
                </div>
              </div>
            </div>
          </motion.button>
        ))}
      </div>

      {/* Exercise Modal */}
      <AnimatePresence>
        {activeExercise && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center px-6"
            onClick={closeExercise}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="backdrop-blur-xl bg-[#8B0A1D]/40 border border-[#DAA520]/30 rounded-3xl p-8 max-w-md w-full relative overflow-hidden"
            >
              {/* Background ornament */}
              <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
                <KazakhOrnament variant="umai" size={200} />
              </div>

              <div className="relative z-10">
                {/* Header */}
                <div className="text-center mb-6">
                  <div className="text-5xl mb-3">{getCategoryIcon(activeExercise.category)}</div>
                  <h2 className="text-2xl text-white mt-3">{activeExercise.name}</h2>
                </div>

                {/* Timer */}
                <div className="mb-6">
                  <div className="relative w-48 h-48 mx-auto">
                    <svg className="transform -rotate-90 w-48 h-48">
                      <circle
                        cx="96"
                        cy="96"
                        r="88"
                        stroke="rgba(255,255,255,0.1)"
                        strokeWidth="8"
                        fill="none"
                      />
                      <motion.circle
                        cx="96"
                        cy="96"
                        r="88"
                        stroke="#DAA520"
                        strokeWidth="8"
                        fill="none"
                        strokeLinecap="round"
                        style={{
                          pathLength: timeRemaining / activeExercise.duration,
                        }}
                        strokeDasharray="552.64"
                        strokeDashoffset={
                          552.64 * (1 - timeRemaining / activeExercise.duration)
                        }
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <p className="text-5xl text-white font-light">{timeRemaining}</p>
                        <p className="text-white/60 text-sm mt-1">
                          {language === "kk" ? "секунд" : language === "en" ? "seconds" : "секунд"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="mb-6 text-center">
                  <p className="text-white/80 text-sm leading-relaxed mb-3">
                    {activeExercise.description}
                  </p>
                  <p className="text-[#40E0D0] text-xs">{activeExercise.benefits}</p>
                </div>

                {/* Controls */}
                <div className="flex gap-3">
                  <button
                    onClick={toggleTimer}
                    disabled={timeRemaining === 0}
                    className="flex-1 bg-[#DAA520] hover:bg-[#DAA520]/80 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded-xl flex items-center justify-center gap-2 transition-all"
                  >
                    {isTimerRunning ? (
                      <>
                        <Pause className="w-5 h-5" />
                        <span>{language === "kk" ? "Пауза" : language === "en" ? "Pause" : "Пауза"}</span>
                      </>
                    ) : timeRemaining === 0 ? (
                      <>
                        <CheckCircle className="w-5 h-5" />
                        <span>{language === "kk" ? "Аяқталды" : language === "en" ? "Done" : "Завершено"}</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-5 h-5" />
                        <span>{language === "kk" ? "Бастау" : language === "en" ? "Start" : "Старт"}</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={closeExercise}
                    className="px-6 bg-white/10 hover:bg-white/20 text-white py-3 rounded-xl transition-all"
                  >
                    {language === "kk" ? "Жабу" : language === "en" ? "Close" : "Закрыть"}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer Ornament */}
      <div className="flex justify-center pt-8">
        <KazakhOrnament variant="geometric" size={80} className="opacity-30" />
      </div>
    </div>
  );
}
