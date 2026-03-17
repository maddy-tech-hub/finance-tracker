import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { InputField } from "components/forms/InputField";
import { authService } from "services/authService";
import { useAuthStore } from "store/authStore";
import { loginSchema, type LoginFormValues } from "features/auth/authSchemas";

export const LoginPage = () => {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (values: LoginFormValues) => {
    setLoading(true);
    try {
      const { data } = await authService.login(values);
      const payload = data.data;
      setAuth({ accessToken: payload.accessToken, refreshToken: payload.refreshToken, fullName: payload.fullName });
      toast.success("Welcome back. Dashboard ready.");
      navigate("/");
    } catch {
      toast.error("Login failed. Check email and password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Welcome back</h1>
      <p>Sign in to continue tracking your money with clarity.</p>
      <form onSubmit={handleSubmit(onSubmit)} className="form-stack">
        <InputField label="Email" type="email" {...register("email")} error={errors.email?.message} />
        <InputField
          label="Password"
          type={showPassword ? "text" : "password"}
          {...register("password")}
          error={errors.password?.message}
          endAdornment={
            <button
              type="button"
              className="password-toggle-btn"
              onClick={() => setShowPassword((value) => !value)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
            </button>
          }
        />
        <button className="primary-btn" type="submit" disabled={loading}>
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </form>
      <div className="auth-links">
        <Link to="/signup">Create account</Link>
        <Link to="/forgot-password">Forgot password?</Link>
      </div>
    </div>
  );
};
