#!/usr/bin/env python3
# Détourage des photos produit Odoo → PNG transparents pour l'effet 3D lévitation.
# Lancement : uv run --with rembg --with pillow --with onnxruntime python scripts/detoure-odoo.py
import json, os, io, urllib.request, sys
from rembg import remove, new_session
from PIL import Image

ODOO = "https://sas-les-4-as1.odoo.com/web/image/product.template/{}/image_512"
OUT = os.path.join(os.path.dirname(__file__), "..", "public", "menu")
MANIFEST = os.path.join(os.path.dirname(__file__), "..", "src", "data", "odoo-cutouts.json")

# Liste des produits qui utilisent une image Odoo (via l'API live)
d = json.load(urllib.request.urlopen("https://www.infinigp.fr/api/menu", timeout=30))
ids = []
for c in d["categories"]:
    for i in c["items"]:
        if "web/image/product.template/" in i["img"]:
            pid = i["img"].split("product.template/")[1].split("/")[0]
            ids.append(int(pid))
ids = sorted(set(ids))
print(f"{len(ids)} images Odoo à détourer", flush=True)

session = new_session("u2net")
done = []
for n, pid in enumerate(ids, 1):
    try:
        raw = urllib.request.urlopen(ODOO.format(pid), timeout=30).read()
        img = Image.open(io.BytesIO(raw)).convert("RGBA")
        cut = remove(img, session=session, post_process_mask=True)
        cut.save(os.path.join(OUT, f"odoo-{pid}-cut.png"))
        done.append(pid)
        print(f"[{n}/{len(ids)}] {pid} ✓", flush=True)
    except Exception as e:
        print(f"[{n}/{len(ids)}] {pid} ERREUR {str(e)[:60]}", flush=True)

json.dump(sorted(done), open(MANIFEST, "w"))
print(f"TERMINÉ : {len(done)} détourées → manifeste {MANIFEST}", flush=True)
