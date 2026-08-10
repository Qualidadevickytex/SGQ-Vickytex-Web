/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { UserRole } from '../types/role';

export const PermissionService = {
  /**
   * Checks if user with role can read a resource
   */
  canRead(role: UserRole, resource: string): boolean {
    if (!role) return false;
    // Visitors and any roles can generally read
    return true;
  },

  /**
   * Checks if user with role can create records in a module/resource
   */
  canCreate(role: UserRole, resource: string): boolean {
    if (!role) return false;
    const adminOrQualidade = role === 'Administrador' || role === 'Qualidade';
    
    if (adminOrQualidade) return true;

    switch (resource) {
      case 'documents':
      case 'documentos':
        return role === 'Gestor' || role === 'Supervisor';
      case 'audits':
      case 'auditorias':
        return role === 'Auditor' || role === 'Gestor';
      case 'actionPlans':
      case 'planos':
        return role === 'Gestor' || role === 'Supervisor' || role === 'Colaborador';
      case 'indicators':
      case 'indicadores':
        return role === 'Gestor';
      case 'trainings':
      case 'treinamentos':
        return role === 'Gestor' || role === 'Supervisor';
      case 'suppliers':
      case 'fornecedores':
        return role === 'Gestor';
      case 'calibrations':
      case 'calibracao':
        return role === 'Supervisor' || role === 'Gestor';
      default:
        return false;
    }
  },

  /**
   * Checks if user with role can update records in a module/resource
   */
  canUpdate(role: UserRole, resource: string): boolean {
    if (!role) return false;
    const adminOrQualidade = role === 'Administrador' || role === 'Qualidade';
    
    if (adminOrQualidade) return true;

    switch (resource) {
      case 'documents':
      case 'documentos':
        return role === 'Gestor';
      case 'audits':
      case 'auditorias':
        return role === 'Auditor' || role === 'Gestor';
      case 'actionPlans':
      case 'planos':
        return role === 'Gestor' || role === 'Supervisor' || role === 'Colaborador';
      case 'indicators':
      case 'indicadores':
        return role === 'Gestor';
      case 'trainings':
      case 'treinamentos':
        return role === 'Gestor' || role === 'Supervisor';
      case 'suppliers':
      case 'fornecedores':
        return role === 'Gestor';
      default:
        return false;
    }
  },

  /**
   * Checks if user with role can delete records
   */
  canDelete(role: UserRole, resource: string): boolean {
    if (!role) return false;
    // Exclusão é altamente crítica: restrita a Administrador e Qualidade por padrão
    return role === 'Administrador' || role === 'Qualidade';
  },

  /**
   * Checks if user with role can approve documents or actions
   */
  canApprove(role: UserRole, resource: string): boolean {
    if (!role) return false;
    // Aprovação ISO 9001 restrita a gestores qualificados, Qualidade e Administrador
    return role === 'Administrador' || role === 'Qualidade' || role === 'Gestor';
  },

  /**
   * Checks if user with role can publish documents or notifications
   */
  canPublish(role: UserRole, resource: string): boolean {
    if (!role) return false;
    // Publicação restrita a Qualidade ou Administrador
    return role === 'Administrador' || role === 'Qualidade';
  },

  /**
   * Checks if user has management permissions (User management, system configurations, database view)
   */
  canManage(role: UserRole, resource: string): boolean {
    if (!role) return false;
    
    if (role === 'Administrador') return true;
    if (role === 'Qualidade') {
      // Qualidade can manage standard QA features but not system users or critical configuration databases
      return resource !== 'users' && resource !== 'system_settings';
    }

    return false;
  }
};

export default PermissionService;
