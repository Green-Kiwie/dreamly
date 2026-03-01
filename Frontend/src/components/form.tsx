import { useState, useRef } from "react";
import { webglRef } from "./Editor";

interface Furniture {
  name:  string;
  price: number;
  link:  string;
  image: string;
  id:    string;
  from:  string;
}

export default function Form() {
  const [query,      setQuery]      = useState("");
  const [picture,    setPicture]    = useState("");
  const [results,    setResults]    = useState<Furniture[]>([]);
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [fileName,   setFileName]   = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => setPicture(reader.result as string);
    reader.readAsDataURL(file);
  };

  const runSearch = async () => {
    if (!query && !picture) return;
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/search`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image_b64: picture || null,
          text:      query   || null,
        }),
      });
      if (!response.ok) throw new Error(`Server error: ${response.status}`);
      const data = await response.json();
      setResults(data.results ?? []);
    } catch (err: any) {
      console.error("Search error:", err);
      setError("Search failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") runSearch();
  };

  const handleSelect = (item: Furniture) => {
    setSelectedId(item.id);
    webglRef.sendMessage?.("FurnitureManager", "SelectFurniture", item.name);
  };

  const clearImage = () => {
    setPicture("");
    setFileName("");
    if (fileRef.current) fileRef.current.value = "";
  };



  return (
    <>
      <style>{`
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
          pointer-events: auto;
          isolation: isolate;
        }

        /* glass backing — pointer-events none so it never intercepts clicks/focus */
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
          pointer-events: none;
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
          pointer-events: none;
        }

        .editor-sidebar > * { position: relative; z-index: 2; }

        /* ── Header ── */
        .sidebar-header {
          padding: 14px 14px 12px;
          border-bottom: 1px solid rgba(255,255,255,0.055);
          flex-shrink: 0;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .sidebar-title-text {
          font-family: 'Cormorant Garamond', serif;
          font-size: 17px;
          font-weight: 600;
          letter-spacing: 0.12em;
          color: var(--text);
          text-transform: uppercase;
          display: block;
        }

        /* text search row */
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
          pointer-events: auto;
          position: relative;
          z-index: 3;
        }

        .sidebar-search input::placeholder { color: var(--text-muted); }

        /* submit arrow button */
        .sidebar-search-btn {
          background: none;
          border: none;
          padding: 0;
          cursor: pointer;
          color: var(--text-muted);
          display: flex;
          align-items: center;
          transition: color 0.2s;
          flex-shrink: 0;
        }
        .sidebar-search-btn:hover { color: var(--ember-glow); }
        .sidebar-search-btn svg {
          width: 13px; height: 13px;
          stroke: currentColor; fill: none;
          stroke-width: 2.5; stroke-linecap: round; stroke-linejoin: round;
        }

        /* image upload row */
        .sidebar-upload {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .sidebar-upload-btn {
          flex: 1;
          display: flex;
          align-items: center;
          gap: 7px;
          padding: 7px 11px;
          background: rgba(255,255,255,0.03);
          border: 1px dashed rgba(255,255,255,0.12);
          border-radius: 7px;
          cursor: pointer;
          transition: border-color 0.2s, background 0.2s;
          min-width: 0;
        }

        .sidebar-upload-btn:hover {
          border-color: rgba(212,98,42,0.4);
          background: rgba(212,98,42,0.04);
        }

        .sidebar-upload-btn svg {
          width: 13px; height: 13px;
          stroke: var(--ice-dim); fill: none;
          stroke-width: 2; stroke-linecap: round; stroke-linejoin: round;
          flex-shrink: 0;
        }

        .sidebar-upload-label {
          font-family: 'DM Sans', sans-serif;
          font-size: 11px;
          color: var(--text-muted);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .sidebar-upload-clear {
          width: 24px; height: 24px;
          border-radius: 5px;
          border: 1px solid rgba(255,255,255,0.1);
          background: transparent;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
          color: var(--text-muted);
          font-size: 14px;
          line-height: 1;
          flex-shrink: 0;
          transition: all 0.2s;
        }
        .sidebar-upload-clear:hover {
          background: rgba(212,98,42,0.12);
          border-color: rgba(212,98,42,0.4);
          color: var(--ember-glow);
        }

        .sidebar-file-input { display: none; }

        /* ── States: loading / error / empty ── */
        .sidebar-state {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 12px;
          padding: 24px 20px;
        }

        .sidebar-state-icon { opacity: 0.2; }

        .sidebar-state-text {
          font-family: 'DM Sans', sans-serif;
          font-size: 11px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--text-muted);
          text-align: center;
          line-height: 1.7;
        }

        .sidebar-spinner {
          width: 32px; height: 32px;
          border: 2px solid rgba(212,98,42,0.15);
          border-top-color: var(--ember);
          border-radius: 50%;
          animation: spin 0.9s linear infinite;
        }

        @keyframes spin { to { transform: rotate(360deg); } }

        .sidebar-error {
          font-family: 'DM Sans', sans-serif;
          font-size: 11px;
          color: #e05555;
          letter-spacing: 0.1em;
          text-align: center;
        }

        /* ── Scrollable results list ── */
        .sidebar-list {
          flex: 1;
          overflow-y: auto;
          overflow-x: hidden;
          padding: 8px 10px;
          display: flex;
          flex-direction: column;
          gap: 5px;
          min-height: 0;
        }

        .sidebar-list::-webkit-scrollbar { width: 3px; }
        .sidebar-list::-webkit-scrollbar-track { background: transparent; }
        .sidebar-list::-webkit-scrollbar-thumb {
          background: var(--seam-bright);
          border-radius: 2px;
        }
        .sidebar-list::-webkit-scrollbar-thumb:hover { background: var(--ember); }

        /* ── Result item ── */
        .sidebar-item {
          display: flex;
          align-items: center;
          gap: 11px;
          padding: 9px 11px;
          border-radius: 8px;
          background: rgba(255,255,255,0.025);
          border: 1px solid rgba(255,255,255,0.05);
          cursor: pointer;
          transition: background 0.18s, border-color 0.18s, transform 0.15s;
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

        /* product image thumbnail */
        .sidebar-item-thumb {
          width: 52px; height: 46px;
          border-radius: 7px;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.08);
          overflow: hidden;
          flex-shrink: 0;
          transition: border-color 0.2s;
        }

        .sidebar-item:hover .sidebar-item-thumb,
        .sidebar-item.selected .sidebar-item-thumb {
          border-color: rgba(212,98,42,0.28);
        }

        .sidebar-item-thumb img {
          width: 100%; height: 100%;
          object-fit: cover;
          display: block;
        }

        /* text */
        .sidebar-item-info {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        .sidebar-item-name {
          font-family: 'DM Sans', sans-serif;
          font-size: 12px;
          font-weight: 500;
          color: var(--text);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          line-height: 1.3;
        }

        .sidebar-item-meta {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .sidebar-item-price {
          font-family: 'DM Sans', sans-serif;
          font-size: 11px;
          font-weight: 600;
          color: var(--ember-glow);
        }

        .sidebar-item-from {
          font-family: 'DM Sans', sans-serif;
          font-size: 10px;
          color: var(--text-muted);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        /* external link button */
        .sidebar-item-link {
          width: 26px; height: 26px;
          border-radius: 5px;
          border: 1px solid rgba(255,255,255,0.09);
          background: transparent;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
          color: var(--text-muted);
          flex-shrink: 0;
          transition: all 0.2s;
          text-decoration: none;
        }

        .sidebar-item-link svg {
          width: 12px; height: 12px;
          stroke: currentColor; fill: none;
          stroke-width: 2; stroke-linecap: round; stroke-linejoin: round;
        }

        .sidebar-item:hover .sidebar-item-link,
        .sidebar-item.selected .sidebar-item-link {
          background: var(--ember-dim);
          border-color: rgba(212,98,42,0.4);
          color: var(--ember-glow);
          box-shadow: 0 0 8px rgba(212,98,42,0.2);
        }
      `}</style>

      <div
        className="editor-sidebar"
        onKeyDown={e => e.stopPropagation()}
        onKeyUp={e => e.stopPropagation()}
        onKeyPress={e => e.stopPropagation()}
      >
        {/* Header: title + text search + image upload */}
        <div className="sidebar-header">
          <span className="sidebar-title-text">Search For Furniture</span>

          <div className="sidebar-search">
            <svg viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="7" />
              <line x1="16.5" y1="16.5" x2="22" y2="22" />
            </svg>
            <input
              placeholder="Describe furniture..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button
              className="sidebar-search-btn"
              onClick={runSearch}
              aria-label="Search"
            >
              <svg viewBox="0 0 24 24">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>

          <div className="sidebar-upload">
            <div
              className="sidebar-upload-btn"
              onClick={() => fileRef.current?.click()}
            >
              <svg viewBox="0 0 24 24">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
              <span className="sidebar-upload-label">
                {fileName || "Upload image..."}
              </span>
            </div>
            {picture && (
              <button
                className="sidebar-upload-clear"
                onClick={clearImage}
                aria-label="Remove image"
              >×</button>
            )}
            <input
              ref={fileRef}
              className="sidebar-file-input"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
            />
          </div>
        </div>

        {/* Body */}
        {loading ? (
          <div className="sidebar-state">
            <div className="sidebar-spinner" />
            <span className="sidebar-state-text">Searching...</span>
          </div>
        ) : error ? (
          <div className="sidebar-state">
            <span className="sidebar-error">{error}</span>
          </div>
        ) : results.length === 0 ? (
          <div className="sidebar-state">
            <svg
              className="sidebar-state-icon"
              width="40" height="40" viewBox="0 0 24 24"
              fill="none" stroke="#a8c4d8"
              strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <span className="sidebar-state-text">
              Enter a description or upload<br />an image to find furniture
            </span>
          </div>
        ) : (
          <div className="sidebar-list">
            {results.map(item => (
              <div
                key={item.id}
                className={`sidebar-item${selectedId === item.id ? " selected" : ""}`}
                onClick={() => handleSelect(item)}
              >
                <div className="sidebar-item-thumb">
                  <img
                    src={item.image}
                    alt={item.name}
                    onError={e => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                </div>
                <div className="sidebar-item-info">
                  <span className="sidebar-item-name">{item.name}</span>
                  <div className="sidebar-item-meta">
                    <span className="sidebar-item-price">${item.price.toFixed(2)}</span>
                    <span className="sidebar-item-from">{item.from}</span>
                  </div>
                </div>
                <a
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="sidebar-item-link"
                  onClick={e => e.stopPropagation()}
                  aria-label={`Open ${item.name}`}
                >
                  <svg viewBox="0 0 24 24">
                    <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
                    <polyline points="15 3 21 3 21 9" />
                    <line x1="10" y1="14" x2="21" y2="3" />
                  </svg>
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}