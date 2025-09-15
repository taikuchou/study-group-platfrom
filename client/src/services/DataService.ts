// ============== Service Interfaces ==============
import type { User, Topic, Session, Interaction } from '../types';

export interface DataService {
  // Users
  listUsers(): Promise<User[]>;
  getUserNames?(): Promise<{ id: number; name: string }[]>;
  createUser(user: User): Promise<User>;
  updateUser(user: User): Promise<User>;
  deleteUser(id: number): Promise<void>;

  // Topics
  listTopics(): Promise<Topic[]>;
  getTopic(id: number): Promise<Topic | undefined>;
  createTopic(topic: Topic): Promise<Topic>;
  updateTopic(topic: Topic): Promise<Topic>;
  deleteTopic(id: number): Promise<void>;

  // Sessions
  listSessions(): Promise<Session[]>;
  getSession(id: number): Promise<Session | undefined>;
  createSession(session: Session): Promise<Session>;
  updateSession(session: Session): Promise<Session>;
  deleteSession(id: number): Promise<void>;

  // Interactions
  listInteractions(): Promise<Interaction[]>;
  createInteraction(i: Interaction): Promise<Interaction>;
  updateInteraction(i: Interaction): Promise<Interaction>;
  deleteInteraction(id: number): Promise<void>;

  // Authentication (only for ApiDataService)
  login?(email: string, password: string): Promise<{ user: User; accessToken: string }>;
  signup?(name: string, email: string, password: string): Promise<{ user: User; accessToken: string }>;
  logout?(): Promise<void>;
  forgotPassword?(email: string): Promise<{ message: string }>;
  resetPassword?(token: string, password: string): Promise<{ message: string }>;
  getCurrentUser?(): Promise<User>;
  isAuthenticated?(): boolean;
}

export type ServiceFactory = () => DataService;
