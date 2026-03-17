import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Bar } from "recharts";

export const SavingsProgressChart = ({ data }: { data: Array<{ goalName: string; progressPercent: number }> }) => (
  <ResponsiveContainer width="100%" height={320}>
    <BarChart data={data}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="goalName" />
      <YAxis domain={[0, 100]} />
      <Tooltip />
      <Bar dataKey="progressPercent" fill="#2563EB" radius={[8, 8, 0, 0]} />
    </BarChart>
  </ResponsiveContainer>
);
