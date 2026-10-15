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
import { useTranslation } from 'react-i18next'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

export function TokenXOneFAQ() {
  const { t } = useTranslation()
  const items = [
    {
      question: t('How does pricing work?'),
      answer: t(
        'Pricing varies by model. Check model prices before sending requests, then review charges in your usage history.'
      ),
    },
    {
      question: t('Can I use my existing app?'),
      answer: t(
        'If your app supports a custom API base URL and API key, you can configure it to use TokenXOne. Compatibility depends on the API and model features your app needs.'
      ),
    },
    {
      question: t('How do I track usage?'),
      answer: t('View request history and usage in your dashboard.'),
    },
  ]
  return (
    <section id='faq' className='border-border/50 border-t px-6 py-20'>
      <div className='mx-auto max-w-3xl'>
        <h2 className='mb-8 text-3xl font-semibold tracking-tight'>
          {t('FAQs')}
        </h2>
        <Accordion>
          {items.map((item) => (
            <AccordionItem key={item.question} value={item.question}>
              <AccordionTrigger className='py-5 text-base'>
                {item.question}
              </AccordionTrigger>
              <AccordionContent className='text-muted-foreground pb-5 leading-relaxed'>
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  )
}
