import React, { useState, useEffect } from 'react';
import { User, Mail, AlertCircle, CheckCircle, Info, Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { useData } from '../context/DataContext';

interface ProfileUpdateProps {
  onBack: () => void;
}

export const ProfileUpdate: React.FC<ProfileUpdateProps> = ({ onBack }) => {
  const { currentUser, dataService } = useData();
  const [formData, setFormData] = useState({
    name: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [changePassword, setChangePassword] = useState(false);

  // Initialize form with current user data
  useEffect(() => {
    if (currentUser) {
      setFormData(prev => ({
        ...prev,
        name: currentUser.name || ''
      }));
    }
  }, [currentUser]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear errors when user starts typing
    if (error) setError(null);
    if (success) setSuccess(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser) {
      setError('User not found');
      return;
    }

    // Validation
    if (!formData.name.trim()) {
      setError('Name is required');
      return;
    }

    // Password change validation
    if (changePassword) {
      if (!formData.currentPassword) {
        setError('Current password is required to change password');
        return;
      }
      
      if (!formData.newPassword) {
        setError('New password is required');
        return;
      }

      if (formData.newPassword.length < 6) {
        setError('New password must be at least 6 characters long');
        return;
      }

      if (formData.newPassword !== formData.confirmPassword) {
        setError('New passwords do not match');
        return;
      }

      if (formData.currentPassword === formData.newPassword) {
        setError('New password must be different from current password');
        return;
      }
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Prepare update data
      const updateData: any = {
        name: formData.name.trim()
      };

      // Add password change if requested
      if (changePassword) {
        updateData.currentPassword = formData.currentPassword;
        updateData.newPassword = formData.newPassword;
      }

      // Check if we have a specific profile update endpoint
      const apiService = dataService as any;
      let updatedUser;
      
      if (apiService.updateProfile) {
        // Use profile-specific endpoint if available
        updatedUser = await apiService.updateProfile(updateData);
      } else if (changePassword) {
        // For password changes, we might need to use a different endpoint
        // For now, let's try the auth controller's update method via direct fetch
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
        const token = localStorage.getItem('accessToken');
        
        const response = await fetch(`${apiUrl}/auth/update-profile`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          credentials: 'include',
          body: JSON.stringify(updateData),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || 'Failed to update profile');
        }

        const data = await response.json();
        updatedUser = data.user;
      } else {
        // Simple name update using existing updateUser method
        updatedUser = await dataService.updateUser({
          ...currentUser,
          name: formData.name.trim()
        });
      }

      // Clear password fields on success
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
      setChangePassword(false);

      setSuccess(
        changePassword 
          ? 'Profile and password updated successfully!' 
          : 'Profile updated successfully!'
      );

      // Auto-hide success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);

    } catch (err: any) {
      console.error('Profile update failed:', err);
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordToggle = () => {
    setChangePassword(!changePassword);
    if (changePassword) {
      // Clear password fields when toggling off
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
    }
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-600" />
          <h2 className="mt-6 text-xl font-bold text-gray-900">No user found</h2>
          <p className="mt-2 text-sm text-gray-600">Please log in to update your profile.</p>
          <button
            onClick={onBack}
            className="mt-4 text-sm text-blue-600 hover:text-blue-500 underline"
          >
            Go back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <button
            onClick={onBack}
            className="flex items-center text-sm text-gray-600 hover:text-gray-800 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Study Groups
          </button>
          
          <div className="mx-auto h-12 w-12 bg-blue-600 rounded-full flex items-center justify-center">
            <User className="h-6 w-6 text-white" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Update Your Profile
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Manage your account information and settings
          </p>
        </div>

        {/* Current User Info */}
        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <div className="flex items-center space-x-4">
            {currentUser.picture ? (
              <img 
                src={currentUser.picture} 
                alt={`${currentUser.name}'s profile`}
                className="w-12 h-12 rounded-full border-2 border-gray-200 object-cover"
              />
            ) : (
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-blue-600" />
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-gray-900">Current Account</p>
              <p className="text-sm text-gray-500 flex items-center">
                <Mail className="w-4 h-4 mr-1" />
                {currentUser.email}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Role: {currentUser.role === 'admin' ? 'Administrator' : 'User'}
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

          {/* Password Change Toggle */}
          <div className="flex items-center">
            <input
              id="changePassword"
              type="checkbox"
              checked={changePassword}
              onChange={handlePasswordToggle}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="changePassword" className="ml-2 block text-sm text-gray-900">
              Change password
            </label>
          </div>

          {/* Password Fields - Only shown when change password is checked */}
          {changePassword && (
            <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
              {/* Current Password */}
              <div>
                <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">
                  Current Password <span className="text-red-500">*</span>
                </label>
                <div className="mt-2 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="currentPassword"
                    name="currentPassword"
                    type={showCurrentPassword ? 'text' : 'password'}
                    required={changePassword}
                    className="relative block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter your current password"
                    value={formData.currentPassword}
                    onChange={handleInputChange}
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <button
                      type="button"
                      className="text-gray-400 hover:text-gray-600 focus:outline-none"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    >
                      {showCurrentPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* New Password */}
              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                  New Password <span className="text-red-500">*</span>
                </label>
                <p className="mt-1 text-sm text-gray-500">
                  Must be at least 6 characters long.
                </p>
                <div className="mt-2 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="newPassword"
                    name="newPassword"
                    type={showNewPassword ? 'text' : 'password'}
                    required={changePassword}
                    className="relative block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter your new password"
                    value={formData.newPassword}
                    onChange={handleInputChange}
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <button
                      type="button"
                      className="text-gray-400 hover:text-gray-600 focus:outline-none"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Confirm New Password */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  Confirm New Password <span className="text-red-500">*</span>
                </label>
                <div className="mt-2 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    required={changePassword}
                    className="relative block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Confirm your new password"
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
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg">
              <AlertCircle className="h-5 w-5" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="flex items-center space-x-2 text-green-600 bg-green-50 p-3 rounded-lg">
              <CheckCircle className="h-5 w-5" />
              <span className="text-sm">{success}</span>
            </div>
          )}

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-start space-x-2">
              <Info className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium">Profile Update Notes:</p>
                <ul className="mt-1 list-disc list-inside space-y-1 text-xs">
                  <li>Your email address cannot be changed from this page</li>
                  <li>Display name changes are visible immediately to other users</li>
                  <li>Password changes require your current password for verification</li>
                  <li>You'll remain logged in after updating your profile</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                changePassword ? 'Updating Profile & Password...' : 'Updating Profile...'
              ) : (
                changePassword ? 'Update Profile & Password' : 'Update Profile'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};