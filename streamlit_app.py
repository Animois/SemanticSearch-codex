import streamlit as st
import numpy as np
from search_engine import load_data,perform_search

st.set_page_config(

    page_title="SemanticSearch Codex",
    page_icon="🔍",
    layout="centered"
)

st.title("🔍 Semantic Search Codex")

st.write("Semantic search using embeddings")

index,texts=load_data()

if index is None:

    st.error("Dataset not found")

    st.stop()

st.sidebar.title("Dashboard")

st.sidebar.metric(

    "Database Size",
    len(texts)
)

query=st.text_input(

    "",
    placeholder="Ask coding question..."
)

def fake_embedding(text,dim):

    vec=np.zeros(dim)

    for i,c in enumerate(text):

        vec[i%dim]=ord(c)/1000

    return vec.astype("float32")

if query:

    dimension=index.d

    query_embedding=fake_embedding(

        query,
        dimension
    )

    results=perform_search(

        index,
        texts,
        query_embedding
    )

    if results:

        st.success(

            f"Top {len(results)} matches"
        )

        for r in results:

            st.write("📌",r)

    else:

        st.info("No matches found")

else:

    st.info("Enter a query")