'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

const NAV_LINKS = [
  { id: 'projects', label: 'Archive' },
  { id: 'experience', label: 'Experience' },
  { id: 'skills', label: 'Skills' },
  { id: 'about', label: 'About' },
  { id: 'contact', label: 'Contact' },
];

const SECTION_IDS = ['hero', 'projects', 'experience', 'skills', 'about', 'contact'];

export default function Nav() {
  const pathname = usePathname();
  const router = useRouter();
  const [activeSection, setActiveSection] = useState('hero');
  const [menuOpen, setMenuOpen] = useState(false);

  /** Debounce so the pointerup + click pair doesn't toggle twice. */
  const lastTapRef = useRef(0);
  /** Section to scroll to once navigation back to '/' has completed. */
  const pendingScrollRef = useRef(null);

  /** Bound to both (pointerup) and (click) on the hamburger. Whichever
   *  fires first wins; the other is debounced. Some mobile WebViews stall
   *  click events but always deliver pointerup, so we need the redundancy. */
  const onHamburgerTap = (event) => {
    const now =
      typeof performance !== 'undefined' ? performance.now() : Date.now();
    if (now - lastTapRef.current < 300) return;
    lastTapRef.current = now;
    event.stopPropagation?.();
    setMenuOpen((open) => !open);
  };

  const closeMenu = () => {
    setMenuOpen(false);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollTo = (id) => {
    if (pathname !== '/') {
      pendingScrollRef.current = id;
      router.push('/');
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Finish a cross-route scrollTo() once we're back on the home page.
  useEffect(() => {
    if (pathname !== '/' || !pendingScrollRef.current) return;
    const id = pendingScrollRef.current;
    const timer = window.setTimeout(() => {
      pendingScrollRef.current = null;
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
    return () => window.clearTimeout(timer);
  }, [pathname]);

  // Scroll-spy.
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        }
      },
      { threshold: 0.3 }
    );

    for (const id of SECTION_IDS) {
      const el = document.getElementById(id);
      if (el) {
        observer.observe(el);
      }
    }

    return () => observer.disconnect();
  }, [pathname]);

  return (
    <div className="app-nav">
      <nav className="nav">
        <div className="nav-inner">
          <Link className="logo" href="/" onClick={scrollToTop}>
            <span className="logo-mark">AE</span>
            <span className="logo-text">
              <em>Akira&apos;s</em><br />
              Code Cave
            </span>
          </Link>

          <div className="nav-links-desktop">
            {NAV_LINKS.map((link) => (
              <a
                key={link.id}
                className={`nav-link${activeSection === link.id ? ' active' : ''}`}
                href={`/#${link.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  scrollTo(link.id);
                }}
              >
                <span className="link-text">{link.label}</span>
              </a>
            ))}
            <Link className="nav-link nav-link--cv" href="/cv">
              <span className="link-text">CV</span>
            </Link>
          </div>

          <button
            type="button"
            className="hamburger"
            onPointerUp={onHamburgerTap}
            onClick={onHamburgerTap}
            aria-expanded={menuOpen}
            aria-label="Toggle navigation menu"
          >
            <span className={`hamburger-line${menuOpen ? ' open' : ''}`}></span>
            <span className={`hamburger-line${menuOpen ? ' open' : ''}`}></span>
            <span className={`hamburger-line${menuOpen ? ' open' : ''}`}></span>
          </button>
        </div>
      </nav>

      {/* IMPORTANT: must live outside <nav>. The .nav element has
          backdrop-filter, which makes IT the containing block for fixed-
          position descendants — putting the overlay inside collapsed it
          to the nav's own height (88px desktop / 72px mobile), so
          "inset: 88px 0 0 0" → height 0 and the menu was invisible.
          As a sibling of <nav>, position:fixed resolves to the viewport. */}
      <div
        className={`mobile-overlay${menuOpen ? ' is-open' : ''}`}
        onClick={closeMenu}
      >
        <div className="mobile-menu" onClick={(e) => e.stopPropagation()}>
          {NAV_LINKS.map((link) => (
            <a
              key={link.id}
              className={`mobile-link${activeSection === link.id ? ' active' : ''}`}
              href={`/#${link.id}`}
              onClick={(e) => {
                e.preventDefault();
                scrollTo(link.id);
                closeMenu();
              }}
            >
              {link.label}
            </a>
          ))}
          <Link className="mobile-link" href="/cv" onClick={closeMenu}>
            CV
          </Link>
        </div>
      </div>

      {/* Anchor rules are :global() under .app-nav because next/link's <a>
          doesn't receive styled-jsx's scope class. */}
      <style jsx>{`
        .app-nav {
          display: block;
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 100;
        }

        .nav {
          background: rgba(10, 9, 7, 0.85);
          backdrop-filter: blur(16px) saturate(140%);
          -webkit-backdrop-filter: blur(16px) saturate(140%);
          border-bottom: 1px solid var(--rule);
        }

        .nav-inner {
          max-width: 1600px;
          margin: 0 auto;
          padding: 0 3rem;
          height: 88px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 2rem;
        }

        .app-nav :global(.logo) {
          display: flex;
          align-items: center;
          gap: 0.85rem;
          cursor: pointer;
          user-select: none;
          transition: opacity 0.25s;
        }

        .app-nav :global(.logo:hover) {
          opacity: 0.85;
        }

        .logo-mark {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 44px;
          height: 44px;
          background: var(--ember);
          color: var(--ink);
          font-weight: 700;
          font-size: 0.9rem;
          letter-spacing: 0.05em;
          font-family: var(--font-mono);
        }

        .logo-text {
          font-family: var(--font-display);
          font-size: 0.9rem;
          line-height: 1.1;
          color: var(--paper);
          font-weight: 400;
          letter-spacing: -0.005em;
        }

        .logo-text em {
          font-style: italic;
          color: var(--text-mute);
          font-size: 0.85em;
          font-weight: 200;
        }

        .nav-links-desktop {
          display: flex;
          align-items: center;
          gap: 1.75rem;
        }

        .app-nav :global(.nav-link) {
          position: relative;
          cursor: pointer;
          display: flex;
          align-items: baseline;
          gap: 0.45rem;
          transition: color 0.3s;
        }

        .link-num {
          font-family: var(--font-mono);
          font-size: 0.65rem;
          color: var(--brass-mute);
          letter-spacing: 0.15em;
        }

        .link-text {
          font-family: 'Arial Black', Arial, sans-serif;
          font-size: 0.85rem;
          color: var(--text);
          font-style: normal;
          transition: color 0.3s;
        }

        .app-nav :global(.nav-link:hover) .link-text {
          color: var(--ember);
        }

        .app-nav :global(.nav-link.active) .link-text {
          color: var(--ember);
        }

        .app-nav :global(.nav-link.active::after) {
          content: '';
          position: absolute;
          bottom: -8px;
          left: 0;
          right: 0;
          height: 1px;
          background: var(--ember);
        }

        .app-nav :global(.nav-link:focus-visible) {
          outline: 2px solid var(--ember);
          outline-offset: 6px;
        }

        /* Hamburger */
        .hamburger {
          display: none;
          flex-direction: column;
          justify-content: center;
          gap: 5px;
          background: none;
          border: 1px solid var(--rule);
          cursor: pointer;
          padding: 10px;
          width: 44px;
          height: 44px;
          align-items: center;
          /* Strip iOS's 300ms tap delay and reserve the gesture for tap. */
          touch-action: manipulation;
          -webkit-tap-highlight-color: transparent;
          /* Ensure nothing inside the nav can ever sit on top of the button. */
          position: relative;
          z-index: 5;
        }
        .hamburger > * { pointer-events: none; } /* taps land on the button itself */
        .hamburger:active { background: rgba(255, 107, 53, 0.08); }

        .hamburger:focus-visible {
          outline: 2px solid var(--ember);
          outline-offset: 2px;
        }

        .hamburger-line {
          display: block;
          width: 20px;
          height: 1px;
          background: var(--paper);
          transition: transform 0.3s ease, opacity 0.3s ease;
        }

        .hamburger-line.open:nth-child(1) {
          transform: translateY(6px) rotate(45deg);
        }
        .hamburger-line.open:nth-child(2) {
          opacity: 0;
        }
        .hamburger-line.open:nth-child(3) {
          transform: translateY(-6px) rotate(-45deg);
        }

        /* Mobile menu */
        .mobile-overlay {
          position: fixed;
          inset: 88px 0 0 0;
          background: var(--ink);
          z-index: 110; /* above .nav-inner so the open menu always wins */
          overflow-y: auto;
          opacity: 0;
          visibility: hidden;
          pointer-events: none;
          transition:
            opacity 0.25s ease,
            visibility 0s linear 0.25s;
        }
        .mobile-overlay.is-open {
          opacity: 1;
          visibility: visible;
          pointer-events: auto;
          transition:
            opacity 0.25s ease,
            visibility 0s;
        }

        .mobile-overlay::before {
          content: '';
          position: absolute;
          inset: 0;
          background:
            radial-gradient(ellipse at top left, rgba(255, 107, 53, 0.04) 0%, transparent 50%),
            radial-gradient(ellipse at bottom right, rgba(201, 169, 97, 0.03) 0%, transparent 50%);
          pointer-events: none;
        }

        .mobile-menu {
          position: relative;
          z-index: 1;
          display: flex;
          flex-direction: column;
          padding: 2rem;
          gap: 0.5rem;
          border-top: 1px solid var(--rule);
          background: var(--ink);
        }

        .app-nav :global(.mobile-link) {
          display: flex;
          align-items: baseline;
          gap: 1rem;
          color: var(--text);
          font-family: 'Arial Black', Arial, sans-serif;
          font-style: normal;
          font-size: 1.35rem;
          padding: 1rem 0;
          cursor: pointer;
          transition: color 0.25s;
          border-bottom: 1px solid var(--rule);
          touch-action: manipulation;
          -webkit-tap-highlight-color: transparent;
        }

        .app-nav :global(.mobile-link) .link-num {
          font-size: 0.75rem;
          font-style: normal;
          color: var(--brass-mute);
        }

        .app-nav :global(.mobile-link:hover),
        .app-nav :global(.mobile-link.active) {
          color: var(--ember);
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @media (max-width: 768px) {
          .nav-inner {
            padding: 0 1.5rem;
            height: 72px;
          }
          .nav-links-desktop {
            display: none;
          }
          .hamburger {
            display: flex;
          }
          .mobile-overlay {
            inset: 72px 0 0 0;
            background: var(--ink);
          }
        }
      `}</style>
    </div>
  );
}
