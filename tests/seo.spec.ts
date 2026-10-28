import { test, expect } from '@playwright/test';

test.describe('SEO / AEO', () => {
  test('cada artigo tem URL, title, canonical e BlogPosting próprios', async ({ page, request }) => {
    const rss = await (await request.get('/rss.xml')).text();
    const links = [...rss.matchAll(/<link>([^<]+\/blog\/[^<]+)<\/link>/g)].map((m) => new URL(m[1]).pathname);
    expect(links.length).toBeGreaterThan(0);
    const titles = new Set<string>();
    for (const path of links) {
      await page.goto(path);
      const title = await page.title();
      titles.add(title);
      await expect(page.locator('link[rel=canonical]')).toHaveAttribute('href', new RegExp(`${path}$`));
      const ld = JSON.parse((await page.locator('script[type="application/ld+json"]').textContent()) ?? '{}');
      expect(ld['@graph'].some((n: { '@type': string }) => n['@type'] === 'BlogPosting')).toBe(true);
    }
    expect(titles.size).toBe(links.length);
  });

  test('home tem um único h1 e FAQPage no JSON-LD', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toHaveCount(1);
    const ld = JSON.parse((await page.locator('script[type="application/ld+json"]').textContent()) ?? '{}');
    const types = ld['@graph'].map((n: { '@type': string }) => n['@type']);
    expect(types).toEqual(expect.arrayContaining(['ProfessionalService', 'WebSite', 'FAQPage']));
  });

  test('robots, sitemap e llms.txt publicados', async ({ request }) => {
    expect((await request.get('/robots.txt')).ok()).toBe(true);
    expect((await request.get('/sitemap-index.xml')).ok()).toBe(true);
    const llms = await (await request.get('/llms.txt')).text();
    expect(llms).toMatch(/^# AJUSTAPREV/);
    expect(llms).toContain('/blog/');
  });
});
