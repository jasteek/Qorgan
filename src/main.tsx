import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router";
import { router } from "./app/routes";
import { LanguageProvider } from "./app/contexts/LanguageContext";
import { AppProvider } from "./app/contexts/AppContext";
import { AuthProvider } from "./contexts/AuthContext";
import "./styles/index.css";

createRoot(document.getElementById("root")!).render(
  <LanguageProvider>
    <AuthProvider>
      <AppProvider>
        <RouterProvider router={router} />
      </AppProvider>
    </AuthProvider>
  </LanguageProvider>
);