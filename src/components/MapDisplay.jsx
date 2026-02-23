import Map, { Layer, Popup, Source } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";

const MAP_STYLE = "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json";


export default function MapDisplay(props) {
  const { geojson, boundaryGeojson, selectedBuilding, setSelectedBuilding, selectedStreet, setSelectedStreet } = props;

  const buildingsLayer = {
    id: "buildings-layer",
    type: "circle",
    paint: {
      "circle-radius": 4,
      "circle-stroke-width": 0.3,
      "circle-stroke-color": "#f3eed9",
      "circle-color": [
        "match",
        ["get", "GRADE"],
        "I",
        "#BED4CB",
        "II*",
        "#B35656",
        "II",
        "#87B6BC",
        "#F6F09F",//default fallback for unknown
      ],
      // When a street is selected, dim the base layer so the highlight stands out.
      "circle-opacity": selectedStreet ? 0.3 : 0.8,
    },
  };

  // Southwark boundary overlay (fill + outline).
  const boundaryFillLayer = {
  id: "southwark-boundary-fill",
  type: "fill",
  paint: {
    "fill-color": "#dfe0df",
    "fill-opacity": 0.26,
  },
};

  const boundaryLineLayer = {
  id: "southwark-boundary-line",
  type: "line",
  paint: {
    "line-color": "#758A93",
    "line-width": 3,
    "line-opacity": 0.6,
  },
};
  
// Highlight layer for buildings on the selected street.
   const highlightLayer = {
    id: "buildings-highlight",
    type: "circle",
    filter: ["==", ["get", "STREET"], selectedStreet],
    paint: {
      "circle-radius": 7,
      "circle-stroke-width": 0.5,
      "circle-stroke-color": "#ffdc82",
      "circle-color": "#ffdc82",
      "circle-opacity": 0.6,
    },
  };
  // Extract the PDF link from the dataset field.
  const getPdfUrl = (p) => {
    const url = String(p?.LISTING_DESCRIPTION ?? "").trim();
    return url.startsWith("http") ? url : null;
  };

  const handleMapClick = (event) => {
    // `event.features` is populated ONLY for layers listed in `interactiveLayerIds`.
    const features = event.features;

    if (features && features.length) {
      const clicked = features[0];

      // Store the clicked feature so <Popup> can display it.
      setSelectedBuilding(clicked);

      // Store the street name to drive the highlight layer & sidebar charts.
      const street = (clicked?.properties?.STREET ?? "").trim();
      setSelectedStreet(street || null);
    }
  };
   


  return (
    <div className="h-full w-full">
      {/* Legend (Grades) */}
    <div className="absolute left-4 top-1/2 z-10 -translate-y-1/2 rounded-lg border bg-white/90 p-3 text-xs text-gray-700 shadow backdrop-blur">
      <div className="mb-2 font-semibold">Listed building grade</div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span
            className="inline-block h-3 w-3 rounded-sm border"
            style={{ backgroundColor: "#BED4CB" }}
          />
          <span>Grade I</span>
        </div>

        <div className="flex items-center gap-2">
          <span
            className="inline-block h-3 w-3 rounded-sm border"
            style={{ backgroundColor: "#B35656" }}
          />
          <span>Grade II*</span>
        </div>

        <div className="flex items-center gap-2">
          <span
            className="inline-block h-3 w-3 rounded-sm border"
            style={{ backgroundColor: "#87B6BC" }}
          />
          <span>Grade II</span>
        </div>
      </div>
    </div>

      <Map
        style={{ width: "100%", height: "100%" }}
        initialViewState={{ longitude: -0.09, latitude: 51.5, zoom: 12 }}
        mapStyle={MAP_STYLE}
         // Include both layers so clicks work even when highlight circles sit on top.
        interactiveLayerIds={["buildings-layer", "buildings-highlight"]}
        onClick={handleMapClick}
      >
        {boundaryGeojson ? (
          <Source id="southwark-boundary-src" type="geojson" data={boundaryGeojson}>
            <Layer {...boundaryFillLayer} />
            <Layer {...boundaryLineLayer} />
          </Source>
        ) : null}

      
        {/* Listed buildings points (with optional street highlight) */}
        <Source id="buildings-src" type="geojson" data={geojson}>
          <Layer {...buildingsLayer} />
          {selectedStreet ? <Layer {...highlightLayer} /> : null}
        </Source>

        {/* Popup for the single selected building */}
        {selectedBuilding ? (
          <Popup
            anchor="bottom"
            longitude={selectedBuilding.geometry.coordinates[0]}
            latitude={selectedBuilding.geometry.coordinates[1]}
            closeOnClick={false}
            onClose={() => setSelectedBuilding(null)}
          >
            <div className="max-w-[240px]">
              <div className="font-semibold text-sm leading-snug whitespace-normal break-words">
                {selectedBuilding.properties?.NAME ?? "Unnamed listed building"}
              </div>

              <div className="mt-2">
                {getPdfUrl(selectedBuilding.properties) ? (
                  <a
                    className="underline text-sm"
                    href={getPdfUrl(selectedBuilding.properties)}
                    target="_blank"
                    rel="noreferrer"
                  >
                   Open official listing PDF
                  </a>
                ) : (
                 <span className="text-gray-500 text-sm">No PDF link available</span>
                )}
              </div>
            </div>
           </Popup>
          
          ) : null}
      </Map>
    </div>
  );
}