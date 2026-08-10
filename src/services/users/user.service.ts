/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { UserProfile } from '../../types';
import { UserRepository } from '../database/repositories/user.repository';

/**
 * Serviço de Gestão de Usuários, Competências e Perfis
 */
export const userService = {
  /**
   * Obtém o perfil do usuário pelo email corporativo
   */
  async getUserProfile(email: string): Promise<UserProfile | null> {
    try {
      const res = await UserRepository.findAll();
      if (res.success && res.data) {
        const found = res.data.find(u => u.email.toLowerCase() === email.toLowerCase());
        if (found) {
          return {
            email: found.email,
            name: found.name,
            role: found.role as any,
            sector: found.sector as any,
            photoURL: found.photoURL
          };
        }
      }
    } catch (e) {
      console.warn('[User Service] Failed to find user profile:', e);
    }
    return null;
  }
};

export default userService;
