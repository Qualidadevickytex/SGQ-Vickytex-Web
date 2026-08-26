import React, { useState, useMemo } from 'react';
import { Search, Filter, ArrowUpDown, FileSpreadsheet, Printer, QrCode as QrIcon, Plus, Eye, Check, Trash2 } from 'lucide-react';
import { Documento, DocumentType, SectorType, DocumentStatus } from '../../types';

interface DocumentoListaMestraProps {
  documents: Documento[];
  sectorsList: string[];
  docTypesList: { type: DocumentType; name: string; description: string }[];
  selectedDocId: string | undefined;
  setSelectedDocId: (id: string | undefined) => void;
  onOpenNewDoc: () => void;
  onOpenEditDoc: (doc: Documento) => void;
  onShowQrModal: (doc: Documento) => void;
  canCreateDocs: boolean;
  canEditDocs?: boolean;
  canDeleteDocs?: boolean;
  canModifyItem?: (sector?: string) => boolean;
  canDeleteItem?: (sector?: string) => boolean;
  onDeleteDoc?: (id: string) => void;
}

type SortField = 'codigo' | 'titulo' | 'status' | 'revisao' | 'dataEmissao' | 'proximaRevisao' | 'setor';
type SortOrder = 'asc' | 'desc';

export const DocumentoListaMestra: React.FC<DocumentoListaMestraProps> = ({
  documents,
  sectorsList,
  docTypesList,
  selectedDocId,
  setSelectedDocId,
  onOpenNewDoc,
  onOpenEditDoc,
  onShowQrModal,
  canCreateDocs,
  canEditDocs = true,
  canDeleteDocs = true,
  canModifyItem,
  canDeleteItem,
  onDeleteDoc
}) => {
  // Estados de Filtros específicos solicitados
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<DocumentType | 'TODOS'>('TODOS');
  const [filterSector, setFilterSector] = useState<SectorType | 'TODOS'>('TODOS');
  const [filterStatus, setFilterStatus] = useState<DocumentStatus | 'TODOS'>('TODOS');
  const [filterResponsavel, setFilterResponsavel] = useState<string>('TODOS');

  // Estados de Ordenação
  const [sortField, setSortField] = useState<SortField>('codigo');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  // Estado para exclusão segura dentro do iframe
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Obter lista única de responsáveis
  const responsaveisList = useMemo(() => {
    const list = new Set<string>();
    documents.forEach(doc => {
      if (doc.elaborador) list.add(doc.elaborador);
      if (doc.revisor) list.add(doc.revisor);
      if (doc.aprovador) list.add(doc.aprovador);
    });
    return Array.from(list);
  }, [documents]);

  // Função para mudar a ordenação
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // Filtragem dos documentos baseados nos filtros da planilha
  const filteredDocs = useMemo(() => {
    return documents.filter(doc => {
      const matchSearch = 
        doc.codigo.toLowerCase().includes(search.toLowerCase()) ||
        doc.titulo.toLowerCase().includes(search.toLowerCase()) ||
        doc.objetivo.toLowerCase().includes(search.toLowerCase());

      const matchType = filterType === 'TODOS' || doc.tipo === filterType;
      const matchSector = filterSector === 'TODOS' || doc.setor === filterSector;
      const matchStatus = filterStatus === 'TODOS' || doc.status === filterStatus;
      
      const matchResponsavel = filterResponsavel === 'TODOS' || 
        doc.elaborador === filterResponsavel ||
        doc.revisor === filterResponsavel ||
        doc.aprovador === filterResponsavel;

      return matchSearch && matchType && matchSector && matchStatus && matchResponsavel;
    });
  }, [documents, search, filterType, filterSector, filterStatus, filterResponsavel]);

  // Ordenação dos documentos filtrados
  const sortedDocs = useMemo(() => {
    const sorted = [...filteredDocs];
    sorted.sort((a, b) => {
      let aVal: any = a[sortField] || '';
      let bVal: any = b[sortField] || '';

      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }

      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [filteredDocs, sortField, sortOrder]);

  // Exportar para Excel (CSV formatado com UTF-8 BOM)
  const handleExportExcel = () => {
    const headers = ['Código', 'Título', 'Tipo', 'Departamento', 'Responsável (Elaborador)', 'Status', 'Revisão', 'Data de Emissão', 'Próxima Revisão'];
    const csvContent = sortedDocs.map(doc => [
      doc.codigo,
      `"${doc.titulo.replace(/"/g, '""')}"`,
      doc.tipo,
      doc.setor,
      doc.elaborador,
      doc.status,
      `Rev ${doc.revisao.toString().padStart(2, '0')}`,
      doc.dataEmissao,
      doc.proximaRevisao
    ].join(';'));

    const BOM = '\uFEFF';
    const csvString = BOM + [headers.join(';'), ...csvContent].join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `Vickytex_Lista_Mestra_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Imprimir / Exportar para PDF a Lista Mestra Filtrada
  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const tableRows = sortedDocs.map(doc => `
      <tr>
        <td style="font-family: monospace; font-weight: bold; padding: 8px; border: 1px solid #ddd;">${doc.codigo}</td>
        <td style="padding: 8px; border: 1px solid #ddd; font-weight: 500;">${doc.titulo}</td>
        <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${doc.tipo}</td>
        <td style="padding: 8px; border: 1px solid #ddd;">${doc.setor}</td>
        <td style="padding: 8px; border: 1px solid #ddd;">${doc.elaborador}</td>
        <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">${doc.status}</td>
        <td style="padding: 8px; border: 1px solid #ddd; text-align: center; font-family: monospace;">Rev ${doc.revisao.toString().padStart(2, '0')}</td>
        <td style="padding: 8px; border: 1px solid #ddd; text-align: center; font-family: monospace;">${doc.dataEmissao}</td>
        <td style="padding: 8px; border: 1px solid #ddd; text-align: center; font-family: monospace;">${doc.proximaRevisao}</td>
      </tr>
    `).join('');

    const content = `
      <html>
        <head>
          <title>Lista Mestra de Documentos - Vickytex Têxtil (ISO 9001)</title>
          <style>
            body { font-family: 'Inter', system-ui, sans-serif; color: #333; margin: 30px; }
            h1 { font-size: 20px; font-weight: 800; margin-bottom: 5px; }
            p { font-size: 11px; color: #666; margin-top: 0; margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; font-size: 11px; }
            th { background-color: #f4f6f9; font-weight: bold; text-align: left; padding: 10px; border: 1px solid #ddd; }
            @media print {
              button { display: none; }
            }
          </style>
        </head>
        <body>
          <h1>Vickytex Indústria Têxtil Ltda.</h1>
          <p><strong>LISTA MESTRA DE INFORMAÇÕES DOCUMENTADAS (ISO 9001:2015)</strong><br/>
             Gerado em: ${new Date().toLocaleString('pt-BR')} | Total de Documentos: ${sortedDocs.length}</p>
          <table>
            <thead>
              <tr>
                <th>Código</th>
                <th>Título</th>
                <th>Tipo</th>
                <th>Setor / Depto</th>
                <th>Responsável</th>
                <th>Status</th>
                <th>Revisão</th>
                <th>Data Emissão</th>
                <th>Próxima Revisão</th>
              </tr>
            </thead>
            <tbody>
              ${tableRows}
            </tbody>
          </table>
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(content);
    printWindow.document.close();
  };

  const getStatusColor = (status: DocumentStatus) => {
    switch (status) {
      case 'Rascunho': return 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300';
      case 'Elaboração':
      case 'Em Elaboração': return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/20 dark:text-blue-400';
      case 'Revisão Técnica':
      case 'Em Revisão': return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400';
      case 'Aprovação':
      case 'Em Aprovação': return 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/20 dark:text-purple-400';
      case 'Publicação':
      case 'Distribuição':
      case 'Aceite':
      case 'Homologado': return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400';
      case 'Nova Revisão': return 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/20 dark:text-indigo-400';
      default: return 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/20 dark:text-rose-400';
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
      
      {/* Barra de Filtros Completa e Pesquisa Rápida */}
      <div className="p-4 bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-150 dark:border-slate-800 space-y-4">
        
        {/* Barra superior com Pesquisa rápida e Botões de Exportação */}
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          
          {/* Pesquisa Rápida sempre visível */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Pesquisar código, título ou processo têxtil..."
              className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Botões padronizados de Ações e Exportações */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleExportExcel}
              className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-2xs cursor-pointer transition-all hover:scale-[1.01]"
              title="Exportar para Excel (CSV)"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Exportar Excel</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer transition-all hover:scale-[1.01]"
              title="Imprimir Lista Mestra Completa"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir</span>
            </button>
            {canCreateDocs && (
              <button
                onClick={onOpenNewDoc}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-xs cursor-pointer transition-all hover:scale-[1.01]"
              >
                <Plus className="w-4 h-4" />
                <span>Novo Documento</span>
              </button>
            )}
          </div>
        </div>

        {/* Linha Inferior com Filtros Detalhados para a ISO 9001 */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          
          {/* Filtro: Tipo de Documento */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Tipo de Documento</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="w-full px-2.5 py-2 text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-300 focus:outline-hidden"
            >
              <option value="TODOS">Todos os Tipos</option>
              {docTypesList.map(t => (
                <option key={t.type} value={t.type}>{t.type} - {t.name}</option>
              ))}
            </select>
          </div>

          {/* Filtro: Setor / Departamento */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Departamento (Setor)</label>
            <select
              value={filterSector}
              onChange={(e) => setFilterSector(e.target.value as any)}
              className="w-full px-2.5 py-2 text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-300 focus:outline-hidden"
            >
              <option value="TODOS">Todos os Setores</option>
              {sectorsList.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Filtro: Status do Fluxo */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Status do Ciclo</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="w-full px-2.5 py-2 text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-300 focus:outline-hidden"
            >
              <option value="TODOS">Todos os Status</option>
              <option value="Rascunho">Rascunho</option>
              <option value="Elaboração">Elaboração</option>
              <option value="Revisão Técnica">Revisão Técnica</option>
              <option value="Aprovação">Aprovação</option>
              <option value="Publicação">Publicação</option>
              <option value="Distribuição">Distribuição</option>
              <option value="Aceite">Aceite</option>
              <option value="Nova Revisão">Nova Revisão</option>
              <option value="Obsoleto">Obsoleto</option>
            </select>
          </div>

          {/* Filtro: Responsável */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Responsável</label>
            <select
              value={filterResponsavel}
              onChange={(e) => setFilterResponsavel(e.target.value)}
              className="w-full px-2.5 py-2 text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-300 focus:outline-hidden"
            >
              <option value="TODOS">Todos Responsáveis</option>
              {responsaveisList.map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          {/* Indicador de Filtros ativos */}
          <div className="flex items-end pb-0.5">
            <span className="text-[10px] text-slate-400 font-bold bg-slate-100 dark:bg-slate-800 px-2 py-2 rounded-lg block text-center w-full">
              {filteredDocs.length} de {documents.length} itens encontrados
            </span>
          </div>

        </div>

      </div>

      {/* Tabela Planilha Lista Mestra */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800/40 text-slate-400 uppercase tracking-wider font-extrabold text-[10px] border-b border-slate-150 dark:border-slate-800">
              <th className="py-3 px-4 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" onClick={() => handleSort('codigo')}>
                <div className="flex items-center gap-1">
                  <span>Código</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="py-3 px-4 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" onClick={() => handleSort('titulo')}>
                <div className="flex items-center gap-1">
                  <span>Título do Documento</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="py-3 px-4 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" onClick={() => handleSort('setor')}>
                <div className="flex items-center gap-1">
                  <span>Setor</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="py-3 px-4 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" onClick={() => handleSort('status')}>
                <div className="flex items-center gap-1">
                  <span>Status</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="py-3 px-4 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-center" onClick={() => handleSort('revisao')}>
                <div className="flex items-center gap-1 justify-center">
                  <span>Rev</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="py-3 px-4 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-center" onClick={() => handleSort('dataEmissao')}>
                <div className="flex items-center gap-1 justify-center">
                  <span>Emissão</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="py-3 px-4 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-center" onClick={() => handleSort('proximaRevisao')}>
                <div className="flex items-center gap-1 justify-center">
                  <span>Próx. Rev.</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="py-3 px-4 text-center">QR Tag</th>
              <th className="py-3 px-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {sortedDocs.length > 0 ? (
              sortedDocs.map((doc) => {
                const isSelected = selectedDocId === doc.id;
                return (
                  <tr 
                    key={doc.id}
                    className={`hover:bg-blue-50/20 dark:hover:bg-slate-800/20 transition-colors cursor-pointer ${
                      isSelected ? 'bg-blue-50/30 dark:bg-slate-800/40 font-semibold' : ''
                    }`}
                    onClick={() => setSelectedDocId(doc.id)}
                  >
                    <td className="py-3 px-4 font-mono font-bold text-blue-600 dark:text-blue-400">
                      {doc.codigo}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-700 dark:text-slate-200">
                      <div className="line-clamp-1 truncate max-w-xs md:max-w-md" title={doc.titulo}>
                        {doc.titulo}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                      {doc.setor}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold border ${getStatusColor(doc.status)}`}>
                        {doc.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center font-mono text-slate-500">
                      R{doc.revisao.toString().padStart(2, '0')}
                    </td>
                    <td className="py-3 px-4 text-center font-mono text-slate-500">
                      {doc.dataEmissao}
                    </td>
                    <td className="py-3 px-4 text-center font-mono text-slate-500">
                      {doc.proximaRevisao}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onShowQrModal(doc);
                        }}
                        className="p-1 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors cursor-pointer inline-flex"
                        title="Ver Código QR de Identificação"
                      >
                        <QrIcon className="w-4 h-4" />
                      </button>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                        {confirmDeleteId === doc.id ? (
                          <div className="flex items-center gap-1 bg-red-500/10 dark:bg-red-500/20 px-2 py-1 rounded border border-red-500/30 animate-pulse text-xs font-bold text-red-500">
                            <span>Excluir?</span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (onDeleteDoc) onDeleteDoc(doc.id);
                                setConfirmDeleteId(null);
                              }}
                              className="px-1.5 py-0.5 bg-red-600 hover:bg-red-700 text-white font-extrabold rounded text-[10px] cursor-pointer"
                            >
                              Sim
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setConfirmDeleteId(null);
                              }}
                              className="px-1.5 py-0.5 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-extrabold rounded text-[10px] cursor-pointer"
                            >
                              Não
                            </button>
                          </div>
                        ) : (
                          <>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedDocId(doc.id);
                              }}
                              className="p-1 text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors cursor-pointer inline-flex"
                              title="Abrir Detalhes do Documento"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            {canEditDocs && (!canModifyItem || canModifyItem(doc.setor)) && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onOpenEditDoc(doc);
                                }}
                                className="p-1 text-slate-400 hover:text-amber-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors cursor-pointer inline-flex"
                                title="Editar Metadados do Documento"
                              >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                              </button>
                            )}
                            {canDeleteDocs && onDeleteDoc && (!canDeleteItem || canDeleteItem(doc.setor)) && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setConfirmDeleteId(doc.id);
                                }}
                                className="p-1 text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors cursor-pointer inline-flex"
                                title="Excluir Documento"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={9} className="py-12 text-center text-slate-400 italic">
                  Nenhum documento cadastrado ou atendendo aos filtros selecionados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
