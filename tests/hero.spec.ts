import { test, expect } from '@playwright/test';

/**
 * TDD §3.13 — o teste que teria pego a falha do hero vazio em produção,
 * agora cobrindo a sequência construção → revelação do escritório.
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

  test('WebGL: a sequência roda no canvas e termina no escritório', async ({ page }) => {
    test.setTimeout(60_000);
    await page.goto('/');
    const hero = page.locator('#hero');
    await expect(hero).toHaveClass(/is-gl/, { timeout: 10_000 });
    await expect(page.locator('.hero__canvas')).toBeVisible();
    await expect(page.locator('#hero-title')).toBeVisible();
    await expect(hero).toHaveClass(/is-office/, { timeout: 45_000 });
    await expect(hero).not.toHaveClass(/is-gl/);
    await expect(page.locator('.hero__img')).toBeHidden();
    await expect(page.locator('.hero__office')).toBeVisible();
    await expect(page.locator('.hero__canvas')).toBeHidden();
  });

  test('sem WebGL: constrói em degraus (clip-path) e revela o escritório', async ({ page }) => {
    test.setTimeout(60_000);
    await page.addInitScript(() => {
      const orig = HTMLCanvasElement.prototype.getContext;
      // @ts-expect-error — simula navegador sem WebGL
      HTMLCanvasElement.prototype.getContext = function (type: string, ...rest: unknown[]) {
        // @ts-expect-error — repassa a assinatura original
        return /webgl/.test(type) ? null : orig.call(this, type, ...rest);
      };
    });
    await page.goto('/');
    const hero = page.locator('#hero');
    await expect(hero).toHaveClass(/is-building/);
    await expect
      .poll(() => page.locator('.hero__media').evaluate((el) => getComputedStyle(el).clipPath), { timeout: 15_000 })
      .toMatch(/^inset\((0(%|px)?\s*)+\)$/);
    await expect(hero).toHaveClass(/is-revealing/, { timeout: 10_000 });
    await expect(hero).toHaveClass(/is-office/, { timeout: 15_000 });
    await expect(page.locator('.hero__office')).toBeVisible();
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

  test('reduced motion: escritório imediato, sem construção nem canvas', async ({ browser }) => {
    const ctx = await browser.newContext({ reducedMotion: 'reduce' });
    const page = await ctx.newPage();
    await page.goto('/');
    const media = page.locator('.hero__media');
    await expect(page.locator('#hero')).toHaveClass(/is-office/);
    expect(await media.evaluate((el) => getComputedStyle(el).clipPath)).toBe('none');
    await expect(page.locator('#hero')).not.toHaveClass(/is-building|is-gl/);
    await expect(page.locator('#hero-title')).toHaveCSS('opacity', '1');
    await ctx.close();
  });
});
