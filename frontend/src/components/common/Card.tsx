import type { ReactNode } from "react";

type CardProps = {
  title?: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
};

export const Card = ({ title, subtitle, action, children, className }: CardProps) => (
  <section className={`card ${className ?? ""}`.trim()}>
    {title || subtitle || action ? (
      <div className="card-head">
        <div>
          {title ? <h3>{title}</h3> : null}
          {subtitle ? <p>{subtitle}</p> : null}
        </div>
        {action ? <div className="card-action">{action}</div> : null}
      </div>
    ) : null}
    {children}
  </section>
);
