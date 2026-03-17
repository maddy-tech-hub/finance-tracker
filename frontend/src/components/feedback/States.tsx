import { FiInbox, FiLoader } from "react-icons/fi";

export const LoadingState = ({ text = "Loading your finance data..." }: { text?: string }) => (
  <div className="state loading" role="status" aria-live="polite">
    <FiLoader className="spin" />
    <p>{text}</p>
  </div>
);

export const EmptyState = ({ text, hint }: { text: string; hint?: string }) => (
  <div className="state empty">
    <FiInbox />
    <p>{text}</p>
    {hint ? <small>{hint}</small> : null}
  </div>
);
