/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { UserAccount } from '../../../types/user';
import { BaseRepository } from './base.repository';
import { INITIAL_USER_ACCOUNTS } from '../../../utils/mockData';

class UserRepositoryClass extends BaseRepository<UserAccount> {
  protected collectionName = 'users';

  protected getLocalData(): UserAccount[] {
    const saved = localStorage.getItem('sgq_vickytex_users');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return [];
      }
    }
    const isDemoMode = import.meta.env.VITE_DEMO_MODE === 'true';
    return isDemoMode ? INITIAL_USER_ACCOUNTS : [];
  }

  protected saveLocalData(data: UserAccount[]): void {
    localStorage.setItem('sgq_vickytex_users', JSON.stringify(data));
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
      passwordHash: '',
      lastLogin: rec.last_login || rec.lastLogin,
      telefone: rec.telefone
    };
  }

  protected mapToPayload(data: Partial<UserAccount>): any {
    return {
      name: data.name,
      email: data.email,
      role: data.role,
      sector: data.sector,
      status: data.status,
      photo_url: data.photoURL,
      telefone: data.telefone
    };
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
