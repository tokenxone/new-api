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
import { describe, expect, test } from 'vitest'

import {
  convertDetectedLanguage,
  normalizeInterfaceLanguage,
  toIntlLocale,
} from './languages'

describe('two-language interface', () => {
  test.each([
    'zh',
    'zh-CN',
    'zhCN',
    'zh_Hans',
    'zh-TW',
    'zhTW',
    'zh-HK',
    'zh-MO',
    'zh-Hant-TW',
  ])('maps Chinese preference %s to Simplified Chinese', (value) => {
    expect(convertDetectedLanguage(value)).toBe('zhCN')
    expect(normalizeInterfaceLanguage(value)).toBe('zhCN')
  })
  test.each(['en', 'en-US', 'fr', 'fr-FR', 'ru', 'ja', 'vi', '', 'invalid'])(
    'maps other preference %s to English',
    (value) => {
      expect(convertDetectedLanguage(value)).toBe('en')
      expect(normalizeInterfaceLanguage(value)).toBe('en')
    }
  )
  test('uses English when the saved preference is missing', () => {
    expect(normalizeInterfaceLanguage(null)).toBe('en')
    expect(normalizeInterfaceLanguage()).toBe('en')
  })
  test.each([
    ['zhCN', 'zh-CN'],
    ['zhTW', 'zh-TW'],
    ['en', 'en'],
    ['fr', 'fr'],
    ['ru', 'ru'],
    ['ja', 'ja'],
    ['vi', 'vi'],
  ])('preserves Intl compatibility for %s', (value, expected) => {
    expect(toIntlLocale(value)).toBe(expected)
  })
  test('loads only English and Simplified Chinese and resolves unsupported languages safely', async () => {
    const { default: i18n, resources } = await import('./config')
    expect(Object.keys(resources).sort()).toEqual(['en', 'zhCN'])
    await i18n.changeLanguage(convertDetectedLanguage('zhTW'))
    expect(i18n.resolvedLanguage).toBe('zhCN')
    expect(i18n.t('Change language')).toBe('更改语言')
    await i18n.changeLanguage('fr')
    expect(i18n.resolvedLanguage).toBe('en')
    expect(i18n.t('Change language')).toBe('Change language')
  })
})
