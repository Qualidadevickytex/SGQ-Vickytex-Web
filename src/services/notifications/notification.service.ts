/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Notification } from '../../types';
import { NotificationRepository } from '../database/repositories/notification.repository';

/**
 * Serviço de Notificações de Conformidade e Alertas de Auditoria
 */
export const notificationService = {
  /**
   * Envia uma notificação interna para colaboradores ou setores
   */
  async sendNotification(notification: Omit<Notification, 'id' | 'dataCriacao' | 'lida'>): Promise<Notification | null> {
    try {
      const res = await NotificationRepository.create({
        ...notification,
        dataCriacao: new Date().toISOString(),
        lida: false
      } as any);
      if (res.success && res.data) {
        return res.data;
      }
    } catch (err) {
      console.error('[Notification Service] Falha ao enviar notificação:', err);
    }
    return null;
  },

  /**
   * Obtém todas as notificações
   */
  async getNotifications(): Promise<Notification[]> {
    try {
      const res = await NotificationRepository.findAll();
      if (res.success && res.data) {
        return res.data;
      }
    } catch (err) {
      console.error('[Notification Service] Falha ao listar notificações:', err);
    }
    return [];
  },

  /**
   * Marca uma notificação como lida
   */
  async markAsRead(id: string): Promise<boolean> {
    try {
      const res = await NotificationRepository.update(id, { lida: true } as any);
      return res.success;
    } catch (err) {
      console.error('[Notification Service] Falha ao marcar notificação como lida:', err);
    }
    return false;
  }
};

export default notificationService;
