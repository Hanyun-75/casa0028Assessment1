import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

//colour
const DEFAULT_COLORS = [
  "#87b6bc",
  "#BED4CB",
  "#F6F09F",
  "#B35656",
 
];

export default function GradeChart({ counts = {}, colors = DEFAULT_COLORS }) {
  const labels = Object.keys(counts);
  const values = labels.map((k) => counts[k]);

  if (!labels.length) return <div className="text-xs text-gray-500">No data</div>;

  //colour
  const backgroundColor = labels.map((_, i) => colors[i % colors.length]);

  const data = {
    labels,
    datasets: [
      {
        label: "Count",
        data: values,
        backgroundColor,
        borderColor: "rgba(255, 255, 255, 1)",
        borderWidth: 1,
      },
    ],
  };

  const options = {
  responsive: true,
  maintainAspectRatio: true,
  aspectRatio: 1.7,
  plugins: {
    legend: {
      position: "bottom",
      labels: { font: { size: 12 } },
    },
  },
};

return <Doughnut data={data} options={options} />;
}