import torch
from PIL import Image
import trimesh
# import gc  

# 1. Verification Check
print(f"CUDA Available: {torch.cuda.is_available()}")
if torch.cuda.is_available():
    print(f"Using GPU: {torch.cuda.get_device_name(0)}")

from hy3dgen.rembg import BackgroundRemover
from hy3dgen.shapegen import Hunyuan3DDiTFlowMatchingPipeline
# from hy3dgen.texgen import Hunyuan3DPaintPipeline
import io

model_path = 'tencent/Hunyuan3D-2'
image_path = 'chair.png'

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

    mesh = pipeline_shapegen(image=image)[0]

    # mesh.export('chair_shape_only.glb')
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
    
if __name__ == "__main__":
    image_byte = get_image_bytes_from_file("Ikea_table_sample.png")
    obj_mesh = make_3d_from_image(image_byte)
    size = get_obj_dimensions(obj_mesh)

    obj_mesh.export('test_pipeline1.glb')
    print(size)
    
