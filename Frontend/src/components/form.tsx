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
  const [picture,    setPicture]    = useState("");      // base64 data URL
  const [fileName,   setFileName]   = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [results,    setResults]    = useState<Furniture[]>([]);
  const [loading,    setLoading]    = useState<"search" | "generate" | null>(null);
  const [error,      setError]      = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // ── Image handling ──────────────────────────────────────────────
  const loadFile = (file: File) => {
    if (!file.type.startsWith("image/")) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => setPicture(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) loadFile(file);
  };

  const clearImage = () => {
    setPicture("");
    setFileName("");
    setError("");
    if (fileRef.current) fileRef.current.value = "";
  };

  // ── Drag and drop ───────────────────────────────────────────────
  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) loadFile(file);
  };

  // ── Search (text or image → /api/search) ────────────────────────
  const runSearch = async () => {
    if (!query && !picture) return;
    setLoading("search");
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
      setLoading(null);
    }
  };

  // ── Generate 3-D model (image → /api/furniture/generate) ────────
  const runGenerate = async () => {
    if (!picture) return;
    setLoading("generate");
    setError("");
    try {
      // The generate endpoint expects multipart/form-data with an image file
      const blob      = await (await fetch(picture)).blob();
      const formData  = new FormData();
      formData.append("image", blob, fileName || "upload.png");

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/furniture/generate`,
        { method: "POST", body: formData }
      );
      if (!response.ok) throw new Error(`Server error: ${response.status}`);
      const data = await response.json();
      // Hand the generated GLB to Unity
      webglRef.sendMessage?.("FurnitureManager", "LoadGeneratedModel", data.model_base64);
    } catch (err: any) {
      console.error("Generate error:", err);
      setError("Generation failed. Please try again.");
    } finally {
      setLoading(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") runSearch();
  };

  const handleSelect = (item: Furniture) => {
    setSelectedId(item.id);
    webglRef.sendMessage?.("FurnitureManager", "SelectFurniture", item.name);
  };

  const isImageMode = !!picture;

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

        /* ── Text search row (hidden in image mode) ── */
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
          color: var(--text);
          pointer-events: auto;
          position: relative;
          z-index: 3;
        }

        .sidebar-search input::placeholder { color: var(--text-muted); }

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

        /* ── Drop zone (shown when NO image loaded) ── */
        .sidebar-dropzone {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 7px;
          padding: 14px 12px;
          background: rgba(255,255,255,0.025);
          border: 1.5px dashed rgba(255,255,255,0.12);
          border-radius: 8px;
          cursor: pointer;
          transition: border-color 0.2s, background 0.2s;
          text-align: center;
          min-height: 72px;
        }

        .sidebar-dropzone.dragging {
          border-color: var(--ember);
          background: rgba(212,98,42,0.07);
        }

        .sidebar-dropzone:hover {
          border-color: rgba(212,98,42,0.4);
          background: rgba(212,98,42,0.04);
        }

        .sidebar-dropzone svg {
          width: 20px; height: 20px;
          stroke: var(--ice-dim); fill: none;
          stroke-width: 1.5; stroke-linecap: round; stroke-linejoin: round;
          transition: stroke 0.2s;
        }

        .sidebar-dropzone.dragging svg,
        .sidebar-dropzone:hover svg { stroke: var(--ember-glow); }

        .sidebar-dropzone-label {
          font-family: 'DM Sans', sans-serif;
          font-size: 10.5px;
          color: var(--text-muted);
          line-height: 1.5;
        }

        .sidebar-dropzone-label strong {
          color: var(--ember-glow);
          font-weight: 500;
        }

        /* ── Image preview mode ── */
        .sidebar-preview {
          display: flex;
          flex-direction: column;
          gap: 9px;
        }

        .sidebar-preview-img-wrap {
          position: relative;
          border-radius: 8px;
          overflow: hidden;
          border: 1px solid rgba(255,255,255,0.1);
          background: rgba(0,0,0,0.3);
          width: 100%;
          height: 160px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .sidebar-preview-img {
          max-width: 100%;
          max-height: 160px;
          width: auto;
          height: auto;
          object-fit: contain;
          display: block;
        }

        .sidebar-preview-name {
          font-family: 'DM Sans', sans-serif;
          font-size: 10px;
          color: var(--text-muted);
          letter-spacing: 0.08em;
          text-overflow: ellipsis;
          overflow: hidden;
          white-space: nowrap;
        }

        /* action buttons row */
        .sidebar-preview-actions {
          display: flex;
          gap: 6px;
        }

        .sidebar-action-btn {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 5px;
          padding: 8px 6px;
          border-radius: 7px;
          border: 1px solid rgba(255,255,255,0.09);
          background: rgba(255,255,255,0.04);
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          font-size: 10px;
          font-weight: 500;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--text-muted);
          transition: all 0.2s;
        }

        .sidebar-action-btn svg {
          width: 12px; height: 12px;
          stroke: currentColor; fill: none;
          stroke-width: 2; stroke-linecap: round; stroke-linejoin: round;
          flex-shrink: 0;
        }

        .sidebar-action-btn:hover:not(:disabled) {
          border-color: rgba(212,98,42,0.45);
          background: rgba(212,98,42,0.08);
          color: var(--ember-glow);
        }

        .sidebar-action-btn:disabled {
          opacity: 0.45;
          cursor: not-allowed;
        }

        .sidebar-action-btn.loading {
          border-color: rgba(212,98,42,0.45);
          color: var(--ember-glow);
        }

        /* clear / deselect button */
        .sidebar-clear-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 5px;
          padding: 6px;
          border-radius: 6px;
          border: 1px solid rgba(255,255,255,0.07);
          background: transparent;
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          font-size: 9.5px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--text-muted);
          transition: all 0.2s;
        }

        .sidebar-clear-btn:hover {
          border-color: rgba(255,100,100,0.3);
          color: #e07070;
        }

        .sidebar-clear-btn svg {
          width: 11px; height: 11px;
          stroke: currentColor; fill: none;
          stroke-width: 2; stroke-linecap: round; stroke-linejoin: round;
        }

        /* mini spinner inside buttons */
        .btn-spinner {
          width: 11px; height: 11px;
          border: 1.5px solid rgba(212,98,42,0.25);
          border-top-color: var(--ember-glow);
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
          flex-shrink: 0;
        }

        @keyframes spin { to { transform: rotate(360deg); } }

        /* ── States ── */
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

        .sidebar-error {
          font-family: 'DM Sans', sans-serif;
          font-size: 11px;
          color: #e05555;
          letter-spacing: 0.1em;
          text-align: center;
        }

        /* ── Scrollable results ── */
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

        .sidebar-file-input { display: none; }
      `}</style>

      <div
        className="editor-sidebar"
        onKeyDown={e => e.stopPropagation()}
        onKeyUp={e => e.stopPropagation()}
        onKeyPress={e => e.stopPropagation()}
      >
        {/* ── Header ── */}
        <div className="sidebar-header">
          <span className="sidebar-title-text">Search For Furniture</span>

          {!isImageMode ? (
            <>
              {/* Text search — hidden once image is loaded */}
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

              {/* Drop zone — click or drag */}
              <div
                className={`sidebar-dropzone${isDragging ? " dragging" : ""}`}
                onClick={() => fileRef.current?.click()}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
              >
                <svg viewBox="0 0 24 24">
                  <polyline points="16 16 12 12 8 16" />
                  <line x1="12" y1="12" x2="12" y2="21" />
                  <path d="M20.39 18.39A5 5 0 0018 9h-1.26A8 8 0 103 16.3" />
                </svg>
                <span className="sidebar-dropzone-label">
                  <strong>Click to upload</strong> or drag &amp; drop<br />
                  an image here
                </span>
              </div>
            </>
          ) : (
            /* ── Image preview mode ── */
            <div className="sidebar-preview">
              <div className="sidebar-preview-img-wrap">
                <img
                  src={picture}
                  alt={fileName}
                  className="sidebar-preview-img"
                />
              </div>

              <span className="sidebar-preview-name">{fileName}</span>

              {/* Action buttons */}
              <div className="sidebar-preview-actions">
                {/* Search with image */}
                <button
                  className={`sidebar-action-btn${loading === "search" ? " loading" : ""}`}
                  onClick={runSearch}
                  disabled={loading !== null}
                  aria-label="Search with image"
                >
                  {loading === "search" ? (
                    <span className="btn-spinner" />
                  ) : (
                    <svg viewBox="0 0 24 24">
                      <circle cx="11" cy="11" r="7" />
                      <line x1="16.5" y1="16.5" x2="22" y2="22" />
                    </svg>
                  )}
                  Search
                </button>

                {/* Generate 3-D model */}
                <button
                  className={`sidebar-action-btn${loading === "generate" ? " loading" : ""}`}
                  onClick={runGenerate}
                  disabled={loading !== null}
                  aria-label="Generate 3D model"
                >
                  {loading === "generate" ? (
                    <span className="btn-spinner" />
                  ) : (
                    <svg viewBox="0 0 24 24">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                  )}
                  Generate
                </button>
              </div>

              {/* Clear / go back */}
              <button className="sidebar-clear-btn" onClick={clearImage}>
                <svg viewBox="0 0 24 24">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
                Remove image
              </button>
            </div>
          )}
        </div>

        {/* Hidden file input */}
        <input
          ref={fileRef}
          className="sidebar-file-input"
          type="file"
          accept="image/*"
          onChange={handleFileInput}
        />

        {/* ── Body: states + results ── */}
        {loading !== null ? (
          <div className="sidebar-state">
            <div className="sidebar-spinner" />
            <span className="sidebar-state-text">
              {loading === "generate" ? "Generating model..." : "Searching..."}
            </span>
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
              Describe furniture or upload<br />an image to find matches
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