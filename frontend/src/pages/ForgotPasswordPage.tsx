import { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { isAxiosError } from "axios";
import toast from "react-hot-toast";
import { InputField } from "components/forms/InputField";
import { authService } from "services/authService";

type ForgotPasswordFormValues = {
  email: string;
};

export const ForgotPasswordPage = () => {
  const [generatedToken, setGeneratedToken] = useState<string>("");
  const [expiresAtLabel, setExpiresAtLabel] = useState<string>("");
  const [tokenInfoMessage, setTokenInfoMessage] = useState<string>("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<ForgotPasswordFormValues>();

  const onSubmit = async (values: ForgotPasswordFormValues) => {
    try {
      const { data } = await authService.forgotPassword(values);
      const token = data?.data?.token;
      const expiresAtUtc = data?.data?.expiresAtUtc;

      if (!token) {
        setGeneratedToken("");
        setExpiresAtLabel("");
        setTokenInfoMessage("Token was not returned by API. Please restart backend and try again.");
        toast.error("Token not returned by API.");
        return;
      }

      setTokenInfoMessage("");
      setGeneratedToken(token);
      setExpiresAtLabel(expiresAtUtc ? new Date(expiresAtUtc).toLocaleString() : "Not provided");
      toast.success("Reset token generated.");
    } catch (error) {
      const message = isAxiosError(error)
        ? (error.response?.data?.message ?? "Unable to generate reset token.")
        : "Unable to generate reset token.";
      toast.error(message);
    }
  };

  return (
    <div className="auth-form-shell">
      <h1>Forgot password</h1>
      <p>Enter your email to generate a reset token, then use that token on the reset screen.</p>
      <form onSubmit={handleSubmit(onSubmit)} className="form-stack">
        <InputField
          label="Email"
          type="email"
          {...register("email", { required: "Email is required." })}
          error={errors.email?.message}
        />
        <button className="primary-btn" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Generating..." : "Generate Reset Token"}
        </button>
      </form>

      {generatedToken ? (
        <div className="auth-token-box">
          <p>Reset token (valid for 30 minutes)</p>
          <code>{generatedToken}</code>
          <small>Expires at: {expiresAtLabel}</small>
          <button
            className="ghost-btn"
            type="button"
            onClick={() => {
              navigator.clipboard.writeText(generatedToken);
              toast.success("Token copied");
            }}
          >
            Copy token
          </button>
          <Link to={`/reset-password?token=${encodeURIComponent(generatedToken)}`}>Continue to reset password</Link>
        </div>
      ) : null}
      {tokenInfoMessage ? <p className="muted-text">{tokenInfoMessage}</p> : null}

      <div className="auth-links">
        <Link to="/reset-password">Have token? Reset password</Link>
        <Link to="/login">Back to sign in</Link>
      </div>
    </div>
  );
};
