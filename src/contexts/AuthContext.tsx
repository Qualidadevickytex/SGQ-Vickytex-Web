/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserRole, SectorType, PermissionCode } from '../types';

interface AuthContextType {
  user: UserProfile | null;
  accessToken: string | null;
  needsAuth: boolean;
  isLoggingIn: boolean;
  permissions: PermissionCode[];
  hasPermission: (permission: PermissionCode) => boolean;
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, passwordHash: string) => Promise<boolean>;
  switchProfile: (role: UserRole) => void;
  logout: () => Promise<void>;
  refreshUser: (updatedUser?: UserProfile) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const PRESET_USERS: Record<UserRole, UserProfile> = {
  Qualidade: {
    email: 'qualidade@vickytex.com.br',
    name: 'Mariana Silva (Qualidade)',
    role: 'Qualidade',
    sector: 'Qualidade',
    photoURL: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Mariana'
  },
  Gestor: {
    email: 'gestor@vickytex.com.br',
    name: 'Fernando Oliveira (Gestor)',
    role: 'Gestor',
    sector: 'Administração',
    photoURL: 'https://api.dicebear.com/7.x/bottts/svg?seed=Fernando'
  },
  Supervisor: {
    email: 'supervisor.costura@vickytex.com.br',
    name: 'Roberto Costa (Líder de Costura)',
    role: 'Supervisor',
    sector: 'Costura',
    photoURL: 'https://api.dicebear.com/7.x/lorelei/svg?seed=Roberto'
  },
  Administrador: {
    email: 'admin@vickytex.com.br',
    name: 'Suporte TI Vickytex',
    role: 'Administrador',
    sector: 'Administração',
    photoURL: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=Buster'
  },
  Colaborador: {
    email: 'colaborador@vickytex.com.br',
    name: 'Ana Souza (Operadora Corte)',
    role: 'Colaborador',
    sector: 'Corte',
    photoURL: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ana'
  },
  Auditor: {
    email: 'auditor.externo@vickytex.com.br',
    name: 'Carlos Eduardo (Auditor ISO 9001)',
    role: 'Auditor',
    sector: 'Qualidade',
    photoURL: 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=Carlos'
  },
  Visitante: {
    email: 'visitante@vickytex.com.br',
    name: 'Visitante Externo',
    role: 'Visitante',
    sector: 'Geral',
    photoURL: 'https://api.dicebear.com/7.x/identicon/svg?seed=Visitante'
  }
};

/**
 * Registra atividade no log de auditoria
 */
const recordAuditLog = async (userId: string, action: string, moduleName: string, recordDetails?: string) => {
  try {
    const logsStr = localStorage.getItem('sgq_vickytex_audit_logs') || '[]';
    const logs = JSON.parse(logsStr);
    logs.push({
      id: 'log_' + Date.now(),
      usuarioId: userId,
      acao: action,
      modulo: moduleName,
      registro: recordDetails || 'Sucesso',
      data: new Date().toISOString()
    });
    localStorage.setItem('sgq_vickytex_audit_logs', JSON.stringify(logs.slice(-200)));
  } catch (e) {
    // ignore
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('sgq_vickytex_role');
    const role = (saved as UserRole) || 'Qualidade';
    
    try {
      const savedUsersStr = localStorage.getItem('sgq_vickytex_users');
      if (savedUsersStr) {
        const savedUsers = JSON.parse(savedUsersStr);
        const activeUser = savedUsers.find((u: any) => u.role === role);
        if (activeUser) {
          return {
            email: activeUser.email,
            name: activeUser.name,
            role: activeUser.role,
            sector: activeUser.sector,
            photoURL: activeUser.photoURL,
            id: activeUser.id
          };
        }
      }
    } catch (e) {
      // ignore
    }
    return { ...PRESET_USERS[role], id: 'preset_' + role.toLowerCase() };
  });

  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [needsAuth, setNeedsAuth] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [permissions, setPermissions] = useState<PermissionCode[]>([]);

  useEffect(() => {
    if (user) {
      setAccessToken('mock_google_oauth_token_' + user.role);
      setNeedsAuth(false);
    } else {
      setNeedsAuth(true);
    }
  }, [user]);

  const refreshUser = (updatedUser?: UserProfile) => {
    if (updatedUser) {
      setUser(updatedUser);
      return;
    }

    const currentRole = localStorage.getItem('sgq_vickytex_role') as UserRole || 'Qualidade';
    try {
      const savedUsersStr = localStorage.getItem('sgq_vickytex_users');
      if (savedUsersStr) {
        const savedUsers = JSON.parse(savedUsersStr);
        const activeUser = savedUsers.find((u: any) => u.role === currentRole);
        if (activeUser) {
          setUser({
            email: activeUser.email,
            name: activeUser.name,
            role: activeUser.role,
            sector: activeUser.sector,
            photoURL: activeUser.photoURL,
            id: activeUser.id
          });
          return;
        }
      }
    } catch (e) {
      // ignore
    }
    setUser({ ...PRESET_USERS[currentRole], id: 'preset_' + currentRole.toLowerCase() });
  };

  const loginWithGoogle = async () => {
    setIsLoggingIn(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const targetUser = PRESET_USERS.Qualidade;
      const loggedProfile = { ...targetUser, id: 'preset_qualidade' };
      setUser(loggedProfile);
      setAccessToken('google_sso_oauth_token_active');
      setNeedsAuth(false);
      await recordAuditLog('preset_qualidade', 'Login', 'Autenticação', 'SSO Google com sucesso (@vickytex.com.br)');
    } catch (err) {
      console.error('Google Workspace SSO Error:', err);
      await recordAuditLog('guest', 'Falha de autenticação', 'Autenticação', String(err));
    } finally {
      setIsLoggingIn(false);
    }
  };

  const loginWithEmail = async (email: string, passwordHash: string): Promise<boolean> => {
    setIsLoggingIn(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 400));
      
      let userList = [];
      const savedUsersStr = localStorage.getItem('sgq_vickytex_users');
      if (savedUsersStr) {
        userList = JSON.parse(savedUsersStr);
      } else {
        userList = [
          { email: 'qualidade@vickytex.com.br', name: 'Mariana Silva (Qualidade)', role: 'Qualidade', sector: 'Qualidade', photoURL: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Mariana', passwordHash: 'mariana2026', id: 'preset_qualidade' },
          { email: 'gestor@vickytex.com.br', name: 'Fernando Oliveira (Gestor)', role: 'Gestor', sector: 'Administração', photoURL: 'https://api.dicebear.com/7.x/bottts/svg?seed=Fernando', passwordHash: 'fernando2026', id: 'preset_gestor' },
          { email: 'supervisor.costura@vickytex.com.br', name: 'Roberto Costa (Líder de Costura)', role: 'Supervisor', sector: 'Costura', photoURL: 'https://api.dicebear.com/7.x/lorelei/svg?seed=Roberto', passwordHash: 'roberto2026', id: 'preset_supervisor' },
          { email: 'admin@vickytex.com.br', name: 'Suporte TI Vickytex', role: 'Administrador', sector: 'Administração', photoURL: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=Buster', passwordHash: 'admin123', id: 'preset_admin' },
          { email: 'colaborador@vickytex.com.br', name: 'Ana Souza (Operadora Corte)', role: 'Colaborador', sector: 'Corte', photoURL: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ana', passwordHash: 'ana2026', id: 'preset_colaborador' },
          { email: 'auditor.externo@vickytex.com.br', name: 'Carlos Eduardo (Auditor ISO 9001)', role: 'Auditor', sector: 'Qualidade', photoURL: 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=Carlos', passwordHash: 'carlos2026', id: 'preset_auditor' }
        ];
      }
      
      const found = userList.find((u: any) => u.email.toLowerCase() === email.toLowerCase() && u.passwordHash === passwordHash);
      if (found) {
        localStorage.setItem('sgq_vickytex_role', found.role);
        setUser({
          email: found.email,
          name: found.name,
          role: found.role as UserRole,
          sector: found.sector as SectorType,
          photoURL: found.photoURL,
          id: found.id
        });
        setAccessToken('mock_google_oauth_token_' + found.role);
        setNeedsAuth(false);
        await recordAuditLog(found.id, 'Login', 'Autenticação', 'Login por e-mail e senha');
        return true;
      }
      await recordAuditLog('guest', 'Falha de autenticação', 'Autenticação', `E-mail ou senha incorretos para: ${email}`);
      return false;
    } catch (err) {
      console.error(err);
      return false;
    } finally {
      setIsLoggingIn(false);
    }
  };

  const switchProfile = async (role: UserRole) => {
    const previousRole = user?.role;
    localStorage.setItem('sgq_vickytex_role', role);
    setAccessToken('mock_google_oauth_token_' + role);
    
    try {
      const savedUsersStr = localStorage.getItem('sgq_vickytex_users');
      if (savedUsersStr) {
        const savedUsers = JSON.parse(savedUsersStr);
        const activeUser = savedUsers.find((u: any) => u.role === role);
        if (activeUser) {
          const profile = {
            email: activeUser.email,
            name: activeUser.name,
            role: activeUser.role as UserRole,
            sector: activeUser.sector as SectorType,
            photoURL: activeUser.photoURL,
            id: activeUser.id
          };
          setUser(profile);
          await recordAuditLog(activeUser.id, 'Troca de Perfil', 'Autenticação', `Perfil alternado de ${previousRole} para ${role}`);
          return;
        }
      }
    } catch (e) {
      // ignore
    }
    
    const defaultProfile = { ...PRESET_USERS[role], id: 'preset_' + role.toLowerCase() };
    setUser(defaultProfile);
    await recordAuditLog(defaultProfile.id, 'Troca de Perfil', 'Autenticação', `Perfil alternado de ${previousRole} para ${role}`);
  };

  const logout = async () => {
    const activeUserId = user?.id || 'guest';
    await recordAuditLog(activeUserId, 'Logout', 'Autenticação', 'Sessão encerrada pelo usuário');
    setUser(null);
    setAccessToken(null);
    setNeedsAuth(true);
    localStorage.removeItem('sgq_vickytex_role');
  };

  const hasPermission = (permissionCode: PermissionCode): boolean => {
    const fallbackMap: Record<UserRole, PermissionCode[]> = {
      Administrador: [
        'documents.read', 'documents.create', 'documents.update', 'documents.delete',
        'documents.approve', 'documents.publish', 'users.manage', 'settings.manage', 'audits.manage'
      ],
      Qualidade: [
        'documents.read', 'documents.create', 'documents.update', 'documents.approve',
        'documents.publish', 'audits.manage'
      ],
      Gestor: [
        'documents.read', 'documents.approve', 'documents.publish'
      ],
      Supervisor: [
        'documents.read', 'documents.create'
      ],
      Auditor: [
        'documents.read', 'audits.manage'
      ],
      Colaborador: [
        'documents.read'
      ],
      Visitante: [
        'documents.read'
      ]
    };

    const activeRole = user?.role || 'Colaborador';
    const rolePerms = fallbackMap[activeRole] || [];
    return rolePerms.includes(permissionCode);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        needsAuth,
        isLoggingIn,
        permissions,
        hasPermission,
        loginWithGoogle,
        loginWithEmail,
        switchProfile,
        logout,
        refreshUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
