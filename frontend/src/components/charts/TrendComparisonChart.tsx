import { ResponsiveContainer, CartesianGrid, LineChart, Line, XAxis, YAxis, Tooltip, Legend } from "recharts";

type TrendComparisonChartProps = {
  data: Array<{ period: string; savingsRate: number; income: number; expense: number }>;
  height?: number;
};

const isYearMonth = (value: string) => /^\d{4}-\d{2}$/.test(value);

const formatPeriod = (value: string) => {
  if (!isYearMonth(value)) return value;
  const parsed = new Date(`${value}-01T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString("en-GB", { month: "short", year: "2-digit" });
};

export const TrendComparisonChart = ({ data, height = 320 }: TrendComparisonChartProps) => (
  <ResponsiveContainer width="100%" height={height}>
    <LineChart data={data}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis
        dataKey="period"
        tickFormatter={formatPeriod}
        minTickGap={20}
        interval="preserveStartEnd"
        tick={{ fontSize: 12, fill: "#64748b" }}
        tickMargin={10}
        tickLine={false}
      />
      <YAxis tick={{ fontSize: 12, fill: "#64748b" }} tickLine={false} />
      <Tooltip />
      <Legend />
      <Line type="monotone" dataKey="savingsRate" stroke="#16A34A" strokeWidth={3} />
      <Line type="monotone" dataKey="income" stroke="#2563EB" strokeWidth={2} />
      <Line type="monotone" dataKey="expense" stroke="#EF4444" strokeWidth={2} />
    </LineChart>
  </ResponsiveContainer>
);
