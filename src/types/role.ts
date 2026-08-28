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

export type CrudAction = 'ver' | 'criar' | 'editar' | 'excluir';
export type SectorScope = 'todos' | 'setor_proprio';

export type SystemModuleId = 
  | 'dashboard'
  | 'documentos'
  | 'indicadores'
  | 'ceo'
  | 'registros'
  | 'fornecedores'
  | 'auditorias'
  | 'riscos'
  | 'planos'
  | '5s'
  | 'treinamentos'
  | 'calibracao'
  | 'usuarios'
  | 'permissoes'
  | 'configuracoes'
  | 'integracao'
  | 'database';

export interface ModuleCrudPermission {
  ver: boolean;
  criar: boolean;
  editar: boolean;
  excluir: boolean;
  escopoSetor: SectorScope;
}

export interface UserCustomPermissions {
  [moduleId: string]: ModuleCrudPermission;
}

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
