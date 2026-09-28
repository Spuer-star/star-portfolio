'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import styles from './LonsdalePage.styles';

const PAIRS = [
  {
    slug: 'home',
    eyebrow: '01 · HOMEPAGE',
    title: 'Above the fold',
    note: 'WordPress: stock photo of a tyre. Astro: a single van, a benefit-led headline, and the year-models in stock.',
    wpUrl: 'https://www.lonsdalecommercials.co.uk/',
    astroUrl: 'https://londsdale.vercel.app/',
    wpShort: 'lonsdalecommercials.co.uk',
    astroShort: 'londsdale.vercel.app',
    wp: 'assets/projects/lonsdale/wp-home.jpg',
    astro: 'assets/projects/lonsdale/astro-home.jpg',
  },
  {
    slug: 'archive',
    eyebrow: '02 · VAN SALES ARCHIVE',
    title: 'The catalog grid',
    note: 'Three live facets on the Astro side — manufacturer, body type, body length — driven entirely by the data, no plugin.',
    wpUrl: 'https://www.lonsdalecommercials.co.uk/van-sales/',
    astroUrl: 'https://londsdale.vercel.app/van-sales/',
    wpShort: '/van-sales/',
    astroShort: '/van-sales/',
    wp: 'assets/projects/lonsdale/wp-archive.jpg',
    astro: 'assets/projects/lonsdale/astro-archive.jpg',
  },
  {
    slug: 'product',
    eyebrow: '03 · SINGLE VAN',
    title: 'Product detail',
    note: 'WP rendered a Visual-Composer accordion of plain text. Astro parses it into a 3-column spec grid with a variation picker.',
    wpUrl: 'https://www.lonsdalecommercials.co.uk/product/citroen-relay-luton-body-van-inc-tail-lift-13-4ft-335l3-blue2-2hdi-140ps-euro-6-4-copy/',
    astroUrl: 'https://londsdale.vercel.app/van-sales/citroen-relay-luton-body-van-inc-tail-lift-13-4ft-335l3-blue2-2hdi-140ps-euro-6-/',
    wpShort: '/product/citroen-relay-…',
    astroShort: '/van-sales/citroen-relay-…',
    wp: 'assets/projects/lonsdale/wp-product.jpg',
    astro: 'assets/projects/lonsdale/astro-product.jpg',
  },
  {
    slug: 'bodybuilding',
    eyebrow: '04 · BODYBUILDING',
    title: 'Bespoke builds gallery',
    note: 'Same imagery, redrawn as image-led overlay tiles in a 4:3 grid. 12 galleries, 501 source images, 1,400+ WebP variants.',
    wpUrl: 'https://www.lonsdalecommercials.co.uk/bodybuilding/',
    astroUrl: 'https://londsdale.vercel.app/bodybuilding/',
    wpShort: '/bodybuilding/',
    astroShort: '/bodybuilding/',
    wp: 'assets/projects/lonsdale/wp-bodybuilding.jpg',
    astro: 'assets/projects/lonsdale/astro-bodybuilding.jpg',
  },
  {
    slug: 'about',
    eyebrow: '05 · ABOUT',
    title: 'The story page',
    note: 'WP version was a wall of paragraphs. Astro version is a hero, a five-point "why us" set, and a service split — same copy, paced.',
    wpUrl: 'https://www.lonsdalecommercials.co.uk/about-us/',
    astroUrl: 'https://londsdale.vercel.app/about/',
    wpShort: '/about-us/',
    astroShort: '/about/',
    wp: 'assets/projects/lonsdale/wp-about.jpg',
    astro: 'assets/projects/lonsdale/astro-about.jpg',
  },
  {
    slug: 'contact',
    eyebrow: '06 · CONTACT',
    title: 'Get in touch',
    note: 'Contact form left, address card + live Google Maps embed right. Old version: a stretched 1-col WP plugin form, no map.',
    wpUrl: 'https://www.lonsdalecommercials.co.uk/contact-us/',
    astroUrl: 'https://londsdale.vercel.app/contact-us/',
    wpShort: '/contact-us/',
    astroShort: '/contact-us/',
    wp: 'assets/projects/lonsdale/wp-contact.jpg',
    astro: 'assets/projects/lonsdale/astro-contact.jpg',
  },
];

const SURFACES = [
  {
    slug: 'product-detail',
    eyebrow: '07 · SINGLE VAN, IN FULL',
    title: 'Spec grid + variation picker',
    note: 'A WordPress accordion of plain-text body copy, parsed once at build time into a structured 3-column spec grid with a native disclosure variation picker beneath.',
    image: 'assets/projects/lonsdale/astro-product-detail.jpg',
    url: 'https://londsdale.vercel.app/van-sales/citroen-relay-luton-body-van-inc-tail-lift-13-4ft-335l3-blue2-2hdi-140ps-euro-6-/',
    urlShort: '/van-sales/citroen-relay-…',
    bullets: [
      'Visual-Composer accordion → typed JSON fields, parsed by migration/03',
      'Three-column spec grid: engine, body, fitments — no plugin',
      'Native <details> variation picker, ~30 lines of TS to swap price',
      'JSON-LD Product + AggregateOffer schema generated from the same data',
    ],
  },
  {
    slug: 'bodybuilding-detail',
    eyebrow: '08 · BODYBUILDING DETAIL',
    title: 'Gallery page with bespoke-quote CTA',
    note: 'Each of the 12 bespoke-build galleries gets its own page — image-led grid, descriptive copy, and a dedicated "request a build" CTA that the WordPress site never had.',
    image: 'assets/projects/lonsdale/astro-bodybuilding-detail.jpg',
    url: 'https://londsdale.vercel.app/galleries/contour/',
    urlShort: '/galleries/contour/',
    bullets: [
      '12 gallery pages, each driven by a JSON content collection entry',
      'Responsive 4:3 image grid with WebP variants at 400/800/1200w',
      '"Discuss a build" CTA scrolling to a contact intent — new addition',
      'Breadcrumb back to /bodybuilding/, JSON-LD ImageGallery on each',
    ],
  },
];

const STACK_OUT = [
  { name: 'WordPress core',     note: 'PHP runtime, MySQL, admin surface, plugin update treadmill.' },
  { name: 'WooCommerce',        note: 'Carted product catalog used as a data model — never as a checkout.' },
  { name: 'Visual Composer',    note: 'Page-builder shortcodes encoded into post_content.' },
  { name: 'WP Engine hosting',  note: 'Managed but always-on PHP/MySQL bill, agency-billed.' },
  { name: 'All-in-One Migration', note: 'Required just to extract the data once.' },
  { name: 'Agency retainer',    note: 'Monthly maintenance fee, slow turnaround on small edits.' },
];

const STACK_IN = [
  { name: 'Astro 5',                note: 'Static site generator; islands only where they earn it.' },
  { name: 'Content collections',    note: 'JSON files + Zod schemas as the new content store.' },
  { name: 'Vercel + GitHub',        note: 'Auto-deploy on push, preview URLs per branch, free for this traffic.' },
  { name: 'Sharp WebP pipeline',    note: '~80% bandwidth saving on card grids.' },
  { name: 'Pure HTML+CSS components', note: 'Native <details>, CSS Grid, no jQuery.' },
  { name: 'Resend for email',       note: 'API-based contact form, no DB needed.' },
];

const LEDGER = [
  {
    script: 'migration/01-audit.js',
    tag: 'READ-ONLY',
    blurb: 'Walks the WordPress SQL dump and prints the inventory: 38 vans, 188 variations, 12 galleries, 501 attachments, 15 pages. The baseline that every later script gets reconciled against.',
  },
  {
    script: 'migration/02-migrate.js',
    tag: 'EXTRACT',
    blurb: 'Pulls products, attributes, and post_content from the dump and writes one JSON file per van into Astro content collections. Handles WooCommerce variations via the post_parent link.',
  },
  {
    script: 'migration/03-parse-content.js',
    tag: 'TRANSFORM',
    blurb: 'Splits Visual-Composer accordion shortcodes into structured fields — intro + named sections — so the Astro template can render a 3-column spec grid instead of one flat blob.',
  },
  {
    script: 'migration/04-copy-images.js',
    tag: 'COPY',
    blurb: 'Walks the WP uploads tree and copies each attached image into /public/vans/<slug>/, renaming featured-images to a predictable filename so the template doesn\u2019t need a manifest.',
  },
  {
    script: 'migration/05-optimize-images.js',
    tag: 'OPTIMIZE',
    blurb: 'Idempotent Sharp pass that generates 400/800/1200-wide WebP variants for every source image. Always emits the smallest tier even for tiny featured-image PNGs — otherwise the srcset 404\'d.',
  },
];

const GRACES = [
  { title: 'Cookie consent that defers third-party scripts', blurb: 'PromptMySite chat doesn\u2019t inject until consent is given. UK GDPR/PECR-clean without a banner plugin.' },
  { title: 'JSON-LD on every product', blurb: 'Product + AggregateOffer + BreadcrumbList structured data, written from the same data that drives the page.' },
  { title: 'Single Google Maps embed', blurb: 'A real iframe of the Cardiff yard on /contact-us — the old site shipped no map at all.' },
  { title: 'Slug cleanup, server-side', blurb: '14 vans had a trailing "-copy" left over from the WP duplicate-then-edit workflow. Migration stripped them.' },
  { title: 'Variation picker as one <details> + JS', blurb: 'No plugin, no jQuery. Native disclosure, a few lines of TS to swap the visible price.' },
  { title: 'Vercel preview URL per branch', blurb: 'Every commit on a feature branch deploys to its own URL. Reviews aren\u2019t blocked on a staging environment that no one owns.' },
];

function pad(n) {
  return n.toString().padStart(2, '0');
}

export default function LonsdalePage(props) {
  // Per-pair split percentage, 0 = full WP, 100 = full Astro.
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
      // Need to re-fetch rect if scroll happened mid-drag — quick + cheap.
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
      // Immediate jump-to-click
      updateFromEvent(ev);
      // Bind window listeners so dragging works outside the slider too
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
    <div className="app-lonsdale">
      <main className="case-study">
        <section className="section">
          <div className="container">

            {/* Masthead */}
            <header className="masthead">
              <div className="masthead-rule">
                <span className="rule-tag">CHAPTER THREE · CASE STUDY</span>
              </div>
              <h1 className="title">
                <em>The</em> Lonsdale Cutover
              </h1>
              <p className="subtitle">
                WordPress to Astro. Same content, same brand, different stewardship.{' '}
                <span className="mono">[ MAY 2026 · ONE-PERSON MIGRATION ]</span>
              </p>
            </header>

            {/* Stat strip */}
            <div className="stat-strip" aria-label="Migration scale">
              <div className="stat">
                <span className="stat-num">38</span>
                <span className="stat-label">VANS · CATALOG</span>
              </div>
              <div className="stat">
                <span className="stat-num">188</span>
                <span className="stat-label">VARIATION SKUs</span>
              </div>
              <div className="stat">
                <span className="stat-num">1.4k</span>
                <span className="stat-label">WEBP VARIANTS</span>
              </div>
              <div className="stat">
                <span className="stat-num">£0</span>
                <span className="stat-label">HOSTING · MONTHLY</span>
              </div>
            </div>

            {/* Lede */}
            <p className="lede">
              <em>The brief</em>: my aunt&apos;s WordPress site &mdash; Lonsdale Commercials,
              Cardiff, trading since 1980 &mdash; was being maintained by an agency on a
              retainer. The redesign was already paid for. The new site was running
              locally. I took it the rest of the way: out of WordPress, into Astro,
              onto Vercel, with the GitHub repo under my account. Below, page by page,
              is what changed.
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
                  Both sites are still live as of writing. Pull the divider left to
                  see what was there. Right for what&apos;s there now. These are
                  above-the-fold captures from production &mdash; no retouching.
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
                      aria-label={pair.title + ' — drag to compare WordPress vs Astro'}
                    >
                      <img
                        className="compare-img compare-img--before"
                        src={pair.wp}
                        alt={pair.title + ' on the WordPress site'}
                        loading="lazy"
                        decoding="async"
                      />
                      <img
                        className="compare-img compare-img--after"
                        src={pair.astro}
                        alt={pair.title + ' on the new Astro site'}
                        style={{ clipPath: afterClip(i) }}
                        loading="lazy"
                        decoding="async"
                      />
                      <div className="compare-handle" style={{ left: splits[i] + '%' }}>
                        <span className="compare-handle-line"></span>
                        <span className="compare-handle-knob" aria-hidden="true">⇄</span>
                      </div>
                      <span className="compare-label compare-label--before">← BEFORE · WORDPRESS</span>
                      <span className="compare-label compare-label--after">AFTER · ASTRO →</span>
                    </div>

                    <footer className="compare-urls">
                      <a className="compare-url" href={pair.wpUrl} target="_blank" rel="noopener noreferrer">
                        <span className="url-tag">WP</span>
                        <span className="url-text">{pair.wpShort}</span>
                        <span className="url-arrow">↗</span>
                      </a>
                      <a className="compare-url" href={pair.astroUrl} target="_blank" rel="noopener noreferrer">
                        <span className="url-tag url-tag--new">NEW</span>
                        <span className="url-text">{pair.astroShort}</span>
                        <span className="url-arrow">↗</span>
                      </a>
                    </footer>
                  </article>
                ))}
              </div>
            </section>

            {/* ===== PART ONE.5 · NEW SURFACES ===== */}
            <section className="surfaces-section" aria-labelledby="surfaces-h">
              <header className="section-head">
                <div className="section-rule">
                  <span className="section-eyebrow">PART ONE.5 · THE NEW SURFACES</span>
                </div>
                <h2 id="surfaces-h" className="section-title">
                  <em>What</em> didn&apos;t exist before
                </h2>
                <p className="section-lede">
                  The drag-to-compare above shows the <em>same</em> page rebuilt. Below
                  are two surfaces where the rebuild added real product depth &mdash;
                  no equivalent on the WordPress side, so no slider would do them
                  justice.
                </p>
              </header>

              <div className="surfaces-grid">
                {SURFACES.map((s) => (
                  <article className="surface" key={s.slug}>
                    <header className="surface-head">
                      <span className="surface-eyebrow">{s.eyebrow}</span>
                      <h3 className="surface-name">{s.title}</h3>
                      <p className="surface-note">{s.note}</p>
                    </header>
                    <a className="surface-shot" href={s.url} target="_blank" rel="noopener noreferrer">
                      <img src={s.image} alt={s.title + ' on the new Astro site'} loading="lazy" decoding="async" />
                      <span className="surface-shot-tag">NEW</span>
                    </a>
                    <ul className="surface-bullets">
                      {s.bullets.map((b) => (
                        <li key={b}>{b}</li>
                      ))}
                    </ul>
                    <a className="surface-url" href={s.url} target="_blank" rel="noopener noreferrer">
                      <span className="url-tag url-tag--new">LIVE</span>
                      <span className="url-text">{s.urlShort}</span>
                      <span className="url-arrow">↗</span>
                    </a>
                  </article>
                ))}
              </div>
            </section>

            {/* ===== PART TWO · STACK SWAP ===== */}
            <section className="stack-section" aria-labelledby="stack-h">
              <header className="section-head">
                <div className="section-rule">
                  <span className="section-eyebrow">PART TWO · THE STACK SWAP</span>
                </div>
                <h2 id="stack-h" className="section-title">
                  <em>Out</em> with one, <em>in</em> with another
                </h2>
                <p className="section-lede">
                  The brand stayed, the agency went. The stack lost ten moving parts
                  and gained two. Anything PHP, server-rendered, or licensed by the
                  seat is on the left.
                </p>
              </header>

              <div className="stack-grid">
                <div className="stack-col stack-col--out">
                  <header className="stack-col-head">
                    <span className="stack-col-tag">REMOVED</span>
                    <h3 className="stack-col-title">The WordPress side</h3>
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
                    <h3 className="stack-col-title">The Astro side</h3>
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

            {/* ===== PART THREE · WHAT MIGRATION ACTUALLY MEANT ===== */}
            <section className="ledger-section" aria-labelledby="ledger-h">
              <header className="section-head">
                <div className="section-rule">
                  <span className="section-eyebrow">PART THREE · THE MIGRATION LEDGER</span>
                </div>
                <h2 id="ledger-h" className="section-title">
                  <em>Five</em> scripts in order
                </h2>
                <p className="section-lede">
                  The cutover is &mdash; intentionally &mdash; a chain of small scripts,
                  not one big tool. Each one is idempotent. Each one ran enough times
                  to make sense of the WP database before committing to a shape.
                </p>
              </header>

              <ol className="ledger">
                {LEDGER.map((step, i) => (
                  <li className="ledger-row" key={step.script}>
                    <span className="ledger-num">{pad(i + 1)}</span>
                    <div className="ledger-body">
                      <div className="ledger-head-row">
                        <span className="ledger-script">{step.script}</span>
                        <span className="ledger-tag">{step.tag}</span>
                      </div>
                      <p className="ledger-blurb">{step.blurb}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </section>

            {/* ===== PART FOUR · THE LIGHT TOUCH BITS ===== */}
            <section className="grace-section" aria-labelledby="grace-h">
              <header className="section-head">
                <div className="section-rule">
                  <span className="section-eyebrow">PART FOUR · THE LIGHT-TOUCH BITS</span>
                </div>
                <h2 id="grace-h" className="section-title">
                  <em>What</em> changed quietly
                </h2>
                <p className="section-lede">
                  Beyond the visible swap, a handful of polish moves that didn&apos;t
                  exist on the WordPress version. None of these required a plugin
                  &mdash; each one is a single Astro component or a few CSS rules.
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
                The DNS cutover is one record flip away. Old site still serving at{' '}
                <a href="https://www.lonsdalecommercials.co.uk/" target="_blank" rel="noopener noreferrer">lonsdalecommercials.co.uk</a>
                {' '}&mdash; new build at{' '}
                <a href="https://londsdale.vercel.app/" target="_blank" rel="noopener noreferrer">londsdale.vercel.app</a>.
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
