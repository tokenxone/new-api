/*
Copyright (C) 2023-2026 QuantumNous

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.

For commercial licensing, please contact support@quantumnous.com
*/
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  createMemoryHistory,
  createRootRoute,
  createRouter,
  RouterProvider,
} from '@tanstack/react-router'
import { act, cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import i18next from 'i18next'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import en from '@/i18n/locales/en.json'
import zh from '@/i18n/locales/zh.json'
import { STATUS_QUERY_KEY } from '@/lib/status-query'

import { TokenXOneLanding } from '../components/tokenxone-landing'

let client: QueryClient
beforeEach(async () => {
  window.localStorage.clear()
  i18next.addResourceBundle('en', 'translation', en.translation)
  i18next.addResourceBundle('zhCN', 'translation', zh.translation)
  await i18next.changeLanguage('en')
  client = new QueryClient({
    defaultOptions: { queries: { retry: false, staleTime: Infinity } },
  })
  client.setQueryData(STATUS_QUERY_KEY, { docs_link: '/docs' })
})
afterEach(() => {
  cleanup()
  client.clear()
  window.localStorage.clear()
})
async function renderLanding(isAuthenticated = false) {
  const router = createRouter({
    routeTree: createRootRoute({
      component: () => <TokenXOneLanding isAuthenticated={isAuthenticated} />,
    }),
    history: createMemoryHistory({ initialEntries: ['/'] }),
  })
  await router.load()
  render(
    <QueryClientProvider client={client}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  )
}
describe('TokenXOne landing page', () => {
  it('updates the headline and page title when changing from English to Chinese', async () => {
    await renderLanding()
    expect(await screen.findByRole('heading', { level: 1 })).toHaveTextContent(
      'Many models.One API.'
    )
    await act(() => i18next.changeLanguage('zhCN'))
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      '多种模型，一个入口。'
    )
    expect(document.title).toBe('TokenXOne — 多模型 AI API 接入平台')
  })
  it('links signed-out visitors to registration and the model catalog', async () => {
    await renderLanding()
    const links = await screen.findAllByRole('link', { name: 'Get API key' })
    for (const link of links) {
      expect(link).toHaveAttribute('href', '/sign-up?redirect=%2Fkeys')
    }
    expect(
      screen.getByRole('link', { name: 'Explore models' })
    ).toHaveAttribute('href', '/pricing')
  })
  it('links signed-in visitors directly to API key management', async () => {
    await renderLanding(true)
    for (const link of await screen.findAllByRole('link', {
      name: 'Get API key',
    })) {
      expect(link).toHaveAttribute('href', '/keys')
    }
    expect(screen.getAllByRole('link', { name: 'Get API key' })).toHaveLength(2)
  })
  it('switches request examples with the keyboard and copies the active language', async () => {
    const user = userEvent.setup()
    await renderLanding()
    const curl = await screen.findByRole('tab', { name: 'cURL' })
    curl.focus()
    await user.keyboard('{ArrowRight}')
    const python = screen.getByRole('tab', { name: 'Python' })
    await user.keyboard('{Enter}')
    expect(python).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('tabpanel')).toHaveTextContent(
      'from openai import OpenAI'
    )
    await user.click(
      screen.getByRole('button', { name: 'Copy request example' })
    )
    expect(await navigator.clipboard.readText()).toContain(
      'from openai import OpenAI'
    )
    await act(() => i18next.changeLanguage('zhCN'))
    expect(screen.getByRole('region', { name: 'API 请求示例' })).toBeVisible()
    expect(python).toHaveAttribute('aria-selected', 'true')
  })
  it('shows the usage FAQ and keeps the model catalog accessible from Choose', async () => {
    const user = userEvent.setup()
    await renderLanding()
    expect(await screen.findByRole('link', { name: 'Choose' })).toHaveAttribute(
      'href',
      '/pricing'
    )
    await user.click(
      screen.getByRole('button', { name: 'How do I track usage?' })
    )
    expect(
      screen.getByText('View request history and usage in your dashboard.')
    ).toBeVisible()
  })
  it('opens and closes a FAQ answer with the keyboard', async () => {
    await renderLanding()
    const user = userEvent.setup()
    const trigger = await screen.findByRole('button', {
      name: 'How does pricing work?',
    })
    trigger.focus()
    await user.keyboard('{Enter}')
    expect(trigger).toHaveAttribute('aria-expanded', 'true')
    expect(
      screen.getByText(
        en.translation[
          'Pricing varies by model. Check model prices before sending requests, then review charges in your usage history.'
        ]
      )
    ).toBeVisible()
    await user.keyboard('{Enter}')
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
  })
})
