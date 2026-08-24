import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Trash2, 
  Edit2, 
  Save, 
  X, 
  Info, 
  CheckCircle, 
  AlertTriangle, 
  FileText, 
  Calendar,
  Camera,
  Check,
  Eye,
  Download,
  ChevronRight,
  ChevronDown,
  User,
  Image as ImageIcon,
  Sparkles,
  Printer
} from 'lucide-react';
import { 
  Setor5S, 
  Requisito5S, 
  Classificacao5S, 
  Configuracao5S, 
  CicloAuditoria, 
  ItemAuditado, 
  Fotografia5S, 
  PlanoAcao5S,
  Auditoria5S,
  Senso5S
} from '../../types/fiveS';
import { calculateAuditScore, getClassificationForIndex, checkReincidencia } from '../../utils/fiveSStore';
import { useAuth } from '../../contexts/AuthContext';
import { googleDriveService, base64ToBlob } from '../../services/google/drive.service';
import { compressImage } from '../../utils/imageCompressor';
import { FiveSCameraModal } from './FiveSCameraModal';

interface FiveSAuditsProps {
  auditorias: Auditoria5S[];
  setores: Setor5S[];
  sensos: Senso5S[];
  requisitos: Requisito5S[];
  classificacoes: Classificacao5S[];
  config: Configuracao5S;
  ciclos: CicloAuditoria[];
  itens: ItemAuditado[];
  fotos: Fotografia5S[];
  planos: PlanoAcao5S[];
  onUpdateAudits: (data: Auditoria5S[]) => void;
  onUpdateItens: (data: ItemAuditado[]) => void;
  onUpdateFotos: (data: Fotografia5S[]) => void;
  onUpdatePlanos: (data: PlanoAcao5S[]) => void;
  onAddLog: (action: string, details: string) => void;
  canModify: boolean;
  currentUserEmail?: string;
  currentUserName?: string;
}

export const FiveSAudits: React.FC<FiveSAuditsProps> = ({
  auditorias,
  setores,
  sensos,
  requisitos,
  classificacoes,
  config,
  ciclos,
  itens,
  fotos,
  planos,
  onUpdateAudits,
  onUpdateItens,
  onUpdateFotos,
  onUpdatePlanos,
  onAddLog,
  canModify,
  currentUserEmail = 'qualidade@vickytex.com.br',
  currentUserName = 'Mariana Silva'
}) => {
  const [activeTab, setActiveTab] = useState<'nova' | 'andamento' | 'historico'>('historico');
  const { accessToken, googleOAuthToken } = useAuth();
  const [isUploadingToDrive, setIsUploadingToDrive] = useState(false);

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSector, setSelectedSector] = useState('TODOS');
  const [selectedCycle, setSelectedCycle] = useState('TODOS');

  // Detailed view / Report
  const [viewingAudit, setViewingAudit] = useState<Auditoria5S | null>(null);

  // Form State
  const [selectedSectorId, setSelectedSectorId] = useState('');
  const [selectedCycleId, setSelectedCycleId] = useState('');
  const [auditorName, setAuditorName] = useState(currentUserName);
  const [auditDate, setAuditDate] = useState(new Date().toISOString().split('T')[0]);
  const [generalObs, setGeneralObs] = useState('');
  
  // Requirement Evaluations state for the form
  const [evaluations, setEvaluations] = useState<Record<string, 'Atende Totalmente' | 'Atende Parcialmente' | 'Não Atende' | 'Não Aplicável'>>({});
  const [obsMap, setObsMap] = useState<Record<string, string>>({});
  const [tempPhotos, setTempPhotos] = useState<Record<string, { file: string; legend: string }[]>>({});
  const [cameraModal, setCameraModal] = useState<{ isOpen: boolean; reqId: string; reqName: string }>({
    isOpen: false,
    reqId: '',
    reqName: ''
  });

  // Editing Audit ID
  const [editingAuditId, setEditingAuditId] = useState<string | null>(null);

  // Lightbox
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  // Custom Modals & Feedback (for iframe-proof interactions)
  const [deletingAudit, setDeletingAudit] = useState<{ id: string; code: string } | null>(null);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showNotification = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ type, text });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Pre-fill active cycle
  useEffect(() => {
    const activeCycle = ciclos.find(c => c.ativo);
    if (activeCycle) {
      setSelectedCycleId(activeCycle.id);
    }
    if (setores.length > 0) {
      const activeSects = setores.filter(s => s.ativo);
      if (activeSects.length > 0) {
        setSelectedSectorId(activeSects[0].id);
      }
    }
  }, [ciclos, setores]);

  // Handle opening New Audit Form
  const handleStartNewAudit = (editAudit?: Auditoria5S) => {
    if (editAudit) {
      setEditingAuditId(editAudit.id);
      setSelectedSectorId(editAudit.setorId);
      setSelectedCycleId(editAudit.cicloId);
      setAuditorName(editAudit.auditor);
      setAuditDate(editAudit.dataAuditoria);
      setGeneralObs(editAudit.observacoes);

      // Extract existing evaluations
      const auditItens = itens.filter(it => it.auditoriaId === editAudit.id);
      const evals: typeof evaluations = {};
      const obss: typeof obsMap = {};
      auditItens.forEach(it => {
        evals[it.requisitoId] = it.avaliacao;
        obss[it.requisitoId] = it.observacoes;
      });
      setEvaluations(evals);
      setObsMap(obss);

      // Extract photos
      const auditPhotos = fotos.filter(f => f.auditoriaId === editAudit.id || f.auditoriaId === editAudit.codigo);
      const phtMap: typeof tempPhotos = {};
      auditPhotos.forEach(p => {
        const reqKey = p.requisitoId || (requisitos.find(r => r.codigo === p.requisitoId)?.id) || p.requisitoId;
        if (reqKey) {
          if (!phtMap[reqKey]) phtMap[reqKey] = [];
          phtMap[reqKey].push({ file: p.url, legend: p.legenda || 'Evidência fotográfica' });
        }
      });

      // Fallback para fotos gravadas no array da auditoria
      if (Object.keys(phtMap).length === 0 && editAudit.fotos && editAudit.fotos.length > 0) {
        const nonConfReq = auditItens.find(it => it.avaliacao !== 'Atende Totalmente' || it.observacoes?.trim());
        const targetReqId = nonConfReq ? nonConfReq.requisitoId : (requisitos.find(r => r.ativo)?.id || '');
        if (targetReqId) {
          phtMap[targetReqId] = editAudit.fotos.map((url, idx) => ({
            file: url,
            legend: `Evidência fotográfica ${idx + 1}`
          }));
        }
      }

      setTempPhotos(phtMap);
    } else {
      setEditingAuditId(null);
      setAuditorName(currentUserName);
      setAuditDate(new Date().toISOString().split('T')[0]);
      setGeneralObs('');
      
      // Default evaluations
      const defaultEvals: typeof evaluations = {};
      const activeReqs = requisitos.filter(r => r.ativo);
      activeReqs.forEach(r => {
        defaultEvals[r.id] = 'Atende Totalmente';
      });
      setEvaluations(defaultEvals);
      setObsMap({});
      setTempPhotos({});
    }
    setActiveTab('nova');
  };

  // Live Camera Snapshot / Modal Capture Handler
  const handleCapturePhotoFromModal = (base64Image: string, legend: string) => {
    if (!cameraModal.reqId) return;
    const reqId = cameraModal.reqId;
    setTempPhotos(prev => {
      const currentList = prev[reqId] || [];
      return {
        ...prev,
        [reqId]: [...currentList, { file: base64Image, legend }]
      };
    });
  };

  // Upload Photo handler (using client-side compression fallback)
  const handleUploadPhoto = async (reqId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      // Comprime a foto no navegador/celular reduzindo de ~8MB para ~60-100KB com alta nitidez
      const compressedBase64 = await compressImage(file, 1200, 1200, 0.75);
      
      setTempPhotos(prev => {
        const currentList = prev[reqId] || [];
        return {
          ...prev,
          [reqId]: [...currentList, { file: compressedBase64, legend: "Evidência fotográfica" }]
        };
      });
    } catch (err) {
      console.error("Erro ao comprimir e carregar imagem:", err);
      showNotification("Não foi possível carregar a imagem. Tente novamente.", "error");
    } finally {
      e.target.value = '';
    }
  };

  // Remove uploaded photo
  const handleRemovePhoto = (reqId: string, index: number) => {
    setTempPhotos(prev => {
      const currentList = [...(prev[reqId] || [])];
      currentList.splice(index, 1);
      return {
        ...prev,
        [reqId]: currentList
      };
    });
  };

  // Submit Audit Form
  const handleSaveAudit = async (status: 'Rascunho' | 'Finalizada') => {
    if (!selectedSectorId || !selectedCycleId) {
      alert("Por favor, selecione o Setor e o Ciclo!");
      return;
    }

    const sectorMatched = setores.find(s => s.id === selectedSectorId);
    if (!sectorMatched) return;

    const auditId = editingAuditId || `aud5s-${Date.now()}`;
    const auditCode = editingAuditId 
      ? (auditorias.find(a => a.id === editingAuditId)?.codigo || `AUD5S-${Date.now().toString().slice(-4)}`)
      : `AUD5S-${sectorMatched.nome.slice(0,3).toUpperCase()}-${(auditorias.length + 1).toString().padStart(3, '0')}`;

    // Perform calculated scores
    const scores = calculateAuditScore(
      auditId,
      evaluations,
      requisitos,
      selectedSectorId,
      auditDate,
      auditorias,
      itens,
      config
    );

    const classification = getClassificationForIndex(scores.indiceConformidade, classificacoes);

    // Google Drive Sync Flow (Opcional - caso haja token OAuth do Google Drive ativo)
    let uploadedTempPhotos: Record<string, { file: string; legend: string }[]> = {};
    const driveToken = (googleOAuthToken && googleDriveService.isGoogleAccessToken(googleOAuthToken)) 
      ? googleOAuthToken 
      : (googleDriveService.isGoogleAccessToken(accessToken) ? accessToken : null);

    if (driveToken) {
      setIsUploadingToDrive(true);
      try {
        const rootFolderId = localStorage.getItem('sgq_vickytex_gdrive_folder_id') || '1Vick_Official_QMS_Drive_Folder';
        // 1. Encontrar ou criar a pasta 'Auditorias_5S'
        const mainFolderId = await googleDriveService.findOrCreateFolder('Auditorias_5S', rootFolderId, driveToken);
        // 2. Encontrar ou criar a pasta desta auditoria específica
        const auditFolderId = await googleDriveService.findOrCreateFolder(auditCode, mainFolderId, driveToken);

        // 3. Fazer upload de cada nova foto
        for (const [reqId, rawPhotoList] of Object.entries(tempPhotos)) {
          const photoList = rawPhotoList as { file: string; legend: string }[];
          uploadedTempPhotos[reqId] = [];
          for (let pIdx = 0; pIdx < photoList.length; pIdx++) {
            const photo = photoList[pIdx];
            if (photo.file.startsWith('data:image/')) {
              const { blob, mimeType } = base64ToBlob(photo.file);
              const fileName = `foto_${reqId}_${pIdx + 1}.${mimeType.split('/')[1] || 'jpg'}`;
              const driveFileId = await googleDriveService.uploadFile(blob, fileName, mimeType, auditFolderId, driveToken);
              uploadedTempPhotos[reqId].push({
                file: `gdrive://${driveFileId}`,
                legend: photo.legend
              });
            } else {
              uploadedTempPhotos[reqId].push(photo);
            }
          }
        }
        showNotification("Fotos sincronizadas com sucesso no Google Drive!", "success");
      } catch (err: any) {
        console.warn("Google Drive upload não disponível ou expirado, persistindo fotos com compressão no Firestore:", err);
        uploadedTempPhotos = tempPhotos;
      } finally {
        setIsUploadingToDrive(false);
      }
    } else {
      // Salva direto no Firestore / LocalStorage com compressão de alta performance
      uploadedTempPhotos = tempPhotos;
    }

    // Coleta todas as fotos anexadas nesta auditoria
    const allAuditPhotoUrls: string[] = [];
    Object.values(uploadedTempPhotos).forEach((rawList) => {
      const pList = rawList as { file: string; legend: string }[];
      pList.forEach(p => {
        if (p && p.file) allAuditPhotoUrls.push(p.file);
      });
    });

    const newAudit: Auditoria5S = {
      id: auditId,
      codigo: auditCode,
      setor: sectorMatched.nome as any,
      setorId: selectedSectorId,
      cicloId: selectedCycleId,
      auditor: auditorName,
      dataAuditoria: auditDate,
      seiri: scores.seiri,
      seiton: scores.seiton,
      seiso: scores.seiso,
      seiketsu: scores.seiketsu,
      shitsuke: scores.shitsuke,
      mediaGeral: scores.indiceConformidade,
      observacoes: generalObs.trim(),
      status: status,
      pontuacaoMaxima: scores.pontuacaoMaxima,
      pontuacaoObtida: scores.pontuacaoObtida,
      totalPenalidades: scores.totalPenalidades,
      indiceConformidade: scores.indiceConformidade,
      classificacaoId: classification.id,
      fotos: allAuditPhotoUrls
    };

    // Save evaluated items
    let updatedItens = [...itens].filter(it => it.auditoriaId !== auditId);
    let updatedFotos = [...fotos].filter(f => f.auditoriaId !== auditId);
    let updatedPlanos = [...planos].filter(p => p.auditoriaId !== auditId);

    scores.calculatedItems.forEach(calcItem => {
      const itemId = `item-${auditId}-${calcItem.requisitoId}`;
      const itemToSave: ItemAuditado = {
        id: itemId,
        auditoriaId: auditId,
        requisitoId: calcItem.requisitoId!,
        avaliacao: calcItem.avaliacao!,
        pontos: calcItem.pontos!,
        observacoes: obsMap[calcItem.requisitoId!] || '',
        reincidenciaCount: calcItem.reincidenciaCount || 0,
        penalidadeAplicada: calcItem.penalidadeAplicada || 0,
        planoAcaoId: undefined
      };

      // Handle photos for this requirement
      const reqPhotos = uploadedTempPhotos[calcItem.requisitoId!] || [];
      reqPhotos.forEach((pht, pIdx) => {
        const photoId = `foto-${auditId}-${calcItem.requisitoId}-${pIdx}`;
        updatedFotos.push({
          id: photoId,
          itemAuditadoId: itemId,
          requisitoId: calcItem.requisitoId!,
          auditoriaId: auditId,
          url: pht.file,
          legenda: pht.legend,
          data: auditDate,
          usuario: auditorName
        });
      });

      // Handle automatic action plan creation for Finalized audits
      if (status === 'Finalizada' && (itemToSave.avaliacao === 'Não Atende' || itemToSave.avaliacao === 'Atende Parcialmente')) {
        const planoId = `plano5s-${auditId}-${calcItem.requisitoId}`;
        itemToSave.planoAcaoId = planoId;

        // Find if plan already exists or create new
        updatedPlanos.push({
          id: planoId,
          auditoriaId: auditId,
          requisitoId: calcItem.requisitoId!,
          descricao: `Desvio identificado no requisito ${requisitos.find(r => r.id === calcItem.requisitoId)?.codigo}: ${requisitos.find(r => r.id === calcItem.requisitoId)?.descricao}. Observação: ${itemToSave.observacoes || 'Sem observações'}`,
          responsavel: '',
          prazo: new Date(new Date(auditDate).getTime() + 15 * 24 * 3600 * 1000).toISOString().split('T')[0], // 15 days later
          status: 'Pendente',
          fotosCorrecao: [],
          comentarios: ["Plano de ação corretivo gerado automaticamente pelo sistema de auditoria 5S."],
          historico: [
            { data: auditDate, usuario: auditorName, acao: "Criação", detalhes: "Criado automaticamente por desvio em auditoria" }
          ]
        });
      }

      updatedItens.push(itemToSave);
    });

    // Update parent audits state
    let updatedAudits = [...auditorias];
    if (editingAuditId) {
      updatedAudits = updatedAudits.map(a => a.id === editingAuditId ? newAudit : a);
    } else {
      updatedAudits = [newAudit, ...updatedAudits.filter(a => a.id !== newAudit.id && a.codigo !== newAudit.codigo)];
    }

    onUpdateAudits(updatedAudits);
    onUpdateItens(updatedItens);
    onUpdateFotos(updatedFotos);
    onUpdatePlanos(updatedPlanos);

    onAddLog('Auditorias 5S', `${editingAuditId ? 'Editou' : 'Lançou'} auditoria ${auditCode} no setor ${sectorMatched.nome} (${status}) com índice ${scores.indiceConformidade}%`);

    showNotification(status === 'Rascunho' ? "Rascunho de auditoria salvo com sucesso!" : "Auditoria finalizada e homologada com sucesso! Planos de ação gerados para não-conformidades.");
    setActiveTab('historico');
  };

  // Delete Audit
  const handleDeleteAudit = (id: string, code: string) => {
    if (!canModify) return;
    setDeletingAudit({ id, code });
  };

  const confirmDeleteAudit = () => {
    if (!deletingAudit || !canModify) return;
    const { id, code } = deletingAudit;
    
    onUpdateAudits(auditorias.filter(a => a.id !== id));
    onUpdateItens(itens.filter(it => it.auditoriaId !== id));
    onUpdateFotos(fotos.filter(f => f.auditoriaId !== id));
    onUpdatePlanos(planos.filter(p => p.auditoriaId !== id));
    onAddLog('Auditorias 5S', `Excluiu auditoria 5S ${code}`);
    
    setDeletingAudit(null);
    showNotification(`Auditoria ${code} excluída com sucesso!`);
  };

  // Render score colors
  const getScoreColorClass = (score: number) => {
    if (score >= 90) return 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200';
    if (score >= 80) return 'text-blue-500 bg-blue-50 dark:bg-blue-950/40 border-blue-200';
    if (score >= 70) return 'text-indigo-500 bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200';
    if (score >= 60) return 'text-amber-500 bg-amber-50 dark:bg-amber-950/40 border-amber-200';
    return 'text-rose-500 bg-rose-50 dark:bg-rose-950/40 border-rose-200';
  };

  // Filtered lists
  const normalizedAudits = auditorias.map(a => {
    // 1. Resolve sector ID dynamically if missing
    let setorId = a.setorId;
    if (!setorId && a.setor) {
      const sectorMatched = setores.find(s => s.nome.toLowerCase() === a.setor.toLowerCase());
      if (sectorMatched) setorId = sectorMatched.id;
    }
    
    // 2. Resolve cycle ID dynamically if missing
    const cicloId = a.cicloId || 'ciclo-1';

    return {
      ...a,
      setorId,
      cicloId,
      seiri: a.seiri <= 5 ? Math.round(a.seiri * 20) : a.seiri,
      seiton: a.seiton <= 5 ? Math.round(a.seiton * 20) : a.seiton,
      seiso: a.seiso <= 5 ? Math.round(a.seiso * 20) : a.seiso,
      seiketsu: a.seiketsu <= 5 ? Math.round(a.seiketsu * 20) : a.seiketsu,
      shitsuke: a.shitsuke <= 5 ? Math.round(a.shitsuke * 20) : a.shitsuke,
      mediaGeral: a.mediaGeral <= 5 ? Math.round(a.mediaGeral * 20) : a.mediaGeral,
      indiceConformidade: a.indiceConformidade !== undefined 
        ? (a.indiceConformidade <= 5 ? Math.round(a.indiceConformidade * 20) : a.indiceConformidade)
        : (a.mediaGeral <= 5 ? Math.round(a.mediaGeral * 20) : a.mediaGeral)
    };
  });

  const filteredAudits = normalizedAudits.filter(a => {
    const matchSearch = a.codigo.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        a.auditor.toLowerCase().includes(searchTerm.toLowerCase());
    const matchSector = selectedSector === 'TODOS' || a.setorId === selectedSector;
    const matchCycle = selectedCycle === 'TODOS' || a.cicloId === selectedCycle;
    const matchStatus = activeTab === 'andamento' ? a.status === 'Rascunho' : a.status === 'Finalizada';

    return matchSearch && matchSector && matchCycle && matchStatus;
  });

  return (
    <div className="space-y-6">
      
      {/* Visual Navigation Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 p-1.5 gap-2 bg-slate-50 dark:bg-slate-950 rounded-xl">
        <button
          onClick={() => { setActiveTab('historico'); setViewingAudit(null); }}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
            activeTab === 'historico' && !viewingAudit
              ? 'bg-[#0B3A63] text-white shadow-xs'
              : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-850'
          }`}
        >
          Histórico de Auditorias
        </button>
        <button
          onClick={() => { setActiveTab('andamento'); setViewingAudit(null); }}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
            activeTab === 'andamento'
              ? 'bg-[#0B3A63] text-white shadow-xs'
              : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-850'
          }`}
        >
          Auditorias em Andamento (Rascunhos)
        </button>
        {canModify && (
          <button
            onClick={() => { handleStartNewAudit(); }}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center space-x-1 ${
              activeTab === 'nova'
                ? 'bg-amber-500 text-slate-950 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-850'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Nova Auditoria</span>
          </button>
        )}
      </div>

      {/* --- REPORT VIEW MODAL --- */}
      {viewingAudit && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-850 pb-4">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400">Relatório da Auditoria 5S</span>
              <h2 className="text-lg font-black text-slate-800 dark:text-slate-100">{viewingAudit.codigo} — {viewingAudit.setor}</h2>
            </div>
            <div className="flex space-x-2">
              <button 
                onClick={() => { window.focus(); window.print(); }}
                className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-200 transition-colors flex items-center space-x-1.5 text-xs font-bold"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimir</span>
              </button>
              <button 
                onClick={() => setViewingAudit(null)}
                className="p-2 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-500 hover:bg-slate-50 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-100 dark:border-slate-850">
            <div>
              <span className="text-[9px] uppercase font-bold text-slate-400">Auditor Responsável</span>
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300 mt-0.5">{viewingAudit.auditor}</p>
            </div>
            <div>
              <span className="text-[9px] uppercase font-bold text-slate-400">Data Realizada</span>
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300 mt-0.5 font-mono">{viewingAudit.dataAuditoria}</p>
            </div>
            <div>
              <span className="text-[9px] uppercase font-bold text-slate-400">Ciclo Associado</span>
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300 mt-0.5">{ciclos.find(c => c.id === viewingAudit.cicloId)?.nome || viewingAudit.cicloId}</p>
            </div>
            <div>
              <span className="text-[9px] uppercase font-bold text-slate-400">Índice de Conformidade</span>
              <div className="flex items-center space-x-2 mt-0.5">
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-black border font-mono ${getScoreColorClass(viewingAudit.indiceConformidade)}`}>
                  {viewingAudit.indiceConformidade}%
                </span>
                <span className="text-[10px] font-bold text-slate-500">
                  {getClassificationForIndex(viewingAudit.indiceConformidade, classificacoes).nome}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-3.5 pt-2">
            {[
              { name: 'S1', label: 'Utilização', score: viewingAudit.seiri, col: 'text-blue-500 bg-blue-50 dark:bg-blue-950/40' },
              { name: 'S2', label: 'Organização', score: viewingAudit.seiton, col: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-950/40' },
              { name: 'S3', label: 'Limpeza', score: viewingAudit.seiso, col: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40' },
              { name: 'S4', label: 'Padronização', score: viewingAudit.seiketsu, col: 'text-pink-500 bg-pink-50 dark:bg-pink-950/40' },
              { name: 'S5', label: 'Disciplina', score: viewingAudit.shitsuke, col: 'text-amber-500 bg-amber-50 dark:bg-amber-950/40' },
            ].map(s => (
              <div key={s.name} className="border border-slate-100 dark:border-slate-800 p-3 rounded-lg flex items-center justify-between">
                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase font-mono">{s.name} - {s.label}</span>
                  <span className="block text-sm font-black text-slate-800 dark:text-slate-200 mt-0.5 font-mono">{s.score}%</span>
                </div>
                <div className={`w-2.5 h-8 rounded-sm ${s.col.split(' ')[0]}`} />
              </div>
            ))}
          </div>

          {/* Galeria de Fotos Geral da Auditoria */}
          {(() => {
            const allAuditPhotos = [
              ...fotos.filter(f => f.auditoriaId === viewingAudit.id),
              ...(viewingAudit.fotos || []).filter(url => !fotos.some(f => f.auditoriaId === viewingAudit.id && f.url === url)).map((url, idx) => ({
                id: `audit-photo-${idx}`,
                auditoriaId: viewingAudit.id,
                requisitoId: '',
                url,
                legenda: `Evidência Fotográfica ${idx + 1}`
              }))
            ];

            if (allAuditPhotos.length === 0) return null;

            return (
              <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                    <Camera className="w-4 h-4 text-amber-500" />
                    <span>Galeria Geral de Evidências Fotográficas ({allAuditPhotos.length})</span>
                  </h3>
                  <span className="text-[10px] text-slate-400 font-bold">Clique para ampliar</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                  {allAuditPhotos.map((photo, pIdx) => (
                    <div 
                      key={photo.id || pIdx} 
                      className="relative group cursor-pointer border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden bg-white dark:bg-slate-900 shadow-xs hover:border-amber-500 transition-all" 
                      onClick={() => setLightboxImage(photo.url)}
                    >
                      <DriveImage url={photo.url} accessToken={accessToken} googleOAuthToken={googleOAuthToken} className="w-full h-24 object-cover group-hover:scale-105 transition-all" alt={photo.legenda || "Evidência"} />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                        <Eye className="w-5 h-5 text-white" />
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 bg-slate-950/80 text-[9px] text-white p-1 truncate text-center font-medium">
                        {photo.legenda || `Foto ${pIdx + 1}`}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}

          <div className="space-y-3">
            <h3 className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">Anotações do Item Auditado:</h3>
            <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-100 dark:border-slate-800 rounded-xl overflow-hidden text-xs">
              {requisitos.filter(r => r.ativo && (r.setoresAplicaveis.includes("TODOS") || r.setoresAplicaveis.includes(viewingAudit.setorId))).map(req => {
                const item = itens.find(it => (it.auditoriaId === viewingAudit.id || it.auditoriaId === viewingAudit.codigo) && (it.requisitoId === req.id || it.requisitoId === req.codigo));
                
                // Busca fotos vinculadas diretamente a este requisito na tabela de fotos
                let reqPhotos = fotos.filter(f => 
                  (f.auditoriaId === viewingAudit.id || f.auditoriaId === viewingAudit.codigo) && 
                  (f.requisitoId === req.id || f.requisitoId === req.codigo || (item && f.itemAuditadoId === item.id))
                );

                // Se não houver registro na tabela de fotos mas viewingAudit.fotos tiver fotos gravadas
                if (reqPhotos.length === 0 && viewingAudit.fotos && viewingAudit.fotos.length > 0) {
                  const auditActiveReqs = requisitos.filter(r => r.ativo && (r.setoresAplicaveis.includes("TODOS") || r.setoresAplicaveis.includes(viewingAudit.setorId)));
                  const nonConformingOrObsReqs = auditActiveReqs.filter(r => {
                    const itm = itens.find(i => (i.auditoriaId === viewingAudit.id || i.auditoriaId === viewingAudit.codigo) && (i.requisitoId === r.id || i.requisitoId === r.codigo));
                    return itm && (itm.observacoes?.trim() || itm.avaliacao !== 'Atende Totalmente');
                  });

                  // Se este requisito é o único ou um dos que possui observação/desvio, associa a foto a ele
                  if (
                    (nonConformingOrObsReqs.length <= 1 && (item?.observacoes?.trim() || item?.avaliacao !== 'Atende Totalmente')) ||
                    (nonConformingOrObsReqs.some(r => r.id === req.id) && nonConformingOrObsReqs.length === viewingAudit.fotos.length)
                  ) {
                    reqPhotos = viewingAudit.fotos.map((url, pIdx) => ({
                      id: `audit-req-photo-${viewingAudit.id}-${req.id}-${pIdx}`,
                      itemAuditadoId: item?.id || '',
                      requisitoId: req.id,
                      auditoriaId: viewingAudit.id,
                      url,
                      legenda: 'Evidência fotográfica',
                      data: viewingAudit.dataAuditoria,
                      usuario: viewingAudit.auditor
                    }));
                  }
                }
                
                return (
                  <div key={req.id} className="p-4 bg-white dark:bg-slate-900 hover:bg-slate-50/20 transition-all space-y-3">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                      <div className="space-y-0.5">
                        <div className="flex items-center space-x-1.5">
                          <span className="font-mono font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">{req.codigo}</span>
                          <span className="font-bold text-slate-800 dark:text-slate-100">{req.nome}</span>
                        </div>
                        <p className="text-[11px] text-slate-400">{req.descricao}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        {item?.reincidenciaCount && item.reincidenciaCount > 0 ? (
                          <span className="bg-red-50 dark:bg-rose-950/30 border border-red-200 text-rose-500 text-[9px] px-2 py-0.5 rounded-full font-bold">
                            ⚠️ Reincidente ({item.reincidenciaCount}x)
                          </span>
                        ) : null}
                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold border ${
                          item?.avaliacao === 'Atende Totalmente' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                          item?.avaliacao === 'Atende Parcialmente' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                          item?.avaliacao === 'Não Atende' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                          'bg-slate-100 text-slate-500 border-slate-200'
                        }`}>
                          {item?.avaliacao || 'Sem Avaliação'}
                        </span>
                      </div>
                    </div>

                    {item?.observacoes && (
                      <div className="p-2.5 bg-slate-50 dark:bg-slate-950/40 rounded-lg text-[11px] text-slate-600 dark:text-slate-400 border-l-2 border-slate-300">
                        <span className="font-bold uppercase text-[9px] text-slate-400 block mb-0.5">Observações do Auditor:</span>
                        {item.observacoes}
                      </div>
                    )}

                    {reqPhotos.length > 0 && (
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5 pt-1">
                        {reqPhotos.map(photo => (
                          <div key={photo.id} className="relative group cursor-pointer border border-slate-100 dark:border-slate-800 rounded-lg overflow-hidden" onClick={() => setLightboxImage(photo.url)}>
                            <DriveImage url={photo.url} accessToken={accessToken} googleOAuthToken={googleOAuthToken} className="w-full h-24 object-cover group-hover:scale-105 transition-all" alt="Evidência" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                              <Eye className="w-5 h-5 text-white" />
                            </div>
                            <div className="absolute bottom-0 left-0 right-0 bg-slate-950/80 text-[9px] text-white p-1 truncate text-center">
                              {photo.legenda}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* --- NOVA AUDITORIA FORM --- */}
      {activeTab === 'nova' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-850 pb-4">
            <div>
              <h3 className="text-base font-extrabold text-slate-800 dark:text-slate-100">
                {editingAuditId ? 'Editar Auditoria 5S' : 'Lançar Auditoria 5S'}
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Preencha as avaliações por senso e insira evidências fotográficas.</p>
            </div>
            <button 
              onClick={() => setActiveTab('historico')} 
              className="p-1.5 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-100 dark:border-slate-850">
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase">Setor Auditado</label>
              <select
                value={selectedSectorId}
                onChange={(e) => setSelectedSectorId(e.target.value)}
                className="w-full mt-1.5 bg-white dark:bg-slate-800 text-xs font-bold border border-slate-200 dark:border-slate-700 rounded-lg p-2"
              >
                {setores.filter(s => s.ativo).map(s => (
                  <option key={s.id} value={s.id}>{s.nome}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase">Ciclo de Auditoria</label>
              <select
                value={selectedCycleId}
                onChange={(e) => setSelectedCycleId(e.target.value)}
                className="w-full mt-1.5 bg-white dark:bg-slate-800 text-xs font-bold border border-slate-200 dark:border-slate-700 rounded-lg p-2"
              >
                {ciclos.map(c => (
                  <option key={c.id} value={c.id}>{c.nome}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase">Auditor Responsável</label>
              <input
                type="text"
                value={auditorName}
                onChange={(e) => setAuditorName(e.target.value)}
                className="w-full mt-1.5 bg-white dark:bg-slate-800 text-xs border border-slate-200 dark:border-slate-700 rounded-lg p-2 font-bold"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase">Data da Auditoria</label>
              <input
                type="date"
                value={auditDate}
                onChange={(e) => setAuditDate(e.target.value)}
                className="w-full mt-1.5 bg-white dark:bg-slate-800 text-xs border border-slate-200 dark:border-slate-700 rounded-lg p-2 font-mono font-bold"
              />
            </div>
          </div>

          {/* Core evaluations checklist */}
          <div className="space-y-4">
            <h3 className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">Itens de Avaliação 5S:</h3>
            
            <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-100 dark:border-slate-800 rounded-xl overflow-hidden text-xs">
              {requisitos.filter(r => r.ativo && (r.setoresAplicaveis.includes("TODOS") || r.setoresAplicaveis.includes(selectedSectorId))).map((req) => {
                const evalVal = evaluations[req.id] || 'Atende Totalmente';
                
                // Automatic reincidência preview calculation
                const reinc = selectedSectorId 
                  ? checkReincidencia(selectedSectorId, req.id, auditDate, auditorias, itens)
                  : { count: 0 };

                return (
                  <div key={req.id} className="p-4 bg-white dark:bg-slate-900 space-y-4 hover:bg-slate-50/10 transition-colors">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                      <div className="space-y-0.5 max-w-xl">
                        <div className="flex items-center space-x-1.5">
                          <span className="font-mono font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">{req.codigo}</span>
                          <span className="font-bold text-slate-800 dark:text-slate-100">{req.nome}</span>
                          {reinc.count > 0 && (
                            <span className="bg-red-50 dark:bg-rose-950/30 border border-red-200 text-rose-500 text-[9px] px-2 py-0.5 rounded-full font-bold">
                              ⚠️ Reincidente ({reinc.count}º ciclo)
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 leading-relaxed">{req.descricao}</p>
                      </div>

                      {/* Evaluations radios */}
                      <div className="flex flex-wrap gap-2">
                        {['Atende Totalmente', 'Atende Parcialmente', 'Não Atende', 'Não Aplicável'].map((ev) => (
                          <button
                            key={ev}
                            type="button"
                            onClick={() => setEvaluations(prev => ({ ...prev, [req.id]: ev as any }))}
                            className={`px-3 py-1.5 rounded-lg border text-[10px] font-bold transition-all ${
                              evalVal === ev 
                                ? ev === 'Atende Totalmente' ? 'bg-emerald-500 text-white border-emerald-600' :
                                  ev === 'Atende Parcialmente' ? 'bg-amber-500 text-slate-950 border-amber-600' :
                                  ev === 'Não Atende' ? 'bg-rose-500 text-white border-rose-600' :
                                  'bg-slate-600 text-white border-slate-700'
                                : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            {ev}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Observations field */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                      <div className="space-y-1">
                        <label className="block text-[9px] font-bold text-slate-400 uppercase">Observações do Requisito</label>
                        <input
                          type="text"
                          placeholder="Digite anotações ou desvios identificados..."
                          value={obsMap[req.id] || ''}
                          onChange={(e) => setObsMap(prev => ({ ...prev, [req.id]: e.target.value }))}
                          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-xs"
                        />
                      </div>

                      {/* Evidence Photo upload & live camera */}
                      <div className="space-y-1">
                        <label className="block text-[9px] font-bold text-slate-400 uppercase">Evidências Fotográficas</label>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setCameraModal({
                              isOpen: true,
                              reqId: req.id,
                              reqName: `${req.codigo} - ${req.nome}`
                            })}
                            className="cursor-pointer bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 px-3 py-2 rounded-lg text-[10px] font-black flex items-center justify-center space-x-1.5 border border-amber-500/30 transition-all shrink-0 shadow-xs"
                          >
                            <Camera className="w-3.5 h-3.5" />
                            <span>Câmera ao Vivo / Foto</span>
                          </button>

                          <div className="flex flex-wrap gap-2 overflow-x-auto py-1">
                            {(tempPhotos[req.id] || []).map((pht, pIdx) => (
                              <div key={pIdx} className="relative group w-14 h-14 rounded-lg overflow-hidden border border-slate-300 dark:border-slate-700 bg-black shrink-0 shadow-xs">
                                <img 
                                  src={pht.file} 
                                  className="w-full h-full object-cover cursor-pointer group-hover:scale-105 transition-all" 
                                  alt="Temp"
                                  onClick={() => setLightboxImage(pht.file)}
                                />
                                <div className="absolute bottom-0 inset-x-0 bg-black/75 text-[8px] text-white font-medium px-1 py-0.5 truncate text-center pointer-events-none">
                                  {pht.legend || `Foto ${pIdx + 1}`}
                                </div>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleRemovePhoto(req.id, pIdx);
                                  }}
                                  className="absolute top-1 right-1 bg-rose-600 hover:bg-rose-700 text-white rounded-full p-1 shadow-md transition-all"
                                  title="Remover foto"
                                >
                                  <X className="w-2.5 h-2.5" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="space-y-1.5 pt-2">
            <label className="block text-[10px] font-black text-slate-500 uppercase">Observações Gerais da Auditoria</label>
            <textarea
              placeholder="Descreva as percepções gerais, comprometimento do setor, ou pontos de destaque..."
              value={generalObs}
              onChange={(e) => setGeneralObs(e.target.value)}
              rows={3}
              className="w-full bg-slate-50 dark:bg-slate-800 leading-relaxed border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-xs"
            />
          </div>

          {/* Action buttons */}
          <div className="flex justify-end space-x-3 border-t border-slate-100 dark:border-slate-850 pt-4">
            <button
              onClick={() => setActiveTab('historico')}
              disabled={isUploadingToDrive}
              className="px-4 py-2 border border-slate-200 dark:border-slate-800 text-slate-500 text-xs font-bold rounded-lg hover:bg-slate-50 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              onClick={() => handleSaveAudit('Rascunho')}
              disabled={isUploadingToDrive}
              className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-lg hover:bg-slate-200 disabled:opacity-50"
            >
              {isUploadingToDrive ? 'Sincronizando...' : 'Salvar como Rascunho'}
            </button>
            <button
              onClick={() => handleSaveAudit('Finalizada')}
              disabled={isUploadingToDrive}
              className="px-4 py-2 bg-amber-500 text-slate-950 text-xs font-bold rounded-lg hover:bg-amber-600 flex items-center space-x-1.5 disabled:opacity-50"
            >
              {isUploadingToDrive ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-slate-950" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <span>Enviando p/ Drive...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Finalizar e Homologar</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* --- AUDITS LIST --- */}
      {activeTab !== 'nova' && !viewingAudit && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-4">
          
          {/* SEARCH AND FILTERS */}
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar por código, auditor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 text-xs border border-slate-200 dark:border-slate-700 rounded-lg pl-9 pr-3 py-2"
              />
            </div>

            <div className="grid grid-cols-2 gap-2 shrink-0">
              <select
                value={selectedSector}
                onChange={(e) => setSelectedSector(e.target.value)}
                className="bg-slate-50 dark:bg-slate-800 text-[10px] border border-slate-200 dark:border-slate-700 rounded-lg p-2 font-bold"
              >
                <option value="TODOS">Todos Setores</option>
                {setores.map(s => (
                  <option key={s.id} value={s.id}>{s.nome}</option>
                ))}
              </select>

              <select
                value={selectedCycle}
                onChange={(e) => setSelectedCycle(e.target.value)}
                className="bg-slate-50 dark:bg-slate-800 text-[10px] border border-slate-200 dark:border-slate-700 rounded-lg p-2 font-bold"
              >
                <option value="TODOS">Todos Ciclos</option>
                {ciclos.map(c => (
                  <option key={c.id} value={c.id}>{c.nome}</option>
                ))}
              </select>
            </div>
          </div>

          {/* TABLE */}
          <div className="overflow-x-auto rounded-lg border border-slate-100 dark:border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 font-bold border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="p-3">Código</th>
                  <th className="p-3">Setor / Data</th>
                  <th className="p-3 text-center">Utilização (S1)</th>
                  <th className="p-3 text-center">Organização (S2)</th>
                  <th className="p-3 text-center">Limpeza (S3)</th>
                  <th className="p-3 text-center">Padronização (S4)</th>
                  <th className="p-3 text-center">Disciplina (S5)</th>
                  <th className="p-3 text-center">Índice Conformidade</th>
                  <th className="p-3 text-right no-print">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                {filteredAudits.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="p-8 text-center text-slate-400 italic">
                      Nenhuma auditoria encontrada com os parâmetros informados.
                    </td>
                  </tr>
                ) : (
                    filteredAudits.map((item) => {
                      const existingPhotos = fotos.filter(f => f.auditoriaId === item.id);
                      const fallbackUrls = (item.fotos || []).filter(url => !existingPhotos.some(f => f.url === url));
                      const photoCount = existingPhotos.length + fallbackUrls.length;

                      return (
                        <tr key={item.id} className="hover:bg-slate-50/40 dark:hover:bg-slate-800/10">
                          <td className="p-3 font-mono font-bold text-slate-500">
                            {item.codigo}
                          </td>
                          <td className="p-3 space-y-0.5">
                            <div className="flex items-center gap-2">
                              <p className="font-extrabold text-slate-800 dark:text-slate-200">
                                {setores.find(s => s.id === item.setorId)?.nome || item.setor}
                              </p>
                              {photoCount > 0 && (
                                <button
                                  type="button"
                                  onClick={() => setViewingAudit(item)}
                                  className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200/50 hover:bg-amber-100 transition-colors"
                                  title="Ver fotos da auditoria"
                                >
                                  <Camera className="w-2.5 h-2.5" />
                                  <span>{photoCount} {photoCount === 1 ? 'foto' : 'fotos'}</span>
                                </button>
                              )}
                            </div>
                            <p className="text-[10px] text-slate-400">
                              {item.dataAuditoria} — <span className="font-semibold">{item.auditor}</span>
                            </p>
                          </td>
                          <td className="p-3 text-center font-mono font-bold text-blue-500">{item.seiri}%</td>
                          <td className="p-3 text-center font-mono font-bold text-indigo-500">{item.seiton}%</td>
                          <td className="p-3 text-center font-mono font-bold text-emerald-500">{item.seiso}%</td>
                          <td className="p-3 text-center font-mono font-bold text-pink-500">{item.seiketsu}%</td>
                          <td className="p-3 text-center font-mono font-bold text-amber-500">{item.shitsuke}%</td>
                          <td className="p-3 text-center">
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-black border font-mono ${getScoreColorClass(item.indiceConformidade)}`}>
                              {item.indiceConformidade}%
                            </span>
                          </td>
                          <td className="p-3 text-right space-x-1.5 no-print">
                            <button 
                              onClick={() => setViewingAudit(item)}
                              className="p-1 text-slate-400 hover:text-[#0B3A63] dark:hover:text-sky-400 inline-flex items-center justify-center"
                              title="Ver Relatório Detalhado"
                            >
                              <FileText className="w-3.5 h-3.5" />
                            </button>
                            {canModify && (
                              <button 
                                onClick={() => handleStartNewAudit(item)}
                                className="p-1 text-slate-400 hover:text-blue-500 inline-flex items-center justify-center"
                                title={item.status === 'Rascunho' ? "Continuar Rascunho" : "Editar Auditoria"}
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                            {canModify && (
                              <button 
                                onClick={() => handleDeleteAudit(item.id, item.codigo)}
                                className="p-1 text-slate-400 hover:text-rose-500 inline-flex items-center justify-center"
                                title="Remover"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
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

      {/* --- LIGHTBOX --- */}
      {lightboxImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs no-print" onClick={() => setLightboxImage(null)}>
          <div className="relative max-w-3xl w-full max-h-[85vh] overflow-hidden flex items-center justify-center">
            <DriveImage url={lightboxImage} accessToken={accessToken} googleOAuthToken={googleOAuthToken} className="max-w-full max-h-full object-contain rounded-xl" alt="Evidence Large" />
            <button className="absolute top-4 right-4 bg-black/60 hover:bg-black/80 text-white rounded-full p-2" onClick={() => setLightboxImage(null)}>
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* --- CUSTOM DELETE CONFIRMATION MODAL --- */}
      {deletingAudit && (
        <div className="fixed inset-0 z-55 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs no-print">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-rose-50 dark:bg-rose-950/30 flex items-center justify-center text-rose-500 mx-auto">
                <Trash2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-black text-slate-800 dark:text-slate-100">Excluir Auditoria 5S</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Tem certeza que deseja excluir a auditoria <span className="font-bold font-mono text-slate-700 dark:text-slate-200">{deletingAudit.code}</span>? Todos os itens, avaliações e fotos vinculados serão deletados permanentemente. Esta ação não poderá ser desfeita.
              </p>
            </div>
            <div className="flex space-x-3 pt-2">
              <button
                onClick={() => setDeletingAudit(null)}
                className="flex-1 py-2 px-4 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-bold text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-850 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDeleteAudit}
                className="flex-1 py-2 px-4 bg-rose-500 hover:bg-rose-600 text-white rounded-lg text-xs font-bold transition-colors"
              >
                Sim, Excluir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- FIVE S LIVE CAMERA MODAL --- */}
      <FiveSCameraModal
        isOpen={cameraModal.isOpen}
        onClose={() => setCameraModal({ isOpen: false, reqId: '', reqName: '' })}
        onCapture={handleCapturePhotoFromModal}
        title={`Câmera em Tempo Real — ${cameraModal.reqName}`}
        defaultLegend="Evidência fotográfica"
      />

      {/* --- CUSTOM FEEDBACK TOAST --- */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-55 bg-slate-900 dark:bg-slate-800 text-white border border-slate-800 dark:border-slate-700 rounded-xl p-4 shadow-2xl flex items-center space-x-3 animate-in slide-in-from-bottom-5 max-w-sm no-print">
          <div className={`p-1.5 rounded-lg shrink-0 ${toastMessage.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}`}>
            <Check className="w-4 h-4" />
          </div>
          <p className="text-xs font-bold leading-tight">{toastMessage.text}</p>
        </div>
      )}
    </div>
  );
};

// Componente para exibir imagem com suporte a URLs gdrive:// e Base64
const DriveImage: React.FC<{ 
  url: string; 
  accessToken?: string | null; 
  googleOAuthToken?: string | null;
  className?: string; 
  alt?: string; 
  onClick?: () => void;
}> = ({ url, accessToken, googleOAuthToken, className, alt, onClick }) => {
  const [src, setSrc] = useState<string>(url || '');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);

  useEffect(() => {
    if (!url) {
      setSrc('');
      return;
    }
    if (url.startsWith('gdrive://')) {
      const fileId = url.replace('gdrive://', '');
      const validToken = (googleOAuthToken && googleDriveService.isGoogleAccessToken(googleOAuthToken))
        ? googleOAuthToken
        : (googleDriveService.isGoogleAccessToken(accessToken) ? accessToken : null);

      if (!validToken) {
        setError(true);
        return;
      }
      setLoading(true);
      setError(false);
      googleDriveService.getFileBlobUrl(fileId, validToken)
        .then(blobUrl => {
          setSrc(blobUrl);
          setLoading(false);
        })
        .catch(err => {
          console.warn('[DriveImage] Error loading image from Google Drive:', err);
          setError(true);
          setLoading(false);
        });
    } else {
      setSrc(url);
      setLoading(false);
      setError(false);
    }
  }, [url, accessToken, googleOAuthToken]);

  if (loading) {
    return (
      <div className={`flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-800/50 animate-pulse text-slate-400 p-2 ${className}`}>
        <span className="text-[9px] font-bold">Carregando foto...</span>
      </div>
    );
  }

  if (error || !src) {
    return (
      <div className={`flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-800/60 text-slate-400 text-[9px] p-2 text-center border border-slate-200 dark:border-slate-750 ${className}`}>
        <span>Evidência</span>
      </div>
    );
  }

  return (
    <img 
      src={src} 
      alt={alt || "Evidência"} 
      className={className} 
      onClick={onClick} 
      onError={() => setError(true)}
      referrerPolicy="no-referrer"
    />
  );
};

