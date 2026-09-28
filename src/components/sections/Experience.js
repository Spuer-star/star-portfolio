'use client';

const roles = [
  {
    title: 'Senior Search Architect',
    company: 'PNC',
    period: 'Oct 2023 – Present',
    summary:
      'Designs and runs OpenSearch clusters and search APIs across financial products — led the migration of search architecture to AWS, cut operational costs by 18%, and raised indexing speed by 35%.',
  },
  {
    title: 'Lead Software Engineer',
    company: 'T-Mobile',
    period: 'Jul 2022 – Sep 2023',
    summary:
      'Led the Elasticsearch to OpenSearch upgrade, reducing query costs by 12%, improved relevance for customer support tools by 30%, and piloted LLM-based semantic search experiments.',
  },
  {
    title: 'Search Technology Specialist',
    company: 'UCSF Health',
    period: 'Apr 2020 – Jun 2022',
    summary:
      'Overhauled Elasticsearch search for medical record systems, improving clinician data access speed by 20%, and launched indexing pipelines that cut data refresh times by 50%.',
  },
  {
    title: 'Software Engineer',
    company: 'Principal Financial Group',
    period: 'Jan 2018 – Mar 2020',
    summary:
      'Engineered custom search for financial trading platforms, optimising index queries by 40%, and built fault-tolerant search architecture for peak trading hours.',
  },
  {
    title: 'Junior Software Engineer',
    company: 'Wissen Technology',
    period: 'May 2013 – Oct 2015',
    summary:
      'Helped roll out Elasticsearch across new projects, built small-scale ETL pipelines, and improved search throughput by 15%.',
  },
];

function pad(n) {
  return n.toString().padStart(2, '0');
}

export default function Experience() {
  return (
    <div className="app-experience">
      <section id="experience" className="section experience">
        <div className="container">
          <header className="masthead">
            <div className="masthead-rule">
              <span className="rule-tag">CHAPTER TWO · ENGAGEMENTS</span>
            </div>
            <h2 className="archive-title">
              <em>Work</em> Experience
            </h2>
            <p className="archive-subtitle">
              Thirteen years building search and data systems across
              finance, telecom, and healthcare.
            </p>
          </header>

          <ol className="roles">
            {roles.map((role, i) => (
              <li key={role.company} className="role">
                <aside className="role-numeral">
                  <span className="numeral-prefix">№</span>
                  <span className="numeral-digit">{pad(i + 1)}</span>
                </aside>

                <div className="role-body">
                  <header className="role-header">
                    <div className="role-heading">
                      <h3 className="role-title">{role.title}</h3>
                      <p className="role-company">
                        <em>at</em> {role.company}
                      </p>
                    </div>
                    <div className="role-meta">
                      <span className="role-period">{role.period}</span>
                    </div>
                  </header>
                  <p className="role-summary">{role.summary}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <style jsx>{`
        .app-experience {
          display: block;
        }

        .experience {
          background: var(--ink);
        }

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
          margin-bottom: 1.5rem;
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
          line-height: 1.7;
        }

        .roles {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 0;
          border-top: 1px solid var(--rule);
        }

        .role {
          display: grid;
          grid-template-columns: 100px 1fr;
          gap: 2rem;
          padding: 2.5rem 0;
          border-bottom: 1px solid var(--rule);
          transition: background 0.3s ease;
        }

        .role:hover {
          background: rgba(255, 107, 53, 0.03);
        }

        .role-numeral {
          display: flex;
          align-items: baseline;
          gap: 0.25rem;
          padding-top: 0.25rem;
        }

        .numeral-prefix {
          font-family: var(--font-display);
          font-style: italic;
          font-size: 0.9rem;
          color: var(--brass);
        }

        .numeral-digit {
          font-family: var(--font-display);
          font-variation-settings: 'opsz' 144, 'WONK' 1;
          font-size: 2.5rem;
          font-weight: 200;
          color: var(--ember);
          line-height: 1;
          letter-spacing: -0.03em;
        }

        .role-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 2rem;
          margin-bottom: 1rem;
          flex-wrap: wrap;
        }

        .role-title {
          font-family: var(--font-display);
          font-size: clamp(1.35rem, 2.5vw, 1.85rem);
          font-weight: 400;
          color: var(--paper);
          letter-spacing: -0.02em;
          line-height: 1.15;
          margin-bottom: 0.35rem;
        }

        .role-company {
          font-family: var(--font-display);
          font-size: 1.1rem;
          color: var(--text);
        }

        .role-company em {
          font-style: italic;
          color: var(--text-mute);
          font-weight: 200;
          margin-right: 0.25rem;
        }

        .role-meta {
          font-family: var(--font-mono);
          font-size: 0.75rem;
          letter-spacing: 0.08em;
          color: var(--text-mute);
          text-align: right;
          white-space: nowrap;
        }

        .dot {
          margin: 0 0.35rem;
          color: var(--brass-mute);
        }

        .role-summary {
          font-family: var(--font-display);
          font-size: 1.05rem;
          line-height: 1.7;
          color: var(--text);
          max-width: 65ch;
        }

        @media (max-width: 700px) {
          .masthead {
            margin-bottom: 3rem;
          }

          .archive-title {
            font-size: clamp(2.25rem, 12vw, 3rem);
          }

          .archive-subtitle {
            font-size: 1rem;
          }

          .role {
            grid-template-columns: 60px 1fr;
            gap: 1rem;
            padding: 2rem 0;
          }

          .numeral-digit {
            font-size: 1.75rem;
          }

          .role-header {
            flex-direction: column;
            gap: 0.75rem;
          }

          .role-meta {
            text-align: left;
            white-space: normal;
          }

          .role-summary {
            font-size: 0.95rem;
          }
        }

        @media (max-width: 480px) {
          .masthead-rule::before {
            flex: 0 0 30px;
          }

          .rule-tag {
            font-size: 0.6rem;
          }

          .role {
            grid-template-columns: 1fr;
            gap: 0.75rem;
          }

          .role-numeral {
            padding-top: 0;
          }
        }
      `}</style>
    </div>
  );
}
