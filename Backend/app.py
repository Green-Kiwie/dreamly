from flask import Flask, jsonify, request
from search_furniture import get_search_results
from get_furniture_object import generate_furniture

app = Flask(__name__)

# 1. getDefaultHome - General welcome or landing data
@app.route('/api/home', methods=['GET'])
def get_default_home():
    return jsonify({
        "banner_image": "https://example.com/hero.jpg",
        "featured_categories": ["Chairs", "Sofas", "Tables", "Lighting"],
        "message": "Welcome to the Furniture Store API"
    })

# curl -X POST -H "Content-Type: application/json" -d @filename.json [API_ENDPOINT_URL]

@app.route('/api/search', methods=['POST'])
def search_furniture():
    return jsonify({'results': get_search_results(request.json)})


# 3. Furniture Object - Get details for a specific item by ID
# Example: /api/furniture/1
@app.route('/api/furniture/generate', methods=['POST'])
def process_furniture_data():
    # 1. Get the text data from the form
    # text_data = request.form.get('description', 'No description provided')
    # category = request.form.get('category', 'unknown')
    image_url = request.form.get('image_url') or None

    # 2. Get the image from the request
    image_file = request.files['image'] or None
    img_bytes = image_file.read()

    try:
        glb_bytes, dimensions = generate_furniture(image_url, img_bytes)

        return jsonify({
            "status": "success",
            "model_base64": glb_bytes,
            "metadata": {
                "dimensions": dimensions,
                "format": "glb",
                "unit": "meters"
            }
        })

    except Exception as e:
        return jsonify({"error": f"Processing failed: {str(e)}"}), 500