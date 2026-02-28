from flask import Flask, jsonify, request
from search_furniture import * 

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
@app.route('/api/furniture/<int:item_id>', methods=['GET'])
def get_furniture_object(item_id):
    # Find the item with the matching ID
    item = next((item for item in inventory if item['id'] == item_id), None)
    
    if item:
        return jsonify(item)
    
    return jsonify({"error": "Item not found"}), 404

if __name__ == '__main__':
    app.run(debug=True)