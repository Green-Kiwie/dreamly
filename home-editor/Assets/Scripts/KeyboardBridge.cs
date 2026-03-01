using UnityEngine;

public class KeyboardBridge : MonoBehaviour
{
    public static bool InputBlocked = false;

    public void InputDisable(string _)
    {
        InputBlocked = true;
#if UNITY_WEBGL && !UNITY_EDITOR
        WebGLInput.captureAllKeyboardInput = false;
#endif
    }

    public void InputEnable(string _)
    {
        InputBlocked = false;
#if UNITY_WEBGL && !UNITY_EDITOR
        WebGLInput.captureAllKeyboardInput = true;
#endif
    }

    void OnApplicationFocus(bool hasFocus)
    {
        if (!hasFocus)
        {
            // Tell the browser to remove focus from the canvas
#if UNITY_WEBGL && !UNITY_EDITOR
        WebGLInput.captureAllKeyboardInput = false;
#endif
        }
    }
}