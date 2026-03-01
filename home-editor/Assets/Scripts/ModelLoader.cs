using System;
using System.Collections;
using System.Collections.Generic;
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

            StartCoroutine(LoadGLBCoroutine(glbData));
        }
        catch (Exception e)
        {
            Debug.LogError($"Error decoding base64: {e.Message}");
        }
    }

    private IEnumerator LoadGLBCoroutine(byte[] glbData)
    {
        // Create container for loaded model
        GameObject loadedModel = new GameObject("LoadedGLBModel_" + loadedModels.Count);
        loadedModel.transform.SetParent(transform);

        // Set position to hand location if assigned, otherwise default position
        if (handLocation != null)
        {
            loadedModel.transform.SetPositionAndRotation(handLocation.position, handLocation.rotation);
        }
        else
        {
            loadedModel.transform.position = new Vector3(0, 1, 0);
            loadedModel.transform.rotation = Quaternion.identity;
        }

        // Load GLB using GLTFast with Built-In RP material generator
        var materialGenerator = new BuiltInMaterialGenerator();
        GltfImport gltfImport = new GltfImport(materialGenerator: materialGenerator);

        var loadTask = gltfImport.Load(glbData, new Uri("http://localhost/"));
        yield return new WaitUntil(() => loadTask.IsCompleted);

        if (loadTask.IsCanceled)
        {
            Debug.LogError("GLB load task was canceled.");
            Destroy(loadedModel);
            yield break;
        }

        if (loadTask.IsFaulted)
        {
            Debug.LogError($"GLB load task failed: {loadTask.Exception}");
            Destroy(loadedModel);
            yield break;
        }

        bool loadSuccess = loadTask.Result;

        if (loadSuccess)
        {
            // Wait for the instantiation task to finish so materials generate correctly
            var instantiateTask = gltfImport.InstantiateMainSceneAsync(loadedModel.transform);
            yield return new WaitUntil(() => instantiateTask.IsCompleted);

            if (instantiateTask.Result)
            {
                // Add Rigidbody with gravity disabled
                Rigidbody rb = loadedModel.AddComponent<Rigidbody>();
                rb.useGravity = false;
                rb.isKinematic = true;

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