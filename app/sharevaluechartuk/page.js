"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LabelList,
} from "recharts";

export default function ShareValueChartPage() {
  const [chartData, setChartData] = useState([]);
  const [isMobile, setIsMobile] = useState(false);
  const [totalPortfolioValue, setTotalPortfolioValue] = useState(0);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    async function fetchData() {
      const res = await fetch("/api/ukstock");
      const rawData = await res.json();

      const cleaned = rawData
        .map((stock) => ({
          symbol: stock.symbol,
          totalValue: parseFloat(stock.totalValue) / 100,
        }))
        .sort((a, b) => b.totalValue - a.totalValue);

      setChartData(cleaned);

      // Compute total portfolio value
      const total = cleaned.reduce((acc, stock) => acc + stock.totalValue, 0);
      setTotalPortfolioValue(total);
    }

    fetchData();
  }, []);

  function CustomLabel({ x, y, value, width }) {
    if (!value || isNaN(value)) return null;

    const centerX = x + width / 1.3;
    const centerY = y - 45;

    return (
      <text
        x={centerX}
        y={centerY}
        transform={`rotate(-90, ${centerX}, ${centerY})`}
        textAnchor="end"
        fill="grey"
        fontSize={isMobile ? 8 : 12}
      >
        £{Math.ceil(value).toLocaleString()}
      </text>
    );
  }

  return (
    <div
      style={{
        margin: "0 auto",
        width: "95%",
        maxWidth: "1200px",
        height: isMobile ? "600px" : "auto",
        padding: isMobile ? "0rem" : "2rem",
      }}
    >
      <h2
        style={{
          textAlign: "center",
          fontSize: isMobile ? "1.5rem" : "2rem",
          fontWeight: "600",
          marginBottom: isMobile ? "1rem" : "2rem",
          color: "#2D3748",
        }}
      >
        UK Stock Chart
      </h2>
      <div style={{ display: "flex", justifyContent: "center" }}>
        <Link href={"/ukstock"}>
          <button className="input-stock-button">Home</button>
        </Link>
      </div>
      {/* 🟢 Indicative Value */}
      <h2
        className="sub-heading"
        style={{
          textAlign: "center",
          fontSize: isMobile ? "1rem" : "1.25rem",
          marginBottom: isMobile ? "0rem" : "2rem",
        }}
      >
        Indicative Value:{" "}
        <span className="total-value">
          £
          {totalPortfolioValue.toLocaleString("en-GB", {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
          })}
        </span>
      </h2>

      <div
        style={{
          display: isMobile ? "flex" : "block",
          justifyContent: "center",
          alignItems: isMobile ? "center" : "initial",
          height: isMobile ? "500px" : "auto",
        }}
      >
        <ResponsiveContainer width="100%" height={isMobile ? 450 : 700}>
          <BarChart
            data={chartData}
            margin={{
              top: isMobile ? 50 : 60,
              right: isMobile ? 30 : 60,
              left: isMobile ? 0 : 30,
              bottom: isMobile ? 100 : 80,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="symbol"
              interval={0}
              angle={isMobile ? -90 : -45}
              textAnchor="end"
              fontSize={isMobile ? 8 : 12}
              height={isMobile ? 100 : 60}
            />
            <YAxis
              tickFormatter={(value) =>
                `£${Math.ceil(value / 1000).toLocaleString()}K`
              }
              fontSize={isMobile ? 10 : 12}
            />
            <Tooltip
              formatter={(value) => [
                `£${Math.ceil(value).toLocaleString()}`,
                "Value",
              ]}
            />
            <Bar dataKey="totalValue" fill="#4299E1" radius={[4, 4, 0, 0]}>
              <LabelList dataKey="totalValue" content={CustomLabel} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
