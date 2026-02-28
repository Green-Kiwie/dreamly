import os
import base64
from dotenv import load_dotenv
from google import genai
import ikea_api
from google.genai import types
from flask import Flask, jsonify, request

app = Flask(__name__)

load_dotenv()
GEMINI_API_KEY = os.environ.get('GEMINI_API_KEY')

# 1. getDefaultHome - General welcome or landing data
@app.route('/api/home', methods=['GET'])
def get_default_home():
    return jsonify({
        "banner_image": "https://example.com/hero.jpg",
        "featured_categories": ["Chairs", "Sofas", "Tables", "Lighting"],
        "message": "Welcome to the Furniture Store API"
    })

# 2. Furniture Search
# Example: /api/search?q=Chair

def get_search_text(data):
    base64_image = data.get('image_b64')

    if ',' in base64_image:
        base64_image = base64_image.split(",")[1]

    text_query = data.get('text')

    if base64_image:
        text_part = "Describe the main furniture piece in the given image with keywords as if you were looking it up on a online shopping platform. An example response would be 'small green cloth chair with wooden legs'"
        image_part = types.Part.from_bytes(
            data=base64_image,
            mime_type="image/jpeg"
        )

        client = genai.Client(api_key=GEMINI_API_KEY)
        text_query = client.models.generate_content(
            model="gemini-2.5-flash", contents=[text_part, image_part]
        ).text


    return text_query


def get_ikea_listings(text_query, k):
    constants = ikea_api.Constants(
        country='us', 
        language='en',
        user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36"
    )
    search = ikea_api.Search(constants)

    search_info = search.search(text_query, limit=k)
    response = ikea_api.run(search_info)

    search_results = response.get('searchResultPage', {})
    products_wrapper = search_results.get('products', {})
    main_section = products_wrapper.get('main', {})
    items = main_section.get('items', [])

    listings = []

    for item in items[:k]:
        product = item.get('product', {})
        
        listings.append({
            'name': product['name'],
            'price': product['salesPrice']['numeral'],
            'link': product['pipUrl'],
            'image': product['mainImageUrl']
        })
    
    return listings


@app.route('/api/search', methods=['POST'])
def search_furniture():
    data = request.get_json()
    text_query = get_search_text(data)

    ikea_results = get_ikea_listings(text_query, 10)
    #wayfair_results = get_wayfair_results(text_query)

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