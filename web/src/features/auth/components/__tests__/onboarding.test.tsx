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
  createRoute,
  createRouter,
  Outlet,
  RouterProvider,
} from '@tanstack/react-router'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'

import { api } from '@/lib/api'
import { STATUS_QUERY_KEY } from '@/lib/status-query'
import { useAuthStore, type AuthBundle } from '@/stores/auth-store'

import { sanitizeAuthRedirect } from '../../lib/auth-redirect'
import { ResetPasswordConfirm } from '../../reset-password-confirm'
import AuthDialog from '../auth-dialog'
import { AuthPanel, type AuthMode } from '../auth-panel'

const status = {
  email_verification: true,
  password_login_enabled: true,
  github_oauth: true,
  github_client_id: 'github-test',
  oidc_enabled: true,
  oidc_display_name: 'Google',
  oidc_client_id: 'google-test',
  oidc_authorization_endpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
}
const bundle: AuthBundle = {
  access_token: 'test-access',
  token_type: 'Bearer',
  access_expires_at: 9999999999,
  user: { id: 42, username: 'email-user', role: 1 },
  session: {
    sid: 'test-session',
    current: true,
    login_method: 'password',
    ip: '',
    user_agent: '',
    created_at: 1,
    last_active_at: 1,
    expires_at: 9999999999,
  },
}
const clients: QueryClient[] = []
beforeEach(() => {
  localStorage.clear()
  sessionStorage.clear()
  useAuthStore.getState().auth.reset('complete')
  vi.spyOn(api, 'get').mockResolvedValue({ data: { success: true } })
  vi.spyOn(api, 'post').mockResolvedValue({ data: { success: true } })
})
afterEach(() => {
  clients.forEach((client) => client.clear())
  clients.length = 0
  vi.restoreAllMocks()
  useAuthStore.getState().auth.reset('complete')
})
function renderFlow(mode: AuthMode = 'sign-in', modal = false, reset = false) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, staleTime: Infinity } },
  })
  client.setQueryData(STATUS_QUERY_KEY, status)
  clients.push(client)
  function Harness() {
    const [currentMode, setMode] = useState(mode)
    const [open, setOpen] = useState(false)
    if (reset) {
      return (
        <ResetPasswordConfirm
          email='member@example.com'
          token='reset-test'
          redirect='/pricing?view=grid'
        />
      )
    }
    if (modal) {
      return (
        <>
          <button type='button' onClick={() => setOpen(true)}>
            Open authentication
          </button>
          <AuthDialog
            open={open}
            onOpenChange={setOpen}
            initialMode={mode}
            redirectTo='/pricing?view=grid'
          />
        </>
      )
    }
    return (
      <AuthPanel
        mode={currentMode}
        onModeChange={setMode}
        redirectTo='/pricing?view=grid'
      />
    )
  }
  const root = createRootRoute({ component: Outlet })
  const router = createRouter({
    routeTree: root.addChildren([
      createRoute({
        getParentRoute: () => root,
        path: '/',
        component: Harness,
      }),
      createRoute({
        getParentRoute: () => root,
        path: '/pricing',
        component: () => <h1>Models destination</h1>,
      }),
      createRoute({
        getParentRoute: () => root,
        path: '/sign-in',
        component: () => <h1>Sign-in destination</h1>,
      }),
    ]),
    history: createMemoryHistory({ initialEntries: ['/'] }),
  })
  render(
    <QueryClientProvider client={client}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  )
  return router
}
it('shares registration, login and recovery in a dialog, supports Escape and restores focus', async () => {
  const user = userEvent.setup()
  renderFlow('sign-in', true)
  const opener = await screen.findByRole('button', {
    name: 'Open authentication',
  })
  await user.click(opener)
  expect(await screen.findByRole('dialog', { name: 'Sign in' })).toBeVisible()
  await user.click(screen.getByRole('link', { name: 'Sign up' }))
  expect(
    await screen.findByRole('dialog', { name: 'Create an account' })
  ).toBeVisible()
  expect(
    screen.getByRole('button', { name: 'Continue with Google' })
  ).toBeEnabled()
  expect(screen.queryByLabelText('Username')).not.toBeInTheDocument()
  await user.click(screen.getByRole('link', { name: 'Sign in' }))
  await user.click(screen.getByRole('link', { name: 'Forgot password?' }))
  expect(
    await screen.findByRole('dialog', { name: 'Forgot password' })
  ).toBeVisible()
  await user.keyboard('{Escape}')
  await waitFor(() =>
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  )
  await waitFor(() => expect(opener).toHaveFocus())
})
it('registers a verified email without a username and returns to sign in', async () => {
  const user = userEvent.setup()
  renderFlow('sign-up')
  await user.type(
    await screen.findByLabelText('Email (required for verification)'),
    'member@example.com'
  )
  await user.click(screen.getByRole('button', { name: 'Send code' }))
  await waitFor(() =>
    expect(api.get).toHaveBeenCalledWith(
      '/api/verification',
      expect.objectContaining({
        params: expect.objectContaining({ email: 'member@example.com' }),
      })
    )
  )
  await user.type(screen.getByLabelText('Verification code'), 'abcdef')
  await user.type(
    screen.getByLabelText('Password', { exact: true }),
    'new-password-123'
  )
  await user.type(
    screen.getByLabelText('Confirm password', { exact: true }),
    'new-password-123'
  )
  await user.click(screen.getByRole('button', { name: 'Create account' }))
  await waitFor(() =>
    expect(api.post).toHaveBeenCalledWith(
      '/api/user/register',
      expect.objectContaining({
        username: '',
        email: 'member@example.com',
        verification_code: 'abcdef',
      }),
      expect.anything()
    )
  )
  expect(await screen.findByRole('heading', { name: 'Sign in' })).toBeVisible()
})
it('preserves the destination after an email and password login', async () => {
  vi.mocked(api.post).mockResolvedValue({
    data: { success: true, data: bundle },
  })
  const user = userEvent.setup()
  const router = renderFlow()
  await user.type(
    await screen.findByLabelText('Username or Email'),
    'member@example.com'
  )
  await user.type(
    screen.getByLabelText('Password', { exact: true }),
    'current-password'
  )
  await user.click(screen.getByRole('button', { name: /^Sign in$/ }))
  expect(
    await screen.findByRole('heading', { name: 'Models destination' })
  ).toBeVisible()
  expect(router.state.location.href).toBe('/pricing?view=grid')
})
it('sends the destination with recovery email and shows an enumeration-safe response', async () => {
  const user = userEvent.setup()
  renderFlow('forgot-password')
  await user.type(await screen.findByLabelText('Email'), 'member@example.com')
  await user.click(screen.getByRole('button', { name: 'Send reset email' }))
  expect(await screen.findByRole('status')).toHaveTextContent(
    'If this email is registered'
  )
  expect(api.get).toHaveBeenCalledWith(
    '/api/reset_password',
    expect.objectContaining({
      params: expect.objectContaining({ redirect: '/pricing?view=grid' }),
    })
  )
})
it.each(['github', 'oidc'])(
  'starts %s OAuth with state and preserves its destination',
  async (provider) => {
    vi.mocked(api.post).mockImplementation(async (url) => ({
      data: {
        success: true,
        ...(url === '/api/oauth/state' ? { data: 'flow-test' } : {}),
      },
    }))
    const open = vi.spyOn(window, 'open').mockReturnValue(null)
    const user = userEvent.setup()
    renderFlow()
    await user.click(
      await screen.findByRole('button', {
        name:
          provider === 'github'
            ? 'Continue with GitHub'
            : 'Continue with Google',
      })
    )
    await waitFor(() => expect(open).toHaveBeenCalled())
    const url = new URL(String(open.mock.calls[0][0]))
    expect(url.searchParams.get('state')).toBe('flow-test')
    expect(url.hostname).toBe(
      provider === 'github' ? 'github.com' : 'accounts.google.com'
    )
    expect(sessionStorage.getItem('oauth_login_redirect:flow-test')).toBe(
      '/pricing?view=grid'
    )
  }
)
it('requires matching passwords and submits a chosen password without exposing it in results', async () => {
  const user = userEvent.setup()
  renderFlow('sign-in', false, true)
  await user.type(
    await screen.findByLabelText('New password', { exact: true }),
    'chosen-password'
  )
  await user.type(
    screen.getByLabelText('Confirm password', { exact: true }),
    'different-password'
  )
  await user.click(screen.getByRole('button', { name: 'Reset password' }))
  expect(await screen.findByText("Passwords don't match.")).toBeVisible()
  expect(api.post).not.toHaveBeenCalled()
  await user.clear(screen.getByLabelText('Confirm password', { exact: true }))
  await user.type(
    screen.getByLabelText('Confirm password', { exact: true }),
    'chosen-password'
  )
  await user.click(screen.getByRole('button', { name: 'Reset password' }))
  expect(await screen.findByRole('status')).toHaveTextContent(
    'Password updated'
  )
  expect(screen.queryByDisplayValue('chosen-password')).not.toBeInTheDocument()
  expect(api.post).toHaveBeenCalledWith(
    '/api/user/reset',
    {
      email: 'member@example.com',
      token: 'reset-test',
      password: 'chosen-password',
    },
    expect.anything()
  )
  expect(
    screen.getByRole('link', { name: 'Back to login' }).getAttribute('href')
  ).toContain('redirect=')
})
it('rejects auth destinations so successful login cannot loop back into authentication', () => {
  for (const target of [
    '/sign-in?redirect=/sign-in',
    '/sign-up',
    '/oauth/github',
    '/user/reset',
    '/otp',
  ]) {
    expect(sanitizeAuthRedirect(target, 'https://example.com')).toBeNull()
  }
})
