import { expect, test, type Page } from '@playwright/test'

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
  await menu.getByRole('link', { name: 'Iluminação' }).click()
  await expect(page).toHaveURL(/\/categorias\/iluminacao$/)
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Iluminação')
  await expect(menu).toBeHidden()
  // A rolagem da página volta a funcionar depois de fechar.
  expect(await page.evaluate(() => document.documentElement.style.overflow)).toBe('')
})

test('busca do cabeçalho sugere produtos e leva ao catálogo filtrado', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Buscar produtos' }).click()
  // O campo recebe o foco ao abrir: basta digitar.
  await expect(page.getByRole('searchbox', { name: 'Buscar produtos' })).toBeFocused()
  await page.keyboard.type('luminaria')
  await expect(page.getByRole('list', { name: 'Sugestões de produtos' }).getByRole('link', { name: /Luminária de mesa Lume/ })).toBeVisible()
  await page.keyboard.press('Enter')
  await expect(page).toHaveURL(/\/produtos\?q=luminaria/)
  await expect(page.getByTestId('result-count')).toHaveText(/1 produto/)
})

test('filtros e ordenação do catálogo produzem resultados coerentes', async ({ page, isMobile }) => {
  await page.goto('/produtos')
  if (isMobile) await page.getByRole('button', { name: /Filtros/ }).click()
  const scope = isMobile ? page.getByRole('dialog', { name: 'Filtros' }) : page.getByRole('complementary', { name: 'Filtros' })
  await scope.getByText('Mesa posta', { exact: true }).click()
  await scope.getByText('Ocultar esgotados').click()
  if (isMobile) await page.getByRole('button', { name: /^Ver \d+ produtos?$/ }).click()
  await page.getByLabel('Ordenar').selectOption('price-desc')
  await expect(page).toHaveURL(/categoria=mesa-posta/)

  const cards = page.getByTestId('product-card')
  await expect(cards).toHaveCount(3)
  await expect(page.getByText('Jogo de pratos Cru')).toHaveCount(0)
  const values = (await cards.evaluateAll((els) => els.map((el) => el.querySelector('.tabular-nums')!.textContent!)))
    .map((t) => Number(t.replace(/[^\d,]/g, '').replace(',', '.')))
  expect(values).toHaveLength(3)
  expect(values).toEqual([...values].sort((a, b) => b - a))

  await page.getByRole('button', { name: 'Limpar filtros' }).click()
  await expect(cards).toHaveCount(17)
})

test('compra completa: produto → carrinho → persistência → checkout simulado', async ({ page }) => {
  const problems = consoleProblems(page)
  await page.goto('/produto/luminaria-lume')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Luminária de mesa Lume')
  await expect(page.getByText('Cerâmica e linho')).toBeVisible()
  await page.getByRole('button', { name: 'Aumentar quantidade de Luminária de mesa Lume' }).click()
  await page.getByRole('button', { name: /Adicionar ao carrinho/ }).click()
  await expect(page.getByText('2 unidades adicionadas ao carrinho.')).toBeVisible()
  await expect(page.getByTestId('cart-count')).toHaveText('2')

  await page.goto('/produto/vela-ambar')
  await page.getByRole('button', { name: /Adicionar ao carrinho/ }).click()
  await expect(page.getByTestId('cart-count')).toHaveText('3')

  await page.goto('/carrinho')
  await expect(page.getByTestId('summary-total')).toHaveText(/987,90/) // 2 × 449 + 89,90

  // Persistência após recarregar.
  await page.reload()
  await expect(page.getByTestId('cart-line')).toHaveCount(2)
  await expect(page.getByTestId('cart-count')).toHaveText('3')

  await page.getByRole('button', { name: 'Diminuir quantidade de Luminária de mesa Lume' }).click()
  await expect(page.getByTestId('summary-total')).toHaveText(/538,90/)
  await page.getByRole('button', { name: 'Remover Vela aromática Âmbar do carrinho' }).click()
  await expect(page.getByTestId('summary-total')).toHaveText(/449,00/)

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

test('produto sem imagem e sem atributos opcionais mantém o layout', async ({ page }) => {
  await page.goto('/produto/livro-caixa-decorativo')
  await expect(page.getByRole('img', { name: /imagem indisponível/ }).first()).toBeVisible()
  await expect(page.locator('main')).not.toContainText(/undefined|null|NaN/)
  await noHorizontalScroll(page)
})

test('páginas principais respondem sem rolagem horizontal', async ({ page }) => {
  for (const path of ['/', '/produtos', '/novidades', '/mais-vendidos', '/categorias', '/colecoes', '/colecoes/terra', '/produto/espelho-lago', '/carrinho', '/perfil', '/sobre', '/contato', '/rota-inexistente']) {
    await page.goto(path)
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    await noHorizontalScroll(page)
  }
})
