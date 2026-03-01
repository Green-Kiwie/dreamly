using UnityEngine;
using UnityEngine.InputSystem;

public class PlayerPickUpDrop : MonoBehaviour
{
    [Header("Settings")]
    [SerializeField] private Transform playerCameraTransform;
    [SerializeField] private LayerMask pickUpLayerMask;
    [SerializeField] private LayerMask obstacleLayerMask; // Layers the object should NOT go through
    [SerializeField] private float pickUpDistance = 3f;
    [SerializeField] private float holdDistance = 2.5f;
    [SerializeField] private float moveSpeed = 15f;
    [SerializeField] private float rotationSpeed = 100f;
    [SerializeField] private string heldObjectLayerName = "holdLayer";

    private GameObject heldObject;
    private Rigidbody heldRigidbody;
    private int originalLayer;

    private bool inputEnabled = true;

    private void Update()
    {
        // Toggle input with Escape key
        if (Keyboard.current.escapeKey.wasPressedThisFrame)
        {
            inputEnabled = !inputEnabled;
        }

        // Only process input if enabled
        if (!inputEnabled)
        {
            return;
        }

        if (Keyboard.current.eKey.wasPressedThisFrame)
        {
            if (heldObject == null) TryPickUp();
            else Drop();
        }

        // Delete held object (works with both Delete and Backspace keys)
        if (heldObject != null && (Keyboard.current.deleteKey.wasPressedThisFrame || Keyboard.current.backspaceKey.wasPressedThisFrame))
        {
            DeleteHeldObject();
        }

        if (heldObject != null)
        {
            MoveObjectWithRaycast();
            HandleRotation();
        }
    }

    private void TryPickUp()
    {
        // Raycast to find an object to pick up
        if (Physics.Raycast(playerCameraTransform.position, playerCameraTransform.forward, out RaycastHit hit, pickUpDistance, pickUpLayerMask))
        {
            heldObject = hit.collider.gameObject;
            heldRigidbody = heldObject.GetComponent<Rigidbody>();

            // Store original layer
            originalLayer = heldObject.layer;

            if (heldRigidbody != null)
            {
                heldRigidbody.useGravity = false;
                heldRigidbody.isKinematic = true;
            }

            // Change layer to HeldObject (collides with environment, not player)
            int heldLayer = LayerMask.NameToLayer(heldObjectLayerName);
            if (heldLayer != -1)
            {
                SetLayerRecursively(heldObject, heldLayer);
            }
            else
            {
                Debug.LogWarning($"Layer '{heldObjectLayerName}' does not exist. Object may collide with player.");
            }
        }
    }

    private void MoveObjectWithRaycast()
    {
        float currentTargetDistance = holdDistance;

        if (Physics.Raycast(playerCameraTransform.position, playerCameraTransform.forward, out RaycastHit hit, holdDistance, obstacleLayerMask))
        {
            currentTargetDistance = Mathf.Clamp(hit.distance - 0.2f, 0.5f, holdDistance);
        }

        Vector3 targetPos = playerCameraTransform.position + (playerCameraTransform.forward * currentTargetDistance);
        heldObject.transform.position = Vector3.Lerp(heldObject.transform.position, targetPos, Time.deltaTime * moveSpeed);

        // Keep object level (only allow Y-axis rotation)
        Vector3 currentEuler = heldObject.transform.eulerAngles;
        heldObject.transform.rotation = Quaternion.Euler(0f, currentEuler.y, 0f);
    }

    private void HandleRotation()
    {
        float rotInput = 0f;
        if (Keyboard.current.qKey.isPressed) rotInput = -1f;
        if (Keyboard.current.rKey.isPressed) rotInput = 1f;

        heldObject.transform.Rotate(Vector3.up, rotInput * rotationSpeed * Time.deltaTime, Space.World);
    }

    private void Drop()
    {
        if (heldObject == null) return;

        if (heldRigidbody != null)
        {
            heldRigidbody.useGravity = false;
            heldRigidbody.isKinematic = false;
        }

        // Restore original layer
        SetLayerRecursively(heldObject, originalLayer);

        heldObject = null;
        heldRigidbody = null;
    }

    private void SetLayerRecursively(GameObject target, int layer)
    {
        target.layer = layer;
        foreach (Transform child in target.transform)
        {
            SetLayerRecursively(child.gameObject, layer);
        }
    }

    private void DeleteHeldObject()
    {
        if (heldObject == null) return;

        // Disable all colliders
        Collider[] colliders = heldObject.GetComponentsInChildren<Collider>();
        foreach (Collider col in colliders)
        {
            col.enabled = false;
        }

        // Disable all renderers to make invisible
        Renderer[] renderers = heldObject.GetComponentsInChildren<Renderer>();
        foreach (Renderer renderer in renderers)
        {
            renderer.enabled = false;
        }

        // Clear held object references
        heldObject = null;
        heldRigidbody = null;
    }
}