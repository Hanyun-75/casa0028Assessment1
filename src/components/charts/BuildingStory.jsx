import { useMemo, useState } from "react";

function cleanText(v) {
  const s = String(v ?? "").trim();
  if (!s) return null;
  if (s.toLowerCase() === "nan") return null;
  return s;
}

function simplifyName(name) {
  if (!name) return null;
  // Cleanup to improve Wikipedia hit rate.
  let s = name.trim();
  s = s.replace(/^Former\s+/i, "");
  s = s.replace(/\s+at\s+.+$/i, "");
  s = s.replace(/\s+/g, " ").trim();
  return s || null;
}

function getYear(props) {
  // Prefer an explicit numeric year if present.
  const yNum = Number(props?.year);
  if (Number.isFinite(yNum) && yNum > 0) return yNum;

  // Fallback: parse first 4 digits from DATE_OF_LISTING.
  const raw = String(props?.DATE_OF_LISTING ?? "").trim();
  const yearStr = raw.slice(0, 4);
  if (!/^\d{4}$/.test(yearStr)) return null;

  const n = Number(yearStr);
  return Number.isFinite(n) && n > 0 ? n : null;
}

function getPdfUrl(props) {
  const url = String(props?.LISTING_DESCRIPTION ?? "").trim();
  return url.startsWith("http") ? url : null;
}

function gradeRank(g) {
  if (g === "I") return 3;
  if (g === "II*") return 2;
  if (g === "II") return 1;
  return 0;
}

function Badge({ children }) {
  return (
    <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] text-gray-700">
      {children}
    </span>
  );
}

async function fetchWikiSummary(query) {
  const endpoint = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(
    query
  )}`;

  try {
    const res = await fetch(endpoint);

    if (res.status === 404) return { ok: false, status: 404 };
    if (!res.ok) return { ok: false, status: res.status };

    const data = await res.json();
    return {
      ok: true,
      extract: data?.extract ?? null,
      url: data?.content_urls?.desktop?.page ?? null,
      title: data?.title ?? query,
    };
  } catch {
    return { ok: false, status: "network" };
  }
}
/**
 * "Verified" info panel:
 * - Uses fields from the official dataset + computed corridor tags.
 * - Links out to the official listing PDF (ground-truth source).
 */
function OfficialCard({ props, streetMetaMap }) {
  const name = cleanText(props?.NAME) ?? "Unnamed listed building";
  const grade = cleanText(props?.GRADE) ?? "Unknown";
  const street = cleanText(props?.STREET) ?? "Unknown";
  const year = getYear(props);
  const pdf = getPdfUrl(props);

  const meta = streetMetaMap?.[street] ?? null;

  const tags = [];
  if (meta) {
    
    tags.push(`Corridor rank: ${meta.rank} — ${meta.count} listed buildings`);

    // Dominant decade + wave strength.
    if (meta.dominantDecade) {
      tags.push(`Dominant listing decade: ${meta.dominantDecade}s`);
      const myDecade = year ? Math.floor(year / 10) * 10 : null;
      if (myDecade && myDecade === meta.dominantDecade) {
        tags.push("Matches dominant decade");
      }
    }

    if (meta.dominantDecade && meta.dominantDecadeCount && meta.count) {
      const pct = Math.round((meta.dominantDecadeCount / meta.count) * 100);
      tags.push(`Listing wave strength: ${pct}% in ${meta.dominantDecade}s`);
    }

    // Highest grade on this street.
    const myRank = gradeRank(grade);
    if (myRank > 0 && meta.maxGradeRank > 0 && myRank === meta.maxGradeRank) {
      tags.push("Highest grade on this street");
    }

    // Earliest/latest listing year on this street.
    if (year && meta.minYear && year === meta.minYear) {
      tags.push(`Earliest listed on this street (${year})`);
    }
    if (year && meta.maxYear && year === meta.maxYear) {
      tags.push(`Most recently listed on this street (${year})`);
    }
  } else {
    if (street !== "Unknown") tags.push("Not ranked (street data incomplete)");
  }

  return (
    <div className="text-sm text-gray-700 space-y-2">
      <div className="font-medium">{name}</div>

      {tags.length > 0 ? (
        <div className="flex flex-wrap gap-1">
          {tags.map((t) => (
            <Badge key={t}>{t}</Badge>
          ))}
        </div>
      ) : null}

      <div className="text-xs text-gray-600 space-y-1">
        <div>
          <span className="font-medium">Grade:</span>{" "}
          {grade && grade !== "Unknown" ? (
            grade
          ) : (
            <span className="text-gray-500">Unknown (missing GRADE field)</span>
          )}
        </div>

        <div>
          <span className="font-medium">Year:</span>{" "}
          {year ? year : <span className="text-gray-500">Unknown (missing listing date)</span>}
        </div>

        <div>
          <span className="font-medium">Street:</span>{" "}
          {street && street !== "Unknown" ? (
            street
          ) : (
            <span className="text-gray-500">Unknown (missing STREET field)</span>
          )}
        </div>
      </div>

      <div className="pt-1">
        {pdf ? (
          <a className="underline text-xs" href={pdf} target="_blank" rel="noreferrer">
            Open official listing PDF
          </a>
        ) : (
          <span className="text-xs text-gray-400">No PDF link available</span>
        )}
      </div>

      <p className="text-xs text-gray-500 leading-relaxed">
        Corridor tags are computed from street-level statistics. Verified details are sourced from
        the official listing PDF.
      </p>
    </div>
  );
}

export default function BuildingStory({ selectedBuilding, streetMetaMap }) {
  const props = selectedBuilding?.properties ?? null;
  const rawName = cleanText(props?.NAME);
  //const pdf = getPdfUrl(props);
  
  // Try a simplified query first, then fall back to the original name.
  const queries = useMemo(() => {
    if (!rawName) return [];
    const q1 = rawName;
    const q2 = simplifyName(rawName);
    if (q2 && q2.toLowerCase() !== q1.toLowerCase()) return [q2, q1];
    return [q1];
  }, [rawName]);

  // Wikipedia panel state
  const [wikiStatus, setWikiStatus] = useState("idle"); // idle | loading | ok | none | error
  const [wikiExtract, setWikiExtract] = useState(null);
  const [wikiUrl, setWikiUrl] = useState(null);
  const [wikiTitle, setWikiTitle] = useState(null);

  async function handleFetchWiki() {
    if (!queries.length) return;

    setWikiStatus("loading");
    setWikiExtract(null);
    setWikiUrl(null);
    setWikiTitle(null);

    for (const q of queries) {
      const result = await fetchWikiSummary(q);

      if (result.ok) {
        setWikiStatus("ok");
        setWikiExtract(result.extract);
        setWikiUrl(result.url);
        setWikiTitle(result.title);
        return;
      }

      // For non-404 errors, stop early.
      if (result.status && result.status !== 404) {
        setWikiStatus("error");
        return;
      }
    }

    setWikiStatus("none");
  }

  function handleClearWiki() {
    setWikiStatus("idle");
    setWikiExtract(null);
    setWikiUrl(null);
    setWikiTitle(null);
  }


  if (!selectedBuilding) {
    return <div className="text-sm text-gray-500">Click a building to load a story.</div>;
  }

  return (
    <div className="space-y-3">
      {/* Always show verified (official) story */}
      <OfficialCard props={props} streetMetaMap={streetMetaMap} />

      {/* Optional external summary (button-triggered to avoid noisy 404s) */}

      <div className="border-t pt-3 space-y-2">
        <div className="flex items-center justify-between">
          <div className="text-xs font-medium text-gray-600">External summary </div>

          <div className="flex items-center gap-3">
            <button
              className="text-xs underline"
              onClick={handleFetchWiki}
              type="button"
              disabled={wikiStatus === "loading" || !queries.length}
              title={!queries.length ? "No building name available" : "Fetch Wikipedia summary"}
       >
              {wikiStatus === "loading" ? "Loading…" : "Load summary"}
       </button>

       <button
         className="text-xs underline text-gray-500"
         type="button"
         onClick={() => {
           setWikiStatus("idle");
           setWikiExtract(null);
           setWikiUrl(null);
           setWikiTitle(null);
         }}
        disabled={wikiStatus === "idle"}
        title="Clear the external summary"
      >
        Clear
      </button>
    </div>
  </div>

  {wikiStatus === "idle" ? (
    <div className="text-xs text-gray-500">
      Learn more here. The official listing PDF above is the verified source.
    </div>
  ) : null}


  {wikiStatus === "none" ? (
    <div className="text-xs text-gray-500">
      No Wikipedia summary found for this name. (Official PDF above is the verified source.)
    </div>
  ) : null}


  {wikiStatus === "error" ? (
    <div className="text-xs text-gray-500">
      Wikipedia fetch failed. Please try again later.
    </div>
  ) : null}


  {wikiStatus === "ok"  ? (
    <div className="space-y-2">
      <div className="text-sm font-medium">{wikiTitle ?? rawName}</div>
      {wikiExtract ? (
        <p className="text-xs text-gray-700 leading-relaxed">{wikiExtract}</p>
      ) : (
        <p className="text-xs text-gray-500">No extract available.</p>
      )}
      {wikiUrl ? (
        <a className="underline text-xs" href={wikiUrl} target="_blank" rel="noreferrer">
          Open Wikipedia
        </a>
      ) : null}
    </div>
  ) : null}

</div>
    </div>
  );
}