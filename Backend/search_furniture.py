import os
import base64
from dotenv import load_dotenv
from google import genai
import ikea_api
import json
import requests as req
from google.genai import types

load_dotenv()
GEMINI_API_KEY = os.environ.get('GEMINI_API_KEY')
SERPAPI_KEY = os.environ.get('SERPAPI_KEY')


def get_search_results(data):
    text_query = get_search_text(data)

    ikea_results = get_ikea_listings(text_query, 5)
    google_results = get_google_listings(text_query, 15)

    final_results = google_results + ikea_results

    return final_results


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


def get_google_listings(text_query, k):
    print(f"Searching '{text_query}' from Google Shopping...")

    response = req.get("https://serpapi.com/search.json", params={
        "engine": "google_shopping",
        "q": text_query,
        "api_key": SERPAPI_KEY,
        "num": k,
        "gl": "us",
        "hl": "en",
    })

    if response.status_code != 200:
        print(f"Error: {response.status_code}")
        print(response.text[:300])
        return []

    data = response.json()
    shopping_results = data.get("shopping_results", [])

    if not shopping_results:
        print("No results found:", data.get("error", "unknown error"))
        return []

    results = []
    for product in shopping_results[:k]:
        # multiple_sources[0].link is the direct retailer URL when available
        # fall back to product_link (Google's product page) if not
        link = product.get("product_link") or product.get("link")

        results.append({
            "name": product.get("title"),
            "price": product.get("extracted_price"),
            "link": link,
            "image": product.get("thumbnail"),
            "id": product.get("product_id"),
            "from": product.get("source")
        })

    print(f"Found {len(results)} results from Google Shopping")
    return results


def get_ikea_listings(text_query, k):
    print(f'Searching "{text_query}" from IKEA....')
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
            'image': product['mainImageUrl'],
            'id': product['itemNoGlobal'],
            'from': 'IKEA'
        })

    print(f'Found {len(listings)} from IKEA')
    
    return listings