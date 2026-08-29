/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { UserRole, SystemModuleId, ModuleCrudPermission, SectorScope, CrudAction, RolePermission } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { RolePermissionsRepository } from '../services/firebase/repositories/rolePermission.repository';
import { INITIAL_ROLE_PERMISSIONS } from './mockData';

let cachedDynamicRolePermissions: RolePermission[] = INITIAL_ROLE_PERMISSIONS;

// Auto-subscribe to remote role permissions in real-time
try {
  RolePermissionsRepository.subscribe((items) => {
    if (items && Array.isArray(items) && items.length > 0) {
      cachedDynamicRolePermissions = items;
    }
  });
} catch {}

export function getCachedRolePermissions(): RolePermission[] {
  return cachedDynamicRolePermissions;
}

export interface ModuleDefinition {
  id: SystemModuleId;
  label: string;
  category: 'Geral & Estratégico' | 'Qualidade & Documentação' | 'Operação & Processos' | 'Suporte & Sistema';
  description: string;
}

export const SYSTEM_MODULES: ModuleDefinition[] = [
  { 
    id: 'dashboard', 
    label: 'Painel Geral', 
    category: 'Geral & Estratégico',
    description: 'Visão consolidada de KPIs, alertas e atividades recentes'
  },
  { 
    id: 'indicadores', 
    label: 'Indicadores & KPIs (9.1)', 
    category: 'Geral & Estratégico',
    description: 'Monitoramento de metas, índices de refugo e produtividade'
  },
  { 
    id: 'ceo', 
    label: 'Melhoria Contínua & CEO', 
    category: 'Geral & Estratégico',
    description: 'Centro de excelência, diretrizes executivas e projetos estratégicos'
  },
  { 
    id: 'documentos', 
    label: 'Lista Mestra (ISO 7.5)', 
    category: 'Qualidade & Documentação',
    description: 'Procedimentos (POPs), Instruções (ITs), Manuais e Formulários'
  },
  { 
    id: 'registros', 
    label: 'Controle de Registros (7.5.3)', 
    category: 'Qualidade & Documentação',
    description: 'Rastreabilidade, retenção, arquivamento e descarte de evidências'
  },
  { 
    id: 'auditorias', 
    label: 'Auditorias Internas & NC (9.2/10.2)', 
    category: 'Qualidade & Documentação',
    description: 'Programação de auditorias ISO 9001 e tratativa de Não Conformidades'
  },
  { 
    id: 'riscos', 
    label: 'Riscos & Oportunidades (6.1)', 
    category: 'Qualidade & Documentação',
    description: 'Matriz de probabilidade x impacto, mitigação e planos preventivos'
  },
  { 
    id: 'planos', 
    label: 'Planos de Ação 5W2H (10.2)', 
    category: 'Operação & Processos',
    description: 'Planejamento de ações corretivas, prazos, custos e responsáveis'
  },
  { 
    id: '5s', 
    label: 'Programa 5S (Lean)', 
    category: 'Operação & Processos',
    description: 'Auditorias dos 5 sensos, fotos em tempo real e troféu 5S'
  },
  { 
    id: 'fornecedores', 
    label: 'Avaliação Fornecedores (8.4)', 
    category: 'Operação & Processos',
    description: 'Qualificação, homologação e controle de insumos têxteis críticos'
  },
  { 
    id: 'treinamentos', 
    label: 'Treinamentos & Matriz (7.2)', 
    category: 'Operação & Processos',
    description: 'Polivalência de operadores, listas de presença e eficácia'
  },
  { 
    id: 'calibracao', 
    label: 'Calibração & Metrologia (7.1.5)', 
    category: 'Operação & Processos',
    description: 'Instrumentos de medição, balanças, trenas e certificados RBC'
  },
  { 
    id: 'perfil', 
    label: 'Meu Perfil & Senha', 
    category: 'Suporte & Sistema',
    description: 'Acesso aos dados pessoais, alteração de foto e senha do usuário logado'
  },
  { 
    id: 'usuarios', 
    label: 'Usuários do Sistema (Contas)', 
    category: 'Suporte & Sistema',
    description: 'Cadastro de colaboradores, credenciais e ativação de contas'
  },
  { 
    id: 'permissoes', 
    label: 'Matriz de Acessos & Alçadas (5.3)', 
    category: 'Suporte & Sistema',
    description: 'Gestão de direitos de acesso [V, C, E, X], escopo de setor e perfis técnicos'
  },
  { 
    id: 'configuracoes', 
    label: 'Configurações do Sistema', 
    category: 'Suporte & Sistema',
    description: 'Parâmetros corporativos, cabeçalhos, logotipo e personalização'
  },
  { 
    id: 'integracao', 
    label: 'Google Workspace & Drive', 
    category: 'Suporte & Sistema',
    description: 'Conexão em nuvem com pastas de documentos e relatórios'
  },
  { 
    id: 'database', 
    label: 'Database Live View', 
    category: 'Suporte & Sistema',
    description: 'Monitoramento em tempo real do banco de dados Firestore'
  }
];

/**
 * Permissões Padrão por Perfil Técnico (Role)
 * Atua como a herança inicial caso o usuário não possua customizações específicas.
 */
export const DEFAULT_ROLE_CRUD_PERMISSIONS: Record<UserRole, Record<SystemModuleId, ModuleCrudPermission>> = {
  Administrador: {
    dashboard: { ver: true, criar: true, editar: true, excluir: true, escopoSetor: 'todos' },
    documentos: { ver: true, criar: true, editar: true, excluir: true, escopoSetor: 'todos' },
    indicadores: { ver: true, criar: true, editar: true, excluir: true, escopoSetor: 'todos' },
    ceo: { ver: true, criar: true, editar: true, excluir: true, escopoSetor: 'todos' },
    registros: { ver: true, criar: true, editar: true, excluir: true, escopoSetor: 'todos' },
    fornecedores: { ver: true, criar: true, editar: true, excluir: true, escopoSetor: 'todos' },
    auditorias: { ver: true, criar: true, editar: true, excluir: true, escopoSetor: 'todos' },
    riscos: { ver: true, criar: true, editar: true, excluir: true, escopoSetor: 'todos' },
    planos: { ver: true, criar: true, editar: true, excluir: true, escopoSetor: 'todos' },
    '5s': { ver: true, criar: true, editar: true, excluir: true, escopoSetor: 'todos' },
    treinamentos: { ver: true, criar: true, editar: true, excluir: true, escopoSetor: 'todos' },
    calibracao: { ver: true, criar: true, editar: true, excluir: true, escopoSetor: 'todos' },
    perfil: { ver: true, criar: true, editar: true, excluir: true, escopoSetor: 'todos' },
    usuarios: { ver: true, criar: true, editar: true, excluir: true, escopoSetor: 'todos' },
    permissoes: { ver: true, criar: true, editar: true, excluir: true, escopoSetor: 'todos' },
    configuracoes: { ver: true, criar: true, editar: true, excluir: true, escopoSetor: 'todos' },
    integracao: { ver: true, criar: true, editar: true, excluir: true, escopoSetor: 'todos' },
    database: { ver: true, criar: true, editar: true, excluir: true, escopoSetor: 'todos' }
  },

  Qualidade: {
    dashboard: { ver: true, criar: true, editar: true, excluir: true, escopoSetor: 'todos' },
    documentos: { ver: true, criar: true, editar: true, excluir: true, escopoSetor: 'todos' },
    indicadores: { ver: true, criar: true, editar: true, excluir: true, escopoSetor: 'todos' },
    ceo: { ver: true, criar: true, editar: true, excluir: true, escopoSetor: 'todos' },
    registros: { ver: true, criar: true, editar: true, excluir: true, escopoSetor: 'todos' },
    fornecedores: { ver: true, criar: true, editar: true, excluir: true, escopoSetor: 'todos' },
    auditorias: { ver: true, criar: true, editar: true, excluir: true, escopoSetor: 'todos' },
    riscos: { ver: true, criar: true, editar: true, excluir: true, escopoSetor: 'todos' },
    planos: { ver: true, criar: true, editar: true, excluir: true, escopoSetor: 'todos' },
    '5s': { ver: true, criar: true, editar: true, excluir: true, escopoSetor: 'todos' },
    treinamentos: { ver: true, criar: true, editar: true, excluir: true, escopoSetor: 'todos' },
    calibracao: { ver: true, criar: true, editar: true, excluir: true, escopoSetor: 'todos' },
    perfil: { ver: true, criar: true, editar: true, excluir: true, escopoSetor: 'todos' },
    usuarios: { ver: true, criar: true, editar: true, excluir: true, escopoSetor: 'todos' },
    permissoes: { ver: true, criar: true, editar: true, excluir: true, escopoSetor: 'todos' },
    configuracoes: { ver: true, criar: true, editar: true, excluir: true, escopoSetor: 'todos' },
    integracao: { ver: true, criar: true, editar: true, excluir: true, escopoSetor: 'todos' },
    database: { ver: true, criar: true, editar: true, excluir: true, escopoSetor: 'todos' }
  },

  Gestor: {
    dashboard: { ver: true, criar: false, editar: false, excluir: false, escopoSetor: 'todos' },
    documentos: { ver: true, criar: true, editar: true, excluir: false, escopoSetor: 'todos' },
    indicadores: { ver: true, criar: true, editar: true, excluir: false, escopoSetor: 'todos' },
    ceo: { ver: true, criar: true, editar: true, excluir: false, escopoSetor: 'todos' },
    registros: { ver: true, criar: true, editar: true, excluir: false, escopoSetor: 'todos' },
    fornecedores: { ver: true, criar: true, editar: true, excluir: false, escopoSetor: 'todos' },
    auditorias: { ver: true, criar: true, editar: true, excluir: false, escopoSetor: 'todos' },
    riscos: { ver: true, criar: true, editar: true, excluir: false, escopoSetor: 'todos' },
    planos: { ver: true, criar: true, editar: true, excluir: false, escopoSetor: 'todos' },
    '5s': { ver: true, criar: true, editar: true, excluir: false, escopoSetor: 'todos' },
    treinamentos: { ver: true, criar: true, editar: true, excluir: false, escopoSetor: 'todos' },
    calibracao: { ver: true, criar: true, editar: true, excluir: false, escopoSetor: 'todos' },
    perfil: { ver: true, criar: false, editar: true, excluir: false, escopoSetor: 'todos' },
    usuarios: { ver: true, criar: false, editar: false, excluir: false, escopoSetor: 'todos' },
    permissoes: { ver: false, criar: false, editar: false, excluir: false, escopoSetor: 'todos' },
    configuracoes: { ver: true, criar: false, editar: false, excluir: false, escopoSetor: 'todos' },
    integracao: { ver: true, criar: false, editar: false, excluir: false, escopoSetor: 'todos' },
    database: { ver: false, criar: false, editar: false, excluir: false, escopoSetor: 'todos' }
  },

  Supervisor: {
    dashboard: { ver: true, criar: false, editar: false, excluir: false, escopoSetor: 'setor_proprio' },
    documentos: { ver: true, criar: true, editar: true, excluir: false, escopoSetor: 'setor_proprio' },
    indicadores: { ver: true, criar: false, editar: false, excluir: false, escopoSetor: 'setor_proprio' },
    ceo: { ver: true, criar: false, editar: false, excluir: false, escopoSetor: 'setor_proprio' },
    registros: { ver: true, criar: true, editar: true, excluir: false, escopoSetor: 'setor_proprio' },
    fornecedores: { ver: true, criar: false, editar: false, excluir: false, escopoSetor: 'setor_proprio' },
    auditorias: { ver: true, criar: false, editar: true, excluir: false, escopoSetor: 'setor_proprio' },
    riscos: { ver: true, criar: true, editar: true, excluir: false, escopoSetor: 'setor_proprio' },
    planos: { ver: true, criar: true, editar: true, excluir: false, escopoSetor: 'setor_proprio' },
    '5s': { ver: true, criar: true, editar: true, excluir: false, escopoSetor: 'setor_proprio' },
    treinamentos: { ver: true, criar: true, editar: true, excluir: false, escopoSetor: 'setor_proprio' },
    calibracao: { ver: true, criar: false, editar: true, excluir: false, escopoSetor: 'setor_proprio' },
    perfil: { ver: true, criar: false, editar: true, excluir: false, escopoSetor: 'setor_proprio' },
    usuarios: { ver: false, criar: false, editar: false, excluir: false, escopoSetor: 'setor_proprio' },
    permissoes: { ver: false, criar: false, editar: false, excluir: false, escopoSetor: 'setor_proprio' },
    configuracoes: { ver: false, criar: false, editar: false, excluir: false, escopoSetor: 'setor_proprio' },
    integracao: { ver: false, criar: false, editar: false, excluir: false, escopoSetor: 'setor_proprio' },
    database: { ver: false, criar: false, editar: false, excluir: false, escopoSetor: 'setor_proprio' }
  },

  Auditor: {
    dashboard: { ver: true, criar: false, editar: false, excluir: false, escopoSetor: 'todos' },
    documentos: { ver: true, criar: false, editar: false, excluir: false, escopoSetor: 'todos' },
    indicadores: { ver: true, criar: false, editar: false, excluir: false, escopoSetor: 'todos' },
    ceo: { ver: true, criar: false, editar: false, excluir: false, escopoSetor: 'todos' },
    registros: { ver: true, criar: false, editar: false, excluir: false, escopoSetor: 'todos' },
    fornecedores: { ver: true, criar: false, editar: false, excluir: false, escopoSetor: 'todos' },
    auditorias: { ver: true, criar: true, editar: true, excluir: false, escopoSetor: 'todos' },
    riscos: { ver: true, criar: true, editar: false, excluir: false, escopoSetor: 'todos' },
    planos: { ver: true, criar: true, editar: false, excluir: false, escopoSetor: 'todos' },
    '5s': { ver: true, criar: true, editar: true, excluir: false, escopoSetor: 'todos' },
    treinamentos: { ver: true, criar: false, editar: false, excluir: false, escopoSetor: 'todos' },
    calibracao: { ver: true, criar: false, editar: false, excluir: false, escopoSetor: 'todos' },
    perfil: { ver: true, criar: false, editar: true, excluir: false, escopoSetor: 'todos' },
    usuarios: { ver: false, criar: false, editar: false, excluir: false, escopoSetor: 'todos' },
    permissoes: { ver: true, criar: false, editar: false, excluir: false, escopoSetor: 'todos' },
    configuracoes: { ver: false, criar: false, editar: false, excluir: false, escopoSetor: 'todos' },
    integracao: { ver: false, criar: false, editar: false, excluir: false, escopoSetor: 'todos' },
    database: { ver: false, criar: false, editar: false, excluir: false, escopoSetor: 'todos' }
  },

  Colaborador: {
    dashboard: { ver: true, criar: false, editar: false, excluir: false, escopoSetor: 'setor_proprio' },
    documentos: { ver: true, criar: false, editar: false, excluir: false, escopoSetor: 'setor_proprio' },
    indicadores: { ver: true, criar: false, editar: false, excluir: false, escopoSetor: 'setor_proprio' },
    ceo: { ver: true, criar: false, editar: false, excluir: false, escopoSetor: 'setor_proprio' },
    registros: { ver: true, criar: false, editar: false, excluir: false, escopoSetor: 'setor_proprio' },
    fornecedores: { ver: false, criar: false, editar: false, excluir: false, escopoSetor: 'setor_proprio' },
    auditorias: { ver: false, criar: false, editar: false, excluir: false, escopoSetor: 'setor_proprio' },
    riscos: { ver: false, criar: false, editar: false, excluir: false, escopoSetor: 'setor_proprio' },
    planos: { ver: false, criar: false, editar: false, excluir: false, escopoSetor: 'setor_proprio' },
    '5s': { ver: true, criar: false, editar: false, excluir: false, escopoSetor: 'setor_proprio' },
    treinamentos: { ver: true, criar: false, editar: false, excluir: false, escopoSetor: 'setor_proprio' },
    calibracao: { ver: false, criar: false, editar: false, excluir: false, escopoSetor: 'setor_proprio' },
    perfil: { ver: true, criar: false, editar: true, excluir: false, escopoSetor: 'setor_proprio' },
    usuarios: { ver: false, criar: false, editar: false, excluir: false, escopoSetor: 'setor_proprio' },
    permissoes: { ver: false, criar: false, editar: false, excluir: false, escopoSetor: 'setor_proprio' },
    configuracoes: { ver: false, criar: false, editar: false, excluir: false, escopoSetor: 'setor_proprio' },
    integracao: { ver: false, criar: false, editar: false, excluir: false, escopoSetor: 'setor_proprio' },
    database: { ver: false, criar: false, editar: false, excluir: false, escopoSetor: 'setor_proprio' }
  },

  Visitante: {
    dashboard: { ver: true, criar: false, editar: false, excluir: false, escopoSetor: 'todos' },
    documentos: { ver: true, criar: false, editar: false, excluir: false, escopoSetor: 'todos' },
    indicadores: { ver: true, criar: false, editar: false, excluir: false, escopoSetor: 'todos' },
    ceo: { ver: true, criar: false, editar: false, excluir: false, escopoSetor: 'todos' },
    registros: { ver: true, criar: false, editar: false, excluir: false, escopoSetor: 'todos' },
    fornecedores: { ver: false, criar: false, editar: false, excluir: false, escopoSetor: 'todos' },
    auditorias: { ver: false, criar: false, editar: false, excluir: false, escopoSetor: 'todos' },
    riscos: { ver: false, criar: false, editar: false, excluir: false, escopoSetor: 'todos' },
    planos: { ver: false, criar: false, editar: false, excluir: false, escopoSetor: 'todos' },
    '5s': { ver: false, criar: false, editar: false, excluir: false, escopoSetor: 'todos' },
    treinamentos: { ver: false, criar: false, editar: false, excluir: false, escopoSetor: 'todos' },
    calibracao: { ver: false, criar: false, editar: false, excluir: false, escopoSetor: 'todos' },
    perfil: { ver: true, criar: false, editar: false, excluir: false, escopoSetor: 'todos' },
    usuarios: { ver: false, criar: false, editar: false, excluir: false, escopoSetor: 'todos' },
    permissoes: { ver: false, criar: false, editar: false, excluir: false, escopoSetor: 'todos' },
    configuracoes: { ver: false, criar: false, editar: false, excluir: false, escopoSetor: 'todos' },
    integracao: { ver: false, criar: false, editar: false, excluir: false, escopoSetor: 'todos' },
    database: { ver: false, criar: false, editar: false, excluir: false, escopoSetor: 'todos' }
  }
};

/**
 * Obtém a permissão efetiva do usuário para determinado módulo, combinando herança do cargo (com suporte a permissões dinâmicas de papéis) com customizações do usuário.
 */
export function getEffectiveModulePermission(
  role: UserRole = 'Colaborador',
  moduleId: SystemModuleId | string,
  customPermissions?: Record<string, ModuleCrudPermission>,
  dynamicRolePermissions?: RolePermission[]
): ModuleCrudPermission {
  // 1. Administrador possui acesso irrestrito e total a todos os módulos, sem risco de bloqueio acidental
  if (role === 'Administrador') {
    return {
      ver: true,
      criar: true,
      editar: true,
      excluir: true,
      escopoSetor: 'todos'
    };
  }

  // 2. Se o usuário possui regra customizada individual (da aba Por Colaborador & Setor), ela possui prioridade sobre os papéis
  if (customPermissions && customPermissions[moduleId]) {
    return {
      ...customPermissions[moduleId]
    };
  }

  const roleDefaults = DEFAULT_ROLE_CRUD_PERMISSIONS[role] || DEFAULT_ROLE_CRUD_PERMISSIONS['Colaborador'];
  const basePerm = (roleDefaults as any)[moduleId] || {
    ver: false,
    criar: false,
    editar: false,
    excluir: false,
    escopoSetor: 'setor_proprio' as SectorScope
  };

  // 3. Se houver configuração dinâmica do perfil técnico (da aba Perfis Técnicos)
  let roleEffectivePerm = { ...basePerm };
  if (dynamicRolePermissions && dynamicRolePermissions.length > 0) {
    const roleConfig = dynamicRolePermissions.find(p => p.role === role);
    if (roleConfig) {
      const isAllowedInRole = (roleConfig.allowedSections as string[]).includes(moduleId);
      if (!isAllowedInRole) {
        roleEffectivePerm = {
          ...roleEffectivePerm,
          ver: false,
          criar: false,
          editar: false,
          excluir: false
        };
      } else if (!roleEffectivePerm.ver) {
        roleEffectivePerm = {
          ...roleEffectivePerm,
          ver: true,
          editar: moduleId === 'perfil' ? true : roleEffectivePerm.editar
        };
      }
    }
  }

  return roleEffectivePerm;
}

/**
 * Verifica se o usuário tem permissão para realizar uma ação (Ver, Criar, Editar, Excluir)
 * levando em consideração as Customizações Individuais do Usuário, Perfil Técnico, Permissões Dinâmicas e Escopo de Setor.
 */
export function canUserPerform(
  user: {
    role?: UserRole;
    sector?: string;
    customPermissions?: Record<string, ModuleCrudPermission>;
  } | null,
  moduleId: SystemModuleId | string,
  action: CrudAction,
  itemSector?: string,
  dynamicRolePermissions?: RolePermission[]
): boolean {
  if (!user) return false;

  const role = user.role || 'Colaborador';
  const rolePerms = dynamicRolePermissions || cachedDynamicRolePermissions;
  
  // Customizações individuais do usuário têm prioridade via getEffectiveModulePermission
  const effective = getEffectiveModulePermission(role, moduleId, user.customPermissions, rolePerms);
  const actionAllowed = effective[action];

  if (!actionAllowed) {
    return false;
  }

  // Se a ação é permitida e o escopo é 'todos', autorização global concedida
  if (effective.escopoSetor === 'todos') {
    return true;
  }

  // Se o escopo é restrito ao setor próprio e foi passado um setor de item:
  if (effective.escopoSetor === 'setor_proprio' && itemSector && user.sector) {
    const cleanUserSector = user.sector.trim().toLowerCase();
    const cleanItemSector = itemSector.trim().toLowerCase();
    
    // Setores universais ou idênticos
    if (cleanItemSector === 'todos' || cleanItemSector === 'geral' || cleanItemSector === cleanUserSector) {
      return true;
    }

    // Se a ação for criar e o escopo for setor_proprio, o usuário só cria no seu setor
    if (action === 'criar') {
      return cleanItemSector === cleanUserSector;
    }

    return false;
  }

  return true;
}

/**
 * Hook de React para consumo das permissões do módulo em tempo real
 */
export function useModulePermission(moduleId: SystemModuleId) {
  const { user } = useAuth();
  const [rolePermissions, setRolePermissions] = useState<RolePermission[]>(cachedDynamicRolePermissions);

  useEffect(() => {
    const unsub = RolePermissionsRepository.subscribe((items) => {
      if (items && items.length > 0) {
        setRolePermissions(items);
        cachedDynamicRolePermissions = items;
      }
    });
    return () => unsub();
  }, []);

  const effective = getEffectiveModulePermission(user?.role || 'Colaborador', moduleId, user?.customPermissions, rolePermissions);

  return {
    canView: effective.ver,
    canCreate: effective.criar,
    canEdit: effective.editar,
    canDelete: effective.excluir,
    escopoSetor: effective.escopoSetor,
    canPerform: (action: CrudAction, itemSector?: string) => canUserPerform(user, moduleId, action, itemSector, rolePermissions),
    canModifyItem: (itemSector?: string) => canUserPerform(user, moduleId, 'editar', itemSector, rolePermissions),
    canDeleteItem: (itemSector?: string) => canUserPerform(user, moduleId, 'excluir', itemSector, rolePermissions),
    canCreateInSector: (targetSector?: string) => canUserPerform(user, moduleId, 'criar', targetSector, rolePermissions)
  };
}

/**
 * Clona todas as permissões padrão do perfil selecionado
 */
export function generateDefaultPermissionsForRole(role: UserRole): Record<string, ModuleCrudPermission> {
  const defaults = DEFAULT_ROLE_CRUD_PERMISSIONS[role] || DEFAULT_ROLE_CRUD_PERMISSIONS['Colaborador'];
  return JSON.parse(JSON.stringify(defaults));
}
