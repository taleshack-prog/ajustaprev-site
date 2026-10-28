import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const PAGES = [
  '/',
  '/blog/',
  '/blog/fap-2027-contestacao/',
  '/solucoes/sat-rat/',
  '/contato/',
  '/sobre/',
  '/politica-de-privacidade/',
];

test.describe('Acessibilidade (axe, WCAG 2.1 AA)', () => {
  for (const path of PAGES) {
    test(`sem violações em ${path}`, async ({ page }) => {
      await page.emulateMedia({ reducedMotion: 'reduce' }); // estado final, sem elementos em transição
      await page.goto(path);
      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze();
      const summary = results.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`);
      expect(summary).toEqual([]);
    });
  }

  test('skip link leva ao conteúdo principal', async ({ page }) => {
    await page.goto('/');
    await page.keyboard.press('Tab');
    await expect(page.locator('.skip-link')).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/#conteudo$/);
  });
});

test.describe('Interações', () => {
  test('menu mobile: aria-expanded, foco e Escape', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'apenas mobile');
    await page.goto('/');
    const toggle = page.locator('[data-menu-toggle]');
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator('.site-nav a').first()).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(toggle).toBeFocused();
  });

  test('blog: filtro por categoria com aria-pressed', async ({ page }) => {
    await page.goto('/blog/');
    const chip = page.locator('.chip', { hasText: 'SAT/RAT' });
    await chip.click();
    await expect(chip).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('[data-blog-list] > li:not([hidden])')).toHaveCount(1);
    await expect(page).toHaveURL(/categoria=SAT/);
  });

  test('blog: busca textual sem acento', async ({ page }) => {
    await page.goto('/blog/');
    await page.fill('#blog-q', 'aquisicoes');
    await expect(page.locator('[data-blog-list] > li:not([hidden])')).toHaveCount(1);
  });

  test('contato: valida obrigatórios antes de abrir o e-mail', async ({ page }) => {
    await page.goto('/contato/');
    await page.click('button[type=submit]');
    await expect(page.locator('#f-nome')).toHaveAttribute('aria-invalid', 'true');
    await expect(page.locator('#e-nome')).not.toBeEmpty();
    await expect(page.locator('#f-nome')).toBeFocused();
  });

  test('simulador: FAP 1,0 com RAT 2% e folha 3 mi = R$ 720.000/ano', async ({ page }) => {
    await page.goto('/');
    await page.locator('#sim-fap').fill('1');
    await expect(page.locator('[data-out="aliq"]')).toHaveText('2,00%');
    await expect(page.locator('[data-out="anual"]')).toContainText('720.000');
  });
});
