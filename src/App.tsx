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

import { Documento, ActivityLog, Auditoria, NaoConformidade, PlanoAcao, RiscoOportunidade, Auditoria5S, UserAccount, RolePermission, Equipamento, ColaboradorCompetencia, Registro } from './types';
import { INITIAL_DOCUMENTS, INITIAL_LOGS, INITIAL_AUDITORIAS, INITIAL_NAO_CONFORMIDADES, INITIAL_PLANOS_ACAO, INITIAL_RISCOS, INITIAL_5S_AUDITS, INITIAL_USER_ACCOUNTS, INITIAL_ROLE_PERMISSIONS, getPersonalizacaoGeral, PersonalizacaoGeral } from './utils/mockData';
import { DocumentRepository } from './services/database/repositories/document.repository';
import { AuditRepository } from './services/database/repositories/audit.repository';
import { FiveSRepository } from './services/database/repositories/fiveS.repository';
import { UserRepository } from './services/database/repositories/user.repository';

function AppContent() {
  const { user, needsAuth } = useAuth();
  
  // Estado de Personalizacao Geral do Sistema
  const [personalizacao, setPersonalizacao] = useState<PersonalizacaoGeral>(() => getPersonalizacaoGeral());

  // Estado Ativo das Páginas/Seções do SGQ
  const [activeSection, setActiveSection] = useState<'dashboard' | 'documentos' | 'auditorias' | 'riscos' | '5s' | 'integracao' | 'database' | 'treinamentos' | 'calibracao' | 'planos' | 'configuracoes' | 'usuarios' | 'registros' | 'fornecedores' | 'indicadores' | 'ceo'>('dashboard');
  
  // Estado Ativo das Entidades (Persistidos localmente na sessão do browser para interatividade perfeita)
  const [documents, setDocuments] = useState<Documento[]>(() => {
    const saved = localStorage.getItem('sgq_vickytex_documents');
    return saved ? JSON.parse(saved) : INITIAL_DOCUMENTS;
  });

  const [users, setUsers] = useState<UserAccount[]>(() => {
    const saved = localStorage.getItem('sgq_vickytex_users');
    return saved ? JSON.parse(saved) : INITIAL_USER_ACCOUNTS;
  });

  const [permissions, setPermissions] = useState<RolePermission[]>(() => {
    const saved = localStorage.getItem('sgq_vickytex_permissions');
    return saved ? JSON.parse(saved) : INITIAL_ROLE_PERMISSIONS;
  });

  const [logs, setLogs] = useState<ActivityLog[]>(() => {
    const saved = localStorage.getItem('sgq_vickytex_logs');
    return saved ? JSON.parse(saved) : INITIAL_LOGS;
  });

  const [audits, setAudits] = useState<Auditoria[]>(() => {
    const saved = localStorage.getItem('sgq_vickytex_audits');
    return saved ? JSON.parse(saved) : INITIAL_AUDITORIAS;
  });

  const [ncs, setNcs] = useState<NaoConformidade[]>(() => {
    const saved = localStorage.getItem('sgq_vickytex_ncs');
    return saved ? JSON.parse(saved) : INITIAL_NAO_CONFORMIDADES;
  });

  const [planos, setPlanos] = useState<PlanoAcao[]>(() => {
    const saved = localStorage.getItem('sgq_vickytex_planos');
    return saved ? JSON.parse(saved) : INITIAL_PLANOS_ACAO;
  });

  const [riscos, setRiscos] = useState<RiscoOportunidade[]>(() => {
    const saved = localStorage.getItem('sgq_vickytex_riscos');
    return saved ? JSON.parse(saved) : INITIAL_RISCOS;
  });

  const [auditorias5s, setAuditorias5s] = useState<Auditoria5S[]>(() => {
    const saved = localStorage.getItem('sgq_vickytex_auditorias5s') || localStorage.getItem('sgq_vickytex_auditorias_5s');
    const parsed: Auditoria5S[] = saved ? JSON.parse(saved) : INITIAL_5S_AUDITS;
    const seen = new Set<string>();
    return parsed.filter((a) => {
      if (!a || !a.id || seen.has(a.id)) return false;
      seen.add(a.id);
      return true;
    });
  });

  const [equipamentos, setEquipamentos] = useState<Equipamento[]>(() => {
    const saved = localStorage.getItem('sgq_vickytex_equipamentos');
    return saved ? JSON.parse(saved) : INITIAL_EQUIPAMENTOS;
  });

  const [colaboradores, setColaboradores] = useState<ColaboradorCompetencia[]>(() => {
    const saved = localStorage.getItem('sgq_vickytex_colaboradores');
    return saved ? JSON.parse(saved) : INITIAL_COLABORADORES;
  });

  const [registros, setRegistros] = useState<Registro[]>(() => {
    const saved = localStorage.getItem('sgq_vickytex_registros');
    return saved ? JSON.parse(saved) : INITIAL_REGISTROS;
  });

  const [selectedDocId, setSelectedDocId] = useState<string | undefined>(undefined);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('sgq_vickytex_registros', JSON.stringify(registros));
  }, [registros]);

  // Sincronizar estados no localStorage para excelente persistência cliente-servidor emulada
  useEffect(() => {
    const loadRealData = async () => {
      try {
        const [docRes, auditRes, fiveSRes, userRes] = await Promise.all([
          DocumentRepository.findAll(),
          AuditRepository.findAll(),
          FiveSRepository.findAll(),
          UserRepository.findAll()
        ]);
        
        if (docRes.success && docRes.data) {
          setDocuments(docRes.data);
        }
        if (auditRes.success && auditRes.data) {
          setAudits(auditRes.data);
        }
        if (fiveSRes.success && fiveSRes.data) {
          setAuditorias5s(fiveSRes.data);
        }
        if (userRes.success && userRes.data) {
          setUsers(userRes.data);
        }
      } catch (err) {
        console.error('Falha ao carregar dados reais dos repositórios:', err);
      }
    };
    loadRealData();
  }, []);

  useEffect(() => {
    localStorage.setItem('sgq_vickytex_documents', JSON.stringify(documents));
  }, [documents]);

  useEffect(() => {
    localStorage.setItem('sgq_vickytex_equipamentos', JSON.stringify(equipamentos));
  }, [equipamentos]);

  useEffect(() => {
    localStorage.setItem('sgq_vickytex_colaboradores', JSON.stringify(colaboradores));
  }, [colaboradores]);

  useEffect(() => {
    localStorage.setItem('sgq_vickytex_logs', JSON.stringify(logs));
  }, [logs]);

  useEffect(() => {
    localStorage.setItem('sgq_vickytex_audits', JSON.stringify(audits));
  }, [audits]);

  useEffect(() => {
    localStorage.setItem('sgq_vickytex_ncs', JSON.stringify(ncs));
  }, [ncs]);

  useEffect(() => {
    localStorage.setItem('sgq_vickytex_planos', JSON.stringify(planos));
  }, [planos]);

  useEffect(() => {
    localStorage.setItem('sgq_vickytex_riscos', JSON.stringify(riscos));
  }, [riscos]);

  useEffect(() => {
    localStorage.setItem('sgq_vickytex_auditorias5s', JSON.stringify(auditorias5s));
  }, [auditorias5s]);

  useEffect(() => {
    localStorage.setItem('sgq_vickytex_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('sgq_vickytex_permissions', JSON.stringify(permissions));
  }, [permissions]);

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
        allowed = ['dashboard', 'documentos', 'auditorias', 'riscos', '5s', 'treinamentos', 'calibracao', 'planos', 'configuracoes', 'usuarios', 'integracao', 'database', 'registros', 'fornecedores', 'indicadores'];
      } else if (user.role === 'Qualidade') {
        allowed = ['dashboard', 'documentos', 'auditorias', 'riscos', '5s', 'treinamentos', 'calibracao', 'planos', 'configuracoes', 'usuarios', 'registros', 'fornecedores', 'indicadores'];
      } else if (user.role === 'Supervisor') {
        allowed = ['dashboard', 'documentos', 'auditorias', '5s', 'treinamentos', 'calibracao', 'planos', 'registros', 'fornecedores', 'indicadores'];
      } else if (user.role === 'Colaborador') {
        allowed = ['dashboard', 'documentos', '5s', 'treinamentos', 'registros', 'indicadores'];
      } else if (user.role === 'Auditor') {
        allowed = ['dashboard', 'documentos', 'auditorias', 'riscos', '5s', 'planos', 'registros', 'fornecedores', 'indicadores'];
      } else {
        allowed = ['dashboard', 'documentos', 'registros', 'indicadores'];
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

  const handleResetToDemoData = () => {
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

    setDocuments(INITIAL_DOCUMENTS);
    setLogs(INITIAL_LOGS);
    setAudits(INITIAL_AUDITORIAS);
    setNcs(INITIAL_NAO_CONFORMIDADES);
    setPlanos(INITIAL_PLANOS_ACAO);
    setRiscos(INITIAL_RISCOS);
    setAuditorias5s(INITIAL_5S_AUDITS);
    setUsers(INITIAL_USER_ACCOUNTS);
    setPermissions(INITIAL_ROLE_PERMISSIONS);
    setEquipamentos(INITIAL_EQUIPAMENTOS);
    setColaboradores(INITIAL_COLABORADORES);
    setRegistros(INITIAL_REGISTROS);

    handleAddLog('RESTAURAR_BANCO', 'Banco de dados restaurado para os dados demonstrativos padrão ISO 9001.');
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

    handleAddLog('ZERAR_BANCO', 'Banco de dados zerado. Todos os registros locais foram limpos.');
  };

  const handleAddDocument = async (doc: Documento) => {
    try {
      const res = await DocumentRepository.create(doc);
      if (res.success && res.data) {
        setDocuments((prev) => [res.data, ...prev]);
      } else {
        setDocuments((prev) => [doc, ...prev]);
      }
    } catch (e) {
      setDocuments((prev) => [doc, ...prev]);
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
      if (res.success && res.data) {
        setAudits((prev) => [res.data, ...prev]);
      } else {
        setAudits((prev) => [audit, ...prev]);
      }
    } catch (e) {
      setAudits((prev) => [audit, ...prev]);
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

  const handleAddNC = (nc: NaoConformidade) => {
    setNcs((prev) => [nc, ...prev]);
  };

  const handleUpdateNC = (updated: NaoConformidade) => {
    setNcs((prev) => prev.map((n) => (n.id === updated.id ? updated : n)));
  };

  const handleDeleteNC = (id: string) => {
    setNcs((prev) => prev.filter((n) => n.id !== id));
  };

  const handleAddPlano = (plano: PlanoAcao) => {
    setPlanos((prev) => [plano, ...prev]);
  };

  const handleUpdatePlano = (updated: PlanoAcao) => {
    setPlanos((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
  };

  const handleDeletePlano = (id: string) => {
    setPlanos((prev) => prev.filter((p) => p.id !== id));
  };

  const handleAddRisco = (risco: RiscoOportunidade) => {
    setRiscos((prev) => [risco, ...prev]);
  };

  const handleUpdateRisco = (updated: RiscoOportunidade) => {
    setRiscos((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
  };

  const handleDeleteRisco = (id: string) => {
    setRiscos((prev) => prev.filter((r) => r.id !== id));
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

  const handleUpdatePermissions = (updatedPerms: RolePermission[]) => {
    setPermissions(updatedPerms);
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
          onResetToDemoData={handleResetToDemoData}
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
