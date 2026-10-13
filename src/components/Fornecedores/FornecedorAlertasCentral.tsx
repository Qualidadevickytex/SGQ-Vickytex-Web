/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  Bell, 
  AlertTriangle, 
  Calendar, 
  FileWarning, 
  ShieldAlert, 
  CheckCircle2, 
  ExternalLink,
  ChevronRight,
  Clock
} from 'lucide-react';
import { Fornecedor } from '../../types/supplier';
import { extrairAlertasFornecedor } from '../../utils/supplierEvaluationEngine';

interface FornecedorAlertasCentralProps {
  fornecedores: Fornecedor[];
  onSelectFornecedor: (fornecedor: Fornecedor) => void;
}

export const FornecedorAlertasCentral: React.FC<FornecedorAlertasCentralProps> = ({
  fornecedores,
  onSelectFornecedor
}) => {
  // Coletar todos os alertas de todos os fornecedores
  const todosAlertas = fornecedores.flatMap(f => {
    const alerts = extrairAlertasFornecedor(f);
    return alerts.map(a => ({
      ...a,
      fornecedor: f
    }));
  });

  const alertasCriticos = todosAlertas.filter(a => a.gravidade === 'alta');
  const alertasMedios = todosAlertas.filter(a => a.gravidade === 'media');

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Top Banner */}
      <div className="p-5 bg-linear-to-r from-slate-900 via-slate-800 to-indigo-950 text-white rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <Bell className="w-5 h-5 text-amber-400" />
            <h3 className="font-extrabold text-base tracking-tight">Central de Notificações & Alertas ISO 9001</h3>
          </div>
          <p className="text-xs text-slate-300">
            Monitoramento proativo de vencimento de documentos, reavaliações expiradas e RNCs críticas.
          </p>
        </div>

        <div className="flex items-center space-x-3 text-xs font-mono">
          <div className="p-3 bg-rose-500/20 border border-rose-500/30 rounded-xl text-center">
            <span className="text-[10px] text-rose-300 block uppercase">Críticos / Vencidos</span>
            <span className="text-xl font-black text-rose-400">{alertasCriticos.length}</span>
          </div>
          <div className="p-3 bg-amber-500/20 border border-amber-500/30 rounded-xl text-center">
            <span className="text-[10px] text-amber-300 block uppercase">A Vencer (30d)</span>
            <span className="text-xl font-black text-amber-400">{alertasMedios.length}</span>
          </div>
        </div>
      </div>

      {todosAlertas.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
          <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
          <h4 className="text-base font-bold text-slate-800 dark:text-slate-100">
            Tudo em conformidade no SGQ!
          </h4>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Nenhum documento vencido, todas as reavaliações periódicas estão em dia e não há ações corretivas com prazo expirado.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {todosAlertas.map(alerta => (
            <div 
              key={alerta.id}
              onClick={() => onSelectFornecedor(alerta.fornecedor)}
              className={`p-4 rounded-xl border transition-all cursor-pointer hover:shadow-md flex items-center justify-between gap-4 ${
                alerta.gravidade === 'alta'
                  ? 'bg-rose-50/60 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/50'
                  : 'bg-amber-50/60 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/50'
              }`}
            >
              <div className="flex items-start space-x-3.5">
                <div className={`p-2 rounded-lg mt-0.5 ${
                  alerta.gravidade === 'alta' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                }`}>
                  {alerta.tipo === 'documento_vencido' && <FileWarning className="w-5 h-5" />}
                  {alerta.tipo === 'documento_vencendo' && <Clock className="w-5 h-5" />}
                  {alerta.tipo === 'reavaliacao_vencida' && <Calendar className="w-5 h-5" />}
                  {alerta.tipo === 'rnc_aberta' && <AlertTriangle className="w-5 h-5" />}
                  {alerta.tipo === 'bloqueio' && <ShieldAlert className="w-5 h-5" />}
                </div>

                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-extrabold text-xs text-slate-900 dark:text-white">
                      {alerta.titulo}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
                      {alerta.fornecedor.nomeFantasia}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                    {alerta.descricao}
                  </p>
                </div>
              </div>

              <button className="text-blue-600 hover:text-blue-800 text-xs font-bold shrink-0 flex items-center cursor-pointer">
                Tratar <ChevronRight className="w-4 h-4 ml-0.5" />
              </button>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
