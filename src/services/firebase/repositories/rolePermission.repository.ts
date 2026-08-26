/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BaseRepository } from './base.repository';
import { RolePermission } from '../../../types';
import { INITIAL_ROLE_PERMISSIONS } from '../../../utils/mockData';

export interface RolePermissionDocument extends RolePermission {
  id: string;
}

class RolePermissionsRepositoryClass extends BaseRepository<RolePermissionDocument> {
  protected collectionName = 'role_permissions';

  protected getLocalData(): RolePermissionDocument[] {
    try {
      const saved = localStorage.getItem('sgq_vickytex_role_permissions');
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_ROLE_PERMISSIONS.map(p => ({ id: p.role, ...p }));
  }

  protected saveLocalData(data: RolePermissionDocument[]): void {
    try {
      localStorage.setItem('sgq_vickytex_role_permissions', JSON.stringify(data));
    } catch {}
  }

  protected mapRecord(rec: any): RolePermissionDocument {
    return {
      id: rec.id || rec.role,
      role: rec.role,
      allowedSections: rec.allowedSections || rec.allowed_sections || []
    };
  }

  protected mapToPayload(data: Partial<RolePermissionDocument>): any {
    return {
      role: data.role,
      allowedSections: data.allowedSections || []
    };
  }

  protected getSearchFilter(query: string): string {
    return `role ~ "${query}"`;
  }

  protected localSearchMatch(item: RolePermissionDocument, query: string): boolean {
    return item.role.toLowerCase().includes(query.toLowerCase());
  }
}

export const RolePermissionsRepository = new RolePermissionsRepositoryClass();
export default RolePermissionsRepository;
