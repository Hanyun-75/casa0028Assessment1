# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is enabled on this template. See [this documentation](https://react.dev/learn/react-compiler) for more information.

Note: This will impact Vite dev & build performances.

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.



# Southwark Listed Buildings Explorer (Heritage Corridors)

An interactive single-page React website for exploring **listed buildings** in the London Borough of **Southwark** and identifying **heritage corridors** (streets with dense clusters of listed buildings).

## Live site
- GitHub Pages: **YOUR_GITHUB_PAGES_URL**
- GitHub repository: **YOUR_REPO_URL**

---

## What this website does

### Concept
A *heritage corridor* is defined here as a street with a high concentration of listed buildings. The website ranks streets by the **number of listed buildings** and helps users explore:
- corridor-level patterns (grade composition, listing decade distribution)
- building-level details (official listing PDF evidence)

### Key interactions
- **Map (react-map-gl + MapLibre)**
  - Points represent listed buildings
  - Click a point to open a popup and the **official listing PDF**
  - Select a street corridor to highlight buildings on that street
  - Southwark boundary is shown for geographic context
- **Sidebar (analysis)**
  - **Top streets** list (corridor ranking)
  - Charts for overall vs selected corridor:
    - **Grade composition** (doughnut)
    - **Listing decade distribution** (bar)
  - Building “story” panel:
    - Always shows verified attributes (Grade / Year / Street) + official PDF link
    - Optional external summary (Wikipedia) is user-triggered to avoid noisy failed requests

---

## Tech stack
- React (Vite)
- MapLibre via `react-map-gl/maplibre`
- Chart.js via `react-chartjs-2`
- Tailwind CSS for layout and UI styling

---

## Project structure




## References / Credits

### Data sources
- London Datastore — Southwark listed buildings (GeoJSON): https://data.london.gov.uk/dataset/listed-buildings-in-london-borough-of-southwark-2gq0r/
- London Datastore — London Boroughs boundary (used to extract Southwark boundary): https://data.london.gov.uk/dataset/london-boroughs-e55pw
- Historic England — National Heritage List for England (NHLE) (definitions of listed buildings and grades): https://historicengland.org.uk/listing/the-list/

### Context (background reading)
- Southwark (Wikipedia): https://en.wikipedia.org/wiki/Southwark

### Basemap
- Carto Positron (MapLibre style): https://basemaps.cartocdn.com/gl/positron-gl-style/style.json

### Design / colour references
- ColorHunt palette reference: https://colorhunt.co/palette/758a93ecd5bce9b63bc66e52
- mycolor.space (palette exploration tool): https://mycolor.space/?hex=%23DFE0DF&sub=1

### Technical references
- MapLibre style specification: https://maplibre.org/maplibre-style-spec/
- React documentation (components): https://react.dev/learn/your-first-component