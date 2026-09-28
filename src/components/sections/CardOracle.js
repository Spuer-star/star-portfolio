'use client';

import { useEffect, useRef, useState } from 'react';
import { PROJECTS as ALL_PROJECTS } from '@/lib/projects';
import { summonTeleport } from '@/lib/teleport';

/** Filled (rather than stroked) heart-and-crown for Mooncake's card. */
const QUEEN_OF_HEARTS_SVG = `
<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <path d="M 30 30 L 36 14 L 42 27 L 50 8 L 58 27 L 64 14 L 70 30 L 70 34 L 30 34 Z"/>
  <circle cx="38" cy="22" r="1.5" style="fill: rgba(255, 220, 220, 0.65); stroke: none;"/>
  <circle cx="50" cy="16" r="2"   style="fill: rgba(255, 230, 230, 0.8);  stroke: none;"/>
  <circle cx="62" cy="22" r="1.5" style="fill: rgba(255, 220, 220, 0.65); stroke: none;"/>
  <path d="M 50 92 C 30 80 14 62 14 47 C 14 37 22 30 30 30 C 38 30 45 35 50 42 C 55 35 62 30 70 30 C 78 30 86 37 86 47 C 86 62 70 80 50 92 Z"/>
</svg>`;

const ROMANS = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'];
/** The deck holds eight arcana, one per roman numeral. */
const PROJECTS = ALL_PROJECTS.slice(0, ROMANS.length);

/** SVG markup per project — computed once. */
const ICON_SVGS = PROJECTS.map((p) => ({
  __html:
    p.id === 'mooncake'
      ? QUEEN_OF_HEARTS_SVG
      : `<svg viewBox="0 0 24 24">${p.icon}</svg>`,
}));

/** Corner labels: roman numeral by default; Q♥ for Mooncake. */
const CORNER_LABELS = PROJECTS.map((p, i) =>
  p.id === 'mooncake'
    ? { label: 'Q', suit: '♥' }
    : { label: ROMANS[i], suit: null },
);

function prefersReducedMotion() {
  return typeof window !== 'undefined'
    && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true;
}

function computeFanTransforms(n) {
  // Scale the fan to the viewport so it doesn't clip on phones / tablets.
  const w = typeof window !== 'undefined' ? window.innerWidth : 1280;
  const isMobile = w < 640;
  // On mobile, scale the radius to use as much of the available width
  // as we can — the fan was reading as a tight bundle before.
  const mobileRadius = Math.max(95, Math.min(135, (w - 200) / 2));
  const radius = isMobile ? mobileRadius : w < 1024 ? 180 : 240;
  const arcDeg = isMobile ? 92 : w < 1024 ? 80 : 90;
  const dyFactor = radius * 0.29; // keeps the curve's steepness consistent

  // Transform per slot in fan order — slot 0 leftmost, slot n−1 rightmost.
  const slotTransforms = Array.from({ length: n }, (_, slot) => {
    const t = (slot / (n - 1)) - 0.5;
    const angle = t * arcDeg;
    const dx = Math.sin((angle * Math.PI) / 180) * radius;
    let dy = -Math.cos((angle * Math.PI) / 180) * dyFactor + dyFactor;
    let extraRot = 0;
    let dxOffset = 0;

    // On mobile the horizontal arc alone is too cramped, so add per-slot
    // pseudo-random jitter — Y, rotation, and a touch of X — so the
    // fan reads as a "tossed across the table" spread (matching desktop's
    // tightly-packed mixing) rather than a contained bundle.
    if (isMobile) {
      dy += (Math.random() - 0.5) * 110;       // ±55
      extraRot = (Math.random() - 0.5) * 22;   // ±11°
      dxOffset = (Math.random() - 0.5) * 38;   // ±19
    }

    const z = 30 + slot * 2;
    return `translate3d(${dx + dxOffset}px, ${dy}px, ${z}px) rotate(${angle + extraRot}deg)`;
  });

  // Fisher–Yates: each card gets assigned to a random fan slot, so
  // every shuffle produces a genuinely different visible order.
  const assignment = Array.from({ length: n }, (_, i) => i);
  for (let i = assignment.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [assignment[i], assignment[j]] = [assignment[j], assignment[i]];
  }

  // fanTransforms[cardIdx] = the slot transform that this card landed on.
  return assignment.map((slot) => slotTransforms[slot]);
}

function deckPose(i) {
  return {
    transform: `translate3d(${i * 1.5}px, ${i * -1.5}px, ${i * 1}px) rotate(${i * 0.4}deg)`,
    offset: 0,
  };
}

/**
 * Second oracle (parallel to the d8 dice). Lives in the hero sidebar as a
 * small stacked-deck button. Clicking opens a fullscreen overlay where the
 * deck shuffles, fans out, and the user **drags one card out** of the fan.
 *
 *   1. compact: stack of mini cards visible under the dice.
 *   2. expanded: fullscreen overlay opens.
 *   3. shuffling: cards fan + two riffle passes, end in the fanned hand.
 *   4. selecting: every card is draggable. Drag one out past 80 px.
 *   5. drawing: the dragged card flies to centre, scales up, flips face-up.
 *   6. revealed: held briefly so the user reads the entry.
 *   7. dispatched: hands off to summonTeleport with ghostKind: 'card'.
 */
export default function CardOracle() {
  // State that async flows read is mirrored in refs so they never see a
  // stale value (the Angular version read signals directly).
  const [expanded, setExpandedState] = useState(false);
  const expandedRef = useRef(false);
  const [expandedVisible, setExpandedVisible] = useState(false);

  /** 'idle' | 'shuffling' | 'selecting' | 'drawing' | 'revealed' */
  const [phase, setPhaseState] = useState('idle');
  const phaseRef = useRef('idle');
  const [drawnIndex, setDrawnIndex] = useState(-1);
  const [draggingIdx, setDraggingIdx] = useState(-1);
  const [dispatched, setDispatchedState] = useState(false);
  const dispatchedRef = useRef(false);

  const setExpanded = (v) => { expandedRef.current = v; setExpandedState(v); };
  const setPhase = (v) => { phaseRef.current = v; setPhaseState(v); };
  const setDispatched = (v) => { dispatchedRef.current = v; setDispatchedState(v); };

  const cardEls = useRef([]);

  /** Final fan transforms per card — used to anchor the drag delta. */
  const fanTransformsRef = useRef([]);

  /** Active drag state { cardIdx, startX, startY, pointerId }, or null when nothing is being dragged. */
  const dragStateRef = useRef(null);

  const mountedRef = useRef(false);
  const timersRef = useRef(new Set());
  const rafRef = useRef(null);

  useEffect(() => {
    mountedRef.current = true;
    const timers = timersRef.current;
    return () => {
      mountedRef.current = false;
      timers.forEach((t) => window.clearTimeout(t));
      timers.clear();
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, []);

  const later = (fn, ms) => {
    const t = window.setTimeout(() => {
      timersRef.current.delete(t);
      fn();
    }, ms);
    timersRef.current.add(t);
  };

  const sleep = (ms) => new Promise((resolve) => later(resolve, ms));

  const getCards = () =>
    PROJECTS.map((_, i) => cardEls.current[i]).filter(Boolean);

  const isDrawingOrRevealed = phase === 'drawing' || phase === 'revealed';

  const ctaLabel = (() => {
    if (dispatched) return 'summoning';
    switch (phase) {
      case 'idle':       return 'cut the deck';
      case 'shuffling':  return 'shuffling';
      case 'selecting':  return 'click or drag a card';
      case 'drawing':    return 'drawing';
      case 'revealed':   return 'arcanum drawn';
    }
  })();

  const stateLabel = (() => {
    if (dispatched) return 'fate dispatched';
    const idx = drawnIndex;
    switch (phase) {
      case 'idle':      return 'awaiting cut';
      case 'shuffling': return 'shuffling';
      case 'selecting': return 'pick one · click or drag';
      case 'drawing':   return 'drawing';
      case 'revealed':
        return idx >= 0 ? `arcanum ${ROMANS[idx]} drawn` : 'drawn';
    }
  })();

  // ============== helpers ==============

  const resetCards = () => {
    getCards().forEach((c) => {
      c.getAnimations().forEach((a) => a.cancel());
      c.style.transform = '';
    });
    fanTransformsRef.current = [];
  };

  // ============== expand / collapse ==============

  const expand = () => {
    if (expandedRef.current || dispatchedRef.current) return;
    setExpanded(true);
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      setExpandedVisible(true);
    });
  };

  const collapse = () => {
    if (dispatchedRef.current) return;
    setExpandedVisible(false);
    later(() => {
      resetCards();
      setExpanded(false);
      setPhase('idle');
      setDrawnIndex(-1);
      setDraggingIdx(-1);
    }, 500);
  };

  // ============== animation phases ==============

  const fanOut = async (cards) => {
    fanTransformsRef.current = computeFanTransforms(cards.length);
    const fan = fanTransformsRef.current;
    const tasks = cards.map((card, i) =>
      card.animate(
        [
          deckPose(i),
          { transform: fan[i], offset: 1 },
        ],
        {
          duration: 700 + i * 30,
          delay: i * 20,
          easing: 'cubic-bezier(0.2, 0.8, 0.3, 1.05)',
          fill: 'forwards',
        },
      ).finished,
    );
    await Promise.all(tasks);
  };

  const riffle = async (cards) => {
    const N = cards.length;
    const positionAt = (i) => fanTransformsRef.current[i];

    for (let pass = 0; pass < 2; pass++) {
      const swapTasks = cards.map((card, i) => {
        const partnerOffset = pass % 2 === 0
          ? (i % 2 === 0 ? 1 : -1)
          : (i % 2 === 0 ? -1 : 1);
        const partner = i + partnerOffset;
        if (partner < 0 || partner >= N) return Promise.resolve();
        const here = positionAt(i);
        const there = positionAt(partner);

        return card.animate(
          [
            { transform: here },
            { transform: `translate3d(0, -40px, 60px) ${there}`, offset: 0.5 },
            { transform: there, offset: 1 },
          ],
          { duration: 500, easing: 'ease-in-out', fill: 'forwards' },
        ).finished;
      });
      await Promise.all(swapTasks);
      if (!mountedRef.current) return;

      // After the riffle, snap each card back to its OWN fan position so
      // identity matches index again (riffle was visual misdirection).
      const snapTasks = cards.map((card, i) =>
        card.animate(
          [{}, { transform: fanTransformsRef.current[i], offset: 1 }],
          { duration: 220, easing: 'ease-out', fill: 'forwards' },
        ).finished,
      );
      await Promise.all(snapTasks);
      if (!mountedRef.current) return;
    }
  };

  /** Defensive — make sure every card is exactly at its fan transform. */
  const settleToFan = async (cards) => {
    const tasks = cards.map((card, i) =>
      card.animate(
        [{}, { transform: fanTransformsRef.current[i], offset: 1 }],
        { duration: 200, easing: 'ease-out', fill: 'forwards' },
      ).finished,
    );
    await Promise.all(tasks);
  };

  // ============== shuffle (fan + riffle, ends in 'selecting') ==============

  const shuffle = async () => {
    if (phaseRef.current !== 'idle') return;

    const cards = getCards();
    if (cards.length !== PROJECTS.length) return;

    if (prefersReducedMotion()) {
      fanTransformsRef.current = computeFanTransforms(cards.length);
      cards.forEach((c, i) => (c.style.transform = fanTransformsRef.current[i]));
      setPhase('selecting');
      return;
    }

    setPhase('shuffling');
    await fanOut(cards);
    if (!mountedRef.current) return;
    await riffle(cards);
    if (!mountedRef.current) return;
    // Ensure cards are at clean fan positions for clean drag math.
    await settleToFan(cards);
    if (!mountedRef.current) return;
    setPhase('selecting');
  };

  const reshuffle = async () => {
    if (phaseRef.current !== 'selecting') return;
    const cards = getCards();
    setPhase('shuffling');

    // Visual riffle on the CURRENT slot assignment.
    await riffle(cards);
    if (!mountedRef.current) return;

    // Re-randomize: every card gets a new slot, then slide to it.
    fanTransformsRef.current = computeFanTransforms(cards.length);
    const fan = fanTransformsRef.current;
    const tasks = cards.map((card, i) =>
      card.animate(
        [{}, { transform: fan[i], offset: 1 }],
        {
          duration: 500,
          delay: i * 35,
          easing: 'cubic-bezier(0.4, 0.2, 0.4, 1)',
          fill: 'forwards',
        },
      ).finished,
    );
    await Promise.all(tasks);
    if (!mountedRef.current) return;

    setPhase('selecting');
  };

  /** Tap on the deck (idle phase) — equivalent to clicking "cut the deck". */
  const onDeckClick = () => {
    if (phaseRef.current === 'idle' && !dispatchedRef.current) {
      void shuffle();
    }
  };

  const onDeckKeyDown = (e) => {
    if (e.shiftKey || e.ctrlKey || e.altKey || e.metaKey) return;
    if (e.key === 'Enter') {
      onDeckClick();
    } else if (e.key === ' ' || e.key === 'Spacebar') {
      onDeckClick();
      e.preventDefault();
    }
  };

  const onBackdropClick = () => {
    // Only allow backdrop dismiss when the user hasn't started anything yet.
    if (phaseRef.current === 'idle' && !dispatchedRef.current) collapse();
  };

  // ============== handoff ==============

  const dispatchTeleport = (pickIdx, card) => {
    const project = PROJECTS[pickIdx];
    setDispatched(true);

    // pickIdx is the index in the local (filtered) deck. The teleport
    // overlay's scroll target is the project's position in the rendered
    // PROJECTS list — resolve via id so reordering doesn't mis-align.
    const archiveIndex = ALL_PROJECTS.findIndex((p) => p.id === project.id);

    summonTeleport({
      project,
      projectIndex: archiveIndex >= 0 ? archiveIndex : pickIdx,
      faceNumeral: ROMANS[pickIdx],
      sourceRect: card.getBoundingClientRect(),
      accent: project.accent,
      ghostKind: 'card',
    });

    later(() => {
      setExpandedVisible(false);
      later(() => {
        resetCards();
        setExpanded(false);
        setDispatched(false);
        setDrawnIndex(-1);
        setDraggingIdx(-1);
        setPhase('idle');
      }, 500);
    }, 5000);
  };

  const commitDraw = async (i, card) => {
    setDrawnIndex(i);
    setPhase('drawing');

    // Hold a beat on the picked card before the lift animation starts.
    // .draw-active fades the other cards (0.5s); .is-drawn glows ember on
    // the picked one. Without this pause a tap commit is too quick to read
    // as "you picked THIS card" before it's already flying to centre.
    await sleep(320);
    setDraggingIdx(-1);

    // Animate card to centre, scale up, flip face-up. Starts from current
    // (dragged) inline transform — the {} keyframe captures it.
    await card.animate(
      [
        {},
        {
          transform: 'translate3d(0, -40px, 200px) rotateY(180deg) scale(1.18)',
        },
      ],
      { duration: 800, easing: 'cubic-bezier(0.2, 0.8, 0.3, 1.05)', fill: 'forwards' },
    ).finished;
    if (!mountedRef.current) return;

    setPhase('revealed');

    await sleep(1500);

    dispatchTeleport(i, card);
  };

  // ============== drag interaction ==============

  const onCardPointerDown = (e, i) => {
    if (phaseRef.current !== 'selecting' || dragStateRef.current) return;
    e.preventDefault();
    const card = e.currentTarget;
    card.setPointerCapture(e.pointerId);

    // Cancel any in-flight WAA so style.transform takes effect.
    card.getAnimations().forEach((a) => a.cancel());
    card.style.transform = fanTransformsRef.current[i];

    dragStateRef.current = {
      cardIdx: i,
      startX: e.clientX,
      startY: e.clientY,
      pointerId: e.pointerId,
    };
    setDraggingIdx(i);
  };

  const onCardPointerMove = (e, i) => {
    const drag = dragStateRef.current;
    if (!drag || drag.cardIdx !== i) return;
    const card = e.currentTarget;
    const dx = e.clientX - drag.startX;
    const dy = e.clientY - drag.startY;
    // Drag translate is the OUTERMOST transform (leftmost in the list)
    // so it translates in screen space, on top of the fan rotation.
    const lift = Math.min(60, Math.hypot(dx, dy) * 0.4);
    card.style.transform =
      `translate3d(${dx}px, ${dy}px, ${80 + lift}px) ${fanTransformsRef.current[i]}`;
  };

  const onCardPointerUp = (e, i) => {
    const drag = dragStateRef.current;
    if (!drag || drag.cardIdx !== i) return;
    const card = e.currentTarget;

    if (card.hasPointerCapture(e.pointerId)) {
      card.releasePointerCapture(e.pointerId);
    }

    dragStateRef.current = null;
    // Leave draggingIdx set for the moment — commitDraw clears it once
    // the held-highlight beat is over, so the glow is continuous.

    // Click or drag — either way, this is the chosen card. The commit
    // animation starts from the card's current inline transform (which is
    // either the fan position for a click, or the dragged position for a
    // drag), so it lifts off cleanly from wherever it is.
    void commitDraw(i, card);
  };

  const deckClassName = [
    'deck',
    phase === 'idle' ? 'idle' : '',
    isDrawingOrRevealed ? 'draw-active' : '',
    phase === 'selecting' ? 'selecting' : '',
  ].filter(Boolean).join(' ');

  return (
    <div className="app-card-oracle">
      {/* ============== COMPACT (in hero sidebar) ============== */}
      <div className={`compact-stage${expanded || dispatched ? ' dimmed' : ''}`}>
        <p className="oracle-prompt">
          <span className="oracle-label">ORACLE</span>
          <span className="oracle-sub">draw a card · 8 arcana</span>
        </p>

        <button
          className="deck-trigger"
          onClick={expand}
          disabled={expanded || dispatched}
          aria-label="Open the deck oracle to draw an arcanum"
        >
          <span className="mini-stack">
            <span className="mini-card" style={{ '--i': 0 }}></span>
            <span className="mini-card" style={{ '--i': 1 }}></span>
            <span className="mini-card" style={{ '--i': 2 }}></span>
            <span className="mini-card" style={{ '--i': 3 }}></span>
          </span>
        </button>

        <div className="compact-status">
          <span className="compact-status-text">cut the deck · 8 arcana</span>
        </div>
      </div>

      {/* ============== EXPANDED (full-screen) ============== */}
      {expanded && (
        <div className={`expanded-overlay${expandedVisible ? ' visible' : ''}`}>
          <div className="exp-backdrop" onClick={onBackdropClick}></div>

          <div className="exp-stage">
            <header className="exp-masthead">
              <div className="exp-rule">
                <span className="exp-rule-tag">INTERLUDE — A SECOND ORACLE</span>
              </div>
              <h2 className="exp-title"><em>Cut</em> the Deck</h2>
              <p className="exp-sub">
                Eight arcana, shuffled. Drag a card from the fan.
                {' '}<span className="mono">[ {stateLabel} ]</span>
              </p>
            </header>

            <div className="deck-wrap">
              <div
                className={deckClassName}
                role={phase === 'idle' ? 'button' : undefined}
                tabIndex={phase === 'idle' ? 0 : undefined}
                onClick={onDeckClick}
                onKeyDown={onDeckKeyDown}
              >
                {PROJECTS.map((project, i) => (
                  <div
                    key={project.id}
                    ref={(el) => {
                      cardEls.current[i] = el;
                    }}
                    className={`card${drawnIndex === i ? ' is-drawn' : ''}${draggingIdx === i ? ' is-dragging' : ''}`}
                    data-idx={i}
                    style={{ '--accent': project.accent, '--depth': i }}
                    onPointerDown={(e) => onCardPointerDown(e, i)}
                    onPointerMove={(e) => onCardPointerMove(e, i)}
                    onPointerUp={(e) => onCardPointerUp(e, i)}
                    onPointerCancel={(e) => onCardPointerUp(e, i)}
                  >
                    <div className="card-face card-back">
                      <div className="back-frame">
                        <div className="back-mark">CC</div>
                        <div className="back-corners">
                          <span></span><span></span><span></span><span></span>
                        </div>
                      </div>
                    </div>
                    <div className="card-face card-front">
                      <div className="front-frame">
                        <span className="card-numeral nw">
                          <span className="numeral-letter">{CORNER_LABELS[i].label}</span>
                          {CORNER_LABELS[i].suit && (
                            <span className="numeral-suit">{CORNER_LABELS[i].suit}</span>
                          )}
                        </span>
                        <div
                          className={`card-icon${project.id === 'mooncake' ? ' is-queen' : ''}`}
                          dangerouslySetInnerHTML={ICON_SVGS[i]}
                        ></div>
                        <span className="card-title">{project.title}</span>
                        <span className="card-numeral se">
                          <span className="numeral-letter">{CORNER_LABELS[i].label}</span>
                          {CORNER_LABELS[i].suit && (
                            <span className="numeral-suit">{CORNER_LABELS[i].suit}</span>
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="exp-controls">
              {phase === 'idle' ? (
                <>
                  <button className="cta cta-primary" onClick={shuffle}>
                    <span className="cta-arrow">›</span>
                    <span className="cta-text">cut the deck</span>
                  </button>
                  <button className="cta cta-ghost" onClick={collapse}>
                    <span>cancel</span>
                  </button>
                </>
              ) : phase === 'selecting' ? (
                <>
                  <span className="hint">
                    <span className="hint-dot"></span>
                    click or drag a card to draw it
                  </span>
                  <button className="cta cta-ghost" onClick={reshuffle}>
                    <span>reshuffle</span>
                  </button>
                </>
              ) : (
                <span className="hint hint-quiet">{ctaLabel}</span>
              )}
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .app-card-oracle { display: block; }

        /* ================ COMPACT ================ */
        .compact-stage {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
          padding-top: 1.5rem;
          margin-top: 1rem;
          border-top: 1px solid var(--rule);
          transition: opacity 0.4s ease;
        }
        .compact-stage.dimmed { opacity: 0.25; pointer-events: none; }

        .oracle-prompt {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.15rem;
          width: 100%;
        }
        .oracle-label {
          font-family: var(--font-mono);
          font-size: 0.65rem;
          letter-spacing: 0.25em;
          color: var(--brass);
        }
        .oracle-sub {
          font-family: var(--font-display);
          font-style: italic;
          font-size: 0.85rem;
          color: var(--text-mute);
        }

        .deck-trigger {
          position: relative;
          width: 130px;
          height: 130px;
          background: transparent;
          border: none;
          cursor: pointer;
          padding: 0;
          perspective: 700px;
          perspective-origin: center 35%;
          transition: transform 0.3s;
          touch-action: manipulation;
          -webkit-tap-highlight-color: transparent;
        }
        .deck-trigger:hover:not(:disabled) .mini-card {
          animation: deck-hover 1.6s ease-in-out infinite;
        }
        .deck-trigger:disabled { cursor: progress; opacity: 0.5; }
        .deck-trigger:focus-visible { outline: none; }
        .deck-trigger:focus-visible .mini-card {
          filter: drop-shadow(0 0 6px var(--brass));
        }

        .mini-stack {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 0;
          height: 0;
          transform-style: preserve-3d;
          transform: rotateX(-12deg) rotateY(8deg);
        }

        .mini-card {
          position: absolute;
          width: 76px;
          height: 106px;
          top: -53px;
          left: -38px;
          border-radius: 4px;

          background:
            repeating-linear-gradient(
              45deg,
              rgba(201, 169, 97, 0.05) 0,
              rgba(201, 169, 97, 0.05) 2px,
              transparent 2px,
              transparent 6px),
            radial-gradient(ellipse at center,
              var(--ink-warm) 0%,
              var(--ink-deep) 80%);
          border: 1px solid var(--brass-mute);
          box-shadow:
            inset 0 0 0 2px var(--ink-deep),
            inset 0 0 0 3px var(--brass-mute),
            0 4px 8px rgba(0, 0, 0, 0.5);

          transform: translate3d(
                       calc(var(--i) * 2px),
                       calc(var(--i) * -2px),
                       calc(var(--i) * 1px))
                     rotate(calc(var(--i) * 1.2deg - 1.8deg));
        }

        .mini-card::after {
          content: '';
          position: absolute;
          inset: 6px;
          border: 1px solid rgba(201, 169, 97, 0.25);
          border-radius: 2px;
        }

        @keyframes deck-hover {
          0%, 100% { transform: translate3d(calc(var(--i) * 2px), calc(var(--i) * -2px), calc(var(--i) * 1px)) rotate(calc(var(--i) * 1.2deg - 1.8deg)); }
          50%      { transform: translate3d(calc(var(--i) * 2.5px), calc(var(--i) * -3px), calc(var(--i) * 2px)) rotate(calc(var(--i) * 1.5deg - 1.5deg)); }
        }

        .compact-status {
          min-height: 24px;
          width: 100%;
          text-align: center;
        }
        .compact-status-text {
          font-family: var(--font-mono);
          font-size: 0.7rem;
          color: var(--text-faint);
          letter-spacing: 0.15em;
          text-transform: uppercase;
        }

        /* ================ EXPANDED OVERLAY ================ */
        .expanded-overlay {
          position: fixed;
          inset: 0;
          z-index: 8500;
          pointer-events: auto;
          opacity: 0;
          transition: opacity 0.5s ease;
        }
        .expanded-overlay.visible { opacity: 1; }

        .exp-backdrop {
          position: absolute;
          inset: 0;
          background:
            radial-gradient(ellipse at center,
              rgba(15, 14, 12, 0.85) 0%,
              rgba(5, 4, 3, 0.97) 80%);
          backdrop-filter: blur(4px);
          -webkit-backdrop-filter: blur(4px);
        }

        .exp-stage {
          position: relative;
          height: 100%;
          width: 100%;
          max-width: 1080px;
          margin: 0 auto;
          padding: 4rem 2rem 3rem;
          box-sizing: border-box;
          display: grid;
          grid-template-rows: auto 1fr auto;
          gap: 1rem;
          align-items: center;
          justify-items: center;
        }

        .exp-masthead {
          max-width: 720px;
          width: 100%;
          text-align: center;
          animation: exp-fade-in 0.6s ease 0.1s both;
        }

        .exp-rule {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1.25rem;
          justify-content: center;
        }
        .exp-rule::before, .exp-rule::after {
          content: '';
          height: 1px;
          background: var(--rule);
        }
        .exp-rule::before { flex: 0 0 60px; background: var(--brass); }
        .exp-rule::after { flex: 1; }

        .exp-rule-tag {
          font-family: var(--font-mono);
          font-size: 0.7rem;
          letter-spacing: 0.25em;
          color: var(--brass);
        }

        .exp-title {
          font-family: var(--font-display);
          font-variation-settings: 'opsz' 144, 'WONK' 1;
          font-size: clamp(2.5rem, 7vw, 4.5rem);
          line-height: 0.95;
          font-weight: 400;
          color: var(--paper);
          letter-spacing: -0.04em;
          margin-bottom: 0.6rem;
        }
        .exp-title em {
          font-style: italic;
          font-weight: 200;
          color: var(--text-mute);
          font-size: 0.7em;
          margin-right: 0.25rem;
        }
        .exp-sub {
          font-family: var(--font-display);
          font-style: italic;
          font-size: 1rem;
          color: var(--text);
          line-height: 1.6;
        }
        .exp-sub .mono {
          font-family: var(--font-mono);
          font-style: normal;
          font-size: 0.7rem;
          color: var(--brass-mute);
          margin-left: 0.5rem;
          letter-spacing: 0.1em;
        }

        /* ================ DECK STAGE ================ */
        .deck-wrap {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          perspective: 1400px;
          perspective-origin: center 40%;
        }
        .deck {
          position: relative;
          width: 200px;
          height: 280px;
          transform-style: preserve-3d;
          animation: exp-fade-in 0.6s ease 0.25s both;
        }

        /* ---- Cards ---- */
        .card {
          --card-w: 200px;
          --card-h: 280px;
          --depth: 0;
          --accent: var(--ember);

          position: absolute;
          top: 0;
          left: 0;
          width: var(--card-w);
          height: var(--card-h);
          transform-style: preserve-3d;
          will-change: transform;
          touch-action: none; /* let pointermove fire on touch */
          user-select: none;

          transform:
            translate3d(
              calc(var(--depth) * 1.5px),
              calc(var(--depth) * -1.5px),
              calc(var(--depth) * 1px))
            rotate(calc(var(--depth) * 0.4deg));
        }

        /* During selecting phase, cards invite interaction */
        .deck.selecting .card { cursor: grab; }
        .deck.selecting .card.is-dragging { cursor: grabbing; }

        .deck.selecting .card:not(.is-dragging):hover {
          filter:
            drop-shadow(0 0 12px rgba(201, 169, 97, 0.55))
            drop-shadow(0 0 24px rgba(255, 107, 53, 0.3));
        }

        .card.is-dragging {
          filter:
            drop-shadow(0 0 18px rgba(255, 107, 53, 0.55))
            drop-shadow(0 0 36px rgba(255, 107, 53, 0.3));
        }

        /* Held highlight on the picked card while other cards fade away,
           so a tap reads as "you picked THIS one" before the lift animation. */
        .card.is-drawn {
          filter:
            drop-shadow(0 0 22px rgba(255, 107, 53, 0.7))
            drop-shadow(0 0 44px rgba(255, 107, 53, 0.4));
        }

        .card-face {
          position: absolute;
          inset: 0;
          backface-visibility: hidden;
          box-sizing: border-box;
          border-radius: 4px;
        }

        .card-back {
          background:
            repeating-linear-gradient(
              45deg,
              rgba(201, 169, 97, 0.04) 0,
              rgba(201, 169, 97, 0.04) 2px,
              transparent 2px,
              transparent 7px),
            radial-gradient(ellipse at center,
              var(--ink-warm) 0%,
              var(--ink-deep) 80%);
          border: 1px solid var(--brass-mute);
          box-shadow:
            inset 0 0 0 4px var(--ink-deep),
            inset 0 0 0 5px var(--brass-mute),
            0 12px 24px rgba(0, 0, 0, 0.6),
            0 4px 8px rgba(0, 0, 0, 0.4);
        }
        .back-frame {
          position: absolute;
          inset: 12px;
          border: 1px solid rgba(201, 169, 97, 0.25);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .back-mark {
          font-family: var(--font-display);
          font-variation-settings: 'opsz' 144, 'WONK' 1;
          font-style: italic;
          font-weight: 300;
          font-size: 2.6rem;
          color: var(--brass);
          letter-spacing: -0.08em;
          text-shadow: 0 0 14px rgba(201, 169, 97, 0.4);
          opacity: 0.85;
        }
        .back-corners span {
          position: absolute;
          width: 18px;
          height: 18px;
          border: 1px solid var(--brass-mute);
        }
        .back-corners span:nth-child(1) { top: -1px; left: -1px; border-right: 0; border-bottom: 0; }
        .back-corners span:nth-child(2) { top: -1px; right: -1px; border-left: 0; border-bottom: 0; }
        .back-corners span:nth-child(3) { bottom: -1px; left: -1px; border-right: 0; border-top: 0; }
        .back-corners span:nth-child(4) { bottom: -1px; right: -1px; border-left: 0; border-top: 0; }

        .card-front {
          background: linear-gradient(165deg, var(--paper) 0%, var(--paper-mute) 100%);
          border: 1px solid var(--accent);
          box-shadow:
            inset 0 0 0 4px var(--paper),
            inset 0 0 0 5px var(--accent),
            0 12px 24px rgba(0, 0, 0, 0.55);
          transform: rotateY(180deg);
          color: var(--ink);
        }
        .front-frame {
          position: absolute;
          inset: 12px;
          border: 1px solid rgba(0, 0, 0, 0.2);
          padding: 0.75rem 1rem;
          display: grid;
          grid-template-rows: auto 1fr auto;
          align-items: center;
          justify-items: center;
          gap: 0.5rem;
          box-sizing: border-box;
        }
        .card-numeral {
          position: absolute;
          display: flex;
          flex-direction: column;
          align-items: center;
          line-height: 1;
          color: var(--accent);
          font-family: var(--font-display);
        }
        .card-numeral.nw { top: 8px; left: 12px; }
        .card-numeral.se { bottom: 8px; right: 12px; transform: rotate(180deg); }
        .numeral-letter {
          font-variation-settings: 'opsz' 144, 'WONK' 1;
          font-style: italic;
          font-weight: 400;
          font-size: 1.4rem;
          letter-spacing: -0.03em;
        }
        .numeral-suit {
          font-size: 0.95rem;
          font-style: normal;
          margin-top: -1px;
        }
        .card-icon {
          grid-row: 2 / 3;
          align-self: center;
          width: 88px;
          height: 88px;
          color: var(--accent);
          filter: drop-shadow(0 0 4px rgba(255, 107, 53, 0.25));
        }
        .card-icon :global(svg) {
          width: 100%;
          height: 100%;
          stroke: currentColor;
          fill: none;
          stroke-width: 1.3;
          stroke-linecap: round;
          stroke-linejoin: round;
        }
        /* Mooncake's Queen of Hearts is filled, not stroked. */
        .card-icon.is-queen :global(svg) {
          stroke: none;
          fill: currentColor;
        }
        .card-title {
          grid-row: 3 / 4;
          font-family: var(--font-display);
          font-style: italic;
          font-size: 0.78rem;
          color: var(--ink);
          text-align: center;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          line-height: 1.2;
          max-width: 90%;
          margin-bottom: 0.5rem;
        }

        /* While the chosen card is being drawn / revealed, every other card
           fades out so it can't sit visually in front of the rising card. */
        .deck.draw-active .card:not(.is-drawn) {
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.5s ease;
        }

        /* In idle phase the deck itself is the tap target — easier on mobile
           where the controls below may be off-screen. The cards inside ignore
           pointer events so the tap bubbles to .deck. */
        .deck.idle {
          cursor: pointer;
          touch-action: manipulation;
        }
        .deck.idle .card { pointer-events: none; }

        @media (hover: hover) {
          .deck.idle:hover .card-back {
            box-shadow:
              inset 0 0 0 4px var(--ink-deep),
              inset 0 0 0 5px var(--brass),
              0 14px 28px rgba(0, 0, 0, 0.65),
              0 0 24px rgba(201, 169, 97, 0.3);
            transition: box-shadow 0.3s ease;
          }
        }

        .deck.idle::after {
          content: 'tap to cut';
          position: absolute;
          left: 50%;
          bottom: -2.5rem;
          transform: translateX(-50%);
          font-family: var(--font-mono);
          font-size: 0.65rem;
          letter-spacing: 0.25em;
          text-transform: uppercase;
          color: var(--brass);
          opacity: 0.85;
          pointer-events: none;
          animation: deck-tap-pulse 2.4s ease-in-out infinite;
          white-space: nowrap;
        }
        @keyframes deck-tap-pulse {
          0%, 100% { opacity: 0.55; }
          50%      { opacity: 1; }
        }

        /* ================ EXP CONTROLS ================ */
        .exp-controls {
          display: flex;
          align-items: center;
          gap: 1rem;
          animation: exp-fade-in 0.6s ease 0.4s both;
        }
        .cta {
          display: inline-flex;
          align-items: center;
          gap: 0.85rem;
          padding: 0.75rem 1.5rem;
          background: transparent;
          font-family: var(--font-mono);
          font-size: 0.78rem;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          cursor: pointer;
          transition: background 0.3s, color 0.3s, border-color 0.3s;
        }
        .cta-primary {
          color: var(--paper);
          border: 1px solid var(--brass);
        }
        .cta-primary:hover:not(:disabled) {
          background: var(--brass);
          color: var(--ink);
        }
        .cta-primary:disabled { cursor: progress; opacity: 0.55; }
        .cta-arrow { color: var(--ember); font-size: 1.05rem; line-height: 1; }
        .cta-primary:hover:not(:disabled) .cta-arrow { color: var(--ink); }

        .cta-ghost {
          color: var(--text-faint);
          border: 1px solid var(--rule-light);
        }
        .cta-ghost:hover { color: var(--text); border-color: var(--rule); }

        .hint {
          display: inline-flex;
          align-items: center;
          gap: 0.65rem;
          font-family: var(--font-mono);
          font-size: 0.72rem;
          color: var(--brass);
          letter-spacing: 0.22em;
          text-transform: uppercase;
        }
        .hint-quiet { color: var(--text-faint); }
        .hint-dot {
          display: inline-block;
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: var(--ember);
          box-shadow: 0 0 10px var(--ember);
          animation: hint-pulse 1.6s ease-in-out infinite;
        }
        @keyframes hint-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%      { opacity: 0.45; transform: scale(0.7); }
        }

        @keyframes exp-fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        @media (prefers-reduced-motion: reduce) {
          .deck-trigger:hover .mini-card { animation: none !important; }
          .expanded-overlay { transition: none !important; }
          .exp-masthead, .deck, .exp-controls { animation: none !important; }
          .hint-dot { animation: none !important; }
        }

        @media (max-width: 1024px) and (min-width: 641px) {
          .compact-stage { flex-direction: row; flex-wrap: wrap; gap: 1.5rem; padding-top: 1rem; margin-top: 0; border-top: none; }
          .oracle-prompt { flex-direction: row; gap: 0.5rem; width: auto; }
          .deck-trigger { width: 110px; height: 110px; }
          .mini-card { width: 64px; height: 90px; top: -45px; left: -32px; }
          .compact-status { flex: 1; text-align: left; min-width: 200px; }
        }

        @media (max-width: 640px) {
          .compact-stage { gap: 0.75rem; padding-top: 1rem; margin-top: 0.5rem; }
          .oracle-prompt { flex-direction: row; align-items: baseline; gap: 0.6rem; width: auto; }
          .deck-trigger { width: 100px; height: 100px; }
          .mini-card { width: 60px; height: 84px; top: -42px; left: -30px; }

          /* On mobile the exp-stage stacks (flex-col) and scrolls if it
             overflows, so the controls under the deck are always reachable.
             Previous grid 1fr behaviour pushed buttons off-screen on short phones. */
          .exp-stage {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: flex-start;
            overflow-y: auto;
            padding: 3.5rem 1rem 2rem;
            gap: 1.5rem;
          }
          .exp-controls { flex-wrap: wrap; justify-content: center; }

          /* Smaller cards on phones — the two-row alternating fan needs the
             room. 120×168 is still 5:7 so the tarot proportions stay. */
          .deck { width: 120px; height: 168px; }
          .card { --card-w: 120px; --card-h: 168px; }
          .card-icon { width: 50px; height: 50px; }
          .card-title { font-size: 0.55rem; }
          .numeral-letter { font-size: 1rem; }
          .numeral-suit { font-size: 0.72rem; }

          /* Reserve vertical space for the tossed fan (±55 px Y jitter +
             168 px card height) plus the tap-to-cut hint underneath. */
          .deck-wrap { min-height: 400px; padding-bottom: 0; }
          .deck.idle::after { bottom: -90px; }
        }
      `}</style>
    </div>
  );
}
