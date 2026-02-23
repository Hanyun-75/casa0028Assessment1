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
        "#F6F09F",
      ],
      "circle-opacity": selectedStreet ? 0.4 : 0.6,
    },
  };
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
  //const boundaryLayer = {
  //id: "southwark-boundary-line",
  //type: "line",
  //paint: {
   // "line-color": "#758A93",
   // "line-width": 3,
   // "line-opacity": 0.6,
  //},
//};

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

  const getPdfUrl = (p) => {
    const url = String(p?.LISTING_DESCRIPTION ?? "").trim();
    return url.startsWith("http") ? url : null;
  };

  const handleMapClick = (event) => {
    const features = event.features;
    if (features && features.length) {
      const clicked = features[0];
      setSelectedBuilding(clicked);

      const street = (clicked?.properties?.STREET ?? "").trim();
      setSelectedStreet(street || null);
    }
  };

  return (
    <div className="h-full w-full">
      <Map
        style={{ width: "100%", height: "100%" }}
        initialViewState={{ longitude: -0.09, latitude: 51.5, zoom: 12 }}
        mapStyle={MAP_STYLE}
        
        interactiveLayerIds={["buildings-layer"]}
        onClick={handleMapClick}
      >
        {boundaryGeojson && (
  <Source id="southwark-boundary-src" type="geojson" data={boundaryGeojson}>
    <Layer {...boundaryFillLayer} />
    <Layer {...boundaryLineLayer} />
  </Source>
)}

        {boundaryGeojson && (
  <Source id="southwark-boundary-src" type="geojson" data={boundaryGeojson}>
    <Layer {...boundaryFillLayer} />
    <Layer {...boundaryLineLayer} />
  </Source>
)}
        <Source id="buildings-src" type="geojson" data={geojson}>
          <Layer {...buildingsLayer} />
          {selectedStreet ? <Layer {...highlightLayer} /> : null}
        </Source>

        {selectedBuilding && (
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
          
        )}
      </Map>
    </div>
  );
}