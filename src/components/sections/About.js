'use client';

import Link from 'next/link';

const stats = [
  { value: '13', label: 'Years in software' },
  { value: '5', label: 'Companies' },
  { value: '5', label: 'Certifications' },
  { value: 'MS', label: 'Computer Science' },
];

function pad(n) {
  return n.toString().padStart(2, '0');
}

export default function About() {
  return (
    <div className="app-about">
      <section id="about" className="section about">
        <div className="container">
          <header className="masthead">
            <div className="masthead-rule">
              <span className="rule-tag">CHAPTER FOUR</span>
            </div>
            <h2 className="archive-title">
              <em>About the</em> Author
            </h2>
          </header>

          <div className="about-grid">
            {/* Left: Bio */}
            <article className="bio">
              <p className="bio-p">
                Thirteen years in software, specialising in{' '}
                <span className="emph">search systems</span> for finance, telecom,
                and healthcare. Deep in Elasticsearch and OpenSearch —
                indexing strategies, relevance tuning, and ingestion pipelines
                — with a track record of raising data retrieval accuracy by 28%.
              </p>
              <p className="bio-p">
                I bridge product requirements and technical architecture:
                cutting zero-result rates, migrating search platforms to the
                cloud, and piloting <span className="emph">LLM-based semantic
                search</span> alongside traditional retrieval. Master&apos;s in
                Computer Science from the{' '}
                <span className="emph">University of North Texas</span>.
              </p>
              <Link className="cv-link" href="/cv">
                <span className="visit-arrow">→</span>
                <span>read full curriculum vitae</span>
              </Link>
            </article>

            {/* Right: Stats column */}
            <aside className="stats-column">
              <div className="stats-header">
                <span className="meta-num">i.</span>
                <span className="meta-label">at a glance</span>
              </div>
              <dl className="stats-list">
                {stats.map((stat, i) => (
                  <div key={stat.label} className="stat-row">
                    <dt className="stat-label">
                      <span className="stat-num">{pad(i + 1)}</span>
                      {stat.label}
                    </dt>
                    <dd className="stat-value">{stat.value}</dd>
                  </div>
                ))}
              </dl>
            </aside>
          </div>
        </div>
      </section>

      <style jsx>{`
        .app-about {
          display: block;
        }

        .about {
          background: var(--ink);
        }

        /* Masthead — same as projects */
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
        }

        .archive-title em {
          font-style: italic;
          font-weight: 200;
          color: var(--text-mute);
          font-size: 0.7em;
          margin-right: 0.25rem;
        }

        /* Grid */
        .about-grid {
          display: grid;
          grid-template-columns: 1.3fr 1fr;
          gap: 5rem;
          align-items: start;
        }

        /* Bio */
        .bio-p {
          font-family: var(--font-display);
          font-size: 1.15rem;
          line-height: 1.8;
          color: var(--text);
          margin-bottom: 1.5rem;
          max-width: 60ch;
        }

        .bio-p:first-of-type::first-letter {
          font-family: var(--font-display);
          font-variation-settings: 'opsz' 144, 'WONK' 1;
          font-size: 3.5em;
          float: left;
          line-height: 0.85;
          margin-right: 0.6rem;
          margin-top: 0.4rem;
          color: var(--ember);
          font-weight: 400;
        }

        .emph {
          color: var(--paper);
          font-weight: 500;
          font-style: italic;
        }

        /* The CV link is rendered by next/link, which doesn't receive the
           scoped class, so its rules are :global() under the scoped .bio. */
        .bio :global(.cv-link) {
          display: inline-flex;
          align-items: center;
          gap: 0.75rem;
          margin-top: 1.5rem;
          font-family: var(--font-mono);
          font-size: 0.8rem;
          letter-spacing: 0.05em;
          color: var(--text);
          text-transform: uppercase;
          transition: color 0.3s;
          position: relative;
          padding-bottom: 0.25rem;
        }

        .bio :global(.cv-link::after) {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 1px;
          background: var(--ember);
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 0.4s cubic-bezier(0.65, 0, 0.35, 1);
        }

        .bio :global(.cv-link:hover) {
          color: var(--ember);
        }

        .bio :global(.cv-link:hover::after) {
          transform: scaleX(1);
        }

        .visit-arrow {
          font-size: 1.2rem;
          color: var(--ember);
          transition: transform 0.3s;
        }

        .bio :global(.cv-link:hover) .visit-arrow {
          transform: translateX(4px);
        }

        /* Stats column */
        .stats-column {
          border: 1px solid var(--rule);
          padding: 2rem;
          background: linear-gradient(180deg, var(--ink-warm) 0%, transparent 100%);
        }

        .stats-header {
          display: flex;
          align-items: baseline;
          gap: 0.5rem;
          margin-bottom: 1.5rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid var(--rule);
        }

        .meta-num {
          font-family: var(--font-display);
          font-style: italic;
          font-size: 0.95rem;
          color: var(--brass);
        }

        .meta-label {
          font-family: var(--font-mono);
          font-size: 0.7rem;
          letter-spacing: 0.25em;
          text-transform: uppercase;
          color: var(--text-mute);
        }

        .stats-list {
          display: flex;
          flex-direction: column;
        }

        .stat-row {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          padding: 1rem 0;
          border-bottom: 1px dashed var(--rule);
        }

        .stat-row:last-child {
          border-bottom: none;
        }

        .stat-label {
          display: flex;
          align-items: baseline;
          gap: 0.6rem;
          font-family: var(--font-display);
          font-style: italic;
          font-size: 1rem;
          color: var(--text);
        }

        .stat-num {
          font-family: var(--font-mono);
          font-size: 0.65rem;
          color: var(--brass-mute);
          letter-spacing: 0.15em;
          font-style: normal;
        }

        .stat-value {
          font-family: var(--font-display);
          font-variation-settings: 'opsz' 144, 'WONK' 1;
          font-size: 2.5rem;
          font-weight: 400;
          color: var(--ember);
          letter-spacing: -0.03em;
          line-height: 1;
        }

        @media (max-width: 900px) {
          .about-grid {
            grid-template-columns: 1fr;
            gap: 3rem;
          }
          .masthead {
            margin-bottom: 3rem;
          }
          .stat-value {
            font-size: 2rem;
          }
        }

        @media (max-width: 640px) {
          .archive-title {
            font-size: clamp(2.25rem, 12vw, 3rem);
          }
          .bio-p {
            font-size: 1rem;
            line-height: 1.7;
          }
          .stats-column {
            padding: 1.5rem;
          }
          .stat-value {
            font-size: 1.5rem;
          }
          .stat-row {
            padding: 0.75rem 0;
          }
          .stat-label {
            font-size: 0.9rem;
          }
        }

        @media (max-width: 480px) {
          .bio-p:first-of-type::first-letter {
            font-size: 2.5em;
          }
          .masthead-rule::before {
            flex: 0 0 30px;
          }
          .rule-tag {
            font-size: 0.6rem;
          }
        }
      `}</style>
    </div>
  );
}
