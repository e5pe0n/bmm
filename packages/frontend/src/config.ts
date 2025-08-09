export const config = {
  apiEndpoint: import.meta.env.VITE_API_ENDPOINT || "http://localhost:3000/v1",
  mswEnabled: import.meta.env.VITE_MSW_ENABLED === "true",
} as const;
