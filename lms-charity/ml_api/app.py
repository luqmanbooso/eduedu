from flask import Flask, request, jsonify
from transformers import pipeline

app = Flask(__name__)
scorer = pipeline("text-classification", model="distilbert-base-uncased-finetuned-sst-2-english")  # Example model

@app.route('/score', methods=['POST'])
def score_essay():
    data = request.get_json()
    essay_text = data.get("essay", "")
    result = scorer(essay_text)
    return jsonify(result)

if __name__ == '__main__':
    app.run(port=5000)
    