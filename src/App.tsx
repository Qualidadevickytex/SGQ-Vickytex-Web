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

import { Documento, ActivityLog, Auditoria, NaoConformidade, PlanoAcao, RiscoOportunidade, Auditoria5S, UserAccount, RolePermission, Equipamento, ColaboradorCompetencia, Registro, Fornecedor } from './types';
import { INITIAL_DOCUMENTS, INITIAL_LOGS, INITIAL_AUDITORIAS, INITIAL_NAO_CONFORMIDADES, INITIAL_PLANOS_ACAO, INITIAL_RISCOS, INITIAL_5S_AUDITS, INITIAL_USER_ACCOUNTS, INITIAL_ROLE_PERMISSIONS, INITIAL_FORNECEDORES, getPersonalizacaoGeral, PersonalizacaoGeral } from './utils/mockData';
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
import { AuditService } from './services/audit.service';
import { clearCollectionDocs } from './firebase/firestore';

function AppContent() {
  const { user, needsAuth } = useAuth();
  
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
          colabRes, regRes, supRes, permRes, logData
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
          AuditService.getLogs()
        ]);
        
        if (!isMounted) return;

        if (docRes.success && Array.isArray(docRes.data) && (docRes.data.length > 0 || !IS_DEMO_MODE)) setDocuments(docRes.data);
        if (auditRes.success && Array.isArray(auditRes.data) && (auditRes.data.length > 0 || !IS_DEMO_MODE)) setAudits(auditRes.data);
        if (fiveSRes.success && Array.isArray(fiveSRes.data) && (fiveSRes.data.length > 0 || !IS_DEMO_MODE)) setAuditorias5s(fiveSRes.data);
        if (userRes.success && Array.isArray(userRes.data) && (userRes.data.length > 0 || !IS_DEMO_MODE)) setUsers(userRes.data);
        if (ncRes.success && Array.isArray(ncRes.data) && (ncRes.data.length > 0 || !IS_DEMO_MODE)) setNcs(ncRes.data);
        if (planoRes.success && Array.isArray(planoRes.data) && (planoRes.data.length > 0 || !IS_DEMO_MODE)) setPlanos(planoRes.data);
        if (riscoRes.success && Array.isArray(riscoRes.data) && (riscoRes.data.length > 0 || !IS_DEMO_MODE)) setRiscos(riscoRes.data);
        if (equipRes.success && Array.isArray(equipRes.data) && (equipRes.data.length > 0 || !IS_DEMO_MODE)) setEquipamentos(equipRes.data);
        if (colabRes.success && Array.isArray(colabRes.data) && (colabRes.data.length > 0 || !IS_DEMO_MODE)) setColaboradores(colabRes.data);
        if (regRes.success && Array.isArray(regRes.data) && (regRes.data.length > 0 || !IS_DEMO_MODE)) setRegistros(regRes.data);
        if (supRes.success && Array.isArray(supRes.data) && (supRes.data.length > 0 || !IS_DEMO_MODE)) setSuppliers(supRes.data);
        if (permRes.success && Array.isArray(permRes.data) && (permRes.data.length > 0 || !IS_DEMO_MODE)) {
          setPermissions(permRes.data as any);
        }
        if (Array.isArray(logData) && (logData.length > 0 || !IS_DEMO_MODE)) setLogs(logData as any);
      } catch (err) {
        console.error('Falha ao carregar dados reais dos repositórios:', err);
      }
    };

    loadRealData();

    // Assinaturas Firestore onSnapshot
    const unsubDocs = DocumentRepository.subscribe((items) => (items.length > 0 || !IS_DEMO_MODE) && setDocuments(items));
    const unsubAudits = AuditRepository.subscribe((items) => (items.length > 0 || !IS_DEMO_MODE) && setAudits(items));
    const unsubUsers = UserRepository.subscribe((items) => (items.length > 0 || !IS_DEMO_MODE) && setUsers(items));
    const unsubNCs = NCRepository.subscribe((items) => (items.length > 0 || !IS_DEMO_MODE) && setNcs(items));
    const unsubPlanos = ActionPlanRepository.subscribe((items) => (items.length > 0 || !IS_DEMO_MODE) && setPlanos(items));
    const unsubRiscos = RiskRepository.subscribe((items) => (items.length > 0 || !IS_DEMO_MODE) && setRiscos(items));
    const unsubEquip = EquipmentRepository.subscribe((items) => (items.length > 0 || !IS_DEMO_MODE) && setEquipamentos(items));
    const unsubColab = CollaboratorRepository.subscribe((items) => (items.length > 0 || !IS_DEMO_MODE) && setColaboradores(items));
    const unsubReg = RecordRepository.subscribe((items) => (items.length > 0 || !IS_DEMO_MODE) && setRegistros(items));
    const unsubSup = SupplierRepository.subscribe((items) => (items.length > 0 || !IS_DEMO_MODE) && setSuppliers(items));
    const unsubPerms = RolePermissionsRepository.subscribe((items) => (items.length > 0 || !IS_DEMO_MODE) && setPermissions(items as any));
    const unsubSettings = SystemSettingsRepository.subscribe((records) => {
      const pDoc = records.find(r => r.id === 'sgq_vickytex_personalizacao');
      if (pDoc && pDoc.data) {
        setPersonalizacao((prev) => ({ ...prev, ...pDoc.data }));
      }
    });

    return () => {
      isMounted = false;
      unsubDocs();
      unsubAudits();
      unsubUsers();
      unsubNCs();
      unsubPlanos();
      unsubRiscos();
      unsubEquip();
      unsubColab();
      unsubReg();
      unsubSup();
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

  // Redireciona para o Painel Geral caso o perfil atual não tenha permissão de visualizar a seção ativa
  useEffect(() => {
    if (!user) return;
    const userPerm = permissions.find((p) => p.role === user.role);
    let allowed = userPerm ? userPerm.allowedSections : [];
    
    // Fallback de roles padrões caso as permissões locais não estejam povoadas
    if (allowed.length === 0) {
      if (user.role === 'Administrador' || user.role === 'Gestor') {
        allowed = ['dashboard', 'documentos', 'auditorias', 'riscos', '5s', 'treinamentos', 'calibracao', 'planos', 'configuracoes', 'usuarios', 'integracao', 'database', 'registros', 'fornecedores', 'indicadores', 'ceo'];
      } else if (user.role === 'Qualidade') {
        allowed = ['dashboard', 'documentos', 'auditorias', 'riscos', '5s', 'treinamentos', 'calibracao', 'planos', 'configuracoes', 'usuarios', 'registros', 'fornecedores', 'indicadores', 'ceo'];
      } else if (user.role === 'Supervisor') {
        allowed = ['dashboard', 'documentos', 'auditorias', '5s', 'treinamentos', 'calibracao', 'planos', 'registros', 'fornecedores', 'indicadores', 'ceo'];
      } else if (user.role === 'Colaborador') {
        allowed = ['dashboard', 'documentos', '5s', 'treinamentos', 'registros', 'indicadores', 'ceo'];
      } else if (user.role === 'Auditor') {
        allowed = ['dashboard', 'documentos', 'auditorias', 'riscos', '5s', 'planos', 'registros', 'fornecedores', 'indicadores', 'ceo'];
      } else {
        allowed = ['dashboard', 'documentos', 'registros', 'indicadores', 'ceo'];
      }
    }
    
    if (allowed.length > 0 && !allowed.includes(activeSection)) {
      setActiveSection('dashboard');
    }
  }, [user?.role, activeSection, permissions]);

  // Adicionar Log de Auditabilidade Geral (ISO 9001 7.5)
  const handleAddLog = (action: string, details: string, docId?: string) => {
    const newLog: ActivityLog = {
      id: `log-${Date.now()}`,
      usuarioEmail: user?.email || 'qualidade@vickytex.com.br',
      usuarioNome: user?.name || 'Mariana Silva',
      usuarioRole: user?.role || 'Qualidade',
      acao: action,
      detalhes: details,
      timestamp: new Date().toISOString(),
      documentoId: docId
    };
    setLogs((prev) => [newLog, ...prev]);
  };

  const handleClearAllData = () => {
    const keysToRemove = [
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
      'sgq_vickytex_users',
      'sgq_vickytex_permissions',
      'sgq_vickytex_registros'
    ];
    keysToRemove.forEach(k => localStorage.removeItem(k));

    setDocuments([]);
    setAudits([]);
    setNcs([]);
    setPlanos([]);
    setRiscos([]);
    setAuditorias5s([]);
    setEquipamentos([]);
    setColaboradores([]);
    setRegistros([]);
    setSuppliers([]);

    // Also attempt clearing remote Cloud Firestore collections
    const collectionsToClear = [
      'documents',
      'audits',
      'ncs',
      'action_plans',
      'risks',
      'audits_5s',
      'equipments',
      'collaborators',
      'records',
      'audit_logs'
    ];
    for (const coll of collectionsToClear) {
      clearCollectionDocs(coll).catch(() => {});
    }

    handleAddLog('ZERAR_BANCO', 'Banco de dados zerado. Todos os registros locais e remotos foram limpos.');
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
    try {
      const res = await UserRepository.update(updated.id, updated);
      if (res.success && res.data) {
        setUsers((prev) => prev.map((u) => (u.id === updated.id ? res.data : u)));
      } else {
        setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
      }
    } catch (e) {
      setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
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
          onAddAudit={handleAddAudit}
          onUpdateAudit={handleUpdateAudit}
          onDeleteAudit={handleDeleteAudit}
          onAddNC={handleAddNC}
          onUpdateNC={handleUpdateNC}
          onDeleteNC={handleDeleteNC}
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
        <CentroExcelencia personalizacao={personalizacao} />
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
