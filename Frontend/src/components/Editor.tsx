import { Unity, useUnityContext } from "react-unity-webgl";
import Form from "./form";

function Editor() {
    const { unityProvider, loadingProgression, isLoaded } = useUnityContext({
        loaderUrl: "/UnityBuild/Build/UnityBuild.loader.js", // Note the extra /Build/ folder
        dataUrl: "/UnityBuild/Build/UnityBuild.data.br",
        frameworkUrl: "/UnityBuild/Build/UnityBuild.framework.js.br",
        codeUrl: "/UnityBuild/Build/UnityBuild.wasm.br",
    });

    return (
        <>
            <div style={{ width: "100%", height: "100vh" }}>
                {!isLoaded && (
                    <div
                        style={{
                            position: "absolute",
                            top: "50%",
                            left: "50%",
                            transform: "translate(-50%, -50%)",
                        }}
                    >
                        <p>
                            Loading Unity...{" "}
                            {Math.round(loadingProgression * 100)}%
                        </p>
                    </div>
                )}
                <Unity
                    unityProvider={unityProvider}
                    style={{ width: "100%", height: "100%" }}
                />
            </div>
            <Form />
        </>
    );
}
export default Editor;
