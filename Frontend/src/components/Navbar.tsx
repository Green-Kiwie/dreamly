import React from "react";
import { Link, useLocation } from "react-router-dom";

const NAV_LINKS = [
  { label: "Explore",      to: "/explore" },
  { label: "Design Tools", to: "/design-tools" },
  { label: "Save",         to: "/save" },
  { label: "Account",      to: "/account" },
];

const Navbar: React.FC = () => {
  const location = useLocation();

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=DM+Sans:wght@300;400;500;600&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --obsidian:       #080c14;
          --obsidian-mid:   #0c1220;
          --obsidian-light: #111927;
          --seam:           #1a2740;
          --seam-bright:    #243550;
          --ember:          #d4622a;
          --ember-glow:     #f07040;
          --ember-dim:      rgba(212,98,42,0.15);
          --ice:            #a8c4d8;
          --ice-dim:        rgba(168,196,216,0.4);
          --text:           #dde8f0;
          --text-muted:     rgba(221,232,240,0.42);
          --scan: repeating-linear-gradient(
            0deg, transparent, transparent 2px,
            rgba(168,196,216,0.012) 2px, rgba(168,196,216,0.012) 4px
          );
          --glow-ember: 0 0 10px rgba(212,98,42,0.5), 0 0 28px rgba(212,98,42,0.18);
        }

        /* ─── NAVBAR ─── */
        .dnav {
          position: relative;
          height: 60px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 24px;
          background: var(--obsidian-mid);
          border-bottom: 1px solid var(--seam);
          overflow: hidden;
          z-index: 100;
          flex-shrink: 0;
        }

        /* shimmer top edge */
        .dnav::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0; height: 1px;
          background: linear-gradient(90deg,
            transparent 0%, var(--seam-bright) 25%,
            var(--ember) 50%, var(--seam-bright) 75%, transparent 100%);
          background-size: 200% 100%;
          animation: nav-shimmer 5s linear infinite;
        }

        /* scanlines */
        .dnav::after {
          content: '';
          position: absolute;
          inset: 0;
          background: var(--scan);
          pointer-events: none;
        }

        @keyframes nav-shimmer {
          from { background-position: 200% 0; }
          to   { background-position: -200% 0; }
        }

        /* corner brackets */
        .dnav-bracket {
          position: absolute;
          width: 9px; height: 9px;
          opacity: 0.25;
          z-index: 1;
        }
        .dnav-bracket--tl { top: 7px; left: 9px;
          border-top: 1px solid var(--ice); border-left: 1px solid var(--ice); }
        .dnav-bracket--tr { top: 7px; right: 9px;
          border-top: 1px solid var(--ice); border-right: 1px solid var(--ice); }
        .dnav-bracket--bl { bottom: 7px; left: 9px;
          border-bottom: 1px solid var(--ice); border-left: 1px solid var(--ice); }
        .dnav-bracket--br { bottom: 7px; right: 9px;
          border-bottom: 1px solid var(--ice); border-right: 1px solid var(--ice); }

        /* ── Logo ── */
        .dnav-left {
          display: flex;
          align-items: center;
          gap: 12px;
          z-index: 1;
          text-decoration: none;
        }

        .dnav-logo-img {
          height: 53px;
          width: auto;
          object-fit: contain;
          display: block;
          filter: drop-shadow(0 0 6px rgba(212,98,42,0.25));
        }

        .dnav-wordmark {
          display: flex;
          flex-direction: column;
          line-height: 1;
        }

        .dnav-wordmark-main {
          font-family: 'Cormorant Garamond', serif;
          font-size: 22px;
          font-weight: 700;
          letter-spacing: 0.18em;
          color: var(--text);
          text-transform: uppercase;
        }

        .dnav-wordmark-sub {
          font-family: 'DM Sans', sans-serif;
          font-size: 8px;
          font-weight: 400;
          letter-spacing: 0.28em;
          text-transform: uppercase;
          color: var(--ember);
          margin-top: 3px;
          opacity: 0.9;
        }

        /* ── Center nav ── */
        .dnav-center {
          position: absolute;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          align-items: center;
          gap: 4px;
          z-index: 1;
        }

        .dnav-link {
          position: relative;
          padding: 6px 16px;
          font-family: 'DM Sans', sans-serif;
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--text-muted);
          text-decoration: none;
          border-radius: 4px;
          transition: color 0.2s, background 0.2s;
        }

        .dnav-link::after {
          content: '';
          position: absolute;
          bottom: 1px; left: 50%;
          transform: translateX(-50%) scaleX(0);
          width: 18px; height: 1px;
          background: var(--ember);
          box-shadow: var(--glow-ember);
          border-radius: 1px;
          transition: transform 0.3s cubic-bezier(0.34,1.56,0.64,1);
        }

        .dnav-link:hover           { color: var(--text); background: rgba(255,255,255,0.03); }
        .dnav-link:hover::after,
        .dnav-link.active::after   { transform: translateX(-50%) scaleX(1); }
        .dnav-link.active          { color: var(--text); }

        .dnav-sep {
          width: 3px; height: 3px;
          background: var(--seam-bright);
          border-radius: 50%;
          flex-shrink: 0;
          margin: 0 2px;
        }
      `}</style>

      <nav className="dnav">
        <div className="dnav-bracket dnav-bracket--tl" />
        <div className="dnav-bracket dnav-bracket--tr" />
        <div className="dnav-bracket dnav-bracket--bl" />
        <div className="dnav-bracket dnav-bracket--br" />

        {/* Logo */}
        <Link to="/" className="dnav-left">
          <img
            src="/dreamly-logo.png"
            alt="Dreamly logo"
            className="dnav-logo-img"
          />
          <div className="dnav-wordmark">
            <span className="dnav-wordmark-main">Dreamly</span>
            <span className="dnav-wordmark-sub">Build Your Dream Home</span>
          </div>
        </Link>

        {/* Center links */}
        <div className="dnav-center">
          {NAV_LINKS.map((link, i) => (
            <React.Fragment key={link.to}>
              {i > 0 && <div className="dnav-sep" />}
              <Link
                to={link.to}
                className={`dnav-link${location.pathname === link.to ? " active" : ""}`}
              >
                {link.label}
              </Link>
            </React.Fragment>
          ))}
        </div>
      </nav>
    </>
  );
};

export default Navbar;