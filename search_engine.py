import json
import numpy as np
import faiss
import os

DATA_PATH="data/stackoverflow_3000.json"

def load_data():

    with open(DATA_PATH,'r',encoding='utf-8') as f:

        data=json.load(f)

    texts=[]
    embeddings=[]

    for item in data:

        text=item["question"]+" "+item["answer"]

        texts.append(text)

        embeddings.append(item["embedding"])

    embeddings=np.array(embeddings).astype("float32")

    dimension=embeddings.shape[1]

    index=faiss.IndexFlatL2(dimension)

    index.add(embeddings)

    return index,texts


def perform_search(index,texts,query_embedding,k=5):

    query_embedding=np.array([query_embedding]).astype("float32")

    distances,indices=index.search(query_embedding,k)

    results=[]

    for i in indices[0]:

        results.append(texts[i])

    return results