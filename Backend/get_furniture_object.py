import torch
from PIL import Image
import trimesh
import base64
import subprocess
import gc  
import requests

# 1. Verification Check
print(f"CUDA Available: {torch.cuda.is_available()}")
if torch.cuda.is_available():
    print(f"Using GPU: {torch.cuda.get_device_name(0)}")

from hy3dgen.rembg import BackgroundRemover
from hy3dgen.shapegen import Hunyuan3DDiTFlowMatchingPipeline
from hy3dgen.texgen import Hunyuan3DPaintPipeline
import io

model_path = 'tencent/Hunyuan3D-2'

def run_paint3d_api(mesh_path, prompt):
    # This command tells WSL to:
    # 1. Use the specific Python inside your conda environment
    # 2. Run the Paint3D script with your arguments
    conda_python = "/home/youruser/miniconda3/envs/paint3d/bin/python"
    script_path = "/path/to/Paint3D/scripts/run_paint3d.py"
    
    cmd = [
        conda_python, script_path,
        "--mesh_path", mesh_path,
        "--prompt", prompt,
        "--output_dir", "outputs/api_results"
    ]
    
    result = subprocess.run(cmd, capture_output=True, text=True)
    return result.stdout

def make_3d_from_image(image_bytes):
    # --- STEP 1: Process Image & Background ---
    image = Image.open(io.BytesIO(image_bytes)).convert("RGBA")


    # Background removal usually needs very little VRAM/RAM
    rembg = BackgroundRemover()
    image = rembg(image)

    # --- STEP 2: Shape Generation ---
    # We use float16 and device_map="auto" to load directly to GPU
    print("Loading ShapeGen Pipeline to GPU...")
    pipeline_shapegen = Hunyuan3DDiTFlowMatchingPipeline.from_pretrained(
        model_path,
        torch_dtype=torch.float16,
        device_map="auto",
        low_cpu_mem_usage=True
    )

    mesh = pipeline_shapegen(image=image, octree_resolution=256,)[0]

    del pipeline_shapegen # Delete the first pipeline
    gc.collect()
    torch.cuda.empty_cache()

    # mesh.export('chair_shape_only.glb')
    return mesh

def texture_3d_mesh(mesh, image_bytes):
    image = Image.open(io.BytesIO(image_bytes)).convert("RGBA")
    pipeline_texgen = Hunyuan3DPaintPipeline.from_pretrained(model_path)
    mesh = pipeline_texgen(mesh, image=image)
    return mesh

def reduce_mesh_face(mesh):
    print(f"Original face count: {len(mesh.faces)}")

    # Target 45,000 faces (standard for high-quality furniture assets)
    target_faces = 45000

    if len(mesh.faces) > target_faces:
        print(f"Decimating mesh to {target_faces} faces...")
        # simplify_quadratic_decimation reduces faces while preserving shape
        mesh = mesh.simplify_quadric_decimation(face_count=target_faces)
    
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
    
def generate_furniture(image_url):
    image_byte = download_image(image_url)
    geometry_mesh = make_3d_from_image(image_byte)
    obj_mesh = reduce_mesh_face(geometry_mesh)
    reduced_mesh = texture_3d_mesh(obj_mesh, image_byte)

    glb_obj = convert_mesh_to_glb_bytes(reduced_mesh)
    dimensions = get_obj_dimensions(obj_mesh)
    return glb_obj, dimensions

if __name__ == "__main__":
    image_byte = get_image_bytes_from_file("furniture_files/chair.png")
    
    obj_mesh = make_3d_from_image(image_byte)
    obj_mesh = reduce_mesh_face(obj_mesh)
    obj_mesh = texture_3d_mesh(obj_mesh, image_byte)
    
    size = get_obj_dimensions(obj_mesh)

    obj_mesh.export('chair_test_pipeline1.glb')

    mesh = trimesh.load("chair_test_pipeline1.glb", force="mesh")
    mesh.export("chair_test_pipeline1.obj", include_texture=True)
    print(size)
    
