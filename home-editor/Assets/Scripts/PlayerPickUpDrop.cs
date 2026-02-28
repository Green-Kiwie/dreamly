using UnityEngine;
using UnityEngine.InputSystem;

public class PlayerPickUpDrop : MonoBehaviour
{
    [Header("Settings")]
    [SerializeField] private Transform playerCameraTransform;
    [SerializeField] private Transform holdParent; 
    [SerializeField] private LayerMask pickUpLayerMask;
    [SerializeField] private float pickUpDistance = 3f;

    private GameObject heldObject;
    private Rigidbody heldRigidbody;
    private Collider[] heldColliders; // Store colliders to toggle them

    private void Update()
    {
        if (Keyboard.current.eKey.wasPressedThisFrame)
        {
            if (heldObject == null) TryPickUp();
            else Drop();
        }
    }

    private void TryPickUp()
    {
        if (Physics.Raycast(playerCameraTransform.position, playerCameraTransform.forward, out RaycastHit raycastHit, pickUpDistance, pickUpLayerMask))
        {
            heldObject = raycastHit.collider.gameObject;
            heldRigidbody = heldObject.GetComponent<Rigidbody>();
            
            // Get all colliders on the object and its children
            heldColliders = heldObject.GetComponentsInChildren<Collider>();

            if (heldRigidbody != null)
            {
                // 1. Disable Physics
                heldRigidbody.useGravity = false;
                heldRigidbody.isKinematic = true;

                // 2. Disable Collisions (makes it go through objects)
                foreach (var col in heldColliders)
                {
                    col.enabled = false;
                }

                // 3. Snap to hand
                heldObject.transform.SetParent(holdParent);
                heldObject.transform.localPosition = Vector3.zero;
                heldObject.transform.localRotation = Quaternion.identity;
            }
        }
    }

    private void Drop()
    {
        if (heldObject == null) return;

        // 1. Re-enable Collisions
        foreach (var col in heldColliders)
        {
            col.enabled = true;
        }

        // 2. Restore Physics
        heldRigidbody.useGravity = true;
        heldRigidbody.isKinematic = false;

        // 3. Unparent
        heldObject.transform.SetParent(null);

        // 4. Clear references
        heldObject = null;
        heldRigidbody = null;
        heldColliders = null;
    }
}