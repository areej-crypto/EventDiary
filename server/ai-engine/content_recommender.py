import os
from dotenv import load_dotenv
import pandas as pd
import joblib
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from pymongo import MongoClient
from datetime import datetime

#  Load .env from server
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '..', '.env'))

#  Connect to MongoDB 
mongo_uri = os.getenv("MONGODB_URI")
if not mongo_uri.startswith("mongodb"):
    mongo_uri = "mongodb+srv://" + mongo_uri
client = MongoClient(mongo_uri)
db     = client["Event"]    

# Fetch events directly from Mongo 
filter_criteria = {
  "status": "approved",
  "hiddenFromManage": False,
  "endDate": { "$gte": datetime.utcnow() }
}

projection = {
    "_id": 1,
    "title": 1,
    "description": 1,
    "eventType": 1,
    "hashtags": 1
}

docs = list(db.events.find(filter_criteria, projection))

events_df = pd.DataFrame(docs)
events_df["event_id"] = events_df["_id"].astype(str)

# Joins a list of tags into one string, or Leaves an existing string alone
def normalize_tags(h):
    if isinstance(h, list):
        return " ".join(h)
    elif isinstance(h, str):
        return h
    else:
        return ""
events_df["hashtags"] = events_df["hashtags"].map(normalize_tags)

#  Build the content field 
events_df["content"] = (
    events_df["title"].fillna("") + " "
  + events_df["description"].fillna("") + " "
  + events_df["eventType"].fillna("") + " "
  + events_df["hashtags"]
)
events_df["content"] = events_df["content"].fillna("")

event_ids = events_df["event_id"].tolist()

# Fit & cache TF-IDF 
vectorizer   = TfidfVectorizer(max_features=5000, stop_words="english")
corpus       = events_df["content"].tolist() #corpus is the list of all event content strings.
tfidf_matrix = vectorizer.fit_transform(corpus) # learns the vocabulary and builds a sparse matrix (n_events × n_features) of TF-IDF weights.

joblib.dump((vectorizer, tfidf_matrix, event_ids),
            "content_recommender.pkl")


def get_content_recs(user_event_ids, top_n=5):
    vec, M, all_ids = joblib.load("content_recommender.pkl")   #Loads the saved (vectorizer, matrix, ids)
    idx_map = {eid: i for i, eid in enumerate(all_ids)}  #Builds a lookup from each event ID string to its row index in M
    seen_idxs = [idx_map[e] for e in user_event_ids if e in idx_map] #Converts the user’s IDs to row indices.
    if not seen_idxs: # if they’ve seen nothing, returns an empty list immediately.
        return []

    dense = M[seen_idxs].toarray()                  # shape = (k, V) , and if they’ve seen nothing, returns an empty list immediately.
    user_vec = dense.mean(axis=0).reshape(1, -1)     # shape = (1, V)
    sims     = cosine_similarity(user_vec, M).flatten() #computes similarity between profile and every event row to flat array of scores

    for i in seen_idxs: #marks already seen event score-1 so it doesnt appear
        sims[i] = -1

    top_idxs = sims.argsort()[::-1][:top_n] #Sorts indices by descending similarity and picks the first top_n.
    return [
      {"event_id": all_ids[i], "score": float(sims[i])}
      for i in top_idxs
    ] #returns final list of dictionaries, each with the event’s ID and its similarity score.


#Load the saved TF-IDF data.
 
#Compute a “user profile” vSector by averaging all events they’ve seen.
#Cosine-similarity against every event.
#Exclude already-seen events.
#Select the top N and return their IDs with scores.