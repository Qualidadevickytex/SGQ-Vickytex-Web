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

  // Editing Action Plan modal
  const [editingPlan, setEditingPlan] = useState<PlanoAcao5S | null>(null);
  const [planDesc, setPlanDesc] = useState('');
  const [planResp, setPlanResp] = useState('');
  const [planDeadline, setPlanDeadline] = useState('');
  const [planStatus, setPlanStatus] = useState<'Pendente' | 'Em Andamento' | 'Concluído' | 'Atrasado'>('Pendente');
  const [planConclusionDate, setPlanConclusionDate] = useState('');
  const [newComment, setNewComment] = useState('');
  const [correctionPhotos, setCorrectionPhotos] = useState<string[]>([]);

  // Access control based on sector mapping
  const auditOfEditingPlan = editingPlan ? auditorias.find(a => a.id === editingPlan.auditoriaId) : null;
  const isQualidadeOrAdminOfEditingPlan = user?.role === 'Qualidade' || user?.role === 'Administrador';
  const userSectorMatchesEditingPlan = !!(user?.sector && auditOfEditingPlan?.setor && user.sector.trim().toLowerCase() === auditOfEditingPlan.setor.trim().toLowerCase());
  const hasAccessToFillEditingPlan = canModify && (isQualidadeOrAdminOfEditingPlan || userSectorMatchesEditingPlan);

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

  const handleUploadCorrectionPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setCorrectionPhotos(prev => [...prev, base64]);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveCorrectionPhoto = (idx: number) => {
    setCorrectionPhotos(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSavePlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlan) return;

    const audit = auditorias.find(a => a.id === editingPlan.auditoriaId);
    const isQualidadeOrAdmin = user?.role === 'Qualidade' || user?.role === 'Administrador';
    const userSectorMatches = !!(user?.sector && audit?.setor && user.sector.trim().toLowerCase() === audit.setor.trim().toLowerCase());
    const hasAccessToFill = canModify && (isQualidadeOrAdmin || userSectorMatches);

    if (!hasAccessToFill) {
      alert(`Acesso negado. O preenchimento deste plano de ação é restrito a usuários do setor correspondente (${audit?.setor || 'Nenhum'}).`);
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
                        reqCode.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchStatus = filterStatus === 'TODOS' || p.status === filterStatus;
    const matchSector = filterSector === 'TODOS' || audit.setorId === filterSector;

    return matchSearch && matchStatus && matchSector;
  });

  // NC list (non-conformities that might or might not have action plans)
  const nonConformities = itens.filter(it => {
    const audit = auditorias.find(a => a.id === it.auditoriaId && a.status === 'Finalizada');
    if (!audit) return false;

    const matchNC = it.avaliacao === 'Não Atende' || it.avaliacao === 'Atende Parcialmente';
    const matchSector = filterSector === 'TODOS' || audit.setorId === filterSector;
    
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
    const matchSector = filterSector === 'TODOS' || audit.setorId === filterSector;

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

        <div className="grid grid-cols-2 gap-2 shrink-0">
          <select
            value={filterSector}
            onChange={(e) => setFilterSector(e.target.value)}
            className="bg-slate-50 dark:bg-slate-800 text-[10px] border border-slate-200 dark:border-slate-700 rounded-lg p-2 font-bold"
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
              
              return (
                <div key={plan.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
                  <div className="space-y-3.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold text-[#0B3A63] bg-blue-50 dark:bg-blue-950/30 px-2 py-0.5 rounded-sm uppercase">
                        {req?.codigo || '5S'}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        plan.status === 'Concluído' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                        plan.status === 'Em Andamento' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                        'bg-slate-100 text-slate-500 border-slate-200'
                      }`}>
                        {plan.status}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 line-clamp-2">
                      {plan.descricao}
                    </h4>

                    <div className="text-[11px] text-slate-400 space-y-1 font-sans">
                      <p>Setor: <span className="font-semibold text-slate-600 dark:text-slate-300">{audit?.setor}</span></p>
                      <p>Responsável: <span className="font-semibold text-slate-600 dark:text-slate-300">{plan.responsavel}</span></p>
                      <p>Prazo Limite: <span className="font-semibold text-slate-600 dark:text-slate-300 font-mono">{plan.prazo}</span></p>
                    </div>
                  </div>

                  <div className="mt-4 pt-3.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-[9px] text-slate-400 uppercase font-mono">Ref: {audit?.codigo}</span>
                    <button
                      onClick={() => handleOpenPlanModal(plan)}
                      className="text-[11px] text-[#0B3A63] dark:text-sky-400 font-bold hover:underline"
                    >
                      Gerenciar Plano &rarr;
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
              {!hasAccessToFillEditingPlan && (
                <div className="p-3 bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900 text-rose-600 dark:text-rose-400 rounded-lg flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">Acesso Restrito ao Setor</p>
                    <p className="text-[11px] mt-0.5">
                      O preenchimento deste plano de ação é restrito a colaboradores do setor correspondente (<strong>{auditOfEditingPlan?.setor || 'Nenhum'}</strong>). Seu setor atual é <strong>{user?.sector || 'não definido'}</strong>.
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
                  <label className="block text-[10px] font-black text-slate-400 uppercase">E-mail do Responsável</label>
                  <input
                    type="email"
                    required
                    value={planResp}
                    onChange={(e) => setPlanResp(e.target.value)}
                    disabled={!hasAccessToFillEditingPlan}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 font-semibold disabled:opacity-60"
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
                <div className="flex items-center space-x-2">
                  <label className={`cursor-pointer bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-3 py-2 rounded-lg text-[10px] font-bold flex items-center space-x-1 border border-slate-200 dark:border-slate-700 ${!hasAccessToFillEditingPlan ? 'opacity-50 cursor-not-allowed' : 'hover:bg-slate-200'}`}>
                    <Camera className="w-3.5 h-3.5" />
                    <span>Adicionar Evidência</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleUploadCorrectionPhoto}
                      disabled={!hasAccessToFillEditingPlan}
                      className="hidden"
                    />
                  </label>

                  <div className="flex flex-wrap gap-1.5">
                    {correctionPhotos.map((photo, pIdx) => (
                      <div key={pIdx} className="relative w-8 h-8 rounded-sm overflow-hidden border border-slate-300">
                        <img src={photo} className="w-full h-full object-cover" alt="Correction" />
                        {hasAccessToFillEditingPlan && (
                          <button
                            type="button"
                            onClick={() => handleRemoveCorrectionPhoto(pIdx)}
                            className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-0.5 scale-75 hover:bg-red-600"
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
              <button type="button" onClick={() => setEditingPlan(null)} className="px-3 py-1.5 border border-slate-200 dark:border-slate-800 text-slate-500 rounded-lg hover:bg-slate-100">Cancelar</button>
              <button 
                type="submit" 
                disabled={!hasAccessToFillEditingPlan}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  hasAccessToFillEditingPlan 
                    ? 'bg-amber-500 text-slate-950 hover:bg-amber-600' 
                    : 'bg-slate-200 text-slate-400 dark:bg-slate-800 dark:text-slate-600 cursor-not-allowed'
                }`}
              >
                Salvar Alterações
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
