/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Plus, 
  Trash2, 
  Pencil, 
  CheckCircle2, 
  AlertTriangle, 
  X, 
  RefreshCw,
  FolderOpen,
  Layers,
  Save,
  HelpCircle,
  TrendingUp,
  Truck,
  Wrench,
  CheckSquare,
  ShieldAlert,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { getSectors, getDocumentTypes, PersonalizacaoGeral, savePersonalizacaoGeral } from '../utils/mockData';
import { SystemSettingsRepository } from '../services/database/repositories/systemSettings.repository';
import { useAuth } from '../contexts/AuthContext';
import { DocumentType } from '../types';

interface ConfiguracoesProps {
  onAddLog: (action: string, details: string) => void;
  personalizacao: PersonalizacaoGeral;
  onUpdatePersonalizacao: (updated: PersonalizacaoGeral) => void;
}

export const Configuracoes: React.FC<ConfiguracoesProps> = ({ 
  onAddLog, 
  personalizacao, 
  onUpdatePersonalizacao 
}) => {
  const { user } = useAuth();

  // Estados de Personalização Geral do Sistema
  const [configGeral, setConfigGeral] = useState<PersonalizacaoGeral>(() => personalizacao);

  React.useEffect(() => {
    setConfigGeral(personalizacao);
  }, [personalizacao]);

  // Estados dos setores
  const [sectors, setSectors] = useState<string[]>(() => getSectors());
  const [newSector, setNewSector] = useState('');
  const [editingSectorIdx, setEditingSectorIdx] = useState<number | null>(null);
  const [editingSectorValue, setEditingSectorValue] = useState('');

  // Estados dos tipos documentais
  const [docTypes, setDocTypes] = useState<{ type: string; name: string; description: string }[]>(() => getDocumentTypes());
  const [newDocType, setNewDocType] = useState({ type: '', name: '', description: '' });
  const [editingDocTypeIdx, setEditingDocTypeIdx] = useState<number | null>(null);
  const [editingDocTypeValue, setEditingDocTypeValue] = useState({ type: '', name: '', description: '' });

  // Controle de Abas Internas de Configuração
  const [activeSubTab, setActiveSubTab] = useState<string>('setores');

  // Estados para tabelas de Cadastro & Parâmetros por Módulo
  const [fornecedoresCategorias, setFornecedoresCategorias] = useState<string[]>([
    "Fios e Fibras",
    "Serviços de Tinturaria",
    "Embalagens",
    "Produtos Químicos",
    "Manutenção",
    "Calibração",
    "Serviços de Facção/Costura",
    "Outros"
  ]);
  const [newFornecedoresCat, setNewFornecedoresCat] = useState('');
  const [editingFornecedoresCatIdx, setEditingFornecedoresCatIdx] = useState<number | null>(null);
  const [editingFornecedoresCatVal, setEditingFornecedoresCatVal] = useState('');

  const [calibracaoTipos, setCalibracaoTipos] = useState<string[]>([
    "Balança de Precisão",
    "Termômetro Digital",
    "Paquímetro Digital",
    "Micrômetro",
    "Cronômetro",
    "Manômetro",
    "Trena Metálica"
  ]);
  const [newCalibracaoTipo, setNewCalibracaoTipo] = useState('');
  const [editingCalibracaoTipoIdx, setEditingCalibracaoTipoIdx] = useState<number | null>(null);
  const [editingCalibracaoTipoVal, setEditingCalibracaoTipoVal] = useState('');

  const [auditoriasOrigens, setAuditoriasOrigens] = useState<string[]>([
    "Auditoria Interna",
    "Auditoria Externa",
    "Reclamação de Cliente",
    "Inspeção de Qualidade",
    "Desvio de Processo",
    "Autodeclaração"
  ]);
  const [newAuditoriasOrigem, setNewAuditoriasOrigem] = useState('');
  const [editingAuditoriasOrigemIdx, setEditingAuditoriasOrigemIdx] = useState<number | null>(null);
  const [editingAuditoriasOrigemVal, setEditingAuditoriasOrigemVal] = useState('');

  const [riscosCategorias, setRiscosCategorias] = useState<string[]>([
    "Operacional",
    "Financeiro",
    "Regulatório/Conformidade",
    "Estratégico",
    "Ambiental",
    "Tecnológico"
  ]);
  const [newRiscosCategoria, setNewRiscosCategoria] = useState('');
  const [editingRiscosCategoriaIdx, setEditingRiscosCategoriaIdx] = useState<number | null>(null);
  const [editingRiscosCategoriaVal, setEditingRiscosCategoriaVal] = useState('');
  
  // Metodologias Configurações
  const DEFAULT_METODOLOGIAS = [
    {
      id: 'PDCA',
      nome: 'PDCA (Plan, Do, Check, Act)',
      etapas: 'Planejar, Executar, Verificar, Agir',
      explicacao: 'Ciclo de melhoria contínua de quatro etapas para controle e aprendizado contínuo. Focado em solução de problemas de rotina e padronização rápida.',
      ferramentas: 'Brainstorming, 5 Whys, Ishikawa, Plano de Ação, Gráfico de Pareto'
    },
    {
      id: 'DMAIC',
      nome: 'DMAIC (Define, Measure, Analyze, Improve, Control)',
      etapas: 'Definir, Medir, Analisar, Melhorar, Controlar',
      explicacao: 'Método rigoroso de cinco fases baseado em dados para redução de variabilidade, controle estatístico de processos e eliminação de defeitos (Seis Sigma).',
      ferramentas: 'SIPOC, VOC, Matriz GUT, Pareto, 5 Porquês, Ishikawa, Fluxograma'
    },
    {
      id: 'Kaizen',
      nome: 'Kaizen (Melhoria Contínua Rápida)',
      etapas: 'Identificar Desperdício, Desenhar Solução, Implementar, Validar',
      explicacao: 'Foco em melhorias incrementais diárias e rápidas através da eliminação de desperdícios no local de trabalho (Gemba), engajando diretamente os operadores.',
      ferramentas: '5S, PICK, Diagrama Ishikawa, Cronograma Rápido'
    },
    {
      id: 'A3',
      nome: 'A3 (Toyota Problem Solving)',
      etapas: 'Contexto, Situação Atual, Objetivos, Análise de Causa, Contramedidas, Acompanhamento',
      explicacao: 'Abordagem estruturada de resolução de problemas em uma única página, baseada no pensamento enxuto da Toyota, focando em causa raiz e contramedidas visuais.',
      ferramentas: 'Fluxograma, Ishikawa, 5 Whys, Swot, Plano de Ação'
    },
    {
      id: 'Projeto Lean',
      nome: 'Projeto Lean Manufacturing',
      etapas: 'Mapear Valor (VSM), Identificar Gargalos, Fluxo Contínuo, Puxar Produção, Perfeição',
      explicacao: 'Focado no mapeamento do fluxo de valor (VSM) e eliminação sistemática dos 8 desperdícios clássicos para aumentar a velocidade, reduzir custos e simplificar operações.',
      ferramentas: 'SIPOC, Kanban, Lead Time, VSM, 5S'
    },
    {
      id: 'Projeto Estratégico',
      nome: 'Projeto Estratégico Organizacional',
      etapas: 'Diagnóstico, Formulação, Desdobramento, Execução, Avaliação',
      explicacao: 'Alinhamento de diretrizes executivas de liderança com metas operacionais da fábrica, focado em alta competitividade utilizando Hoshin Kanri ou BSC.',
      ferramentas: 'SWOT, Matriz GUT, Indicadores de Desempenho (KPIs)'
    },
    {
      id: 'Projeto Personalizado',
      nome: 'Projeto Personalizado',
      etapas: 'Iniciação, Planejamento, Execução, Monitoramento, Encerramento',
      explicacao: 'Fluxo de trabalho totalmente flexível para melhorias estruturadas que necessitam de fases, ferramentas e cronogramas customizados por setor.',
      ferramentas: 'Customizável conforme necessidade do projeto'
    }
  ];

  const [metodologias, setMetodologias] = useState(DEFAULT_METODOLOGIAS);

  const [editingMetodologiaId, setEditingMetodologiaId] = useState<string | null>(null);
  const [editingMetodologiaVal, setEditingMetodologiaVal] = useState({ explicacao: '', ferramentas: '' });

  // Inscrever para atualizações em tempo real do Firestore via SystemSettingsRepository
  useEffect(() => {
    const unsub = SystemSettingsRepository.subscribe((records) => {
      records.forEach((rec) => {
        if (rec.id === 'sgq_vickytex_fornecedores_categorias' && Array.isArray(rec.items)) {
          setFornecedoresCategorias(rec.items);
        } else if (rec.id === 'sgq_vickytex_calibracao_tipos' && Array.isArray(rec.items)) {
          setCalibracaoTipos(rec.items);
        } else if (rec.id === 'sgq_vickytex_auditorias_origens' && Array.isArray(rec.items)) {
          setAuditoriasOrigens(rec.items);
        } else if (rec.id === 'sgq_vickytex_riscos_categorias' && Array.isArray(rec.items)) {
          setRiscosCategorias(rec.items);
        } else if (rec.id === 'sgq_vickytex_metodologias_config' && Array.isArray(rec.items)) {
          setMetodologias(rec.items);
        } else if (rec.id === 'sgq_vickytex_setores' && Array.isArray(rec.items)) {
          setSectors(rec.items);
        } else if (rec.id === 'sgq_vickytex_tipos_documentos' && Array.isArray(rec.items)) {
          setDocTypes(rec.items);
        }
      });
    });

    return () => unsub();
  }, []);

  const saveSettingToFirestore = (id: string, items: any) => {
    SystemSettingsRepository.create({ id, items }).catch(err => {
      console.error(`[Configuracoes] Error saving ${id} to Firestore:`, err);
    });
  };

  const handleSaveMetodologia = (id: string) => {
    const updated = metodologias.map((m: any) => 
      m.id === id ? { ...m, explicacao: editingMetodologiaVal.explicacao, ferramentas: editingMetodologiaVal.ferramentas } : m
    );
    setMetodologias(updated);
    saveSettingToFirestore('sgq_vickytex_metodologias_config', updated);
    setEditingMetodologiaId(null);
    onAddLog('Configurações', `Editou os parâmetros auxiliares da metodologia "${id}".`);
    setShowSyncNotice(true);
  };

  // Controle de alertas e avisos
  const [showSyncNotice, setShowSyncNotice] = useState(false);
  const [sectorToDeleteIdx, setSectorToDeleteIdx] = useState<number | null>(null);
  const [docTypeToDeleteIdx, setDocTypeToDeleteIdx] = useState<number | null>(null);

  // Re-ordering Handlers
  const handleMoveSector = (idx: number, dir: 'up' | 'down') => {
    const targetIdx = dir === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= sectors.length) return;
    const updated = [...sectors];
    const temp = updated[idx];
    updated[idx] = updated[targetIdx];
    updated[targetIdx] = temp;
    setSectors(updated);
    saveSettingToFirestore('sgq_vickytex_setores', updated);
    setShowSyncNotice(true);
  };

  const handleMoveDocType = (idx: number, dir: 'up' | 'down') => {
    const targetIdx = dir === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= docTypes.length) return;
    const updated = [...docTypes];
    const temp = updated[idx];
    updated[idx] = updated[targetIdx];
    updated[targetIdx] = temp;
    setDocTypes(updated);
    saveSettingToFirestore('sgq_vickytex_tipos_documentos', updated);
    setShowSyncNotice(true);
  };

  const handleMoveFornecedoresCat = (idx: number, dir: 'up' | 'down') => {
    const targetIdx = dir === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= fornecedoresCategorias.length) return;
    const updated = [...fornecedoresCategorias];
    const temp = updated[idx];
    updated[idx] = updated[targetIdx];
    updated[targetIdx] = temp;
    setFornecedoresCategorias(updated);
    saveSettingToFirestore('sgq_vickytex_fornecedores_categorias', updated);
    setShowSyncNotice(true);
  };


  const handleMoveCalibracaoTipo = (idx: number, dir: 'up' | 'down') => {
    const targetIdx = dir === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= calibracaoTipos.length) return;
    const updated = [...calibracaoTipos];
    const temp = updated[idx];
    updated[idx] = updated[targetIdx];
    updated[targetIdx] = temp;
    setCalibracaoTipos(updated);
    setShowSyncNotice(true);
  };

  const handleMoveAuditoriasOrigem = (idx: number, dir: 'up' | 'down') => {
    const targetIdx = dir === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= auditoriasOrigens.length) return;
    const updated = [...auditoriasOrigens];
    const temp = updated[idx];
    updated[idx] = updated[targetIdx];
    updated[targetIdx] = temp;
    setAuditoriasOrigens(updated);
    setShowSyncNotice(true);
  };

  const handleMoveRiscosCategoria = (idx: number, dir: 'up' | 'down') => {
    const targetIdx = dir === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= riscosCategorias.length) return;
    const updated = [...riscosCategorias];
    const temp = updated[idx];
    updated[idx] = updated[targetIdx];
    updated[targetIdx] = temp;
    setRiscosCategorias(updated);
    setShowSyncNotice(true);
  };

  // Handlers para Fornecedores Categorias
  const handleAddFornecedoresCat = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = newFornecedoresCat.trim();
    if (!clean) return;
    if (fornecedoresCategorias.includes(clean)) {
      alert('Esta categoria já existe!');
      return;
    }
    setFornecedoresCategorias([...fornecedoresCategorias, clean]);
    setNewFornecedoresCat('');
    onAddLog('Configurações', `Adicionou a categoria de fornecedor "${clean}".`);
    setShowSyncNotice(true);
  };

  const handleSaveFornecedoresCat = (idx: number) => {
    const clean = editingFornecedoresCatVal.trim();
    if (!clean) return;
    const updated = [...fornecedoresCategorias];
    updated[idx] = clean;
    setFornecedoresCategorias(updated);
    setEditingFornecedoresCatIdx(null);
    onAddLog('Configurações', `Alterou categoria de fornecedor para "${clean}".`);
    setShowSyncNotice(true);
  };

  const handleDeleteFornecedoresCat = (idx: number) => {
    const name = fornecedoresCategorias[idx];
    const updated = fornecedoresCategorias.filter((_, i) => i !== idx);
    setFornecedoresCategorias(updated);
    onAddLog('Configurações', `Removeu a categoria de fornecedor "${name}".`);
    setShowSyncNotice(true);
  };

  // Handlers para Calibração Instrumentos
  const handleAddCalibracaoTipo = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = newCalibracaoTipo.trim();
    if (!clean) return;
    if (calibracaoTipos.includes(clean)) {
      alert('Este tipo já existe!');
      return;
    }
    setCalibracaoTipos([...calibracaoTipos, clean]);
    setNewCalibracaoTipo('');
    onAddLog('Configurações', `Adicionou o tipo de instrumento de medição "${clean}".`);
    setShowSyncNotice(true);
  };

  const handleSaveCalibracaoTipo = (idx: number) => {
    const clean = editingCalibracaoTipoVal.trim();
    if (!clean) return;
    const updated = [...calibracaoTipos];
    updated[idx] = clean;
    setCalibracaoTipos(updated);
    setEditingCalibracaoTipoIdx(null);
    onAddLog('Configurações', `Alterou tipo de instrumento para "${clean}".`);
    setShowSyncNotice(true);
  };

  const handleDeleteCalibracaoTipo = (idx: number) => {
    const name = calibracaoTipos[idx];
    const updated = calibracaoTipos.filter((_, i) => i !== idx);
    setCalibracaoTipos(updated);
    onAddLog('Configurações', `Removeu o tipo de instrumento "${name}".`);
    setShowSyncNotice(true);
  };

  // Handlers para Auditorias Origens
  const handleAddAuditoriasOrigem = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = newAuditoriasOrigem.trim();
    if (!clean) return;
    if (auditoriasOrigens.includes(clean)) {
      alert('Esta origem de não conformidade já existe!');
      return;
    }
    setAuditoriasOrigens([...auditoriasOrigens, clean]);
    setNewAuditoriasOrigem('');
    onAddLog('Configurações', `Adicionou origem de não conformidade "${clean}".`);
    setShowSyncNotice(true);
  };

  const handleSaveAuditoriasOrigem = (idx: number) => {
    const clean = editingAuditoriasOrigemVal.trim();
    if (!clean) return;
    const updated = [...auditoriasOrigens];
    updated[idx] = clean;
    setAuditoriasOrigens(updated);
    setEditingAuditoriasOrigemIdx(null);
    onAddLog('Configurações', `Alterou origem de não conformidade para "${clean}".`);
    setShowSyncNotice(true);
  };

  const handleDeleteAuditoriasOrigem = (idx: number) => {
    const name = auditoriasOrigens[idx];
    const updated = auditoriasOrigens.filter((_, i) => i !== idx);
    setAuditoriasOrigens(updated);
    onAddLog('Configurações', `Removeu a origem de NC "${name}".`);
    setShowSyncNotice(true);
  };

  // Handlers para Riscos Categorias
  const handleAddRiscosCategoria = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = newRiscosCategoria.trim();
    if (!clean) return;
    if (riscosCategorias.includes(clean)) {
      alert('Esta categoria de risco já existe!');
      return;
    }
    setRiscosCategorias([...riscosCategorias, clean]);
    setNewRiscosCategoria('');
    onAddLog('Configurações', `Adicionou categoria de risco "${clean}".`);
    setShowSyncNotice(true);
  };

  const handleSaveRiscosCategoria = (idx: number) => {
    const clean = editingRiscosCategoriaVal.trim();
    if (!clean) return;
    const updated = [...riscosCategorias];
    updated[idx] = clean;
    setRiscosCategorias(updated);
    setEditingRiscosCategoriaIdx(null);
    onAddLog('Configurações', `Alterou categoria de risco para "${clean}".`);
    setShowSyncNotice(true);
  };

  const handleDeleteRiscosCategoria = (idx: number) => {
    const name = riscosCategorias[idx];
    const updated = riscosCategorias.filter((_, i) => i !== idx);
    setRiscosCategorias(updated);
    onAddLog('Configurações', `Removeu a categoria de risco "${name}".`);
    setShowSyncNotice(true);
  };

  // Permissões de escrita
  const canModify = user?.role === 'Qualidade' || user?.role === 'Gestor' || user?.role === 'Administrador';

  // --- SECTORS ACTIONS ---
  const handleAddSector = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanSector = newSector.trim();
    if (!cleanSector) return;

    if (sectors.some(s => s.toLowerCase() === cleanSector.toLowerCase())) {
      alert('Este setor já está cadastrado!');
      return;
    }

    const updated = [...sectors, cleanSector];
    setSectors(updated);
    saveSettingToFirestore('sgq_vickytex_setores', updated);
    setNewSector('');
    onAddLog('Configurações', `Adicionou o setor auxiliar "${cleanSector}" ao sistema.`);
    setShowSyncNotice(true);
  };

  const handleStartEditSector = (idx: number) => {
    setEditingSectorIdx(idx);
    setEditingSectorValue(sectors[idx]);
  };

  const handleSaveSectorEdit = (idx: number) => {
    const cleanVal = editingSectorValue.trim();
    if (!cleanVal) return;

    if (sectors.some((s, sIdx) => sIdx !== idx && s.toLowerCase() === cleanVal.toLowerCase())) {
      alert('Outro setor com este mesmo nome já existe!');
      return;
    }

    const updated = [...sectors];
    const oldName = updated[idx];
    updated[idx] = cleanVal;
    
    setSectors(updated);
    saveSettingToFirestore('sgq_vickytex_setores', updated);
    setEditingSectorIdx(null);
    onAddLog('Configurações', `Editou o setor auxiliar de "${oldName}" para "${cleanVal}".`);
    setShowSyncNotice(true);
  };

  const handleDeleteSector = (idx: number) => {
    setSectorToDeleteIdx(idx);
  };

  // --- DOCUMENT TYPES ACTIONS ---
  const handleAddDocType = (e: React.FormEvent) => {
    e.preventDefault();
    const typeUpper = newDocType.type.toUpperCase().trim();
    const cleanName = newDocType.name.trim();
    const cleanDesc = newDocType.description.trim();

    if (!typeUpper || !cleanName) {
      alert('Preencha a sigla e o nome completo do tipo documental.');
      return;
    }

    if (docTypes.some(t => t.type.toUpperCase() === typeUpper)) {
      alert('Um tipo documental com esta sigla já existe!');
      return;
    }

    const updated = [...docTypes, { type: typeUpper, name: cleanName, description: cleanDesc }];
    setDocTypes(updated);
    saveSettingToFirestore('sgq_vickytex_tipos_documentos', updated);
    setNewDocType({ type: '', name: '', description: '' });
    onAddLog('Configurações', `Registrou novo tipo documental "${typeUpper} - ${cleanName}".`);
    setShowSyncNotice(true);
  };

  const handleStartEditDocType = (idx: number) => {
    setEditingDocTypeIdx(idx);
    setEditingDocTypeValue(docTypes[idx]);
  };

  const handleSaveDocTypeEdit = (idx: number) => {
    const typeUpper = editingDocTypeValue.type.toUpperCase().trim();
    const cleanName = editingDocTypeValue.name.trim();
    const cleanDesc = editingDocTypeValue.description.trim();

    if (!typeUpper || !cleanName) {
      alert('Sigla e nome não podem ficar vazios.');
      return;
    }

    if (docTypes.some((t, tIdx) => tIdx !== idx && t.type.toUpperCase() === typeUpper)) {
      alert('Outro tipo documental com esta mesma sigla já existe!');
      return;
    }

    const updated = [...docTypes];
    const oldType = updated[idx];
    updated[idx] = { type: typeUpper, name: cleanName, description: cleanDesc };

    setDocTypes(updated);
    saveSettingToFirestore('sgq_vickytex_tipos_documentos', updated);

    setEditingDocTypeIdx(null);
    onAddLog('Configurações', `Editou o tipo documental "${oldType.type}" para "${typeUpper} - ${cleanName}".`);
    setShowSyncNotice(true);
  };

  const handleDeleteDocType = (idx: number) => {
    setDocTypeToDeleteIdx(idx);
  };

  const handleReloadPage = () => {
    window.location.reload();
  };

  // --- PERSONALIZACAO ACTIONS ---
  const handleSavePersonalizacao = (e: React.FormEvent) => {
    e.preventDefault();
    savePersonalizacaoGeral(configGeral);
    onUpdatePersonalizacao(configGeral);
    onAddLog('Configurações', 'Atualizou as configurações de personalização de textos e identidade do SGQ.');
    alert('Configurações gerais e textos das telas atualizados com sucesso em tempo real!');
  };

  return (
    <div className="space-y-6 animate-fade-in" id="configuracoes-component-panel">
      
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start space-x-4">
          <div className="p-3 bg-blue-50 dark:bg-blue-950/50 rounded-xl text-blue-600 dark:text-blue-400">
            <Settings className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">Painel de Parâmetros Auxiliares</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
              Gerencie as informações dos campos com filtros e listas suspensas do SGQ da Vickytex. Adicione, edite ou remova setores produtivos e classificações documentais que alimentam as listas de auditoria, metrologia e treinamentos.
            </p>
          </div>
        </div>
      </div>

      {/* Sync Notice Alert */}
      {showSyncNotice && (
        <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-xl p-4 flex items-center justify-between animate-scale-up">
          <div className="flex items-center space-x-3 text-xs text-amber-800 dark:text-amber-300">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <p className="font-bold">Informações salvas localmente com sucesso!</p>
              <p className="opacity-90">Para aplicar os novos setores e parâmetros a todas as telas do sistema simultaneamente, clique no botão ao lado.</p>
            </div>
          </div>
          <button 
            onClick={handleReloadPage}
            className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-colors shrink-0 font-mono shadow-xs"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>RECARREGAR SISTEMA</span>
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Navigation Sidebar inside Configurations */}
        <div className="lg:col-span-1 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs space-y-1">
          <p className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">TABELAS DO SISTEMA</p>
          
          <button
            onClick={() => setActiveSubTab('setores')}
            className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-xs font-bold transition-colors ${
              activeSubTab === 'setores' 
                ? 'bg-[#0B3A63] text-white' 
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Setores Produtivos ({sectors.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('tipos')}
            className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-xs font-bold transition-colors ${
              activeSubTab === 'tipos' 
                ? 'bg-[#0B3A63] text-white' 
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50'
            }`}
          >
            <FolderOpen className="w-4 h-4" />
            <span>Tipos Documentais ({docTypes.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('metodologias')}
            className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-xs font-bold transition-colors ${
              activeSubTab === 'metodologias' 
                ? 'bg-[#0B3A63] text-white' 
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Metodologias de Melhoria ({metodologias.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('fornecedores_cats')}
            className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-xs font-bold transition-colors ${
              activeSubTab === 'fornecedores_cats' 
                ? 'bg-[#0B3A63] text-white' 
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50'
            }`}
          >
            <Truck className="w-4 h-4" />
            <span>Categorias de Fornecedores ({fornecedoresCategorias.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('calibracao_instrumentos')}
            className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-xs font-bold transition-colors ${
              activeSubTab === 'calibracao_instrumentos' 
                ? 'bg-[#0B3A63] text-white' 
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50'
            }`}
          >
            <Wrench className="w-4 h-4" />
            <span>Tipos de Instrumentos ({calibracaoTipos.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('auditorias_origens')}
            className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-xs font-bold transition-colors ${
              activeSubTab === 'auditorias_origens' 
                ? 'bg-[#0B3A63] text-white' 
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50'
            }`}
          >
            <CheckSquare className="w-4 h-4" />
            <span>Origens de Ocorrências / NC ({auditoriasOrigens.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('riscos_categorias')}
            className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-xs font-bold transition-colors ${
              activeSubTab === 'riscos_categorias' 
                ? 'bg-[#0B3A63] text-white' 
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            <span>Categorias de Riscos ({riscosCategorias.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('personalizacao')}
            className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-xs font-bold transition-colors ${
              activeSubTab === 'personalizacao' 
                ? 'bg-[#0B3A63] text-white' 
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Identidade & Textos das Telas</span>
          </button>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 mt-4 text-[11px] text-slate-400 p-3 leading-relaxed bg-slate-50 dark:bg-slate-950/20 rounded-lg">
            <HelpCircle className="w-4 h-4 text-slate-400 mb-1" />
            <strong>Rastreabilidade de Filtros:</strong> Novos registros inseridos aqui ficam disponíveis imediatamente nos formulários de criação de novas Auditorias, Não Conformidades, Treinamentos, Instrumentos e Documentos Técnicos.
          </div>
        </div>

        {/* Configurations Dynamic Detail View Area */}
        <div className="lg:col-span-3 space-y-6">

          {/* SECTION 1: SETORES (SECTORS) */}
          {activeSubTab === 'setores' && (
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-6">
              
              <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-100">Cadastro de Setores da Fábrica</h3>
                  <p className="text-xs text-slate-400">Insira, edite ou exclua os setores que organizam o fluxo têxtil.</p>
                </div>
                <span className="text-[10px] font-mono bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full font-bold">
                  {sectors.length} Setores Cadastrados
                </span>
              </div>

              {/* Form to Add Sector */}
              {canModify ? (
                <form onSubmit={handleAddSector} className="flex gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Ex: Tecelagem, Tinturaria, Fiação..."
                    value={newSector}
                    onChange={(e) => setNewSector(e.target.value)}
                    className="flex-1 bg-slate-50 dark:bg-slate-800 text-xs border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-800 dark:text-slate-100 focus:outline-hidden"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-colors shrink-0 shadow-xs"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Adicionar Setor</span>
                  </button>
                </form>
              ) : (
                <p className="text-xs text-slate-400 italic">Você precisa ter permissões de Qualidade ou Gerência para adicionar setores.</p>
              )}

              {/* List of Sectors */}
              <div className="overflow-hidden border border-slate-100 dark:border-slate-800 rounded-lg">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-950/20 text-slate-400 font-bold border-b border-slate-100 dark:border-slate-800">
                      <th className="py-2.5 px-4">Nome do Setor</th>
                      <th className="py-2.5 px-4 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                    {sectors.map((sec, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10">
                        <td className="py-3 px-4 text-slate-800 dark:text-slate-200">
                          {editingSectorIdx === idx ? (
                            <input
                              type="text"
                              value={editingSectorValue}
                              onChange={(e) => setEditingSectorValue(e.target.value)}
                              className="bg-slate-50 dark:bg-slate-800 text-xs border border-slate-200 dark:border-slate-700 rounded-md px-2 py-1 text-slate-800 dark:text-slate-100 focus:outline-hidden"
                            />
                          ) : (
                            <span>{sec}</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          {canModify ? (
                            <div className="flex items-center justify-end space-x-2">
                              {editingSectorIdx === idx ? (
                                <>
                                  <button
                                    onClick={() => handleSaveSectorEdit(idx)}
                                    className="p-1 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 text-emerald-600 rounded transition-colors"
                                    title="Salvar"
                                  >
                                    <CheckCircle2 className="w-4.5 h-4.5" />
                                  </button>
                                  <button
                                    onClick={() => setEditingSectorIdx(null)}
                                    className="p-1 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-rose-500 rounded transition-colors"
                                    title="Cancelar"
                                  >
                                    <X className="w-4.5 h-4.5" />
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button
                                    type="button"
                                    disabled={idx === 0}
                                    onClick={() => handleMoveSector(idx, 'up')}
                                    className="p-1 text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-20 disabled:hover:bg-transparent rounded transition-colors"
                                    title="Mover para cima"
                                  >
                                    <ArrowUp className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    disabled={idx === sectors.length - 1}
                                    onClick={() => handleMoveSector(idx, 'down')}
                                    className="p-1 text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-20 disabled:hover:bg-transparent rounded transition-colors"
                                    title="Mover para baixo"
                                  >
                                    <ArrowDown className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleStartEditSector(idx)}
                                    className="text-slate-400 hover:text-blue-600 p-1 hover:bg-slate-50 dark:hover:bg-slate-800 rounded transition-colors"
                                    title="Editar Nome"
                                  >
                                    <Pencil className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteSector(idx)}
                                    className="text-slate-400 hover:text-rose-500 p-1 hover:bg-slate-50 dark:hover:bg-slate-800 rounded transition-colors"
                                    title="Excluir Setor"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </>
                              )}
                            </div>
                          ) : (
                            <span className="text-[10px] text-slate-400 italic">Somente leitura</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

            </div>
          )}

          {/* SECTION 2: TIPOS DOCUMENTAIS */}
          {activeSubTab === 'tipos' && (
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-6">
              
              <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-100">Cadastro de Tipos Documentais (Lista Mestra)</h3>
                  <p className="text-xs text-slate-400">Gerencie as siglas e categorias usadas na organização dos documentos.</p>
                </div>
                <span className="text-[10px] font-mono bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full font-bold">
                  {docTypes.length} Categorias Cadastradas
                </span>
              </div>

              {/* Form to Add Document Type */}
              {canModify ? (
                <form onSubmit={handleAddDocType} className="bg-slate-50 dark:bg-slate-800/30 p-4 border border-slate-100 dark:border-slate-800/60 rounded-xl space-y-4">
                  <p className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">Novo Tipo Documental</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500">Sigla (Ex: CQ, PRD, SGQ)</label>
                      <input
                        type="text"
                        required
                        placeholder="Ex: CQ"
                        maxLength={5}
                        value={newDocType.type}
                        onChange={(e) => setNewDocType({ ...newDocType, type: e.target.value })}
                        className="w-full bg-white dark:bg-slate-800 text-xs border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-slate-100 font-mono focus:outline-hidden"
                      />
                    </div>
                    <div className="space-y-1 md:col-span-2">
                      <label className="text-[10px] font-bold text-slate-500">Nome Completo</label>
                      <input
                        type="text"
                        required
                        placeholder="Ex: Controle de Qualidade de Tecidos"
                        value={newDocType.name}
                        onChange={(e) => setNewDocType({ ...newDocType, name: e.target.value })}
                        className="w-full bg-white dark:bg-slate-800 text-xs border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-slate-100 focus:outline-hidden"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500">Descrição/Objetivo Curto</label>
                    <input
                      type="text"
                      placeholder="Ex: Registros e checklists para atestar a conformidade de lotes têxteis."
                      value={newDocType.description}
                      onChange={(e) => setNewDocType({ ...newDocType, description: e.target.value })}
                      className="w-full bg-white dark:bg-slate-800 text-xs border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-slate-100 focus:outline-hidden"
                    />
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-colors shadow-xs"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Cadastrar Tipo Documental</span>
                    </button>
                  </div>
                </form>
              ) : (
                <p className="text-xs text-slate-400 italic">Você precisa ter permissões de Qualidade ou Gerência para adicionar tipos documentais.</p>
              )}

              {/* Table of Document Types */}
              <div className="overflow-hidden border border-slate-100 dark:border-slate-800 rounded-lg">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-950/20 text-slate-400 font-bold border-b border-slate-100 dark:border-slate-800">
                      <th className="py-2.5 px-4 w-20">Sigla</th>
                      <th className="py-2.5 px-4">Nome Categoria</th>
                      <th className="py-2.5 px-4 hidden md:table-cell">Descrição</th>
                      <th className="py-2.5 px-4 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                    {docTypes.map((t, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10">
                        <td className="py-3 px-4 font-mono font-bold text-blue-600 dark:text-blue-400">
                          {editingDocTypeIdx === idx ? (
                            <input
                              type="text"
                              value={editingDocTypeValue.type}
                              onChange={(e) => setEditingDocTypeValue({ ...editingDocTypeValue, type: e.target.value })}
                              className="w-full bg-slate-50 dark:bg-slate-800 text-xs border border-slate-200 dark:border-slate-700 rounded-md px-1 py-0.5 text-slate-800 dark:text-slate-100 font-mono focus:outline-hidden"
                            />
                          ) : (
                            <span>{t.type}</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-slate-800 dark:text-slate-200 font-semibold">
                          {editingDocTypeIdx === idx ? (
                            <input
                              type="text"
                              value={editingDocTypeValue.name}
                              onChange={(e) => setEditingDocTypeValue({ ...editingDocTypeValue, name: e.target.value })}
                              className="w-full bg-slate-50 dark:bg-slate-800 text-xs border border-slate-200 dark:border-slate-700 rounded-md px-2 py-1 text-slate-800 dark:text-slate-100 focus:outline-hidden"
                            />
                          ) : (
                            <span>{t.name}</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-slate-500 dark:text-slate-400 max-w-[200px] truncate hidden md:table-cell">
                          {editingDocTypeIdx === idx ? (
                            <input
                              type="text"
                              value={editingDocTypeValue.description}
                              onChange={(e) => setEditingDocTypeValue({ ...editingDocTypeValue, description: e.target.value })}
                              className="w-full bg-slate-50 dark:bg-slate-800 text-xs border border-slate-200 dark:border-slate-700 rounded-md px-2 py-1 text-slate-800 dark:text-slate-100 focus:outline-hidden"
                            />
                          ) : (
                            <span>{t.description}</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          {canModify ? (
                            <div className="flex items-center justify-end space-x-2">
                              {editingDocTypeIdx === idx ? (
                                <>
                                  <button
                                    onClick={() => handleSaveDocTypeEdit(idx)}
                                    className="p-1 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 text-emerald-600 rounded transition-colors"
                                    title="Salvar"
                                  >
                                    <CheckCircle2 className="w-4.5 h-4.5" />
                                  </button>
                                  <button
                                    onClick={() => setEditingDocTypeIdx(null)}
                                    className="p-1 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-rose-500 rounded transition-colors"
                                    title="Cancelar"
                                  >
                                    <X className="w-4.5 h-4.5" />
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button
                                    type="button"
                                    disabled={idx === 0}
                                    onClick={() => handleMoveDocType(idx, 'up')}
                                    className="p-1 text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-20 disabled:hover:bg-transparent rounded transition-colors"
                                    title="Mover para cima"
                                  >
                                    <ArrowUp className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    disabled={idx === docTypes.length - 1}
                                    onClick={() => handleMoveDocType(idx, 'down')}
                                    className="p-1 text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-20 disabled:hover:bg-transparent rounded transition-colors"
                                    title="Mover para baixo"
                                  >
                                    <ArrowDown className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleStartEditDocType(idx)}
                                    className="text-slate-400 hover:text-blue-600 p-1 hover:bg-slate-50 dark:hover:bg-slate-800 rounded transition-colors"
                                    title="Editar Tipo"
                                  >
                                    <Pencil className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteDocType(idx)}
                                    className="text-slate-400 hover:text-rose-500 p-1 hover:bg-slate-50 dark:hover:bg-slate-800 rounded transition-colors"
                                    title="Excluir Tipo"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </>
                              )}
                            </div>
                          ) : (
                            <span className="text-[10px] text-slate-400 italic">Somente leitura</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

            </div>
          )}

          {/* SECTION: METODOLOGIAS DE MELHORIA */}
          {activeSubTab === 'metodologias' && (
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-6">
              
              <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-100">Parâmetros Auxiliares: Metodologias de Melhoria</h3>
                  <p className="text-xs text-slate-400">Personalize as explicações e ferramentas sugeridas para cada ciclo de melhoria contínua (ISO 9001:2015 10.3).</p>
                </div>
                <span className="text-[10px] font-mono bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full font-bold">
                  {metodologias.length} Metodologias Ativas
                </span>
              </div>

              {/* List of Methodologies */}
              <div className="space-y-4">
                {metodologias.map((m: any) => {
                  const isEditing = editingMetodologiaId === m.id;
                  return (
                    <div key={m.id} className="border border-slate-100 dark:border-slate-800/80 rounded-xl p-4 space-y-3 bg-slate-50/50 dark:bg-slate-950/10">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <h4 className="text-xs font-black text-slate-850 dark:text-slate-100 font-mono">{m.nome}</h4>
                          <p className="text-[10px] text-blue-600 dark:text-blue-400 font-bold">Etapas: {m.etapas}</p>
                        </div>
                        {canModify && (
                          isEditing ? (
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => handleSaveMetodologia(m.id)}
                                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-[10px] font-bold flex items-center space-x-1"
                              >
                                <Save className="w-3 h-3" />
                                <span>Salvar</span>
                              </button>
                              <button
                                onClick={() => setEditingMetodologiaId(null)}
                                className="px-2.5 py-1 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-md text-[10px] font-bold"
                              >
                                Cancelar
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => {
                                setEditingMetodologiaId(m.id);
                                setEditingMetodologiaVal({ explicacao: m.explicacao, ferramentas: m.ferramentas });
                              }}
                              className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950 dark:hover:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-md text-[10px] font-bold flex items-center space-x-1"
                            >
                              <Pencil className="w-3 h-3" />
                              <span>Editar Explicação</span>
                            </button>
                          )
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-1 border-t border-slate-100 dark:border-slate-800/50">
                        <div className="space-y-1">
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Explicação / Conceito Educativo</span>
                          {isEditing ? (
                            <textarea
                              value={editingMetodologiaVal.explicacao}
                              onChange={(e) => setEditingMetodologiaVal({ ...editingMetodologiaVal, explicacao: e.target.value })}
                              rows={3}
                              className="w-full bg-white dark:bg-slate-900 text-xs border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-800 dark:text-slate-100 focus:outline-hidden"
                            />
                          ) : (
                            <p className="text-slate-600 dark:text-slate-300 leading-relaxed font-medium">{m.explicacao}</p>
                          )}
                        </div>
                        <div className="space-y-1">
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Ferramentas SGQ Recomendadas</span>
                          {isEditing ? (
                            <input
                              type="text"
                              value={editingMetodologiaVal.ferramentas}
                              onChange={(e) => setEditingMetodologiaVal({ ...editingMetodologiaVal, ferramentas: e.target.value })}
                              className="w-full bg-white dark:bg-slate-900 text-xs border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-800 dark:text-slate-100 focus:outline-hidden"
                            />
                          ) : (
                            <p className="text-slate-500 dark:text-slate-450 font-mono text-[11px] leading-relaxed">{m.ferramentas}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>
          )}

          {/* SECTION 3: PERSONALIZAÇÃO DE IDENTIDADE & TEXTOS DAS TELAS */}
          {activeSubTab === 'personalizacao' && (
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-6">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-100">Personalização de Identidade & Textos das Telas</h3>
                  <p className="text-xs text-slate-400">Altere nomes, slogans, descrições e títulos que são exibidos em todo o sistema em tempo real.</p>
                </div>
                <span className="text-[10px] font-mono bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full font-bold">
                  Dinamismo em Tempo Real
                </span>
              </div>

              {canModify ? (
                <form onSubmit={handleSavePersonalizacao} className="space-y-6">
                  
                  {/* Grupo 1: Identidade Institucional */}
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-1.5 flex items-center space-x-1.5">
                      <span>1. Identidade Institucional & Rodapé</span>
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500">Nome da Empresa</label>
                        <input
                          type="text"
                          required
                          value={configGeral.nomeEmpresa}
                          onChange={(e) => setConfigGeral({ ...configGeral, nomeEmpresa: e.target.value })}
                          className="w-full bg-slate-50 dark:bg-slate-800 text-xs border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-slate-800 dark:text-slate-100 focus:outline-hidden font-medium"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500">Norma Reguladora Ativa</label>
                        <input
                          type="text"
                          required
                          value={configGeral.normaISO}
                          onChange={(e) => setConfigGeral({ ...configGeral, normaISO: e.target.value })}
                          className="w-full bg-slate-50 dark:bg-slate-800 text-xs border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-slate-800 dark:text-slate-100 focus:outline-hidden font-medium"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500">Versão do Sistema</label>
                        <input
                          type="text"
                          required
                          value={configGeral.versaoSistema}
                          onChange={(e) => setConfigGeral({ ...configGeral, versaoSistema: e.target.value })}
                          className="w-full bg-slate-50 dark:bg-slate-800 text-xs border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-slate-800 dark:text-slate-100 focus:outline-hidden font-medium"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500">Direitos Autorais (Rodapé)</label>
                        <input
                          type="text"
                          required
                          value={configGeral.textoRodape}
                          onChange={(e) => setConfigGeral({ ...configGeral, textoRodape: e.target.value })}
                          className="w-full bg-slate-50 dark:bg-slate-800 text-xs border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-slate-800 dark:text-slate-100 focus:outline-hidden font-medium"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500">Diretrizes Legais (Rodapé)</label>
                        <input
                          type="text"
                          required
                          value={configGeral.diretrizesRodape}
                          onChange={(e) => setConfigGeral({ ...configGeral, diretrizesRodape: e.target.value })}
                          className="w-full bg-slate-50 dark:bg-slate-800 text-xs border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-slate-800 dark:text-slate-100 focus:outline-hidden font-medium"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Grupo 2: Painel Executivo */}
                  <div className="space-y-4 pt-2">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-1.5">
                      <span>2. Painel Principal (Dashboard)</span>
                    </h4>
                    <div className="grid grid-cols-1 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500">Slogan de Boas-vindas</label>
                        <input
                          type="text"
                          required
                          value={configGeral.sloganHome}
                          onChange={(e) => setConfigGeral({ ...configGeral, sloganHome: e.target.value })}
                          className="w-full bg-slate-50 dark:bg-slate-800 text-xs border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-slate-800 dark:text-slate-100 focus:outline-hidden font-medium"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500">Descrição de Boas-vindas</label>
                        <textarea
                          rows={2}
                          required
                          value={configGeral.descricaoHome}
                          onChange={(e) => setConfigGeral({ ...configGeral, descricaoHome: e.target.value })}
                          className="w-full bg-slate-50 dark:bg-slate-800 text-xs border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-slate-800 dark:text-slate-100 focus:outline-hidden resize-none font-medium"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Grupo 3: Títulos de Módulos */}
                  <div className="space-y-4 pt-2">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-1.5">
                      <span>3. Títulos & Subtítulos das Telas</span>
                    </h4>
                    <div className="space-y-4">
                      {/* Documentos */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50/50 dark:bg-slate-800/10 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                        <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 md:col-span-3">Módulo de Documentos (Lista Mestra)</span>
                        <div className="space-y-1 md:col-span-1">
                          <label className="text-[9px] font-bold text-slate-500">Título</label>
                          <input
                            type="text"
                            required
                            value={configGeral.documentosTitulo}
                            onChange={(e) => setConfigGeral({ ...configGeral, documentosTitulo: e.target.value })}
                            className="w-full bg-white dark:bg-slate-800 text-xs border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-slate-100 focus:outline-hidden font-medium"
                          />
                        </div>
                        <div className="space-y-1 md:col-span-2">
                          <label className="text-[9px] font-bold text-slate-500">Subtítulo</label>
                          <input
                            type="text"
                            required
                            value={configGeral.documentosSubtitulo}
                            onChange={(e) => setConfigGeral({ ...configGeral, documentosSubtitulo: e.target.value })}
                            className="w-full bg-white dark:bg-slate-800 text-xs border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-slate-100 focus:outline-hidden font-medium"
                          />
                        </div>
                      </div>

                      {/* Auditorias */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50/50 dark:bg-slate-800/10 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                        <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 md:col-span-3">Módulo de Auditorias & NC</span>
                        <div className="space-y-1 md:col-span-1">
                          <label className="text-[9px] font-bold text-slate-500">Título</label>
                          <input
                            type="text"
                            required
                            value={configGeral.auditoriasTitulo}
                            onChange={(e) => setConfigGeral({ ...configGeral, auditoriasTitulo: e.target.value })}
                            className="w-full bg-white dark:bg-slate-800 text-xs border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-slate-100 focus:outline-hidden font-medium"
                          />
                        </div>
                        <div className="space-y-1 md:col-span-2">
                          <label className="text-[9px] font-bold text-slate-500">Subtítulo</label>
                          <input
                            type="text"
                            required
                            value={configGeral.auditoriasSubtitulo}
                            onChange={(e) => setConfigGeral({ ...configGeral, auditoriasSubtitulo: e.target.value })}
                            className="w-full bg-white dark:bg-slate-800 text-xs border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-slate-100 focus:outline-hidden font-medium"
                          />
                        </div>
                      </div>

                      {/* Treinamentos */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50/50 dark:bg-slate-800/10 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                        <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 md:col-span-3">Módulo de Treinamentos (Capacitação)</span>
                        <div className="space-y-1 md:col-span-1">
                          <label className="text-[9px] font-bold text-slate-500">Título</label>
                          <input
                            type="text"
                            required
                            value={configGeral.treinamentosTitulo}
                            onChange={(e) => setConfigGeral({ ...configGeral, treinamentosTitulo: e.target.value })}
                            className="w-full bg-white dark:bg-slate-800 text-xs border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-slate-100 focus:outline-hidden font-medium"
                          />
                        </div>
                        <div className="space-y-1 md:col-span-2">
                          <label className="text-[9px] font-bold text-slate-500">Subtítulo</label>
                          <input
                            type="text"
                            required
                            value={configGeral.treinamentosSubtitulo}
                            onChange={(e) => setConfigGeral({ ...configGeral, treinamentosSubtitulo: e.target.value })}
                            className="w-full bg-white dark:bg-slate-800 text-xs border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-slate-100 focus:outline-hidden font-medium"
                          />
                        </div>
                      </div>

                      {/* Calibração */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50/50 dark:bg-slate-800/10 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                        <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 md:col-span-3">Módulo de Calibração (Metrologia)</span>
                        <div className="space-y-1 md:col-span-1">
                          <label className="text-[9px] font-bold text-slate-500">Título</label>
                          <input
                            type="text"
                            required
                            value={configGeral.calibracaoTitulo}
                            onChange={(e) => setConfigGeral({ ...configGeral, calibracaoTitulo: e.target.value })}
                            className="w-full bg-white dark:bg-slate-800 text-xs border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-slate-100 focus:outline-hidden font-medium"
                          />
                        </div>
                        <div className="space-y-1 md:col-span-2">
                          <label className="text-[9px] font-bold text-slate-500">Subtítulo</label>
                          <input
                            type="text"
                            required
                            value={configGeral.calibracaoSubtitulo}
                            onChange={(e) => setConfigGeral({ ...configGeral, calibracaoSubtitulo: e.target.value })}
                            className="w-full bg-white dark:bg-slate-800 text-xs border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-slate-100 focus:outline-hidden font-medium"
                          />
                        </div>
                      </div>

                      {/* Planos de Ação */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50/50 dark:bg-slate-800/10 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                        <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 md:col-span-3">Módulo de Planos de Ação 5W2H</span>
                        <div className="space-y-1 md:col-span-1">
                          <label className="text-[9px] font-bold text-slate-500">Título</label>
                          <input
                            type="text"
                            required
                            value={configGeral.planosTitulo}
                            onChange={(e) => setConfigGeral({ ...configGeral, planosTitulo: e.target.value })}
                            className="w-full bg-white dark:bg-slate-800 text-xs border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-slate-100 focus:outline-hidden font-medium"
                          />
                        </div>
                        <div className="space-y-1 md:col-span-2">
                          <label className="text-[9px] font-bold text-slate-500">Subtítulo</label>
                          <input
                            type="text"
                            required
                            value={configGeral.planosSubtitulo}
                            onChange={(e) => setConfigGeral({ ...configGeral, planosSubtitulo: e.target.value })}
                            className="w-full bg-white dark:bg-slate-800 text-xs border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-slate-100 focus:outline-hidden font-medium"
                          />
                        </div>
                      </div>

                      {/* Gestão de Riscos */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50/50 dark:bg-slate-800/10 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                        <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 md:col-span-3">Módulo de Gestão de Riscos (ISO 6.1)</span>
                        <div className="space-y-1 md:col-span-1">
                          <label className="text-[9px] font-bold text-slate-500">Título</label>
                          <input
                            type="text"
                            required
                            value={configGeral.riscosTitulo}
                            onChange={(e) => setConfigGeral({ ...configGeral, riscosTitulo: e.target.value })}
                            className="w-full bg-white dark:bg-slate-800 text-xs border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-slate-100 focus:outline-hidden font-medium"
                          />
                        </div>
                        <div className="space-y-1 md:col-span-2">
                          <label className="text-[9px] font-bold text-slate-500">Subtítulo</label>
                          <input
                            type="text"
                            required
                            value={configGeral.riscosSubtitulo}
                            onChange={(e) => setConfigGeral({ ...configGeral, riscosSubtitulo: e.target.value })}
                            className="w-full bg-white dark:bg-slate-800 text-xs border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-slate-100 focus:outline-hidden font-medium"
                          />
                        </div>
                      </div>

                      {/* Programa 5S */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50/50 dark:bg-slate-800/10 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                        <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 md:col-span-3">Módulo de Programa 5S (Lean)</span>
                        <div className="space-y-1 md:col-span-1">
                          <label className="text-[9px] font-bold text-slate-500">Título</label>
                          <input
                            type="text"
                            required
                            value={configGeral.auditorias5sTitulo}
                            onChange={(e) => setConfigGeral({ ...configGeral, auditorias5sTitulo: e.target.value })}
                            className="w-full bg-white dark:bg-slate-800 text-xs border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-slate-100 focus:outline-hidden font-medium"
                          />
                        </div>
                        <div className="space-y-1 md:col-span-2">
                          <label className="text-[9px] font-bold text-slate-500">Subtítulo</label>
                          <input
                            type="text"
                            required
                            value={configGeral.auditorias5sSubtitulo}
                            onChange={(e) => setConfigGeral({ ...configGeral, auditorias5sSubtitulo: e.target.value })}
                            className="w-full bg-white dark:bg-slate-800 text-xs border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-slate-100 focus:outline-hidden font-medium"
                          />
                        </div>
                      </div>

                      {/* Avaliação de Fornecedores */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50/50 dark:bg-slate-800/10 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                        <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 md:col-span-3">Módulo de Fornecedores (ISO 8.4)</span>
                        <div className="space-y-1 md:col-span-1">
                          <label className="text-[9px] font-bold text-slate-500">Título</label>
                          <input
                            type="text"
                            required
                            value={configGeral.fornecedoresTitulo || ''}
                            onChange={(e) => setConfigGeral({ ...configGeral, fornecedoresTitulo: e.target.value })}
                            className="w-full bg-white dark:bg-slate-800 text-xs border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-slate-100 focus:outline-hidden font-medium"
                          />
                        </div>
                        <div className="space-y-1 md:col-span-2">
                          <label className="text-[9px] font-bold text-slate-500">Subtítulo</label>
                          <input
                            type="text"
                            required
                            value={configGeral.fornecedoresSubtitulo || ''}
                            onChange={(e) => setConfigGeral({ ...configGeral, fornecedoresSubtitulo: e.target.value })}
                            className="w-full bg-white dark:bg-slate-800 text-xs border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-slate-100 focus:outline-hidden font-medium"
                          />
                        </div>
                      </div>

                      {/* Controle de Registros */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50/50 dark:bg-slate-800/10 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                        <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 md:col-span-3">Módulo de Controle de Registros (ISO 7.5.3)</span>
                        <div className="space-y-1 md:col-span-1">
                          <label className="text-[9px] font-bold text-slate-500">Título</label>
                          <input
                            type="text"
                            required
                            value={configGeral.registrosTitulo || ''}
                            onChange={(e) => setConfigGeral({ ...configGeral, registrosTitulo: e.target.value })}
                            className="w-full bg-white dark:bg-slate-800 text-xs border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-slate-100 focus:outline-hidden font-medium"
                          />
                        </div>
                        <div className="space-y-1 md:col-span-2">
                          <label className="text-[9px] font-bold text-slate-500">Subtítulo</label>
                          <input
                            type="text"
                            required
                            value={configGeral.registrosSubtitulo || ''}
                            onChange={(e) => setConfigGeral({ ...configGeral, registrosSubtitulo: e.target.value })}
                            className="w-full bg-white dark:bg-slate-800 text-xs border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-slate-100 focus:outline-hidden font-medium"
                          />
                        </div>
                      </div>

                      {/* Card de Ajuda de Treinamento */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50/50 dark:bg-slate-800/10 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                        <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 md:col-span-3">Card de Dúvida / Rodapé de Treinamentos (ISO 7.2)</span>
                        <div className="space-y-1 md:col-span-1">
                          <label className="text-[9px] font-bold text-slate-500">Pergunta / Título do Banner</label>
                          <input
                            type="text"
                            required
                            value={configGeral.treinamentosAjudaTitulo || ''}
                            onChange={(e) => setConfigGeral({ ...configGeral, treinamentosAjudaTitulo: e.target.value })}
                            className="w-full bg-white dark:bg-slate-800 text-xs border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-slate-100 focus:outline-hidden font-medium"
                          />
                        </div>
                        <div className="space-y-1 md:col-span-2">
                          <label className="text-[9px] font-bold text-slate-500">Resposta / Explicação Detalhada</label>
                          <textarea
                            rows={2}
                            required
                            value={configGeral.treinamentosAjudaSubtitulo || ''}
                            onChange={(e) => setConfigGeral({ ...configGeral, treinamentosAjudaSubtitulo: e.target.value })}
                            className="w-full bg-white dark:bg-slate-800 text-xs border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-slate-100 focus:outline-hidden font-medium resize-none"
                          />
                        </div>
                      </div>

                      {/* Card de Ajuda do 5S */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50/50 dark:bg-slate-800/10 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                        <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 md:col-span-3">Card de Dúvida / Rodapé do Módulo 5S (ISO 7.1.3 / 7.1.4)</span>
                        <div className="space-y-1 md:col-span-1">
                          <label className="text-[9px] font-bold text-slate-500">Pergunta / Título do Banner</label>
                          <input
                            type="text"
                            required
                            value={configGeral.auditorias5sAjudaTitulo || ''}
                            onChange={(e) => setConfigGeral({ ...configGeral, auditorias5sAjudaTitulo: e.target.value })}
                            className="w-full bg-white dark:bg-slate-800 text-xs border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-slate-100 focus:outline-hidden font-medium"
                          />
                        </div>
                        <div className="space-y-1 md:col-span-2">
                          <label className="text-[9px] font-bold text-slate-500">Resposta / Explicação Detalhada</label>
                          <textarea
                            rows={2}
                            required
                            value={configGeral.auditorias5sAjudaSubtitulo || ''}
                            onChange={(e) => setConfigGeral({ ...configGeral, auditorias5sAjudaSubtitulo: e.target.value })}
                            className="w-full bg-white dark:bg-slate-800 text-xs border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-slate-100 focus:outline-hidden font-medium resize-none"
                          />
                        </div>
                      </div>

                      {/* Meta de Qualidade 5S */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50/50 dark:bg-slate-800/10 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                        <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 md:col-span-3">Meta de Qualidade 5S Vickytex (Módulo 5S & Gráfico)</span>
                        <div className="space-y-1 md:col-span-1">
                          <label className="text-[9px] font-bold text-slate-500">Título do Card de Meta</label>
                          <input
                            type="text"
                            required
                            value={configGeral.auditorias5sMetaTitulo || ''}
                            onChange={(e) => setConfigGeral({ ...configGeral, auditorias5sMetaTitulo: e.target.value })}
                            className="w-full bg-white dark:bg-slate-800 text-xs border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-slate-100 focus:outline-hidden font-medium"
                          />
                        </div>
                        <div className="space-y-1 md:col-span-1">
                          <label className="text-[9px] font-bold text-slate-500">Meta do Gráfico Histórico (%)</label>
                          <input
                            type="number"
                            required
                            min={0}
                            max={100}
                            value={configGeral.auditorias5sMetaGrafico ?? 75}
                            onChange={(e) => setConfigGeral({ ...configGeral, auditorias5sMetaGrafico: Number(e.target.value) })}
                            className="w-full bg-white dark:bg-slate-800 text-xs border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-slate-100 focus:outline-hidden font-mono font-bold"
                          />
                        </div>
                        <div className="space-y-1 md:col-span-1">
                          <label className="text-[9px] font-bold text-slate-500">Texto / Descritivo da Meta</label>
                          <textarea
                            rows={2}
                            required
                            value={configGeral.auditorias5sMetaSubtitulo || ''}
                            onChange={(e) => setConfigGeral({ ...configGeral, auditorias5sMetaSubtitulo: e.target.value })}
                            className="w-full bg-white dark:bg-slate-800 text-xs border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-slate-100 focus:outline-hidden font-medium resize-none"
                          />
                        </div>
                      </div>

                      {/* Card de Ajuda de Auditorias & NC */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50/50 dark:bg-slate-800/10 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                        <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 md:col-span-3">Card de Dúvida / Rodapé de Auditorias e Não Conformidades (ISO 9.2 / 10.2)</span>
                        <div className="space-y-1 md:col-span-1">
                          <label className="text-[9px] font-bold text-slate-500">Pergunta / Título do Banner</label>
                          <input
                            type="text"
                            required
                            value={configGeral.auditoriasAjudaTitulo || ''}
                            onChange={(e) => setConfigGeral({ ...configGeral, auditoriasAjudaTitulo: e.target.value })}
                            className="w-full bg-white dark:bg-slate-800 text-xs border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-slate-100 focus:outline-hidden font-medium"
                          />
                        </div>
                        <div className="space-y-1 md:col-span-2">
                          <label className="text-[9px] font-bold text-slate-500">Resposta / Explicação Detalhada</label>
                          <textarea
                            rows={2}
                            required
                            value={configGeral.auditoriasAjudaSubtitulo || ''}
                            onChange={(e) => setConfigGeral({ ...configGeral, auditoriasAjudaSubtitulo: e.target.value })}
                            className="w-full bg-white dark:bg-slate-800 text-xs border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-slate-100 focus:outline-hidden font-medium resize-none"
                          />
                        </div>
                      </div>

                      {/* Card de Ajuda de Calibração */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50/50 dark:bg-slate-800/10 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                        <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 md:col-span-3">Card de Dúvida / Rodapé de Calibração (ISO 7.1.5)</span>
                        <div className="space-y-1 md:col-span-1">
                          <label className="text-[9px] font-bold text-slate-500">Pergunta / Título do Banner</label>
                          <input
                            type="text"
                            required
                            value={configGeral.calibracaoAjudaTitulo || ''}
                            onChange={(e) => setConfigGeral({ ...configGeral, calibracaoAjudaTitulo: e.target.value })}
                            className="w-full bg-white dark:bg-slate-800 text-xs border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-slate-100 focus:outline-hidden font-medium"
                          />
                        </div>
                        <div className="space-y-1 md:col-span-2">
                          <label className="text-[9px] font-bold text-slate-500">Resposta / Explicação Detalhada</label>
                          <textarea
                            rows={2}
                            required
                            value={configGeral.calibracaoAjudaSubtitulo || ''}
                            onChange={(e) => setConfigGeral({ ...configGeral, calibracaoAjudaSubtitulo: e.target.value })}
                            className="w-full bg-white dark:bg-slate-800 text-xs border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-slate-100 focus:outline-hidden font-medium resize-none"
                          />
                        </div>
                      </div>

                      {/* Card de Ajuda de Documentos */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50/50 dark:bg-slate-800/10 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                        <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 md:col-span-3">Card de Dúvida / Rodapé de Documentos (ISO 7.5)</span>
                        <div className="space-y-1 md:col-span-1">
                          <label className="text-[9px] font-bold text-slate-500">Pergunta / Título do Banner</label>
                          <input
                            type="text"
                            required
                            value={configGeral.documentosAjudaTitulo || ''}
                            onChange={(e) => setConfigGeral({ ...configGeral, documentosAjudaTitulo: e.target.value })}
                            className="w-full bg-white dark:bg-slate-800 text-xs border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-slate-100 focus:outline-hidden font-medium"
                          />
                        </div>
                        <div className="space-y-1 md:col-span-2">
                          <label className="text-[9px] font-bold text-slate-500">Resposta / Explicação Detalhada</label>
                          <textarea
                            rows={2}
                            required
                            value={configGeral.documentosAjudaSubtitulo || ''}
                            onChange={(e) => setConfigGeral({ ...configGeral, documentosAjudaSubtitulo: e.target.value })}
                            className="w-full bg-white dark:bg-slate-800 text-xs border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-slate-100 focus:outline-hidden font-medium resize-none"
                          />
                        </div>
                      </div>

                      {/* Card de Ajuda de Fornecedores */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50/50 dark:bg-slate-800/10 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                        <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 md:col-span-3">Card de Dúvida / Rodapé de Fornecedores (ISO 8.4)</span>
                        <div className="space-y-1 md:col-span-1">
                          <label className="text-[9px] font-bold text-slate-500">Pergunta / Título do Banner</label>
                          <input
                            type="text"
                            required
                            value={configGeral.fornecedoresAjudaTitulo || ''}
                            onChange={(e) => setConfigGeral({ ...configGeral, fornecedoresAjudaTitulo: e.target.value })}
                            className="w-full bg-white dark:bg-slate-800 text-xs border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-slate-100 focus:outline-hidden font-medium"
                          />
                        </div>
                        <div className="space-y-1 md:col-span-2">
                          <label className="text-[9px] font-bold text-slate-500">Resposta / Explicação Detalhada</label>
                          <textarea
                            rows={2}
                            required
                            value={configGeral.fornecedoresAjudaSubtitulo || ''}
                            onChange={(e) => setConfigGeral({ ...configGeral, fornecedoresAjudaSubtitulo: e.target.value })}
                            className="w-full bg-white dark:bg-slate-800 text-xs border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-slate-100 focus:outline-hidden font-medium resize-none"
                          />
                        </div>
                      </div>

                      {/* Card de Ajuda de Planos de Ação */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50/50 dark:bg-slate-800/10 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                        <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 md:col-span-3">Card de Dúvida / Rodapé de Planos de Ação 5W2H (ISO 10.2)</span>
                        <div className="space-y-1 md:col-span-1">
                          <label className="text-[9px] font-bold text-slate-500">Pergunta / Título do Banner</label>
                          <input
                            type="text"
                            required
                            value={configGeral.planosAjudaTitulo || ''}
                            onChange={(e) => setConfigGeral({ ...configGeral, planosAjudaTitulo: e.target.value })}
                            className="w-full bg-white dark:bg-slate-800 text-xs border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-slate-100 focus:outline-hidden font-medium"
                          />
                        </div>
                        <div className="space-y-1 md:col-span-2">
                          <label className="text-[9px] font-bold text-slate-500">Resposta / Explicação Detalhada</label>
                          <textarea
                            rows={2}
                            required
                            value={configGeral.planosAjudaSubtitulo || ''}
                            onChange={(e) => setConfigGeral({ ...configGeral, planosAjudaSubtitulo: e.target.value })}
                            className="w-full bg-white dark:bg-slate-800 text-xs border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-slate-100 focus:outline-hidden font-medium resize-none"
                          />
                        </div>
                      </div>

                      {/* Card de Ajuda de Registros */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50/50 dark:bg-slate-800/10 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                        <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 md:col-span-3">Card de Dúvida / Rodapé de Registros (ISO 7.5.3)</span>
                        <div className="space-y-1 md:col-span-1">
                          <label className="text-[9px] font-bold text-slate-500">Pergunta / Título do Banner</label>
                          <input
                            type="text"
                            required
                            value={configGeral.registrosAjudaTitulo || ''}
                            onChange={(e) => setConfigGeral({ ...configGeral, registrosAjudaTitulo: e.target.value })}
                            className="w-full bg-white dark:bg-slate-800 text-xs border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-slate-100 focus:outline-hidden font-medium"
                          />
                        </div>
                        <div className="space-y-1 md:col-span-2">
                          <label className="text-[9px] font-bold text-slate-500">Resposta / Explicação Detalhada</label>
                          <textarea
                            rows={2}
                            required
                            value={configGeral.registrosAjudaSubtitulo || ''}
                            onChange={(e) => setConfigGeral({ ...configGeral, registrosAjudaSubtitulo: e.target.value })}
                            className="w-full bg-white dark:bg-slate-800 text-xs border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-slate-100 focus:outline-hidden font-medium resize-none"
                          />
                        </div>
                      </div>

                      {/* Card de Ajuda de Riscos */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50/50 dark:bg-slate-800/10 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                        <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 md:col-span-3">Card de Dúvida / Rodapé de Riscos e Oportunidades (ISO 6.1)</span>
                        <div className="space-y-1 md:col-span-1">
                          <label className="text-[9px] font-bold text-slate-500">Pergunta / Título do Banner</label>
                          <input
                            type="text"
                            required
                            value={configGeral.riscosAjudaTitulo || ''}
                            onChange={(e) => setConfigGeral({ ...configGeral, riscosAjudaTitulo: e.target.value })}
                            className="w-full bg-white dark:bg-slate-800 text-xs border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-slate-100 focus:outline-hidden font-medium"
                          />
                        </div>
                        <div className="space-y-1 md:col-span-2">
                          <label className="text-[9px] font-bold text-slate-500">Resposta / Explicação Detalhada</label>
                          <textarea
                            rows={2}
                            required
                            value={configGeral.riscosAjudaSubtitulo || ''}
                            onChange={(e) => setConfigGeral({ ...configGeral, riscosAjudaSubtitulo: e.target.value })}
                            className="w-full bg-white dark:bg-slate-800 text-xs border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-slate-100 focus:outline-hidden font-medium resize-none"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Grupo 4: Painel Institucional da Tela de Login */}
                  <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider pb-1.5 flex items-center justify-between">
                      <span>4. Painel Institucional (Tela de Login)</span>
                      <span className="text-[9px] font-mono lowercase bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full font-bold">
                        Apresentação Esquerda Customizável
                      </span>
                    </h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-1 md:col-span-1">
                        <label className="text-[10px] font-bold text-slate-500">Badge Superior</label>
                        <input
                          type="text"
                          required
                          value={configGeral.loginBadge || ''}
                          onChange={(e) => setConfigGeral({ ...configGeral, loginBadge: e.target.value })}
                          className="w-full bg-slate-50 dark:bg-slate-800 text-xs border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-slate-800 dark:text-slate-100 focus:outline-hidden font-medium"
                        />
                      </div>
                      
                      <div className="space-y-1 md:col-span-2">
                        <label className="text-[10px] font-bold text-slate-500">Título Principal</label>
                        <input
                          type="text"
                          required
                          value={configGeral.loginTitulo || ''}
                          onChange={(e) => setConfigGeral({ ...configGeral, loginTitulo: e.target.value })}
                          className="w-full bg-slate-50 dark:bg-slate-800 text-xs border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-slate-800 dark:text-slate-100 focus:outline-hidden font-medium"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500">Descrição Detalhada do Painel</label>
                      <textarea
                        rows={3}
                        required
                        value={configGeral.loginDescricao || ''}
                        onChange={(e) => setConfigGeral({ ...configGeral, loginDescricao: e.target.value })}
                        className="w-full bg-slate-50 dark:bg-slate-800 text-xs border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-slate-800 dark:text-slate-100 focus:outline-hidden font-medium resize-none"
                      />
                    </div>

                    <div className="space-y-3 pt-2">
                      <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block">Checklist de Vantagens e Recursos (4 Itens)</span>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Item 1 */}
                        <div className="bg-slate-50/50 dark:bg-slate-800/10 p-3 rounded-lg border border-slate-100 dark:border-slate-800 space-y-2">
                          <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 font-mono">Item 1 do Checklist</span>
                          <div className="space-y-1">
                            <label className="text-[9px] font-bold text-slate-500">Título</label>
                            <input
                              type="text"
                              required
                              value={configGeral.loginVantagem1Titulo || ''}
                              onChange={(e) => setConfigGeral({ ...configGeral, loginVantagem1Titulo: e.target.value })}
                              className="w-full bg-white dark:bg-slate-800 text-xs border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-slate-100 focus:outline-hidden font-medium"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] font-bold text-slate-500">Descrição Curta</label>
                            <input
                              type="text"
                              required
                              value={configGeral.loginVantagem1Desc || ''}
                              onChange={(e) => setConfigGeral({ ...configGeral, loginVantagem1Desc: e.target.value })}
                              className="w-full bg-white dark:bg-slate-800 text-xs border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-slate-100 focus:outline-hidden font-medium"
                            />
                          </div>
                        </div>

                        {/* Item 2 */}
                        <div className="bg-slate-50/50 dark:bg-slate-800/10 p-3 rounded-lg border border-slate-100 dark:border-slate-800 space-y-2">
                          <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 font-mono">Item 2 do Checklist</span>
                          <div className="space-y-1">
                            <label className="text-[9px] font-bold text-slate-500">Título</label>
                            <input
                              type="text"
                              required
                              value={configGeral.loginVantagem2Titulo || ''}
                              onChange={(e) => setConfigGeral({ ...configGeral, loginVantagem2Titulo: e.target.value })}
                              className="w-full bg-white dark:bg-slate-800 text-xs border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-slate-100 focus:outline-hidden font-medium"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] font-bold text-slate-500">Descrição Curta</label>
                            <input
                              type="text"
                              required
                              value={configGeral.loginVantagem2Desc || ''}
                              onChange={(e) => setConfigGeral({ ...configGeral, loginVantagem2Desc: e.target.value })}
                              className="w-full bg-white dark:bg-slate-800 text-xs border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-slate-100 focus:outline-hidden font-medium"
                            />
                          </div>
                        </div>

                        {/* Item 3 */}
                        <div className="bg-slate-50/50 dark:bg-slate-800/10 p-3 rounded-lg border border-slate-100 dark:border-slate-800 space-y-2">
                          <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 font-mono">Item 3 do Checklist</span>
                          <div className="space-y-1">
                            <label className="text-[9px] font-bold text-slate-500">Título</label>
                            <input
                              type="text"
                              required
                              value={configGeral.loginVantagem3Titulo || ''}
                              onChange={(e) => setConfigGeral({ ...configGeral, loginVantagem3Titulo: e.target.value })}
                              className="w-full bg-white dark:bg-slate-800 text-xs border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-slate-100 focus:outline-hidden font-medium"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] font-bold text-slate-500">Descrição Curta</label>
                            <input
                              type="text"
                              required
                              value={configGeral.loginVantagem3Desc || ''}
                              onChange={(e) => setConfigGeral({ ...configGeral, loginVantagem3Desc: e.target.value })}
                              className="w-full bg-white dark:bg-slate-800 text-xs border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-slate-100 focus:outline-hidden font-medium"
                            />
                          </div>
                        </div>

                        {/* Item 4 */}
                        <div className="bg-slate-50/50 dark:bg-slate-800/10 p-3 rounded-lg border border-slate-100 dark:border-slate-800 space-y-2">
                          <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 font-mono">Item 4 do Checklist</span>
                          <div className="space-y-1">
                            <label className="text-[9px] font-bold text-slate-500">Título</label>
                            <input
                              type="text"
                              required
                              value={configGeral.loginVantagem4Titulo || ''}
                              onChange={(e) => setConfigGeral({ ...configGeral, loginVantagem4Titulo: e.target.value })}
                              className="w-full bg-white dark:bg-slate-800 text-xs border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-slate-100 focus:outline-hidden font-medium"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] font-bold text-slate-500">Descrição Curta</label>
                            <input
                              type="text"
                              required
                              value={configGeral.loginVantagem4Desc || ''}
                              onChange={(e) => setConfigGeral({ ...configGeral, loginVantagem4Desc: e.target.value })}
                              className="w-full bg-white dark:bg-slate-800 text-xs border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-slate-100 focus:outline-hidden font-medium"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Grupo 5: Detalhes do Painel Direito, Suporte e Rodapés */}
                  <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider pb-1.5 flex items-center justify-between">
                      <span>5. Rodapés, Suporte TI & Detalhes da Tela de Login</span>
                      <span className="text-[9px] font-mono lowercase bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full font-bold">
                        Customização Total da Interface
                      </span>
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Títulos e Versão */}
                      <div className="bg-slate-50/50 dark:bg-slate-800/10 p-3 rounded-lg border border-slate-100 dark:border-slate-800 space-y-3">
                        <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 font-mono">Títulos da Coluna de Login</span>
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-slate-500">Título Principal (Painel Direito)</label>
                          <input
                            type="text"
                            required
                            value={configGeral.loginDireitaTitulo || ''}
                            onChange={(e) => setConfigGeral({ ...configGeral, loginDireitaTitulo: e.target.value })}
                            className="w-full bg-white dark:bg-slate-800 text-xs border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-slate-100 focus:outline-hidden font-medium"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-slate-500">Subtítulo (Painel Direito)</label>
                          <input
                            type="text"
                            required
                            value={configGeral.loginDireitaSubtitulo || ''}
                            onChange={(e) => setConfigGeral({ ...configGeral, loginDireitaSubtitulo: e.target.value })}
                            className="w-full bg-white dark:bg-slate-800 text-xs border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-slate-100 focus:outline-hidden font-medium"
                          />
                        </div>
                      </div>

                      {/* Configurações do Suporte TI */}
                      <div className="bg-slate-50/50 dark:bg-slate-800/10 p-3 rounded-lg border border-slate-100 dark:border-slate-800 space-y-3">
                        <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 font-mono">Central de Ajuda / Suporte TI (Popup Funcional)</span>
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-slate-500">Selo de Versão</label>
                          <input
                            type="text"
                            required
                            value={configGeral.loginVersaoTexto || ''}
                            onChange={(e) => setConfigGeral({ ...configGeral, loginVersaoTexto: e.target.value })}
                            className="w-full bg-white dark:bg-slate-800 text-xs border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-slate-100 focus:outline-hidden font-medium"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-slate-500">Título do Contato do Suporte</label>
                          <input
                            type="text"
                            required
                            value={configGeral.loginSuporteContatoTitulo || ''}
                            onChange={(e) => setConfigGeral({ ...configGeral, loginSuporteContatoTitulo: e.target.value })}
                            className="w-full bg-white dark:bg-slate-800 text-xs border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-slate-100 focus:outline-hidden font-medium"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-slate-500">Instruções de Suporte (Dentro do Modal)</label>
                          <textarea
                            rows={2}
                            required
                            value={configGeral.loginSuporteContatoTexto || ''}
                            onChange={(e) => setConfigGeral({ ...configGeral, loginSuporteContatoTexto: e.target.value })}
                            className="w-full bg-white dark:bg-slate-800 text-xs border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-slate-100 focus:outline-hidden font-medium resize-none"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Rodapé Coluna Esquerda */}
                      <div className="bg-slate-50/50 dark:bg-slate-800/10 p-3 rounded-lg border border-slate-100 dark:border-slate-800 space-y-2">
                        <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 font-mono">Rodapé do Painel Esquerdo (Marca)</span>
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-slate-500">Linha 1 (Copyright / S.A.)</label>
                          <input
                            type="text"
                            required
                            value={configGeral.loginFooterEsquerdoLinha1 || ''}
                            onChange={(e) => setConfigGeral({ ...configGeral, loginFooterEsquerdoLinha1: e.target.value })}
                            className="w-full bg-white dark:bg-slate-800 text-xs border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-slate-100 focus:outline-hidden font-medium"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-slate-500">Linha 2 (Subdiretrizes ISO)</label>
                          <input
                            type="text"
                            required
                            value={configGeral.loginFooterEsquerdoLinha2 || ''}
                            onChange={(e) => setConfigGeral({ ...configGeral, loginFooterEsquerdoLinha2: e.target.value })}
                            className="w-full bg-white dark:bg-slate-800 text-xs border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-slate-100 focus:outline-hidden font-medium"
                          />
                        </div>
                      </div>

                      {/* Rodapé Coluna Direita & Avisos */}
                      <div className="bg-slate-50/50 dark:bg-slate-800/10 p-3 rounded-lg border border-slate-100 dark:border-slate-800 space-y-2">
                        <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 font-mono">Rodapé do Painel Direito & Conformidade</span>
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-slate-500">Texto de Auditoria / Compliance (Centralizado)</label>
                          <input
                            type="text"
                            required
                            value={configGeral.loginComplianceTexto || ''}
                            onChange={(e) => setConfigGeral({ ...configGeral, loginComplianceTexto: e.target.value })}
                            className="w-full bg-white dark:bg-slate-800 text-xs border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-slate-100 focus:outline-hidden font-medium"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-slate-500">Texto do Rodapé Direito (Netlify Build, etc.)</label>
                          <input
                            type="text"
                            required
                            value={configGeral.loginFooterDireitoTexto || ''}
                            onChange={(e) => setConfigGeral({ ...configGeral, loginFooterDireitoTexto: e.target.value })}
                            className="w-full bg-white dark:bg-slate-800 text-xs border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-slate-100 focus:outline-hidden font-medium"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Botão de Envio */}
                  <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
                    <button
                      type="submit"
                      className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center space-x-2 transition-colors shadow-xs"
                    >
                      <Save className="w-4 h-4" />
                      <span>Salvar Todas as Configurações</span>
                    </button>
                  </div>

                </form>
              ) : (
                <p className="text-xs text-slate-400 italic">Você precisa ter permissões de Qualidade ou Gerência para editar as personalizações do sistema.</p>
              )}
            </div>
          )}

          {/* SECTION: FORNECEDORES CATEGORIAS */}
          {activeSubTab === 'fornecedores_cats' && (
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-6 animate-fade-in">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-100">Categorias de Fornecedores</h3>
                  <p className="text-xs text-slate-400">Gerencie os tipos de insumos e prestações de serviços oferecidos pelos fornecedores.</p>
                </div>
                <span className="text-[10px] font-mono bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full font-bold">
                  {fornecedoresCategorias.length} Categorias Cadastradas
                </span>
              </div>

              {canModify ? (
                <form onSubmit={handleAddFornecedoresCat} className="flex gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Ex: Embalagens, Matéria-Prima Têxtil, Serviços de Tinturaria..."
                    value={newFornecedoresCat}
                    onChange={(e) => setNewFornecedoresCat(e.target.value)}
                    className="flex-1 bg-slate-50 dark:bg-slate-800 text-xs border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-800 dark:text-slate-100 focus:outline-hidden"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-colors shrink-0 shadow-xs"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Adicionar Categoria</span>
                  </button>
                </form>
              ) : (
                <p className="text-xs text-slate-400 italic">Você precisa ter permissões de Qualidade ou Gerência para adicionar categorias.</p>
              )}

              <div className="overflow-hidden border border-slate-100 dark:border-slate-800 rounded-lg">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-950/20 text-slate-400 font-bold border-b border-slate-100 dark:border-slate-800">
                      <th className="py-2.5 px-4">Nome da Categoria</th>
                      <th className="py-2.5 px-4 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                    {fornecedoresCategorias.map((cat, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10">
                        <td className="py-3 px-4 text-slate-800 dark:text-slate-200">
                          {editingFornecedoresCatIdx === idx ? (
                            <input
                              type="text"
                              value={editingFornecedoresCatVal}
                              onChange={(e) => setEditingFornecedoresCatVal(e.target.value)}
                              className="bg-slate-50 dark:bg-slate-800 text-xs border border-slate-200 dark:border-slate-700 rounded-md px-2 py-1 text-slate-800 dark:text-slate-100 focus:outline-hidden"
                            />
                          ) : (
                            <span>{cat}</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          {canModify ? (
                            <div className="flex items-center justify-end space-x-2">
                              {editingFornecedoresCatIdx === idx ? (
                                <>
                                  <button
                                    onClick={() => handleSaveFornecedoresCat(idx)}
                                    className="p-1 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 text-emerald-600 rounded transition-colors"
                                    title="Salvar"
                                  >
                                    <CheckCircle2 className="w-4.5 h-4.5" />
                                  </button>
                                  <button
                                    onClick={() => setEditingFornecedoresCatIdx(null)}
                                    className="p-1 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-rose-500 rounded transition-colors"
                                    title="Cancelar"
                                  >
                                    <X className="w-4.5 h-4.5" />
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button
                                    type="button"
                                    disabled={idx === 0}
                                    onClick={() => handleMoveFornecedoresCat(idx, 'up')}
                                    className="p-1 text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-20 disabled:hover:bg-transparent rounded transition-colors"
                                    title="Mover para cima"
                                  >
                                    <ArrowUp className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    disabled={idx === fornecedoresCategorias.length - 1}
                                    onClick={() => handleMoveFornecedoresCat(idx, 'down')}
                                    className="p-1 text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-20 disabled:hover:bg-transparent rounded transition-colors"
                                    title="Mover para baixo"
                                  >
                                    <ArrowDown className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => {
                                      setEditingFornecedoresCatIdx(idx);
                                      setEditingFornecedoresCatVal(cat);
                                    }}
                                    className="text-slate-400 hover:text-blue-600 p-1 hover:bg-slate-50 dark:hover:bg-slate-800 rounded transition-colors"
                                    title="Editar Categoria"
                                  >
                                    <Pencil className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteFornecedoresCat(idx)}
                                    className="text-slate-400 hover:text-rose-600 p-1 hover:bg-slate-50 dark:hover:bg-slate-800 rounded transition-colors"
                                    title="Excluir Categoria"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </>
                              )}
                            </div>
                          ) : (
                            <span className="text-slate-400 italic">Sem permissão</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* SECTION: CALIBRAÇÃO INSTRUMENTOS */}
          {activeSubTab === 'calibracao_instrumentos' && (
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-6 animate-fade-in">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-100">Tipos de Instrumentos de Medição</h3>
                  <p className="text-xs text-slate-400">Cadastre as tipologias de instrumentos que requerem calibração periódica (ISO 7.1.5).</p>
                </div>
                <span className="text-[10px] font-mono bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full font-bold">
                  {calibracaoTipos.length} Tipos Cadastrados
                </span>
              </div>

              {canModify ? (
                <form onSubmit={handleAddCalibracaoTipo} className="flex gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Ex: Balança de Precisão, Termômetro Digital, Paquímetro..."
                    value={newCalibracaoTipo}
                    onChange={(e) => setNewCalibracaoTipo(e.target.value)}
                    className="flex-1 bg-slate-50 dark:bg-slate-800 text-xs border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-800 dark:text-slate-100 focus:outline-hidden"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-colors shrink-0 shadow-xs"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Adicionar Tipo</span>
                  </button>
                </form>
              ) : (
                <p className="text-xs text-slate-400 italic">Você precisa ter permissões de Qualidade ou Gerência para adicionar tipos de instrumentos.</p>
              )}

              <div className="overflow-hidden border border-slate-100 dark:border-slate-800 rounded-lg">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-950/20 text-slate-400 font-bold border-b border-slate-100 dark:border-slate-800">
                      <th className="py-2.5 px-4">Nome do Tipo</th>
                      <th className="py-2.5 px-4 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                    {calibracaoTipos.map((tipo, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10">
                        <td className="py-3 px-4 text-slate-800 dark:text-slate-200">
                          {editingCalibracaoTipoIdx === idx ? (
                            <input
                              type="text"
                              value={editingCalibracaoTipoVal}
                              onChange={(e) => setEditingCalibracaoTipoVal(e.target.value)}
                              className="bg-slate-50 dark:bg-slate-800 text-xs border border-slate-200 dark:border-slate-700 rounded-md px-2 py-1 text-slate-800 dark:text-slate-100 focus:outline-hidden"
                            />
                          ) : (
                            <span>{tipo}</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          {canModify ? (
                            <div className="flex items-center justify-end space-x-2">
                              {editingCalibracaoTipoIdx === idx ? (
                                <>
                                  <button
                                    onClick={() => handleSaveCalibracaoTipo(idx)}
                                    className="p-1 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 text-emerald-600 rounded transition-colors"
                                    title="Salvar"
                                  >
                                    <CheckCircle2 className="w-4.5 h-4.5" />
                                  </button>
                                  <button
                                    onClick={() => setEditingCalibracaoTipoIdx(null)}
                                    className="p-1 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-rose-500 rounded transition-colors"
                                    title="Cancelar"
                                  >
                                    <X className="w-4.5 h-4.5" />
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button
                                    type="button"
                                    disabled={idx === 0}
                                    onClick={() => handleMoveCalibracaoTipo(idx, 'up')}
                                    className="p-1 text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-20 disabled:hover:bg-transparent rounded transition-colors"
                                    title="Mover para cima"
                                  >
                                    <ArrowUp className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    disabled={idx === calibracaoTipos.length - 1}
                                    onClick={() => handleMoveCalibracaoTipo(idx, 'down')}
                                    className="p-1 text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-20 disabled:hover:bg-transparent rounded transition-colors"
                                    title="Mover para baixo"
                                  >
                                    <ArrowDown className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => {
                                      setEditingCalibracaoTipoIdx(idx);
                                      setEditingCalibracaoTipoVal(tipo);
                                    }}
                                    className="text-slate-400 hover:text-blue-600 p-1 hover:bg-slate-50 dark:hover:bg-slate-800 rounded transition-colors"
                                    title="Editar Tipo"
                                  >
                                    <Pencil className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteCalibracaoTipo(idx)}
                                    className="text-slate-400 hover:text-rose-600 p-1 hover:bg-slate-50 dark:hover:bg-slate-800 rounded transition-colors"
                                    title="Excluir Tipo"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </>
                              )}
                            </div>
                          ) : (
                            <span className="text-slate-400 italic">Sem permissão</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* SECTION: AUDITORIAS ORIGENS */}
          {activeSubTab === 'auditorias_origens' && (
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-6 animate-fade-in">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-100">Origens de Não Conformidades & Ocorrências</h3>
                  <p className="text-xs text-slate-400">Configure as origens padrão para rastreamento de desvios e ações corretivas.</p>
                </div>
                <span className="text-[10px] font-mono bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full font-bold">
                  {auditoriasOrigens.length} Origens Cadastradas
                </span>
              </div>

              {canModify ? (
                <form onSubmit={handleAddAuditoriasOrigem} className="flex gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Ex: Reclamação de Cliente, Auditoria Interna, Desvio de Processo..."
                    value={newAuditoriasOrigem}
                    onChange={(e) => setNewAuditoriasOrigem(e.target.value)}
                    className="flex-1 bg-slate-50 dark:bg-slate-800 text-xs border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-800 dark:text-slate-100 focus:outline-hidden"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-colors shrink-0 shadow-xs"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Adicionar Origem</span>
                  </button>
                </form>
              ) : (
                <p className="text-xs text-slate-400 italic">Você precisa ter permissões de Qualidade ou Gerência para adicionar origens.</p>
              )}

              <div className="overflow-hidden border border-slate-100 dark:border-slate-800 rounded-lg">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-950/20 text-slate-400 font-bold border-b border-slate-100 dark:border-slate-800">
                      <th className="py-2.5 px-4">Nome da Origem</th>
                      <th className="py-2.5 px-4 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                    {auditoriasOrigens.map((origem, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10">
                        <td className="py-3 px-4 text-slate-800 dark:text-slate-200">
                          {editingAuditoriasOrigemIdx === idx ? (
                            <input
                              type="text"
                              value={editingAuditoriasOrigemVal}
                              onChange={(e) => setEditingAuditoriasOrigemVal(e.target.value)}
                              className="bg-slate-50 dark:bg-slate-800 text-xs border border-slate-200 dark:border-slate-700 rounded-md px-2 py-1 text-slate-800 dark:text-slate-100 focus:outline-hidden"
                            />
                          ) : (
                            <span>{origem}</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          {canModify ? (
                            <div className="flex items-center justify-end space-x-2">
                              {editingAuditoriasOrigemIdx === idx ? (
                                <>
                                  <button
                                    onClick={() => handleSaveAuditoriasOrigem(idx)}
                                    className="p-1 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 text-emerald-600 rounded transition-colors"
                                    title="Salvar"
                                  >
                                    <CheckCircle2 className="w-4.5 h-4.5" />
                                  </button>
                                  <button
                                    onClick={() => setEditingAuditoriasOrigemIdx(null)}
                                    className="p-1 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-rose-500 rounded transition-colors"
                                    title="Cancelar"
                                  >
                                    <X className="w-4.5 h-4.5" />
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button
                                    type="button"
                                    disabled={idx === 0}
                                    onClick={() => handleMoveAuditoriasOrigem(idx, 'up')}
                                    className="p-1 text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-20 disabled:hover:bg-transparent rounded transition-colors"
                                    title="Mover para cima"
                                  >
                                    <ArrowUp className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    disabled={idx === auditoriasOrigens.length - 1}
                                    onClick={() => handleMoveAuditoriasOrigem(idx, 'down')}
                                    className="p-1 text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-20 disabled:hover:bg-transparent rounded transition-colors"
                                    title="Mover para baixo"
                                  >
                                    <ArrowDown className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => {
                                      setEditingAuditoriasOrigemIdx(idx);
                                      setEditingAuditoriasOrigemVal(origem);
                                    }}
                                    className="text-slate-400 hover:text-blue-600 p-1 hover:bg-slate-50 dark:hover:bg-slate-800 rounded transition-colors"
                                    title="Editar Origem"
                                  >
                                    <Pencil className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteAuditoriasOrigem(idx)}
                                    className="text-slate-400 hover:text-rose-600 p-1 hover:bg-slate-50 dark:hover:bg-slate-800 rounded transition-colors"
                                    title="Excluir Origem"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </>
                              )}
                            </div>
                          ) : (
                            <span className="text-slate-400 italic">Sem permissão</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* SECTION: RISCOS CATEGORIAS */}
          {activeSubTab === 'riscos_categorias' && (
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-6 animate-fade-in">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-100">Categorias de Riscos & Oportunidades</h3>
                  <p className="text-xs text-slate-400">Configure as categorias para enquadramento da matriz de riscos e tratamentos estratégicos.</p>
                </div>
                <span className="text-[10px] font-mono bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full font-bold">
                  {riscosCategorias.length} Categorias Cadastradas
                </span>
              </div>

              {canModify ? (
                <form onSubmit={handleAddRiscosCategoria} className="flex gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Ex: Operacional, Regulatório, Financeiro, Ambiental..."
                    value={newRiscosCategoria}
                    onChange={(e) => setNewRiscosCategoria(e.target.value)}
                    className="flex-1 bg-slate-50 dark:bg-slate-800 text-xs border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-800 dark:text-slate-100 focus:outline-hidden"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-colors shrink-0 shadow-xs"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Adicionar Categoria</span>
                  </button>
                </form>
              ) : (
                <p className="text-xs text-slate-400 italic">Você precisa ter permissões de Qualidade ou Gerência para adicionar categorias de risco.</p>
              )}

              <div className="overflow-hidden border border-slate-100 dark:border-slate-800 rounded-lg">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-950/20 text-slate-400 font-bold border-b border-slate-100 dark:border-slate-800">
                      <th className="py-2.5 px-4">Nome da Categoria</th>
                      <th className="py-2.5 px-4 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                    {riscosCategorias.map((riscoCat, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10">
                        <td className="py-3 px-4 text-slate-800 dark:text-slate-200">
                          {editingRiscosCategoriaIdx === idx ? (
                            <input
                              type="text"
                              value={editingRiscosCategoriaVal}
                              onChange={(e) => setEditingRiscosCategoriaVal(e.target.value)}
                              className="bg-slate-50 dark:bg-slate-800 text-xs border border-slate-200 dark:border-slate-700 rounded-md px-2 py-1 text-slate-800 dark:text-slate-100 focus:outline-hidden"
                            />
                          ) : (
                            <span>{riscoCat}</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          {canModify ? (
                            <div className="flex items-center justify-end space-x-2">
                              {editingRiscosCategoriaIdx === idx ? (
                                <>
                                  <button
                                    onClick={() => handleSaveRiscosCategoria(idx)}
                                    className="p-1 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 text-emerald-600 rounded transition-colors"
                                    title="Salvar"
                                  >
                                    <CheckCircle2 className="w-4.5 h-4.5" />
                                  </button>
                                  <button
                                    onClick={() => setEditingRiscosCategoriaIdx(null)}
                                    className="p-1 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-rose-500 rounded transition-colors"
                                    title="Cancelar"
                                  >
                                    <X className="w-4.5 h-4.5" />
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button
                                    type="button"
                                    disabled={idx === 0}
                                    onClick={() => handleMoveRiscosCategoria(idx, 'up')}
                                    className="p-1 text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-20 disabled:hover:bg-transparent rounded transition-colors"
                                    title="Mover para cima"
                                  >
                                    <ArrowUp className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    disabled={idx === riscosCategorias.length - 1}
                                    onClick={() => handleMoveRiscosCategoria(idx, 'down')}
                                    className="p-1 text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-20 disabled:hover:bg-transparent rounded transition-colors"
                                    title="Mover para baixo"
                                  >
                                    <ArrowDown className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => {
                                      setEditingRiscosCategoriaIdx(idx);
                                      setEditingRiscosCategoriaVal(riscoCat);
                                    }}
                                    className="text-slate-400 hover:text-blue-600 p-1 hover:bg-slate-50 dark:hover:bg-slate-800 rounded transition-colors"
                                    title="Editar Categoria"
                                  >
                                    <Pencil className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteRiscosCategoria(idx)}
                                    className="text-slate-400 hover:text-rose-600 p-1 hover:bg-slate-50 dark:hover:bg-slate-800 rounded transition-colors"
                                    title="Excluir Categoria"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </>
                              )}
                            </div>
                          ) : (
                            <span className="text-slate-400 italic">Sem permissão</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* MODAL DE CONFIRMAÇÃO DE EXCLUSÃO DE SETOR */}
      {sectorToDeleteIdx !== null && (
        <div id="delete-sector-modal-overlay" className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div id="delete-sector-modal-content" className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center space-x-3 pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="p-2.5 bg-rose-500/10 text-rose-600 rounded-full shrink-0">
                <Settings className="w-6 h-6 text-rose-600 animate-pulse" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-100">
                  Excluir Setor Auxiliar
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Configurações Gerais - Organização</p>
              </div>
            </div>
            
            <div className="space-y-3">
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Você tem certeza que deseja remover o setor:
                <strong className="text-slate-950 dark:text-white font-bold block mt-1 text-sm bg-slate-50 dark:bg-slate-800 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-750 font-mono">
                  {sectors[sectorToDeleteIdx]}
                </strong>
              </p>
              <p className="text-[11px] text-rose-600 dark:text-rose-400 font-semibold bg-rose-500/5 p-2.5 rounded-lg border border-rose-500/10">
                Nota: Documentos, Treinamentos ou Instrumentos vinculados a este setor continuarão com a referência, mas ele não aparecerá em novos filtros ou seleções.
              </p>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setSectorToDeleteIdx(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-bold transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  const sectorName = sectors[sectorToDeleteIdx];
                  const updated = sectors.filter((_, i) => i !== sectorToDeleteIdx);
                  setSectors(updated);
                  saveSettingToFirestore('sgq_vickytex_setores', updated);
                  onAddLog('Configurações', `Excluiu o setor auxiliar "${sectorName}" das listas do sistema.`);
                  setShowSyncNotice(true);
                  setSectorToDeleteIdx(null);
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition-colors shadow-xs"
              >
                Sim, Excluir Setor
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE CONFIRMAÇÃO DE EXCLUSÃO DE TIPO DOCUMENTAL */}
      {docTypeToDeleteIdx !== null && (
        <div id="delete-doctype-modal-overlay" className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div id="delete-doctype-modal-content" className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center space-x-3 pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="p-2.5 bg-rose-500/10 text-rose-600 rounded-full shrink-0">
                <Settings className="w-6 h-6 text-rose-600 animate-pulse" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-100">
                  Excluir Tipo Documental
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Configurações Gerais - Tipologias</p>
              </div>
            </div>
            
            <div className="space-y-3">
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Você tem certeza que deseja remover este tipo documental:
                <strong className="text-slate-950 dark:text-white font-bold block mt-1 text-sm bg-slate-50 dark:bg-slate-800 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-750 font-mono">
                  {docTypes[docTypeToDeleteIdx].type} - {docTypes[docTypeToDeleteIdx].name}
                </strong>
              </p>
              <p className="text-[11px] text-rose-600 dark:text-rose-400 font-semibold bg-rose-500/5 p-2.5 rounded-lg border border-rose-500/10">
                Nota: Documentos com este tipo cadastrado permanecerão intactos, mas esta sigla não estará disponível para novas criações.
              </p>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setDocTypeToDeleteIdx(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-bold transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  const typeObj = docTypes[docTypeToDeleteIdx];
                  const updated = docTypes.filter((_, i) => i !== docTypeToDeleteIdx);
                  setDocTypes(updated);
                  saveSettingToFirestore('sgq_vickytex_tipos_documentos', updated);
                  onAddLog('Configurações', `Removeu o tipo documental "${typeObj.type}" do cadastro.`);
                  setShowSyncNotice(true);
                  setDocTypeToDeleteIdx(null);
                }}

                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition-colors shadow-xs"
              >
                Sim, Excluir Tipo
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
