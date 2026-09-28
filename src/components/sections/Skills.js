'use client';

const starSlots = [1, 2, 3, 4, 5];

const groups = [
  {
    name: 'Programming Languages',
    skills: [
      { name: 'Python', level: 'Expert', rate: 5 },
      { name: 'JavaScript', level: 'Advanced', rate: 4 },
      { name: 'Java', level: 'Expert', rate: 5 },
      { name: 'C++', level: 'Proficient', rate: 3 },
      { name: 'Ruby', level: 'Proficient', rate: 3 },
      { name: 'SQL', level: 'Expert', rate: 5 },
    ],
  },
  {
    name: 'Frameworks & Libraries',
    skills: [
      { name: 'React', level: 'Advanced', rate: 4 },
      { name: 'Next.js', level: 'Advanced', rate: 4 },
      { name: 'GraphQL', level: 'Advanced', rate: 4 },
      { name: 'Elasticsearch', level: 'Expert', rate: 5 },
      { name: 'OpenSearch', level: 'Expert', rate: 5 },
      { name: 'TensorFlow', level: 'Proficient', rate: 3 },
    ],
  },
  {
    name: 'Cloud & DevOps',
    skills: [
      { name: 'AWS', level: 'Expert', rate: 5 },
      { name: 'Docker', level: 'Expert', rate: 5 },
      { name: 'Kubernetes', level: 'Expert', rate: 5 },
      { name: 'Jenkins', level: 'Advanced', rate: 4 },
      { name: 'Git CI/CD', level: 'Advanced', rate: 4 },
      { name: 'Linux', level: 'Advanced', rate: 4 },
    ],
  },
  {
    name: 'Databases & Data Technologies',
    skills: [
      { name: 'PostgreSQL', level: 'Expert', rate: 5 },
      { name: 'MySQL', level: 'Advanced', rate: 4 },
      { name: 'Neo4j', level: 'Proficient', rate: 3 },
      { name: 'MongoDB', level: 'Advanced', rate: 4 },
      { name: 'Apache Kafka', level: 'Advanced', rate: 4 },
      { name: 'Redis', level: 'Advanced', rate: 4 },
    ],
  },
  {
    name: 'Tools & Platforms',
    skills: [
      { name: 'Claude Code', level: 'Advanced', rate: 4 },
      { name: 'OpenSearch Dashboards', level: 'Expert', rate: 5 },
      { name: 'Custom Relevance Tooling', level: 'Expert', rate: 5 },
      { name: 'Search Analytics', level: 'Expert', rate: 5 },
      { name: 'Index Management', level: 'Expert', rate: 5 },
      { name: 'Observability', level: 'Advanced', rate: 4 },
    ],
  },
];

const softSkills = [
  'Cross-functional collaboration',
  'Stakeholder communication',
  'Technical mentorship',
  'Problem-solving',
  'Adaptability',
  'Resourcefulness',
];

function pad(n) {
  return n.toString().padStart(2, '0');
}

export default function Skills() {
  return (
    <div className="app-skills">
      <section id="skills" className="section skills">
        <div className="container">
          <header className="masthead">
            <div className="masthead-rule">
              <span className="rule-tag">CHAPTER THREE · CRAFT</span>
            </div>
            <h2 className="archive-title">
              <em>Technical</em> Skills
            </h2>
            <p className="archive-subtitle">
              Rated by depth of production use — not tutorial familiarity.
              Five stars means shipped it under pressure; one means still learning.
            </p>
          </header>

          {groups.map((group) => (
            <div key={group.name} className="skill-group">
              <h3 className="group-head">{group.name}</h3>
              <ul className="skill-list">
                {group.skills.map((skill, i) => (
                  <li key={skill.name} className="skill-row">
                    <span className="skill-num">{pad(i + 1)}</span>
                    <div className="skill-main">
                      <span className="skill-name">{skill.name}</span>
                      <span className="skill-level">{skill.level}</span>
                    </div>
                    <div
                      className="skill-stars"
                      aria-label={skill.rate + ' out of 5 stars'}
                    >
                      {starSlots.map((star, s) => (
                        <span
                          key={s}
                          className={'star' + (s < skill.rate ? ' star--filled' : '')}
                          aria-hidden="true"
                        >★</span>
                      ))}
                      <span className="star-count">{skill.rate}/5</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className="skill-group">
            <h3 className="group-head">Soft Skills</h3>
            <ul className="soft-list">
              {softSkills.map((skill) => (
                <li key={skill} className="soft-tag">{skill}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <style jsx>{`
        .app-skills {
          display: block;
        }

        .skills {
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

        .skill-group {
          margin-bottom: 3.5rem;
        }

        .skill-group:last-child {
          margin-bottom: 0;
        }

        .group-head {
          font-family: var(--font-mono);
          font-size: 0.75rem;
          font-weight: 500;
          letter-spacing: 0.25em;
          text-transform: uppercase;
          color: var(--brass);
          margin-bottom: 1rem;
        }

        .skill-list {
          list-style: none;
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          column-gap: 3rem;
          border-top: 1px solid var(--rule);
        }

        .soft-list {
          list-style: none;
          display: flex;
          flex-wrap: wrap;
          gap: 0.75rem;
          padding-top: 1.25rem;
          border-top: 1px solid var(--rule);
        }

        .soft-tag {
          font-family: var(--font-display);
          font-size: 1.05rem;
          color: var(--paper);
          border: 1px solid var(--rule-light);
          padding: 0.45rem 1rem;
        }

        .skill-row {
          display: grid;
          grid-template-columns: 48px 1fr auto;
          align-items: center;
          gap: 1.5rem;
          padding: 1.35rem 0.5rem;
          border-bottom: 1px solid var(--rule);
          transition: background 0.3s ease, padding-left 0.3s ease;
        }

        .skill-row:hover {
          background: rgba(255, 107, 53, 0.03);
          padding-left: 1rem;
        }

        .skill-num {
          font-family: var(--font-mono);
          font-size: 0.7rem;
          letter-spacing: 0.15em;
          color: var(--brass-mute);
        }

        .skill-main {
          display: flex;
          flex-direction: column;
          gap: 0.3rem;
          min-width: 0;
        }

        .skill-name {
          font-family: var(--font-display);
          font-size: 1.35rem;
          font-weight: 400;
          color: var(--paper);
          letter-spacing: -0.015em;
          line-height: 1.15;
        }

        .skill-level {
          font-family: var(--font-mono);
          font-size: 0.7rem;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--brass);
        }

        .skill-stars {
          display: flex;
          align-items: center;
          gap: 0.2rem;
          flex-shrink: 0;
        }

        .star {
          font-size: 1.1rem;
          line-height: 1;
          color: var(--rule-light);
          transition: color 0.25s ease, transform 0.25s ease;
        }

        .star--filled {
          color: var(--ember);
        }

        .skill-row:hover .star--filled {
          transform: scale(1.08);
        }

        .star-count {
          font-family: var(--font-mono);
          font-size: 0.7rem;
          letter-spacing: 0.1em;
          color: var(--text-mute);
          margin-left: 0.65rem;
          min-width: 2.5rem;
        }

        @media (max-width: 900px) {
          .skill-list {
            grid-template-columns: 1fr;
          }
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

          .skill-row {
            grid-template-columns: 36px 1fr;
            grid-template-rows: auto auto;
            gap: 0.5rem 1rem;
            padding: 1.15rem 0.25rem;
          }

          .skill-stars {
            grid-column: 2;
          }

          .skill-name {
            font-size: 1.15rem;
          }
        }

        @media (max-width: 480px) {
          .masthead-rule::before {
            flex: 0 0 30px;
          }

          .rule-tag {
            font-size: 0.6rem;
          }

          .star {
            font-size: 1rem;
          }

          .star-count {
            margin-left: 0.4rem;
          }
        }
      `}</style>
    </div>
  );
}
