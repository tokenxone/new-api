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
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import i18next from 'i18next'
import { afterEach, expect, it } from 'vitest'

import en from '@/i18n/locales/en.json'
import zh from '@/i18n/locales/zh.json'

import { LanguageSwitcher } from '../language-switcher'

afterEach(() => cleanup())

it('offers only Simplified Chinese and English and switches between them', async () => {
  i18next.addResourceBundle('en', 'translation', en.translation)
  i18next.addResourceBundle('zhCN', 'translation', zh.translation)
  await i18next.changeLanguage('en')
  const user = userEvent.setup()
  render(<LanguageSwitcher />)
  await user.click(screen.getByRole('button', { name: 'Change language' }))
  expect(
    screen.getAllByRole('menuitem').map((item) => item.textContent)
  ).toEqual(['简体中文', 'English'])
  await user.click(screen.getByRole('menuitem', { name: '简体中文' }))
  expect(i18next.language).toBe('zhCN')
  await user.click(screen.getByRole('button', { name: '更改语言' }))
  await user.click(screen.getByRole('menuitem', { name: 'English' }))
  expect(i18next.language).toBe('en')
})
