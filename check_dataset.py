import json
import os

file_path="data/stackoverflow_3000.json"

if not os.path.exists(file_path):

    print("Dataset not found")

    exit()

with open(file_path,'r',encoding='utf-8') as f:

    data=json.load(f)

print("Rows:",len(data))

print("Sample:")

print(data[0]["question"][:100])

print("Embedding length:")

print(len(data[0]["embedding"]))

print("Dataset OK")