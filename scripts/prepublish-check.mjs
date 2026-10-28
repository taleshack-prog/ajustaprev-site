#!/usr/bin/env node
/**
 * Checklist bloqueante de publicação (PRD §2.8 e §4).
 * Lê src/data/site.json — o mesmo arquivo editado no painel (/admin → Site → Configurações).
 *
 *   npm run build            → avisa sobre pendências e continua
 *   PUBLISH=1 npm run build  → falha se houver pendência (deploy de produção)
 */
import { readFileSync } from 'node:fs';

const strict = process.env.PUBLISH === '1';
const site = JSON.parse(readFileSync(new URL('../src/data/site.json', import.meta.url), 'utf8'));
const filled = (v) => typeof v === 'string' && v.trim() !== '';

const issues = [];
const { contact = {}, legal = {}, pendencias = {} } = site;
if (!filled(contact.email)) issues.push('E-mail de contato não definido (Configurações → Contato).');
else if (!pendencias.emailConfirmado) issues.push('E-mail de contato ainda não confirmado (Configurações → Pendências).');
if (filled(contact.phone) && /9999-?9999/.test(contact.phone)) issues.push('Telefone é placeholder (99999-9999).');
if (!filled(contact.phone)) issues.push('Telefone não definido — será omitido do site (ok se for intencional).');
if (!pendencias.dominioConfirmado) issues.push(`Domínio canônico ${site.url} ainda não confirmado (Configurações → Pendências).`);
if (!filled(legal.responsibleName) && !filled(legal.society))
  issues.push('Identificação profissional vazia — exigida se a comunicação for de advocacia (Provimento 205/2021).');
if (filled(legal.responsibleName) && !filled(legal.oab)) issues.push('Responsável técnico sem número de inscrição na OAB.');

if (!issues.length) {
  console.log('✓ prepublish-check: nenhuma pendência.');
  process.exit(0);
}
const head = strict ? '✗ prepublish-check — publicação bloqueada:' : '⚠ prepublish-check — pendências antes de publicar:';
console[strict ? 'error' : 'warn'](`\n${head}\n${issues.map((i) => `  • ${i}`).join('\n')}\n`);
process.exit(strict ? 1 : 0);
