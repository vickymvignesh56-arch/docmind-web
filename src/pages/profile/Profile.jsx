import React, { useState, useEffect, useRef, useContext } from 'react';
import {
  User,
  Mail,
  Lock,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Camera,
  Trash2,
  Edit2,
  X,
  Save,
} from 'lucide-react';
import { userApi } from '../../services/userApi';
import { useAuth } from '../../hooks/useAuth';
import { AppContext } from '../../context/AppContext';
import { Input } from '../../components/common/Input/Input';
import { Button } from '../../components/common/Button/Button';
import { Modal } from '../../components/common/Modal/Modal';
import { Loader } from '../../components/common/Loader/Loader';
import { ErrorMessage } from '../../components/common/ErrorMessage/ErrorMessage';
import { validateEmail, validatePassword, validateName } from '../../utils/validators';
import './Profile.css';

export const Profile = () => {
  const { user, updateProfileState } = useAuth();
  const { toast } = useContext(AppContext);

  const fileInputRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [profileError, setProfileError] = useState(null);

  // Profile data state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [avatar, setAvatar] = useState('');

  // Modals state
  const [activeModal, setActiveModal] = useState(null); // 'name' | 'email' | 'password' | 'status' | null
  const [modalSaving, setModalSaving] = useState(false);
  const [modalError, setModalError] = useState(null);

  // Form edit fields
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editStatus, setEditStatus] = useState(true);

  // Password fields
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordValidationErrors, setPasswordValidationErrors] = useState({});

  // Fetch current profile from backend
  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setProfileError(null);
      try {
        const profile = await userApi.getProfile();
        if (profile) {
          setName(profile.name || user?.name || '');
          setEmail(profile.email || user?.email || '');
          setIsActive(profile.isActive !== undefined ? profile.isActive : user?.isActive !== undefined ? user.isActive : true);
          setAvatar(profile.avatar || user?.avatar || '');
        }
      } catch (err) {
        console.warn('Profile fetch warning:', err.message);
        // Fallback to auth context user
        if (user) {
          setName(user.name || '');
          setEmail(user.email || '');
          setIsActive(user.isActive !== undefined ? user.isActive : true);
          setAvatar(user.avatar || '');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  // Generate initial letter from user's name or email
  const getInitial = () => {
    if (name && name.trim()) {
      return name.trim().charAt(0).toUpperCase();
    }
    if (email && email.trim()) {
      return email.trim().charAt(0).toUpperCase();
    }
    if (user?.name && user.name.trim()) {
      return user.name.trim().charAt(0).toUpperCase();
    }
    if (user?.email && user.email.trim()) {
      return user.email.trim().charAt(0).toUpperCase();
    }
    return 'U';
  };

  const initial = getInitial();

  // Handle Photo Upload
  const handlePhotoSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast?.error('Please select an image file (PNG, JPG, or WebP).');
      return;
    }

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast?.error('Image size must be less than 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result;
      setAvatar(dataUrl);
      try {
        const updated = await userApi.updateProfile({
          name: name.trim(),
          email: email.trim(),
          isActive,
          avatar: dataUrl,
        });
        updateProfileState({ ...updated, avatar: dataUrl });
        toast?.success('Profile picture updated successfully');
      } catch (err) {
        toast?.error(err.message || 'Failed to save profile picture');
      }
    };
    reader.readAsDataURL(file);

    // Reset input value so same file can be re-selected if desired
    e.target.value = '';
  };

  // Handle Remove Photo
  const handleRemovePhoto = async () => {
    setAvatar('');
    try {
      const updated = await userApi.updateProfile({
        name: name.trim(),
        email: email.trim(),
        isActive,
        avatar: '',
      });
      updateProfileState({ ...updated, avatar: '' });
      toast?.success('Profile picture removed');
    } catch (err) {
      toast?.error(err.message || 'Failed to remove profile picture');
    }
  };

  // Modal Openers
  const openNameModal = () => {
    setEditName(name);
    setModalError(null);
    setActiveModal('name');
  };

  const openEmailModal = () => {
    setEditEmail(email);
    setModalError(null);
    setActiveModal('email');
  };

  const openStatusModal = () => {
    setEditStatus(isActive);
    setModalError(null);
    setActiveModal('status');
  };

  const openPasswordModal = () => {
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setPasswordValidationErrors({});
    setModalError(null);
    setActiveModal('password');
  };

  const closeModal = () => {
    setActiveModal(null);
    setModalError(null);
  };

  // Save Name
  const handleSaveName = async (e) => {
    e.preventDefault();
    const nameErr = validateName(editName);
    if (nameErr) {
      setModalError(nameErr);
      return;
    }

    setModalSaving(true);
    setModalError(null);
    try {
      const updated = await userApi.updateProfile({
        name: editName.trim(),
        email: email.trim(),
        isActive,
        avatar: avatar || undefined,
      });
      setName(editName.trim());
      updateProfileState({ ...updated, name: editName.trim(), avatar });
      toast?.success('Name updated successfully');
      closeModal();
    } catch (err) {
      setModalError(err.message || 'Failed to update name');
    } finally {
      setModalSaving(false);
    }
  };

  // Save Email
  const handleSaveEmail = async (e) => {
    e.preventDefault();
    const emailErr = validateEmail(editEmail);
    if (emailErr) {
      setModalError(emailErr);
      return;
    }

    setModalSaving(true);
    setModalError(null);
    try {
      const updated = await userApi.updateProfile({
        name: name.trim(),
        email: editEmail.trim(),
        isActive,
        avatar: avatar || undefined,
      });
      setEmail(editEmail.trim());
      updateProfileState({ ...updated, email: editEmail.trim(), avatar });
      toast?.success('Email address updated successfully');
      closeModal();
    } catch (err) {
      setModalError(err.message || 'Failed to update email address');
    } finally {
      setModalSaving(false);
    }
  };

  // Toggle or Save Status
  const handleToggleStatus = async (newStatus) => {
    try {
      const updated = await userApi.updateProfile({
        name: name.trim(),
        email: email.trim(),
        isActive: newStatus,
        avatar: avatar || undefined,
      });
      setIsActive(newStatus);
      updateProfileState({ ...updated, isActive: newStatus, avatar });
      toast?.success(`Account status set to ${newStatus ? 'Active' : 'Inactive'}`);
      if (activeModal === 'status') {
        closeModal();
      }
    } catch (err) {
      toast?.error(err.message || 'Failed to update account status');
    }
  };

  // Change Password
  const handleSavePassword = async (e) => {
    e.preventDefault();
    setModalError(null);

    const errs = {};
    if (!oldPassword.trim()) {
      errs.oldPassword = 'Current password is required.';
    }
    if (!newPassword.trim()) {
      errs.newPassword = 'New password is required.';
    } else {
      const passErr = validatePassword(newPassword);
      if (passErr) errs.newPassword = passErr;
    }
    if (!confirmPassword.trim()) {
      errs.confirmPassword = 'Confirm new password is required.';
    } else if (newPassword !== confirmPassword) {
      errs.confirmPassword = 'New passwords do not match.';
    }

    setPasswordValidationErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setModalSaving(true);
    try {
      await userApi.changePassword({
        oldPassword: oldPassword.trim(),
        newPassword: newPassword.trim(),
      });
      toast?.success('Password updated successfully');
      closeModal();
    } catch (err) {
      setModalError(err.message || 'Current password is incorrect');
    } finally {
      setModalSaving(false);
    }
  };

  if (loading) {
    return <Loader message="Loading profile information..." />;
  }

  return (
    <div className="profile-page">
      {/* Page Title */}
      <div className="profile-header">
        <h2>Profile</h2>
        <p>Manage your personal profile details and account credentials</p>
      </div>

      {profileError && <ErrorMessage message={profileError} />}

      {/* Hidden File Input for Avatar */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handlePhotoSelect}
        accept="image/png,image/jpeg,image/webp"
        style={{ display: 'none' }}
      />

      {/* 1. At the top: Profile picture/avatar area */}
      <div className="profile-avatar-section">
        <div className="profile-avatar-wrapper" title={name || 'User Avatar'}>
          {avatar ? (
            <img src={avatar} alt={name || 'User'} className="profile-avatar-img" />
          ) : (
            <span>{initial}</span>
          )}
        </div>

        <div className="profile-avatar-actions">
          <button
            type="button"
            className="profile-avatar-btn"
            onClick={() => fileInputRef.current?.click()}
          >
            Change photo
          </button>
          {avatar && (
            <button
              type="button"
              className="profile-avatar-btn danger"
              onClick={handleRemovePhoto}
            >
              Remove photo
            </button>
          )}
        </div>
      </div>

      {/* 2 & 3. Profile Information — Line by Line */}
      <div className="profile-info-list">
        {/* Row 1: Name */}
        <div className="profile-info-row">
          <div className="profile-row-label">Name</div>
          <div className="profile-row-value">{name || 'Not set'}</div>
          <div className="profile-row-action">
            <Button variant="outline" size="sm" icon={Edit2} onClick={openNameModal}>
              Edit
            </Button>
          </div>
        </div>

        {/* Row 2: Email */}
        <div className="profile-info-row">
          <div className="profile-row-label">Email</div>
          <div className="profile-row-value">{email || 'Not set'}</div>
          <div className="profile-row-action">
            <Button variant="outline" size="sm" icon={Edit2} onClick={openEmailModal}>
              Edit
            </Button>
          </div>
        </div>

        {/* Row 3: Status (Section 2: Inline Status Bar / Badge) */}
        <div className="profile-info-row">
          <div className="profile-row-label">Status</div>
          <div className="profile-row-value">
            <div className="profile-status-indicator">
              <span className={`profile-status-dot ${isActive ? 'active' : 'inactive'}`} />
              <span className={`profile-status-text ${isActive ? 'active' : 'inactive'}`}>
                {isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
          <div className="profile-row-action">
            <Button variant="outline" size="sm" onClick={openStatusModal}>
              Edit
            </Button>
          </div>
        </div>

        {/* Row 4: Profile Picture */}
        <div className="profile-info-row">
          <div className="profile-row-label">Profile Picture</div>
          <div className="profile-row-value">
            <div className="profile-thumb-preview">
              {avatar ? (
                <img src={avatar} alt="Avatar Thumbnail" className="profile-thumb-img" />
              ) : (
                <span>{initial}</span>
              )}
            </div>
          </div>
          <div className="profile-row-action">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
            >
              Change
            </Button>
          </div>
        </div>

        {/* Row 5: Password (Existing Profile Info) */}
        <div className="profile-info-row">
          <div className="profile-row-label">Password</div>
          <div className="profile-row-value">
            <span className="profile-masked-pass">••••••••••••</span>
          </div>
          <div className="profile-row-action">
            <Button variant="outline" size="sm" onClick={openPasswordModal}>
              Change
            </Button>
          </div>
        </div>
      </div>

      {/* Modal: Edit Name */}
      <Modal
        isOpen={activeModal === 'name'}
        onClose={closeModal}
        title="Edit Name"
        maxWidth="440px"
      >
        <form onSubmit={handleSaveName} className="profile-modal-form">
          {modalError && (
            <div
              style={{
                padding: 'var(--space-3)',
                background: 'var(--color-error-light)',
                color: 'var(--color-error)',
                borderRadius: 'var(--radius-md)',
                fontSize: 'var(--font-size-xs)',
              }}
            >
              {modalError}
            </div>
          )}

          <Input
            label="Full Name"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            icon={User}
            placeholder="Enter your full name"
            required
            autoFocus
          />

          <div className="profile-modal-actions">
            <Button variant="ghost" size="sm" onClick={closeModal} disabled={modalSaving}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" icon={Save} loading={modalSaving}>
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Edit Email */}
      <Modal
        isOpen={activeModal === 'email'}
        onClose={closeModal}
        title="Edit Email Address"
        maxWidth="440px"
      >
        <form onSubmit={handleSaveEmail} className="profile-modal-form">
          {modalError && (
            <div
              style={{
                padding: 'var(--space-3)',
                background: 'var(--color-error-light)',
                color: 'var(--color-error)',
                borderRadius: 'var(--radius-md)',
                fontSize: 'var(--font-size-xs)',
              }}
            >
              {modalError}
            </div>
          )}

          <Input
            label="Email Address"
            type="email"
            value={editEmail}
            onChange={(e) => setEditEmail(e.target.value)}
            icon={Mail}
            placeholder="Enter your email"
            required
            autoFocus
          />

          <div className="profile-modal-actions">
            <Button variant="ghost" size="sm" onClick={closeModal} disabled={modalSaving}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" icon={Save} loading={modalSaving}>
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Edit Status */}
      <Modal
        isOpen={activeModal === 'status'}
        onClose={closeModal}
        title="Edit Account Status"
        maxWidth="440px"
      >
        <div className="profile-modal-form">
          <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', margin: 0 }}>
            Configure whether your account status is currently active or inactive.
          </p>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: 'var(--space-4)',
              background: 'var(--color-bg-subtle)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <span className={`profile-status-dot ${editStatus ? 'active' : 'inactive'}`} />
              <span style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)' }}>
                {editStatus ? 'Active' : 'Inactive'}
              </span>
            </div>

            <label className="status-switch">
              <input
                type="checkbox"
                checked={editStatus}
                onChange={(e) => setEditStatus(e.target.checked)}
              />
              <span className="status-slider" />
            </label>
          </div>

          <div className="profile-modal-actions">
            <Button variant="ghost" size="sm" onClick={closeModal}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={Save}
              onClick={() => handleToggleStatus(editStatus)}
            >
              Save Status
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal: Change Password */}
      <Modal
        isOpen={activeModal === 'password'}
        onClose={closeModal}
        title="Change Password"
        maxWidth="480px"
      >
        <form onSubmit={handleSavePassword} className="profile-modal-form">
          {modalError && (
            <div
              style={{
                padding: 'var(--space-3)',
                background: 'var(--color-error-light)',
                color: 'var(--color-error)',
                borderRadius: 'var(--radius-md)',
                fontSize: 'var(--font-size-xs)',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-2)',
              }}
            >
              <AlertCircle size={15} style={{ flexShrink: 0 }} />
              <span>{modalError}</span>
            </div>
          )}

          <Input
            label="Current Password"
            type="password"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            icon={Lock}
            placeholder="Enter current password"
            required
            error={passwordValidationErrors.oldPassword}
          />

          <Input
            label="New Password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            icon={KeyRound}
            placeholder="Enter new password"
            required
            error={passwordValidationErrors.newPassword}
            helperText="Min 8 characters with uppercase, lowercase, number, and symbol"
          />

          <Input
            label="Confirm New Password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            icon={KeyRound}
            placeholder="Confirm new password"
            required
            error={passwordValidationErrors.confirmPassword}
          />

          <div className="profile-modal-actions">
            <Button variant="ghost" size="sm" onClick={closeModal} disabled={modalSaving}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              icon={KeyRound}
              loading={modalSaving}
            >
              Update Password
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
