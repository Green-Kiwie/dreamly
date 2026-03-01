using System;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using GLTFast;

public class ModelLoader : MonoBehaviour
{
    private List<GameObject> loadedModels = new List<GameObject>();

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
        Debug.Log($"1");
        // Calculate position offset for new model
        float xOffset = loadedModels.Count * 3f;
        Debug.Log($"2");
        // Create container for loaded model
        GameObject loadedModel = new GameObject("LoadedGLBModel_" + loadedModels.Count);
        Debug.Log($"3");
        loadedModel.transform.SetParent(transform);
        Debug.Log($"4");
        loadedModel.transform.position = new Vector3(xOffset, 0, 0);
        Debug.Log($"5");
        loadedModel.transform.rotation = Quaternion.identity;
        Debug.Log($"6");
        // Load GLB using GLTFast
        GltfImport gltfImport = new GltfImport();
        Debug.Log($"7");
        var loadTask = gltfImport.LoadGltfBinary(glbData);
        Debug.Log($"8");
        yield return new WaitUntil(() => loadTask.IsCompleted);
        Debug.Log($"9");
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
        Debug.Log($"10");
        if (loadSuccess)
        {
            yield return gltfImport.InstantiateMainSceneAsync(loadedModel.transform);
            Debug.Log($"GLB #{loadedModels.Count} loaded at ({xOffset}, 0, 0)");
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
}
