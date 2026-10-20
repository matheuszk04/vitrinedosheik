import { expect, test, type Page } from '@playwright/test'
import { categories } from '../src/data/categories'
import { products } from '../src/data/products'

// Os cenários se baseiam no catálogo real, sem nomes fixos: continuam válidos quando ele muda.
const purchasable = products.filter((p) => p.stockStatus !== 'out_of_stock')
const [first, second] = purchasable
if (!first || !second) throw new Error('Os testes precisam de ao menos dois produtos à venda.')
const brl = (n: number) => n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const categoryCount = (id: string) => products.filter((p) => p.categoryId === id).length
const menuCategory = categories.find((c) => categoryCount(c.id) > 0)!
const filterCategory = [...categories].sort((a, b) => categoryCount(b.id) - categoryCount(a.id))[0]!
const searchTarget = products.find((p) => products.filter((o) => o.name.split(' ')[0] === p.name.split(' ')[0]).length === 1) ?? first
const searchWord = searchTarget.name.split(' ')[0]!

const consoleProblems = (page: Page) => {
  const problems: string[] = []
  page.on('console', (m) => {
    if (m.type() === 'error' || m.type() === 'warning') problems.push(m.text())
  })
  page.on('pageerror', (e) => problems.push(e.message))
  return problems
}

const noHorizontalScroll = async (page: Page) =>
  expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(0)

test('página inicial carrega com produtos, logo oficial e sem erros', async ({ page }) => {
  const problems = consoleProblems(page)
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Peças simples')
  await expect(page.getByRole('link', { name: 'VITTA — página inicial' }).locator('img')).toHaveJSProperty('complete', true)
  expect(await page.getByRole('link', { name: 'VITTA — página inicial' }).locator('img').evaluate((i: HTMLImageElement) => i.naturalWidth)).toBeGreaterThan(0)
  await expect(page.getByTestId('product-card').first()).toBeVisible()
  await noHorizontalScroll(page)
  expect(problems).toEqual([])
})

test('menu lateral abre, navega e fecha com Escape', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Abrir menu' }).click()
  const menu = page.getByRole('dialog', { name: 'Menu' })
  await expect(menu).toBeVisible()
  await expect(menu.getByRole('button', { name: 'Fechar' })).toBeFocused()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('button', { name: 'Abrir menu' })).toBeFocused()
  await expect(menu).toBeHidden()

  await page.getByRole('button', { name: 'Abrir menu' }).click()
  await menu.getByRole('link', { name: menuCategory.name, exact: true }).click()
  await expect(page).toHaveURL(new RegExp(`/categorias/${menuCategory.slug}$`))
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(menuCategory.name)
  await expect(menu).toBeHidden()
  // A rolagem da página volta a funcionar depois de fechar.
  expect(await page.evaluate(() => document.documentElement.style.overflow)).toBe('')
})

test('busca do cabeçalho sugere produtos e leva ao catálogo filtrado', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Buscar produtos' }).click()
  // O campo recebe o foco ao abrir: basta digitar.
  await expect(page.getByRole('searchbox', { name: 'Buscar produtos' })).toBeFocused()
  await page.keyboard.type(searchWord)
  await expect(page.getByRole('list', { name: 'Sugestões de produtos' }).getByRole('link', { name: searchTarget.name })).toBeVisible()
  await page.keyboard.press('Enter')
  await expect(page).toHaveURL(/\/produtos\?q=/)
  await expect(page.getByText(searchTarget.name, { exact: true }).first()).toBeVisible()
})

test('filtros e ordenação do catálogo produzem resultados coerentes', async ({ page, isMobile }) => {
  await page.goto('/produtos')
  if (isMobile) await page.getByRole('button', { name: /Filtros/ }).click()
  const scope = isMobile ? page.getByRole('dialog', { name: 'Filtros' }) : page.getByRole('complementary', { name: 'Filtros' })
  await scope.getByText(filterCategory.name, { exact: true }).click()
  if (isMobile) await page.getByRole('button', { name: /^Ver \d+ produtos?$/ }).click()
  await page.getByLabel('Ordenar').selectOption('price-desc')
  await expect(page).toHaveURL(new RegExp(`categoria=${filterCategory.id}`))

  const cards = page.getByTestId('product-card')
  await expect(cards).toHaveCount(categoryCount(filterCategory.id))
  const values = (await cards.evaluateAll((els) => els.map((el) => el.querySelector('.tabular-nums')!.textContent!)))
    .map((t) => Number(t.replace(/[^\d,]/g, '').replace(',', '.')))
  expect(values).toEqual([...values].sort((a, b) => b - a))

  await page.getByRole('button', { name: 'Limpar filtros' }).click()
  await expect(cards).toHaveCount(Math.min(products.length, 24))
})

test('compra completa: produto → carrinho → persistência → checkout simulado', async ({ page }) => {
  const problems = consoleProblems(page)
  await page.goto(`/produto/${first.slug}`)
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(first.name)
  await page.getByRole('button', { name: `Aumentar quantidade de ${first.name}` }).click()
  await page.getByRole('button', { name: /Adicionar ao carrinho|Encomendar/ }).click()
  await expect(page.getByText('2 unidades adicionadas ao carrinho.')).toBeVisible()
  await expect(page.getByTestId('cart-count')).toHaveText('2')

  await page.goto(`/produto/${second.slug}`)
  await page.getByRole('button', { name: /Adicionar ao carrinho|Encomendar/ }).click()
  await expect(page.getByTestId('cart-count')).toHaveText('3')

  await page.goto('/carrinho')
  await expect(page.getByTestId('summary-total')).toHaveText(new RegExp(brl(2 * first.price + second.price).replace('.', '\\.')))

  // Persistência após recarregar.
  await page.reload()
  await expect(page.getByTestId('cart-line')).toHaveCount(2)
  await expect(page.getByTestId('cart-count')).toHaveText('3')

  await page.getByRole('button', { name: `Diminuir quantidade de ${first.name}` }).click()
  await expect(page.getByTestId('summary-total')).toHaveText(new RegExp(brl(first.price + second.price).replace('.', '\\.')))
  await page.getByRole('button', { name: `Remover ${second.name} do carrinho` }).click()
  await expect(page.getByTestId('summary-total')).toHaveText(new RegExp(brl(first.price).replace('.', '\\.')))

  await page.getByRole('link', { name: 'Continuar para o checkout' }).click()
  await page.getByRole('button', { name: 'Simular pedido' }).click()
  await expect(page.getByRole('alert')).toContainText('Corrija')
  await page.getByLabel('Nome completo').fill('Ana Souza')
  await page.getByLabel('E-mail').fill('ana@exemplo.com')
  await page.getByLabel('Telefone').pressSequentially('11987654321')
  await page.getByLabel('CEP').pressSequentially('01310100')
  await page.getByLabel('Endereço').fill('Rua Exemplo')
  await page.getByLabel('Número').fill('100')
  await page.getByLabel('Bairro').fill('Centro')
  await page.getByLabel('Cidade').fill('São Paulo')
  await page.getByLabel('Estado').selectOption('SP')
  await page.getByLabel(/Entendo que esta é uma simulação/).check()
  await page.getByRole('button', { name: 'Simular pedido' }).click()

  await expect(page).toHaveURL(/\/checkout\/confirmacao$/)
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Simulação concluída')
  await expect(page.getByText(/Nenhum pedido foi criado/)).toBeVisible()
  await expect(page.getByTestId('demo-reference')).toHaveText(/^DEMO-/)
  await expect(page.getByTestId('cart-count')).toHaveCount(0)
  expect(problems).toEqual([])
})

test('produto sem imagem mantém o layout e não exibe valores inválidos', async ({ page }) => {
  const noImage = products.find((p) => p.images.length === 0)
  test.skip(!noImage, 'Todos os produtos têm foto.')
  await page.goto(`/produto/${noImage!.slug}`)
  await expect(page.getByRole('img', { name: /imagem indisponível/ }).first()).toBeVisible()
  await expect(page.locator('main')).not.toContainText(/undefined|null|NaN/)
  await noHorizontalScroll(page)
})

test('páginas principais respondem sem rolagem horizontal', async ({ page }) => {
  for (const path of ['/', '/produtos', '/novidades', '/mais-vendidos', '/categorias', `/categorias/${menuCategory.slug}`, '/colecoes', `/produto/${first.slug}`, '/carrinho', '/perfil', '/sobre', '/contato', '/rota-inexistente']) {
    await page.goto(path)
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    await noHorizontalScroll(page)
  }
})
