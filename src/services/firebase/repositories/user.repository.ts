/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { UserAccount } from '../../../types/user';
import { BaseRepository } from './base.repository';
import { ApiResponse } from '../../api.types';
import { INITIAL_USER_ACCOUNTS } from '../../../utils/mockData';
import { subscribeToCollection, getAllDocs } from '../../../firebase/firestore';

class UserRepositoryClass extends BaseRepository<UserAccount> {
  protected collectionName = 'users';

  protected getLocalData(): UserAccount[] {
    try {
      const saved = localStorage.getItem('sgq_vickytex_users');
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_USER_ACCOUNTS;
  }

  protected saveLocalData(data: UserAccount[]): void {
    try {
      localStorage.setItem('sgq_vickytex_users', JSON.stringify(data));
    } catch {}
  }

  protected mapRecord(rec: any): UserAccount {
    return {
      id: rec.id,
      name: rec.name || rec.username || '',
      email: rec.email || '',
      role: rec.role || 'Colaborador',
      sector: rec.sector || rec.setor || 'Geral',
      photoURL: rec.photoURL || rec.photo_url || '',
      status: rec.status || 'Ativo',
      passwordHash: rec.passwordHash || rec.password_hash || rec.password || 'vickytex123',
      lastLogin: rec.last_login || rec.lastLogin,
      telefone: rec.telefone,
      customPermissions: (rec.customPermissions && typeof rec.customPermissions === 'object')
        ? rec.customPermissions
        : ((rec.custom_permissions && typeof rec.custom_permissions === 'object') ? rec.custom_permissions : undefined)
    };
  }

  protected mapToPayload(data: Partial<UserAccount>): any {
    const payload: any = {
      name: data.name,
      email: data.email,
      role: data.role,
      sector: data.sector,
      status: data.status,
      passwordHash: data.passwordHash || '',
      password_hash: data.passwordHash || '',
      photo_url: data.photoURL,
      telefone: data.telefone,
      customPermissions: data.customPermissions ?? null,
      custom_permissions: data.customPermissions ?? null
    };

    if (data.lastLogin) {
      payload.lastLogin = data.lastLogin;
      payload.last_login = data.lastLogin;
    }

    return payload;
  }

  async findAll(): Promise<ApiResponse<UserAccount[]>> {
    const timestamp = new Date().toISOString();
    try {
      const docs = await getAllDocs<any>(this.collectionName);
      if (Array.isArray(docs)) {
        const mapped = docs.map((rec: any) => this.mapRecord(rec));
        const seenIds = new Set<string>();
        const seenEmails = new Set<string>();
        const unique: UserAccount[] = [];

        for (const u of mapped) {
          if (!u || !u.id) continue;
          const emailKey = (u.email || '').toLowerCase().trim();
          if (seenIds.has(u.id)) continue;
          if (emailKey && seenEmails.has(emailKey)) continue;

          seenIds.add(u.id);
          if (emailKey) seenEmails.add(emailKey);
          unique.push(u);
        }

        return { success: true, data: unique, timestamp };
      }
    } catch (dbErr: any) {
      console.error(`[UserRepository] Error fetching users collection:`, dbErr);
    }
    return { success: true, data: this.getLocalData(), timestamp };
  }

  async create(data: Partial<UserAccount>): Promise<ApiResponse<UserAccount>> {
    const emailKey = (data.email || '').toLowerCase().trim();
    if (emailKey) {
      const allRes = await this.findAll();
      if (allRes.success && Array.isArray(allRes.data)) {
        const existing = allRes.data.find(
          (u) => (u.email || '').toLowerCase().trim() === emailKey || (data.id && u.id === data.id)
        );
        if (existing) {
          // If already exists with same email or id, update instead of duplicating
          return this.update(existing.id, data);
        }
      }
    }
    return super.create(data);
  }

  subscribe(callback: (items: UserAccount[]) => void, onError?: (error: Error) => void): () => void {
    return subscribeToCollection<any>(
      this.collectionName,
      (docs) => {
        const mapped = docs.map((rec) => this.mapRecord(rec));
        const seenIds = new Set<string>();
        const seenEmails = new Set<string>();
        const unique: UserAccount[] = [];

        for (const u of mapped) {
          if (!u || !u.id) continue;
          const emailKey = (u.email || '').toLowerCase().trim();
          if (seenIds.has(u.id)) continue;
          if (emailKey && seenEmails.has(emailKey)) continue;

          seenIds.add(u.id);
          if (emailKey) seenEmails.add(emailKey);
          unique.push(u);
        }

        callback(unique);
      },
      onError
    );
  }

  protected getSearchFilter(query: string): string {
    return `name ~ "${query}" || email ~ "${query}"`;
  }

  protected localSearchMatch(item: UserAccount, query: string): boolean {
    return item.name.toLowerCase().includes(query) || item.email.toLowerCase().includes(query);
  }
}

export const UserRepository = new UserRepositoryClass();
export default UserRepository;
