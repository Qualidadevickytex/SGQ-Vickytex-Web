/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 
  | 'Administrador' 
  | 'Qualidade' 
  | 'Supervisor' 
  | 'Gestor' 
  | 'Colaborador' 
  | 'Auditor' 
  | 'Visitante';

// Alias solicitado
export type Role = UserRole;

export type PermissionCode =
  | 'documents.read'
  | 'documents.create'
  | 'documents.update'
  | 'documents.delete'
  | 'documents.approve'
  | 'documents.publish'
  | 'users.manage'
  | 'settings.manage'
  | 'audits.manage';

export interface Permission {
  id: string;
  codigo: PermissionCode;
  modulo: string;
  descricao: string;
  ativo: boolean;
}

export interface RolePermission {
  id: string;
  roleId: string;
  permissionId: string;
}
