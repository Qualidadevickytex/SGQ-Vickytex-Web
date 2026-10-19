/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  X, 
  Building2, 
  Users, 
  ShieldAlert, 
  Award, 
  FileCheck2, 
  ClipboardCheck, 
  FileWarning, 
  CheckSquare, 
  History, 
  Printer, 
  Edit3, 
  ShieldCheck, 
  Sparkles, 
  PlusCircle, 
  ExternalLink, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Mail, 
  Phone, 
  Calendar, 
  Clock, 
  Tag, 
  Scissors, 
  Palette, 
  Layers, 
  Package, 
  TrendingUp,
  FileText
} from 'lucide-react';
import { Fornecedor, InspecaoLoteFornecedor, OcorrenciaRNCFornecedor, PlanoAcaoFornecedor, AvaliacaoFornecedor, DocumentoFornecedor, AuditoriaFornecedor, BloqueioHistorico } from '../../types/supplier';
import { calcularEstatisticasReaisFornecedor, extrairAlertasFornecedor } from '../../utils/supplierEvaluationEngine';

interface FornecedorModalDetalhesProps {
  fornecedor: Fornecedor;
  onClose: () => void;
  onEditFornecedor: (fornecedor: Fornecedor) => void;
  onOpenNovaInspecao: (fornecedor: Fornecedor) => void;
  onOpenNovaAvaliacao: (fornecedor: Fornecedor) => void;
  onOpenNovaRNC: (fornecedor: Fornecedor) => void;
  onOpenNovoDocumento: (fornecedor: Fornecedor) => void;
  onOpenNovaAuditoria: (fornecedor: Fornecedor) => void;
  onOpenBloqueio: (fornecedor: Fornecedor) => void;
  onOpenImpressao: (fornecedor: Fornecedor) => void;
  onRecalcularIQFAutomatico: (fornecedor: Fornecedor) => void;
  onUpdatePlanoAcaoStatus?: (fornecedorId: string, planoId: string, novoStatus: PlanoAcaoFornecedor['status']) => void;
}

export const FornecedorModalDetalhes: React.FC<FornecedorModalDetalhesProps> = ({
  fornecedor,
  onClose,
  onEditFornecedor,
  onOpenNovaInspecao,
  onOpenNovaAvaliacao,
  onOpenNovaRNC,
  onOpenNovoDocumento,
  onOpenNovaAuditoria,
  onOpenBloqueio,
  onOpenImpressao,
  onRecalcularIQFAutomatico,
  onUpdatePlanoAcaoStatus
}) => {
  const [activeTab, setActiveTab] = useState<number>(1);
  const [filtroVerificacao, setFiltroVerificacao] = useState<'todos' | 'inspecoes' | 'auditorias'>('todos');
  const stats = calcularEstatisticasReaisFornecedor(fornecedor);
  const alertas = extrairAlertasFornecedor(fornecedor);

  const totalInspecoes = fornecedor.historicoInspecoes?.length || 0;
  const totalAuditorias = fornecedor.auditorias?.length || 0;
  const totalVerificacoes = totalInspecoes + totalAuditorias;
  const mediaAuditorias = totalAuditorias > 0 
    ? Math.round((fornecedor.auditorias || []).reduce((acc, a) => acc + (a.notaChecklist || 0), 0) / totalAuditorias) 
    : 0;

  const isMalhariaTinturaria = fornecedor.categoria.toLowerCase().includes('tinturaria') || fornecedor.categoria.toLowerCase().includes('malharia');
  const isFaccao = fornecedor.categoria.toLowerCase().includes('facção') || fornecedor.categoria.toLowerCase().includes('costura');
  const isEstamparia = fornecedor.categoria.toLowerCase().includes('estamparia') || fornecedor.categoria.toLowerCase().includes('bordado');

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-6xl w-full border border-slate-200 dark:border-slate-800 overflow-hidden my-4 flex flex-col max-h-[94vh] animate-fade-in">
        
        {/* Top Header com Identificação e Ações Rápidas */}
        <div className="bg-slate-900 text-white p-5 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2.5 flex-wrap gap-y-1">
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                fornecedor.statusQualificacao === 'Qualificado' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                fornecedor.statusQualificacao === 'Qualificado com Restrições' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                fornecedor.statusQualificacao === 'Bloqueado' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                'bg-blue-500/20 text-blue-400 border border-blue-500/30'
              }`}>
                {fornecedor.statusQualificacao}
              </span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                fornecedor.criticidade === 'Alta' ? 'bg-rose-950 text-rose-300 border border-rose-800' :
                fornecedor.criticidade === 'Média' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                'bg-emerald-950 text-emerald-300 border border-emerald-800'
              }`}>
                Criticidade {fornecedor.criticidade}
              </span>
              <span className="text-slate-400 text-xs">• Categoria: {fornecedor.categoria}</span>
            </div>
            
            <h2 className="text-xl font-black text-white tracking-tight flex items-center flex-wrap gap-2">
              <span>{fornecedor.nomeFantasia || fornecedor.razaoSocial}</span>
              <span className="text-xs font-mono font-normal text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700">CNPJ: {fornecedor.cnpj}</span>
            </h2>
          </div>

          {/* Botões de Ação no Header */}
          <div className="flex items-center flex-wrap gap-2">
            <button
              onClick={() => onRecalcularIQFAutomatico(fornecedor)}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center shadow-xs"
              title="Recalcula a nota IQF imediatamente a partir dos dados reais das inspeções registradas"
            >
              <Sparkles className="w-3.5 h-3.5 mr-1.5" />
              Recalcular IQF Real
            </button>

            <button
              onClick={() => onOpenImpressao(fornecedor)}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center border border-slate-700"
            >
              <Printer className="w-3.5 h-3.5 mr-1.5" />
              Ficha PDF / Print
            </button>

            <button
              onClick={() => onOpenBloqueio(fornecedor)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center ${
                fornecedor.statusQualificacao === 'Bloqueado'
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  : 'bg-rose-900/60 hover:bg-rose-800 text-rose-200 border border-rose-700'
              }`}
            >
              {fornecedor.statusQualificacao === 'Bloqueado' ? <ShieldCheck className="w-3.5 h-3.5 mr-1" /> : <ShieldAlert className="w-3.5 h-3.5 mr-1" />}
              {fornecedor.statusQualificacao === 'Bloqueado' ? 'Desbloquear' : 'Bloquear'}
            </button>

            <button
              onClick={() => onEditFornecedor(fornecedor)}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center shadow-xs"
            >
              <Edit3 className="w-3.5 h-3.5 mr-1.5" />
              Editar
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Banner de Alertas Ativos se houver */}
        {alertas.length > 0 && (
          <div className="bg-amber-50 dark:bg-amber-950/40 border-b border-amber-200 dark:border-amber-900/60 p-2.5 px-6 flex items-center justify-between overflow-x-auto text-xs">
            <div className="flex items-center space-x-2 text-amber-800 dark:text-amber-300 font-medium">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                <strong>{alertas.length} alerta(s) de SGQ:</strong> {alertas.map(a => a.titulo).join(' • ')}
              </span>
            </div>
            <span className="text-[10px] text-amber-600 dark:text-amber-400 font-mono ml-4 shrink-0">
              ISO 9001 - Requer Ação
            </span>
          </div>
        )}

        {/* Menu das 8 Abas do Ciclo Completo ISO 9001 - Com scroll suave e visual limpo */}
        <div className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 relative">
          <div className="flex overflow-x-auto select-none scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700 scroll-smooth px-2">
            {[
              { id: 1, label: '1. Cadastro & Contatos', icon: Building2 },
              { id: 2, label: '2. Riscos', badge: fornecedor.gestaoRisco?.monossuprimento ? 'Mono' : undefined, icon: ShieldAlert },
              { id: 3, label: '3. Qualificação', icon: ShieldCheck },
              { id: 4, label: `4. Documentação (${fornecedor.documentos?.length || 0})`, icon: FileCheck2 },
              { id: 5, label: `5. Inspeções & Auditorias (${totalVerificacoes})`, icon: ClipboardCheck },
              { id: 6, label: `6. Não Conformidades (${fornecedor.ocorrenciasRNC?.length || 0})`, icon: FileWarning, hasAlert: (fornecedor.ocorrenciasRNC?.filter(r => r.status === 'Aberta').length || 0) > 0 },
              { id: 7, label: stats.totalLotes > 0 || (fornecedor.historicoAvaliacoes && fornecedor.historicoAvaliacoes.length > 0) ? `7. Avaliações (IQF ${stats.iqfGeral}%)` : `7. Avaliações (Sem lotes)`, icon: Award },
              { id: 8, label: '8. Histórico & Log', icon: History },
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center px-3.5 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap shrink-0 gap-1.5 ${
                    isActive 
                      ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-900 shadow-xs' 
                      : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100/60 dark:hover:bg-slate-800/40'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`} />
                  <span>{tab.label}</span>
                  {tab.hasAlert && (
                    <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0 animate-pulse" title="RNC Aberta" />
                  )}
                  {tab.badge && (
                    <span className="px-1 py-0.2 rounded text-[9px] font-black bg-amber-500/20 text-amber-500 uppercase border border-amber-500/30">
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Conteúdo Dinâmico das Abas */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          
          {/* ======================================================== */}
          {/* ABA 1: CADASTRO & CONTATOS */}
          {/* ======================================================== */}
          {activeTab === 1 && (
            <div className="space-y-6 animate-fade-in">
              {/* Card de Dados Corporativos */}
              <div className="bg-white dark:bg-slate-800/60 p-5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-4">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center">
                  <Building2 className="w-4 h-4 mr-1.5 text-blue-600" />
                  Dados Cadastrais Oficiais
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400 text-[10px] block uppercase font-semibold">Razão Social</span>
                    <span className="font-bold text-slate-800 dark:text-slate-100">{fornecedor.razaoSocial}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block uppercase font-semibold">Nome Fantasia</span>
                    <span className="font-bold text-slate-800 dark:text-slate-100">{fornecedor.nomeFantasia}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block uppercase font-semibold">CNPJ</span>
                    <span className="font-mono font-bold text-slate-800 dark:text-slate-100">{fornecedor.cnpj}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block uppercase font-semibold">Inscrição Estadual</span>
                    <span className="font-mono text-slate-700 dark:text-slate-300">{fornecedor.inscricaoEstadual || 'Não informada'}</span>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-slate-400 text-[10px] block uppercase font-semibold">Endereço Fabril / Logístico</span>
                    <span className="text-slate-700 dark:text-slate-300">
                      {fornecedor.enderecoCompleto || 'Endereço não cadastrado'} - {fornecedor.cidade || ''}/{fornecedor.uf || ''} {fornecedor.cep ? `(CEP: ${fornecedor.cep})` : ''}
                    </span>
                  </div>
                </div>
              </div>

              {/* Equipe de Contatos */}
              <div className="bg-white dark:bg-slate-800/60 p-5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-4">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center">
                  <Users className="w-4 h-4 mr-1.5 text-blue-600" />
                  Equipe de Contatos Registrada
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Contato Principal */}
                  <div className="p-3.5 bg-blue-50/50 dark:bg-blue-950/20 rounded-xl border border-blue-150 dark:border-blue-900/40 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">
                        Comercial Principal
                      </span>
                    </div>
                    <p className="font-bold text-slate-800 dark:text-slate-100 mt-1">{fornecedor.contatoNome || 'Não informado'}</p>
                    <p className="text-slate-600 dark:text-slate-400 flex items-center">
                      <Mail className="w-3 h-3 mr-1 text-slate-400" /> {fornecedor.contatoEmail || '-'}
                    </p>
                    <p className="text-slate-600 dark:text-slate-400 flex items-center">
                      <Phone className="w-3 h-3 mr-1 text-slate-400" /> {fornecedor.contatoTelefone || '-'}
                    </p>
                  </div>

                  {/* Contatos Adicionais */}
                  {fornecedor.contatosAdicionais && fornecedor.contatosAdicionais.map(c => (
                    <div key={c.id} className="p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-150 dark:border-slate-700 text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                          {c.tipo}
                        </span>
                        {c.cargo && <span className="text-[10px] text-slate-400">{c.cargo}</span>}
                      </div>
                      <p className="font-bold text-slate-800 dark:text-slate-100 mt-1">{c.nome}</p>
                      <p className="text-slate-600 dark:text-slate-400 flex items-center">
                        <Mail className="w-3 h-3 mr-1 text-slate-400" /> {c.email || '-'}
                      </p>
                      <p className="text-slate-600 dark:text-slate-400 flex items-center">
                        <Phone className="w-3 h-3 mr-1 text-slate-400" /> {c.telefone || '-'}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Produtos e Serviços Fornecidos */}
              <div className="bg-white dark:bg-slate-800/60 p-5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center">
                  <Tag className="w-4 h-4 mr-1.5 text-blue-600" />
                  Produtos e Serviços Fornecidos
                </h3>
                {fornecedor.produtosServicosFornecidos && fornecedor.produtosServicosFornecidos.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {fornecedor.produtosServicosFornecidos.map(prod => (
                      <span key={prod} className="px-3 py-1.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-semibold flex items-center">
                        <Tag className="w-3 h-3 mr-1 text-blue-500" />
                        {prod}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">Nenhum produto ou serviço listado ainda.</p>
                )}
              </div>

              {/* Observações Gerais */}
              {fornecedor.observacoes && (
                <div className="bg-white dark:bg-slate-800/60 p-5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center">
                    <FileText className="w-4 h-4 mr-1.5 text-slate-500" />
                    Observações e Instruções Operacionais
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg border border-slate-150 dark:border-slate-800 leading-relaxed font-mono">
                    {fornecedor.observacoes}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ======================================================== */}
          {/* ABA 2: CLASSIFICAÇÃO & GESTÃO DE RISCOS */}
          {/* ======================================================== */}
          {activeTab === 2 && (
            <div className="space-y-6 animate-fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 text-xs space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Criticidade do Fornecedor</span>
                  <span className={`text-sm font-extrabold block ${
                    fornecedor.criticidade === 'Alta' ? 'text-rose-600' :
                    fornecedor.criticidade === 'Média' ? 'text-amber-600' : 'text-emerald-600'
                  }`}>
                    {fornecedor.criticidade}
                  </span>
                  <p className="text-[11px] text-slate-500">
                    {fornecedor.criticidade === 'Alta' ? 'Impacto direto no produto e cliente final. Requer auditoria semestral.' :
                     fornecedor.criticidade === 'Média' ? 'Impacto operacional de processo. Reavaliação a cada 6 meses.' :
                     'Insumos indiretos ou suporte geral. Reavaliação anual.'}
                  </p>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 text-xs space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Risco de Abastecimento</span>
                  <span className="text-sm font-extrabold text-slate-800 dark:text-slate-100 block">
                    {fornecedor.gestaoRisco?.riscoAbastecimento || 'Médio'}
                  </span>
                  <p className="text-[11px] text-slate-500">
                    Lead time e disponibilidade de matéria-prima no mercado nacional.
                  </p>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 text-xs space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Monossuprimento (Fonte Única)</span>
                  <span className={`text-sm font-extrabold block ${
                    fornecedor.gestaoRisco?.monossuprimento ? 'text-rose-600' : 'text-emerald-600'
                  }`}>
                    {fornecedor.gestaoRisco?.monossuprimento ? 'Sim (Fornecedor Exclusivo)' : 'Não (Há fornecedores alternativos)'}
                  </span>
                  <p className="text-[11px] text-slate-500">
                    {fornecedor.gestaoRisco?.monossuprimento ? 'Atenção: Risco elevado em caso de parada.' : 'Multi-fornecimento ativo.'}
                  </p>
                </div>
              </div>

              {/* Plano de Contingência */}
              <div className="bg-white dark:bg-slate-800/60 p-5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center">
                  <ShieldAlert className="w-4 h-4 mr-1.5 text-amber-600" />
                  Plano de Contingência Operacional Vickytex
                </h3>
                
                <div className="p-4 bg-amber-50/50 dark:bg-amber-950/20 rounded-xl border border-amber-200 dark:border-amber-900/40 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-900 dark:text-amber-200">Fornecedor Substituto Homologado:</span>
                    <span className="px-2.5 py-1 bg-white dark:bg-slate-900 rounded-md font-mono text-slate-800 dark:text-slate-200 font-bold border border-amber-300 dark:border-amber-800">
                      {fornecedor.gestaoRisco?.fornecedorSubstitutoNome || 'Nenhum parceiro reserva cadastrado'}
                    </span>
                  </div>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                    <strong>Diretriz de Contingência:</strong> {fornecedor.gestaoRisco?.planoContingencia || 'Plano de contingência em elaboração pela Gerência de Suprimentos.'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* ABA 3: QUALIFICAÇÃO & APROVAÇÃO */}
          {/* ======================================================== */}
          {/* ======================================================== */}
          {/* ABA 3: QUALIFICAÇÃO & APROVAÇÃO */}
          {/* ======================================================== */}
          {activeTab === 3 && (
            <div className="space-y-6 animate-fade-in">
              {/* Qualificação Inicial */}
              <div className="bg-white dark:bg-slate-800/60 p-5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center">
                    <ShieldCheck className="w-4 h-4 mr-1.5 text-blue-600" />
                    Processo de Qualificação & Homologação Inicial
                  </h3>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                    (fornecedor.qualificacaoInicial?.statusFinal || fornecedor.statusQualificacao) === 'Qualificado'
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
                      : (fornecedor.qualificacaoInicial?.statusFinal || fornecedor.statusQualificacao) === 'Qualificado com Restrições'
                      ? 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800'
                      : (fornecedor.qualificacaoInicial?.statusFinal || fornecedor.statusQualificacao) === 'Bloqueado' || (fornecedor.qualificacaoInicial?.statusFinal || fornecedor.statusQualificacao) === 'Não Qualificado' || (fornecedor.qualificacaoInicial?.statusFinal || fornecedor.statusQualificacao) === 'Reprovado'
                      ? 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800'
                      : 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800'
                  }`}>
                    {fornecedor.qualificacaoInicial?.statusFinal || fornecedor.statusQualificacao || 'Em Avaliação'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-slate-50 dark:bg-slate-900/50 p-3.5 rounded-xl border border-slate-150 dark:border-slate-800">
                  <div>
                    <span className="text-slate-400 text-[10px] block uppercase font-semibold">Início do Processo</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200 font-mono">
                      {fornecedor.qualificacaoInicial?.dataInicio || fornecedor.dataQualificacao || 'Aguardando Início'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block uppercase font-semibold">Lote Piloto / Amostras</span>
                    <span className={`font-bold ${
                      fornecedor.qualificacaoInicial?.lotePilotoStatus === 'Aprovado' ? 'text-emerald-600' :
                      fornecedor.qualificacaoInicial?.lotePilotoStatus === 'Reprovado' ? 'text-rose-600' :
                      'text-amber-600'
                    }`}>
                      {fornecedor.qualificacaoInicial?.lotePilotoStatus || (fornecedor.statusQualificacao === 'Qualificado' ? 'Aprovado' : 'Pendente / Em Testes')}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block uppercase font-semibold">Auditoria de Homologação</span>
                    <span className={`font-bold ${
                      fornecedor.qualificacaoInicial?.auditoriaInicialStatus === 'Conforme' ? 'text-emerald-600' :
                      fornecedor.qualificacaoInicial?.auditoriaInicialStatus === 'Não Conforme' ? 'text-rose-600' :
                      'text-slate-500'
                    }`}>
                      {fornecedor.qualificacaoInicial?.auditoriaInicialStatus || (fornecedor.auditorias && fornecedor.auditorias.length > 0 ? 'Conforme' : 'Não Realizada')}
                    </span>
                  </div>
                </div>

                {/* Critérios Iniciais */}
                {fornecedor.qualificacaoInicial?.criterios && fornecedor.qualificacaoInicial.criterios.length > 0 ? (
                  <div className="space-y-2">
                    <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block">Critérios Técnicos Verificados:</span>
                    <div className="space-y-1.5">
                      {fornecedor.qualificacaoInicial.criterios.map(cr => (
                        <div key={cr.id} className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-800/40 rounded-lg text-xs">
                          <span className="text-slate-700 dark:text-slate-300 font-medium">{cr.descricao}</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            cr.status === 'Conforme' ? 'bg-emerald-100 text-emerald-800' :
                            cr.status === 'Não Conforme' ? 'bg-rose-100 text-rose-800' :
                            cr.status === 'Dispensado' ? 'bg-slate-200 text-slate-700' :
                            'bg-amber-100 text-amber-800'
                          }`}>
                            {cr.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-lg text-xs text-slate-500">
                    <p className="font-medium text-slate-700 dark:text-slate-300">Nenhum checklist de homologação inicial anexado.</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Os requisitos são validados conforme a criticidade ({fornecedor.criticidade}) e inspeções de recebimento na fábrica.</p>
                  </div>
                )}
              </div>

              {/* Fluxo de Aprovação em Etapas */}
              <div className="bg-white dark:bg-slate-800/60 p-5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-4">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center">
                  <CheckCircle2 className="w-4 h-4 mr-1.5 text-blue-600" />
                  Fluxo de Aprovação Formal (Qualidade, Compras, Diretoria)
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {(fornecedor.fluxoAprovacao || [
                    { 
                      id: 'f-1', 
                      etapa: 'Qualidade' as const, 
                      responsavelNome: fornecedor.statusQualificacao === 'Qualificado' ? 'Qualidade Vickytex' : 'Aguardando validação', 
                      data: fornecedor.dataQualificacao || undefined, 
                      status: (fornecedor.statusQualificacao === 'Qualificado' ? 'Aprovado' : fornecedor.statusQualificacao === 'Bloqueado' ? 'Reprovado' : 'Pendente') as any, 
                      justificativa: fornecedor.statusQualificacao === 'Qualificado' ? 'Homologação técnica aprovada.' : 'Aguardando conferência documental e técnica.' 
                    },
                    { 
                      id: 'f-2', 
                      etapa: 'Compras' as const, 
                      responsavelNome: fornecedor.statusQualificacao === 'Qualificado' ? 'Suprimentos Vickytex' : 'Aguardando validação', 
                      data: fornecedor.dataQualificacao || undefined, 
                      status: (fornecedor.statusQualificacao === 'Qualificado' ? 'Aprovado' : fornecedor.statusQualificacao === 'Bloqueado' ? 'Reprovado' : 'Pendente') as any, 
                      justificativa: fornecedor.statusQualificacao === 'Qualificado' ? 'Condições comerciais acordadas.' : 'Análise de cadastro e preços pendente.' 
                    },
                    { 
                      id: 'f-3', 
                      etapa: 'Diretoria' as const, 
                      responsavelNome: fornecedor.statusQualificacao === 'Qualificado' ? 'Diretoria Industrial' : 'Aguardando parecer final', 
                      data: fornecedor.dataQualificacao || undefined, 
                      status: (fornecedor.statusQualificacao === 'Qualificado' ? 'Aprovado' : fornecedor.statusQualificacao === 'Bloqueado' ? 'Reprovado' : 'Pendente') as any, 
                      justificativa: fornecedor.statusQualificacao === 'Qualificado' ? 'Homologação corporativa autorizada.' : 'Liberação para compras sujeita à aprovação das etapas anteriores.' 
                    }
                  ]).map(etapa => (
                    <div key={etapa.id} className="p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-150 dark:border-slate-700 text-xs space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-slate-800 dark:text-slate-200 uppercase">{etapa.etapa}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          etapa.status === 'Aprovado' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300' :
                          etapa.status === 'Reprovado' ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300' :
                          etapa.status === 'Aprovado Condicional' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300' :
                          'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                        }`}>
                          {etapa.status}
                        </span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-400">Por: <strong>{etapa.responsavelNome}</strong></p>
                      {etapa.data && <p className="text-[10px] font-mono text-slate-400">Em {etapa.data}</p>}
                      {etapa.justificativa && (
                        <p className={`text-[11px] italic border-l-2 pl-2 ${
                          etapa.status === 'Aprovado' ? 'border-emerald-500 text-slate-500' :
                          etapa.status === 'Reprovado' ? 'border-rose-500 text-rose-600' :
                          'border-slate-400 text-slate-500'
                        }`}>
                          {etapa.justificativa}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* ABA 4: DOCUMENTAÇÃO & CERTIFICAÇÕES */}
          {/* ======================================================== */}
          {activeTab === 4 && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Certificações & Documentos Legais (ISO 8.4)
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Certificados OEKO-TEX, licenças ambientais, fichas FISPQ, laudos RBC e contratos.
                  </p>
                </div>
                <button
                  onClick={() => onOpenNovoDocumento(fornecedor)}
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center shadow-xs"
                >
                  <PlusCircle className="w-3.5 h-3.5 mr-1.5" />
                  Novo Documento
                </button>
              </div>

              {(!fornecedor.documentos || fornecedor.documentos.length === 0) ? (
                <div className="p-8 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl space-y-2">
                  <FileCheck2 className="w-8 h-8 mx-auto text-slate-400" />
                  <p className="text-xs text-slate-500">Nenhum documento ou certificado anexado.</p>
                  <button
                    onClick={() => onOpenNovoDocumento(fornecedor)}
                    className="text-xs font-bold text-blue-600 hover:underline cursor-pointer"
                  >
                    Anexar primeiro documento
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {fornecedor.documentos.map(doc => (
                    <div key={doc.id} className="p-4 bg-white dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                            {doc.tipo}
                          </span>
                          <h4 className="font-bold text-xs text-slate-800 dark:text-slate-100 mt-1">{doc.titulo}</h4>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                          doc.status === 'Vigente' ? 'bg-emerald-100 text-emerald-800' :
                          doc.status === 'Vencendo em 30 dias' ? 'bg-amber-100 text-amber-800' :
                          'bg-rose-100 text-rose-800'
                        }`}>
                          {doc.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-500 font-mono pt-1">
                        <div>Nº: {doc.numeroDocumento || '-'}</div>
                        <div>Validade: {doc.dataValidade || 'Indeterminada'}</div>
                      </div>

                      {doc.anexoUrl && (
                        <a 
                          href={doc.anexoUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-xs font-bold text-blue-600 hover:underline pt-1"
                        >
                          <ExternalLink className="w-3.5 h-3.5 mr-1" />
                          Abrir Arquivo Digital
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ======================================================== */}
          {/* ABA 5: CONTROLE TÉCNICO UNIFICADO (INSPEÇÕES + AUDITORIAS) */}
          {/* ======================================================== */}
          {activeTab === 5 && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center">
                    <ClipboardCheck className="w-4 h-4 mr-1.5 text-blue-600" />
                    Controle Técnico Unificado: Inspeções de Lotes & Auditorias de Fábrica
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Verificação física de materiais têxteis no recebimento e auditorias de processo/planta do parceiro (ISO 9001: 8.4).
                  </p>
                </div>
                <div className="flex items-center space-x-2 shrink-0">
                  <button
                    onClick={() => onOpenNovaInspecao(fornecedor)}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center shadow-xs"
                  >
                    <PlusCircle className="w-3.5 h-3.5 mr-1.5" />
                    Nova Inspeção de Lote
                  </button>
                  <button
                    onClick={() => onOpenNovaAuditoria(fornecedor)}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center shadow-xs"
                  >
                    <CheckSquare className="w-3.5 h-3.5 mr-1.5" />
                    Agendar Auditoria
                  </button>
                </div>
              </div>

              {/* Cards de Resumo Integrado das Verificações */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-center">
                  <span className="text-[10px] text-slate-400 block uppercase font-semibold">Total Verificações</span>
                  <span className="text-lg font-black font-mono text-slate-800 dark:text-slate-100">{totalVerificacoes}</span>
                  <span className="text-[9px] text-slate-400 block">{totalInspecoes} lotes • {totalAuditorias} auditorias</span>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-center">
                  <span className="text-[10px] text-slate-400 block uppercase font-semibold">Aprovação Lotes</span>
                  <span className="text-lg font-black font-mono text-emerald-600">{stats.taxaAprovacao}%</span>
                  <span className="text-[9px] text-slate-400 block">{stats.lotesAprovados} de {stats.totalLotes} aprovados</span>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-center">
                  <span className="text-[10px] text-slate-400 block uppercase font-semibold">Média Auditorias</span>
                  <span className={`text-lg font-black font-mono ${mediaAuditorias >= 80 ? 'text-indigo-600' : mediaAuditorias > 0 ? 'text-amber-600' : 'text-slate-400'}`}>
                    {totalAuditorias > 0 ? `${mediaAuditorias}%` : 'Sem dados'}
                  </span>
                  <span className="text-[9px] text-slate-400 block">{totalAuditorias} auditoria(s) na fábrica</span>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-center">
                  <span className="text-[10px] text-slate-400 block uppercase font-semibold">Pontualidade (OTIF)</span>
                  <span className="text-lg font-black font-mono text-blue-600">{stats.taxaPontualidade}%</span>
                  <span className="text-[9px] text-slate-400 block">Defeito Médio: {stats.taxaDefeitoMedia}%</span>
                </div>
              </div>

              {/* Filtro de Visão Unificada / Específica */}
              <div className="flex items-center space-x-2 border-b border-slate-200 dark:border-slate-800 pb-2">
                <button
                  onClick={() => setFiltroVerificacao('todos')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    filtroVerificacao === 'todos'
                      ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  Todas as Verificações ({totalVerificacoes})
                </button>
                <button
                  onClick={() => setFiltroVerificacao('inspecoes')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
                    filtroVerificacao === 'inspecoes'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <ClipboardCheck className="w-3.5 h-3.5" />
                  <span>Inspeções de Lotes ({totalInspecoes})</span>
                </button>
                <button
                  onClick={() => setFiltroVerificacao('auditorias')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
                    filtroVerificacao === 'auditorias'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <CheckSquare className="w-3.5 h-3.5" />
                  <span>Auditorias de Fábrica ({totalAuditorias})</span>
                </button>
              </div>

              {/* Lista Unificada: Inspeções e Auditorias */}
              {totalVerificacoes === 0 ? (
                <div className="p-8 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl space-y-3">
                  <ClipboardCheck className="w-8 h-8 mx-auto text-slate-400" />
                  <div>
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Nenhuma verificação registrada ainda</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Você pode registrar inspeções de recebimento têxtil ou auditorias presenciais de fábrica.
                    </p>
                  </div>
                  <div className="flex justify-center space-x-2 pt-1">
                    <button
                      onClick={() => onOpenNovaInspecao(fornecedor)}
                      className="px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 transition cursor-pointer"
                    >
                      + Nova Inspeção de Lote
                    </button>
                    <button
                      onClick={() => onOpenNovaAuditoria(fornecedor)}
                      className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700 transition cursor-pointer"
                    >
                      + Agendar Auditoria
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Inspeções de Lote (se filtro for 'todos' ou 'inspecoes') */}
                  {filtroVerificacao !== 'auditorias' && fornecedor.historicoInspecoes && fornecedor.historicoInspecoes.map(insp => (
                    <div key={insp.id} className="p-4 bg-white dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
                      <div className="flex items-start justify-between flex-wrap gap-2">
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-extrabold text-xs text-slate-900 dark:text-white font-mono">
                              Lote #{insp.numeroLote}
                            </span>
                            {insp.notaFiscal && (
                              <span className="text-[11px] font-mono text-slate-500 bg-slate-100 dark:bg-slate-700 px-1.5 py-0.2 rounded">
                                {insp.notaFiscal}
                              </span>
                            )}
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              insp.resultado === 'Aprovado' ? 'bg-emerald-100 text-emerald-800' :
                              insp.resultado === 'Aprovado com Restrição' ? 'bg-amber-100 text-amber-800' :
                              'bg-rose-100 text-rose-800'
                            }`}>
                              {insp.resultado}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
                            Recebido em: {insp.dataRecebimento} • Qtd: {insp.quantidadeRecebida} {insp.unidade} • Inspetor: {insp.inspecionadoPor}
                          </span>
                        </div>

                        <div className="text-right text-xs">
                          <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
                            Defeito: {insp.taxaDefeitoPercentual}%
                          </span>
                          <span className={`block text-[10px] font-semibold ${insp.entregaNoPrazo ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {insp.entregaNoPrazo ? '✓ Entregue no prazo' : `✕ Atrasado (${insp.diasAtraso}d)`}
                          </span>
                        </div>
                      </div>

                      {/* Parâmetros Técnicos Estruturados (Resultado X Padrão, Unidade, Tolerâncias Mín/Máx) */}
                      {insp.parametrosTexteis?.itensParametros && insp.parametrosTexteis.itensParametros.length > 0 ? (
                        <div className="space-y-1.5 bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                          <div className="flex items-center justify-between pb-1.5 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-700 dark:text-slate-300">
                            <span className="flex items-center">
                              <ClipboardCheck className="w-3.5 h-3.5 mr-1 text-indigo-600" />
                              Parâmetros Inspecionados no Lote ({insp.parametrosTexteis.itensParametros.length} itens)
                            </span>
                            <span className="text-[10px] text-slate-500 font-normal">
                              Critérios ISO 9001: Resultado X Padrão com Tolerâncias
                            </span>
                          </div>

                          <div className="overflow-x-auto">
                            <table className="w-full text-left text-[11px] font-mono border-collapse">
                              <thead>
                                <tr className="text-slate-400 border-b border-slate-200 dark:border-slate-800 text-[10px] uppercase">
                                  <th className="py-1 px-1.5">Item / Parâmetro</th>
                                  <th className="py-1 px-1.5">Resultado X Padrão</th>
                                  <th className="py-1 px-1.5">Unidade</th>
                                  <th className="py-1 px-1.5">Tolerância (Mín - Máx)</th>
                                  <th className="py-1 px-1.5 text-right">Status</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-150 dark:divide-slate-800">
                                {insp.parametrosTexteis.itensParametros.map((item, pIdx) => {
                                  const numRes = typeof item.valorResultado === 'number' ? item.valorResultado : parseFloat(String(item.valorResultado).replace(',', '.'));
                                  const numPad = typeof item.valorPadrao === 'number' ? item.valorPadrao : parseFloat(String(item.valorPadrao).replace(',', '.'));
                                  const diff = (!isNaN(numRes) && !isNaN(numPad)) ? Number((numRes - numPad).toFixed(2)) : 0;
                                  
                                  return (
                                    <tr key={item.id || pIdx} className="hover:bg-white/60 dark:hover:bg-slate-800/40 transition-colors">
                                      <td className="py-1.5 px-1.5 font-bold text-slate-800 dark:text-slate-200 font-sans">
                                        {item.nome}
                                      </td>
                                      <td className="py-1.5 px-1.5 whitespace-nowrap">
                                        <span className="font-bold text-slate-900 dark:text-white">
                                          {item.valorResultado}
                                        </span>
                                        <span className="text-slate-400 mx-1">vs</span>
                                        <span className="text-slate-500">
                                          {item.valorPadrao}
                                        </span>
                                        <span className={`ml-1 text-[10px] font-bold ${
                                          diff === 0 ? 'text-slate-400' :
                                          diff > 0 ? 'text-indigo-600' : 'text-amber-600'
                                        }`}>
                                          (Δ {diff > 0 ? `+${diff}` : diff})
                                        </span>
                                      </td>
                                      <td className="py-1.5 px-1.5 text-slate-600 dark:text-slate-400 font-semibold">
                                        {item.unidadeMedida}
                                      </td>
                                      <td className="py-1.5 px-1.5 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                                        {item.toleranciaMin !== undefined && item.toleranciaMin !== '' ? item.toleranciaMin : '-∞'} até {item.toleranciaMax !== undefined && item.toleranciaMax !== '' ? item.toleranciaMax : '+∞'} {item.unidadeMedida}
                                      </td>
                                      <td className="py-1.5 px-1.5 text-right whitespace-nowrap">
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                          item.statusConformidade === 'Conforme'
                                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                            : item.statusConformidade === 'Alerta'
                                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                            : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                                        }`}>
                                          {item.statusConformidade}
                                        </span>
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      ) : insp.parametrosTexteis ? (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-50 dark:bg-slate-900/50 p-2.5 rounded-lg text-[11px] font-mono border border-slate-150 dark:border-slate-800">
                          {insp.parametrosTexteis.deltaE !== undefined && (
                            <div>
                              <span className="text-slate-400 block text-[9px] uppercase">Delta E (Cor)</span>
                              <span className={`font-bold ${insp.parametrosTexteis.deltaE <= 0.8 ? 'text-emerald-600' : 'text-amber-600'}`}>
                                {insp.parametrosTexteis.deltaE} ΔE
                              </span>
                            </div>
                          )}
                          {insp.parametrosTexteis.gramaturaReal !== undefined && (
                            <div>
                              <span className="text-slate-400 block text-[9px] uppercase">Gramatura</span>
                              <span className="font-bold text-slate-700 dark:text-slate-200">
                                {insp.parametrosTexteis.gramaturaReal} g/m²
                              </span>
                            </div>
                          )}
                          {insp.parametrosTexteis.larguraUtilCm !== undefined && (
                            <div>
                              <span className="text-slate-400 block text-[9px] uppercase">Largura Útil</span>
                              <span className="font-bold text-slate-700 dark:text-slate-200">
                                {insp.parametrosTexteis.larguraUtilCm} cm
                              </span>
                            </div>
                          )}
                          {insp.parametrosTexteis.encolhimentoComprimento !== undefined && (
                            <div>
                              <span className="text-slate-400 block text-[9px] uppercase">Encolhimento</span>
                              <span className="font-bold text-slate-700 dark:text-slate-200">
                                {insp.parametrosTexteis.encolhimentoComprimento}%
                              </span>
                            </div>
                          )}
                          {insp.parametrosTexteis.pontosPorPolegada !== undefined && (
                            <div>
                              <span className="text-slate-400 block text-[9px] uppercase">Pontos/Pol</span>
                              <span className="font-bold text-slate-700 dark:text-slate-200">
                                {insp.parametrosTexteis.pontosPorPolegada} SPI
                              </span>
                            </div>
                          )}
                          {insp.parametrosTexteis.conformidadeTabelaMedidas !== undefined && (
                            <div>
                              <span className="text-slate-400 block text-[9px] uppercase">Medidas</span>
                              <span className="font-bold text-slate-700 dark:text-slate-200">
                                {insp.parametrosTexteis.conformidadeTabelaMedidas}
                              </span>
                            </div>
                          )}
                          {insp.parametrosTexteis.posicionamentoEncaixe !== undefined && (
                            <div>
                              <span className="text-slate-400 block text-[9px] uppercase">Encaixe Estampa</span>
                              <span className="font-bold text-slate-700 dark:text-slate-200">
                                {insp.parametrosTexteis.posicionamentoEncaixe}
                              </span>
                            </div>
                          )}
                        </div>
                      ) : null}

                      {insp.observacoes && (
                        <p className="text-xs text-slate-600 dark:text-slate-300 italic bg-slate-50/50 dark:bg-slate-900/30 p-2 rounded border-l-2 border-slate-300">
                          {insp.observacoes}
                        </p>
                      )}
                    </div>
                  ))}

                  {/* Auditorias de Fábrica (se filtro for 'todos' ou 'auditorias') */}
                  {filtroVerificacao !== 'inspecoes' && fornecedor.auditorias && fornecedor.auditorias.map(aud => (
                    <div 
                      key={aud.id} 
                      className="p-4 bg-white dark:bg-slate-800/60 rounded-xl border border-indigo-200 dark:border-indigo-950/60 space-y-2.5 shadow-xs hover:border-indigo-400 transition-colors"
                    >
                      <div className="flex items-start justify-between flex-wrap gap-2">
                        <div>
                          <div className="flex items-center space-x-2 flex-wrap">
                            <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 flex items-center">
                              <CheckSquare className="w-3 h-3 mr-1 text-indigo-600" />
                              Auditoria Técnica (Fábrica / Processo)
                            </span>
                            <span className="font-extrabold text-xs font-mono text-indigo-700 dark:text-indigo-400">
                              {aud.codigo}
                            </span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                              {aud.tipoAuditoria}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400 font-mono block mt-1">
                            Realizada em: {aud.dataRealizada || aud.dataPlanejada} • Auditor Responsável: {aud.auditor}
                          </span>
                        </div>

                        <div className="flex items-center space-x-2.5">
                          <div className="text-right">
                            <span className="text-xs font-black text-slate-800 dark:text-slate-100 font-mono">
                              Nota: {aud.notaChecklist}%
                            </span>
                            <span className={`block text-[10px] font-bold ${
                              aud.resultado === 'Aprovado' ? 'text-emerald-600' : 'text-amber-600'
                            }`}>
                              {aud.resultado}
                            </span>
                          </div>
                          <div className="w-12 bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden hidden sm:block">
                            <div 
                              className={`h-full ${aud.notaChecklist >= 80 ? 'bg-indigo-600' : aud.notaChecklist >= 60 ? 'bg-amber-500' : 'bg-rose-500'}`}
                              style={{ width: `${Math.min(100, aud.notaChecklist || 0)}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      <p className="text-xs text-slate-600 dark:text-slate-300 bg-indigo-50/40 dark:bg-indigo-950/20 p-2.5 rounded-lg border border-indigo-100 dark:border-indigo-900/40">
                        <strong className="text-indigo-900 dark:text-indigo-300 font-semibold">Escopo Auditado:</strong> {aud.escopo}
                      </p>
                    </div>
                  ))}

                  {/* Avisos se filtro selecionado estiver sem registros */}
                  {filtroVerificacao === 'inspecoes' && (!fornecedor.historicoInspecoes || fornecedor.historicoInspecoes.length === 0) && (
                    <div className="p-6 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-slate-500 text-xs">
                      Nenhuma inspeção de lote têxtil registrada para este fornecedor.
                    </div>
                  )}
                  {filtroVerificacao === 'auditorias' && (!fornecedor.auditorias || fornecedor.auditorias.length === 0) && (
                    <div className="p-6 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-slate-500 text-xs">
                      Nenhuma auditoria presencial de fábrica registrada para este fornecedor.
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ======================================================== */}
          {/* ABA 6: NÃO CONFORMIDADES (RNC) & PLANOS CAPA */}
          {/* ======================================================== */}
          {activeTab === 6 && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center">
                    <FileWarning className="w-4 h-4 mr-1.5 text-rose-600" />
                    Não Conformidades & Planos de Ação Corretiva (CAPA / 5W2H)
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Rastreamento de problemas em lotes, causas raízes e eficácia comprovada.
                  </p>
                </div>
                <button
                  onClick={() => onOpenNovaRNC(fornecedor)}
                  className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center shadow-xs"
                >
                  <PlusCircle className="w-3.5 h-3.5 mr-1.5" />
                  Nova RNC de Fornecedor
                </button>
              </div>

              {/* Lista de RNCs */}
              {(!fornecedor.ocorrenciasRNC || fornecedor.ocorrenciasRNC.length === 0) ? (
                <div className="p-8 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl space-y-2">
                  <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-500" />
                  <p className="text-xs text-slate-600 font-bold">Nenhuma Não Conformidade aberta!</p>
                  <p className="text-[11px] text-slate-400">Fornecedor sem ocorrências ativas no histórico.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {fornecedor.ocorrenciasRNC.map(rnc => (
                    <div key={rnc.id} className="p-4 bg-white dark:bg-slate-800/60 rounded-xl border border-rose-200 dark:border-rose-900/40 space-y-2.5">
                      <div className="flex items-start justify-between flex-wrap gap-2">
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-extrabold text-xs text-rose-700 dark:text-rose-400 font-mono">
                              {rnc.codigoRNC || 'RNC-FORN'}
                            </span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              rnc.gravidade === 'Crítica' ? 'bg-rose-100 text-rose-800' :
                              rnc.gravidade === 'Grave' ? 'bg-orange-100 text-orange-800' : 'bg-amber-100 text-amber-800'
                            }`}>
                              Gravidade {rnc.gravidade}
                            </span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                              {rnc.status}
                            </span>
                          </div>
                          <h4 className="font-bold text-xs text-slate-900 dark:text-white mt-1">{rnc.titulo}</h4>
                          <span className="text-[10px] text-slate-400 font-mono">
                            Data: {rnc.dataOcorrencia} • Lote: {rnc.loteEnvolvido || 'Geral'} • Qtd: {rnc.quantidadeAfetada || '-'}
                          </span>
                        </div>
                      </div>

                      <p className="text-xs text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-900/50 p-2.5 rounded-lg border border-slate-150 dark:border-slate-800 leading-relaxed">
                        {rnc.descricao}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* Planos de Ação Associados */}
              {fornecedor.planosAcao && fornecedor.planosAcao.length > 0 && (
                <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Planos de Ação Corretiva (CAPA) em Andamento
                  </h4>
                  <div className="space-y-2.5">
                    {fornecedor.planosAcao.map(pa => (
                      <div key={pa.id} className="p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700 text-xs space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-800 dark:text-slate-100">{pa.titulo}</span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
                            {pa.status}
                          </span>
                        </div>
                        <p className="text-slate-600 dark:text-slate-400">
                          <strong>Causa Raiz:</strong> {pa.causaRaiz}
                        </p>
                        <p className="text-slate-600 dark:text-slate-400">
                          <strong>Ação Corretiva:</strong> {pa.acaoCorretiva}
                        </p>
                        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 font-mono">
                          <span>Resp. Fornecedor: {pa.responsavelFornecedor}</span>
                          <span>Prazo: {pa.prazo}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ======================================================== */}
          {/* ABA 7: AVALIAÇÕES (IQF) & REAVALIAÇÕES PERIÓDICAS */}
          {/* ======================================================== */}
          {activeTab === 7 && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center">
                    <Award className="w-4 h-4 mr-1.5 text-blue-600" />
                    Índice de Qualificação de Fornecedores (IQF)
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Avaliação técnica ISO 8.4 ponderada por qualidade, prazos, fichas e RNCs.
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => onRecalcularIQFAutomatico(fornecedor)}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center shadow-xs"
                  >
                    <Sparkles className="w-3.5 h-3.5 mr-1" />
                    Avaliar com Dados Reais
                  </button>
                  <button
                    onClick={() => onOpenNovaAvaliacao(fornecedor)}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center shadow-xs"
                  >
                    <PlusCircle className="w-3.5 h-3.5 mr-1" />
                    Nova Avaliação Manual
                  </button>
                </div>
              </div>

              {/* Card de Indicador do IQF Atual */}
              <div className="p-5 bg-linear-to-r from-slate-900 to-indigo-950 text-white rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">
                    Nota Atual Consolidada (IQF)
                  </span>
                  <div className="flex items-center space-x-3">
                    <span className="text-3xl font-black font-mono text-emerald-400">
                      {stats.iqfGeral}%
                    </span>
                    <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Faixa {stats.faixaIQF}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 text-center text-xs">
                  <div className="p-2.5 bg-white/5 rounded-xl border border-white/10">
                    <span className="text-[10px] text-slate-400 block uppercase">Qualidade Lotes</span>
                    <span className="font-bold text-white font-mono">{stats.scoreQualidadeLotes}/100</span>
                  </div>
                  <div className="p-2.5 bg-white/5 rounded-xl border border-white/10">
                    <span className="text-[10px] text-slate-400 block uppercase">Pontualidade</span>
                    <span className="font-bold text-white font-mono">{stats.scorePontualidade}/100</span>
                  </div>
                  <div className="p-2.5 bg-white/5 rounded-xl border border-white/10">
                    <span className="text-[10px] text-slate-400 block uppercase">Resolução RNC</span>
                    <span className="font-bold text-white font-mono">{stats.scoreAcoesCorretivas}/100</span>
                  </div>
                </div>
              </div>

              {/* Próxima Reavaliação Agendada */}
              <div className="p-4 bg-blue-50/50 dark:bg-blue-950/20 rounded-xl border border-blue-200 dark:border-blue-900/50 flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  <div>
                    <span className="font-bold text-slate-800 dark:text-slate-100">
                      Reavaliação Periódica Agendada:
                    </span>
                    <span className="ml-2 font-mono text-blue-700 dark:text-blue-300 font-bold">
                      {fornecedor.reavaliacao?.dataProximaReavaliacao || '2026-12-10'}
                    </span>
                  </div>
                </div>
                <span className="text-[11px] text-slate-500">
                  Periodicidade: a cada {fornecedor.reavaliacao?.periodicidadeMeses || (fornecedor.criticidade === 'Alta' ? 3 : 6)} meses
                </span>
              </div>

              {/* Histórico de Avaliações Anteriores */}
              <div className="space-y-3">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Histórico de Avaliações Registradas
                </h4>
                {fornecedor.historicoAvaliacoes && fornecedor.historicoAvaliacoes.map(ev => (
                  <div key={ev.id} className="p-4 bg-white dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="font-bold text-xs text-slate-800 dark:text-slate-100">
                          {ev.periodoReferencia || 'Ciclo de Avaliação'}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono block">
                          Realizado em: {ev.dataAvaliacao} por {ev.avaliador}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-base font-black font-mono text-slate-900 dark:text-white">
                          Score: {ev.notaGeral}%
                        </span>
                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                          ev.resultado === 'Aprovado' ? 'bg-emerald-100 text-emerald-800' :
                          ev.resultado === 'Aprovado com Restrições' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {ev.resultado}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 bg-slate-50 dark:bg-slate-900/50 p-2.5 rounded-lg text-xs font-mono">
                      <div>Qualidade: <strong>{ev.criterioQualidade}/100</strong></div>
                      <div>Pontualidade: <strong>{ev.criterioPrazo}/100</strong></div>
                      <div>Atendimento: <strong>{ev.criterioAtendimento}/100</strong></div>
                    </div>

                    {ev.parecerTecnico && (
                      <p className="text-xs text-slate-600 dark:text-slate-300 italic bg-slate-50/50 p-2 rounded border-l-2 border-slate-300">
                        {ev.parecerTecnico}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* ABA 8: RASTREABILIDADE & HISTÓRICO COMPLETO */}
          {/* ======================================================== */}
          {activeTab === 8 && (
            <div className="space-y-4 animate-fade-in">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center">
                <History className="w-4 h-4 mr-1.5 text-blue-600" />
                Trilha de Auditoria & Decisões ISO 9001
              </h3>

              {/* Histórico de Bloqueios e Desbloqueios */}
              {fornecedor.historicoBloqueios && fornecedor.historicoBloqueios.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block uppercase">
                    Registros de Bloqueio e Desbloqueio
                  </span>
                  {fornecedor.historicoBloqueios.map(hb => (
                    <div key={hb.id} className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700 text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800 dark:text-slate-100">{hb.tipo}</span>
                        <span className="text-[10px] font-mono text-slate-400">Em {hb.data} por {hb.responsavel}</span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-300">{hb.motivo}</p>
                      {hb.criteriosLiberacao && (
                        <p className="text-[11px] text-blue-600 dark:text-blue-400 italic">
                          Critérios: {hb.criteriosLiberacao}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Informações de Criação do Registro */}
              <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800 text-xs space-y-1 text-slate-500 font-mono">
                <div>ID do Fornecedor: {fornecedor.id}</div>
                <div>Data de Cadastro / Homologação Inicial: {fornecedor.dataQualificacao || '2026-01-15'}</div>
                <div>Última Atualização Registrada: {fornecedor.atualizadoEm || new Date().toISOString()}</div>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 dark:bg-slate-900 px-6 py-4 flex justify-between items-center border-t border-slate-200 dark:border-slate-800">
          <span className="text-xs text-slate-500">
            Fornecedor: <strong>{fornecedor.nomeFantasia}</strong> • Vickytex Têxtil
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-lg transition-colors cursor-pointer"
          >
            Fechar Ficha
          </button>
        </div>

      </div>
    </div>
  );
};
