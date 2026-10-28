import type { APIContext } from 'astro';

export function GET({ site }: APIContext) {
  const sitemap = new URL('sitemap-index.xml', site).toString();
  const body = `User-agent: *
Allow: /
Disallow: /404

Sitemap: ${sitemap}
`;
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
