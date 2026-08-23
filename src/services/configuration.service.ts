/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface SystemConfiguration {
  companyName: string;
  logoUrl: string;
  isoStandard: string;
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  googleClientId: string;
  apiUrl: string;
  primaryColor: string;
  accentColor: string;
  sessionTimeoutMinutes: number;
  googleDriveFolderId: string;
  googleDriveObsoleteFolderId: string;
}

const DEFAULT_CONFIG: SystemConfiguration = {
  companyName: 'Vickytex Indústria Têxtil',
  logoUrl: 'https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&w=120&q=80',
  isoStandard: 'ISO 9001:2015',
  smtpHost: 'smtp.vickytex.com.br',
  smtpPort: 587,
  smtpUser: 'sgq.alertas@vickytex.com.br',
  googleClientId: (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID || '',
  apiUrl: (import.meta as any).env?.VITE_API_URL || '',
  primaryColor: '#0f172a', // Slate 900
  accentColor: '#4f46e5', // Indigo 600
  sessionTimeoutMinutes: 30,
  googleDriveFolderId: (import.meta as any).env?.VITE_GOOGLE_DRIVE_FOLDER_ID || '1_mock_folder_vickytex',
  googleDriveObsoleteFolderId: (import.meta as any).env?.VITE_GOOGLE_DRIVE_OBSOLETE_FOLDER_ID || '2_mock_obsolete_folder_vickytex',
};

class ConfigurationServiceClass {
  private STORAGE_KEY = 'sgq_vickytex_config';

  /**
   * Retrieves the current configuration, falling back to environment values and defaults.
   */
  getConfig(): SystemConfiguration {
    const saved = localStorage.getItem(this.STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Merge with defaults to handle any missing parameters
        return { ...DEFAULT_CONFIG, ...parsed };
      } catch (e) {
        console.error('[Configuration Service] Failed to parse saved config, resetting...', e);
      }
    }
    return { ...DEFAULT_CONFIG };
  }

  /**
   * Updates configuration and persists it in local storage.
   */
  updateConfig(changes: Partial<SystemConfiguration>): SystemConfiguration {
    const current = this.getConfig();
    const updated = { ...current, ...changes };
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updated));
    return updated;
  }

  /**
   * Resets configurations back to factory defaults.
   */
  resetConfig(): SystemConfiguration {
    localStorage.removeItem(this.STORAGE_KEY);
    return { ...DEFAULT_CONFIG };
  }
}

export const ConfigurationService = new ConfigurationServiceClass();
export default ConfigurationService;
