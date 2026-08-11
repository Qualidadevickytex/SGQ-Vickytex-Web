/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { UserProfile } from '../types';

export interface AuditLog {
  id: string;
  usuarioEmail: string;
  usuarioNome: string;
  usuarioRole: string;
  acao: string;
  detalhes: string;
  timestamp: string;
  documentoId?: string;
}

type AuditSubscriber = (log: AuditLog) => void;

const getApiBaseUrl = (): string => {
  if (typeof window !== 'undefined') {
    return (import.meta as any).env?.VITE_API_URL || 'http://localhost:3001';
  }
  return 'http://localhost:3001';
};

class AuditServiceClass {
  private subscribers: Set<AuditSubscriber> = new Set();
  private localLogs: AuditLog[] = [];

  constructor() {
    try {
      const saved = localStorage.getItem('sgq_vickytex_activity_logs');
      if (saved) {
        this.localLogs = JSON.parse(saved);
      }
    } catch (e) {
      console.warn('[AuditService] Failed to load local logs:', e);
    }
  }

  public subscribe(callback: AuditSubscriber): () => void {
    this.subscribers.add(callback);
    return () => {
      this.subscribers.delete(callback);
    };
  }

  private async dispatchLog(
    user: UserProfile | null,
    action: string,
    details: string,
    docId?: string
  ): Promise<AuditLog> {
    const defaultUser: UserProfile = {
      email: 'qualidade@vickytex.com.br',
      name: 'Mariana Silva',
      role: 'Qualidade',
      sector: 'Qualidade'
    };

    const activeUser = user || defaultUser;

    const logEntry: AuditLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      usuarioEmail: activeUser.email,
      usuarioNome: activeUser.name,
      usuarioRole: activeUser.role,
      acao: action,
      detalhes: details,
      timestamp: new Date().toISOString(),
      documentoId: docId
    };

    // 1. Notify local React subscribers
    this.subscribers.forEach(sub => {
      try {
        sub(logEntry);
      } catch (e) {
        console.error('[AuditService] Subscriber notification failed:', e);
      }
    });

    // 2. Persist to local memory and localStorage
    this.localLogs.unshift(logEntry);
    if (this.localLogs.length > 500) {
      this.localLogs = this.localLogs.slice(0, 500);
    }
    try {
      localStorage.setItem('sgq_vickytex_activity_logs', JSON.stringify(this.localLogs));
    } catch (e) {
      // ignore write errors
    }

    // 3. Persist via Express HTTP API
    try {
      const baseUrl = getApiBaseUrl();
      await fetch(`${baseUrl}/api/audit-logs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          usuarioEmail: logEntry.usuarioEmail,
          acao: logEntry.acao,
          modulo: 'Auditoria',
          registro: `${logEntry.usuarioNome} (${logEntry.usuarioRole}): ${logEntry.detalhes}`
        })
      });
    } catch (err) {
      console.warn('[AuditService] Failed to persist log entry via Express API:', err);
    }

    return logEntry;
  }

  // --- STANDARD COMPLIANT LOGGING API ---

  async login(user: UserProfile, details = 'Login realizado com sucesso via email/senha.'): Promise<AuditLog> {
    return this.dispatchLog(user, 'Login', details);
  }

  async logout(user: UserProfile, details = 'Logoff realizado do sistema.'): Promise<AuditLog> {
    return this.dispatchLog(user, 'Logout', details);
  }

  async create(user: UserProfile | null, module: string, itemName: string, details: string, docId?: string): Promise<AuditLog> {
    return this.dispatchLog(user, 'Criação', `[${module}] Criou item: ${itemName}. ${details}`, docId);
  }

  async update(user: UserProfile | null, module: string, itemName: string, details: string, docId?: string): Promise<AuditLog> {
    return this.dispatchLog(user, 'Atualização', `[${module}] Editou item: ${itemName}. ${details}`, docId);
  }

  async delete(user: UserProfile | null, module: string, itemName: string, details: string, docId?: string): Promise<AuditLog> {
    return this.dispatchLog(user, 'Exclusão', `[${module}] Deletou item: ${itemName}. ${details}`, docId);
  }

  async view(user: UserProfile | null, module: string, itemName: string, details: string, docId?: string): Promise<AuditLog> {
    return this.dispatchLog(user, 'Visualização', `[${module}] Visualizou item: ${itemName}. ${details}`, docId);
  }

  async download(user: UserProfile | null, module: string, itemName: string, details: string, docId?: string): Promise<AuditLog> {
    return this.dispatchLog(user, 'Download', `[${module}] Baixou arquivo de: ${itemName}. ${details}`, docId);
  }

  async approve(user: UserProfile | null, module: string, itemName: string, details: string, docId?: string): Promise<AuditLog> {
    return this.dispatchLog(user, 'Aprovação', `[${module}] Aprovou: ${itemName}. ${details}`, docId);
  }

  async publish(user: UserProfile | null, module: string, itemName: string, details: string, docId?: string): Promise<AuditLog> {
    return this.dispatchLog(user, 'Publicação', `[${module}] Publicou: ${itemName}. ${details}`, docId);
  }

  async reject(user: UserProfile | null, module: string, itemName: string, details: string, docId?: string): Promise<AuditLog> {
    return this.dispatchLog(user, 'Rejeição', `[${module}] Rejeitou: ${itemName}. ${details}`, docId);
  }

  /**
   * Retrieve all activity logs
   */
  async getLogs(): Promise<AuditLog[]> {
    try {
      const baseUrl = getApiBaseUrl();
      const res = await fetch(`${baseUrl}/api/audit-logs`);
      if (res.ok) {
        const result = await res.json();
        if (result.success && Array.isArray(result.data)) {
          return result.data.map((rec: any) => ({
            id: rec.id,
            usuarioEmail: rec.usuarioEmail || '',
            usuarioNome: rec.usuarioEmail || '',
            usuarioRole: 'Usuário',
            acao: rec.acao,
            detalhes: rec.registro || '',
            timestamp: rec.data || new Date().toISOString()
          }));
        }
      }
    } catch (e) {
      console.warn('[AuditService] Failed to load from Express API. Falling back to local logs.', e);
    }
    return this.localLogs;
  }
}

export const AuditService = new AuditServiceClass();
export default AuditService;
