import json
from pathlib import Path

import pandas as pd
import geopandas as gpd

# ---- paths ----
RAW_DIR = Path("data/raw")
OUT = Path("src/data/buildings_points_wgs84.json")


cands = sorted(RAW_DIR.glob("*.geojson"))
if not cands:
    raise FileNotFoundError("No .geojson found in data/raw/. Please put the raw file there.")
RAW = cands[0]

# ---- read ----
gdf = gpd.read_file(RAW)

#EPSG:27700
gdf = gdf.set_crs(27700, allow_override=True)

# ---- centroid + reproject to WGS84 ----
pts = gdf.copy()
pts["geometry"] = gdf.geometry.centroid
pts = pts.to_crs(4326)

# ---- derive year/decade safely ----
if "DATE_OF_LISTING" in pts.columns:
    s = pts["DATE_OF_LISTING"].astype("string")  # missing -> <NA> (won't crash)
    year_str = s.str.slice(0, 4)
    pts["year"] = pd.to_numeric(year_str, errors="coerce").astype("Int64")
    pts["decade"] = pts["year"].apply(lambda y: f"{(y//10)*10}s" if pd.notna(y) else None)
else:
    pts["year"] = pd.NA
    pts["decade"] = None

# ---- write ----
OUT.parent.mkdir(parents=True, exist_ok=True)
OUT.write_text(
    json.dumps(json.loads(pts.to_json()), ensure_ascii=False),
    encoding="utf-8",
)

print(f"Input:  {RAW}")
print(f"Output: {OUT} (features={len(pts)})")

# --- Southwark boundary output (WGS84 GeoJSON) ---
from pathlib import Path

BOROUGHS_GPKG = Path("data/raw/London_Boroughs.gpkg")
OUT_SW = Path("src/data/southwark_boundary_wgs84.json")

if not BOROUGHS_GPKG.exists():
    print("Skip boundary: data/raw/London_Boroughs.gpkg not found")
else:
    boroughs = gpd.read_file(BOROUGHS_GPKG)

    # Ensure CRS known (London borough boundaries are typically EPSG:27700)
    boroughs = boroughs.set_crs(27700, allow_override=True)

    # 1) Robust selection by GSS code (Southwark = E09000028)
    southwark = boroughs.loc[
        boroughs["gss_code"].astype(str).str.strip() == "E09000028"
    ].copy()

    # 2) Fallback: try name contains "Southwark"
    if southwark.empty:
        southwark = boroughs.loc[
            boroughs["name"].astype(str).str.contains("Southwark", case=False, na=False)
        ].copy()

    # If still empty, print debug hints and stop
    if southwark.empty:
        print("DEBUG columns:", list(boroughs.columns))
        print("DEBUG name head:", boroughs["name"].dropna().astype(str).head(15).tolist())
        print("DEBUG gss_code head:", boroughs["gss_code"].dropna().astype(str).head(15).tolist())
        raise ValueError("Could not find Southwark in London_Boroughs.gpkg (by gss_code or name).")

    # Optional simplify (in meters, while still EPSG:27700)
    southwark["geometry"] = southwark.geometry.simplify(5)

    # Reproject to WGS84 for web mapping
    southwark = southwark.to_crs(4326)

    # Write GeoJSON
    OUT_SW.parent.mkdir(parents=True, exist_ok=True)
    OUT_SW.write_text(
        json.dumps(json.loads(southwark.to_json()), ensure_ascii=False),
        encoding="utf-8",
    )

    print(f"Output: {OUT_SW} (features={len(southwark)})")