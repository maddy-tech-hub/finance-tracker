import { useEffect, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { FiCalendar, FiEdit2, FiEye, FiEyeOff, FiKey, FiLogOut, FiMail, FiUser } from "react-icons/fi";
import toast from "react-hot-toast";
import { Card } from "components/common/Card";
import { InputField } from "components/forms/InputField";
import { authService } from "services/authService";
import { useAuthStore } from "store/authStore";
import { getApiErrorMessage } from "utils/apiError";

export const UserProfilePage = () => {
  const logout = useAuthStore((s) => s.logout);
  const setFullName = useAuthStore((s) => s.setFullName);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [activePanel, setActivePanel] = useState<"edit" | "password">("edit");

  const profileQuery = useQuery({
    queryKey: ["auth", "me"],
    queryFn: async () => (await authService.me()).data.data
  });

  useEffect(() => {
    if (profileQuery.data) {
      setFirstName(profileQuery.data.firstName);
      setLastName(profileQuery.data.lastName);
      setFullName(profileQuery.data.fullName);
    }
  }, [profileQuery.data, setFullName]);

  const updateProfile = useMutation({
    mutationFn: authService.updateProfile,
    onSuccess: (response) => {
      const fullName = response.data.data.fullName;
      setFullName(fullName);
      toast.success("Profile updated");
    },
    onError: (error) => toast.error(getApiErrorMessage(error, "Unable to update profile"))
  });

  const changePassword = useMutation({
    mutationFn: authService.changePassword,
    onSuccess: () => {
      setCurrentPassword("");
      setNewPassword("");
      toast.success("Password changed");
    },
    onError: (error) => toast.error(getApiErrorMessage(error, "Unable to change password"))
  });

  return (
    <div className="page-grid profile-page">
      <section className="profile-hero">
        <div>
          <h1>{`Welcome back, ${profileQuery.data?.firstName ?? "User"}!`}</h1>
          <p>Here is your account overview and security controls.</p>
        </div>
        <div className="profile-hero-actions">
          <button type="button" className="ghost-btn profile-action-btn" onClick={() => setActivePanel("edit")}>
            <FiEdit2 /> Edit
          </button>
          <button type="button" className="ghost-btn profile-action-btn" onClick={() => setActivePanel("password")}>
            <FiKey /> Password
          </button>
          <button type="button" className="danger-btn profile-action-btn" onClick={logout}>
            <FiLogOut /> Logout
          </button>
        </div>
      </section>

      {profileQuery.isLoading ? <Card><p>Loading profile...</p></Card> : null}
      {profileQuery.isError ? <Card><p>Unable to load profile right now.</p></Card> : null}

      {profileQuery.data ? (
        <>
          <Card className="profile-summary-card">
            <div className="profile-summary">
              <div className="profile-avatar">{profileQuery.data.firstName.charAt(0).toUpperCase()}</div>
              <div>
                <h2>{profileQuery.data.fullName}</h2>
                <p>{profileQuery.data.email}</p>
                <div className="profile-badges">
                  <span className="chip">User</span>
                  <span className="chip chip-income">Active</span>
                </div>
              </div>
            </div>
            <div className="profile-meta-grid">
              <div className="profile-meta-card">
                <span><FiUser /></span>
                <div>
                  <small>User ID</small>
                  <strong>{profileQuery.data.userId.slice(0, 8)}</strong>
                </div>
              </div>
              <div className="profile-meta-card">
                <span><FiCalendar /></span>
                <div>
                  <small>Member Since</small>
                  <strong>{new Date(profileQuery.data.memberSinceUtc).toLocaleDateString()}</strong>
                </div>
              </div>
              <div className="profile-meta-card">
                <span><FiMail /></span>
                <div>
                  <small>Email</small>
                  <strong>{profileQuery.data.email}</strong>
                </div>
              </div>
            </div>
          </Card>

          {activePanel === "edit" ? (
            <Card title="Edit Profile">
              <form
                className="form-stack"
                onSubmit={(event) => {
                  event.preventDefault();
                  updateProfile.mutate({ firstName, lastName });
                }}
              >
                <InputField label="First name" value={firstName} onChange={(event) => setFirstName(event.target.value)} required />
                <InputField label="Last name" value={lastName} onChange={(event) => setLastName(event.target.value)} required />
                <button className="primary-btn" type="submit" disabled={updateProfile.isPending}>
                  {updateProfile.isPending ? "Saving..." : "Save Profile"}
                </button>
              </form>
            </Card>
          ) : (
            <Card title="Change Password" subtitle="Use a strong password with uppercase, lowercase and number.">
              <form
                className="form-stack"
                onSubmit={(event) => {
                  event.preventDefault();
                  changePassword.mutate({ currentPassword, newPassword });
                }}
              >
                <InputField
                  label="Current password"
                  type={showCurrentPassword ? "text" : "password"}
                  value={currentPassword}
                  onChange={(event) => setCurrentPassword(event.target.value)}
                  required
                  endAdornment={
                    <button
                      type="button"
                      className="password-toggle-btn"
                      onClick={() => setShowCurrentPassword((value) => !value)}
                      aria-label={showCurrentPassword ? "Hide current password" : "Show current password"}
                    >
                      {showCurrentPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                    </button>
                  }
                />
                <InputField
                  label="New password"
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  required
                  endAdornment={
                    <button
                      type="button"
                      className="password-toggle-btn"
                      onClick={() => setShowNewPassword((value) => !value)}
                      aria-label={showNewPassword ? "Hide new password" : "Show new password"}
                    >
                      {showNewPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                    </button>
                  }
                />
                <button className="primary-btn" type="submit" disabled={changePassword.isPending}>
                  {changePassword.isPending ? "Updating..." : "Change Password"}
                </button>
              </form>
            </Card>
          )}
        </>
      ) : null}
    </div>
  );
};
