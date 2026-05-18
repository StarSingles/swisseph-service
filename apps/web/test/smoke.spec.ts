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
  await page.locator("#send").click();
  await expect(page.locator("#response")).toContainText("HTTP 200", { timeout: 15_000 });
  await expect(page.locator("#response")).toContainText("wasmLoaded");
});

test("chart page: extended bodies toggle adds nodes/Lilith rows", async ({ page }) => {
  await page.goto("/chart");
  await page.fill('[name="date"]', "2000-01-01");
  await page.fill('[name="time"]', "12:00");
  await page.fill('[name="latitude"]', "47.3769");
  await page.fill('[name="longitude"]', "8.5417");
  await page.check('[name="extendedBodies"]');
  await page.click('button[type="submit"]');
  await expect(page.locator('[data-testid="chart-results"]')).toContainText("MeanNode", {
    timeout: 15_000,
  });
  await expect(page.locator('[data-testid="chart-results"]')).toContainText("Lilith");
});

test("chart page: switching to sidereal shifts Sun longitude by Lahiri ayanamsa", async ({
  page,
}) => {
  // The bodies table renders one row per body: <td>Name</td><td>Sign d°</td><td>longitude°</td><td>Rx?</td>
  // Sun is the first row — read its longitude (3rd cell) for a precise check
  // instead of comparing the whole results blob.
  const sunLongitude = async () => {
    const cell = page
      .locator('[data-testid="chart-results"] tbody tr')
      .first()
      .locator("td")
      .nth(2);
    const text = await cell.textContent();
    return Number((text ?? "").replace("°", "").trim());
  };

  await page.goto("/chart");
  await page.fill('[name="date"]', "2000-01-01");
  await page.fill('[name="time"]', "12:00");
  await page.fill('[name="latitude"]', "47.3769");
  await page.fill('[name="longitude"]', "8.5417");
  await page.click('button[type="submit"]');
  await expect(page.locator('[data-testid="chart-results"]')).toContainText("Sun", {
    timeout: 15_000,
  });
  const tropSunLon = await sunLongitude();

  await page.check('[name="zodiac"][value="sidereal"]');
  await expect(page.locator('[name="ayanamsa"]')).toBeEnabled();
  await page.click('button[type="submit"]');
  // Wait for fresh render — the cell value should change
  await expect.poll(sunLongitude, { timeout: 15_000 }).not.toEqual(tropSunLon);
  const sidSunLon = await sunLongitude();

  const diff = (((tropSunLon - sidSunLon) % 360) + 360) % 360;
  // Lahiri ayanamsa at J2000 ≈ 23.85°. Tolerance ±0.1°.
  expect(diff).toBeGreaterThan(23.7);
  expect(diff).toBeLessThan(24.0);
});

test("raw page: ayanamsa endpoint returns offset", async ({ page }) => {
  await page.goto("/raw");
  const section = page.locator('[data-testid="ayanamsa"]');
  await section.locator('button[type="submit"]').click();
  await expect(section.locator("pre")).toContainText("offsetDegrees", { timeout: 15_000 });
});
