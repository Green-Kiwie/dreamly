using UnityEngine;
using UnityEngine.InputSystem;

[RequireComponent(typeof(CharacterController))]
public class PlayerMovement : MonoBehaviour
{
    [SerializeField] private float moveSmoothTime = 0.08f;
    [SerializeField] private float gravityStrength = 20f;
    [SerializeField] private float jumpStrength = 7f;
    [SerializeField] private float walkSpeed = 4f;
    [SerializeField] private float runSpeed = 7f;

    private CharacterController controller;
    private Vector3 currentMoveVelocity;
    private Vector3 moveDampVelocity;
    private Vector3 currentForceVelocity;

    private InputAction moveAction;
    private InputAction runAction;
    private InputAction jumpAction;

    private void Awake()
    {
        controller = GetComponent<CharacterController>();

        moveAction = new InputAction("Move", InputActionType.Value);
        moveAction.AddCompositeBinding("2DVector")
            .With("Up", "<Keyboard>/w")
            .With("Down", "<Keyboard>/s")
            .With("Left", "<Keyboard>/a")
            .With("Right", "<Keyboard>/d");
        moveAction.AddBinding("<Gamepad>/leftStick");

        runAction = new InputAction("Run", InputActionType.Button);
        runAction.AddBinding("<Keyboard>/leftShift");
        runAction.AddBinding("<Gamepad>/leftStickPress");

        jumpAction = new InputAction("Jump", InputActionType.Button);
        jumpAction.AddBinding("<Keyboard>/space");
        jumpAction.AddBinding("<Gamepad>/buttonSouth");
    }

    private void OnEnable()
    {
        moveAction.Enable();
        runAction.Enable();
        jumpAction.Enable();
    }

    private void OnDisable()
    {
        moveAction.Disable();
        runAction.Disable();
        jumpAction.Disable();
    }

    private void Update()
    {
        Vector2 input = moveAction.ReadValue<Vector2>();
        Vector3 playerInput = new Vector3(input.x, 0f, input.y);

        if (playerInput.sqrMagnitude > 1f)
        {
            playerInput.Normalize();
        }

        Vector3 moveVector = transform.TransformDirection(playerInput);
        float currentSpeed = runAction.IsPressed() ? runSpeed : walkSpeed;

        currentMoveVelocity = Vector3.SmoothDamp(
          currentMoveVelocity,
          moveVector * currentSpeed,
          ref moveDampVelocity,
          moveSmoothTime
        );

        if (controller.isGrounded)
        {
            currentForceVelocity.y = -2f;

            if (jumpAction.WasPressedThisFrame())
            {
                currentForceVelocity.y = jumpStrength;
            }
        }
        else
        {
            currentForceVelocity.y -= gravityStrength * Time.deltaTime;
        }

        Vector3 finalVelocity = currentMoveVelocity + currentForceVelocity;
        controller.Move(finalVelocity * Time.deltaTime);
    }
}