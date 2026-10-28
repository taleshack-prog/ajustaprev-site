# AJUSTAPREV — site institucional

Astro 7 (saída estática), sem framework de UI, ~3 KB de JS inline na home.
Montserrat auto-hospedada, imagens AVIF/WebP geradas no build, blog em Markdown com rota própria por artigo.

```bash
npm install
npm run dev            # http://localhost:4321
npm run build          # avisa pendências de publicação e gera dist/
PUBLISH=1 npm run build  # falha se houver pendência (use no deploy de produção)
npm test               # Playwright: hero, a11y (axe), SEO, interações
```

Sem acesso ao CDN do Playwright, aponte para um Chromium local:
`PW_CHROMIUM_PATH=/caminho/chrome npm test`.
Regressão visual: `VISUAL=1 npx playwright test visual --update-snapshots` (primeira vez).

Deploy: Vercel (configurado em `vercel.json`) ou qualquer host estático. Comando `npm run build`, pasta `dist`.

> **Provisório:** `vercel.json` envia `X-Robots-Tag: noindex, nofollow` em todas as rotas, para o site não ser indexado antes de resolver as pendências abaixo. **Remova esse header no lançamento.**

---

## Pendências bloqueantes (antes de publicar)

Tudo fica em **`src/data/site.ts`**. `scripts/prepublish-check.mjs` verifica cada item.

| Item | Situação | Ação |
| --- | --- | --- |
| Domínio | `www.ajustaprev.com.br` marcado PENDENTE | Confirmar DNS e remover o comentário |
| E-mail | `luiz@ajustaprev.com.br` (do cartão) | Confirmar ou trocar |
| Telefone | O cartão traz placeholder `(61) 99999-9999` | Preencher `phone` e `phoneHref`; enquanto `null`, não aparece |
| Identificação profissional | Vazia | Se a comunicação for de advocacia, preencher `legal.responsibleName` + `legal.oab` ou `legal.society` (Provimento CFOAB 205/2021) |
| Conteúdo jurídico | 4 artigos e textos institucionais | Revisão pelo responsável técnico |
| Imagem do hero | 896×1152 px | Funciona até ~1600 px de largura; para telas maiores, substituir `src/assets/hero-torres.png` por versão ≥ 1600 px de largura |

O site sai com "Site mantido por Hack Tech Farm" no rodapé (`SITE.maintainer`).

---

## Decisões e desvios do TDD

**Cores corrigidas.** O TDD registrava `#0F245F` e `#1F385B`; os rótulos da prancha de identidade dizem
`#0F243F` (Azul Profundo) e `#1F3B5B` (Azul Aço). Além disso, o logo master e o post FAP usam um azul mais
vivo e um fundo mais escuro que o brand book. Os valores foram amostrados dos pixels das peças finais
e documentados em `src/styles/tokens.css`:

| Token | Hex | Origem |
| --- | --- | --- |
| `--brand-deep` | `#0F243F` | Brand book — Azul Profundo |
| `--brand-steel` | `#1F3B5B` | Brand book — Azul Aço (cards) |
| `--brand-blue` | `#4F7FB3` | Brand book — Azul Claro (só linhas e ícones: 3,7:1 não passa para texto) |
| `--brand-graphite` | `#3A4250` | Brand book — Grafite |
| `--brand-grey` | `#D9DEE5` | Brand book — Cinza Claro |
| `--night` | `#0A1424` | Fundo do logo master (fundo dominante do site) |
| `--abyss` | `#05090F` | Base do post FAP (rodapé, seções profundas) |
| `--prev` / `--prev-hi` / `--prev-lo` | `#4580DC` / `#6AA2F3` / `#2A66C6` | Degradê do "PREV" no logo |
| `--silver` | `#CFD4DA` | Prata do "AJUSTA" |
| `--link` | `#71A5F3` | Eyebrow do post (7,4:1 sobre o fundo) |
| `--cta` | `#2A66C6` | Botões (branco sobre ele: 5,5:1) |

**Tipografia.** Montserrat em tudo (decisão do cliente: alinhar ao logo novo e ao post), em vez de Playfair nos títulos.

**Logotipo.** `scripts/build-wordmark.py` gera o SVG a partir dos contornos da Montserrat 600, com o "A" sem
travessa (Λ) desenhado como chevron. Fica inline no HTML: nítido em qualquer densidade, sem requisição.

**Linha de obra do hero.** O TDD animava `top`; isso registrava CLS ≈ 0,1 (budget: 0,05). Agora um trilho com a
altura do hero anima `translateY(-100%)` — mesmo efeito, sem JS de medição, CLS 0.

**Organização no JSON-LD.** `ProfessionalService`. Se a prestação for por sociedade de advogados registrada,
trocar para `LegalService` em `src/lib/schema.ts`.

**Markdown.** O Astro 7 usa o processador Sätteri; plugins remark/rehype exigem instalar
`@astrojs/markdown-remark`. Os artigos usam listas simples (task lists geravam checkboxes sem rótulo, reprovados no axe).

**Provimento 205/2021.** Sem "especialista", superlativos, promessa de resultado ou menção a honorários.
Os cenários em R$ são apresentados como aritmética aberta (base × diferença × 12) com aviso de exemplo hipotético.

**LGPD.** Formulário de contato não envia nada a servidor: valida e abre o cliente de e-mail do visitante.
Sem cookies, analytics ou fontes de terceiros.

---

## Medições (build local)

| Métrica | Resultado | Budget |
| --- | --- | --- |
| Peso da home (transferido) | ~95 KB | < 500 KB |
| JS no first load | ~3 KB inline | < 30 KB |
| CLS | 0 | < 0,05 |
| axe WCAG 2.1 AA | 0 violações em 7 páginas | 0 |

LCP real deve ser medido no host final (Lighthouse CI / PageSpeed).

## Estrutura

```
src/
  assets/           hero-torres.png, wordmark.json (gerado)
  components/       Hero, Dores, Frentes, Cenarios (+ simulador RAT×FAP), Metodo, Faq, CtaFinal, …
  content/blog/     artigos .md (frontmatter validado em src/content.config.ts)
  data/             site.ts (configuração e pendências), content.ts (textos), categorias.ts
  layouts/Base.astro  SEO, OG, JSON-LD @graph, header/footer
  lib/              schema.ts (JSON-LD), blog.ts
  pages/            index, blog/, blog/[slug], solucoes/[frente], sobre, contato, legais, 404,
                    rss.xml, llms.txt, robots.txt
  styles/           tokens.css, base.css, fonts.css
public/             fontes, favicons, og-home.jpg
tests/              hero, a11y, seo, visual
```

## Novo artigo

Criar `src/content/blog/<slug>.md`:

```yaml
---
title: 'Até 70 caracteres'
description: 'Até 160 caracteres'
category: Folha        # Folha | SAT/RAT | Risco | Judicial | Governança
date: 2026-11-10
fontes:
  - titulo: 'Lei nº 8.212/1991, art. 22'
    url: 'https://www.planalto.gov.br/ccivil_03/leis/l8212cons.htm'
---
**Resposta direta:** um parágrafo que define o tema (é o trecho que buscadores e IAs extraem).
```

URL, sitemap, RSS, `llms.txt` e JSON-LD `BlogPosting` são gerados automaticamente.
