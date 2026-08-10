/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { UserProfile } from '../../types';
import { signInWithGoogle, loginWithEmail, logoutUser, resetPassword } from '../../firebase/auth';

/**
 * Serviço de Autenticação do SGQ Vickytex (Baseado em Firebase Auth + Firestore)
 */
export const authService = {
  /**
   * Realiza login utilizando e-mail e senha no Firebase Auth
   */
  async loginWithEmail(email: string, passwordHash: string): Promise<UserProfile | null> {
    try {
      const cred = await loginWithEmail(email, passwordHash);
      if (cred.user) {
        return {
          id: cred.user.uid,
          email: cred.user.email || email,
          name: cred.user.displayName || email.split('@')[0],
          role: 'Qualidade',
          sector: 'Qualidade',
          photoURL: cred.user.photoURL || undefined
        };
      }
    } catch (e) {
      console.warn('Firebase loginWithEmail error:', e);
    }
    return null;
  },

  /**
   * Realiza login via SSO do Google Workspace via Firebase Auth
   */
  async loginWithGoogle(): Promise<UserProfile | null> {
    try {
      const cred = await signInWithGoogle();
      if (cred.user) {
        return {
          id: cred.user.uid,
          email: cred.user.email || '',
          name: cred.user.displayName || 'Usuário Google',
          role: 'Qualidade',
          sector: 'Qualidade',
          photoURL: cred.user.photoURL || undefined
        };
      }
    } catch (e) {
      console.warn('Firebase loginWithGoogle error:', e);
    }
    return null;
  },

  /**
   * Envia e-mail de recuperação de senha
   */
  async resetPasswordEmail(email: string): Promise<void> {
    await resetPassword(email);
  },

  /**
   * Desconecta o usuário do sistema
   */
  async logout(): Promise<void> {
    await logoutUser();
    localStorage.removeItem('sgq_vickytex_auth_session');
  }
};

export default authService;
