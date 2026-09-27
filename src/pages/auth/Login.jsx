import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ShieldCheck, Zap, Layers } from 'lucide-react';
import { RagFishLogo } from '../../components/common/RagFishLogo';
import { Input } from '../../components/common/Input/Input';
import { Button } from '../../components/common/Button/Button';
import { ErrorMessage } from '../../components/common/ErrorMessage/ErrorMessage';
import { useAuth } from '../../hooks/useAuth';
import { validateEmail } from '../../utils/validators';
import './Auth.css';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState(null);
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    const errs = {};
    const emailErr = validateEmail(email);
    if (emailErr) errs.email = emailErr;
    if (!password) errs.password = 'Password is required';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError(null);
    if (!validate()) return;

    setLoading(true);
    try {
      await login({ email: email.trim(), password });
      navigate('/dashboard');
    } catch (err) {
      setApiError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-card-wrapper animate-fade-in">
        {/* Left Side: Brand & Product Visual */}
        <div className="auth-brand-panel">
          <div>
            <RagFishLogo size={36} isDarkTheme={true} />

            <div className="auth-brand-tagline">
              <h2 className="auth-brand-title">
                Intelligent RAG, <br />
                <span>Zero Hallucination.</span>
              </h2>
              <p className="auth-brand-desc">
                DocMind connects your enterprise documents to state-of-the-art LLMs
                through independent, reusable knowledge channels.
              </p>
            </div>

            <div className="auth-features-list">
              <div className="auth-feature-item">
                <div className="auth-feature-icon">
                  <Layers size={15} />
                </div>
                <span>Independent Apps & Reusable Knowledge Channels</span>
              </div>

              <div className="auth-feature-item">
                <div className="auth-feature-icon">
                  <Zap size={15} />
                </div>
                <span>Sub-second Vector Search via Qdrant Indexing</span>
              </div>

              <div className="auth-feature-item">
                <div className="auth-feature-icon">
                  <ShieldCheck size={15} />
                </div>
                <span>Multi-provider Support (Gemini, OpenAI, Anthropic)</span>
              </div>
            </div>
          </div>

          <div className="auth-brand-footer">
            © {new Date().getFullYear()} DocMind AI Platform. All rights reserved.
          </div>
        </div>

        {/* Right Side: Sign In Form */}
        <div className="auth-form-panel">
          <div className="auth-form-header">
            <h1 className="auth-form-title">Sign In</h1>
            <p className="auth-form-subtitle">
              Enter your credentials to access your DocMind workspace
            </p>
          </div>

          {apiError && (
            <ErrorMessage
              title="Authentication Failed"
              message={apiError}
              className="mb-4"
            />
          )}

          <form onSubmit={handleSubmit} className="auth-form" noValidate>
            <Input
              label="Email Address"
              type="email"
              name="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors((prev) => ({ ...prev, email: null }));
              }}
              placeholder="name@company.com"
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
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password) setErrors((prev) => ({ ...prev, password: null }));
              }}
              placeholder="••••••••"
              icon={Lock}
              required
              isDark={true}
              error={errors.password}
              autoComplete="current-password"
              disabled={loading}
            />

            <Button
              type="submit"
              variant="dark-glow"
              size="lg"
              loading={loading}
              className="w-full mt-2"
            >
              Sign In to DocMind
            </Button>

            <div className="auth-form-footer">
              <span>Don't have an account?</span>
              <Link to="/register">Create Account</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
