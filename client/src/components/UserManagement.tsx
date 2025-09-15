import React from 'react';
import { Plus, Edit, Trash2, Shield, User as UserIcon } from 'lucide-react';
import type { User } from '../types';
import { useTranslation } from '../context/LanguageContext';

type Props = {
  users: User[];
  currentUserRole: 'admin' | 'user';
  onCreateUser: () => void;
  onEditUser: (u: User) => void;
  onDeleteUser: (u: User) => void;
};

const UserManagement: React.FC<Props> = ({
  users,
  currentUserRole,
  onCreateUser,
  onEditUser,
  onDeleteUser,
}) => {
  const { t } = useTranslation();
  return (
    <div className="space-y-6">
      {/* 標題列 */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">{t('user.management')}</h2>
        {currentUserRole === 'admin' && (
          <button
            className="bg-blue-600 text-white w-10 h-10 rounded-lg hover:bg-blue-700 flex items-center justify-center"
            onClick={onCreateUser}
            title={t('user.newUser')}
          >
            <Plus className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* 表格 */}
      <div className="bg-white rounded-lg shadow border">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('user.name')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('user.email')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('user.role')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('user.createdAt')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('user.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.map(user => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <UserIcon className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        user.role === 'admin'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-green-100 text-green-800'
                      }`}
                    >
                      {user.role === 'admin' ? (
                        <>
                          <Shield className="w-3 h-3 mr-1" /> {t('nav.admin')}
                        </>
                      ) : (
                        <>
                          <UserIcon className="w-3 h-3 mr-1" /> {t('nav.user')}
                        </>
                      )}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.createdAt}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
                      <button
                        className="text-blue-600 hover:text-blue-900"
                        onClick={() => onEditUser(user)}
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        className="text-red-600 hover:text-red-900"
                        onClick={() => onDeleteUser(user)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td className="px-6 py-6 text-sm text-gray-500" colSpan={5}>
                    {t('user.noUsers')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
