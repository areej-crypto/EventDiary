print("🔔  Flask AI engine starting up…")

import os 
import re
import joblib
from flask import Flask, request, jsonify
from dotenv import load_dotenv
from bson import ObjectId
from datetime import datetime
from pymongo import MongoClient

# Import CAT C 
from trend_tracker import get_trending_events
from content_recommender import get_content_recs

base = os.path.dirname(__file__)               
load_dotenv(os.path.join(base, '..', '.env')) 
 
app = Flask(__name__)
 
#  NLP MODERATION 
model = joblib.load('content_moderation_model.pkl')
 
def clean_text(text):
    text = text.lower()
    text = re.sub(r'[^a-z0-9\s]', '', text)
    return text
 
@app.route('/predict', methods=['POST'])
def predict():
    data = request.get_json()
    post_text = data.get('post_text', '')
    cleaned_text = clean_text(post_text)
    prediction = model.predict([cleaned_text])[0]
    return jsonify({'prediction': int(prediction)})
 
#  RECOMMENDATIONS 
@app.route("/recommendations/<user_id>", methods=["GET"])
def recommendations(user_id):
    # Validate & convert the path segment
    try:
        uid = ObjectId(user_id)
    except Exception:
        return jsonify({"error": "Invalid user id"}), 400

    #  Fetch interactions
    from pymongo import MongoClient
    mongo_uri = os.getenv("MONGODB_URI")
    if not mongo_uri.startswith("mongodb"):
        mongo_uri = "mongodb+srv://" + mongo_uri
    client = MongoClient(mongo_uri)
    db     = client["Event"] 

    inters = db.interactions.find({
        "userId": uid,
        "interactionType": {"$in": ["like", "remind", "comment"]}
    })
    user_event_ids = [ str(i["eventId"]) for i in inters ]

    # 2) Get TF-IDF → cosine ML recs
    recs = get_content_recs(user_event_ids, top_n=5)
    return jsonify(recs)
 
# TRENDING EVENTS 
def sanitize(doc):
    if isinstance(doc, list):
        return [sanitize(i) for i in doc]
    elif isinstance(doc, dict):
        return {k: sanitize(v) for k, v in doc.items()}
    elif isinstance(doc, ObjectId):
        return str(doc)
    elif isinstance(doc, datetime):
        return doc.isoformat()
    else:
        return doc

@app.route('/trending-events', methods=['GET'])
def trending_events():
    n     = int(request.args.get('n', 5))
    alpha = float(request.args.get('alpha', 0.7))
    docs  = get_trending_events(top_n=n, alpha=alpha)

    sanitized_docs = sanitize(docs)
    return jsonify(sanitized_docs)
    
if __name__ == '__main__':
    app.run(debug=True, port=5000)  