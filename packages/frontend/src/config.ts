export const config = {
  apiEndpoint: import.meta.env.VITE_API_ENDPOINT || "http://localhost:3000/api",
  mswEnabled: import.meta.env.VITE_MSW_ENABLED === "true",
} as const;
