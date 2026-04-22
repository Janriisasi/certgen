import { StrictMode, useState } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import LandingPage from "./LandingPage";
import PrivacyPage from "./PrivacyPage";
import App from "./App";

import ClickSpark from "./components/ClickSparkEffect/ClickSpark";

function Root() {
  const [view, setView] = useState("landing");

  return (
    <ClickSpark
      sparkColor="#1C293C"
      sparkSize={15}
      sparkRadius={20}
      sparkCount={10}
      duration={400}
    >
      {view === "app" && <App onGoBack={() => setView("landing")} />}
      {view === "privacy" && <PrivacyPage onBack={() => setView("landing")} />}
      {view === "landing" && (
        <LandingPage
          onLaunchApp={() => setView("app")}
          onPrivacy={() => setView("privacy")}
        />
      )}
    </ClickSpark>
  );
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Root />
  </StrictMode>,
);
