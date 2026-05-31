import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ==================== Navigation Store ====================
export type AppView = 
  | 'landing' 
  | 'login' 
  | 'register' 
  | 'dashboard' 
  | 'projects' 
  | 'project-detail' 
  | 'project-create' 
  | 'documents'
  | 'profile' 
  | 'settings'
  | 'audit';

interface NavigationState {
  currentView: AppView;
  selectedProjectId: string | null;
  navigate: (view: AppView) => void;
  selectProject: (id: string) => void;
}

export const useNavigation = create<NavigationState>((set) => ({
  currentView: 'landing',
  selectedProjectId: null,
  navigate: (view) => set({ currentView: view }),
  selectProject: (id) => set({ selectedProjectId: id }),
}));

// ==================== Auth Store ====================
interface AuthState {
  token: string | null;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
    avatar?: string;
  } | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setAuth: (token: string, user: AuthState['user']) => void;
  clearAuth: () => void;
  updateUser: (data: Partial<AuthState['user']>) => void;
  setLoading: (loading: boolean) => void;
}

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      isLoading: false,
      setAuth: (token, user) => set({ token, user, isAuthenticated: true, isLoading: false }),
      clearAuth: () => set({ token: null, user: null, isAuthenticated: false, isLoading: false }),
      updateUser: (data) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...data } : null,
        })),
      setLoading: (loading) => set({ isLoading: loading }),
    }),
    { name: 'espacify-auth', partialize: (state) => ({ token: state.token }) }
  )
);

// ==================== Projects Store ====================
export interface Project {
  id: string;
  name: string;
  description: string | null;
  domain: string;
  status: string;
  budget: number | null;
  currency: string;
  preferences: Record<string, unknown> | null;
  userId: string;
  documentsCount?: number;
  createdAt: string;
  updatedAt: string;
}

interface ProjectsState {
  projects: Project[];
  isLoading: boolean;
  error: string | null;
  setProjects: (projects: Project[]) => void;
  addProject: (project: Project) => void;
  updateProject: (id: string, data: Partial<Project>) => void;
  removeProject: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useProjects = create<ProjectsState>((set) => ({
  projects: [],
  isLoading: false,
  error: null,
  setProjects: (projects) => set({ projects }),
  addProject: (project) => set((state) => ({ projects: [project, ...state.projects] })),
  updateProject: (id, data) =>
    set((state) => ({
      projects: state.projects.map((p) => (p.id === id ? { ...p, ...data } : p)),
    })),
  removeProject: (id) =>
    set((state) => ({ projects: state.projects.filter((p) => p.id !== id) })),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
}));

// ==================== Documents Store ====================
export interface Document {
  id: string;
  projectId: string;
  type: string;
  title: string;
  content: string;
  status: string;
  version: number;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

interface DocumentsState {
  documents: Document[];
  currentDocument: Document | null;
  isLoading: boolean;
  setDocuments: (documents: Document[]) => void;
  setCurrentDocument: (doc: Document | null) => void;
  addDocument: (doc: Document) => void;
  updateDocument: (id: string, data: Partial<Document>) => void;
  setLoading: (loading: boolean) => void;
}

export const useDocuments = create<DocumentsState>((set) => ({
  documents: [],
  currentDocument: null,
  isLoading: false,
  setDocuments: (documents) => set({ documents }),
  setCurrentDocument: (doc) => set({ currentDocument: doc }),
  addDocument: (doc) => set((state) => ({ documents: [doc, ...state.documents] })),
  updateDocument: (id, data) =>
    set((state) => ({
      documents: state.documents.map((d) => (d.id === id ? { ...d, ...data } : d)),
      currentDocument:
        state.currentDocument?.id === id
          ? { ...state.currentDocument, ...data }
          : state.currentDocument,
    })),
  setLoading: (loading) => set({ isLoading: loading }),
}));

// ==================== Audit Store ====================
export interface AuditEntry {
  id: string;
  userId: string | null;
  action: string;
  entity: string;
  entityId: string | null;
  details: string | null;
  ipAddress: string | null;
  createdAt: string;
}

interface AuditState {
  entries: AuditEntry[];
  isLoading: boolean;
  setEntries: (entries: AuditEntry[]) => void;
  setLoading: (loading: boolean) => void;
}

export const useAudit = create<AuditState>((set) => ({
  entries: [],
  isLoading: false,
  setEntries: (entries) => set({ entries }),
  setLoading: (loading) => set({ isLoading: loading }),
}));

// ==================== Notifications Store ====================
interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  read: boolean;
  createdAt: string;
}

interface NotificationsState {
  notifications: NotificationItem[];
  addNotification: (n: Omit<NotificationItem, 'id' | 'read' | 'createdAt'>) => void;
  markAsRead: (id: string) => void;
  clearAll: () => void;
}

export const useNotifications = create<NotificationsState>((set) => ({
  notifications: [],
  addNotification: (n) =>
    set((state) => ({
      notifications: [
        {
          ...n,
          id: crypto.randomUUID(),
          read: false,
          createdAt: new Date().toISOString(),
        },
        ...state.notifications,
      ].slice(0, 50),
    })),
  markAsRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
    })),
  clearAll: () => set({ notifications: [] }),
}));
