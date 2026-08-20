import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, TableProperties, Settings, QrCode as QrIcon, 
  X, Plus, FileText, Check, FileCheck, ArrowRight, Printer, ListCollapse 
} from 'lucide-react';
import { Documento, DocumentType, SectorType, DocumentStatus } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useSectors } from '../hooks/useSectors';
import { SECTORS, getSectors, DOCUMENT_TYPES, getDocumentTypes, PersonalizacaoGeral } from '../utils/mockData';
import { getSavedFlows } from './Documentos/FluxosParametrizados';
import { DocumentoDashboard } from './Documentos/DocumentoDashboard';
import { DocumentoListaMestra } from './Documentos/DocumentoListaMestra';
import { DocumentoAbasDetalhes } from './Documentos/DocumentoAbasDetalhes';
import { FluxosParametrizados } from './Documentos/FluxosParametrizados';

interface DocumentosProps {
  documents: Documento[];
  onAddDocument: (doc: Documento) => void;
  onUpdateDocument: (doc: Documento) => void;
  onDeleteDocument: (id: string) => void;
  onAddLog: (action: string, details: string, docId?: string) => void;
  selectedDocId?: string;
  setSelectedDocId: (id: string | undefined) => void;
  personalizacao?: PersonalizacaoGeral;
}

export const Documentos: React.FC<DocumentosProps> = ({
  documents,
  onAddDocument,
  onUpdateDocument,
  onDeleteDocument,
  onAddLog,
  selectedDocId,
  setSelectedDocId,
  personalizacao
}) => {
  const { user } = useAuth();

  // Abas principais do Módulo Documentos
  const [activeTab, setActiveTab] = useState<'dashboard' | 'lista-mestra' | 'fluxos'>('dashboard');

  // Modais de Cadastro / Edição
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState<Documento | null>(null);

  // Lista dinâmica de setores e tipos documentais
  const systemSectors = useSectors();
  const [sectorsList, setSectorsList] = useState<string[]>(() => systemSectors);
  const [docTypesList, setDocTypesList] = useState<{ type: string; name: string; description: string }[]>(() => getDocumentTypes());

  useEffect(() => {
    setSectorsList(systemSectors);
    setDocTypesList(getDocumentTypes());
  }, [systemSectors, isFormModalOpen, activeTab]);

  // Modal QR Code
  const [qrModalDoc, setQrModalDoc] = useState<Documento | null>(null);

  // Estado do formulário de novo/edição de documento
  const [formCodigo, setFormCodigo] = useState('');
  const [formTitulo, setFormTitulo] = useState('');
  const [formSetor, setFormSetor] = useState<SectorType>(() => (getSectors()[0] || 'Administração') as SectorType);
  const [formTipo, setFormTipo] = useState<DocumentType>('POP');
  const [formPeriodicidade, setFormPeriodicidade] = useState(12);
  const [formObjetivo, setFormObjetivo] = useState('');
  const [formDescricao, setFormDescricao] = useState('');
  const [formDriveLink, setFormDriveLink] = useState('');
  const [formRevisor, setFormRevisor] = useState('');
  const [formAprovador, setFormAprovador] = useState('');

  // Sincronizar o Revisor e o Aprovador automaticamente apenas na criação de novo documento
  useEffect(() => {
    if (!editingDoc) {
      switch (formTipo) {
        case 'POP':
          setFormRevisor('supervisor.qualidade@vickytex.com.br');
          setFormAprovador('gerente.sgq@vickytex.com.br');
          break;
        case 'FOR':
          setFormRevisor('qualidade@vickytex.com.br');
          setFormAprovador('gerente.sgq@vickytex.com.br');
          break;
        case 'IT':
          setFormRevisor('supervisor.producao@vickytex.com.br');
          setFormAprovador('qualidade@vickytex.com.br');
          break;
        case 'MAN':
          setFormRevisor('gerente.sgq@vickytex.com.br');
          setFormAprovador('diretoria@vickytex.com.br');
          break;
        case 'LIST':
          setFormRevisor('supervisor@vickytex.com.br');
          setFormAprovador('qualidade@vickytex.com.br');
          break;
        default:
          setFormRevisor('supervisor@vickytex.com.br');
          setFormAprovador('qualidade@vickytex.com.br');
      }
    }
  }, [formTipo, isFormModalOpen, editingDoc]);

  // Carregar dados no formulário ao editar
  const handleOpenEdit = (doc: Documento) => {
    setEditingDoc(doc);
    setFormCodigo(doc.codigo);
    setFormTitulo(doc.titulo);
    setFormSetor(doc.setor);
    setFormTipo(doc.tipo);
    setFormPeriodicidade(doc.periodicidade || 12);
    setFormObjetivo(doc.objetivo || '');
    setFormDescricao(doc.descricao || '');
    setFormDriveLink(doc.googleDriveLink || '');
    setFormRevisor(doc.revisor);
    setFormAprovador(doc.aprovador);
    setIsFormModalOpen(true);
  };

  const handleOpenNew = () => {
    setEditingDoc(null);
    
    // Sugerir código sequencial ou limpo
    const count = documents.filter(d => d.tipo === formTipo).length + 1;
    setFormCodigo(`${formTipo}-TEX-${String(count).padStart(3, '0')}`);
    
    setFormTitulo('');
    const currentSecs = getSectors();
    setSectorsList(currentSecs);
    setFormSetor((currentSecs[0] || 'Administração') as SectorType);
    setFormPeriodicidade(12);
    setFormObjetivo('');
    setFormDescricao('');
    setFormDriveLink('');
    setIsFormModalOpen(true);
  };

  // Submissão do formulário de Adicionar / Editar Documento
  const handleSaveDocument = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formCodigo.trim() || !formTitulo.trim()) {
      alert('Código e Título são obrigatórios.');
      return;
    }

    if (editingDoc) {
      // Atualizar documento existente
      const updatedDoc: Documento = {
        ...editingDoc,
        codigo: formCodigo.trim(),
        titulo: formTitulo.trim(),
        setor: formSetor,
        tipo: formTipo,
        periodicidade: formPeriodicidade,
        objetivo: formObjetivo.trim(),
        descricao: formDescricao.trim(),
        googleDriveLink: formDriveLink.trim(),
        revisor: formRevisor,
        aprovador: formAprovador,
        updatedAt: new Date().toISOString()
      };

      onUpdateDocument(updatedDoc);
      onAddLog('Documento Editado', `Modificado metadados do documento ${formCodigo} na Lista Mestra.`, editingDoc.id);
    } else {
      // Criar novo documento
      const proximaDataEmissao = new Date().toISOString().split('T')[0];
      const proxRevDate = new Date();
      proxRevDate.setMonth(proxRevDate.getMonth() + formPeriodicidade);
      const proximaRevisaoDateString = proxRevDate.toISOString().split('T')[0];

      const novoDoc: Documento = {
        id: `doc-${Date.now()}`,
        codigo: formCodigo.trim().toUpperCase(),
        titulo: formTitulo.trim(),
        setor: formSetor,
        tipo: formTipo,
        status: 'Rascunho', // Sempre inicia como rascunho de acordo com a ISO 9001
        revisao: 0,
        dataEmissao: proximaDataEmissao,
        proximaRevisao: proximaRevisaoDateString,
        elaborador: user?.email || 'qualidade@vickytex.com.br',
        revisor: formRevisor,
        aprovador: formAprovador,
        googleDriveId: `drive-${Date.now()}`,
        googleDriveLink: formDriveLink.trim(),
        qrCode: '',
        periodicidade: formPeriodicidade,
        objetivo: formObjetivo.trim(),
        descricao: formDescricao.trim(),
        distribuicaoCopias: [],
        revisoesHistorico: [],
        documentLogs: [
          {
            id: `doc-log-init-${Date.now()}`,
            documentoId: `doc-${Date.now()}`,
            usuario: user?.name || user?.email || 'Qualidade Vickytex',
            acao: 'Criação Inicial',
            detalhes: `Inserido rascunho inicial do documento ${formCodigo} na Lista Mestra do SGQ.`,
            data: new Date().toLocaleString('pt-BR'),
            ip: '192.168.10.10',
            dispositivo: 'Desktop',
            navegador: 'Chrome'
          }
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      onAddDocument(novoDoc);
      onAddLog('Documento Cadastrado', `Inserido novo documento ${formCodigo} na Lista Mestra do SGQ.`, novoDoc.id);
    }

    setIsFormModalOpen(false);
    setEditingDoc(null);
  };

  // Imprimir Tag QR Code de Identificação do Posto
  const handlePrintQrCode = () => {
    if (!qrModalDoc) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const content = `
      <html>
        <head>
          <title>TAG DE IDENTIFICAÇÃO DE PROCESSO - VICKYTEX</title>
          <style>
            body { font-family: 'Inter', sans-serif; color: #333; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
            .tag-card { border: 4px dashed #1e293b; padding: 30px; border-radius: 16px; text-align: center; max-width: 400px; width: 100%; box-sizing: border-box; }
            .logo { font-weight: 900; font-size: 20px; letter-spacing: -1px; text-transform: uppercase; margin-bottom: 20px; color: #1e3a8a; }
            .codigo { font-family: monospace; font-size: 28px; font-weight: 900; color: #2563eb; margin: 15px 0; }
            .titulo { font-size: 16px; font-weight: 700; margin-bottom: 10px; color: #1e293b; }
            .info { font-size: 11px; color: #64748b; margin-top: 15px; border-top: 1px solid #e2e8f0; padding-top: 10px; }
            .qr-placeholder { border: 4px solid #1e293b; padding: 20px; display: inline-block; margin-top: 15px; border-radius: 12px; background-color: #f8fafc; font-weight: bold; font-family: monospace; }
          </style>
        </head>
        <body>
          <div class="tag-card">
            <div class="logo">VICKYTEX TÊXTIL</div>
            <div class="titulo">${qrModalDoc.titulo}</div>
            <div class="codigo">${qrModalDoc.codigo}</div>
            
            <div class="qr-placeholder">
              <svg width="150" height="150" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <rect x="2" y="2" width="8" height="8" rx="1"></rect>
                <rect x="14" y="2" width="8" height="8" rx="1"></rect>
                <rect x="2" y="14" width="8" height="8" rx="1"></rect>
                <rect x="14" y="14" width="8" height="8" rx="1"></rect>
                <path d="M6 6h.01M18 6h.01M6 18h.01M18 18h.01"></path>
              </svg>
              <div style="font-size: 9px; margin-top: 5px; color: #64748b;">ESCANEIE PARA ACESSAR O PROCEDIMENTO VIGENTE</div>
            </div>

            <div class="info">
              Setor: <strong>${qrModalDoc.setor}</strong> | Revisão: <strong>Rev ${qrModalDoc.revisao.toString().padStart(2, '0')}</strong><br/>
              Status: <span style="font-weight: bold; color: #16a34a;">VIGENTE (CONFORME ISO 9001:2015)</span>
            </div>
          </div>
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(content);
    printWindow.document.close();
  };

  // Permissão de escrita (Somente Qualidade, Administrador ou Supervisor)
  const canCreateDocs = user?.role === 'Qualidade' || user?.role === 'Administrador' || user?.role === 'Supervisor';

  // Buscar o documento selecionado para visualização em detalhes
  const activeDocument = documents.find(doc => doc.id === selectedDocId);

  return (
    <div className="space-y-6 h-full flex flex-col">
      
      {/* Título da Seção do Módulo e Descrição ISO 9001 */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shrink-0">
        <div>
          <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center">
            <FileText className="w-5 h-5 mr-1.5 text-blue-600" />
            Gestão Documental (ISO 9001:2015) - Vickytex
          </h2>
          <p className="text-[11px] text-slate-400 mt-0.5 max-w-2xl leading-relaxed">
            {personalizacao?.documentosAjudaSubtitulo || 'Centralize o ciclo de vida de informações documentadas (procedimentos, instruções de trabalho e manuais) com controle rígido de obsolescência, assinaturas eletrônicas com PIN e distribuição para tablets industriais.'}
          </p>
        </div>

        {/* Menu das Abas Principais de Navegação */}
        {!selectedDocId && (
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl self-start">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'dashboard'
                  ? 'bg-white dark:bg-slate-900 text-slate-950 dark:text-white shadow-2xs'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Painel Geral</span>
            </button>
            <button
              onClick={() => setActiveTab('lista-mestra')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'lista-mestra'
                  ? 'bg-white dark:bg-slate-900 text-slate-950 dark:text-white shadow-2xs'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <TableProperties className="w-3.5 h-3.5" />
              <span>Lista Mestra</span>
            </button>
            {(user?.role === 'Qualidade' || user?.role === 'Administrador') && (
              <button
                onClick={() => setActiveTab('fluxos')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'fluxos'
                    ? 'bg-white dark:bg-slate-900 text-slate-950 dark:text-white shadow-2xs'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <Settings className="w-3.5 h-3.5" />
                <span>Fluxos Parametrizados</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Conteúdo Dinâmico */}
      <div className="flex-1 min-h-0">
        {selectedDocId && activeDocument ? (
          /* Se tiver um documento ativo selecionado, exibe a interface detalhada de Abas */
          <DocumentoAbasDetalhes
            document={activeDocument}
            currentUser={user}
            onUpdateDocument={onUpdateDocument}
            onAddLog={onAddLog}
            onClose={() => setSelectedDocId(undefined)}
            onShowQrModal={(doc) => setQrModalDoc(doc)}
          />
        ) : (
          /* Se não, exibe o painel de abas principais do módulo */
          <div className="space-y-6 h-full">
            {activeTab === 'dashboard' && (
              <DocumentoDashboard
                documents={documents}
                onSelectDocument={(id) => setSelectedDocId(id)}
              />
            )}

             {activeTab === 'lista-mestra' && (
              <DocumentoListaMestra
                documents={documents}
                sectorsList={sectorsList}
                docTypesList={docTypesList as any}
                selectedDocId={selectedDocId}
                setSelectedDocId={setSelectedDocId}
                onOpenNewDoc={handleOpenNew}
                onOpenEditDoc={handleOpenEdit}
                onShowQrModal={(doc) => setQrModalDoc(doc)}
                canCreateDocs={canCreateDocs}
                onDeleteDoc={onDeleteDocument}
              />
            )}

            {activeTab === 'fluxos' && (user?.role === 'Qualidade' || user?.role === 'Administrador') && (
              <FluxosParametrizados />
            )}
          </div>
        )}
      </div>

      {/* MODAL: Adicionar / Editar Documento da Lista Mestra */}
      {isFormModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 dark:border-slate-800 relative max-h-[90vh] overflow-y-auto animate-scale-up space-y-4">
            <button 
              onClick={() => setIsFormModalOpen(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
            
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center">
                <FileText className="w-5 h-5 mr-1.5 text-blue-600" />
                {editingDoc ? `Editar Processo: ${editingDoc.codigo}` : 'Novo Procedimento na Lista Mestra (ISO 9001)'}
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Defina as especificações técnicas básicas do documento têxtil.</p>
            </div>

            <form onSubmit={handleSaveDocument} className="space-y-4 text-xs">
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase">Código Único *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: POP-TEAR-012"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 font-mono focus:outline-hidden"
                    value={formCodigo}
                    onChange={(e) => setFormCodigo(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase">Setor / Departamento *</label>
                  <select
                    value={formSetor}
                    onChange={(e) => setFormSetor(e.target.value as SectorType)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-100 focus:outline-hidden"
                  >
                    {sectorsList.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-400 uppercase">Título do Processo *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Instrução de Ajuste de Tensão de Linha do Tear Circular"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-hidden"
                  value={formTitulo}
                  onChange={(e) => setFormTitulo(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase">Tipo Documental</label>
                  <select
                    value={formTipo}
                    onChange={(e) => setFormTipo(e.target.value as DocumentType)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-100 focus:outline-hidden"
                  >
                    {docTypesList.map(t => (
                      <option key={t.type} value={t.type}>{t.type} - {t.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase">Validade / Periodicidade (Meses)</label>
                  <input
                    type="number"
                    min="1"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-hidden"
                    value={formPeriodicidade}
                    onChange={(e) => setFormPeriodicidade(Number(e.target.value))}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-400 uppercase">Objetivo da Padronização *</label>
                <textarea
                  required
                  rows={2}
                  placeholder="Descreva brevemente o objetivo operacional deste documento para auditorias..."
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-hidden"
                  value={formObjetivo}
                  onChange={(e) => setFormObjetivo(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-400 uppercase">Instruções de Trabalho Detalhadas</label>
                <textarea
                  rows={3}
                  placeholder="Se desejar, detalhe os passos operacionais ou especificações de maquinários neste campo..."
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-hidden"
                  value={formDescricao}
                  onChange={(e) => setFormDescricao(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-400 uppercase">Link do Arquivo Oficial (Google Drive Preview) *</label>
                <input
                  type="url"
                  placeholder="Ex: https://drive.google.com/file/d/.../view"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 font-mono focus:outline-hidden"
                  value={formDriveLink}
                  onChange={(e) => setFormDriveLink(e.target.value)}
                />
              </div>

              {/* Responsáveis do Fluxo Sincronizados com o Fluxo Parametrizado */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Aprovação & Qualidade</span>
                  <button
                    type="button"
                    onClick={() => {
                      setIsFormModalOpen(false);
                      setActiveTab('fluxos');
                    }}
                    className="text-[10px] font-bold text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                  >
                    Gerenciar Regras Padrão na aba Fluxos →
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-[9px] font-extrabold text-slate-400 uppercase">Revisor do Documento (E-mail)</label>
                    <input
                      type="email"
                      required
                      placeholder="supervisor@vickytex.com.br"
                      className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-[11px] text-slate-800 dark:text-slate-100 font-mono focus:outline-none focus:ring-1 focus:ring-blue-500"
                      value={formRevisor}
                      onChange={(e) => setFormRevisor(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[9px] font-extrabold text-slate-400 uppercase">Aprovador do Documento (E-mail)</label>
                    <input
                      type="email"
                      required
                      placeholder="gerente@vickytex.com.br"
                      className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-[11px] text-slate-800 dark:text-slate-100 font-mono focus:outline-none focus:ring-1 focus:ring-blue-500"
                      value={formAprovador}
                      onChange={(e) => setFormAprovador(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-xs cursor-pointer"
              >
                {editingDoc ? 'Salvar Alterações do Processo' : 'Salvar Documento na Lista Mestra'}
              </button>

            </form>
          </div>
        </div>
      )}

      {/* MODAL: Exibição visual de QR Code para Impressão da Tag de Posto */}
      {qrModalDoc && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-sm w-full p-6 shadow-xl border border-slate-200 dark:border-slate-800 relative animate-scale-up space-y-4">
            <button 
              onClick={() => setQrModalDoc(null)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="text-center space-y-2">
              <h4 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">Tag de Identificação de Posto</h4>
              <p className="text-[10px] text-slate-400">Gere e afixe a etiqueta no local de trabalho do operador para acesso rápido.</p>
            </div>

            {/* Visual da Tag formatada */}
            <div className="p-4 border-2 border-dashed border-slate-300 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-950/20 text-center space-y-3 font-sans">
              <div className="text-[9px] font-extrabold text-blue-600 dark:text-blue-400 uppercase tracking-widest">VICKYTEX TÊXTIL</div>
              <h5 className="text-xs font-extrabold text-slate-800 dark:text-slate-100 leading-snug line-clamp-2">{qrModalDoc.titulo}</h5>
              <div className="font-mono text-lg font-black text-slate-900 dark:text-white">{qrModalDoc.codigo}</div>
              
              {/* Ícone de QR grande */}
              <div className="p-3 bg-white dark:bg-slate-950 inline-block border border-slate-200 dark:border-slate-800 rounded-lg">
                <QrIcon className="w-24 h-24 text-slate-900 dark:text-white" />
              </div>

              <div className="text-[9px] text-slate-400 font-medium space-y-0.5">
                <div>Setor: <strong>{qrModalDoc.setor}</strong></div>
                <div>Status: <strong className="text-emerald-600">VIGENTE (ISO 9001)</strong></div>
                <div>Revisão: <strong>Rev {qrModalDoc.revisao.toString().padStart(2, '0')}</strong></div>
              </div>
            </div>

            {/* Ações */}
            <div className="flex gap-2">
              <button
                onClick={() => setQrModalDoc(null)}
                className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-xl text-xs cursor-pointer"
              >
                Fechar
              </button>
              <button
                onClick={handlePrintQrCode}
                className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1 shadow-2xs cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Imprimir Tag</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
