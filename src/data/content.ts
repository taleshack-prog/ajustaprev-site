/**
 * Conteúdo institucional. Redação revisada à luz do Provimento CFOAB nº 205/2021:
 * sem promessa de resultado, sem superlativos, sem "especialista",
 * sem menção a honorários, sem casos concretos.
 * Antes de publicar, o texto passa por revisão do responsável técnico.
 */

export const DORES = [
  {
    titulo: 'Folha de salários',
    texto:
      'Rubricas com natureza ou incidência parametrizada de forma incorreta fazem a base de cálculo crescer sem que ninguém perceba — todos os meses.',
    icone: 'folha',
  },
  {
    titulo: 'Carga previdenciária',
    texto:
      'Contribuições patronais que nunca foram revisadas tecnicamente podem estar acima do devido. A conferência começa pelo que a empresa já recolhe.',
    icone: 'carga',
  },
  {
    titulo: 'SAT / RAT',
    texto:
      'A alíquota de 1%, 2% ou 3% depende da atividade preponderante de cada estabelecimento. Um enquadramento incoerente se repete em toda competência.',
    icone: 'rat',
  },
  {
    titulo: 'Afastamentos e FAP',
    texto:
      'Benefícios acidentários e CATs alimentam o FAP, que multiplica o RAT por um fator entre 0,5 e 2,0. Erros na base têm prazo curto para contestação.',
    icone: 'fap',
  },
] as const;

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

export const FRENTES: Frente[] = [
  {
    slug: 'consultoria-folha',
    numero: '01',
    titulo: 'Consultoria administrativa sobre a folha',
    curto: 'Consultoria da folha',
    resumo:
      'Revisão técnica da folha e dos recolhimentos para identificar distorções de incidência, parametrização e valores a recuperar.',
    objetivo:
      'Descobrir se a empresa recolhe corretamente — e se existe valor a recuperar ou custo recorrente a interromper.',
    etapas: [
      {
        titulo: 'Diagnóstico',
        texto:
          'Leitura técnica da tabela de rubricas do eSocial, das remunerações e das declarações, com foco em incidências e parametrizações.',
      },
      {
        titulo: 'Quantificação',
        texto:
          'Mensuração financeira de cada ponto encontrado, separando o impacto histórico (até cinco anos) da economia prospectiva.',
      },
      {
        titulo: 'Plano de ação',
        texto:
          'Entrega executiva com prioridades, caminhos administrativos possíveis e nível de risco de cada medida.',
      },
    ],
    entrega:
      'Visibilidade: a empresa passa a saber onde paga, por que paga e onde pode corrigir.',
    paraQuem: ['CFO e controladoria', 'Contabilidade e departamento pessoal', 'Diretoria jurídica'],
    perguntas: [
      {
        q: 'A revisão interfere na rotina do departamento pessoal?',
        a: 'Não. O trabalho é feito sobre arquivos e relatórios já existentes; ajustes de parametrização só são propostos depois do diagnóstico e aprovados pela empresa.',
      },
      {
        q: 'Quais dados são necessários?',
        a: 'Tabela de rubricas (S-1010), eventos de remuneração (S-1200), apurações da DCTFWeb e, quando houver, relatórios da folha do período analisado.',
      },
    ],
    keywords: ['revisão de folha de pagamento', 'rubricas eSocial', 'incidência contribuição previdenciária'],
  },
  {
    slug: 'discussao-judicial',
    numero: '02',
    titulo: 'Discussão judicial de contribuições',
    curto: 'Discussão judicial',
    resumo:
      'Mapeamento de discussões jurídicas compatíveis com a estrutura remuneratória da empresa, com racional econômico e de risco antes de qualquer ajuizamento.',
    objetivo:
      'Escolher discussões com fundamento, aderência à realidade da empresa e retorno mensurável — nunca ajuizar por ajuizar.',
    etapas: [
      {
        titulo: 'Mapeamento',
        texto:
          'Identificação das parcelas da remuneração que admitem discussão e da jurisprudência aplicável a cada uma.',
      },
      {
        titulo: 'Estratégia',
        texto:
          'Definição do caminho processual, da documentação necessária e do momento adequado, com análise de risco e de eventual sucumbência.',
      },
      {
        titulo: 'Acompanhamento',
        texto:
          'Condução do processo e orientação sobre a forma de cumprimento de eventual decisão favorável, inclusive compensação.',
      },
    ],
    entrega:
      'Decisão informada: cada discussão chega à diretoria com impacto, risco e prazo estimados.',
    paraQuem: ['Diretoria jurídica', 'CFO', 'Conselho de administração'],
    perguntas: [
      {
        q: 'Quais teses são analisadas?',
        a: 'Depende da estrutura remuneratória da empresa. As discussões cabíveis são apresentadas no diagnóstico, com o estado atual da jurisprudência de cada uma.',
      },
      {
        q: 'Existe garantia de êxito?',
        a: 'Não. Nenhuma discussão judicial tem resultado garantido; por isso o risco é medido e apresentado antes da decisão.',
      },
    ],
    keywords: ['exclusão base de cálculo contribuição previdenciária', 'ação judicial contribuição patronal'],
  },
  {
    slug: 'sat-rat',
    numero: '03',
    titulo: 'Enquadramento e reenquadramento do SAT / RAT',
    curto: 'SAT / RAT',
    resumo:
      'Validação da atividade preponderante de cada estabelecimento e do grau de risco aplicado, com simulação do efeito de eventual reenquadramento.',
    objetivo:
      'Fazer a alíquota refletir a atividade preponderante real de cada estabelecimento — nem mais, nem menos.',
    etapas: [
      {
        titulo: 'Validação cadastral',
        texto:
          'Conferência do CNAE preponderante de cada CNPJ, a partir do número de empregados e avulsos por atividade.',
      },
      {
        titulo: 'Impacto financeiro',
        texto:
          'Cálculo do custo atual e simulação do efeito de um reenquadramento tecnicamente sustentável.',
      },
      {
        titulo: 'Implementação',
        texto:
          'Orientação para o ajuste no eSocial e documentação do racional adotado, reduzindo exposição a questionamentos.',
      },
    ],
    entrega:
      'Enquadramento auditável, com memória de cálculo por estabelecimento.',
    paraQuem: ['Empresas com mais de um estabelecimento', 'Grupos com atividades distintas por unidade'],
    perguntas: [
      {
        q: 'O enquadramento é por empresa ou por estabelecimento?',
        a: 'Por estabelecimento. A Receita Federal reafirmou em 2026 (Solução de Consulta Cosit nº 124/2026) que cada unidade com CNPJ próprio apura a sua atividade preponderante.',
      },
      {
        q: 'Mudar o enquadramento altera o CNAE principal?',
        a: 'Não. A atividade preponderante serve apenas para definir a alíquota do RAT; o CNAE principal cadastrado permanece.',
      },
    ],
    keywords: ['enquadramento RAT atividade preponderante', 'GILRAT estabelecimento', 'reenquadramento SAT'],
  },
  {
    slug: 'gestao-de-risco',
    numero: '04',
    titulo: 'Gestão de risco previdenciário e afastados',
    curto: 'Risco e afastados',
    resumo:
      'Afastamentos, benefícios acidentários, FAP e prevenção de ações regressivas tratados como uma única cadeia de custo.',
    objetivo:
      'Reduzir o efeito sistêmico de cada afastamento sobre o FAP, sobre o passivo e sobre a operação.',
    etapas: [
      {
        titulo: 'Benefícios acidentários',
        texto:
          'Revisão dos benefícios concedidos com nexo acidentário e análise das medidas de contestação cabíveis.',
      },
      {
        titulo: 'FAP',
        texto:
          'Conferência dos elementos do cálculo — CATs, benefícios, massa salarial, vínculos e rotatividade — e contestação no prazo.',
      },
      {
        titulo: 'Gestão de afastados',
        texto:
          'Acompanhamento técnico-jurídico dos casos, com fluxo documental entre RH, SESMT e jurídico.',
      },
      {
        titulo: 'Ações regressivas',
        texto:
          'Atuação preventiva sobre documentação, processos e evidências que reduzem exposição futura.',
      },
    ],
    entrega:
      'Uma linha de defesa organizada antes que o afastamento vire custo recorrente.',
    paraQuem: ['RH / DHO', 'SESMT', 'Diretoria jurídica'],
    perguntas: [
      {
        q: 'Qual o prazo para contestar o FAP 2027?',
        a: 'De 1º a 30 de novembro de 2026, por formulário eletrônico, conforme a Portaria Interministerial MPS/MF nº 16/2026. A contestação não tem efeito suspensivo.',
      },
      {
        q: 'O que pode ser contestado?',
        a: 'Divergências nos elementos do cálculo: CATs, benefícios, massa salarial, número médio de vínculos e taxa média de rotatividade.',
      },
    ],
    keywords: ['contestação FAP 2027', 'nexo técnico epidemiológico', 'ação regressiva INSS'],
  },
];

export const METODO = [
  { titulo: 'Imersão e dados', texto: 'Entendimento da operação, da folha, do histórico e dos pontos de atenção.' },
  { titulo: 'Diagnóstico técnico', texto: 'Análise jurídica e financeira das oportunidades e dos riscos encontrados.' },
  { titulo: 'Business case', texto: 'Quanto custa hoje, quanto pode mudar, com qual risco e em que ordem.' },
  { titulo: 'Implementação', texto: 'Execução apenas das medidas aprovadas pela empresa, com governança e documentação.' },
  { titulo: 'Acompanhamento', texto: 'Monitoramento dos efeitos, dos riscos e de novas ocorrências.' },
] as const;

export const PUBLICO = [
  { perfil: 'CFO / Controller', dor: 'Custo previdenciário sem controle', ve: 'Quantificação e método' },
  { perfil: 'Diretoria jurídica', dor: 'Risco de autuação e de ação regressiva', ve: 'Conformidade e prevenção' },
  { perfil: 'RH / DHO', dor: 'Afastamentos e FAP desorganizados', ve: 'Processo e governança' },
  { perfil: 'Sócio em M&A', dor: 'Passivo oculto em due diligence', ve: 'Escopo de auditoria' },
] as const;

/**
 * Cenários: aritmética de alíquota, não promessa de resultado.
 * Cada valor é calculado aqui (fonte única) e exibido com a conta aberta.
 */
export const CENARIOS = [
  {
    rotulo: 'Folha',
    base: 2_000_000,
    baseTxt: 'Folha mensal de R$ 2,0 mi',
    efeito: 0.015,
    efeitoTxt: 'diferença de 1,5% da base',
    nota: 'Rubricas com incidência a maior.',
  },
  {
    rotulo: 'SAT / RAT',
    base: 3_000_000,
    baseTxt: 'Folha mensal de R$ 3,0 mi',
    efeito: 0.01,
    efeitoTxt: 'alíquota de 3% para 2% (1 p.p.)',
    nota: 'Enquadramento por estabelecimento.',
  },
  {
    rotulo: 'FAP',
    base: 3_000_000,
    baseTxt: 'Folha mensal de R$ 3,0 mi',
    efeito: 0.005,
    efeitoTxt: 'alíquota efetiva 0,5 p.p. menor',
    nota: 'Ex.: RAT 2% com FAP de 1,25 para 1,00.',
  },
].map((c) => ({ ...c, anual: Math.round(c.base * c.efeito * 12) }));

export const FAQ = [
  {
    q: 'O trabalho substitui a contabilidade ou o departamento pessoal?',
    a: 'Não. A atuação é complementar: a contabilidade e o DP continuam responsáveis pela rotina, e a AJUSTAPREV revisa critérios, quantifica efeitos e orienta correções.',
  },
  {
    q: 'Há garantia de economia ou de recuperação de valores?',
    a: 'Não. O diagnóstico existe justamente para que a empresa decida com números e riscos medidos. Nenhum resultado é prometido antes da análise documental.',
  },
  {
    q: 'O diagnóstico é confidencial?',
    a: 'Sim. Os dados são tratados sob acordo de confidencialidade e usados exclusivamente para a análise contratada.',
  },
  {
    q: 'Quais documentos são necessários para começar?',
    a: 'Em regra: tabela de rubricas e eventos de remuneração do eSocial, apurações da DCTFWeb, extrato do FAP e relação de CATs e afastamentos. A lista exata depende do escopo.',
  },
  {
    q: 'Até quando é possível rever valores pagos a maior?',
    a: 'Em regra, o direito à restituição ou compensação alcança os cinco anos anteriores ao pedido. Cada competência que passa sem revisão pode sair dessa janela.',
  },
  {
    q: 'Qual é o prazo para contestar o FAP de 2027?',
    a: 'De 1º a 30 de novembro de 2026, por formulário eletrônico nos sites da Previdência e da Receita Federal. A contestação não suspende a aplicação do índice.',
  },
] as const;
