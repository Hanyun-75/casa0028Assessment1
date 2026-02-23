# Southwark Listed Buildings Explorer (CASA0028 Assessment 1)

An interactive single-page React website for exploring **listed buildings** in the London Borough of **Southwark** and identifying **heritage corridors** (streets with dense clusters of listed buildings). The site integrates an interactive MapLibre map with linked Chart.js visualisations.

## Live site & repo
- [GITHUB_PAGES_URL_HERE](https://hanyun-75.github.io/casa0028Assessment1/)
- [GITHUB_REPO_URL_HERE](https://github.com/Hanyun-75/casa0028Assessment1)

---

## Project idea (heritage corridors)
Southwark has dense layers of historic built fabric. In this project, streets are ranked as **heritage corridors** by the **number of listed buildings** on each street.  
- Select a street to explore corridor-level patterns (grade and listing decade).  
- Click a building to open the verified **official listing PDF**.

---

## Tech stack
- React + Vite
- Map: MapLibre via `react-map-gl` + `maplibre-gl`
- Charts: Chart.js via `react-chartjs-2`
- Styling: Tailwind CSS

---

## Key features
- **Interactive map**
  - Building points + popup (official PDF link)
  - Southwark boundary overlay
  - Street selection highlight (corridor focus)
- **Linked charts**
  - Grade composition (doughnut)
  - Listing decade distribution (bar)
- **Building story panel**
  - Always shows verified attributes (Grade / Year / Street + PDF)
  - Optional external summary (Wikipedia) is user-triggered. Some buildings may not have a matching Wikipedia page (404), in which case the interface falls back to the official listing PDF.
- **Sources box**
  - Quick links to key datasets and references.

---

## How corridor ranking & charts work (short)
- Group building records by `STREET`.
- Keep streets with at least **N** buildings (slider).
- Rank streets by building count (descending).
- For the selected street:
  - Count `GRADE` - grade composition chart.
  - Extract listing year - bucket into decades (e.g., 1971 to 1970s) - decade chart.
- “Representative” tags (in Building story) are derived from street-level stats (rank, dominant decade, wave strength, etc.).

---

## Run locally (React + Vite)
From the repository root:

```bash
npm install
npm run dev
```

---

## Build
```bash
npm run build
npm run preview
```

---

## Data preprocessing
The web map uses **WGS84 (EPSG:4326)**. A Python preprocessing script converts raw data into web-ready GeoJSON.
### Inputs (place in data/raw/)
- All Southwark listed buildings.geojson
- London_Boroughs.gpkg
### Steps
```bash
python3 -m venv .venv
source .venv/bin/activate
pip install geopandas pyogrio
python scripts/preprocess.py
deactivate
```
### Outputs (generated into src/data/)
- src/data/buildings_points_wgs84.json
- src/data/southwark_boundary_wgs84.json

Note: the .venv/ folder is not committed; the steps above recreate it for reproducibility.

---

## References
### Data sources
- [London Datastore — Southwark listed buildings (GeoJSON)](https://data.london.gov.uk/dataset/listed-buildings-in-london-borough-of-southwark-2gq0r/)
- [London Datastore — London Boroughs boundary (used to extract Southwark boundary)](https://data.london.gov.uk/dataset/london-boroughs-e55pw)

### Context (background reading)
- [Southwark (Wikipedia)](https://en.wikipedia.org/wiki/Southwark)
- [Historic England — National Heritage List for England (NHLE) (definitions of listed buildings and grades)](https://historicengland.org.uk/listing/the-list/)
### Basemap
- [Carto Positron (MapLibre style)](https://basemaps.cartocdn.com/gl/positron-gl-style/style.json)

### Colour references
- [ColorHunt palette reference](https://colorhunt.co/palette/758a93ecd5bce9b63bc66e52)
- [mycolor.space (palette exploration tool)](https://mycolor.space/?hex=%23DFE0DF&sub=1)

### Technical references
- [MapLibre style specification](https://maplibre.org/maplibre-style-spec/)
- [React documentation (components)](https://react.dev/learn/your-first-component)

---

## AI usage
[ChatGPT-5.2](https://chat.openai.com/)was used as support for this project. It helped with writing by proofreading and improving the grammar and clarity of the project background text. It also helped with debugging by explaining error messages and suggesting possible fixes when issues could not be solved independently (including errors while the site was running and errors when building/compiling the project). In addition, it gave workflow guidance for file-format conversion in VS Code. Some format conversions that were previously done in other software (e.g., CSV, GeoJSON, GPKG) were moved into the VS Code workflow for this project, but problems happened during running; ChatGPT-5.2 helped with setting up a Python virtual environment (venv) in VS Code and running the required scripts to finish the conversions. All processed outputs and the website’s interactive behaviour were checked independently (by checking outputs in QGIS and testing the site in the browser). Final decisions, source selection and citation, and the submitted work are the author’s own.