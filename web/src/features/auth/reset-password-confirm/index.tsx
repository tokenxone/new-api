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
import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from '@tanstack/react-router'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'

import { PasswordInput } from '@/components/password-input'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { api } from '@/lib/api'
import { handleServerError } from '@/lib/handle-server-error'
import { accountPasswordSchema } from '@/lib/password-policy'
import { AuthOperationError } from '@/lib/secure-verification'
import { createServerError } from '@/lib/server-error-message'

import { AuthLayout } from '../auth-layout'
import type { resetSearchSchema } from '../constants'
import { sanitizeAuthRedirect } from '../lib/auth-redirect'

export type ResetPasswordSearchParams = z.infer<typeof resetSearchSchema>
const resetSchema = z
  .object({ password: accountPasswordSchema, confirmPassword: z.string() })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match.",
    path: ['confirmPassword'],
  })

export function ResetPasswordConfirm({
  email,
  token,
  redirect,
}: ResetPasswordSearchParams) {
  const { t } = useTranslation()
  const [done, setDone] = useState(false)
  const [loading, setLoading] = useState(false)
  const form = useForm<z.infer<typeof resetSchema>>({
    resolver: zodResolver(resetSchema),
    defaultValues: { password: '', confirmPassword: '' },
  })
  const target =
    sanitizeAuthRedirect(redirect, window.location.origin) ?? undefined
  const valid = Boolean(email && token)
  async function onSubmit(data: z.infer<typeof resetSchema>) {
    if (!valid || loading) return
    setLoading(true)
    try {
      const response = await api.post(
        '/api/user/reset',
        { email, token, password: data.password },
        { skipAuthRefresh: true }
      )
      if (!response.data.success) {
        throw createServerError(response.data, t('Request failed'))
      }
      form.reset()
      setDone(true)
      // Remove the one-time secret from this history entry once consumed.
      window.history.replaceState(
        window.history.state,
        '',
        window.location.pathname
      )
    } catch (error) {
      handleServerError(AuthOperationError.from(error))
    } finally {
      setLoading(false)
    }
  }
  return (
    <AuthLayout>
      <div className='space-y-6'>
        <h2 className='text-2xl font-semibold'>{t('Reset password')}</h2>
        {done && (
          <p role='status'>
            {t('Password updated. Sign in with your new password.')}
          </p>
        )}
        {!done && !valid && (
          <p role='alert'>
            {t('Invalid reset link, please request a new password reset.')}
          </p>
        )}
        {!done && valid && (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
              <p className='text-muted-foreground text-sm'>{email}</p>
              <FormField
                control={form.control}
                name='password'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('New password')}</FormLabel>
                    <FormControl>
                      <PasswordInput autoComplete='new-password' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='confirmPassword'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('Confirm password')}</FormLabel>
                    <FormControl>
                      <PasswordInput autoComplete='new-password' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type='submit' disabled={loading} className='w-full'>
                {t('Reset password')}
              </Button>
            </form>
          </Form>
        )}
        <Link
          to={valid || done ? '/sign-in' : '/forgot-password'}
          search={{ redirect: target }}
          className='block text-sm underline underline-offset-4'
        >
          {t(valid || done ? 'Back to login' : 'Send reset email')}
        </Link>
      </div>
    </AuthLayout>
  )
}
