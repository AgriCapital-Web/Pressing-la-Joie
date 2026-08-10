import os
import re
import json

def get_all_files(directory):
    file_list = []
    for root, dirs, files in os.walk(directory):
        for file in files:
            file_list.append(os.path.relpath(os.path.join(root, file), "."))
    return file_list

assets_dir = "src/assets"
public_dir = "public"
src_dir = "src"

asset_files = get_all_files(assets_dir)
public_files = get_all_files(public_dir)
all_assets = asset_files + public_files

referenced_assets = set()
broken_links = []
external_links = []

# Regex to find imports and usage
# Matches: import ... from "./assets/image.png"
# Matches: src="/logo.png"
# Matches: url("/assets/bg.jpg")
asset_regex = re.compile(r'["\']([^"\']+\.(png|jpg|jpeg|svg|webp|gif|mp4|asset\.json))["\']')
url_regex = re.compile(r'https?://[^\s"\']+')

for root, dirs, files in os.walk(src_dir):
    for file in files:
        if file.endswith((".tsx", ".ts", ".css", ".scss", ".json")):
            path = os.path.join(root, file)
            try:
                with open(path, "r", encoding="utf-8") as f:
                    content = f.read()
                    
                    # Find external links
                    for match in url_regex.finditer(content):
                        url = match.group(0)
                        if "supabase.co" not in url and "google" not in url and "w3.org" not in url and "fonts.googleapis" not in url:
                            external_links.append((path, url))

                    # Find asset references
                    for match in asset_regex.finditer(content):
                        ref = match.group(1)
                        # Normalize path
                        full_ref = ref
                        if ref.startswith("./"):
                            full_ref = os.path.normpath(os.path.join(root, ref))
                        elif ref.startswith("../"):
                            full_ref = os.path.normpath(os.path.join(root, ref))
                        elif ref.startswith("/"):
                            # Public folder
                            full_ref = os.path.join("public", ref.lstrip("/"))
                        
                        # Sometimes it's just a filename in src/assets
                        if not os.path.exists(full_ref):
                            check_in_assets = os.path.join(assets_dir, os.path.basename(ref))
                            if os.path.exists(check_in_assets):
                                full_ref = check_in_assets
                        
                        referenced_assets.add(full_ref)
                        
                        if not os.path.exists(full_ref) and not ref.startswith("http"):
                            broken_links.append((path, ref))
            except Exception as e:
                print(f"Error reading {path}: {e}")

# Check .asset.json files for project IDs
project_ids = {}
for asset in all_assets:
    if asset.endswith(".asset.json"):
        with open(asset, "r") as f:
            try:
                data = json.load(f)
                p_id = data.get("project_id")
                if p_id:
                    if p_id not in project_ids:
                        project_ids[p_id] = []
                    project_ids[p_id].append(asset)
            except:
                pass

print("### EXTERNAL LINKS (POTENTIAL OLD CDN) ###")
for path, url in external_links:
    print(f"{path}: {url}")

print("\n### BROKEN LINKS ###")
for path, ref in broken_links:
    # Filter out common false positives like library names or relative paths that are actually dynamic
    if not ref.startswith("http") and not any(x in ref for x in ["node_modules", "${"]):
         print(f"{path}: {ref}")

print("\n### PROJECT ID MISMATCHES IN .asset.json ###")
if len(project_ids) > 1:
    main_project = max(project_ids, key=lambda k: len(project_ids[k]))
    for p_id, files in project_ids.items():
        if p_id != main_project:
            print(f"Project ID {p_id} (potential old project):")
            for f in files:
                print(f"  {f}")
else:
    print("All .asset.json share the same project ID.")

print("\n### UNUSED ASSETS ###")
unused = set(all_assets) - referenced_assets
# Also check if the .asset.json is used if the image is used, and vice versa
for asset in sorted(list(unused)):
    # Filter out favicon and common public files
    if "favicon" in asset or "robots.txt" in asset or "sitemap.xml" in asset or "apple-touch-icon" in asset or "android-chrome" in asset or "site.webmanifest" in asset:
        continue
    # If it's a .asset.json, check if the base file is used
    if asset.endswith(".asset.json"):
        base = asset.replace(".asset.json", "")
        if base in referenced_assets:
            continue
    # If it's an image, check if its .asset.json is used
    else:
        json_asset = asset + ".asset.json"
        if json_asset in referenced_assets:
            continue
            
    print(asset)
