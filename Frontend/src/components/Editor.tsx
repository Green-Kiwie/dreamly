import React from "react";
import { Unity, useUnityContext } from "react-unity-webgl";
import Form from "./form";

export const webglRef = { sendMessage: null as any };

const Editor: React.FC = () => {
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

    return (
        <div style={{ width: "100%", height: "100vh", position: "relative", display: "flex" }}>
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
            <div style={{display: "grid", gridTemplateColumns: "67% 33%"}}>
                <Unity
                    unityProvider={unityProvider}
                    style={{ width: "100%", height: "100%" }}
                />

                <Form />
            </div>
        </div>
    );
};

export default Editor;
