/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { MainLayout } from './layouts/MainLayout';
import { LoginScreen } from './components/LoginScreen';
import { Dashboard } from './components/Dashboard';
import { Documentos } from './components/Documentos';
import { AuditoriasNC } from './components/AuditoriasNC';
import { GoogleIntegrationPanel } from './components/GoogleIntegrationPanel';
import { DatabaseViewer } from './components/DatabaseViewer';
import { SearchGlobal } from './components/SearchGlobal';
import { Treinamentos } from './components/Treinamentos';
import { CalibracaoComponent, INITIAL_EQUIPAMENTOS } from './components/Calibracao';
import { PlanosAcaoComponent } from './components/PlanosAcao';
import { Configuracoes } from './components/Configuracoes';
import { RiscosOportunidadesComponent } from './components/RiscosOportunidades';
import { Auditorias5SComponent } from './components/Auditorias5S';
import { UsuariosAcessos } from './components/UsuariosAcessos';
import { INITIAL_COLABORADORES } from './components/Treinamentos';
import { Registros, INITIAL_REGISTROS } from './components/Registros';
import { Fornecedores } from './components/Fornecedores';
import { Indicadores } from './components/Indicadores';
import { CentroExcelencia } from './components/CentroExcelencia';
import { CEOProvider } from './contexts/CEOContext';

import { Documento, ActivityLog, Auditoria, NaoConformidade, PlanoAcao, RiscoOportunidade, Auditoria5S, UserAccount, RolePermission, Equipamento, ColaboradorCompetencia, Registro, Fornecedor, Treinamento } from './types';
import { INITIAL_DOCUMENTS, INITIAL_LOGS, INITIAL_AUDITORIAS, INITIAL_NAO_CONFORMIDADES, INITIAL_PLANOS_ACAO, INITIAL_RISCOS, INITIAL_5S_AUDITS, INITIAL_USER_ACCOUNTS, INITIAL_ROLE_PERMISSIONS, INITIAL_FORNECEDORES, getPersonalizacaoGeral, normalizePersonalizacao, PersonalizacaoGeral } from './utils/mockData';
import { canUserPerform } from './utils/permissionManager';
import { DocumentRepository } from './services/database/repositories/document.repository';
import { AuditRepository } from './services/database/repositories/audit.repository';
import { FiveSRepository } from './services/database/repositories/fiveS.repository';
import { UserRepository } from './services/database/repositories/user.repository';
import { NCRepository } from './services/database/repositories/nc.repository';
import { ActionPlanRepository } from './services/database/repositories/actionPlan.repository';
import { RiskRepository } from './services/database/repositories/risk.repository';
import { EquipmentRepository } from './services/database/repositories/equipment.repository';
import { CollaboratorRepository } from './services/database/repositories/collaborator.repository';
import { RecordRepository } from './services/database/repositories/record.repository';
import { SupplierRepository } from './services/database/repositories/supplier.repository';
import { RolePermissionsRepository } from './services/firebase/repositories/rolePermission.repository';
import { SystemSettingsRepository } from './services/database/repositories/systemSettings.repository';
import { TrainingRepository } from './services/database/repositories/training.repository';
import { AuditLogsRepository } from './services/firebase/repositories/auditLog.repository';
import { AuditService } from './services/audit.service';
import { clearCollectionDocs } from './firebase/firestore';
import { clearFiveSMemoryStore } from './utils/fiveSStore';
import { cacheService } from './services/cache.service';

function AppContent() {
  const { user, needsAuth, refreshUser } = useAuth();
  
  // Estado de Personalizacao Geral do Sistema
  const [personalizacao, setPersonalizacao] = useState<PersonalizacaoGeral>(() => getPersonalizacaoGeral());

  // Estado Ativo das Páginas/Seções do SGQ
  const [activeSection, setActiveSection] = useState<'dashboard' | 'documentos' | 'auditorias' | 'riscos' | '5s' | 'integracao' | 'database' | 'treinamentos' | 'calibracao' | 'planos' | 'configuracoes' | 'usuarios' | 'registros' | 'fornecedores' | 'indicadores' | 'ceo'>('dashboard');
  
  // Flag de ambiente para modo demonstração
  const IS_DEMO_MODE = import.meta.env.VITE_DEMO_MODE === 'true';

  // Estado Ativo das Entidades (Carregados do Firestore em Produção)
  const [documents, setDocuments] = useState<Documento[]>(() => IS_DEMO_MODE ? INITIAL_DOCUMENTS : []);
  const [users, setUsers] = useState<UserAccount[]>(() => IS_DEMO_MODE ? INITIAL_USER_ACCOUNTS : []);
  const [permissions, setPermissions] = useState<RolePermission[]>(INITIAL_ROLE_PERMISSIONS);
  const [logs, setLogs] = useState<ActivityLog[]>(() => IS_DEMO_MODE ? INITIAL_LOGS : []);
  const [audits, setAudits] = useState<Auditoria[]>(() => IS_DEMO_MODE ? INITIAL_AUDITORIAS : []);
  const [ncs, setNcs] = useState<NaoConformidade[]>(() => IS_DEMO_MODE ? INITIAL_NAO_CONFORMIDADES : []);
  const [planos, setPlanos] = useState<PlanoAcao[]>(() => IS_DEMO_MODE ? INITIAL_PLANOS_ACAO : []);
  const [riscos, setRiscos] = useState<RiscoOportunidade[]>(() => IS_DEMO_MODE ? INITIAL_RISCOS : []);
  const [auditorias5s, setAuditorias5s] = useState<Auditoria5S[]>(() => IS_DEMO_MODE ? INITIAL_5S_AUDITS : []);
  const [equipamentos, setEquipamentos] = useState<Equipamento[]>(() => IS_DEMO_MODE ? INITIAL_EQUIPAMENTOS : []);
  const [colaboradores, setColaboradores] = useState<ColaboradorCompetencia[]>(() => IS_DEMO_MODE ? INITIAL_COLABORADORES : []);
  const [registros, setRegistros] = useState<Registro[]>(() => IS_DEMO_MODE ? INITIAL_REGISTROS : []);
  const [suppliers, setSuppliers] = useState<Fornecedor[]>(() => IS_DEMO_MODE ? INITIAL_FORNECEDORES : []);
  const [trainings, setTrainings] = useState<Treinamento[]>([]);

  const [selectedDocId, setSelectedDocId] = useState<string | undefined>(undefined);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Carregar dados reais dos repositórios Firestore e assinar atualizações em tempo real
  useEffect(() => {
    // Garantir que chamadas ao Firestore SOMENTE sejam feitas após autenticação do usuário
    if (needsAuth || !user) {
      return;
    }

    let isMounted = true;

    const loadRealData = async () => {
      try {
        const [
          docRes, auditRes, fiveSRes, userRes,
          ncRes, planoRes, riscoRes, equipRes,
          colabRes, regRes, supRes, permRes, trainRes, logData
        ] = await Promise.all([
          DocumentRepository.findAll(),
          AuditRepository.findAll(),
          FiveSRepository.findAll(),
          UserRepository.findAll(),
          NCRepository.findAll(),
          ActionPlanRepository.findAll(),
          RiskRepository.findAll(),
          EquipmentRepository.findAll(),
          CollaboratorRepository.findAll(),
          RecordRepository.findAll(),
          SupplierRepository.findAll(),
          RolePermissionsRepository.findAll(),
          TrainingRepository.findAll(),
          AuditService.getLogs()
        ]);
        
        if (!isMounted) return;

        if (docRes.success && Array.isArray(docRes.data)) setDocuments(docRes.data);
        if (auditRes.success && Array.isArray(auditRes.data)) setAudits(auditRes.data);
        if (fiveSRes.success && Array.isArray(fiveSRes.data)) setAuditorias5s(fiveSRes.data);
        if (userRes.success && Array.isArray(userRes.data)) setUsers(userRes.data);
        if (ncRes.success && Array.isArray(ncRes.data)) setNcs(ncRes.data);
        if (planoRes.success && Array.isArray(planoRes.data)) setPlanos(planoRes.data);
        if (riscoRes.success && Array.isArray(riscoRes.data)) setRiscos(riscoRes.data);
        if (equipRes.success && Array.isArray(equipRes.data)) setEquipamentos(equipRes.data);
        if (colabRes.success && Array.isArray(colabRes.data)) setColaboradores(colabRes.data);
        if (regRes.success && Array.isArray(regRes.data)) setRegistros(regRes.data);
        if (supRes.success && Array.isArray(supRes.data)) setSuppliers(supRes.data);
        if (trainRes.success && Array.isArray(trainRes.data)) setTrainings(trainRes.data);
        if (permRes.success && Array.isArray(permRes.data)) {
          setPermissions(permRes.data as any);
        }
        if (Array.isArray(logData)) setLogs(logData as any);
      } catch (err) {
        console.error('Falha ao carregar dados reais dos repositórios:', err);
      }
    };

    loadRealData();

    // Assinaturas Firestore onSnapshot
    const unsubDocs = DocumentRepository.subscribe((items) => setDocuments(items));
    const unsubAudits = AuditRepository.subscribe((items) => setAudits(items));
    const unsubFiveS = FiveSRepository.subscribe((items) => setAuditorias5s(items));
    const unsubUsers = UserRepository.subscribe((items) => setUsers(items));
    const unsubNCs = NCRepository.subscribe((items) => setNcs(items));
    const unsubPlanos = ActionPlanRepository.subscribe((items) => setPlanos(items));
    const unsubRiscos = RiskRepository.subscribe((items) => setRiscos(items));
    const unsubEquip = EquipmentRepository.subscribe((items) => setEquipamentos(items));
    const unsubColab = CollaboratorRepository.subscribe((items) => setColaboradores(items));
    const unsubReg = RecordRepository.subscribe((items) => setRegistros(items));
    const unsubSup = SupplierRepository.subscribe((items) => setSuppliers(items));
    const unsubTrain = TrainingRepository.subscribe((items) => setTrainings(items));
    const unsubLogs = AuditLogsRepository.subscribe((items) => {
      if (Array.isArray(items) && items.length > 0) {
        setLogs(items as any);
      }
    });
    const unsubPerms = RolePermissionsRepository.subscribe((items) => setPermissions(items as any));
    const unsubSettings = SystemSettingsRepository.subscribe((records) => {
      const pDoc = records.find(r => r.id === 'sgq_vickytex_personalizacao');
      if (pDoc && pDoc.data) {
        const clean = normalizePersonalizacao(pDoc.data);
        setPersonalizacao(clean);
        if (JSON.stringify(clean) !== JSON.stringify(pDoc.data)) {
          SystemSettingsRepository.create({ id: 'sgq_vickytex_personalizacao', data: clean }).catch(() => {});
          try {
            localStorage.setItem('sgq_vickytex_personalizacao', JSON.stringify(clean));
          } catch (e) {}
        }
      }
    });

    return () => {
      isMounted = false;
      unsubDocs();
      unsubAudits();
      unsubFiveS();
      unsubUsers();
      unsubNCs();
      unsubPlanos();
      unsubRiscos();
      unsubEquip();
      unsubColab();
      unsubReg();
      unsubSup();
      unsubTrain();
      unsubLogs();
      unsubPerms();
      unsubSettings();
    };
  }, [user, needsAuth]);


  // Evento Global de Atalho Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Redireciona para o Painel Geral caso o usuário atual não tenha permissão de visualizar a seção ativa
  useEffect(() => {
    if (!user) return;
    if (activeSection === 'dashboard') return;

    const hasViewPermission = canUserPerform(user, activeSection, 'ver', undefined, permissions);
    if (!hasViewPermission) {
      setActiveSection('dashboard');
    }
  }, [user, activeSection, permissions]);

  // Adicionar Log de Auditabilidade Geral (ISO 9001 7.5)
  const handleAddLog = (action: string, details: string, docId?: string) => {
    const newLog: ActivityLog = {
      id: `log-${Date.now()}`,
      usuarioEmail: user?.email || 'sistema@vickytex.com.br',
      usuarioNome: user?.name || user?.email?.split('@')[0] || 'Usuário do Sistema',
      usuarioRole: user?.role || 'Qualidade',
      acao: action,
      detalhes: details,
      timestamp: new Date().toISOString(),
      documentoId: docId
    };
    setLogs((prev) => [newLog, ...prev]);
  };

  const handleClearAllData = () => {
    // 1. Chaves operacionais para remover do localStorage (Parâmetros de configuração e tabelas do sistema são PRESERVADOS!)
    const operationalKeysToRemove = [
      'sgq_vickytex_documents',
      'sgq_vickytex_equipamentos',
      'sgq_vickytex_colaboradores',
      'sgq_vickytex_logs',
      'sgq_vickytex_audits',
      'sgq_vickytex_ncs',
      'sgq_vickytex_planos',
      'sgq_vickytex_riscos',
      'sgq_vickytex_auditorias5s',
      'sgq_vickytex_auditorias_5s',
      'sgq_5s_itens',
      'sgq_5s_fotos',
      'sgq_5s_planos',
      'sgq_vickytex_registros',
      'sgq_vickytex_treinamentos',
      'sgq_vickytex_trainings',
      'sgq_vickytex_fornecedores',
      'sgq_vickytex_indicators',
      'sgq_vickytex_critical_analyses',
      'sgq_vickytex_notifications',
      'sgq_vickytex_ceo_projects',
      'sgq_vickytex_ceo_ideas',
      'sgq_vickytex_ceo_training_logs',
      'sgq_vickytex_ceo_gamification_adjustments',
      'sgq_vickytex_ceo_scores_zeroed'
    ];
    operationalKeysToRemove.forEach(k => {
      try {
        localStorage.removeItem(k);
      } catch (e) {}
    });

    // Limpar cache em memória e store do 5S
    clearFiveSMemoryStore();
    cacheService.clear();

    // 2. Limpar estados operacionais da memória React
    setDocuments([]);
    setAudits([]);
    setNcs([]);
    setPlanos([]);
    setRiscos([]);
    setAuditorias5s([]);
    setEquipamentos([]);
    setColaboradores([]);
    setTrainings([]);
    setRegistros([]);
    setSuppliers([]);
    setLogs([]);

    // 3. Limpar coleções operacionais no Cloud Firestore
    // NOTA: Coleções e documentos de parâmetros e configurações (como 'system_settings' para setores, tipos de documentos, categorias, metodologias, sensos 5S, personalização, 'role_permissions' e 'users') são PRESERVADOS intocados!
    const operationalCollectionsToClear = [
      'documents',
      'audits',
      'ncs',
      'action_plans',
      'risks',
      'fives_audits',
      'audits_5s',
      'fives_photos',
      'equipments',
      'collaborators',
      'trainings',
      'records',
      'suppliers',
      'indicators',
      'critical_analyses',
      'notifications',
      'ceo_projects',
      'ceo_ideas',
      'audit_logs'
    ];
    for (const coll of operationalCollectionsToClear) {
      clearCollectionDocs(coll).catch(() => {});
    }

    // 4. Limpar sub-registros operacionais do 5S em system_settings sem tocar nos parâmetros de configuração
    const operationalSettingsDocsToClear = [
      'sgq_5s_itens',
      'sgq_5s_fotos',
      'sgq_5s_planos'
    ];
    for (const docId of operationalSettingsDocsToClear) {
      SystemSettingsRepository.create({ id: docId, items: [] }).catch(() => {});
    }

    handleAddLog('ZERAR_BANCO', 'Registros operacionais zerados. As tabelas de parâmetros e configurações foram integralmente preservadas.');
  };

  const handleAddDocument = async (doc: Documento) => {
    try {
      const res = await DocumentRepository.create(doc);
      const newDoc = (res.success && res.data) ? res.data : doc;
      setDocuments((prev) => prev.some((d) => d.id === newDoc.id) ? prev.map((d) => (d.id === newDoc.id ? newDoc : d)) : [newDoc, ...prev]);
    } catch (e) {
      setDocuments((prev) => prev.some((d) => d.id === doc.id) ? prev.map((d) => (d.id === doc.id ? doc : d)) : [doc, ...prev]);
    }
  };

  const handleUpdateDocument = async (updatedDoc: Documento) => {
    try {
      const res = await DocumentRepository.update(updatedDoc.id, updatedDoc);
      if (res.success && res.data) {
        setDocuments((prev) => prev.map((d) => (d.id === updatedDoc.id ? res.data : d)));
      } else {
        setDocuments((prev) => prev.map((d) => (d.id === updatedDoc.id ? updatedDoc : d)));
      }
    } catch (e) {
      setDocuments((prev) => prev.map((d) => (d.id === updatedDoc.id ? updatedDoc : d)));
    }
  };

  const handleDeleteDocument = async (id: string) => {
    try {
      await DocumentRepository.delete(id);
    } catch (e) {
      console.error('Falha ao excluir documento do repositório remoto:', e);
    } finally {
      // Sempre remove localmente para garantir o funcionamento correto e instantâneo
      setDocuments((prev) => prev.filter((d) => d.id !== id));
      if (selectedDocId === id) {
        setSelectedDocId(undefined);
      }
    }
  };

  const handleAddAudit = async (audit: Auditoria) => {
    try {
      const res = await AuditRepository.create(audit);
      const newAudit = (res.success && res.data) ? res.data : audit;
      setAudits((prev) => prev.some((a) => a.id === newAudit.id) ? prev.map((a) => (a.id === newAudit.id ? newAudit : a)) : [newAudit, ...prev]);
    } catch (e) {
      setAudits((prev) => prev.some((a) => a.id === audit.id) ? prev.map((a) => (a.id === audit.id ? audit : a)) : [audit, ...prev]);
    }
  };

  const handleUpdateAudit = async (updated: Auditoria) => {
    try {
      const res = await AuditRepository.update(updated.id, updated);
      if (res.success && res.data) {
        setAudits((prev) => prev.map((a) => (a.id === updated.id ? res.data : a)));
      } else {
        setAudits((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
      }
    } catch (e) {
      setAudits((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
    }
  };

  const handleDeleteAudit = async (id: string) => {
    try {
      await AuditRepository.delete(id);
    } catch (e) {
      console.error('Falha ao excluir auditoria do repositório remoto:', e);
    } finally {
      setAudits((prev) => prev.filter((a) => a.id !== id));
    }
  };

  const handleAddNC = async (nc: NaoConformidade) => {
    try {
      const res = await NCRepository.create(nc);
      const newNC = (res.success && res.data) ? res.data : nc;
      setNcs((prev) => prev.some((n) => n.id === newNC.id) ? prev.map((n) => (n.id === newNC.id ? newNC : n)) : [newNC, ...prev]);
    } catch (e) {
      console.error('Erro ao salvar NC no Firestore:', e);
      setNcs((prev) => prev.some((n) => n.id === nc.id) ? prev.map((n) => (n.id === nc.id ? nc : n)) : [nc, ...prev]);
    }
  };

  const handleUpdateNC = async (updated: NaoConformidade) => {
    try {
      await NCRepository.update(updated.id, updated);
      setNcs((prev) => prev.map((n) => (n.id === updated.id ? updated : n)));
    } catch (e) {
      console.error('Erro ao atualizar NC no Firestore:', e);
    }
  };

  const handleDeleteNC = async (id: string) => {
    try {
      await NCRepository.delete(id);
      setNcs((prev) => prev.filter((n) => n.id !== id));
    } catch (e) {
      console.error('Erro ao excluir NC no Firestore:', e);
    }
  };

  const handleAddPlano = async (plano: PlanoAcao) => {
    try {
      const res = await ActionPlanRepository.create(plano);
      const newPlano = (res.success && res.data) ? res.data : plano;
      setPlanos((prev) => prev.some((p) => p.id === newPlano.id) ? prev.map((p) => (p.id === newPlano.id ? newPlano : p)) : [newPlano, ...prev]);
    } catch (e) {
      console.error('Erro ao salvar Plano de Ação no Firestore:', e);
      setPlanos((prev) => prev.some((p) => p.id === plano.id) ? prev.map((p) => (p.id === plano.id ? plano : p)) : [plano, ...prev]);
    }
  };

  const handleUpdatePlano = async (updated: PlanoAcao) => {
    try {
      await ActionPlanRepository.update(updated.id, updated);
      setPlanos((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    } catch (e) {
      console.error('Erro ao atualizar Plano de Ação no Firestore:', e);
    }
  };

  const handleDeletePlano = async (id: string) => {
    try {
      await ActionPlanRepository.delete(id);
      setPlanos((prev) => prev.filter((p) => p.id !== id));
    } catch (e) {
      console.error('Erro ao excluir Plano de Ação no Firestore:', e);
    }
  };

  const handleAddRisco = async (risco: RiscoOportunidade) => {
    try {
      const res = await RiskRepository.create(risco);
      const newRisco = (res.success && res.data) ? res.data : risco;
      setRiscos((prev) => prev.some((r) => r.id === newRisco.id) ? prev.map((r) => (r.id === newRisco.id ? newRisco : r)) : [newRisco, ...prev]);
    } catch (e) {
      console.error('Erro ao salvar Risco no Firestore:', e);
      setRiscos((prev) => prev.some((r) => r.id === risco.id) ? prev.map((r) => (r.id === risco.id ? risco : r)) : [risco, ...prev]);
    }
  };

  const handleUpdateRisco = async (updated: RiscoOportunidade) => {
    try {
      await RiskRepository.update(updated.id, updated);
      setRiscos((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
    } catch (e) {
      console.error('Erro ao atualizar Risco no Firestore:', e);
    }
  };

  const handleDeleteRisco = async (id: string) => {
    try {
      await RiskRepository.delete(id);
      setRiscos((prev) => prev.filter((r) => r.id !== id));
    } catch (e) {
      console.error('Erro ao excluir Risco no Firestore:', e);
    }
  };

  const handleAddAudit5S = async (audit: Auditoria5S) => {
    try {
      const res = await FiveSRepository.create(audit);
      const newRecord = res.success && res.data ? res.data : audit;
      setAuditorias5s((prev) => [newRecord, ...prev.filter((a) => a.id !== newRecord.id)]);
    } catch (e) {
      setAuditorias5s((prev) => [audit, ...prev.filter((a) => a.id !== audit.id)]);
    }
  };

  const handleUpdateAudit5S = async (updated: Auditoria5S) => {
    try {
      const res = await FiveSRepository.update(updated.id, updated);
      if (res.success && res.data) {
        setAuditorias5s((prev) => prev.map((a) => (a.id === updated.id ? res.data : a)));
      } else {
        setAuditorias5s((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
      }
    } catch (e) {
      setAuditorias5s((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
    }
  };

  const handleDeleteAudit5S = async (id: string) => {
    try {
      await FiveSRepository.delete(id);
    } catch (e) {
      console.error('Falha ao excluir auditoria 5S do repositório remoto:', e);
    } finally {
      setAuditorias5s((prev) => prev.filter((a) => a.id !== id));
    }
  };

  const handleAddUser = async (userAccount: UserAccount) => {
    try {
      const res = await UserRepository.create(userAccount);
      if (res.success && res.data) {
        setUsers((prev) => [res.data, ...prev]);
      } else {
        setUsers((prev) => [userAccount, ...prev]);
      }
    } catch (e) {
      setUsers((prev) => [userAccount, ...prev]);
    }
  };

  const handleUpdateUser = async (updated: UserAccount) => {
    // Atualização otimista imediata na UI
    setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));

    // Se o usuário editado for o usuário logado atualmente, atualiza o contexto de autenticação imediatamente
    if (user && (user.id === updated.id || user.email?.toLowerCase() === updated.email?.toLowerCase())) {
      refreshUser({
        ...user,
        name: updated.name,
        email: updated.email,
        role: updated.role,
        sector: updated.sector,
        photoURL: updated.photoURL,
        customPermissions: updated.customPermissions
      });
    }

    try {
      const res = await UserRepository.update(updated.id, updated);
      if (res.success && res.data) {
        setUsers((prev) => prev.map((u) => (u.id === updated.id ? res.data : u)));
      }
    } catch (e) {
      console.warn('Falha ao atualizar usuário no Firestore:', e);
    }
  };

  const handleDeleteUser = async (id: string) => {
    try {
      await UserRepository.delete(id);
    } catch (e) {
      console.error('Falha ao excluir usuário do repositório remoto:', e);
    } finally {
      setUsers((prev) => prev.filter((u) => u.id !== id));
    }
  };

  const handleUpdatePermissions = async (updatedPerms: RolePermission[]) => {
    setPermissions(updatedPerms);
    try {
      await Promise.all(
        updatedPerms.map((p) =>
          RolePermissionsRepository.create({
            id: p.role,
            role: p.role,
            allowedSections: p.allowedSections
          })
        )
      );
    } catch (e) {
      console.error('Falha ao atualizar permissões no Firestore:', e);
    }
  };

  // Callback de Seleção de Documento (vindo da pesquisa global ou dashboards)
  const handleSelectDocument = (docId: string) => {
    setSelectedDocId(docId);
    setActiveSection('documentos');
  };

  if (needsAuth) {
    return <LoginScreen personalizacao={personalizacao} />;
  }

  return (
    <MainLayout 
      activeSection={activeSection} 
      setActiveSection={setActiveSection}
      onOpenSearch={() => setIsSearchOpen(true)}
      personalizacao={personalizacao}
      permissions={permissions}
    >
      
      {/* 1. Dashboard Executivo */}
      {activeSection === 'dashboard' && (
        <Dashboard 
          documents={documents}
          logs={logs}
          audits={audits}
          ncs={ncs}
          planos={planos}
          riscos={riscos}
          auditorias5s={auditorias5s}
          equipamentos={equipamentos}
          colaboradores={colaboradores}
          registros={registros}
          fornecedores={suppliers}
          treinamentos={trainings}
          onNavigateToDocs={() => setActiveSection('documentos')}
          onSelectDocument={handleSelectDocument}
          onNavigateToSection={setActiveSection}
          personalizacao={personalizacao}
        />
      )}

      {/* 2. Módulo de Documentos (Lista Mestra) */}
      {activeSection === 'documentos' && (
        <Documentos 
          documents={documents}
          onAddDocument={handleAddDocument}
          onUpdateDocument={handleUpdateDocument}
          onDeleteDocument={handleDeleteDocument}
          onAddLog={handleAddLog}
          selectedDocId={selectedDocId}
          setSelectedDocId={setSelectedDocId}
          personalizacao={personalizacao}
        />
      )}

      {/* 3. Módulo de Auditorias & NC */}
      {activeSection === 'auditorias' && (
        <AuditoriasNC 
          audits={audits}
          ncs={ncs}
          documents={documents}
          planos={planos}
          onAddAudit={handleAddAudit}
          onUpdateAudit={handleUpdateAudit}
          onDeleteAudit={handleDeleteAudit}
          onAddNC={handleAddNC}
          onUpdateNC={handleUpdateNC}
          onDeleteNC={handleDeleteNC}
          onAddPlano={handleAddPlano}
          onNavigateToPlanos={() => setActiveSection('planos')}
          onAddLog={handleAddLog}
          personalizacao={personalizacao}
        />
      )}

      {/* 4. Painel de Integração Google Workspace */}
      {activeSection === 'integracao' && (
        <GoogleIntegrationPanel />
      )}

      {/* Módulo de Gestão de Riscos & Oportunidades */}
      {activeSection === 'riscos' && (
        <RiscosOportunidadesComponent 
          riscos={riscos}
          planos={planos}
          onAddRisco={handleAddRisco}
          onUpdateRisco={handleUpdateRisco}
          onDeleteRisco={handleDeleteRisco}
          onAddLog={handleAddLog}
          personalizacao={personalizacao}
        />
      )}

      {/* 5. Módulo de Capacitação & Treinamentos */}
      {activeSection === 'treinamentos' && (
        <Treinamentos 
          documents={documents}
          colaboradores={colaboradores}
          setColaboradores={setColaboradores}
          onAddLog={handleAddLog}
          personalizacao={personalizacao}
        />
      )}

      {/* 6. Módulo de Calibração de Equipamentos (ISO 7.1.5) */}
      {activeSection === 'calibracao' && (
        <CalibracaoComponent 
          documents={documents}
          equipamentos={equipamentos}
          setEquipamentos={setEquipamentos}
          onAddLog={handleAddLog}
          personalizacao={personalizacao}
        />
      )}

      {/* 5W2H Planos de Ação (ISO 9001 10.2) */}
      {activeSection === 'planos' && (
        <PlanosAcaoComponent 
          planos={planos}
          documents={documents}
          audits={audits}
          ncs={ncs}
          onAddPlano={handleAddPlano}
          onUpdatePlano={handleUpdatePlano}
          onDeletePlano={handleDeletePlano}
          onAddLog={handleAddLog}
          personalizacao={personalizacao}
        />
      )}

      {/* Módulo de Auditorias 5S */}
      {activeSection === '5s' && (
        <Auditorias5SComponent 
          auditorias={auditorias5s}
          planos={planos}
          onUpdateAudits={setAuditorias5s}
          onAddAudit={handleAddAudit5S}
          onUpdateAudit={handleUpdateAudit5S}
          onDeleteAudit={handleDeleteAudit5S}
          onAddLog={handleAddLog}
          personalizacao={personalizacao}
        />
      )}

      {/* 7. Database Schema Explorer */}
      {activeSection === 'database' && (
        <DatabaseViewer 
          documents={documents}
          logs={logs}
          audits={audits}
          ncs={ncs}
          planos={planos}
          riscos={riscos}
          auditorias5s={auditorias5s}
          users={users}
          permissions={permissions}
          onClearAllData={handleClearAllData}
        />
      )}

      {/* Módulo de Controle de Registros (ISO 7.5.3) */}
      {activeSection === 'registros' && (
        <Registros 
          documents={documents}
          onAddLog={handleAddLog}
          personalizacao={personalizacao}
          registros={registros}
          setRegistros={setRegistros}
        />
      )}

      {/* Módulo de Indicadores e Metas de Qualidade (ISO 9.1.3) */}
      {activeSection === 'indicadores' && (
        <Indicadores 
          onAddLog={handleAddLog}
          personalizacao={personalizacao}
        />
      )}

      {/* Módulo de Melhoria Contínua (Metodologias PDCA, DMAIC, Lean, Kaizen) */}
      {activeSection === 'ceo' && (
        <CentroExcelencia 
          personalizacao={personalizacao} 
          planos={planos}
          onAddPlano={handleAddPlano}
          onNavigateToPlanos={() => setActiveSection('planos')}
        />
      )}

      {/* Módulo de Avaliação de Fornecedores (ISO 8.4) */}
      {activeSection === 'fornecedores' && (
        <Fornecedores 
          onAddLog={handleAddLog}
          personalizacao={personalizacao}
        />
      )}

      {/* 8. Parâmetros Auxiliares (Sectores e Tipos Documentais) */}
      {activeSection === 'configuracoes' && (
        <Configuracoes 
          onAddLog={handleAddLog} 
          personalizacao={personalizacao}
          onUpdatePersonalizacao={setPersonalizacao}
        />
      )}

      {/* Módulo de Perfis, Usuários, Senhas & Permissões */}
      {activeSection === 'usuarios' && (
        <UsuariosAcessos
          users={users}
          permissions={permissions}
          onAddUser={handleAddUser}
          onUpdateUser={handleUpdateUser}
          onDeleteUser={handleDeleteUser}
          onUpdatePermissions={handleUpdatePermissions}
          onAddLog={handleAddLog}
          personalizacao={personalizacao}
        />
      )}

      {/* Pesquisa Global Cmd+K Modal */}
      <SearchGlobal 
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectDocument={handleSelectDocument}
      />

    </MainLayout>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CEOProvider>
          <AppContent />
        </CEOProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
