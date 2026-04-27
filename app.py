from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai

app = Flask(__name__)
CORS(app)

import os

genai.configure(api_key=os.environ.get("GEMINI_API_KEY"))
model = genai.GenerativeModel("gemini-pro")

@app.route("/")
def home():
    return "Backend Running!"

@app.route("/api/explain", methods=["POST"])
def explain():
    data = request.json

    prompt = f"""
    Explain why this disaster zone is prioritized:
    Severity: {data.get('severity')}
    Population: {data.get('population')}
    Resources: {data.get('resources')}
    """

    response = model.generate_content(prompt)

    return jsonify({"explanation": response.text})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=10000)