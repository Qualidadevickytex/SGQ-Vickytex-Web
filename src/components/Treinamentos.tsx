/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  GraduationCap, 
  Plus, 
  CheckCircle2, 
  Clock, 
  Search, 
  UserCheck, 
  FileText, 
  Calendar, 
  Award, 
  Users, 
  Printer, 
  TrendingUp, 
  AlertCircle,
  Briefcase,
  ChevronRight,
  ClipboardList,
  Trash2,
  Pencil
} from 'lucide-react';
import { Documento, Treinamento, ColaboradorCompetencia, SectorType } from '../types';
import { SECTORS, getSectors, PersonalizacaoGeral } from '../utils/mockData';
import { TrainingRepository } from '../services/database/repositories/training.repository';
import { CollaboratorRepository } from '../services/database/repositories/collaborator.repository';

interface TreinamentosProps {
  documents: Documento[];
  onAddLog: (action: string, details: string, docId?: string) => void;
  personalizacao?: PersonalizacaoGeral;
  colaboradores: ColaboradorCompetencia[];
  setColaboradores: React.Dispatch<React.SetStateAction<ColaboradorCompetencia[]>>;
}

// Dados iniciais de competência e colaboradores (salvo localmente ou inicializado)
export const INITIAL_COLABORADORES: ColaboradorCompetencia[] = [
  { id: 'col-1', nome: 'Ana Souza', cargo: 'Costureira Especialista', setor: 'Costura', documentosAssinados: ['POP-COS-002'], status: 'Apto' },
  { id: 'col-2', nome: 'Roberto Costa', cargo: 'Operador de Enfesto', setor: 'Corte', documentosAssinados: ['POP-COR-001'], status: 'Apto' },
  { id: 'col-3', nome: 'Jorge Dias', cargo: 'Impressor Serigráfico', setor: 'Estamparia', documentosAssinados: [], status: 'Pendente' },
  { id: 'col-4', nome: 'Maria Santos', cargo: 'Passadora Industrial', setor: 'Acabamento', documentosAssinados: ['IT-ACA-002'], status: 'Apto' },
  { id: 'col-5', nome: 'Francisco Lima', cargo: 'Auxiliar de Expedição', setor: 'Expedição', documentosAssinados: [], status: 'Em Treinamento' },
  { id: 'col-6', nome: 'Clara Mendes', cargo: 'Operadora de Corte', setor: 'Corte', documentosAssinados: [], status: 'Em Treinamento' },
  { id: 'col-7', nome: 'Mateus Oliveira', cargo: 'Costureiro de Fechamento', setor: 'Costura', documentosAssinados: ['POP-COS-002'], status: 'Apto' }
];

const INITIAL_TREINAMENTOS: Treinamento[] = [
  {
    id: 'tr-001',
    codigo: 'TRE-2026-001',
    documentoId: 'POP-COR-001',
    titulo: 'Treinamento Prático: Tempo de Descanso e Alinhamento do Enfesto de Malha',
    dataTreinamento: '2026-02-14',
    instrutor: 'Mariana Silva (Qualidade)',
    setor: 'Corte',
    duracaoHoras: 2,
    participantes: ['Roberto Costa', 'Clara Mendes'],
    status: 'Realizado'
  },
  {
    id: 'tr-002',
    codigo: 'TRE-2026-002',
    documentoId: 'IT-ACA-002',
    titulo: 'Instrução Prática de Dobra de Calças de Brim com Gabarito de Acrílico',
    dataTreinamento: '2026-07-06',
    instrutor: 'Supervisor Acabamento',
    setor: 'Acabamento',
    duracaoHoras: 1.5,
    participantes: ['Maria Santos'],
    status: 'Realizado'
  },
  {
    id: 'tr-003',
    codigo: 'TRE-2026-003',
    documentoId: 'POP-COS-002',
    titulo: 'Metodologia ombro a ombro com cadarço de 8mm',
    dataTreinamento: '2026-07-28',
    instrutor: 'Roberto Costa (Supervisor)',
    setor: 'Costura',
    duracaoHoras: 3,
    participantes: ['Ana Souza', 'Mateus Oliveira'],
    status: 'Planejado'
  }
];

export const Treinamentos: React.FC<TreinamentosProps> = ({ 
  documents, 
  onAddLog, 
  personalizacao,
  colaboradores,
  setColaboradores
}) => {
  const [sectorsList] = useState<string[]>(() => getSectors());
  const [activeTab, setActiveTab] = useState<'matriz' | 'historico'>('matriz');
  
  // Persistência local simulada das competências e treinamentos
  const [treinamentos, setTreinamentos] = useState<Treinamento[]>(() => {
    const saved = localStorage.getItem('sgq_vickytex_trainings') || localStorage.getItem('sgq_vickytex_treinamentos');
    return saved ? JSON.parse(saved) : [];
  });

  React.useEffect(() => {
    const fetchTrainings = async () => {
      try {
        const res = await TrainingRepository.findAll();
        if (res.success && Array.isArray(res.data)) {
          setTreinamentos(res.data);
        }
      } catch (err) {
        console.error('Falha ao carregar treinamentos do repositório:', err);
      }
    };
    fetchTrainings();

    const unsub = TrainingRepository.subscribe((items) => {
      setTreinamentos(items);
    });
    return () => unsub();
  }, []);

  const saveColaboradores = (newColabs: ColaboradorCompetencia[]) => {
    setColaboradores(newColabs);
  };

  const saveTreinamentos = (newTreins: Treinamento[]) => {
    setTreinamentos(newTreins);
  };

  const handleDeleteColaborador = (id: string) => {
    const col = colaboradores.find(c => c.id === id);
    if (col) {
      setColToDelete(col);
    }
  };

  const handleDeleteTreinamento = (id: string) => {
    const tr = treinamentos.find(t => t.id === id);
    if (tr) {
      setTreinToDelete(tr);
    }
  };

  // Estados dos formulários e filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSector, setSelectedSector] = useState<string>('Todos');
  
  // Modal de Novo Registro de Treinamento
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTreinamento, setEditingTreinamento] = useState<Treinamento | null>(null);
  const [newTraining, setNewTraining] = useState({
    documentoId: '',
    titulo: '',
    dataTreinamento: new Date().toISOString().split('T')[0],
    instrutor: '',
    setor: 'Costura' as SectorType,
    duracaoHoras: 2,
    participantesStr: '',
    status: 'Realizado' as 'Planejado' | 'Realizado'
  });

  // Modal de Colaborador (Criar/Editar)
  const [isColaboradorModalOpen, setIsColaboradorModalOpen] = useState(false);
  const [editingColaborador, setEditingColaborador] = useState<ColaboradorCompetencia | null>(null);
  const [colToDelete, setColToDelete] = useState<ColaboradorCompetencia | null>(null);
  const [treinToDelete, setTreinToDelete] = useState<Treinamento | null>(null);
  const [colaboradorForm, setColaboradorForm] = useState({
    nome: '',
    cargo: '',
    setor: 'Costura' as SectorType,
    status: 'Em Treinamento' as 'Apto' | 'Em Treinamento' | 'Pendente',
    documentosAssinados: [] as string[]
  });

  const handleOpenNewColaborador = () => {
    setEditingColaborador(null);
    setColaboradorForm({
      nome: '',
      cargo: '',
      setor: 'Costura',
      status: 'Em Treinamento',
      documentosAssinados: []
    });
    setIsColaboradorModalOpen(true);
  };

  const handleOpenEditColaborador = (col: ColaboradorCompetencia) => {
    setEditingColaborador(col);
    setColaboradorForm({
      nome: col.nome,
      cargo: col.cargo,
      setor: col.setor,
      status: col.status,
      documentosAssinados: col.documentosAssinados
    });
    setIsColaboradorModalOpen(true);
  };

  const handleSaveColaborador = (e: React.FormEvent) => {
    e.preventDefault();
    if (!colaboradorForm.nome || !colaboradorForm.cargo) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    if (editingColaborador) {
      let updatedColab: ColaboradorCompetencia | null = null;
      const updated = colaboradores.map(c => {
        if (c.id === editingColaborador.id) {
          updatedColab = {
            ...c,
            nome: colaboradorForm.nome,
            cargo: colaboradorForm.cargo,
            setor: colaboradorForm.setor,
            status: colaboradorForm.status,
            documentosAssinados: colaboradorForm.documentosAssinados
          };
          return updatedColab;
        }
        return c;
      });
      saveColaboradores(updated);
      if (updatedColab) {
        CollaboratorRepository.update((updatedColab as ColaboradorCompetencia).id, updatedColab).catch(err => console.error('Erro ao atualizar colaborador no Firestore:', err));
      }
      onAddLog('Editou Colaborador', `Atualizou informações do colaborador ${colaboradorForm.nome}.`);
    } else {
      const created: ColaboradorCompetencia = {
        id: `col-${Date.now()}`,
        nome: colaboradorForm.nome,
        cargo: colaboradorForm.cargo,
        setor: colaboradorForm.setor,
        status: colaboradorForm.status,
        documentosAssinados: colaboradorForm.documentosAssinados
      };
      saveColaboradores([...colaboradores, created]);
      CollaboratorRepository.create(created).catch(err => console.error('Erro ao cadastrar colaborador no Firestore:', err));
      onAddLog('Cadastrou Colaborador', `Cadastrou o novo colaborador ${colaboradorForm.nome} no setor ${colaboradorForm.setor}.`);
    }

    setIsColaboradorModalOpen(false);
  };

  const handleOpenNewTraining = () => {
    setEditingTreinamento(null);
    setNewTraining({
      documentoId: '',
      titulo: '',
      dataTreinamento: new Date().toISOString().split('T')[0],
      instrutor: '',
      setor: 'Costura',
      duracaoHoras: 2,
      participantesStr: '',
      status: 'Realizado'
    });
    setIsModalOpen(true);
  };

  const handleOpenEditTraining = (tre: Treinamento) => {
    setEditingTreinamento(tre);
    setNewTraining({
      documentoId: tre.documentoId,
      titulo: tre.titulo,
      dataTreinamento: tre.dataTreinamento,
      instrutor: tre.instrutor,
      setor: tre.setor,
      duracaoHoras: tre.duracaoHoras,
      participantesStr: tre.participantes.join(', '),
      status: tre.status as 'Planejado' | 'Realizado'
    });
    setIsModalOpen(true);
  };

  // Modal de Assinatura Individual Rápida
  const [isSignModalOpen, setIsSignModalOpen] = useState(false);
  const [signForm, setSignForm] = useState({
    colaboradorId: '',
    documentoId: ''
  });

  // Visualização de Ficha de Comprovação de Treinamento (Ficha de Presença)
  const [selectedTrainingDoc, setSelectedTrainingDoc] = useState<Treinamento | null>(null);

  const handlePrintTrainingSheet = () => {
    if (!selectedTrainingDoc) return;
    
    // Remover qualquer container de impressão anterior para evitar duplicidade
    const existing = document.querySelector('.print-container');
    if (existing) {
      existing.remove();
    }
    
    const printContainer = document.createElement('div');
    printContainer.className = 'print-container';
    
    const content = `
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;700&display=swap');
        .print-wrapper {
          font-family: 'Inter', sans-serif;
          padding: 40px;
          background-color: #fff;
          color: #0f172a;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        .header-container {
          border: 1px solid #cbd5e1;
          padding: 16px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 24px;
        }
        .logo-title {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .logo {
          width: 40px;
          height: 40px;
          background-color: #2563eb;
          border-radius: 6px;
          color: #ffffff;
          font-weight: 900;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
        }
        .company-name {
          font-size: 14px;
          font-weight: 800;
          margin: 0;
        }
        .company-sub {
          font-size: 10px;
          color: #64748b;
          margin: 0;
        }
        .header-ref {
          text-align: right;
        }
        .ref-code {
          font-family: 'JetBrains Mono', monospace;
          font-size: 12px;
          font-weight: 700;
          margin: 0;
        }
        .ref-sub {
          font-size: 9px;
          color: #94a3b8;
          margin: 0;
        }
        .card {
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 16px;
          margin-bottom: 24px;
          background: #ffffff;
        }
        .card-title {
          font-size: 12px;
          font-weight: 700;
          color: #2563eb;
          border-bottom: 1px solid #f1f5f9;
          padding-bottom: 6px;
          margin-top: 0;
          margin-bottom: 12px;
          text-transform: uppercase;
          font-family: 'JetBrains Mono', monospace;
        }
        .grid-2 {
          display: grid;
          grid-template-cols: 1fr 1fr;
          gap: 16px;
          margin-bottom: 12px;
        }
        .grid-item-label {
          font-size: 9px;
          color: #64748b;
          margin: 0;
          text-transform: uppercase;
        }
        .grid-item-val {
          font-size: 12px;
          font-weight: 700;
          margin: 2px 0 0 0;
        }
        .mono {
          font-family: 'JetBrains Mono', monospace;
        }
        .list-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 0;
          border-bottom: 1px solid #f1f5f9;
        }
        .list-row:last-child {
          border-bottom: none;
        }
        .part-name {
          font-size: 12px;
          font-weight: 700;
          margin: 0;
        }
        .part-role {
          font-size: 9px;
          color: #64748b;
          margin: 0;
        }
        .part-sign {
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px;
          color: #94a3b8;
          font-style: italic;
        }
        .footer-info {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 12px;
          font-size: 10px;
          color: #64748b;
          text-align: center;
          line-height: 1.5;
        }
      </style>
      <div class="print-wrapper">
        <div class="header-container">
          <div class="logo-title">
            <div class="logo">VT</div>
            <div>
              <h4 class="company-name">VICKYTEX S.A.</h4>
              <p class="company-sub">Sistema de Gestão da Qualidade</p>
            </div>
          </div>
          <div class="header-ref">
            <h4 class="ref-code">REG-QLD-102</h4>
            <p class="ref-sub">Ref: Cláusula 7.2 ISO 9001:2015</p>
          </div>
        </div>
        
        <div class="card">
          <h3 class="card-title">Identificação do Registro de Competência</h3>
          <div class="grid-2">
            <div>
              <p class="grid-item-label">Código Interno</p>
              <p class="grid-item-val mono">${selectedTrainingDoc.codigo}</p>
            </div>
            <div>
              <p class="grid-item-label">Data de Realização</p>
              <p class="grid-item-val">${selectedTrainingDoc.dataTreinamento}</p>
            </div>
            <div>
              <p class="grid-item-label">Instrutor / Responsável</p>
              <p class="grid-item-val">${selectedTrainingDoc.instrutor}</p>
            </div>
            <div>
              <p class="grid-item-label">Procedimento / POP Alvo</p>
              <p class="grid-item-val mono">${selectedTrainingDoc.documentoId}</p>
            </div>
          </div>
          <div style="margin-top: 12px;">
            <p class="grid-item-label">Conteúdo Técnico Abordado</p>
            <p class="grid-item-val" style="font-weight: 600; color: #334155;">${selectedTrainingDoc.titulo}</p>
          </div>
        </div>
        
        <div class="card">
          <h3 class="card-title">Lista de Assinaturas e Declaração de Entendimento</h3>
          <div>
            ${selectedTrainingDoc.participantes.map(part => `
              <div class="list-row">
                <div>
                  <p class="part-name">${part}</p>
                  <p class="part-role">Apto para Operação Industrial</p>
                </div>
                <div class="part-sign">
                  Assinado digitalmente via Google SSO (Vickytex.com.br)
                </div>
              </div>
            `).join('')}
          </div>
        </div>
        
        <div class="footer-info">
          Este documento é uma evidência oficial de conformidade. Ele é integrado ao Google Drive corporativo sob a pasta oficial da Vickytex, possuindo controle de revisões rastreável.
        </div>
      </div>
    `;
    
    printContainer.innerHTML = content;
    document.body.appendChild(printContainer);
    
    // Evento afterprint para garantir remoção segura do container apenas depois que a impressão é iniciada/fechada
    const handleAfterPrint = () => {
      if (document.body.contains(printContainer)) {
        document.body.removeChild(printContainer);
      }
      window.removeEventListener('afterprint', handleAfterPrint);
    };
    window.addEventListener('afterprint', handleAfterPrint);
    
    // Fallback de segurança caso afterprint não dispare
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

  const handleCreateTraining = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTraining.documentoId || !newTraining.titulo || !newTraining.instrutor) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    const doc = documents.find(d => d.id === newTraining.documentoId);
    const partArray = newTraining.participantesStr
      .split(',')
      .map(p => p.trim())
      .filter(p => p.length > 0);

    if (editingTreinamento) {
      const updatedItem = {
        ...editingTreinamento,
        documentoId: newTraining.documentoId,
        titulo: newTraining.titulo,
        dataTreinamento: newTraining.dataTreinamento,
        instrutor: newTraining.instrutor,
        setor: doc?.setor || newTraining.setor,
        duracaoHoras: Number(newTraining.duracaoHoras),
        participantes: partArray,
        status: newTraining.status
      };
      const updated = treinamentos.map(t => {
        if (t.id === editingTreinamento.id) {
          return updatedItem;
        }
        return t;
      });
      saveTreinamentos(updated);
      onAddLog('Editou Treinamento', `Atualizou o registro de treinamento ${editingTreinamento.codigo}.`);
      
      try {
        TrainingRepository.update(editingTreinamento.id, updatedItem);
      } catch (err) {
        console.error('Falha ao atualizar treinamento remoto:', err);
      }
    } else {
      const codPrefix = `TRE-2026-${(treinamentos.length + 1).toString().padStart(3, '0')}`;
      const created: Treinamento = {
        id: `tr-${Date.now()}`,
        codigo: codPrefix,
        documentoId: newTraining.documentoId,
        titulo: newTraining.titulo,
        dataTreinamento: newTraining.dataTreinamento,
        instrutor: newTraining.instrutor,
        setor: doc?.setor || newTraining.setor,
        duracaoHoras: Number(newTraining.duracaoHoras),
        participantes: partArray,
        status: newTraining.status
      };

      const updatedTreinamentos = [created, ...treinamentos];
      saveTreinamentos(updatedTreinamentos);

      try {
        TrainingRepository.create(created);
      } catch (err) {
        console.error('Falha ao criar treinamento remoto:', err);
      }

      // Se o treinamento foi realizado, adiciona automaticamente a assinatura dos POPs aos colaboradores correspondentes
      if (newTraining.status === 'Realizado' && partArray.length > 0) {
        const updatedColabs = colaboradores.map(col => {
          if (partArray.includes(col.nome)) {
            const docs = [...col.documentosAssinados];
            if (!docs.includes(newTraining.documentoId)) {
              docs.push(newTraining.documentoId);
            }
            return {
              ...col,
              documentosAssinados: docs,
              status: 'Apto' as const
            };
          }
          return col;
        });
        saveColaboradores(updatedColabs);
        updatedColabs.forEach(col => {
          if (partArray.includes(col.nome)) {
            CollaboratorRepository.update(col.id, col).catch(err => console.error(err));
          }
        });
      }

      onAddLog(
        'Registro de Treinamento',
        `Criado registro de treinamento ${codPrefix} para o documento ${newTraining.documentoId} com ${partArray.length} participantes.`,
        newTraining.documentoId
      );
    }

    setIsModalOpen(false);
    setEditingTreinamento(null);
    setNewTraining({
      documentoId: '',
      titulo: '',
      dataTreinamento: new Date().toISOString().split('T')[0],
      instrutor: '',
      setor: 'Costura',
      duracaoHoras: 2,
      participantesStr: '',
      status: 'Realizado'
    });
  };

  const handleSignOff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!signForm.colaboradorId || !signForm.documentoId) {
      alert('Selecione o colaborador e o procedimento.');
      return;
    }

    const updatedColabs = colaboradores.map(col => {
      if (col.id === signForm.colaboradorId) {
        const docs = [...col.documentosAssinados];
        if (!docs.includes(signForm.documentoId)) {
          docs.push(signForm.documentoId);
        }
        return {
          ...col,
          documentosAssinados: docs,
          status: 'Apto' as const
        };
      }
      return col;
    });

    saveColaboradores(updatedColabs);
    const targetCol = updatedColabs.find(c => c.id === signForm.colaboradorId);
    if (targetCol) {
      CollaboratorRepository.update(targetCol.id, targetCol).catch(err => console.error('Erro ao homologar competência no Firestore:', err));
    }
    const colName = colaboradores.find(c => c.id === signForm.colaboradorId)?.nome || '';
    
    onAddLog(
      'Homologação de Competência',
      `Colaborador(a) ${colName} realizou a leitura e recebeu aptidão no procedimento ${signForm.documentoId}.`,
      signForm.documentoId
    );

    setIsSignModalOpen(false);
    setSignForm({ colaboradorId: '', documentoId: '' });
  };

  // Filtragem de Colaboradores
  const filteredColaboradores = colaboradores.filter(col => {
    const matchesSearch = col.nome.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          col.cargo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSector = selectedSector === 'Todos' || col.setor === selectedSector;
    return matchesSearch && matchesSector;
  });

  // Estatísticas Rápidas
  const totalColaboradores = colaboradores.length;
  const aptos = colaboradores.filter(c => c.status === 'Apto').length;
  const aptidaoPercent = totalColaboradores > 0 ? Math.round((aptos / totalColaboradores) * 100) : 0;
  const totalHorasTreinadas = treinamentos
    .filter(t => t.status === 'Realizado')
    .reduce((sum, t) => sum + (t.duracaoHoras * t.participantes.length), 0);

  return (
    <div id="treinamentos-container" className="space-y-6">
      
      {/* Banner de Conformidade ISO 7.2 */}
      <div id="treinamentos-banner" className="bg-[#0B3A63] text-white rounded-xl shadow-xs border border-blue-200/10 p-6 relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-6 opacity-10 pointer-events-none">
          <GraduationCap className="w-64 h-64 text-white" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center space-x-2">
              <span className="bg-blue-500/20 text-blue-100 text-[10px] font-bold px-2 py-0.5 rounded-full border border-blue-400/20 uppercase">
                REQUISITO {personalizacao?.normaISO || 'ISO 9001:2015'} — SEÇÃO 7.2
              </span>
            </div>
            <h2 className="text-xl font-extrabold tracking-tight">
              {personalizacao?.treinamentosTitulo || 'Capacitação, Competência & Consciência Têxtil'}
            </h2>
            <p className="text-xs text-blue-100/80 leading-relaxed">
              {personalizacao?.treinamentosSubtitulo || 'Mapeie e registre formalmente a leitura, entendimento e treinamento prático de todos os colaboradores.'}
            </p>
          </div>
          <div className="flex flex-wrap gap-2 shrink-0">
            <button
              onClick={handleOpenNewColaborador}
              className="px-3.5 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 rounded-lg text-white shadow-xs transition-all flex items-center space-x-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Cadastrar Colaborador</span>
            </button>
            <button
              onClick={() => setIsSignModalOpen(true)}
              className="px-3.5 py-2 text-xs font-bold bg-white/10 hover:bg-white/15 border border-white/20 rounded-lg text-white transition-all flex items-center space-x-1.5"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Aptidão Rápida (POP)</span>
            </button>
            <button
              onClick={handleOpenNewTraining}
              className="px-3.5 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-500 rounded-lg text-white shadow-xs transition-all flex items-center space-x-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Registrar Treinamento</span>
            </button>
          </div>
        </div>

        {/* Métricas do Requisito de Pessoal */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-white/10">
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-blue-200/80 font-mono">APTIDÃO GERAL DO SGQ</p>
            <div className="flex items-baseline space-x-1.5">
              <span className="text-2xl font-black text-white font-mono">{aptidaoPercent}%</span>
              <span className="text-[10px] text-emerald-400 font-bold flex items-center">
                <TrendingUp className="w-3 h-3 mr-0.5" /> +4%
              </span>
            </div>
            <p className="text-[9px] text-blue-200/60">Colaboradores aptos em seus setores</p>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-blue-200/80 font-mono">PESSOAL MONITORADO</p>
            <span className="text-2xl font-black text-white font-mono">{totalColaboradores}</span>
            <p className="text-[9px] text-blue-200/60">Operadores ativos no cadastro</p>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-blue-200/80 font-mono">HORAS DE CAPACITAÇÃO</p>
            <span className="text-2xl font-black text-white font-mono">{totalHorasTreinadas}h</span>
            <p className="text-[9px] text-blue-200/60">Volume acumulado de instrução</p>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-blue-200/80 font-mono">REQUISITO 7.2 AUDITÁVEL</p>
            <div className="flex items-center space-x-1 text-xs text-emerald-400 font-bold">
              <CheckCircle2 className="w-4 h-4" />
              <span>Evidência Pronta</span>
            </div>
            <p className="text-[9px] text-blue-200/60">Assinaturas digitais de conformidade</p>
          </div>
        </div>
      </div>

      {/* Navegação entre abas */}
      <div className="flex border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab('matriz')}
          className={`px-5 py-3 text-xs font-bold border-b-2 transition-all flex items-center space-x-2 ${
            activeTab === 'matriz' 
              ? 'border-blue-600 text-blue-600 dark:text-blue-400 font-extrabold' 
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Matriz de Competências & Assinaturas</span>
        </button>
        <button
          onClick={() => setActiveTab('historico')}
          className={`px-5 py-3 text-xs font-bold border-b-2 transition-all flex items-center space-x-2 ${
            activeTab === 'historico' 
              ? 'border-blue-600 text-blue-600 dark:text-blue-400 font-extrabold' 
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <ClipboardList className="w-4 h-4" />
          <span>Histórico de Treinamentos Coletivos</span>
        </button>
      </div>

      {/* Conteúdo Aba 1: Matriz de Competências */}
      {activeTab === 'matriz' && (
        <div id="treinamentos-matriz-tab" className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
            
            {/* Filtros e Barra de Pesquisa */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar colaborador por nome ou cargo..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <label className="text-xs text-slate-500 font-medium">Setor Industrial:</label>
                <select
                  value={selectedSector}
                  onChange={(e) => setSelectedSector(e.target.value)}
                  className="bg-slate-50 dark:bg-slate-800 text-xs border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-1 focus:ring-blue-500 font-semibold"
                >
                  <option value="Todos">Todos os Setores</option>
                  {sectorsList.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Tabela da Matriz */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold uppercase tracking-wider bg-slate-50/50 dark:bg-slate-950/20">
                    <th className="py-3 px-4">Nome do Colaborador</th>
                    <th className="py-3 px-4">Setor</th>
                    <th className="py-3 px-4">Cargo / Função</th>
                    <th className="py-3 px-4">Capacitações Ativas (Assinadas)</th>
                    <th className="py-3 px-4 text-center">Status de Competência</th>
                    <th className="py-3 px-4 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {filteredColaboradores.map(col => {
                    return (
                      <tr key={col.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-slate-800 dark:text-slate-100 flex items-center space-x-2.5">
                          <div className="w-7 h-7 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold font-mono">
                            {col.nome.charAt(0)}
                          </div>
                          <span>{col.nome}</span>
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-slate-600 dark:text-slate-400">
                          {col.setor}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-slate-500 dark:text-slate-400 text-[11px]">
                          {col.cargo}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex flex-wrap gap-1">
                            {col.documentosAssinados.length === 0 ? (
                              <span className="text-rose-500 italic font-medium flex items-center">
                                <AlertCircle className="w-3 h-3 mr-1" /> Nenhuma leitura ativa
                              </span>
                            ) : (
                              col.documentosAssinados.map(docId => (
                                <span key={docId} className="px-2 py-0.5 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 rounded-sm font-mono text-[10px] border border-blue-100 dark:border-blue-900/40 font-bold flex items-center space-x-1">
                                  <FileText className="w-2.5 h-2.5" />
                                  <span>{docId}</span>
                                </span>
                              ))
                            )}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                            col.status === 'Apto' 
                              ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400' 
                              : col.status === 'Em Treinamento'
                              ? 'bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400'
                              : 'bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400'
                          }`}>
                            {col.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => {
                                setSignForm({ colaboradorId: col.id, documentoId: '' });
                                setIsSignModalOpen(true);
                              }}
                              className="px-2 py-1 text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-md transition-colors"
                            >
                              Liberar POP
                            </button>
                            <button
                              onClick={() => handleOpenEditColaborador(col)}
                              className="text-slate-400 hover:text-blue-500 p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
                              title="Editar Colaborador"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteColaborador(col.id)}
                              className="text-slate-400 hover:text-rose-500 p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
                              title="Excluir Colaborador"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredColaboradores.length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-slate-400 italic">
                        Nenhum colaborador encontrado para os filtros ativos.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

          </div>

          {/* Cartão de Ajuda ao Auditor sobre Cláusula 7.2 */}
          <div id="iso-compliance-box" className="p-5 rounded-xl border border-blue-100 dark:border-blue-950 bg-blue-50/20 dark:bg-blue-950/15 flex items-start space-x-3.5">
            <Award className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-blue-800 dark:text-blue-300">
                {personalizacao?.treinamentosAjudaTitulo || 'Como esta Matriz assegura aprovação em Auditorias Certificadoras?'}
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                {personalizacao?.treinamentosAjudaSubtitulo || 'Durante uma auditoria da ABNT ou de órgão externo, o auditor selecionará um operador na fábrica e pedirá a evidência documentada de que ele foi treinado para a versão vigente da Instrução de Trabalho ou POP que está executando no momento. Este painel permite comprovar em tempo real a rastreabilidade perfeita de competências.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Conteúdo Aba 2: Histórico de Treinamentos Coletivos */}
      {activeTab === 'historico' && (
        <div id="treinamentos-historico-tab" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Lista de Registros */}
            <div className="md:col-span-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="text-xs font-extrabold text-slate-500 font-mono">CRONOGRAMAS DE TREINAMENTO</h3>
                <span className="text-[10px] font-bold text-blue-600 bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded-full">
                  {treinamentos.length} Registros
                </span>
              </div>

              <div className="space-y-3">
                {treinamentos.length === 0 ? (
                  <div className="p-8 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-xl space-y-2">
                    <GraduationCap className="w-8 h-8 text-slate-300 dark:text-slate-700 mx-auto" />
                    <p className="text-xs font-bold text-slate-500">Nenhum treinamento registrado</p>
                    <p className="text-[11px] text-slate-400">Clique em "Registrar Treinamento" para cadastrar a primeira capacitação.</p>
                  </div>
                ) : (
                  treinamentos.map(tre => {
                    return (
                      <div 
                        key={tre.id} 
                        className="p-4 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/30 dark:bg-slate-950/10 hover:shadow-xs transition-shadow flex items-start justify-between"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <span className="text-[10px] font-bold text-slate-400 font-mono">
                              {tre.codigo}
                            </span>
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                            <span className="text-[10px] font-extrabold font-mono bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 px-1.5 py-0.5 rounded-sm">
                              {tre.documentoId}
                            </span>
                          </div>
                          <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100">
                            {tre.titulo}
                          </h4>
                          
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[10px] text-slate-500 dark:text-slate-400">
                            <span className="flex items-center">
                              <Calendar className="w-3.5 h-3.5 mr-1 text-slate-400" />
                              {tre.dataTreinamento}
                            </span>
                            <span className="flex items-center">
                              <Users className="w-3.5 h-3.5 mr-1 text-slate-400" />
                              {tre.participantes.length} Participantes
                            </span>
                            <span className="flex items-center">
                              <Clock className="w-3.5 h-3.5 mr-1 text-slate-400" />
                              {tre.duracaoHoras}h de Carga Horária
                            </span>
                          </div>

                          {/* Listinha de participantes */}
                          <div className="text-[10px] flex items-center space-x-1.5 text-slate-400 pt-1">
                            <span className="font-semibold">Grupo:</span>
                            <span className="italic">{tre.participantes.join(', ') || 'Nenhum inscrito'}</span>
                          </div>
                        </div>

                        <div className="flex flex-col items-end justify-between h-full space-y-4">
                          <div className="flex items-center space-x-1.5">
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold ${
                              tre.status === 'Realizado' 
                                ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600' 
                                : 'bg-amber-50 dark:bg-amber-950/30 text-amber-600'
                            }`}>
                              {tre.status.toUpperCase()}
                            </span>
                            <button
                              onClick={() => handleOpenEditTraining(tre)}
                              className="text-slate-400 hover:text-blue-500 p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
                              title="Editar Treinamento"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteTreinamento(tre.id)}
                              className="text-slate-400 hover:text-rose-500 p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
                              title="Excluir Treinamento"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          
                          <button
                            onClick={() => setSelectedTrainingDoc(tre)}
                            className="text-xs font-extrabold text-blue-600 dark:text-blue-400 hover:underline flex items-center"
                          >
                            <Printer className="w-3.5 h-3.5 mr-1" /> Ficha de Presença
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Quadro de Evidência da Eficácia (ISO Clause 7.2.c) */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center space-x-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center">
                    <UserCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-extrabold text-slate-800 dark:text-slate-100">Avaliação da Eficácia</h3>
                    <p className="text-[10px] text-slate-400">Verificação Prática Pós-Treinamento</p>
                  </div>
                </div>

                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  A norma ISO 9001 não exige apenas registrar o treinamento, mas sim <strong>avaliar se ele foi eficaz</strong> no chão de fábrica após algumas semanas.
                </p>

                {(() => {
                  const proxEval = treinamentos.find(t => t.status === 'Planejado');
                  const ultEfic = treinamentos.find(t => t.status === 'Realizado');

                  return (
                    <div className="space-y-2.5">
                      <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/30 border border-slate-150 dark:border-slate-800/80 flex items-start space-x-2">
                        <Clock className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Próxima Avaliação Prática</p>
                          <p className="text-[10px] text-slate-400">
                            {proxEval ? (
                              <>Avaliar os participantes do treinamento <strong>{proxEval.codigo} - {proxEval.titulo}</strong> até <strong>{proxEval.dataTreinamento}</strong>.</>
                            ) : (
                              'Nenhuma avaliação prática pendente no cronograma.'
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="p-3 rounded-lg bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-150 dark:border-emerald-950/40 flex items-start space-x-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-[11px] font-bold text-emerald-800 dark:text-emerald-400">Última Eficácia Confirmada</p>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400">
                            {ultEfic ? (
                              <>Eficácia prática do treinamento <strong>{ultEfic.codigo} - {ultEfic.titulo}</strong> confirmada com {ultEfic.participantes.length} colaborador(es) em {ultEfic.dataTreinamento}.</>
                            ) : (
                              'Nenhum treinamento realizado registrado no histórico.'
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-400 italic">
                Ações corretivas de competência geradas automaticamente caso operadores cometam falhas no mesmo setor.
              </div>
            </div>

          </div>
        </div>
      )}

      {/* modal de Criação de Treinamento Coletivo */}
      {isModalOpen && (
        <div id="new-training-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={() => setIsModalOpen(false)} />
          <div className="relative bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg overflow-hidden animate-scale-up">
            
            <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 bg-[#0B3A63] text-white flex items-center justify-between">
              <h3 className="text-sm font-extrabold flex items-center">
                <GraduationCap className="w-4.5 h-4.5 mr-2" />
                {editingTreinamento ? `Editar Treinamento: ${editingTreinamento.codigo}` : 'Registrar Treinamento Têxtil (ISO 7.2)'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-white/60 hover:text-white font-mono">&times;</button>
            </div>

            <form onSubmit={handleCreateTraining} className="p-5 space-y-4">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-500">Procedimento Vinculado *</label>
                  <select
                    value={newTraining.documentoId}
                    onChange={(e) => {
                      const selectedDoc = documents.find(d => d.id === e.target.value);
                      setNewTraining({
                        ...newTraining,
                        documentoId: e.target.value,
                        titulo: selectedDoc ? `Treinamento no ${selectedDoc.codigo}: ${selectedDoc.titulo}` : ''
                      });
                    }}
                    className="w-full bg-slate-50 dark:bg-slate-800 text-xs border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                    required
                  >
                    <option value="">Selecione na Lista Mestra...</option>
                    {documents.map(d => (
                      <option key={d.id} value={d.id}>{d.codigo} - {d.titulo}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-500">Data de Realização *</label>
                  <input
                    type="date"
                    value={newTraining.dataTreinamento}
                    onChange={(e) => setNewTraining({...newTraining, dataTreinamento: e.target.value})}
                    className="w-full bg-slate-50 dark:bg-slate-800 text-xs border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500">Título / Escopo do Treinamento *</label>
                <input
                  type="text"
                  value={newTraining.titulo}
                  onChange={(e) => setNewTraining({...newTraining, titulo: e.target.value})}
                  className="w-full bg-slate-50 dark:bg-slate-800 text-xs border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-500">Instrutor / Supervisor *</label>
                  <input
                    type="text"
                    value={newTraining.instrutor}
                    onChange={(e) => setNewTraining({...newTraining, instrutor: e.target.value})}
                    placeholder="Ex: Roberto Costa (Supervisor)"
                    className="w-full bg-slate-50 dark:bg-slate-800 text-xs border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-500">Carga Horária (Horas)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={newTraining.duracaoHoras}
                    onChange={(e) => setNewTraining({...newTraining, duracaoHoras: Number(e.target.value)})}
                    className="w-full bg-slate-50 dark:bg-slate-800 text-xs border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500">Nomes dos Participantes (Separados por vírgula) *</label>
                <textarea
                  value={newTraining.participantesStr}
                  onChange={(e) => setNewTraining({...newTraining, participantesStr: e.target.value})}
                  placeholder="Roberto Costa, Clara Mendes, Ana Souza"
                  className="w-full bg-slate-50 dark:bg-slate-800 text-xs border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-1 focus:ring-blue-500 h-16 font-semibold"
                  required
                />
                <p className="text-[9px] text-slate-400">Escreva os nomes dos colaboradores que participaram e assinaram fisicamente.</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500">Status</label>
                <div className="flex space-x-4">
                  <label className="flex items-center space-x-2 text-xs">
                    <input
                      type="radio"
                      name="status"
                      checked={newTraining.status === 'Realizado'}
                      onChange={() => setNewTraining({...newTraining, status: 'Realizado'})}
                    />
                    <span className="font-semibold text-slate-700 dark:text-slate-300">Já Realizado (Aprova Aptidão)</span>
                  </label>
                  <label className="flex items-center space-x-2 text-xs">
                    <input
                      type="radio"
                      name="status"
                      checked={newTraining.status === 'Planejado'}
                      onChange={() => setNewTraining({...newTraining, status: 'Planejado'})}
                    />
                    <span className="font-semibold text-slate-700 dark:text-slate-300">Planejado (Agendado no Cronograma)</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-bold transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors"
                >
                  {editingTreinamento ? 'Salvar Alterações' : 'Confirmar Registro'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Cadastrar/Editar Colaborador */}
      {isColaboradorModalOpen && (
        <div id="colaborador-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={() => setIsColaboradorModalOpen(false)} />
          <div className="relative bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-md overflow-hidden animate-scale-up">
            
            <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 bg-[#0B3A63] text-white flex items-center justify-between">
              <h3 className="text-sm font-extrabold flex items-center">
                <Users className="w-4.5 h-4.5 mr-2" />
                {editingColaborador ? `Editar Colaborador: ${editingColaborador.nome}` : 'Cadastrar Novo Colaborador'}
              </h3>
              <button onClick={() => setIsColaboradorModalOpen(false)} className="text-white/60 hover:text-white font-mono">&times;</button>
            </div>

            <form onSubmit={handleSaveColaborador} className="p-5 space-y-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500">Nome Completo *</label>
                <input
                  type="text"
                  value={colaboradorForm.nome}
                  onChange={(e) => setColaboradorForm({ ...colaboradorForm, nome: e.target.value })}
                  placeholder="Ex: Clara Mendes"
                  className="w-full bg-slate-50 dark:bg-slate-800 text-xs border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500">Cargo / Função *</label>
                <input
                  type="text"
                  value={colaboradorForm.cargo}
                  onChange={(e) => setColaboradorForm({ ...colaboradorForm, cargo: e.target.value })}
                  placeholder="Ex: Operadora de Costura Reta"
                  className="w-full bg-slate-50 dark:bg-slate-800 text-xs border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-500">Setor *</label>
                  <select
                    value={colaboradorForm.setor}
                    onChange={(e) => setColaboradorForm({ ...colaboradorForm, setor: e.target.value as SectorType })}
                    className="w-full bg-slate-50 dark:bg-slate-800 text-xs border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                    required
                  >
                    {sectorsList.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-500">Status de Competência *</label>
                  <select
                    value={colaboradorForm.status}
                    onChange={(e) => setColaboradorForm({ ...colaboradorForm, status: e.target.value as 'Apto' | 'Em Treinamento' | 'Pendente' })}
                    className="w-full bg-slate-50 dark:bg-slate-800 text-xs border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                    required
                  >
                    <option value="Apto">Apto</option>
                    <option value="Em Treinamento">Em Treinamento</option>
                    <option value="Pendente">Pendente</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500">Procedimentos Assinados / Treinados</label>
                <div className="max-h-28 overflow-y-auto p-2 border border-slate-200 dark:border-slate-700 rounded-lg space-y-1 bg-slate-50 dark:bg-slate-800/50 font-mono text-[10px]">
                  {documents.map(doc => {
                    const checked = colaboradorForm.documentosAssinados.includes(doc.id);
                    return (
                      <label key={doc.id} className="flex items-center space-x-2 text-[11px] text-slate-700 dark:text-slate-300 font-semibold cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 p-1 rounded">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => {
                            const updatedDocs = checked
                              ? colaboradorForm.documentosAssinados.filter(id => id !== doc.id)
                              : [...colaboradorForm.documentosAssinados, doc.id];
                            setColaboradorForm({ ...colaboradorForm, documentosAssinados: updatedDocs });
                          }}
                          className="rounded border-slate-300 dark:border-slate-600 focus:ring-blue-500"
                        />
                        <span>{doc.codigo} - {doc.titulo}</span>
                      </label>
                    );
                  })}
                  {documents.length === 0 && (
                    <p className="text-[10px] text-slate-400 italic">Nenhum documento disponível no sistema.</p>
                  )}
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsColaboradorModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-bold transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors"
                >
                  {editingColaborador ? 'Salvar Alterações' : 'Cadastrar Colaborador'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* modal de Assinatura Individual Rápida */}
      {isSignModalOpen && (
        <div id="sign-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={() => setIsSignModalOpen(false)} />
          <div className="relative bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-md overflow-hidden animate-scale-up">
            
            <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 bg-[#0B3A63] text-white flex items-center justify-between">
              <h3 className="text-sm font-extrabold flex items-center">
                <UserCheck className="w-4.5 h-4.5 mr-2" />
                Aptitude e Leitura Individual Rápida
              </h3>
              <button onClick={() => setIsSignModalOpen(false)} className="text-white/60 hover:text-white font-mono">&times;</button>
            </div>

            <form onSubmit={handleSignOff} className="p-5 space-y-4">
              
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500">Colaborador(a) *</label>
                <select
                  value={signForm.colaboradorId}
                  onChange={(e) => setSignForm({ ...signForm, colaboradorId: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 text-xs border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                  required
                >
                  <option value="">Selecione o Colaborador...</option>
                  {colaboradores.map(c => (
                    <option key={c.id} value={c.id}>{c.nome} ({c.cargo} - {c.setor})</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500">Procedimento Lido e Entendido *</label>
                <select
                  value={signForm.documentoId}
                  onChange={(e) => setSignForm({ ...signForm, documentoId: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 text-xs border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                  required
                >
                  <option value="">Selecione o Documento...</option>
                  {documents.map(d => (
                    <option key={d.id} value={d.id}>{d.codigo} - {d.titulo}</option>
                  ))}
                </select>
              </div>

              <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/60 rounded-lg text-[11px] text-amber-800 dark:text-amber-400 leading-relaxed">
                <strong>Declaração da Qualidade:</strong> Ao confirmar, você declara para fins de auditoria que o colaborador acima leu, tirou dúvidas, realizou simulação prática e assinou a folha mestre de treinamento do procedimento selecionado.
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsSignModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-bold transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors"
                >
                  Homologar Aptidão
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* modal de Visualização / Impressão de Ficha Oficial (PDF simulado) */}
      {selectedTrainingDoc && (
        <div id="print-sheet-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={() => setSelectedTrainingDoc(null)} />
          <div className="relative bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-2xl overflow-hidden animate-scale-up">
            
            <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 bg-[#0B3A63] text-white flex items-center justify-between">
              <h3 className="text-sm font-extrabold flex items-center">
                <Printer className="w-4.5 h-4.5 mr-2" />
                Visualizar Ficha de Evidência de Treinamento
              </h3>
              <button onClick={() => setSelectedTrainingDoc(null)} className="text-white/60 hover:text-white font-mono">&times;</button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[70vh] space-y-6 bg-slate-50 dark:bg-slate-950 font-sans" id="printable-ficha-area">
              
              {/* Cabeçalho da Ficha ISO */}
              <div className="border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 rounded-lg flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-md text-white font-black flex items-center justify-center text-sm">VT</div>
                  <div>
                    <h4 className="text-xs font-extrabold text-slate-800 dark:text-slate-100">VICKYTEX S.A.</h4>
                    <p className="text-[10px] text-slate-500">Sistema de Gestão da Qualidade</p>
                  </div>
                </div>
                <div className="text-right">
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 font-mono">REG-QLD-102</h4>
                  <p className="text-[9px] text-slate-400">Ref: Cláusula 7.2 ISO 9001:2015</p>
                </div>
              </div>

              {/* Detalhes do Treinamento */}
              <div className="bg-white dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-800 space-y-3">
                <h3 className="text-xs font-bold text-blue-600 dark:text-blue-400 border-b border-slate-100 dark:border-slate-800 pb-1.5 uppercase font-mono">
                  Identificação do Registro de Competência
                </h3>
                
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <p className="text-[9px] text-slate-400">CÓDIGO INTERNO</p>
                    <p className="font-bold text-slate-800 dark:text-slate-100 font-mono">{selectedTrainingDoc.codigo}</p>
                  </div>
                  <div>
                    <p className="text-[9px] text-slate-400">DATA DE REALIZAÇÃO</p>
                    <p className="font-bold text-slate-800 dark:text-slate-100">{selectedTrainingDoc.dataTreinamento}</p>
                  </div>
                  <div>
                    <p className="text-[9px] text-slate-400">INTRUTOR / RESPONSÁVEL</p>
                    <p className="font-bold text-slate-800 dark:text-slate-100">{selectedTrainingDoc.instrutor}</p>
                  </div>
                  <div>
                    <p className="text-[9px] text-slate-400">PROCEDIMENTO / POP ALVO</p>
                    <p className="font-bold text-slate-800 dark:text-slate-100 font-mono">{selectedTrainingDoc.documentoId}</p>
                  </div>
                </div>

                <div className="space-y-1 pt-2">
                  <p className="text-[9px] text-slate-400">CONTEÚDO TÉCNICO ABORDADO</p>
                  <p className="text-xs text-slate-700 dark:text-slate-300 font-semibold">{selectedTrainingDoc.titulo}</p>
                </div>
              </div>

              {/* Lista de Presença com Assinatura emulada */}
              <div className="bg-white dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-800 space-y-3">
                <h3 className="text-xs font-bold text-blue-600 dark:text-blue-400 border-b border-slate-100 dark:border-slate-800 pb-1.5 uppercase font-mono">
                  Lista de Assinaturas e Declaração de Entendimento
                </h3>
                
                <div className="space-y-2.5">
                  {selectedTrainingDoc.participantes.map((part, idx) => (
                    <div key={idx} className="flex justify-between items-center text-xs py-2 border-b border-slate-100 dark:border-slate-800/50">
                      <div>
                        <p className="font-bold text-slate-800 dark:text-slate-100">{part}</p>
                        <p className="text-[9px] text-slate-400">Apto para Operação Industrial</p>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] font-mono text-slate-400 italic">
                          Assinado digitalmente via Google SSO (Vickytex.com.br)
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Rodapé de Comprovação */}
              <div className="p-3 bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900 rounded-lg text-[10px] text-slate-500 dark:text-slate-400 text-center leading-relaxed">
                Este documento é uma evidência oficial de conformidade. Ele é integrado ao Google Drive corporativo sob a pasta oficial da Vickytex, possuindo controle de revisões rastreável.
              </div>

            </div>

            <div className="px-5 py-4 border-t border-slate-100 dark:border-slate-800 flex justify-end space-x-2">
              <button
                onClick={() => setSelectedTrainingDoc(null)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-bold transition-colors"
              >
                Fechar Visualização
              </button>
              <button
                onClick={handlePrintTrainingSheet}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors flex items-center space-x-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Imprimir Folha Oficial</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE CONFIRMAÇÃO DE EXCLUSÃO DE COLABORADOR */}
      {colToDelete && (
        <div id="delete-col-modal-overlay" className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div id="delete-col-modal-content" className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center space-x-3 pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="p-2.5 bg-rose-500/10 text-rose-600 rounded-full shrink-0">
                <GraduationCap className="w-6 h-6 text-rose-600 animate-pulse" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-100">
                  Confirmar Exclusão de Colaborador
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Recursos Humanos & Competências (ISO 9001 7.2)</p>
              </div>
            </div>
            
            <div className="space-y-3">
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Você tem certeza que deseja remover este colaborador do cadastro:
                <strong className="text-slate-950 dark:text-white font-bold block mt-1 text-sm bg-slate-50 dark:bg-slate-800 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-750 font-mono">
                  {colToDelete.nome} ({colToDelete.cargo} - {colToDelete.setor})
                </strong>
              </p>
              <p className="text-[11px] text-rose-600 dark:text-rose-400 font-semibold bg-rose-500/5 p-2.5 rounded-lg border border-rose-500/10">
                Atenção: A remoção deste registro excluirá permanentemente as assinaturas de procedimentos e históricos vinculados a este profissional.
              </p>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setColToDelete(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-bold transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  const idToDelete = colToDelete.id;
                  const updated = colaboradores.filter(c => c.id !== idToDelete);
                  saveColaboradores(updated);
                  CollaboratorRepository.delete(idToDelete).catch(err => console.error('Erro ao excluir colaborador no Firestore:', err));
                  onAddLog('Excluiu Colaborador', `Removeu o colaborador com ID ${idToDelete} (${colToDelete.nome}) do cadastro.`);
                  setColToDelete(null);
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition-colors shadow-xs"
              >
                Sim, Excluir Colaborador
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE CONFIRMAÇÃO DE EXCLUSÃO DE TREINAMENTO */}
      {treinToDelete && (
        <div id="delete-treinamento-modal-overlay" className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div id="delete-treinamento-modal-content" className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center space-x-3 pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="p-2.5 bg-rose-500/10 text-rose-600 rounded-full shrink-0">
                <GraduationCap className="w-6 h-6 text-rose-600 animate-pulse" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-100">
                  Confirmar Exclusão de Treinamento
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Capacitação & Treinamentos (ISO 9001 7.2)</p>
              </div>
            </div>
            
            <div className="space-y-3">
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Você tem certeza que deseja remover este registro de treinamento:
                <strong className="text-slate-950 dark:text-white font-bold block mt-1 text-sm bg-slate-50 dark:bg-slate-800 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-750 font-mono">
                  [{treinToDelete.codigo}] {treinToDelete.titulo}
                </strong>
              </p>
              <p className="text-[11px] text-rose-600 dark:text-rose-400 font-semibold bg-rose-500/5 p-2.5 rounded-lg border border-rose-500/10">
                Atenção: A remoção é permanente e afetará as estatísticas gerais de conformidade de pessoal.
              </p>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setTreinToDelete(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-bold transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={async () => {
                  const updated = treinamentos.filter(t => t.id !== treinToDelete.id);
                  saveTreinamentos(updated);
                  onAddLog('Excluiu Treinamento', `Removeu o registro de treinamento com ID ${treinToDelete.id} (${treinToDelete.codigo}).`);
                  
                  const idToDelete = treinToDelete.id;
                  setTreinToDelete(null);

                  try {
                    await TrainingRepository.delete(idToDelete);
                  } catch (err) {
                    console.error('Falha ao excluir treinamento remoto:', err);
                  }
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition-colors shadow-xs"
              >
                Sim, Excluir Registro
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
