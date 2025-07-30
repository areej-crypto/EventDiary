import os
import pandas as pd
import numpy as np
from pymongo import MongoClient
from sklearn.preprocessing import MinMaxScaler
from sklearn.decomposition import TruncatedSVD
from sklearn.feature_extraction.text import TfidfVectorizer
from dotenv import load_dotenv

# Load env and connect to MongoDB
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '..', '.env'))
MONGO_URI = os.getenv("MONGODB_URI")
if not MONGO_URI.startswith("mongodb"):
    MONGO_URI = "mongodb+srv://" + MONGO_URI

client = MongoClient(MONGO_URI)
db     = client.get_default_database()
inter  = db["interactions"]
events = db["events"]

def fetch_data():
    #Fetch raw interactions and event metadata as DataFrames.
    raw = pd.DataFrame(list(inter.find({}, {"userId":1, "eventId":1})))
    df_int = (
        raw
        .assign(count=1)
        .groupby(["userId","eventId"], as_index=False)["count"]
        .sum()
    )
    df_evt = pd.DataFrame(list(events.find()))
    return df_int, df_evt

def collaborative_scores(df_int):
    #Compute a popularity score per event via truncated SVD of the user–event matrix.
    user_item = df_int.pivot(index='eventId', columns='userId', values='count').fillna(0)
    svd    = TruncatedSVD(n_components=5)
    latent = svd.fit_transform(user_item)
    scores = latent.sum(axis=1)
    return pd.Series(scores, index=user_item.index)

def content_scores(df_evt):
    #Compute a content score per event via TF-IDF weighting of event descriptions.
    tfidf = TfidfVectorizer(stop_words='english')
    mat   = tfidf.fit_transform(df_evt['description'].astype(str))
    scores = mat.sum(axis=1).A1
    return pd.Series(scores, index=df_evt['_id'])

def get_trending_events(top_n=5, alpha=0.7):
    #Return the top_n trending event documents using a hybrid of collaborative & content scores.
    df_int, df_evt = fetch_data()
    cf = collaborative_scores(df_int)
    cb = content_scores(df_evt)

    # Only keep events scored by both methods
    idx = cf.index.intersection(cb.index)
    cf, cb = cf.loc[idx], cb.loc[idx]

    # Normalize both to [0,1]
    scaler = MinMaxScaler()
    cf_n = pd.Series(scaler.fit_transform(cf.values.reshape(-1,1)).flatten(), index=cf.index)
    cb_n = pd.Series(scaler.fit_transform(cb.values.reshape(-1,1)).flatten(), index=cb.index)

    # Hybrid score and pick top N
    hybrid = alpha * cf_n + (1 - alpha) * cb_n
    top_ids = hybrid.sort_values(ascending=False).head(top_n).index.tolist()

    # Fetch and order the actual event documents
    docs = list(events.find({ "_id": { "$in": top_ids } }))
    id2doc = { d["_id"]: d for d in docs }
    return [ id2doc[eid] for eid in top_ids ]
