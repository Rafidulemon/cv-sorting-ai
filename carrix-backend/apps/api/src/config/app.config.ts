export const AppConfig = () => ({
  api: {
    port: Number(process.env.API_PORT || 4000),
    prefix: process.env.API_PREFIX || "api",
  },
});

export type AppConfigType = ReturnType<typeof AppConfig>;
