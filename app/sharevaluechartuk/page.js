"use client";

import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LabelList,
} from "recharts";
import Link from "next/link";

export default function ShareValueChartPage() {
  const [chartData, setChartData] = useState([]);
  const [isMobile, setIsMobile] = useState(false);
  const [filterLimit, setFilterLimit] = useState(10);
  const [chartType, setChartType] = useState("bar"); // "bar" or "pie"

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
          totalValue: parseFloat(stock.totalValue) / 100, // pence to pounds
        }))
        .sort((a, b) => b.totalValue - a.totalValue);

      setChartData(cleaned);
    }

    fetchData();
  }, []);

  const filteredData = chartData.slice(0, filterLimit);

  const CustomLabel = ({ x, y, value, width }) => {
    if (!value || isNaN(value)) return null;

    const centerX = x + width / 1.3;
    const centerY = y - 45;

    return (
      <text
        x={centerX}
        y={centerY}
        transform={`rotate(-90, ${centerX}, ${centerY})`}
        textAnchor="end"
        fill="slategray"
        fontSize={isMobile ? 9 : 12}
      >
        £{Math.ceil(value).toLocaleString()}
      </text>
    );
  };

  const COLORS = [
    "#8884d8",
    "#82ca9d",
    "#ffc658",
    "#ff7f50",
    "#8dd1e1",
    "#d0ed57",
    "#a4de6c",
    "#d884d8",
    "#ffa07a",
    "#66cdaa",
  ];

  return (
    <div
      style={{
        margin: "0 auto",
        width: "95%",
        maxWidth: "1200px",
        padding: isMobile ? "1rem" : "2rem",
      }}
    >
      <h2
        style={{
          textAlign: "center",
          fontSize: isMobile ? "1.5rem" : "2rem",
          fontWeight: "600",
          marginBottom: "0.5rem",
          color: "#2D3748",
        }}
      >
        UK Stock Value Chart
      </h2>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          marginBottom: "1rem",
        }}
      >
        <Link href={"/ukstock"}>
          <button className="input-stock-button">Home</button>
        </Link>
      </div>
      {/* Filter & Chart Toggle */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: "1rem",
          marginBottom: "1.5rem",
        }}
      >
        <div>
          <label htmlFor="filter">Show Top:</label>
          <select
            id="filter"
            value={filterLimit}
            onChange={(e) => setFilterLimit(Number(e.target.value))}
            style={{ marginLeft: "0.5rem", padding: "0.4rem" }}
          >
            <option value={5}>Top 5</option>
            <option value={10}>Top 10</option>
            <option value={20}>Top 20</option>
            <option value={1000}>All</option>
          </select>
        </div>

        <div>
          <label htmlFor="chartType">Chart:</label>
          <select
            id="chartType"
            value={chartType}
            onChange={(e) => setChartType(e.target.value)}
            style={{ marginLeft: "0.5rem", padding: "0.4rem" }}
          >
            <option value="bar">Bar</option>
            <option value="pie">Pie</option>
          </select>
        </div>
      </div>

      {/* Chart Area */}
      <ResponsiveContainer
        width="100%"
        height={isMobile ? 400 : 500}
        style={{
          border: "1px solid #eee",
          borderRadius: "8px",
          background: "#f9f9f9",
        }}
      >
        {chartType === "bar" ? (
          <BarChart
            data={filteredData}
            margin={{
              top: 50,
              right: 30,
              left: 50,
              bottom: isMobile ? 100 : 80,
            }}
          >
            <CartesianGrid strokeDasharray="1 1" />
            <XAxis
              dataKey="symbol"
              interval={0}
              angle={isMobile ? -90 : -45}
              textAnchor="end"
              fontSize={isMobile ? 9 : 12}
              height={isMobile ? 100 : 60}
            />
            <YAxis
              tickFormatter={(value) => `£${Math.ceil(value).toLocaleString()}`}
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
        ) : (
          <ResponsiveContainer width="100%" height={isMobile ? 300 : 500}>
            <PieChart>
              <Pie
                data={filteredData}
                dataKey="totalValue"
                nameKey="symbol"
                cx="50%"
                cy="50%"
                innerRadius={isMobile ? 30 : 60}
                outerRadius={isMobile ? 80 : 120}
                label={({ name, percent }) =>
                  `${name} (${(percent * 100).toFixed(0)}%)`
                }
                labelLine={!isMobile} // hide connector lines on mobile
                fontSize={isMobile ? 12 : 18}
              >
                {filteredData.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => [
                  `£${Math.ceil(value).toLocaleString()}`,
                  "Value",
                ]}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </ResponsiveContainer>
    </div>
  );
}
