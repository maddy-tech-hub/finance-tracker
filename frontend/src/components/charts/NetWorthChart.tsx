import { ResponsiveContainer, CartesianGrid, LineChart, Line, XAxis, YAxis, Tooltip } from "recharts";

type NetWorthChartProps = {
  data: Array<{ date: string; netWorth: number }>;
  height?: number;
};

const isIsoDay = (value: string) => /^\d{4}-\d{2}-\d{2}$/.test(value);

const formatAxisDate = (value: string) => {
  if (!isIsoDay(value)) return value;
  const parsed = new Date(`${value}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
};

const formatTooltipDate = (value: string) => {
  if (!isIsoDay(value)) return value;
  const parsed = new Date(`${value}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};

export const NetWorthChart = ({ data, height = 320 }: NetWorthChartProps) => (
  <ResponsiveContainer width="100%" height={height}>
    <LineChart data={data}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis
        dataKey="date"
        tickFormatter={formatAxisDate}
        minTickGap={24}
        interval="preserveStartEnd"
        tick={{ fontSize: 12, fill: "#64748b" }}
        tickMargin={10}
        tickLine={false}
      />
      <YAxis width={46} tick={{ fontSize: 12, fill: "#64748b" }} tickLine={false} />
      <Tooltip labelFormatter={(label) => formatTooltipDate(String(label))} />
      <Line type="monotone" dataKey="netWorth" stroke="#2563EB" strokeWidth={3} dot={false} />
    </LineChart>
  </ResponsiveContainer>
);
