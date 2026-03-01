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
    private bool pendingLockRequest = false;

    private void Awake()
    {
        lookAction = new InputAction("Look", InputActionType.Value);
        lookAction.AddBinding("<Mouse>/delta");
        lookAction.AddBinding("<Gamepad>/rightStick");
    }

    private void OnEnable()
    {
        lookAction.Enable();
        if (!InputBlocked)
        {
            RequestCursorLock();
        }
    }

    private void OnDisable()
    {
        lookAction.Disable();
        ReleaseCursorLock();
    }

    public void InputDisable(string _)
    {
        InputBlocked = true;
        inputEnabled = false;
        pendingLockRequest = false;
        ReleaseCursorLock();

#if UNITY_WEBGL && !UNITY_EDITOR
        WebGLInput.captureAllKeyboardInput = false;
#endif
    }

    public void InputEnable(string _)
    {
        InputBlocked = false;
        inputEnabled = true;

#if UNITY_WEBGL && !UNITY_EDITOR
        pendingLockRequest = true;
        WebGLInput.captureAllKeyboardInput = true;
#else
        RequestCursorLock();
#endif
    }

    private void OnApplicationFocus(bool hasFocus)
    {
        if (hasFocus)
        {
#if UNITY_WEBGL && !UNITY_EDITOR
            WebGLInput.captureAllKeyboardInput = inputEnabled && !InputBlocked;
#endif
            if (inputEnabled && !InputBlocked)
            {
                pendingLockRequest = true;
            }
        }
        else
        {
#if UNITY_WEBGL && !UNITY_EDITOR
            WebGLInput.captureAllKeyboardInput = false;
#endif
            ReleaseCursorLock();
        }
    }

    private void Update()
    {
        if (playerCamera == null) return;

        if (InputBlocked) return;

        if (Keyboard.current != null && Keyboard.current.escapeKey.wasPressedThisFrame)
        {
            inputEnabled = !inputEnabled;
            if (inputEnabled)
            {
                pendingLockRequest = true;
            }
            else
            {
                ReleaseCursorLock();
            }
        }

        if (!inputEnabled) return;

        if (Mouse.current != null && Mouse.current.leftButton.wasPressedThisFrame)
        {
            if (pendingLockRequest)
            {
                RequestCursorLock();
                pendingLockRequest = false;
            }
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

    private void RequestCursorLock()
    {
        Cursor.lockState = CursorLockMode.Locked;
        Cursor.visible = false;
    }

    private void ReleaseCursorLock()
    {
        Cursor.lockState = CursorLockMode.None;
        Cursor.visible = true;
    }
}