/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ConfigurationService } from './configuration.service';

export type Environment = 'development' | 'staging' | 'production';

export const EnvironmentService = {
  /**
   * Returns current active environment based on Vite mode or hostname
   */
  getEnvironment(): Environment {
    const mode = (import.meta as any).env?.MODE;
    if (mode === 'production') return 'production';
    if (mode === 'staging' || mode === 'homologacao') return 'staging';
    return 'development';
  },

  /**
   * True if Google Drive API is required (Production only)
   */
  isGoogleDriveRequired(): boolean {
    return this.getEnvironment() === 'production';
  },

  /**
   * Validate infrastructure and environment configuration
   */
  validateEnvironment(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    const env = this.getEnvironment();
    const config = ConfigurationService.getConfig();
    
    const googleClientId = config.googleClientId || (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID || '';

    if (this.isGoogleDriveRequired() && !googleClientId) {
      errors.push(
        `[SGQ Vickytex - ${env.toUpperCase()}] Erro de infraestrutura: VITE_GOOGLE_CLIENT_ID ou configuração de Google OAuth está ausente.`
      );
    }

    if (errors.length > 0) {
      errors.forEach(err => console.error(err));
    } else {
      console.log(`[SGQ Vickytex] Ambiente verificado e validado com sucesso: ${env.toUpperCase()}`);
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
};

export { ConfigurationService } from './configuration.service';
export default EnvironmentService;
