/**
 * Arquivos oficiais da marca VITTA. Para trocar a logo, substitua os arquivos
 * em public/brand/ mantendo os nomes, ou altere os caminhos abaixo.
 * Os originais enviados estão em brand-src/.
 */
export const brand = {
  name: 'VITTA',
  logo: {
    /** Logo horizontal (símbolo + nome), fundo transparente. Proporção ≈ 4,32:1. */
    horizontal: { src: '/brand/vitta-logo-horizontal.webp', fallback: '/brand/vitta-logo-horizontal.png', width: 769, height: 178 },
    /** Apenas o símbolo. Proporção ≈ 1,32:1. */
    symbol: { src: '/brand/vitta-simbolo.webp', fallback: '/brand/vitta-simbolo.png', width: 630, height: 479 },
  },
  colors: {
    /** Marrom da logo. */
    cocoa: '#4D4030',
    /** Dourado da logo. */
    gold: '#B89754',
  },
} as const
