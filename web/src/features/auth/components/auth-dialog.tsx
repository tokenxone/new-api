import { useRouterState } from '@tanstack/react-router'
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
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Dialog } from '@/components/dialog'
import { useAuthStore } from '@/stores/auth-store'

import { authTitles } from '../constants'
import { AuthPanel, type AuthMode } from './auth-panel'

export default function AuthDialog({
  open,
  onOpenChange,
  initialMode = 'sign-in',
  redirectTo,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialMode?: AuthMode
  redirectTo?: string
}) {
  const { t } = useTranslation()
  const [mode, setMode] = useState<AuthMode>(initialMode)
  const user = useAuthStore((state) => state.auth.user)
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  })
  useEffect(() => {
    if (open) setMode(initialMode)
  }, [open, initialMode])
  useEffect(() => {
    if (user) onOpenChange(false)
  }, [user, onOpenChange])
  const initialPath = useRef(pathname)
  // MFA and successful navigation leave the dialog and continue in the routed flow.
  useEffect(() => {
    if (pathname !== initialPath.current) onOpenChange(false)
  }, [pathname, onOpenChange])
  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title={t(authTitles[mode])}
      titleClassName='text-2xl font-semibold'
      contentClassName='sm:max-w-[460px] max-h-[calc(100dvh-2rem)]'
      contentHeight='auto'
    >
      <AuthPanel
        key={mode}
        mode={mode}
        redirectTo={redirectTo}
        onModeChange={setMode}
        showTitle={false}
      />
    </Dialog>
  )
}
