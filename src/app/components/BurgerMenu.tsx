import { useState } from "react";
import { AnimatePresence } from "motion/react";
import * as motion from "motion/react-client";
import { X, Globe, Phone, Users, Bell, Volume2, Vibrate, LogOut, Plus, Trash2, Settings, ChevronRight } from "lucide-react";
import { useLanguage, Language } from "../contexts/LanguageContext";
import { useApp } from "../contexts/AppContext";
import { useAuth } from "../../contexts/AuthContext";
import { KazakhOrnament } from "./KazakhOrnament";
import { playUIClick, playSuccess } from "../services/soundService";

interface MenuProps {
  isOpen: boolean;
  onClose: () => void;
}

function OrnamentDivider({ color = "#C9A84C" }) {
  return (
    <svg width="100%" height="18" viewBox="0 0 260 18" className="opacity-45 my-1">
      <defs>
        <linearGradient id="divGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={color} stopOpacity="0" />
          <stop offset="50%" stopColor={color} stopOpacity="0.8" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d="M0 9 Q65 3 130 9 Q195 15 260 9" fill="none" stroke="url(#divGrad)" strokeWidth="1.4" />
      {[65, 130, 195].map((x, i) => (
        <path key={i} d={`M${x} 7 L${x + 3} 9 L${x} 11 L${x - 3} 9 Z`} fill={color} opacity="0.5" />
      ))}
    </svg>
  );
}

export function BurgerMenu({ isOpen, onClose }: MenuProps) {
  const { language, setLanguage, t } = useLanguage();
  const { settings, updateSettings, emergencyContacts, addContact, removeContact } = useApp();
  const { isAuthenticated, phone, user, logout } = useAuth();
  const [tab, setTab] = useState<"main" | "settings" | "contacts">("main");
  const [showAddContact, setShowAddContact] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newRelation, setNewRelation] = useState("");

  const langs: { code: Language; native: string; flag: string }[] = [
    { code: "ru", native: "Русский", flag: "🇷🇺" },
    { code: "kk", native: "Қазақша", flag: "🇰🇿" },
    { code: "en", native: "English", flag: "🇬🇧" },
  ];

  const handleAddContact = () => {
    if (!newName.trim() || !newPhone.trim()) return;
    addContact({ name: newName.trim(), phone: newPhone.trim(), relation: newRelation.trim() || "—" });
    playSuccess();
    setNewName(""); setNewPhone(""); setNewRelation("");
    setShowAddContact(false);
  };

  const handleLogout = () => {
    playUIClick();
    logout();
    onClose();
  };

  const tabs = [
    { id: "main" as const, label: t("menu"), icon: Globe },
    { id: "settings" as const, label: t("settings"), icon: Settings },
    { id: "contacts" as const, label: t("sosContacts"), icon: Users },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
          />

          {/* Side Panel */}
          <motion.div
            initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 200 }}
            className="fixed left-0 top-0 bottom-0 w-[88vw] max-w-[340px] z-50 flex flex-col overflow-hidden"
            style={{ background: "linear-gradient(170deg, #1a0510 0%, #0f030a 60%, #140520 100%)" }}
          >
            {/* Ornament background */}
            <div className="absolute inset-0 pointer-events-none opacity-5">
              <svg className="w-full h-full">
                <defs>
                  <pattern id="menu_pat" x="0" y="0" width="70" height="70" patternUnits="userSpaceOnUse">
                    <path d="M15 35Q10 27 5 24Q0 21 0 15" fill="none" stroke="#C9A84C" strokeWidth="1" opacity="0.6" />
                    <path d="M55 35Q60 27 65 24Q70 21 70 15" fill="none" stroke="#C9A84C" strokeWidth="1" opacity="0.6" />
                    <circle cx="35" cy="35" r="8" fill="none" stroke="#C9A84C" strokeWidth="0.7" opacity="0.5" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#menu_pat)" />
              </svg>
            </div>
            <div className="absolute top-0 right-0 opacity-10 pointer-events-none">
              <KazakhOrnament variant="koshkar" size={130} />
            </div>
            <div className="absolute bottom-16 left-0 opacity-8 pointer-events-none">
              <KazakhOrnament variant="umai" size={100} />
            </div>

            {/* ── HEADER ── */}
            <div className="relative z-10 p-5 border-b border-amber-400/15">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-2xl tracking-[0.18em]"
                  style={{ fontFamily: "'Cormorant Garamond', serif", color: "#C9A84C" }}>
                  QORǴAN
                </h2>
                <button onClick={onClose} className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all active:scale-95">
                  <X className="w-5 h-5 text-white/60" />
                </button>
              </div>

              {/* User profile card */}
              <div className="flex items-center gap-3 bg-white/5 rounded-xl p-3 border border-amber-400/15">
                <div className="w-11 h-11 rounded-full flex items-center justify-center font-bold text-black text-lg flex-shrink-0"
                  style={{ background: "linear-gradient(135deg, #FFD700, #C9A84C)" }}>
                  {user?.name ? user.name.charAt(0).toUpperCase() : phone ? phone.charAt(0) : "Q"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white/90 text-sm font-medium truncate">
                    {user?.name || phone || "Qorǵan User"}
                  </p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
                    <p className="text-teal-400/80 text-xs">
                      {language === "ru" ? "Под защитой"
                        : language === "kk" ? "Қорғаулы"
                        : "Protected"}
                    </p>
                  </div>
                </div>
                {isAuthenticated && (
                  <button onClick={handleLogout} className="text-white/25 hover:text-red-400 transition-colors p-1.5">
                    <LogOut className="w-4 h-4" />
                  </button>
                )}
              </div>

              <OrnamentDivider />
            </div>

            {/* ── TABS ── */}
            <div className="relative z-10 flex border-b border-white/8">
              {tabs.map(({ id, label, icon: Icon }) => (
                <button key={id} onClick={() => { setTab(id); playUIClick(); }}
                  className={`flex-1 py-3 flex flex-col items-center gap-1 text-xs transition-all ${
                    tab === id ? "text-amber-400 border-b-2 border-amber-400" : "text-white/40 hover:text-white/60"
                  }`}>
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              ))}
            </div>

            {/* ── CONTENT ── */}
            <div className="relative z-10 flex-1 overflow-y-auto p-5 space-y-3" style={{ scrollbarWidth: "none" }}>

              {/* MAIN TAB */}
              {tab === "main" && (
                <motion.div key="main" initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} className="space-y-3">
                  {/* Emergency call */}
                  <button onClick={() => window.location.href = "tel:112"}
                    className="w-full rounded-2xl p-4 flex items-center gap-4 transition-all active:scale-95 relative overflow-hidden"
                    style={{ background: "rgba(239,68,68,0.1)", border: "2px solid rgba(239,68,68,0.4)", boxShadow: "0 0 20px rgba(239,68,68,0.1)" }}>
                    <div className="w-12 h-12 rounded-xl bg-red-500/20 border border-red-500/40 flex items-center justify-center flex-shrink-0">
                      <Phone className="w-6 h-6 text-red-400" />
                    </div>
                    <div className="text-left">
                      <p className="text-white font-semibold">{t("emergency")}</p>
                      <p className="text-red-400/70 text-xs">112</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-red-400/50 ml-auto" />
                  </button>

                  <OrnamentDivider />

                  {/* Language selector */}
                  <div className="rounded-2xl overflow-hidden" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                    <div className="flex items-center gap-2 px-4 pt-4 pb-2 mb-1">
                      <Globe className="w-4 h-4 text-amber-400" />
                      <h3 className="text-white/80 text-sm font-medium">{t("language")}</h3>
                    </div>
                    {langs.map(lang => (
                      <button key={lang.code} onClick={() => { setLanguage(lang.code); playUIClick(); }}
                        className={`w-full flex items-center justify-between px-4 py-3 transition-all ${
                          language === lang.code ? "bg-amber-400/10" : "hover:bg-white/5"
                        }`}>
                        <div className="flex items-center gap-3">
                          <span className="text-lg">{lang.flag}</span>
                          <span className={`text-sm ${language === lang.code ? "text-amber-400 font-medium" : "text-white/60"}`}>
                            {lang.native}
                          </span>
                        </div>
                        {language === lang.code && (
                          <div className="w-2 h-2 rounded-full bg-teal-400" />
                        )}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* SETTINGS TAB */}
              {tab === "settings" && (
                <motion.div key="settings" initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} className="space-y-3">
                  {[
                    { key: "notifications" as const, icon: Bell, labelKey: "notifications" },
                    { key: "soundEffects" as const, icon: Volume2, labelKey: "soundEffects" },
                    { key: "hapticFeedback" as const, icon: Vibrate, labelKey: "hapticFeedback" },
                  ].map(({ key, icon: Icon, labelKey }) => {
                    const on = settings[key];
                    return (
                      <div key={key} className="rounded-2xl p-4 flex items-center justify-between"
                        style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${on ? "bg-amber-400/15" : "bg-white/5"}`}>
                            <Icon className={`w-5 h-5 ${on ? "text-amber-400" : "text-white/40"}`} />
                          </div>
                          <span className="text-white/80 text-sm">{t(labelKey)}</span>
                        </div>
                        <button onClick={() => { updateSettings({ [key]: !on }); playUIClick(); }}
                          className={`relative w-12 h-7 rounded-full transition-all ${on ? "bg-teal-400" : "bg-white/15"}`}>
                          <motion.div animate={{ x: on ? 20 : 2 }}
                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                            className="absolute top-0.5 w-6 h-6 bg-white rounded-full shadow-md" />
                        </button>
                      </div>
                    );
                  })}
                </motion.div>
              )}

              {/* CONTACTS TAB */}
              {tab === "contacts" && (
                <motion.div key="contacts" initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} className="space-y-3">
                  <p className="text-white/40 text-xs uppercase tracking-widest">
                    {language === "ru" ? "Экстренные контакты"
                      : language === "kk" ? "Жедел контактілер"
                      : "Emergency contacts"}
                  </p>

                  {emergencyContacts.length === 0 && (
                    <div className="text-center py-8 rounded-2xl"
                      style={{ background: "rgba(255,255,255,0.03)", border: "1px dashed rgba(255,255,255,0.1)" }}>
                      <Users className="w-8 h-8 text-white/20 mx-auto mb-2" />
                      <p className="text-white/40 text-sm">{t("noContacts")}</p>
                    </div>
                  )}

                  {emergencyContacts.map(c => (
                    <div key={c.id} className="rounded-xl p-3 flex items-center gap-3"
                      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                      <div className="w-10 h-10 rounded-full bg-amber-400/15 border border-amber-400/25 flex items-center justify-center font-bold text-amber-400 flex-shrink-0">
                        {c.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white/90 text-sm font-medium truncate">{c.name}</p>
                        <p className="text-white/40 text-xs truncate">{c.phone} • {c.relation}</p>
                      </div>
                      <button onClick={() => removeContact(c.id)} className="text-white/20 hover:text-red-400 transition-colors p-1.5 active:scale-90">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}

                  {/* Add contact form / button */}
                  {!showAddContact ? (
                    <button onClick={() => { setShowAddContact(true); playUIClick(); }}
                      className="w-full py-3 rounded-xl flex items-center justify-center gap-2 text-sm transition-all active:scale-95"
                      style={{ background: "rgba(201,168,76,0.08)", border: "1px dashed rgba(201,168,76,0.35)", color: "#C9A84C" }}>
                      <Plus className="w-4 h-4" />
                      {t("addContact")}
                    </button>
                  ) : (
                    <div className="rounded-xl p-4 space-y-3"
                      style={{ background: "rgba(201,168,76,0.06)", border: "1px solid rgba(201,168,76,0.25)" }}>
                      <p className="text-amber-400 text-xs font-semibold uppercase tracking-widest">{t("addContact")}</p>
                      {[
                        { val: newName, set: setNewName, ph: t("contactName"), type: "text" },
                        { val: newPhone, set: setNewPhone, ph: t("contactPhone"), type: "tel" },
                        { val: newRelation, set: setNewRelation, ph: t("contactRelation"), type: "text" },
                      ].map((f, i) => (
                        <input key={i} type={f.type} value={f.val}
                          onChange={e => f.set(e.target.value)}
                          placeholder={f.ph}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-white/25 outline-none focus:border-amber-400/40 transition-colors" />
                      ))}
                      <div className="flex gap-2 pt-1">
                        <button onClick={() => setShowAddContact(false)}
                          className="flex-1 py-2.5 rounded-xl text-white/50 text-sm border border-white/10 active:scale-95 transition-all">
                          {t("cancel")}
                        </button>
                        <button onClick={handleAddContact}
                          disabled={!newName.trim() || !newPhone.trim()}
                          className="flex-1 py-2.5 rounded-xl text-black text-sm font-semibold disabled:opacity-40 active:scale-95 transition-all"
                          style={{ background: "linear-gradient(135deg, #FFD700, #C9A84C)" }}>
                          {t("save")}
                        </button>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </div>

            {/* ── FOOTER ── */}
            <div className="relative z-10 p-4 border-t border-white/8 flex justify-center">
              <KazakhOrnament variant="geometric" size={50} className="opacity-20" />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
