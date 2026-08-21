/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  FolderLock, 
  Search, 
  Plus, 
  Filter, 
  FileCheck, 
  Clock, 
  Trash2, 
  Edit3, 
  ExternalLink, 
  Download, 
  Printer, 
  CheckCircle, 
  Archive, 
  AlertTriangle, 
  UploadCloud, 
  Database,
  Calendar,
  Layers,
  FileText,
  User,
  Info,
  ChevronDown,
  Award,
  Camera,
  Image as ImageIcon,
  ZoomIn,
  Eye,
  X,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Documento, Registro, SectorType } from '../types';
import { useSectors } from '../hooks/useSectors';
import { getSectors } from '../utils/mockData';
import { RecordRepository } from '../services/database/repositories/record.repository';
import { compressImage } from '../utils/imageCompressor';

interface RegistrosProps {
  documents: Documento[];
  onAddLog: (action: string, details: string, docId?: string) => void;
  personalizacao?: any;
  registros: Registro[];
  setRegistros: (regs: Registro[]) => void;
}

// Dados iniciais para simular os Registros da Qualidade (ISO 9001 7.5.3)
export const INITIAL_REGISTROS: Registro[] = [
  {
    id: 'reg-1',
    codigo: 'REG-COS-001',
    titulo: 'Relatório de Inspeção de Costura Final - Lote Camisetas 2026/A',
    documentoOrigemId: 'POP-COS-002', // Referência ao POP de Inspeção de Costura
    setor: 'Costura',
    tipoMidia: 'Digital',
    localArmazenamento: 'Google Drive: /Vickytex/Qualidade/Registros/Costura',
    tempoRetencaoAnos: 5,
    disposicaoFinal: 'Digitalização e Descarte',
    responsavelPreenchimento: 'Rodrigo Berto (Qualidade)',
    responsavelGuarda: 'Supervisor Costura',
    indexacaoMetodo: 'Por Lote e Data',
    statusControle: 'Ativo',
    dataUltimaVerificacao: '2026-06-10',
    observacoes: 'Contém dados de amostragem de conformidade de costura dupla.',
    googleDriveId: 'drive-reg-1',
    googleDriveLink: 'https://docs.google.com/viewer?url=https://raw.githubusercontent.com/mozilla/pdf.js/master/web/compressed.tracemonkey-pldi-09.pdf'
  },
  {
    id: 'reg-2',
    codigo: 'REG-COR-001',
    titulo: 'Check-list de Inspeção Diária de Máquina de Enfesto Semiautomática',
    documentoOrigemId: 'POP-COR-001',
    setor: 'Corte',
    tipoMidia: 'Físico',
    localArmazenamento: 'Armário de Aço A3 - Pasta Sanfonada Vermelha 2026',
    tempoRetencaoAnos: 2,
    disposicaoFinal: 'Descarte',
    responsavelPreenchimento: 'Roberto Costa (Supervisor)',
    responsavelGuarda: 'Gerência de Corte',
    indexacaoMetodo: 'Por Data',
    statusControle: 'Ativo',
    dataUltimaVerificacao: '2026-07-02',
    observacoes: 'Inspeção de pressão hidráulica e lâmina de corte.'
  },
  {
    id: 'reg-3',
    codigo: 'REG-EST-002',
    titulo: 'Planilha de Monitoramento de Temperatura - Secador Estufa Flash Cure',
    setor: 'Estamparia',
    tipoMidia: 'Misto',
    localArmazenamento: 'Físico (Prancheta Estamparia) e Digital (Scan no Google Drive)',
    tempoRetencaoAnos: 3,
    disposicaoFinal: 'Digitalização e Descarte',
    responsavelPreenchimento: 'Jorge Dias (Impressor)',
    responsavelGuarda: 'Qualidade',
    indexacaoMetodo: 'Por Lote de Produção',
    statusControle: 'Arquivado',
    dataUltimaVerificacao: '2026-05-15',
    observacoes: 'Submetido a digitalização mensal periódica.'
  },
  {
    id: 'reg-4',
    codigo: 'REG-ADM-005',
    titulo: 'Termo de Entrega de Equipamento de Proteção Individual (EPI)',
    setor: 'Administração',
    tipoMidia: 'Físico',
    localArmazenamento: 'Arquivo Morto Geral - Pasta de Funcionários nº 12',
    tempoRetencaoAnos: 30,
    disposicaoFinal: 'Histórico Permanente',
    responsavelPreenchimento: 'Rodrigo Berto (Administração)',
    responsavelGuarda: 'Administração',
    indexacaoMetodo: 'Por Nome do Colaborador',
    statusControle: 'Arquivado',
    dataUltimaVerificacao: '2025-12-10',
    observacoes: 'Documento legal trabalhista altamente crítico.'
  }
];

export const Registros: React.FC<RegistrosProps> = ({ documents, onAddLog, personalizacao, registros, setRegistros }) => {
  const sectorsList = useSectors();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSector, setSelectedSector] = useState<string>('Todos');
  const [selectedStatus, setSelectedStatus] = useState<string>('Todos');
  const [selectedMidia, setSelectedMidia] = useState<string>('Todos');

  // Modal forms states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRegistro, setEditingRegistro] = useState<Registro | null>(null);
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);
  const [selectedForVerify, setSelectedForVerify] = useState<Registro | null>(null);
  const [verificationNotes, setVerificationNotes] = useState('');
  const [registroToDelete, setRegistroToDelete] = useState<{ id: string; code: string } | null>(null);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  
  // Novo / Edição Form State
  const [codigo, setCodigo] = useState('');
  const [titulo, setTitulo] = useState('');
  const [documentoOrigemId, setDocumentoOrigemId] = useState('');
  const [setor, setSetor] = useState('');
  const [tipoMidia, setTipoMidia] = useState<'Físico' | 'Digital' | 'Misto'>('Físico');
  const [localArmazenamento, setLocalArmazenamento] = useState('');
  const [tempoRetencaoAnos, setTempoRetencaoAnos] = useState(5);
  const [disposicaoFinal, setDisposicaoFinal] = useState<'Descarte' | 'Reciclagem' | 'Digitalização e Descarte' | 'Histórico Permanente'>('Descarte');
  const [responsavelPreenchimento, setResponsavelPreenchimento] = useState('');
  const [responsavelGuarda, setResponsavelGuarda] = useState('');
  const [indexacaoMetodo, setIndexacaoMetodo] = useState('');
  const [statusControle, setStatusControle] = useState<'Ativo' | 'Arquivado' | 'Descartado'>('Ativo');
  const [googleDriveLink, setGoogleDriveLink] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [fotos, setFotos] = useState<string[]>([]);

  // Save helper
  const saveRegistros = (newRegs: Registro[]) => {
    setRegistros(newRegs);
  };

  // Processar upload de fotos/scans
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    setIsUploadingPhoto(true);
    try {
      const newPhotoList: string[] = [...fotos];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.type.startsWith('image/')) {
          const compressed = await compressImage(file, 1200, 1200, 0.75);
          newPhotoList.push(compressed);
        }
      }
      setFotos(newPhotoList);
    } catch (err) {
      console.error('Erro ao processar foto:', err);
      alert('Não foi possível processar a imagem selecionada.');
    } finally {
      setIsUploadingPhoto(false);
      e.target.value = '';
    }
  };

  const handleRemovePhoto = (index: number) => {
    setFotos(prev => prev.filter((_, idx) => idx !== index));
  };

  // Preencher formulário para novo registro
  const handleOpenNewForm = () => {
    setEditingRegistro(null);
    setCodigo(`REG-NEW-${Date.now().toString().slice(-4)}`);
    setTitulo('');
    setDocumentoOrigemId('');
    setSetor(sectorsList[0] || 'Qualidade');
    setTipoMidia('Físico');
    setLocalArmazenamento('');
    setTempoRetencaoAnos(5);
    setDisposicaoFinal('Descarte');
    setResponsavelPreenchimento('');
    setResponsavelGuarda('');
    setIndexacaoMetodo('');
    setStatusControle('Ativo');
    setGoogleDriveLink('');
    setObservacoes('');
    setFotos([]);
    setIsFormOpen(true);
  };

  // Preencher formulário para edição
  const handleOpenEditForm = (reg: Registro) => {
    setEditingRegistro(reg);
    setCodigo(reg.codigo);
    setTitulo(reg.titulo);
    setDocumentoOrigemId(reg.documentoOrigemId || '');
    setSetor(reg.setor);
    setTipoMidia(reg.tipoMidia);
    setLocalArmazenamento(reg.localArmazenamento);
    setTempoRetencaoAnos(reg.tempoRetencaoAnos);
    setDisposicaoFinal(reg.disposicaoFinal);
    setResponsavelPreenchimento(reg.responsavelPreenchimento);
    setResponsavelGuarda(reg.responsavelGuarda);
    setIndexacaoMetodo(reg.indexacaoMetodo);
    setStatusControle(reg.statusControle);
    setGoogleDriveLink(reg.googleDriveLink || '');
    setObservacoes(reg.observacoes || '');
    setFotos(reg.fotos || (reg.fotoEvidencia ? [reg.fotoEvidencia] : []));
    setIsFormOpen(true);
  };

  // Salvar registro (Novo ou Editado)
  const handleSaveRegistro = (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo.trim() || !codigo.trim() || !localArmazenamento.trim()) {
      alert('Por favor, preencha os campos obrigatórios (*).');
      return;
    }

    if (editingRegistro) {
      let updatedRecord: Registro | null = null;
      const updated = registros.map(r => {
        if (r.id === editingRegistro.id) {
          updatedRecord = {
            ...r,
            codigo: codigo.trim().toUpperCase(),
            titulo: titulo.trim(),
            documentoOrigemId: documentoOrigemId || undefined,
            setor,
            tipoMidia,
            localArmazenamento: localArmazenamento.trim(),
            tempoRetencaoAnos,
            disposicaoFinal,
            responsavelPreenchimento: responsavelPreenchimento.trim(),
            responsavelGuarda: responsavelGuarda.trim(),
            indexacaoMetodo: indexacaoMetodo.trim(),
            statusControle,
            googleDriveLink: googleDriveLink.trim() || undefined,
            googleDriveId: googleDriveLink.trim() ? `drive-${editingRegistro.id}` : undefined,
            observacoes: observacoes.trim() || undefined,
            fotos: fotos.length > 0 ? fotos : undefined,
            fotoEvidencia: fotos.length > 0 ? fotos[0] : undefined
          };
          return updatedRecord;
        }
        return r;
      });
      saveRegistros(updated);
      if (updatedRecord) {
        RecordRepository.update((updatedRecord as Registro).id, updatedRecord).catch(err => console.error('Erro ao atualizar registro no Firestore:', err));
      }
      onAddLog('Atualizou Registro de Qualidade', `Atualizou o controle do registro ${codigo.toUpperCase().trim()}: ${titulo.trim()}.`);
    } else {
      const newReg: Registro = {
        id: `reg-${Date.now()}`,
        codigo: codigo.trim().toUpperCase(),
        titulo: titulo.trim(),
        documentoOrigemId: documentoOrigemId || undefined,
        setor,
        tipoMidia,
        localArmazenamento: localArmazenamento.trim(),
        tempoRetencaoAnos,
        disposicaoFinal,
        responsavelPreenchimento: responsavelPreenchimento.trim(),
        responsavelGuarda: responsavelGuarda.trim(),
        indexacaoMetodo: indexacaoMetodo.trim(),
        statusControle,
        googleDriveLink: googleDriveLink.trim() || undefined,
        googleDriveId: googleDriveLink.trim() ? `drive-new-${Date.now()}` : undefined,
        observacoes: observacoes.trim() || undefined,
        dataUltimaVerificacao: new Date().toISOString().split('T')[0],
        fotos: fotos.length > 0 ? fotos : undefined,
        fotoEvidencia: fotos.length > 0 ? fotos[0] : undefined
      };
      saveRegistros([newReg, ...registros]);
      RecordRepository.create(newReg).catch(err => console.error('Erro ao cadastrar registro no Firestore:', err));
      onAddLog('Cadastrou Registro de Qualidade', `Incluiu o novo controle de registro ${newReg.codigo} no índice mestre.`);
    }

    setIsFormOpen(false);
  };

  // Excluir registro
  const handleDeleteRegistro = (id: string, code: string) => {
    setRegistroToDelete({ id, code });
  };

  const confirmDeleteRegistro = () => {
    if (!registroToDelete) return;
    const { id, code } = registroToDelete;
    const updated = registros.filter(r => r.id !== id);
    saveRegistros(updated);
    RecordRepository.delete(id).catch(err => console.error('Erro ao excluir registro no Firestore:', err));
    onAddLog('Excluiu Controle de Registro', `Removeu o controle de registro ${code} do sistema.`);
    setRegistroToDelete(null);
  };

  // Registrar auditoria / verificação de registro (ISO 9001 7.5.3.2)
  const handleOpenVerifyModal = (reg: Registro) => {
    setSelectedForVerify(reg);
    setVerificationNotes('');
    setIsVerificationModalOpen(true);
  };

  const handleSaveVerification = () => {
    if (!selectedForVerify) return;
    
    let targetRecord: Registro | null = null;
    const todayStr = new Date().toISOString().split('T')[0];
    const updated = registros.map(r => {
      if (r.id === selectedForVerify.id) {
        targetRecord = {
          ...r,
          dataUltimaVerificacao: todayStr,
          observacoes: verificationNotes.trim() 
            ? `${r.observacoes || ''}\n[Verificação ${todayStr}]: ${verificationNotes.trim()}`.trim()
            : r.observacoes
        };
        return targetRecord;
      }
      return r;
    });

    saveRegistros(updated);
    if (targetRecord) {
      RecordRepository.update((targetRecord as Registro).id, targetRecord).catch(err => console.error('Erro ao salvar verificação no Firestore:', err));
    }
    onAddLog(
      'Auditou Registro da Qualidade', 
      `Realizou verificação de conformidade e legibilidade no registro ${selectedForVerify.codigo}. Notas: ${verificationNotes.trim() || 'Nenhuma nota adicional'}`
    );
    setIsVerificationModalOpen(false);
    setSelectedForVerify(null);
  };

  // Simular transição de status (Arquivamento / Descarte)
  const handleTransitionStatus = (reg: Registro, newStatus: 'Ativo' | 'Arquivado' | 'Descartado') => {
    const statusLabels = { Ativo: 'Ativo/Vigente', Arquivado: 'Arquivado (Guarda Intermediária)', Descartado: 'Eliminado/Descartado' };
    const updated = registros.map(r => r.id === reg.id ? { ...r, statusControle: newStatus } : r);
    saveRegistros(updated);
    onAddLog(
      'Alterou Status do Registro', 
      `Mudou o status de controle do registro ${reg.codigo} para "${statusLabels[newStatus]}".`
    );
  };

  // Exportar dados da matriz para CSV
  const handleExportCSV = () => {
    const headers = ['Código', 'Título', 'Documento Origem', 'Setor', 'Mídia', 'Local Armazenamento', 'Tempo Retenção (Anos)', 'Disposição Final', 'Indexação', 'Preenchido por', 'Guarda por', 'Status', 'Última Verificação'];
    const rows = registros.map(r => [
      r.codigo,
      r.titulo,
      r.documentoOrigemId || 'Nenhum',
      r.setor,
      r.tipoMidia,
      r.localArmazenamento,
      r.tempoRetencaoAnos,
      r.disposicaoFinal,
      r.indexacaoMetodo,
      r.responsavelPreenchimento,
      r.responsavelGuarda,
      r.statusControle,
      r.dataUltimaVerificacao || 'Pendente'
    ]);

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" 
      + [headers.join(';'), ...rows.map(e => e.join(';'))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "matriz_controle_registros_vickytex.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onAddLog('Exportou Matriz de Registros', 'Efetuou o download em CSV da planilha mestre de controle de registros.');
  };

  // Imprimir Matriz de Controle de Registros
  const handlePrintMatrix = () => {
    const printContainer = document.createElement('div');
    printContainer.className = 'print-container';

    const content = `
      <html>
        <head>
          <title>SGQ Vickytex - Controle de Registros da Qualidade</title>
          <style>
            body { font-family: sans-serif; color: #1e293b; padding: 20px; font-size: 11px; }
            h1 { font-size: 18px; margin-bottom: 2px; color: #0f172a; text-align: center; text-transform: uppercase; }
            h2 { font-size: 11px; margin-top: 0; margin-bottom: 20px; color: #475569; text-align: center; }
            table { width: 100%; border-collapse: collapse; margin-top: 15px; }
            th, td { border: 1px solid #cbd5e1; padding: 6px 8px; text-align: left; }
            th { bg-color: #f1f5f9; font-weight: bold; }
            .badge { display: inline-block; padding: 2px 6px; border-radius: 4px; font-size: 9px; font-weight: bold; text-transform: uppercase; }
            .badge-ativo { background: #dcfce7; color: #15803d; }
            .badge-arquivado { background: #fef9c3; color: #a16207; }
            .badge-descartado { background: #fee2e2; color: #b91c1c; }
            .footer { margin-top: 30px; text-align: right; font-size: 9px; color: #64748b; border-top: 1px solid #e2e8f0; padding-top: 10px; }
          </style>
        </head>
        <body>
          <h1>Matriz de Controle de Registros da Qualidade</h1>
          <h2>Requisito ISO 9001:2015 - Cláusula 7.5.3 | Vickytex Industrial</h2>
          <table>
            <thead>
              <tr>
                <th>Código</th>
                <th>Título do Registro</th>
                <th>Origem</th>
                <th>Setor</th>
                <th>Tipo de Mídia</th>
                <th>Local de Armazenamento</th>
                <th>Retenção</th>
                <th>Disposição Final</th>
                <th>Guarda</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${registros.map(r => `
                <tr>
                  <td><strong>${r.codigo}</strong></td>
                  <td>${r.titulo}</td>
                  <td>${r.documentoOrigemId || 'N/A'}</td>
                  <td>${r.setor}</td>
                  <td>${r.tipoMidia}</td>
                  <td>${r.localArmazenamento}</td>
                  <td>${r.tempoRetencaoAnos} Anos</td>
                  <td>${r.disposicaoFinal}</td>
                  <td>${r.responsavelGuarda}</td>
                  <td>
                    <span class="badge badge-${r.statusControle.toLowerCase()}">${r.statusControle}</span>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div class="footer">
            Gerado em: ${new Date().toLocaleDateString('pt-BR')} ${new Date().toLocaleTimeString('pt-BR')} | SGQ Vickytex Web v1.0.0
          </div>
        </body>
      </html>
    `;

    const existing = document.querySelector('.print-container');
    if (existing) existing.remove();

    printContainer.innerHTML = content;
    document.body.appendChild(printContainer);

    const handleAfterPrint = () => {
      if (document.body.contains(printContainer)) {
        document.body.removeChild(printContainer);
      }
      window.removeEventListener('afterprint', handleAfterPrint);
    };
    window.addEventListener('afterprint', handleAfterPrint);
    setTimeout(handleAfterPrint, 15000);

    setTimeout(() => {
      try {
        window.print();
      } catch (err) {
        console.error('Error triggering print:', err);
        handleAfterPrint();
      }
    }, 300);
  };

  // Filtrar Registros
  const filteredRegistros = registros.filter(reg => {
    const matchesSearch = 
      reg.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reg.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (reg.documentoOrigemId && reg.documentoOrigemId.toLowerCase().includes(searchTerm.toLowerCase())) ||
      reg.responsavelPreenchimento.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reg.localArmazenamento.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSector = selectedSector === 'Todos' || reg.setor === selectedSector;
    const matchesStatus = selectedStatus === 'Todos' || reg.statusControle === selectedStatus;
    const matchesMidia = selectedMidia === 'Todos' || reg.tipoMidia === selectedMidia;

    return matchesSearch && matchesSector && matchesStatus && matchesMidia;
  });

  // Estatísticas e Analytics do Controle de Registros
  const totalCount = registros.length;
  const activeCount = registros.filter(r => r.statusControle === 'Ativo').length;
  const archivedCount = registros.filter(r => r.statusControle === 'Arquivado').length;
  const discardedCount = registros.filter(r => r.statusControle === 'Descartado').length;

  const physicalCount = registros.filter(r => r.tipoMidia === 'Físico').length;
  const digitalCount = registros.filter(r => r.tipoMidia === 'Digital').length;
  const mixedCount = registros.filter(r => r.tipoMidia === 'Misto').length;

  return (
    <div id="records-module-root" className="p-4 lg:p-8 space-y-6 max-w-7xl mx-auto font-sans">
      
      {/* Header Panel */}
      <div id="records-header" className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-xs border border-slate-200/80 dark:border-slate-800">
        <div className="flex items-center space-x-3.5">
          <div className="p-3.5 bg-blue-50 dark:bg-blue-950/40 text-[#0B3A63] dark:text-blue-400 rounded-xl">
            <FolderLock className="w-6.5 h-6.5" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight text-slate-950 dark:text-white">
              {personalizacao?.registrosTitulo || 'Controle de Registros'}
            </h1>
            <p className="text-xs text-slate-500 font-medium dark:text-slate-400 mt-1">
              {personalizacao?.registrosSubtitulo || 'Diretrizes para identificação, armazenamento, proteção, retenção e disposição final (Requisito ISO 9001:2015 7.5.3)'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button 
            id="btn-print-matrix"
            onClick={handlePrintMatrix}
            className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-all border border-slate-200 dark:border-slate-700 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir Matriz</span>
          </button>
          
          <button 
            id="btn-export-records"
            onClick={handleExportCSV}
            className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-all border border-slate-200 dark:border-slate-700 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Exportar Matriz</span>
          </button>

          <button 
            id="btn-add-record"
            onClick={handleOpenNewForm}
            className="flex items-center space-x-1.5 px-4.5 py-2.5 rounded-xl text-xs font-extrabold bg-[#0B3A63] hover:bg-[#07243e] text-white transition-all shadow-md cursor-pointer"
          >
            <Plus className="w-4.5 h-4.5" />
            <span>Cadastrar Diretriz</span>
          </button>
        </div>
      </div>

      {/* Analytics Bento Grid */}
      <div id="records-analytics-grid" className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* KPI: Total Registros */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 flex items-center space-x-4">
          <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-xl">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Registros Controlados</span>
            <span className="text-2xl font-black text-slate-900 dark:text-white leading-none block mt-1">{totalCount}</span>
            <span className="text-[10px] text-slate-500 font-medium block mt-1">Diretrizes ativas no SGQ</span>
          </div>
        </div>

        {/* KPI: Ativos */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 flex items-center space-x-4">
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-xl">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Ativos / Vigentes</span>
            <span className="text-2xl font-black text-slate-900 dark:text-white leading-none block mt-1">{activeCount}</span>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold block mt-1">
              {totalCount > 0 ? Math.round((activeCount / totalCount) * 100) : 0}% em preenchimento
            </span>
          </div>
        </div>

        {/* KPI: Arquivados */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 flex items-center space-x-4">
          <div className="p-3 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 rounded-xl">
            <Archive className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Guarda Intermediária</span>
            <span className="text-2xl font-black text-slate-900 dark:text-white leading-none block mt-1">{archivedCount}</span>
            <span className="text-[10px] text-slate-500 font-medium block mt-1">Arquivados temporariamente</span>
          </div>
        </div>

        {/* Analytics Gauge Mídia */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between">
          <div className="flex justify-between items-center">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Mídia de Armazenamento</span>
            <Database className="w-4 h-4 text-blue-500" />
          </div>
          <div className="mt-3.5 space-y-1.5">
            <div>
              <div className="flex justify-between text-[10px] font-bold mb-0.5 text-slate-600 dark:text-slate-300">
                <span>Físico (Papel)</span>
                <span>{physicalCount} ({totalCount > 0 ? Math.round((physicalCount / totalCount) * 100) : 0}%)</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div className="bg-slate-400 dark:bg-slate-500 h-full rounded-full" style={{ width: `${totalCount > 0 ? (physicalCount / totalCount) * 100 : 0}%` }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-[10px] font-bold mb-0.5 text-slate-600 dark:text-slate-300">
                <span>Digital</span>
                <span>{digitalCount} ({totalCount > 0 ? Math.round((digitalCount / totalCount) * 100) : 0}%)</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div className="bg-blue-600 h-full rounded-full" style={{ width: `${totalCount > 0 ? (digitalCount / totalCount) * 100 : 0}%` }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-[10px] font-bold mb-0.5 text-slate-600 dark:text-slate-300">
                <span>Misto (Papel + Scan)</span>
                <span>{mixedCount} ({totalCount > 0 ? Math.round((mixedCount / totalCount) * 100) : 0}%)</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${totalCount > 0 ? (mixedCount / totalCount) * 100 : 0}%` }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search Panel */}
      <div id="records-filters-card" className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Barra de Pesquisa */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
            <input 
              id="records-search-input"
              type="text"
              placeholder="Pesquisar por código, título, origem, local de armazenamento..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white placeholder-slate-400 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:ring-1 focus:ring-blue-500 focus:outline-hidden font-medium"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Filtro de Setor */}
            <div className="flex items-center space-x-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1 text-slate-700 dark:text-slate-300">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-[10px] font-bold">Setor:</span>
              <select 
                id="filter-record-sector"
                value={selectedSector}
                onChange={(e) => setSelectedSector(e.target.value)}
                className="bg-transparent border-none text-[10px] font-bold text-[#0B3A63] dark:text-blue-400 focus:outline-hidden p-1"
              >
                <option value="Todos">Todos</option>
                {sectorsList.map(sec => (
                  <option key={sec} value={sec}>{sec}</option>
                ))}
              </select>
            </div>

            {/* Filtro de Mídia */}
            <div className="flex items-center space-x-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1 text-slate-700 dark:text-slate-300">
              <span className="text-[10px] font-bold">Mídia:</span>
              <select 
                id="filter-record-media"
                value={selectedMidia}
                onChange={(e) => setSelectedMidia(e.target.value)}
                className="bg-transparent border-none text-[10px] font-bold text-[#0B3A63] dark:text-blue-400 focus:outline-hidden p-1"
              >
                <option value="Todos">Todos</option>
                <option value="Físico">Físico (Papel)</option>
                <option value="Digital">Digital</option>
                <option value="Misto">Misto</option>
              </select>
            </div>

            {/* Filtro de Status */}
            <div className="flex items-center space-x-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1 text-slate-700 dark:text-slate-300">
              <span className="text-[10px] font-bold">Status:</span>
              <select 
                id="filter-record-status"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="bg-transparent border-none text-[10px] font-bold text-[#0B3A63] dark:text-blue-400 focus:outline-hidden p-1"
              >
                <option value="Todos">Todos</option>
                <option value="Ativo">Ativo</option>
                <option value="Arquivado">Arquivado</option>
                <option value="Descartado">Descartado</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Registros Grid / Cards */}
      <div id="records-list-container" className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <AnimatePresence mode="popLayout">
          {filteredRegistros.map((reg) => (
            <motion.div 
              key={reg.id}
              layout
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
              className="bg-white dark:bg-slate-900 rounded-2xl shadow-xs border border-slate-200/80 dark:border-slate-800 hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group"
            >
              {/* Top Section */}
              <div className="p-6 space-y-4">
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded-md">
                      {reg.codigo}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-1.5 line-clamp-2 leading-snug">
                      {reg.titulo}
                    </h3>
                  </div>

                  {/* Status Badge */}
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shrink-0 border ${
                    reg.statusControle === 'Ativo' 
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-850' 
                      : reg.statusControle === 'Arquivado'
                      ? 'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-850'
                      : 'bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-850'
                  }`}>
                    {reg.statusControle}
                  </span>
                </div>

                {/* Grid Info */}
                <div className="grid grid-cols-2 gap-x-4 gap-y-3 pt-2 text-[11px] font-medium border-t border-slate-100 dark:border-slate-800/80">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">Setor Responsável</span>
                    <span className="text-slate-800 dark:text-slate-200">{reg.setor}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">Mídia / Formato</span>
                    <span className="text-slate-800 dark:text-slate-200">{reg.tipoMidia}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">Armazenamento</span>
                    <span className="text-slate-800 dark:text-slate-200 truncate block max-w-[200px]" title={reg.localArmazenamento}>
                      {reg.localArmazenamento}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">Tempo de Retenção</span>
                    <span className="text-slate-800 dark:text-slate-200">{reg.tempoRetencaoAnos} Anos</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">Indexação</span>
                    <span className="text-slate-800 dark:text-slate-200">{reg.indexacaoMetodo}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">Disposição Final</span>
                    <span className="text-slate-800 dark:text-slate-200">{reg.disposicaoFinal}</span>
                  </div>
                </div>

                {/* Integration References */}
                <div className="flex flex-wrap items-center gap-2.5 pt-2 text-[10px]">
                  {reg.documentoOrigemId && (
                    <div className="flex items-center space-x-1 text-slate-500 bg-slate-50 dark:bg-slate-950/80 px-2 py-1 rounded-md border border-slate-200/50 dark:border-slate-800/50">
                      <FileText className="w-3.5 h-3.5 text-slate-400" />
                      <span>Origem: <strong>{reg.documentoOrigemId}</strong></span>
                    </div>
                  )}

                  {reg.dataUltimaVerificacao && (
                    <div className="flex items-center space-x-1 text-slate-500 bg-slate-50 dark:bg-slate-950/80 px-2 py-1 rounded-md border border-slate-200/50 dark:border-slate-800/50">
                      <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Última Auditoria: <strong>{new Date(reg.dataUltimaVerificacao).toLocaleDateString('pt-BR')}</strong></span>
                    </div>
                  )}
                </div>

                {/* Evidências Fotográficas do Registro */}
                {((reg.fotos && reg.fotos.length > 0) || reg.fotoEvidencia) && (
                  <div className="pt-2">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                        <ImageIcon className="w-3 h-3 text-blue-500" />
                        Fotos & Evidências ({reg.fotos?.length || (reg.fotoEvidencia ? 1 : 0)})
                      </span>
                    </div>
                    <div className="flex items-center gap-2 overflow-x-auto pb-1">
                      {(reg.fotos || (reg.fotoEvidencia ? [reg.fotoEvidencia] : [])).map((imgUrl, pIdx) => (
                        <div 
                          key={pIdx} 
                          onClick={() => setLightboxImage(imgUrl)}
                          className="relative group w-14 h-14 shrink-0 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 cursor-pointer shadow-xs hover:border-blue-400 transition-all"
                        >
                          <img 
                            src={imgUrl} 
                            alt={`Evidência ${pIdx + 1}`} 
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" 
                          />
                          <div className="absolute inset-0 bg-slate-950/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <ZoomIn className="w-4 h-4 text-white drop-shadow-md" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {reg.observacoes && (
                  <div className="bg-slate-50 dark:bg-slate-950/80 p-2.5 rounded-xl border border-slate-200/50 dark:border-slate-800/50 text-[10px] text-slate-500 dark:text-slate-400 flex items-start gap-1.5 leading-relaxed">
                    <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    <span className="whitespace-pre-line">{reg.observacoes}</span>
                  </div>
                )}
              </div>

              {/* Bottom Actions Bar */}
              <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900/60 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4">
                <div className="flex items-center gap-1.5 flex-wrap">
                  {((reg.fotos && reg.fotos.length > 0) || reg.fotoEvidencia) && (
                    <button
                      onClick={() => setLightboxImage((reg.fotos && reg.fotos[0]) || reg.fotoEvidencia || null)}
                      className="flex items-center space-x-1 px-3 py-1.5 rounded-lg text-[10px] font-bold bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 dark:hover:bg-blue-900/50 text-[#0B3A63] dark:text-blue-300 transition-all border border-blue-200/30 dark:border-blue-900/30 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Ver Fotos ({reg.fotos?.length || 1})</span>
                    </button>
                  )}

                  {reg.googleDriveLink ? (
                    <a 
                      href={reg.googleDriveLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-1 px-3 py-1.5 rounded-lg text-[10px] font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-all border border-slate-200 dark:border-slate-700"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Link Drive</span>
                    </a>
                  ) : (
                    <button 
                      onClick={() => {
                        const link = prompt('Insira o link do scan ou arquivo do Google Drive para este registro:', 'https://drive.google.com/file/d/123456');
                        if (link) {
                          const updated = registros.map(r => r.id === reg.id ? { ...r, googleDriveLink: link, googleDriveId: `drive-${reg.id}`, tipoMidia: r.tipoMidia === 'Físico' ? 'Misto' : r.tipoMidia } : r);
                          saveRegistros(updated);
                          onAddLog('Sincronizou Scan de Registro', `Linkou documento digital do Google Drive ao registro ${reg.codigo}.`);
                        }
                      }}
                      className="flex items-center space-x-1 px-3 py-1.5 rounded-lg text-[10px] font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-all border border-slate-200 dark:border-slate-700 cursor-pointer"
                    >
                      <UploadCloud className="w-3.5 h-3.5" />
                      <span>Link Drive</span>
                    </button>
                  )}

                  {/* Audit button */}
                  <button 
                    onClick={() => handleOpenVerifyModal(reg)}
                    className="flex items-center space-x-1 px-3 py-1.5 rounded-lg text-[10px] font-bold bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 transition-all border border-indigo-200/30 dark:border-indigo-900/30 cursor-pointer"
                    title="Registrar verificação física de conformidade (Legibilidade, Integridade, Localização)"
                  >
                    <FileCheck className="w-3.5 h-3.5" />
                    <span>Auditar Legibilidade</span>
                  </button>
                </div>

                <div className="flex items-center gap-1.5">
                  {/* Status switcher helper dropdown/buttons */}
                  {reg.statusControle === 'Ativo' && (
                    <button 
                      onClick={() => handleTransitionStatus(reg, 'Arquivado')}
                      className="px-2 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg text-[10px] font-bold text-amber-700 dark:text-amber-400 border border-slate-200 dark:border-slate-700 cursor-pointer"
                      title="Mover para guarda intermediária (Arquivar)"
                    >
                      Arquivar
                    </button>
                  )}
                  {reg.statusControle === 'Arquivado' && (
                    <button 
                      onClick={() => handleTransitionStatus(reg, 'Descartado')}
                      className="px-2 py-1.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/50 rounded-lg text-[10px] font-bold text-rose-700 dark:text-rose-400 border border-rose-200/30 dark:border-rose-900/30 cursor-pointer"
                      title="Mover para Descarte Final"
                    >
                      Descartar
                    </button>
                  )}
                  {reg.statusControle === 'Descartado' && (
                    <button 
                      onClick={() => handleTransitionStatus(reg, 'Ativo')}
                      className="px-2 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg text-[10px] font-bold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 cursor-pointer"
                      title="Ativar/Reestabelecer Controle"
                    >
                      Reativar
                    </button>
                  )}

                  {/* Edit Icon */}
                  <button 
                    onClick={() => handleOpenEditForm(reg)}
                    className="p-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg text-slate-500 hover:text-[#0B3A63] dark:hover:text-blue-400 transition-all cursor-pointer"
                    title="Editar Diretrizes"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>

                  {/* Delete Icon */}
                  <button 
                    onClick={() => handleDeleteRegistro(reg.id, reg.codigo)}
                    className="p-1.5 bg-slate-100 hover:bg-rose-100 dark:bg-slate-800 dark:hover:bg-rose-950/50 rounded-lg text-slate-400 hover:text-rose-600 transition-all cursor-pointer"
                    title="Excluir Diretrizes"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {filteredRegistros.length === 0 && (
          <div className="col-span-1 lg:col-span-2 text-center py-14 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-3">
            <FolderLock className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto" />
            <p className="text-sm font-bold text-slate-600 dark:text-slate-300">Nenhuma diretriz de controle de registros localizada.</p>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Utilize o campo de busca ou mude os filtros para reajustar seu critério, ou crie uma nova diretriz mestre de controle.
            </p>
          </div>
        )}
      </div>

      {/* FORM MODAL: CADASTRAR OU EDITAR DIRETRIZ DE REGISTRO */}
      <AnimatePresence>
        {isFormOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs font-sans">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col overflow-hidden max-h-[90vh]"
            >
              {/* Header */}
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-[#0B3A63] text-white">
                <div>
                  <h2 className="text-base font-extrabold tracking-tight">
                    {editingRegistro ? `Editar Controle de Registro: ${editingRegistro.codigo}` : 'Cadastrar Controle de Registro (ISO 7.5.3)'}
                  </h2>
                  <p className="text-[10px] text-blue-200/80 font-medium mt-0.5">
                    Definição de regras de retenção, armazenamento e disposição final das evidências da qualidade
                  </p>
                </div>
                <button 
                  onClick={() => setIsFormOpen(false)}
                  className="text-white/70 hover:text-white font-bold text-sm bg-white/10 hover:bg-white/20 w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Form Scrollable Body */}
              <form onSubmit={handleSaveRegistro} className="flex-1 overflow-y-auto p-6 space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Código */}
                  <div>
                    <label className="text-[11px] font-bold text-slate-500 block mb-1">Código do Registro *</label>
                    <input 
                      type="text"
                      value={codigo}
                      onChange={(e) => setCodigo(e.target.value)}
                      placeholder="Ex: REG-COS-001"
                      required
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:ring-1 focus:ring-blue-500 focus:outline-hidden font-medium"
                    />
                  </div>

                  {/* Setor */}
                  <div>
                    <label className="text-[11px] font-bold text-slate-500 block mb-1">Setor Responsável *</label>
                    <select 
                      value={setor}
                      onChange={(e) => setSetor(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:ring-1 focus:ring-blue-500 focus:outline-hidden font-bold"
                    >
                      {sectorsList.map(sec => (
                        <option key={sec} value={sec}>{sec}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Título */}
                <div>
                  <label className="text-[11px] font-bold text-slate-500 block mb-1">Título/Nome do Registro *</label>
                  <input 
                    type="text"
                    value={titulo}
                    onChange={(e) => setTitulo(e.target.value)}
                    placeholder="Ex: Ficha de Inspeção Dimensional de Lotes de Malha"
                    required
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:ring-1 focus:ring-blue-500 focus:outline-hidden font-medium"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Doc Origem */}
                  <div>
                    <label className="text-[11px] font-bold text-slate-500 block mb-1">Formulário/Documento de Origem</label>
                    <select 
                      value={documentoOrigemId}
                      onChange={(e) => setDocumentoOrigemId(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:ring-1 focus:ring-blue-500 focus:outline-hidden font-bold"
                    >
                      <option value="">Nenhum formulário vinculado</option>
                      {documents.filter(d => d.tipo === 'FOR' || d.tipo === 'LIST').map(doc => (
                        <option key={doc.id} value={doc.id}>{doc.codigo} - {doc.titulo}</option>
                      ))}
                    </select>
                  </div>

                  {/* Tipo Mídia */}
                  <div>
                    <label className="text-[11px] font-bold text-slate-500 block mb-1">Tipo de Mídia / Formato *</label>
                    <select 
                      value={tipoMidia}
                      onChange={(e) => setTipoMidia(e.target.value as any)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:ring-1 focus:ring-blue-500 focus:outline-hidden font-bold"
                    >
                      <option value="Físico">Físico (Papel/Armário)</option>
                      <option value="Digital">Digital (Nuvem/Drive)</option>
                      <option value="Misto">Misto (Papel + Cópia em Nuvem)</option>
                    </select>
                  </div>
                </div>

                {/* Local de Armazenamento */}
                <div>
                  <label className="text-[11px] font-bold text-slate-500 block mb-1">Local Físico de Armazenamento / Pasta Digital *</label>
                  <input 
                    type="text"
                    value={localArmazenamento}
                    onChange={(e) => setLocalArmazenamento(e.target.value)}
                    placeholder="Ex: Armário de Aço A2 - Pasta Vermelha ou Pasta Google Drive: /Qualidade/2026"
                    required
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:ring-1 focus:ring-blue-500 focus:outline-hidden font-medium"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Tempo Retencao */}
                  <div>
                    <label className="text-[11px] font-bold text-slate-500 block mb-1">Tempo de Retenção (Em Anos) *</label>
                    <input 
                      type="number"
                      min={1}
                      max={50}
                      value={tempoRetencaoAnos}
                      onChange={(e) => setTempoRetencaoAnos(parseInt(e.target.value) || 5)}
                      required
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:ring-1 focus:ring-blue-500 focus:outline-hidden font-medium"
                    />
                  </div>

                  {/* Disposicao Final */}
                  <div>
                    <label className="text-[11px] font-bold text-slate-500 block mb-1">Disposição Final *</label>
                    <select 
                      value={disposicaoFinal}
                      onChange={(e) => setDisposicaoFinal(e.target.value as any)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:ring-1 focus:ring-blue-500 focus:outline-hidden font-bold"
                    >
                      <option value="Descarte">Descarte (Moagem/Incineração)</option>
                      <option value="Reciclagem">Reciclagem de Papel</option>
                      <option value="Digitalização e Descarte">Digitalização e posterior Descarte</option>
                      <option value="Histórico Permanente">Histórico Permanente (Arquivo Morto)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Responsavel Preenchimento */}
                  <div>
                    <label className="text-[11px] font-bold text-slate-500 block mb-1">Responsável pelo Preenchimento *</label>
                    <input 
                      type="text"
                      value={responsavelPreenchimento}
                      onChange={(e) => setResponsavelPreenchimento(e.target.value)}
                      placeholder="Ex: Operador do Enfesto"
                      required
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:ring-1 focus:ring-blue-500 focus:outline-hidden font-medium"
                    />
                  </div>

                  {/* Responsavel Guarda */}
                  <div>
                    <label className="text-[11px] font-bold text-slate-500 block mb-1">Responsável pela Guarda *</label>
                    <input 
                      type="text"
                      value={responsavelGuarda}
                      onChange={(e) => setResponsavelGuarda(e.target.value)}
                      placeholder="Ex: Supervisor da Qualidade"
                      required
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:ring-1 focus:ring-blue-500 focus:outline-hidden font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Método de Indexação */}
                  <div>
                    <label className="text-[11px] font-bold text-slate-500 block mb-1">Método de Indexação (Busca) *</label>
                    <input 
                      type="text"
                      value={indexacaoMetodo}
                      onChange={(e) => setIndexacaoMetodo(e.target.value)}
                      placeholder="Ex: Por Data / Por Código de Lote"
                      required
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:ring-1 focus:ring-blue-500 focus:outline-hidden font-medium"
                    />
                  </div>

                  {/* Status do Controle */}
                  <div>
                    <label className="text-[11px] font-bold text-slate-500 block mb-1">Status de Controle *</label>
                    <select 
                      value={statusControle}
                      onChange={(e) => setStatusControle(e.target.value as any)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:ring-1 focus:ring-blue-500 focus:outline-hidden font-bold"
                    >
                      <option value="Ativo">Ativo (Preenchimento Contínuo)</option>
                      <option value="Arquivado">Arquivado (Histórico Intermediário)</option>
                      <option value="Descartado">Descartado (Excedeu Retenção)</option>
                    </select>
                  </div>
                </div>

                {/* Evidências Fotográficas e Scans do Registro */}
                <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <Camera className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                      <span>Anexar Fotos / Scans do Registro ({fotos.length})</span>
                    </label>
                    <span className="text-[10px] text-slate-400">Otimização e compressão automática</span>
                  </div>

                  {/* Thumbnail gallery in form */}
                  {fotos.length > 0 && (
                    <div className="flex flex-wrap gap-2.5 p-2 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200/80 dark:border-slate-800">
                      {fotos.map((imgUrl, idx) => (
                        <div key={idx} className="relative group w-20 h-20 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 shadow-xs">
                          <img 
                            src={imgUrl} 
                            alt={`Preview ${idx + 1}`} 
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover" 
                          />
                          <button
                            type="button"
                            onClick={() => handleRemovePhoto(idx)}
                            className="absolute top-1 right-1 w-5 h-5 bg-rose-600 hover:bg-rose-700 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm cursor-pointer"
                            title="Remover foto"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Upload Dropzone / Button */}
                  <label className={`border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition-all ${
                    isUploadingPhoto 
                      ? 'bg-blue-50/50 dark:bg-blue-950/20 border-blue-300 text-blue-500' 
                      : 'border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-500 bg-slate-50/50 dark:bg-slate-950/30'
                  }`}>
                    {isUploadingPhoto ? (
                      <div className="flex items-center gap-2 text-xs font-bold text-blue-600 dark:text-blue-400">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Comprimindo e anexando fotos...</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center text-center space-y-1">
                        <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                          <UploadCloud className="w-5 h-5" />
                          <Camera className="w-5 h-5" />
                        </div>
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                          Tirar foto com a câmera ou selecionar imagens
                        </span>
                        <span className="text-[10px] text-slate-400">
                          PNG, JPG, JPEG ou WebP (compressão inteligente direta)
                        </span>
                      </div>
                    )}
                    <input 
                      type="file" 
                      accept="image/*" 
                      multiple 
                      disabled={isUploadingPhoto}
                      onChange={handlePhotoUpload} 
                      className="hidden" 
                    />
                  </label>
                </div>

                {/* Google Drive Link */}
                {(tipoMidia === 'Digital' || tipoMidia === 'Misto') && (
                  <div>
                    <label className="text-[11px] font-bold text-slate-500 block mb-1">Link de Acesso do Google Drive / Nuvem</label>
                    <input 
                      type="url"
                      value={googleDriveLink}
                      onChange={(e) => setGoogleDriveLink(e.target.value)}
                      placeholder="https://drive.google.com/drive/folders/..."
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:ring-1 focus:ring-blue-500 focus:outline-hidden font-medium"
                    />
                  </div>
                )}

                {/* Observações */}
                <div>
                  <label className="text-[11px] font-bold text-slate-500 block mb-1">Notas / Observações de Controle</label>
                  <textarea 
                    rows={2}
                    value={observacoes}
                    onChange={(e) => setObservacoes(e.target.value)}
                    placeholder="Observações complementares como criticidade do registro, instruções específicas de descarte ou histórico."
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:ring-1 focus:ring-blue-500 focus:outline-hidden font-medium"
                  />
                </div>

                {/* Submit Buttons */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                  <button 
                    type="button"
                    onClick={() => setIsFormOpen(false)}
                    className="px-4.5 py-2.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-all cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    className="px-5 py-2.5 rounded-xl text-xs font-extrabold bg-[#0B3A63] hover:bg-[#07243e] text-white transition-all shadow-md cursor-pointer"
                  >
                    Salvar Controle
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* VERIFICATION MODAL (AUDITAR LEGIBILIDADE E CONFORMIDADE) */}
      <AnimatePresence>
        {isVerificationModalOpen && selectedForVerify && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs font-sans">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-indigo-900 text-white flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-extrabold tracking-tight">Auditoria Física de Legibilidade</h3>
                  <p className="text-[10px] text-indigo-200/80 font-medium mt-0.5">Disposição de acordo com ISO 9001 Cláusula 7.5.3.2</p>
                </div>
                <button 
                  onClick={() => setIsVerificationModalOpen(false)}
                  className="text-white/70 hover:text-white font-bold"
                >
                  ✕
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl space-y-2">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Registro Sob Verificação</div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">{selectedForVerify.codigo}</div>
                  <div className="text-xs text-slate-600 dark:text-slate-400 font-medium">{selectedForVerify.titulo}</div>
                  <div className="text-[10px] text-slate-500 font-medium">Localização Mapeada: <span className="font-bold text-slate-700 dark:text-slate-300">{selectedForVerify.localArmazenamento}</span></div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-500 block">Observações da Verificação</label>
                  <textarea 
                    rows={3}
                    placeholder="Verificado estado de conservação física. Legibilidade das assinaturas mantida. Nenhum rasgo ou umidade detectados."
                    value={verificationNotes}
                    onChange={(e) => setVerificationNotes(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:ring-1 focus:ring-blue-500 focus:outline-hidden font-medium"
                  />
                </div>

                <div className="flex items-center space-x-2 text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-950/40 p-3 rounded-xl">
                  <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
                  <span>
                    Ao confirmar, a data de auditoria deste registro será atualizada para **hoje**, comprovando às auditorias de certificação o controle ativo do acervo.
                  </span>
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button 
                    onClick={() => setIsVerificationModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-all cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button 
                    onClick={handleSaveVerification}
                    className="px-4.5 py-2 rounded-xl text-xs font-extrabold bg-indigo-600 hover:bg-indigo-700 text-white transition-all shadow-md cursor-pointer"
                  >
                    Confirmar Verificação
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- CONFIRMAÇÃO DE EXCLUSÃO DE REGISTRO --- */}
      <AnimatePresence>
        {registroToDelete && (
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full border border-slate-200 dark:border-slate-800 overflow-hidden p-6 space-y-4"
            >
              <div className="flex items-center space-x-3 pb-2 border-b border-slate-100 dark:border-slate-800">
                <div className="p-2.5 bg-rose-50 dark:bg-rose-950/40 text-rose-600 rounded-full shrink-0">
                  <AlertTriangle className="w-5 h-5 text-rose-600" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    Confirmar Exclusão de Registro
                  </h3>
                  <p className="text-[10px] text-slate-400">SGQ Vickytex — Controle de Registros ISO 7.5.3</p>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Deseja realmente remover permanentemente as diretrizes de controle do registro:
                  <strong className="text-slate-900 dark:text-white font-extrabold block mt-1 text-sm bg-slate-50 dark:bg-slate-950 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 font-mono">
                    {registroToDelete.code}
                  </strong>
                </p>
                <p className="text-[10px] text-rose-600 dark:text-rose-400 font-semibold bg-rose-500/5 p-2.5 rounded-lg border border-rose-500/10">
                  Atenção: Essa operação é permanente e removerá todas as diretrizes de retenção, armazenamento e guarda deste registro.
                </p>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setRegistroToDelete(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={confirmDeleteRegistro}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition-colors shadow-xs cursor-pointer"
                >
                  Sim, Excluir Registro
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Lightbox Modal para visualização ampliada de fotos e evidências */}
      <AnimatePresence>
        {lightboxImage && (
          <div 
            className="fixed inset-0 z-60 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setLightboxImage(null)}
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative max-w-4xl max-h-[90vh] flex flex-col items-center"
              onClick={e => e.stopPropagation()}
            >
              <div className="absolute top-3 right-3 flex items-center gap-2 z-10">
                <a 
                  href={lightboxImage} 
                  download="registro_evidencia.jpg"
                  className="bg-slate-900/80 hover:bg-slate-900 text-white p-2 rounded-full backdrop-blur-xs transition-all cursor-pointer shadow-lg"
                  title="Baixar Foto"
                >
                  <Download className="w-4 h-4" />
                </a>
                <button 
                  onClick={() => setLightboxImage(null)}
                  className="bg-slate-900/80 hover:bg-slate-900 text-white p-2 rounded-full backdrop-blur-xs transition-all cursor-pointer shadow-lg"
                  title="Fechar"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <img 
                src={lightboxImage} 
                alt="Evidência do Registro" 
                referrerPolicy="no-referrer"
                className="max-w-full max-h-[80vh] object-contain rounded-xl shadow-2xl border border-white/10"
              />
              <span className="text-[11px] text-white/70 mt-3 font-medium">
                Evidência digital anexada ao registro da qualidade
              </span>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Cartão de Ajuda ao Auditor sobre Cláusula ISO */}
      <div id="registros-help-box" className="p-5 rounded-xl border border-blue-100 dark:border-blue-950 bg-blue-50/20 dark:bg-blue-950/15 flex items-start space-x-3.5 mt-6">
        <Award className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
        <div>
          <h4 className="text-xs font-bold text-blue-800 dark:text-blue-300">
            {personalizacao?.registrosAjudaTitulo || 'Controle e Retenção de Registros da Qualidade (ISO 7.5.3)'}
          </h4>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
            {personalizacao?.registrosAjudaSubtitulo || 'Os registros são evidências objetivas de que os processos foram executados conforme planejado. O controle sistemático de armazenamento, tempo de retenção, descarte e rastreabilidade assegura a proteção contra alterações não intencionais e facilita a recuperação imediata durante auditorias externas.'}
          </p>
        </div>
      </div>

    </div>
  );
};
