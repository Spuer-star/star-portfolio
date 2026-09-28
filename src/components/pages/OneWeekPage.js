'use client';

import { Fragment, useEffect, useState } from 'react';
import Link from 'next/link';
import { previewUrl } from '@/lib/projects';
import {
  OFF_THE_RECORD,
  OFF_THE_RECORD_TOTALS,
  SPRINT_ENTRIES,
  ZOOMED_OUT,
} from '@/lib/sprintEntries';

function pad(n) {
  return n.toString().padStart(2, '0');
}

function shortHost(url) {
  if (!url) return '';
  try {
    return new URL(url).host.replace(/^www\./, '');
  } catch {
    return url;
  }
}

function shortRepoPath(url) {
  if (!url) return '';
  try {
    const u = new URL(url);
    const path = u.pathname.split('/').filter(Boolean).slice(0, 2).join('/');
    return path ? `${u.host}/${path}` : u.host;
  } catch {
    return url;
  }
}

/**
 * Each entry is a sprint entry plus render-only fields:
 * preview (image src), groupHead / groupedFollower (chapter grouping),
 * shortUrl and shortRepo (cached display strings).
 */
function buildEntries() {
  // Compute group flags so the template knows which card sits at the head
  // of a same-day cluster, and which ones are followers.
  const seenChapters = new Set();
  return SPRINT_ENTRIES.map((e) => {
    const isHead = !!e.chapter && !seenChapters.has(e.chapter);
    if (e.chapter) seenChapters.add(e.chapter);
    const groupedFollower = !!e.chapter && !isHead;

    return {
      ...e,
      preview: e.staticPreview ?? previewUrl(e.liveUrl),
      groupHead: isHead,
      groupedFollower,
      shortUrl: shortHost(e.liveUrl),
      shortRepo: shortRepoPath(e.repoUrl),
    };
  });
}

const INITIAL_ENTRIES = buildEntries();

const offRecord = OFF_THE_RECORD;
const totals = OFF_THE_RECORD_TOTALS;
const zoom = ZOOMED_OUT;

export default function OneWeekPage() {
  const [entries, setEntries] = useState(INITIAL_ENTRIES);

  useEffect(() => {
    // For entries that have no static asset, the preview was set to the
    // Microlink live URL. For entries that DO have a static asset, optionally
    // upgrade to the Microlink screenshot in the background — same approach as
    // the project card.
    let cancelled = false;
    const loaders = [];

    INITIAL_ENTRIES.forEach((entry, idx) => {
      if (!entry.staticPreview || !entry.liveUrl) return;
      const live = previewUrl(entry.liveUrl);
      if (!live) return;

      const img = new Image();
      img.onload = () => {
        if (cancelled) return;
        setEntries((prev) => {
          const next = [...prev];
          next[idx] = { ...next[idx], preview: live };
          return next;
        });
      };
      img.onerror = () => { /* keep static — no problem */ };
      img.src = live;
      loaders.push(img);
    });

    return () => {
      cancelled = true;
      loaders.forEach((img) => {
        img.onload = null;
        img.onerror = null;
      });
    };
  }, []);

  return (
    <div className="app-one-week">
      <main className="case-study">
        <section className="section">
          <div className="container">

            {/* Masthead — same vocabulary as The Archive */}
            <header className="masthead">
              <div className="masthead-rule">
                <span className="rule-tag">CHAPTER TWO · CASE STUDY</span>
              </div>
              <h1 className="title">
                <em>One</em> Week
              </h1>
              <p className="subtitle">
                Four products. Seven days. Two shipped on the same afternoon.{' '}
                <span className="mono">[ APR 27 → MAY 04 · 2026 ]</span>
              </p>
            </header>

            {/* Stat strip — mirrors the filter row vocabulary in The Archive */}
            <div className="stat-strip" aria-label="Sprint summary">
              <div className="stat">
                <span className="stat-num">04</span>
                <span className="stat-label">PRODUCTS</span>
              </div>
              <div className="stat">
                <span className="stat-num">07</span>
                <span className="stat-label">DAYS</span>
              </div>
              <div className="stat">
                <span className="stat-num">04</span>
                <span className="stat-label">LIVE URLS</span>
              </div>
              <div className="stat">
                <span className="stat-num">250</span>
                <span className="stat-label">COMMITS · ALL REPOS</span>
              </div>
            </div>

            {/* Pre-amble — frame the constraint, not the metrics */}
            <p className="lede">
              <em>The claim</em>: in the seven days ending today, four products went live —
              two of them launched in the same afternoon, hours apart. What follows is the
              ledger, in chronological order. No retconned timeline; commit timestamps speak
              for themselves.
            </p>

            {/* Timeline */}
            <ol className="timeline">
              {entries.map((entry, i) => (
                <Fragment key={i}>

                  {/* Chapter sub-header sits above the FIRST card of a same-day group */}
                  {entry.chapter && entry.groupHead ? (
                    <li className="chapter-head" style={{ '--theme-accent': entry.accent }}>
                      <span className="chapter-rule"></span>
                      <span className="chapter-tag">{entry.chapter}</span>
                      <span className="chapter-rule"></span>
                    </li>
                  ) : null}

                  <li
                    className={entry.groupedFollower ? 'entry entry--grouped' : 'entry'}
                    style={{ '--theme-accent': entry.accent }}
                  >
                    {/* Date stamp */}
                    <aside className="date-side">
                      <div className="date-stamp">
                        <span className="date-day">{entry.date}</span>
                        <span className="date-weekday">{entry.weekday}</span>
                      </div>
                      <span className="date-rule"></span>
                      <span className="date-window">{entry.windowSummary}</span>
                    </aside>

                    {/* Card */}
                    <div className="card">
                      <header className="card-head">
                        <h2 className="card-title">{entry.title}</h2>
                        <p className="card-tagline"><em>{entry.tagline}</em></p>
                      </header>

                      {entry.preview ? (
                        <a
                          className="polaroid"
                          href={entry.liveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={'Visit ' + entry.title}
                        >
                          <div className="polaroid-tape"></div>
                          <div className="polaroid-frame">
                            <div className="polaroid-browser">
                              <span className="browser-dot"></span>
                              <span className="browser-dot"></span>
                              <span className="browser-dot"></span>
                              <span className="browser-url">{entry.shortUrl}</span>
                            </div>
                            <img
                              className="polaroid-img"
                              src={entry.preview}
                              alt={entry.title + ' — live site preview'}
                              loading="lazy"
                              decoding="async"
                            />
                            <div className="polaroid-hover">
                              <span>open live →</span>
                            </div>
                          </div>
                        </a>
                      ) : null}

                      <ul className="notes">
                        {entry.buildNotes.map((note, n) => (
                          <li key={note} className="note">
                            <span className="note-num">{pad(n + 1)}</span>
                            <span className="note-text">{note}</span>
                          </li>
                        ))}
                      </ul>

                      <footer className="card-foot">
                        {entry.liveUrl ? (
                          <a
                            className="visit"
                            href={entry.liveUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <span className="visit-arrow">→</span>
                            <span className="visit-text">view it live</span>
                            <span className="visit-url">{entry.shortUrl}</span>
                          </a>
                        ) : (
                          <span className="visit visit--retired" aria-disabled="true">
                            <span className="visit-arrow">×</span>
                            <span className="visit-text">decommissioned</span>
                          </span>
                        )}

                        {entry.repoUrl ? (
                          <a
                            className="repo"
                            href={entry.repoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <span className="repo-tag">open source</span>
                            <span className="repo-sep">·</span>
                            <span className="repo-host">{entry.shortRepo}</span>
                            <span className="repo-arrow">↗</span>
                          </a>
                        ) : null}

                        {entry.archiveSlug ? (
                          <Link className="archive-link" href="/#projects">
                            <span className="archive-arrow">↩</span>
                            <span>read the long-form in <em>The Archive</em></span>
                          </Link>
                        ) : null}
                      </footer>
                    </div>
                  </li>
                </Fragment>
              ))}
            </ol>

            {/* ===== OFF THE RECORD ===== */}
            {/* The four shipped products are the visible portion. The full
                 GitHub ledger for the same window includes private repos and
                 work commits that don't normally show up on a portfolio. */}
            <section className="off-record" aria-labelledby="off-record-heading">
              <header className="off-head">
                <div className="off-rule">
                  <span className="off-eyebrow">OFF THE RECORD · INCLUDING PRIVATE REPOS</span>
                </div>
                <h2 id="off-record-heading" className="off-title">
                  <em>The</em> full ledger
                </h2>
                <p className="off-lede">
                  The four products above are what you can click. Below is what GitHub
                  actually saw across the same seven days — public, private, and one
                  work repository — because most of the throughput lives in places a
                  portfolio normally can't show.
                </p>
              </header>

              {/* Aggregate totals, larger than the top stat strip */}
              <div className="off-totals">
                <div className="off-total">
                  <span className="off-total-num">{totals.commits}</span>
                  <span className="off-total-label">COMMITS</span>
                </div>
                <div className="off-total">
                  <span className="off-total-num">{totals.repos}</span>
                  <span className="off-total-label">REPOS TOUCHED</span>
                </div>
                <div className="off-total">
                  <span className="off-total-num">{totals.privateRepos}</span>
                  <span className="off-total-label">PRIVATE</span>
                </div>
                <div className="off-total">
                  <span className="off-total-num">{totals.publicRepos}</span>
                  <span className="off-total-label">PUBLIC</span>
                </div>
              </div>

              {/* Repo ledger — sorted descending by commit count */}
              <div className="ledger" role="table" aria-label="Per-repo commit ledger for the window">
                <div className="ledger-head" role="row">
                  <span role="columnheader">REPO</span>
                  <span role="columnheader" className="ledger-priv-h">VISIBILITY</span>
                  <span role="columnheader" className="ledger-num-h">COMMITS</span>
                </div>
                {offRecord.map((row) => (
                  <div
                    key={row.name}
                    className={row.privacy === 'WORK · PRIVATE' ? 'ledger-row ledger-row--work' : 'ledger-row'}
                    role="row"
                  >
                    <div className="ledger-name" role="cell">
                      <span className="ledger-repo">{row.name}</span>
                      <span className="ledger-blurb">{row.blurb}</span>
                    </div>
                    <span
                      className={
                        'ledger-priv' +
                        (row.privacy === 'PUBLIC' ? ' priv-public' : '') +
                        (row.privacy === 'PRIVATE' ? ' priv-private' : '') +
                        (row.privacy === 'WORK · PRIVATE' ? ' priv-work' : '')
                      }
                      role="cell"
                    >{row.privacy}</span>
                    <span className="ledger-num" role="cell">{row.commits}</span>
                  </div>
                ))}
              </div>

              <p className="off-foot">
                <em>Context</em>: on GitHub since {totals.githubJoined}.
                This week is not the average — most weeks ship one product, not four.
                The point of this page is to show what's possible when the stack, the
                tooling, and the focus all line up.
              </p>
            </section>

            {/* ===== ZOOMED OUT — lifetime / yearly base rate ===== */}
            <section className="zoom-out" aria-labelledby="zoom-out-heading">
              <header className="zoom-head">
                <div className="zoom-rule">
                  <span className="zoom-eyebrow">ZOOMED OUT · BASE RATE</span>
                </div>
                <h2 id="zoom-out-heading" className="zoom-title">
                  <em>The</em> base rate
                </h2>
                <p className="zoom-lede">
                  Pulled back from the seven-day window, here is what GitHub's commit
                  index records across every repo I've authored to. Sets the context
                  for whether one big week is an outlier or a sample of how I work.
                </p>
              </header>

              <div className="zoom-grid">
                <div className="zoom-cell zoom-cell--hero">
                  <span className="zoom-num">{zoom.lastYearContributions.toLocaleString('en-US')}</span>
                  <span className="zoom-label">CONTRIBUTIONS · LAST YEAR</span>
                  <span className="zoom-sub">as counted on the GitHub profile calendar (commits, PRs, issues, reviews — public &amp; private)</span>
                </div>
                <div className="zoom-cell">
                  <span className="zoom-num">{zoom.ytdCommits.toLocaleString('en-US')}</span>
                  <span className="zoom-label">COMMITS · 2026 YTD</span>
                </div>
                <div className="zoom-cell">
                  <span className="zoom-num">~{zoom.weeklyAverage}</span>
                  <span className="zoom-label">CONTRIBUTIONS / WEEK</span>
                </div>
                <div className="zoom-cell">
                  <span className="zoom-num">{totals.githubJoined.split(' ')[1]}</span>
                  <span className="zoom-label">ON GITHUB SINCE</span>
                  <span className="zoom-sub">{totals.githubJoined} · 11 years</span>
                </div>
              </div>

              {/* The punchline: this week vs the base rate, as a single sentence */}
              <p className="zoom-punch">
                This week — <strong>{totals.commits}</strong> commits.
                About <strong>{zoom.weekMultiple}×</strong> the weekly average.{' '}
                <em>Not the floor. Not the ceiling. A sample of what's possible
                when the stack, the tooling, and the focus all line up.</em>
              </p>
            </section>

            {/* Footer rule + outbound link */}
            <footer className="closing">
              <div className="closing-rule">
                <span className="closing-tag">END · CASE STUDY</span>
              </div>
              <p className="closing-line">
                For the long-form versions of each entry —{' '}
                <Link href="/#projects" className="closing-link">return to <em>The Archive</em> →</Link>
              </p>
            </footer>

          </div>
        </section>
      </main>

      <style jsx>{`
        .app-one-week {
          display: block;
          background: var(--ink);
          color: var(--text);
          min-height: 100vh;
        }

        .case-study {
          padding-top: 88px; /* clears the fixed nav */
        }

        @media (max-width: 768px) {
          .case-study { padding-top: 72px; }
        }

        /* ===== MASTHEAD ===== */
        .masthead {
          margin-bottom: 4rem;
          max-width: 820px;
        }

        .masthead-rule {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .masthead-rule::before {
          content: '';
          flex: 0 0 60px;
          height: 1px;
          background: var(--ember);
        }

        .masthead-rule::after {
          content: '';
          flex: 1;
          height: 1px;
          background: var(--rule);
        }

        .rule-tag {
          font-family: var(--font-mono);
          font-size: 0.7rem;
          letter-spacing: 0.25em;
          color: var(--brass);
        }

        .title {
          font-family: var(--font-display);
          font-variation-settings: 'opsz' 144, 'WONK' 1;
          font-size: clamp(3rem, 8vw, 6rem);
          line-height: 0.95;
          font-weight: 400;
          color: var(--paper);
          letter-spacing: -0.04em;
          margin-bottom: 1.25rem;
        }

        .title em {
          font-style: italic;
          font-weight: 200;
          color: var(--text-mute);
          font-size: 0.7em;
          margin-right: 0.25rem;
        }

        .subtitle {
          font-family: var(--font-display);
          font-style: italic;
          font-size: 1.15rem;
          color: var(--text);
          line-height: 1.6;
        }

        .subtitle .mono {
          font-family: var(--font-mono);
          font-style: normal;
          font-size: 0.75rem;
          color: var(--brass-mute);
          margin-left: 0.75rem;
          letter-spacing: 0.1em;
        }

        /* ===== STAT STRIP ===== */
        .stat-strip {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 0;
          padding: 1.5rem 0;
          margin-bottom: 3rem;
          border-top: 1px solid var(--rule);
          border-bottom: 1px solid var(--rule);
        }

        .stat {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
          padding: 0 1.5rem;
          border-right: 1px solid var(--rule);
        }

        .stat:last-child { border-right: none; }

        .stat-num {
          font-family: var(--font-display);
          font-variation-settings: 'opsz' 144;
          font-size: 2rem;
          line-height: 1;
          color: var(--ember);
          font-weight: 300;
          letter-spacing: -0.02em;
        }

        .stat-label {
          font-family: var(--font-mono);
          font-size: 0.65rem;
          letter-spacing: 0.2em;
          color: var(--text-faint);
        }

        @media (max-width: 768px) {
          .stat-strip {
            grid-template-columns: repeat(2, 1fr);
          }
          .stat {
            padding: 0.75rem 1rem;
            border-right: 1px solid var(--rule);
            border-bottom: 1px solid var(--rule);
          }
          .stat:nth-child(2n) { border-right: none; }
          .stat:nth-last-child(-n+2) { border-bottom: none; }
        }

        /* ===== LEDE ===== */
        .lede {
          max-width: 720px;
          font-family: var(--font-display);
          font-size: 1.05rem;
          line-height: 1.7;
          color: var(--text);
          margin-bottom: 4rem;
          padding-left: 1.5rem;
          border-left: 1px solid var(--rule);
        }

        .lede em {
          font-style: italic;
          color: var(--brass);
          font-weight: 500;
        }

        /* ===== TIMELINE ===== */
        .timeline {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 4rem;
          margin-bottom: 5rem;
        }

        /* Sub-header for grouped same-day entries */
        .chapter-head {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-top: 1rem;
          margin-bottom: -2rem; /* tuck it just above the next entry */
        }

        .chapter-rule {
          flex: 1;
          height: 1px;
          background: var(--theme-accent, var(--ember));
          opacity: 0.45;
        }

        .chapter-tag {
          font-family: var(--font-mono);
          font-size: 0.75rem;
          letter-spacing: 0.3em;
          color: var(--theme-accent, var(--ember));
          padding: 0 0.5rem;
        }

        /* ===== ENTRY ===== */
        .entry {
          display: grid;
          grid-template-columns: 200px 1fr;
          gap: 3rem;
          align-items: start;
        }

        .entry--grouped {
          position: relative;
          padding-left: 0;
        }

        /* Vertical "this is part of the same day" rule, only on grouped followers */
        .entry--grouped::before {
          content: '';
          position: absolute;
          left: -1.5rem;
          top: 0;
          bottom: 0;
          width: 1px;
          background: var(--theme-accent, var(--ember));
          opacity: 0.35;
        }

        .date-side {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          position: sticky;
          top: 120px;
        }

        .date-stamp {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          padding: 0.85rem 1rem;
          border: 1px solid var(--theme-accent, var(--ember));
          width: max-content;
        }

        .date-day {
          font-family: var(--font-mono);
          font-size: 1rem;
          letter-spacing: 0.2em;
          color: var(--theme-accent, var(--ember));
          font-weight: 600;
        }

        .date-weekday {
          font-family: var(--font-mono);
          font-size: 0.65rem;
          letter-spacing: 0.3em;
          color: var(--text-mute);
        }

        .date-rule {
          width: 40px;
          height: 1px;
          background: var(--rule);
        }

        .date-window {
          font-family: var(--font-mono);
          font-size: 0.7rem;
          color: var(--text-faint);
          letter-spacing: 0.05em;
          line-height: 1.5;
          max-width: 180px;
        }

        /* ===== CARD ===== */
        .card {
          max-width: 720px;
        }

        .card-head {
          margin-bottom: 1.75rem;
        }

        .card-title {
          font-family: var(--font-display);
          font-variation-settings: 'opsz' 144;
          font-size: clamp(1.75rem, 4vw, 2.5rem);
          font-weight: 400;
          color: var(--paper);
          line-height: 1.1;
          letter-spacing: -0.02em;
          margin-bottom: 0.5rem;
        }

        .card-tagline {
          font-family: var(--font-display);
          font-size: 1.05rem;
          color: var(--text-mute);
          line-height: 1.5;
        }

        .card-tagline em {
          font-style: italic;
        }

        /* ===== POLAROID — borrowed vocabulary from project-card ===== */
        .polaroid {
          display: block;
          position: relative;
          margin-bottom: 2rem;
          text-decoration: none;
          cursor: pointer;
          transform: rotate(-0.4deg);
          transition: transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
          max-width: 580px;
        }

        .polaroid:hover {
          transform: rotate(0deg) translateY(-3px);
        }

        .polaroid:hover .polaroid-frame {
          box-shadow:
            0 24px 48px rgba(0, 0, 0, 0.55),
            0 10px 20px rgba(0, 0, 0, 0.35),
            0 0 0 1px var(--theme-accent, var(--ember));
        }

        .polaroid:hover .polaroid-hover { opacity: 1; }
        .polaroid:hover .polaroid-img { filter: brightness(0.7) saturate(0.8); }

        .polaroid-tape {
          position: absolute;
          top: -12px;
          left: 50%;
          transform: translateX(-50%) rotate(-2deg);
          width: 80px;
          height: 22px;
          background: rgba(212, 169, 97, 0.25);
          background-image: repeating-linear-gradient(
            90deg,
            transparent 0,
            transparent 4px,
            rgba(255, 255, 255, 0.04) 4px,
            rgba(255, 255, 255, 0.04) 5px
          );
          z-index: 2;
          border-left: 1px solid rgba(212, 169, 97, 0.3);
          border-right: 1px solid rgba(212, 169, 97, 0.3);
          pointer-events: none;
        }

        .polaroid-frame {
          position: relative;
          background: var(--paper);
          padding: 12px 12px 14px;
          box-shadow:
            0 18px 36px rgba(0, 0, 0, 0.45),
            0 7px 14px rgba(0, 0, 0, 0.25);
          transition: box-shadow 0.4s ease;
          overflow: hidden;
        }

        .polaroid-browser {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          padding: 6px 10px;
          background: #1a1817;
          margin-bottom: 8px;
          border-radius: 4px 4px 0 0;
        }

        .browser-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: rgba(212, 169, 97, 0.4);
        }

        .browser-dot:nth-child(1) { background: #ef4444; }
        .browser-dot:nth-child(2) { background: #eab308; }
        .browser-dot:nth-child(3) { background: #22c55e; }

        .browser-url {
          flex: 1;
          text-align: center;
          font-family: var(--font-mono);
          font-size: 0.65rem;
          color: var(--paper-mute);
          letter-spacing: 0.05em;
          padding: 2px 0;
        }

        .polaroid-img {
          width: 100%;
          display: block;
          aspect-ratio: 16 / 10;
          object-fit: cover;
          object-position: top center;
          background: #1a1817;
          transition: filter 0.4s ease;
        }

        .polaroid-hover {
          position: absolute;
          inset: 12px 12px 14px 12px;
          margin-top: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(10, 9, 7, 0.55);
          font-family: var(--font-mono);
          font-size: 0.85rem;
          letter-spacing: 0.2em;
          color: var(--theme-accent, var(--ember));
          text-transform: uppercase;
          opacity: 0;
          transition: opacity 0.3s ease;
          pointer-events: none;
          font-weight: 600;
        }

        /* ===== NOTES (build-log bullets) ===== */
        .notes {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
          margin-bottom: 2rem;
          padding-left: 0;
        }

        .note {
          display: grid;
          grid-template-columns: 36px 1fr;
          gap: 0.85rem;
          align-items: baseline;
          font-family: var(--font-display);
          font-size: 1rem;
          line-height: 1.6;
          color: var(--text);
        }

        .note-num {
          font-family: var(--font-mono);
          font-size: 0.7rem;
          letter-spacing: 0.15em;
          color: var(--theme-accent, var(--ember));
          padding-top: 0.15rem;
        }

        .note-text {
          font-style: italic;
        }

        /* ===== CARD FOOTER ===== */
        .card-foot {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          padding-top: 1.5rem;
          border-top: 1px solid var(--rule);
        }

        /* <Link> is a component, so it doesn't receive the styled-jsx scope class */
        .visit, .repo, .app-one-week :global(.archive-link) {
          display: inline-flex;
          align-items: baseline;
          gap: 0.6rem;
          text-decoration: none;
          color: var(--text);
          transition: color 0.25s;
          width: max-content;
        }

        .visit {
          font-family: var(--font-display);
          font-size: 1.05rem;
          font-style: italic;
          color: var(--theme-accent, var(--ember));
        }

        .visit:hover { opacity: 0.85; }

        .visit--retired {
          color: var(--brass-mute);
          opacity: 0.75;
          cursor: default;
          pointer-events: none;
        }
        .visit--retired:hover { opacity: 0.75; }

        .visit-arrow {
          font-family: var(--font-mono);
          font-style: normal;
          font-size: 0.9rem;
        }

        .visit-url {
          font-family: var(--font-mono);
          font-style: normal;
          font-size: 0.7rem;
          color: var(--brass-mute);
          letter-spacing: 0.05em;
          margin-left: 0.4rem;
        }

        .repo {
          font-family: var(--font-mono);
          font-size: 0.7rem;
          color: var(--text-faint);
          letter-spacing: 0.05em;
        }

        .repo:hover { color: var(--brass); }

        .repo-tag {
          text-transform: uppercase;
          letter-spacing: 0.2em;
          color: var(--brass-mute);
        }

        .repo-sep { color: var(--rule-light); }

        .app-one-week :global(.archive-link) {
          font-family: var(--font-display);
          font-size: 0.9rem;
          font-style: italic;
          color: var(--text-mute);
        }

        .app-one-week :global(.archive-link:hover) { color: var(--ember); }

        .app-one-week :global(.archive-link) em { font-style: italic; }

        /* ===== OFF THE RECORD ===== */
        .off-record {
          margin-top: 5rem;
          padding-top: 4rem;
          border-top: 2px solid var(--ember);
        }

        .off-head {
          max-width: 760px;
          margin-bottom: 3rem;
        }

        .off-rule {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .off-rule::before {
          content: '';
          flex: 0 0 40px;
          height: 1px;
          background: var(--ember);
        }

        .off-rule::after {
          content: '';
          flex: 1;
          height: 1px;
          background: var(--rule);
        }

        .off-eyebrow {
          font-family: var(--font-mono);
          font-size: 0.7rem;
          letter-spacing: 0.3em;
          color: var(--ember);
        }

        .off-title {
          font-family: var(--font-display);
          font-variation-settings: 'opsz' 144, 'WONK' 1;
          font-size: clamp(2.25rem, 5vw, 3.5rem);
          line-height: 1;
          font-weight: 400;
          color: var(--paper);
          letter-spacing: -0.03em;
          margin-bottom: 1rem;
        }

        .off-title em {
          font-style: italic;
          font-weight: 200;
          color: var(--text-mute);
          font-size: 0.6em;
          margin-right: 0.25rem;
        }

        .off-lede {
          font-family: var(--font-display);
          font-style: italic;
          font-size: 1.05rem;
          line-height: 1.7;
          color: var(--text);
        }

        /* Big totals row */
        .off-totals {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 0;
          padding: 2rem 0;
          margin-bottom: 3rem;
          border-top: 1px solid var(--rule);
          border-bottom: 1px solid var(--rule);
        }

        .off-total {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
          padding: 0 1.5rem;
          border-right: 1px solid var(--rule);
        }

        .off-total:last-child { border-right: none; }

        .off-total-num {
          font-family: var(--font-display);
          font-variation-settings: 'opsz' 144;
          font-size: clamp(2.5rem, 5vw, 3.75rem);
          line-height: 1;
          color: var(--ember);
          font-weight: 300;
          letter-spacing: -0.03em;
        }

        .off-total-label {
          font-family: var(--font-mono);
          font-size: 0.65rem;
          letter-spacing: 0.2em;
          color: var(--text-faint);
        }

        /* Ledger table */
        .ledger {
          display: flex;
          flex-direction: column;
          margin-bottom: 2.5rem;
          border: 1px solid var(--rule);
        }

        .ledger-head, .ledger-row {
          display: grid;
          grid-template-columns: 1fr 160px 100px;
          gap: 1.5rem;
          padding: 1rem 1.5rem;
          align-items: center;
        }

        .ledger-head {
          background: rgba(255, 107, 53, 0.04);
          border-bottom: 1px solid var(--rule);
          font-family: var(--font-mono);
          font-size: 0.65rem;
          letter-spacing: 0.25em;
          color: var(--text-faint);
        }

        .ledger-priv-h, .ledger-num-h {
          text-align: right;
        }

        .ledger-row {
          border-bottom: 1px dashed var(--rule);
          transition: background 0.25s ease;
        }

        .ledger-row:last-child { border-bottom: none; }

        .ledger-row:hover {
          background: rgba(255, 107, 53, 0.03);
        }

        .ledger-row--work {
          background: rgba(201, 169, 97, 0.04);
        }

        .ledger-name {
          display: flex;
          flex-direction: column;
          gap: 0.3rem;
          min-width: 0;
        }

        .ledger-repo {
          font-family: var(--font-mono);
          font-size: 0.85rem;
          color: var(--paper);
          letter-spacing: 0.02em;
          word-break: break-all;
        }

        .ledger-blurb {
          font-family: var(--font-display);
          font-style: italic;
          font-size: 0.9rem;
          color: var(--text-mute);
          line-height: 1.45;
        }

        .ledger-priv {
          font-family: var(--font-mono);
          font-size: 0.65rem;
          letter-spacing: 0.25em;
          text-align: right;
          padding: 0.3rem 0.6rem;
          border: 1px solid var(--rule);
          width: max-content;
          justify-self: end;
        }

        .priv-public {
          color: #5eb87a;
          border-color: rgba(94, 184, 122, 0.3);
        }

        .priv-private {
          color: var(--brass);
          border-color: rgba(201, 169, 97, 0.4);
        }

        .priv-work {
          color: var(--ember);
          border-color: var(--ember-deep);
        }

        .ledger-num {
          font-family: var(--font-display);
          font-variation-settings: 'opsz' 144;
          font-size: 2rem;
          color: var(--ember);
          text-align: right;
          letter-spacing: -0.02em;
          font-weight: 300;
          line-height: 1;
        }

        .off-foot {
          max-width: 720px;
          font-family: var(--font-display);
          font-style: italic;
          font-size: 1rem;
          line-height: 1.7;
          color: var(--text-mute);
          padding-left: 1.5rem;
          border-left: 1px solid var(--rule);
        }

        .off-foot em {
          font-style: italic;
          color: var(--brass);
          font-weight: 500;
        }

        /* ===== ZOOMED OUT ===== */
        .zoom-out {
          margin-top: 5rem;
          padding-top: 4rem;
          border-top: 1px solid var(--rule);
        }

        .zoom-head {
          max-width: 760px;
          margin-bottom: 3rem;
        }

        .zoom-rule {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .zoom-rule::before {
          content: '';
          flex: 0 0 40px;
          height: 1px;
          background: var(--brass);
        }

        .zoom-rule::after {
          content: '';
          flex: 1;
          height: 1px;
          background: var(--rule);
        }

        .zoom-eyebrow {
          font-family: var(--font-mono);
          font-size: 0.7rem;
          letter-spacing: 0.3em;
          color: var(--brass);
        }

        .zoom-title {
          font-family: var(--font-display);
          font-variation-settings: 'opsz' 144, 'WONK' 1;
          font-size: clamp(2.25rem, 5vw, 3.5rem);
          line-height: 1;
          font-weight: 400;
          color: var(--paper);
          letter-spacing: -0.03em;
          margin-bottom: 1rem;
        }

        .zoom-title em {
          font-style: italic;
          font-weight: 200;
          color: var(--text-mute);
          font-size: 0.6em;
          margin-right: 0.25rem;
        }

        .zoom-lede {
          font-family: var(--font-display);
          font-style: italic;
          font-size: 1.05rem;
          line-height: 1.7;
          color: var(--text);
        }

        /* Big stat grid — hero cell spans 2 columns on desktop */
        .zoom-grid {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1fr;
          gap: 0;
          margin-bottom: 3rem;
          border-top: 1px solid var(--rule);
          border-bottom: 1px solid var(--rule);
        }

        .zoom-cell {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          padding: 2rem 1.75rem;
          border-right: 1px solid var(--rule);
        }

        .zoom-cell:last-child { border-right: none; }

        .zoom-cell--hero {
          background: rgba(255, 107, 53, 0.04);
        }

        .zoom-cell--hero .zoom-num {
          font-size: clamp(3.5rem, 7vw, 5rem);
          color: var(--ember);
        }

        .zoom-num {
          font-family: var(--font-display);
          font-variation-settings: 'opsz' 144;
          font-size: clamp(2.5rem, 5vw, 3.5rem);
          line-height: 1;
          color: var(--paper);
          font-weight: 300;
          letter-spacing: -0.03em;
        }

        .zoom-label {
          font-family: var(--font-mono);
          font-size: 0.7rem;
          letter-spacing: 0.25em;
          color: var(--text-faint);
        }

        .zoom-sub {
          font-family: var(--font-display);
          font-style: italic;
          font-size: 0.85rem;
          color: var(--text-mute);
          margin-top: 0.25rem;
        }

        .zoom-punch {
          max-width: 720px;
          font-family: var(--font-display);
          font-size: 1.1rem;
          line-height: 1.7;
          color: var(--text);
          padding: 1.75rem 2rem;
          border: 1px solid var(--ember-deep);
          background: rgba(255, 107, 53, 0.05);
          position: relative;
        }

        .zoom-punch::before {
          content: '';
          position: absolute;
          top: -1px;
          left: -1px;
          width: 24px;
          height: 24px;
          border-top: 2px solid var(--ember);
          border-left: 2px solid var(--ember);
        }

        .zoom-punch::after {
          content: '';
          position: absolute;
          bottom: -1px;
          right: -1px;
          width: 24px;
          height: 24px;
          border-bottom: 2px solid var(--ember);
          border-right: 2px solid var(--ember);
        }

        .zoom-punch strong {
          color: var(--ember);
          font-weight: 600;
          font-style: normal;
        }

        .zoom-punch em {
          font-style: italic;
          color: var(--text-mute);
          display: block;
          margin-top: 0.5rem;
          font-size: 0.95rem;
        }

        /* ===== CLOSING ===== */
        .closing {
          margin-top: 4rem;
          padding-top: 3rem;
          border-top: 1px solid var(--rule);
        }

        .closing-rule {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .closing-rule::before, .closing-rule::after {
          content: '';
          flex: 1;
          height: 1px;
          background: var(--rule);
        }

        .closing-tag {
          font-family: var(--font-mono);
          font-size: 0.65rem;
          letter-spacing: 0.3em;
          color: var(--brass-mute);
        }

        .closing-line {
          font-family: var(--font-display);
          font-style: italic;
          font-size: 1rem;
          color: var(--text-mute);
          text-align: center;
        }

        .app-one-week :global(.closing-link) {
          color: var(--ember);
          text-decoration: none;
          border-bottom: 1px solid var(--ember-deep);
          transition: opacity 0.25s;
        }

        .app-one-week :global(.closing-link:hover) { opacity: 0.85; }

        .app-one-week :global(.closing-link) em { font-style: italic; }

        /* ===== RESPONSIVE ===== */
        @media (max-width: 900px) {
          .entry {
            grid-template-columns: 1fr;
            gap: 1.5rem;
          }
          .date-side {
            position: static;
            flex-direction: row;
            align-items: center;
            gap: 1rem;
          }
          .date-rule {
            width: 24px;
          }
          .date-window {
            max-width: none;
          }
          .entry--grouped::before {
            left: -0.75rem;
          }
          .polaroid {
            transform: rotate(0deg);
            max-width: 100%;
          }

          .off-totals {
            grid-template-columns: repeat(2, 1fr);
          }
          .off-total {
            padding: 0.75rem 1rem;
            border-right: 1px solid var(--rule);
            border-bottom: 1px solid var(--rule);
          }
          .off-total:nth-child(2n) { border-right: none; }
          .off-total:nth-last-child(-n+2) { border-bottom: none; }

          .ledger-head {
            display: none;
          }
          .ledger-row {
            grid-template-columns: 1fr 80px;
            grid-template-rows: auto auto;
            gap: 0.5rem 1rem;
          }
          .ledger-name {
            grid-column: 1 / -1;
          }
          .ledger-priv {
            grid-row: 2;
            justify-self: start;
            font-size: 0.6rem;
          }
          .ledger-num {
            grid-row: 2;
            font-size: 1.5rem;
          }

          .zoom-grid {
            grid-template-columns: 1fr 1fr;
          }
          .zoom-cell {
            padding: 1.5rem 1.25rem;
            border-right: 1px solid var(--rule);
            border-bottom: 1px solid var(--rule);
          }
          .zoom-cell:nth-child(2n) { border-right: none; }
          .zoom-cell:nth-last-child(-n+2) { border-bottom: none; }
          .zoom-cell--hero {
            grid-column: 1 / -1;
            border-right: none;
          }
        }

        @media (max-width: 640px) {
          .masthead {
            margin-bottom: 2.5rem;
          }
          .lede {
            font-size: 1rem;
            margin-bottom: 2.5rem;
          }
          .timeline {
            gap: 3rem;
          }
          .card-title {
            font-size: 1.5rem;
          }
          .card-tagline {
            font-size: 0.95rem;
          }
          .note {
            font-size: 0.95rem;
            grid-template-columns: 28px 1fr;
            gap: 0.6rem;
          }
          .subtitle .mono {
            display: block;
            margin-left: 0;
            margin-top: 0.5rem;
          }
        }
      `}</style>
    </div>
  );
}
