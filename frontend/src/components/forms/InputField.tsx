import type { InputHTMLAttributes } from "react";

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
};

export const InputField = ({ label, error, ...props }: Props) => (
  <label className="field">
    <span>{label}</span>
    <input {...props} />
    {error ? <small>{error}</small> : null}
  </label>
);
