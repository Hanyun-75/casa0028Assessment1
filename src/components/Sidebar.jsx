import GradeChart from "./charts/GradeChart";
import YearChart from "./charts/YearChart";
import BuildingStory from "./charts/BuildingStory";

export default function Sidebar(props) {
  const {
    streetStats,
    overallStats,
    selectedStreet,
    setSelectedStreet,
    selectedStreetStats,
    selectedBuilding,
    streetMetaMap,
  } = props;

  const active = selectedStreetStats ?? null;
  const chartTitle = active ? `Selected street: ${active.street}` : "All buildings";

  return (
    <div className="h-full min-h-0 overflow-auto">
      <div className="px-4 py-3">
        <h2 className="text-base font-semibold">Heritage corridors</h2>
        <p className="text-xs text-gray-600">
          Streets ranked by number of listed buildings. Click a street to highlight it on the map.
        </p>
      </div>

      <div className="px-4 pb-3">
        <div className="text-xs font-medium text-gray-700 mb-2">Top streets</div>
        <div className="space-y-1">
          {streetStats.slice(0, 15).map((s) => (
            <button
              key={s.street}
              onClick={() => setSelectedStreet(s.street)}
              className={`w-full rounded px-2 py-1 text-left text-sm hover:bg-gray-100 ${
                selectedStreet === s.street ? "bg-gray-200" : ""
              }`}
            >
              <div className="flex justify-between">
                <span className="truncate">{s.street}</span>
                <span className="tabular-nums text-gray-600">{s.count}</span>
              </div>
            </button>
          ))}
        </div>

        {selectedStreet && (
          <button
            onClick={() => setSelectedStreet(null)}
            className="mt-2 text-xs underline text-gray-700"
          >
            Clear selection
          </button>
        )}
      </div>

      <div className="px-4 py-3 border-t">
        <h3 className="text-sm font-semibold">{chartTitle}</h3>

        <div className="h-52">
          <div className="text-xs font-medium text-gray-700 mb-1">Grade composition</div>
          <GradeChart counts={(active?.gradeCounts ?? overallStats.gradeCounts) || {}} />
        </div>

        <div className="h-52 mt-4">
          <div className="text-xs font-medium text-gray-700 mb-1">Listing year distribution</div>
          <YearChart yearCounts={(active?.yearCounts ?? overallStats.yearCounts) || {}} />
        </div>
      </div>

      <div className="px-4 py-3 border-t">
        <h3 className="text-sm font-semibold">Building story</h3>
        <BuildingStory selectedBuilding={selectedBuilding} streetMetaMap={streetMetaMap} />
      </div>
    </div>
  );
}