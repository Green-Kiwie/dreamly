import React from "react";
import { Link } from "react-router-dom";

const Footer: React.FC = () => {
  return (
    <>
      <style>{`
        /* ─── FOOTER ─── */
        .dfooter {
          position: relative;
          height: 42px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 24px;
          background: var(--obsidian-mid);
          border-top: 1px solid var(--seam);
          overflow: hidden;
          flex-shrink: 0;
          z-index: 100;
        }

        /* shimmer bottom edge */
        .dfooter::after {
          content: '';
          position: absolute;
          bottom: 0; left: 0; right: 0; height: 1px;
          background: linear-gradient(90deg,
            transparent 0%, var(--seam-bright) 30%,
            var(--ember) 50%, var(--seam-bright) 70%, transparent 100%);
          background-size: 200% 100%;
          animation: nav-shimmer 6s linear infinite reverse;
        }

        /* scan texture */
        .dfooter::before {
          content: '';
          position: absolute;
          inset: 0;
          background: var(--scan);
          pointer-events: none;
        }

        .dfooter-left {
          z-index: 1;
        }

        .dfooter-copy {
          font-family: 'DM Sans', sans-serif;
          font-size: 10px;
          font-weight: 400;
          letter-spacing: 0.14em;
          color: var(--text-muted);
          text-transform: uppercase;
        }

        .dfooter-right {
          display: flex;
          align-items: center;
          gap: 20px;
          z-index: 1;
        }

        .dfooter-build {
          display: flex;
          align-items: center;
          gap: 6px;
          font-family: 'DM Sans', sans-serif;
          font-size: 9.5px;
          font-weight: 400;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: var(--text-muted);
          opacity: 0.5;
        }

        .dfooter-build-dot {
          width: 5px; height: 5px;
          border-radius: 50%;
          background: var(--ember);
          opacity: 0.7;
        }

        .dfooter-links {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .dfooter-link {
          font-family: 'DM Sans', sans-serif;
          font-size: 10px;
          font-weight: 500;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--text-muted);
          text-decoration: none;
          padding: 3px 9px;
          border-radius: 3px;
          transition: color 0.2s;
          position: relative;
        }

        .dfooter-link::after {
          content: '';
          position: absolute;
          bottom: 0; left: 50%;
          transform: translateX(-50%) scaleX(0);
          width: 14px; height: 1px;
          background: var(--ember);
          transition: transform 0.25s cubic-bezier(0.34,1.56,0.64,1);
        }

        .dfooter-link:hover { color: var(--text); }
        .dfooter-link:hover::after { transform: translateX(-50%) scaleX(1); }

        .dfooter-dot-sep {
          width: 2px; height: 2px;
          border-radius: 50%;
          background: var(--seam-bright);
          flex-shrink: 0;
        }
      `}</style>

      <footer className="dfooter">
        <div className="dfooter-left">
          <span className="dfooter-copy">© 2026 Dreamly. All rights reserved.</span>
        </div>

        <div className="dfooter-right">
          <div className="dfooter-build">
            <div className="dfooter-build-dot" />
            <span>Build 1.0.0</span>
          </div>
          <div className="dfooter-links">
            <Link to="/terms"   className="dfooter-link">Terms of Service</Link>
            <div className="dfooter-dot-sep" />
            <Link to="/privacy" className="dfooter-link">Privacy</Link>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Footer;