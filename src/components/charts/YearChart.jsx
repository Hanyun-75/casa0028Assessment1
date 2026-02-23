import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// colour
const DEFAULT_COLORS = [
  "#87b6bc",
  "#BED4CB",
  "#F6F09F",
  "#B35656",
  "#758A93",
  "#ECD5BC",
  "#E9B63B",
  "#C66E52",
];
/**
 * Bar chart for listing counts grouped by decade.
 * Input `yearCounts`: 1972: 3, 1975: 9, 1981: 1
 * Output decades: 1970s, 1980s, ...
 */
export default function YearChart({ yearCounts = {}, colors = DEFAULT_COLORS }) {
  // year, ordering
  const years = Object.keys(yearCounts)
    .map((y) => Number(y))
    .filter((y) => Number.isFinite(y))
    .sort((a, b) => a - b);

  if (!years.length) return <div className="text-xs text-gray-500">No year data</div>;

    const minY = years[0];
    const maxY = years[years.length - 1];

  // Build a continuous decade axis so "empty decades" still show up as 0.
  const minDecade = Math.floor(minY / 10) * 10;
  const maxDecade = Math.floor(maxY / 10) * 10;

  const sortedDecades = [];
  for (let d = minDecade; d <= maxDecade; d += 10) sortedDecades.push(d);

  // Initialise all decades to 0 (ensuring that empty decades also exist).
  const decadeBins = {};
  for (const d of sortedDecades) decadeBins[d] = 0;

  // Aggregate each year into its decade bin.
  for (const y of years) {
    const d = Math.floor(y / 10) * 10;
    const count = Number(yearCounts[y] ?? yearCounts[String(y)] ?? 0);
    decadeBins[d] += Number.isFinite(count) ? count : 0;
  }

  // Labels & values sortedDecades
  const labels = sortedDecades.map((d) => `${d}s`);
  const values = sortedDecades.map((d) => decadeBins[d] ?? 0);

  // Colour
  const backgroundColor = labels.map((_, i) => colors[i % colors.length]);

  const data = {
    labels,
    datasets: [
      {
        label: `Counts (${minY}–${maxY})`,
        data: values,
        backgroundColor,
      },
    ],
  };

  const options = {
  responsive: true,
  maintainAspectRatio: true,

 
  aspectRatio: 1.8,

  plugins: {
    legend: { position: "top", labels: { font: { size: 12 } } },
  },

  scales: {
    x: { ticks: { font: { size: 12 } } },
    y: {
      beginAtZero: true,

      // line
      ticks: {
        font: { size: 12 },
        maxTicksLimit: 8, 
      },

      
      grace: "10%",
    },
  },
};
return <Bar data={data} options={options} />;
}