import type { Collection } from '../types/catalog'

/**
 * Coleções editoriais (ambientes). Referenciam produtos pelo `id`.
 * Nenhuma coleção cadastrada ainda: a seção fica oculta na página inicial e
 * a página /colecoes mostra "Coleções em breve". Exemplo de cadastro em
 * docs/EDITAR-CATALOGO.md.
 */
export const collections: Collection[] = []
