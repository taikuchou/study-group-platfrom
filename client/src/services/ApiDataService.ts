import type { DataService } from "./DataService";
import type { User, Topic, Session, Interaction } from "../types";

/** API service with JWT authentication support */
const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000/api";

// Debug BASE_URL
console.log('ApiDataService BASE_URL:', BASE_URL);
console.log('Environment VITE_API_URL:', import.meta.env.VITE_API_URL);

class AuthManager {
  private static accessToken: string | null = null;

  static setToken(token: string) {
    this.accessToken = token;
    localStorage.setItem('accessToken', token);
  }

  static getToken(): string | null {
    if (!this.accessToken) {
      this.accessToken = localStorage.getItem('accessToken');
    }
    return this.accessToken;
  }

  static clearToken() {
    this.accessToken = null;
    localStorage.removeItem('accessToken');
  }

  static getAuthHeaders(): HeadersInit {
    const token = this.getToken();
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  }
}

async function json<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    if (res.status === 401) {
      AuthManager.clearToken();
      throw new Error('Authentication required. Please log in.');
    }
    throw new Error(`HTTP ${res.status} ${res.statusText}: ${body}`);
  }
  return res.json() as Promise<T>;
}

async function authenticatedFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const headers = {
    'Content-Type': 'application/json',
    ...AuthManager.getAuthHeaders(),
    ...options.headers,
  };

  return fetch(url, {
    ...options,
    headers,
  });
}

export class ApiDataService implements DataService {
  // Authentication methods
  async login(email: string, password: string): Promise<{ user: User; accessToken: string }> {
    console.log('Making login request to:', `${BASE_URL}/auth/login`);
    
    // First test if server is reachable
    try {
      console.log('Testing server connectivity...');
      const healthCheck = await fetch(`${BASE_URL.replace('/api', '')}/api/health`, {
        method: 'GET',
      });
      console.log('Health check response:', healthCheck.status);
    } catch (error) {
      console.error('Server unreachable:', error);
      throw new Error(`Cannot connect to server at ${BASE_URL}. Please ensure the server is running.`);
    }
    
    try {
      const requestOptions = {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        mode: 'cors' as RequestMode,
        credentials: 'omit' as RequestCredentials, // Changed from 'include' to avoid CORS issues
      };
      
      console.log('Making login request with options:', requestOptions);
      const res = await fetch(`${BASE_URL}/auth/login`, requestOptions);
      console.log('Login response status:', res.status);
      console.log('Login response headers:', [...res.headers.entries()]);
      
      const data = await json<{ user: User; accessToken: string }>(res);
      AuthManager.setToken(data.accessToken);
      console.log('Login successful, token set');
      return data;
    } catch (error) {
      console.error('Login request failed:', error);
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error(`Network error: Cannot connect to API server. Please check if the server is running at ${BASE_URL}`);
      }
      throw error;
    }
  }

  async signup(name: string, email: string, password: string): Promise<{ user: User; accessToken: string }> {
    console.log('Making signup request to:', `${BASE_URL}/auth/signup`);
    
    // First test if server is reachable
    try {
      console.log('Testing server connectivity...');
      const healthCheck = await fetch(`${BASE_URL.replace('/api', '')}/api/health`, {
        method: 'GET',
      });
      console.log('Health check response:', healthCheck.status);
    } catch (error) {
      console.error('Server unreachable:', error);
      throw new Error(`Cannot connect to server at ${BASE_URL}. Please ensure the server is running.`);
    }
    
    try {
      const requestOptions = {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
        mode: 'cors' as RequestMode,
        credentials: 'omit' as RequestCredentials,
      };
      
      console.log('Making signup request with options:', requestOptions);
      const res = await fetch(`${BASE_URL}/auth/signup`, requestOptions);
      console.log('Signup response status:', res.status);
      console.log('Signup response headers:', [...res.headers.entries()]);
      
      const data = await json<{ user: User; accessToken: string }>(res);
      AuthManager.setToken(data.accessToken);
      console.log('Signup successful, token set');
      return data;
    } catch (error) {
      console.error('Signup request failed:', error);
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error(`Network error: Cannot connect to API server. Please check if the server is running at ${BASE_URL}`);
      }
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      await authenticatedFetch(`${BASE_URL}/auth/logout`, { method: 'POST' });
    } finally {
      AuthManager.clearToken();
    }
  }

  async forgotPassword(email: string): Promise<{ message: string }> {
    const res = await fetch(`${BASE_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    
    return json<{ message: string }>(res);
  }

  async resetPassword(token: string, password: string): Promise<{ message: string }> {
    const res = await fetch(`${BASE_URL}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, password }),
    });
    
    return json<{ message: string }>(res);
  }

  async getCurrentUser(): Promise<User> {
    const res = await authenticatedFetch(`${BASE_URL}/auth/me`);
    return json<User>(res);
  }

  async completeGoogleProfile(name: string, password: string): Promise<{ user: User; message: string }> {
    const res = await authenticatedFetch(`${BASE_URL}/auth/complete-profile`, {
      method: "POST",
      body: JSON.stringify({ name, password }),
    });
    return json<{ user: User; message: string }>(res);
  }

  isAuthenticated(): boolean {
    return AuthManager.getToken() !== null;
  }

  async listUsers(): Promise<User[]> {
    const res = await authenticatedFetch(`${BASE_URL}/users`);
    return json<User[]>(res);
  }

  async getUserNames(): Promise<{ id: number; name: string }[]> {
    const res = await authenticatedFetch(`${BASE_URL}/users/names`);
    return json<{ id: number; name: string }[]>(res);
  }

  async createUser(user: User): Promise<User> {
    const res = await authenticatedFetch(`${BASE_URL}/users`, {
      method: "POST",
      body: JSON.stringify(user),
    });
    return json<User>(res);
  }

  async updateUser(user: User): Promise<User> {
    const res = await authenticatedFetch(`${BASE_URL}/users/${user.id}`, {
      method: "PUT",
      body: JSON.stringify(user),
    });
    return json<User>(res);
  }

  async deleteUser(id: number): Promise<void> {
    const res = await authenticatedFetch(`${BASE_URL}/users/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new Error(`HTTP ${res.status} ${res.statusText}: ${body}`);
    }
  }
  async listTopics(): Promise<Topic[]> {
    const res = await authenticatedFetch(`${BASE_URL}/topics`);
    return json<Topic[]>(res);
  }
  async getTopic(id: number): Promise<Topic | undefined> {
    const res = await authenticatedFetch(`${BASE_URL}/topics/${id}`);
    return json<Topic>(res);
  }
  async createTopic(topic: Topic): Promise<Topic> {
    const res = await authenticatedFetch(`${BASE_URL}/topics`, {
      method: "POST",
      body: JSON.stringify(topic),
    });
    return json<Topic>(res);
  }
  async updateTopic(topic: Topic): Promise<Topic> {
    const res = await authenticatedFetch(`${BASE_URL}/topics/${topic.id}`, {
      method: "PUT",
      body: JSON.stringify(topic),
    });
    return json<Topic>(res);
  }
  async deleteTopic(id: number): Promise<void> {
    const res = await authenticatedFetch(`${BASE_URL}/topics/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new Error(`HTTP ${res.status} ${res.statusText}: ${body}`);
    }
  }

  async listSessions(): Promise<Session[]> {
    const res = await authenticatedFetch(`${BASE_URL}/sessions`);
    return json<Session[]>(res);
  }

  async getSession(id: number): Promise<Session | undefined> {
    const res = await authenticatedFetch(`${BASE_URL}/sessions/${id}`);
    return json<Session>(res);
  }

  async createSession(session: Session): Promise<Session> {
    const res = await authenticatedFetch(`${BASE_URL}/sessions`, {
      method: "POST",
      body: JSON.stringify(session),
    });
    return json<Session>(res);
  }

  async updateSession(session: Session): Promise<Session> {
    const res = await authenticatedFetch(`${BASE_URL}/sessions/${session.id}`, {
      method: "PUT",
      body: JSON.stringify(session),
    });
    return json<Session>(res);
  }

  async deleteSession(id: number): Promise<void> {
    const res = await authenticatedFetch(`${BASE_URL}/sessions/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new Error(`HTTP ${res.status} ${res.statusText}: ${body}`);
    }
  }

  async listInteractions(): Promise<Interaction[]> {
    const res = await authenticatedFetch(`${BASE_URL}/interactions`);
    return json<Interaction[]>(res);
  }

  async createInteraction(i: Interaction): Promise<Interaction> {
    const res = await authenticatedFetch(`${BASE_URL}/interactions`, {
      method: "POST",
      body: JSON.stringify(i),
    });
    return json<Interaction>(res);
  }

  async updateInteraction(i: Interaction): Promise<Interaction> {
    const res = await authenticatedFetch(`${BASE_URL}/interactions/${i.id}`, {
      method: "PUT",
      body: JSON.stringify(i),
    });
    return json<Interaction>(res);
  }

  async deleteInteraction(id: number): Promise<void> {
    const res = await authenticatedFetch(`${BASE_URL}/interactions/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new Error(`HTTP ${res.status} ${res.statusText}: ${body}`);
    }
  }
}

// Export AuthManager for external access
export { AuthManager };
