import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
  endAdornment?: ReactNode;
};

export const InputField = forwardRef<HTMLInputElement, Props>(({ label, error, endAdornment, ...props }, ref) => (
  <label className="field">
    <span>{label}</span>
    <div className={`field-input-wrap${endAdornment ? " has-end-adornment" : ""}`}>
      <input ref={ref} {...props} />
      {endAdornment ? <div className="field-end-adornment">{endAdornment}</div> : null}
    </div>
    {error ? <small>{error}</small> : null}
  </label>
));

InputField.displayName = "InputField";
