import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  Edit2, 
  Save, 
  X, 
  Sliders, 
  Award, 
  AlertTriangle, 
  Layers, 
  Briefcase, 
  Calendar,
  Check,
  RefreshCw,
  Trophy
} from 'lucide-react';
import { 
  Setor5S, 
  Requisito5S, 
  Classificacao5S, 
  Configuracao5S, 
  CicloAuditoria,
  Senso5S
} from '../../types/fiveS';

interface FiveSConfigProps {
  setores: Setor5S[];
  sensos: Senso5S[];
  requisitos: Requisito5S[];
  classificacoes: Classificacao5S[];
  config: Configuracao5S;
  ciclos: CicloAuditoria[];
  onUpdateSetores: (data: Setor5S[]) => void;
  onUpdateRequisitos: (data: Requisito5S[]) => void;
  onUpdateClassificacoes: (data: Classificacao5S[]) => void;
  onUpdateConfig: (data: Configuracao5S) => void;
  onUpdateCiclos: (data: CicloAuditoria[]) => void;
  canModify: boolean;
}

export const FiveSConfig: React.FC<FiveSConfigProps> = ({
  setores,
  sensos,
  requisitos,
  classificacoes,
  config,
  ciclos,
  onUpdateSetores,
  onUpdateRequisitos,
  onUpdateClassificacoes,
  onUpdateConfig,
  onUpdateCiclos,
  canModify
}) => {
  const [subTab, setSubTab] = useState<'setores' | 'requisitos' | 'classificacoes' | 'reincidencia' | 'trofeu' | 'ciclos'>('setores');

  // Sector form state
  const [isSectorModalOpen, setIsSectorModalOpen] = useState(false);
  const [editingSector, setEditingSector] = useState<Setor5S | null>(null);
  const [sectorName, setSectorName] = useState('');
  const [sectorActive, setSectorActive] = useState(true);
  const [sectorOrder, setSectorOrder] = useState(1);

  // Requirement form state
  const [isReqModalOpen, setIsReqModalOpen] = useState(false);
  const [editingReq, setEditingReq] = useState<Requisito5S | null>(null);
  const [reqCode, setReqCode] = useState('');
  const [reqName, setReqName] = useState('');
  const [reqDesc, setReqDesc] = useState('');
  const [reqSenso, setReqSenso] = useState('S1');
  const [reqActive, setReqActive] = useState(true);
  const [reqOrder, setReqOrder] = useState(1);
  const [reqSectors, setReqSectors] = useState<string[]>(['TODOS']);
  const [reqObs, setReqObs] = useState('');

  // Classification form state
  const [isClassModalOpen, setIsClassModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<Classificacao5S | null>(null);
  const [classMin, setClassMin] = useState<number | string>(0);
  const [classMax, setClassMax] = useState<number | string>(100);
  const [className, setClassName] = useState('');
  const [classCor, setClassCor] = useState('blue');
  const [classIcon, setClassIcon] = useState('Award');

  // Cycle form state
  const [isCycleModalOpen, setIsCycleModalOpen] = useState(false);
  const [editingCycle, setEditingCycle] = useState<CicloAuditoria | null>(null);
  const [cycleName, setCycleName] = useState('');
  const [cycleStart, setCycleStart] = useState('');
  const [cycleEnd, setCycleEnd] = useState('');
  const [cycleActive, setCycleActive] = useState(true);

  // Reincidência & Score points state
  const [ptTotal, setPtTotal] = useState(config.pontosAtendeTotalmente);
  const [ptParcial, setPtParcial] = useState(config.pontosAtendeParcialmente);
  const [ptNao, setPtNao] = useState(config.pontosNaoAtende);
  const [penalParcial, setPenalParcial] = useState(config.penalidadeReincidenciaParcial);
  const [penalNao, setPenalNao] = useState(config.penalidadeReincidenciaNaoAtende);

  // Trophy configs
  const [trophyWinners, setTrophyWinners] = useState(config.trofeuQtdVencedores);
  const [trophyName, setTrophyName] = useState(config.trofeuNomePremio);
  const [trophyPeriod, setTrophyPeriod] = useState(config.trofeuPeriodicidade);
  const [trophyText, setTrophyText] = useState(config.trofeuTextoCertificado);
  const [trophyImg, setTrophyImg] = useState(config.trofeuImagemUrl);

  // Sync state whenever remote/realtime config changes
  useEffect(() => {
    if (config) {
      setPtTotal(config.pontosAtendeTotalmente);
      setPtParcial(config.pontosAtendeParcialmente);
      setPtNao(config.pontosNaoAtende);
      setPenalParcial(config.penalidadeReincidenciaParcial);
      setPenalNao(config.penalidadeReincidenciaNaoAtende);
      setTrophyWinners(config.trofeuQtdVencedores);
      setTrophyName(config.trofeuNomePremio);
      setTrophyPeriod(config.trofeuPeriodicidade);
      setTrophyText(config.trofeuTextoCertificado);
      setTrophyImg(config.trofeuImagemUrl);
    }
  }, [config]);

  // --- SECTORS ACTIONS ---
  const handleOpenSectorModal = (sector?: Setor5S) => {
    if (sector) {
      setEditingSector(sector);
      setSectorName(sector.nome);
      setSectorActive(sector.ativo);
      setSectorOrder(sector.ordemRanking);
    } else {
      setEditingSector(null);
      setSectorName('');
      setSectorActive(true);
      setSectorOrder(setores.length + 1);
    }
    setIsSectorModalOpen(true);
  };

  const handleSaveSector = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sectorName.trim()) return;

    let updatedList = [...setores];
    if (editingSector) {
      updatedList = updatedList.map(s => s.id === editingSector.id 
        ? { ...s, nome: sectorName.trim(), ativo: sectorActive, ordemRanking: Number(sectorOrder) }
        : s
      );
    } else {
      updatedList.push({
        id: `setor-${Date.now()}`,
        nome: sectorName.trim(),
        ativo: sectorActive,
        ordemRanking: Number(sectorOrder)
      });
    }
    onUpdateSetores(updatedList);
    setIsSectorModalOpen(false);
  };

  const handleDeleteSector = (id: string) => {
    if (confirm("Deseja realmente excluir este setor?")) {
      const updated = setores.filter(s => s.id !== id);
      onUpdateSetores(updated);
    }
  };

  // --- REQUIREMENTS ACTIONS ---
  const handleOpenReqModal = (req?: Requisito5S) => {
    if (req) {
      setEditingReq(req);
      setReqCode(req.codigo);
      setReqName(req.nome);
      setReqDesc(req.descricao);
      setReqSenso(req.sensoId);
      setReqActive(req.ativo);
      setReqOrder(req.ordem);
      setReqSectors(req.setoresAplicaveis);
      setReqObs(req.observacoes || '');
    } else {
      setEditingReq(null);
      setReqCode('');
      setReqName('');
      setReqDesc('');
      setReqSenso('S1');
      setReqActive(true);
      setReqOrder(requisitos.length + 1);
      setReqSectors(['TODOS']);
      setReqObs('');
    }
    setIsReqModalOpen(true);
  };

  const handleSaveReq = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reqCode.trim() || !reqName.trim()) return;

    let updatedList = [...requisitos];
    if (editingReq) {
      updatedList = updatedList.map(r => r.id === editingReq.id 
        ? { 
            ...r, 
            codigo: reqCode.trim(), 
            nome: reqName.trim(), 
            descricao: reqDesc.trim(), 
            sensoId: reqSenso, 
            ativo: reqActive, 
            ordem: Number(reqOrder), 
            setoresAplicaveis: reqSectors, 
            observacoes: reqObs.trim() 
          }
        : r
      );
    } else {
      updatedList.push({
        id: `req-${Date.now()}`,
        codigo: reqCode.trim(),
        nome: reqName.trim(),
        descricao: reqDesc.trim(),
        sensoId: reqSenso,
        ativo: reqActive,
        ordem: Number(reqOrder),
        setoresAplicaveis: reqSectors,
        observacoes: reqObs.trim()
      });
    }
    // Sort automatically by code/order
    updatedList.sort((a,b) => a.codigo.localeCompare(b.codigo));
    onUpdateRequisitos(updatedList);
    setIsReqModalOpen(false);
  };

  const handleDeleteReq = (id: string) => {
    if (confirm("Deseja realmente excluir este requisito?")) {
      onUpdateRequisitos(requisitos.filter(r => r.id !== id));
    }
  };

  // --- CLASSIFICATIONS ACTIONS ---
  const handleOpenClassModal = (cls?: Classificacao5S) => {
    if (cls) {
      setEditingClass(cls);
      setClassMin(cls.min);
      setClassMax(cls.max);
      setClassName(cls.nome);
      setClassCor(cls.cor);
      setClassIcon(cls.icone);
    } else {
      setEditingClass(null);
      setClassMin(0);
      setClassMax(100);
      setClassName('');
      setClassCor('blue');
      setClassIcon('Award');
    }
    setIsClassModalOpen(true);
  };

  const handleSaveClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!className.trim()) return;

    const minNum = typeof classMin === 'number' ? classMin : parseFloat(String(classMin).replace(',', '.'));
    const maxNum = typeof classMax === 'number' ? classMax : parseFloat(String(classMax).replace(',', '.'));
    const cleanMin = isNaN(minNum) ? 0 : minNum;
    const cleanMax = isNaN(maxNum) ? 100 : maxNum;

    let updatedList = [...classificacoes];
    if (editingClass) {
      updatedList = updatedList.map(c => c.id === editingClass.id
        ? { ...c, min: cleanMin, max: cleanMax, nome: className.trim(), cor: classCor, icone: classIcon }
        : c
      );
    } else {
      updatedList.push({
        id: `class-${Date.now()}`,
        min: cleanMin,
        max: cleanMax,
        nome: className.trim(),
        cor: classCor,
        icone: classIcon
      });
    }
    // Sort descending by min score
    updatedList.sort((a,b) => b.min - a.min);
    onUpdateClassificacoes(updatedList);
    setIsClassModalOpen(false);
  };

  // --- CYCLES ACTIONS ---
  const handleOpenCycleModal = (cycle?: CicloAuditoria) => {
    if (cycle) {
      setEditingCycle(cycle);
      setCycleName(cycle.nome);
      setCycleStart(cycle.dataInicio);
      setCycleEnd(cycle.dataFim);
      setCycleActive(cycle.ativo);
    } else {
      setEditingCycle(null);
      setCycleName('');
      setCycleStart('');
      setCycleEnd('');
      setCycleActive(true);
    }
    setIsCycleModalOpen(true);
  };

  const handleSaveCycle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cycleName.trim() || !cycleStart || !cycleEnd) return;

    let updatedList = [...ciclos];
    if (cycleActive) {
      // Deactivate all other cycles if this one is active
      updatedList = updatedList.map(c => ({ ...c, ativo: false }));
    }

    if (editingCycle) {
      updatedList = updatedList.map(c => c.id === editingCycle.id
        ? { ...c, nome: cycleName.trim(), dataInicio: cycleStart, dataFim: cycleEnd, ativo: cycleActive }
        : c
      );
    } else {
      updatedList.push({
        id: `ciclo-${Date.now()}`,
        nome: cycleName.trim(),
        dataInicio: cycleStart,
        dataFim: cycleEnd,
        ativo: cycleActive
      });
    }
    onUpdateCiclos(updatedList);
    setIsCycleModalOpen(false);
  };

  const handleDeleteCycle = (id: string) => {
    if (confirm('Tem certeza de que deseja excluir este ciclo de auditoria?')) {
      const updatedList = ciclos.filter(c => c.id !== id);
      onUpdateCiclos(updatedList);
    }
  };

  // --- REINCIDÊNCIA & SCORES ---
  const handleSavePointsAndPenalties = () => {
    onUpdateConfig({
      ...config,
      pontosAtendeTotalmente: Number(ptTotal),
      pontosAtendeParcialmente: Number(ptParcial),
      pontosNaoAtende: Number(ptNao),
      penalidadeReincidenciaParcial: Number(penalParcial),
      penalidadeReincidenciaNaoAtende: Number(penalNao)
    });
    alert("Parâmetros de pontuação e reincidência atualizados com sucesso!");
  };

  // --- TROPHY ACTIONS ---
  const handleSaveTrophy = () => {
    onUpdateConfig({
      ...config,
      trofeuQtdVencedores: Number(trophyWinners),
      trofeuNomePremio: trophyName.trim(),
      trofeuPeriodicidade: trophyPeriod,
      trofeuTextoCertificado: trophyText.trim(),
      trofeuImagemUrl: trophyImg.trim()
    });
    alert("Configurações da premiação do troféu atualizadas!");
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
      {/* Sub tabs header */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 overflow-x-auto whitespace-nowrap bg-slate-50 dark:bg-slate-950 p-1.5 gap-1.5">
        {[
          { id: 'setores', label: 'Setores', icon: Briefcase },
          { id: 'requisitos', label: 'Requisitos Auditáveis', icon: Sliders },
          { id: 'classificacoes', label: 'Classificações', icon: Award },
          { id: 'reincidencia', label: 'Pontuação & Reincidência', icon: AlertTriangle },
          { id: 'trofeu', label: 'Configuração do Troféu', icon: Trophy },
          { id: 'ciclos', label: 'Ciclos de Auditoria', icon: Calendar },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setSubTab(tab.id as any)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                subTab === tab.id 
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-850 hover:text-slate-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      <div className="p-6">
        {/* --- 1. SETORES VIEW --- */}
        {subTab === 'setores' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-100">Setores do Programa 5S</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">Cadastre e configure os setores da fábrica elegíveis para o ranking 5S.</p>
              </div>
              {canModify && (
                <button
                  onClick={() => handleOpenSectorModal()}
                  className="bg-amber-500 hover:bg-amber-600 text-slate-950 px-3 py-1.5 rounded-lg text-[11px] font-bold flex items-center space-x-1"
                >
                  <Plus className="w-3.5 h-3.5 text-slate-900" />
                  <span>Novo Setor</span>
                </button>
              )}
            </div>

            <div className="overflow-x-auto rounded-lg border border-slate-100 dark:border-slate-800">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 font-bold border-b border-slate-100 dark:border-slate-800">
                  <tr>
                    <th className="p-3">Ordem Ranking</th>
                    <th className="p-3">Nome do Setor</th>
                    <th className="p-3">Status</th>
                    {canModify && <th className="p-3 text-right">Ações</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                  {setores.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50/40 dark:hover:bg-slate-800/10">
                      <td className="p-3 font-mono text-slate-500 font-bold">{s.ordemRanking}º</td>
                      <td className="p-3 font-bold text-slate-800 dark:text-slate-200">{s.nome}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-sm text-[10px] font-bold ${
                          s.ativo 
                            ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600' 
                            : 'bg-rose-50 dark:bg-rose-950/30 text-rose-600'
                        }`}>
                          {s.ativo ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                      {canModify && (
                        <td className="p-3 text-right space-x-1.5">
                          <button onClick={() => handleOpenSectorModal(s)} className="p-1 text-slate-400 hover:text-blue-500">
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => handleDeleteSector(s.id)} className="p-1 text-slate-400 hover:text-rose-500">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* --- 2. REQUISITOS VIEW --- */}
        {subTab === 'requisitos' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-100">Requisitos Auditáveis por Senso</h3>
                <p className="text-[11px] text-slate-400 mt-0.5 font-sans">Cadastre as perguntas de avaliação do programa. Não existem checklist fixos.</p>
              </div>
              {canModify && (
                <button
                  onClick={() => handleOpenReqModal()}
                  className="bg-amber-500 hover:bg-amber-600 text-slate-950 px-3 py-1.5 rounded-lg text-[11px] font-bold flex items-center space-x-1"
                >
                  <Plus className="w-3.5 h-3.5 text-slate-900" />
                  <span>Novo Requisito</span>
                </button>
              )}
            </div>

            <div className="overflow-x-auto rounded-lg border border-slate-100 dark:border-slate-800">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 font-bold border-b border-slate-100 dark:border-slate-800">
                  <tr>
                    <th className="p-3">Código</th>
                    <th className="p-3">Senso</th>
                    <th className="p-3">Requisito</th>
                    <th className="p-3">Setores Aplicáveis</th>
                    <th className="p-3">Status</th>
                    {canModify && <th className="p-3 text-right">Ações</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                  {requisitos.map((req) => {
                    const sensoMatched = sensos.find(s => s.id === req.sensoId);
                    return (
                      <tr key={req.id} className="hover:bg-slate-50/40 dark:hover:bg-slate-800/10">
                        <td className="p-3 font-mono font-bold text-slate-500">{req.codigo}</td>
                        <td className="p-3 font-bold text-slate-700 dark:text-slate-300">{sensoMatched?.nome || req.sensoId}</td>
                        <td className="p-3 max-w-[300px]">
                          <p className="font-bold text-slate-800 dark:text-slate-200">{req.nome}</p>
                          <p className="text-[10px] text-slate-400 truncate">{req.descricao}</p>
                        </td>
                        <td className="p-3">
                          <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-1.5 py-0.5 rounded font-mono">
                            {req.setoresAplicaveis.includes('TODOS') ? 'Todos os setores' : `${req.setoresAplicaveis.length} setores`}
                          </span>
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded-sm text-[10px] font-bold ${
                            req.ativo 
                              ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600' 
                              : 'bg-rose-50 dark:bg-rose-950/30 text-rose-600'
                          }`}>
                            {req.ativo ? 'Ativo' : 'Inativo'}
                          </span>
                        </td>
                        {canModify && (
                          <td className="p-3 text-right space-x-1.5">
                            <button onClick={() => handleOpenReqModal(req)} className="p-1 text-slate-400 hover:text-blue-500">
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => handleDeleteReq(req.id)} className="p-1 text-slate-400 hover:text-rose-500">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* --- 3. CLASSIFICAÇÕES VIEW --- */}
        {subTab === 'classificacoes' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-100">Faixas de Classificação 5S</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">Defina as classificações baseadas na nota de conformidade do setor.</p>
              </div>
              {canModify && (
                <button
                  onClick={() => handleOpenClassModal()}
                  className="bg-amber-500 hover:bg-amber-600 text-slate-950 px-3 py-1.5 rounded-lg text-[11px] font-bold flex items-center space-x-1"
                >
                  <Plus className="w-3.5 h-3.5 text-slate-900" />
                  <span>Nova Faixa</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {classificacoes.map((c) => (
                <div key={c.id} className="border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex flex-col justify-between hover:shadow-md transition-all relative">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-extrabold uppercase font-mono px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                        {c.min}% a {c.max}%
                      </span>
                      {canModify && (
                        <button onClick={() => handleOpenClassModal(c)} className="text-slate-400 hover:text-blue-500">
                          <Edit2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                    <h4 className="text-base font-black text-slate-900 dark:text-slate-100 mt-2">{c.nome}</h4>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400 font-bold">
                    <span>Ícone: {c.icone}</span>
                    <span className="capitalize">Cor: {c.cor}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- 4. REINCIDÊNCIA VIEW --- */}
        {subTab === 'reincidencia' && (
          <div className="space-y-6 max-w-2xl">
            <div>
              <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-100">Critérios de Avaliação e Penalidade por Reincidência</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Defina os pontos obtidos em cada avaliação e o desconto de penalidade caso o setor reincida no mesmo erro.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 dark:bg-slate-950 p-5 rounded-xl border border-slate-100 dark:border-slate-850">
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase">Atende Totalmente</label>
                <input
                  type="number"
                  step="any"
                  value={ptTotal}
                  onChange={(e) => setPtTotal(Number(e.target.value))}
                  disabled={!canModify}
                  className="w-full mt-1.5 bg-white dark:bg-slate-800 text-xs font-mono font-bold border border-slate-200 dark:border-slate-700 rounded-lg p-2"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase">Atende Parcialmente</label>
                <input
                  type="number"
                  step="any"
                  value={ptParcial}
                  onChange={(e) => setPtParcial(Number(e.target.value))}
                  disabled={!canModify}
                  className="w-full mt-1.5 bg-white dark:bg-slate-800 text-xs font-mono font-bold border border-slate-200 dark:border-slate-700 rounded-lg p-2"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase">Não Atende</label>
                <input
                  type="number"
                  step="any"
                  value={ptNao}
                  onChange={(e) => setPtNao(Number(e.target.value))}
                  disabled={!canModify}
                  className="w-full mt-1.5 bg-white dark:bg-slate-800 text-xs font-mono font-bold border border-slate-200 dark:border-slate-700 rounded-lg p-2"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-3">
                <h4 className="text-xs font-black text-slate-800 dark:text-slate-200">Penalidade Reincidência Parcial</h4>
                <p className="text-[10px] text-slate-400">Pontos deduzidos se o requisito continuar classificado como Atende Parcialmente consecutivamente.</p>
                <input
                  type="number"
                  step="any"
                  value={penalParcial}
                  onChange={(e) => setPenalParcial(Number(e.target.value))}
                  disabled={!canModify}
                  className="w-32 bg-slate-50 dark:bg-slate-800 text-xs font-mono font-bold border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-rose-500"
                />
              </div>

              <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-3">
                <h4 className="text-xs font-black text-slate-800 dark:text-slate-200">Penalidade Reincidência Não Atende</h4>
                <p className="text-[10px] text-slate-400">Pontos deduzidos se o requisito continuar classificado como Não Atende consecutivamente.</p>
                <input
                  type="number"
                  step="any"
                  value={penalNao}
                  onChange={(e) => setPenalNao(Number(e.target.value))}
                  disabled={!canModify}
                  className="w-32 bg-slate-50 dark:bg-slate-800 text-xs font-mono font-bold border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-rose-500"
                />
              </div>
            </div>

            {canModify && (
              <button
                onClick={handleSavePointsAndPenalties}
                className="bg-amber-500 hover:bg-amber-600 text-slate-950 px-4 py-2 rounded-lg text-xs font-bold flex items-center space-x-1.5"
              >
                <Save className="w-4 h-4" />
                <span>Salvar Configurações de Pontuação</span>
              </button>
            )}
          </div>
        )}

        {/* --- 5. CONFIGURAÇÃO DO TROFÉU VIEW --- */}
        {subTab === 'trofeu' && (
          <div className="space-y-6 max-w-2xl">
            <div>
              <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-100">Configuração da Premiação (Troféu 5S)</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Ajuste os critérios de concessão do troféu de excelência para os setores vencedores.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-[10px] font-black text-slate-500 uppercase">Nome do Prêmio / Troféu</label>
                <input
                  type="text"
                  value={trophyName}
                  onChange={(e) => setTrophyName(e.target.value)}
                  disabled={!canModify}
                  className="w-full bg-slate-50 dark:bg-slate-800 text-xs font-bold border border-slate-200 dark:border-slate-700 rounded-lg p-2"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-black text-slate-500 uppercase">Quantidade de Vencedores</label>
                <input
                  type="number"
                  value={trophyWinners}
                  onChange={(e) => setTrophyWinners(Number(e.target.value))}
                  disabled={!canModify}
                  className="w-full bg-slate-50 dark:bg-slate-800 text-xs font-bold border border-slate-200 dark:border-slate-700 rounded-lg p-2"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] font-black text-slate-500 uppercase">Periodicidade de Premiação</label>
              <select
                value={trophyPeriod}
                onChange={(e) => setTrophyPeriod(e.target.value)}
                disabled={!canModify}
                className="w-full bg-slate-50 dark:bg-slate-800 text-xs font-bold border border-slate-200 dark:border-slate-700 rounded-lg p-2"
              >
                <option value="Mensal">Mensal</option>
                <option value="Trimestral">Trimestral</option>
                <option value="Semestral">Semestral</option>
                <option value="Anual">Anual</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] font-black text-slate-500 uppercase">URL da Imagem do Troféu / Ícone</label>
              <input
                type="text"
                placeholder="Ex: https://..."
                value={trophyImg}
                onChange={(e) => setTrophyImg(e.target.value)}
                disabled={!canModify}
                className="w-full bg-slate-50 dark:bg-slate-800 text-xs border border-slate-200 dark:border-slate-700 rounded-lg p-2"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] font-black text-slate-500 uppercase">Texto Padrão do Certificado de Excelência</label>
              <textarea
                value={trophyText}
                onChange={(e) => setTrophyText(e.target.value)}
                disabled={!canModify}
                rows={4}
                className="w-full bg-slate-50 dark:bg-slate-800 text-xs leading-relaxed border border-slate-200 dark:border-slate-700 rounded-lg p-2.5"
              />
            </div>

            <div className="border border-slate-100 dark:border-slate-800 p-4 rounded-xl bg-slate-50/50 dark:bg-slate-950/20">
              <h4 className="text-xs font-black text-slate-700 dark:text-slate-300">Critérios de Desempate Ativos:</h4>
              <ul className="text-[11px] text-slate-500 list-disc list-inside mt-2 space-y-1">
                <li>Menor quantidade de requisitos avaliados como "Não Atende"</li>
                <li>Menor quantidade de reincidências</li>
                <li>Maior evolução em comparação com o ciclo anterior</li>
              </ul>
            </div>

            {canModify && (
              <button
                onClick={handleSaveTrophy}
                className="bg-amber-500 hover:bg-amber-600 text-slate-950 px-4 py-2 rounded-lg text-xs font-bold flex items-center space-x-1.5"
              >
                <Save className="w-4 h-4" />
                <span>Salvar Configurações do Troféu</span>
              </button>
            )}
          </div>
        )}

        {/* --- 6. CICLOS DE AUDITORIA VIEW --- */}
        {subTab === 'ciclos' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-100">Ciclos de Auditoria Ativos</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">Monitore os períodos de auditoria ativos no sistema.</p>
              </div>
              {canModify && (
                <button
                  onClick={() => handleOpenCycleModal()}
                  className="bg-amber-500 hover:bg-amber-600 text-slate-950 px-3 py-1.5 rounded-lg text-[11px] font-bold flex items-center space-x-1"
                >
                  <Plus className="w-3.5 h-3.5 text-slate-900" />
                  <span>Novo Ciclo</span>
                </button>
              )}
            </div>

            <div className="overflow-x-auto rounded-lg border border-slate-100 dark:border-slate-800">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 font-bold border-b border-slate-100 dark:border-slate-800">
                  <tr>
                    <th className="p-3">Nome do Ciclo</th>
                    <th className="p-3">Início</th>
                    <th className="p-3">Fim</th>
                    <th className="p-3">Status</th>
                    {canModify && <th className="p-3 text-right">Ações</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                  {ciclos.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50/40 dark:hover:bg-slate-800/10">
                      <td className="p-3 font-bold text-slate-800 dark:text-slate-200">{c.nome}</td>
                      <td className="p-3 font-mono text-slate-500">{c.dataInicio}</td>
                      <td className="p-3 font-mono text-slate-500">{c.dataFim}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-sm text-[10px] font-bold ${
                          c.ativo 
                            ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600' 
                            : 'bg-slate-100 dark:bg-slate-850 text-slate-500'
                        }`}>
                          {c.ativo ? 'Vigente' : 'Inativo'}
                        </span>
                      </td>
                      {canModify && (
                        <td className="p-3 text-right space-x-1.5">
                          <button onClick={() => handleOpenCycleModal(c)} title="Editar Ciclo" className="p-1 text-slate-400 hover:text-blue-500 transition-colors">
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => handleDeleteCycle(c.id)} title="Excluir Ciclo" className="p-1 text-slate-400 hover:text-red-500 transition-colors">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* --- MODAIS DE CADASTROS --- */}

      {/* 1. Modal Setor */}
      {isSectorModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-xs">
          <form onSubmit={handleSaveSector} className="bg-white dark:bg-slate-900 rounded-xl max-w-sm w-full border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden animate-fade-in">
            <div className="bg-[#0B3A63] text-white p-4 flex justify-between items-center">
              <h4 className="text-xs font-bold uppercase tracking-wider">{editingSector ? 'Editar Setor' : 'Cadastrar Setor'}</h4>
              <button type="button" onClick={() => setIsSectorModalOpen(false)}><X className="w-4 h-4" /></button>
            </div>
            <div className="p-5 space-y-4 text-xs text-left">
              <div className="space-y-1">
                <label className="block text-[10px] font-black text-slate-400 uppercase">Nome do Setor</label>
                <input
                  type="text"
                  required
                  value={sectorName}
                  onChange={(e) => setSectorName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-slate-100"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-black text-slate-400 uppercase">Ordem no Ranking</label>
                <input
                  type="number"
                  required
                  min={1}
                  value={sectorOrder}
                  onChange={(e) => setSectorOrder(Number(e.target.value))}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-slate-100 font-mono"
                />
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="checkbox"
                  id="sect_active"
                  checked={sectorActive}
                  onChange={(e) => setSectorActive(e.target.checked)}
                  className="w-4 h-4 rounded-sm border-slate-300 accent-amber-500"
                />
                <label htmlFor="sect_active" className="text-slate-700 dark:text-slate-300 font-semibold">Setor Ativo (Elegível para auditorias)</label>
              </div>
            </div>
            <div className="bg-slate-50 dark:bg-slate-950 p-4 flex justify-end space-x-2">
              <button type="button" onClick={() => setIsSectorModalOpen(false)} className="px-3 py-1.5 border border-slate-200 dark:border-slate-800 text-slate-500 rounded-lg hover:bg-slate-100">Cancelar</button>
              <button type="submit" className="bg-amber-500 text-slate-950 px-3 py-1.5 rounded-lg font-bold">Salvar</button>
            </div>
          </form>
        </div>
      )}

      {/* 2. Modal Requisito */}
      {isReqModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-xs">
          <form onSubmit={handleSaveReq} className="bg-white dark:bg-slate-900 rounded-xl max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden animate-fade-in">
            <div className="bg-[#0B3A63] text-white p-4 flex justify-between items-center">
              <h4 className="text-xs font-bold uppercase tracking-wider">{editingReq ? 'Editar Requisito' : 'Cadastrar Requisito'}</h4>
              <button type="button" onClick={() => setIsReqModalOpen(false)}><X className="w-4 h-4" /></button>
            </div>
            <div className="p-5 space-y-4 text-xs text-left max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-[10px] font-black text-slate-400 uppercase">Código</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: S1.6"
                    value={reqCode}
                    onChange={(e) => setReqCode(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 font-mono font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-black text-slate-400 uppercase">Senso Pertencente</label>
                  <select
                    value={reqSenso}
                    onChange={(e) => setReqSenso(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 font-bold"
                  >
                    {sensos.map(s => (
                      <option key={s.id} value={s.id}>{s.nome}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-black text-slate-400 uppercase">Título Curto</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Identificação de Lote"
                  value={reqName}
                  onChange={(e) => setReqName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-black text-slate-400 uppercase">Descrição Completa / Pergunta</label>
                <textarea
                  required
                  placeholder="Ex: Todos os lotes de costura possuem identificação visual visível..."
                  value={reqDesc}
                  onChange={(e) => setReqDesc(e.target.value)}
                  rows={3}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-[10px] font-black text-slate-400 uppercase">Ordem de Exibição</label>
                  <input
                    type="number"
                    required
                    value={reqOrder}
                    onChange={(e) => setReqOrder(Number(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-black text-slate-400 uppercase">Setores Aplicáveis</label>
                  <select
                    multiple
                    value={reqSectors}
                    onChange={(e) => {
                      const values = Array.from(e.target.selectedOptions, (option: any) => option.value);
                      if (values.includes('TODOS') && values.length > 1) {
                        setReqSectors(['TODOS']);
                      } else {
                        setReqSectors(values);
                      }
                    }}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-1.5 h-20"
                  >
                    <option value="TODOS">Todos os setores</option>
                    {setores.map(s => (
                      <option key={s.id} value={s.id}>{s.nome}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-black text-slate-400 uppercase">Observações Auxiliares</label>
                <input
                  type="text"
                  placeholder="Ex: Focar na inspeção das prateleiras de insumos..."
                  value={reqObs}
                  onChange={(e) => setReqObs(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2"
                />
              </div>

              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="req_act"
                  checked={reqActive}
                  onChange={(e) => setReqActive(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 accent-amber-500"
                />
                <label htmlFor="req_act" className="text-slate-700 dark:text-slate-300 font-semibold">Requisito Ativo para Auditorias</label>
              </div>
            </div>
            <div className="bg-slate-50 dark:bg-slate-950 p-4 flex justify-end space-x-2 border-t border-slate-150 dark:border-slate-850">
              <button type="button" onClick={() => setIsReqModalOpen(false)} className="px-3 py-1.5 border border-slate-200 dark:border-slate-800 text-slate-500 rounded-lg hover:bg-slate-100">Cancelar</button>
              <button type="submit" className="bg-amber-500 text-slate-950 px-3 py-1.5 rounded-lg font-bold">Salvar</button>
            </div>
          </form>
        </div>
      )}

      {/* 3. Modal Classificação */}
      {isClassModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-xs">
          <form onSubmit={handleSaveClass} className="bg-white dark:bg-slate-900 rounded-xl max-w-sm w-full border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden animate-fade-in">
            <div className="bg-[#0B3A63] text-white p-4 flex justify-between items-center">
              <h4 className="text-xs font-bold uppercase tracking-wider">{editingClass ? 'Editar Faixa' : 'Cadastrar Faixa'}</h4>
              <button type="button" onClick={() => setIsClassModalOpen(false)}><X className="w-4 h-4" /></button>
            </div>
            <div className="p-5 space-y-4 text-xs text-left">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-[10px] font-black text-slate-400 uppercase">Pontuação Mínima (%)</label>
                  <input
                    type="number"
                    step="any"
                    required
                    min={0}
                    max={100}
                    value={classMin}
                    onChange={(e) => setClassMin(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 font-mono font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-black text-slate-400 uppercase">Pontuação Máxima (%)</label>
                  <input
                    type="number"
                    step="any"
                    required
                    min={0}
                    max={100}
                    value={classMax}
                    onChange={(e) => setClassMax(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 font-mono font-bold"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-black text-slate-400 uppercase">Nome da Classificação</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Excelente"
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-[10px] font-black text-slate-400 uppercase">Cor (Classe Tailwind)</label>
                  <select
                    value={classCor}
                    onChange={(e) => setClassCor(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 font-bold"
                  >
                    <option value="emerald">Verde (Emerald)</option>
                    <option value="blue">Azul (Blue)</option>
                    <option value="indigo">Índigo (Indigo)</option>
                    <option value="amber">Amarelo (Amber)</option>
                    <option value="rose">Vermelho (Rose)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-black text-slate-400 uppercase">Ícone (Nome Lucide)</label>
                  <select
                    value={classIcon}
                    onChange={(e) => setClassIcon(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 font-bold"
                  >
                    <option value="Award">Award</option>
                    <option value="ThumbsUp">ThumbsUp</option>
                    <option value="CheckCircle">CheckCircle</option>
                    <option value="AlertTriangle">AlertTriangle</option>
                    <option value="ShieldAlert">ShieldAlert</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="bg-slate-50 dark:bg-slate-950 p-4 flex justify-end space-x-2">
              <button type="button" onClick={() => setIsClassModalOpen(false)} className="px-3 py-1.5 border border-slate-200 dark:border-slate-800 text-slate-500 rounded-lg hover:bg-slate-100">Cancelar</button>
              <button type="submit" className="bg-amber-500 text-slate-950 px-3 py-1.5 rounded-lg font-bold">Salvar</button>
            </div>
          </form>
        </div>
      )}

      {/* 4. Modal Ciclo */}
      {isCycleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-xs">
          <form onSubmit={handleSaveCycle} className="bg-white dark:bg-slate-900 rounded-xl max-w-sm w-full border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden animate-fade-in">
            <div className="bg-[#0B3A63] text-white p-4 flex justify-between items-center">
              <h4 className="text-xs font-bold uppercase tracking-wider">{editingCycle ? 'Editar Ciclo' : 'Cadastrar Ciclo'}</h4>
              <button type="button" onClick={() => setIsCycleModalOpen(false)}><X className="w-4 h-4" /></button>
            </div>
            <div className="p-5 space-y-4 text-xs text-left">
              <div className="space-y-1">
                <label className="block text-[10px] font-black text-slate-400 uppercase">Nome do Ciclo</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Ciclo 2026 - Q3"
                  value={cycleName}
                  onChange={(e) => setCycleName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-[10px] font-black text-slate-400 uppercase">Data Início</label>
                  <input
                    type="date"
                    required
                    value={cycleStart}
                    onChange={(e) => setCycleStart(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-black text-slate-400 uppercase">Data Fim</label>
                  <input
                    type="date"
                    required
                    value={cycleEnd}
                    onChange={(e) => setCycleEnd(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="checkbox"
                  id="cycle_act"
                  checked={cycleActive}
                  onChange={(e) => setCycleActive(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 accent-amber-500"
                />
                <label htmlFor="cycle_act" className="text-slate-700 dark:text-slate-300 font-semibold">Tornar este Ciclo Ativo</label>
              </div>
            </div>
            <div className="bg-slate-50 dark:bg-slate-950 p-4 flex justify-end space-x-2">
              <button type="button" onClick={() => setIsCycleModalOpen(false)} className="px-3 py-1.5 border border-slate-200 dark:border-slate-800 text-slate-500 rounded-lg hover:bg-slate-100">Cancelar</button>
              <button type="submit" className="bg-amber-500 text-slate-950 px-3 py-1.5 rounded-lg font-bold">Salvar</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
