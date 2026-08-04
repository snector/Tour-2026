#!/usr/bin/env python3
"""Download Jaisalmer tour site images from Wikimedia Commons."""
import json
import pathlib
import urllib.parse
import urllib.request

UA = "SonarTrailsBot/1.0 (https://github.com/snector/Tour-2026; tour site assets)"
OUT = pathlib.Path("/workspace/assets")
OUT.mkdir(parents=True, exist_ok=True)


def fetch(url: str) -> bytes:
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=60) as r:
        return r.read()


def wiki_thumb(file_title: str, width: int = 1600) -> str:
    api = "https://commons.wikimedia.org/w/api.php?" + urllib.parse.urlencode(
        {
            "action": "query",
            "titles": file_title,
            "prop": "imageinfo",
            "iiprop": "url",
            "iiurlwidth": width,
            "format": "json",
        }
    )
    data = json.loads(fetch(api))
    page = next(iter(data["query"]["pages"].values()))
    if "imageinfo" not in page:
        raise RuntimeError(f"No imageinfo for {file_title}: {page}")
    info = page["imageinfo"][0]
    return info.get("thumburl") or info["url"]


assets = {
    "hero-fort.jpg": "File:Jaisalmer Fort, India.jpg",
    "tour-fort.jpg": "File:Jaisalmer, India, Jaisalmer Fort, Passage.jpg",
    "tour-dunes.jpg": "File:Sunset Sand Dunes Jaisalmer Dec14 DSC 6540.jpg",
    "tour-heritage.jpg": "File:Jaisalmer Fort 2.jpg",
    "blog-season.jpg": "File:Sam dunes (Jaisalmer).jpg",
    "blog-fort.jpg": "File:Jaisalmer, India, Jaisalmer Fort, Balcony.jpg",
    "blog-safari.jpg": "File:Camels at Sam sand dunes, Jaisalmer (44753465845).jpg",
    "blog-itinerary.jpg": "File:Thar Desert, India, Camels.jpg",
    "blog-food.jpg": "File:Rajasthani Thali.jpg",
}

# food fallback candidates
food_fallbacks = [
    "File:Rajasthani Thali.jpg",
    "File:Dal Baati Churma.jpg",
    "File:Rajasthani cuisine.jpg",
    "File:Indian thali.jpg",
]

for name, src in assets.items():
    candidates = [src] + (food_fallbacks if name == "blog-food.jpg" else [])
    last_err = None
    for cand in candidates:
        try:
            if cand.startswith("http"):
                url = cand
            else:
                url = wiki_thumb(cand)
            print(f"{name}: {url}")
            data = fetch(url)
            (OUT / name).write_bytes(data)
            print(f"  saved {len(data)} bytes")
            break
        except Exception as e:
            last_err = e
            print(f"  fail {cand}: {e}")
    else:
        raise SystemExit(f"Could not download {name}: {last_err}")

print("All assets ready.")
