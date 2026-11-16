import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { BrandMark } from '@/components/common/BrandMark'
import { Button } from '@/components/ui/button'
import { useSessionStore } from '@/store/session-store'

const desks = [
  {
    title: 'Applicant',
    detail: 'A farmer, buyer, or aadathiya desk files a demonstration application and follows its status.',
  },
  {
    title: 'Licence Officer',
    detail: 'Checks the sample documents, the checklist, and issues a DEMO licence number.',
  },
  {
    title: 'Accounts Officer',
    detail: 'Records a sample fee and security-deposit receipt. No money moves.',
  },
  {
    title: 'Mandi Manager',
    detail: 'Reviews the queue and records a simulated approval.',
  },
]

const steps = [
  { title: 'Open a desk', detail: 'Use the published password and a demonstration desk id such as demo.super.' },
  { title: 'Read the registers', detail: 'Stakeholder and mandi master rows stay in this browser, stamped with a mandi id.' },
  { title: 'Walk SOP-001', detail: 'Submit an application, verify it, approve it, record a sample receipt, then issue a licence.' },
  { title: 'Preview the licence', detail: 'The print layout carries a fictional number and a QR code marked as a demonstration.' },
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
      <header className="sticky top-0 z-20 border-b bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 md:px-8">
          <BrandMark tone="paper" />
          <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex" aria-label="Introduction">
            <a href="#about" className="hover:text-foreground">About</a>
            <a href="#desks" className="hover:text-foreground">Desks</a>
            <a href="#walkthrough" className="hover:text-foreground">Walkthrough</a>
          </nav>
          <Button type="button" asChild>
            <Link to={deskTo}>{deskLabel}</Link>
          </Button>
        </div>
      </header>

      <main>
        <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-14 md:grid-cols-[minmax(0,1.15fr)_minmax(18rem,0.85fr)] md:px-8 md:py-20">
          <div className="space-y-6">
            <p className="text-xs font-semibold tracking-[0.22em] text-primary uppercase">Nagaland Mandi · demonstration</p>
            <h1 className="font-display max-w-xl text-4xl leading-[1.05] tracking-tight text-balance sm:text-5xl">
              A mandi desk you can walk through in this browser.
            </h1>
            <p className="max-w-xl text-base leading-7 text-pretty text-muted-foreground">
              This introduction sits in front of the operating desk. Inside, fictional yard figures, stakeholder registers, SOP-001 licence cases, a simulated finance book, a warehouse book, a cold storage book, an FLP book, a parking book, a facilities book, a compliance book and field drafts stay on this computer.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button type="button" asChild>
                <Link to={deskTo}>{deskLabel}</Link>
              </Button>
              <Button type="button" variant="outline" asChild>
                <a href="#walkthrough">See the walkthrough</a>
              </Button>
            </div>
          </div>
          <aside className="space-y-5 rounded-2xl bg-sidebar p-6 text-sidebar-foreground shadow-sm">
            <div>
              <p className="text-xs font-semibold tracking-[0.18em] text-sidebar-primary uppercase">Working yard</p>
              <p className="font-display mt-2 text-3xl tracking-tight">Dimapur Central</p>
              <p className="mt-2 text-sm leading-6 text-sidebar-foreground/75">The sample mandi used on new registers and licence applications.</p>
            </div>
            <ul className="space-y-2 text-sm leading-6 text-sidebar-foreground/85">
              <li>Stakeholder registers with fictional desk codes</li>
              <li>Licence applications, receipts, and QR codes</li>
              <li>Gate slips, seller and buyer parchis, and fictional commission rates</li>
            </ul>
            <p className="border-t border-sidebar-border pt-4 text-xs leading-5 text-sidebar-foreground/65">
              Published password <span className="font-medium text-sidebar-primary">demo-mandi</span>
            </p>
          </aside>
        </section>

        <section id="about" className="border-t bg-card">
          <div className="mx-auto grid max-w-6xl gap-4 px-4 py-14 md:grid-cols-3 md:px-8">
            <article className="rounded-xl bg-background p-5 ring-1 ring-foreground/10">
              <h2 className="font-display text-2xl tracking-tight">The desk</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                A front end for mandi operations: sign-in by role, master registers, and the licence path from application to a printable demonstration licence.
              </p>
            </article>
            <article className="rounded-xl bg-background p-5 ring-1 ring-foreground/10">
              <h2 className="font-display text-2xl tracking-tight">The records</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Desk codes such as DG-14, licence numbers, and receipts are labels saved in this browser. They are demonstration copies.
              </p>
            </article>
            <article className="rounded-xl bg-background p-5 ring-1 ring-foreground/10">
              <h2 className="font-display text-2xl tracking-tight">The calendar</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                The sample day is 14 Nov 2026. Expiry alerts and new licence dates are measured from that day.
              </p>
            </article>
          </div>
        </section>

        <section id="desks" className="mx-auto max-w-6xl px-4 py-14 md:px-8">
          <div className="max-w-2xl space-y-2">
            <h2 className="font-display text-3xl tracking-tight">Four desks on the licence path</h2>
            <p className="text-sm leading-6 text-muted-foreground">
              Each role sees its own steps. Super Admin can open every step in the browser so the walkthrough can continue.
            </p>
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {desks.map((desk) => (
              <article key={desk.title} className="rounded-xl bg-card p-5 ring-1 ring-foreground/10">
                <h3 className="font-display text-xl tracking-tight">{desk.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{desk.detail}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="walkthrough" className="border-t bg-card">
          <div className="mx-auto max-w-6xl px-4 py-14 md:px-8">
            <h2 className="font-display text-3xl tracking-tight">A short walkthrough</h2>
            <ol className="mt-6 grid gap-3 md:grid-cols-4">
              {steps.map((step, index) => (
                <li key={step.title} className="rounded-xl bg-background p-4 ring-1 ring-foreground/10">
                  <span className="text-xs font-semibold tracking-[0.16em] text-primary uppercase">Step {index + 1}</span>
                  <h3 className="mt-2 font-medium">{step.title}</h3>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">{step.detail}</p>
                </li>
              ))}
            </ol>
            <div className="mt-8">
              <Button type="button" asChild>
                <Link to={deskTo}>{deskLabel}</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-8 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between md:px-8">
          <p>Naga Mandi · demonstration website and operating desk</p>
          <Link to={deskTo} className="font-medium text-primary underline-offset-4 hover:underline">{deskLabel}</Link>
        </div>
      </footer>
    </div>
  )
}
