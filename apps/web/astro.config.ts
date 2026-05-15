import { defineConfig } from "astro/config";

export default defineConfig({
  output: "static",
  integrations: [],
  i18n: {
    locales: ["en", "de"],
    defaultLocale: "en",
  },
});
