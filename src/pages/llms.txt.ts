/**
 * /llms.txt — índice em Markdown para motores de resposta (proposta llmstxt.org).
 * Gerado no build a partir das frentes e dos artigos publicados.
 */
import type { APIContext } from 'astro';
import { getPosts, postUrl } from '../lib/blog';
import { FRENTES, FAQ } from '../data/content';
import { SITE } from '../data/site';

export async function GET({ site }: APIContext) {
  const base = (site ?? new URL(SITE.url)).toString().replace(/\/$/, '');
  const posts = await getPosts();
  const lines = [
    `# ${SITE.name} — ${SITE.tagline}`,
    '',
    `> ${SITE.description}`,
    '',
    'A AJUSTAPREV atua em direito empresarial previdenciário: revisão de folha e recolhimentos, enquadramento do SAT/RAT por atividade preponderante, gestão de afastamentos e do FAP, prevenção de ações regressivas e recuperação de contribuições pagas a maior. O conteúdo deste site é informativo e não constitui parecer jurídico.',
    '',
    '## Soluções',
    ...FRENTES.map((f) => `- [${f.titulo}](${base}/solucoes/${f.slug}/): ${f.resumo}`),
    '',
    '## Artigos',
    ...posts.map((p) => `- [${p.data.title}](${base}${postUrl(p)}): ${p.data.description}`),
    '',
    '## Perguntas frequentes',
    ...FAQ.map((q) => `- **${q.q}** ${q.a}`),
    '',
    '## Optional',
    `- [Sobre](${base}/sobre/)`,
    `- [Contato](${base}/contato/)`,
    `- [Aviso jurídico](${base}/aviso-juridico/)`,
    '',
  ];
  return new Response(lines.join('\n'), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
