import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { CATEGORIAS } from './data/categorias';

/**
 * O painel (/admin) pode gravar campos opcionais vazios como '' ou null.
 * `vazio` converte esses valores em undefined antes da validação, para que
 * um campo deixado em branco no painel nunca quebre o build.
 */
const vazio = (v: unknown) => (v === '' || v === null ? undefined : v);
const opcional = <T extends z.ZodType>(schema: T) => z.preprocess(vazio, schema.optional());

const blog = defineCollection({
  // O id de cada entrada vira o slug da URL: /blog/<id>/
  loader: glob({ base: './src/content/blog', pattern: '**/*.md' }),
  schema: ({ image }) =>
    z.object({
      title: z.string().max(70),
      description: z.string().max(160),
      category: z.enum(CATEGORIAS),
      date: z.coerce.date(),
      updated: opcional(z.coerce.date()),
      author: z.preprocess(vazio, z.string().default('Equipe AJUSTAPREV')),
      cover: opcional(image()),
      coverAlt: opcional(z.string()),
      draft: z.preprocess(vazio, z.boolean().default(false)),
      canonical: opcional(z.url()),
      /** Fontes normativas citadas — aparecem ao fim do artigo. */
      fontes: z.preprocess(
        (v) => (v == null ? [] : v),
        z.array(z.object({ titulo: z.string(), url: opcional(z.url()) })),
      ),
    }),
});

export const collections = { blog };
