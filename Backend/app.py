from flask import Flask, jsonify, request
from search_furniture import * 
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


@app.route('/api/search', methods=['POST'])
def search_furniture():
    data = request.get_json()
    text_query = get_search_text(data)

    ikea_results = get_ikea_listings(text_query, 10)
    homedepot_results = get_homedepot_listings(text_query)

    return jsonify({'result': ikea_results})


# 3. Furniture Object - Get details for a specific item by ID
# Example: /api/furniture/1
@app.route('/api/furniture/generate', methods=['POST'])
def process_furniture_data():
    # 1. Get the text data from the form
    text_data = request.form.get('description', 'No description provided')
    category = request.form.get('category', 'unknown')

    # 2. Get the image from the request
    if 'image' not in request.files:
        return jsonify({"error": "No image uploaded"}), 400
    
    image_file = request.files['image']

    img_bytes = image_file.read()

    try:
        glb_bytes, dimensions = generate_furniture(img_bytes)

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