import React, { useState } from "react";
import { Unity, useUnityContext } from "react-unity-webgl";

export const webglRef = { sendMessage: null as any };

const FURNITURE_ITEMS = [
  { id: 1,  name: "Modern Sofa",         icon: "M3 17h18M5 17V9a2 2 0 012-2h10a2 2 0 012 2v8" },
  { id: 2,  name: "Eames Lounge Chair",  icon: "M6 17V9a2 2 0 012-2h8a2 2 0 012 2v8M4 17h16" },
  { id: 3,  name: "Floor Lamp",          icon: "M12 2v14M8 16h8M10 20h4" },
  { id: 4,  name: "Coffee Table",        icon: "M3 13h18v2H3zM6 15v3M18 15v3" },
  { id: 5,  name: "Bookshelf",           icon: "M4 4h16v16H4zM4 9h16M4 14h16M9 4v16" },
  { id: 6,  name: "Dining Table",        icon: "M3 10h18v2H3zM7 12v5M17 12v5M5 7h14" },
  { id: 7,  name: "Pendant Light",       icon: "M12 2v4M8 10a4 4 0 008 0M10 14h4M12 14v6" },
  { id: 8,  name: "Accent Chair",        icon: "M5 17V9a3 3 0 016 0v8M5 14h6" },
  { id: 9,  name: "Side Table",          icon: "M4 16h16v2H4zM8 12h8v4H8zM10 8h4v4h-4z" },
  { id: 10, name: "TV Console",          icon: "M2 8h20v10H2zM8 18v2M16 18v2M5 13h14" },
  { id: 11, name: "Armchair",            icon: "M4 17V10a3 3 0 016 0v7M4 13h6M14 17V10a3 3 0 016 0v7M14 13h6" },
  { id: 12, name: "Wardrobe",            icon: "M3 3h18v18H3zM12 3v18M7 8h2M15 8h2M7 13h2M15 13h2" },
  { id: 13, name: "Desk",                icon: "M2 14h20v2H2zM6 14V8h12v6M9 8V6h6v2" },
  { id: 14, name: "Lounge Sectional",    icon: "M2 17h20M2 17V11h6v6M14 17V11h8v6M8 17v-3h6v3" },
  { id: 15, name: "Ottoman",             icon: "M5 15h14v2H5zM5 15a3 3 0 010-6h14a3 3 0 010 6" },
  { id: 16, name: "Bar Stool",           icon: "M9 3h6M12 3v7M8 10h8M9 18h6M10 10l-1 8M14 10l1 8" },
];

const Editor: React.FC = () => {
  const [search, setSearch]     = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const { unityProvider, loadingProgression, isLoaded, sendMessage } =
    useUnityContext({
      loaderUrl:    "/UnityBuild/Build/UnityBuild.loader.js",
      dataUrl:      "/UnityBuild/Build/UnityBuild.data.br",
      frameworkUrl: "/UnityBuild/Build/UnityBuild.framework.js.br",
      codeUrl:      "/UnityBuild/Build/UnityBuild.wasm.br",
    });

  webglRef.sendMessage = sendMessage;

  const filtered = FURNITURE_ITEMS.filter(item =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (item: typeof FURNITURE_ITEMS[0]) => {
    setSelectedId(item.id);
    sendMessage("FurnitureManager", "SelectFurniture", item.name);
  };

  const pct = Math.round(loadingProgression * 100);

  return (
    <>
      <style>{`
        /* ─── EDITOR ─── */
        .editor {
          flex: 1;
          position: relative;
          overflow: hidden;
          background: var(--obsidian);
        }

        /* Unity canvas fills everything */
        .editor-unity {
          position: absolute;
          inset: 12px;
          border-radius: 10px;
          overflow: hidden;
          border: 1px solid var(--seam);
          background: #050a12;
          box-shadow: inset 0 0 80px rgba(0,0,0,0.7);
        }

        /* ember corner accents on canvas frame */
        .editor-unity::before,
        .editor-unity::after {
          content: '';
          position: absolute;
          width: 22px; height: 22px;
          z-index: 5;
          pointer-events: none;
        }
        .editor-unity::before {
          top: 0; left: 0;
          border-top: 2px solid var(--ember);
          border-left: 2px solid var(--ember);
          border-top-left-radius: 10px;
          box-shadow: -2px -2px 10px rgba(212,98,42,0.28);
        }
        .editor-unity::after {
          bottom: 0; right: 0;
          border-bottom: 2px solid var(--ember);
          border-right: 2px solid var(--ember);
          border-bottom-right-radius: 10px;
          box-shadow: 2px 2px 10px rgba(212,98,42,0.28);
        }

        .editor-canvas {
          width: 100%;
          height: 100%;
          display: block;
        }

        /* ── Loading overlay ── */
        .editor-loading {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: var(--obsidian-mid);
          gap: 18px;
          z-index: 10;
        }

        .editor-loading-ring {
          animation: spin-slow 8s linear infinite;
        }

        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }

        .editor-loading-label {
          font-family: 'DM Sans', sans-serif;
          font-size: 10px;
          font-weight: 500;
          letter-spacing: 0.32em;
          text-transform: uppercase;
          color: var(--text-muted);
        }

        .editor-progress-track {
          width: 180px; height: 2px;
          background: var(--seam);
          border-radius: 2px;
          overflow: hidden;
        }

        .editor-progress-fill {
          height: 100%;
          background: linear-gradient(90deg, var(--ember), var(--ember-glow));
          border-radius: 2px;
          box-shadow: 0 0 8px var(--ember);
          transition: width 0.4s ease;
        }

        .editor-progress-pct {
          font-family: 'Cormorant Garamond', serif;
          font-size: 36px;
          font-weight: 600;
          letter-spacing: 0.06em;
          color: var(--text);
          line-height: 1;
        }

        /* ── Status bar ── */
        .editor-statusbar {
          position: absolute;
          bottom: 0; left: 0; right: 0;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 14px;
          background: rgba(8,12,20,0.85);
          backdrop-filter: blur(12px);
          border-top: 1px solid var(--seam);
          z-index: 4;
        }

        .editor-statusbar-left,
        .editor-statusbar-right {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .editor-status-item {
          font-family: 'DM Sans', sans-serif;
          font-size: 9.5px;
          font-weight: 400;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--text-muted);
          display: flex;
          align-items: center;
          gap: 5px;
        }

        .editor-status-dot {
          width: 5px; height: 5px;
          border-radius: 50%;
          background: #3adb76;
          box-shadow: 0 0 6px #3adb76;
          animation: status-beat 2.5s ease-in-out infinite;
        }

        @keyframes status-beat {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.35; }
        }

        .editor-status-sep {
          width: 1px; height: 12px;
          background: var(--seam-bright);
        }

        /* ─── FLOATING GLASS SIDEBAR ─── */
        .editor-sidebar {
          position: absolute;
          top: 24px;
          right: 24px;
          bottom: 50px;
          width: 296px;
          z-index: 20;
          display: flex;
          flex-direction: column;
          border-radius: 12px;
          overflow: hidden;
          border: 1px solid rgba(255,255,255,0.07);
          box-shadow:
            0 0 0 1px rgba(212,98,42,0.1),
            0 12px 52px rgba(0,0,0,0.6),
            inset 0 1px 0 rgba(255,255,255,0.06);
        }

        /* glass backing */
        .editor-sidebar::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(160deg,
            rgba(18,28,46,0.78) 0%,
            rgba(9,15,26,0.92) 100%);
          backdrop-filter: blur(28px) saturate(1.6);
          -webkit-backdrop-filter: blur(28px) saturate(1.6);
          z-index: 0;
        }

        /* ember glow top edge */
        .editor-sidebar::after {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0; height: 1px;
          background: linear-gradient(90deg,
            transparent, rgba(212,98,42,0.8) 50%, transparent);
          box-shadow: 0 0 14px rgba(212,98,42,0.35);
          z-index: 1;
        }

        .editor-sidebar > * { position: relative; z-index: 2; }

        /* ── Sidebar header ── */
        .sidebar-header {
          padding: 14px 14px 12px;
          border-bottom: 1px solid rgba(255,255,255,0.055);
          flex-shrink: 0;
        }

        .sidebar-title-text {
          font-family: 'Cormorant Garamond', serif;
          font-size: 17px;
          font-weight: 600;
          letter-spacing: 0.12em;
          color: var(--text);
          text-transform: uppercase;
          display: block;
          margin-bottom: 11px;
        }

        /* search bar */
        .sidebar-search {
          display: flex;
          align-items: center;
          gap: 9px;
          padding: 9px 12px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 7px;
          transition: border-color 0.2s, box-shadow 0.2s;
        }

        .sidebar-search:focus-within {
          border-color: rgba(212,98,42,0.5);
          box-shadow: 0 0 0 2px rgba(212,98,42,0.09);
        }

        .sidebar-search svg {
          width: 14px; height: 14px;
          stroke: var(--ice-dim); fill: none;
          stroke-width: 2; stroke-linecap: round; stroke-linejoin: round;
          flex-shrink: 0;
          transition: stroke 0.2s;
        }

        .sidebar-search:focus-within svg { stroke: var(--ember-glow); }

        .sidebar-search input {
          flex: 1;
          background: none;
          border: none;
          outline: none;
          font-family: 'DM Sans', sans-serif;
          font-size: 12.5px;
          font-weight: 400;
          color: var(--text);
        }

        .sidebar-search input::placeholder { color: var(--text-muted); }

        /* ── Scrollable item list ── */
        .sidebar-list {
          flex: 1;
          overflow-y: auto;
          overflow-x: hidden;
          padding: 10px 10px;
          display: flex;
          flex-direction: column;
          gap: 5px;
          /* ensure it scrolls, not the sidebar */
          min-height: 0;
        }

        .sidebar-list::-webkit-scrollbar { width: 3px; }
        .sidebar-list::-webkit-scrollbar-track { background: transparent; }
        .sidebar-list::-webkit-scrollbar-thumb {
          background: var(--seam-bright);
          border-radius: 2px;
        }
        .sidebar-list::-webkit-scrollbar-thumb:hover {
          background: var(--ember);
        }

        /* ── Furniture item ── */
        .sidebar-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 12px;
          border-radius: 8px;
          background: rgba(255,255,255,0.025);
          border: 1px solid rgba(255,255,255,0.05);
          cursor: pointer;
          transition: background 0.18s, border-color 0.18s, transform 0.15s, box-shadow 0.18s;
          position: relative;
          overflow: hidden;
          flex-shrink: 0;
        }

        /* left accent bar */
        .sidebar-item::before {
          content: '';
          position: absolute;
          left: 0; top: 0; bottom: 0;
          width: 2px;
          background: var(--ember);
          transform: scaleY(0);
          transform-origin: center;
          transition: transform 0.22s cubic-bezier(0.34,1.56,0.64,1);
          border-radius: 0 1px 1px 0;
          box-shadow: 2px 0 8px rgba(212,98,42,0.4);
        }

        .sidebar-item:hover {
          background: rgba(255,255,255,0.055);
          border-color: rgba(212,98,42,0.22);
          transform: translateX(3px);
        }

        .sidebar-item:hover::before,
        .sidebar-item.selected::before { transform: scaleY(1); }

        .sidebar-item.selected {
          background: rgba(212,98,42,0.07);
          border-color: rgba(212,98,42,0.32);
          box-shadow: 0 0 18px rgba(212,98,42,0.09);
        }

        /* icon thumbnail */
        .sidebar-item-icon {
          width: 52px; height: 46px;
          border-radius: 7px;
          background: rgba(255,255,255,0.035);
          border: 1px solid rgba(255,255,255,0.07);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: border-color 0.2s, background 0.2s;
        }

        .sidebar-item:hover .sidebar-item-icon,
        .sidebar-item.selected .sidebar-item-icon {
          border-color: rgba(212,98,42,0.28);
          background: rgba(212,98,42,0.06);
        }

        .sidebar-item-icon svg {
          width: 22px; height: 22px;
          stroke: var(--ice-dim); fill: none;
          stroke-width: 1.4; stroke-linecap: round; stroke-linejoin: round;
          transition: stroke 0.2s;
        }

        .sidebar-item:hover .sidebar-item-icon svg,
        .sidebar-item.selected .sidebar-item-icon svg {
          stroke: var(--ember-glow);
        }

        /* name */
        .sidebar-item-name {
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          font-weight: 500;
          color: var(--text);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          flex: 1;
        }

        /* add button */
        .sidebar-item-add {
          width: 26px; height: 26px;
          border-radius: 5px;
          border: 1px solid rgba(255,255,255,0.09);
          background: transparent;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
          color: var(--text-muted);
          flex-shrink: 0;
          font-size: 17px;
          line-height: 1;
          transition: all 0.2s;
        }

        .sidebar-item:hover .sidebar-item-add,
        .sidebar-item.selected .sidebar-item-add {
          background: var(--ember-dim);
          border-color: rgba(212,98,42,0.4);
          color: var(--ember-glow);
          box-shadow: 0 0 8px rgba(212,98,42,0.2);
        }
      `}</style>

      <div className="editor">
        {/* Unity — full bleed */}
        <div className="editor-unity">
          {!isLoaded && (
            <div className="editor-loading">
              <svg
                className="editor-loading-ring"
                width="54" height="54" viewBox="0 0 54 54" fill="none"
              >
                <polygon
                  points="27,3 51,15 51,39 27,51 3,39 3,15"
                  stroke="#d4622a" strokeWidth="1.5" fill="rgba(212,98,42,0.05)"
                />
                <polygon
                  points="27,11 43,20 43,34 27,43 11,34 11,20"
                  stroke="#a8c4d8" strokeWidth="0.8" fill="none" strokeDasharray="3 3"
                />
                <circle cx="27" cy="27" r="4" fill="#d4622a" opacity="0.85" />
              </svg>
              <span className="editor-progress-pct">{pct}%</span>
              <div className="editor-progress-track">
                <div className="editor-progress-fill" style={{ width: `${pct}%` }} />
              </div>
              <span className="editor-loading-label">Initializing Engine</span>
            </div>
          )}

          <Unity unityProvider={unityProvider} className="editor-canvas" />

          {/* Status bar */}
          <div className="editor-statusbar">
            <div className="editor-statusbar-left">
              <span className="editor-status-item">
                <span className="editor-status-dot" />
                Engine {isLoaded ? "Ready" : "Loading"}
              </span>
              <span className="editor-status-sep" />
              <span className="editor-status-item">
                {selectedId
                  ? `Selected — ${FURNITURE_ITEMS.find(i => i.id === selectedId)?.name}`
                  : "No item selected"}
              </span>
            </div>
            <div className="editor-statusbar-right">
              <span className="editor-status-item">House Inventory</span>
            </div>
          </div>
        </div>

        {/* Floating glass sidebar */}
        <div className="editor-sidebar">
          <div className="sidebar-header">
            <span className="sidebar-title-text">Search For Furniture</span>
            <div className="sidebar-search">
              <svg viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="7" />
                <line x1="16.5" y1="16.5" x2="22" y2="22" />
              </svg>
              <input
                placeholder="Search furniture..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="sidebar-list">
            {filtered.map(item => (
              <div
                key={item.id}
                className={`sidebar-item${selectedId === item.id ? " selected" : ""}`}
                onClick={() => handleSelect(item)}
              >
                <div className="sidebar-item-icon">
                  <svg viewBox="0 0 24 24">
                    <path d={item.icon} />
                  </svg>
                </div>
                <span className="sidebar-item-name">{item.name}</span>
                <button
                  className="sidebar-item-add"
                  onClick={e => { e.stopPropagation(); handleSelect(item); }}
                  aria-label={`Add ${item.name}`}
                >+</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default Editor;