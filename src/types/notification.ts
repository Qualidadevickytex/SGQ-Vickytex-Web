/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { UserRole } from './role';

export interface Notification {
  id: string;
  titulo: string;
  mensagem: string;
  dataCriacao: string;
  lida: boolean;
  tipo: 'alerta' | 'sucesso' | 'info' | 'erro';
  destinatarioEmail?: string;
  destinatarioRole?: UserRole;
  linkRelacionado?: string;
}
