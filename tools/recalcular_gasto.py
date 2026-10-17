#!/usr/bin/env python3
"""
Recalcula coste_diario_estimado_eur de todas las fichas con el mismo método
que la calculadora de calefacción (8 h al día a potencia media, precios de
PRICES en build_static.py). Conserva el formato de data/products.json.

Uso (desde la raíz del repo):
    python3 tools/recalcular_gasto.py && python3 tools/build_static.py
"""
import json
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from build_static import ROOT, gasto_diario  # noqa: E402

path = os.path.join(ROOT, "data", "products.json")
text = open(path, encoding="utf-8").read()
products = json.loads(text)

pat = re.compile(r'("coste_diario_estimado_eur":\s*)(-?\d+(?:\.\d+)?|null)')
ids = [(m.start(), m.group(1)) for m in re.finditer(r'"id":\s*"([^"]+)"', text)]
matches = list(pat.finditer(text))
if len(matches) != len(products):
    sys.exit(f"Hay {len(matches)} campos de coste y {len(products)} productos: revisa el JSON.")

out, last, changed = [], 0, 0
for i, (m, p) in enumerate(zip(matches, products)):
    owner = [pid for pos, pid in ids if pos < m.start()][-1]
    if owner != p["id"]:
        sys.exit(f"Orden inesperado en {p['id']}")
    new = gasto_diario(p)
    s = f"{new:.2f}".rstrip("0").rstrip(".")
    if p.get("coste_diario_estimado_eur") != new:
        changed += 1
    out.append(text[last:m.start(2)] + s)
    last = m.end(2)
out.append(text[last:])
new_text = "".join(out)
json.loads(new_text)  # valida
open(path, "w", encoding="utf-8").write(new_text)
print(f"OK: {changed} de {len(products)} fichas con el gasto diario actualizado.")
