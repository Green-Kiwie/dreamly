import React, { useEffect } from "react";
import { Unity, useUnityContext } from "react-unity-webgl";
import Form from "./form";

export const webglRef = { sendMessage: null as any };

const Editor: React.FC = () => {
  const { unityProvider, loadingProgression, isLoaded, sendMessage } =
    useUnityContext({
      loaderUrl:    "/UnityBuild/Build/UnityBuild.loader.js",
      dataUrl:      "/UnityBuild/Build/UnityBuild.data.br",
      frameworkUrl: "/UnityBuild/Build/UnityBuild.framework.js.br",
      codeUrl:      "/UnityBuild/Build/UnityBuild.wasm.br",
    });

  webglRef.sendMessage = sendMessage;

  useEffect(() => {
    const onFocusIn = (e: FocusEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") {
        // Tell Unity to release keyboard capture via the KeyboardBridge GameObject
        webglRef.sendMessage?.("Player", "InputDisable", "");
      }
    };

    const onFocusOut = (e: FocusEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") {
        // Restore Unity keyboard capture when the input loses focus
        webglRef.sendMessage?.("Player", "InputEnable", "");
      }
    };

    window.addEventListener("focusin",  onFocusIn  as EventListener, true);
    window.addEventListener("focusout", onFocusOut as EventListener, true);
    return () => {
      window.removeEventListener("focusin",  onFocusIn  as EventListener, true);
      window.removeEventListener("focusout", onFocusOut as EventListener, true);
    };
  }, []);

  const pct = Math.round(loadingProgression * 100);

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

        /* ─── EDITOR ─── */
        .editor {
          flex: 1;
          position: relative;
          overflow: hidden;
          background: var(--obsidian);
        }

        /* Unity frame fills the editor */
        .editor-unity {
          position: absolute;
          inset: 12px;
          border-radius: 10px;
          overflow: hidden;
          border: 1px solid var(--seam);
          background: #050a12;
          box-shadow: inset 0 0 80px rgba(0,0,0,0.7);
          z-index: 1;
        }

        /* Ensure the Unity canvas itself never intercepts pointer events
           that belong to overlaid UI elements like the sidebar */
        .editor-canvas {
          pointer-events: auto;
        }

        /* ember corner accents */
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
          pointer-events: auto;
        }

        /* Loading overlay */
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

        /* Status bar */
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
      `}</style>

      <div className="editor">
        {/* Unity — full bleed behind everything */}
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

          <div className="editor-statusbar">
            <div className="editor-statusbar-left">
              <span className="editor-status-item">
                <span className="editor-status-dot" />
                Engine {isLoaded ? "Ready" : "Loading"}
              </span>
              <span className="editor-status-sep" />
              <span className="editor-status-item">House Inventory</span>
            </div>
            <div className="editor-statusbar-right">
              <span className="editor-status-item">Dreamly Studio</span>
            </div>
          </div>
        </div>

        {/* Floating glass sidebar — rendered by Form */}
        <Form />
      </div>
    </>
  );
};

export default Editor;