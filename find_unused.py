import os
import re

assets = []
for root, dirs, files in os.walk("src/assets"):
    for f in files:
        assets.append(os.path.join(root, f))
for root, dirs, files in os.walk("public"):
    for f in files:
        assets.append(os.path.join(root, f))

# Exclude some known files
exclude = ["robots.txt", "sitemap.xml", "site.webmanifest", "favicon", "android-chrome", "apple-touch-icon", "sw.js"]
assets = [a for a in assets if not any(x in a for x in exclude)]

# Search for usage in src/ and public/ (for manifest/css)
code_files = []
for root, dirs, files in os.walk("src"):
    for f in files:
        if f.endswith((".tsx", ".ts", ".css", ".scss", ".json", ".html")):
            code_files.append(os.path.join(root, f))
code_files.append("index.html")

unused = []
for asset in assets:
    filename = os.path.basename(asset)
    # If it's a .asset.json, we also care about the base filename
    base_filename = filename
    if filename.endswith(".asset.json"):
        base_filename = filename.replace(".asset.json", "")
    
    found = False
    for code_file in code_files:
        try:
            with open(code_file, "r") as f:
                content = f.read()
                if filename in content or (base_filename != filename and base_filename in content):
                    found = True
                    break
        except:
            pass
    
    if not found:
        unused.append(asset)

print("### UNUSED ASSETS ###")
for u in sorted(unused):
    print(u)
