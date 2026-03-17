import { FiArrowDownRight, FiArrowUpRight, FiMinus } from "react-icons/fi";
import { formatCurrency } from "utils/format";

type StatCardProps = {
  label: string;
  value: number;
  tone?: "neutral" | "success" | "danger";
  hint?: string;
};

export const StatCard = ({ label, value, tone = "neutral", hint }: StatCardProps) => {
  const icon = tone === "success" ? <FiArrowUpRight /> : tone === "danger" ? <FiArrowDownRight /> : <FiMinus />;

  return (
    <div className={`stat-card ${tone}`}>
      <div className="stat-meta">
        <p>{label}</p>
        <span>{icon}</span>
      </div>
      <h2>{formatCurrency(value)}</h2>
      {hint ? <small>{hint}</small> : null}
    </div>
  );
};
