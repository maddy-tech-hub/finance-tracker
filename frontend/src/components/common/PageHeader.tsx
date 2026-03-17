import type { ReactNode } from "react";

export const PageHeader = ({ title, subtitle, action }: { title: string; subtitle: string; action?: ReactNode }) => (
  <div className="page-header">
    <div>
      <h1>{title}</h1>
      <p>{subtitle}</p>
    </div>
    {action}
  </div>
);
