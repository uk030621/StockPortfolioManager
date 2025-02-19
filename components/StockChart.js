"use client";

import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
} from "chart.js";

// ✅ Register Chart.js components
ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement);

export default function StockChart({ data }) {
  console.log("🔍 Debug: StockChart received data:", data);

  if (!data || typeof data !== "object") {
    console.warn("⚠️ Warning: Data is undefined or not an object.");
    return <p>Loading chart...</p>;
  }

  if (!Array.isArray(data.labels)) {
    console.error(
      "❌ Error: data.labels is missing or not an array!",
      data.labels
    );
    return <p>Error: No time labels available.</p>;
  }

  if (!data.datasets || !Array.isArray(data.datasets)) {
    console.error(
      "❌ Error: data.datasets is missing or not an array!",
      data.datasets
    );
    return <p>Error: No stock data available.</p>;
  }

  if (!data.datasets[0]?.data || !Array.isArray(data.datasets[0].data)) {
    console.error(
      "❌ Error: data.datasets[0].data is missing or not an array!",
      data.datasets[0]?.data
    );
    return <p>Error: Stock price data unavailable.</p>;
  }

  const chartData = {
    labels: data.labels || [], // Default empty array to prevent crashes
    datasets: [
      {
        label: "Stock Price (€)",
        data: data.datasets[0]?.data || [], // Default to empty array
        borderColor: "blue",
        backgroundColor: "rgba(0, 255, 0, 0.2)",
        tension: 0.2,
      },
    ],
  };

  return (
    <div className="p-4 border rounded-lg shadow-lg bg-white">
      <h2 className="text-xl font-bold mb-2">Stock Performance</h2>
      <Line data={chartData} />
    </div>
  );
}
