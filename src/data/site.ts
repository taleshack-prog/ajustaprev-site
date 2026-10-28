/**
 * Configuração central do site. Os valores vivem em site.json, editável pelo
 * painel (/admin → Site → Configurações). Campos vazios ('') viram null aqui
 * e não são exibidos. scripts/prepublish-check.mjs aponta o que falta.
 */
import raw from './site.json';

const val = (v: string | null | undefined) => (v && v.trim() ? v.trim() : null);

export const SITE = {
  name: raw.name,
  tagline: raw.tagline,
  claim: raw.claim,
  url: raw.url.replace(/\/$/, ''),
  locale: 'pt-BR',
  description: raw.description,
  contact: {
    email: val(raw.contact.email),
    phone: val(raw.contact.phone),
    phoneHref: val(raw.contact.phoneHref),
    city: val(raw.contact.city),
  },
  maintainer: raw.maintainer,
  legal: {
    responsibleName: val(raw.legal.responsibleName),
    oab: val(raw.legal.oab),
    society: val(raw.legal.society),
    cnpj: val(raw.legal.cnpj),
  },
  social: {
    linkedin: val(raw.social.linkedin),
    instagram: val(raw.social.instagram),
  },
};

export const NAV = [
  { href: '/#solucoes', label: 'Soluções' },
  { href: '/#metodo', label: 'Método' },
  { href: '/blog/', label: 'Conteúdo' },
  { href: '/sobre/', label: 'Sobre' },
] as const;
