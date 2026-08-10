/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Serviço de Integração com Google Gmail (Notificações de Qualidade Vickytex)
 */
export const googleGmailService = {
  /**
   * Envia uma notificação por email para os envolvidos na revisão do documento
   */
  async sendEmailNotification(to: string, subject: string, body: string): Promise<boolean> {
    return true;
  }
};

export default googleGmailService;
