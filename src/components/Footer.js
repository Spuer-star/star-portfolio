'use client';

export default function Footer() {
  return (
    <div className="app-footer">
      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-meta">
            <span className="mono">© MMXXVI · AKIRA ELOMAN</span>
            <span className="mono mono-faint">FOLIO 1</span>
          </div>
        </div>
      </footer>

      <style jsx>{`
        .app-footer {
          display: block;
        }

        .footer {
          border-top: 1px solid var(--rule);
          padding: 3rem 3rem 2rem;
          background: var(--ink-deep);
          position: relative;
          z-index: 2;
        }

        .footer-inner {
          max-width: 1600px;
          margin: 0 auto;
          display: flex;
          justify-content: flex-end;
          align-items: end;
        }

        .footer-meta {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 0.5rem;
          text-align: right;
        }

        .mono {
          font-family: var(--font-mono);
          font-size: 0.7rem;
          letter-spacing: 0.2em;
          color: var(--text-mute);
        }

        .mono-faint {
          color: var(--text-faint);
          font-size: 0.65rem;
        }

        @media (max-width: 700px) {
          .footer {
            padding: 2.5rem 1.5rem 1.5rem;
          }
          .footer-inner {
            justify-content: flex-start;
          }
          .footer-meta {
            align-items: flex-start;
            text-align: left;
          }
        }
      `}</style>
    </div>
  );
}
