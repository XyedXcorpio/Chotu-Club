"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

export function RevenueChart({
  data,
}: {
  data: { name: string; revenue: number; profit: number }[];
}) {
  if (data.length === 0) {
    return (
      <p className="text-sm text-[var(--color-ink-soft)] py-10 text-center">
        No sales recorded yet.
      </p>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
        <CartesianGrid stroke="#E4DFD3" vertical={false} />
        <XAxis
          dataKey="name"
          tick={{ fontSize: 11, fill: "#6b6459" }}
          axisLine={{ stroke: "#E4DFD3" }}
          tickLine={false}
          interval={0}
          angle={-20}
          textAnchor="end"
          height={50}
        />
        <YAxis
          tick={{ fontSize: 11, fill: "#6b6459" }}
          axisLine={false}
          tickLine={false}
          width={44}
        />
        <Tooltip
          formatter={(value) => `Rs ${Number(value).toLocaleString()}`}
          contentStyle={{
            fontSize: 12,
            borderRadius: 8,
            border: "1px solid #E4DFD3",
          }}
        />
        <Bar dataKey="revenue" fill="#1F5E5B" radius={[4, 4, 0, 0]} name="Revenue" />
        <Bar dataKey="profit" fill="#E8A33D" radius={[4, 4, 0, 0]} name="Profit" />
      </BarChart>
    </ResponsiveContainer>
  );
}
