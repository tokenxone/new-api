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
import { ArrowRight, Check, Layers, KeyRound, Activity } from 'lucide-react'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'
import { useStatus } from '@/hooks/use-status'

import { TokenXOneFAQ } from './tokenxone-faq'

export function TokenXOneLanding(props: { isAuthenticated: boolean }) {
  const { t } = useTranslation()
  const { status } = useStatus()
  const destination = props.isAuthenticated ? '/dashboard' : '/sign-up'
  const docsUrl =
    typeof status?.docs_link === 'string' ? status.docs_link : '/docs'
  useEffect(() => {
    const previous = document.title
    document.title = t('TokenXOne — AI models, one connection')
    return () => {
      document.title = previous
    }
  }, [t])

  const features = [
    {
      icon: Layers,
      title: t('Unified access'),
      text: t(
        'Connect to different models through one API endpoint and reduce repeated integration work.'
      ),
    },
    {
      icon: KeyRound,
      title: t('Choose for your task'),
      text: t(
        'Compare available models and prices to find the right fit for your application.'
      ),
    },
    {
      icon: Activity,
      title: t('Understand your usage'),
      text: t(
        'Review requests and usage in the console to understand how your applications use models.'
      ),
    },
  ]
  const steps = [
    {
      title: t('Create an API key'),
      text: t('Sign in to the console and create a key for your application.'),
    },
    {
      title: t('Configure your application'),
      text: t(
        'Set your API endpoint, key and model name using the integration guide.'
      ),
    },
    {
      title: t('Make your first request'),
      text: t(
        'Check the response, then review the corresponding usage in the console.'
      ),
    },
  ]
  return (
    <main>
      <section className='relative overflow-hidden px-6 pt-28 pb-20 md:pt-40 md:pb-28'>
        <div
          aria-hidden='true'
          className='via-background pointer-events-none absolute inset-0 bg-gradient-to-br from-blue-500/10 to-violet-500/10'
        />
        <div className='relative mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2 lg:gap-20'>
          <div>
            <p className='text-primary mb-5 text-sm font-medium'>
              {t('AI APIs for developers and teams')}
            </p>
            <h1 className='text-5xl leading-[1.12] font-bold tracking-tight sm:text-6xl'>
              {t('Many models.')}
              <br />
              <span className='text-primary'>{t('One connection.')}</span>
            </h1>
            <p className='text-muted-foreground mt-6 max-w-xl text-base leading-relaxed'>
              {t(
                'Access AI models through one API. Manage keys, requests and usage in one place, from your first request to your next application.'
              )}
            </p>
            <div className='mt-8 flex flex-wrap gap-3'>
              <Button
                role='link'
                className='h-11 px-5'
                render={<Link to={destination} />}
              >
                {props.isAuthenticated
                  ? t('Go to Dashboard')
                  : t('Start building')}
                <ArrowRight aria-hidden='true' />
              </Button>
              <Button
                role='link'
                variant='outline'
                className='h-11 px-5'
                render={<Link to='/pricing' />}
              >
                {t('Models & pricing')}
              </Button>
            </div>
            <p className='text-muted-foreground mt-4 text-xs leading-relaxed'>
              {t(
                'Create an account, get an API key, and make your first request.'
              )}
            </p>
          </div>
          <aside
            className='border-border bg-card relative rounded-2xl border p-7 shadow-xl shadow-blue-950/5 md:p-9'
            aria-label={t('Integration checklist')}
          >
            <div className='border-border mb-8 flex items-center justify-between border-b pb-5'>
              <span className='text-xl font-semibold tracking-tight'>
                TokenXOne
              </span>
              <span className='text-muted-foreground font-mono text-xs'>
                API
              </span>
            </div>
            <h2 className='text-xl font-semibold'>
              {t('Integration checklist')}
            </h2>
            <ol className='mt-6 space-y-5'>
              {[
                t('Choose an available model'),
                t('Configure your endpoint'),
                t('Keep your key on the server'),
                t('Review your first request'),
              ].map((label) => (
                <li key={label} className='flex items-center gap-3 text-sm'>
                  <span className='bg-primary/10 text-primary flex size-7 shrink-0 items-center justify-center rounded-full'>
                    <Check className='size-4' aria-hidden='true' />
                  </span>
                  {label}
                </li>
              ))}
            </ol>
            <p className='text-muted-foreground border-border mt-8 border-t pt-5 text-xs leading-relaxed'>
              {t('One place to connect, choose and track.')}
            </p>
          </aside>
        </div>
      </section>
      <section className='border-border/50 border-t px-6 py-20 md:py-24'>
        <div className='mx-auto max-w-6xl'>
          <h2 className='text-3xl font-semibold tracking-tight'>
            {t('Spend your time building.')}
          </h2>
          <p className='text-muted-foreground mt-4 leading-relaxed'>
            {t(
              'From model access to everyday usage, manage it all in one place.'
            )}
          </p>
          <div className='mt-10 grid gap-8 md:grid-cols-3'>
            {features.map((feature) => (
              <article
                key={feature.title}
                className='border-border/60 rounded-xl border p-6'
              >
                <feature.icon
                  className='text-primary mb-6 size-6'
                  aria-hidden='true'
                />
                <h3 className='text-lg font-semibold'>{feature.title}</h3>
                <p className='text-muted-foreground mt-3 text-sm leading-relaxed'>
                  {feature.text}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section className='bg-muted/30 px-6 py-20'>
        <div className='mx-auto grid max-w-6xl items-center gap-8 md:grid-cols-[1fr_auto]'>
          <div>
            <h2 className='text-3xl font-semibold tracking-tight'>
              {t('The right model for your next idea.')}
            </h2>
            <p className='text-muted-foreground mt-4 max-w-2xl leading-relaxed'>
              {t(
                'Explore the models currently available on TokenXOne, with pricing and supported capabilities in one place.'
              )}
            </p>
            <p className='text-muted-foreground mt-4 max-w-2xl text-xs leading-relaxed'>
              {t(
                'Availability, capabilities and prices are shown in the live model catalog.'
              )}
            </p>
          </div>
          <Button
            role='link'
            className='h-11 justify-self-start px-5'
            render={<Link to='/pricing' />}
          >
            {t('View model catalog')}
            <ArrowRight aria-hidden='true' />
          </Button>
        </div>
      </section>
      <section className='px-6 py-20 md:py-24'>
        <div className='mx-auto max-w-6xl'>
          <h2 className='text-3xl font-semibold tracking-tight'>
            {t('Start with an API key.')}
          </h2>
          <ol className='mt-10 grid gap-10 md:grid-cols-3'>
            {steps.map((step, index) => (
              <li key={step.title}>
                <span className='text-primary mb-5 block font-mono text-sm'>
                  0{index + 1}
                </span>
                <h3 className='text-lg font-semibold'>{step.title}</h3>
                <p className='text-muted-foreground mt-3 text-sm leading-relaxed'>
                  {step.text}
                </p>
              </li>
            ))}
          </ol>
          <Button
            role='link'
            variant='outline'
            className='mt-10 h-10 px-4'
            render={<a href={docsUrl} />}
          >
            {t('Read the integration guide')}
            <ArrowRight aria-hidden='true' />
          </Button>
        </div>
      </section>
      <TokenXOneFAQ />
      <section className='bg-primary/5 px-6 py-20 text-center md:py-24'>
        <h2 className='text-3xl font-semibold tracking-tight md:text-4xl'>
          {t('Put your next idea into motion.')}
        </h2>
        <p className='text-muted-foreground mx-auto mt-5 max-w-xl leading-relaxed'>
          {t('Begin with one model request. Build from there.')}
        </p>
        <Button
          role='link'
          className='mt-8 h-11 px-5'
          render={<Link to={destination} />}
        >
          {props.isAuthenticated ? t('Go to Dashboard') : t('Start building')}
          <ArrowRight aria-hidden='true' />
        </Button>
      </section>
    </main>
  )
}
