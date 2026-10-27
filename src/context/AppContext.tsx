import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  UserRole,
  Ticket,
  TicketComment,
  IerFormA,
  IerFormB,
  ITProject,
  ProjectUpdate,
  Asset,
  SlaPolicy,
  Department,
  TicketTypeCategory,
  KnowledgeArticle,
  SystemSettings,
  AuditLogEntry
} from '../types';
import {
  initialUsers,
  initialDepartments,
  initialTicketTypes,
  initialSlaPolicies,
  initialTickets,
  initialIerFormsA,
  initialIerFormsB,
  initialProjects,
  initialProjectUpdates,
  initialAssets,
  initialKnowledgeArticles,
  initialSystemSettings,
  initialAuditLogs
} from '../data/mockData';
import { googleSignIn, googleLogout } from '../services/googleAuth';
import {
  syncTicketToRemote,
  syncTicketCommentToRemote,
  syncTicketStatusToRemote,
  syncTicketAssignToRemote,
  syncAssetToRemote,
  syncIerAToRemote,
  syncIerBToRemote,
  syncProjectToRemote,
  syncUserToRemote,
  syncDepartmentToRemote,
  syncSlaPolicyToRemote,
  deleteProjectFromRemote,
  deleteAssetFromRemote,
  deleteTicketFromRemote,
  fetchRemoteTickets,
  pullAllDataFromSupabase,
  subscribeToSupabaseChanges,
  getSupabaseClient
} from '../services/supabase';

export type AppView = 
  | 'dashboard'
  | 'profile'
  | 'knowledge_base'
  | 'directory'
  | 'ier_a'
  | 'ier_b'
  | 'ier_hub'
  | 'it_projects'
  | 'it_project_analytics'
  | 'manage_ticket_types'
  | 'analytics'
  | 'sla_analytics'
  | 'assets'
  | 'manage_departments'
  | 'slas'
  | 'users'
  | 'it_staff'
  | 'role_settings'
  | 'archive'
  | 'settings'
  | 'audit';

export interface ToastMessage {
  id: string;
  type: 'success' | 'danger' | 'info' | 'warning';
  message: string;
}

interface AppContextType {
  // Auth state
  currentUser: User | null;
  isGatewayPassed: boolean;
  authToken: string | null;
  login: (username: string, password?: string, rememberMe?: boolean) => boolean;
  loginWithGoogle: (rememberMe?: boolean) => Promise<boolean>;
  logout: () => void;
  verifyGatewayPin: (pin: string, rememberDevice?: boolean) => boolean;
  switchUserRole: (role: UserRole) => void;
  updateCurrentUserProfile: (profile: Partial<User>) => void;

  // Navigation & UI
  currentView: AppView;
  setCurrentView: (view: AppView) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  darkMode: boolean;
  toggleDarkMode: () => void;
  selectedTicketId: number | null;
  setSelectedTicketId: (id: number | null) => void;
  isSubmitTicketModalOpen: boolean;
  setIsSubmitTicketModalOpen: (open: boolean) => void;
  selectedPrintIer: { type: 'A' | 'B'; data: IerFormA | IerFormB } | null;
  setSelectedPrintIer: (item: { type: 'A' | 'B'; data: IerFormA | IerFormB } | null) => void;

  // Permissions
  canAccess: (permissionKey: 'menu_directory' | 'menu_ier_b' | 'menu_admin_tools' | 'menu_ier_hub' | 'menu_it_projects') => boolean;

  // Data Collections & Operations
  users: User[];
  departments: Department[];
  ticketTypes: TicketTypeCategory[];
  slaPolicies: SlaPolicy[];
  tickets: Ticket[];
  ierFormsA: IerFormA[];
  ierFormsB: IerFormB[];
  projects: ITProject[];
  projectUpdates: ProjectUpdate[];
  assets: Asset[];
  knowledgeArticles: KnowledgeArticle[];
  systemSettings: SystemSettings;
  auditLogs: AuditLogEntry[];

  // Ticket Operations
  createTicket: (data: Omit<Ticket, 'id' | 'ticket_number' | 'created_at' | 'comments'>) => Ticket;
  updateTicketStatus: (ticketId: number, status: Ticket['status'], resolutionNotes?: string) => void;
  assignTicket: (ticketId: number, itStaffName: string) => void;
  addTicketComment: (ticketId: number, message: string) => void;
  approveTicket: (ticketId: number) => void;
  approveAllPendingTickets: () => void;
  archiveTicket: (ticketId: number) => void;

  // IER Form Operations
  createIerFormA: (data: Omit<IerFormA, 'id' | 'ier_no' | 'created_at' | 'dept_head_status' | 'it_status' | 'workflow_status'>) => void;
  updateIerFormA: (id: number, data: Partial<IerFormA>) => void;
  approveIerA: (id: number, roleStep: 'manager' | 'it') => void;
  createIerFormB: (data: Omit<IerFormB, 'id' | 'ier_no' | 'created_at' | 'manager_approval' | 'management_approval'>) => void;
  updateIerFormB: (id: number, data: Partial<IerFormB>) => void;
  approveIerB: (id: number, roleStep: 'manager' | 'management') => void;

  // Project Operations
  createProject: (data: Omit<ITProject, 'id' | 'created_at'>) => void;
  updateProject: (id: number, data: Partial<ITProject>) => void;
  deleteProject: (id: number) => void;
  addProjectUpdate: (projectId: number, text: string) => void;

  // Asset Operations
  createAsset: (data: Omit<Asset, 'id'>) => void;
  updateAsset: (id: number, data: Partial<Asset>) => void;

  // Admin Configuration
  updateSystemSettings: (settings: Partial<SystemSettings>) => void;
  updateRolePermissions: (permissions: SystemSettings['role_permissions']) => void;
  addUser: (user: Omit<User, 'user_id'>) => void;
  updateUser: (userId: number, updates: Partial<User>) => void;
  addDepartment: (dept: Omit<Department, 'id'>) => void;
  updateSlaPolicy: (id: number, updates: Partial<SlaPolicy>) => void;

  // Supabase Live Sync
  pullFromSupabase: (showToast?: boolean) => Promise<boolean>;
  isSupabaseSyncing: boolean;
  isSupabaseModalOpen: boolean;
  setIsSupabaseModalOpen: (open: boolean) => void;

  // Toasts
  toasts: ToastMessage[];
  addToast: (message: string, type?: ToastMessage['type']) => void;
  removeToast: (id: string) => void;
}

function safeStorageParse<T>(key: string, fallback: T): T {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return fallback;
    const item = localStorage.getItem(key);
    if (!item || item === 'undefined' || item === 'null' || item === 'NaN') {
      return fallback;
    }
    const parsed = JSON.parse(item);
    if (parsed === null || parsed === undefined) {
      return fallback;
    }
    return parsed;
  } catch (err) {
    console.warn(`[SafeStorage] Failed to parse key "${key}", reverting to fallback:`, err);
    return fallback;
  }
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Theme state
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    try {
      return localStorage.getItem('cci_dark_mode') === 'true';
    } catch {
      return false;
    }
  });

  // Gateway and Session state with Remember Me persistence
  const [isGatewayPassed, setIsGatewayPassed] = useState<boolean>(() => {
    try {
      const isRemembered = localStorage.getItem('cci_gateway_remembered') === 'true' || localStorage.getItem('cci_remember_me') === 'true';
      const sessionPassed = sessionStorage.getItem('cci_gateway_passed') === 'true';
      return isRemembered || sessionPassed;
    } catch {
      return false;
    }
  });
  const [authToken, setAuthToken] = useState<string | null>(() => {
    try {
      return localStorage.getItem('cci_remember_token') || sessionStorage.getItem('cci_auth_token') || null;
    } catch {
      return null;
    }
  });

  // Current User: NEVER auto-login. Must require user domain credentials or SSO.
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const isRemembered = localStorage.getItem('cci_remember_me') === 'true';
      if (isRemembered) {
        const saved = safeStorageParse<User | null>('cci_current_user', null);
        if (saved && saved.username) {
          return saved;
        }
      }
      return null; // Require login screen
    } catch {
      return null;
    }
  });

  // Active view
  const [currentView, setCurrentView] = useState<AppView>('dashboard');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null);
  const [isSubmitTicketModalOpen, setIsSubmitTicketModalOpen] = useState<boolean>(false);
  const [selectedPrintIer, setSelectedPrintIer] = useState<{ type: 'A' | 'B'; data: IerFormA | IerFormB } | null>(null);

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (message: string, type: ToastMessage['type'] = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Main collections with safe persistence
  const [users, setUsers] = useState<User[]>(() => {
    return safeStorageParse<User[]>('cci_users', initialUsers);
  });

  const [departments, setDepartments] = useState<Department[]>(() => {
    return safeStorageParse<Department[]>('cci_departments', initialDepartments);
  });

  const [ticketTypes] = useState<TicketTypeCategory[]>(initialTicketTypes);

  const [slaPolicies, setSlaPolicies] = useState<SlaPolicy[]>(() => {
    return safeStorageParse<SlaPolicy[]>('cci_sla_policies', initialSlaPolicies);
  });

  const [tickets, setTickets] = useState<Ticket[]>(() => {
    return safeStorageParse<Ticket[]>('cci_tickets', initialTickets);
  });

  const [ierFormsA, setIerFormsA] = useState<IerFormA[]>(() => {
    return safeStorageParse<IerFormA[]>('cci_ier_a', initialIerFormsA);
  });

  const [ierFormsB, setIerFormsB] = useState<IerFormB[]>(() => {
    return safeStorageParse<IerFormB[]>('cci_ier_b', initialIerFormsB);
  });

  const [projects, setProjects] = useState<ITProject[]>(() => {
    return safeStorageParse<ITProject[]>('cci_projects', initialProjects);
  });

  const [projectUpdates, setProjectUpdates] = useState<ProjectUpdate[]>(() => {
    return safeStorageParse<ProjectUpdate[]>('cci_project_updates', initialProjectUpdates);
  });

  const [assets, setAssets] = useState<Asset[]>(() => {
    return safeStorageParse<Asset[]>('cci_assets', initialAssets);
  });

  const [knowledgeArticles, setKnowledgeArticles] = useState<KnowledgeArticle[]>(() => {
    return safeStorageParse<KnowledgeArticle[]>('cci_kb_articles', initialKnowledgeArticles);
  });

  const [systemSettings, setSystemSettings] = useState<SystemSettings>(() => {
    const parsed = safeStorageParse<Partial<SystemSettings>>('cci_system_settings', {});
    return {
      ...initialSystemSettings,
      ...parsed,
      role_permissions: {
        ...initialSystemSettings.role_permissions,
        ...(parsed?.role_permissions || {})
      }
    };
  });

  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(() => {
    return safeStorageParse<AuditLogEntry[]>('cci_audit_logs', initialAuditLogs);
  });

  const [isSupabaseSyncing, setIsSupabaseSyncing] = useState<boolean>(false);
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState<boolean>(false);

  // Sync dark mode class
  useEffect(() => {
    localStorage.setItem('cci_dark_mode', String(darkMode));
    if (darkMode) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark-mode');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark-mode');
    }
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode((prev) => !prev);

  // Auto-pull live records from Supabase (sole cloud primary database)
  const pullFromSupabase = async (showToast: boolean = false): Promise<boolean> => {
    setIsSupabaseSyncing(true);
    try {
      const res = await pullAllDataFromSupabase();
      if (res.success && res.data) {
        if (res.data.tickets && res.data.tickets.length > 0) {
          setTickets(res.data.tickets);
        }
        if (res.data.assets && res.data.assets.length > 0) {
          setAssets(res.data.assets);
        }
        if (res.data.ierFormsA && res.data.ierFormsA.length > 0) {
          setIerFormsA(res.data.ierFormsA);
        }
        if (res.data.ierFormsB && res.data.ierFormsB.length > 0) {
          setIerFormsB(res.data.ierFormsB);
        }
        if (res.data.projects && res.data.projects.length > 0) {
          setProjects(res.data.projects);
        }
        if (res.data.projectUpdates && res.data.projectUpdates.length > 0) {
          setProjectUpdates(res.data.projectUpdates);
        }
        if (res.data.users && res.data.users.length > 0) {
          setUsers(res.data.users);
        }
        if (res.data.departments && res.data.departments.length > 0) {
          setDepartments(res.data.departments);
        }
        if (res.data.slaPolicies && res.data.slaPolicies.length > 0) {
          setSlaPolicies(res.data.slaPolicies);
        }
        if (res.data.knowledgeArticles && res.data.knowledgeArticles.length > 0) {
          setKnowledgeArticles(res.data.knowledgeArticles);
        }
        if (res.data.auditLogs && res.data.auditLogs.length > 0) {
          setAuditLogs(res.data.auditLogs);
        }
        if (showToast) {
          addToast(res.message, 'success');
        }
        return true;
      } else if (showToast) {
        addToast(res.message, 'info');
      }
      return false;
    } catch (err: any) {
      if (showToast) addToast(`Supabase pull: ${err.message}`, 'danger');
      return false;
    } finally {
      setIsSupabaseSyncing(false);
    }
  };

  useEffect(() => {
    pullFromSupabase(false);

    // Live Realtime listener for Postgres changes across Supabase
    const unsubscribe = subscribeToSupabaseChanges((table) => {
      console.log(`[Supabase Realtime] Table "${table}" updated on cloud. Re-pulling...`);
      pullFromSupabase(false);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Persistence helpers
  useEffect(() => {
    localStorage.setItem('cci_tickets', JSON.stringify(tickets));
  }, [tickets]);

  useEffect(() => {
    localStorage.setItem('cci_ier_a', JSON.stringify(ierFormsA));
  }, [ierFormsA]);

  useEffect(() => {
    localStorage.setItem('cci_ier_b', JSON.stringify(ierFormsB));
  }, [ierFormsB]);

  useEffect(() => {
    localStorage.setItem('cci_projects', JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem('cci_project_updates', JSON.stringify(projectUpdates));
  }, [projectUpdates]);

  useEffect(() => {
    localStorage.setItem('cci_assets', JSON.stringify(assets));
  }, [assets]);

  useEffect(() => {
    localStorage.setItem('cci_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('cci_system_settings', JSON.stringify(systemSettings));
  }, [systemSettings]);

  useEffect(() => {
    localStorage.setItem('cci_audit_logs', JSON.stringify(auditLogs));
  }, [auditLogs]);

  // Log audit event helper
  const logAudit = (action: string, targetType?: string, targetId?: string | number, details?: string) => {
    const entry: AuditLogEntry = {
      id: Date.now(),
      username: currentUser?.username || 'anonymous',
      action,
      target_type: targetType,
      target_id: targetId,
      details,
      ip_address: '192.168.1.100',
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };
    setAuditLogs((prev) => [entry, ...prev]);
  };

  // Gateway check with optional workstation persistence
  const verifyGatewayPin = (pin: string, rememberDevice: boolean = true): boolean => {
    const validPin = (systemSettings?.company_pin || initialSystemSettings.company_pin || '7799').trim();
    if (pin.trim() === validPin) {
      const token = 'auth_' + Math.random().toString(36).substring(2);
      setIsGatewayPassed(true);
      setAuthToken(token);
      sessionStorage.setItem('cci_gateway_passed', 'true');
      sessionStorage.setItem('cci_auth_token', token);
      if (rememberDevice) {
        localStorage.setItem('cci_gateway_remembered', 'true');
        localStorage.setItem('cci_remember_token', token);
      }
      addToast('PIN Verified. Welcome to CCI Workspace.', 'success');
      return true;
    }
    addToast('Invalid Gateway PIN. Access Denied.', 'danger');
    return false;
  };

  // Login handler with Remember Me
  const login = (username: string, password?: string, rememberMe: boolean = true): boolean => {
    const cleanUsername = username.toLowerCase().trim();

    // Default admin shortcut
    if (cleanUsername === 'admin' && (!password || password === 'admin123')) {
      const adminUser = users.find((u) => u.username === 'admin') || initialUsers[0];
      setCurrentUser(adminUser);
      localStorage.setItem('cci_current_user', JSON.stringify(adminUser));
      setIsGatewayPassed(true);
      if (rememberMe) {
        localStorage.setItem('cci_remember_me', 'true');
        localStorage.setItem('cci_gateway_remembered', 'true');
      } else {
        localStorage.removeItem('cci_remember_me');
        sessionStorage.setItem('cci_session_active', 'true');
      }
      logAudit('LOGIN_SUCCESS_ADMIN', 'User', adminUser.user_id, 'Administrative Login');
      addToast(`Welcome back, ${adminUser.full_name}!`, 'success');
      return true;
    }

    const found = users.find((u) => u.username.toLowerCase() === cleanUsername);
    if (found) {
      setCurrentUser(found);
      localStorage.setItem('cci_current_user', JSON.stringify(found));
      setIsGatewayPassed(true);
      if (rememberMe) {
        localStorage.setItem('cci_remember_me', 'true');
        localStorage.setItem('cci_gateway_remembered', 'true');
      } else {
        localStorage.removeItem('cci_remember_me');
        sessionStorage.setItem('cci_session_active', 'true');
      }
      logAudit('LOGIN_SUCCESS', 'User', found.user_id, `Logged in as ${found.role}`);
      addToast(`Welcome, ${found.full_name}!`, 'success');
      return true;
    }

    addToast('Invalid username or credentials.', 'danger');
    return false;
  };

  // Google Workspace Sign-In handler with Remember Me
  const loginWithGoogle = async (rememberMe: boolean = true): Promise<boolean> => {
    try {
      const res = await googleSignIn();
      if (!res) return false;
      const { user: gUser, accessToken } = res;

      const email = gUser.email || '';
      const displayName = gUser.displayName || email.split('@')[0] || 'Google User';
      const emailPrefix = email.split('@')[0] || 'user';

      let userRecord = users.find(
        (u) =>
          (u.email && u.email.toLowerCase() === email.toLowerCase()) ||
          u.username.toLowerCase() === emailPrefix.toLowerCase()
      );

      if (!userRecord) {
        // Auto-provision user account with role
        const isDomainAdmin =
          email.toLowerCase().includes('admin') ||
          email.toLowerCase().startsWith('it.') ||
          email.toLowerCase().includes('itstaff');

        userRecord = {
          user_id: Date.now(),
          username: emailPrefix,
          full_name: displayName,
          email: email,
          role: (isDomainAdmin ? 'admin' : 'employee') as UserRole,
          department: 'Information Technology',
          status: 'active',
          position: isDomainAdmin ? 'IT Systems Administrator' : 'Staff Member',
          phone: gUser.phoneNumber || '+63 2 8123 4567',
          avatar: gUser.photoURL || undefined
        };
        setUsers((prev) => [userRecord!, ...prev]);
      } else if (gUser.photoURL && !userRecord.avatar) {
        userRecord = { ...userRecord, avatar: gUser.photoURL };
      }

      setCurrentUser(userRecord);
      localStorage.setItem('cci_current_user', JSON.stringify(userRecord));
      setIsGatewayPassed(true);
      const token = 'gauth_' + accessToken.substring(0, 16);
      setAuthToken(token);

      if (rememberMe) {
        localStorage.setItem('cci_remember_me', 'true');
        localStorage.setItem('cci_gateway_remembered', 'true');
        localStorage.setItem('cci_remember_token', token);
      } else {
        localStorage.removeItem('cci_remember_me');
        sessionStorage.setItem('cci_session_active', 'true');
      }

      logAudit('GOOGLE_WORKSPACE_LOGIN', 'User', userRecord.user_id, `Workspace Login: ${email}`);
      addToast(`Signed in as ${userRecord.full_name} (${email})`, 'success');
      return true;
    } catch (err: any) {
      console.error('Google Sign In error:', err);
      addToast(err?.message || 'Google Workspace sign-in failed', 'danger');
      return false;
    }
  };

  const logout = () => {
    if (currentUser) {
      logAudit('LOGOUT', 'Session', currentUser.user_id);
    }
    googleLogout().catch(() => {});
    setCurrentUser(null);
    setIsGatewayPassed(false);
    setAuthToken(null);
    localStorage.removeItem('cci_current_user');
    localStorage.removeItem('cci_remember_me');
    localStorage.removeItem('cci_gateway_remembered');
    localStorage.removeItem('cci_remember_token');
    sessionStorage.removeItem('cci_gateway_passed');
    sessionStorage.removeItem('cci_auth_token');
    sessionStorage.removeItem('cci_session_active');
    addToast('Logged out successfully.', 'info');
  };

  const switchUserRole = (role: UserRole) => {
    if (!currentUser) return;
    const updated: User = { ...currentUser, role };
    setCurrentUser(updated);
    localStorage.setItem('cci_current_user', JSON.stringify(updated));
    addToast(`Switched active persona role to: ${role.toUpperCase()}`, 'info');
  };

  const updateCurrentUserProfile = (profile: Partial<User>) => {
    if (!currentUser) return;
    const updated = { ...currentUser, ...profile };
    setCurrentUser(updated);
    localStorage.setItem('cci_current_user', JSON.stringify(updated));
    setUsers((prev) => prev.map((u) => (u.user_id === currentUser.user_id ? updated : u)));
    logAudit('PROFILE_UPDATE', 'User', currentUser.user_id, 'Updated profile details');
    addToast('Profile updated successfully.', 'success');
  };

  // Dynamic permission check based on role_permissions matrix
  const canAccess = (key: 'menu_directory' | 'menu_ier_b' | 'menu_admin_tools' | 'menu_ier_hub' | 'menu_it_projects'): boolean => {
    if (!currentUser) return false;
    const role = (currentUser.role || 'employee').toLowerCase() as UserRole;
    if (role === 'super admin') return true;

    const allowed =
      systemSettings?.role_permissions?.[key] ||
      initialSystemSettings.role_permissions[key] ||
      [];
    return allowed.includes(role);
  };

  // Ticket CRUD
  const createTicket = (data: Omit<Ticket, 'id' | 'ticket_number' | 'created_at' | 'comments'>): Ticket => {
    const id = Date.now();
    const ticketNumber = `TICK-2026-${String(tickets.length + 101).padStart(3, '0')}`;
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);

    // Calculate SLA due date
    const policy = slaPolicies.find((p) => p.ticket_type === data.ticket_type && p.priority === data.priority);
    const resolveHours = policy ? policy.resolve_in_hours : 48;
    const dueDateObj = new Date(Date.now() + resolveHours * 3600 * 1000);
    const dueDateStr = dueDateObj.toISOString().replace('T', ' ').substring(0, 19);

    const newTicket: Ticket = {
      ...data,
      id,
      ticket_number: ticketNumber,
      created_at: nowStr,
      due_date: dueDateStr,
      comments: []
    };

    setTickets((prev) => [newTicket, ...prev]);
    syncTicketToRemote(newTicket).catch(() => {});
    logAudit('CREATE_TICKET', 'Ticket', id, `Created ${ticketNumber}: ${data.subject}`);
    addToast(`Ticket ${ticketNumber} created successfully!`, 'success');
    return newTicket;
  };

  const updateTicketStatus = (ticketId: number, status: Ticket['status'], resolutionNotes?: string) => {
    setTickets((prev) => {
      const next = prev.map((t) => {
        if (t.id === ticketId) {
          const resolvedAt = status === 'Resolved' || status === 'Closed'
            ? new Date().toISOString().replace('T', ' ').substring(0, 19)
            : t.resolved_at;
          return {
            ...t,
            status,
            resolution_notes: resolutionNotes !== undefined ? resolutionNotes : t.resolution_notes,
            resolved_at: resolvedAt
          };
        }
        return t;
      });
      const updated = next.find((t) => t.id === ticketId);
      if (updated) syncTicketToRemote(updated).catch(() => {});
      return next;
    });
    syncTicketStatusToRemote(ticketId, status, resolutionNotes).catch(() => {});
    logAudit('UPDATE_TICKET_STATUS', 'Ticket', ticketId, `Changed status to ${status}`);
    addToast(`Ticket #${ticketId} status updated to ${status}.`, 'info');
  };

  const assignTicket = (ticketId: number, itStaffName: string) => {
    setTickets((prev) =>
      prev.map((t) => (t.id === ticketId ? { ...t, assigned_it: itStaffName, status: t.status === 'New' ? 'Assigned' : t.status } : t))
    );
    syncTicketAssignToRemote(ticketId, itStaffName).catch(() => {});
    logAudit('ASSIGN_TICKET', 'Ticket', ticketId, `Assigned to ${itStaffName}`);
    addToast(`Ticket assigned to ${itStaffName}.`, 'success');
  };

  const addTicketComment = (ticketId: number, message: string) => {
    if (!message.trim() || !currentUser) return;
    const comment: TicketComment = {
      id: Date.now(),
      ticket_id: ticketId,
      sender: currentUser.full_name || currentUser.username,
      sender_role: currentUser.role,
      message: message.trim(),
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };

    setTickets((prev) =>
      prev.map((t) => (t.id === ticketId ? { ...t, comments: [...t.comments, comment] } : t))
    );
    syncTicketCommentToRemote(ticketId, comment.sender, comment.message).catch(() => {});
    logAudit('ADD_TICKET_COMMENT', 'Ticket', ticketId, 'Posted reply');
    addToast('Comment added.', 'info');
  };

  const approveTicket = (ticketId: number) => {
    setTickets((prev) =>
      prev.map((t) =>
        t.id === ticketId
          ? { ...t, approver_status: 'Approved', status: t.status === 'Pending Approval' ? 'New' : t.status }
          : t
      )
    );
    logAudit('APPROVE_TICKET', 'Ticket', ticketId, 'Management approval granted');
    addToast('Ticket request approved.', 'success');
  };

  const approveAllPendingTickets = () => {
    setTickets((prev) =>
      prev.map((t) =>
        t.status === 'Pending Approval' || t.approver_status === 'Pending'
          ? { ...t, approver_status: 'Approved', status: 'New' }
          : t
      )
    );
    logAudit('APPROVE_ALL_PENDING', 'Tickets', undefined, 'Batch approved all pending items');
    addToast('All pending ticket requests have been approved!', 'success');
  };

  const archiveTicket = (ticketId: number) => {
    setTickets((prev) =>
      prev.map((t) => (t.id === ticketId ? { ...t, is_archived: true } : t))
    );
    logAudit('ARCHIVE_TICKET', 'Ticket', ticketId, 'Moved to long-term archives');
    addToast('Ticket moved to archive.', 'warning');
  };

  // IER Form A
  const createIerFormA = (data: Omit<IerFormA, 'id' | 'ier_no' | 'created_at' | 'dept_head_status' | 'it_status' | 'workflow_status'>) => {
    const id = Date.now();
    const ierNo = `IER-A-2026-${String(ierFormsA.length + 101).padStart(4, '0')}`;
    const newForm: IerFormA = {
      ...data,
      id,
      ier_no: ierNo,
      dept_head_status: 'Pending',
      it_status: 'Pending',
      workflow_status: 'Draft',
      created_at: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };
    setIerFormsA((prev) => [newForm, ...prev]);
    syncIerAToRemote(newForm).catch(() => {});
    logAudit('CREATE_IER_A', 'FormA', id, `Filed ${ierNo} for ${data.asset_code}`);
    addToast(`IER Form A (${ierNo}) submitted successfully!`, 'success');
  };

  const updateIerFormA = (id: number, data: Partial<IerFormA>) => {
    setIerFormsA((prev) => {
      const next = prev.map((f) => (f.id === id ? { ...f, ...data } : f));
      const updated = next.find((f) => f.id === id);
      if (updated) syncIerAToRemote(updated).catch(() => {});
      return next;
    });
    logAudit('UPDATE_IER_A', 'FormA', id, 'Updated Form A details');
    addToast('Form A updated.', 'info');
  };

  const approveIerA = (id: number, roleStep: 'manager' | 'it') => {
    setIerFormsA((prev: IerFormA[]) => {
      const next: IerFormA[] = prev.map((f): IerFormA => {
        if (f.id === id) {
          if (roleStep === 'manager') {
            return { ...f, dept_head_status: 'Approved' as const, workflow_status: 'Under Review' as const };
          } else if (roleStep === 'it') {
            return { ...f, it_status: 'Approved' as const, workflow_status: 'Completed' as const };
          }
        }
        return f;
      });
      const updated = next.find((f) => f.id === id);
      if (updated) syncIerAToRemote(updated).catch(() => {});
      return next;
    });
    logAudit(`SIGN_IER_A_${roleStep.toUpperCase()}`, 'FormA', id, `Recorded ${roleStep} approval signature`);
    addToast(`Form A ${roleStep === 'manager' ? 'Manager signature' : 'IT verification'} approved!`, 'success');
  };

  // IER Form B
  const createIerFormB = (data: Omit<IerFormB, 'id' | 'ier_no' | 'created_at' | 'manager_approval' | 'management_approval'>) => {
    const id = Date.now();
    const ierNo = `IER-B-2026-${String(ierFormsB.length + 101).padStart(4, '0')}`;
    const newForm: IerFormB = {
      ...data,
      id,
      ier_no: ierNo,
      manager_approval: 'Pending' as const,
      management_approval: 'Pending' as const,
      created_at: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };
    setIerFormsB((prev) => [newForm, ...prev]);
    syncIerBToRemote(newForm).catch(() => {});
    logAudit('CREATE_IER_B', 'FormB', id, `Filed ${ierNo}`);
    addToast(`IER Form B (${ierNo}) submitted successfully!`, 'success');
  };

  const updateIerFormB = (id: number, data: Partial<IerFormB>) => {
    setIerFormsB((prev) => {
      const next = prev.map((f) => (f.id === id ? { ...f, ...data } : f));
      const updated = next.find((f) => f.id === id);
      if (updated) syncIerBToRemote(updated).catch(() => {});
      return next;
    });
    logAudit('UPDATE_IER_B', 'FormB', id, 'Updated Form B details');
    addToast('Form B updated.', 'info');
  };

  const approveIerB = (id: number, roleStep: 'manager' | 'management') => {
    setIerFormsB((prev: IerFormB[]) => {
      const next: IerFormB[] = prev.map((f): IerFormB => {
        if (f.id === id) {
          if (roleStep === 'manager') {
            return { ...f, manager_approval: 'Approved' as const };
          } else {
            return { ...f, management_approval: 'Approved' as const, status: 'In Progress' as const };
          }
        }
        return f;
      });
      const updated = next.find((f) => f.id === id);
      if (updated) syncIerBToRemote(updated).catch(() => {});
      return next;
    });
    logAudit(`SIGN_IER_B_${roleStep.toUpperCase()}`, 'FormB', id, `Approved by ${roleStep}`);
    addToast(`Form B ${roleStep} approval logged.`, 'success');
  };

  // Projects CRUD
  const createProject = (data: Omit<ITProject, 'id' | 'created_at'>) => {
    const id = Date.now();
    const newProj: ITProject = {
      ...data,
      id,
      created_at: new Date().toISOString().substring(0, 10),
      progress_percent: data.progress_percent ?? 0
    };
    setProjects((prev) => [newProj, ...prev]);
    syncProjectToRemote(newProj).catch(() => {});
    logAudit('CREATE_PROJECT', 'Project', id, `Launched project: ${data.title}`);
    addToast(`Project "${data.title}" launched!`, 'success');
  };

  const updateProject = (id: number, data: Partial<ITProject>) => {
    setProjects((prev) => {
      const next = prev.map((p) => (p.id === id ? { ...p, ...data } : p));
      const updated = next.find((p) => p.id === id);
      if (updated) syncProjectToRemote(updated).catch(() => {});
      return next;
    });
    logAudit('EDIT_PROJECT', 'Project', id, 'Updated project specifications');
    addToast('Project updated.', 'info');
  };

  const deleteProject = (id: number) => {
    setProjects((prev) => prev.filter((p) => p.id !== id));
    setProjectUpdates((prev) => prev.filter((u) => u.project_id !== id));
    deleteProjectFromRemote(id).catch(() => {});
    logAudit('DELETE_PROJECT', 'Project', id, 'Permanently removed project');
    addToast('Project removed.', 'warning');
  };

  const addProjectUpdate = (projectId: number, text: string) => {
    if (!text.trim() || !currentUser) return;
    const upd: ProjectUpdate = {
      id: Date.now(),
      project_id: projectId,
      update_text: text.trim(),
      author: currentUser.full_name || currentUser.username,
      created_at: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };
    setProjectUpdates((prev) => [upd, ...prev]);
    addToast('Project meeting log entry saved.', 'success');
  };

  // Assets
  const createAsset = (data: Omit<Asset, 'id'>) => {
    const id = Date.now();
    const newAsset: Asset = { ...data, id };
    setAssets((prev) => [newAsset, ...prev]);
    syncAssetToRemote(newAsset).catch(() => {});
    logAudit('CREATE_ASSET', 'Asset', id, `Registered asset: ${data.asset_tag}`);
    addToast(`Asset ${data.asset_tag} registered.`, 'success');
  };

  const updateAsset = (id: number, data: Partial<Asset>) => {
    setAssets((prev) => {
      const next = prev.map((a) => (a.id === id ? { ...a, ...data } : a));
      const updated = next.find((a) => a.id === id);
      if (updated) syncAssetToRemote(updated).catch(() => {});
      return next;
    });
    logAudit('UPDATE_ASSET', 'Asset', id, 'Updated asset record');
    addToast('Asset details updated.', 'info');
  };

  // Admin Config
  const updateSystemSettings = (updates: Partial<SystemSettings>) => {
    setSystemSettings((prev) => ({ ...prev, ...updates }));
    logAudit('UPDATE_SETTINGS', 'System', undefined, 'Saved configuration');
    addToast('System settings saved.', 'success');
  };

  const updateRolePermissions = (perms: SystemSettings['role_permissions']) => {
    setSystemSettings((prev) => ({ ...prev, role_permissions: perms }));
    logAudit('UPDATE_ROLE_PERMS', 'System', undefined, 'Updated role menu matrix');
    addToast('Role permissions updated.', 'success');
  };

  const addUser = (userData: Omit<User, 'user_id'>) => {
    const id = Date.now();
    const newUser: User = { ...userData, user_id: id };
    setUsers((prev) => [...prev, newUser]);
    syncUserToRemote(newUser).catch(() => {});
    logAudit('CREATE_USER', 'User', id, `Added user ${userData.username}`);
    addToast(`User ${userData.username} created.`, 'success');
  };

  const updateUser = (userId: number, updates: Partial<User>) => {
    setUsers((prev) => {
      const next = prev.map((u) => (u.user_id === userId ? { ...u, ...updates } : u));
      const updated = next.find((u) => u.user_id === userId);
      if (updated) syncUserToRemote(updated).catch(() => {});
      return next;
    });
    logAudit('UPDATE_USER', 'User', userId, 'Modified user account');
    addToast('User updated.', 'info');
  };

  const addDepartment = (dept: Omit<Department, 'id'>) => {
    const id = Date.now();
    const newDept: Department = { ...dept, id };
    setDepartments((prev) => [...prev, newDept]);
    syncDepartmentToRemote(newDept).catch(() => {});
    logAudit('CREATE_DEPT', 'Department', id, `Added ${dept.name}`);
    addToast(`Department ${dept.name} added.`, 'success');
  };

  const updateSlaPolicy = (id: number, updates: Partial<SlaPolicy>) => {
    setSlaPolicies((prev) => {
      const next = prev.map((p) => (p.id === id ? { ...p, ...updates } : p));
      const updated = next.find((p) => p.id === id);
      if (updated) syncSlaPolicyToRemote(updated).catch(() => {});
      return next;
    });
    logAudit('UPDATE_SLA', 'SlaPolicy', id, 'Adjusted SLA response and resolution hours');
    addToast('SLA policy updated.', 'info');
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        isGatewayPassed,
        authToken,
        login,
        loginWithGoogle,
        logout,
        verifyGatewayPin,
        switchUserRole,
        updateCurrentUserProfile,
        currentView,
        setCurrentView,
        searchQuery,
        setSearchQuery,
        darkMode,
        toggleDarkMode,
        selectedTicketId,
        setSelectedTicketId,
        isSubmitTicketModalOpen,
        setIsSubmitTicketModalOpen,
        selectedPrintIer,
        setSelectedPrintIer,
        canAccess,
        users,
        departments,
        ticketTypes,
        slaPolicies,
        tickets,
        ierFormsA,
        ierFormsB,
        projects,
        projectUpdates,
        assets,
        knowledgeArticles,
        systemSettings,
        auditLogs,
        createTicket,
        updateTicketStatus,
        assignTicket,
        addTicketComment,
        approveTicket,
        approveAllPendingTickets,
        archiveTicket,
        createIerFormA,
        updateIerFormA,
        approveIerA,
        createIerFormB,
        updateIerFormB,
        approveIerB,
        createProject,
        updateProject,
        deleteProject,
        addProjectUpdate,
        createAsset,
        updateAsset,
        updateSystemSettings,
        updateRolePermissions,
        addUser,
        updateUser,
        addDepartment,
        updateSlaPolicy,
        pullFromSupabase,
        isSupabaseSyncing,
        isSupabaseModalOpen,
        setIsSupabaseModalOpen,
        toasts,
        addToast,
        removeToast
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
