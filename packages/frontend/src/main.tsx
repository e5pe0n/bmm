import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import App from "./App.tsx";
import "./index.css";
import { config } from "./config.ts";

const queryClient = new QueryClient();

async function enableMocking() {
  if (!config.mswEnabled) {
    return;
  }

  const { worker } = await import("./mocks/server.ts");
  return worker.start();
}

enableMocking()
  .then(() => {
    console.log("MSW enabled");
    createRoot(document.getElementById("root")!).render(
      <StrictMode>
        <QueryClientProvider client={queryClient}>
          <App />
        </QueryClientProvider>
      </StrictMode>
    );
  })
  .catch((error) => {
    console.error("Failed to enable mocking:", error);
  });
