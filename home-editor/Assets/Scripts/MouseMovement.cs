using UnityEngine;
using UnityEngine.InputSystem;

public class MouseMovement : MonoBehaviour
{
    [SerializeField] private Transform playerCamera;
    [SerializeField] private Vector2 sensitivities = new Vector2(0.12f, 0.12f);

    private Vector2 xyRotation;
    private InputAction lookAction;

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

    private void Update()
    {
        if (playerCamera == null)
        {
            return;
        }

        Vector2 mouseInput = lookAction.ReadValue<Vector2>();

        xyRotation.x -= mouseInput.y * sensitivities.y;
        xyRotation.y += mouseInput.x * sensitivities.x;
        xyRotation.x = Mathf.Clamp(xyRotation.x, -90f, 90f);

        transform.localRotation = Quaternion.Euler(0f, xyRotation.y, 0f);
        playerCamera.localRotation = Quaternion.Euler(xyRotation.x, 0f, 0f);
    }
}