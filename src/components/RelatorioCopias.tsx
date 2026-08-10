/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  FileText, 
  Send, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Search, 
  Filter, 
  Download, 
  RefreshCw, 
  Users, 
  Layers, 
  ShieldCheck, 
  FileCheck, 
  Printer, 
  ClipboardCheck,
  Check,
  Building,
  User,
  Calendar,
  Layers2
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { Documento, CopiaDistribuida } from '../types';
import { useAuth } from '../contexts/AuthContext';

interface RelatorioCopiasProps {
  documents: Documento[];
  onUpdateDocument: (doc: Documento) => void;
  onAddLog: (action: string, details: string, docId?: string) => void;
}

export const RelatorioCopias: React.FC<RelatorioCopiasProps> = ({
  documents,
  onUpdateDocument,
  onAddLog
}) => {
  const { user } = useAuth();
  
  // Estados para Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'TODOS' | 'Ativa' | 'Recolhida' | 'Substituída'>('TODOS');
  const [tipoFilter, setTipoFilter] = useState<'TODOS' | 'Digital Controlada' | 'Física Impressa'>('TODOS');
  const [setorFilter, setSetorFilter] = useState<string>('TODOS');

  // Estados do Simulador de Checklist de Auditoria de Rastreabilidade
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [auditStep, setAuditStep] = useState(1); // 1 = Seleção, 2 = Questionário, 3 = Resultado
  const [selectedCopyForAudit, setSelectedCopyForAudit] = useState<CopiaDistribuida | null>(null);
  const [selectedDocForAudit, setSelectedDocForAudit] = useState<Documento | null>(null);
  const [auditAnswers, setAuditAnswers] = useState({
    encontradaNoPosto: true,
    identificacaoControlada: true,
    revisaoCorreta: true,
    integridadeFisica: true,
    observacoes: ''
  });
  
  // Extrair todas as cópias de todos os documentos de forma achatada
  const todasCopias = useMemo(() => {
    const copiasList: Array<{ copia: CopiaDistribuida; documento: Documento }> = [];
    documents.forEach(doc => {
      if (doc.distribuicaoCopias && doc.distribuicaoCopias.length > 0) {
        doc.distribuicaoCopias.forEach(copia => {
          copiasList.push({ copia, documento: doc });
        });
      }
    });
    return copiasList;
  }, [documents]);

  // Lista única de setores para o filtro
  const setoresUnicos = useMemo(() => {
    const setores = new Set<string>();
    todasCopias.forEach(item => {
      setores.add(item.documento.setor);
    });
    return Array.from(setores);
  }, [todasCopias]);

  // Filtragem dos dados
  const copiasFiltradas = useMemo(() => {
    return todasCopias.filter(({ copia, documento }) => {
      const matchText = 
        documento.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        documento.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        copia.destinatario.toLowerCase().includes(searchTerm.toLowerCase()) ||
        copia.recebidoPor.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchStatus = statusFilter === 'TODOS' || copia.status === statusFilter;
      const matchTipo = tipoFilter === 'TODOS' || copia.tipo === tipoFilter;
      const matchSetor = setorFilter === 'TODOS' || documento.setor === setorFilter;

      return matchText && matchStatus && matchTipo && matchSetor;
    });
  }, [todasCopias, searchTerm, statusFilter, tipoFilter, setorFilter]);

  // Estatísticas Rápidas
  const stats = useMemo(() => {
    let ativas = 0;
    let recolhidas = 0;
    let substituidas = 0; // pendentes de recall
    let digitais = 0;
    let fisicas = 0;

    todasCopias.forEach(({ copia }) => {
      if (copia.status === 'Ativa') ativas++;
      if (copia.status === 'Recolhida') recolhidas++;
      if (copia.status === 'Substituída') substituidas++;
      
      if (copia.tipo === 'Digital Controlada') digitais++;
      if (copia.tipo === 'Física Impressa') fisicas++;
    });

    const total = todasCopias.length;
    const recallRate = recolhidas + substituidas > 0 
      ? Math.round((recolhidas / (recolhidas + substituidas)) * 100) 
      : 100;

    return {
      total,
      ativas,
      recolhidas,
      substituidas,
      digitais,
      fisicas,
      recallRate
    };
  }, [todasCopias]);

  // Dados para os Gráficos
  const graficoTipos = useMemo(() => {
    return [
      { name: 'Digital Controlada', value: stats.digitais, color: '#3b82f6' },
      { name: 'Física Impressa', value: stats.fisicas, color: '#f59e0b' }
    ];
  }, [stats]);

  const graficoSetores = useMemo(() => {
    const contagem: Record<string, { Ativas: number; Substituidas: number; Recolhidas: number }> = {};
    
    todasCopias.forEach(({ copia, documento }) => {
      const setor = documento.setor;
      if (!contagem[setor]) {
        contagem[setor] = { Ativas: 0, Substituidas: 0, Recolhidas: 0 };
      }
      if (copia.status === 'Ativa') contagem[setor].Ativas++;
      if (copia.status === 'Substituída') contagem[setor].Substituidas++;
      if (copia.status === 'Recolhida') contagem[setor].Recolhidas++;
    });

    return Object.entries(contagem).map(([name, counts]) => ({
      name,
      ...counts
    }));
  }, [todasCopias]);

  // Ação para realizar recall (recolhimento) de uma cópia
  const handleRecallCopy = (docId: string, copyId: string) => {
    const doc = documents.find(d => d.id === docId);
    if (!doc || !doc.distribuicaoCopias) return;

    const updatedCopias = doc.distribuicaoCopias.map(c => {
      if (c.id === copyId) {
        return {
          ...c,
          status: 'Recolhida' as const,
          dataRecolhimento: new Date().toISOString().split('T')[0],
          recolhidoPor: user?.name || user?.email || 'qualidade@vickytex.com.br'
        };
      }
      return c;
    });

    const updatedDoc: Documento = {
      ...doc,
      distribuicaoCopias: updatedCopias,
      updatedAt: new Date().toISOString()
    };

    onUpdateDocument(updatedDoc);
    
    const targetCopy = doc.distribuicaoCopias.find(c => c.id === copyId);
    onAddLog(
      'Recall de Cópia', 
      `Recolhimento concluído para a cópia obsoleta do documento ${doc.codigo} no destinatário "${targetCopy?.destinatario}". Cópia física/digital destruída ou inutilizada para evitar uso inadvertido.`,
      doc.id
    );
  };

  // Imprimir Relatório de Rastreabilidade (ISO 9001:2015)
  const handlePrintReport = () => {
    const existing = document.querySelector('.print-container');
    if (existing) {
      existing.remove();
    }
    
    const printContainer = document.createElement('div');
    printContainer.className = 'print-container';
    
    const rows = copiasFiltradas.map(({ copia, documento }) => `
      <tr>
        <td style="border: 1px solid #ddd; padding: 8px; font-family: monospace;">${documento.codigo}</td>
        <td style="border: 1px solid #ddd; padding: 8px;">${documento.titulo}</td>
        <td style="border: 1px solid #ddd; padding: 8px; font-weight: bold;">${copia.destinatario}</td>
        <td style="border: 1px solid #ddd; padding: 8px;">${copia.tipo}</td>
        <td style="border: 1px solid #ddd; padding: 8px; font-weight: 500;">${copia.recebidoPor}</td>
        <td style="border: 1px solid #ddd; padding: 8px; font-family: monospace;">${copia.dataEntrega}</td>
        <td style="border: 1px solid #ddd; padding: 8px; text-transform: uppercase; font-weight: bold; color: ${
          copia.status === 'Ativa' ? '#10b981' : copia.status === 'Substituída' ? '#f59e0b' : '#64748b'
        };">
          ${copia.status === 'Substituída' ? 'Substituída (Requer Recall)' : copia.status}
        </td>
      </tr>
    `).join('');

    const content = `
      <style>
        @media print {
          body { font-family: sans-serif; color: #333; margin: 20px; }
          .no-print { display: none; }
          h2 { color: #1e3a8a; border-bottom: 2px solid #1e3a8a; padding-bottom: 8px; }
          table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 11px; }
          th { background-color: #f3f4f6; text-align: left; font-weight: bold; }
        }
      </style>
      <div style="font-family: sans-serif; padding: 30px; max-width: 900px; margin: 0 auto;">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #0f172a; padding-bottom: 12px;">
          <div>
            <h1 style="font-size: 20px; font-weight: 800; margin: 0; color: #1e3a8a;">VICKYTEX TEXTIL - SGQ</h1>
            <p style="font-size: 11px; color: #64748b; margin: 4px 0 0 0;">Relatório de Auditoria e Rastreabilidade de Cópias Controladas (ISO 9001:2015 7.5.3)</p>
          </div>
          <div style="text-align: right; font-size: 11px; color: #64748b;">
            <strong>Data do Relatório:</strong> ${new Date().toLocaleDateString('pt-BR')}<br>
            <strong>Responsável:</strong> ${user?.name || user?.email || 'Qualidade'}
          </div>
        </div>

        <div style="margin: 20px 0; display: grid; grid-template-cols: repeat(4, 1fr); gap: 10px;">
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 10px; border-radius: 8px; text-align: center;">
            <div style="font-size: 10px; color: #64748b; text-transform: uppercase; font-weight: bold;">Cópias Ativas</div>
            <div style="font-size: 18px; font-weight: 800; margin-top: 5px; color: #10b981;">${stats.ativas}</div>
          </div>
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 10px; border-radius: 8px; text-align: center;">
            <div style="font-size: 10px; color: #64748b; text-transform: uppercase; font-weight: bold;">Substituídas (Em Recall)</div>
            <div style="font-size: 18px; font-weight: 800; margin-top: 5px; color: #f59e0b;">${stats.substituidas}</div>
          </div>
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 10px; border-radius: 8px; text-align: center;">
            <div style="font-size: 10px; color: #64748b; text-transform: uppercase; font-weight: bold;">Recolhidas</div>
            <div style="font-size: 18px; font-weight: 800; margin-top: 5px; color: #3b82f6;">${stats.recolhidas}</div>
          </div>
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 10px; border-radius: 8px; text-align: center;">
            <div style="font-size: 10px; color: #64748b; text-transform: uppercase; font-weight: bold;">Taxa de Recall Físico</div>
            <div style="font-size: 18px; font-weight: 800; margin-top: 5px; color: #1e3a8a;">${stats.recallRate}%</div>
          </div>
        </div>

        <table style="width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 11px;">
          <thead>
            <tr style="background-color: #f1f5f9;">
              <th style="border: 1px solid #cbd5e1; padding: 8px;">Código</th>
              <th style="border: 1px solid #cbd5e1; padding: 8px;">Título da Informação Documentada</th>
              <th style="border: 1px solid #cbd5e1; padding: 8px;">Posto / Destinatário</th>
              <th style="border: 1px solid #cbd5e1; padding: 8px;">Meio/Tipo</th>
              <th style="border: 1px solid #cbd5e1; padding: 8px;">Assinatura/Recebedor</th>
              <th style="border: 1px solid #cbd5e1; padding: 8px;">Data de Entrega</th>
              <th style="border: 1px solid #cbd5e1; padding: 8px;">Status Atual</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>

        <div style="margin-top: 40px; border-top: 1px solid #cbd5e1; pt-20; display: flex; justify-content: space-between; font-size: 11px; color: #64748b;">
          <div>
            <p style="margin-bottom: 40px;">Emissão por:</p>
            <div style="border-top: 1px solid #64748b; width: 220px; text-align: center; padding-top: 5px;">
              ${user?.name || user?.email || 'Qualidade (SGQ)'}
            </div>
          </div>
          <div style="text-align: right;">
            <p style="margin-bottom: 40px;">Homologação Auditoria:</p>
            <div style="border-top: 1px solid #64748b; width: 220px; text-align: center; padding-top: 5px; display: inline-block;">
              Assinatura Eletrônica SGQ
            </div>
          </div>
        </div>

        <div style="margin-top: 30px; text-align: center; font-size: 9px; color: #94a3b8;" class="no-print">
          <button onclick="window.print()" style="padding: 8px 20px; background-color: #2563eb; color: white; border: none; border-radius: 6px; font-weight: bold; cursor: pointer; font-size: 12px;">
            Imprimir Relatório Oficial
          </button>
        </div>
      </div>
    `;

    printContainer.innerHTML = content;
    document.body.appendChild(printContainer);

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write('<html><head><title>Relatório de Rastreabilidade de Cópias - SGQ</title></head><body>');
      printWindow.document.write(content);
      printWindow.document.write('</body></html>');
      printWindow.document.close();
    }
  };

  // Abrir modal de simulação de auditoria
  const startAuditSimulation = (item: { copia: CopiaDistribuida; documento: Documento }) => {
    setSelectedCopyForAudit(item.copia);
    setSelectedDocForAudit(item.documento);
    setAuditStep(1);
    setAuditAnswers({
      encontradaNoPosto: true,
      identificacaoControlada: true,
      revisaoCorreta: item.copia.status === 'Ativa', // Se estiver ativa, teoricamente está na rev correta
      integridadeFisica: true,
      observacoes: ''
    });
    setIsAuditModalOpen(true);
  };

  // Confirmar simulação de auditoria
  const submitAuditSimulation = () => {
    if (!selectedCopyForAudit || !selectedDocForAudit) return;

    // Gerar mensagem de log da auditoria
    const resultado = (auditAnswers.encontradaNoPosto && auditAnswers.identificacaoControlada && auditAnswers.revisaoCorreta && auditAnswers.integridadeFisica) 
      ? 'CONFORME' 
      : 'NÃO CONFORME (NC)';

    const detalhes = `Auditoria de Rastreabilidade no posto "${selectedCopyForAudit.destinatario}" para cópia do documento ${selectedDocForAudit.codigo} (Rev ${selectedDocForAudit.revisao}). Resultado: ${resultado}. Obs: ${auditAnswers.observacoes || 'Nenhuma'}.`;

    onAddLog('Auditoria Interna', detalhes, selectedDocForAudit.id);
    
    // Se não estiver conforme, propor a criação de uma NC/Recall
    setAuditStep(3);
  };

  return (
    <div className="space-y-6">
      
      {/* Cards de Estatísticas Rápidas (Bento Grid) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Cópias Ativas</span>
            <div className="p-2 bg-emerald-50 dark:bg-emerald-950/20 rounded-lg text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white font-mono">
              {stats.ativas.toString().padStart(2, '0')}
            </span>
            <div className="flex items-center gap-1.5 mt-2">
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div 
                  className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
                  style={{ width: `${stats.total > 0 ? (stats.ativas / stats.total) * 100 : 0}%` }}
                />
              </div>
              <span className="text-[10px] font-mono font-bold text-slate-500">
                {stats.total > 0 ? Math.round((stats.ativas / stats.total) * 100) : 0}%
              </span>
            </div>
            <p className="text-[10px] text-slate-400 mt-2">Em uso nos postos produtivos e tablets</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Substituídas / Pendentes Recall</span>
            <div className="p-2 bg-amber-50 dark:bg-amber-950/20 rounded-lg text-amber-600 dark:text-amber-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className={`text-3xl font-extrabold font-mono ${stats.substituidas > 0 ? 'text-amber-500' : 'text-slate-900 dark:text-white'}`}>
              {stats.substituidas.toString().padStart(2, '0')}
            </span>
            <div className="flex items-center gap-1.5 mt-2">
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div 
                  className="bg-amber-500 h-full rounded-full transition-all duration-500" 
                  style={{ width: `${stats.total > 0 ? (stats.substituidas / stats.total) * 100 : 0}%` }}
                />
              </div>
              <span className="text-[10px] font-mono font-bold text-slate-500">
                {stats.total > 0 ? Math.round((stats.substituidas / stats.total) * 100) : 0}%
              </span>
            </div>
            <p className="text-[10px] text-slate-400 mt-2">Cópias desatualizadas pendentes de recall</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Recolhidas (Recall Completo)</span>
            <div className="p-2 bg-blue-50 dark:bg-blue-950/20 rounded-lg text-blue-600 dark:text-blue-400">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white font-mono">
              {stats.recolhidas.toString().padStart(2, '0')}
            </span>
            <div className="flex items-center gap-1.5 mt-2">
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div 
                  className="bg-blue-500 h-full rounded-full transition-all duration-500" 
                  style={{ width: `${stats.total > 0 ? (stats.recolhidas / stats.total) * 100 : 0}%` }}
                />
              </div>
              <span className="text-[10px] font-mono font-bold text-slate-500">
                {stats.total > 0 ? Math.round((stats.recolhidas / stats.total) * 100) : 0}%
              </span>
            </div>
            <p className="text-[10px] text-slate-400 mt-2">Cópias obsoletas recolhidas e destruídas</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Eficiência de Rastreamento</span>
            <div className="p-2 bg-violet-50 dark:bg-violet-950/20 rounded-lg text-violet-600 dark:text-violet-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className={`text-3xl font-extrabold font-mono ${stats.recallRate < 90 ? 'text-rose-500' : 'text-emerald-500'}`}>
              {stats.recallRate}%
            </span>
            <div className="flex items-center gap-1.5 mt-2">
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${stats.recallRate < 90 ? 'bg-rose-500' : 'bg-emerald-500'}`} 
                  style={{ width: `${stats.recallRate}%` }}
                />
              </div>
            </div>
            <p className="text-[10px] text-slate-400 mt-2">Taxa de recolhimento de cópias obsoletas</p>
          </div>
        </div>

      </div>

      {/* Seção Gráfica e de Rastreabilidade */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Gráfico de Distribuição por Tipo (Pie Chart) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-2xs">
          <div className="mb-4">
            <h3 className="text-xs font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider flex items-center">
              <Layers className="w-4 h-4 mr-1.5 text-blue-500" />
              Tipo de Cópia Controlada
            </h3>
            <p className="text-[10px] text-slate-400 italic">Proporção entre meio físico impresso e digital controlado</p>
          </div>
          
          <div className="h-[180px] w-full flex items-center justify-center">
            {stats.total > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={graficoTipos}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {graficoTipos.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(15, 23, 42, 0.95)', 
                      borderRadius: '8px', 
                      border: 'none',
                      color: '#fff',
                      fontSize: '11px'
                    }} 
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-slate-400 text-[11px] italic">Sem dados disponíveis</div>
            )}
          </div>

          <div className="flex justify-center gap-6 text-[10px] pt-2 border-t border-slate-150 dark:border-slate-800 mt-2">
            {graficoTipos.map((item, idx) => (
              <div key={idx} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-slate-600 dark:text-slate-400 font-medium">{item.name}</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">({item.value})</span>
              </div>
            ))}
          </div>
        </div>

        {/* Gráfico de Distribuição por Setor / Posto (Bar Chart) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-2xs lg:col-span-2">
          <div className="mb-4">
            <h3 className="text-xs font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider flex items-center">
              <Users className="w-4 h-4 mr-1.5 text-blue-500" />
              Rastreabilidade de Cópias por Setor
            </h3>
            <p className="text-[10px] text-slate-400 italic">Volume de cópias distribuídas e seu respectivo status nos setores produtivos</p>
          </div>

          <div className="h-[180px] w-full">
            {stats.total > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={graficoSetores} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={9} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={9} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(15, 23, 42, 0.95)', 
                      borderRadius: '8px', 
                      border: 'none',
                      color: '#fff',
                      fontSize: '11px'
                    }} 
                  />
                  <Legend iconSize={8} wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
                  <Bar dataKey="Ativas" fill="#10b981" radius={[2, 2, 0, 0]} name="Ativas" />
                  <Bar dataKey="Substituidas" fill="#f59e0b" radius={[2, 2, 0, 0]} name="Substituídas" />
                  <Bar dataKey="Recolhidas" fill="#3b82f6" radius={[2, 2, 0, 0]} name="Recolhidas" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-[11px] italic">Sem dados disponíveis</div>
            )}
          </div>
        </div>

      </div>

      {/* Tabela de Rastreabilidade e Filtros */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4">
        
        {/* Filtros e Busca */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-100">Registros Individuais de Distribuição</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Pesquise e gerencie o histórico e o recolhimento (recall) das cópias.</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handlePrintReport}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-lg text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              Relatório Completo
            </button>
          </div>
        </div>

        {/* Linha de pesquisa e seletores de filtro */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Código, título, recebedor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300 cursor-pointer focus:outline-hidden"
            >
              <option value="TODOS">Todos Status</option>
              <option value="Ativa">Ativa (Em Uso)</option>
              <option value="Substituída">Substituída (Requer Recall)</option>
              <option value="Recolhida">Recolhida (Recall Concluído)</option>
            </select>
          </div>

          <div>
            <select
              value={tipoFilter}
              onChange={(e) => setTipoFilter(e.target.value as any)}
              className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300 cursor-pointer focus:outline-hidden"
            >
              <option value="TODOS">Todos Tipos</option>
              <option value="Digital Controlada">Digital Controlada</option>
              <option value="Física Impressa">Física Impressa</option>
            </select>
          </div>

          <div>
            <select
              value={setorFilter}
              onChange={(e) => setSetorFilter(e.target.value)}
              className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300 cursor-pointer focus:outline-hidden"
            >
              <option value="TODOS">Todos Setores</option>
              {setoresUnicos.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Tabela Responsiva */}
        <div className="overflow-x-auto border border-slate-100 dark:border-slate-800 rounded-xl">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-150 dark:border-slate-800">
                <th className="p-3">Doc / Código</th>
                <th className="p-3">Destinatário (Local)</th>
                <th className="p-3">Tipo / Meio</th>
                <th className="p-3">Responsável Recebedor</th>
                <th className="p-3">Data Entrega</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {copiasFiltradas.length > 0 ? (
                copiasFiltradas.map(({ copia, documento }) => (
                  <tr key={copia.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10 transition-colors">
                    <td className="p-3">
                      <div className="flex flex-col">
                        <span className="font-mono font-bold text-blue-600 dark:text-blue-400">{documento.codigo}</span>
                        <span className="text-[10px] text-slate-400 line-clamp-1">{documento.titulo}</span>
                      </div>
                    </td>
                    <td className="p-3 font-semibold text-slate-800 dark:text-slate-200">
                      {copia.destinatario}
                    </td>
                    <td className="p-3">
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase ${
                        copia.tipo === 'Digital Controlada'
                          ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400'
                          : 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400'
                      }`}>
                        {copia.tipo}
                      </span>
                    </td>
                    <td className="p-3 text-slate-600 dark:text-slate-300">
                      {copia.recebidoPor}
                    </td>
                    <td className="p-3 font-mono text-[10px] text-slate-500">
                      {copia.dataEntrega}
                    </td>
                    <td className="p-3">
                      <div className="flex flex-col gap-0.5">
                        <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-bold w-fit ${
                          copia.status === 'Ativa'
                            ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400'
                            : copia.status === 'Substituída'
                            ? 'bg-rose-50 text-rose-500 dark:bg-rose-950/30 dark:text-rose-400 animate-pulse'
                            : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                        }`}>
                          {copia.status === 'Substituída' ? 'SUBSTITUÍDA (REQUER RECALL)' : copia.status.toUpperCase()}
                        </span>
                        {copia.dataRecolhimento && (
                          <span className="text-[8px] text-slate-400 italic">
                            Recolhida em {copia.dataRecolhimento}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        
                        {/* Botão de Auditoria In Loco */}
                        {copia.status === 'Ativa' && (
                          <button
                            onClick={() => startAuditSimulation({ copia, documento })}
                            className="px-2 py-1 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 dark:hover:bg-blue-900/60 text-blue-600 dark:text-blue-400 rounded-lg text-[10px] font-bold transition-all cursor-pointer flex items-center gap-0.5"
                            title="Auditar cópia in-loco (ISO 9001:2015)"
                          >
                            <ClipboardCheck className="w-3 h-3" />
                            Auditar
                          </button>
                        )}

                        {/* Botão de Recall imediato */}
                        {copia.status !== 'Recolhida' && (user?.role === 'Qualidade' || user?.role === 'Supervisor' || user?.role === 'Administrador') && (
                          <button
                            onClick={() => handleRecallCopy(documento.id, copia.id)}
                            className="px-2 py-1 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 rounded-lg text-[10px] font-bold transition-all cursor-pointer flex items-center gap-0.5"
                            title="Registrar recolhimento e destinação da cópia"
                          >
                            <RefreshCw className="w-3 h-3" />
                            Registrar Recall
                          </button>
                        )}

                        {copia.status === 'Recolhida' && (
                          <span className="text-[10px] text-slate-400 italic font-medium flex items-center gap-0.5">
                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                            Concluído
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400 italic">
                    Nenhuma cópia correspondente aos filtros de rastreabilidade.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>

      {/* MODAL DO SIMULADOR DE AUDITORIA DE RASTREABILIDADE */}
      {isAuditModalOpen && selectedCopyForAudit && selectedDocForAudit && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-2xl max-w-lg w-full space-y-6">
            
            <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <span className="text-[10px] bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                  Auditoria de Rastreabilidade (ISO 9001:2015)
                </span>
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white mt-1.5">
                  Verificação In Loco de Cópia Controlada
                </h3>
              </div>
              <button 
                onClick={() => setIsAuditModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer bg-transparent border-none"
              >
                &times;
              </button>
            </div>

            {auditStep === 1 && (
              <div className="space-y-4 text-xs">
                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl space-y-2 border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <Building className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-semibold text-slate-700 dark:text-slate-300">Posto/Setor: </span>
                    <strong className="text-slate-900 dark:text-slate-100">{selectedCopyForAudit.destinatario}</strong>
                  </div>
                  <div className="flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-semibold text-slate-700 dark:text-slate-300">Documento Alvo: </span>
                    <strong className="text-slate-900 dark:text-slate-100">{selectedDocForAudit.codigo} - {selectedDocForAudit.titulo}</strong>
                  </div>
                  <div className="flex items-center gap-2">
                    <Layers2 className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-semibold text-slate-700 dark:text-slate-300">Revisão Vigente: </span>
                    <strong className="text-slate-900 dark:text-slate-100 font-mono">Rev {selectedDocForAudit.revisao.toString().padStart(2, '0')}</strong>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-semibold text-slate-700 dark:text-slate-300">Responsável Declarado: </span>
                    <strong className="text-slate-900 dark:text-slate-100">{selectedCopyForAudit.recebidoPor}</strong>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-bold text-[11px] text-slate-400 uppercase tracking-wider">Critérios de Conformidade</h4>
                  
                  {/* Pergunta 1 */}
                  <label className="flex items-center justify-between p-2 hover:bg-slate-50 dark:hover:bg-slate-800/30 rounded-lg cursor-pointer">
                    <span className="text-slate-700 dark:text-slate-300">1. A cópia controlada foi localizada fisicamente/digitalmente no posto?</span>
                    <input
                      type="checkbox"
                      checked={auditAnswers.encontradaNoPosto}
                      onChange={(e) => setAuditAnswers({ ...auditAnswers, encontradaNoPosto: e.target.checked })}
                      className="w-4 h-4 text-blue-600 rounded cursor-pointer"
                    />
                  </label>

                  {/* Pergunta 2 */}
                  <label className="flex items-center justify-between p-2 hover:bg-slate-50 dark:hover:bg-slate-800/30 rounded-lg cursor-pointer">
                    <span className="text-slate-700 dark:text-slate-300">2. Possui carimbo/identificação legível de "CÓPIA CONTROLADA"?</span>
                    <input
                      type="checkbox"
                      checked={auditAnswers.identificacaoControlada}
                      onChange={(e) => setAuditAnswers({ ...auditAnswers, identificacaoControlada: e.target.checked })}
                      className="w-4 h-4 text-blue-600 rounded cursor-pointer"
                    />
                  </label>

                  {/* Pergunta 3 */}
                  <label className="flex items-center justify-between p-2 hover:bg-slate-50 dark:hover:bg-slate-800/30 rounded-lg cursor-pointer">
                    <span className="text-slate-700 dark:text-slate-300">3. A revisão da cópia confere exatamente com a Lista Mestra?</span>
                    <input
                      type="checkbox"
                      checked={auditAnswers.revisaoCorreta}
                      onChange={(e) => setAuditAnswers({ ...auditAnswers, revisaoCorreta: e.target.checked })}
                      className="w-4 h-4 text-blue-600 rounded cursor-pointer"
                    />
                  </label>

                  {/* Pergunta 4 */}
                  <label className="flex items-center justify-between p-2 hover:bg-slate-50 dark:hover:bg-slate-800/30 rounded-lg cursor-pointer">
                    <span className="text-slate-700 dark:text-slate-300">4. A cópia está em bom estado de conservação/integridade?</span>
                    <input
                      type="checkbox"
                      checked={auditAnswers.integridadeFisica}
                      onChange={(e) => setAuditAnswers({ ...auditAnswers, integridadeFisica: e.target.checked })}
                      className="w-4 h-4 text-blue-600 rounded cursor-pointer"
                    />
                  </label>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Notas de Auditoria / Evidências</label>
                    <textarea
                      placeholder="Ex: Cópia física visível sob a mesa de corte, em pasta de PVC transparente..."
                      value={auditAnswers.observacoes}
                      onChange={(e) => setAuditAnswers({ ...auditAnswers, observacoes: e.target.value })}
                      className="w-full p-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-1 focus:ring-blue-500 h-16 resize-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => setIsAuditModalOpen(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg font-bold cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={submitAuditSimulation}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold cursor-pointer flex items-center gap-1"
                  >
                    <FileCheck className="w-4 h-4" />
                    Salvar Resultado
                  </button>
                </div>
              </div>
            )}

            {auditStep === 3 && (
              <div className="space-y-4 text-xs text-center py-4">
                <div className="mx-auto w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-500 flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-slate-800 dark:text-slate-100">Resultado Salvo e Assinado Digitalmente</h4>
                  <p className="text-slate-500 mt-1">A auditoria de rastreabilidade foi registrada na base de registros do SGQ com sucesso.</p>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl text-left border border-slate-100 dark:border-slate-800 space-y-2">
                  <p className="font-semibold text-slate-700 dark:text-slate-300">Evidência Gerada:</p>
                  <p className="text-slate-500 italic">"Resultado: {(auditAnswers.encontradaNoPosto && auditAnswers.identificacaoControlada && auditAnswers.revisaoCorreta && auditAnswers.integridadeFisica) ? 'CONFORME' : 'NÃO CONFORME'}"</p>
                  <p className="text-slate-400 text-[10px]">Log de auditoria assinado digitalmente por {user?.name || user?.email}.</p>
                </div>
                <button
                  onClick={() => setIsAuditModalOpen(false)}
                  className="px-6 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold cursor-pointer"
                >
                  Concluir e Fechar
                </button>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
};
