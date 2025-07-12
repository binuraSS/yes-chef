from flask import Flask, request, jsonify
from flask_cors import CORS
from recipe_scrapers import scrape_me

app = Flask(__name__)
CORS(app)  # Enable cross-origin access for frontend

@app.route('/api/scrape', methods=['POST'])
def scrape_recipe():
    data = request.get_json()
    url = data.get("url")

    if not url:
        return jsonify({"error": "No URL provided"}), 400

    try:
        scraper = scrape_me(url, wild_mode=True)

        # Handle different instruction formats
        raw_instructions = scraper.instructions()
        if isinstance(raw_instructions, str):
            steps = [s.strip() for s in raw_instructions.split("\n") if s.strip()]
        elif isinstance(raw_instructions, list):
            steps = raw_instructions
        else:
            steps = []

        result = {
            "title": scraper.title() or "Untitled Recipe",
            "ingredients": scraper.ingredients() or [],
            "instructions": steps,
            "total_time": scraper.total_time() or 0,
            "image": scraper.image()
        }

        return jsonify(result)

    except Exception as e:
        return jsonify({"error": f"Failed to scrape recipe: {str(e)}"}), 400

if __name__ == '__main__':
    app.run(debug=True, port=5000)
