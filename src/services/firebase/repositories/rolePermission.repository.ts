/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BaseRepository } from './base.repository';
import { RolePermission } from '../../../types';

export interface RolePermissionDocument extends RolePermission {
  id: string;
}

class RolePermissionsRepositoryClass extends BaseRepository<RolePermissionDocument> {
  protected collectionName = 'role_permissions';

  protected getLocalData(): RolePermissionDocument[] {
    return [];
  }

  protected saveLocalData(_data: RolePermissionDocument[]): void {}

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
