from flask import Flask, jsonify, request
from search_furniture import get_search_results
from get_furniture_object import generate_furniture
from flask_cors import CORS
import threading
from pyngrok import ngrok
import io
app = Flask(__name__)
CORS(app)

processing_lock = threading.Lock()

# 1. getDefaultHome - General welcome or landing data
@app.route('/api/home', methods=['GET'])
def get_default_home():
    return jsonify({
        "banner_image": "https://example.com/hero.jpg",
        "featured_categories": ["Chairs", "Sofas", "Tables", "Lighting"],
        "message": "Welcome to the Furniture Store API"
    })

# curl -X POST -H "Content-Type: application/json" -d @test_file.json https://thoroughly-nonactinic-david.ngrok-free.dev"

@app.route('/api/search', methods=['POST'])
def search_furniture():
    return jsonify({'results': get_search_results(request.json)})


# 3. Furniture Object - Get details for a specific item by ID
# Example: /api/furniture/1
@app.route('/api/furniture/generate', methods=['POST'])
def process_furniture_data():

    if not processing_lock.acquire(blocking=False):
        return jsonify({
            "status": "error",
            "message": "Server is busy processing another request. Please try again later."
        }), 429  # 429 is the standard 'Too Many Requests' status code


    try:
        image_url = request.form.get('image_url') or None

        # 2. Get the image from the request
        image_file = request.files['image'] or None
        img_bytes = image_file.read()

        obj_mesh, dimensions = generate_furniture(image_url, img_bytes)

        export_buffer = io.BytesIO()
        obj_mesh.export(export_buffer, file_type='glb')
        glb_bytes = export_buffer.getvalue()

        return glb_bytes, dimensions

    except Exception as e:
        print("error: ", str(e))
        return jsonify({"error": f"Processing failed: {str(e)}"}), 500


if __name__ == '__main__':
    public_url = ngrok.connect(5000)
    print(public_url)
    app.run(host='0.0.0.0', port=5000, debug=True, use_reloader=False)  # If 'port' isn't specified, it defaults to 5000
    