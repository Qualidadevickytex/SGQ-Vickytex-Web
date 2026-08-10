/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { DocumentRepository } from '../firebase/repositories/document.repository';
import { AuditRepository } from '../firebase/repositories/audit.repository';

export interface DashboardMetrics {
  totalDocuments: number;
  activeAudits: number;
  openNonConformities: number;
  actionPlansConcluded: number;
}

/**
 * Serviço do Painel Principal (Métricas Globais e Monitoramento em Tempo Real)
 */
export const dashboardService = {
  /**
   * Obtém estatísticas consolidadas dos setores da Vickytex para exibição rápida
   */
  async getMetrics(): Promise<DashboardMetrics> {
    try {
      const [docsRes, auditsRes] = await Promise.all([
        DocumentRepository.findAll(),
        AuditRepository.findAll()
      ]);

      const totalDocuments = docsRes.success && Array.isArray(docsRes.data) ? docsRes.data.length : 0;
      const activeAudits = auditsRes.success && Array.isArray(auditsRes.data) 
        ? auditsRes.data.filter(a => a.status === 'Agendada').length 
        : 0;

      return {
        totalDocuments,
        activeAudits,
        openNonConformities: 0,
        actionPlansConcluded: 0
      };
    } catch (e) {
      return {
        totalDocuments: 0,
        activeAudits: 0,
        openNonConformities: 0,
        actionPlansConcluded: 0
      };
    }
  }
};

export default dashboardService;
