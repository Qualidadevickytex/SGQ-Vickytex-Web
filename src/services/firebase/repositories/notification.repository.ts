/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Notification } from '../../../types/notification';
import { BaseRepository } from './base.repository';

const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: 'notif-1',
    titulo: 'Nova Auditoria Agendada',
    mensagem: 'Uma nova auditoria interna do SGQ foi agendada para o setor de Tecelagem.',
    dataCriacao: new Date().toISOString(),
    lida: false,
    tipo: 'info',
    destinatarioRole: 'Qualidade'
  },
  {
    id: 'notif-2',
    titulo: 'Prazo Limite Próximo',
    mensagem: 'O plano de ação do desvio PLA-2026-04 expira em 2 dias.',
    dataCriacao: new Date().toISOString(),
    lida: false,
    tipo: 'alerta',
    destinatarioEmail: 'qualidade@vickytex.com.br'
  }
];

class NotificationRepositoryClass extends BaseRepository<Notification> {
  protected collectionName = 'notifications';

  protected getLocalData(): Notification[] {
    const saved = localStorage.getItem('sgq_vickytex_notifications');
    if (saved) return JSON.parse(saved);
    localStorage.setItem('sgq_vickytex_notifications', JSON.stringify(INITIAL_NOTIFICATIONS));
    return INITIAL_NOTIFICATIONS;
  }

  protected saveLocalData(data: Notification[]): void {
    localStorage.setItem('sgq_vickytex_notifications', JSON.stringify(data));
  }

  protected mapRecord(rec: any): Notification {
    return {
      id: rec.id,
      titulo: rec.titulo,
      mensagem: rec.mensagem,
      dataCriacao: rec.data_criacao || rec.dataCriacao || rec.createdAt || rec.created,
      lida: rec.lida ?? false,
      tipo: rec.tipo || 'info',
      destinatarioEmail: rec.destinatario_email || rec.destinatarioEmail,
      destinatarioRole: rec.destinatario_role || rec.destinatarioRole,
      linkRelacionado: rec.link_relacionado || rec.linkRelacionado
    };
  }

  protected mapToPayload(data: Partial<Notification>): any {
    return {
      titulo: data.titulo,
      mensagem: data.mensagem,
      data_criacao: data.dataCriacao || new Date().toISOString(),
      lida: data.lida ?? false,
      tipo: data.tipo || 'info',
      destinatario_email: data.destinatarioEmail,
      destinatario_role: data.destinatarioRole,
      link_relacionado: data.linkRelacionado
    };
  }

  protected getSearchFilter(query: string): string {
    return `titulo ~ "${query}" || mensagem ~ "${query}"`;
  }

  protected localSearchMatch(item: Notification, query: string): boolean {
    return (
      item.titulo.toLowerCase().includes(query) ||
      item.mensagem.toLowerCase().includes(query)
    );
  }
}

export const NotificationRepository = new NotificationRepositoryClass();
export default NotificationRepository;
