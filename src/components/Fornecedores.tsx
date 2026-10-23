/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Truck, 
  Search, 
  Plus, 
  Filter, 
  Trash2, 
  Edit3, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Clock, 
  TrendingUp, 
  User, 
  Mail, 
  Phone, 
  FileText, 
  Calendar, 
  Star, 
  Award, 
  ShieldAlert, 
  ArrowLeft,
  X,
  PlusCircle,
  HelpCircle,
  RefreshCw,
  Download,
  Printer,
  Bell,
  Trophy,
  ClipboardCheck,
  FileWarning,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Layers,
  Eye
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Fornecedor, 
  AvaliacaoFornecedor, 
  InspecaoLoteFornecedor, 
  OcorrenciaRNCFornecedor, 
  PlanoAcaoFornecedor, 
  DocumentoFornecedor, 
  AuditoriaFornecedor, 
  BloqueioHistorico 
} from '../types';
import { INITIAL_FORNECEDORES } from '../utils/mockData';
import { SupplierRepository } from '../services/database/repositories/supplier.repository';
import { SystemSettingsRepository } from '../services/database/repositories/systemSettings.repository';
import { useModulePermission } from '../utils/permissionManager';
import { 
  calcularEstatisticasReaisFornecedor, 
  criarAvaliacaoAutomaticaPorDadosReais,
  extrairAlertasFornecedor,
  exportarFornecedoresCSV,
  calcularProximaReavaliacao
} from '../utils/supplierEvaluationEngine';

// Subcomponentes Modulares
import { FornecedorModalDetalhes } from './Fornecedores/FornecedorModalDetalhes';
import { FornecedorModalCadastro } from './Fornecedores/FornecedorModalCadastro';
import { FornecedorModalInspecao } from './Fornecedores/FornecedorModalInspecao';
import { FornecedorModalAvaliacao } from './Fornecedores/FornecedorModalAvaliacao';
import { FornecedorModalRNC } from './Fornecedores/FornecedorModalRNC';
import { FornecedorModalDocumento } from './Fornecedores/FornecedorModalDocumento';
import { FornecedorModalAuditoria } from './Fornecedores/FornecedorModalAuditoria';
import { FornecedorModalBloqueio } from './Fornecedores/FornecedorModalBloqueio';
import { FornecedorFichaImpressao } from './Fornecedores/FornecedorFichaImpressao';
import { FornecedorRankingDashboard } from './Fornecedores/FornecedorRankingDashboard';
import { FornecedorAlertasCentral } from './Fornecedores/FornecedorAlertasCentral';

interface FornecedoresProps {
  onAddLog: (action: string, details: string) => void;
  personalizacao?: any;
}

export const Fornecedores: React.FC<FornecedoresProps> = ({ onAddLog, personalizacao }) => {
  const {
    canCreate,
    canEdit,
    canDelete,
    canModifyItem,
    canDeleteItem
  } = useModulePermission('fornecedores');

  // Estado principal de fornecedores
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>(() => {
    return import.meta.env.VITE_DEMO_MODE === 'true' ? INITIAL_FORNECEDORES : [];
  });

  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ type, text });
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  // Carregar e sincronizar com SupplierRepository
  useEffect(() => {
    let isSubscribed = true;
    const sanitizeSupplier = (f: Fornecedor): Fornecedor => {
      const totalLotes = (f.historicoInspecoes || []).length;
      const temAvaliacaoManual = (f.historicoAvaliacoes || []).some(a => !a.alimentadoPorDadosReais);
      const foiHomologadoManualmente = f.qualificacaoInicial?.statusFinal === 'Aprovado';
      
      // Se não possui nenhum lote inspecionado e nunca foi qualificado por homologação manual,
      // limpa notas espúrias e avaliações auto-geradas indevidamente sem lotes
      if (totalLotes === 0 && !temAvaliacaoManual && !foiHomologadoManualmente) {
        const historicoLimpo = (f.historicoAvaliacoes || []).filter(
          a => !a.alimentadoPorDadosReais || (a.estatisticasCalculadas?.totalLotesInspecionados || 0) > 0
        );
        const statusCorrigido = f.statusQualificacao === 'Bloqueado' ? 'Bloqueado' : 'Em Avaliação';
        return {
          ...f,
          notaAvaliacao: undefined,
          statusQualificacao: statusCorrigido,
          historicoAvaliacoes: historicoLimpo
        };
      }
      return f;
    };

    const deduplicateSuppliers = (list: Fornecedor[]): Fornecedor[] => {
      const seenIds = new Set<string>();
      const seenCnpjs = new Set<string>();
      return list.map(sanitizeSupplier).filter(f => {
        if (!f || !f.id || seenIds.has(f.id)) return false;
        const cleanCnpj = f.cnpj?.replace(/\D/g, '');
        if (cleanCnpj && seenCnpjs.has(cleanCnpj)) return false;
        seenIds.add(f.id);
        if (cleanCnpj) seenCnpjs.add(cleanCnpj);
        return true;
      });
    };

    const fetchSuppliers = async () => {
      try {
        const res = await SupplierRepository.findAll();
        if (res.success && res.data && isSubscribed) {
          setFornecedores(deduplicateSuppliers(res.data));
        }
      } catch (err) {
        console.error('Erro ao buscar fornecedores do repositório:', err);
      }
    };
    fetchSuppliers();

    const unsub = SupplierRepository.subscribe((items) => {
      if (Array.isArray(items) && isSubscribed) {
        const deduped = deduplicateSuppliers(items);
        setFornecedores(deduped);
        setSelectedSupplier((prev) => {
          if (!prev) return null;
          const found = deduped.find((it) => it.id === prev.id);
          return found || null;
        });
      }
    });

    return () => {
      isSubscribed = false;
      unsub();
    };
  }, []);

  // Categorias Têxteis configuráveis no SGQ
  const [categorias, setCategorias] = useState<string[]>([
    "Malharias e Tinturarias",
    "Facções e Oficinas de Costura",
    "Estamparias e Bordados",
    "Insumos e Aviamentos",
    "Fios e Fibras",
    "Produtos Químicos",
    "Embalagens",
    "Manutenção",
    "Calibração",
    "Outros"
  ]);

  useEffect(() => {
    const unsub = SystemSettingsRepository.subscribe((records) => {
      const found = records.find(r => r.id === 'sgq_vickytex_fornecedores_categorias');
      if (found && Array.isArray(found.items)) {
        setCategorias(found.items);
      }
    });
    return () => unsub();
  }, []);

  // Visão Ativa do Módulo
  const [visaoAtiva, setVisaoAtiva] = useState<'lista' | 'ranking' | 'alertas'>('lista');

  // Filtros de Busca
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoria, setSelectedCategoria] = useState<string>('todos');
  const [selectedCriticidade, setSelectedCriticidade] = useState<string>('todos');
  const [selectedStatus, setSelectedStatus] = useState<string>('todos');

  // Modais de Controle
  const [selectedSupplier, setSelectedSupplier] = useState<Fornecedor | null>(null);
  const [supplierToEdit, setSupplierToEdit] = useState<Fornecedor | null>(null);
  const [isAddingSupplier, setIsAddingSupplier] = useState(false);
  const [supplierForInspecao, setSupplierForInspecao] = useState<Fornecedor | null>(null);
  const [supplierForAvaliacao, setSupplierForAvaliacao] = useState<Fornecedor | null>(null);
  const [supplierForRNC, setSupplierForRNC] = useState<Fornecedor | null>(null);
  const [supplierForDocumento, setSupplierForDocumento] = useState<Fornecedor | null>(null);
  const [supplierForAuditoria, setSupplierForAuditoria] = useState<Fornecedor | null>(null);
  const [supplierForBloqueio, setSupplierForBloqueio] = useState<Fornecedor | null>(null);
  const [supplierForImpressao, setSupplierForImpressao] = useState<Fornecedor | null>(null);
  const [supplierToDelete, setSupplierToDelete] = useState<{ id: string; name: string } | null>(null);

  // Filtragem dos fornecedores
  const filteredFornecedores = useMemo(() => {
    return fornecedores.filter(f => {
      const q = searchQuery.toLowerCase();
      const matchesSearch = 
        (f.nomeFantasia && f.nomeFantasia.toLowerCase().includes(q)) ||
        (f.razaoSocial && f.razaoSocial.toLowerCase().includes(q)) ||
        (f.cnpj && f.cnpj.includes(q)) ||
        (f.contatoNome && f.contatoNome.toLowerCase().includes(q)) ||
        (f.categoria && f.categoria.toLowerCase().includes(q)) ||
        (Array.isArray(f.produtosServicosFornecidos) && f.produtosServicosFornecidos.some(p => p.toLowerCase().includes(q)));

      const matchesCategory = selectedCategoria === 'todos' || f.categoria === selectedCategoria;
      const matchesCriticidade = selectedCriticidade === 'todos' || f.criticidade === selectedCriticidade;
      const matchesStatus = selectedStatus === 'todos' || f.statusQualificacao === selectedStatus;

      return matchesSearch && matchesCategory && matchesCriticidade && matchesStatus;
    });
  }, [fornecedores, searchQuery, selectedCategoria, selectedCriticidade, selectedStatus]);

  // Estatísticas e Alertas Globais da Base
  const totalFornecedores = fornecedores.length;
  const qualificadosCount = fornecedores.filter(f => f.statusQualificacao === 'Qualificado').length;
  const restricaoCount = fornecedores.filter(f => f.statusQualificacao === 'Qualificado com Restrições').length;
  const bloqueadosCount = fornecedores.filter(f => f.statusQualificacao === 'Bloqueado').length;
  
  // Total de alertas globais
  const todosAlertas = useMemo(() => {
    return fornecedores.flatMap(f => extrairAlertasFornecedor(f));
  }, [fornecedores]);

  // Média Geral do IQF
  const mediaIQFBase = useMemo(() => {
    if (fornecedores.length === 0) return 0;
    const soma = fornecedores.reduce((acc, f) => {
      const stats = calcularEstatisticasReaisFornecedor(f);
      return acc + stats.iqfGeral;
    }, 0);
    return Math.round(soma / fornecedores.length);
  }, [fornecedores]);

  // --------------------------------------------------------------------------
  // HANDLERS DE PERSISTÊNCIA & AÇÕES DO CICLO COMPLETO
  // --------------------------------------------------------------------------

  // 1. Salvar / Atualizar Fornecedor
  const handleSaveSupplier = async (fornecedorSalvo: Fornecedor) => {
    try {
      const cleanTargetCnpj = fornecedorSalvo.cnpj?.replace(/\D/g, '') || '';
      const isExisting = fornecedores.some(
        f => f.id === fornecedorSalvo.id || (cleanTargetCnpj && f.cnpj?.replace(/\D/g, '') === cleanTargetCnpj)
      );

      if (isExisting) {
        // Obter o ID real existente se a correspondência foi por CNPJ
        const existingId = fornecedores.find(
          f => f.id === fornecedorSalvo.id || (cleanTargetCnpj && f.cnpj?.replace(/\D/g, '') === cleanTargetCnpj)
        )?.id || fornecedorSalvo.id;

        const updatedDoc = { ...fornecedorSalvo, id: existingId };
        await SupplierRepository.update(existingId, updatedDoc);
        setFornecedores(prev => prev.map(f => f.id === existingId ? updatedDoc : f));
        onAddLog('Atualização de Fornecedor', `Atualizou dados de ${fornecedorSalvo.nomeFantasia} (CNPJ: ${fornecedorSalvo.cnpj})`);
        showToast(`Fornecedor "${fornecedorSalvo.nomeFantasia}" atualizado com sucesso!`, 'success');
      } else {
        await SupplierRepository.create(fornecedorSalvo);
        setFornecedores(prev => {
          const exists = prev.some(f => f.id === fornecedorSalvo.id || (cleanTargetCnpj && f.cnpj?.replace(/\D/g, '') === cleanTargetCnpj));
          if (exists) return prev;
          return [fornecedorSalvo, ...prev];
        });
        onAddLog('Cadastro de Fornecedor', `Cadastrou o fornecedor ${fornecedorSalvo.nomeFantasia} (Categoria: ${fornecedorSalvo.categoria})`);
        showToast(`Fornecedor "${fornecedorSalvo.nomeFantasia}" cadastrado com sucesso!`, 'success');
      }

      setIsAddingSupplier(false);
      setSupplierToEdit(null);
      if (selectedSupplier?.id === fornecedorSalvo.id) {
        setSelectedSupplier(fornecedorSalvo);
      }
    } catch (err) {
      console.error('Erro ao salvar fornecedor:', err);
      showToast('Erro ao salvar fornecedor no banco de dados.', 'error');
    }
  };

  // 2. Gravar Nova Inspeção de Lote Têxtil (Alimenta nota automaticamente)
  const handleSaveInspecao = async (inspecao: InspecaoLoteFornecedor) => {
    if (!supplierForInspecao) return;
    try {
      const target = supplierForInspecao;
      const historyInspecoes = [inspecao, ...(target.historicoInspecoes || [])];

      // Atualiza temporariamente para recalcular
      const fornecedorComNovoLote: Fornecedor = {
        ...target,
        historicoInspecoes: historyInspecoes
      };

      const stats = calcularEstatisticasReaisFornecedor(fornecedorComNovoLote);
      
      // Gera avaliação automática com a nova nota calculada
      const novaAvaliacaoAuto = criarAvaliacaoAutomaticaPorDadosReais(fornecedorComNovoLote);
      const historicoEvals = [novaAvaliacaoAuto, ...(target.historicoAvaliacoes || [])];

      // Determina status
      let novoStatus = target.statusQualificacao;
      if (target.statusQualificacao !== 'Bloqueado') {
        if (stats.iqfGeral >= 85) novoStatus = 'Qualificado';
        else if (stats.iqfGeral >= 65) novoStatus = 'Qualificado com Restrições';
        else novoStatus = 'Não Qualificado';
      }

      const atualizado: Fornecedor = {
        ...fornecedorComNovoLote,
        notaAvaliacao: stats.iqfGeral,
        statusQualificacao: novoStatus,
        historicoAvaliacoes: historicoEvals,
        atualizadoEm: new Date().toISOString()
      };

      await SupplierRepository.update(atualizado.id, atualizado);
      setFornecedores(prev => prev.map(f => f.id === atualizado.id ? atualizado : f));
      if (selectedSupplier?.id === atualizado.id) setSelectedSupplier(atualizado);

      onAddLog(
        'Inspeção de Lote Registrada',
        `Lote #${inspecao.numeroLote} (${inspecao.resultado}) para ${target.nomeFantasia}. Novo IQF Automático: ${stats.iqfGeral}%`
      );
      showToast(
        `Inspeção do lote #${inspecao.numeroLote} gravada! IQF recalculado para ${stats.iqfGeral}% (${stats.faixaIQF}).`,
        'success'
      );
      setSupplierForInspecao(null);
    } catch (err) {
      console.error('Erro ao gravar inspeção:', err);
      showToast('Erro ao gravar inspeção de lote.', 'error');
    }
  };

  // 3. Gravar Avaliação de Desempenho IQF (Manual ou Automática)
  const handleSaveAvaliacao = async (avaliacao: AvaliacaoFornecedor) => {
    if (!supplierForAvaliacao) return;
    try {
      const target = supplierForAvaliacao;
      const history = [avaliacao, ...(target.historicoAvaliacoes || [])];

      // Reavaliação periódica calculada
      const proxReav = calcularProximaReavaliacao(target.criticidade, avaliacao.dataAvaliacao);

      let statusQual = target.statusQualificacao;
      if (target.statusQualificacao !== 'Bloqueado') {
        if (avaliacao.resultado === 'Aprovado') statusQual = 'Qualificado';
        else if (avaliacao.resultado === 'Aprovado com Restrições') statusQual = 'Qualificado com Restrições';
        else statusQual = 'Não Qualificado';
      }

      const atualizado: Fornecedor = {
        ...target,
        notaAvaliacao: avaliacao.notaGeral,
        statusQualificacao: statusQual,
        dataQualificacao: avaliacao.dataAvaliacao,
        historicoAvaliacoes: history,
        reavaliacao: {
          periodicidadeMeses: proxReav.periodicidadeMeses,
          dataUltimaReavaliacao: avaliacao.dataAvaliacao,
          dataProximaReavaliacao: proxReav.dataProxima,
          status: 'Em Dia'
        },
        atualizadoEm: new Date().toISOString()
      };

      await SupplierRepository.update(atualizado.id, atualizado);
      setFornecedores(prev => prev.map(f => f.id === atualizado.id ? atualizado : f));
      if (selectedSupplier?.id === atualizado.id) setSelectedSupplier(atualizado);

      onAddLog(
        'Avaliação IQF Realizada',
        `Avaliou ${target.nomeFantasia}. Nota: ${avaliacao.notaGeral}% - Resultado: ${avaliacao.resultado}`
      );
      showToast(`Avaliação gravada com sucesso! Nota: ${avaliacao.notaGeral}% (${avaliacao.resultado})`, 'success');
      setSupplierForAvaliacao(null);
    } catch (err) {
      console.error('Erro ao gravar avaliação:', err);
      showToast('Erro ao salvar avaliação.', 'error');
    }
  };

  // 4. Gravar Não Conformidade (RNC) e Plano de Ação
  const handleSaveRNC = async (rnc: OcorrenciaRNCFornecedor, plano?: PlanoAcaoFornecedor) => {
    if (!supplierForRNC) return;
    try {
      const target = supplierForRNC;
      const novasRNCs = [rnc, ...(target.ocorrenciasRNC || [])];
      const novosPlanos = plano ? [plano, ...(target.planosAcao || [])] : (target.planosAcao || []);

      const temp: Fornecedor = {
        ...target,
        ocorrenciasRNC: novasRNCs,
        planosAcao: novosPlanos
      };

      const stats = calcularEstatisticasReaisFornecedor(temp);

      const atualizado: Fornecedor = {
        ...temp,
        notaAvaliacao: stats.iqfGeral,
        atualizadoEm: new Date().toISOString()
      };

      await SupplierRepository.update(atualizado.id, atualizado);
      setFornecedores(prev => prev.map(f => f.id === atualizado.id ? atualizado : f));
      if (selectedSupplier?.id === atualizado.id) setSelectedSupplier(atualizado);

      onAddLog(
        'Não Conformidade Aberta',
        `RNC ${rnc.codigoRNC || ''} (${rnc.gravidade}) vinculada ao fornecedor ${target.nomeFantasia}`
      );
      showToast(`RNC registrada com sucesso! Novo IQF: ${stats.iqfGeral}%`, 'success');
      setSupplierForRNC(null);
    } catch (err) {
      console.error('Erro ao gravar RNC:', err);
      showToast('Erro ao registrar não conformidade.', 'error');
    }
  };

  // 5. Gravar Documento / Certificação
  const handleSaveDocumento = async (doc: DocumentoFornecedor) => {
    if (!supplierForDocumento) return;
    try {
      const target = supplierForDocumento;
      const docs = [doc, ...(target.documentos || [])];

      const atualizado: Fornecedor = {
        ...target,
        documentos: docs,
        atualizadoEm: new Date().toISOString()
      };

      await SupplierRepository.update(atualizado.id, atualizado);
      setFornecedores(prev => prev.map(f => f.id === atualizado.id ? atualizado : f));
      if (selectedSupplier?.id === atualizado.id) setSelectedSupplier(atualizado);

      onAddLog('Documento Anexado', `Anexou "${doc.titulo}" (${doc.tipo}) para ${target.nomeFantasia}`);
      showToast(`Documento "${doc.tipo}" cadastrado com sucesso!`, 'success');
      setSupplierForDocumento(null);
    } catch (err) {
      console.error('Erro ao gravar documento:', err);
      showToast('Erro ao salvar documento.', 'error');
    }
  };

  // 6. Gravar Auditoria de 2ª Parte
  const handleSaveAuditoria = async (aud: AuditoriaFornecedor) => {
    if (!supplierForAuditoria) return;
    try {
      const target = supplierForAuditoria;
      const auds = [aud, ...(target.auditorias || [])];

      const atualizado: Fornecedor = {
        ...target,
        auditorias: auds,
        atualizadoEm: new Date().toISOString()
      };

      await SupplierRepository.update(atualizado.id, atualizado);
      setFornecedores(prev => prev.map(f => f.id === atualizado.id ? atualizado : f));
      if (selectedSupplier?.id === atualizado.id) setSelectedSupplier(atualizado);

      onAddLog('Auditoria Registrada', `Auditoria ${aud.codigo} realizada em ${target.nomeFantasia}. Nota: ${aud.notaChecklist}%`);
      showToast(`Auditoria ${aud.codigo} gravada com sucesso!`, 'success');
      setSupplierForAuditoria(null);
    } catch (err) {
      console.error('Erro ao gravar auditoria:', err);
      showToast('Erro ao registrar auditoria.', 'error');
    }
  };

  // 7. Bloqueio e Desbloqueio Controlado
  const handleConfirmBloqueio = async (novoStatus: Fornecedor['statusQualificacao'], registro: BloqueioHistorico) => {
    if (!supplierForBloqueio) return;
    try {
      const target = supplierForBloqueio;
      const history = [registro, ...(target.historicoBloqueios || [])];

      const atualizado: Fornecedor = {
        ...target,
        statusQualificacao: novoStatus,
        historicoBloqueios: history,
        atualizadoEm: new Date().toISOString()
      };

      await SupplierRepository.update(atualizado.id, atualizado);
      setFornecedores(prev => prev.map(f => f.id === atualizado.id ? atualizado : f));
      if (selectedSupplier?.id === atualizado.id) setSelectedSupplier(atualizado);

      onAddLog(
        `Procedimento de ${registro.tipo}`,
        `${registro.tipo} para ${target.nomeFantasia}. Motivo: ${registro.motivo}`
      );
      showToast(`Status atualizado para "${novoStatus}"!`, 'success');
      setSupplierForBloqueio(null);
    } catch (err) {
      console.error('Erro ao atualizar bloqueio:', err);
      showToast('Erro ao atualizar status do fornecedor.', 'error');
    }
  };

  // 8. Recalcular IQF com 1 clique usando dados reais de inspeções
  const handleRecalcularIQF = async (fornecedorAlvo: Fornecedor) => {
    try {
      const totalLotes = (fornecedorAlvo.historicoInspecoes || []).length;

      // Se o fornecedor possui 0 lotes inspecionados:
      if (totalLotes === 0) {
        // Limpar avaliações automáticas espúrias criadas sem lotes
        const historicoLimpo = (fornecedorAlvo.historicoAvaliacoes || []).filter(
          a => !a.alimentadoPorDadosReais || (a.estatisticasCalculadas?.totalLotesInspecionados || 0) > 0
        );

        const statusCorrigido = fornecedorAlvo.statusQualificacao === 'Bloqueado'
          ? 'Bloqueado'
          : (fornecedorAlvo.qualificacaoInicial?.statusFinal === 'Aprovado' ? 'Qualificado' : 'Em Avaliação');

        const atualizado: Fornecedor = {
          ...fornecedorAlvo,
          notaAvaliacao: undefined,
          statusQualificacao: statusCorrigido,
          historicoAvaliacoes: historicoLimpo,
          atualizadoEm: new Date().toISOString()
        };

        await SupplierRepository.update(atualizado.id, atualizado);
        setFornecedores(prev => prev.map(f => f.id === atualizado.id ? atualizado : f));
        if (selectedSupplier?.id === atualizado.id) setSelectedSupplier(atualizado);

        onAddLog(
          'Recálculo de IQF - Sem Lotes',
          `Fornecedor ${fornecedorAlvo.nomeFantasia} possui 0 lotes inspecionados. IQF mantido como "Sem Avaliação" e status "${statusCorrigido}".`
        );
        showToast(
          `Fornecedor "${fornecedorAlvo.nomeFantasia}" possui 0 lotes inspecionados. O cálculo do IQF real exige inspeções de lotes têxteis. Status: ${statusCorrigido}.`,
          'error'
        );
        return;
      }

      // Se possui lotes inspecionados reais:
      const stats = calcularEstatisticasReaisFornecedor(fornecedorAlvo);
      const evalAuto = criarAvaliacaoAutomaticaPorDadosReais(fornecedorAlvo);
      const historicoEvals = [evalAuto, ...(fornecedorAlvo.historicoAvaliacoes || []).filter(
        a => !a.alimentadoPorDadosReais || (a.estatisticasCalculadas?.totalLotesInspecionados || 0) > 0
      )];

      let statusQual = fornecedorAlvo.statusQualificacao;
      if (fornecedorAlvo.statusQualificacao !== 'Bloqueado') {
        if (stats.iqfGeral >= 85) statusQual = 'Qualificado';
        else if (stats.iqfGeral >= 65) statusQual = 'Qualificado com Restrições';
        else statusQual = 'Não Qualificado';
      }

      const atualizado: Fornecedor = {
        ...fornecedorAlvo,
        notaAvaliacao: stats.iqfGeral,
        statusQualificacao: statusQual,
        historicoAvaliacoes: historicoEvals,
        atualizadoEm: new Date().toISOString()
      };

      await SupplierRepository.update(atualizado.id, atualizado);
      setFornecedores(prev => prev.map(f => f.id === atualizado.id ? atualizado : f));
      if (selectedSupplier?.id === atualizado.id) setSelectedSupplier(atualizado);

      onAddLog(
        'Recálculo de IQF Automatizado',
        `Recalculou IQF real de ${fornecedorAlvo.nomeFantasia} para ${stats.iqfGeral}% (${stats.faixaIQF}) baseado em ${stats.totalLotes} lote(s) inspecionado(s).`
      );
      showToast(
        `IQF recalculado com ${stats.totalLotes} lote(s) real(is): ${stats.iqfGeral}% (${stats.faixaIQF})`,
        'success'
      );
    } catch (err) {
      console.error('Erro ao recalcular IQF:', err);
      showToast('Erro ao recalcular IQF.', 'error');
    }
  };

  // 9. Exclusão de Fornecedor
  const handleDeleteSupplier = async (id: string, name: string) => {
    try {
      await SupplierRepository.delete(id);
      setFornecedores(prev => prev.filter(f => f.id !== id));
      if (selectedSupplier?.id === id) setSelectedSupplier(null);
      setSupplierToDelete(null);
      onAddLog('Exclusão de Fornecedor', `Removeu o fornecedor ${name}`);
      showToast(`Fornecedor "${name}" excluído com sucesso.`, 'success');
    } catch (err) {
      console.error('Erro ao excluir fornecedor:', err);
      showToast('Erro ao excluir fornecedor.', 'error');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className={`fixed top-5 right-5 z-50 px-4 py-3 rounded-xl shadow-xl flex items-center space-x-2 text-xs font-bold border ${
              toastMessage.type === 'success'
                ? 'bg-emerald-600 text-white border-emerald-500'
                : 'bg-rose-600 text-white border-rose-500'
            }`}
          >
            {toastMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
            <span>{toastMessage.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Executivo do Módulo */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-linear-to-tr from-blue-700 to-indigo-700 rounded-xl text-white shadow-xs">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                  Gestão & Qualificação de Fornecedores
                </h1>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  ISO 9001:2015 • 8.4
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Ciclo completo: Cadastro → Homologação → Inspeção de Lotes Têxteis → RNCs → IQF Automático → Reavaliação
              </p>
            </div>
          </div>
        </div>

        {/* Botões Globais da Barra Superior */}
        <div className="flex items-center flex-wrap gap-2.5">
          <button
            onClick={() => exportarFornecedoresCSV(fornecedores)}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center border border-slate-200 dark:border-slate-700 shadow-2xs"
            title="Exportar base completa para planilha Excel (CSV)"
          >
            <Download className="w-3.5 h-3.5 mr-1.5" />
            Exportar Excel
          </button>

          {canCreate && (
            <button
              onClick={() => { setSupplierToEdit(null); setIsAddingSupplier(true); }}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center shadow-xs"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              Novo Fornecedor
            </button>
          )}
        </div>
      </div>

      {/* Navegação entre Visões do Módulo (Lista, Ranking, Central de Alertas) */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl px-4 overflow-x-auto shadow-2xs">
        <button
          onClick={() => setVisaoAtiva('lista')}
          className={`flex items-center px-4 py-3 text-xs font-bold border-b-2 transition-colors cursor-pointer shrink-0 ${
            visaoAtiva === 'lista'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Layers className="w-4 h-4 mr-1.5" />
          Lista Mestra de Fornecedores ({totalFornecedores})
        </button>

        <button
          onClick={() => setVisaoAtiva('ranking')}
          className={`flex items-center px-4 py-3 text-xs font-bold border-b-2 transition-colors cursor-pointer shrink-0 ${
            visaoAtiva === 'ranking'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Trophy className="w-4 h-4 mr-1.5" />
          Ranking & Benchmark ({mediaIQFBase}% IQF Médio)
        </button>

        <button
          onClick={() => setVisaoAtiva('alertas')}
          className={`flex items-center px-4 py-3 text-xs font-bold border-b-2 transition-colors cursor-pointer shrink-0 ${
            visaoAtiva === 'alertas'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Bell className="w-4 h-4 mr-1.5" />
          Central de Alertas & Vencimentos
          {todosAlertas.length > 0 && (
            <span className="ml-2 px-1.5 py-0.2 rounded-full text-[10px] font-extrabold bg-rose-500 text-white">
              {todosAlertas.length}
            </span>
          )}
        </button>
      </div>

      {/* ======================================================== */}
      {/* VISÃO 1: LISTA MESTRA DE FORNECEDORES */}
      {/* ======================================================== */}
      {visaoAtiva === 'lista' && (
        <div className="space-y-6">
          {/* Cards de Métricas Principais */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
            <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Total de Fornecedores</span>
              <div className="text-2xl font-black font-mono text-slate-900 dark:text-white mt-0.5">{totalFornecedores}</div>
              <span className="text-[10px] text-slate-500 mt-1 block">Base ativa cadastrada</span>
            </div>

            <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Qualificados Plenos</span>
              <div className="text-2xl font-black font-mono text-emerald-600 mt-0.5">{qualificadosCount}</div>
              <span className="text-[10px] text-emerald-600 mt-1 block">Homologação 100% em dia</span>
            </div>

            <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Com Restrições</span>
              <div className="text-2xl font-black font-mono text-amber-600 mt-0.5">{restricaoCount}</div>
              <span className="text-[10px] text-amber-600 mt-1 block">Monitoramento especial</span>
            </div>

            <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Bloqueados / Suspensos</span>
              <div className="text-2xl font-black font-mono text-rose-600 mt-0.5">{bloqueadosCount}</div>
              <span className="text-[10px] text-rose-600 mt-1 block">Compras suspensas</span>
            </div>

            <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Média IQF Geral</span>
              <div className="text-2xl font-black font-mono text-blue-600 mt-0.5">{mediaIQFBase}%</div>
              <span className="text-[10px] text-blue-600 mt-1 block">Índice ponderado real</span>
            </div>
          </div>

          {/* Filtros e Busca */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs flex flex-col md:flex-row gap-3 items-center justify-between">
            {/* Input de Busca */}
            <div className="relative w-full md:w-96">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Buscar por fornecedor, CNPJ, contato, artigo ou categoria..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Selects de Filtragem */}
            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              <select
                value={selectedCategoria}
                onChange={e => setSelectedCategoria(e.target.value)}
                className="text-xs px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium"
              >
                <option value="todos">Todas as Categorias</option>
                {categorias.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>

              <select
                value={selectedCriticidade}
                onChange={e => setSelectedCriticidade(e.target.value)}
                className="text-xs px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium"
              >
                <option value="todos">Toda Criticidade</option>
                <option value="Alta">Criticidade Alta</option>
                <option value="Média">Criticidade Média</option>
                <option value="Baixa">Criticidade Baixa</option>
              </select>

              <select
                value={selectedStatus}
                onChange={e => setSelectedStatus(e.target.value)}
                className="text-xs px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium"
              >
                <option value="todos">Todos os Status</option>
                <option value="Qualificado">Qualificado</option>
                <option value="Qualificado com Restrições">Com Restrições</option>
                <option value="Em Avaliação">Em Avaliação</option>
                <option value="Não Qualificado">Não Qualificado</option>
                <option value="Bloqueado">Bloqueado</option>
              </select>
            </div>
          </div>

          {/* Tabela Mestra de Fornecedores */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-semibold border-b border-slate-200 dark:border-slate-800">
                    <th className="p-3.5 pl-5">Fornecedor / Razão Social</th>
                    <th className="p-3.5">Categoria Têxtil</th>
                    <th className="p-3.5">Criticidade</th>
                    <th className="p-3.5 text-center">IQF Atual</th>
                    <th className="p-3.5 text-center">Status Homologação</th>
                    <th className="p-3.5 text-center">Lotes Inspecionados</th>
                    <th className="p-3.5 text-center">Reavaliação</th>
                    <th className="p-3.5 text-right pr-5">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredFornecedores.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-10 text-center text-slate-400">
                        Nenhum fornecedor encontrado com os filtros aplicados.
                      </td>
                    </tr>
                  ) : (
                    filteredFornecedores.map(f => {
                      const stats = calcularEstatisticasReaisFornecedor(f);
                      const alertasFornec = extrairAlertasFornecedor(f);
                      return (
                        <tr 
                          key={f.id}
                          className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                        >
                          {/* Coluna Fornecedor */}
                          <td 
                            className="p-3.5 pl-5 cursor-pointer"
                            onClick={() => setSelectedSupplier(f)}
                          >
                            <div className="font-extrabold text-slate-900 dark:text-white flex items-center space-x-1.5">
                              <span>{f.nomeFantasia || f.razaoSocial}</span>
                              {alertasFornec.length > 0 && (
                                <span className="w-2 h-2 rounded-full bg-amber-500" title={`${alertasFornec.length} alertas SGQ pendentes`} />
                              )}
                            </div>
                            <span className="text-[10px] font-mono text-slate-400 block mt-0.5">
                              CNPJ: {f.cnpj} • Contato: {f.contatoNome || '-'}
                            </span>
                          </td>

                          {/* Categoria */}
                          <td className="p-3.5 text-slate-600 dark:text-slate-300">
                            <span className="font-medium">{f.categoria}</span>
                            {f.subcategoria && (
                              <span className="text-[10px] text-slate-400 block">{f.subcategoria}</span>
                            )}
                          </td>

                          {/* Criticidade */}
                          <td className="p-3.5">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              f.criticidade === 'Alta' ? 'bg-rose-100 text-rose-800' :
                              f.criticidade === 'Média' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                            }`}>
                              {f.criticidade}
                            </span>
                          </td>

                          {/* IQF Score */}
                          <td className="p-3.5 text-center">
                            {stats.temHistoricoValido ? (
                              <>
                                <span className="font-mono font-extrabold text-sm text-slate-900 dark:text-white">
                                  {stats.iqfGeral}%
                                </span>
                                <span className={`text-[10px] font-bold block ${
                                  stats.faixaIQF === 'A - Excelente' ? 'text-emerald-600' :
                                  stats.faixaIQF === 'B - Bom' ? 'text-blue-600' :
                                  stats.faixaIQF === 'C - Regular' ? 'text-amber-600' :
                                  stats.faixaIQF === 'D - Crítico' ? 'text-rose-600' : 'text-slate-400'
                                }`}>
                                  {stats.faixaIQF === 'Sem Avaliação' ? 'Sem Avaliação' : `Faixa ${stats.faixaIQF.split(' - ')[0]}`}
                                </span>
                              </>
                            ) : (
                              <>
                                <span className="font-mono font-bold text-xs text-slate-400 dark:text-slate-500">
                                  —
                                </span>
                                <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 block">
                                  Sem Avaliação
                                </span>
                              </>
                            )}
                          </td>

                          {/* Status */}
                          <td className="p-3.5 text-center">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                              f.statusQualificacao === 'Qualificado' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                              f.statusQualificacao === 'Qualificado com Restrições' ? 'bg-amber-100 text-amber-800 border border-amber-300' :
                              f.statusQualificacao === 'Bloqueado' ? 'bg-rose-100 text-rose-800 border border-rose-300' :
                              f.statusQualificacao === 'Não Qualificado' ? 'bg-rose-100 text-rose-800 border border-rose-300' :
                              'bg-blue-100 text-blue-800 border border-blue-300'
                            }`}>
                              {f.statusQualificacao === 'Qualificado' && <CheckCircle2 className="w-3 h-3 mr-1" />}
                              {f.statusQualificacao === 'Qualificado com Restrições' && <AlertTriangle className="w-3 h-3 mr-1" />}
                              {f.statusQualificacao === 'Bloqueado' && <XCircle className="w-3 h-3 mr-1" />}
                              {f.statusQualificacao === 'Não Qualificado' && <XCircle className="w-3 h-3 mr-1" />}
                              {f.statusQualificacao === 'Em Avaliação' && <Clock className="w-3 h-3 mr-1" />}
                              {f.statusQualificacao}
                            </span>
                          </td>

                          {/* Lotes Inspecionados */}
                          <td className="p-3.5 text-center font-mono">
                            <span className="font-bold text-slate-800 dark:text-slate-200">
                              {stats.totalLotes}
                            </span>
                            <span className="text-[10px] text-slate-400 block font-normal">
                              {stats.totalLotes > 0 ? `${stats.taxaAprovacao}% aprov.` : 'Sem lotes'}
                            </span>
                          </td>

                          {/* Reavaliação */}
                          <td className="p-3.5 text-center font-mono text-[11px] text-slate-600 dark:text-slate-400">
                            {f.reavaliacao?.dataProximaReavaliacao || '2026-12-10'}
                          </td>

                          {/* Ações */}
                          <td className="p-3.5 text-right pr-5">
                            <div className="flex items-center justify-end space-x-1.5">
                              <button
                                onClick={() => setSelectedSupplier(f)}
                                className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-lg cursor-pointer transition-colors"
                                title="Ver Ficha 360°"
                              >
                                <Eye className="w-4 h-4" />
                              </button>

                              <button
                                onClick={() => setSupplierForInspecao(f)}
                                className="p-1.5 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded-lg cursor-pointer transition-colors"
                                title="Nova Inspeção de Lote"
                              >
                                <ClipboardCheck className="w-4 h-4" />
                              </button>

                              <button
                                onClick={() => handleRecalcularIQF(f)}
                                className="p-1.5 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-lg cursor-pointer transition-colors"
                                title="Recalcular IQF com Dados Reais"
                              >
                                <Sparkles className="w-4 h-4" />
                              </button>

                              {canEdit && (
                                <button
                                  onClick={() => { setSupplierToEdit(f); setIsAddingSupplier(true); }}
                                  className="p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer transition-colors"
                                  title="Editar Cadastro"
                                >
                                  <Edit3 className="w-4 h-4" />
                                </button>
                              )}

                              {canDelete && (
                                <button
                                  onClick={() => setSupplierToDelete({ id: f.id, name: f.nomeFantasia || f.razaoSocial })}
                                  className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg cursor-pointer transition-colors"
                                  title="Excluir Fornecedor"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* VISÃO 2: RANKING & BENCHMARK */}
      {/* ======================================================== */}
      {visaoAtiva === 'ranking' && (
        <FornecedorRankingDashboard 
          fornecedores={fornecedores}
          onSelectFornecedor={(f) => setSelectedSupplier(f)}
        />
      )}

      {/* ======================================================== */}
      {/* VISÃO 3: CENTRAL DE ALERTAS & VENCIMENTOS */}
      {/* ======================================================== */}
      {visaoAtiva === 'alertas' && (
        <FornecedorAlertasCentral 
          fornecedores={fornecedores}
          onSelectFornecedor={(f) => setSelectedSupplier(f)}
        />
      )}

      {/* ======================================================== */}
      {/* MODAL 360° DE DETALHES COMPLETOS (9 ABAS) */}
      {/* ======================================================== */}
      {selectedSupplier && (
        <FornecedorModalDetalhes 
          fornecedor={selectedSupplier}
          onClose={() => setSelectedSupplier(null)}
          onEditFornecedor={(f) => { setSelectedSupplier(null); setSupplierToEdit(f); setIsAddingSupplier(true); }}
          onOpenNovaInspecao={(f) => setSupplierForInspecao(f)}
          onOpenNovaAvaliacao={(f) => setSupplierForAvaliacao(f)}
          onOpenNovaRNC={(f) => setSupplierForRNC(f)}
          onOpenNovoDocumento={(f) => setSupplierForDocumento(f)}
          onOpenNovaAuditoria={(f) => setSupplierForAuditoria(f)}
          onOpenBloqueio={(f) => setSupplierForBloqueio(f)}
          onOpenImpressao={(f) => setSupplierForImpressao(f)}
          onRecalcularIQFAutomatico={(f) => handleRecalcularIQF(f)}
        />
      )}

      {/* MODAL DE CADASTRO / EDIÇÃO */}
      {isAddingSupplier && (
        <FornecedorModalCadastro 
          fornecedorEditar={supplierToEdit}
          categoriasExistentes={categorias}
          fornecedoresCadastrados={fornecedores}
          onClose={() => { setIsAddingSupplier(false); setSupplierToEdit(null); }}
          onSave={handleSaveSupplier}
        />
      )}

      {/* MODAL DE NOVA INSPEÇÃO DE LOTE TÊXTIL */}
      {supplierForInspecao && (
        <FornecedorModalInspecao 
          fornecedor={supplierForInspecao}
          onClose={() => setSupplierForInspecao(null)}
          onSaveInspecao={handleSaveInspecao}
        />
      )}

      {/* MODAL DE AVALIAÇÃO IQF */}
      {supplierForAvaliacao && (
        <FornecedorModalAvaliacao 
          fornecedor={supplierForAvaliacao}
          onClose={() => setSupplierForAvaliacao(null)}
          onSaveAvaliacao={handleSaveAvaliacao}
        />
      )}

      {/* MODAL DE NOVA NÃO CONFORMIDADE (RNC) */}
      {supplierForRNC && (
        <FornecedorModalRNC 
          fornecedor={supplierForRNC}
          onClose={() => setSupplierForRNC(null)}
          onSaveRNC={handleSaveRNC}
        />
      )}

      {/* MODAL DE NOVO DOCUMENTO */}
      {supplierForDocumento && (
        <FornecedorModalDocumento 
          fornecedor={supplierForDocumento}
          onClose={() => setSupplierForDocumento(null)}
          onSaveDocumento={handleSaveDocumento}
        />
      )}

      {/* MODAL DE NOVA AUDITORIA */}
      {supplierForAuditoria && (
        <FornecedorModalAuditoria 
          fornecedor={supplierForAuditoria}
          onClose={() => setSupplierForAuditoria(null)}
          onSaveAuditoria={handleSaveAuditoria}
        />
      )}

      {/* MODAL DE BLOQUEIO / DESBLOQUEIO */}
      {supplierForBloqueio && (
        <FornecedorModalBloqueio 
          fornecedor={supplierForBloqueio}
          onClose={() => setSupplierForBloqueio(null)}
          onConfirm={handleConfirmBloqueio}
        />
      )}

      {/* MODAL DE FICHA DE IMPRESSÃO (PDF/PRINT) */}
      {supplierForImpressao && (
        <FornecedorFichaImpressao 
          fornecedor={supplierForImpressao}
          onClose={() => setSupplierForImpressao(null)}
        />
      )}

      {/* MODAL DE CONFIRMAÇÃO DE EXCLUSÃO */}
      {supplierToDelete && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl max-w-sm w-full p-6 border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center space-x-3 text-rose-600">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">Confirmar Exclusão</h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Deseja realmente remover o fornecedor <strong>{supplierToDelete.name}</strong>? Todo o histórico de avaliações e inspeções será removido.
            </p>
            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                onClick={() => setSupplierToDelete(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDeleteSupplier(supplierToDelete.id, supplierToDelete.name)}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
              >
                Sim, Excluir
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
