import json
import os

file_path = "data/stackoverflow_3000.json"

# Check if file exists
if not os.path.exists(file_path):
    print("File not found!")
    print("Check if make_dataset.py created the file.")
    exit()

print("File found!")

# Load JSON
with open(file_path, "r", encoding="utf-8") as f:
    data = json.load(f)

# Basic checks
print("\nTotal rows:", len(data))

print("\nFirst row sample:")
print(data[0])

print("\nText sample:")
print(data[0]["text"][:100])

print("\nEmbedding length:")
print(len(data[0]["embedding"]))

print("\nEmbedding type:")
print(type(data[0]["embedding"][0]))

print("\nAll checks completed!")