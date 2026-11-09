import { test, expect } from '@playwright/test';

/**
 * TDD §3.13 — o teste que teria pego a falha do hero vazio em produção,
 * agora cobrindo a sequência torres → fumaça → escritório.
 */
test.describe('Hero', () => {
  test('as duas imagens são auto-hospedadas e carregam', async ({ page }) => {
    await page.goto('/');
    for (const sel of ['.hero__img', '.hero__office']) {
      const img = page.locator(sel);
      const src = await img.evaluate((el: HTMLImageElement) => el.currentSrc || el.src);
      // Nunca URL temporária de terceiro (foi o que quebrou o hero antes).
      expect(new URL(src).host).toBe(new URL(page.url()).host);
      await expect.poll(() => img.evaluate((el: HTMLImageElement) => el.naturalWidth)).toBeGreaterThan(0);
    }
    await expect(page.locator('#hero')).not.toHaveClass(/hero--no-media/);
  });

  test('construção: clip-path sai de inset(100%) e termina em inset(0)', async ({ page }) => {
    await page.goto('/');
    const media = page.locator('.hero__media');
    await expect(page.locator('#hero')).toHaveClass(/is-building/);
    await expect
      .poll(() => media.evaluate((el) => getComputedStyle(el).clipPath), { timeout: 6000 })
      .toMatch(/^inset\((0(%|px)?\s*)+\)$/);
  });

  test('sequência termina no escritório, com as torres ocultas', async ({ page }) => {
    await page.goto('/');
    const hero = page.locator('#hero');
    await expect(hero).toHaveClass(/is-office/, { timeout: 12_000 });
    await expect(page.locator('.hero__img')).toBeHidden();
    await expect(page.locator('.hero__office')).toBeVisible();
    await expect(page.locator('#hero-title')).toBeVisible();
  });

  test('se só as torres falharem, vai direto ao escritório', async ({ page }) => {
    await page.route(/hero-torres/, (route) => route.abort());
    await page.goto('/');
    await expect(page.locator('#hero')).toHaveClass(/is-office/);
    await expect(page.locator('#hero')).not.toHaveClass(/hero--no-media/);
  });

  test('se as duas imagens falharem, o hero recebe fundo de marca', async ({ page }) => {
    await page.route(/hero-(torres|escritorio)/, (route) => route.abort());
    await page.goto('/');
    await expect(page.locator('#hero')).toHaveClass(/hero--no-media/);
    await expect(page.locator('#hero-title')).toBeVisible();
  });

  test('reduced motion: escritório imediato, sem clip-path nem fumaça', async ({ browser }) => {
    const ctx = await browser.newContext({ reducedMotion: 'reduce' });
    const page = await ctx.newPage();
    await page.goto('/');
    const media = page.locator('.hero__media');
    expect(await media.evaluate((el) => getComputedStyle(el).clipPath)).toBe('none');
    await expect(page.locator('#hero')).toHaveClass(/is-office/);
    await expect(page.locator('#hero')).not.toHaveClass(/is-building|is-smoking/);
    await expect(page.locator('#hero-title')).toHaveCSS('opacity', '1');
    await ctx.close();
  });
});
