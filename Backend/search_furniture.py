import os
import base64
from dotenv import load_dotenv
from google import genai
import ikea_api
from curl_cffi import requests
from google.genai import types

load_dotenv()
GEMINI_API_KEY = os.environ.get('GEMINI_API_KEY')

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


def get_lowes_listings():
    pass


def get_homedepo_listings(text_query, k):
    url = "https://apionline.homedepot.com/federation-gateway/graphql?opname=plaModel"

    gql_query = """
    query plaModel($keyword: String, $pageSize: Int) {
      plaModel(keyword: $keyword, pageSize: $pageSize) {
        products {
          itemId
          identifiers {
            productLabel
            brandName
            canonicalUrl
          }
          pricing {
            value
          }
          media {
            images {
              url
            }
          }
        }
      }
    }
    """

    headers = {
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    }
    
    payload = {
        "operationName": "plaModel",
        "variables": {
            "keyword": text_query,
            "pageSize": k
        },
        "query": gql_query
    }

    print(f"Searching for '{text_query}'...")
    response = requests.post(url, json=payload, headers=headers, impersonate="chrome120")
    
    if response.status_code != 200:
        print(f"Error: Received status {response.status_code}")
        return []

    data = response.json()
    products = data.get('data', {}).get('plaModel', {}).get('products', [])
    
    results = []
    for product in products:
        results.append({
            "name": product['identifiers']['productLabel'],
            "price": product['pricing']['value'],
            "link": f"https://www.homedepot.com{product['identifiers']['canonicalUrl']}",
            "image": product['media']['images'][0]['url'].replace('<SIZE>', '1000'),
            "id": product['itemId'],
        })
    
    return results


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
            'image': product['mainImageUrl'],
            'id': product['itemNoGlobal']
        })
    
    return listings