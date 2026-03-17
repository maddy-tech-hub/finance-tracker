import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import { isAxiosError } from "axios";
import toast from "react-hot-toast";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { InputField } from "components/forms/InputField";
import { authService } from "services/authService";
import { signupSchema, type SignupFormValues } from "features/auth/authSchemas";

export const SignupPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<SignupFormValues>({ resolver: zodResolver(signupSchema) });

  const onSubmit = async (values: SignupFormValues) => {
    setLoading(true);
    try {
      await authService.register(values);
      toast.success("Account created. You can now sign in.");
      navigate("/login");
    } catch (error) {
      const message = isAxiosError(error)
        ? (error.response?.data?.message ?? "Registration failed. Please review your details.")
        : "Registration failed. Please review your details.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Create account</h1>
      <p>Set up your workspace and get your first financial snapshot in minutes.</p>
      <form onSubmit={handleSubmit(onSubmit)} className="form-stack">
        <InputField label="First name" {...register("firstName")} error={errors.firstName?.message} />
        <InputField label="Last name" {...register("lastName")} error={errors.lastName?.message} />
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
          {loading ? "Creating..." : "Create Account"}
        </button>
      </form>
      <div className="auth-links">
        <Link to="/login">Already have an account?</Link>
      </div>
    </div>
  );
};
