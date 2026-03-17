import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from "recharts";

const COLORS = ["#2563EB", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#06B6D4"];

export const CategorySpendChart = ({ data }: { data: Array<{ categoryName: string; totalAmount: number }> }) => (
  <ResponsiveContainer width="100%" height={320}>
    <PieChart>
      <Pie data={data} dataKey="totalAmount" nameKey="categoryName" cx="50%" cy="50%" outerRadius={110}>
        {data.map((_, idx) => (
          <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
        ))}
      </Pie>
      <Tooltip />
      <Legend />
    </PieChart>
  </ResponsiveContainer>
);
