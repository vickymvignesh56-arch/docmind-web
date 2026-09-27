import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, CheckCircle2 } from 'lucide-react';
import { RagFishLogo } from '../../components/common/RagFishLogo';
import { Input } from '../../components/common/Input/Input';
import { Button } from '../../components/common/Button/Button';
import { ErrorMessage } from '../../components/common/ErrorMessage/ErrorMessage';
import { useAuth } from '../../hooks/useAuth';
import { validateEmail, validatePassword, validateName } from '../../utils/validators';
import './Auth.css';

export const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const errs = {};
    const nameErr = validateName(formData.name);
    if (nameErr) errs.name = nameErr;

    const emailErr = validateEmail(formData.email);
    if (emailErr) errs.email = emailErr;

    const passErr = validatePassword(formData.password);
    if (passErr) errs.password = passErr;

    if (formData.password !== formData.confirmPassword) {
      errs.confirmPassword = 'Passwords do not match';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError(null);
    setSuccessMsg(null);
    if (!validate()) return;

    setLoading(true);
    try {
      // Backend requires name, email, password, and isActive: true
      await register({
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
      });

      setSuccessMsg('Account created successfully! Redirecting to sign in...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setApiError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-card-wrapper animate-fade-in">
        {/* Left Side: Brand Panel */}
        <div className="auth-brand-panel">
          <div>
            <RagFishLogo size={36} isDarkTheme={true} />

            <div className="auth-brand-tagline">
              <h2 className="auth-brand-title">
                Start Building <br />
                <span>Knowledge-Driven AI.</span>
              </h2>
              <p className="auth-brand-desc">
                Join DocMind to effortlessly index enterprise documents and deploy
                intelligent assistants across departments.
              </p>
            </div>
          </div>

          <div className="auth-brand-footer">
            By registering, you agree to our Terms of Service & Privacy Policy.
          </div>
        </div>

        {/* Right Side: Registration Form */}
        <div className="auth-form-panel">
          <div className="auth-form-header">
            <h1 className="auth-form-title">Create Account</h1>
            <p className="auth-form-subtitle">
              Get started with your free DocMind workspace
            </p>
          </div>

          {apiError && (
            <ErrorMessage
              title="Registration Error"
              message={apiError}
              className="mb-4"
            />
          )}

          {successMsg && (
            <div
              className="flex items-center gap-2 p-3 mb-4 rounded-lg"
              style={{
                backgroundColor: 'rgba(16, 185, 129, 0.15)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                color: '#34d399',
                fontSize: 'var(--font-size-xs)',
              }}
            >
              <CheckCircle2 size={16} />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form" noValidate>
            <Input
              label="Full Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Alex Morgan"
              icon={User}
              required
              isDark={true}
              error={errors.name}
              disabled={loading}
            />

            <Input
              label="Email Address"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="alex@company.com"
              icon={Mail}
              required
              isDark={true}
              error={errors.email}
              autoComplete="email"
              disabled={loading}
            />

            <Input
              label="Password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="At least 8 chars, Aa, 1, @"
              icon={Lock}
              required
              isDark={true}
              error={errors.password}
              helperText="Min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 symbol"
              autoComplete="new-password"
              disabled={loading}
            />

            <Input
              label="Confirm Password"
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Re-type your password"
              icon={Lock}
              required
              isDark={true}
              error={errors.confirmPassword}
              autoComplete="new-password"
              disabled={loading}
            />

            <Button
              type="submit"
              variant="dark-glow"
              size="lg"
              loading={loading}
              className="w-full mt-2"
            >
              Create DocMind Account
            </Button>

            <div className="auth-form-footer">
              <span>Already have an account?</span>
              <Link to="/login">Sign In</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
