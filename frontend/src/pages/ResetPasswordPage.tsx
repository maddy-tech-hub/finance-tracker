import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { InputField } from "components/forms/InputField";
import { authService } from "services/authService";

export const ResetPasswordPage = () => {
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit } = useForm<{ token: string; newPassword: string }>();

  const onSubmit = async (values: { token: string; newPassword: string }) => {
    setLoading(true);
    try {
      await authService.resetPassword(values);
      toast.success("Password reset successful");
    } catch {
      toast.error("Reset failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Reset password</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="form-stack">
        <InputField label="Reset token" {...register("token")} />
        <InputField label="New password" type="password" {...register("newPassword")} />
        <button className="primary-btn" type="submit" disabled={loading}>{loading ? "Resetting..." : "Reset password"}</button>
      </form>
    </div>
  );
};
