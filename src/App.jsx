import { useMemo, useState } from "react";
import TitleBar from "./components/TitleBar";
import MapDisplay from "./components/MapDisplay";
import Sidebar from "./components/Sidebar";
import SourcesBox from "./components/SourcesBox";
// Local GeoJSON data
import southwarkBoundary from "./data/southwark_boundary_wgs84.json";
import buildingsRaw from "./data/buildings_points_wgs84.json";
/**
 * Extract a year from a feature's properties.
 * - Prefer a numeric `year` field if present.
 * - Fallback: parse the first 4 digits from `DATE_OF_LISTING` (e.g. "1975-06-01").
 */
function getYear(props) {
  const yNum = Number(props?.year);
  if (Number.isFinite(yNum) && yNum > 0) return yNum;

  const raw = String(props?.DATE_OF_LISTING ?? "").trim();
  const yearStr = raw.slice(0, 4);
  if (!/^\d{4}$/.test(yearStr)) return null;

  const n = Number(yearStr);
  return Number.isFinite(n) && n > 0 ? n : null;
}
/**
 * Convert listing grade to a numeric rank for easy comparison.
 * Higher = more significant listing grade.
 */
export default function App() {
  // Selected items (MapDisplay + Sidebar).
  const [selectedBuilding, setSelectedBuilding] = useState(null);
  const [selectedStreet, setSelectedStreet] = useState(null);

  // Filter control: only keep streets with at least N buildings.
  const [minStreetCount, setMinStreetCount] = useState(5);
  /**
   * Ensure Feature.geometry is a valid Point with [lng, lat].
   * Prevent map's error
   */
  const features = useMemo(() => {
    return (buildingsRaw?.features ?? []).filter((f) => {
      const c = f?.geometry?.coordinates;
      return (
        f?.geometry?.type === "Point" &&
        Array.isArray(c) &&
        c.length === 2 &&
        Number.isFinite(c[0]) &&
        Number.isFinite(c[1])
      );
    });
  }, []);

  const geojson = useMemo(
    () => ({ type: "FeatureCollection", features }),
    [features]
  );
   
  /**
   * Aggregate stats per street:
   * - total count
   * - grade distribution
   * - listing year distribution
   */
  const streetStats = useMemo(() => {
    const byStreet = new Map();
    for (const f of features) {
      const p = f.properties ?? {};
      const street = (p.STREET ?? "").trim() || "Unknown";
      const grade = (p.GRADE ?? "Unknown").trim() || "Unknown";
      const year = getYear(p);

      if (!byStreet.has(street)) {
        byStreet.set(street, { street, count: 0, gradeCounts: {}, yearCounts: {} });
      }
      const s = byStreet.get(street);
      s.count += 1;
      s.gradeCounts[grade] = (s.gradeCounts[grade] ?? 0) + 1;
      if (Number.isFinite(year) && year > 0) {
        s.yearCounts[year] = (s.yearCounts[year] ?? 0) + 1;
  }
    }
    return Array.from(byStreet.values())
      .filter((d) => d.street !== "Unknown")
      .filter((d) => d.count >= minStreetCount)
      .sort((a, b) => b.count - a.count);
  }, [features, minStreetCount]);





    
//streetMetaMap 必须在 streetStats 之后（同级），不能写在另一个 useMemo 里面
const gradeRank = (g) => {
  if (g === "I") return 3;
  if (g === "II*") return 2;
  if (g === "II") return 1;
  return 0;
};

  /**
   * Extra per-street metadata for the sidebar UI:
   * - rank (after sorting by count)
   * - min/max listing year
   * - highest grade present
   * - dominant decade (the decade with the most listings)
   */
  const streetMetaMap = useMemo(() => {
    const map = {};

    streetStats.forEach((s, idx) => {
      const years = Object.keys(s.yearCounts ?? {})
       .map((y) => Number(y))
       .filter((y) => Number.isFinite(y))
       .sort((a, b) => a - b);

    const minYear = years.length ? years[0] : null;
    const maxYear = years.length ? years[years.length - 1] : null;

    const grades = Object.keys(s.gradeCounts ?? {});
    const maxGradeRank = grades.reduce((acc, g) => Math.max(acc, gradeRank(g)), 0);

    //dominant decade + its count
    const decadeCounts = {};
    for (const [yStr, cnt] of Object.entries(s.yearCounts ?? {})) {
      const y = Number(yStr);
      if (!Number.isFinite(y)) continue;
      const d = Math.floor(y / 10) * 10; // e.g. 1970
      decadeCounts[d] = (decadeCounts[d] ?? 0) + cnt;
    }

    let dominantDecade = null;
    let dominantDecadeCount = 0;
    for (const [dStr, cnt] of Object.entries(decadeCounts)) {
      if (cnt > dominantDecadeCount) {
        dominantDecadeCount = cnt;
        dominantDecade = Number(dStr);
      }
    }
    map[s.street] = {
      street: s.street,
      rank: idx + 1,
      count: s.count,
      minYear,
      maxYear,
      maxGradeRank,
      dominantDecade, 
      dominantDecadeCount,
    };
  });

  return map;
}, [streetStats]);

 /**
   * Overall stats across all features.
   */  
 const overallStats = useMemo(() => {
    const gradeCounts = {};
    const yearCounts = {};
    
    for (const f of features) {
      const p = f.properties ?? {};
      const grade = (p.GRADE ?? "Unknown").trim() || "Unknown";
      gradeCounts[grade] = (gradeCounts[grade] ?? 0) + 1;
      const year = getYear(p);
      if (year) yearCounts[year] = (yearCounts[year] ?? 0) + 1;
    }
    return { gradeCounts, yearCounts };
  }, [features]);
   /**
   * Convenience lookup for the currently selected street.
   */
  const selectedStreetStats = useMemo(() => {
    if (!selectedStreet) return null;
    return streetStats.find((d) => d.street === selectedStreet) ?? null;
  }, [streetStats, selectedStreet]);

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden">
      <TitleBar />

      {/* key:see map */}
      <div className="flex-1 min-h-0 flex">
        {/* Main map area */}
        <div className="flex-1 min-w-0 min-h-0">
          <MapDisplay
            geojson={geojson}
            selectedBuilding={selectedBuilding}
            setSelectedBuilding={setSelectedBuilding}
            selectedStreet={selectedStreet}
            setSelectedStreet={setSelectedStreet}
            boundaryGeojson={southwarkBoundary}
          />
        </div>

        {/* Right sidebar */}
        <div className="w-[380px] max-w-[45vw] min-h-0 border-l overflow-y-auto">
          <Sidebar
            streetStats={streetStats}
            overallStats={overallStats}
            selectedStreet={selectedStreet}
            setSelectedStreet={setSelectedStreet}
            selectedStreetStats={selectedStreetStats}
            selectedBuilding={selectedBuilding}
            streetMetaMap={streetMetaMap}
          />
          <SourcesBox />

          {/* adjust the street filtering threshold */}
          <div className="px-4 pb-4">
            <label className="text-xs text-gray-600">Min buildings per street</label>
            <input
              type="range"
              min={1}
              max={50}
              value={minStreetCount}
              onChange={(e) => setMinStreetCount(Number(e.target.value))}
              className="w-full"
            />
            <div className="text-xs text-gray-600">Current: {minStreetCount}</div>
          </div>
        </div>
      </div>
    </div>
  );
}