import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@ui/index.css";
import App from "@ui/App.tsx";
import { ThemeProvider } from "@ui/components/theme/theme-provider.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider storageKey="vite-ui-theme">
      <App />
    </ThemeProvider>
  </StrictMode>
);
