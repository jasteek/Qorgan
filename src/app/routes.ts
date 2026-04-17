import { createBrowserRouter } from "react-router";
import { Root } from "./components/Root";
import { Home } from "./components/screens/Home";
import { Map } from "./components/screens/Map";
import { AIShield } from "./components/screens/AIShield";
import { HiddenSOS } from "./components/screens/HiddenSOS";
import { Rituals } from "./components/screens/Rituals";
import { SafetyTips } from "./components/screens/SafetyTips";
import { HealthPassport } from "./components/screens/HealthPassport";
import { Fitness } from "./components/screens/Fitness";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: Home },
      { path: "map", Component: Map },
      { path: "ai-shield", Component: AIShield },
      { path: "hidden-sos", Component: HiddenSOS },
      { path: "rituals", Component: Rituals },
      { path: "safety-tips", Component: SafetyTips },
      { path: "health-passport", Component: HealthPassport },
      { path: "fitness", Component: Fitness },
    ],
  },
]);