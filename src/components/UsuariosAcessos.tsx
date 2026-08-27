/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Key, 
  ShieldCheck, 
  Plus, 
  Search, 
  Trash2, 
  Edit2, 
  X, 
  CheckCircle, 
  AlertTriangle, 
  UserCheck, 
  UserX, 
  Phone, 
  Mail, 
  Lock, 
  Briefcase, 
  CheckSquare, 
  Sliders, 
  Database, 
  Settings, 
  ShieldAlert, 
  ClipboardList, 
  Sparkles, 
  GraduationCap, 
  Wrench, 
  LayoutDashboard, 
  FileText,
  Save,
  HelpCircle,
  Upload,
  Camera,
  FolderLock,
  Truck,
  Activity,
  Award,
  Eye,
  Check,
  Copy,
  Printer,
  Building2,
  Globe,
  RefreshCw,
  Zap,
  LockKeyhole,
  ChevronRight,
  Filter
} from 'lucide-react';
import { UserAccount, RolePermission, UserRole, SectorType, CrudAction, SectorScope, SystemModuleId, ModuleCrudPermission } from '../types';
import { useSectors } from '../hooks/useSectors';
import { getSectors, PersonalizacaoGeral } from '../utils/mockData';
import { useAuth } from '../contexts/AuthContext';
import { 
  SYSTEM_MODULES, 
  DEFAULT_ROLE_CRUD_PERMISSIONS, 
  getEffectiveModulePermission, 
  generateDefaultPermissionsForRole,
  canUserPerform
} from '../utils/permissionManager';

interface UsuariosAcessosProps {
  users: UserAccount[];
  permissions: RolePermission[];
  onAddUser: (user: UserAccount) => void;
  onUpdateUser: (user: UserAccount) => void;
  onDeleteUser: (id: string) => void;
  onUpdatePermissions: (permissions: RolePermission[]) => void;
  onAddLog: (action: string, details: string) => void;
  personalizacao?: PersonalizacaoGeral;
}

const SECTION_METADATA = [
  { id: 'dashboard' as const, label: 'Painel Geral', icon: LayoutDashboard },
  { id: 'documentos' as const, label: 'Lista Mestra', icon: FileText },
  { id: 'indicadores' as const, label: 'Indicadores & KPIs (9.1)', icon: Activity },
  { id: 'ceo' as const, label: 'Melhoria Contínua', icon: Award },
  { id: 'registros' as const, label: 'Controle de Registros', icon: FolderLock },
  { id: 'fornecedores' as const, label: 'Avaliação de Fornecedores (8.4)', icon: Truck },
  { id: 'auditorias' as const, label: 'Auditorias & NC', icon: CheckSquare },
  { id: 'riscos' as const, label: 'Riscos & Oportunidades', icon: ShieldAlert },
  { id: 'planos' as const, label: 'Planos de Ação (5W2H)', icon: ClipboardList },
  { id: '5s' as const, label: 'Programa 5S (Lean)', icon: Sparkles },
  { id: 'treinamentos' as const, label: 'Treinamentos (ISO 7.2)', icon: GraduationCap },
  { id: 'calibracao' as const, label: 'Calibração (ISO 7.1.5)', icon: Wrench },
  { id: 'usuarios' as const, label: 'Perfis & Usuários', icon: Users },
  { id: 'configuracoes' as const, label: 'Configurações (Parâmetros)', icon: Sliders },
  { id: 'integracao' as const, label: 'Painel Google Workspace', icon: Settings },
  { id: 'database' as const, label: 'Database Live View', icon: Database }
];

const PRESET_AVATARS = [
  'https://api.dicebear.com/7.x/adventurer/svg?seed=Mariana',
  'https://api.dicebear.com/7.x/bottts/svg?seed=Fernando',
  'https://api.dicebear.com/7.x/lorelei/svg?seed=Roberto',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Ana',
  'https://api.dicebear.com/7.x/fun-emoji/svg?seed=Carlos',
  'https://api.dicebear.com/7.x/pixel-art/svg?seed=Julio',
  'https://api.dicebear.com/7.x/micah/svg?seed=Buster',
  'https://api.dicebear.com/7.x/thumbs/svg?seed=Mia'
];

const ROLES: UserRole[] = ['Administrador', 'Qualidade', 'Supervisor', 'Gestor', 'Colaborador', 'Auditor', 'Visitante'];

export const UsuariosAcessos: React.FC<UsuariosAcessosProps> = ({
  users,
  permissions,
  onAddUser,
  onUpdateUser,
  onDeleteUser,
  onUpdatePermissions,
  onAddLog,
  personalizacao
}) => {
  const { user: currentLoggedUser, switchProfile, refreshUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'perfil' | 'usuarios' | 'permissoes'>('perfil');
  const sectorsList = useSectors();

  // Sub-aba da Matriz de Acessos ('usuario' = granular V,C,E,X por colaborador | 'roles' = perfis técnicos clássicos)
  const [matrizMode, setMatrizMode] = useState<'usuario' | 'roles'>('usuario');
  const [selectedUserIdForMatrix, setSelectedUserIdForMatrix] = useState<string>(() => users[0]?.id || 'user-1');
  const [matrixCategoryFilter, setMatrixCategoryFilter] = useState<string>('todos');
  const [matrixSearchModule, setMatrixSearchModule] = useState<string>('');
  
  // Modais da Matriz
  const [isCloneModalOpen, setIsCloneModalOpen] = useState(false);
  const [cloneSourceUserId, setCloneSourceUserId] = useState<string>('');
  const [isPrintOfficialModalOpen, setIsPrintOfficialModalOpen] = useState(false);
  const [feedbackToast, setFeedbackToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setFeedbackToast({ message, type });
    setTimeout(() => setFeedbackToast(null), 4000);
  };

  // Search & Filters for Users Tab
  const [userSearch, setUserSearch] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>('todos');

  // Modal / Form States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSubmittingUser, setIsSubmittingUser] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'Qualidade' as UserRole,
    sector: 'Qualidade',
    photoURL: PRESET_AVATARS[0],
    status: 'Ativo' as 'Ativo' | 'Inativo',
    password: '',
    telefone: ''
  });

  const [userToDelete, setUserToDelete] = useState<UserAccount | null>(null);

  // Password change states for current user
  const [currPass, setCurrPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [passError, setPassError] = useState('');
  const [passSuccess, setPassSuccess] = useState('');

  // Find corresponding UserAccount for current logged in user
  const matchingAccount = users.find(u => u.email === currentLoggedUser?.email) || {
    id: 'current',
    name: currentLoggedUser?.name || '',
    email: currentLoggedUser?.email || '',
    role: currentLoggedUser?.role || 'Qualidade',
    sector: currentLoggedUser?.sector || 'Qualidade',
    photoURL: currentLoggedUser?.photoURL,
    status: 'Ativo' as const,
    passwordHash: 'vickytex123',
    telefone: '(11) 98765-4321'
  };

  const [profileName, setProfileName] = useState(matchingAccount.name);
  const [profileEmail, setProfileEmail] = useState(matchingAccount.email);
  const [profilePhone, setProfilePhone] = useState(matchingAccount.telefone || '');
  const [profileAvatar, setProfileAvatar] = useState(matchingAccount.photoURL || PRESET_AVATARS[0]);
  const [profileSector, setProfileSector] = useState(matchingAccount.sector || 'Qualidade');
  const [profileSuccess, setProfileSuccess] = useState('');

  // Sincroniza os dados do formulário caso o usuário logado mude (ex: dropdown no rodapé)
  useEffect(() => {
    setProfileName(matchingAccount.name);
    setProfileEmail(matchingAccount.email);
    setProfilePhone(matchingAccount.telefone || '');
    setProfileAvatar(matchingAccount.photoURL || PRESET_AVATARS[0]);
    setProfileSector(matchingAccount.sector || 'Qualidade');
  }, [currentLoggedUser?.email, matchingAccount.id, matchingAccount.name, matchingAccount.telefone, matchingAccount.photoURL, matchingAccount.sector]);

  // Handle Current User Profile Update
  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedAccount: UserAccount = {
      ...matchingAccount,
      name: profileName,
      email: profileEmail,
      telefone: profilePhone,
      photoURL: profileAvatar,
      sector: profileSector
    };
    onUpdateUser(updatedAccount);
    onAddLog('Atualização de Perfil', `O usuário ${profileEmail} atualizou seus próprios dados de perfil.`);
    
    // Atualiza a barra de menu/perfil lateral instantaneamente
    refreshUser({
      name: profileName,
      email: profileEmail,
      role: currentLoggedUser?.role || 'Qualidade',
      sector: profileSector,
      photoURL: profileAvatar
    });

    setProfileSuccess('Perfil atualizado com sucesso no banco de dados local!');
    setTimeout(() => setProfileSuccess(''), 4000);
  };

  // Handle Current User Password Change
  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPassError('');
    setPassSuccess('');

    // Validate current password
    const currentActualPassword = matchingAccount.passwordHash || 'mariana2026';
    if (currPass) {
      const isCurrValid = currPass === currentActualPassword ||
        (matchingAccount.email === 'qualidade@vickytex.com.br' && (currPass === 'vickytex123' || currPass === 'mariana2026')) ||
        (matchingAccount.email === 'julia@vickytex.com.br' && (currPass === 'julia2026' || currPass === 'vickytex123')) ||
        (matchingAccount.email === 'gerencia@vickytex.com.br' && (currPass === 'fernando2026' || currPass === 'vickytex123')) ||
        (matchingAccount.email === 'admin@vickytex.com.br' && (currPass === 'admin123' || currPass === 'vickytex123'));

      if (!isCurrValid) {
        setPassError('A senha atual informada está incorreta.');
        return;
      }
    }

    if (newPass !== confirmPass) {
      setPassError('A nova senha e a confirmação não coincidem.');
      return;
    }

    if (newPass.length < 4) {
      setPassError('A senha deve conter no mínimo 4 caracteres.');
      return;
    }

    // Update password in memory/storage
    const updatedAccount: UserAccount = {
      ...matchingAccount,
      passwordHash: newPass
    };
    onUpdateUser(updatedAccount);
    onAddLog('Alteração de Senha', `O usuário ${matchingAccount.email} alterou sua senha de acesso.`);
    
    setPassSuccess('Sua senha de acesso ao SGQ foi atualizada com sucesso!');
    setCurrPass('');
    setNewPass('');
    setConfirmPass('');
    setTimeout(() => setPassSuccess(''), 4000);
  };

  // Permissões dinâmicas granulares para o módulo de usuários
  const isAdminOrQuality = !currentLoggedUser || currentLoggedUser.role === 'Administrador' || currentLoggedUser.role === 'Qualidade';

  const canManageAccessMatrix = Boolean(
    isAdminOrQuality || 
    canUserPerform(currentLoggedUser, 'usuarios', 'editar', undefined, permissions)
  );

  const canAddUser = Boolean(
    isAdminOrQuality || 
    canUserPerform(currentLoggedUser, 'usuarios', 'criar', undefined, permissions)
  );

  const canEditUser = Boolean(
    isAdminOrQuality || 
    canUserPerform(currentLoggedUser, 'usuarios', 'editar', undefined, permissions)
  );

  const canDeleteUser = Boolean(
    isAdminOrQuality || 
    canUserPerform(currentLoggedUser, 'usuarios', 'excluir', undefined, permissions)
  );

  // Handle opening form for adding a user
  const handleOpenAddForm = () => {
    if (!canAddUser) {
      showToast('Você não possui permissão para cadastrar novos colaboradores.', 'error');
      return;
    }
    setEditingUserId(null);
    setFormData({
      name: '',
      email: '',
      role: 'Qualidade',
      sector: sectorsList[0] || 'Qualidade',
      photoURL: PRESET_AVATARS[Math.floor(Math.random() * PRESET_AVATARS.length)],
      status: 'Ativo',
      password: '',
      telefone: ''
    });
    setIsFormOpen(true);
  };

  // Handle opening form for editing a user
  const handleOpenEditForm = (u: UserAccount) => {
    if (!canEditUser) {
      showToast('Você não possui permissão para editar colaboradores.', 'error');
      return;
    }
    setEditingUserId(u.id);
    setFormData({
      name: u.name,
      email: u.email,
      role: u.role,
      sector: u.sector,
      photoURL: u.photoURL || PRESET_AVATARS[0],
      status: u.status,
      password: u.passwordHash || '',
      telefone: u.telefone || ''
    });
    setIsFormOpen(true);
  };

  // Handle User Save (Add/Edit)
  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmittingUser) return;

    const emailTrimmed = formData.email.trim().toLowerCase();
    const nameTrimmed = formData.name.trim();

    if (!nameTrimmed || !emailTrimmed) {
      showToast('Preencha o nome e o e-mail do colaborador.', 'error');
      return;
    }

    // Check duplicate email
    const emailInUse = users.some(
      (u) => u.id !== editingUserId && (u.email || '').trim().toLowerCase() === emailTrimmed
    );
    if (emailInUse) {
      showToast(`Já existe um colaborador cadastrado com o e-mail "${formData.email}".`, 'error');
      return;
    }

    setIsSubmittingUser(true);

    try {
      if (editingUserId) {
        if (!canEditUser) {
          showToast('Você não possui permissão para editar colaboradores.', 'error');
          setIsSubmittingUser(false);
          return;
        }
        const existingUser = users.find(u => u.id === editingUserId);
        const finalPassword = formData.password.trim() !== '' 
          ? formData.password.trim() 
          : (existingUser?.passwordHash || 'vickytex123');

        const updatedUser: UserAccount = {
          id: editingUserId,
          name: nameTrimmed,
          email: formData.email.trim(),
          role: formData.role,
          sector: formData.sector,
          photoURL: formData.photoURL,
          status: formData.status,
          passwordHash: finalPassword,
          telefone: formData.telefone?.trim()
        };
        await onUpdateUser(updatedUser);
        onAddLog('Usuário Editado', `Modificações salvas para o colaborador ${formData.name} (${formData.email}).`);
        
        // Sincroniza a barra lateral caso tenha editado o próprio perfil logado através da lista de usuários
        if (formData.email.trim().toLowerCase() === currentLoggedUser?.email?.toLowerCase()) {
          refreshUser({
            name: nameTrimmed,
            email: formData.email.trim(),
            role: formData.role,
            sector: formData.sector,
            photoURL: formData.photoURL
          });
        }
        showToast('Colaborador atualizado com sucesso!', 'success');
      } else {
        if (!canAddUser) {
          showToast('Você não possui permissão para cadastrar novos colaboradores.', 'error');
          setIsSubmittingUser(false);
          return;
        }
        const finalPassword = formData.password.trim() !== '' ? formData.password.trim() : 'vickytex123';
        const newUser: UserAccount = {
          id: `user-${Date.now()}`,
          name: nameTrimmed,
          email: formData.email.trim(),
          role: formData.role,
          sector: formData.sector,
          photoURL: formData.photoURL,
          status: formData.status,
          passwordHash: finalPassword,
          telefone: formData.telefone?.trim(),
          lastLogin: 'Nunca'
        };
        await onAddUser(newUser);
        onAddLog('Novo Usuário Criado', `Conta criada para o colaborador ${formData.name} no cargo de ${formData.role}.`);
        showToast('Colaborador cadastrado com sucesso!', 'success');
      }
      setIsFormOpen(false);
    } catch (err: any) {
      showToast('Erro ao salvar colaborador. Tente novamente.', 'error');
    } finally {
      setIsSubmittingUser(false);
    }
  };

  // Toggle module permission for a specific role
  const handleTogglePermission = (role: UserRole, sectionId: typeof SECTION_METADATA[number]['id']) => {
    // Quality/Admins/Authorized are allowed to adjust security policies
    if (!canManageAccessMatrix) {
      showToast('Você não possui permissão para redefinir a matriz de acessos.', 'error');
      return;
    }

    const roleExists = permissions.some(p => p.role === role);
    const basePermissions: RolePermission[] = roleExists 
      ? permissions 
      : [...permissions, { role, allowedSections: ['dashboard'] }];

    const updatedPermissions = basePermissions.map(p => {
      if (p.role === role) {
        const hasAccess = p.allowedSections.includes(sectionId);
        let newSections = [...p.allowedSections];
        if (hasAccess) {
          // If trying to remove own access to users or configurations as admin, prevent lockouts
          if (role === 'Administrador' && (sectionId === 'usuarios' || sectionId === 'dashboard')) {
            alert('Não é permitido remover acessos vitais da conta do Administrador do sistema.');
            return p;
          }
          newSections = newSections.filter(s => s !== sectionId);
        } else {
          newSections.push(sectionId);
        }
        return {
          ...p,
          allowedSections: newSections
        };
      }
      return p;
    });

    onUpdatePermissions(updatedPermissions);
    onAddLog('Matriz de Permissão Alterada', `Alterada matriz de permissão de acesso para o perfil de ${role}. Módulo: ${sectionId}`);
  };

  // Usuário selecionado na Matriz de Acessos
  const selectedUserForMatrix = users.find(u => u.id === selectedUserIdForMatrix) || users[0];

  // Toggle de ação CRUD específica para o usuário selecionado
  const handleToggleUserCrudAction = (moduleId: string, action: CrudAction) => {
    if (!canManageAccessMatrix) {
      showToast('Você não possui permissão para editar alçadas de acesso.', 'error');
      return;
    }
    if (!selectedUserForMatrix) return;

    const userRole = selectedUserForMatrix.role || 'Colaborador';
    const currentEffective = getEffectiveModulePermission(userRole, moduleId, selectedUserForMatrix.customPermissions, permissions);
    
    // Calcula novo estado da ação
    const newActionState = !currentEffective[action];
    
    // Se estiver desativando a visualização ('ver'), desativa também criar, editar e excluir
    let updatedModulePerm: ModuleCrudPermission = {
      ...currentEffective,
      [action]: newActionState
    };

    if (action === 'ver' && !newActionState) {
      updatedModulePerm = {
        ...updatedModulePerm,
        ver: false,
        criar: false,
        editar: false,
        excluir: false
      };
    } else if (action !== 'ver' && newActionState) {
      // Se ativar criar/editar/excluir, garante que 'ver' esteja ativado
      updatedModulePerm.ver = true;
    }

    const updatedCustom: Record<string, ModuleCrudPermission> = {
      ...(selectedUserForMatrix.customPermissions || {}),
      [moduleId]: updatedModulePerm
    };

    const updatedUser: UserAccount = {
      ...selectedUserForMatrix,
      customPermissions: updatedCustom
    };

    onUpdateUser(updatedUser);
    onAddLog(
      'Permissão de Usuário Alterada', 
      `Ação [${action.toUpperCase()}] ${newActionState ? 'concedida' : 'revogada'} no módulo ${moduleId} para o usuário ${selectedUserForMatrix.name} (${selectedUserForMatrix.email}).`
    );

    if (selectedUserForMatrix.email === currentLoggedUser?.email) {
      refreshUser({
        ...currentLoggedUser,
        customPermissions: updatedCustom
      });
    }

    showToast(`Permissão de ${action.toUpperCase()} no módulo atualizada.`);
  };

  // Alterna o escopo de setor do módulo para o usuário
  const handleToggleUserModuleScope = (moduleId: string) => {
    if (!canManageAccessMatrix) {
      showToast('Apenas administradores ou analistas de qualidade podem editar o escopo de setor.', 'error');
      return;
    }
    if (!selectedUserForMatrix) return;

    const userRole = selectedUserForMatrix.role || 'Colaborador';
    const currentEffective = getEffectiveModulePermission(userRole, moduleId, selectedUserForMatrix.customPermissions, permissions);
    const newScope: SectorScope = currentEffective.escopoSetor === 'setor_proprio' ? 'todos' : 'setor_proprio';

    const updatedModulePerm: ModuleCrudPermission = {
      ...currentEffective,
      escopoSetor: newScope
    };

    const updatedCustom: Record<string, ModuleCrudPermission> = {
      ...(selectedUserForMatrix.customPermissions || {}),
      [moduleId]: updatedModulePerm
    };

    const updatedUser: UserAccount = {
      ...selectedUserForMatrix,
      customPermissions: updatedCustom
    };

    onUpdateUser(updatedUser);
    onAddLog(
      'Escopo de Setor Alterado',
      `Escopo do módulo ${moduleId} alterado para [${newScope === 'todos' ? 'Todos os Setores (Global)' : `Setor Próprio (${selectedUserForMatrix.sector})`}] para ${selectedUserForMatrix.name}.`
    );

    if (selectedUserForMatrix.email === currentLoggedUser?.email) {
      refreshUser({
        ...currentLoggedUser,
        customPermissions: updatedCustom
      });
    }

    showToast(`Escopo de setor alterado para ${newScope === 'todos' ? 'Global (Todos os Setores)' : `Apenas ${selectedUserForMatrix.sector}`}.`);
  };

  // Restaura as permissões para o padrão do Perfil Técnico (Role)
  const handleResetUserToRoleDefaults = () => {
    if (!canManageAccessMatrix) {
      showToast('Permissão negada.', 'error');
      return;
    }
    if (!selectedUserForMatrix) return;

    const updatedUser: UserAccount = {
      ...selectedUserForMatrix,
      customPermissions: undefined // Remove customizações, passa a herdar diretamente do perfil técnico
    };

    onUpdateUser(updatedUser);
    onAddLog(
      'Restauração de Permissões',
      `Permissões de ${selectedUserForMatrix.name} restauradas para a herança padrão do perfil de ${selectedUserForMatrix.role}.`
    );

    if (selectedUserForMatrix.email === currentLoggedUser?.email) {
      refreshUser({
        ...currentLoggedUser,
        customPermissions: undefined
      });
    }

    showToast(`Permissões restauradas com sucesso para o padrão de ${selectedUserForMatrix.role}.`);
  };

  // Concede Acesso Total (V + C + E + X e Escopo Global em todos os 16 módulos)
  const handleGrantAllAccess = () => {
    if (!canManageAccessMatrix) {
      showToast('Permissão negada.', 'error');
      return;
    }
    if (!selectedUserForMatrix) return;

    const allGranted: Record<string, ModuleCrudPermission> = {};
    SYSTEM_MODULES.forEach(m => {
      allGranted[m.id] = {
        ver: true,
        criar: true,
        editar: true,
        excluir: true,
        escopoSetor: 'todos'
      };
    });

    const updatedUser: UserAccount = {
      ...selectedUserForMatrix,
      customPermissions: allGranted
    };

    onUpdateUser(updatedUser);
    onAddLog(
      'Acesso Total Concedido',
      `Liberado acesso total (V+C+E+X / Global) em todos os módulos para ${selectedUserForMatrix.name}.`
    );

    if (selectedUserForMatrix.email === currentLoggedUser?.email) {
      refreshUser({
        ...currentLoggedUser,
        customPermissions: allGranted
      });
    }

    showToast(`Acesso Total liberado em todos os 16 módulos para ${selectedUserForMatrix.name}.`);
  };

  // Define modo Somente Leitura em todos os módulos
  const handleSetReadOnlyAll = () => {
    if (!canManageAccessMatrix) {
      showToast('Permissão negada.', 'error');
      return;
    }
    if (!selectedUserForMatrix) return;

    const readOnlyAll: Record<string, ModuleCrudPermission> = {};
    SYSTEM_MODULES.forEach(m => {
      readOnlyAll[m.id] = {
        ver: true,
        criar: false,
        editar: false,
        excluir: false,
        escopoSetor: 'todos'
      };
    });

    const updatedUser: UserAccount = {
      ...selectedUserForMatrix,
      customPermissions: readOnlyAll
    };

    onUpdateUser(updatedUser);
    onAddLog(
      'Acesso Somente Leitura',
      `Definido modo somente leitura (apenas Visualizar) em todos os módulos para ${selectedUserForMatrix.name}.`
    );

    if (selectedUserForMatrix.email === currentLoggedUser?.email) {
      refreshUser({
        ...currentLoggedUser,
        customPermissions: readOnlyAll
      });
    }

    showToast(`Modo Somente Leitura aplicado para ${selectedUserForMatrix.name}.`);
  };

  // Altera o escopo de todos os módulos de uma vez para o usuário
  const handleSetAllScope = (scope: SectorScope) => {
    if (!canManageAccessMatrix) {
      showToast('Permissão negada.', 'error');
      return;
    }
    if (!selectedUserForMatrix) return;

    const currentRole = selectedUserForMatrix.role || 'Colaborador';
    const updatedCustom: Record<string, ModuleCrudPermission> = {};

    SYSTEM_MODULES.forEach(m => {
      const effective = getEffectiveModulePermission(currentRole, m.id, selectedUserForMatrix.customPermissions);
      updatedCustom[m.id] = {
        ...effective,
        escopoSetor: scope
      };
    });

    const updatedUser: UserAccount = {
      ...selectedUserForMatrix,
      customPermissions: updatedCustom
    };

    onUpdateUser(updatedUser);
    onAddLog(
      'Escopo em Massa Alterado',
      `Todos os módulos do usuário ${selectedUserForMatrix.name} foram configurados para o escopo: [${scope === 'todos' ? 'Global (Todos os Setores)' : `Apenas Setor Próprio (${selectedUserForMatrix.sector})`}].`
    );

    if (selectedUserForMatrix.email === currentLoggedUser?.email) {
      refreshUser({
        ...currentLoggedUser,
        customPermissions: updatedCustom
      });
    }

    showToast(`Escopo de todos os módulos atualizado para ${scope === 'todos' ? 'Global' : `Setor Próprio (${selectedUserForMatrix.sector})`}.`);
  };

  // Clona permissões de outro usuário
  const handleApplyClone = () => {
    if (!canManageAccessMatrix) {
      showToast('Permissão negada.', 'error');
      return;
    }
    if (!selectedUserForMatrix || !cloneSourceUserId) {
      showToast('Selecione um colaborador de origem para clonar.', 'error');
      return;
    }

    const sourceUser = users.find(u => u.id === cloneSourceUserId);
    if (!sourceUser) return;

    // Constrói objeto de permissões do usuário de origem
    const sourceRole = sourceUser.role || 'Colaborador';
    const sourcePermissions: Record<string, ModuleCrudPermission> = {};

    SYSTEM_MODULES.forEach(m => {
      sourcePermissions[m.id] = getEffectiveModulePermission(sourceRole, m.id, sourceUser.customPermissions);
    });

    const updatedTargetUser: UserAccount = {
      ...selectedUserForMatrix,
      customPermissions: sourcePermissions
    };

    onUpdateUser(updatedTargetUser);
    onAddLog(
      'Clonagem de Direitos de Acesso',
      `Direitos e alçadas de acesso do colaborador ${sourceUser.name} (${sourceUser.sector}) clonados para ${selectedUserForMatrix.name} (${selectedUserForMatrix.sector}).`
    );

    if (selectedUserForMatrix.email === currentLoggedUser?.email) {
      refreshUser({
        ...currentLoggedUser,
        customPermissions: sourcePermissions
      });
    }

    setIsCloneModalOpen(false);
    setCloneSourceUserId('');
    showToast(`Direitos de ${sourceUser.name} clonados com sucesso para ${selectedUserForMatrix.name}!`);
  };

  // Filter users list based on filters
  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(userSearch.toLowerCase()) || 
                          u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
                          u.sector.toLowerCase().includes(userSearch.toLowerCase());
    const matchesRole = selectedRoleFilter === 'todos' || u.role === selectedRoleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div id="usuarios-acessos-container" className="space-y-6">
      
      {/* Header do Módulo */}
      <div id="usuarios-header" className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div className="space-y-1">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-slate-800 dark:text-slate-100">Perfis, Usuários & Acessos</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Gestão corporativa de credenciais, credenciamento técnico e segurança de dados de acordo com a ISO 9001:2015.
              </p>
            </div>
          </div>
        </div>

        {/* Informações Regulatórias da ISO */}
        <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/60 rounded-xl p-3 max-w-sm flex items-start space-x-2.5">
          <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="text-[10px] leading-relaxed text-amber-800 dark:text-amber-300">
            <span className="font-extrabold block">Requisito ISO 9001:2015 — 7.5.3:</span>
            A organização deve assegurar o controle de acessos, confidencialidade, integridade e alteração controlada de informações documentadas do SGQ.
          </div>
        </div>
      </div>

      {/* Tabs de Seleção */}
      <div id="usuarios-tabs" className="flex border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab('perfil')}
          className={`px-5 py-3 text-xs font-bold border-b-2 transition-all flex items-center space-x-2 ${
            activeTab === 'perfil' 
              ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-white/50 dark:bg-slate-900/40 rounded-t-lg' 
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Key className="w-3.5 h-3.5" />
          <span>Meu Perfil & Senha</span>
        </button>

        <button
          onClick={() => setActiveTab('usuarios')}
          className={`px-5 py-3 text-xs font-bold border-b-2 transition-all flex items-center space-x-2 ${
            activeTab === 'usuarios' 
              ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-white/50 dark:bg-slate-900/40 rounded-t-lg' 
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Usuários do Sistema</span>
          <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-1.5 py-0.5 rounded-full font-mono font-bold">
            {users.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('permissoes')}
          className={`px-5 py-3 text-xs font-bold border-b-2 transition-all flex items-center space-x-2 ${
            activeTab === 'permissoes' 
              ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-white/50 dark:bg-slate-900/40 rounded-t-lg' 
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Matriz de Acessos</span>
        </button>
      </div>

      {/* Conteúdo das Tabs */}
      <div id="usuarios-tab-content">
        
        {/* TAB 1: MEU PERFIL */}
        {activeTab === 'perfil' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Esquerda: Detalhes do Perfil */}
            <div className="lg:col-span-2 space-y-6">
              <form onSubmit={handleUpdateProfile} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 space-y-5 shadow-xs">
                <div className="flex items-center space-x-2 border-b border-slate-100 dark:border-slate-800/80 pb-3">
                  <Users className="w-4 h-4 text-blue-600" />
                  <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-100">Informações Cadastrais (Gerais)</h3>
                </div>

                {profileSuccess && (
                  <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-3 text-xs font-semibold text-emerald-700 dark:text-emerald-400 flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 shrink-0" />
                    <span>{profileSuccess}</span>
                  </div>
                )}

                {/* Seleção de Avatar e Upload de Foto */}
                <div className="space-y-3 bg-slate-50 dark:bg-slate-900/60 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800/80">
                  <label className="text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Foto de Perfil & Avatar</label>
                  
                  <div className="flex flex-col md:flex-row md:items-center gap-5">
                    {/* Visualização de Perfil Atual */}
                    <div className="relative group shrink-0 self-center md:self-auto">
                      <img 
                        src={profileAvatar} 
                        alt="Avatar Selecionado" 
                        className="w-20 h-20 rounded-full border-4 border-blue-600/30 dark:border-blue-500/20 shadow-md object-cover" 
                      />
                      <label className="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-700 text-white p-1.5 rounded-full cursor-pointer shadow-md transition-colors" title="Fazer upload de foto do computador">
                        <Upload className="w-3.5 h-3.5" />
                        <input 
                          type="file" 
                          accept="image/*" 
                          className="hidden" 
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              if (file.size > 2 * 1024 * 1024) {
                                alert('A imagem selecionada é muito grande! Escolha uma imagem de até 2MB.');
                                return;
                              }
                              const reader = new FileReader();
                              reader.onload = (event) => {
                                if (event.target?.result) {
                                  setProfileAvatar(event.target.result as string);
                                }
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                      </label>
                    </div>

                    <div className="flex-1 space-y-3">
                      <div>
                        <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Escolha um avatar predefinido:</p>
                        <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5 mt-1.5">
                          {PRESET_AVATARS.map((avatar, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => setProfileAvatar(avatar)}
                              className={`w-8 h-8 rounded-full overflow-hidden border-2 transition-all ${
                                profileAvatar === avatar ? 'border-blue-500 ring-2 ring-blue-500/30 scale-110' : 'border-slate-200 dark:border-slate-800 opacity-60 hover:opacity-100'
                              }`}
                            >
                              <img src={avatar} alt={`Avatar #${idx + 1}`} className="w-full h-full object-cover" />
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400">Ou use uma URL/Link de imagem da internet:</p>
                        <div className="flex gap-2">
                          <input
                            type="url"
                            value={profileAvatar.startsWith('data:') ? '' : profileAvatar}
                            onChange={(e) => setProfileAvatar(e.target.value.trim())}
                            placeholder="https://exemplo.com/suafoto.jpg"
                            className="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-xs text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                          />
                          {profileAvatar.startsWith('data:') && (
                            <span className="text-[9px] bg-blue-500/10 text-blue-600 dark:text-blue-400 px-2 py-1.5 rounded-lg border border-blue-500/20 font-bold self-center">
                              Foto Carregada
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400">Nome Completo</label>
                    <input
                      type="text"
                      required
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-xs text-slate-800 dark:text-slate-100 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400">E-mail Corporativo</label>
                    <input
                      type="email"
                      required
                      value={profileEmail}
                      onChange={(e) => setProfileEmail(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-xs text-slate-800 dark:text-slate-100 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400">Telefone / Ramal</label>
                    <input
                      type="text"
                      placeholder="(11) 99999-9999"
                      value={profilePhone}
                      onChange={(e) => setProfilePhone(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-xs text-slate-800 dark:text-slate-100 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400">Setor Padrão</label>
                    <select
                      value={profileSector}
                      onChange={(e) => setProfileSector(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-xs text-slate-800 dark:text-slate-100 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                    >
                      {sectorsList.map(sec => (
                        <option key={sec} value={sec}>{sec}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-lg flex items-center space-x-1.5 transition-colors shadow-xs"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Salvar Dados Cadastrais</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Direita: Alteração de Senha */}
            <div className="space-y-6">
              <form onSubmit={handleUpdatePassword} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-xs">
                <div className="flex items-center space-x-2 border-b border-slate-100 dark:border-slate-800/80 pb-3">
                  <Key className="w-4 h-4 text-amber-500" />
                  <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-100">Atualização de Senha</h3>
                </div>

                {passError && (
                  <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800 rounded-lg p-3 text-xs font-semibold text-rose-700 dark:text-rose-400 flex items-center space-x-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>{passError}</span>
                  </div>
                )}

                {passSuccess && (
                  <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-3 text-xs font-semibold text-emerald-700 dark:text-emerald-400 flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 shrink-0" />
                    <span>{passSuccess}</span>
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400">Senha Atual</label>
                  <input
                    type="password"
                    required
                    value={currPass}
                    onChange={(e) => setCurrPass(e.target.value)}
                    placeholder="Digite a senha atual"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-xs text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400">Nova Senha</label>
                  <input
                    type="password"
                    required
                    value={newPass}
                    onChange={(e) => setNewPass(e.target.value)}
                    placeholder="Mínimo de 4 dígitos"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-xs text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400">Confirmar Nova Senha</label>
                  <input
                    type="password"
                    required
                    value={confirmPass}
                    onChange={(e) => setConfirmPass(e.target.value)}
                    placeholder="Repita a nova senha"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-xs text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-extrabold py-2.5 rounded-lg flex items-center justify-center space-x-1.5 transition-colors shadow-xs"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Redefinir Senha de Acesso</span>
                </button>
              </form>
            </div>

          </div>
        )}

        {/* TAB 2: CONTROLE DE USUÁRIOS (CRUD) */}
        {activeTab === 'usuarios' && (
          <div className="space-y-4">
            
            {/* Barra de Filtros e Busca */}
            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shadow-xs">
              <div className="flex flex-1 flex-col sm:flex-row gap-3">
                {/* Campo de Busca */}
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Buscar usuários por nome, email ou setor..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className="pl-9 pr-4 py-2 w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Filtro de Cargo/Role */}
                <select
                  value={selectedRoleFilter}
                  onChange={(e) => setSelectedRoleFilter(e.target.value)}
                  className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-700 dark:text-slate-200 font-semibold focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                >
                  <option value="todos">Todos os Cargos</option>
                  {ROLES.map(role => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
              </div>

              {/* Botão para Novo Usuário */}
              <button
                onClick={handleOpenAddForm}
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2.5 rounded-lg flex items-center justify-center space-x-1.5 transition-colors shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Cadastrar Usuário</span>
              </button>
            </div>

            {/* Listagem em Tabela Estilo Corporativo */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      <th className="px-5 py-3">Colaborador / Conta</th>
                      <th className="px-5 py-3">Setor</th>
                      <th className="px-5 py-3">Cargo / Perfil</th>
                      <th className="px-5 py-3">Telefone</th>
                      <th className="px-5 py-3">Status</th>
                      <th className="px-5 py-3 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800/80">
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-5 py-10 text-center text-xs text-slate-500 dark:text-slate-400">
                          Nenhum usuário localizado com os critérios de filtragem informados.
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((userItem) => (
                        <tr 
                          key={userItem.id}
                          className="text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors"
                        >
                          <td className="px-5 py-3.5">
                            <div className="flex items-center space-x-3">
                              <img 
                                src={userItem.photoURL || PRESET_AVATARS[0]} 
                                alt={userItem.name} 
                                className="w-9 h-9 rounded-full object-cover border border-slate-200 dark:border-slate-800" 
                              />
                              <div>
                                <p className="font-extrabold text-slate-900 dark:text-slate-100">{userItem.name}</p>
                                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-mono flex items-center space-x-1 mt-0.5">
                                  <Mail className="w-3 h-3 text-slate-400 inline" />
                                  <span>{userItem.email}</span>
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-3.5 font-medium">
                            <span className="inline-flex items-center space-x-1.5 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md text-[10px] text-slate-700 dark:text-slate-300">
                              <Briefcase className="w-3 h-3" />
                              <span>{userItem.sector}</span>
                            </span>
                          </td>
                          <td className="px-5 py-3.5">
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase font-mono ${
                              userItem.role === 'Administrador' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400' :
                              userItem.role === 'Gestor' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400' :
                              userItem.role === 'Qualidade' ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400' :
                              'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                            }`}>
                              {userItem.role}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 font-mono text-slate-500 dark:text-slate-400">
                            {userItem.telefone || 'Não informado'}
                          </td>
                          <td className="px-5 py-3.5">
                            <span className={`inline-flex items-center space-x-1 text-[10px] font-bold ${
                              userItem.status === 'Ativo' ? 'text-emerald-600' : 'text-slate-400 dark:text-slate-500'
                            }`}>
                              {userItem.status === 'Ativo' ? (
                                <>
                                  <UserCheck className="w-3.5 h-3.5 text-emerald-500" />
                                  <span>Ativo</span>
                                </>
                              ) : (
                                <>
                                  <UserX className="w-3.5 h-3.5 text-slate-400" />
                                  <span>Inativo</span>
                                </>
                              )}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-right">
                            <div className="flex items-center justify-end space-x-1.5">
                              <button
                                onClick={() => {
                                  setSelectedUserIdForMatrix(userItem.id);
                                  setMatrizMode('usuario');
                                  setActiveTab('permissoes');
                                }}
                                className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 rounded-md transition-colors"
                                title="Gerenciar Direitos & Matriz [V|C|E|X]"
                              >
                                <ShieldCheck className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleOpenEditForm(userItem)}
                                className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-md transition-colors"
                                title="Editar Usuário"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => {
                                  if (!canDeleteUser) {
                                    showToast('Você não possui permissão para excluir colaboradores.', 'error');
                                    return;
                                  }
                                  setUserToDelete(userItem);
                                }}
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-md transition-colors"
                                title="Deletar Usuário"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* TAB 3: MATRIZ DE ACESSOS */}
        {activeTab === 'permissoes' && (
          <div className="space-y-6">
            
            {/* Feedback Toast */}
            {feedbackToast && (
              <div className={`p-3 rounded-xl border flex items-center justify-between text-xs font-semibold animate-in fade-in slide-in-from-top-2 ${
                feedbackToast.type === 'error' 
                  ? 'bg-rose-50 border-rose-200 text-rose-700 dark:bg-rose-950/40 dark:border-rose-900 dark:text-rose-300'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-950/40 dark:border-emerald-900 dark:text-emerald-300'
              }`}>
                <div className="flex items-center space-x-2">
                  {feedbackToast.type === 'error' ? <AlertTriangle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                  <span>{feedbackToast.message}</span>
                </div>
                <button onClick={() => setFeedbackToast(null)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Disclaimer & Sub-Navegação de Modos */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl space-y-4 shadow-xs">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                      <ShieldCheck className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-100">
                        Matriz Multidisciplinar de Direitos de Acesso ao SGQ
                      </h3>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Conformidade ISO 9001:2015 (Requisitos 5.3 Papéis & 7.5 Informação Documentada)
                      </p>
                    </div>
                  </div>
                </div>

                {/* Alternador de Modo: Por Usuário x Setor VS Por Perfil Técnico */}
                <div className="flex items-center bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200 dark:border-slate-700/60 self-start lg:self-auto">
                  <button
                    type="button"
                    onClick={() => setMatrizMode('usuario')}
                    className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      matrizMode === 'usuario'
                        ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>Por Colaborador & Setor [V, C, E, X]</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setMatrizMode('roles')}
                    className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      matrizMode === 'roles'
                        ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                  >
                    <Briefcase className="w-3.5 h-3.5" />
                    <span>Perfis Técnicos (Roles Herdadas)</span>
                  </button>
                </div>
              </div>

              {!canManageAccessMatrix && (
                <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-amber-700 dark:text-amber-400 flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>Modo de visualização (Auditoria). Apenas analistas de Qualidade ou Administradores têm alçada para alterar direitos de acesso.</span>
                </div>
              )}
            </div>

            {/* MODO 1: MATRIZ POR USUÁRIO X SETOR X FUNÇÃO [V, C, E, X] */}
            {matrizMode === 'usuario' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                
                {/* Seletor do Colaborador e Painel de Alçada */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl space-y-4 shadow-xs">
                  
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-slate-100 dark:border-slate-800/80 pb-4">
                    {/* Seletor de Usuário */}
                    <div className="flex flex-1 items-center gap-3">
                      <div className="relative shrink-0">
                        <img 
                          src={selectedUserForMatrix?.photoURL || PRESET_AVATARS[0]} 
                          alt={selectedUserForMatrix?.name} 
                          className="w-12 h-12 rounded-full object-cover border-2 border-blue-500/20 shadow-xs"
                        />
                        <span className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-slate-900 ${
                          selectedUserForMatrix?.status === 'Ativo' ? 'bg-emerald-500' : 'bg-slate-400'
                        }`} />
                      </div>

                      <div className="space-y-1 flex-1">
                        <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                          Selecionar Colaborador para Gerenciar Alçadas:
                        </label>
                        <select
                          value={selectedUserIdForMatrix}
                          onChange={(e) => setSelectedUserIdForMatrix(e.target.value)}
                          className="w-full max-w-md bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                        >
                          {users.map(u => (
                            <option key={u.id} value={u.id}>
                              {u.name} — {u.role} ({u.sector}) [{u.status}]
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Badges de Identificação do Usuário Selecionado */}
                    {selectedUserForMatrix && (
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-right">
                          <span className="block text-[9px] font-mono text-slate-400 uppercase">Perfil Técnico:</span>
                          <span className="text-xs font-extrabold text-blue-600 dark:text-blue-400">{selectedUserForMatrix.role}</span>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-right">
                          <span className="block text-[9px] font-mono text-slate-400 uppercase">Setor Vinculado:</span>
                          <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200 flex items-center space-x-1 justify-end">
                            <Building2 className="w-3 h-3 text-slate-500" />
                            <span>{selectedUserForMatrix.sector}</span>
                          </span>
                        </div>
                        {selectedUserForMatrix.customPermissions && Object.keys(selectedUserForMatrix.customPermissions).length > 0 ? (
                          <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 px-3 py-1.5 rounded-xl text-right">
                            <span className="block text-[9px] font-mono text-emerald-600 dark:text-emerald-400 uppercase">Status Matriz:</span>
                            <span className="text-xs font-extrabold text-emerald-700 dark:text-emerald-300">Regras Customizadas Ativas</span>
                          </div>
                        ) : (
                          <div className="bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-right">
                            <span className="block text-[9px] font-mono text-slate-400 uppercase">Status Matriz:</span>
                            <span className="text-xs font-semibold text-slate-500">Herança Padrão ({selectedUserForMatrix.role})</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Barra de Ações Rápidas em Massa */}
                  {canManageAccessMatrix && (
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mr-1">
                        Ações Rápidas:
                      </span>

                      <button
                        type="button"
                        onClick={handleResetUserToRoleDefaults}
                        className="inline-flex items-center space-x-1.5 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold transition-colors"
                        title="Restaura as permissões para o padrão do cargo"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Restaurar Padrão do Cargo</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleGrantAllAccess}
                        className="inline-flex items-center space-x-1.5 px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-lg text-xs font-semibold transition-colors"
                        title="Concede leitura, criação, edição e exclusão global em todos os 16 módulos"
                      >
                        <Zap className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Liberar Acesso Total</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleSetReadOnlyAll}
                        className="inline-flex items-center space-x-1.5 px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 rounded-lg text-xs font-semibold transition-colors"
                        title="Define todos os módulos para visualização apenas"
                      >
                        <Eye className="w-3.5 h-3.5 text-blue-600" />
                        <span>Somente Leitura [V]</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleSetAllScope('setor_proprio')}
                        className="inline-flex items-center space-x-1.5 px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 dark:hover:bg-amber-900/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 rounded-lg text-xs font-semibold transition-colors"
                        title="Restringe todos os módulos ao setor vinculado do colaborador"
                      >
                        <Building2 className="w-3.5 h-3.5 text-amber-600" />
                        <span>Restringir ao Setor ({selectedUserForMatrix?.sector})</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleSetAllScope('todos')}
                        className="inline-flex items-center space-x-1.5 px-2.5 py-1.5 bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/40 dark:hover:bg-purple-900/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 rounded-lg text-xs font-semibold transition-colors"
                        title="Expande o escopo de todos os módulos para acesso global a todos os setores"
                      >
                        <Globe className="w-3.5 h-3.5 text-purple-600" />
                        <span>Escopo Global (Todos os Setores)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setIsCloneModalOpen(true)}
                        className="inline-flex items-center space-x-1.5 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold transition-colors ml-auto"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>Clonar de Outro Usuário</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setIsPrintOfficialModalOpen(true)}
                        className="inline-flex items-center space-x-1.5 px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-100 dark:hover:bg-white dark:text-slate-900 rounded-lg text-xs font-bold transition-colors shadow-xs"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Visualizar / Imprimir Matriz Oficial (ISO 9001)</span>
                      </button>
                    </div>
                  )}

                  {/* Filtro e Busca de Módulos */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800/80">
                    <div className="relative w-full sm:w-64">
                      <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        value={matrixSearchModule}
                        onChange={(e) => setMatrixSearchModule(e.target.value)}
                        placeholder="Buscar módulo do SGQ..."
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1">
                      {['todos', 'Geral & Estratégico', 'Qualidade & Documentação', 'Operação & Processos', 'Suporte & Sistema'].map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setMatrixCategoryFilter(cat)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-colors ${
                            matrixCategoryFilter === cat
                              ? 'bg-blue-600 text-white shadow-xs'
                              : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          {cat === 'todos' ? 'Todos os Módulos' : cat}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Tabela Interativa de Módulos x Funções [V, C, E, X] x Escopo */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          <th className="px-5 py-3.5">Módulo / Sub-Área do SGQ</th>
                          <th className="px-3 py-3.5 text-center w-20">
                            <span className="block text-slate-800 dark:text-slate-200">Ver [V]</span>
                            <span className="text-[9px] font-mono font-normal text-slate-400 lowercase">leitura</span>
                          </th>
                          <th className="px-3 py-3.5 text-center w-20">
                            <span className="block text-slate-800 dark:text-slate-200">Criar [C]</span>
                            <span className="text-[9px] font-mono font-normal text-slate-400 lowercase">inclusão</span>
                          </th>
                          <th className="px-3 py-3.5 text-center w-20">
                            <span className="block text-slate-800 dark:text-slate-200">Editar [E]</span>
                            <span className="text-[9px] font-mono font-normal text-slate-400 lowercase">alteração</span>
                          </th>
                          <th className="px-3 py-3.5 text-center w-20">
                            <span className="block text-slate-800 dark:text-slate-200">Excluir [X]</span>
                            <span className="text-[9px] font-mono font-normal text-slate-400 lowercase">deleção</span>
                          </th>
                          <th className="px-4 py-3.5 text-center min-w-[200px]">
                            <span className="block text-slate-800 dark:text-slate-200">Regra de Escopo do Setor</span>
                            <span className="text-[9px] font-mono font-normal text-slate-400 lowercase">alçada de abrangência</span>
                          </th>
                          <th className="px-4 py-3.5 text-right">Alçada Geral</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 dark:divide-slate-800/80">
                        {SYSTEM_MODULES
                          .filter(m => {
                            const matchesCat = matrixCategoryFilter === 'todos' || m.category === matrixCategoryFilter;
                            const matchesSearch = m.label.toLowerCase().includes(matrixSearchModule.toLowerCase()) || 
                                                  m.description.toLowerCase().includes(matrixSearchModule.toLowerCase()) ||
                                                  m.id.toLowerCase().includes(matrixSearchModule.toLowerCase());
                            return matchesCat && matchesSearch;
                          })
                          .map((mod) => {
                            const sectionMeta = SECTION_METADATA.find(s => s.id === mod.id);
                            const ModIcon = sectionMeta?.icon || FileText;
                            
                            const userRole = selectedUserForMatrix?.role || 'Colaborador';
                            const effective = getEffectiveModulePermission(userRole, mod.id, selectedUserForMatrix?.customPermissions, permissions);

                            // Status sintético consolidado
                            let statusLabel = 'Sem Acesso';
                            let statusBadgeClass = 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400';

                            if (effective.ver && effective.criar && effective.editar && effective.excluir) {
                              statusLabel = effective.escopoSetor === 'todos' ? 'Acesso Total (Global)' : 'Controle Total (Setor)';
                              statusBadgeClass = 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400';
                            } else if (effective.ver && (effective.criar || effective.editar)) {
                              statusLabel = effective.escopoSetor === 'todos' ? 'Operação Global' : `Operação (${selectedUserForMatrix?.sector})`;
                              statusBadgeClass = 'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400';
                            } else if (effective.ver) {
                              statusLabel = 'Somente Leitura';
                              statusBadgeClass = 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400';
                            }

                            return (
                              <tr 
                                key={mod.id}
                                className="hover:bg-slate-50/60 dark:hover:bg-slate-800/20 transition-colors text-xs text-slate-700 dark:text-slate-300"
                              >
                                {/* Coluna 1: Informações do Módulo */}
                                <td className="px-5 py-3.5">
                                  <div className="flex items-start space-x-3">
                                    <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center shrink-0 mt-0.5">
                                      <ModIcon className="w-4 h-4" />
                                    </div>
                                    <div className="space-y-0.5">
                                      <div className="flex items-center space-x-2">
                                        <p className="font-extrabold text-slate-900 dark:text-slate-100">{mod.label}</p>
                                        <span className="text-[9px] font-mono font-semibold px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                                          {mod.category}
                                        </span>
                                      </div>
                                      <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                                        {mod.description}
                                      </p>
                                    </div>
                                  </div>
                                </td>

                                {/* Coluna 2: [V] Ver */}
                                <td className="px-3 py-3.5 text-center">
                                  <button
                                    id={`btn-perm-ver-${mod.id}`}
                                    type="button"
                                    onClick={() => handleToggleUserCrudAction(mod.id, 'ver')}
                                    className={`w-9 h-8 rounded-lg font-bold text-xs inline-flex items-center justify-center transition-all cursor-pointer select-none active:scale-95 ${
                                      effective.ver
                                        ? 'bg-emerald-600 text-white shadow-xs hover:bg-emerald-700'
                                        : 'bg-slate-100 dark:bg-slate-800 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                                    }`}
                                    title={effective.ver ? 'Visualização Ativa [V]. Clique para bloquear/desativar.' : 'Visualização Bloqueada [V]. Clique para liberar.'}
                                  >
                                    {effective.ver ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                                  </button>
                                </td>

                                {/* Coluna 3: [C] Criar */}
                                <td className="px-3 py-3.5 text-center">
                                  <button
                                    id={`btn-perm-criar-${mod.id}`}
                                    type="button"
                                    onClick={() => handleToggleUserCrudAction(mod.id, 'criar')}
                                    className={`w-9 h-8 rounded-lg font-bold text-xs inline-flex items-center justify-center transition-all cursor-pointer select-none active:scale-95 ${
                                      effective.criar
                                        ? 'bg-blue-600 text-white shadow-xs hover:bg-blue-700'
                                        : 'bg-slate-100 dark:bg-slate-800 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                                    }`}
                                    title={effective.criar ? 'Inclusão Permitida [C]. Clique para bloquear.' : 'Inclusão Bloqueada [C]. Clique para liberar.'}
                                  >
                                    {effective.criar ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                                  </button>
                                </td>

                                {/* Coluna 4: [E] Editar */}
                                <td className="px-3 py-3.5 text-center">
                                  <button
                                    id={`btn-perm-editar-${mod.id}`}
                                    type="button"
                                    onClick={() => handleToggleUserCrudAction(mod.id, 'editar')}
                                    className={`w-9 h-8 rounded-lg font-bold text-xs inline-flex items-center justify-center transition-all cursor-pointer select-none active:scale-95 ${
                                      effective.editar
                                        ? 'bg-amber-600 text-white shadow-xs hover:bg-amber-700'
                                        : 'bg-slate-100 dark:bg-slate-800 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                                    }`}
                                    title={effective.editar ? 'Edição Permitida [E]. Clique para bloquear.' : 'Edição Bloqueada [E]. Clique para liberar.'}
                                  >
                                    {effective.editar ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                                  </button>
                                </td>

                                {/* Coluna 5: [X] Excluir */}
                                <td className="px-3 py-3.5 text-center">
                                  <button
                                    id={`btn-perm-excluir-${mod.id}`}
                                    type="button"
                                    onClick={() => handleToggleUserCrudAction(mod.id, 'excluir')}
                                    className={`w-9 h-8 rounded-lg font-bold text-xs inline-flex items-center justify-center transition-all cursor-pointer select-none active:scale-95 ${
                                      effective.excluir
                                        ? 'bg-rose-600 text-white shadow-xs hover:bg-rose-700'
                                        : 'bg-slate-100 dark:bg-slate-800 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                                    }`}
                                    title={effective.excluir ? 'Exclusão Permitida [X]. Clique para bloquear.' : 'Exclusão Bloqueada [X]. Clique para liberar.'}
                                  >
                                    {effective.excluir ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                                  </button>
                                </td>

                                {/* Coluna 6: Escopo do Setor */}
                                <td className="px-4 py-3.5 text-center">
                                  <button
                                    type="button"
                                    onClick={() => handleToggleUserModuleScope(mod.id)}
                                    className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                                      effective.escopoSetor === 'todos'
                                        ? 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800 hover:bg-purple-100'
                                        : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800 hover:bg-amber-100'
                                    }`}
                                    title="Clique para alternar entre escopo do setor próprio e escopo global"
                                  >
                                    {effective.escopoSetor === 'todos' ? (
                                      <>
                                        <Globe className="w-3.5 h-3.5" />
                                        <span>Todos os Setores (Global)</span>
                                      </>
                                    ) : (
                                      <>
                                        <Building2 className="w-3.5 h-3.5" />
                                        <span>Apenas Setor ({selectedUserForMatrix?.sector})</span>
                                      </>
                                    )}
                                  </button>
                                </td>

                                {/* Coluna 7: Status Geral */}
                                <td className="px-4 py-3.5 text-right">
                                  <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold ${statusBadgeClass}`}>
                                    {statusLabel}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            )}

            {/* MODO 2: MATRIZ DE PERFIS TÉCNICOS (HERANÇA GLOBAL) */}
            {matrizMode === 'roles' && (
              <div className="space-y-4 animate-in fade-in duration-200">
                
                <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 p-4 rounded-xl flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
                  <div className="flex items-center space-x-2">
                    <Briefcase className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>
                      Esta matriz define as permissões padrão herdadas pelos colaboradores conforme o cargo atribuído. Colaboradores sem regras customizadas recebem este perfil automaticamente.
                    </span>
                  </div>
                </div>

                {/* Tabela de Matriz por Roles */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-center border-collapse">
                      <thead>
                        <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          <th className="px-5 py-4 text-left">Módulo / Sub-Área do SGQ</th>
                          {ROLES.map(role => (
                            <th key={role} className="px-4 py-4 min-w-[120px]">
                              <span className="block text-slate-800 dark:text-slate-100">{role}</span>
                              <span className="text-[9px] font-mono font-normal text-slate-400 lowercase">perfil técnico</span>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 dark:divide-slate-800/80">
                        {SECTION_METADATA.map((section) => {
                          const SectionIcon = section.icon;
                          return (
                            <tr 
                              key={section.id} 
                              className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors text-xs text-slate-700 dark:text-slate-300"
                            >
                              {/* Coluna 1: Nome do Módulo */}
                              <td className="px-5 py-4 text-left">
                                <div className="flex items-center space-x-3">
                                  <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center justify-center">
                                    <SectionIcon className="w-4 h-4" />
                                  </div>
                                  <div>
                                    <p className="font-bold text-slate-900 dark:text-slate-100">{section.label}</p>
                                    <p className="text-[10px] text-slate-400 font-mono">id: /{section.id}</p>
                                  </div>
                                </div>
                              </td>

                              {/* Colunas dos Roles */}
                              {ROLES.map(role => {
                                const rolePerm = permissions.find(p => p.role === role);
                                const hasAccess = rolePerm?.allowedSections.includes(section.id) || false;

                                return (
                                  <td key={role} className="px-4 py-4">
                                    <button
                                      onClick={() => handleTogglePermission(role, section.id)}
                                      className={`px-3 py-1.5 rounded-full text-[10px] font-bold transition-all ${
                                        hasAccess 
                                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 hover:ring-2 hover:ring-emerald-500/20' 
                                          : 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500 hover:ring-2 hover:ring-slate-500/10'
                                      }`}
                                      title={`${hasAccess ? 'Revogar' : 'Conceder'} acesso ao módulo ${section.label} para o perfil de ${role}`}
                                    >
                                      {hasAccess ? 'Permitido' : 'Bloqueado'}
                                    </button>
                                  </td>
                                );
                              })}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            )}

          </div>
        )}

      </div>

      {/* MODAL: CLONAGEM DE PERMISSÕES */}
      {isCloneModalOpen && selectedUserForMatrix && (
        <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in duration-150">
            <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/40 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Copy className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-100">
                  Clonar Direitos de Acesso
                </h3>
              </div>
              <button 
                onClick={() => setIsCloneModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <p className="text-slate-600 dark:text-slate-300">
                Copiar todas as alçadas de <strong>[V, C, E, X]</strong> e escopo de setor de outro colaborador para o usuário destino:
              </p>

              <div className="bg-blue-50 dark:bg-blue-950/30 p-3 rounded-xl border border-blue-200 dark:border-blue-800">
                <span className="block text-[10px] font-mono text-blue-600 dark:text-blue-400 uppercase font-bold">Colaborador Destino:</span>
                <span className="text-xs font-extrabold text-slate-900 dark:text-slate-100">{selectedUserForMatrix.name} ({selectedUserForMatrix.role} - {selectedUserForMatrix.sector})</span>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500">Selecione o Colaborador de Origem (Modelo):</label>
                <select
                  value={cloneSourceUserId}
                  onChange={(e) => setCloneSourceUserId(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-xs text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Selecione um usuário...</option>
                  {users
                    .filter(u => u.id !== selectedUserForMatrix.id)
                    .map(u => (
                      <option key={u.id} value={u.id}>
                        {u.name} — {u.role} ({u.sector})
                      </option>
                    ))}
                </select>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCloneModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-bold hover:bg-slate-200 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  disabled={!cloneSourceUserId}
                  onClick={handleApplyClone}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold transition-colors shadow-xs"
                >
                  Confirmar e Clonar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: IMPRESSÃO / EXPORTAÇÃO DA MATRIZ OFICIAL SGQ (ISO 9001:2015) */}
      {isPrintOfficialModalOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-5xl overflow-hidden shadow-2xl animate-in fade-in duration-200 my-8">
            
            {/* Header com botões de ação */}
            <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/40 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Printer className="w-5 h-5 text-blue-600" />
                <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-100">
                  Documento Oficial SGQ: Matriz Multidisciplinar de Direitos de Acesso
                </h3>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center space-x-1.5 shadow-xs"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Imprimir / Gerar PDF</span>
                </button>
                <button 
                  onClick={() => setIsPrintOfficialModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Conteúdo Formal da Matriz (Padrão ABNT / ISO 9001) */}
            <div className="p-8 space-y-6 max-h-[75vh] overflow-y-auto print:max-h-none print:p-0">
              
              {/* Cabeçalho Documental */}
              <div className="border-2 border-slate-800 dark:border-slate-200 p-4 rounded-xl flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-600 text-white font-black flex items-center justify-center text-sm">V</div>
                  <div>
                    <h4 className="font-extrabold text-sm tracking-wider text-slate-900 dark:text-slate-100">{personalizacao?.nomeEmpresa || 'VICKYTEX'}</h4>
                    <p className="text-[10px] text-slate-500 font-mono">Têxtil & Confecções</p>
                  </div>
                </div>
                <div className="text-center md:text-right">
                  <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-slate-100">
                    MATRIZ MULTIDISCIPLINAR DE DIREITOS E ALÇADAS DE ACESSO AO SGQ
                  </h2>
                  <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                    ISO 9001:2015 — Requisitos 5.3 (Papéis e Responsabilidades) e 7.5 (Informação Documentada)
                  </p>
                </div>
              </div>

              {/* Tabela Resumo Consolidada de Colaboradores e Módulos */}
              <div className="border border-slate-300 dark:border-slate-700 rounded-xl overflow-hidden">
                <table className="w-full text-left text-[11px] border-collapse">
                  <thead>
                    <tr className="bg-slate-100 dark:bg-slate-800 border-b border-slate-300 dark:border-slate-700 font-bold text-slate-800 dark:text-slate-200">
                      <th className="p-2 border-r border-slate-300 dark:border-slate-700">Colaborador</th>
                      <th className="p-2 border-r border-slate-300 dark:border-slate-700">Cargo</th>
                      <th className="p-2 border-r border-slate-300 dark:border-slate-700">Setor</th>
                      <th className="p-2">Alçadas nos Módulos Principais [V: Ver | C: Criar | E: Editar | X: Excluir]</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                    {users.map((u) => {
                      return (
                        <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                          <td className="p-2 font-bold text-slate-900 dark:text-slate-100 border-r border-slate-200 dark:border-slate-800">
                            {u.name}
                            <span className="block text-[9px] font-normal text-slate-400 font-mono">{u.email}</span>
                          </td>
                          <td className="p-2 border-r border-slate-200 dark:border-slate-800 font-mono">{u.role}</td>
                          <td className="p-2 border-r border-slate-200 dark:border-slate-800 font-medium">{u.sector}</td>
                          <td className="p-2">
                            <div className="flex flex-wrap gap-1.5">
                              {SYSTEM_MODULES.slice(0, 8).map(m => {
                                const eff = getEffectiveModulePermission(u.role, m.id, u.customPermissions, permissions);
                                if (!eff.ver) return null;
                                return (
                                  <span 
                                    key={m.id} 
                                    className="px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[9px] font-mono border border-slate-200 dark:border-slate-700"
                                  >
                                    <strong>{m.id}:</strong> {eff.ver ? 'V' : ''}{eff.criar ? '+C' : ''}{eff.editar ? '+E' : ''}{eff.excluir ? '+X' : ''} ({eff.escopoSetor === 'todos' ? 'Global' : u.sector})
                                  </span>
                                );
                              })}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* MODAL / DIALOG DE CADASTRO OU EDICÃO DE USUÁRIO */}
      {isFormOpen && (
        <div id="usuario-modal-backdrop" className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-fade-in">
            {/* Header */}
            <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/40 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-100">
                {editingUserId ? 'Editar Usuário Existente' : 'Cadastrar Novo Usuário no SGQ'}
              </h3>
              <button 
                onClick={() => setIsFormOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveUser} className="p-6 space-y-4">
              
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500">Nome Completo</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Nome do colaborador"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-xs text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500">E-mail de Trabalho</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="usuario@vickytex.com.br"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-xs text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500">Cargo / Função (Role)</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-xs text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  >
                    {ROLES.map(role => (
                      <option key={role} value={role}>{role}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500">Setor</label>
                  <select
                    value={formData.sector}
                    onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-xs text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  >
                    {sectorsList.map(sec => (
                      <option key={sec} value={sec}>{sec}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500">Senha de Acesso</label>
                  <input
                    type="text"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Deixe em branco para usar 'vickytex123'"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-xs text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500">Telefone</label>
                  <input
                    type="text"
                    value={formData.telefone}
                    onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                    placeholder="(11) 99999-9999"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-xs text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500">Status da Conta</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as 'Ativo' | 'Inativo' })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-xs text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Ativo">Ativo (Permitir Login)</option>
                    <option value="Inativo">Inativo (Bloquear Login)</option>
                  </select>
                </div>
              </div>

              {/* Foto de Perfil / Avatar no Modal */}
              <div className="space-y-2.5 bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700">
                <label className="text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Foto de Perfil do Usuário</label>
                
                <div className="flex items-center gap-4">
                  <div className="relative group shrink-0">
                    <img 
                      src={formData.photoURL} 
                      alt="Avatar Usuário" 
                      className="w-14 h-14 rounded-full border-2 border-blue-500/20 object-cover" 
                    />
                    <label className="absolute -bottom-1 -right-1 bg-blue-600 hover:bg-blue-700 text-white p-1 rounded-full cursor-pointer shadow-md transition-colors" title="Upload de foto do computador">
                      <Upload className="w-3 h-3" />
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            if (file.size > 2 * 1024 * 1024) {
                              alert('A imagem selecionada é muito grande! Escolha uma imagem de até 2MB.');
                              return;
                            }
                            const reader = new FileReader();
                            reader.onload = (event) => {
                              if (event.target?.result) {
                                setFormData({ ...formData, photoURL: event.target.result as string });
                              }
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>
                  </div>

                  <div className="flex-1 space-y-2">
                    <div>
                      <p className="text-[10px] font-bold text-slate-500">Escolha um preset ou cole uma URL abaixo:</p>
                      <div className="flex gap-1.5 mt-1 overflow-x-auto pb-1 max-w-[320px]">
                        {PRESET_AVATARS.map((avatar, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setFormData({ ...formData, photoURL: avatar })}
                            className={`w-7 h-7 rounded-full overflow-hidden border-2 shrink-0 transition-all ${
                              formData.photoURL === avatar ? 'border-blue-500 scale-105' : 'border-slate-200 dark:border-slate-700 opacity-60'
                            }`}
                          >
                            <img src={avatar} alt={`Av #${idx}`} className="w-full h-full object-cover" />
                          </button>
                        ))}
                      </div>
                    </div>

                    <input
                      type="url"
                      value={formData.photoURL.startsWith('data:') ? '' : formData.photoURL}
                      onChange={(e) => setFormData({ ...formData, photoURL: e.target.value.trim() })}
                      placeholder="Link URL da imagem (https://...)"
                      className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-[11px] text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Botões do Modal */}
              <div className="flex items-center justify-end space-x-2 pt-4 border-t border-slate-100 dark:border-slate-800/80">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingUser}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-xs font-bold transition-colors shadow-xs flex items-center gap-2"
                >
                  {isSubmittingUser && (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  )}
                  {editingUserId ? (isSubmittingUser ? 'Salvando...' : 'Salvar Modificações') : (isSubmittingUser ? 'Cadastrando...' : 'Cadastrar Conta')}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* MODAL CUSTOMIZADO: CONFIRMAÇÃO DE EXCLUSÃO DE USUÁRIO */}
      {userToDelete && (
        <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            
            {/* Header com ícone de alerta */}
            <div className="flex items-center space-x-3 pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="p-2.5 bg-rose-500/10 text-rose-600 rounded-full shrink-0">
                <AlertTriangle className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-100">
                  {userToDelete.email === currentLoggedUser?.email 
                    ? 'Ação Não Permitida' 
                    : 'Confirmar Exclusão de Conta'}
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Controle de Segurança SGQ</p>
              </div>
            </div>

            {/* Conteúdo dinâmico com base no tipo de exclusão */}
            {Boolean(
              currentLoggedUser && (
                userToDelete.id === currentLoggedUser.id || 
                (userToDelete.email && userToDelete.email.trim().toLowerCase() === (currentLoggedUser.email || '').trim().toLowerCase())
              )
            ) ? (
              <div className="space-y-3">
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Você está atualmente autenticado como <strong className="text-slate-950 dark:text-white font-semibold">{userToDelete.name}</strong>.
                </p>
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 text-xs text-amber-700 dark:text-amber-400 font-medium">
                  Para fins de integridade de auditoria e segurança de sessão, o sistema não permite que um usuário exclua sua própria conta ativa enquanto estiver logado no SGQ.
                </div>
                
                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setUserToDelete(null)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-bold transition-colors"
                  >
                    Entendido, fechar
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Você está prestes a remover permanentemente a conta do colaborador 
                  <strong className="text-slate-950 dark:text-white font-bold block mt-1 text-sm bg-slate-50 dark:bg-slate-800 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-750 font-mono">
                    {userToDelete.name} ({userToDelete.email})
                  </strong>
                </p>
                <p className="text-[11px] text-rose-600 dark:text-rose-400 font-semibold bg-rose-500/5 p-2.5 rounded-lg border border-rose-500/10">
                  Atenção: Esta ação é irreversível. O colaborador perderá instantaneamente todos os privilégios de login e acesso ao sistema de gestão de qualidade da Vickytex.
                </p>

                {/* Botões de Ação */}
                <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setUserToDelete(null)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-bold transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const deletedName = userToDelete.name;
                      onDeleteUser(userToDelete.id);
                      onAddLog('Usuário Excluído', `Conta de usuário ${deletedName} (${userToDelete.email}) foi removida definitivamente.`);
                      showToast(`Usuário ${deletedName} removido com sucesso!`, 'success');
                      setUserToDelete(null);
                    }}
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition-colors shadow-xs"
                  >
                    Sim, Remover Usuário
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
};
