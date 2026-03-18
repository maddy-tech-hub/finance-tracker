import { useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { isAxiosError } from "axios";
import toast from "react-hot-toast";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { InputField } from "components/forms/InputField";
import { authService } from "services/authService";

type ResetPasswordFormValues = {
  token: string;
  newPassword: string;
  confirmPassword: string;
};

export const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const defaultToken = useMemo(() => searchParams.get("token") ?? "", [searchParams]);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch
  } = useForm<ResetPasswordFormValues>({
    defaultValues: { token: defaultToken, newPassword: "", confirmPassword: "" }
  });

  const onSubmit = async (values: ResetPasswordFormValues) => {
    try {
      await authService.resetPassword({ token: values.token, newPassword: values.newPassword });
      toast.success("Password reset successful. Please sign in.");
      navigate("/login");
    } catch (error) {
      const message = isAxiosError(error)
        ? (error.response?.data?.message ?? "Unable to reset password.")
        : "Unable to reset password.";
      toast.error(message);
    }
  };

  return (
    <div className="auth-form-shell">
      <h1>Reset password</h1>
      <p>Paste your reset token and set a new password.</p>
      <form onSubmit={handleSubmit(onSubmit)} className="form-stack">
        <InputField
          label="Reset token"
          {...register("token", { required: "Reset token is required." })}
          error={errors.token?.message}
        />
        <InputField
          label="New password"
          type={showPassword ? "text" : "password"}
          {...register("newPassword", {
            required: "New password is required.",
            minLength: { value: 8, message: "Password must be at least 8 characters." },
            validate: (value) =>
              /[A-Z]/.test(value) && /[a-z]/.test(value) && /[0-9]/.test(value)
                ? true
                : "Password must contain uppercase, lowercase and number."
          })}
          error={errors.newPassword?.message}
          endAdornment={
            <button
              type="button"
              className="password-toggle-btn"
              onClick={() => setShowPassword((value) => !value)}
              aria-label={showPassword ? "Hide new password" : "Show new password"}
            >
              {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
            </button>
          }
        />
        <InputField
          label="Confirm password"
          type={showConfirmPassword ? "text" : "password"}
          {...register("confirmPassword", {
            required: "Confirm password is required.",
            validate: (value) => (value === watch("newPassword") ? true : "Passwords do not match.")
          })}
          error={errors.confirmPassword?.message}
          endAdornment={
            <button
              type="button"
              className="password-toggle-btn"
              onClick={() => setShowConfirmPassword((value) => !value)}
              aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
            >
              {showConfirmPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
            </button>
          }
        />
        <button className="primary-btn" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Resetting..." : "Reset Password"}
        </button>
      </form>
      <div className="auth-links">
        <Link to="/login">Back to sign in</Link>
      </div>
    </div>
  );
};
