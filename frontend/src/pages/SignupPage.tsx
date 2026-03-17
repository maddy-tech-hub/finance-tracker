import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { InputField } from "components/forms/InputField";
import { authService } from "services/authService";
import { signupSchema, type SignupFormValues } from "features/auth/authSchemas";

export const SignupPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
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
    } catch {
      toast.error("Registration failed. Please review your details.");
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
        <InputField label="Password" type="password" {...register("password")} error={errors.password?.message} />
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
