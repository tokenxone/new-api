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
import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'

import { useStatus } from '@/hooks/use-status'

import { authTitles } from '../constants'
import { ForgotPasswordForm } from '../forgot-password/components/forgot-password-form'
import { UserAuthForm } from '../sign-in/components/user-auth-form'
import { SignUpForm } from '../sign-up/components/sign-up-form'
import { TermsFooter } from './terms-footer'

export type AuthMode = 'sign-in' | 'sign-up' | 'forgot-password'

type Props = {
  mode: AuthMode
  redirectTo?: string
  onModeChange?: (mode: AuthMode) => void
  showTitle?: boolean
}

export function AuthPanel({
  mode,
  redirectTo,
  onModeChange,
  showTitle = true,
}: Props) {
  const { t } = useTranslation()
  const { status } = useStatus()
  const otherMode = mode === 'sign-in' ? 'sign-up' : 'sign-in'
  let accountPrompt = ''
  if (mode === 'sign-in') accountPrompt = t("Don't have an account?")
  if (mode === 'sign-up') accountPrompt = t('Already have an account?')
  return (
    <div className='w-full space-y-6'>
      <div className='space-y-2'>
        {showTitle && (
          <h2 className='text-2xl font-semibold tracking-tight'>
            {t(authTitles[mode])}
          </h2>
        )}
        {mode === 'forgot-password' && (
          <p className='text-muted-foreground text-sm'>
            {t(
              'Enter your registered email and we will send you a link to reset your password.'
            )}
          </p>
        )}
        <p className='text-muted-foreground text-sm'>
          {accountPrompt}{' '}
          <Link
            to={otherMode === 'sign-up' ? '/sign-up' : '/sign-in'}
            search={{ redirect: redirectTo }}
            onClick={
              onModeChange
                ? (event) => {
                    event.preventDefault()
                    onModeChange(otherMode)
                  }
                : undefined
            }
            className='text-foreground font-medium underline underline-offset-4'
          >
            {t(otherMode === 'sign-up' ? 'Sign up' : 'Sign in')}
          </Link>
        </p>
      </div>
      {mode === 'sign-in' && (
        <UserAuthForm
          redirectTo={redirectTo}
          onForgotPassword={
            onModeChange ? () => onModeChange('forgot-password') : undefined
          }
        />
      )}
      {mode === 'sign-up' && (
        <SignUpForm
          redirectTo={redirectTo}
          onRegistered={
            onModeChange ? () => onModeChange('sign-in') : undefined
          }
        />
      )}
      {mode === 'forgot-password' && (
        <ForgotPasswordForm redirectTo={redirectTo} />
      )}
      {mode !== 'forgot-password' && (
        <TermsFooter variant={mode} status={status} className='text-center' />
      )}
    </div>
  )
}
