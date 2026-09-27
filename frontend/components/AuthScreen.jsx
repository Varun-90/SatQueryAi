import { useState } from "react";
import {
  Satellite,
  Mail,
  Lock,
  User,
  Building,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Eye,
  EyeOff,
  KeyRound,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

export default function AuthScreen({ apiBaseUrl, onLoginSuccess }) {
  const [mode, setMode] = useState("login"); // "login" | "register" | "forgot" | "reset"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [organization, setOrganization] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [demoCodeHint, setDemoCodeHint] = useState("");

  const handleLogin = async (e) => {
    e?.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    if (!email || !password) {
      setErrorMessage("Please enter both your email and password.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${apiBaseUrl}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.detail || "Authentication failed.");
      }

      localStorage.setItem("satquery_auth_token", data.token);
      localStorage.setItem("satquery_user", JSON.stringify(data.user));
      onLoginSuccess(data.user, data.token);
    } catch (err) {
      setErrorMessage(err.message || "Unable to sign in. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e?.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!email || !password || !name) {
      setErrorMessage("Please fill in your name, email, and password.");
      return;
    }
    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match. Please re-type password.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${apiBaseUrl}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name, organization }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.detail || "Registration failed.");
      }

      localStorage.setItem("satquery_auth_token", data.token);
      localStorage.setItem("satquery_user", JSON.stringify(data.user));
      onLoginSuccess(data.user, data.token);
    } catch (err) {
      setErrorMessage(err.message || "Failed to create account.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e?.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    if (!email) {
      setErrorMessage("Please enter your registered email address.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${apiBaseUrl}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.detail || "Unable to send reset code.");
      }

      setSuccessMessage(data.message);
      if (data.code) {
        setDemoCodeHint(data.code);
        setResetCode(data.code);
      }
      setMode("reset");
    } catch (err) {
      setErrorMessage(err.message || "Failed to initiate password reset.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e?.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!resetCode || !newPassword) {
      setErrorMessage("Please provide the verification code and your new password.");
      return;
    }
    if (newPassword.length < 6) {
      setErrorMessage("New password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${apiBaseUrl}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: resetCode, newPassword }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.detail || "Password reset failed.");
      }

      setSuccessMessage("Password successfully reset! You can now sign in.");
      setPassword(newPassword);
      setMode("login");
    } catch (err) {
      setErrorMessage(err.message || "Failed to reset password.");
    } finally {
      setLoading(false);
    }
  };

  const fillDemoAccount = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setErrorMessage("");
  };

  return (
    <div className="auth-overlay-backdrop">
      <div className="auth-card">
        {/* BRAND & HEADER */}
        <div className="auth-brand-header">
          <div className="auth-brand-badge">
            <Satellite size={24} strokeWidth={1.8} />
          </div>
          <div>
            <h1>SatQuery AI</h1>
            <p>Earth Observation & Remote Sensing Intelligence</p>
          </div>
        </div>

        {/* ACCESS GATE KICKER */}
        <div className="auth-gate-banner">
          <ShieldCheck size={16} />
          <span>Restricted Mission Access · Analyst Authentication Required</span>
        </div>

        {/* TABS */}
        <div className="auth-tabs">
          <button
            className={`auth-tab-btn ${mode === "login" ? "active" : ""}`}
            onClick={() => {
              setMode("login");
              setErrorMessage("");
            }}
          >
            Sign In
          </button>
          <button
            className={`auth-tab-btn ${mode === "register" ? "active" : ""}`}
            onClick={() => {
              setMode("register");
              setErrorMessage("");
            }}
          >
            Create Account
          </button>
          <button
            className={`auth-tab-btn ${mode === "forgot" || mode === "reset" ? "active" : ""}`}
            onClick={() => {
              setMode("forgot");
              setErrorMessage("");
            }}
          >
            Reset Password
          </button>
        </div>

        {/* ALERTS */}
        {errorMessage && (
          <div className="auth-alert error" role="alert">
            <AlertCircle size={16} />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="auth-alert success" role="status">
            <CheckCircle2 size={16} />
            <span>{successMessage}</span>
          </div>
        )}

        {/* 1. SIGN IN FORM */}
        {mode === "login" && (
          <form className="auth-form" onSubmit={handleLogin}>
            <div className="form-group">
              <label htmlFor="login-email">Analyst Email Address</label>
              <div className="input-with-icon">
                <Mail size={16} className="field-icon" />
                <input
                  id="login-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="analyst@agency.gov or name@domain.com"
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="form-group">
              <div className="field-header">
                <label htmlFor="login-password">Password</label>
                <button
                  type="button"
                  className="inline-link-btn"
                  onClick={() => {
                    setMode("forgot");
                    setErrorMessage("");
                  }}
                >
                  Forgot password?
                </button>
              </div>
              <div className="input-with-icon">
                <Lock size={16} className="field-icon" />
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your security password"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button
              id="auth-submit-btn"
              type="submit"
              className="auth-primary-btn"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="spin-icon" />
                  <span>Verifying Credentials…</span>
                </>
              ) : (
                <>
                  <span>Sign In & Enter Dashboard</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>

            {/* 1-CLICK DEMO LOGIN HELPER */}
            <div className="demo-credentials-box">
              <div className="demo-header">
                <Sparkles size={14} className="text-accent" />
                <span>Quick-Test Demo Credentials:</span>
              </div>
              <div className="demo-buttons-list">
                <button
                  type="button"
                  className="demo-pill-btn"
                  onClick={() => fillDemoAccount("varunsoniff2007@gmail.com", "Password123!")}
                >
                  <span>Varun Soni</span>
                  <code>varunsoniff2007@gmail.com</code>
                </button>
                <button
                  type="button"
                  className="demo-pill-btn"
                  onClick={() => fillDemoAccount("analyst@satquery.ai", "Password123!")}
                >
                  <span>Analyst</span>
                  <code>analyst@satquery.ai</code>
                </button>
              </div>
            </div>
          </form>
        )}

        {/* 2. REGISTRATION FORM */}
        {mode === "register" && (
          <form className="auth-form" onSubmit={handleRegister}>
            <div className="form-group">
              <label htmlFor="reg-name">Full Name</label>
              <div className="input-with-icon">
                <User size={16} className="field-icon" />
                <input
                  id="reg-name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Dr. Priya Sharma"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="reg-org">Organization / Agency (Optional)</label>
              <div className="input-with-icon">
                <Building size={16} className="field-icon" />
                <input
                  id="reg-org"
                  type="text"
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  placeholder="e.g. ISRO Geospatial / State Agricultural Dept"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="reg-email">Work / Personal Email</label>
              <div className="input-with-icon">
                <Mail size={16} className="field-icon" />
                <input
                  id="reg-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@organization.gov"
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="reg-pass">Password</label>
                <div className="input-with-icon">
                  <Lock size={16} className="field-icon" />
                  <input
                    id="reg-pass"
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min 6 characters"
                    autoComplete="new-password"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="reg-confirm">Confirm Password</label>
                <div className="input-with-icon">
                  <Lock size={16} className="field-icon" />
                  <input
                    id="reg-confirm"
                    type={showPassword ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat password"
                    autoComplete="new-password"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="auth-primary-btn"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="spin-icon" />
                  <span>Creating Account…</span>
                </>
              ) : (
                <>
                  <span>Create Account & Enter SatQuery</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>
        )}

        {/* 3. FORGOT PASSWORD (STEP 1) */}
        {mode === "forgot" && (
          <form className="auth-form" onSubmit={handleForgotPassword}>
            <div className="form-info-card">
              <KeyRound size={20} className="text-amber" />
              <div>
                <strong>Forgot your password?</strong>
                <p>
                  Enter your account email. We will generate a secure 6-digit verification code to reset your password.
                </p>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="forgot-email">Account Email</label>
              <div className="input-with-icon">
                <Mail size={16} className="field-icon" />
                <input
                  id="forgot-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your registered email"
                  autoComplete="email"
                />
              </div>
            </div>

            <button
              type="submit"
              className="auth-primary-btn"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="spin-icon" />
                  <span>Generating Code…</span>
                </>
              ) : (
                <>
                  <span>Send Reset Code</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>

            <button
              type="button"
              className="auth-secondary-btn"
              onClick={() => setMode("login")}
            >
              Back to Sign In
            </button>
          </form>
        )}

        {/* 4. RESET PASSWORD (STEP 2) */}
        {mode === "reset" && (
          <form className="auth-form" onSubmit={handleResetPassword}>
            {demoCodeHint && (
              <div className="reset-code-toast">
                <span>Verification Code Generated:</span>
                <strong>{demoCodeHint}</strong>
              </div>
            )}

            <div className="form-group">
              <label htmlFor="reset-code">6-Digit Verification Code</label>
              <div className="input-with-icon">
                <KeyRound size={16} className="field-icon" />
                <input
                  id="reset-code"
                  type="text"
                  required
                  value={resetCode}
                  onChange={(e) => setResetCode(e.target.value)}
                  placeholder="e.g. 847291"
                  maxLength={6}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="reset-new-pass">New Password</label>
              <div className="input-with-icon">
                <Lock size={16} className="field-icon" />
                <input
                  id="reset-new-pass"
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min 6 characters"
                />
              </div>
            </div>

            <button
              type="submit"
              className="auth-primary-btn"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="spin-icon" />
                  <span>Updating Password…</span>
                </>
              ) : (
                <>
                  <span>Update Password & Return to Login</span>
                  <CheckCircle2 size={16} />
                </>
              )}
            </button>

            <button
              type="button"
              className="auth-secondary-btn"
              onClick={() => setMode("login")}
            >
              Cancel
            </button>
          </form>
        )}

        {/* FOOTER */}
        <div className="auth-card-footer">
          <span>Protected by AES-256 / PBKDF2 Encrypted Storage</span>
          <span>SatQuery Earth Observation Lab</span>
        </div>
      </div>
    </div>
  );
}
