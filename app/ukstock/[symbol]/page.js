"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import dynamic from "next/dynamic";

// Dynamically import the chart component (assume you have one)
const StockChart = dynamic(() => import("@/components/StockChart"), {
  ssr: false,
});

export default function StockChartPage() {
  const { symbol } = useParams();
  const [stockData, setStockData] = useState(null);

  useEffect(() => {
    async function fetchStockData() {
      try {
        const response = await fetch(`/api/ukstock?symbol=${symbol}`);
        const data = await response.json();
        setStockData(data);
      } catch (error) {
        console.error("Error fetching stock data:", error);
      }
    }
    fetchStockData();
  }, [symbol]);

  if (!stockData) return <p>Loading stock data...</p>;

  return (
    <div>
      <h1>Stock Performance: {symbol}</h1>
      <StockChart data={stockData} />
    </div>
  );
}
