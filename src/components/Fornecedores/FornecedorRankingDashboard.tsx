/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Trophy, 
  TrendingUp, 
  Award, 
  Star, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Filter, 
  BarChart3, 
  ChevronRight,
  ShieldCheck,
  Building2,
  Package
} from 'lucide-react';
import { Fornecedor } from '../../types/supplier';
import { calcularEstatisticasReaisFornecedor } from '../../utils/supplierEvaluationEngine';

interface FornecedorRankingDashboardProps {
  fornecedores: Fornecedor[];
  onSelectFornecedor: (fornecedor: Fornecedor) => void;
}

export const FornecedorRankingDashboard: React.FC<FornecedorRankingDashboardProps> = ({
  fornecedores,
  onSelectFornecedor
}) => {
  const [categoriaFiltro, setCategoriaFiltro] = useState<string>('todos');

  // Mapear métricas calculadas reais para cada fornecedor
  const fornecedoresComMetricas = fornecedores.map(f => {
    const stats = calcularEstatisticasReaisFornecedor(f);
    return {
      fornecedor: f,
      stats
    };
  });

  // Filtrar e ordenar pelo IQF real decrescente
  const fornecedoresFiltrados = fornecedoresComMetricas
    .filter(item => categoriaFiltro === 'todos' || item.fornecedor.categoria === categoriaFiltro)
    .sort((a, b) => b.stats.iqfGeral - a.stats.iqfGeral);

  // Categorias únicas
  const categorias = Array.from(new Set(fornecedores.map(f => f.categoria)));

  // Médias Gerais
  const mediaIQF = fornecedoresComMetricas.length > 0
    ? Math.round(fornecedoresComMetricas.reduce((acc, it) => acc + it.stats.iqfGeral, 0) / fornecedoresComMetricas.length)
    : 0;

  const totalLotesBase = fornecedoresComMetricas.reduce((acc, it) => acc + it.stats.totalLotes, 0);
  const mediaAprovacao = fornecedoresComMetricas.length > 0
    ? Math.round(fornecedoresComMetricas.reduce((acc, it) => acc + it.stats.taxaAprovacao, 0) / fornecedoresComMetricas.length)
    : 0;

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Top Banner & KPIs do Ranking */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 bg-linear-to-br from-amber-500 to-amber-700 text-white rounded-2xl shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs uppercase font-bold text-amber-100 tracking-wider">Média de IQF da Base</span>
            <div className="text-3xl font-black font-mono">{mediaIQF}%</div>
            <p className="text-[11px] text-amber-100">Meta SGQ: ≥ 85% para fornecedores críticos</p>
          </div>
          <div className="p-3 bg-white/20 rounded-xl backdrop-blur-xs">
            <Trophy className="w-8 h-8 text-amber-100" />
          </div>
        </div>

        <div className="p-5 bg-linear-to-br from-blue-600 to-indigo-700 text-white rounded-2xl shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs uppercase font-bold text-blue-100 tracking-wider">Aprovação Média de Lotes</span>
            <div className="text-3xl font-black font-mono">{mediaAprovacao}%</div>
            <p className="text-[11px] text-blue-100">Base total: {totalLotesBase} lotes inspecionados</p>
          </div>
          <div className="p-3 bg-white/20 rounded-xl backdrop-blur-xs">
            <BarChart3 className="w-8 h-8 text-blue-100" />
          </div>
        </div>

        <div className="p-5 bg-linear-to-br from-emerald-600 to-teal-700 text-white rounded-2xl shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs uppercase font-bold text-emerald-100 tracking-wider">Fornecedores Classe A</span>
            <div className="text-3xl font-black font-mono">
              {fornecedoresComMetricas.filter(it => it.stats.faixaIQF === 'A - Excelente').length}
            </div>
            <p className="text-[11px] text-emerald-100">Nota IQF ≥ 90% com certificação plena</p>
          </div>
          <div className="p-3 bg-white/20 rounded-xl backdrop-blur-xs">
            <ShieldCheck className="w-8 h-8 text-emerald-100" />
          </div>
        </div>
      </div>

      {/* Barra de Filtro de Categoria para Benchmark */}
      <div className="bg-white dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-slate-500" />
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Comparar Benchmark por Categoria:
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <select 
            value={categoriaFiltro}
            onChange={e => setCategoriaFiltro(e.target.value)}
            className="text-xs font-semibold px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="todos">Todas as Categorias Têxteis</option>
            {categorias.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Pódio dos Top Performers se houver pelo menos 2 */}
      {fornecedoresFiltrados.length >= 2 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {fornecedoresFiltrados.slice(0, 3).map((item, index) => {
            const medalColor = index === 0 ? 'text-amber-500' : index === 1 ? 'text-slate-400' : 'text-amber-700';
            const medalBg = index === 0 ? 'bg-amber-50 border-amber-200' : index === 1 ? 'bg-slate-50 border-slate-200' : 'bg-amber-50/50 border-amber-200/60';
            return (
              <div 
                key={item.fornecedor.id}
                onClick={() => onSelectFornecedor(item.fornecedor)}
                className={`p-5 rounded-2xl border transition-all cursor-pointer hover:shadow-md ${medalBg} dark:bg-slate-800/80 dark:border-slate-700`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-xl font-black ${medalColor}`}>
                    #{index + 1}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold font-mono bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 shadow-2xs">
                    {item.stats.iqfGeral}% IQF
                  </span>
                </div>
                <h4 className="font-extrabold text-sm text-slate-900 dark:text-white tracking-tight">
                  {item.fornecedor.nomeFantasia}
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">{item.fornecedor.categoria}</p>
                <div className="mt-3 pt-3 border-t border-slate-200/60 dark:border-slate-700/60 grid grid-cols-2 text-[11px] font-mono text-slate-600 dark:text-slate-400">
                  <div>Aprov: <strong>{item.stats.taxaAprovacao}%</strong></div>
                  <div>Pontual: <strong>{item.stats.taxaPontualidade}%</strong></div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tabela Completa de Ranking e Benchmark */}
      <div className="bg-white dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center">
            <Trophy className="w-4 h-4 mr-1.5 text-amber-500" />
            Classificação Geral por Desempenho e Qualidade de Fornecedores
          </h3>
          <span className="text-xs text-slate-500 font-mono">
            {fornecedoresFiltrados.length} fornecedor(es) analisado(s)
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/60 text-slate-500 font-semibold border-b border-slate-200 dark:border-slate-800">
                <th className="p-3.5 pl-5">Posição</th>
                <th className="p-3.5">Fornecedor</th>
                <th className="p-3.5">Categoria</th>
                <th className="p-3.5">Criticidade</th>
                <th className="p-3.5 text-center">IQF (Nota %)</th>
                <th className="p-3.5 text-center">Faixa</th>
                <th className="p-3.5 text-center">Aprovação Lotes</th>
                <th className="p-3.5 text-center">Pontualidade</th>
                <th className="p-3.5 text-center">RNCs</th>
                <th className="p-3.5 text-right pr-5">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {fornecedoresFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={10} className="p-12 text-center text-slate-500">
                    <Building2 className="w-10 h-10 mx-auto text-slate-400 mb-2 opacity-50" />
                    <p className="text-sm font-medium">Nenhum fornecedor cadastrado nesta categoria</p>
                    <p className="text-xs text-slate-400 mt-1">Cadastre fornecedores na aba "Lista Mestra" para visualizar a classificação do ranking.</p>
                  </td>
                </tr>
              ) : (
                fornecedoresFiltrados.map((item, index) => (
                <tr 
                  key={item.fornecedor.id}
                  onClick={() => onSelectFornecedor(item.fornecedor)}
                  className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
                >
                  <td className="p-3.5 pl-5 font-mono font-bold text-slate-600 dark:text-slate-400">
                    <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                      index === 0 ? 'bg-amber-100 text-amber-800' :
                      index === 1 ? 'bg-slate-200 text-slate-800' :
                      index === 2 ? 'bg-amber-100 text-amber-900' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {index + 1}
                    </span>
                  </td>

                  <td className="p-3.5 font-bold text-slate-800 dark:text-slate-100">
                    <div>{item.fornecedor.nomeFantasia}</div>
                    <span className="text-[10px] font-mono font-normal text-slate-400">{item.fornecedor.cnpj}</span>
                  </td>

                  <td className="p-3.5 text-slate-600 dark:text-slate-300">
                    {item.fornecedor.categoria}
                  </td>

                  <td className="p-3.5">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      item.fornecedor.criticidade === 'Alta' ? 'bg-rose-100 text-rose-800' :
                      item.fornecedor.criticidade === 'Média' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {item.fornecedor.criticidade}
                    </span>
                  </td>

                  {/* Barra visual de IQF */}
                  <td className="p-3.5 text-center">
                    <div className="w-24 mx-auto space-y-1">
                      <span className="font-mono font-black text-xs text-slate-900 dark:text-white">
                        {item.stats.iqfGeral}%
                      </span>
                      <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${
                            item.stats.iqfGeral >= 90 ? 'bg-emerald-500' :
                            item.stats.iqfGeral >= 75 ? 'bg-blue-500' :
                            item.stats.iqfGeral >= 60 ? 'bg-amber-500' : 'bg-rose-500'
                          }`}
                          style={{ width: `${item.stats.iqfGeral}%` }}
                        />
                      </div>
                    </div>
                  </td>

                  <td className="p-3.5 text-center">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      item.stats.faixaIQF === 'A - Excelente' ? 'bg-emerald-100 text-emerald-800' :
                      item.stats.faixaIQF === 'B - Bom' ? 'bg-blue-100 text-blue-800' :
                      item.stats.faixaIQF === 'C - Regular' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {item.stats.faixaIQF.split(' - ')[0]}
                    </span>
                  </td>

                  <td className="p-3.5 text-center font-mono font-semibold text-slate-700 dark:text-slate-300">
                    {item.stats.taxaAprovacao}%
                    <span className="text-[10px] text-slate-400 block font-normal">({item.stats.lotesAprovados}/{item.stats.totalLotes})</span>
                  </td>

                  <td className="p-3.5 text-center font-mono font-semibold text-slate-700 dark:text-slate-300">
                    {item.stats.taxaPontualidade}%
                  </td>

                  <td className="p-3.5 text-center font-mono">
                    {item.stats.totalRNCs > 0 ? (
                      <span className="text-rose-600 font-bold">{item.stats.totalRNCs}</span>
                    ) : (
                      <span className="text-emerald-600 font-bold">0</span>
                    )}
                  </td>

                  <td className="p-3.5 text-right pr-5">
                    <button className="text-blue-600 hover:text-blue-800 font-bold text-xs inline-flex items-center">
                      Ver Ficha <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                    </button>
                  </td>
                </tr>
              ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
