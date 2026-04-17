import React, { createContext, useContext, useState, useEffect } from "react";

export interface Contact {
  id: string;
  name: string;
  phone: string;
  relation: string;
}

interface AppContextType {
  isProtectionActive: boolean;
  toggleProtection: () => void;
  emergencyContacts: Contact[];
  addContact: (c: Omit<Contact, "id">) => void;
  removeContact: (id: string) => void;
  settings: {
    notifications: boolean;
    soundEffects: boolean;
    hapticFeedback: boolean;
  };
  updateSettings: (s: Partial<AppContextType["settings"]>) => void;
  healthData: any;
  setHealthData: (data: any) => void;
}

const AppCtx = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  // Try to load state from localStorage or use defaults
  const [isProtectionActive, setIsProtectionActive] = useState(() => {
    const saved = localStorage.getItem("qorgan_protection");
    return saved ? JSON.parse(saved) : true;
  });

  const [emergencyContacts, setEmergencyContacts] = useState<Contact[]>(() => {
    const saved = localStorage.getItem("qorgan_contacts");
    return saved ? JSON.parse(saved) : [];
  });

  const [settings, setSettings] = useState(() => {
    return { notifications: true, soundEffects: true, hapticFeedback: true };
  });

  const [healthData, setHealthData] = useState(() => {
    const saved = localStorage.getItem("qorgan_health");
    if (saved) return JSON.parse(saved);
    return { 
      age: "25", 
      height: "165", 
      weight: "58", 
      bloodType: "A+", 
      sleepHours: "7", 
      waterIntake: "2", 
      exerciseFrequency: "3 раза в неделю", 
      stressLevel: "Средний" 
    };
  });

  // Persist state changes
  useEffect(() => localStorage.setItem("qorgan_protection", JSON.stringify(isProtectionActive)), [isProtectionActive]);
  useEffect(() => localStorage.setItem("qorgan_contacts", JSON.stringify(emergencyContacts)), [emergencyContacts]);
  useEffect(() => localStorage.setItem("qorgan_health", JSON.stringify(healthData)), [healthData]);

  const toggleProtection = () => setIsProtectionActive((p: boolean) => !p);
  const addContact = (c: Omit<Contact, "id">) => {
    setEmergencyContacts((p: Contact[]) => [...p, { ...c, id: Date.now().toString() }]);
  };
  const removeContact = (id: string) => {
    setEmergencyContacts((p: Contact[]) => p.filter((c: Contact) => c.id !== id));
  };
  const updateSettings = (s: Partial<typeof settings>) => setSettings((p: typeof settings) => ({ ...p, ...s }));

  return (
    <AppCtx.Provider value={{ 
      isProtectionActive, toggleProtection, 
      emergencyContacts, addContact, removeContact, 
      settings, updateSettings, 
      healthData, setHealthData 
    }}>
      {children}
    </AppCtx.Provider>
  );
}

export function useApp() {
  const context = useContext(AppCtx);
  if (!context) throw new Error("useApp must be used within an AppProvider");
  return context;
}
