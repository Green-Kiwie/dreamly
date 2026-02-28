from flask import Flask, jsonify, request

app = Flask(__name__)

# 1. getDefaultHome - General welcome or landing data
@app.route('/api/home', methods=['GET'])
def get_default_home():
    return jsonify({
        "banner_image": "https://example.com/hero.jpg",
        "featured_categories": ["Chairs", "Sofas", "Tables", "Lighting"],
        "message": "Welcome to the Furniture Store API"
    })

# 2. Furniture Search - Filter by name or category using query params
# Example: /api/search?q=Chair
@app.route('/api/search', methods=['GET'])
def search_furniture():
    query = request.args.get('q', '').lower()
    
    # Filter inventory based on search term
    results = [
        item for item in inventory 
        if query in item['name'].lower() or query in item['category'].lower()
    ]
    
    return jsonify({
        "query": query,
        "results_count": len(results),
        "results": results
    })

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