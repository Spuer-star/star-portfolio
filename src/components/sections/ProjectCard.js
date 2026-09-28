'use client';

import { useEffect, useRef, useState } from 'react';
import { previewUrl } from '@/lib/projects';
import styles from './ProjectCard.styles';

function pad(n) {
  return n.toString().padStart(2, '0');
}

export default function ProjectCard({ project, index = 0, reversed = false }) {
  /** Current preview src — starts with the static asset, upgrades to live Microlink when loaded */
  const [currentPreview, setCurrentPreview] = useState(() => {
    // Polaroid renders when EITHER a staticPreview is provided OR there is
    // a liveUrl we can hand to Microlink. Projects with neither (e.g. MCU
    // Loan System — internal, no public URL) opt out entirely. Rugby CV
    // explicitly skips the polaroid by setting neither, since headless
    // screenshots of its annotation tool are unreliable.
    if (project.staticPreview) {
      // Step 1: show the captured PNG immediately (instant)
      return project.staticPreview;
    } else if (project.liveUrl) {
      // No static asset — show the Microlink screenshot directly. There is
      // no instant frame, but it loads in the background and replaces the
      // empty placeholder when ready.
      return previewUrl(project.liveUrl);
    }
    return null;
  });
  const livePreviewLoaded = useRef(false);

  const preview = currentPreview;

  useEffect(() => {
    // Step 2 (when both exist): preload the live Microlink in the background
    // and upgrade once it's ready. Browser only — SSR has no Image.
    if (!(project.staticPreview && project.liveUrl)) return;
    const liveUrl = previewUrl(project.liveUrl);
    if (!liveUrl) return;

    let cancelled = false;
    const img = new Image();
    img.onload = () => {
      if (cancelled) return;
      setCurrentPreview(liveUrl);
      livePreviewLoaded.current = true;
    };
    img.onerror = () => {
      // Live failed — keep showing static, no problem
    };
    img.src = liveUrl;

    return () => {
      cancelled = true;
      img.onload = null;
      img.onerror = null;
    };
  }, []);

  const paddedIndex = index.toString().padStart(2, '0');

  const shortUrl = (() => {
    const url = project.liveUrl;
    if (!url) return '';
    try {
      const u = new URL(url);
      return u.host.replace(/^www\./, '');
    } catch {
      return url;
    }
  })();

  const shortRepo = (() => {
    const url = project.repoUrl;
    if (!url) return '';
    try {
      const u = new URL(url);
      // host + first two path segments → "github.com/coeymusa/What-is-your-concern"
      const path = u.pathname.split('/').filter(Boolean).slice(0, 2).join('/');
      return path ? `${u.host}/${path}` : u.host;
    } catch {
      return url;
    }
  })();

  const specimenStr = (key) => {
    const v = project.specimen.data[key];
    return v != null ? String(v) : '';
  };

  const categoryLabel = (() => {
    const labels = {
      'saas': 'SAAS',
      'platform': 'PLATFORM',
      'enterprise': 'ENTERPRISE',
      'consultancy': 'CONSULTANCY',
      'ml': 'ML/CV',
      'service': 'SERVICE',
    };
    return labels[project.category] || project.category.toUpperCase();
  })();

  const isSide = project.tier === 'side';
  const theme = project.theme;

  const entryClassName =
    'entry' + (reversed ? ' entry--reversed' : '') + (isSide ? ' entry--side' : '');

  return (
    <div className="app-project-card">
      <article
        className={entryClassName}
        data-theme={project.theme}
        style={{ '--theme-accent': project.accent }}
      >
        {/* Numeral pillar */}
        <aside className="numeral-side">
          <div className="numeral-block">
            <span className="numeral-prefix">№</span>
            <span className="numeral-digit">{paddedIndex}</span>
          </div>
          <div className="numeral-meta">
            {isSide && (
              <>
                <span className="tier-tag">SIDE · WEEKEND BUILD</span>
                <span className="cat-rule"></span>
              </>
            )}
            <span className="cat-tag">{categoryLabel}</span>
            <span className="cat-rule"></span>
            <span className="cat-id">{project.id}</span>
          </div>
        </aside>

        {/* Main content */}
        <div className="content-side">
          <header className="entry-header">
            <h3 className="entry-title">{project.title}</h3>
            <p className="entry-tagline"><em>{project.tagline}</em></p>
          </header>

          {/* POLAROID PREVIEW (if site is live) */}
          {preview && (
            <a
              className="polaroid"
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={'Visit ' + project.title}
            >
              <div className="polaroid-tape"></div>
              <div className="polaroid-frame">
                <div className="polaroid-browser">
                  <span className="browser-dot"></span>
                  <span className="browser-dot"></span>
                  <span className="browser-dot"></span>
                  <span className="browser-url">{shortUrl}</span>
                </div>
                <img
                  className="polaroid-img"
                  src={preview}
                  alt={project.title + ' — live site preview'}
                  loading="lazy"
                  decoding="async"
                />
                <div className="polaroid-hover">
                  <span>open live →</span>
                </div>
              </div>
              {project.previewCaption && (
                <p className="polaroid-caption">{project.previewCaption}</p>
              )}
            </a>
          )}

          {/* THEMED SPECIMEN DEVICE */}
          {!project.hideSpecimen && (
            <div className="specimen-frame" data-kind={project.theme}>
              {theme === 'ai-chat' && (
                <div className="device device-prompt">
                  <div className="prompt-bar">
                    <span className="prompt-dot d1"></span>
                    <span className="prompt-dot d2"></span>
                    <span className="prompt-dot d3"></span>
                    <span className="prompt-host">promptmysite.com</span>
                  </div>
                  <div className="prompt-row prompt-user">
                    <span className="prompt-arrow">›</span>
                    <span>{specimenStr('userPrompt')}</span>
                  </div>
                  <div className="prompt-row prompt-ai">
                    <span className="prompt-arrow ai">∗</span>
                    <span className="prompt-stream">{specimenStr('aiResponse')}<span className="caret"></span></span>
                  </div>
                  <div className="prompt-meta">
                    <span>tokens: {specimenStr('tokens')}</span>
                    <span>·</span>
                    <span>streaming</span>
                  </div>
                </div>
              )}

              {theme === 'compliance' && (
                <div className="device device-compliance">
                  <div className="compl-header">
                    <span className="compl-ref">REF: {specimenStr('ref')}</span>
                    <span className="stamp">{specimenStr('status')}</span>
                  </div>
                  <div className="compl-rule"></div>
                  <dl className="compl-list">
                    <div><dt>Scope</dt><dd>{specimenStr('scope')}</dd></div>
                    <div><dt>Signed</dt><dd>{specimenStr('signedBy')}</dd></div>
                  </dl>
                </div>
              )}

              {theme === 'fintech-ledger' && (
                <div className="device device-ledger">
                  <div className="ledger-header">
                    <span>MEMBER</span>
                    <span>PRINCIPAL</span>
                    <span>RATE</span>
                    <span className="r">STATUS</span>
                  </div>
                  <div className="ledger-row">
                    <span>{specimenStr('memberId')}</span>
                    <span className="amount">{specimenStr('principal')}</span>
                    <span>{specimenStr('rate')}</span>
                    <span className="r status-ok">{specimenStr('status')}</span>
                  </div>
                  <div className="ledger-foot">
                    <span className="dot"></span><span>committee approved · disbursed</span>
                  </div>
                </div>
              )}

              {theme === 'sports-card' && (
                <div className="device device-sports">
                  <div className="sport-num">{specimenStr('cap')}</div>
                  <div className="sport-meta">
                    <span className="sport-pos">{specimenStr('position')}</span>
                    <span className="sport-flag">{specimenStr('country')}</span>
                  </div>
                  <div className="sport-score">
                    <span className="score-label">MATCH SCORE</span>
                    <span className="score-num">{specimenStr('matchScore')}</span>
                  </div>
                  <div className="sport-line"></div>
                </div>
              )}

              {theme === 'enterprise-gantt' && (
                <div className="device device-gantt">
                  <div className="gantt-row">
                    <span className="gantt-wbs">{specimenStr('wbs')}</span>
                    <div className="gantt-track">
                      <div className="gantt-bar"></div>
                    </div>
                  </div>
                  <div className="gantt-row">
                    <span className="gantt-wbs">WBS-3.2.2</span>
                    <div className="gantt-track">
                      <div className="gantt-bar half"></div>
                    </div>
                  </div>
                  <div className="gantt-row">
                    <span className="gantt-wbs">WBS-3.2.3</span>
                    <div className="gantt-track">
                      <div className="gantt-bar quarter"></div>
                    </div>
                  </div>
                  <div className="gantt-meta">
                    <span>{specimenStr('task')}</span>
                    <span className="evm">{specimenStr('evm')}</span>
                  </div>
                </div>
              )}

              {theme === 'cv-frame' && (
                <div className="device device-cv">
                  <div className="cv-frame-bar">
                    <span>FRAME {specimenStr('frame')}</span>
                    <span className="rec">● REC</span>
                  </div>
                  <div className="cv-canvas">
                    <div className="bbox bbox-1">
                      <span className="bbox-label">{specimenStr('detection')}</span>
                    </div>
                    <div className="bbox bbox-2">
                      <span className="bbox-label">PLAYER · 0.91</span>
                    </div>
                    <div className="bbox bbox-3">
                      <span className="bbox-label">BALL · 0.87</span>
                    </div>
                  </div>
                  <div className="cv-stats">
                    <span>EVENT: {specimenStr('event')}</span>
                    <span>{specimenStr('f1')}</span>
                  </div>
                </div>
              )}

              {theme === 'mobile-chat' && (
                <div className="device device-chat">
                  <div className="chat-head">
                    <div className="avatar">{specimenStr('contact').charAt(0)}</div>
                    <div>
                      <div className="chat-name">{specimenStr('contact')}</div>
                      <div className="chat-status">{specimenStr('lastSeen')}</div>
                    </div>
                    <div className="chat-unread">{specimenStr('unread')}</div>
                  </div>
                  <div className="chat-bubble bubble-them">
                    <span>{specimenStr('message')}</span>
                  </div>
                  <div className="chat-bubble bubble-mine">
                    <span>got it ✓ — added to your context</span>
                  </div>
                </div>
              )}

              {theme === 'cockpit-ops' && (
                <div className="device device-cockpit">
                  <div className="cockpit-bar">
                    <span className="cockpit-pulse"></span>
                    <span className="cockpit-title">MCU COCKPIT</span>
                    <span className="cockpit-status">OPS · LIVE</span>
                  </div>
                  <div className="cockpit-stats">
                    <div className="cockpit-stat">
                      <span className="stat-label">TICKETS</span>
                      <span className="stat-value">{specimenStr('tickets')}</span>
                    </div>
                    <div className="cockpit-stat">
                      <span className="stat-label">DEPLOYS</span>
                      <span className="stat-value">{specimenStr('deploys')}</span>
                    </div>
                    <div className="cockpit-stat">
                      <span className="stat-label">AGENTS</span>
                      <span className="stat-value">{specimenStr('agents')}</span>
                    </div>
                  </div>
                  <div className="cockpit-feed">
                    <div className="feed-row">
                      <span className="feed-arrow">▸</span>
                      <span className="feed-text">{specimenStr('activity1')}</span>
                      <span className="feed-state agent">{specimenStr('activity1State')}</span>
                    </div>
                    <div className="feed-row">
                      <span className="feed-arrow">▸</span>
                      <span className="feed-text">{specimenStr('activity2')}</span>
                      <span className="feed-state running">{specimenStr('activity2State')}</span>
                    </div>
                    <div className="feed-row">
                      <span className="feed-arrow">▸</span>
                      <span className="feed-text">{specimenStr('activity3')}</span>
                      <span className="feed-state ok">{specimenStr('activity3State')}</span>
                    </div>
                    <div className="feed-row">
                      <span className="feed-arrow">▸</span>
                      <span className="feed-text">{specimenStr('activity4')}</span>
                      <span className="feed-state">{specimenStr('activity4State')}</span>
                    </div>
                  </div>
                </div>
              )}

              {theme === 'service-stamp' && (
                <div className="device device-stamp">
                  <div className="stamp-row">
                    <div className="stamp-col">
                      <span className="stamp-label">INTAKE</span>
                      <span className="stamp-text">{specimenStr('intake')}</span>
                    </div>
                    <div className="stamp-arrow">→</div>
                    <div className="stamp-col">
                      <span className="stamp-label">SHIPPED</span>
                      <span className="stamp-text">{specimenStr('shipped')}</span>
                    </div>
                  </div>
                  <div className="stamp-mark">
                    <span className="stamp-num">{specimenStr('days')}</span>
                    <span className="stamp-unit">DAY<br />TURNAROUND</span>
                  </div>
                  <div className="stamp-foot">{specimenStr('guarantee')}</div>
                </div>
              )}

              {theme === 'global-atlas' && (
                <div className="device device-atlas">
                  <div className="atlas-header">
                    <span className="atlas-title">THE RECORD</span>
                    <span className="atlas-live">
                      <span className="atlas-dot"></span> LIVE
                    </span>
                  </div>
                  <div className="atlas-body">
                    <svg className="atlas-globe-svg" viewBox="0 0 100 100" aria-hidden="true">
                      <circle cx="50" cy="50" r="38" fill="rgba(245,234,205,0.04)" stroke="rgba(245,234,205,0.3)" strokeWidth="0.7" />
                      <ellipse cx="50" cy="50" rx="38" ry="14" fill="none" stroke="rgba(245,234,205,0.18)" strokeDasharray="1.5 2.5" />
                      <ellipse cx="50" cy="50" rx="14" ry="38" fill="none" stroke="rgba(245,234,205,0.18)" strokeDasharray="1.5 2.5" />
                      <line x1="12" y1="50" x2="88" y2="50" stroke="rgba(245,234,205,0.10)" />
                      <circle cx="62" cy="38" r="3" fill="var(--theme-accent)" />
                      <circle cx="62" cy="38" r="1" fill="#ffb19a" />
                      <circle cx="36" cy="58" r="2.2" fill="var(--theme-accent)" opacity="0.6" />
                      <circle cx="58" cy="68" r="1.8" fill="var(--theme-accent)" opacity="0.45" />
                    </svg>
                    <dl className="atlas-list">
                      <div><dt>VOICES</dt><dd>{specimenStr('voices')}</dd></div>
                      <div><dt>COUNTRIES</dt><dd>{specimenStr('countries')}</dd></div>
                      <div><dt>LATEST</dt><dd>{specimenStr('latest')}</dd></div>
                      <div><dt>SIGNAL</dt><dd className="r">{specimenStr('signal')}</dd></div>
                    </dl>
                  </div>
                </div>
              )}
            </div>
          )}

          <p className="entry-description">{project.description}</p>

          {/* Two-column meta */}
          <div className="meta-grid">
            <div className="meta-block">
              <div className="meta-heading">
                <span className="meta-num">i.</span>
                <span className="meta-label">stack</span>
              </div>
              <ul className="tech-list">
                {project.techStack.map((tech) => (
                  <li key={tech.name} className="tech-item" data-cat={tech.category}>
                    {tech.name}
                  </li>
                ))}
              </ul>
            </div>

            <div className="meta-block">
              <div className="meta-heading">
                <span className="meta-num">ii.</span>
                <span className="meta-label">notes</span>
              </div>
              <ol className="feature-list">
                {project.features.map((feature, f) => (
                  <li key={feature} className="feature-item">
                    <span className="feature-num">{pad(f + 1)}</span>
                    <span className="feature-text">{feature}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>

          <footer className="entry-footer">
            {project.liveUrl ? (
              <a
                className="visit-link"
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className="visit-arrow">→</span>
                <span className="visit-text">view it live</span>
                <span className="visit-url">{shortUrl}</span>
              </a>
            ) : (
              <span className="no-link">
                <span className="visit-arrow">◉</span>
                <span>internal · not public</span>
              </span>
            )}

            {project.repoUrl && (
              <a
                className="repo-link"
                href={project.repoUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={'Open source code for ' + project.title + ' on GitHub'}
              >
                <span className="repo-tag">open source</span>
                <span className="repo-sep">·</span>
                <span className="repo-host">{shortRepo}</span>
                <span className="repo-arrow">↗</span>
              </a>
            )}
          </footer>
        </div>
      </article>

      <style jsx>{styles}</style>
    </div>
  );
}
