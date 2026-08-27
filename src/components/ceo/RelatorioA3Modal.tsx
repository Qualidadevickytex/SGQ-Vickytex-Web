/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  X, 
  Printer, 
  Copy, 
  Check, 
  ExternalLink, 
  FileText, 
  Target, 
  AlertTriangle, 
  TrendingUp, 
  CheckCircle2, 
  Clock, 
  DollarSign, 
  Layers, 
  Share2,
  Sparkles
} from 'lucide-react';
import { ProjetoCEO, FerramentasCEO } from '../../types/ceo';
import { SectorType } from '../../types/department';

interface RelatorioA3ModalProps {
  project: ProjetoCEO;
  tools: FerramentasCEO;
  onClose: () => void;
}

export const RelatorioA3Modal: React.FC<RelatorioA3ModalProps> = ({
  project,
  tools,
  onClose
}) => {
  const [copied, setCopied] = useState(false);

  const formatCurrency = (val?: number) => {
    if (!val && val !== 0) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopyText = () => {
    const textSummary = `
===================================================================
RELATÓRIO A3 DE RESOLUÇÃO DE PROBLEMAS & MELHORIA CONTÍNUA (ISO 9001)
VICKYTEX INDÚSTRIA TÊXTIL LTDA
===================================================================
CÓDIGO: ${project.codigo}
TÍTULO: ${project.titulo}
SETOR: ${project.setor} | METODOLOGIA: ${project.metodologia}
LÍDER: ${project.lider} | PATROCINADOR: ${project.patrocinador}
STATUS: ${project.status} | DATA: ${project.dataInicio} até ${project.dataFimReal || project.dataFimPlanejada}

1. CONTEXTO & DESCRIÇÃO DO PROBLEMA:
${project.descricao || 'Sem descrição cadastrada.'}

2. CONDIÇÃO ATUAL & INDICADORES IMPACTADOS:
- Indicadores: ${project.indicadoresImpactados?.join(', ') || 'Nenhum'}
- Lead Time Antes: ${tools.leadTime?.before || 0} ${tools.leadTime?.unit || 'dias'}
- Horas de Treinamento Lean Registradas: ${tools.treinamentoHoras || 0} h

3. OBJETIVO & META SMART:
- Meta de Retorno Financeiro Esperado: ${formatCurrency(project.retornoEsperado)}
- Redução de Desperdícios / Refugo: Meta estabelecida de 100% de conformidade ISO 9001.

4. ANÁLISE DE CAUSA RAIZ (ISHIKAWA 6M & 5 PORQUÊS):
${tools.fiveWhys?.map((fw, i) => `[5W #${i + 1}] Problema: ${fw.problema} -> Causa Raiz: ${fw.causaRaiz} -> Ação: ${fw.acaoProposta}`).join('\n') || '- Não foram registrados 5 Porquês.'}

5. PLANO DE AÇÃO (5W2H):
${tools.cronograma?.map(c => `[${c.status}] ${c.tarefa} (Resp: ${c.responsavel}, Prazo: ${c.dataFim})`).join('\n') || '- Nenhuma tarefa no cronograma.'}

6. RESULTADOS & GANHOS OBTIDOS:
- Investimento Realizado: ${formatCurrency(project.investimento)}
- Retorno Financeiro Real (Anual): ${formatCurrency(project.retornoReal || project.retornoEsperado)}
- Lead Time Pós-Projeto: ${tools.leadTime?.after || 0} ${tools.leadTime?.unit || 'dias'}

7. PADRONIZAÇÃO & LIÇÕES APRENDIDAS:
- Relatório de Encerramento: ${tools.encerramento?.relatorioFinal || 'Projeto em acompanhamento operacional.'}
- Lições Aprendidas: ${tools.encerramento?.licoesAprendidas || 'Documentação contínua de melhorias.'}
===================================================================
`.trim();

    navigator.clipboard.writeText(textSummary);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleOpenGoogleDocs = () => {
    // Abre a criação de novo documento no Google Docs com o template
    const url = 'https://docs.google.com/document/create';
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto print:p-0 print:bg-white print:static">
      <div className="bg-white dark:bg-slate-900 w-full max-w-6xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh] print:max-h-none print:border-none print:shadow-none print:rounded-none">
        
        {/* MODAL TOOLBAR (HIDDEN IN PRINT) */}
        <div className="bg-slate-900 text-white px-5 py-3.5 flex flex-wrap items-center justify-between gap-3 shrink-0 print:hidden">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-blue-500/20 text-blue-400 rounded-lg">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold flex items-center gap-2">
                <span>Relatório A3 Executivo • Toyota & Lean Problem Solving</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-blue-600/40 text-blue-300 border border-blue-500/30">
                  {project.codigo}
                </span>
              </h2>
              <p className="text-[11px] text-slate-400">
                Padrão ISO 9001:2015 Vickytex • Relatório Estruturado de Melhoria Contínua
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyText}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-700"
              title="Copiar texto estruturado do A3"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-300 font-bold">Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copiar Texto</span>
                </>
              )}
            </button>

            <button
              onClick={handleOpenGoogleDocs}
              className="px-3 py-1.5 bg-blue-900/60 hover:bg-blue-800 text-blue-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-blue-700/50"
              title="Abrir no Google Docs"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Google Docs</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir / Salvar PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors ml-2 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PRINTABLE A3 DOCUMENT BODY */}
        <div className="overflow-y-auto p-6 sm:p-8 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 print:bg-white print:p-0 print:text-black">
          
          {/* A3 CANVAS BOX */}
          <div className="bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-800 rounded-xl p-6 print:border-black print:p-4 print:shadow-none shadow-sm space-y-6">
            
            {/* A3 HEADER */}
            <div className="border-b-2 border-slate-900 dark:border-slate-700 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase tracking-widest text-blue-700 dark:text-blue-400">
                    VICKYTEX TÊXTIL • SGQ SISTEMA DE GESTÃO DA QUALIDADE
                  </span>
                  <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded font-mono font-bold">
                    ISO 9001:2015
                  </span>
                </div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-1">
                  Relatório A3: {project.titulo}
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Código: <strong className="font-mono text-slate-800 dark:text-slate-200">{project.codigo}</strong> • Setor: <strong>{project.setor}</strong> • Metodologia: <strong>{project.metodologia}</strong>
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-right bg-slate-50 dark:bg-slate-800/60 p-3 rounded-lg border border-slate-200 dark:border-slate-700 text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Líder do Projeto</span>
                  <span className="font-bold text-slate-700 dark:text-slate-200">{project.lider || 'Qualidade'}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Patrocinador</span>
                  <span className="font-bold text-slate-700 dark:text-slate-200">{project.patrocinador || 'Diretoria'}</span>
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Status / Período</span>
                  <span className="font-bold text-blue-600 dark:text-blue-400">{project.status}</span>
                </div>
              </div>
            </div>

            {/* A3 2-COLUMN GRID (STANDARD LEAN A3 LAYOUT) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              
              {/* LEFT COLUMN: PROBLEM DEFINITION, CURRENT STATE & ROOT CAUSE */}
              <div className="space-y-6">
                
                {/* 1. CONTEXTO E JUSTIFICATIVA */}
                <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 bg-slate-50/50 dark:bg-slate-800/30">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-5 h-5 rounded-full bg-slate-900 text-white dark:bg-blue-600 text-[11px] font-black flex items-center justify-center">1</span>
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
                      Contexto & Justificativa do Negócio
                    </h3>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {project.descricao || 'Otimização dos processos produtivos têxteis, mitigando desvios e assegurando a conformidade rigorosa aos requisitos da ISO 9001 e padrões de qualidade Vickytex.'}
                  </p>
                </div>

                {/* 2. CONDIÇÃO ATUAL & IMPACTO */}
                <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 bg-slate-50/50 dark:bg-slate-800/30">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-5 h-5 rounded-full bg-slate-900 text-white dark:bg-blue-600 text-[11px] font-black flex items-center justify-center">2</span>
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
                      Condição Atual & Métricas de Linha de Base
                    </h3>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-2.5 bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-800">
                      <span className="text-[10px] text-slate-400 block uppercase font-bold">Lead Time Inicial</span>
                      <span className="text-sm font-black text-slate-800 dark:text-slate-100 font-mono">
                        {tools.leadTime?.before || 45} {tools.leadTime?.unit || 'minutos'}
                      </span>
                    </div>
                    <div className="p-2.5 bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-800">
                      <span className="text-[10px] text-slate-400 block uppercase font-bold">Investimento</span>
                      <span className="text-sm font-black text-slate-800 dark:text-slate-100 font-mono">
                        {formatCurrency(project.investimento)}
                      </span>
                    </div>
                  </div>
                  <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
                    <strong>KPIs Monitorados:</strong> {project.indicadoresImpactados?.join(', ') || 'Tempo de Setup, Taxa de Refugo e Qualidade de Lote'}
                  </div>
                </div>

                {/* 3. META SMART & CONDIÇÃO ALVO */}
                <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 bg-slate-50/50 dark:bg-slate-800/30">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-5 h-5 rounded-full bg-slate-900 text-white dark:bg-blue-600 text-[11px] font-black flex items-center justify-center">3</span>
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
                      Objetivo & Meta SMART
                    </h3>
                  </div>
                  <div className="p-3 bg-blue-50/80 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/50 rounded-lg text-xs text-blue-900 dark:text-blue-200 font-medium">
                    🎯 Redução de desvios operacionais com ganho anual projetado de <strong>{formatCurrency(project.retornoEsperado)}</strong> e redução de tempo para <strong>{tools.leadTime?.after || 15} {tools.leadTime?.unit || 'minutos'}</strong>.
                  </div>
                </div>

                {/* 4. ANÁLISE DE CAUSA RAIZ (5 PORQUÊS / ISHIKAWA) */}
                <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 bg-slate-50/50 dark:bg-slate-800/30">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-5 h-5 rounded-full bg-slate-900 text-white dark:bg-blue-600 text-[11px] font-black flex items-center justify-center">4</span>
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
                      Análise de Causa Raiz (Ishikawa & 5 Porquês)
                    </h3>
                  </div>
                  {tools.fiveWhys && tools.fiveWhys.length > 0 ? (
                    <div className="space-y-2">
                      {tools.fiveWhys.slice(0, 2).map((fw, idx) => (
                        <div key={idx} className="p-2.5 bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-800 text-xs">
                          <p className="font-bold text-slate-800 dark:text-slate-200">Problema: {fw.problema}</p>
                          <p className="text-rose-600 dark:text-rose-400 font-bold mt-1">Causa Raiz: {fw.causaRaiz}</p>
                          <p className="text-[11px] text-slate-500 mt-0.5">Contramedida: {fw.acaoProposta}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 italic">
                      Causa Raiz: Ausência de padronização de setup e controle prévio de matérias-primas e ferramentas.
                    </p>
                  )}
                </div>

              </div>

              {/* RIGHT COLUMN: CONTRAMEASURES, ACTION PLAN & RESULTS */}
              <div className="space-y-6">
                
                {/* 5. PLANO DE AÇÃO & CONTRAMEDIDAS (5W2H) */}
                <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 bg-slate-50/50 dark:bg-slate-800/30">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-5 h-5 rounded-full bg-slate-900 text-white dark:bg-blue-600 text-[11px] font-black flex items-center justify-center">5</span>
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
                      Plano de Contramedidas (5W2H)
                    </h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-slate-200 dark:border-slate-700 text-[10px] text-slate-400 uppercase">
                          <th className="py-1">Ação / O que</th>
                          <th className="py-1">Quem</th>
                          <th className="py-1">Prazo</th>
                          <th className="py-1 text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {tools.cronograma && tools.cronograma.length > 0 ? (
                          tools.cronograma.slice(0, 4).map((task, idx) => (
                            <tr key={idx}>
                              <td className="py-1.5 font-medium text-slate-700 dark:text-slate-300">{task.tarefa}</td>
                              <td className="py-1.5 text-slate-500">{task.responsavel}</td>
                              <td className="py-1.5 font-mono text-[10px]">{task.dataFim}</td>
                              <td className="py-1.5 text-right font-bold text-[10px]">
                                <span className={task.status === 'Concluido' ? 'text-emerald-600' : 'text-amber-600'}>
                                  {task.status}
                                </span>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={4} className="py-2 text-slate-400 italic">Nenhuma ação cadastrada no cronograma.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* 6. VERIFICAÇÃO DE RESULTADOS & GANHOS */}
                <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 bg-slate-50/50 dark:bg-slate-800/30">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-5 h-5 rounded-full bg-slate-900 text-white dark:bg-blue-600 text-[11px] font-black flex items-center justify-center">6</span>
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
                      Confirmação dos Resultados & ROI Validado
                    </h3>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-3 bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 rounded-lg">
                      <span className="text-[10px] uppercase font-bold text-emerald-800 dark:text-emerald-300 block">Retorno Financeiro Real</span>
                      <span className="text-base font-black text-emerald-700 dark:text-emerald-400 font-mono">
                        {formatCurrency(project.retornoReal || project.retornoEsperado)}
                      </span>
                    </div>
                    <div className="p-3 bg-indigo-50/80 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/50 rounded-lg">
                      <span className="text-[10px] uppercase font-bold text-indigo-800 dark:text-indigo-300 block">Horas Lean Práticas</span>
                      <span className="text-base font-black text-indigo-700 dark:text-indigo-400 font-mono">
                        {tools.treinamentoHoras || 12} horas
                      </span>
                    </div>
                  </div>
                </div>

                {/* 7. PADRONIZAÇÃO & LIÇÕES APRENDIDAS */}
                <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 bg-slate-50/50 dark:bg-slate-800/30">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-5 h-5 rounded-full bg-slate-900 text-white dark:bg-blue-600 text-[11px] font-black flex items-center justify-center">7</span>
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
                      Padronização (SOPs) & Sustentação ISO 9001
                    </h3>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    {tools.encerramento?.licoesAprendidas || 'Atualização dos Procedimentos Operacionais Padrão (POP), realização de auditoria de 5S/Qualidade volante a cada 15 dias para sustentação dos ganhos obtidos.'}
                  </p>
                  <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700 flex justify-between text-[10px] text-slate-400">
                    <span>Aprovado por: <strong>{project.patrocinador || 'Diretoria'}</strong></span>
                    <span>Validação SGQ: <strong>qualidade@vickytex.com.br</strong></span>
                  </div>
                </div>

              </div>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
