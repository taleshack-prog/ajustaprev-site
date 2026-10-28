/**
 * Configuração central do site. Tudo o que pode mudar antes de publicar
 * está aqui — e scripts/prepublish-check.mjs verifica os itens pendentes.
 *
 * `null` = pendente. Campos nulos não são exibidos no site.
 */
export const SITE = {
  name: 'AJUSTAPREV',
  tagline: 'Defesa Empresarial Previdenciária',
  claim: 'O ajuste certo. A contribuição justa.',
  url: 'https://www.ajustaprev.com.br', // PENDENTE: confirmar DNS
  locale: 'pt-BR',
  description:
    'Auditoria, consultoria e defesa previdenciária para empresas: folha, SAT/RAT, FAP, afastamentos e recuperação de contribuições.',

  contact: {
    email: 'luiz@ajustaprev.com.br' as string | null, // PENDENTE: confirmar (veio do cartão)
    phone: null as string | null, // PENDENTE: o cartão traz placeholder (61) 99999-9999
    phoneHref: null as string | null, // ex.: '+5561XXXXXXXXX'
    city: null as string | null,
  },

  /** Quem mantém e responde pelo site. */
  maintainer: 'Hack Tech Farm',

  /**
   * Identificação profissional exigida quando a comunicação for de advocacia
   * (Provimento CFOAB nº 205/2021). Preencher antes de publicar se o serviço
   * for prestado por advogado ou sociedade de advogados.
   */
  legal: {
    responsibleName: null as string | null,
    oab: null as string | null, // ex.: 'OAB/DF 00.000'
    society: null as string | null, // razão social + registro na OAB, se houver
    cnpj: null as string | null,
  },

  social: {
    linkedin: null as string | null,
    instagram: null as string | null,
  },
} as const;

export const NAV = [
  { href: '/#solucoes', label: 'Soluções' },
  { href: '/#metodo', label: 'Método' },
  { href: '/blog/', label: 'Conteúdo' },
  { href: '/sobre/', label: 'Sobre' },
] as const;
