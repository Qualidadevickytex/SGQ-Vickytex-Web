import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Search, 
  X, 
  AlertTriangle, 
  FileText, 
  Calendar,
  Camera,
  Check,
  CheckCircle2,
  Lock,
  ShieldCheck,
  Eye,
  User,
  Plus,
  RefreshCw,
  FolderOpen,
  MessageSquare
} from 'lucide-react';
import { 
  Setor5S, 
  Requisito5S, 
  ItemAuditado, 
  Fotografia5S, 
  PlanoAcao5S,
  Auditoria5S,
  Senso5S
} from '../../types/fiveS';
import { compressImage } from '../../utils/imageCompressor';
import { FiveSCameraModal } from './FiveSCameraModal';

interface FiveSActionPlansProps {
  planos: PlanoAcao5S[];
  itens: ItemAuditado[];
  auditorias: Auditoria5S[];
  setores: Setor5S[];
  requisitos: Requisito5S[];
  onUpdatePlanos: (data: PlanoAcao5S[]) => void;
  onAddLog: (action: string, details: string) => void;
  canModify: boolean;
  currentUserName?: string;
}

export const FiveSActionPlans: React.FC<FiveSActionPlansProps> = ({
  planos,
  itens,
  auditorias,
  setores,
  requisitos,
  onUpdatePlanos,
  onAddLog,
  canModify,
  currentUserName = 'Mariana Silva'
}) => {
  const { user } = useAuth();
  const [activeSubTab, setActiveSubTab] = useState<'planos' | 'ncs' | 'reincidencias'>('planos');

  // Search/Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('TODOS');
  const [filterSector, setFilterSector] = useState('TODOS');
  const [filterOnlyMySectors, setFilterOnlyMySectors] = useState(false);

  // Editing Action Plan modal
  const [editingPlan, setEditingPlan] = useState<PlanoAcao5S | null>(null);
  const [planDesc, setPlanDesc] = useState('');
  const [planResp, setPlanResp] = useState('');
  const [planDeadline, setPlanDeadline] = useState('');
  const [planStatus, setPlanStatus] = useState<'Pendente' | 'Em Andamento' | 'Concluído' | 'Atrasado'>('Pendente');
  const [planConclusionDate, setPlanConclusionDate] = useState('');
  const [newComment, setNewComment] = useState('');
  const [correctionPhotos, setCorrectionPhotos] = useState<string[]>([]);
  const [isLiveCameraOpen, setIsLiveCameraOpen] = useState(false);

  // Setores atrelados ao usuário logado (setor primário, setores adicionais e matriz de acessos 5S)
  const userTiedSectors = React.useMemo(() => {
    const list = new Set<string>();
    if (user?.sector) list.add(user.sector.trim().toLowerCase());
    if (Array.isArray(user?.setoresAdicionais)) {
      user.setoresAdicionais.forEach(s => s && list.add(s.trim().toLowerCase()));
    }
    const fiveSPerm = user?.customPermissions?.['5s'];
    if (fiveSPerm?.setoresPermitidos && Array.isArray(fiveSPerm.setoresPermitidos)) {
      fiveSPerm.setoresPermitidos.forEach(s => s && list.add(s.trim().toLowerCase()));
    }
    return Array.from(list);
  }, [user]);

  const isSuperUser = user?.role === 'Administrador' || user?.role === 'Qualidade';
  const hasGlobalScope = isSuperUser || user?.customPermissions?.['5s']?.escopoSetor === 'todos';

  // Nomes legíveis dos setores do usuário para mensagens e badges
  const userTiedSectorNames = React.useMemo(() => {
    if (hasGlobalScope) return ['Todos os Setores (Global)'];
    const names = new Set<string>();
    if (user?.sector) names.add(user.sector);
    if (Array.isArray(user?.setoresAdicionais)) {
      user.setoresAdicionais.forEach(s => s && names.add(s));
    }
    const fiveSPerm = user?.customPermissions?.['5s'];
    if (fiveSPerm?.setoresPermitidos && Array.isArray(fiveSPerm.setoresPermitidos)) {
      fiveSPerm.setoresPermitidos.forEach(s => s && names.add(s));
    }
    return Array.from(names);
  }, [user, hasGlobalScope]);

  // Informações de setor vinculadas ao plano de ação
  const getPlanSectorInfo = (plan: PlanoAcao5S | null) => {
    if (!plan) return { id: '', nome: 'Setor Não Informado' };
    const audit = auditorias.find(a => a.id === plan.auditoriaId);
    let sectorName = audit?.setor || '';
    let sectorId = audit?.setorId || '';

    if (sectorId && !sectorName) {
      const match = setores.find(s => s.id === sectorId);
      if (match) sectorName = match.nome;
    } else if (sectorName && !sectorId) {
      const match = setores.find(s => s.nome.toLowerCase() === sectorName.toLowerCase());
      if (match) sectorId = match.id;
    }

    return {
      id: sectorId,
      nome: sectorName || 'Geral'
    };
  };

  // Verifica se o plano pertence a um setor atrelado ao usuário (ou se o usuário tem escopo global)
  const isPlanSectorTiedToUser = (plan: PlanoAcao5S | null): boolean => {
    if (!plan) return false;
    if (hasGlobalScope) return true;
    if (userTiedSectors.length === 0) return false;

    const { id, nome } = getPlanSectorInfo(plan);
    const idLower = id.trim().toLowerCase();
    const nomeLower = nome.trim().toLowerCase();

    return userTiedSectors.some(s => s === idLower || s === nomeLower);
  };

  const auditOfEditingPlan = editingPlan ? auditorias.find(a => a.id === editingPlan.auditoriaId) : null;
  const editingPlanSectorInfo = getPlanSectorInfo(editingPlan);
  // O usuário pode editar e salvar se for dos setores atrelados ou superusuário
  const hasAccessToFillEditingPlan = isPlanSectorTiedToUser(editingPlan);

  const handleOpenPlanModal = (plan: PlanoAcao5S) => {
    setEditingPlan(plan);
    setPlanDesc(plan.descricao);
    setPlanResp(plan.responsavel);
    setPlanDeadline(plan.prazo);
    setPlanStatus(plan.status);
    setPlanConclusionDate(plan.dataConclusao || '');
    setCorrectionPhotos(plan.fotosCorrecao || []);
    setNewComment('');
  };

  const handleUploadCorrectionPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const compressed = await compressImage(file, 1000, 1000, 0.7);
      setCorrectionPhotos(prev => [...prev, compressed]);
    } catch (err) {
      console.error("Erro ao comprimir foto de correção:", err);
    } finally {
      e.target.value = '';
    }
  };

  const handleRemoveCorrectionPhoto = (idx: number) => {
    setCorrectionPhotos(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSavePlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlan) return;

    if (!isPlanSectorTiedToUser(editingPlan)) {
      alert(`Acesso negado. A edição e o salvamento deste plano de ação são restritos a colaboradores do setor correspondente (${editingPlanSectorInfo.nome}).`);
      return;
    }

    if (!planResp.trim()) {
      alert("Por favor, preencha o campo obrigatório 'E-mail do Responsável'.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(planResp.trim())) {
      alert("Por favor, informe um endereço de e-mail válido para o responsável.");
      return;
    }

    const updatedPlan: PlanoAcao5S = {
      ...editingPlan,
      descricao: planDesc.trim(),
      responsavel: planResp.trim(),
      prazo: planDeadline,
      status: planStatus,
      dataConclusao: planStatus === 'Concluído' ? (planConclusionDate || new Date().toISOString().split('T')[0]) : undefined,
      fotosCorrecao: correctionPhotos,
      comentarios: newComment.trim() ? [...editingPlan.comentarios, newComment.trim()] : editingPlan.comentarios,
      historico: [
        ...editingPlan.historico,
        {
          data: new Date().toISOString().split('T')[0],
          usuario: currentUserName,
          acao: "Atualização",
          detalhes: `Status alterado para ${planStatus}. ${newComment.trim() ? 'Novo comentário adicionado.' : ''}`
        }
      ]
    };

    const updatedList = planos.map(p => p.id === editingPlan.id ? updatedPlan : p);
    onUpdatePlanos(updatedList);

    onAddLog('Plano de Ação 5S', `Atualizou plano de ação ${editingPlan.id} (${planStatus})`);
    alert("Plano de Ação atualizado com sucesso!");
    setEditingPlan(null);
  };

  // --- FILTERS LOGIC ---

  const filteredPlanos = planos.filter(p => {
    const audit = auditorias.find(a => a.id === p.auditoriaId);
    if (!audit) return false;

    const req = requisitos.find(r => r.id === p.requisitoId);
    const reqCode = req?.codigo || '';
    const sectorName = audit.setor || '';

    const matchSearch = p.descricao.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        p.responsavel.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        reqCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        sectorName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchStatus = filterStatus === 'TODOS' || p.status === filterStatus;
    const matchSector = filterSector === 'TODOS' || 
                        audit.setorId === filterSector ||
                        audit.setor === filterSector ||
                        (setores.find(s => s.id === filterSector)?.nome.toLowerCase() === (audit.setor || '').toLowerCase());
    const matchMySector = !filterOnlyMySectors || isPlanSectorTiedToUser(p);

    return matchSearch && matchStatus && matchSector && matchMySector;
  });

  // NC list (non-conformities that might or might not have action plans)
  const nonConformities = itens.filter(it => {
    const audit = auditorias.find(a => a.id === it.auditoriaId && a.status === 'Finalizada');
    if (!audit) return false;

    const matchNC = it.avaliacao === 'Não Atende' || it.avaliacao === 'Atende Parcialmente';
    const matchSector = filterSector === 'TODOS' || 
                        audit.setorId === filterSector ||
                        audit.setor === filterSector ||
                        (setores.find(s => s.id === filterSector)?.nome.toLowerCase() === (audit.setor || '').toLowerCase());
    
    const req = requisitos.find(r => r.id === it.requisitoId);
    const matchSearch = req?.codigo.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        req?.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        it.observacoes.toLowerCase().includes(searchTerm.toLowerCase());

    return matchNC && matchSector && matchSearch;
  });

  // Reincidências (items that have reincidenciaCount > 0 in their latest final audit)
  const activeReincidencias = itens.filter(it => {
    const audit = auditorias.find(a => a.id === it.auditoriaId && a.status === 'Finalizada');
    if (!audit) return false;

    const matchReinc = (it.reincidenciaCount || 0) > 0;
    const matchSector = filterSector === 'TODOS' || 
                        audit.setorId === filterSector ||
                        audit.setor === filterSector ||
                        (setores.find(s => s.id === filterSector)?.nome.toLowerCase() === (audit.setor || '').toLowerCase());

    const req = requisitos.find(r => r.id === it.requisitoId);
    const matchSearch = req?.codigo.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        req?.nome.toLowerCase().includes(searchTerm.toLowerCase());

    return matchReinc && matchSector && matchSearch;
  });

  return (
    <div className="space-y-6">
      
      {/* Visual Navigation Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 p-1.5 gap-2 bg-slate-50 dark:bg-slate-950 rounded-xl">
        <button
          onClick={() => setActiveSubTab('planos')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
            activeSubTab === 'planos'
              ? 'bg-[#0B3A63] text-white shadow-xs'
              : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-850'
          }`}
        >
          Planos de Ação Ativos ({planos.length})
        </button>
        <button
          onClick={() => setActiveSubTab('ncs')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
            activeSubTab === 'ncs'
              ? 'bg-[#0B3A63] text-white shadow-xs'
              : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-850'
          }`}
        >
          Lista de Não Conformidades ({nonConformities.length})
        </button>
        <button
          onClick={() => setActiveSubTab('reincidencias')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
            activeSubTab === 'reincidencias'
              ? 'bg-[#0B3A63] text-white shadow-xs'
              : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-850'
          }`}
        >
          Reincidências Críticas ({activeReincidencias.length})
        </button>
      </div>

      {/* SEARCH AND FILTERS */}
      <div className="flex flex-col md:flex-row gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por descrição, responsável, código..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-800 text-xs border border-slate-200 dark:border-slate-700 rounded-lg pl-9 pr-3 py-2"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <select
            value={filterSector}
            onChange={(e) => setFilterSector(e.target.value)}
            className="bg-slate-50 dark:bg-slate-800 text-[10px] border border-slate-200 dark:border-slate-700 rounded-lg p-2 font-bold cursor-pointer"
          >
            <option value="TODOS">Todos Setores</option>
            {setores.map(s => (
              <option key={s.id} value={s.id}>{s.nome}</option>
            ))}
          </select>

          {activeSubTab === 'planos' && (
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-slate-50 dark:bg-slate-800 text-[10px] border border-slate-200 dark:border-slate-700 rounded-lg p-2 font-bold"
            >
              <option value="TODOS">Todos Status</option>
              <option value="Pendente">Pendente</option>
              <option value="Em Andamento">Em Andamento</option>
              <option value="Concluído">Concluído</option>
              <option value="Atrasado">Atrasado</option>
            </select>
          )}

          {!hasGlobalScope && userTiedSectors.length > 0 && (
            <button
              type="button"
              onClick={() => setFilterOnlyMySectors(prev => !prev)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 border shrink-0 cursor-pointer ${
                filterOnlyMySectors
                  ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
              }`}
              title="Exibir apenas os planos de ação atrelados ao(s) seu(s) setor(es)"
            >
              <Check className={`w-3.5 h-3.5 ${filterOnlyMySectors ? 'opacity-100' : 'opacity-30'}`} />
              <span>Apenas Meus Setores</span>
            </button>
          )}
        </div>
      </div>

      {/* --- Tab 1: PLANOS DE AÇÃO --- */}
      {activeSubTab === 'planos' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {filteredPlanos.length === 0 ? (
            <div className="col-span-3 p-8 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-center text-slate-400 italic rounded-xl">
              Nenhum plano de ação encontrado para os filtros ativos.
            </div>
          ) : (
            filteredPlanos.map(plan => {
              const audit = auditorias.find(a => a.id === plan.auditoriaId);
              const req = requisitos.find(r => r.id === plan.requisitoId);
              const isTied = isPlanSectorTiedToUser(plan);
              
              return (
                <div key={plan.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
                  <div className="space-y-3.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold text-[#0B3A63] bg-blue-50 dark:bg-blue-950/30 px-2 py-0.5 rounded-sm uppercase">
                        {req?.codigo || '5S'}
                      </span>
                      <div className="flex items-center gap-1.5">
                        {isTied ? (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                            <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                            <span>Seu Setor</span>
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700 flex items-center gap-1">
                            <Lock className="w-2.5 h-2.5 text-slate-400" />
                            <span>Outro Setor</span>
                          </span>
                        )}
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          plan.status === 'Concluído' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                          plan.status === 'Em Andamento' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                          'bg-slate-100 text-slate-500 border-slate-200'
                        }`}>
                          {plan.status}
                        </span>
                      </div>
                    </div>

                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 line-clamp-2">
                      {plan.descricao}
                    </h4>

                    <div className="text-[11px] text-slate-400 space-y-1 font-sans">
                      <p>Setor: <span className="font-semibold text-slate-600 dark:text-slate-300">{audit?.setor || 'Geral'}</span></p>
                      <p>Responsável: {plan.responsavel ? (
                        <span className="font-semibold text-slate-600 dark:text-slate-300">{plan.responsavel}</span>
                      ) : (
                        <span className="text-amber-500 font-bold italic">Não definido (Obrigatório)</span>
                      )}</p>
                      <p>Prazo Limite: <span className="font-semibold text-slate-600 dark:text-slate-300 font-mono">{plan.prazo}</span></p>
                    </div>
                  </div>

                  <div className="mt-4 pt-3.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-[9px] text-slate-400 uppercase font-mono">Ref: {audit?.codigo}</span>
                    <button
                      onClick={() => handleOpenPlanModal(plan)}
                      className={`text-[11px] font-bold hover:underline cursor-pointer flex items-center space-x-1 ${
                        isTied ? 'text-[#0B3A63] dark:text-sky-400' : 'text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      <span>{isTied ? 'Editar e Tratar' : 'Consultar Detalhes'}</span>
                      <span>&rarr;</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* --- Tab 2: LISTA DE NÃO CONFORMIDADES --- */}
      {activeSubTab === 'ncs' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 font-bold border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="p-3">Auditoria / Data</th>
                  <th className="p-3">Requisito</th>
                  <th className="p-3">Avaliação</th>
                  <th className="p-3">Desvio Apontado</th>
                  <th className="p-3">Plano de Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium text-slate-700 dark:text-slate-300">
                {nonConformities.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-400 italic">
                      Nenhuma não conformidade encontrada para o escopo selecionado.
                    </td>
                  </tr>
                ) : (
                  nonConformities.map(nc => {
                    const audit = auditorias.find(a => a.id === nc.auditoriaId)!;
                    const req = requisitos.find(r => r.id === nc.requisitoId)!;
                    const linkedPlan = planos.find(p => p.id === nc.planoAcaoId);

                    return (
                      <tr key={nc.id} className="hover:bg-slate-50/40 dark:hover:bg-slate-800/10">
                        <td className="p-3">
                          <p className="font-bold">{audit.codigo}</p>
                          <p className="text-[10px] text-slate-400 font-mono">{audit.dataAuditoria}</p>
                        </td>
                        <td className="p-3">
                          <span className="font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-1.5 py-0.5 rounded mr-1.5">{req?.codigo}</span>
                          <span className="font-bold">{req?.nome}</span>
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded-sm text-[10px] font-bold ${
                            nc.avaliacao === 'Não Atende' 
                              ? 'bg-rose-50 dark:bg-rose-950/30 text-rose-600' 
                              : 'bg-amber-50 dark:bg-amber-950/30 text-amber-600'
                          }`}>
                            {nc.avaliacao}
                          </span>
                        </td>
                        <td className="p-3 max-w-[250px] truncate" title={nc.observacoes}>
                          {nc.observacoes || 'Sem detalhes complementares'}
                        </td>
                        <td className="p-3">
                          {linkedPlan ? (
                            <button 
                              onClick={() => handleOpenPlanModal(linkedPlan)}
                              className="text-xs text-[#0B3A63] dark:text-sky-400 font-bold hover:underline"
                            >
                              Ver {linkedPlan.status} &rarr;
                            </button>
                          ) : (
                            <span className="text-[10px] text-rose-500 font-bold uppercase">Não gerado</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- Tab 3: REINCIDÊNCIAS CRÍTICAS --- */}
      {activeSubTab === 'reincidencias' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 font-bold border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="p-3">Setor</th>
                  <th className="p-3">Requisito Consecutivo</th>
                  <th className="p-3 text-center">Frequência</th>
                  <th className="p-3">Última Auditoria</th>
                  <th className="p-3">Status Plano de Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium text-slate-700 dark:text-slate-300">
                {activeReincidencias.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-400 italic">
                      Nenhuma reincidência crítica identificada nesta amostragem.
                    </td>
                  </tr>
                ) : (
                  activeReincidencias.map(reinc => {
                    const audit = auditorias.find(a => a.id === reinc.auditoriaId)!;
                    const req = requisitos.find(r => r.id === reinc.requisitoId)!;
                    const linkedPlan = planos.find(p => p.id === reinc.planoAcaoId);

                    return (
                      <tr key={reinc.id} className="hover:bg-slate-50/40 dark:hover:bg-slate-800/10">
                        <td className="p-3 font-bold">{audit.setor}</td>
                        <td className="p-3">
                          <span className="font-mono font-bold bg-rose-50 text-rose-600 px-1.5 py-0.5 rounded mr-1.5">{req?.codigo}</span>
                          <span className="font-bold">{req?.nome}</span>
                        </td>
                        <td className="p-3 text-center">
                          <span className="bg-red-500 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full font-mono">
                            {reinc.reincidenciaCount}x consecutivas
                          </span>
                        </td>
                        <td className="p-3">
                          <p className="font-bold text-slate-500">{audit.codigo}</p>
                          <p className="text-[10px] text-slate-400 font-mono">{audit.dataAuditoria}</p>
                        </td>
                        <td className="p-3">
                          {linkedPlan ? (
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                              linkedPlan.status === 'Concluído' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                              linkedPlan.status === 'Em Andamento' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                              'bg-slate-100 text-slate-500 border-slate-200'
                            }`}>
                              {linkedPlan.status}
                            </span>
                          ) : (
                            <span className="text-[10px] text-rose-500 font-bold uppercase">Pendente Tratativa</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- PLANO DE AÇÃO EDITING MODAL --- */}
      {editingPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-xs">
          <form onSubmit={handleSavePlan} className="bg-white dark:bg-slate-900 rounded-xl max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden animate-fade-in text-left">
            <div className="bg-[#0B3A63] text-white p-4 flex justify-between items-center">
              <h4 className="text-xs font-bold uppercase tracking-wider">Gerenciar Plano de Ação</h4>
              <button type="button" onClick={() => setEditingPlan(null)}><X className="w-4 h-4" /></button>
            </div>
            
            <div className="p-5 space-y-4 text-xs max-h-[70vh] overflow-y-auto">
              {hasAccessToFillEditingPlan ? (
                <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-lg text-emerald-800 dark:text-emerald-300 text-xs flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Setor Vinculado: {editingPlanSectorInfo.nome}</span>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 px-2 py-0.5 rounded-full">
                    Edição Liberada
                  </span>
                </div>
              ) : (
                <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 rounded-lg flex items-start gap-2.5 text-xs">
                  <Lock className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
                  <div className="space-y-0.5">
                    <p className="font-bold">Acesso em Modo de Consulta (Somente Leitura)</p>
                    <p className="text-[11px] leading-relaxed">
                      Este plano de ação pertence ao setor <strong>{editingPlanSectorInfo.nome}</strong>.
                      Seu usuário está vinculado a: <strong>{userTiedSectorNames.length > 0 ? userTiedSectorNames.join(', ') : (user?.sector || 'Nenhum')}</strong>.
                      Apenas colaboradores do setor correspondente podem preencher e salvar ações corretivas.
                    </p>
                  </div>
                </div>
              )}

              <div className="space-y-1 bg-slate-50 dark:bg-slate-950 p-3 rounded-lg border border-slate-100 dark:border-slate-850">
                <span className="text-[9px] uppercase font-bold text-slate-400 block">Desvio Apontado</span>
                <p className="font-bold text-slate-700 dark:text-slate-300 leading-relaxed mt-0.5">{editingPlan.descricao}</p>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-black text-slate-400 uppercase">Ação Corretiva Descrita</label>
                <textarea
                  required
                  placeholder="Descreva detalhadamente a ação corretiva que será tomada..."
                  value={planDesc}
                  onChange={(e) => setPlanDesc(e.target.value)}
                  disabled={!hasAccessToFillEditingPlan}
                  rows={3}
                  className="w-full bg-slate-50 dark:bg-slate-800 leading-relaxed border border-slate-200 dark:border-slate-700 rounded-lg p-2 disabled:opacity-60"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-[10px] font-black text-slate-400 uppercase">
                    E-mail do Responsável <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="responsavel@vickytex.com.br"
                    value={planResp}
                    onChange={(e) => setPlanResp(e.target.value)}
                    disabled={!hasAccessToFillEditingPlan}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 font-semibold disabled:opacity-60 placeholder:text-slate-400 placeholder:font-normal"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-black text-slate-400 uppercase">Prazo Limite</label>
                  <input
                    type="date"
                    required
                    value={planDeadline}
                    onChange={(e) => setPlanDeadline(e.target.value)}
                    disabled={!hasAccessToFillEditingPlan}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 font-mono font-semibold disabled:opacity-60"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-[10px] font-black text-slate-400 uppercase">Status do Plano</label>
                  <select
                    value={planStatus}
                    onChange={(e) => setPlanStatus(e.target.value as any)}
                    disabled={!hasAccessToFillEditingPlan}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 font-bold text-slate-800 dark:text-slate-100 disabled:opacity-60"
                  >
                    <option value="Pendente">Pendente</option>
                    <option value="Em Andamento">Em Andamento</option>
                    <option value="Concluído">Concluído</option>
                    <option value="Atrasado">Atrasado</option>
                  </select>
                </div>

                {planStatus === 'Concluído' && (
                  <div className="space-y-1">
                    <label className="block text-[10px] font-black text-slate-400 uppercase">Data Conclusão</label>
                    <input
                      type="date"
                      required
                      value={planConclusionDate}
                      onChange={(e) => setPlanConclusionDate(e.target.value)}
                      disabled={!hasAccessToFillEditingPlan}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 font-mono disabled:opacity-60"
                    />
                  </div>
                )}
              </div>

              {/* Correction Photos */}
              <div className="space-y-1.5 pt-1">
                <label className="block text-[10px] font-black text-slate-400 uppercase">Evidências de Correção (Fotos)</label>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsLiveCameraOpen(true)}
                    disabled={!hasAccessToFillEditingPlan}
                    className={`cursor-pointer bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 px-3 py-2 rounded-lg text-[10px] font-black flex items-center justify-center space-x-1.5 border border-amber-500/30 transition-all shrink-0 ${!hasAccessToFillEditingPlan ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>Câmera ao Vivo / Foto</span>
                  </button>

                  <div className="flex flex-wrap gap-2">
                    {correctionPhotos.map((photo, pIdx) => (
                      <div key={pIdx} className="relative group w-14 h-14 rounded-lg overflow-hidden border border-slate-300 dark:border-slate-700 bg-black shrink-0 shadow-xs">
                        <img src={photo} className="w-full h-full object-cover" alt="Correction" />
                        {hasAccessToFillEditingPlan && (
                          <button
                            type="button"
                            onClick={() => handleRemoveCorrectionPhoto(pIdx)}
                            className="absolute top-1 right-1 bg-rose-600 hover:bg-rose-700 text-white rounded-full p-1 shadow-md transition-all"
                            title="Remover foto"
                          >
                            <X className="w-2.5 h-2.5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Comments and History list */}
              <div className="space-y-2 pt-2 border-t border-slate-150 dark:border-slate-850">
                <label className="block text-[10px] font-black text-slate-400 uppercase">Adicionar Comentário / Justificativa</label>
                <textarea
                  placeholder={hasAccessToFillEditingPlan ? "Justifique o andamento ou conclusão do plano..." : "Visualização de comentários apenas"}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  disabled={!hasAccessToFillEditingPlan}
                  rows={2}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 disabled:opacity-60"
                />
              </div>

              {editingPlan.comentarios.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span className="block text-[9px] uppercase font-bold text-slate-400">Histórico de Comentários</span>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {editingPlan.comentarios.map((cmt, cIdx) => (
                      <div key={cIdx} className="bg-slate-50 dark:bg-slate-950/40 p-2 rounded-lg text-[11px] leading-relaxed text-slate-600 dark:text-slate-400">
                        {cmt}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="bg-slate-50 dark:bg-slate-950 p-4 flex justify-end space-x-2 border-t border-slate-150 dark:border-slate-850">
              <button 
                type="button" 
                onClick={() => setEditingPlan(null)} 
                className="px-3.5 py-1.5 border border-slate-200 dark:border-slate-800 text-slate-500 rounded-lg hover:bg-slate-100 text-xs font-semibold cursor-pointer"
              >
                Fechar
              </button>
              {hasAccessToFillEditingPlan ? (
                <button 
                  type="submit" 
                  className="px-4 py-1.5 rounded-lg font-bold text-xs bg-amber-500 text-slate-950 hover:bg-amber-600 transition-all shadow-xs cursor-pointer flex items-center space-x-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Salvar Alterações</span>
                </button>
              ) : (
                <button 
                  type="button" 
                  disabled
                  className="px-3.5 py-1.5 rounded-lg font-semibold text-xs bg-slate-200 text-slate-400 dark:bg-slate-800 dark:text-slate-600 cursor-not-allowed flex items-center space-x-1.5"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Salvar Bloqueado (Outro Setor)</span>
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      {/* --- LIVE CAMERA MODAL FOR CORRECTION EVIDENCE --- */}
      <FiveSCameraModal
        isOpen={isLiveCameraOpen}
        onClose={() => setIsLiveCameraOpen(false)}
        onCapture={(base64) => {
          setCorrectionPhotos(prev => [...prev, base64]);
        }}
        title="Evidência de Correção em Tempo Real"
        defaultLegend="Evidência de correção do plano de ação"
      />
    </div>
  );
};
