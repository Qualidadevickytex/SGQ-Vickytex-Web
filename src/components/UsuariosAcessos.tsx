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
  Award
} from 'lucide-react';
import { UserAccount, RolePermission, UserRole, SectorType } from '../types';
import { getSectors, PersonalizacaoGeral } from '../utils/mockData';
import { useAuth } from '../contexts/AuthContext';

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
  const [sectorsList] = useState<SectorType[]>(() => getSectors());

  // Search & Filters for Users Tab
  const [userSearch, setUserSearch] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>('todos');

  // Modal / Form States
  const [isFormOpen, setIsFormOpen] = useState(false);
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

  // Handle opening form for adding a user
  const handleOpenAddForm = () => {
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
    setEditingUserId(u.id);
    setFormData({
      name: u.name,
      email: u.email,
      role: u.role,
      sector: u.sector,
      photoURL: u.photoURL || PRESET_AVATARS[0],
      status: u.status,
      password: u.passwordHash,
      telefone: u.telefone || ''
    });
    setIsFormOpen(true);
  };

  // Handle User Save (Add/Edit)
  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingUserId) {
      const updatedUser: UserAccount = {
        id: editingUserId,
        name: formData.name,
        email: formData.email,
        role: formData.role,
        sector: formData.sector,
        photoURL: formData.photoURL,
        status: formData.status,
        passwordHash: formData.password || 'vickytex123',
        telefone: formData.telefone
      };
      onUpdateUser(updatedUser);
      onAddLog('Usuário Editado', `Modificações salvas para o colaborador ${formData.name} (${formData.email}).`);
      
      // Sincroniza a barra lateral caso tenha editado o próprio perfil logado através da lista de usuários
      if (formData.email === currentLoggedUser?.email) {
        refreshUser({
          name: formData.name,
          email: formData.email,
          role: formData.role,
          sector: formData.sector,
          photoURL: formData.photoURL
        });
      }
    } else {
      const newUser: UserAccount = {
        id: `user-${Date.now()}`,
        name: formData.name,
        email: formData.email,
        role: formData.role,
        sector: formData.sector,
        photoURL: formData.photoURL,
        status: formData.status,
        passwordHash: formData.password || 'vickytex123',
        telefone: formData.telefone,
        lastLogin: 'Nunca'
      };
      onAddUser(newUser);
      onAddLog('Novo Usuário Criado', `Conta criada para o colaborador ${formData.name} no cargo de ${formData.role}.`);
    }
    setIsFormOpen(false);
  };

  // Toggle module permission for a specific role
  const handleTogglePermission = (role: UserRole, sectionId: typeof SECTION_METADATA[number]['id']) => {
    // Quality/Admins are allowed to adjust security policies
    if (currentLoggedUser?.role !== 'Administrador' && currentLoggedUser?.role !== 'Qualidade') {
      alert('Apenas administradores ou analistas de qualidade têm permissão para redefinir a matriz de acessos (ISO 9001:2015).');
      return;
    }

    const updatedPermissions = permissions.map(p => {
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
                            <div className="flex items-center justify-end space-x-2">
                              <button
                                onClick={() => handleOpenEditForm(userItem)}
                                className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-md transition-colors"
                                title="Editar Usuário"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => setUserToDelete(userItem)}
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
            
            {/* Disclaimer Informativo */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-xl space-y-3 shadow-xs">
              <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-100 flex items-center space-x-2">
                <ShieldCheck className="w-4.5 h-4.5 text-blue-600" />
                <span>Matriz Multidisciplinar de Direitos de Acesso ao SGQ</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-4xl">
                Altere os direitos de leitura/gravação associando ou desassociando os módulos às respectivas funções de trabalho da Vickytex.
                As políticas definidas aqui entrarão em vigor em tempo real, limitando ou liberando as opções exibidas no menu principal e protegendo os dados de acessos não autorizados por pessoas externas ou sem a certificação correspondente.
              </p>
              {currentLoggedUser?.role !== 'Administrador' && currentLoggedUser?.role !== 'Qualidade' && (
                <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900 px-3 py-2.5 rounded-lg text-xs font-semibold text-rose-700 dark:text-rose-400 flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>Sua conta atual de ({currentLoggedUser?.role}) está no modo de visualização. Apenas Qualidade ou Administradores podem modificar esta tabela.</span>
                </div>
              )}
            </div>

            {/* Tabela de Matriz */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
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
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors shadow-xs"
                >
                  {editingUserId ? 'Salvar Modificações' : 'Cadastrar Conta'}
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
            {userToDelete.email === currentLoggedUser?.email ? (
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
                      onDeleteUser(userToDelete.id);
                      onAddLog('Usuário Excluído', `Conta de usuário ${userToDelete.name} (${userToDelete.email}) foi removida definitivamente.`);
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
