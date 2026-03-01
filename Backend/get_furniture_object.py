import torch
from PIL import Image
import trimesh
import base64
import subprocess
import gc  
import requests
import os
from pathlib import Path

# 1. Verification Check
print(f"CUDA Available: {torch.cuda.is_available()}")
if torch.cuda.is_available():
    print(f"Using GPU: {torch.cuda.get_device_name(0)}")

from hy3dgen.rembg import BackgroundRemover
from hy3dgen.shapegen import Hunyuan3DDiTFlowMatchingPipeline
from hy3dgen.texgen import Hunyuan3DPaintPipeline
import io

model_path = 'tencent/Hunyuan3D-2'

# pipeline_shapegen = Hunyuan3DDiTFlowMatchingPipeline.from_pretrained(
#     model_path,
#     torch_dtype=torch.float16,
#     device_map="auto",
#     low_cpu_mem_usage=True
# )
# pipeline_shapegen = Hunyuan3DDiTFlowMatchingPipeline.from_pretrained(
#     model_path,
#     subfolder='hunyuan3d-dit-v2-0-turbo',
#     torch_dtype=torch.float16,
#     device_map="auto",
#     low_cpu_mem_usage=True
# )
# pipeline_shapegen = Hunyuan3DDiTFlowMatchingPipeline.from_pretrained(
#     'tencent/Hunyuan3D-2mini',
#     subfolder='hunyuan3d-dit-v2-mini',
#     variant='fp16',
#     low_cpu_mem_usage=True
# )
# pipeline_shapegen.enable_flashvdm()
# pipeline_texgen = Hunyuan3DPaintPipeline.from_pretrained(model_path)
pipeline_shapegen = Hunyuan3DDiTFlowMatchingPipeline.from_pretrained(
    'tencent/Hunyuan3D-2mini',
    subfolder='hunyuan3d-dit-v2-mini',
    variant='fp16'
)
pipeline_texgen = Hunyuan3DPaintPipeline.from_pretrained('tencent/Hunyuan3D-2')
pipeline_shapegen.enable_flashvdm()

def make_3d_from_image(image_bytes):
    # --- STEP 1: Process Image & Background ---
    image = Image.open(io.BytesIO(image_bytes)).convert("RGBA")


    # Background removal usually needs very little VRAM/RAM
    rembg = BackgroundRemover()
    image = rembg(image)

    # --- STEP 2: Shape Generation ---
    # We use float16 and device_map="auto" to load directly to GPU
    print("Loading ShapeGen Pipeline to GPU...")
    # pipeline_shapegen = Hunyuan3DDiTFlowMatchingPipeline.from_pretrained(
    #     'tencent/Hunyuan3D-2mini',
    #     subfolder='hunyuan3d-dit-v2-mini',
    #     variant='fp16',
    #     low_cpu_mem_usage=True
    # )
    # pipeline_shapegen = Hunyuan3DDiTFlowMatchingPipeline.from_pretrained(
    #     model_path,
    #     subfolder='hunyuan3d-dit-v2-0-turbo',
    #     torch_dtype=torch.float16,
    #     device_map="auto",
    #     low_cpu_mem_usage=True
    # )
    # pipeline_shapegen.enable_flashvdm()

    mesh = pipeline_shapegen(image=image, num_inference_steps=5, octree_resolution=256,)[0]

    # del pipeline_shapegen # Delete the first pipeline

    gc.collect()
    torch.cuda.empty_cache()

    # mesh.export('chair_shape_only.glb')
    return mesh

def texture_3d_mesh(mesh, image_bytes):
    image = Image.open(io.BytesIO(image_bytes)).convert("RGBA")
    # pipeline_texgen = Hunyuan3DPaintPipeline.from_pretrained(model_path)
    print("starting texgen now")
    num_cores = os.cpu_count() 
    torch.set_num_threads(num_cores)
    torch.set_num_interop_threads(num_cores)
    print(f"PyTorch is now using {torch.get_num_threads()} threads.")
    # pipeline_texgen.to("cuda")
    mesh = pipeline_texgen(mesh, image=image)
    print("texgen complete")
    return mesh

def reduce_mesh_face(mesh):
    print(f"Original face count: {len(mesh.faces)}")

    mesh.merge_vertices()
    mesh.remove_duplicate_faces()
    print("duplicate remove face count: ", mesh.faces)

    # Target 45,000 faces (standard for high-quality furniture assets)
    target_faces = 15000

    if len(mesh.faces) > target_faces:
        print(f"Decimating mesh to {target_faces} faces...")
        # simplify_quadratic_decimation reduces faces while preserving shape
        # mesh = mesh.simplify_quadric_decimation(face_count=target_faces)
        mesh = mesh.simplify_quadric_decimation(target_faces = target_faces)
    
    print(f"New face count: {len(mesh.faces)}")
    return mesh
    
def get_obj_dimensions(mesh):
    """
    Takes a trimesh object (or scene) and returns its bounding box dimensions.
    """
    try:
        # If 'mesh' is already a trimesh.Trimesh or trimesh.Scene object,
        # we can access the bounding_box property directly.
        dims = mesh.bounding_box.extents
        
        return {
            "width_x": round(float(dims[0]), 4),
            "height_y": round(float(dims[1]), 4),
            "depth_z": round(float(dims[2]), 4),
            "unit": "meters" 
        }
    except Exception as e:
        print(f"Error calculating dimensions: {e}")
        return None
    
def get_image_bytes_from_file(file_path):
    """
    Reads a local file and returns its binary content.
    """
    try:
        with open(file_path, "rb") as image_file:
            return image_file.read()
    except FileNotFoundError:
        print(f"Error: The file at {file_path} was not found.")
        return None
    
def convert_mesh_to_glb_bytes(mesh):
    glb_buffer = io.BytesIO()
    mesh.export(glb_buffer, file_type='glb')
    glb_buffer.seek(0)
    glb_bytes = glb_buffer.getvalue()
    glb_base64 = base64.b64encode(glb_bytes).decode('utf-8')
    
    return glb_base64
    
def download_image(url):
    """
    Downloads an image from a URL and returns the raw bytes.
    """
    try:
        response = requests.get(url, timeout=10)
        # Check if the request was successful (status code 200)
        response.raise_for_status()
        
        # Check if the content is actually an image
        if "image" not in response.headers.get("Content-Type", ""):
            print(f"Warning: URL may not be an image. Type: {response.headers.get('Content-Type')}")
            
        return response.content
    except Exception as e:
        print(f"Error downloading image from {url}: {e}")
        return None
        
def return_cache(image_url):
    """
    Searches for a file by name in a directory.
    Returns the absolute path if found, else None.
    """
    # Normalize path for WSL
    current_dir = Path.cwd()
    print(f"Searching in: {current_dir}")

    # rglob("*") finds all files recursively
    for path in current_dir.rglob("*"):
        if path.is_file():
            # Check if full name matches OR if name without extension matches
            if path.name.lower() == image_url.lower() or \
               path.stem.lower() == image_url.lower():
                return str(path.absolute())
                
                
    mesh = trimesh.load("chair_test_pipeline1.glb", force="mesh")
    return mesh
    
def generate_furniture(image_url, image_byte):
    # if image_url != None:
    #     image_byte = download_image(image_url)
    # geometry_mesh = make_3d_from_image(image_byte)
    # obj_mesh = reduce_mesh_face(geometry_mesh)
    # reduced_mesh = texture_3d_mesh(obj_mesh, image_byte)

    # glb_obj = convert_mesh_to_glb_bytes(reduced_mesh)
    # dimensions = get_obj_dimensions(obj_mesh)

    # obj_mesh.export('api_request.glb')
    # print("object generated")

    obj_mesh = return_cache(image_url)
    dimensions = get_obj_dimensions(obj_mesh)

    return obj_mesh, dimensions

if __name__ == "__main__":
    print("starting main now")
    image_byte = get_image_bytes_from_file("furniture_files/chair.png")
    
    obj_mesh = make_3d_from_image(image_byte)
    obj_mesh = reduce_mesh_face(obj_mesh)
    obj_mesh = texture_3d_mesh(obj_mesh, image_byte)
    
    size = get_obj_dimensions(obj_mesh)

    obj_mesh.export('chair_test_pipeline1.glb')

    mesh = trimesh.load("chair_test_pipeline1.glb", force="mesh")
    mesh.export("chair_test_pipeline1.obj", include_texture=True)
    print(size)
    

