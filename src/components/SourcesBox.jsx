import { useState } from "react";
/**
 * Small floating panel for data/source attribution.
 * Fixed positioning keeps it visible while user interacts with the map/sidebar.
 */
export default function SourcesBox() {
  const [open, setOpen] = useState(true);

  return (
    <div className="fixed bottom-4 left-4 z-50 max-w-[360px]">
      <div className="rounded-lg border bg-white/90 p-3 text-xs text-gray-700 shadow backdrop-blur">
        <div className="flex items-center justify-between">
          <div className="font-semibold">Sources</div>
          
          {/* Toggle reduces visual clutter without removing attribution */}
          <button
            type="button"
            className="text-xs underline text-gray-600"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle sources"
          >
            {open ? "Hide" : "Show"}
          </button>
        </div>

        {open  ? (
          <ul className="mt-2 list-disc space-y-1 pl-4">
            <li>
              <a
                className="underline"
                href="https://data.london.gov.uk/dataset/listed-buildings-in-london-borough-of-southwark-2gq0r/"
                target="_blank"
                rel="noreferrer"
              >
                London Datastore — Southwark listed buildings (GeoJSON)
              </a>
            </li>
            <li>
              <a
                className="underline"
                href="https://data.london.gov.uk/dataset/london-boroughs-e55pw"
                target="_blank"
                rel="noreferrer"
              >
                London Datastore — London Boroughs boundary (used to extract Southwark)
              </a>
            </li>
            <li>
              <a
                className="underline"
                href="https://historicengland.org.uk/listing/the-list/"
                target="_blank"
                rel="noreferrer"
              >
                Historic England — NHLE (listed buildings & grades)
              </a>
            </li>
            <li>
              <a
                className="underline"
                href="https://en.wikipedia.org/wiki/Southwark"
                target="_blank"
                rel="noreferrer"
              >
                Southwark background (Wikipedia)
              </a>
            </li>

            <li className="text-gray-600">
              Basemap: Carto Positron (MapLibre style) —{" "}
              <a
                className="underline"
                href="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
                target="_blank"
                rel="noreferrer"
              >
                style.json
              </a>
            </li>
          </ul>
        ) : null}
      </div>
    </div>
  );
}