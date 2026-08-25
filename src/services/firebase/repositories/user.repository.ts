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
    return [];
  }

  protected saveLocalData(_data: UserAccount[]): void {}

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
      customPermissions: rec.customPermissions || rec.custom_permissions || undefined
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
      telefone: data.telefone
    };

    if (data.customPermissions !== undefined) {
      payload.customPermissions = data.customPermissions;
      payload.custom_permissions = data.customPermissions;
    }

    return payload;
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
