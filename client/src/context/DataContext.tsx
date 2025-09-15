import React, { createContext, useContext, useMemo, useState, useEffect } from 'react';
import type { User, Topic, Session, Interaction } from '../types';
import type { DataService } from '../services/DataService';
import { MockDataService } from '../services/MockDataService';
import { ApiDataService, AuthManager } from '../services/ApiDataService';
import { canPerform, type Action, type Ownable } from './Ownership';



export type DataSource = 'api' | 'mock';

function resolveDefaultSource(): DataSource {
  const fromEnv = (import.meta.env.VITE_DATA_SOURCE ?? '').toLowerCase();
  console.log('resolveDefaultSource:', fromEnv);
  return fromEnv === 'api' ? 'api' : 'mock';
}
function serviceFrom(source: DataSource): DataService {
  console.log('serviceFrom:', source);
  return source === 'api' ? new ApiDataService() : new MockDataService();
}

type DataContextValue = {
  currentUser: User;
  setCurrentUser: React.Dispatch<React.SetStateAction<User>>;

  users: User[];
  topics: Topic[];
  sessions: Session[];
  interactions: Interaction[];

  loading: boolean;
  error: string | null;

  reload: () => Promise<void>;
  createUser: (u: User) => Promise<User>;
  updateUser: (u: User) => Promise<User>;
  deleteUser: (id: number) => Promise<void>;
  createTopic: (t: Topic) => Promise<Topic>;
  updateTopic: (t: Topic) => Promise<Topic>;
  deleteTopic: (id: number) => Promise<void>;
  createSession: (s: Session) => Promise<Session>;
  updateSession: (s: Session) => Promise<Session>;
  deleteSession: (id: number) => Promise<void>;
  createInteraction: (i: Interaction) => Promise<Interaction>;
  updateInteraction: (i: Interaction) => Promise<Interaction>;
  deleteInteraction: (id: number) => Promise<void>;

  can: (action: Action, target: Ownable) => boolean;
  OwnershipGuard: <P extends { ownerId?: number }>(
    props: React.PropsWithChildren<{ action: Action; target: Ownable; fallback?: React.ReactNode }>
  ) => JSX.Element;

  source: DataSource;
  setSource?: (s: DataSource) => void;
  
  // Authentication state and methods
  isAuthenticated: boolean;
  profileIncomplete: boolean;
  login: (email: string, password: string) => Promise<{ user: User; accessToken: string }>;
  signup: (name: string, email: string, password: string) => Promise<{ user: User; accessToken: string }>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<{ message: string }>;
  resetPassword: (token: string, password: string) => Promise<{ message: string }>;
  completeProfile: (name: string, password: string) => Promise<{ user: User; message: string }>;
  markProfileIncomplete: () => void;
};

const DataContext = createContext<DataContextValue | null>(null);

export const DataProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [source, setSource] = useState<DataSource>(() => {
    //console.log('Initial source 0:', localStorage.getItem('dataSource'));
    const cached = (typeof window !== 'undefined') ? localStorage.getItem('dataSource') as DataSource | null : null;
    //console.log('Initial source:', cached);
    return cached ?? resolveDefaultSource();
  });
  useEffect(() => {
    
    if (typeof window !== 'undefined') localStorage.setItem('dataSource', source);
  }, [source]);

  const dataService: DataService = useMemo(() => serviceFrom(source), [source]);

  const [currentUser, setCurrentUser] = useState<User>({
    id: 1,
    name: 'Alice Chen',
    email: 'alice@example.com',
    role: 'admin',
    createdAt: '2024-01-15',
  } as User);

  const [users, setUsers] = useState<User[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    // Check if user is authenticated when using API mode
    return source === 'mock' || AuthManager.getToken() !== null;
  });
  const [profileIncomplete, setProfileIncomplete] = useState(false);

  const reload = async () => {
    // Skip reload if in API mode and not authenticated
    if (source === 'api' && !isAuthenticated) {
      return;
    }
    
    setLoading(true); setError(null);
    try {
      // Load data independently to avoid one failure affecting others
      const results = await Promise.allSettled([
        dataService.listUsers(), 
        dataService.listTopics(), 
        dataService.listSessions(), 
        dataService.listInteractions()
      ]);
      
      // Process results individually
      const [usersResult, topicsResult, sessionsResult, interactionsResult] = results;
      
      // Set users only if successful (ignore 403 errors for regular users)
      if (usersResult.status === 'fulfilled') {
        setUsers(usersResult.value);
      } else if (usersResult.reason?.message?.includes('403') || usersResult.reason?.message?.includes('Forbidden')) {
        // Regular users can't access full users list, try to get user names instead
        console.log('Users list access denied, trying to get user names for display...');
        try {
          if (dataService.getUserNames) {
            const userNames = await dataService.getUserNames();
            // Convert to minimal User objects for display purposes only
            const displayUsers: User[] = userNames.map(nameInfo => ({
              id: nameInfo.id,
              name: nameInfo.name,
              email: '', // Don't expose email to regular users
              role: 'user', // Default role
              createdAt: '',
            }));
            setUsers(displayUsers);
            console.log('Successfully loaded user names for display:', displayUsers.length);
          } else {
            console.log('getUserNames method not available');
          }
        } catch (nameError) {
          console.error('Failed to load user names:', nameError);
        }
      } else {
        console.error('Failed to load users:', usersResult.reason);
      }
      
      // Set other data if successful
      if (topicsResult.status === 'fulfilled') {
        setTopics(topicsResult.value);
      } else {
        console.error('Failed to load topics:', topicsResult.reason);
        setError('Failed to load topics');
      }
      
      if (sessionsResult.status === 'fulfilled') {
        setSessions(sessionsResult.value);
      } else {
        console.error('Failed to load sessions:', sessionsResult.reason);
      }
      
      if (interactionsResult.status === 'fulfilled') {
        setInteractions(interactionsResult.value);
      } else {
        console.error('Failed to load interactions:', interactionsResult.reason);
      }
      
    } catch (e: any) {
      setError(e?.message ?? 'Unknown error');
      // If authentication error, clear auth state
      if (e?.message?.includes('Authentication required')) {
        setIsAuthenticated(false);
      }
    } finally {
      setLoading(false);
    }
  };

  // Authentication methods
  const login = async (email: string, password: string) => {
    if (source !== 'api') {
      throw new Error('Login is only available in API mode');
    }
    
    const apiService = dataService as ApiDataService;
    const result = await apiService.login(email, password);
    setCurrentUser(result.user);
    setIsAuthenticated(true);
    
    // Reload data after successful login
    await reload();
    
    return result;
  };

  const signup = async (name: string, email: string, password: string) => {
    if (source !== 'api') {
      throw new Error('Signup is only available in API mode');
    }
    
    const apiService = dataService as ApiDataService;
    const result = await apiService.signup(name, email, password);
    setCurrentUser(result.user);
    setIsAuthenticated(true);
    
    // Reload data after successful signup
    await reload();
    
    return result;
  };

  const logout = async () => {
    if (source === 'api') {
      const apiService = dataService as ApiDataService;
      await apiService.logout();
    }
    setIsAuthenticated(false);
    // Clear all data
    setUsers([]);
    setTopics([]);
    setSessions([]);
    setInteractions([]);
  };

  const forgotPassword = async (email: string) => {
    if (source !== 'api') {
      throw new Error('Forgot password is only available in API mode');
    }
    
    const apiService = dataService as ApiDataService;
    return await apiService.forgotPassword(email);
  };

  const resetPassword = async (token: string, password: string) => {
    if (source !== 'api') {
      throw new Error('Reset password is only available in API mode');
    }
    
    const apiService = dataService as ApiDataService;
    return await apiService.resetPassword(token, password);
  };

  const completeProfile = async (name: string, password: string) => {
    if (source !== 'api') {
      throw new Error('Profile completion is only available in API mode');
    }
    
    const apiService = dataService as ApiDataService;
    const result = await apiService.completeGoogleProfile(name, password);
    setCurrentUser(result.user);
    setProfileIncomplete(false);
    
    // Reload data after successful profile completion
    await reload();
    
    return result;
  };

  const markProfileIncomplete = () => {
    setProfileIncomplete(true);
  };

  // Fetch current user data from API
  const fetchCurrentUser = async () => {
    if (source === 'api' && AuthManager.getToken()) {
      try {
        const apiService = dataService as ApiDataService;
        if (apiService.getCurrentUser) {
          const user = await apiService.getCurrentUser();
          setCurrentUser(user);
        }
      } catch (error: any) {
        console.error('Failed to fetch current user:', error);
        // If token is invalid, clear auth state
        if (error.message.includes('Authentication required')) {
          setIsAuthenticated(false);
          AuthManager.clearToken();
        }
      }
    }
  };

  // Update authentication state when source changes
  useEffect(() => {
    const newAuthState = source === 'mock' || AuthManager.getToken() !== null;
    setIsAuthenticated(newAuthState);
    
    // Fetch current user when switching to API mode with valid token
    if (newAuthState && source === 'api') {
      fetchCurrentUser();
    }
  }, [source]);

  // Check for token changes periodically (for Google OAuth and other external token updates)
  useEffect(() => {
    if (source !== 'api') return;
    
    const checkAuthState = () => {
      const hasToken = AuthManager.getToken() !== null;
      setIsAuthenticated(hasToken);
      
      if (hasToken && !currentUser) {
        fetchCurrentUser();
      }
    };
    
    // Check immediately
    checkAuthState();
    
    // Check every 1 second for token changes (e.g., from Google OAuth)
    const interval = setInterval(checkAuthState, 1000);
    
    return () => clearInterval(interval);
  }, [source, currentUser]);

  useEffect(() => { void reload(); }, [dataService, isAuthenticated]);

  const createUser = async (u: User) => {
    const created = await dataService.createUser(u);
    setUsers(prev => [...prev, created]);
    return created;
  };
  const updateUser = async (u: User) => {
    const updated = await dataService.updateUser(u);
    setUsers(prev => prev.map(x => (x.id === updated.id ? updated : x)));
    return updated;
  };
  const deleteUser = async (id: number) => {
    await dataService.deleteUser(id);
    setUsers(prev => prev.filter(x => x.id !== id));
  };

  const createTopic = async (t: Topic) => {
    const created = await dataService.createTopic(t);
    setTopics(prev => [...prev, created]);
    return created;
  };
  const updateTopic = async (t: Topic) => {
    const updated = await dataService.updateTopic(t);
    setTopics(prev => prev.map(x => (x.id === updated.id ? updated : x)));
    return updated;
  };
  const deleteTopic = async (id: number) => {
    await dataService.deleteTopic(id);
    setTopics(prev => prev.filter(x => x.id !== id));
  };

  const createSession = async (s: Session) => {
    const created = await dataService.createSession(s);
    setSessions(prev => [...prev, created]);
    // 同時更新 topics 中的 sessions
    setTopics(prev => prev.map(topic => 
      topic.id === created.topicId 
        ? { ...topic, sessions: [...topic.sessions, created] }
        : topic
    ));
    return created;
  };
  const updateSession = async (s: Session) => {
    const updated = await dataService.updateSession(s);
    setSessions(prev => prev.map(x => (x.id === updated.id ? updated : x)));
    // 同時更新 topics 中的 sessions
    setTopics(prev => prev.map(topic => ({
      ...topic,
      sessions: topic.sessions.map(session => 
        session.id === updated.id ? updated : session
      )
    })));
    return updated;
  };
  const deleteSession = async (id: number) => {
    await dataService.deleteSession(id);
    setSessions(prev => prev.filter(x => x.id !== id));
    // 同時更新 topics 中的 sessions
    setTopics(prev => prev.map(topic => ({
      ...topic,
      sessions: topic.sessions.filter(session => session.id !== id)
    })));
  };

  const createInteraction = async (i: Interaction) => {
    const created = await dataService.createInteraction(i);
    setInteractions(prev => [...prev, created]);
    return created;
  };

  const updateInteraction = async (i: Interaction) => {
    const updated = await dataService.updateInteraction(i);
    setInteractions(prev => prev.map(x => (x.id === updated.id ? updated : x)));
    return updated;
  };

  const deleteInteraction = async (id: number) => {
    await dataService.deleteInteraction(id);
    setInteractions(prev => prev.filter(x => x.id !== id));
  };

  const can = (action: Action, target: Ownable) => canPerform(currentUser, action, target);
  const OwnershipGuard: DataContextValue['OwnershipGuard'] = ({ action, target, fallback = null, children }) => {
    return can(action, target) ? <>{children}</> : <>{fallback}</>;
  };

  const value: DataContextValue = useMemo(() => ({
    currentUser, setCurrentUser,
    users, topics, sessions, interactions,
    loading, error,
    reload,
    createUser, updateUser, deleteUser,
    createTopic, updateTopic, deleteTopic,
    createSession, updateSession, deleteSession,
    createInteraction, updateInteraction, deleteInteraction,
    can, OwnershipGuard,
    source, setSource,
    isAuthenticated, profileIncomplete, login, signup, logout, forgotPassword, resetPassword, completeProfile, markProfileIncomplete,
  }), [currentUser, users, topics, sessions, interactions, loading, error, source, isAuthenticated, profileIncomplete]);

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useData = () => {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within a DataProvider');
  return ctx;
};
