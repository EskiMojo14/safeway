import { playwright } from "@vitest/browser-playwright";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    projects: [
      {
        test: {
          include: ["**/*.node.{test,spec}.ts"],
          name: "unit",
          environment: "node",
        },
      },
      {
        test: {
          include: ["**/*.browser.{test,spec}.ts"],
          name: "browser",
          browser: {
            enabled: true,
            provider: playwright(),
            instances: [{ browser: "chromium" }],
          },
          includeTaskLocation: true,
        },
      },
      {
        test: {
          name: "typecheck",
          typecheck: {
            enabled: true,
            only: true,
          },
        },
      },
    ],
  },
});
