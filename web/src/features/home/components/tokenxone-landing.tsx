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
import { ArrowRight, Layers, KeyRound, Activity } from 'lucide-react'
import { lazy, Suspense, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'
import { useStatus } from '@/hooks/use-status'

import { TokenXOneApiPreview } from './tokenxone-api-preview'
import { TokenXOneFAQ } from './tokenxone-faq'

const AuthDialog = lazy(() => import('@/features/auth/components/auth-dialog'))

export function TokenXOneLanding(props: { isAuthenticated: boolean }) {
  const { t } = useTranslation()
  const [authOpen, setAuthOpen] = useState(false)
  const { status } = useStatus()
  const destination = props.isAuthenticated ? '/keys' : '/sign-up'
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
      title: t('Connect'),
      text: t('One API for multiple models.'),
    },
    {
      icon: KeyRound,
      title: t('Choose'),
      text: t('Compare capabilities and pricing.'),
    },
    {
      icon: Activity,
      title: t('Track'),
      text: t('Manage keys. Review requests and usage.'),
    },
  ]
  const steps = [
    {
      title: t('Create a key'),
      text: t('Generate an API key in your dashboard.'),
    },
    {
      title: t('Configure'),
      text: t('Set your base URL, API key, and model.'),
    },
    {
      title: t('Send a request'),
      text: t('Check the response and review your usage.'),
    },
  ]
  return (
    <main className='tx-landing'>
      {authOpen && (
        <Suspense fallback={null}>
          <AuthDialog
            open
            onOpenChange={setAuthOpen}
            initialMode='sign-up'
            redirectTo='/keys'
          />
        </Suspense>
      )}
      <section className='tx-hero relative overflow-hidden px-6 pt-32 pb-20 md:pt-44 md:pb-28'>
        <div
          aria-hidden='true'
          className='tx-hero-light pointer-events-none absolute inset-0'
        />
        <div className='relative mx-auto grid max-w-6xl items-center gap-14 lg:grid-cols-[1fr_1fr] lg:gap-16'>
          <div className='min-w-0'>
            <h1 className='text-5xl leading-[1.12] font-semibold tracking-[-0.045em] sm:text-6xl xl:text-7xl'>
              {t('Many models.')}
              <br />
              <span className='text-foreground'>{t('One connection.')}</span>
            </h1>
            <p className='text-muted-foreground mt-7 max-w-md text-base leading-8'>
              {t('Choose the model. Keep the workflow.')}
            </p>
            <div className='mt-8 flex flex-wrap gap-3'>
              <Button
                role='link'
                className='h-11 px-5'
                render={<Link to='/pricing' />}
              >
                {t('Explore models')}
              </Button>
              <Button
                role='link'
                variant='outline'
                className='h-11 px-5'
                render={
                  <Link
                    to={destination}
                    search={
                      props.isAuthenticated ? undefined : { redirect: '/keys' }
                    }
                    onClick={(event) => {
                      if (!props.isAuthenticated) {
                        event.preventDefault()
                        setAuthOpen(true)
                      }
                    }}
                  />
                }
              >
                {t('Get API key')}
                <ArrowRight aria-hidden='true' />
              </Button>
            </div>
          </div>
          <TokenXOneApiPreview />
        </div>
      </section>
      <section className='border-border/50 border-t px-6 py-20 md:py-24'>
        <div className='mx-auto max-w-6xl'>
          <div className='grid gap-8 md:grid-cols-3'>
            {features.map((feature) => (
              <article
                key={feature.title}
                className='tx-feature border-border/60 border-t pt-7'
              >
                <feature.icon
                  className='text-primary mb-6 size-5'
                  aria-hidden='true'
                />
                <h2 className='text-lg font-semibold'>
                  {feature.icon === KeyRound ? (
                    <Link
                      to='/pricing'
                      className='underline-offset-4 hover:underline'
                    >
                      {feature.title}
                      <ArrowRight
                        aria-hidden='true'
                        className='text-primary ml-2 inline size-4'
                      />
                    </Link>
                  ) : (
                    feature.title
                  )}
                </h2>
                <p className='text-muted-foreground mt-3 text-sm leading-relaxed'>
                  {feature.text}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section className='px-6 py-20 md:py-24'>
        <div className='mx-auto max-w-6xl'>
          <h2 className='text-3xl font-semibold tracking-tight'>
            {t('Your first request.')}
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
            {t('Read the docs')}
            <ArrowRight aria-hidden='true' />
          </Button>
        </div>
      </section>
      <TokenXOneFAQ />
      <section className='tx-closing border-border/50 relative overflow-hidden border-t px-6 py-20 text-center md:py-28'>
        <h2 className='text-3xl font-semibold tracking-tight md:text-4xl'>
          {t('Put your next idea into motion.')}
        </h2>
        <Button
          role='link'
          className='mt-8 h-11 px-5'
          render={
            <Link
              to={destination}
              search={props.isAuthenticated ? undefined : { redirect: '/keys' }}
              onClick={(event) => {
                if (!props.isAuthenticated) {
                  event.preventDefault()
                  setAuthOpen(true)
                }
              }}
            />
          }
        >
          {t('Get API key')}
          <ArrowRight aria-hidden='true' />
        </Button>
      </section>
    </main>
  )
}
