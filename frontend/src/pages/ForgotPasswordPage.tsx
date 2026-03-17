import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { InputField } from "components/forms/InputField";
import { authService } from "services/authService";

export const ForgotPasswordPage = () => {
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit } = useForm<{ email: string }>();

  const onSubmit = async (values: { email: string }) => {
    setLoading(true);
    try {
      await authService.forgotPassword(values);
      toast.success("If the email exists, a reset link/token is sent.");
    } catch {
      toast.error("Unable to process");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Forgot password</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="form-stack">
        <InputField label="Email" type="email" {...register("email")} />
        <button className="primary-btn" type="submit" disabled={loading}>{loading ? "Sending..." : "Send reset"}</button>
      </form>
    </div>
  );
};
