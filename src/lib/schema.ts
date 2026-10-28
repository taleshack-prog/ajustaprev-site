import { SITE } from '../data/site';

const abs = (path: string) => new URL(path, SITE.url).toString();
const ORG_ID = abs('/#organization');
const SITE_ID = abs('/#website');

/**
 * Tipo da organização: ProfessionalService.
 * Se a prestação for feita por sociedade de advogados registrada na OAB,
 * troque para 'LegalService' (subtipo mais específico) — ver README.
 */
export function organization() {
  const sameAs = Object.values(SITE.social).filter(Boolean);
  return {
    '@type': 'ProfessionalService',
    '@id': ORG_ID,
    name: SITE.name,
    slogan: SITE.claim,
    description: SITE.description,
    url: SITE.url,
    logo: abs('/assets/logo-512.png'),
    image: abs('/assets/og-home.jpg'),
    ...(SITE.contact.email && { email: SITE.contact.email }),
    ...(SITE.contact.phoneHref && { telephone: SITE.contact.phoneHref }),
    areaServed: { '@type': 'Country', name: 'Brasil' },
    knowsAbout: [
      'Contribuição previdenciária patronal',
      'Revisão de folha de pagamento',
      'Compensação e restituição de contribuições previdenciárias',
      'SAT/RAT (GILRAT) e atividade preponderante',
      'Fator Acidentário de Prevenção (FAP)',
      'Nexo Técnico Epidemiológico Previdenciário (NTEP)',
      'Ação regressiva acidentária',
      'eSocial e DCTFWeb',
      'Due diligence previdenciária',
    ],
    ...(sameAs.length && { sameAs }),
  };
}

export function website() {
  return {
    '@type': 'WebSite',
    '@id': SITE_ID,
    url: SITE.url,
    name: SITE.name,
    inLanguage: SITE.locale,
    publisher: { '@id': ORG_ID },
  };
}

export function faqPage(items: readonly { q: string; a: string }[], url: string) {
  return {
    '@type': 'FAQPage',
    '@id': abs(url) + '#faq',
    mainEntity: items.map((i) => ({
      '@type': 'Question',
      name: i.q,
      acceptedAnswer: { '@type': 'Answer', text: i.a },
    })),
  };
}

export function breadcrumbs(items: { name: string; url: string }[]) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      item: abs(it.url),
    })),
  };
}

export function blogPosting(p: {
  title: string;
  description: string;
  url: string;
  date: Date;
  updated?: Date;
  author: string;
  category: string;
  image?: string;
  words?: number;
}) {
  return {
    '@type': 'BlogPosting',
    '@id': abs(p.url) + '#article',
    headline: p.title,
    description: p.description,
    url: abs(p.url),
    mainEntityOfPage: abs(p.url),
    datePublished: p.date.toISOString(),
    dateModified: (p.updated ?? p.date).toISOString(),
    inLanguage: SITE.locale,
    articleSection: p.category,
    ...(p.words && { wordCount: p.words }),
    author: { '@type': 'Organization', name: p.author, url: SITE.url },
    publisher: { '@id': ORG_ID },
    image: abs(p.image ?? '/assets/og-home.jpg'),
  };
}

export function service(f: { titulo: string; resumo: string; slug: string }) {
  return {
    '@type': 'Service',
    '@id': abs(`/solucoes/${f.slug}/`) + '#service',
    name: f.titulo,
    description: f.resumo,
    provider: { '@id': ORG_ID },
    areaServed: { '@type': 'Country', name: 'Brasil' },
    serviceType: 'Consultoria previdenciária empresarial',
  };
}

/** Monta o @graph final: organização e site entram em todas as páginas. */
export function graph(...nodes: object[]) {
  return { '@context': 'https://schema.org', '@graph': [organization(), website(), ...nodes] };
}
