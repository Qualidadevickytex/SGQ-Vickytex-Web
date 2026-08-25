/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { UserRole, ModuleCrudPermission } from './role';
import { SectorType } from './department';

export interface UserProfile {
  id?: string;
  email: string;
  name: string;
  photoURL?: string;
  role: UserRole;
  sector?: SectorType;
  customPermissions?: Record<string, ModuleCrudPermission>;
}

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  sector: SectorType;
  photoURL?: string;
  status: 'Ativo' | 'Inativo';
  passwordHash: string; // Senha em texto ou hash simulado
  lastLogin?: string;
  telefone?: string;
  customPermissions?: Record<string, ModuleCrudPermission>;
}

// Alias solicitado para infraestrutura
export interface User extends UserProfile {
  id?: string;
}
