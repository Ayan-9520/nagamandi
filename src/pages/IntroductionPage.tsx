import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { BrandMark } from '@/components/common/BrandMark'
import { Button } from '@/components/ui/button'
import { demoAccounts } from '@/mocks/accounts'
import { navigation } from '@/mocks/navigation'
import { getRole } from '@/mocks/permissions'
import { useSessionStore } from '@/store/session-store'

const steps = [
  { title: 'Open a desk', detail: 'Choose a demonstration desk and enter the published password demo-mandi.' },
  { title: 'Read the registers', detail: 'Farmers, buyers, aadathiyas, commodities, grades and fees stay in this browser, stamped with a mandi id.' },
  { title: 'Walk a licence', detail: 'Submit an application, verify the sample papers, record a simulated approval and a sample receipt, then preview the issued licence.' },
  { title: 'Follow the yard', detail: 'Open an arrival, a seller or buyer parchi, a shed, a cold room, a parking pass, a lease, or the command centre.' },
]

const facts = [
  { value: 'Dimapur Central', label: 'Working yard on new registers' },
  { value: '13 desks', label: 'Each role sees only its own sidebar' },
  { value: '15 procedures', label: 'SOP-001 through SOP-015' },
  { value: '14 Nov 2026', label: 'Sample day for expiry alerts' },
]

export function IntroductionPage() {
  const hydrated = useSessionStore((state) => state.hydrated)
  const signedIn = useSessionStore((state) => state.signedIn)
  const deskTo = hydrated && signedIn ? '/desk' : '/login'
  const deskLabel = hydrated && signedIn ? 'Open the desk' : 'Enter the desk'

  useEffect(() => {
    document.title = 'Introduction · Naga Mandi'
  }, [])

  return (
    <div className="app-canvas min-h-svh text-foreground">
      <header className="sticky top-0 z-20 border-b border-white/10 bg-[#14281f]/90 text-white backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 md:px-8">
          <BrandMark className="[&_span]:text-white" />
          <nav className="hidden items-center gap-6 text-sm text-white/75 md:flex" aria-label="Introduction">
            <a href="#about" className="hover:text-white">Books</a>
            <a href="#desks" className="hover:text-white">Desks</a>
            <a href="#walkthrough" className="hover:text-white">Walkthrough</a>
          </nav>
          <Button type="button" asChild>
            <Link to={deskTo}>{deskLabel}</Link>
          </Button>
        </div>
      </header>

      <main>
        <section className="relative isolate min-h-[34rem] overflow-hidden text-white">
          <img
            src="/hero-produce.jpg"
            alt="Bright morning yard with crates of chillies, ginger, bananas, pineapple, tomatoes and greens under a green awning"
            className="absolute inset-0 h-full w-full object-cover object-[center_65%] brightness-110"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#163028]/72 via-[#163028]/28 to-transparent" />
          <div className="relative mx-auto flex min-h-[34rem] max-w-6xl flex-col justify-end px-4 py-14 md:px-8 md:py-20">
            <p className="text-xs font-semibold tracking-[0.22em] text-[#e7c98a] uppercase">Nagaland mandi · demonstration</p>
            <h1 className="font-display mt-4 max-w-3xl text-4xl leading-[1.02] tracking-tight text-balance sm:text-6xl">
              The operating desk for a mandi yard.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-white/85 sm:text-lg sm:leading-8">
              Naga Mandi OS is the browser desk for Dimapur Central. It is used to walk a licence from application to a printed preview, to record a gate arrival and a written sale, and to read the simulated books for stores, parking, leases and the fifteen procedures. Nothing here is a permit, a bank receipt, or a filed return.
            </p>
            <dl className="mt-8 grid max-w-3xl gap-x-8 gap-y-4 border-t border-white/20 pt-6 sm:grid-cols-2">
              <div>
                <dt className="text-[10px] font-semibold tracking-[0.18em] text-[#e7c98a] uppercase">Working yard</dt>
                <dd className="font-display mt-1 text-2xl">Dimapur Central</dd>
              </div>
              <div>
                <dt className="text-[10px] font-semibold tracking-[0.18em] text-[#e7c98a] uppercase">Published password</dt>
                <dd className="font-display mt-1 text-2xl">demo-mandi</dd>
              </div>
            </dl>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button type="button" asChild>
                <Link to={deskTo}>{deskLabel}</Link>
              </Button>
              <Button type="button" variant="outline" className="border-white/40 bg-transparent text-white hover:bg-white/10 hover:text-white" asChild>
                <a href="#about">Read the books</a>
              </Button>
            </div>
          </div>
        </section>

        <section className="border-b" aria-label="Demonstration facts">
          <dl className="mx-auto grid max-w-6xl sm:grid-cols-2 lg:grid-cols-4">
            {facts.map((fact) => (
              <div key={fact.label} className="border-b px-4 py-6 sm:border-b-0 lg:border-l lg:px-8 lg:first:border-l-0">
                <dt className="font-display text-2xl tracking-tight">{fact.value}</dt>
                <dd className="mt-1 text-sm leading-5 text-muted-foreground">{fact.label}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section id="about" className="mx-auto max-w-6xl px-4 py-16 md:px-8">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold tracking-[0.18em] text-primary uppercase">What it is used for</p>
            <h2 className="font-display mt-3 text-3xl tracking-tight sm:text-4xl">Every book on this desk.</h2>
            <p className="mt-3 text-base leading-7 text-muted-foreground">
              Each card is a section inside the operating desk. A role opens only the cards its sidebar allows. Super Admin can open all of them. Records stay in this browser.
            </p>
          </div>
          <div className="mt-12 space-y-12">
            {navigation.map((group) => (
              <div key={group.label}>
                <h3 className="text-xs font-semibold tracking-[0.18em] text-primary uppercase">{group.label}</h3>
                <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {group.items.map((item) => (
                    <article key={item.id} className="flex flex-col rounded-2xl bg-card p-5 ring-1 ring-foreground/10">
                      <h4 className="font-display text-2xl tracking-tight">{item.title}</h4>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.summary}</p>
                      <p className="mt-4 text-xs font-medium tracking-wide text-primary uppercase">{item.sop}</p>
                    </article>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section id="desks" className="border-t bg-[#14281f] text-white">
          <div className="mx-auto max-w-6xl px-4 py-16 md:px-8">
            <p className="text-xs font-semibold tracking-[0.18em] text-[#e7c98a] uppercase">Who opens it</p>
            <h2 className="font-display mt-3 max-w-2xl text-3xl tracking-tight sm:text-4xl">Thirteen demonstration desks.</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/75">
              Choosing a desk only changes the simulated sidebar in this browser. It does not identify an officer. The first four carry a licence from the applicant to a printable preview. The others open the yard, the stores, or a read-only review.
            </p>
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {demoAccounts.map((account) => {
                const role = getRole(account.roleId)
                return (
                  <article key={account.id} className="rounded-2xl bg-white/10 p-5 ring-1 ring-white/15">
                    <p className="text-xs font-medium tracking-wide text-[#e7c98a]">{account.id}</p>
                    <h3 className="font-display mt-2 text-2xl tracking-tight">{role.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-white/75">{role.summary}</p>
                  </article>
                )
              })}
            </div>
          </div>
        </section>

        <section id="walkthrough" className="mx-auto max-w-6xl px-4 py-16 md:px-8">
          <h2 className="font-display text-3xl tracking-tight sm:text-4xl">A short walkthrough</h2>
          <ol className="mt-8 border-t">
            {steps.map((step, index) => (
              <li key={step.title} className="grid gap-2 border-b py-5 md:grid-cols-[4rem_14rem_minmax(0,1fr)] md:gap-8">
                <span className="font-display text-3xl text-primary">{index + 1}</span>
                <h3 className="font-display text-xl tracking-tight">{step.title}</h3>
                <p className="text-sm leading-6 text-muted-foreground">{step.detail}</p>
              </li>
            ))}
          </ol>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Button type="button" asChild>
              <Link to={deskTo}>{deskLabel}</Link>
            </Button>
            <p className="text-sm text-muted-foreground">Start with desk id demo.super and password demo-mandi.</p>
          </div>
        </section>
      </main>

      <footer className="border-t">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-8 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between md:px-8">
          <p>Naga Mandi · demonstration website and operating desk. Records stay in this browser.</p>
          <Link to={deskTo} className="font-medium text-primary underline-offset-4 hover:underline">{deskLabel}</Link>
        </div>
      </footer>
    </div>
  )
}
