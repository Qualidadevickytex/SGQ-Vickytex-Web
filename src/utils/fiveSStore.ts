import { 
  Setor5S, 
  Senso5S, 
  Requisito5S, 
  Classificacao5S, 
  Configuracao5S, 
  CicloAuditoria, 
  ItemAuditado, 
  Fotografia5S, 
  PlanoAcao5S,
  Auditoria5S 
} from '../types/fiveS';

// --- SEED INITIAL DATA ---

export const INITIAL_SETORES: Setor5S[] = [
  { id: "setor-1", nome: "Administrativo", ativo: true, ordemRanking: 1 },
  { id: "setor-2", nome: "Estoque MP / Insumos", ativo: true, ordemRanking: 2 },
  { id: "setor-3", nome: "Corte", ativo: true, ordemRanking: 3 },
  { id: "setor-4", nome: "Separação", ativo: true, ordemRanking: 4 },
  { id: "setor-5", nome: "Costura", ativo: true, ordemRanking: 5 },
  { id: "setor-6", nome: "Embalagem", ativo: true, ordemRanking: 6 },
  { id: "setor-7", nome: "Expedição", ativo: true, ordemRanking: 7 },
  { id: "setor-8", nome: "E-Commerce", ativo: true, ordemRanking: 8 }
];

export const INITIAL_SENSOS: Senso5S[] = [
  { id: "S1", codigo: "S1", nome: "Utilização (Seiri)", descricao: "Descartar o desnecessário, manter somente o essencial.", cor: "blue", icone: "Folder" },
  { id: "S2", codigo: "S2", nome: "Organização (Seiton)", descricao: "Um lugar para cada coisa e cada coisa no seu lugar.", cor: "indigo", icone: "LayoutGrid" },
  { id: "S3", codigo: "S3", nome: "Limpeza (Seiso)", descricao: "Eliminar a sujeira, zelar e manter o ambiente limpo.", cor: "emerald", icone: "Sparkles" },
  { id: "S4", codigo: "S4", nome: "Padronização (Seiketsu)", descricao: "Higiene, saúde e preservação dos padrões visuais.", cor: "pink", icone: "Sliders" },
  { id: "S5", codigo: "S5", nome: "Disciplina (Shitsuke)", descricao: "Manter as regras e o autocontrole como hábito.", cor: "amber", icone: "CheckCircle" }
];

export const INITIAL_REQUISITOS: Requisito5S[] = [
  // S1 - Utilização
  { id: "req-s1-1", codigo: "S1.1", nome: "Materiais necessários", descricao: "Existem apenas materiais necessários na área.", sensoId: "S1", ativo: true, ordem: 1, setoresAplicaveis: ["TODOS"] },
  { id: "req-s1-2", codigo: "S1.2", nome: "Materiais obsoletos", descricao: "Não existem materiais obsoletos.", sensoId: "S1", ativo: true, ordem: 2, setoresAplicaveis: ["TODOS"] },
  { id: "req-s1-3", codigo: "S1.3", nome: "Segregação de sobras", descricao: "Sobras segregadas corretamente.", sensoId: "S1", ativo: true, ordem: 3, setoresAplicaveis: ["TODOS"] },
  { id: "req-s1-4", codigo: "S1.4", nome: "Equipamentos sem uso", descricao: "Equipamentos sem uso removidos.", sensoId: "S1", ativo: true, ordem: 4, setoresAplicaveis: ["TODOS"] },
  { id: "req-s1-5", codigo: "S1.5", nome: "Acúmulo desnecessário", descricao: "Não existe acúmulo desnecessário.", sensoId: "S1", ativo: true, ordem: 5, setoresAplicaveis: ["TODOS"] },

  // S2 - Organização
  { id: "req-s2-1", codigo: "S2.1", nome: "Local definido", descricao: "Materiais possuem local definido.", sensoId: "S2", ativo: true, ordem: 1, setoresAplicaveis: ["TODOS"] },
  { id: "req-s2-2", codigo: "S2.2", nome: "Identificação", descricao: "Materiais identificados.", sensoId: "S2", ativo: true, ordem: 2, setoresAplicaveis: ["TODOS"] },
  { id: "req-s2-3", codigo: "S2.3", nome: "Corredores livres", descricao: "Corredores livres.", sensoId: "S2", ativo: true, ordem: 3, setoresAplicaveis: ["TODOS"] },
  { id: "req-s2-4", codigo: "S2.4", nome: "Ferramentas no local", descricao: "Ferramentas no local correto.", sensoId: "S2", ativo: true, ordem: 4, setoresAplicaveis: ["TODOS"] },
  { id: "req-s2-5", codigo: "S2.5", nome: "Organização padrão", descricao: "Organização conforme padrão.", sensoId: "S2", ativo: true, ordem: 5, setoresAplicaveis: ["TODOS"] },

  // S3 - Limpeza
  { id: "req-s3-1", codigo: "S3.1", nome: "Piso limpo", descricao: "Piso limpo.", sensoId: "S3", ativo: true, ordem: 1, setoresAplicaveis: ["TODOS"] },
  { id: "req-s3-2", codigo: "S3.2", nome: "Bancadas limpas", descricao: "Bancadas limpas.", sensoId: "S3", ativo: true, ordem: 2, setoresAplicaveis: ["TODOS"] },
  { id: "req-s3-3", codigo: "S3.3", nome: "Equipamentos limpos", descricao: "Equipamentos limpos.", sensoId: "S3", ativo: true, ordem: 3, setoresAplicaveis: ["TODOS"] },
  { id: "req-s3-4", codigo: "S3.4", nome: "Lixeiras corretas", descricao: "Lixeiras corretas.", sensoId: "S3", ativo: true, ordem: 4, setoresAplicaveis: ["TODOS"] },
  { id: "req-s3-5", codigo: "S3.5", nome: "Área sem resíduos", descricao: "Área sem resíduos.", sensoId: "S3", ativo: true, ordem: 5, setoresAplicaveis: ["TODOS"] },

  // S4 - Padronização
  { id: "req-s4-1", codigo: "S4.1", nome: "Identificações atualizadas", descricao: "Identificações atualizadas.", sensoId: "S4", ativo: true, ordem: 1, setoresAplicaveis: ["TODOS"] },
  { id: "req-s4-2", codigo: "S4.2", nome: "Demarcações preservadas", descricao: "Demarcações preservadas.", sensoId: "S4", ativo: true, ordem: 2, setoresAplicaveis: ["TODOS"] },
  { id: "req-s4-3", codigo: "S4.3", nome: "Layout respeitado", descricao: "Layout respeitado.", sensoId: "S4", ativo: true, ordem: 3, setoresAplicaveis: ["TODOS"] },
  { id: "req-s4-4", codigo: "S4.4", nome: "POP disponível", descricao: "POP disponível.", sensoId: "S4", ativo: true, ordem: 4, setoresAplicaveis: ["TODOS"] },
  { id: "req-s4-5", codigo: "S4.5", nome: "Padrão visual seguido", descricao: "Padrão visual seguido.", sensoId: "S4", ativo: true, ordem: 5, setoresAplicaveis: ["TODOS"] },

  // S5 - Disciplina
  { id: "req-s5-1", codigo: "S5.1", nome: "Organização mantida", descricao: "Organização mantida.", sensoId: "S5", ativo: true, ordem: 1, setoresAplicaveis: ["TODOS"] },
  { id: "req-s5-2", codigo: "S5.2", nome: "Sem reincidências", descricao: "Não existem reincidências.", sensoId: "S5", ativo: true, ordem: 2, setoresAplicaveis: ["TODOS"] },
  { id: "req-s5-3", codigo: "S5.3", nome: "Procedimentos respeitados", descricao: "Procedimentos respeitados.", sensoId: "S5", ativo: true, ordem: 3, setoresAplicaveis: ["TODOS"] },
  { id: "req-s5-4", codigo: "S5.4", nome: "Plano de ação executado", descricao: "Plano de ação executado.", sensoId: "S5", ativo: true, ordem: 4, setoresAplicaveis: ["TODOS"] },
  { id: "req-s5-5", codigo: "S5.5", nome: "Comprometimento do setor", descricao: "Comprometimento do setor.", sensoId: "S5", ativo: true, ordem: 5, setoresAplicaveis: ["TODOS"] }
];

export const INITIAL_CLASSIFICACOES: Classificacao5S[] = [
  { id: "class-1", min: 90, max: 100, nome: "Excelência", cor: "emerald", icone: "Award" },
  { id: "class-2", min: 80, max: 89.9, nome: "Muito Bom", cor: "blue", icone: "ThumbsUp" },
  { id: "class-3", min: 70, max: 79.9, nome: "Aceitável", cor: "indigo", icone: "CheckCircle" },
  { id: "class-4", min: 60, max: 69.9, nome: "Atenção", cor: "amber", icone: "AlertTriangle" },
  { id: "class-5", min: 0, max: 59.9, nome: "Crítico", cor: "rose", icone: "ShieldAlert" }
];

export const INITIAL_CONFIG: Configuracao5S = {
  pontosAtendeTotalmente: 2,
  pontosAtendeParcialmente: 1,
  pontosNaoAtende: 0,
  penalidadeReincidenciaParcial: -1,
  penalidadeReincidenciaNaoAtende: -2,
  trofeuQtdVencedores: 1,
  trofeuCriterios: ["Maior Índice", "Menor quantidade de Não Atende", "Menor quantidade de reincidências", "Maior evolução"],
  trofeuCriteriosDesempate: ["Menor quantidade de Não Atende", "Maior evolução"],
  trofeuPeriodicidade: "Mensal",
  trofeuNomePremio: "Troféu Ouro 5S",
  trofeuImagemUrl: "https://images.unsplash.com/photo-1578269174936-2709b5a19376?w=400&auto=format&fit=crop&q=60",
  trofeuTextoCertificado: "Certificado concedido ao setor pela excelência na manutenção dos padrões do Programa 5S, promovendo a produtividade, segurança e organização."
};

export const INITIAL_CICLOS: CicloAuditoria[] = [
  { id: "ciclo-1", nome: "Ciclo 2026 - Q3", dataInicio: "2026-07-01", dataFim: "2026-09-30", ativo: true }
];

// --- STORAGE IMPLEMENTATION ---

export const getStoreData = <T>(key: string, fallback: T): T => {
  const saved = localStorage.getItem(key);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      return fallback;
    }
  }
  return fallback;
};

export const setStoreData = <T>(key: string, data: T): void => {
  localStorage.setItem(key, JSON.stringify(data));
};

// --- DATA ACCESSORS ---

export const getSetores = () => getStoreData<Setor5S[]>('sgq_5s_setores', INITIAL_SETORES);
export const getSensos = () => getStoreData<Senso5S[]>('sgq_5s_sensos', INITIAL_SENSOS);
export const getRequisitos = () => getStoreData<Requisito5S[]>('sgq_5s_requisitos', INITIAL_REQUISITOS);
export const getClassificacoes = () => getStoreData<Classificacao5S[]>('sgq_5s_classificacoes', INITIAL_CLASSIFICACOES);
export const getConfiguracao = () => getStoreData<Configuracao5S>('sgq_5s_configuracao', INITIAL_CONFIG);
export const getCiclos = () => getStoreData<CicloAuditoria[]>('sgq_5s_ciclos', INITIAL_CICLOS);
export const getItensAuditados = () => getStoreData<ItemAuditado[]>('sgq_5s_itens', []);
export const getFotografias = () => getStoreData<Fotografia5S[]>('sgq_5s_fotos', []);
export const getPlanosAcao5S = () => getStoreData<PlanoAcao5S[]>('sgq_5s_planos', []);

// --- CALCULATION HELPERS ---

export const getClassificationForIndex = (index: number, classifications: Classificacao5S[]): Classificacao5S => {
  const matched = classifications.find(c => index >= c.min && index <= c.max);
  if (matched) return matched;
  // Fallback
  return classifications.sort((a,b) => a.min - b.min)[0];
};

/**
 * Detect consecutive failures (reincidência) for a requirement in a sector
 */
export const checkReincidencia = (
  sectorId: string, 
  requirementId: string, 
  currentAuditDate: string,
  audits: Auditoria5S[],
  items: ItemAuditado[]
): { count: number; previousRating?: string } => {
  // Find all audits of this sector that are Finalizada and are BEFORE currentAuditDate (excluding current audit if it is in list)
  const previousAudits = audits
    .filter(a => a.setorId === sectorId && a.status === 'Finalizada' && a.dataAuditoria < currentAuditDate)
    .sort((a, b) => b.dataAuditoria.localeCompare(a.dataAuditoria)); // Sort descending (newest first)

  if (previousAudits.length === 0) {
    return { count: 0 };
  }

  let count = 0;
  let previousRating: string | undefined;

  // Traverse audits in chronological descending order to count consecutive failures
  for (let i = 0; i < previousAudits.length; i++) {
    const audit = previousAudits[i];
    const item = items.find(it => it.auditoriaId === audit.id && it.requisitoId === requirementId);
    
    if (item && (item.avaliacao === 'Não Atende' || item.avaliacao === 'Atende Parcialmente')) {
      if (count === 0) {
        previousRating = item.avaliacao;
      }
      count++;
    } else {
      // Break the consecutive chain
      break;
    }
  }

  return { count, previousRating };
};

/**
 * Calculates the dynamic scores of an audit
 */
export const calculateAuditScore = (
  auditId: string,
  evaluations: Record<string, 'Atende Totalmente' | 'Atende Parcialmente' | 'Não Atende' | 'Não Aplicável'>,
  requisitos: Requisito5S[],
  sectorId: string,
  auditDate: string,
  allAudits: Auditoria5S[],
  allAuditItems: ItemAuditado[],
  config: Configuracao5S
) => {
  // Filter active requirements applicable to this sector
  const applicableReqs = requisitos.filter(r => 
    r.ativo && (r.setoresAplicaveis.includes("TODOS") || r.setoresAplicaveis.includes(sectorId))
  );

  let pontuacaoMaxima = 0;
  let pontuacaoObtida = 0;
  let totalPenalidades = 0;

  const calculatedItems: Partial<ItemAuditado>[] = [];

  applicableReqs.forEach(req => {
    const evalValue = evaluations[req.id] || 'Atende Totalmente';
    
    if (evalValue !== 'Não Aplicável') {
      pontuacaoMaxima += config.pontosAtendeTotalmente;

      let pontos = 0;
      if (evalValue === 'Atende Totalmente') pontos = config.pontosAtendeTotalmente;
      else if (evalValue === 'Atende Parcialmente') pontos = config.pontosAtendeParcialmente;
      else pontos = config.pontosNaoAtende;

      pontuacaoObtida += pontos;

      // Check reincidência
      let penalty = 0;
      let reincidenciaCount = 0;
      if (evalValue === 'Não Atende' || evalValue === 'Atende Parcialmente') {
        const reinc = checkReincidencia(sectorId, req.id, auditDate, allAudits.filter(a => a.id !== auditId), allAuditItems);
        reincidenciaCount = reinc.count;
        
        if (reincidenciaCount > 0) {
          if (evalValue === 'Não Atende') {
            penalty = config.penalidadeReincidenciaNaoAtende;
          } else {
            penalty = config.penalidadeReincidenciaParcial;
          }
          totalPenalidades += Math.abs(penalty); // Penalty is stored positive or negative, let's sum absolute then subtract
        }
      }

      calculatedItems.push({
        requisitoId: req.id,
        avaliacao: evalValue,
        pontos: pontos,
        reincidenciaCount: reincidenciaCount,
        penalidadeAplicada: penalty
      });
    } else {
      calculatedItems.push({
        requisitoId: req.id,
        avaliacao: evalValue,
        pontos: 0,
        reincidenciaCount: 0,
        penalidadeAplicada: 0
      });
    }
  });

  const scoreLiquido = Math.max(0, pontuacaoObtida - totalPenalidades);
  const indiceConformidade = pontuacaoMaxima > 0 
    ? Number(((scoreLiquido / pontuacaoMaxima) * 100).toFixed(1)) 
    : 100;

  // Calculate scores per Sense for retro-compatibility (Seiri, Seiton, etc.)
  const sensesScores: Record<string, number> = { S1: 0, S2: 0, S3: 0, S4: 0, S5: 0 };
  const sensesCounts: Record<string, number> = { S1: 0, S2: 0, S3: 0, S4: 0, S5: 0 };

  calculatedItems.forEach(item => {
    const req = requisitos.find(r => r.id === item.requisitoId);
    if (req && item.avaliacao !== 'Não Aplicável') {
      sensesCounts[req.sensoId] += config.pontosAtendeTotalmente;
      const points = item.pontos || 0;
      const penalty = Math.abs(item.penalidadeAplicada || 0);
      sensesScores[req.sensoId] += Math.max(0, points - penalty);
    }
  });

  const getSensePct = (sensoId: string) => {
    const max = sensesCounts[sensoId];
    if (max === 0) return 100;
    return Number(((sensesScores[sensoId] / max) * 100).toFixed(1));
  };

  return {
    pontuacaoMaxima,
    pontuacaoObtida,
    totalPenalidades,
    indiceConformidade,
    calculatedItems,
    seiri: getSensePct('S1'),
    seiton: getSensePct('S2'),
    seiso: getSensePct('S3'),
    seiketsu: getSensePct('S4'),
    shitsuke: getSensePct('S5')
  };
};

// --- INITIAL DATA SEED CONVENIENCE RUNNER ---

export const seedMockDataIfEmpty = (propAudits: Auditoria5S[] = []) => {
  let activeSetores = getSetores();
  let activeReqs = getRequisitos();
  let activeClassificacoes = getClassificacoes();
  let activeConfig = getConfiguracao();
  let activeCiclos = getCiclos();
  let activeItens = getItensAuditados();
  let activePlanos = getPlanosAcao5S();
  let activeFotos = getFotografias();

  // If items or store are empty, populate them
  let needSave = false;

  if (localStorage.getItem('sgq_5s_setores') === null) {
    setStoreData('sgq_5s_setores', INITIAL_SETORES);
    activeSetores = INITIAL_SETORES;
    needSave = true;
  }
  if (localStorage.getItem('sgq_5s_sensos') === null) {
    setStoreData('sgq_5s_sensos', INITIAL_SENSOS);
    needSave = true;
  }
  if (localStorage.getItem('sgq_5s_requisitos') === null) {
    setStoreData('sgq_5s_requisitos', INITIAL_REQUISITOS);
    activeReqs = INITIAL_REQUISITOS;
    needSave = true;
  }
  if (localStorage.getItem('sgq_5s_classificacoes') === null) {
    setStoreData('sgq_5s_classificacoes', INITIAL_CLASSIFICACOES);
    activeClassificacoes = INITIAL_CLASSIFICACOES;
    needSave = true;
  }
  if (localStorage.getItem('sgq_5s_configuracao') === null) {
    setStoreData('sgq_5s_configuracao', INITIAL_CONFIG);
    activeConfig = INITIAL_CONFIG;
    needSave = true;
  }
  if (localStorage.getItem('sgq_5s_ciclos') === null) {
    setStoreData('sgq_5s_ciclos', INITIAL_CICLOS);
    activeCiclos = INITIAL_CICLOS;
    needSave = true;
  }

  // Pre-generate items for existing propAudits if items are completely empty
  if (activeItens.length === 0 && propAudits.length > 0) {
    const generatedItems: ItemAuditado[] = [];
    const generatedPlanos: PlanoAcao5S[] = [];

    propAudits.forEach(audit => {
      // Determine sector id from names or defaults
      const sectorMatched = activeSetores.find(s => s.nome.toLowerCase() === audit.setor.toLowerCase()) || activeSetores[0];
      const sectorId = sectorMatched.id;
      
      // Update sector id & cycle id if not present
      audit.setorId = sectorId;
      audit.cicloId = activeCiclos[0].id;

      // Distribute evaluation based on audit score (e.g. 80% or 4.0 out of 5)
      const targetPct = audit.mediaGeral <= 5 ? audit.mediaGeral * 20 : audit.mediaGeral;
      
      activeReqs.forEach((req, idx) => {
        let evalVal: 'Atende Totalmente' | 'Atende Parcialmente' | 'Não Atende' = 'Atende Totalmente';
        let pontos = 2;

        if (targetPct < 70 && idx % 4 === 0) {
          evalVal = 'Não Atende';
          pontos = 0;
        } else if (targetPct < 90 && idx % 6 === 0) {
          evalVal = 'Atende Parcialmente';
          pontos = 1;
        }

        const itemId = `item-${audit.id}-${req.id}`;
        
        // Create plan if 'Não Atende' or 'Atende Parcialmente'
        let planoId = undefined;
        if (evalVal === 'Não Atende' || evalVal === 'Atende Parcialmente') {
          planoId = `plano5s-${audit.id}-${req.id}`;
          generatedPlanos.push({
            id: planoId,
            auditoriaId: audit.id,
            requisitoId: req.id,
            descricao: `Tratar desvio encontrado no requisito ${req.codigo}: ${req.descricao}.`,
            responsavel: `supervisor.${sectorMatched.nome.toLowerCase().replace(/[^a-z]/g, '')}@vickytex.com.br`,
            prazo: new Date(new Date(audit.dataAuditoria).getTime() + 15 * 24 * 3600 * 1000).toISOString().split('T')[0], // 15 days later
            status: targetPct < 70 ? 'Pendente' : 'Concluído',
            dataConclusao: targetPct >= 70 ? audit.dataAuditoria : undefined,
            fotosCorrecao: [],
            comentarios: ["Plano de ação gerado automaticamente pelo sistema de auditoria 5S."],
            historico: [
              { data: audit.dataAuditoria, usuario: "Sistema", acao: "Criação", detalhes: "Plano gerado por reprovação na auditoria" }
            ]
          });
        }

        generatedItems.push({
          id: itemId,
          auditoriaId: audit.id,
          requisitoId: req.id,
          avaliacao: evalVal,
          pontos: pontos,
          observacoes: evalVal !== 'Atende Totalmente' ? `Identificado desvio na auditoria: ${req.descricao}` : '',
          planoAcaoId: planoId,
          reincidenciaCount: 0,
          penalidadeAplicada: 0
        });
      });
    });

    setStoreData('sgq_5s_itens', generatedItems);
    setStoreData('sgq_5s_planos', generatedPlanos);
  }
};
