/**
 * Textos, links e contatos institucionais da loja.
 *
 * Tudo marcado como PROVISÓRIO ainda não foi fornecido pela VITTA e não deve
 * ser tratado como informação oficial. Ao receber os dados reais, edite apenas
 * este arquivo — cabeçalho, rodapé e páginas institucionais leem daqui.
 */

export interface SocialLink {
  label: string
  /** `null` enquanto o perfil oficial não for informado. */
  href: string | null
}

export const storeConfig = {
  name: 'VITTA',
  tagline: 'Decoração minimalista para casas com calma.',
  locale: 'pt-BR',
  currency: 'BRL',

  /**
   * Modo protótipo: exibe o aviso de demonstração no topo do site e na
   * confirmação do checkout. Mude para `false` apenas quando o catálogo,
   * os preços e os contatos forem reais.
   */
  demoMode: true,

  /** Quantidade de produtos exibidos em "Novidades" na página inicial. */
  newArrivalsLimit: 8,
  /** Limite de unidades de um mesmo produto no carrinho. */
  maxQuantityPerItem: 10,

  contact: {
    // PROVISÓRIO — nenhum contato oficial foi informado ainda.
    email: null as string | null,
    phone: null as string | null,
    whatsapp: null as string | null,
    hours: null as string | null,
    address: null as string | null,
  },

  social: [
    // PROVISÓRIO — preencha `href` com o endereço oficial de cada perfil.
    { label: 'Instagram', href: null },
    { label: 'Pinterest', href: null },
  ] as SocialLink[],

  /** Avisos de serviço exibidos na página inicial e no rodapé. */
  policies: {
    // PROVISÓRIO — políticas de entrega e devolução ainda não definidas.
    shipping: 'Prazos e valores de entrega serão informados quando a loja entrar em operação.',
    returns: 'A política de trocas e devoluções será publicada antes do lançamento da loja.',
  },
} as const

export const footerNavigation = {
  institutional: [
    { label: 'Sobre a VITTA', to: '/sobre' },
    { label: 'Coleções', to: '/colecoes' },
    { label: 'Todos os produtos', to: '/produtos' },
  ],
  help: [
    { label: 'Contato', to: '/contato' },
    { label: 'Entrega e devoluções', to: '/contato#entrega' },
    { label: 'Minha conta', to: '/perfil' },
  ],
}
