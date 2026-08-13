/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Search, FileText, CheckSquare, AlertTriangle, Cpu, GraduationCap, X, ChevronRight } from 'lucide-react';
import { Documento, Auditoria, NaoConformidade, Equipamento, Treinamento } from '../types';
import { INITIAL_DOCUMENTS, INITIAL_AUDITORIAS, INITIAL_NAO_CONFORMIDADES } from '../utils/mockData';
import { DocumentRepository } from '../services/database/repositories/document.repository';
import { AuditRepository } from '../services/database/repositories/audit.repository';
import { NCRepository } from '../services/database/repositories/nc.repository';
import { EquipmentRepository } from '../services/database/repositories/equipment.repository';
import { TrainingRepository } from '../services/database/repositories/training.repository';
import { SystemSettingsRepository } from '../services/database/repositories/systemSettings.repository';

interface SearchGlobalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectDocument: (docId: string) => void;
}

export const SearchGlobal: React.FC<SearchGlobalProps> = ({ isOpen, onClose, onSelectDocument }) => {
  const [query, setQuery] = useState('');
  const [liveDocs, setLiveDocs] = useState<Documento[]>(INITIAL_DOCUMENTS);
  const [liveAudits, setLiveAudits] = useState<Auditoria[]>(INITIAL_AUDITORIAS);
  const [liveNCs, setLiveNCs] = useState<NaoConformidade[]>(INITIAL_NAO_CONFORMIDADES);
  const [liveEquips, setLiveEquips] = useState<Equipamento[]>([]);
  const [liveTrainings, setLiveTrainings] = useState<Treinamento[]>([]);

  const [docResults, setDocResults] = useState<Documento[]>([]);
  const [auditResults, setAuditResults] = useState<Auditoria[]>([]);
  const [ncResults, setNcResults] = useState<NaoConformidade[]>([]);
  const [otherResults, setOtherResults] = useState<{ id: string; titulo: string; tipo: string; setor: string }[]>([]);

  const [personalizacao, setPersonalizacao] = useState(() => {
    const saved = localStorage.getItem('sgq_vickytex_personalizacao');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return null;
  });

  // Assinaturas em tempo real via Firestore
  useEffect(() => {
    const unsubDocs = DocumentRepository.subscribe((items) => {
      if (Array.isArray(items) && items.length > 0) setLiveDocs(items);
    });
    const unsubAudits = AuditRepository.subscribe((items) => {
      if (Array.isArray(items) && items.length > 0) setLiveAudits(items);
    });
    const unsubNCs = NCRepository.subscribe((items) => {
      if (Array.isArray(items) && items.length > 0) setLiveNCs(items);
    });
    const unsubEquips = EquipmentRepository.subscribe((items) => {
      if (Array.isArray(items)) setLiveEquips(items);
    });
    const unsubTrainings = TrainingRepository.subscribe((items) => {
      if (Array.isArray(items)) setLiveTrainings(items);
    });
    const unsubSettings = SystemSettingsRepository.subscribe((records) => {
      const pDoc = records.find(r => r.id === 'sgq_vickytex_personalizacao');
      if (pDoc && pDoc.data) {
        setPersonalizacao(pDoc.data);
      }
    });

    return () => {
      unsubDocs();
      unsubAudits();
      unsubNCs();
      unsubEquips();
      unsubTrainings();
      unsubSettings();
    };
  }, []);

  // Filtragem Reativa de Dados
  useEffect(() => {
    if (!query.trim()) {
      setDocResults([]);
      setAuditResults([]);
      setNcResults([]);
      setOtherResults([]);
      return;
    }

    const lower = query.toLowerCase();

    // 1. Filtrar Documentos
    const docs = liveDocs.filter(
      (d) =>
        (d.codigo || '').toLowerCase().includes(lower) ||
        (d.titulo || '').toLowerCase().includes(lower) ||
        (d.objetivo || '').toLowerCase().includes(lower) ||
        (d.setor || '').toLowerCase().includes(lower) ||
        (d.tipo || '').toLowerCase().includes(lower)
    );
    setDocResults(docs);

    // 2. Filtrar Auditorias
    const audits = liveAudits.filter(
      (a) =>
        (a.codigo || '').toLowerCase().includes(lower) ||
        (a.titulo || '').toLowerCase().includes(lower) ||
        (a.auditor || '').toLowerCase().includes(lower) ||
        (a.setor || '').toLowerCase().includes(lower)
    );
    setAuditResults(audits);

    // 3. Filtrar Não Conformidades
    const ncs = liveNCs.filter(
      (n) =>
        (n.codigo || '').toLowerCase().includes(lower) ||
        (n.titulo || '').toLowerCase().includes(lower) ||
        (n.descricao || '').toLowerCase().includes(lower) ||
        (n.setor || '').toLowerCase().includes(lower)
    );
    setNcResults(ncs);

    // 4. Outros (Equipamentos e Treinamentos)
    const others = [
      ...liveEquips.filter(
        (e) => (e.tag || '').toLowerCase().includes(lower) || (e.nome || '').toLowerCase().includes(lower) || (e.setor || '').toLowerCase().includes(lower)
      ).map(e => ({ id: e.tag || e.id, titulo: e.nome, tipo: 'Equipamento', setor: e.setor })),
      ...liveTrainings.filter(
        (t) => (t.codigo || '').toLowerCase().includes(lower) || (t.titulo || '').toLowerCase().includes(lower) || (t.setor || '').toLowerCase().includes(lower)
      ).map(t => ({ id: t.codigo || t.id, titulo: t.titulo, tipo: 'Treinamento', setor: t.setor }))
    ];
    setOtherResults(others);
  }, [query, liveDocs, liveAudits, liveNCs, liveEquips, liveTrainings]);

  // Fechar com tecla ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div id="search-modal-container" className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] px-4">
      {/* Backdrop */}
      <div id="search-backdrop" className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={onClose} />

      {/* Modal Container */}
      <div id="search-content" className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[75vh]">
        
        {/* Input Bar */}
        <div id="search-input-bar" className="flex items-center px-4 border-b border-slate-200 dark:border-slate-800">
          <Search className="w-5 h-5 text-slate-400 mr-3 shrink-0" />
          <input
            id="search-input"
            type="text"
            placeholder="Pesquisa inteligente (POP, FOR, Auditorias, Equipamentos...)"
            className="w-full py-4 text-base text-slate-900 dark:text-slate-100 placeholder-slate-400 bg-transparent border-0 focus:outline-hidden"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
          {query && (
            <button
              id="search-clear-btn"
              onClick={() => setQuery('')}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <span id="search-esc-hint" className="hidden sm:inline-block ml-3 px-1.5 py-0.5 text-[10px] font-medium text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 font-mono">
            ESC
          </span>
        </div>

        {/* Results Body */}
        <div id="search-results-body" className="overflow-y-auto p-4 flex-1">
          {!query.trim() ? (
            <div id="search-empty-state" className="py-12 text-center">
              <div className="w-12 h-12 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center mx-auto mb-3">
                <Search className="w-6 h-6 text-slate-400" />
              </div>
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                O que você está procurando?
              </h3>
              <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                Pesquise por códigos (ex: <code className="font-mono text-blue-500">POP-COR</code>), títulos, setores (ex: <code className="font-mono text-blue-500">Costura</code>) ou tipos de documentos.
              </p>
            </div>
          ) : docResults.length === 0 && auditResults.length === 0 && ncResults.length === 0 && otherResults.length === 0 ? (
            <div id="search-no-results" className="py-12 text-center">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Nenhum resultado encontrado para "{query}"
              </p>
            </div>
          ) : (
            <div id="search-results-list" className="space-y-6">
              
              {/* Documentos */}
              {docResults.length > 0 && (
                <div>
                  <h4 className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2 font-mono flex items-center px-2">
                    <FileText className="w-3.5 h-3.5 mr-1 text-blue-500" />
                    Documentos ({docResults.length})
                  </h4>
                  <div className="space-y-1">
                    {docResults.map((doc) => (
                      <button
                        key={doc.id}
                        id={`search-doc-item-${doc.id}`}
                        onClick={() => {
                          onSelectDocument(doc.id);
                          onClose();
                        }}
                        className="w-full text-left p-2.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-between transition-colors group"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-mono text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950 px-1.5 py-0.5 rounded">
                              {doc.codigo}
                            </span>
                            <span className="text-xs text-slate-400 dark:text-slate-500">
                              Rev {doc.revisao.toString().padStart(2, '0')} • {doc.setor}
                            </span>
                          </div>
                          <p className="text-sm font-medium text-slate-800 dark:text-slate-200 mt-1 truncate">
                            {doc.titulo}
                          </p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 shrink-0 ml-3 transition-colors" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Auditorias */}
              {auditResults.length > 0 && (
                <div>
                  <h4 className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2 font-mono flex items-center px-2">
                    <CheckSquare className="w-3.5 h-3.5 mr-1 text-emerald-500" />
                    Auditorias ({auditResults.length})
                  </h4>
                  <div className="space-y-1">
                    {auditResults.map((aud) => (
                      <div
                        key={aud.id}
                        id={`search-audit-item-${aud.id}`}
                        className="p-2.5 rounded-lg bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between"
                      >
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-mono text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-1.5 py-0.5 rounded">
                              {aud.codigo}
                            </span>
                            <span className="text-xs text-slate-400 dark:text-slate-500">
                              {aud.setor} • {aud.status}
                            </span>
                          </div>
                          <p className="text-sm font-medium text-slate-800 dark:text-slate-200 mt-1">
                            {aud.titulo}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Não Conformidades */}
              {ncResults.length > 0 && (
                <div>
                  <h4 className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2 font-mono flex items-center px-2">
                    <AlertTriangle className="w-3.5 h-3.5 mr-1 text-amber-500" />
                    Não Conformidades ({ncResults.length})
                  </h4>
                  <div className="space-y-1">
                    {ncResults.map((nc) => (
                      <div
                        key={nc.id}
                        id={`search-nc-item-${nc.id}`}
                        className="p-2.5 rounded-lg bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between"
                      >
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-mono text-xs font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950 px-1.5 py-0.5 rounded">
                              {nc.codigo}
                            </span>
                            <span className="text-xs text-slate-400 dark:text-slate-500">
                              {nc.setor} • {nc.status}
                            </span>
                          </div>
                          <p className="text-sm font-medium text-slate-800 dark:text-slate-200 mt-1">
                            {nc.titulo}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Outros (Equipamentos e Treinamentos) */}
              {otherResults.length > 0 && (
                <div>
                  <h4 className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2 font-mono flex items-center px-2">
                    <Cpu className="w-3.5 h-3.5 mr-1 text-purple-500" />
                    Equipamentos e Treinamentos ({otherResults.length})
                  </h4>
                  <div className="space-y-1">
                    {otherResults.map((item) => (
                      <div
                        key={item.id}
                        id={`search-other-item-${item.id}`}
                        className="p-2.5 rounded-lg bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between"
                      >
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-mono text-xs font-semibold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950 px-1.5 py-0.5 rounded">
                              {item.id}
                            </span>
                            <span className="text-xs text-slate-400 dark:text-slate-500">
                              {item.tipo} • {item.setor}
                            </span>
                          </div>
                          <p className="text-sm font-medium text-slate-800 dark:text-slate-200 mt-1">
                            {item.titulo}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}
        </div>

        {/* Footer */}
        <div id="search-modal-footer" className="px-4 py-3 bg-slate-50 dark:bg-slate-950/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500">
          <div className="flex items-center space-x-4">
            <span><strong className="font-mono text-slate-500">↑↓</strong> para navegar</span>
            <span><strong className="font-mono text-slate-500">Enter</strong> para abrir</span>
          </div>
          <span>{personalizacao?.versaoSistema || 'SGQ WEB v1.0.0'}</span>
        </div>

      </div>
    </div>
  );
};
