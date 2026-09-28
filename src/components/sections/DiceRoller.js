'use client';

import { useEffect, useRef, useState } from 'react';
import { PROJECTS } from '@/lib/projects';
import { summonTeleport } from '@/lib/teleport';

const NUMERALS = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'];
/** A d8 has eight faces, so only the first eight projects can be rolled. */
const DIE_PROJECTS = PROJECTS.slice(0, NUMERALS.length);

/** Dramatic pause between dice settling and the teleport firing. */
const AUTO_SUMMON_PAUSE_MS = 1200;
/** Total runtime of the teleport cinematic (in TeleportOverlay). */
const TELEPORT_DURATION_MS = 4700;

/**
 * Per-face settling Euler angles (degrees). Applying
 *   rotateX(0) rotateY(ry) rotateZ(rz)
 * to the dice brings face k's outward normal to +Z (toward camera),
 * so face k ends up squarely facing the viewer.
 *
 * Derivation: for a face with CSS normal N = (Nx, Ny, Nz)/√3,
 *   • α (rz) is chosen so rotateZ(α) zeroes the y component AND
 *     leaves a positive x component.
 *   • β (ry) is then chosen so rotateY(β) maps (X′, 0, Nz/√3)
 *     onto (0, 0, 1). For Nz = +1 this is β = −54.74°
 *     (= −arctan √2); for Nz = −1 it is β = −125.26°.
 *
 * (Applied as: transform: rotateY(β) rotateZ(α), which CSS evaluates
 *  right-to-left — rotateZ first, then rotateY.)
 */
const SETTLES = [
  { ry:  -54.74, rz:   45 }, // F1  top, +X +Z
  { ry:  -54.74, rz:  135 }, // F2  top, −X +Z
  { ry: -125.26, rz:  135 }, // F3  top, −X −Z
  { ry: -125.26, rz:   45 }, // F4  top, +X −Z
  { ry:  -54.74, rz:  -45 }, // F5  bot, +X +Z
  { ry:  -54.74, rz: -135 }, // F6  bot, −X +Z
  { ry: -125.26, rz: -135 }, // F7  bot, −X −Z
  { ry: -125.26, rz:  -45 }, // F8  bot, +X −Z
];

function prefersReducedMotion() {
  return typeof window !== 'undefined'
    && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true;
}

/**
 * Smallest angle ≥ currentDeg + minTurns·360 that is ≡ targetMod360 (mod 360).
 * Lets us animate at least N full turns and finish on a precise target.
 */
function nextEquivalent(currentDeg, targetMod360, minTurns) {
  const minFinal = currentDeg + minTurns * 360;
  const k = Math.ceil((minFinal - targetMod360) / 360);
  return targetMod360 + k * 360;
}

export default function DiceRoller() {
  // Each piece of state is mirrored in a ref so timers / async code always
  // read the latest value (the Angular version read signals directly).
  const [rolling, setRollingState] = useState(false);
  const rollingRef = useRef(false);
  const [result, setResultState] = useState(null);
  const resultRef = useRef(null);
  /** Face numeral the dice settled on (1–8); 0 when no roll yet / mid-roll. */
  const [landedFace, setLandedFaceState] = useState(0);
  const landedFaceRef = useRef(0);
  /** True from the moment we hand off to the teleport overlay until it ends. */
  const [teleporting, setTeleportingState] = useState(false);
  const teleportingRef = useRef(false);
  const [rot, setRotState] = useState({ x: -22, y: 32, z: 0 });
  const rotRef = useRef({ x: -22, y: 32, z: 0 });

  const setRolling = (v) => { rollingRef.current = v; setRollingState(v); };
  const setResult = (v) => { resultRef.current = v; setResultState(v); };
  const setLandedFace = (v) => { landedFaceRef.current = v; setLandedFaceState(v); };
  const setTeleporting = (v) => { teleportingRef.current = v; setTeleportingState(v); };
  const setRot = (v) => { rotRef.current = v; setRotState(v); };

  const diceButtonRef = useRef(null);
  const diceElRef = useRef(null);

  const rollTimerRef = useRef(null);
  /** Pending auto-summon timer; cleared if the user re-rolls or summons manually. */
  const autoSummonTimerRef = useRef(null);
  const teleportResetTimerRef = useRef(null);

  useEffect(() => {
    return () => {
      window.clearTimeout(rollTimerRef.current);
      window.clearTimeout(autoSummonTimerRef.current);
      window.clearTimeout(teleportResetTimerRef.current);
      rollTimerRef.current = null;
      autoSummonTimerRef.current = null;
      teleportResetTimerRef.current = null;
    };
  }, []);

  const resultIndex = result
    ? PROJECTS.findIndex((p) => p.id === result.id) + 1
    : 0;

  const cancelAutoSummon = () => {
    if (autoSummonTimerRef.current !== null) {
      window.clearTimeout(autoSummonTimerRef.current);
      autoSummonTimerRef.current = null;
    }
  };

  const jumpToResult = () => {
    if (teleportingRef.current) return;

    const picked = resultRef.current;
    const face = landedFaceRef.current;
    if (!picked || face === 0) return;

    const button = diceButtonRef.current;
    if (!button) return;

    const idx = PROJECTS.findIndex((p) => p.id === picked.id);
    if (idx < 0) return;

    cancelAutoSummon();
    setTeleporting(true);

    summonTeleport({
      project: picked,
      projectIndex: idx,
      faceNumeral: NUMERALS[face - 1] ?? String(face),
      sourceRect: button.getBoundingClientRect(),
      accent: picked.accent,
      ghostKind: 'face',
    });

    // Reset our local state once the cinematic finishes plus a small buffer,
    // so the next visit to the hero finds a fresh oracle.
    teleportResetTimerRef.current = window.setTimeout(() => {
      teleportResetTimerRef.current = null;
      setTeleporting(false);
      setResult(null);
      setLandedFace(0);
    }, TELEPORT_DURATION_MS + 600);
  };

  const roll = () => {
    if (rollingRef.current || teleportingRef.current) return;
    // Cancel any pending auto-summon from a previous roll.
    cancelAutoSummon();
    setRolling(true);
    setResult(null);
    setLandedFace(0);

    const facePicked = Math.floor(Math.random() * DIE_PROJECTS.length);
    const picked = DIE_PROJECTS[facePicked];
    const target = SETTLES[facePicked];

    const baseX = rotRef.current.x;
    const baseY = rotRef.current.y;
    const baseZ = rotRef.current.z;
    const minTurns = 3 + Math.floor(Math.random() * 2); // 3 or 4 full revolutions

    const finalX = nextEquivalent(baseX,  0,         minTurns);
    const finalY = nextEquivalent(baseY,  target.ry, minTurns);
    const finalZ = nextEquivalent(baseZ,  target.rz, minTurns);

    // Drive the roll with the Web Animations API. CSS transitions on
    // transforms whose angles come from CSS variables aren't reliable on
    // mobile when the rotation spans multiple full revolutions — many
    // engines decompose to a shortest-path matrix and the spin disappears.
    // WAA receives explicit transform strings per keyframe so the engine
    // interpolates the rotation values directly.
    const diceEl = diceElRef.current;
    if (diceEl && !prefersReducedMotion()) {
      diceEl.getAnimations().forEach((a) => a.cancel());
      diceEl.animate(
        [
          { transform: `rotateX(${baseX}deg) rotateY(${baseY}deg) rotateZ(${baseZ}deg)` },
          { transform: `rotateX(${finalX}deg) rotateY(${finalY}deg) rotateZ(${finalZ}deg)` },
        ],
        {
          duration: 1700,
          easing: 'cubic-bezier(0.34, 1.06, 0.46, 1)',
          fill: 'forwards',
        },
      );
    }

    // Update state so the CSS-var-based transform on .dice matches
    // the final orientation. While the WAA animation is filling forwards,
    // its effect overrides this; once the animation is cancelled below
    // the CSS value takes over without any visible jump.
    setRot({ x: finalX, y: finalY, z: finalZ });

    rollTimerRef.current = window.setTimeout(() => {
      rollTimerRef.current = null;
      // Release the WAA effect so future updates (the teleport's source-rect
      // measurement, idle-tilt on hover) interact with the regular CSS rule.
      diceEl?.getAnimations().forEach((a) => a.cancel());

      setResult(picked);
      setLandedFace(facePicked + 1);
      setRolling(false);

      // Dramatic pause to register the result, then the oracle teleports
      // them to the chosen entry. The user can short-circuit by clicking
      // "visit entry" — both call jumpToResult() which is guarded.
      autoSummonTimerRef.current = window.setTimeout(() => {
        autoSummonTimerRef.current = null;
        jumpToResult();
      }, AUTO_SUMMON_PAUSE_MS);
    }, 1700);
  };

  const faceClass = (n) => `face f${n}${landedFace === n ? ' landed' : ''}`;

  return (
    <div className="app-dice-roller">
      <div className={`dice-stage${result ? ' has-result' : ''}`}>
        <p className="oracle-prompt">
          <span className="oracle-label">ORACLE</span>
          <span className="oracle-sub">cast a fate · d8</span>
        </p>

        <button
          ref={diceButtonRef}
          className={`dice-button${teleporting ? ' teleporting' : ''}`}
          onClick={roll}
          disabled={rolling || teleporting}
          aria-label={rolling ? 'Rolling…' : 'Roll the d8 to pick a random project'}
        >
          <span
            ref={diceElRef}
            className={`dice${rolling ? ' rolling' : ''}`}
            style={{
              '--rx': rot.x + 'deg',
              '--ry': rot.y + 'deg',
              '--rz': rot.z + 'deg',
            }}
          >
            <span className={faceClass(1)}>I</span>
            <span className={faceClass(2)}>II</span>
            <span className={faceClass(3)}>III</span>
            <span className={faceClass(4)}>IV</span>
            <span className={faceClass(5)}>V</span>
            <span className={faceClass(6)}>VI</span>
            <span className={faceClass(7)}>VII</span>
            <span className={faceClass(8)}>VIII</span>
          </span>

          <span className={`dice-shadow${rolling ? ' rolling' : ''}`}></span>
        </button>

        <div className={`result-strip${result ? ' visible' : ''}`}>
          {result ? (
            <>
              <div className="result-line">
                <span className="result-arrow">→</span>
                <span className="result-text">
                  fate has chosen <em>{result?.title}</em>
                </span>
              </div>
              <button className="result-jump" onClick={jumpToResult}>
                visit entry №{resultIndex}
              </button>
            </>
          ) : (
            <div className="result-empty">click the die · {DIE_PROJECTS.length} possibilities</div>
          )}
        </div>
      </div>

      <style jsx>{`
        .app-dice-roller { display: block; }

        .dice-stage {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
          padding-top: 1rem;
        }

        .oracle-prompt {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.15rem;
          padding-bottom: 0.75rem;
          border-bottom: 1px solid var(--rule);
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

        .dice-button {
          position: relative;
          width: 130px;
          height: 130px;
          background: transparent;
          border: none;
          cursor: pointer;
          perspective: 600px;
          perspective-origin: center 30%;
          padding: 0;
          transition: transform 0.3s;
          margin-top: 0.5rem;
        }
        .dice-button:disabled { cursor: progress; }
        .dice-button:hover:not(:disabled) .dice {
          animation: idle-tilt 1.4s ease-in-out infinite;
        }
        .dice-button.teleporting {
          opacity: 0;
          transform: scale(0.7);
          transition: opacity 0.9s ease-out, transform 0.9s ease-out;
          pointer-events: none;
        }
        .dice-button:focus-visible { outline: none; }
        .dice-button:focus-visible .dice {
          filter: drop-shadow(0 0 8px var(--ember));
        }

        /* === The 3D octahedron === */
        .dice {
          --edge: 84;                              /* unitless edge length, px-equivalent */
          --tx: calc(var(--edge) * 0.2357);        /* edge × √2/6 = centroid distance */
          --rx: -22deg;
          --ry: 32deg;
          --rz: 0deg;

          position: absolute;
          top: 50%;
          left: 50%;
          width: 0;
          height: 0;
          transform-style: preserve-3d;
          transform:
            rotateX(var(--rx))
            rotateY(var(--ry))
            rotateZ(var(--rz));
          will-change: transform; /* keep on a GPU layer for smoother rolls on mobile */
        }
        .dice-button { touch-action: manipulation; }
        /* The roll itself is driven by the Web Animations API (see roll() in
           the component) — CSS transitions on transforms with var()-based
           angles aren't reliable on mobile when the rotation spans multiple
           full turns (the engine matrix-decomposes to the shortest path,
           killing the spin). */

        /* === Triangular face === */
        .face {
          position: absolute;
          box-sizing: border-box;
          width: calc(var(--edge) * 1px);
          height: calc(var(--edge) * 0.866 * 1px);     /* √3/2 */
          /* place triangle's centroid (50%, 66.67%) at (0, 0) of dice */
          top: calc(var(--edge) * -0.5773 * 1px);      /* −2H/3 */
          left: calc(var(--edge) * -0.5 * 1px);
          transform-origin: 50% 66.67%;

          display: flex;
          align-items: center;
          justify-content: center;
          padding-top: calc(var(--edge) * 0.289 * 1px); /* push numeral toward centroid */

          font-family: var(--font-display);
          font-variation-settings: 'opsz' 144, 'WONK' 1;
          font-size: 1.4rem;
          font-style: italic;
          font-weight: 300;
          letter-spacing: -0.05em;
          color: var(--paper);

          background: linear-gradient(160deg, var(--ink-warm) 0%, var(--ink) 75%);
          border: 1.5px solid var(--ember);
          box-shadow:
            inset 0 0 0 1px rgba(255, 107, 53, 0.15),
            inset 6px 6px 18px rgba(0, 0, 0, 0.55),
            inset -2px -2px 6px rgba(255, 107, 53, 0.08);

          /* equilateral triangle, slightly wonky for the hand-drawn feel */
          clip-path: polygon(50% 1%, 99% 99%, 1% 99%);
          backface-visibility: hidden;

          transition:
            background 0.55s ease,
            border-color 0.55s ease,
            box-shadow 0.55s ease,
            color 0.55s ease;
        }

        /* The face the dice has settled on — glows in ember */
        .face.landed {
          background: linear-gradient(160deg, var(--ember) 0%, #b54620 78%);
          color: var(--ink);
          border-color: var(--paper);
          box-shadow:
            inset 0 0 0 1px rgba(255, 255, 255, 0.35),
            inset 4px 4px 14px rgba(0, 0, 0, 0.25),
            inset -2px -2px 6px rgba(255, 255, 255, 0.12),
            0 0 22px rgba(255, 107, 53, 0.55);
          animation: face-glow 2.4s ease-in-out infinite;
        }
        @keyframes face-glow {
          0%, 100% { filter: drop-shadow(0 0 8px rgba(255, 107, 53, 0.45)); }
          50%      { filter: drop-shadow(0 0 16px rgba(255, 107, 53, 0.85)); }
        }

        /* === 8 face transforms — regular octahedron, derived by hand === */
        /* Top 4 (apex at +Y), azimuths 45°, 135°, 225°, 315° */
        .f1 { transform: matrix3d(-0.7071, 0, 0.7071, 0,  0.4082, 0.8165, 0.4082, 0,  0.5774, -0.5774, 0.5774, 0,  var(--tx), calc(var(--tx) * -1), var(--tx), 1); }
        .f2 { transform: matrix3d(-0.7071, 0,-0.7071, 0, -0.4082, 0.8165, 0.4082, 0, -0.5774, -0.5774, 0.5774, 0,  calc(var(--tx) * -1), calc(var(--tx) * -1), var(--tx), 1); }
        .f3 { transform: matrix3d( 0.7071, 0,-0.7071, 0, -0.4082, 0.8165,-0.4082, 0, -0.5774, -0.5774,-0.5774, 0,  calc(var(--tx) * -1), calc(var(--tx) * -1), calc(var(--tx) * -1), 1); }
        .f4 { transform: matrix3d( 0.7071, 0, 0.7071, 0,  0.4082, 0.8165,-0.4082, 0,  0.5774, -0.5774,-0.5774, 0,  var(--tx), calc(var(--tx) * -1), calc(var(--tx) * -1), 1); }
        /* Bottom 4 (apex at −Y), azimuths 45°, 135°, 225°, 315° */
        .f5 { transform: matrix3d( 0.7071, 0,-0.7071, 0,  0.4082,-0.8165, 0.4082, 0,  0.5774,  0.5774, 0.5774, 0,  var(--tx), var(--tx), var(--tx), 1); }
        .f6 { transform: matrix3d( 0.7071, 0, 0.7071, 0, -0.4082,-0.8165, 0.4082, 0, -0.5774,  0.5774, 0.5774, 0,  calc(var(--tx) * -1), var(--tx), var(--tx), 1); }
        .f7 { transform: matrix3d(-0.7071, 0, 0.7071, 0, -0.4082,-0.8165,-0.4082, 0, -0.5774,  0.5774,-0.5774, 0,  calc(var(--tx) * -1), var(--tx), calc(var(--tx) * -1), 1); }
        .f8 { transform: matrix3d(-0.7071, 0,-0.7071, 0,  0.4082,-0.8165,-0.4082, 0,  0.5774,  0.5774,-0.5774, 0,  var(--tx), var(--tx), calc(var(--tx) * -1), 1); }

        /* === Shadow under die === */
        .dice-shadow {
          position: absolute;
          bottom: 6px;
          left: 50%;
          transform: translateX(-50%);
          width: 80px;
          height: 12px;
          background: radial-gradient(ellipse at center, rgba(255, 107, 53, 0.25) 0%, transparent 65%);
          filter: blur(3px);
          transition: opacity 0.3s, transform 0.3s;
          z-index: -1;
        }
        .dice-shadow.rolling { animation: shadow-pulse 1.65s ease-in-out; }

        /* === Result strip === */
        .result-strip {
          width: 100%;
          min-height: 60px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          padding-top: 0.75rem;
          border-top: 1px solid var(--rule);
          text-align: center;
          word-break: break-word;
          max-width: 100%;
          overflow: hidden;
        }
        .result-text {
          font-family: var(--font-display);
          font-size: 0.85rem;
          color: var(--text);
          max-width: 100%;
          overflow-wrap: break-word;
        }
        .result-text em { font-style: italic; color: var(--ember); }
        .result-empty {
          font-family: var(--font-mono);
          font-size: 0.7rem;
          color: var(--text-faint);
          letter-spacing: 0.15em;
          text-transform: uppercase;
        }
        .result-line {
          display: flex;
          align-items: baseline;
          gap: 0.4rem;
          animation: fade-in 0.5s ease;
        }
        .result-arrow { color: var(--ember); font-size: 1rem; }
        .result-jump {
          font-family: var(--font-mono);
          font-size: 0.7rem;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          background: transparent;
          color: var(--ember);
          border: 1px solid var(--ember);
          padding: 0.4rem 0.85rem;
          cursor: pointer;
          transition: all 0.3s;
          animation: fade-in 0.5s ease 0.1s both;
        }
        .result-jump:hover { background: var(--ember); color: var(--ink); }

        /* === Animations === */
        @keyframes idle-tilt {
          0%, 100% { transform: rotateX(var(--rx)) rotateY(var(--ry)) rotateZ(var(--rz)); }
          50% {
            transform:
              rotateX(calc(var(--rx) - 4deg))
              rotateY(calc(var(--ry) + 6deg))
              rotateZ(calc(var(--rz) + 1deg));
          }
        }
        @keyframes shadow-pulse {
          0%, 100% { opacity: 1; transform: translateX(-50%) scale(1); }
          30%      { opacity: 0.5; transform: translateX(-50%) scale(0.7); }
          60%      { opacity: 0.9; transform: translateX(-50%) scale(1.1); }
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @media (prefers-reduced-motion: reduce) {
          .dice { transition: none !important; }
          .dice-button:hover .dice { animation: none !important; }
          .dice-shadow.rolling { animation: none !important; }
        }

        /* Tablet — inline row */
        @media (max-width: 1024px) and (min-width: 641px) {
          .dice-stage { flex-direction: row; align-items: center; gap: 1.5rem; flex-wrap: wrap; }
          .oracle-prompt { flex-direction: row; gap: 0.5rem; border: none; padding: 0; width: auto; }
          .dice-button { width: 110px; height: 110px; }
          .dice { --edge: 70; }
          .face { font-size: 1.2rem; }
          .result-strip { flex: 1; min-width: 200px; border: none; padding: 0; align-items: flex-start; text-align: left; }
        }

        /* Mobile — stacked, compact */
        @media (max-width: 640px) {
          .dice-stage { gap: 0.75rem; padding-top: 0.5rem; align-items: center; }
          .oracle-prompt { flex-direction: row; align-items: baseline; gap: 0.6rem; border: none; padding: 0; width: auto; }
          .dice-button { width: 100px; height: 100px; margin-top: 0.25rem; }
          .dice { --edge: 60; }
          .face { font-size: 1rem; }
          .result-strip { border: none; padding-top: 0.5rem; min-height: 40px; }
          .result-text { font-size: 0.85rem; }
        }
      `}</style>
    </div>
  );
}
