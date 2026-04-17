import React, { createContext, useContext, useState, useEffect } from "react";

interface User {
  id: number;
  phone: string;
  name: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  phone: string | null;
  sendCode: (phone: string) => Promise<{ success: boolean; error?: string; code?: string }>;
  login: (phone: string, code: string, name: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  is2GisLinked: boolean;
  link2Gis: () => void;
}

const AuthCtx = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem("qorgan_auth") === "true";
  });
  
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem("qorgan_user");
    return saved ? JSON.parse(saved) : null;
  });

  const [phone, setPhone] = useState<string | null>(() => {
    return localStorage.getItem("qorgan_phone") || null;
  });
  
  const [is2GisLinked, setIs2GisLinked] = useState<boolean>(() => {
    return localStorage.getItem("qorgan_2gis") === "true";
  });

  useEffect(() => {
    localStorage.setItem("qorgan_auth", isAuthenticated.toString());
    if (user) localStorage.setItem("qorgan_user", JSON.stringify(user));
    else localStorage.removeItem("qorgan_user");
    if (phone) localStorage.setItem("qorgan_phone", phone);
    else localStorage.removeItem("qorgan_phone");
    localStorage.setItem("qorgan_2gis", is2GisLinked.toString());
  }, [isAuthenticated, user, phone, is2GisLinked]);

  // Request SMS code
  const sendCode = async (inputPhone: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch("/api/auth/send-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: inputPhone })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Ошибка отправки");
      return { success: true, code: data.code };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  // Verify and login
  const login = async (inputPhone: string, code: string, name: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: inputPhone, code, name })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Ошибка входа");

      setIsAuthenticated(true);
      setPhone(inputPhone);
      setUser(data.user);
      setIs2GisLinked(true); // Automatically link for MVP
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    setPhone(null);
    setIs2GisLinked(false);
  };

  const link2Gis = () => setIs2GisLinked(true);

  return (
    <AuthCtx.Provider value={{ isAuthenticated, user, phone, sendCode, login, logout, is2GisLinked, link2Gis }}>
      {children}
    </AuthCtx.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthCtx);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
