import React, { useState } from 'react';
import { Lock, User, AlertCircle, Info, Mail, Eye, EyeOff, X } from 'lucide-react';
import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';
import { useData } from '../context/DataContext';
import { GoogleProfileCompletion } from './GoogleProfileCompletion';

// Version information
const VERSION = '1.1.0';
const BUILD_DATE = '2025-09-12';

// Google OAuth Client ID - This would be configured in your Google Console
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '1078615460282-kiaue419kjhc4u940hg6o0cik4s60b72.apps.googleusercontent.com';

type AuthMode = 'login' | 'signup';

interface AuthFormProps {
  onLoginSuccess?: (loginData: { user: any; accessToken: string }) => void;
}

export const AuthForm: React.FC<AuthFormProps> = ({ onLoginSuccess }) => {
  const { login, signup, completeProfile, markProfileIncomplete } = useData();
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [formData, setFormData] = useState({
    email: 'admin@learning.com',
    password: 'password',
    name: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);
  const [forgotPasswordMessage, setForgotPasswordMessage] = useState<string | null>(null);
  const [forgotPasswordError, setForgotPasswordError] = useState<string | null>(null);
  
  // Google OAuth profile completion state
  const [showProfileCompletion, setShowProfileCompletion] = useState(false);
  const [googleUserData, setGoogleUserData] = useState<{
    email: string;
    name: string;
    picture?: string;
  } | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (authMode === 'signup') {
        if (formData.password !== formData.confirmPassword) {
          throw new Error('Passwords do not match');
        }
        if (formData.password.length < 6) {
          throw new Error('Password must be at least 6 characters long');
        }
        console.log('Attempting signup with:', { email: formData.email, name: formData.name });
        await signup(formData.name, formData.email, formData.password);
        console.log('Signup successful');
      } else {
        console.log('Attempting login with:', { email: formData.email, password: '***' });
        await login(formData.email, formData.password);
        console.log('Login successful');
      }
    } catch (err: any) {
      console.error(`${authMode === 'signup' ? 'Signup' : 'Login'} failed:`, err);
      setError(err.message || `${authMode === 'signup' ? 'Signup' : 'Login'} failed`);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Google OAuth success:', credentialResponse);
      
      // Send the Google credential to our backend for verification
      const credential = credentialResponse.credential;
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
      
      // Call the Google OAuth endpoint directly
      const response = await fetch(`${apiUrl}/auth/google`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ credential }),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Google authentication failed');
      }
      
      const data = await response.json();
      
      // Check if this is a new user requiring profile completion
      if (data.isNewUser && data.requiresProfileCompletion) {
        // Set user data for profile completion
        setGoogleUserData({
          email: data.user.email,
          name: data.user.name,
          picture: data.user.picture
        });
        
        // Store the token temporarily (we'll need it for profile completion)
        const { AuthManager } = await import('../services/ApiDataService');
        AuthManager.setToken(data.accessToken);
        
        // Mark profile as incomplete in DataContext
        markProfileIncomplete();
        
        // Show profile completion form
        setShowProfileCompletion(true);
      } else {
        // Existing user, proceed with normal login
        const { AuthManager } = await import('../services/ApiDataService');
        AuthManager.setToken(data.accessToken);
        
        console.log('Google OAuth login successful for existing user');
        console.log('User data:', data.user);
        console.log('Calling onLoginSuccess callback:', !!onLoginSuccess);
        
        // Close the auth modal and trigger a login success
        onLoginSuccess?.({ user: data.user, accessToken: data.accessToken });
      }
      
    } catch (err: any) {
      console.error('Google OAuth failed:', err);
      setError(err.message || 'Google authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    console.error('Google OAuth failed');
    setError('Google authentication failed');
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotPasswordLoading(true);
    setForgotPasswordError(null);
    setForgotPasswordMessage(null);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
      const response = await fetch(`${apiUrl}/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: forgotPasswordEmail }),
      });

      const data = await response.json();

      if (response.ok) {
        setForgotPasswordMessage(data.message);
        if (data.resetToken && data.resetUrl) {
          // Development mode - show reset info
          console.log('🔑 Reset Token:', data.resetToken);
          console.log('🔑 Reset URL:', data.resetUrl);
          setForgotPasswordMessage(
            `${data.message}\n\nFor development: Check the console for reset URL or use this token: ${data.resetToken}`
          );
        }
        setTimeout(() => {
          setShowForgotPassword(false);
          setForgotPasswordEmail('');
          setForgotPasswordMessage(null);
        }, 5000);
      } else {
        setForgotPasswordError(data.error || 'Failed to send reset email');
      }
    } catch (err: any) {
      console.error('Forgot password failed:', err);
      setForgotPasswordError('Failed to send reset email');
    } finally {
      setForgotPasswordLoading(false);
    }
  };

  const handleProfileCompletion = async (profileData: {
    name: string;
    password: string;
    confirmPassword: string;
  }) => {
    const result = await completeProfile(profileData.name, profileData.password);
    
    // Profile completed successfully, trigger login success with updated user data
    onLoginSuccess?.({ 
      user: result.user, 
      accessToken: localStorage.getItem('accessToken') || '' 
    });
  };

  const toggleAuthMode = () => {
    setAuthMode(authMode === 'login' ? 'signup' : 'login');
    setError(null);
    setShowLoginForm(false); // Hide form when switching modes
    if (authMode === 'login') {
      setFormData(prev => ({ ...prev, email: '', password: '' }));
    }
  };

  // If showing profile completion form, render it instead of the auth form
  if (showProfileCompletion && googleUserData) {
    return (
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <GoogleProfileCompletion
          userEmail={googleUserData.email}
          userName={googleUserData.name}
          userPicture={googleUserData.picture}
          onComplete={handleProfileCompletion}
          onNavigateToApp={() => {
            // Reset the profile completion state and let the parent handle the transition
            setShowProfileCompletion(false);
            setGoogleUserData(null);
            // The onLoginSuccess should already have been called in handleProfileCompletion
            // So the parent component should handle the transition to main app
          }}
          onSkip={() => {
            // If user skips, just proceed to main app
            window.location.reload();
          }}
        />
      </GoogleOAuthProvider>
    );
  }

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <div className="mx-auto h-12 w-12 bg-blue-600 rounded-full flex items-center justify-center">
              <Lock className="h-6 w-6 text-white" />
            </div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              {authMode === 'login' ? 'Sign in to Study Group Platform' : 'Create your Study Group account'}
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              {authMode === 'login' 
                ? 'Welcome back to Study Group Platform'
                : 'Join the study group platform today'
              }
            </p>
          </div>

          {/* Google OAuth Section - Now at the top */}
          <div className="mt-8 space-y-4">
            <div className="flex justify-center">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                theme="outline"
                size="large"
                text={authMode === 'login' ? 'signin_with' : 'signup_with'}
                shape="rectangular"
                width="100%"
              />
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-50 text-gray-500">Or</span>
              </div>
            </div>

            {/* Login with Email Button */}
            {!showLoginForm && (
              <button
                type="button"
                onClick={() => setShowLoginForm(true)}
                className="w-full flex justify-center py-3 px-4 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Mail className="w-5 h-5 mr-2" />
                {authMode === 'login' ? 'Sign in with Email' : 'Sign up with Email'}
              </button>
            )}
          </div>

          {/* Email/Password Form - Now below Google OAuth, hidden initially */}
          {showLoginForm && (
            <form className="mt-6 space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-4">
                {authMode === 'signup' && (
                  <div>
                    <label htmlFor="name" className="sr-only">
                      Full Name
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="name"
                        name="name"
                        type="text"
                        required
                        className="relative block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Full name"
                        value={formData.name}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label htmlFor="email" className="sr-only">
                    Email address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      className="relative block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Email address"
                      value={formData.email}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="sr-only">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      className="relative block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Password"
                      value={formData.password}
                      onChange={handleInputChange}
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      <button
                        type="button"
                        className="text-gray-400 hover:text-gray-600"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>
                </div>

                {authMode === 'login' && (
                  <div className="text-right">
                    <button
                      type="button"
                      onClick={() => setShowForgotPassword(true)}
                      className="text-sm text-blue-600 hover:text-blue-500"
                    >
                      Forgot your password?
                    </button>
                  </div>
                )}

                {authMode === 'signup' && (
                  <div>
                    <label htmlFor="confirmPassword" className="sr-only">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        required
                        className="relative block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Confirm password"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                        <button
                          type="button"
                          className="text-gray-400 hover:text-gray-600"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {error && (
                <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg">
                  <AlertCircle className="h-5 w-5" />
                  <span className="text-sm">{error}</span>
                </div>
              )}

              {authMode === 'login' && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-blue-800">
                    <strong>Default Admin Account:</strong>
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    Email: admin@learning.com<br />
                    Password: password
                  </p>
                </div>
              )}

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                <div className="flex items-center space-x-2">
                  <Info className="h-4 w-4 text-gray-500" />
                  <p className="text-sm text-gray-700">
                    <strong>Client Version: v{VERSION}</strong>
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 
                    `${authMode === 'signup' ? 'Creating account...' : 'Signing in...'}` 
                    : `${authMode === 'signup' ? 'Create Account' : 'Sign in'}`
                  }
                </button>

                <button
                  type="button"
                  onClick={() => setShowLoginForm(false)}
                  className="w-full text-sm text-gray-600 hover:text-gray-800"
                >
                  ← Back to main options
                </button>
              </div>
            </form>
          )}

          {/* Auth mode toggle - always visible */}
          <div className="mt-6 text-center">
            <button
              type="button"
              className="text-sm text-blue-600 hover:text-blue-500"
              onClick={toggleAuthMode}
            >
              {authMode === 'login' 
                ? "Don't have an account? Sign up"
                : "Already have an account? Sign in"
              }
            </button>
          </div>
        </div>

        {/* Forgot Password Modal */}
        {showForgotPassword && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Reset Password</h3>
                <button
                  onClick={() => {
                    setShowForgotPassword(false);
                    setForgotPasswordEmail('');
                    setForgotPasswordError(null);
                    setForgotPasswordMessage(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <p className="text-sm text-gray-600 mb-4">
                Enter your email address and we'll send you a link to reset your password.
              </p>

              <form onSubmit={handleForgotPassword}>
                <div className="mb-4">
                  <label htmlFor="forgotEmail" className="sr-only">
                    Email address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="forgotEmail"
                      type="email"
                      required
                      className="relative block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter your email address"
                      value={forgotPasswordEmail}
                      onChange={(e) => setForgotPasswordEmail(e.target.value)}
                      disabled={forgotPasswordLoading}
                    />
                  </div>
                </div>

                {forgotPasswordError && (
                  <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg mb-4">
                    <AlertCircle className="h-5 w-5" />
                    <span className="text-sm">{forgotPasswordError}</span>
                  </div>
                )}

                {forgotPasswordMessage && (
                  <div className="flex items-start space-x-2 text-green-600 bg-green-50 p-3 rounded-lg mb-4">
                    <Info className="h-5 w-5 mt-0.5" />
                    <span className="text-sm whitespace-pre-line">{forgotPasswordMessage}</span>
                  </div>
                )}

                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForgotPassword(false);
                      setForgotPasswordEmail('');
                      setForgotPasswordError(null);
                      setForgotPasswordMessage(null);
                    }}
                    className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={forgotPasswordLoading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={forgotPasswordLoading || !forgotPasswordEmail}
                    className="flex-1 py-2 px-4 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {forgotPasswordLoading ? 'Sending...' : 'Send Reset Link'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </GoogleOAuthProvider>
  );
};