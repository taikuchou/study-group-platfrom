import React from 'react';
import { Shield, User as UserIcon, Edit, Trash2 } from 'lucide-react';
import type { User } from '../../../types';
import { useTranslation } from '../../../context/LanguageContext';

type Props = {
  users: User[];
  currentUserRole: 'admin' | 'user';
  onCreateUser: () => void;
  onEditUser: (user: User) => void;
  onDeleteUser: (user: User) => void;
};

const UserManagement: React.FC<Props> = ({
  users,
  currentUserRole,
  onCreateUser,
  onEditUser,
  onDeleteUser
}) => {
  const { t } = useTranslation();
  if (currentUserRole !== 'admin') {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center text-gray-500">
          {t('user.adminOnly')}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">{t('nav.users')}</h2>
      </div>

      <div className="space-y-4">
        {users.map(user => (
          <div key={user.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center space-x-4">
              {user.role === 'admin' ? (
                <Shield className="w-8 h-8 text-purple-600" />
              ) : (
                <UserIcon className="w-8 h-8 text-blue-600" />
              )}
              
              <div>
                <h3 className="font-medium text-gray-900">{user.name}</h3>
                <p className="text-sm text-gray-500">{user.email}</p>
                <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                  user.role === 'admin' 
                    ? 'bg-purple-100 text-purple-800' 
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {user.role === 'admin' ? t('form.roleAdmin') : t('form.roleUser')}
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => onEditUser(user)}
                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                title={t('user.editUser')}
              >
                <Edit className="w-4 h-4" />
              </button>
              
              <button
                onClick={() => onDeleteUser(user)}
                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                title={t('user.deleteUser')}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export { UserManagement };