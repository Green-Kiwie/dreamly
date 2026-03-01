using System.ComponentModel;
using System.Reflection;
using System.Runtime.CompilerServices;
using System.Security.AccessControl;
using UnityEngine;
using UnityEngine.InputSystem;

public class MouseMovement : MonoBehaviour
{
    [SerializeField] private Transform playerCamera;
    [SerializeField] private Vector2 sensitivities = new Vector2(0.12f, 0.12f);

    private Vector2 xyRotation;
    private InputAction lookAction;

    private bool inputEnabled = true;
    public static bool InputBlocked = false;

    private void Awake()
    {
        lookAction = new InputAction("Look", InputActionType.Value);
        lookAction.AddBinding("<Mouse>/delta");
        lookAction.AddBinding("<Gamepad>/rightStick");
    }

    private void OnEnable()
    {
        lookAction.Enable();
        Cursor.lockState = CursorLockMode.Locked;
        Cursor.visible = false;
    }

    private void OnDisable()
    {
        lookAction.Disable();
        Cursor.lockState = CursorLockMode.None;
        Cursor.visible = true;
    }

    public void InputDisable(string _)
    {
        InputBlocked = true;
        inputEnabled = false;
        Cursor.lockState = CursorLockMode.None;
        Cursor.visible = true;
#if UNITY_WEBGL && !UNITY_EDITOR
        WebGLInput.captureAllKeyboardInput = false;
#endif
    }

    public void InputEnable(string _)
    {
        InputBlocked = false;
        inputEnabled = true;
        Cursor.lockState = CursorLockMode.Locked;
        Cursor.visible = false;
#if UNITY_WEBGL && !UNITY_EDITOR
        WebGLInput.captureAllKeyboardInput = true;
#endif
    }

    void OnApplicationFocus(bool hasFocus)
    {
        if (!hasFocus)
        {
#if UNITY_WEBGL && !UNITY_EDITOR
            WebGLInput.captureAllKeyboardInput = false;
#endif
        }
    }

    private void Update()
    {
        if (playerCamera == null) return;

        // Don't process input if blocked by browser/HTML input
        if (InputBlocked)
        {
            return;
        }

        // Toggle input with Escape key
        if (Keyboard.current.escapeKey.wasPressedThisFrame)
        {
            inputEnabled = !inputEnabled;
            Cursor.lockState = inputEnabled ? CursorLockMode.Locked : CursorLockMode.None;
            Cursor.visible = !inputEnabled;
        }

        // Only process input if enabled
        if (!inputEnabled)
        {
            return;
        }

        if (Mouse.current.leftButton.wasPressedThisFrame)
        {
            Cursor.lockState = CursorLockMode.Locked;
            Cursor.visible = false;
        }

        if (Cursor.lockState == CursorLockMode.Locked)
        {
            Vector2 mouseInput = lookAction.ReadValue<Vector2>();

            xyRotation.x -= mouseInput.y * sensitivities.y;
            xyRotation.y += mouseInput.x * sensitivities.x;
            xyRotation.x = Mathf.Clamp(xyRotation.x, -90f, 90f);

            transform.localRotation = Quaternion.Euler(0f, xyRotation.y, 0f);
            playerCamera.localRotation = Quaternion.Euler(xyRotation.x, 0f, 0f);
        }
    }
}