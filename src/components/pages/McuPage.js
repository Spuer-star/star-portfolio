'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import styles from './McuPage.styles';

const PAIRS = [
  {
    slug: 'home',
    eyebrow: '01 · HOMEPAGE',
    title: 'Above the fold',
    note: 'Legacy: stock-photo group of strangers, neon green, cookie bar nailed to the bottom. Rebuild: a single value-prop and a live indicative loan calculator.',
    oldUrl: 'https://www.mcu.im/',
    newUrl: 'https://manx-credit-union-mcu-website.vercel.app/',
    oldShort: 'www.mcu.im',
    newShort: 'manx-credit-union-mcu-website.vercel.app',
    before: 'assets/projects/mcu/old-home.jpg',
    after:  'assets/projects/mcu/new-home.jpg',
  },
  {
    slug: 'loans',
    eyebrow: '02 · LOAN PRODUCTS',
    title: 'The loan catalog',
    note: 'Same products, restructured: a clear grid of seven loans (Basic, Family, Loyalty Saver, Premier, Save-as-you-borrow, Starter, Emergency) with rate, term and use-case visible at a glance.',
    oldUrl: 'https://www.mcu.im/loans',
    newUrl: 'https://manx-credit-union-mcu-website.vercel.app/loans',
    oldShort: '/loans',
    newShort: '/loans',
    before: 'assets/projects/mcu/old-loans.jpg',
    after:  'assets/projects/mcu/new-loans.jpg',
  },
  {
    slug: 'loan',
    eyebrow: '03 · SINGLE LOAN',
    title: 'Loan detail',
    note: 'A single product page now leads with rate, repayment example, eligibility and a path to apply. Legacy was a single column of prose under a stock banner.',
    oldUrl: 'https://www.mcu.im/loans/basic-loan',
    newUrl: 'https://manx-credit-union-mcu-website.vercel.app/loans/basic',
    oldShort: '/loans/basic-loan',
    newShort: '/loans/basic',
    before: 'assets/projects/mcu/old-loan.jpg',
    after:  'assets/projects/mcu/new-loan.jpg',
  },
  {
    slug: 'join',
    eyebrow: '04 · MEMBERSHIP',
    title: 'Become a member',
    note: 'The conversion page. Legacy buried the requirements in paragraphs; rebuild lays out the four eligibility criteria, the proof of identity rules and a single primary CTA.',
    oldUrl: 'https://www.mcu.im/joinus',
    newUrl: 'https://manx-credit-union-mcu-website.vercel.app/membership',
    oldShort: '/joinus',
    newShort: '/membership',
    before: 'assets/projects/mcu/old-join.jpg',
    after:  'assets/projects/mcu/new-join.jpg',
  },
  {
    slug: 'about',
    eyebrow: '05 · ABOUT',
    title: 'Who we are',
    note: 'Same story (member-owned since 1993, FSA-regulated, lottery-funded origin) &mdash; paced. Board of directors, governance, financial reports, all in one structured nav instead of a side menu.',
    oldUrl: 'https://www.mcu.im/aboutus',
    newUrl: 'https://manx-credit-union-mcu-website.vercel.app/about',
    oldShort: '/aboutus',
    newShort: '/about',
    before: 'assets/projects/mcu/old-about.jpg',
    after:  'assets/projects/mcu/new-about.jpg',
  },
  {
    slug: 'contact',
    eyebrow: '06 · CONTACT',
    title: 'Get in touch',
    note: 'Address, opening hours, phone, email, and the FSA registration line &mdash; on one page, in one card, instead of three separate paragraphs in a sidebar.',
    oldUrl: 'https://www.mcu.im/contact',
    newUrl: 'https://manx-credit-union-mcu-website.vercel.app/contact',
    oldShort: '/contact',
    newShort: '/contact',
    before: 'assets/projects/mcu/old-contact.jpg',
    after:  'assets/projects/mcu/new-contact.jpg',
  },
];

const STACK_OUT = [
  { name: 'Classic ASP / IIS',     note: 'Server-rendered .aspx with VBScript-era patterns.' },
  { name: 'jQuery + Bootstrap 3',  note: 'CDN-loaded vendor JS for layout that\u2019s now native.' },
  { name: 'Stock photography',     note: 'Generic "happy faces" hero unrelated to MCU members.' },
  { name: 'Cookie-banner plugin',  note: 'Bottom-bound banner with no granular consent.' },
  { name: 'Forms-as-PDF',          note: 'Membership flow ended in a PDF download.' },
  { name: 'No live calculator',    note: 'A static .html page linked from a sidebar.' },
];

const STACK_IN = [
  { name: 'Next.js + React',         note: 'Server components for the marketing pages, client islands for the calculator.' },
  { name: 'Tailwind + a design system', note: 'Cream/charcoal palette built for trust, not novelty.' },
  { name: 'Live loan calculator',    note: 'Real APR, real repayment example, real save-as-you-borrow bonus &mdash; on the homepage.' },
  { name: 'Vercel + preview URLs',   note: 'Every PR gets its own URL for stakeholder review &mdash; matters when the FSA is a reader.' },
  { name: 'Native cookie consent',   note: 'Granular, GDPR-shaped, no plugin.' },
  { name: 'Inline forms',            note: 'Joining is a form on the page, not a PDF download.' },
];

const GRACES = [
  { title: 'Live indicative loan calculator on the homepage', blurb: 'Borrow / over / monthly / total cost. No dropdown menu, no separate page &mdash; visible before you scroll.' },
  { title: 'FSA & compensation scheme called out above the fold', blurb: '"Protected by the Isle of Man Depositors\u2019 Compensation Scheme up to £50,000." First-time visitors don\u2019t have to dig.' },
  { title: 'Branch-status badge that reflects reality', blurb: '"Closed · opens Saturday at 9:45am" &mdash; tells you when you can actually visit without phoning.' },
  { title: 'Member-owned, not member-onboarded', blurb: '"Dividends, not profit" / "Small enough to call you" &mdash; the value props match what a credit union actually is.' },
  { title: 'Single source of truth for products', blurb: 'Each loan is content + one card component, not a hand-edited HTML page per product.' },
  { title: 'Sign-in routed to the existing portal', blurb: 'No fake login form &mdash; the auth/portal stays where it already lives.' },
];

function pad(n) {
  return n.toString().padStart(2, '0');
}

export default function McuPage(props) {
  const [splits, setSplits] = useState([50, 50, 50, 50, 50, 50]);

  const activeIdxRef = useRef(null);
  const activeRectRef = useRef(null);
  const sliderRefs = useRef([]);
  const pointerDownRef = useRef(null);

  useEffect(() => {
    function updateFromEvent(ev) {
      const idx = activeIdxRef.current;
      const rect = activeRectRef.current;
      if (idx === null || !rect) return;
      const clientX =
        ev instanceof MouseEvent
          ? ev.clientX
          : ev.touches?.[0]?.clientX ?? ev.changedTouches?.[0]?.clientX ?? 0;
      const rel = clientX - rect.left;
      const pct = Math.max(0, Math.min(100, (rel / rect.width) * 100));
      setSplits((prev) => {
        const next = [...prev];
        next[idx] = pct;
        return next;
      });
    }

    function onPointerMove(ev) {
      if (activeIdxRef.current === null || !activeRectRef.current) return;
      const slider = sliderRefs.current[activeIdxRef.current];
      if (slider) activeRectRef.current = slider.getBoundingClientRect();
      ev.preventDefault();
      updateFromEvent(ev);
    }

    function removeWindowListeners() {
      window.removeEventListener('mousemove', onPointerMove);
      window.removeEventListener('touchmove', onPointerMove);
      window.removeEventListener('mouseup', onPointerUp);
      window.removeEventListener('touchend', onPointerUp);
      window.removeEventListener('touchcancel', onPointerUp);
    }

    function onPointerUp() {
      activeIdxRef.current = null;
      activeRectRef.current = null;
      removeWindowListeners();
    }

    function onPointerDown(ev, idx) {
      ev.preventDefault();
      const slider = sliderRefs.current[idx];
      if (!slider) return;
      activeIdxRef.current = idx;
      activeRectRef.current = slider.getBoundingClientRect();
      updateFromEvent(ev);
      window.addEventListener('mousemove', onPointerMove, { passive: false });
      window.addEventListener('touchmove', onPointerMove, { passive: false });
      window.addEventListener('mouseup', onPointerUp);
      window.addEventListener('touchend', onPointerUp);
      window.addEventListener('touchcancel', onPointerUp);
    }

    pointerDownRef.current = onPointerDown;

    // React registers touchstart as passive, so bind it natively to keep preventDefault working.
    const sliders = sliderRefs.current.slice();
    const touchHandlers = sliders.map((el, idx) => {
      if (!el) return null;
      const handler = (ev) => onPointerDown(ev, idx);
      el.addEventListener('touchstart', handler, { passive: false });
      return handler;
    });

    return () => {
      sliders.forEach((el, idx) => {
        if (el && touchHandlers[idx]) el.removeEventListener('touchstart', touchHandlers[idx]);
      });
      removeWindowListeners();
      activeIdxRef.current = null;
      activeRectRef.current = null;
      pointerDownRef.current = null;
    };
  }, []);

  function afterClip(idx) {
    const split = splits[idx] ?? 50;
    return `inset(0 ${100 - split}% 0 0)`;
  }

  return (
    <div className="app-mcu">
      <main className="case-study">
        <section className="section">
          <div className="container">

            {/* Masthead */}
            <header className="masthead">
              <div className="masthead-rule">
                <span className="rule-tag">CHAPTER FOUR · CASE STUDY</span>
              </div>
              <h1 className="title">
                <em>The</em> Manx Cutover
              </h1>
              <p className="subtitle">
                A regulated credit union, dragged from 2014 to 2026 without losing
                its members along the way.{' '}
                <span className="mono">[ ISLE OF MAN · FSA REGULATED ]</span>
              </p>
            </header>

            {/* Stat strip */}
            <div className="stat-strip" aria-label="Project scale">
              <div className="stat">
                <span className="stat-num">7</span>
                <span className="stat-label">LOAN PRODUCTS</span>
              </div>
              <div className="stat">
                <span className="stat-num">22</span>
                <span className="stat-label">PAGES REBUILT</span>
              </div>
              <div className="stat">
                <span className="stat-num">1993</span>
                <span className="stat-label">MEMBER-OWNED SINCE</span>
              </div>
              <div className="stat">
                <span className="stat-num">£50k</span>
                <span className="stat-label">DEPOSIT PROTECTION</span>
              </div>
            </div>

            {/* Lede */}
            <p className="lede">
              <em>The brief</em>: Manx Credit Union is the only credit union on the
              Isle of Man &mdash; FSA-regulated, member-owned, run for the benefit
              of its borrowers. Its previous website read like a 2014 classic-ASP
              build: stock-photo group of strangers, neon green, cookie bar at the
              bottom, no live calculator. The new build keeps every regulatory
              disclosure, every loan product, and every form &mdash; and adds the
              things a credit union actually needs in 2026.
            </p>

            {/* ===== PART ONE · VISUAL DELTA ===== */}
            <section className="compare-section" aria-labelledby="compare-h">
              <header className="section-head">
                <div className="section-rule">
                  <span className="section-eyebrow">PART ONE · THE VISUAL DELTA</span>
                </div>
                <h2 id="compare-h" className="section-title">
                  <em>Drag</em> to compare
                </h2>
                <p className="section-lede">
                  Both versions are live as of writing. Pull the divider left for
                  the legacy site, right for the rebuild. Above-the-fold captures
                  from production, no retouching.
                </p>
              </header>

              <div className="compare-grid">
                {PAIRS.map((pair, i) => (
                  <article className="compare" data-slug={pair.slug} key={pair.slug}>
                    <header className="compare-head">
                      <span className="compare-eyebrow">{pair.eyebrow}</span>
                      <h3 className="compare-name">{pair.title}</h3>
                      <p className="compare-note">{pair.note}</p>
                    </header>

                    <div
                      className="compare-slider"
                      data-idx={i}
                      ref={(el) => { sliderRefs.current[i] = el; }}
                      onMouseDown={(e) => {
                        if (pointerDownRef.current) pointerDownRef.current(e.nativeEvent, i);
                      }}
                      role="img"
                      aria-label={pair.title + ' — drag to compare old vs new'}
                    >
                      <img
                        className="compare-img compare-img--before"
                        src={pair.before}
                        alt={pair.title + ' on the legacy mcu.im site'}
                        loading="lazy"
                        decoding="async"
                      />
                      <img
                        className="compare-img compare-img--after"
                        src={pair.after}
                        alt={pair.title + ' on the rebuilt MCU site'}
                        style={{ clipPath: afterClip(i) }}
                        loading="lazy"
                        decoding="async"
                      />
                      <div className="compare-handle" style={{ left: splits[i] + '%' }}>
                        <span className="compare-handle-line"></span>
                        <span className="compare-handle-knob" aria-hidden="true">⇄</span>
                      </div>
                      <span className="compare-label compare-label--before">LEGACY</span>
                      <span className="compare-label compare-label--after">REBUILD</span>
                    </div>

                    <footer className="compare-urls">
                      <a className="compare-url" href={pair.oldUrl} target="_blank" rel="noopener noreferrer">
                        <span className="url-tag">OLD</span>
                        <span className="url-text">{pair.oldShort}</span>
                        <span className="url-arrow">↗</span>
                      </a>
                      <a className="compare-url" href={pair.newUrl} target="_blank" rel="noopener noreferrer">
                        <span className="url-tag url-tag--new">NEW</span>
                        <span className="url-text">{pair.newShort}</span>
                        <span className="url-arrow">↗</span>
                      </a>
                    </footer>
                  </article>
                ))}
              </div>
            </section>

            {/* ===== PART TWO · STACK ===== */}
            <section className="stack-section" aria-labelledby="stack-h">
              <header className="section-head">
                <div className="section-rule">
                  <span className="section-eyebrow">PART TWO · THE STACK SWAP</span>
                </div>
                <h2 id="stack-h" className="section-title">
                  <em>Out</em> with one, <em>in</em> with another
                </h2>
                <p className="section-lede">
                  A credit union&apos;s website is mostly content: loan T&amp;Cs,
                  governance, financial accounts, forms. Everything dynamic
                  (calculator, app links, sign-in) is one component &mdash; the
                  rest is generated.
                </p>
              </header>

              <div className="stack-grid">
                <div className="stack-col stack-col--out">
                  <header className="stack-col-head">
                    <span className="stack-col-tag">REMOVED</span>
                    <h3 className="stack-col-title">The legacy side</h3>
                  </header>
                  <ul className="stack-list">
                    {STACK_OUT.map((item) => (
                      <li className="stack-item" key={item.name}>
                        <span className="stack-item-name">{item.name}</span>
                        <span className="stack-item-note">{item.note}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="stack-col stack-col--in">
                  <header className="stack-col-head">
                    <span className="stack-col-tag stack-col-tag--in">KEPT &amp; ADDED</span>
                    <h3 className="stack-col-title">The rebuild side</h3>
                  </header>
                  <ul className="stack-list">
                    {STACK_IN.map((item) => (
                      <li className="stack-item" key={item.name}>
                        <span className="stack-item-name">{item.name}</span>
                        <span className="stack-item-note">{item.note}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>

            {/* ===== PART THREE · COMPLIANCE-FIRST DECISIONS ===== */}
            <section className="grace-section" aria-labelledby="grace-h">
              <header className="section-head">
                <div className="section-rule">
                  <span className="section-eyebrow">PART THREE · DECISIONS THAT MATTERED</span>
                </div>
                <h2 id="grace-h" className="section-title">
                  <em>What</em> a regulated site needs
                </h2>
                <p className="section-lede">
                  Credit unions live or die on trust. Each of these is something
                  the legacy site either lacked or buried, and that the rebuild
                  makes obvious from the homepage onwards.
                </p>
              </header>

              <ul className="grace-grid">
                {GRACES.map((g, index) => (
                  <li className="grace" key={g.title}>
                    <span className="grace-num">{pad(index + 1)}</span>
                    <h3 className="grace-title">{g.title}</h3>
                    <p className="grace-blurb">{g.blurb}</p>
                  </li>
                ))}
              </ul>
            </section>

            {/* ===== CLOSING ===== */}
            <footer className="closing">
              <div className="closing-rule">
                <span className="closing-tag">END · CASE STUDY</span>
              </div>
              <p className="closing-line">
                Both versions are live until cutover. Legacy at{' '}
                <a href="https://www.mcu.im/" target="_blank" rel="noopener noreferrer">www.mcu.im</a>
                {' '}&mdash; rebuild at{' '}
                <a href="https://manx-credit-union-mcu-website.vercel.app/" target="_blank" rel="noopener noreferrer">manx-credit-union-mcu-website.vercel.app</a>.
              </p>
              <p className="closing-line">
                <Link href="/#projects" className="closing-link">
                  ↩ return to <em>The Archive</em>
                </Link>
              </p>
            </footer>

          </div>
        </section>
      </main>

      <style jsx>{styles}</style>
    </div>
  );
}
