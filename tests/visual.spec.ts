import { test, expect } from '@playwright/test';

/**
 * Regressão visual em três larguras (TDD §3.13).
 * Primeira execução: VISUAL=1 npx playwright test visual --update-snapshots
 */
test.skip(!process.env.VISUAL, 'defina VISUAL=1 para rodar a regressão visual');

for (const width of [375, 768, 1440]) {
  test(`home @ ${width}px`, async ({ browser }) => {
    const ctx = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: 'reduce' });
    const page = await ctx.newPage();
    await page.goto('/');
    await page.evaluate(() => document.fonts.ready);
    await expect(page).toHaveScreenshot(`home-${width}.png`, { fullPage: true, maxDiffPixelRatio: 0.01 });
    await ctx.close();
  });
}
