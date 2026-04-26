import React, { useState } from 'react';
import { loginWithGoogle, loginWithEmail, registerWithEmail } from '../firebase';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Sparkles, TrendingUp, User } from 'lucide-react';
import '../Login.css';

export default function Login({ onLogin }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (isSignUp) {
        const user = await registerWithEmail(email, password, name);
        if (user) onLogin(user);
      } else {
        const user = await loginWithEmail(email, password);
        if (user) onLogin(user);
      }
    } catch (err) {
      if (err.code === 'auth/invalid-credential') setError("Incorrect email or password.");
      else if (err.code === 'auth/email-already-in-use') setError("Email already exists.");
      else if (err.code === 'auth/weak-password') setError("Password should be at least 6 characters.");
      else setError("Something went wrong. Please try again.");
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const user = await loginWithGoogle();
      if (user) onLogin(user);
    } catch (err) {
      setError("Google sign-in failed.");
    }
  };

  if (isSignUp) {
    return (
      <div className="auth-page">
        <div className="auth-header-left">
          <div className="auth-logo-horizontal">
            <div style={{ position: 'relative' }}>
              <TrendingUp size={20} strokeWidth={2.5} />
              <Sparkles size={10} style={{ position: 'absolute', top: -4, right: -4 }} />
            </div>
            <h2>HABIT TRACKER</h2>
          </div>
        </div>
        
        <div className="auth-signup-hero">
          <h1>Start Your<br/>Journey.</h1>
          <p>Consistency is the key to success.</p>
        </div>

        <div className="auth-card">
          {error && <div className="auth-error">{error}</div>}
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="auth-input-group">
              <label>Full Name</label>
              <div className="auth-input-wrapper">
                <div className="auth-icon"><User size={18} /></div>
                <input 
                  type="text" 
                  placeholder="John Doe" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required 
                />
              </div>
            </div>

            <div className="auth-input-group">
              <label>Email Address</label>
              <div className="auth-input-wrapper">
                <div className="auth-icon"><Mail size={18} /></div>
                <input 
                  type="email" 
                  placeholder="name@example.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required 
                />
              </div>
            </div>

            <div className="auth-input-group">
              <label>Password</label>
              <div className="auth-input-wrapper">
                <div className="auth-icon"><Lock size={18} /></div>
                <input 
                  type={showPassword ? "text" : "password"} 
                  placeholder="••••••••" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required 
                />
                <div className="auth-action-icon" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </div>
              </div>
            </div>

            <button type="submit" className="auth-btn auth-btn-primary">
              Create Account
            </button>
          </form>

          <div className="auth-divider">
            <span>OR CONTINUE WITH</span>
          </div>

          <button type="button" className="auth-btn auth-btn-google-dark" onClick={handleGoogleLogin}>
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" width="20" height="20" />
            <span>Google</span>
          </button>
        </div>

        <div className="auth-footer-text">
          Already have an account? <span className="auth-link" onClick={() => { setIsSignUp(false); setError(''); }}>Log In</span>
        </div>
        
        <div className="auth-legal-footer">
          © 2024 HABIT TRACKER. DISCIPLINE OVER MOTIVATION.
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-login-hero">
        <div className="auth-logo-box">
          <div style={{ position: 'relative' }}>
            <TrendingUp className="auth-logo-icon" size={32} strokeWidth={2.5} />
            <Sparkles className="auth-logo-icon" size={14} style={{ position: 'absolute', top: -6, right: -6 }} />
          </div>
        </div>
        <h1 className="auth-title-large">Habit Tracker</h1>
        <p className="auth-subtitle">Welcome Back! Ready to build your<br/>streak?</p>
      </div>

      <div className="auth-card">
        {error && <div className="auth-error">{error}</div>}
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-input-group">
            <label>EMAIL ADDRESS</label>
            <div className="auth-input-wrapper">
              <div className="auth-icon"><Mail size={18} /></div>
              <input 
                type="email" 
                placeholder="name@example.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
              />
            </div>
          </div>

          <div className="auth-input-group">
            <div className="auth-label-row">
              <label>PASSWORD</label>
              <span className="auth-forgot-link">Forgot?</span>
            </div>
            <div className="auth-input-wrapper">
              <div className="auth-icon"><Lock size={18} /></div>
              <input 
                type={showPassword ? "text" : "password"} 
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
              />
              <div className="auth-action-icon" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </div>
            </div>
          </div>

          <button type="submit" className="auth-btn auth-btn-primary">
            Log In <ArrowRight size={18} />
          </button>
        </form>

        <div className="auth-divider">
          <span>OR CONTINUE WITH</span>
        </div>

        <button type="button" className="auth-btn auth-btn-google-light" onClick={handleGoogleLogin}>
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" width="20" height="20" />
          <span>Sign in with Google</span>
        </button>
      </div>

      <div className="auth-footer-text">
        Don't have an account? <span className="auth-link" onClick={() => { setIsSignUp(true); setError(''); }}>Sign Up</span>
      </div>
    </div>
  );
}