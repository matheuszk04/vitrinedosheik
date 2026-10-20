/**
 * Caminhos de arquivos em public/ são cadastrados começando com "/".
 * Esta função acrescenta o caminho-base da publicação (ex.: quando o site
 * fica em um subdiretório), sem que o catálogo precise saber disso.
 */
export function asset(path: string): string {
  if (/^(https?:)?\/\//.test(path) || path.startsWith('data:')) return path
  const base = import.meta.env.BASE_URL.replace(/\/$/, '')
  return `${base}${path.startsWith('/') ? path : `/${path}`}`
}
