import { Icon } from '../ui/Icon'
import { ProductImage } from './ProductImage'

interface Model3DSlotProps {
  src: string
  format: string
  poster?: string
  alt: string
}

/**
 * Ponto de integração da futura visualização 3D (GLB/glTF).
 *
 * Nesta versão nenhuma biblioteca de renderização é carregada: o espaço
 * exibe a imagem de pré-visualização e um aviso. Para ativar, substitua o
 * conteúdo deste componente por um visualizador (ex.: <model-viewer>)
 * carregado sob demanda — a galeria e os dados não precisam mudar.
 */
export function Model3DSlot({ src, format, poster, alt }: Model3DSlotProps) {
  return (
    <div className="relative size-full" data-model-src={src} data-model-format={format}>
      <ProductImage src={poster} alt={alt} />
      <div className="absolute inset-x-4 bottom-4 flex items-center gap-3 rounded-md bg-ivory/95 px-4 py-3 text-sm text-ink shadow-soft">
        <Icon name="cube" className="size-5 shrink-0 text-cocoa" />
        <span>Visualização 3D em breve.</span>
      </div>
    </div>
  )
}
