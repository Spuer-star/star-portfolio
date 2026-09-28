'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { CATEGORY_LABELS, PROJECTS } from '@/lib/projects';
import ProjectCard from './ProjectCard';

const totalCount = PROJECTS.length;

/** Only show category chips that actually have at least one project. */
const filterChips = (() => {
  const usedCategories = new Set(PROJECTS.map((p) => p.category));
  return [
    { value: 'all', label: 'ALL' },
    ...Object.entries(CATEGORY_LABELS)
      .filter(([value]) => usedCategories.has(value))
      .map(([value, label]) => ({
        value,
        label: label.toUpperCase(),
      })),
  ];
})();

export default function Projects() {
  const [activeFilter, setActiveFilter] = useState('all');

  const filteredProjects = useMemo(
    () =>
      activeFilter === 'all'
        ? PROJECTS
        : PROJECTS.filter((p) => p.category === activeFilter),
    [activeFilter],
  );

  const filteredCount = filteredProjects.length;

  return (
    <div className="app-projects">
      <section id="projects" className="section archive">
        <div className="container">
          {/* Case-study inserts: slim editorial strips above the masthead */}
          <Link className="case-study-strip" href="/mcu">
            <span className="strip-eyebrow">CHAPTER FOUR · NEW</span>
            <span className="strip-claim">
              A 2014 credit-union site, rebuilt for 2026.{' '}
              <em>Drag to compare the rebuild</em>
            </span>
            <span className="strip-arrow">→</span>
          </Link>

          <Link className="case-study-strip" href="/lonsdale">
            <span className="strip-eyebrow">CHAPTER THREE</span>
            <span className="strip-claim">
              WordPress to Astro, agency to me.{' '}
              <em>Drag to compare the cutover</em>
            </span>
            <span className="strip-arrow">→</span>
          </Link>

          <Link className="case-study-strip" href="/one-week">
            <span className="strip-eyebrow">CHAPTER TWO</span>
            <span className="strip-claim">
              Four products shipped in seven days.{' '}
              <em>Read the case study</em>
            </span>
            <span className="strip-arrow">→</span>
          </Link>

          {/* Section masthead */}
          <header className="masthead">
            <div className="masthead-rule">
              <span className="rule-tag">CHAPTER ONE</span>
            </div>
            <h2 className="archive-title">
              <em>The</em> Archive
            </h2>
            <p className="archive-subtitle">
              Ten entries. Each shipped, each studied.{' '}
              <span className="mono">[ {filteredCount} of {totalCount} listed ]</span>
            </p>
          </header>

          {/* Filter row */}
          <nav className="filter-row" aria-label="Filter projects">
            <span className="filter-label">FILTER BY DISCIPLINE</span>
            <div className="filter-chips">
              {filterChips.map((chip) => (
                <button
                  key={chip.value}
                  className={'chip' + (activeFilter === chip.value ? ' chip--active' : '')}
                  onClick={() => setActiveFilter(chip.value)}
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </nav>

          {/* Project entries */}
          <div className="entries">
            {filteredProjects.map((project, i) => (
              <ProjectCard
                key={project.id}
                project={project}
                index={i + 1}
                reversed={i % 2 === 1}
              />
            ))}
          </div>
        </div>
      </section>

      <style jsx>{`
        .archive {
          background: var(--ink);
          position: relative;
        }

        /* Case-study strip — printed-insert vibe, sits above the masthead.
           Rendered by next/link, which doesn't receive the scoped class, so
           these rules are :global() under the scoped container. */
        .container > :global(.case-study-strip) {
          display: flex;
          align-items: baseline;
          gap: 1.25rem;
          padding: 1.5rem 0;
          margin-bottom: 4rem;
          border-top: 1px solid var(--ember);
          border-bottom: 1px solid var(--rule);
          text-decoration: none;
          transition: background 0.3s ease, padding-left 0.3s ease;
          flex-wrap: wrap;
        }

        .container > :global(.case-study-strip:hover) {
          background: rgba(255, 107, 53, 0.04);
          padding-left: 0.5rem;
        }

        .container > :global(.case-study-strip:hover) .strip-arrow {
          transform: translateX(4px);
          color: var(--ember);
        }

        .strip-eyebrow {
          font-family: var(--font-mono);
          font-size: 0.65rem;
          letter-spacing: 0.3em;
          color: var(--ember);
          white-space: nowrap;
        }

        .strip-claim {
          flex: 1;
          font-family: var(--font-display);
          font-size: 1.1rem;
          color: var(--paper);
          font-style: normal;
          letter-spacing: -0.01em;
          min-width: 280px;
        }

        .strip-claim em {
          font-style: italic;
          color: var(--ember);
          margin-left: 0.5rem;
        }

        .strip-arrow {
          font-family: var(--font-mono);
          font-size: 1.2rem;
          color: var(--brass);
          transition: transform 0.3s ease, color 0.3s ease;
        }

        @media (max-width: 640px) {
          .container > :global(.case-study-strip) {
            gap: 0.5rem;
            margin-bottom: 2.5rem;
            padding: 1rem 0;
          }
          .strip-claim {
            font-size: 1rem;
          }
          .strip-eyebrow {
            font-size: 0.6rem;
          }
        }

        /* Masthead */
        .masthead {
          margin-bottom: 5rem;
          max-width: 780px;
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

        .archive-title {
          font-family: var(--font-display);
          font-variation-settings: 'opsz' 144, 'WONK' 1;
          font-size: clamp(3rem, 8vw, 6rem);
          line-height: 0.95;
          font-weight: 400;
          color: var(--paper);
          letter-spacing: -0.04em;
          margin-bottom: 1.25rem;
        }

        .archive-title em {
          font-style: italic;
          font-weight: 200;
          color: var(--text-mute);
          font-size: 0.7em;
          margin-right: 0.25rem;
        }

        .archive-subtitle {
          font-family: var(--font-display);
          font-style: italic;
          font-size: 1.15rem;
          color: var(--text);
          line-height: 1.6;
        }

        .archive-subtitle .mono {
          font-family: var(--font-mono);
          font-style: normal;
          font-size: 0.75rem;
          color: var(--brass-mute);
          margin-left: 0.75rem;
          letter-spacing: 0.1em;
        }

        /* Filter row */
        .filter-row {
          display: flex;
          align-items: center;
          gap: 2rem;
          margin-bottom: 5rem;
          padding: 1.25rem 0;
          border-top: 1px solid var(--rule);
          border-bottom: 1px solid var(--rule);
          flex-wrap: wrap;
        }

        .filter-label {
          font-family: var(--font-mono);
          font-size: 0.65rem;
          letter-spacing: 0.25em;
          color: var(--text-faint);
          white-space: nowrap;
        }

        .filter-chips {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .chip {
          font-family: var(--font-mono);
          font-size: 0.7rem;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          padding: 0.5rem 1rem;
          background: transparent;
          color: var(--text-mute);
          border: 1px solid var(--rule);
          cursor: pointer;
          transition: all 0.25s ease;
          font-weight: 500;
        }

        .chip:hover {
          color: var(--ember);
          border-color: var(--ember-deep);
        }

        .chip--active {
          background: var(--ember);
          color: var(--ink);
          border-color: var(--ember);
        }

        /* Entries — generous but not overwhelming */
        .entries {
          display: flex;
          flex-direction: column;
          gap: 4.5rem;
        }

        .entries > :global(.app-project-card:not(:first-child)) {
          padding-top: 4.5rem;
          border-top: 1px solid var(--rule);
        }

        /* Tighter spacing for side projects so they cluster and don't feel
           weighty like flagship entries. */
        .entries > :global(.app-project-card:has(.entry--side)) {
          padding-top: 2.75rem;
        }

        @media (max-width: 1024px) {
          .entries {
            gap: 3.5rem;
          }
          .entries > :global(.app-project-card:not(:first-child)) {
            padding-top: 3.5rem;
          }
        }

        @media (max-width: 640px) {
          .section {
            padding: 4rem 1rem;
          }
          .archive {
            padding: 4rem 0;
          }
          .masthead {
            margin-bottom: 2.5rem;
          }
          .archive-title {
            font-size: clamp(2.25rem, 12vw, 3rem);
          }
          .archive-subtitle {
            font-size: 1rem;
          }
          .archive-subtitle .mono {
            display: block;
            margin-left: 0;
            margin-top: 0.5rem;
          }
          .masthead-rule::before {
            flex: 0 0 30px;
          }
          .rule-tag {
            font-size: 0.6rem;
            letter-spacing: 0.2em;
          }
          .filter-row {
            margin-bottom: 2.5rem;
            gap: 1rem;
            padding: 1rem 0;
            flex-direction: column;
            align-items: flex-start;
          }
          .filter-label {
            font-size: 0.6rem;
          }
          .chip {
            font-size: 0.65rem;
            padding: 0.4rem 0.75rem;
            letter-spacing: 0.1em;
          }
          .entries {
            gap: 3rem;
          }
          .entries > :global(.app-project-card:not(:first-child)) {
            padding-top: 3rem;
          }
        }
      `}</style>
    </div>
  );
}
