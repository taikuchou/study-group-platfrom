import React, { useState } from 'react';
import { User, Mail, AlertCircle, CheckCircle, Info, Lock, Eye, EyeOff } from 'lucide-react';

interface GoogleProfileCompletionProps {
  userEmail: string;
  userName: string;
  userPicture?: string;
  onComplete: (profileData: {
    name: string;
    password: string;
    confirmPassword: string;
  }) => Promise<void>;
  onSkip?: () => void;
  onNavigateToApp?: () => void;
}

export const GoogleProfileCompletion: React.FC<GoogleProfileCompletionProps> = ({
  userEmail,
  userName,
  userPicture,
  onComplete,
  onSkip,
  onNavigateToApp
}) => {
  const [formData, setFormData] = useState({
    name: userName || '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name.trim()) {
      setError('Please enter your name');
      return;
    }

    if (!formData.password) {
      setError('Please enter a password');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await onComplete({
        name: formData.name.trim(),
        password: formData.password,
        confirmPassword: formData.confirmPassword
      });
      setSuccess(true);
      
      // Automatically navigate to main app after a brief success message
      setTimeout(() => {
        if (onNavigateToApp) {
          onNavigateToApp();
        } else {
          // Fallback: reload the page to trigger main app
          window.location.reload();
        }
      }, 2000); // Show success message for 2 seconds
    } catch (err: any) {
      console.error('Profile completion failed:', err);
      setError(err.message || 'Failed to complete profile');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 bg-green-600 rounded-full flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-white" />
            </div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Welcome to Study Group Platform!
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Your profile has been completed successfully.
            </p>
            <p className="mt-4 text-center text-sm text-gray-500">
              You will be redirected to the study groups in a few seconds...
            </p>
          </div>
          
          <div className="mt-8 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
          
          <div className="mt-6 text-center">
            <button
              onClick={() => {
                if (onNavigateToApp) {
                  onNavigateToApp();
                } else {
                  // Fallback: reload the page to trigger main app
                  window.location.reload();
                }
              }}
              className="text-sm text-blue-600 hover:text-blue-500 underline"
            >
              Go to Study Groups now
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-12 w-12 bg-blue-600 rounded-full flex items-center justify-center">
            <User className="h-6 w-6 text-white" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Complete Your Profile
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Welcome! Please confirm your information to get started.
          </p>
        </div>

        {/* User Info Display */}
        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <div className="flex items-center space-x-4">
            {userPicture ? (
              <img 
                src={userPicture} 
                alt="Profile" 
                className="w-12 h-12 rounded-full border-2 border-gray-200"
              />
            ) : (
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-blue-600" />
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-gray-900">Signed in with Google</p>
              <p className="text-sm text-gray-500 flex items-center">
                <Mail className="w-4 h-4 mr-1" />
                {userEmail}
              </p>
            </div>
          </div>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {/* Name Field */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Display Name <span className="text-red-500">*</span>
            </label>
            <p className="mt-1 text-sm text-gray-500">
              This name will be visible to other members of the study group platform.
            </p>
            <div className="mt-2 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="relative block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your display name"
                value={formData.name}
                onChange={handleInputChange}
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Set Password <span className="text-red-500">*</span>
            </label>
            <p className="mt-1 text-sm text-gray-500">
              Create a password for your account (minimum 6 characters).
            </p>
            <div className="mt-2 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                required
                className="relative block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleInputChange}
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <button
                  type="button"
                  className="text-gray-400 hover:text-gray-600 focus:outline-none"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Confirm Password Field */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
              Confirm Password <span className="text-red-500">*</span>
            </label>
            <p className="mt-1 text-sm text-gray-500">
              Please confirm your password.
            </p>
            <div className="mt-2 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                required
                className="relative block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <button
                  type="button"
                  className="text-gray-400 hover:text-gray-600 focus:outline-none"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {error && (
            <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg">
              <AlertCircle className="h-5 w-5" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-start space-x-2">
              <Info className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium">Complete your account setup:</p>
                <ul className="mt-1 list-disc list-inside space-y-1 text-xs">
                  <li>Confirm your display name from Google</li>
                  <li>Set a secure password for your account</li>
                  <li>You'll be registered as a regular user</li>
                  <li>You can participate in study groups and sessions</li>
                  <li>You can update your profile anytime in settings</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="flex space-x-3">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Completing Profile...' : 'Complete Profile'}
            </button>
            
            {onSkip && (
              <button
                type="button"
                onClick={onSkip}
                disabled={loading}
                className="flex-1 py-3 px-4 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Skip for now
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};