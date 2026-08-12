/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { UserProfile } from '../types';
import { AuditLogsRepository } from './firebase/repositories/auditLog.repository';

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

class AuditServiceClass {
  private subscribers: Set<AuditSubscriber> = new Set();
  private localLogs: AuditLog[] = [];

  constructor() {}

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

    // 2. Persist to Firestore audit_logs collection
    try {
      await AuditLogsRepository.create(logEntry);
    } catch (err) {
      console.warn('[AuditService] Failed to persist log entry to Firestore audit_logs:', err);
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
      const res = await AuditLogsRepository.findAll();
      if (res.success && Array.isArray(res.data)) {
        return res.data;
      }
    } catch (e) {
      console.warn('[AuditService] Failed to load logs from Firestore:', e);
    }
    return [];
  }
}

export const AuditService = new AuditServiceClass();
export default AuditService;

