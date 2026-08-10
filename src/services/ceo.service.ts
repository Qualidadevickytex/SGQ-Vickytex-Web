/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ApiResponse } from './api.types';
import { ProjetoCEO, SugestaoCEO, CEOStats } from '../types/ceo';
import { UserProfile } from '../types/user';
import { CEOProjectsRepository, CEOSugestoesRepository, getDefaultFerramentas } from './database/repositories/ceo.repository';
import { NotificationRepository } from './database/repositories/notification.repository';
import { UserRepository } from './database/repositories/user.repository';
import { DocumentRepository } from './database/repositories/document.repository';
import { IndicatorRepository } from './database/repositories/indicator.repository';
import { AuditService } from './audit.service';
import { cacheService } from './cache.service';
import { ErrorHandler } from './errorHandler';

class CEOServiceClass {
  private moduleName = 'Centro de Excelência Operacional (CEO)';

  /**
   * Generates dashboard stats for the CEO module
   */
  async getCEOStats(): Promise<ApiResponse<CEOStats>> {
    const timestamp = new Date().toISOString();
    try {
      const cacheKey = 'ceo:stats';
      const stats = await cacheService.getOrSet(cacheKey, async () => {
        const [projectsRes, suggestionsRes] = await Promise.all([
          CEOProjectsRepository.findAll(),
          CEOSugestoesRepository.findAll()
        ]);

        const projects = projectsRes.success ? projectsRes.data : [];
        const suggestions = suggestionsRes.success ? suggestionsRes.data : [];

        const totalProjetos = projects.length;
        const projetosAtivos = projects.filter(p => p.status === 'Em Execução' || p.status === 'Planejado').length;
        const projetosConcluidos = projects.filter(p => p.status === 'Concluído').length;
        const investimentoTotal = projects.reduce((acc, p) => acc + p.investimento, 0);
        const retornoTotalReal = projects.reduce((acc, p) => acc + (p.retornoReal || 0), 0);

        const totalSugestoes = suggestions.length;
        const sugestoesAprovadas = suggestions.filter(s => s.status === 'Aprovada' || s.status === 'Em Implantação' || s.status === 'Concluída').length;
        const sugestoesPendentes = suggestions.filter(s => s.status === 'Submetida' || s.status === 'Em Análise').length;

        return {
          totalProjetos,
          projetosAtivos,
          projetosConcluidos,
          investimentoTotal,
          retornoTotalReal,
          totalSugestoes,
          sugestoesAprovadas,
          sugestoesPendentes
        };
      });

      return { success: true, data: stats, timestamp };
    } catch (error) {
      return {
        success: false,
        data: {
          totalProjetos: 0,
          projetosAtivos: 0,
          projetosConcluidos: 0,
          investimentoTotal: 0,
          retornoTotalReal: 0,
          totalSugestoes: 0,
          sugestoesAprovadas: 0,
          sugestoesPendentes: 0
        },
        error: ErrorHandler.handle(error),
        timestamp
      };
    }
  }

  /**
   * Retrieve all projects with automatic integration checking
   */
  async getProjects(): Promise<ApiResponse<ProjetoCEO[]>> {
    const timestamp = new Date().toISOString();
    try {
      const res = await CEOProjectsRepository.findAll();
      return res;
    } catch (error) {
      return { success: false, data: [], error: ErrorHandler.handle(error), timestamp };
    }
  }

  /**
   * Create a new CEO Project, logs action and triggers notifications
   */
  async createProject(projectData: Partial<ProjetoCEO>, user: UserProfile): Promise<ApiResponse<ProjetoCEO>> {
    const timestamp = new Date().toISOString();
    try {
      const met = projectData.metodologia || 'Projeto Personalizado';
      const res = await CEOProjectsRepository.create({
        ...projectData,
        ferramentas: projectData.ferramentas || getDefaultFerramentas(met),
        criadoPor: user.email,
        criadoEm: timestamp,
        atualizadoEm: timestamp
      });

      if (res.success) {
        cacheService.invalidate('ceo:stats');

        await AuditService.create(
          user,
          this.moduleName,
          res.data.codigo,
          `Criou o projeto de melhoria: "${res.data.titulo}" com metodologia ${res.data.metodologia}.`
        );

        if (res.data.lider) {
          await NotificationRepository.create({
            titulo: 'Novo Projeto CEO Atribuído',
            mensagem: `Você foi designado como líder do projeto de excelência operacional "${res.data.codigo} — ${res.data.titulo}".`,
            tipo: 'info',
            destinatarioEmail: res.data.lider,
            dataCriacao: timestamp,
            lida: false
          });
        }
      }

      return res;
    } catch (error) {
      return { success: false, data: {} as ProjetoCEO, error: ErrorHandler.handle(error), timestamp };
    }
  }

  /**
   * Update a project, logs changes and notifies on completion
   */
  async updateProject(id: string, projectData: Partial<ProjetoCEO>, user: UserProfile): Promise<ApiResponse<ProjetoCEO>> {
    const timestamp = new Date().toISOString();
    try {
      const oldProjectRes = await CEOProjectsRepository.findById(id);
      const oldProject = oldProjectRes.success ? oldProjectRes.data : null;

      const res = await CEOProjectsRepository.update(id, {
        ...projectData,
        atualizadoEm: timestamp
      });

      if (res.success) {
        cacheService.invalidate('ceo:stats');

        await AuditService.update(
          user,
          this.moduleName,
          res.data.codigo,
          `Atualizou dados do projeto: "${res.data.titulo}". Novo status: ${res.data.status}.`
        );

        if (oldProject && oldProject.status !== 'Concluído' && res.data.status === 'Concluído') {
          await NotificationRepository.create({
            titulo: 'Projeto CEO Concluído',
            mensagem: `O projeto "${res.data.codigo} — ${res.data.titulo}" foi marcado como concluído com sucesso.`,
            tipo: 'sucesso',
            destinatarioRole: 'Qualidade',
            dataCriacao: timestamp,
            lida: false
          });

          if (res.data.patrocinador && res.data.patrocinador.includes('@')) {
            await NotificationRepository.create({
              titulo: 'Projeto Concluído',
              mensagem: `O projeto do qual você é patrocinador "${res.data.codigo}" foi concluído pelo líder ${res.data.lider}.`,
              tipo: 'sucesso',
              destinatarioEmail: res.data.patrocinador,
              dataCriacao: timestamp,
              lida: false
            });
          }
        }
      }

      return res;
    } catch (error) {
      return { success: false, data: {} as ProjetoCEO, error: ErrorHandler.handle(error), timestamp };
    }
  }

  /**
   * Delete a project
   */
  async deleteProject(id: string, user: UserProfile): Promise<ApiResponse<boolean>> {
    const timestamp = new Date().toISOString();
    try {
      const projectRes = await CEOProjectsRepository.findById(id);
      const project = projectRes.success && projectRes.data ? projectRes.data : null;

      const res = await CEOProjectsRepository.delete(id);

      if (res.success) {
        cacheService.invalidate('ceo:stats');
        try {
          await AuditService.delete(
            user,
            this.moduleName,
            project?.codigo || id,
            `Excluiu o projeto de excelência operacional "${project?.titulo || id}".`
          );
        } catch (auditErr) {
          console.warn('Audit log failed during deleteProject:', auditErr);
        }
      }

      return res;
    } catch (error) {
      return { success: false, data: false, error: ErrorHandler.handle(error), timestamp };
    }
  }

  /**
   * Retrieve all ideas
   */
  async getSugestoes(): Promise<ApiResponse<SugestaoCEO[]>> {
    const timestamp = new Date().toISOString();
    try {
      const res = await CEOSugestoesRepository.findAll();
      return res;
    } catch (error) {
      return { success: false, data: [], error: ErrorHandler.handle(error), timestamp };
    }
  }

  /**
   * Submit a new improvement idea
   */
  async submitSugestao(ideaData: Partial<SugestaoCEO>, user: UserProfile): Promise<ApiResponse<SugestaoCEO>> {
    const timestamp = new Date().toISOString();
    try {
      const suggestionsRes = await CEOSugestoesRepository.findAll();
      const count = suggestionsRes.success ? suggestionsRes.data.length + 1 : 1;
      const formattedCode = `SUG-CEO-2026-${String(count).padStart(3, '0')}`;

      const res = await CEOSugestoesRepository.create({
        ...ideaData,
        codigo: formattedCode,
        autor: user.email,
        status: 'Submetida',
        dataSubmissao: timestamp.split('T')[0],
        criadoEm: timestamp
      });

      if (res.success) {
        cacheService.invalidate('ceo:stats');

        await AuditService.create(
          user,
          this.moduleName,
          res.data.codigo,
          `Submeteu uma nova ideia de melhoria: "${res.data.titulo}".`
        );

        await NotificationRepository.create({
          titulo: 'Nova Ideia de Melhoria Submetida',
          mensagem: `O colaborador ${user.name} submeteu a ideia "${res.data.codigo} — ${res.data.titulo}" para análise.`,
          tipo: 'info',
          destinatarioRole: 'Qualidade',
          dataCriacao: timestamp,
          lida: false
        });
      }

      return res;
    } catch (error) {
      return { success: false, data: {} as SugestaoCEO, error: ErrorHandler.handle(error), timestamp };
    }
  }

  /**
   * Evaluate (approve/reject/etc) an idea
   */
  async avaliarSugestao(
    id: string,
    status: 'Aprovada' | 'Em Análise' | 'Rejeitada' | 'Em Implantação' | 'Concluída',
    comentarios: string,
    user: UserProfile,
    notas?: { impacto: number; facilidade: number }
  ): Promise<ApiResponse<SugestaoCEO>> {
    const timestamp = new Date().toISOString();
    try {
      const ideaRes = await CEOSugestoesRepository.findById(id);
      const idea = ideaRes.success ? ideaRes.data : null;

      if (!idea) {
        throw new Error('Ideia não localizada no repositório.');
      }

      const res = await CEOSugestoesRepository.update(id, {
        status,
        avaliacaoComite: comentarios,
        notaImpacto: notas?.impacto ?? idea.notaImpacto,
        notaFacilidade: notas?.facilidade ?? idea.notaFacilidade
      });

      if (res.success) {
        cacheService.invalidate('ceo:stats');

        await AuditService.update(
          user,
          this.moduleName,
          res.data.codigo,
          `Avaliou a ideia de melhoria. Novo status: ${status}. Comentários: ${comentarios}`
        );

        await NotificationRepository.create({
          titulo: `Ideia de Melhoria ${status}`,
          mensagem: `Sua sugestão de melhoria "${res.data.codigo} — ${res.data.titulo}" foi avaliada como: "${status}".`,
          tipo: status === 'Aprovada' || status === 'Concluída' ? 'sucesso' : 'alerta',
          destinatarioEmail: res.data.autor,
          dataCriacao: timestamp,
          lida: false
        });
      }

      return res;
    } catch (error) {
      return { success: false, data: {} as SugestaoCEO, error: ErrorHandler.handle(error), timestamp };
    }
  }

  /**
   * Update a suggestion
   */
  async updateSugestao(
    id: string,
    updates: Partial<SugestaoCEO>,
    user: UserProfile
  ): Promise<ApiResponse<SugestaoCEO>> {
    const timestamp = new Date().toISOString();
    try {
      const res = await CEOSugestoesRepository.update(id, updates);
      if (res.success) {
        cacheService.invalidate('ceo:stats');
        await AuditService.update(
          user,
          this.moduleName,
          res.data.codigo || id,
          `Atualizou dados da sugestão de melhoria: "${res.data.titulo}".`
        );
      }
      return res;
    } catch (error) {
      return { success: false, data: {} as SugestaoCEO, error: ErrorHandler.handle(error), timestamp };
    }
  }

  /**
   * Delete a suggestion
   */
  async deleteSugestao(
    id: string,
    user: UserProfile
  ): Promise<ApiResponse<boolean>> {
    const timestamp = new Date().toISOString();
    try {
      const ideaRes = await CEOSugestoesRepository.findById(id);
      const ideaName = (ideaRes.success && ideaRes.data) ? ideaRes.data.titulo : id;

      const res = await CEOSugestoesRepository.delete(id);
      if (res.success) {
        cacheService.invalidate('ceo:stats');
        try {
          await AuditService.delete(
            user,
            this.moduleName,
            id,
            `Excluiu a sugestão de melhoria: "${ideaName}".`
          );
        } catch (auditErr) {
          console.warn('Audit log failed during deleteSugestao:', auditErr);
        }
      }
      return res;
    } catch (error) {
      return { success: false, data: false, error: ErrorHandler.handle(error), timestamp };
    }
  }

  async checkIntegrations(): Promise<ApiResponse<Record<string, boolean>>> {
    const timestamp = new Date().toISOString();
    try {
      const [users, notifications, documents, indicators] = await Promise.all([
        UserRepository.count(),
        NotificationRepository.count(),
        DocumentRepository.findAll(),
        IndicatorRepository.findAll()
      ]);

      const data = {
        database: true,
        userRepository: users.success,
        notificationRepository: notifications.success,
        documentRepository: documents.success,
        indicatorRepository: indicators.success,
        auditService: true,
        googleDrive: true,
        googleWorkspace: true
      };

      return { success: true, data, timestamp };
    } catch (error) {
      return { success: false, data: {}, error: ErrorHandler.handle(error), timestamp };
    }
  }
}

export const CEOService = new CEOServiceClass();
export default CEOService;
