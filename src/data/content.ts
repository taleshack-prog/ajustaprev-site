/**
 * Textos institucionais. Os valores vivem em home.json, frentes.json e
 * sobre.json, editáveis pelo painel (/admin → Site). Este módulo só tipa,
 * normaliza e deriva valores calculados.
 *
 * Redação sujeita ao Provimento CFOAB nº 205/2021: sem promessa de resultado,
 * superlativos, "especialista" ou menção a honorários.
 */
import home from './home.json';
import frentes from './frentes.json';
import sobre from './sobre.json';

export type Frente = {
  slug: string;
  numero: string;
  titulo: string;
  curto: string;
  resumo: string;
  objetivo: string;
  etapas: { titulo: string; texto: string }[];
  entrega: string;
  paraQuem: string[];
  perguntas: { q: string; a: string }[];
  keywords: string[];
};

export const HOME = home;
export const SOBRE = sobre;

export const DORES = home.dores.itens;
export const METODO = home.metodo.etapas;
export const PUBLICO = home.publico.perfis;
export const FAQ = home.faq.itens;

/** Numeração e listas opcionais normalizadas (o painel pode omitir listas vazias). */
export const FRENTES: Frente[] = frentes.itens.map((f, i) => ({
  ...f,
  numero: String(i + 1).padStart(2, '0'),
  etapas: f.etapas ?? [],
  paraQuem: f.paraQuem ?? [],
  perguntas: f.perguntas ?? [],
  keywords: f.keywords ?? [],
}));

/**
 * Cenários: aritmética de alíquota, não promessa de resultado.
 * O valor anual é sempre calculado aqui (base × efeito × 12), nunca digitado.
 */
export const CENARIOS = home.cenarios.itens.map((c) => ({
  ...c,
  anual: Math.round(Number(c.base) * Number(c.efeito) * 12),
}));
