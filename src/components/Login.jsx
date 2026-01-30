import React, { useState } from 'react';
import { loginWithGoogle, loginWithEmail, registerWithEmail } from '../firebase';

export default function Login({ onLogin }) {
  const [isSignUp, setIsSignUp] = useState(false); // Toggle between Login and Sign Up
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState(''); // Only for Sign Up
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      if (isSignUp) {
        // Create new account
        const user = await registerWithEmail(email, password, name);
        if (user) onLogin(user);
      } else {
        // Log in existing account
        const user = await loginWithEmail(email, password);
        if (user) onLogin(user);
      }
    } catch (err) {
      // Clean up error messages for the user
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

  return (
    <div className="login-container">
      <div className="login-card">
        <img src="src\assets\logo.png" alt="Logo" className="login-logo" />
        
        <h1>{isSignUp ? "Create Account" : "Welcome"}</h1>
        <p>{isSignUp ? "Start your journey today." : "Track your habits, achieve your goals."}</p>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          {isSignUp && (
            <input 
              type="text" 
              placeholder="Full Name" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              required 
            />
          )}
          
          <input 
            type="email" 
            placeholder="Email Address" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required 
          />
          
          <input 
            type="password" 
            placeholder="Password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required 
          />

          <button type="submit" className="primary-auth-btn">
            {isSignUp ? "Sign Up" : "Log In"}
          </button>
        </form>

        <div className="divider"><span>OR</span></div>

        <button className="google-btn" onClick={handleGoogleLogin}>
          <img 
            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" 
            alt="G" 
          />
          {isSignUp ? "Sign up with Google" : "Sign in with Google"}
        </button>

        <p className="toggle-auth">
          {isSignUp ? "Already have an account?" : "Don't have an account?"}
          <span onClick={() => { setIsSignUp(!isSignUp); setError(''); }}>
            {isSignUp ? " Log In" : " Sign Up"}
          </span>
        </p>
      </div>
    </div>
  );
}