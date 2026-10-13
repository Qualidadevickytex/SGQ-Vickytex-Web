/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  X, 
  CheckSquare, 
  Calendar, 
  User, 
  Layers, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle,
  FileCheck
} from 'lucide-react';
import { Fornecedor, AuditoriaFornecedor } from '../../types/supplier';

interface FornecedorModalAuditoriaProps {
  fornecedor: Fornecedor;
  onClose: () => void;
  onSaveAuditoria: (auditoria: AuditoriaFornecedor) => void;
}

export const FornecedorModalAuditoria: React.FC<FornecedorModalAuditoriaProps> = ({
  fornecedor,
  onClose,
  onSaveAuditoria
}) => {
  const [codigo, setCodigo] = useState(`AUD-FORN-${new Date().getFullYear()}-${Math.floor(10 + Math.random() * 90)}`);
  const [dataPlanejada, setDataPlanejada] = useState(new Date().toISOString().split('T')[0]);
  const [dataRealizada, setDataRealizada] = useState(new Date().toISOString().split('T')[0]);
  const [auditor, setAuditor] = useState('Auditor da Qualidade Vickytex');
  const [tipoAuditoria, setTipoAuditoria] = useState<AuditoriaFornecedor['tipoAuditoria']>('Presencial (Fábrica)');
  const [escopo, setEscopo] = useState(
    'Boas Práticas de Fabricação Têxtil, Controle de Processo, Rastreabilidade de Lote e Segurança do Trabalho.'
  );
  const [notaChecklist, setNotaChecklist] = useState<number>(90);
  const [qtdNaoConformidades, setQtdNaoConformidades] = useState<number>(0);
  const [observacoes, setObservacoes] = useState('');

  let resultado: AuditoriaFornecedor['resultado'] = 'Aprovado';
  if (notaChecklist < 70 || qtdNaoConformidades >= 3) {
    resultado = 'Reprovado';
  } else if (notaChecklist < 85 || qtdNaoConformidades > 0) {
    resultado = 'Aprovado com Ressalvas';
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const novaAuditoria: AuditoriaFornecedor = {
      id: `aud-${Date.now()}`,
      codigo: codigo.trim(),
      dataPlanejada,
      dataRealizada: dataRealizada || undefined,
      auditor: auditor.trim(),
      tipoAuditoria,
      escopo: escopo.trim(),
      notaChecklist: Number(notaChecklist),
      resultado,
      qtdNaoConformidades: Number(qtdNaoConformidades),
      observacoes: observacoes.trim() || undefined
    };

    onSaveAuditoria(novaAuditoria);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-xl w-full border border-slate-200 dark:border-slate-800 overflow-hidden my-8 animate-fade-in">
        
        {/* Header */}
        <div className="bg-linear-to-r from-indigo-700 to-purple-800 text-white p-5 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/10 rounded-xl backdrop-blur-xs">
              <CheckSquare className="w-5 h-5 text-indigo-200" />
            </div>
            <div>
              <h3 className="font-extrabold text-base tracking-tight">Auditoria de Fornecedor (2ª Parte - ISO 8.4)</h3>
              <p className="text-xs text-indigo-100 mt-0.5">
                {fornecedor.nomeFantasia || fornecedor.razaoSocial}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">Código Auditoria *</label>
              <input 
                type="text" 
                required
                value={codigo}
                onChange={e => setCodigo(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-mono focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">Tipo de Auditoria *</label>
              <select 
                value={tipoAuditoria}
                onChange={e => setTipoAuditoria(e.target.value as any)}
                className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
              >
                <option value="Presencial (Fábrica)">Presencial (In Loco na Fábrica)</option>
                <option value="Remota / Documental">Remota / Documental</option>
                <option value="Homologação Inicial">Homologação Inicial</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">Data Realizada *</label>
              <input 
                type="date" 
                required
                value={dataRealizada}
                onChange={e => setDataRealizada(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-mono"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">Auditor Líder</label>
              <input 
                type="text" 
                value={auditor}
                onChange={e => setAuditor(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">Escopo Auditado</label>
            <input 
              type="text" 
              value={escopo}
              onChange={e => setEscopo(e.target.value)}
              className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-150 dark:border-slate-800">
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Nota Checklist (%)</label>
                <span className="font-mono font-bold text-xs">{notaChecklist}%</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={notaChecklist}
                onChange={e => setNotaChecklist(Number(e.target.value))}
                className="w-full accent-indigo-600"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                Qtd Não Conformidades Identificadas
              </label>
              <input 
                type="number" 
                min="0"
                value={qtdNaoConformidades}
                onChange={e => setQtdNaoConformidades(Number(e.target.value))}
                className="w-full text-xs px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg font-mono"
              />
            </div>
          </div>

          <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 rounded-xl border border-indigo-150 dark:border-indigo-900/60 flex items-center justify-between">
            <span className="text-xs text-indigo-900 dark:text-indigo-200 font-semibold">Resultado da Auditoria:</span>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
              resultado === 'Aprovado' ? 'bg-emerald-100 text-emerald-800' :
              resultado === 'Aprovado com Ressalvas' ? 'bg-amber-100 text-amber-800' :
              'bg-rose-100 text-rose-800'
            }`}>
              {resultado}
            </span>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">Conclusão / Observações</label>
            <textarea 
              rows={2}
              placeholder="Descreva as constatações gerais da auditoria na fábrica..."
              value={observacoes}
              onChange={e => setObservacoes(e.target.value)}
              className="w-full text-xs p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
            />
          </div>

          {/* Rodapé */}
          <div className="pt-3 border-t border-slate-150 dark:border-slate-800 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition-colors shadow-sm cursor-pointer flex items-center"
            >
              <FileCheck className="w-4 h-4 mr-1.5" />
              Salvar Auditoria
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
