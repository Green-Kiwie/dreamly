import React, { useEffect, useRef } from "react";
import type { ChangeEvent } from "react";
import { Unity, useUnityContext } from "react-unity-webgl";
import Form from "./form";

export const webglRef = { sendMessage: null as any };

const Editor: React.FC = () => {
    const inputRef = useRef<HTMLInputElement>(null);

    // Define the Unity configuration with explicit paths
    const { unityProvider, loadingProgression, isLoaded, sendMessage } =
        useUnityContext({
            loaderUrl: "/UnityBuild/Build/UnityBuild.loader.js",
            dataUrl: "/UnityBuild/Build/UnityBuild.data.br",
            frameworkUrl: "/UnityBuild/Build/UnityBuild.framework.js.br",
            codeUrl: "/UnityBuild/Build/UnityBuild.wasm.br",
        });

    // Store sendMessage so other files can access it
    webglRef.sendMessage = sendMessage;

    useEffect(() => {
        console.log("Editor: sendMessage ready:", !!sendMessage);
        console.log("Editor: isLoaded:", isLoaded);
    }, [isLoaded, sendMessage]);

    const handleInputFocus = () => {
        if (sendMessage) {
            // Call InputDisable on MouseMovement GameObject
            sendMessage("Player", "InputDisable", "");
        }
    };

    const handleInputBlur = () => {
        if (sendMessage) {
            // Call InputEnable on MouseMovement GameObject
            sendMessage("Player", "InputEnable", "");
        }
    };

    return (
        <div style={{ width: "80%", height: "50vh", position: "relative" }}>
            {/* Overlay Loader */}
            {!isLoaded && (
                <div
                    style={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        zIndex: 10,
                    }}
                >
                    <p>
                        Loading Engine... {Math.round(loadingProgression * 100)}
                        %
                    </p>
                </div>
            )}

            <Unity
                unityProvider={unityProvider}
                style={{ width: "100%", height: "100%" }}
            />

            <Form />
            <input
                ref={inputRef}
                type="text"
                placeholder="Search furniture..."
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
            />
        </div>
    );
};

export default Editor;
