#!/usr/bin/env node
/**
 * Checklist bloqueante de publicação (PRD §2.8 e §4).
 *
 *   npm run build            → avisa sobre pendências e continua (desenvolvimento)
 *   PUBLISH=1 npm run build  → falha se houver pendência (use no deploy de produção)
 */
import { readFileSync } from 'node:fs';

const strict = process.env.PUBLISH === '1';
const src = readFileSync(new URL('../src/data/site.ts', import.meta.url), 'utf8');
const pick = (key) => {
  const m = src.match(new RegExp(`${key}:\\s*(null|'[^']*')`));
  return m && m[1] !== 'null' ? m[1].slice(1, -1) : null;
};

const issues = [];
const email = pick('email');
const phone = pick('phone');
if (!email) issues.push('E-mail de contato não definido (src/data/site.ts → contact.email).');
if (/PENDENTE: confirmar \(veio do cartão\)/.test(src)) issues.push('E-mail de contato ainda marcado como PENDENTE de confirmação.');
if (phone && /9999-?9999/.test(phone)) issues.push('Telefone é placeholder (99999-9999).');
if (!phone) issues.push('Telefone não definido — será omitido do site (ok se for intencional).');
if (/PENDENTE: confirmar DNS/.test(src)) issues.push('Domínio canônico ainda marcado como PENDENTE (site.url).');
if (!pick('responsibleName') && !pick('society'))
  issues.push('Identificação profissional (legal.responsibleName / legal.society) vazia — exigida se a comunicação for de advocacia (Provimento 205/2021).');
if (pick('responsibleName') && !pick('oab')) issues.push('Responsável técnico sem número de inscrição na OAB.');

if (!issues.length) {
  console.log('✓ prepublish-check: nenhuma pendência.');
  process.exit(0);
}
const head = strict ? '✗ prepublish-check — publicação bloqueada:' : '⚠ prepublish-check — pendências antes de publicar:';
console[strict ? 'error' : 'warn'](`\n${head}\n${issues.map((i) => `  • ${i}`).join('\n')}\n`);
process.exit(strict ? 1 : 0);
