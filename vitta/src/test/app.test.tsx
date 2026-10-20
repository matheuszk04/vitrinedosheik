import { act, cleanup, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { allProducts, getBestSellers, getFeatured, getProductBySlug } from '../lib/catalog'
import { matchesSearch } from '../lib/filters'
import { CART_STORAGE_KEY } from '../state/cart-storage'
import { renderApp } from './render-app'

const cartLink = () => screen.getByRole('link', { name: /^Carrinho,/ })

describe('página inicial', () => {
  it('apresenta produtos cadastrados nas seções', async () => {
    renderApp('/')
    expect(await screen.findByRole('heading', { level: 1, name: /Peças simples/ })).toBeInTheDocument()
    const featured = screen.getByRole('list', { name: 'Produtos em destaque' })
    expect(within(featured).getByText(getFeatured()[0]!.name)).toBeInTheDocument()
    const best = screen.getByRole('list', { name: 'Mais vendidos' })
    expect(within(best).getAllByTestId('product-card')).toHaveLength(getBestSellers().length)
  })
})

describe('menu lateral', () => {
  it('abre pelo botão, lista categorias do catálogo e fecha com Escape', async () => {
    const { user } = renderApp('/')
    const toggle = await screen.findByRole('button', { name: 'Abrir menu' })
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    await user.click(toggle)
    const dialog = screen.getByRole('dialog', { name: 'Menu' })
    expect(within(dialog).getByRole('link', { name: 'Iluminação' })).toHaveAttribute('href', '/categorias/iluminacao')
    expect(within(dialog).getByRole('button', { name: 'Fechar' })).toHaveFocus()
    expect(document.documentElement.style.overflow).toBe('hidden')
    await user.keyboard('{Escape}')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(document.documentElement.style.overflow).toBe('')
    expect(toggle).toHaveFocus()
  })

  it('fecha ao navegar por um link', async () => {
    const { user, router } = renderApp('/')
    await user.click(await screen.findByRole('button', { name: 'Abrir menu' }))
    await user.click(within(screen.getByRole('dialog')).getByRole('link', { name: 'Novidades' }))
    expect(router.state.location.pathname).toBe('/novidades')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})

describe('catálogo', () => {
  it('filtra pela busca da URL e mostra estado vazio', async () => {
    renderApp('/produtos?q=vaso')
    const expected = allProducts.filter((p) => matchesSearch(p, 'vaso')).length
    expect(expected).toBeGreaterThan(1)
    expect(await screen.findByTestId('result-count')).toHaveTextContent(`${expected} produtos`)
    expect(screen.getAllByTestId('product-card')).toHaveLength(expected)
    cleanup()
    renderApp('/produtos?q=xyzinexistente')
    expect(await screen.findByText('Nenhum produto encontrado')).toBeInTheDocument()
  })

  it('aplica filtro de categoria e ordena por preço', async () => {
    const { user, router } = renderApp('/produtos')
    await user.click((await screen.findAllByLabelText(/Mesa posta/))[0]!)
    expect(router.state.location.search).toContain('categoria=mesa-posta')
    await user.selectOptions(screen.getByLabelText('Ordenar'), 'price-asc')
    const grid = screen.getByRole('list', { name: 'Todos os produtos' })
    const prices = within(grid)
      .getAllByRole('heading', { level: 2 })
      .map((h) => getProductBySlug(h.querySelector('a')!.getAttribute('href')!.split('/').pop()!)!)
    expect(prices.every((p) => p.categoryId === 'mesa-posta')).toBe(true)
    expect(prices.map((p) => p.price)).toEqual(prices.map((p) => p.price).sort((a, b) => a - b))
  })
})

describe('página de produto', () => {
  it('mostra os dados do produto', async () => {
    renderApp('/produto/vaso-anfora-terracota')
    expect(await screen.findByRole('heading', { level: 1, name: 'Vaso Ânfora' })).toBeInTheDocument()
    expect(screen.getByText('Terracota')).toBeInTheDocument()
    expect(screen.getByText('38 cm')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Você também pode gostar' })).toBeInTheDocument()
  })

  it('produto sem imagens e sem atributos opcionais não exibe valores inválidos', async () => {
    const { container } = renderApp('/produto/livro-caixa-decorativo')
    expect(await screen.findByRole('img', { name: /imagem indisponível/ })).toBeInTheDocument()
    expect(container.textContent).not.toMatch(/undefined|null|NaN/)
    expect(screen.queryByText('Material')).not.toBeInTheDocument()
    expect(screen.queryByText('Cor')).not.toBeInTheDocument()
  })

  it('produto esgotado não oferece compra', async () => {
    renderApp('/produto/pratos-cru')
    expect(await screen.findByText(/Produto esgotado/)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Adicionar ao carrinho/ })).not.toBeInTheDocument()
  })

  it('slug inexistente mostra página não encontrada', async () => {
    renderApp('/produto/nao-existe')
    expect(await screen.findByRole('heading', { level: 1, name: 'Página não encontrada' })).toBeInTheDocument()
  })
})

describe('carrinho', () => {
  it('adiciona com quantidade, confirma, atualiza o cabeçalho e persiste', async () => {
    const { user, unmount } = renderApp('/produto/vaso-anfora-terracota')
    await user.click(await screen.findByRole('button', { name: 'Aumentar quantidade de Vaso Ânfora' }))
    await user.click(screen.getByRole('button', { name: /Adicionar ao carrinho/ }))
    expect(screen.getByText('2 unidades adicionadas ao carrinho.')).toBeInTheDocument()
    expect(cartLink()).toHaveAccessibleName('Carrinho, 2 itens')
    expect(JSON.parse(localStorage.getItem(CART_STORAGE_KEY)!).items).toEqual([{ productId: 'p-001', quantity: 2 }])

    unmount()
    renderApp('/carrinho')
    expect(await screen.findByTestId('summary-subtotal')).toHaveTextContent('579,80')
    expect(cartLink()).toHaveAccessibleName('Carrinho, 2 itens')
  })

  it('altera quantidades, recalcula e remove itens', async () => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify({ version: 1, items: [{ productId: 'p-001', quantity: 1 }, { productId: 'p-006', quantity: 2 }] }))
    const { user } = renderApp('/carrinho')
    expect(await screen.findByTestId('summary-total')).toHaveTextContent('469,70') // 289,90 + 2 × 89,90
    await user.click(screen.getByRole('button', { name: 'Aumentar quantidade de Vaso Ânfora' }))
    expect(screen.getByTestId('summary-total')).toHaveTextContent('759,60')
    await user.click(screen.getByRole('button', { name: 'Remover Vela aromática Âmbar do carrinho' }))
    expect(screen.getAllByTestId('cart-line')).toHaveLength(1)
    expect(screen.getByTestId('summary-total')).toHaveTextContent('579,80')
    await user.click(screen.getByRole('button', { name: 'Remover Vaso Ânfora do carrinho' }))
    expect(screen.getByRole('heading', { name: 'Seu carrinho está vazio' })).toBeInTheDocument()
  })

  it('descarta itens guardados que não existem mais no catálogo e avisa', async () => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify({ version: 1, items: [{ productId: 'removido', quantity: 1 }, { productId: 'p-002', quantity: 1 }] }))
    renderApp('/carrinho')
    expect(await screen.findByText(/não estão mais no catálogo|não está mais|foram removidos/)).toBeInTheDocument()
    expect(screen.getAllByTestId('cart-line')).toHaveLength(1)
  })

  it('bloqueia o checkout com item esgotado no carrinho', async () => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify({ version: 1, items: [{ productId: 'p-010', quantity: 1 }] }))
    renderApp('/carrinho')
    expect(await screen.findByText('Remova os itens indisponíveis para continuar.')).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Continuar para o checkout' })).not.toBeInTheDocument()
  })
})

describe('checkout demonstrativo', () => {
  it('valida campos e conclui como simulação, esvaziando o carrinho', async () => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify({ version: 1, items: [{ productId: 'p-004', quantity: 1 }] }))
    const { user, router } = renderApp('/checkout')
    await user.click(await screen.findByRole('button', { name: 'Simular pedido' }))
    expect(screen.getByRole('alert')).toHaveTextContent('Corrija 10 campos')
    expect(screen.getByLabelText('E-mail')).toHaveAttribute('aria-invalid', 'true')

    await user.type(screen.getByLabelText('Nome completo'), 'Ana Souza')
    await user.type(screen.getByLabelText('E-mail'), 'ana@exemplo.com')
    await user.type(screen.getByLabelText('Telefone'), '11987654321')
    expect(screen.getByLabelText('Telefone')).toHaveValue('(11) 98765-4321')
    await user.type(screen.getByLabelText('CEP'), '01310100')
    await user.type(screen.getByLabelText('Endereço'), 'Rua Exemplo')
    await user.type(screen.getByLabelText('Número'), '100')
    await user.type(screen.getByLabelText('Bairro'), 'Centro')
    await user.type(screen.getByLabelText('Cidade'), 'São Paulo')
    await user.selectOptions(screen.getByLabelText('Estado'), 'SP')
    await user.click(screen.getByLabelText(/Entendo que esta é uma simulação/))
    await act(async () => {
      await user.click(screen.getByRole('button', { name: 'Simular pedido' }))
    })

    expect(router.state.location.pathname).toBe('/checkout/confirmacao')
    expect(await screen.findByRole('heading', { level: 1, name: /Simulação concluída, Ana/ })).toBeInTheDocument()
    expect(screen.getByText(/Nenhum pedido foi criado/)).toBeInTheDocument()
    expect(screen.getByTestId('demo-reference')).toHaveTextContent(/^DEMO-/)
    expect(cartLink()).toHaveAccessibleName('Carrinho, 0 itens')
  })
})

describe('perfil', () => {
  it('é apenas demonstrativo, sem formulário de login', async () => {
    renderApp('/perfil')
    expect(await screen.findByText(/não há login nem cadastro/)).toBeInTheDocument()
    expect(document.querySelector('input[type="password"]')).toBeNull()
  })
})
