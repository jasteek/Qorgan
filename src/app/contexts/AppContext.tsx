import React, { createContext, useContext, useState, useEffect } from "react";

export interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  relation: string;
}

interface AppContextType {
  isProtectionActive: boolean;
  toggleProtection: () => void;
  emergencyContacts: EmergencyContact[];
  addContact: (contact: Omit<EmergencyContact, "id">) => void;
  removeContact: (id: string) => void;
  settings: {
    notifications: boolean;
    soundEffects: boolean;
    hapticFeedback: boolean;
  };
  updateSettings: (settings: Partial<AppContextType["settings"]>) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [isProtectionActive, setIsProtectionActive] = useState(() => {
    const saved = localStorage.getItem("qorgan_protection_active");
    return saved ? JSON.parse(saved) : true;
  });

  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>(() => {
    const saved = localStorage.getItem("qorgan_emergency_contacts");
    return saved ? JSON.parse(saved) : [];
  });

  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem("qorgan_settings");
    return saved
      ? JSON.parse(saved)
      : {
          notifications: true,
          soundEffects: true,
          hapticFeedback: true,
        };
  });

  useEffect(() => {
    localStorage.setItem("qorgan_protection_active", JSON.stringify(isProtectionActive));
  }, [isProtectionActive]);

  useEffect(() => {
    localStorage.setItem("qorgan_emergency_contacts", JSON.stringify(emergencyContacts));
  }, [emergencyContacts]);

  useEffect(() => {
    localStorage.setItem("qorgan_settings", JSON.stringify(settings));
  }, [settings]);

  const toggleProtection = () => {
    setIsProtectionActive((prev: boolean) => !prev);
    // Play sound if enabled
    if (settings.soundEffects) {
      const audio = new Audio("data:audio/wav;base64,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");
      audio.play().catch(() => {});
    }
  };

  const addContact = (contact: Omit<EmergencyContact, "id">) => {
    const newContact: EmergencyContact = {
      ...contact,
      id: Date.now().toString(),
    };
    setEmergencyContacts((prev) => [...prev, newContact]);
  };

  const removeContact = (id: string) => {
    setEmergencyContacts((prev) => prev.filter((c) => c.id !== id));
  };

  const updateSettings = (newSettings: Partial<AppContextType["settings"]>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  return (
    <AppContext.Provider
      value={{
        isProtectionActive,
        toggleProtection,
        emergencyContacts,
        addContact,
        removeContact,
        settings,
        updateSettings,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within AppProvider");
  }
  return context;
}
