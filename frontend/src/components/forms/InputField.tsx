import { forwardRef, type InputHTMLAttributes } from "react";

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
};

export const InputField = forwardRef<HTMLInputElement, Props>(({ label, error, ...props }, ref) => (
  <label className="field">
    <span>{label}</span>
    <input ref={ref} {...props} />
    {error ? <small>{error}</small> : null}
  </label>
));

InputField.displayName = "InputField";
