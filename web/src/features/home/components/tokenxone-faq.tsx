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
      question: t('What is TokenXOne?'),
      answer: t(
        'TokenXOne is an AI model access and management platform. Use its API to call available models and the console to manage keys and review usage.'
      ),
    },
    {
      question: t('How do I get started?'),
      answer: t(
        'Create an account, follow the setup instructions in the console, and create an API key. Then follow the integration guide to send a request.'
      ),
    },
    {
      question: t('Which models are available?'),
      answer: t(
        'Visit Models & pricing for the current model catalog, capabilities and pricing information.'
      ),
    },
    {
      question: t('How does pricing work?'),
      answer: t(
        'Pricing varies by model. Check the applicable pricing before making requests and review your usage in the console.'
      ),
    },
    {
      question: t('Can I connect an existing application?'),
      answer: t(
        'Applications with configurable API endpoints and keys can be set up using the integration guide. Compatibility depends on the API and model capabilities they use.'
      ),
    },
    {
      question: t('How should I store my API key?'),
      answer: t(
        'Keep keys on your server or in a secure configuration environment. Never put them in public repositories, browser code or shared files.'
      ),
    },
  ]
  return (
    <section id='faq' className='border-border/50 border-t px-6 py-20'>
      <div className='mx-auto max-w-3xl'>
        <h2 className='mb-8 text-3xl font-semibold tracking-tight'>
          {t('Frequently asked questions')}
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
