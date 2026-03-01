using System;
using System.Collections;
using System.Collections.Generic;
using System.Threading.Tasks;
using UnityEngine;
using GLTFast;
using GLTFast.Materials;

public class ModelLoader : MonoBehaviour
{
    private List<GameObject> loadedModels = new List<GameObject>();

    [Header("Spawn Settings")]
    [SerializeField] private Transform handLocation;
    [SerializeField] private string spawnedModelLayerName = "holdLayer";

    public void LoadGLB(string base64String)
    {
        try
        {
            if (base64String.Contains(","))
            {
                base64String = base64String.Split(',')[1];
            }

            byte[] glbData = Convert.FromBase64String(base64String);
            Debug.Log($"GLB data received: {glbData.Length} bytes");

            _ = LoadGLBAsync(glbData); // Fire and forget
        }
        catch (Exception e)
        {
            Debug.LogError($"Error decoding base64: {e.Message}");
        }
    }

    private async Task LoadGLBAsync(byte[] glbData)
    {
        // Create container for loaded model
        GameObject loadedModel = new GameObject("LoadedGLBModel_" + loadedModels.Count);
        loadedModel.transform.SetParent(transform);

        // Set position to hand location if assigned, otherwise default position
        if (handLocation != null)
        {
            // Get the current rotation angles of the hand
            Vector3 handEuler = handLocation.rotation.eulerAngles;
            
            // Force X and Z to 0 to keep it parallel to the ground, but keep the Y (yaw) direction
            Quaternion flatRotation = Quaternion.Euler(0, handEuler.y, 0);
            
            loadedModel.transform.SetPositionAndRotation(handLocation.position, flatRotation);
        }
        else
        {
            loadedModel.transform.position = new Vector3(0, 1, 0);
            loadedModel.transform.rotation = Quaternion.identity;
        }

        // Load GLB using GLTFast with Built-In RP material generator
        var materialGenerator = new BuiltInMaterialGenerator();
        GltfImport gltfImport = new GltfImport(materialGenerator: materialGenerator);

        bool loadSuccess;
        try
        {
            loadSuccess = await gltfImport.Load(glbData, new Uri("http://localhost/"));
        }
        catch (Exception e)
        {
            Debug.LogError($"GLB load failed: {e.Message}");
            Destroy(loadedModel);
            return;
        }

        if (loadSuccess)
        {
            // Wait for the instantiation task to finish so materials generate correctly
            bool instantiateSuccess = await gltfImport.InstantiateMainSceneAsync(loadedModel.transform);

            if (instantiateSuccess)
            {
                // Add Rigidbody matching your cube's inspector settings
                Rigidbody rb = loadedModel.AddComponent<Rigidbody>();
                rb.mass = 1f;
                rb.useGravity = true;
                rb.isKinematic = false;
                
                // Note: Depending on your exact Unity version, these might be called "drag" and "angularDrag" in code instead
                rb.linearDamping = 0f;     
                rb.angularDamping = 0.05f; 

                // Apply layer recursively
                int spawnedLayer = LayerMask.NameToLayer(spawnedModelLayerName);
                if (spawnedLayer == -1)
                {
                    Debug.LogWarning($"Layer '{spawnedModelLayerName}' does not exist. Model kept on default layer.");
                }
                else
                {
                    SetLayerRecursively(loadedModel, spawnedLayer);
                }

                // Add colliders to all meshes
                AddCollidersToModel(loadedModel);

                Debug.Log($"GLB #{loadedModels.Count} loaded at {loadedModel.transform.position} on layer '{spawnedModelLayerName}'");
            }
            else
            {
                Debug.LogError("Failed to instantiate the GLB scene.");
            }
        }
        else
        {
            Debug.LogError("Failed to load GLB file");
        }

        loadedModels.Add(loadedModel);
    }

    public void ClearAllModels()
    {
        foreach (GameObject model in loadedModels)
        {
            Destroy(model);
        }
        loadedModels.Clear();
        Debug.Log("All models cleared");
    }

    private void SetLayerRecursively(GameObject target, int layer)
    {
        target.layer = layer;
        foreach (Transform child in target.transform)
        {
            SetLayerRecursively(child.gameObject, layer);
        }
    }

    private void AddCollidersToModel(GameObject model)
    {
        MeshRenderer[] renderers = model.GetComponentsInChildren<MeshRenderer>();
        foreach (MeshRenderer renderer in renderers)
        {
            MeshFilter meshFilter = renderer.GetComponent<MeshFilter>();
            if (meshFilter != null && meshFilter.sharedMesh != null)
            {
                MeshCollider collider = renderer.gameObject.AddComponent<MeshCollider>();
                collider.convex = true;
            }
        }
    }
}