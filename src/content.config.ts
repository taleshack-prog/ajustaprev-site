import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { CATEGORIAS } from './data/categorias';

const blog = defineCollection({
  // O id de cada entrada vira o slug da URL: /blog/<id>/
  loader: glob({ base: './src/content/blog', pattern: '**/*.md' }),
  schema: ({ image }) =>
    z.object({
      title: z.string().max(70),
      description: z.string().max(160),
      category: z.enum(CATEGORIAS),
      date: z.coerce.date(),
      updated: z.coerce.date().optional(),
      author: z.string().default('Equipe AJUSTAPREV'),
      cover: image().optional(),
      coverAlt: z.string().optional(),
      draft: z.boolean().default(false),
      canonical: z.url().optional(),
      /** Fontes normativas citadas — aparecem ao fim do artigo. */
      fontes: z.array(z.object({ titulo: z.string(), url: z.url().optional() })).default([]),
    }),
});

export const collections = { blog };
