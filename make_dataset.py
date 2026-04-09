from datasets import load_dataset
import json
import os

print("Starting dataset creation...")

subset = load_dataset(
    "MartinElMolon/stackoverflow_preguntas_con_embeddings",
    split="train[:3000]"
)

print("Dataset loaded")

data_list = []

for i, row in enumerate(subset):

    embedding = [float(x) for x in row["embedding"]]

    data_list.append({
        "id": i,
        "question": row.get("question",""),
        "answer": row.get("answer",""),
        "tags": row.get("tags",[]),
        "embedding": embedding
    })

    if i % 500 == 0:
        print("Processed:", i)

os.makedirs("data", exist_ok=True)

file_path = "data/stackoverflow_3000.json"

with open(file_path,"w",encoding="utf-8") as f:

    json.dump(
        data_list,
        f,
        ensure_ascii=False
    )

print("SUCCESS")
print("Saved:", file_path)
print("Rows:", len(data_list))