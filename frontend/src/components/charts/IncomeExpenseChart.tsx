import { ResponsiveContainer, CartesianGrid, LineChart, Line, XAxis, YAxis, Tooltip, Legend } from "recharts";

export const IncomeExpenseChart = ({ data }: { data: Array<{ period: string; income: number; expense: number }> }) => (
  <ResponsiveContainer width="100%" height={320}>
    <LineChart data={data}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="period" />
      <YAxis />
      <Tooltip />
      <Legend />
      <Line type="monotone" dataKey="income" stroke="#10B981" strokeWidth={3} />
      <Line type="monotone" dataKey="expense" stroke="#EF4444" strokeWidth={3} />
    </LineChart>
  </ResponsiveContainer>
);
