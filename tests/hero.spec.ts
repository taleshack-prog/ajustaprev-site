import { test, expect } from '@playwright/test';

/**
 * TDD §3.13 — o teste que teria pego a falha do hero vazio em produção.
 */
test.describe('Hero', () => {
  test('imagem auto-hospedada carrega e o hero não cai no fallback', async ({ page }) => {
    await page.goto('/');
    const img = page.locator('.hero__img');
    await expect(img).toBeVisible();
    // A imagem precisa vir do próprio domínio (nunca de URL temporária de terceiro).
    const src = await img.evaluate((el: HTMLImageElement) => el.currentSrc);
    expect(new URL(src).host).toBe(new URL(page.url()).host);
    await expect.poll(() => img.evaluate((el: HTMLImageElement) => el.naturalWidth)).toBeGreaterThan(0);
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

  test('fallback: se a imagem falhar, o hero recebe fundo de marca', async ({ page }) => {
    await page.route(/hero-torres/, (route) => route.abort());
    await page.goto('/');
    await expect(page.locator('#hero')).toHaveClass(/hero--no-media/);
    await expect(page.locator('#hero-title')).toBeVisible();
  });

  test('reduced motion: estado final imediato, sem clip-path', async ({ browser }) => {
    const ctx = await browser.newContext({ reducedMotion: 'reduce' });
    const page = await ctx.newPage();
    await page.goto('/');
    const media = page.locator('.hero__media');
    expect(await media.evaluate((el) => getComputedStyle(el).clipPath)).toBe('none');
    await expect(page.locator('#hero-title')).toHaveCSS('opacity', '1');
    await expect(page.locator('#hero')).not.toHaveClass(/is-building/);
    await ctx.close();
  });
});
