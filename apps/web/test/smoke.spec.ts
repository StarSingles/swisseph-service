import { expect, test } from "@playwright/test";

test("landing page loads with all nav links", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Swiss Ephemeris" })).toBeVisible();
  await expect(page.getByRole("link", { name: "/chart" })).toBeVisible();
  await expect(page.getByRole("link", { name: "/synastry" })).toBeVisible();
  await expect(page.getByRole("link", { name: "/raw" })).toBeVisible();
});

test("/health reports WASM loaded", async ({ page }) => {
  await page.goto("/health");
  await expect(page.locator("#status")).toContainText(/OK — WASM loaded/, { timeout: 15_000 });
});

test("/chart renders a birth chart with expected zodiac signs", async ({ page }) => {
  await page.goto("/chart");
  await page.getByRole("button", { name: "Compute" }).click();
  await expect(page.locator("#result")).toContainText("Capricorn", { timeout: 15_000 });
  await expect(page.locator("#result")).toContainText("Sun");
  await expect(page.locator("#result")).toContainText("Moon");
});

test("/synastry renders an aspect table", async ({ page }) => {
  await page.goto("/synastry");
  await page.getByRole("button", { name: "Compute synastry" }).click();
  await expect(page.locator("#result")).not.toBeEmpty({ timeout: 20_000 });
});

test("/raw can call /api/v1/health", async ({ page }) => {
  await page.goto("/raw");
  await page.getByRole("button", { name: "Send" }).click();
  await expect(page.locator("#response")).toContainText("HTTP 200", { timeout: 15_000 });
  await expect(page.locator("#response")).toContainText("wasmLoaded");
});
