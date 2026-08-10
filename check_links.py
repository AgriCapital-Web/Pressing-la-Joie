import os

with open("references.txt", "r") as f:
    refs = [line.strip().strip("'\"") for line in f]

with open("available.txt", "r") as f:
    available = set(line.strip() for line in f)

broken = []
for ref in refs:
    path = ref
    if ref.startswith("@/"):
        path = os.path.join("src", ref[2:])
    elif ref.startswith("/"):
        path = os.path.join("public", ref[1:])
    
    # Try direct path
    if os.path.exists(path):
        continue
    
    # Try as relative to src/assets
    if os.path.exists(os.path.join("src/assets", os.path.basename(ref))):
        continue

    # Try as relative to public
    if os.path.exists(os.path.join("public", os.path.basename(ref))):
        continue
        
    broken.append(ref)

print("### BROKEN REFERENCES ###")
for b in broken:
    # Filter out dynamic paths or obvious false positives
    if "${" in b: continue
    print(b)
