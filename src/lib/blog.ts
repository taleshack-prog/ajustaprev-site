import { getCollection, type CollectionEntry } from 'astro:content';

export type Post = CollectionEntry<'blog'>;

/** Artigos publicados (sem rascunhos em produção), do mais recente ao mais antigo. */
export async function getPosts(): Promise<Post[]> {
  const all = await getCollection('blog', ({ data }) => (import.meta.env.PROD ? !data.draft : true));
  return all.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

export const postUrl = (p: Post) => `/blog/${p.id}/`;

/** Palavras do corpo em Markdown (sem frontmatter, código e marcação). */
export function wordCount(body = ''): number {
  return body
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/[#>*_`|\-\[\]()!]/g, ' ')
    .split(/\s+/)
    .filter(Boolean).length;
}

/** Tempo de leitura em minutos (200 palavras/min para texto técnico). */
export const readingTime = (body = '') => Math.max(1, Math.round(wordCount(body) / 200));

const fmt = new Intl.DateTimeFormat('pt-BR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
export const formatDate = (d: Date) => fmt.format(d);
