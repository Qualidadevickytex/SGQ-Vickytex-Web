/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ProjetoCEO, SugestaoCEO, CEOStats } from '../types/ceo';
import { CEOService } from '../services/ceo.service';
import { cacheService } from '../services/cache.service';
import { useAuth } from './AuthContext'; // Import hook to get active user

interface CEOContextType {
  projects: ProjetoCEO[];
  suggestions: SugestaoCEO[];
  stats: CEOStats | null;
  loading: boolean;
  error: string | null;
  integrationsStatus: Record<string, boolean> | null;
  loadCEOData: () => Promise<void>;
  createProject: (projectData: Partial<ProjetoCEO>) => Promise<boolean>;
  updateProject: (id: string, projectData: Partial<ProjetoCEO>) => Promise<boolean>;
  deleteProject: (id: string) => Promise<boolean>;
  submitSugestao: (ideaData: Partial<SugestaoCEO>) => Promise<boolean>;
  updateSugestao: (id: string, updates: Partial<SugestaoCEO>) => Promise<boolean>;
  deleteSugestao: (id: string) => Promise<boolean>;
  avaliarSugestao: (
    id: string,
    status: 'Aprovada' | 'Em Análise' | 'Rejeitada' | 'Em Implantação' | 'Concluída',
    comentarios: string,
    notas?: { impacto: number; facilidade: number }
  ) => Promise<boolean>;
  checkIntegrations: () => Promise<void>;
}

const CEOContext = createContext<CEOContextType | undefined>(undefined);

export const CEOProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth(); // Active logged-in user

  const [projects, setProjects] = useState<ProjetoCEO[]>([]);
  const [suggestions, setSuggestions] = useState<SugestaoCEO[]>([]);
  const [stats, setStats] = useState<CEOStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [integrationsStatus, setIntegrationsStatus] = useState<Record<string, boolean> | null>(null);

  /**
   * Main data loading function for the module
   */
  const loadCEOData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [projectsRes, suggestionsRes, statsRes] = await Promise.all([
        CEOService.getProjects(),
        CEOService.getSugestoes(),
        CEOService.getCEOStats()
      ]);

      if (projectsRes.success) setProjects(projectsRes.data);
      if (suggestionsRes.success) setSuggestions(suggestionsRes.data);
      if (statsRes.success) setStats(statsRes.data);

      if (!projectsRes.success || !suggestionsRes.success || !statsRes.success) {
        const errMsg = projectsRes.error?.message || suggestionsRes.error?.message || statsRes.error?.message || 'Erro ao carregar dados do CEO.';
        setError(errMsg);
      }
    } catch (err: any) {
      setError(err?.message || 'Falha inesperada de comunicação de rede.');
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Triggers background integration checks
   */
  const checkIntegrations = useCallback(async () => {
    try {
      const res = await CEOService.checkIntegrations();
      if (res.success) {
        setIntegrationsStatus(res.data);
      }
    } catch (e) {
      console.error('[CEOContext] Failed to check integration modules:', e);
    }
  }, []);

  // Trigger loading when user profile mounts/changes
  useEffect(() => {
    if (!user) return;
    loadCEOData();
    checkIntegrations();
  }, [loadCEOData, checkIntegrations, user]);

  /**
   * Action: Create project
   */
  const createProject = async (projectData: Partial<ProjetoCEO>): Promise<boolean> => {
    if (!user) return false;
    setLoading(true);
    try {
      const res = await CEOService.createProject(projectData, user);
      if (res.success) {
        await loadCEOData();
        return true;
      }
      setError(res.error?.message || 'Erro ao criar projeto.');
      return false;
    } catch (err: any) {
      setError(err?.message || 'Falha ao processar requisição.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Action: Update project
   */
  const updateProject = async (id: string, projectData: Partial<ProjetoCEO>): Promise<boolean> => {
    if (!user) return false;
    setLoading(true);
    try {
      const res = await CEOService.updateProject(id, projectData, user);
      if (res.success) {
        await loadCEOData();
        return true;
      }
      setError(res.error?.message || 'Erro ao atualizar projeto.');
      return false;
    } catch (err: any) {
      setError(err?.message || 'Falha ao processar requisição.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Action: Delete project
   */
  const deleteProject = async (id: string): Promise<boolean> => {
    if (!user) return false;
    setLoading(true);
    try {
      const res = await CEOService.deleteProject(id, user);
      if (res.success) {
        setProjects(prev => prev.filter(p => p.id !== id));
        cacheService.invalidate('ceo:stats');
        cacheService.invalidate('ceo_projects:all');
        cacheService.invalidate(`ceo_projects:${id}`);
        await loadCEOData();
        return true;
      }
      setError(res.error?.message || 'Erro ao excluir projeto.');
      return false;
    } catch (err: any) {
      setError(err?.message || 'Falha ao processar requisição.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Action: Submit a suggestion
   */
  const submitSugestao = async (ideaData: Partial<SugestaoCEO>): Promise<boolean> => {
    if (!user) return false;
    setLoading(true);
    try {
      const res = await CEOService.submitSugestao(ideaData, user);
      if (res.success) {
        await loadCEOData();
        return true;
      }
      setError(res.error?.message || 'Erro ao submeter sugestão.');
      return false;
    } catch (err: any) {
      setError(err?.message || 'Falha ao processar requisição.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Action: Update a suggestion
   */
  const updateSugestao = async (id: string, updates: Partial<SugestaoCEO>): Promise<boolean> => {
    if (!user) return false;
    setLoading(true);
    try {
      const res = await CEOService.updateSugestao(id, updates, user);
      if (res.success) {
        await loadCEOData();
        return true;
      }
      setError(res.error?.message || 'Erro ao atualizar sugestão.');
      return false;
    } catch (err: any) {
      setError(err?.message || 'Falha ao processar requisição.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Action: Delete a suggestion
   */
  const deleteSugestao = async (id: string): Promise<boolean> => {
    if (!user) return false;
    setLoading(true);
    try {
      const res = await CEOService.deleteSugestao(id, user);
      if (res.success) {
        setSuggestions(prev => prev.filter(s => s.id !== id));
        cacheService.invalidate('ceo:stats');
        cacheService.invalidate('ceo_ideas:all');
        cacheService.invalidate(`ceo_ideas:${id}`);
        await loadCEOData();
        return true;
      }
      setError(res.error?.message || 'Erro ao excluir sugestão.');
      return false;
    } catch (err: any) {
      setError(err?.message || 'Falha ao processar requisição.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Action: Evaluate a suggestion
   */
  const avaliarSugestao = async (
    id: string,
    status: 'Aprovada' | 'Em Análise' | 'Rejeitada' | 'Em Implantação' | 'Concluída',
    comentarios: string,
    notas?: { impacto: number; facilidade: number }
  ): Promise<boolean> => {
    if (!user) return false;
    setLoading(true);
    try {
      const res = await CEOService.avaliarSugestao(id, status, comentarios, user, notas);
      if (res.success) {
        await loadCEOData();
        return true;
      }
      setError(res.error?.message || 'Erro ao avaliar sugestão.');
      return false;
    } catch (err: any) {
      setError(err?.message || 'Falha ao processar requisição.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return (
    <CEOContext.Provider
      value={{
        projects,
        suggestions,
        stats,
        loading,
        error,
        integrationsStatus,
        loadCEOData,
        createProject,
        updateProject,
        deleteProject,
        submitSugestao,
        updateSugestao,
        deleteSugestao,
        avaliarSugestao,
        checkIntegrations
      }}
    >
      {children}
    </CEOContext.Provider>
  );
};

export const useCEO = () => {
  const context = useContext(CEOContext);
  if (!context) {
    throw new Error('useCEO must be used within a CEOProvider');
  }
  return context;
};
export default CEOContext;
