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
import { Code2, Terminal } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { CopyButton } from '@/components/copy-button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export function TokenXOneApiPreview() {
  const { t } = useTranslation()
  const endpoint = `${window.location.origin}/v1`
  const examples = [
    {
      id: 'curl',
      label: 'cURL',
      code: `curl ${endpoint}/chat/completions \\
  -H "Authorization: Bearer $TOKENXONE_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "YOUR_MODEL_ID",
    "messages": [
      {"role": "user", "content": "Hello"}
    ]
  }'`,
    },
    {
      id: 'python',
      label: 'Python',
      code: `import os
from openai import OpenAI

client = OpenAI(
    base_url="${endpoint}",
    api_key=os.environ["TOKENXONE_API_KEY"],
)

response = client.chat.completions.create(
    model="YOUR_MODEL_ID",
    messages=[{"role": "user", "content": "Hello"}],
)
print(response.choices[0].message.content)`,
    },
  ]
  return (
    <div
      className='tx-preview relative min-w-0'
      role='region'
      aria-label={t('API request example')}
    >
      <div className='tx-preview-heading flex items-center justify-between gap-3 border-b px-5 py-4'>
        <span className='flex items-center gap-2.5 text-sm font-medium'>
          <Terminal className='text-primary size-4' aria-hidden='true' />
          {t('Your first request')}
        </span>
        <span className='tx-example-label text-xs'>{t('Example')}</span>
      </div>
      <Tabs defaultValue='curl' className='gap-0'>
        <div className='border-border/70 flex items-center justify-between gap-2 border-b px-4 py-3'>
          <TabsList aria-label={t('Example language')}>
            {examples.map((example) => (
              <TabsTrigger key={example.id} value={example.id}>
                {example.label}
              </TabsTrigger>
            ))}
          </TabsList>
          <span className='text-muted-foreground font-mono text-[10px] sm:text-xs'>
            POST /chat/completions
          </span>
        </div>
        {examples.map((example) => (
          <TabsContent
            key={example.id}
            value={example.id}
            className='relative m-0'
          >
            <CopyButton
              value={example.code}
              aria-label={t('Copy request example')}
              className='absolute top-3 right-3 size-8'
            />
            <pre
              className='tx-code overflow-x-auto px-5 py-6 pr-14 text-[11px] leading-6 sm:text-xs'
              tabIndex={0}
              aria-label={example.label}
            >
              <code>{example.code}</code>
            </pre>
          </TabsContent>
        ))}
      </Tabs>
      <div className='tx-preview-note flex items-start gap-3 border-t px-5 py-4 text-xs leading-6'>
        <Code2
          className='text-primary mt-1 size-4 shrink-0'
          aria-hidden='true'
        />
        <p>
          {t(
            'Replace YOUR_MODEL_ID with a model from the catalog. Keep your API key on the server.'
          )}
        </p>
      </div>
    </div>
  )
}
