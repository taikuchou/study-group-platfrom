import { useCallback } from 'react';
import { useData } from '../../../context/DataContext';
import type { User } from '../../../types';

export const useUsers = () => {
  const { 
    users, 
    loading, 
    error, 
    createUser: createUserService, 
    updateUser: updateUserService, 
    deleteUser: deleteUserService 
  } = useData();

  const createUser = useCallback(async (userData: Omit<User, 'id' | 'createdAt'>) => {
    const newUser = {
      id: users.length + 1,
      ...userData,
      createdAt: new Date().toISOString()
    } as User;
    
    return await createUserService(newUser);
  }, [users.length, createUserService]);

  const updateUser = useCallback(async (user: User) => {
    return await updateUserService(user);
  }, [updateUserService]);

  const deleteUser = useCallback(async (id: number) => {
    await deleteUserService(id);
  }, [deleteUserService]);

  const getUserById = useCallback((id: number) => {
    return users.find(user => user.id === id);
  }, [users]);

  const getUserName = useCallback((userId: number) => {
    const user = users.find(u => u.id === userId);
    return user?.name ?? 'Unknown User';
  }, [users]);

  return {
    users,
    loading,
    error,
    createUser,
    updateUser,
    deleteUser,
    getUserById,
    getUserName
  };
};