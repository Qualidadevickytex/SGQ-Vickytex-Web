/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  ClipboardCheck, 
  Target, 
  Settings,
  Sparkles,
  Award
} from 'lucide-react';
import { Auditoria5S, SectorType, PlanoAcao } from '../types';
import { PersonalizacaoGeral } from '../utils/mockData';
import { useAuth } from '../contexts/AuthContext';

// Import our modular 5S Submodules
import { FiveSDashboard } from './fiveS/FiveSDashboard';
import { FiveSAudits } from './fiveS/FiveSAudits';
import { FiveSActionPlans } from './fiveS/FiveSActionPlans';
import { FiveSConfig } from './fiveS/FiveSConfig';

// Import Store accessors and seeding helpers
import { 
  seedMockDataIfEmpty, 
  getSetores, 
  getSensos, 
  getRequisitos, 
  getClassificacoes, 
  getConfiguracao, 
  getCiclos, 
  getItensAuditados, 
  getFotografias, 
  getPlanosAcao5S,
  setStoreData
} from '../utils/fiveSStore';

interface Auditorias5SProps {
  auditorias: Auditoria5S[];
  planos: PlanoAcao[];
  onUpdateAudits?: (audits: Auditoria5S[]) => void;
  onAddAudit: (audit: Auditoria5S) => void;
  onUpdateAudit: (audit: Auditoria5S) => void;
  onDeleteAudit: (id: string) => void;
  onAddLog: (action: string, details: string) => void;
  personalizacao?: PersonalizacaoGeral;
}

export const Auditorias5SComponent: React.FC<Auditorias5SProps> = ({
  auditorias,
  planos: parentPlanos,
  onUpdateAudits,
  onAddAudit,
  onUpdateAudit,
  onDeleteAudit,
  onAddLog,
  personalizacao
}) => {
  const { user } = useAuth();
  const canModify = user?.role === 'Qualidade' || user?.role === 'Gestor' || user?.role === 'Supervisor' || user?.role === 'Administrador';

  // State of current menu tab
  const [menu, setMenu] = useState<'indicadores' | 'auditorias' | 'planos' | 'configuracao'>('indicadores');

  // Load dynamic 5S normalized tables from localStorage
  const [setores, setSetores] = useState(() => getSetores());
  const [sensos, setSensos] = useState(() => getSensos());
  const [requisitos, setRequisitos] = useState(() => getRequisitos());
  const [classificacoes, setClassificacoes] = useState(() => getClassificacoes());
  const [config, setConfig] = useState(() => getConfiguracao());
  const [ciclos, setCiclos] = useState(() => getCiclos());
  const [itens, setItens] = useState(() => getItensAuditados());
  const [fotos, setFotos] = useState(() => getFotografias());
  const [planos5S, setPlanos5S] = useState(() => getPlanosAcao5S());

  // Seed default dataset if not present on first load
  useEffect(() => {
    seedMockDataIfEmpty(auditorias);
    // Reload state after potential seeding
    setSetores(getSetores());
    setSensos(getSensos());
    setRequisitos(getRequisitos());
    setClassificacoes(getClassificacoes());
    setConfig(getConfiguracao());
    setCiclos(getCiclos());
    setItens(getItensAuditados());
    setFotos(getFotografias());
    setPlanos5S(getPlanosAcao5S());
  }, [auditorias]);

  // Wrappers to update and persist collections locally & trigger sync
  const handleUpdateSetores = (data: typeof setores) => {
    setSetores(data);
    setStoreData('sgq_5s_setores', data);
  };

  const handleUpdateRequisitos = (data: typeof requisitos) => {
    setRequisitos(data);
    setStoreData('sgq_5s_requisitos', data);
  };

  const handleUpdateClassificacoes = (data: typeof classificacoes) => {
    setClassificacoes(data);
    setStoreData('sgq_5s_classificacoes', data);
  };

  const handleUpdateConfig = (data: typeof config) => {
    setConfig(data);
    setStoreData('sgq_5s_configuracao', data);
  };

  const handleUpdateCiclos = (data: typeof ciclos) => {
    setCiclos(data);
    setStoreData('sgq_5s_ciclos', data);
  };

  const handleUpdateItens = (data: typeof itens) => {
    setItens(data);
    setStoreData('sgq_5s_itens', data);
  };

  const handleUpdateFotos = (data: typeof fotos) => {
    setFotos(data);
    setStoreData('sgq_5s_fotos', data);
  };

  const handleUpdatePlanos = (data: typeof planos5S) => {
    setPlanos5S(data);
    setStoreData('sgq_5s_planos', data);
  };

  // Synchronize new audits with the parent React App state
  const handleUpdateAuditsParent = (updatedAudits: Auditoria5S[]) => {
    // Filter duplicates by ID
    const seen = new Set<string>();
    const uniqueAudits = updatedAudits.filter(a => {
      if (!a || !a.id || seen.has(a.id)) return false;
      seen.add(a.id);
      return true;
    });

    // 1. Handle deleted audits first
    auditorias.forEach(oldAudit => {
      const stillExists = uniqueAudits.some(a => a.id === oldAudit.id);
      if (!stillExists) {
        onDeleteAudit(oldAudit.id);
      }
    });

    // 2. Handle added or edited audits
    uniqueAudits.forEach(newAudit => {
      const oldAudit = auditorias.find(a => a.id === newAudit.id);
      if (!oldAudit) {
        onAddAudit(newAudit);
      } else {
        // Only trigger update if something actually changed
        const hasChanged = JSON.stringify(oldAudit) !== JSON.stringify(newAudit);
        if (hasChanged) {
          onUpdateAudit(newAudit);
        }
      }
    });

    // 3. Update parent audits state if provided
    if (onUpdateAudits) {
      onUpdateAudits(uniqueAudits);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* 5S MODULE HEADER */}
      <div className="bg-gradient-to-r from-[#0B3A63] to-[#1D5E91] text-white p-6 rounded-xl shadow-xs relative overflow-hidden">
        <div className="absolute right-0 bottom-0 translate-y-4 translate-x-4 opacity-10">
          <Award className="w-64 h-64" />
        </div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <span className="text-[10px] uppercase font-black tracking-widest text-amber-400">QUALIDADE ASSEGURADA</span>
            </div>
            <h1 className="text-2xl font-black tracking-tight">
              {personalizacao?.auditorias5sTitulo || 'Programa 5S Corporativo'}
            </h1>
            <p className="text-xs text-slate-200">
              {personalizacao?.auditorias5sSubtitulo || 'Sistema de auditoria contínua dos sensos de Utilização, Organização, Limpeza, Padronização e Autodisciplina.'}
            </p>
          </div>
        </div>
      </div>

      {/* DUAL COLUMN SIDEBAR GRID */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        
        {/* Navigation Sidebar */}
        <div className="col-span-12 md:col-span-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-2">
          <span className="text-[9px] uppercase font-bold text-slate-400 px-3 tracking-wider block mb-1">Menu do Módulo</span>
          
          {[
            { id: 'indicadores', label: 'Indicadores & Painel', icon: BarChart3 },
            { id: 'auditorias', label: 'Auditorias', icon: ClipboardCheck },
            { id: 'planos', label: 'Planos de Ação', icon: Target },
            { id: 'configuracao', label: 'Cadastro & Parâmetros', icon: Settings },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = menu === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setMenu(tab.id as any)}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-xs font-bold transition-all text-left ${
                  isActive 
                    ? 'bg-[#0B3A63] text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-850 hover:text-slate-800'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Dynamic Right Column Content */}
        <div className="col-span-12 md:col-span-9">
          {menu === 'indicadores' && (
            <FiveSDashboard
              auditorias={auditorias}
              setores={setores}
              sensos={sensos}
              requisitos={requisitos}
              classificacoes={classificacoes}
              config={config}
              itens={itens}
              personalizacao={personalizacao}
            />
          )}

          {menu === 'auditorias' && (
            <FiveSAudits
              auditorias={auditorias}
              setores={setores}
              sensos={sensos}
              requisitos={requisitos}
              classificacoes={classificacoes}
              config={config}
              ciclos={ciclos}
              itens={itens}
              fotos={fotos}
              planos={planos5S}
              onUpdateAudits={handleUpdateAuditsParent}
              onUpdateItens={handleUpdateItens}
              onUpdateFotos={handleUpdateFotos}
              onUpdatePlanos={handleUpdatePlanos}
              onAddLog={onAddLog}
              canModify={canModify}
              currentUserEmail={user?.email}
              currentUserName={user?.name}
            />
          )}

          {menu === 'planos' && (
            <FiveSActionPlans
              planos={planos5S}
              itens={itens}
              auditorias={auditorias}
              setores={setores}
              requisitos={requisitos}
              onUpdatePlanos={handleUpdatePlanos}
              onAddLog={onAddLog}
              canModify={canModify}
              currentUserName={user?.name}
            />
          )}

          {menu === 'configuracao' && (
            <FiveSConfig
              setores={setores}
              sensos={sensos}
              requisitos={requisitos}
              classificacoes={classificacoes}
              config={config}
              ciclos={ciclos}
              onUpdateSetores={handleUpdateSetores}
              onUpdateRequisitos={handleUpdateRequisitos}
              onUpdateClassificacoes={handleUpdateClassificacoes}
              onUpdateConfig={handleUpdateConfig}
              onUpdateCiclos={handleUpdateCiclos}
              canModify={canModify}
            />
          )}
        </div>
      </div>
    </div>
  );
};
