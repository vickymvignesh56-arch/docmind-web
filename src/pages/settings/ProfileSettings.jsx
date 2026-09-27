import React, { useState, useEffect, useContext } from 'react';
import { User, Mail, Lock, KeyRound, Save, AlertCircle, CheckCircle2, ChevronRight, ChevronUp } from 'lucide-react';
import { userApi } from '../../services/userApi';
import { Input } from '../../components/common/Input/Input';
import { Button } from '../../components/common/Button/Button';
import { Loader } from '../../components/common/Loader/Loader';
import { ErrorMessage } from '../../components/common/ErrorMessage/ErrorMessage';
import { AppContext } from '../../context/AppContext';
import { useAuth } from '../../hooks/useAuth';
import { validateEmail, validatePassword, validateName } from '../../utils/validators';

export const ProfileSettings = () => {
  const { updateProfileState } = useAuth();
  const { toast } = useContext(AppContext);

  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState(null);

  // Profile info state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [profileValidationErrors, setProfileValidationErrors] = useState({});

  // Password change state - Collapsed by default
  const [isPasswordExpanded, setIsPasswordExpanded] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordError, setPasswordError] = useState(null);
  const [passwordSuccess, setPasswordSuccess] = useState(null);
  const [passwordValidationErrors, setPasswordValidationErrors] = useState({});

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      setProfileError(null);
      try {
        const profile = await userApi.getProfile();
        if (profile) {
          setName(profile.name || '');
          setEmail(profile.email || '');
          setIsActive(profile.isActive !== undefined ? profile.isActive : true);
        }
      } catch (err) {
        setProfileError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  // Profile details validation
  const validateProfile = () => {
    const errs = {};
    const nameErr = validateName(name);
    if (nameErr) errs.name = nameErr;

    const emailErr = validateEmail(email);
    if (emailErr) errs.email = emailErr;

    setProfileValidationErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Save basic profile
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!validateProfile()) return;

    setSavingProfile(true);
    try {
      const payload = {
        name: name.trim(),
        email: email.trim(),
        isActive,
      };

      const updated = await userApi.updateProfile(payload);
      updateProfileState(updated);
      toast?.success('Profile updated successfully');
    } catch (err) {
      toast?.error(err.message, 'Profile Update Failed');
    } finally {
      setSavingProfile(false);
    }
  };

  // Password change validation
  const validatePasswordChange = () => {
    const errs = {};

    if (!oldPassword || !oldPassword.trim()) {
      errs.oldPassword = 'Current password is required.';
    }

    if (!newPassword || !newPassword.trim()) {
      errs.newPassword = 'New password is required.';
    } else {
      const passErr = validatePassword(newPassword);
      if (passErr) {
        errs.newPassword = passErr;
      }
    }

    if (!confirmPassword || !confirmPassword.trim()) {
      errs.confirmPassword = 'Confirm new password is required.';
    } else if (newPassword !== confirmPassword) {
      errs.confirmPassword = 'New passwords do not match.';
    }

    setPasswordValidationErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Handle password change submission
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    // Validate frontend rules first
    if (!validatePasswordChange()) {
      return;
    }

    setPasswordSaving(true);
    try {
      // Send only oldPassword and newPassword (JWT identifies authenticated user)
      await userApi.changePassword({
        oldPassword: oldPassword.trim(),
        newPassword: newPassword.trim(),
      });

      setPasswordSuccess('Password updated successfully');

      // Clear all password fields
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordValidationErrors({});
    } catch (err) {
      const errMsg = err.message || 'Current password is incorrect';
      setPasswordError(errMsg);
    } finally {
      setPasswordSaving(false);
    }
  };

  if (loading) {
    return <Loader message="Loading profile details..." />;
  }

  return (
    <div style={{ maxWidth: '640px' }} className="flex flex-col gap-8">
      <div>
        <h3>Account & Profile</h3>
        <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>
          Manage your personal details and authentication credentials
        </p>
      </div>

      {profileError && <ErrorMessage message={profileError} />}

      {/* Form 1: Profile Details */}
      <form
        onSubmit={handleSaveProfile}
        style={{
          background: 'var(--color-bg-surface)',
          padding: 'var(--space-6)',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--color-border)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-4)',
          boxShadow: 'var(--shadow-xs)',
        }}
      >
        <h4 style={{ fontSize: 'var(--font-size-base)', fontWeight: 700, margin: 0 }}>
          Personal Information
        </h4>

        <Input
          label="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          icon={User}
          required
          error={profileValidationErrors.name}
        />

        <Input
          label="Email Address"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          icon={Mail}
          required
          error={profileValidationErrors.email}
        />

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: 'var(--space-3) var(--space-4)',
            backgroundColor: 'var(--color-bg-subtle)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-border)',
          }}
        >
          <div>
            <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600 }}>
              Account Active Status
            </div>
            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
              Enable or disable your account access
            </div>
          </div>

          <label className="form-switch">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
            />
            <span className="form-slider" />
          </label>
        </div>

        <div className="flex justify-end mt-2">
          <Button type="submit" variant="primary" icon={Save} loading={savingProfile}>
            Save Profile Changes
          </Button>
        </div>
      </form>

      {/* Form 2: Change Password - Collapsible Accordion */}
      <div
        style={{
          background: 'var(--color-bg-surface)',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--color-border)',
          boxShadow: 'var(--shadow-xs)',
          overflow: 'hidden',
        }}
      >
        <button
          type="button"
          onClick={() => {
            setIsPasswordExpanded((prev) => !prev);
            setPasswordError(null);
            setPasswordSuccess(null);
          }}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: 'var(--space-5) var(--space-6)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            textAlign: 'left',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: 'var(--font-size-base)', fontWeight: 700, color: 'var(--color-text-primary)' }}>
              Change Password
            </span>
            {isPasswordExpanded && (
              <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                To update your password, enter your current password followed by your new password.
              </span>
            )}
          </div>
          {isPasswordExpanded ? (
            <ChevronUp size={18} style={{ color: 'var(--color-text-muted)', flexShrink: 0 }} />
          ) : (
            <ChevronRight size={18} style={{ color: 'var(--color-text-muted)', flexShrink: 0 }} />
          )}
        </button>

        {isPasswordExpanded && (
          <form
            onSubmit={handleChangePassword}
            style={{
              padding: '0 var(--space-6) var(--space-6) var(--space-6)',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-4)',
              borderTop: '1px solid var(--color-border)',
              paddingTop: 'var(--space-4)',
            }}
          >
            {/* Backend Error inside Profile Settings Area */}
            {passwordError && (
              <div
                style={{
                  padding: 'var(--space-3) var(--space-4)',
                  background: 'var(--color-error-light)',
                  border: '1px solid #fecaca',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--color-error)',
                  fontSize: 'var(--font-size-xs)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-2)',
                }}
              >
                <AlertCircle size={15} style={{ flexShrink: 0 }} />
                <span>{passwordError}</span>
              </div>
            )}

            {/* Success Notice */}
            {passwordSuccess && (
              <div
                style={{
                  padding: 'var(--space-3) var(--space-4)',
                  background: 'var(--color-success-light)',
                  border: '1px solid #bbf7d0',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--color-success)',
                  fontSize: 'var(--font-size-xs)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-2)',
                }}
              >
                <CheckCircle2 size={15} style={{ flexShrink: 0 }} />
                <span>{passwordSuccess}</span>
              </div>
            )}

            <Input
              label="Current Password"
              type="password"
              value={oldPassword}
              onChange={(e) => {
                setOldPassword(e.target.value);
                if (passwordError) setPasswordError(null);
              }}
              icon={Lock}
              placeholder="Enter current password"
              required
              error={passwordValidationErrors.oldPassword}
            />

            <Input
              label="New Password"
              type="password"
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value);
                if (passwordError) setPasswordError(null);
              }}
              icon={KeyRound}
              placeholder="Enter new password"
              required
              error={passwordValidationErrors.newPassword}
              helperText="Min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special character"
            />

            <Input
              label="Confirm New Password"
              type="password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (passwordError) setPasswordError(null);
              }}
              icon={KeyRound}
              placeholder="Confirm new password"
              required
              error={passwordValidationErrors.confirmPassword}
            />

            <div className="flex justify-end mt-2">
              <Button
                type="submit"
                variant="primary"
                icon={KeyRound}
                loading={passwordSaving}
              >
                Update Password
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

