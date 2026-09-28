import css from 'styled-jsx/css';

export default css`
  .app-lonsdale {
    display: block;
    background: var(--ink);
    color: var(--text);
    min-height: 100vh;
  }
  .case-study { padding-top: 88px; }
  @media (max-width: 768px) {
    .case-study { padding-top: 72px; }
  }

  /* ===== MASTHEAD ===== */
  .masthead { margin-bottom: 4rem; max-width: 820px; }
  .masthead-rule { display: flex; align-items: center; gap: 1rem; margin-bottom: 2rem; }
  .masthead-rule::before { content: ''; flex: 0 0 60px; height: 1px; background: var(--ember); }
  .masthead-rule::after { content: ''; flex: 1; height: 1px; background: var(--rule); }
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
    .stat-strip { grid-template-columns: repeat(2, 1fr); }
    .stat { padding: 0.75rem 1rem; border-right: 1px solid var(--rule); border-bottom: 1px solid var(--rule); }
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
    margin-bottom: 5rem;
    padding-left: 1.5rem;
    border-left: 1px solid var(--rule);
  }
  .lede em { font-style: italic; color: var(--brass); font-weight: 500; }

  /* ===== SECTION HEADS ===== */
  .section-head { max-width: 820px; margin: 0 0 3rem; }
  .section-rule { display: flex; align-items: center; gap: 1rem; margin-bottom: 1.5rem; }
  .section-rule::before { content: ''; flex: 0 0 40px; height: 1px; background: var(--ember); }
  .section-rule::after  { content: ''; flex: 1; height: 1px; background: var(--rule); }
  .section-eyebrow {
    font-family: var(--font-mono);
    font-size: 0.7rem;
    letter-spacing: 0.25em;
    color: var(--brass);
  }
  .section-title {
    font-family: var(--font-display);
    font-variation-settings: 'opsz' 144, 'WONK' 1;
    font-size: clamp(2rem, 5vw, 3.25rem);
    line-height: 1.05;
    font-weight: 400;
    color: var(--paper);
    letter-spacing: -0.03em;
    margin-bottom: 1rem;
  }
  .section-title em {
    font-style: italic; font-weight: 200; color: var(--text-mute);
    font-size: 0.85em; margin-right: 0.2rem;
  }
  .section-lede {
    font-family: var(--font-display);
    font-size: 1rem;
    line-height: 1.65;
    color: var(--text);
    max-width: 680px;
  }
  .section-lede em { color: var(--brass); font-style: italic; }

  .compare-section,
  .surfaces-section,
  .stack-section,
  .ledger-section,
  .grace-section { margin-bottom: 6rem; }

  /* ===== NEW SURFACES ===== */
  .surfaces-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 3rem;
  }
  @media (max-width: 920px) {
    .surfaces-grid { grid-template-columns: 1fr; gap: 4rem; }
  }
  .surface-head { margin-bottom: 1.25rem; }
  .surface-eyebrow {
    font-family: var(--font-mono);
    font-size: 0.65rem;
    letter-spacing: 0.25em;
    color: var(--text-faint);
    display: block;
    margin-bottom: 0.5rem;
  }
  .surface-name {
    font-family: var(--font-display);
    font-variation-settings: 'opsz' 96;
    font-size: 1.5rem;
    line-height: 1.15;
    color: var(--paper);
    letter-spacing: -0.02em;
    margin-bottom: 0.4rem;
  }
  .surface-note {
    font-family: var(--font-display);
    font-style: italic;
    font-size: 0.95rem;
    color: var(--text-mute);
    line-height: 1.55;
  }
  .surface-shot {
    position: relative;
    display: block;
    border: 1px solid var(--rule);
    background: var(--ink-deep);
    overflow: hidden;
    margin-bottom: 1.25rem;
    transition: border-color 0.2s ease;
  }
  .surface-shot:hover { border-color: rgba(255, 107, 53, 0.5); }
  .surface-shot img {
    display: block;
    width: 100%;
    height: auto;
    max-height: 540px;
    object-fit: cover;
    object-position: top center;
  }
  .surface-shot-tag {
    position: absolute;
    top: 0.75rem;
    right: 0.75rem;
    font-family: var(--font-mono);
    font-size: 0.65rem;
    letter-spacing: 0.25em;
    padding: 0.3rem 0.65rem;
    background: rgba(255, 107, 53, 0.12);
    border: 1px solid rgba(255, 107, 53, 0.5);
    color: var(--ember);
    backdrop-filter: blur(4px);
  }
  .surface-bullets {
    list-style: none;
    padding: 0;
    margin: 0 0 1rem;
  }
  .surface-bullets li {
    font-family: var(--font-display);
    font-size: 0.92rem;
    line-height: 1.55;
    color: var(--text);
    padding: 0.45rem 0 0.45rem 1.25rem;
    position: relative;
    border-bottom: 1px dashed var(--rule);
  }
  .surface-bullets li:last-child { border-bottom: none; }
  .surface-bullets li::before {
    content: '›';
    position: absolute;
    left: 0;
    color: var(--brass-mute);
    font-family: var(--font-mono);
  }
  .surface-url {
    display: inline-flex;
    align-items: baseline;
    gap: 0.6rem;
    text-decoration: none;
    color: var(--text-mute);
    font-family: var(--font-mono);
    font-size: 0.78rem;
    padding-top: 0.75rem;
    border-top: 1px solid var(--rule);
    width: 100%;
    transition: color 0.15s ease;
  }
  .surface-url:hover { color: var(--paper); }

  /* ===== COMPARE SLIDER ===== */
  .compare-grid { display: grid; gap: 4rem; }
  .compare-head { margin-bottom: 1.25rem; }
  .compare-eyebrow {
    font-family: var(--font-mono);
    font-size: 0.65rem;
    letter-spacing: 0.25em;
    color: var(--text-faint);
    display: block;
    margin-bottom: 0.5rem;
  }
  .compare-name {
    font-family: var(--font-display);
    font-variation-settings: 'opsz' 96;
    font-size: 1.6rem;
    line-height: 1.1;
    color: var(--paper);
    letter-spacing: -0.02em;
    margin-bottom: 0.4rem;
  }
  .compare-note {
    font-family: var(--font-display);
    font-style: italic;
    font-size: 0.95rem;
    color: var(--text-mute);
    line-height: 1.5;
  }
  .compare-slider {
    position: relative;
    width: 100%;
    aspect-ratio: 1440 / 900;
    overflow: hidden;
    border: 1px solid var(--rule);
    background: var(--ink-deep);
    user-select: none;
    touch-action: none;
    cursor: ew-resize;
  }
  .compare-img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: top center;
    display: block;
  }
  .compare-img--after {
    z-index: 2;
    /* clip-path set inline per-instance from the component */
    transition: clip-path 0.05s linear;
    will-change: clip-path;
  }

  .compare-handle {
    position: absolute;
    top: 0;
    bottom: 0;
    width: 0;
    transform: translateX(-50%);
    pointer-events: none;
    z-index: 4;
  }
  .compare-handle-line {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 2px;
    background: var(--paper);
    box-shadow: 0 0 0 1px rgba(0,0,0,0.4);
  }
  .compare-handle-knob {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: var(--ember);
    color: var(--ink-deep);
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: var(--font-mono);
    font-size: 1.1rem;
    font-weight: 700;
    box-shadow: 0 6px 20px rgba(0,0,0,0.5), 0 0 0 4px rgba(255,107,53,0.15);
    pointer-events: auto;
    cursor: ew-resize;
  }
  .compare-label {
    position: absolute;
    top: 0.75rem;
    font-family: var(--font-mono);
    font-size: 0.7rem;
    letter-spacing: 0.25em;
    padding: 0.35rem 0.75rem;
    background: rgba(10, 9, 7, 0.85);
    backdrop-filter: blur(4px);
    border: 1px solid rgba(244, 236, 216, 0.15);
    color: var(--paper);
    pointer-events: none;
    z-index: 3;
  }
  .compare-label--before {
    left: 0.75rem;
    color: var(--text-mute);
    background: rgba(10, 9, 7, 0.7);
  }
  .compare-label--after  {
    right: 0.75rem;
    color: var(--ember);
    background: rgba(255, 107, 53, 0.12);
    border-color: rgba(255, 107, 53, 0.5);
  }

  .compare-urls {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem 2rem;
    padding-top: 1rem;
    border-top: 1px solid var(--rule);
    margin-top: 1rem;
  }
  .compare-url {
    display: inline-flex;
    align-items: baseline;
    gap: 0.6rem;
    text-decoration: none;
    color: var(--text-mute);
    font-family: var(--font-mono);
    font-size: 0.78rem;
    transition: color 0.15s ease;
  }
  .compare-url:hover { color: var(--paper); }
  .url-tag {
    font-size: 0.6rem;
    letter-spacing: 0.2em;
    padding: 0.15rem 0.5rem;
    border: 1px solid var(--rule-light);
    color: var(--text-faint);
  }
  .url-tag--new { color: var(--ember); border-color: rgba(255, 107, 53, 0.5); }
  .url-arrow { color: var(--brass-mute); }

  /* ===== STACK GRID ===== */
  .stack-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0;
    border: 1px solid var(--rule);
  }
  @media (max-width: 768px) {
    .stack-grid { grid-template-columns: 1fr; }
    .stack-col + .stack-col { border-top: 1px solid var(--rule); }
  }
  .stack-col { padding: 2rem; }
  .stack-col--out { background: rgba(217, 77, 31, 0.04); border-right: 1px solid var(--rule); }
  .stack-col--in  { background: rgba(201, 169, 97, 0.04); }
  @media (max-width: 768px) {
    .stack-col--out { border-right: none; }
  }
  .stack-col-head { margin-bottom: 1.5rem; }
  .stack-col-tag {
    display: inline-block;
    font-family: var(--font-mono);
    font-size: 0.65rem;
    letter-spacing: 0.25em;
    color: var(--ember-deep);
    padding: 0.25rem 0.5rem;
    border: 1px solid var(--ember-deep);
    margin-bottom: 0.75rem;
  }
  .stack-col-tag--in { color: var(--brass); border-color: var(--brass); }
  .stack-col-title {
    font-family: var(--font-display);
    font-size: 1.4rem;
    color: var(--paper);
    font-weight: 400;
    letter-spacing: -0.01em;
  }
  .stack-list { list-style: none; padding: 0; margin: 0; }
  .stack-item {
    display: grid;
    grid-template-columns: 1fr;
    gap: 0.25rem;
    padding: 0.85rem 0;
    border-bottom: 1px dashed var(--rule);
  }
  .stack-item:last-child { border-bottom: none; }
  .stack-item-name {
    font-family: var(--font-mono);
    font-size: 0.85rem;
    color: var(--paper);
    letter-spacing: 0.02em;
  }
  .stack-item-note {
    font-family: var(--font-display);
    font-size: 0.85rem;
    color: var(--text-mute);
    font-style: italic;
    line-height: 1.5;
  }

  /* ===== LEDGER ===== */
  .ledger {
    list-style: none;
    padding: 0;
    margin: 0;
    border-top: 1px solid var(--rule);
  }
  .ledger-row {
    display: grid;
    grid-template-columns: 80px 1fr;
    gap: 1.5rem;
    padding: 1.5rem 0;
    border-bottom: 1px solid var(--rule);
    align-items: start;
  }
  .ledger-num {
    font-family: var(--font-mono);
    font-size: 0.9rem;
    color: var(--brass-mute);
    letter-spacing: 0.1em;
  }
  .ledger-head-row {
    display: flex;
    align-items: baseline;
    gap: 1rem;
    margin-bottom: 0.4rem;
    flex-wrap: wrap;
  }
  .ledger-script {
    font-family: var(--font-mono);
    font-size: 0.95rem;
    color: var(--paper);
  }
  .ledger-tag {
    font-family: var(--font-mono);
    font-size: 0.65rem;
    letter-spacing: 0.2em;
    color: var(--text-faint);
    padding: 0.15rem 0.5rem;
    border: 1px solid var(--rule-light);
  }
  .ledger-blurb {
    font-family: var(--font-display);
    font-size: 0.95rem;
    color: var(--text);
    line-height: 1.6;
    max-width: 720px;
  }

  /* ===== GRACE GRID ===== */
  .grace-grid {
    list-style: none;
    padding: 0;
    margin: 0;
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 0;
    border: 1px solid var(--rule);
  }
  @media (max-width: 768px) {
    .grace-grid { grid-template-columns: 1fr; }
  }
  .grace {
    padding: 1.75rem;
    border-bottom: 1px solid var(--rule);
    border-right: 1px solid var(--rule);
  }
  .grace:nth-child(2n) { border-right: none; }
  @media (max-width: 768px) {
    .grace { border-right: none; }
  }
  .grace-num {
    font-family: var(--font-mono);
    font-size: 0.75rem;
    color: var(--ember);
    letter-spacing: 0.15em;
    display: block;
    margin-bottom: 0.75rem;
  }
  .grace-title {
    font-family: var(--font-display);
    font-size: 1.15rem;
    color: var(--paper);
    font-weight: 400;
    margin-bottom: 0.4rem;
  }
  .grace-blurb {
    font-family: var(--font-display);
    font-size: 0.92rem;
    color: var(--text-mute);
    line-height: 1.6;
  }

  /* ===== CLOSING ===== */
  .closing { margin-top: 5rem; padding-top: 3rem; border-top: 1px solid var(--rule); }
  .closing-rule { display: flex; align-items: center; gap: 1rem; margin-bottom: 1.5rem; }
  .closing-rule::before { content: ''; flex: 0 0 60px; height: 1px; background: var(--ember); }
  .closing-rule::after  { content: ''; flex: 1; height: 1px; background: var(--rule); }
  .closing-tag {
    font-family: var(--font-mono);
    font-size: 0.7rem;
    letter-spacing: 0.25em;
    color: var(--brass);
  }
  .closing-line {
    font-family: var(--font-display);
    font-size: 1rem;
    line-height: 1.7;
    color: var(--text);
    margin-bottom: 0.5rem;
  }
  /* :global(a) so the <a> rendered by next/link (which gets no scope class) is matched too */
  .closing-line :global(a) {
    color: var(--ember);
    text-decoration: none;
    border-bottom: 1px solid rgba(255, 107, 53, 0.35);
  }
  .closing-line :global(a:hover) { color: var(--paper); border-bottom-color: var(--paper); }
  .closing-line :global(.closing-link) em { font-style: italic; color: var(--brass); }
`;
