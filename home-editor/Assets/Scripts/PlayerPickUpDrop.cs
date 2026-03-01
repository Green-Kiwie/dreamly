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

    private GameObject heldObject;
    private Rigidbody heldRigidbody;
    private Collider[] heldColliders; // NEW: Array to store the object's colliders

    private void Update()
    {
        if (Keyboard.current.eKey.wasPressedThisFrame)
        {
            if (heldObject == null) TryPickUp();
            else Drop();
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

            // NEW: Get all colliders on the object (and any child objects it might have)
            heldColliders = heldObject.GetComponentsInChildren<Collider>();

            if (heldRigidbody != null)
            {
                heldRigidbody.useGravity = false;
                heldRigidbody.isKinematic = false;
            }

            // NEW: Disable all colliders so it passes through everything
            foreach (Collider col in heldColliders)
            {
                col.enabled = false;
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

        // NEW: Re-enable all colliders so it behaves normally again
        if (heldColliders != null)
        {
            foreach (Collider col in heldColliders)
            {
                col.enabled = true;
            }
        }

        heldObject = null;
        heldRigidbody = null;
        heldColliders = null; // NEW: Clear the array
    }
}