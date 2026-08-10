/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Documento, ActivityLog, Auditoria, NaoConformidade, SectorType, DocumentType, PlanoAcao, RiscoOportunidade, Auditoria5S, UserAccount, RolePermission } from '../types';

export const SECTORS: SectorType[] = [
  'Administração',
  'Corte',
  'Costura',
  'Estamparia',
  'Acabamento',
  'Expedição',
  'Qualidade'
];

export const getSectors = (): SectorType[] => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('sgq_vickytex_setores');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // ignore
      }
    }
  }
  return SECTORS;
};

export const DOCUMENT_TYPES: { type: DocumentType; name: string; description: string }[] = [
  { type: 'POP', name: 'Procedimento Operacional Padrão', description: 'Padronização detalhada de processos rotineiros.' },
  { type: 'FOR', name: 'Formulário / Registro da Qualidade', description: 'Coleta de dados e evidência de conformidade.' },
  { type: 'MAN', name: 'Manual da Qualidade', description: 'Diretrizes mestras da política organizacional.' },
  { type: 'IT', name: 'Instrução de Trabalho', description: 'Instruções focadas no posto de trabalho.' },
  { type: 'LIST', name: 'Lista de Verificação / Mestra', description: 'Checklists de conferência de conformidades.' }
];

export const getDocumentTypes = (): { type: DocumentType; name: string; description: string }[] => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('sgq_vickytex_tipos_documentos');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // ignore
      }
    }
  }
  return DOCUMENT_TYPES;
};

export const INITIAL_DOCUMENTS: Documento[] = [
  {
    id: 'POP-COR-001',
    codigo: 'POP-COR-001',
    titulo: 'Procedimento de Enfesto e Corte de Malha PV de Alta Densidade',
    tipo: 'POP',
    setor: 'Corte',
    objetivo: 'Garantir que o enfesto de tecidos de malha PV (Poliéster-Viscose) para camisetas escolares siga a tensão ideal, evitando encolhimento ou distorção após o corte mecânico.',
    descricao: 'Este documento estabelece as regras para descanso prévio da malha PV de 24 horas antes do corte, empilhamento máximo de 80 folhas (folhas/plies) e o correto posicionamento dos moldes digitais com aproveitamento mínimo de 87% de matéria-prima.',
    status: 'Homologado',
    revisao: 1,
    periodicidade: 12,
    dataEmissao: '2026-02-15',
    proximaRevisao: '2027-02-15',
    elaborador: 'qualidade@vickytex.com.br',
    revisor: 'supervisor.corte@vickytex.com.br',
    aprovador: 'gerencia@vickytex.com.br',
    googleDriveId: '1F4R7g8Y9h1J_k9L-4m5n...',
    googleDriveLink: 'https://docs.google.com/viewer?url=https://raw.githubusercontent.com/mozilla/pdf.js/master/web/compressed.tracemonkey-pldi-09.pdf',
    qrCode: 'POP-COR-001',
    createdAt: '2026-02-10T10:00:00Z',
    updatedAt: '2026-02-15T14:30:00Z',
    revisoesHistorico: [
      {
        id: 'rev-001-0',
        documentoId: 'POP-COR-001',
        revisaoNumero: 0,
        dataRevisao: '2026-02-10',
        motivo: 'Elaboração inicial para implantação da ISO 9001:2015 na Vickytex.',
        elaborador: 'qualidade@vickytex.com.br',
        revisor: 'supervisor.corte@vickytex.com.br',
        aprovador: 'gerencia@vickytex.com.br',
        googleDriveId: '1A2B3C4D5E...',
        status: 'Obsoleto'
      }
    ],
    distribuicaoCopias: [
      {
        id: 'copy-1',
        destinatario: 'Mesa de Enfesto (Setor de Corte)',
        tipo: 'Física Impressa',
        quantidade: 1,
        dataEntrega: '2026-02-16',
        status: 'Ativa',
        recebidoPor: 'José Ferreira (Enfestador)'
      },
      {
        id: 'copy-2',
        destinatario: 'Tablet da Inspeção (Qualidade)',
        tipo: 'Digital Controlada',
        quantidade: 1,
        dataEntrega: '2026-02-15',
        status: 'Ativa',
        recebidoPor: 'Maria Silva (Auditora)'
      }
    ],
    documentReadings: [
      {
        id: 'read-1',
        documentoId: 'POP-COR-001',
        usuario: 'José Ferreira (Enfestador)',
        dataLeitura: '16/02/2026 08:30:15',
        assinaturaEletronica: 'ASS-READ-JF8741',
        logGerado: 'doc-log-read-1'
      },
      {
        id: 'read-2',
        documentoId: 'POP-COR-001',
        usuario: 'Mariana Silva (Qualidade)',
        dataLeitura: '15/02/2026 15:45:22',
        assinaturaEletronica: 'ASS-READ-MS2984',
        logGerado: 'doc-log-read-2'
      }
    ]
  },
  {
    id: 'POP-COS-002',
    codigo: 'POP-COS-002',
    titulo: 'Padrão de Costura de Golas Polo e Peitilhos de Uniforme Escolar',
    tipo: 'POP',
    setor: 'Costura',
    objetivo: 'Padronizar a junção de golas de retilínea e peitilho reforçado em camisas polo escolares para máxima durabilidade e acabamento geométrico.',
    descricao: 'Determina a regulagem da máquina reta eletrônica em 4.5 pontos por cm, uso de linha de poliéster 120 e costura de reforço ombro a ombro com cadarço de algodão de 8mm para evitar deformação nas lavagens.',
    status: 'Homologado',
    revisao: 0,
    periodicidade: 12,
    dataEmissao: '2026-03-01',
    proximaRevisao: '2027-03-01',
    elaborador: 'qualidade@vickytex.com.br',
    revisor: 'supervisor.costura@vickytex.com.br',
    aprovador: 'gerencia@vickytex.com.br',
    googleDriveId: '2G5H8i9J0k2L_m3N-5o6p...',
    googleDriveLink: 'https://docs.google.com/viewer?url=https://raw.githubusercontent.com/mozilla/pdf.js/master/web/compressed.tracemonkey-pldi-09.pdf',
    qrCode: 'POP-COS-002',
    createdAt: '2026-03-01T08:00:00Z',
    updatedAt: '2026-03-01T09:00:00Z',
    revisoesHistorico: [],
    distribuicaoCopias: [
      {
        id: 'copy-3',
        destinatario: 'Supervisor de Linha (Costura)',
        tipo: 'Física Impressa',
        quantidade: 1,
        dataEntrega: '2026-03-02',
        status: 'Ativa',
        recebidoPor: 'Roberto Costa (Supervisor)'
      },
      {
        id: 'copy-4',
        destinatario: 'Mesa de Regulagem de Máquinas',
        tipo: 'Digital Controlada',
        quantidade: 1,
        dataEntrega: '2026-03-01',
        status: 'Ativa',
        recebidoPor: 'Carlos Mecânico'
      }
    ],
    documentReadings: [
      {
        id: 'read-3',
        documentoId: 'POP-COS-002',
        usuario: 'Roberto Costa (Supervisor)',
        dataLeitura: '02/03/2026 09:15:00',
        assinaturaEletronica: 'ASS-READ-RC9981',
        logGerado: 'doc-log-read-3'
      }
    ]
  },
  {
    id: 'IT-EST-001',
    codigo: 'IT-EST-001',
    titulo: 'Regulagem e Limpeza do Carrossel de Serigrafia Têxtil',
    tipo: 'IT',
    setor: 'Estamparia',
    objetivo: 'Instruir os operadores sobre a calibração de pressão de rodo, tempo de cura instantânea (flash cure) e limpeza diária das telas para evitar borrões ou migração de cor em tecidos de algodão e PV.',
    descricao: 'Este documento cobre o passo a passo de setup rápido do carrossel semiautomático de 6 cores, verificação de temperatura de pré-cura a 140°C por 4 segundos e a higienização com solvente biodegradável ao final de cada turno.',
    status: 'Em Revisão',
    revisao: 2,
    periodicidade: 6,
    dataEmissao: '2025-08-10',
    proximaRevisao: '2026-02-10', // Vencido
    elaborador: 'supervisor.estamparia@vickytex.com.br',
    revisor: 'qualidade@vickytex.com.br',
    aprovador: 'gerencia@vickytex.com.br',
    googleDriveId: '3H6J9k0L1m3N_o4P-6q7r...',
    googleDriveLink: 'https://docs.google.com/viewer?url=https://raw.githubusercontent.com/mozilla/pdf.js/master/web/compressed.tracemonkey-pldi-09.pdf',
    qrCode: 'IT-EST-001',
    createdAt: '2025-08-01T09:00:00Z',
    updatedAt: '2026-07-09T10:00:00Z',
    revisoesHistorico: [
      {
        id: 'rev-002-1',
        documentoId: 'IT-EST-001',
        revisaoNumero: 1,
        dataRevisao: '2025-02-10',
        motivo: 'Ajuste na temperatura de flash cure para nova tinta plastisol livre de ftalatos.',
        elaborador: 'supervisor.estamparia@vickytex.com.br',
        revisor: 'qualidade@vickytex.com.br',
        aprovador: 'gerencia@vickytex.com.br',
        googleDriveId: '3A4B5C6D...',
        status: 'Obsoleto'
      }
    ]
  },
  {
    id: 'FOR-QLD-004',
    codigo: 'FOR-QLD-004',
    titulo: 'Relatório de Inspeção e Auditoria Volante de Lote de Costura',
    tipo: 'FOR',
    setor: 'Qualidade',
    objetivo: 'Registrar as coletas por amostragem estatística (tabela AQL / NQA 1.5) realizadas nas células de costura da fábrica Vickytex.',
    descricao: 'Formulário padrão para marcação de defeitos críticos (gola torta, costura desfeita, furos no tecido), defeitos graves (tamanho desalinhado) e defeitos toleráveis (linha solta). Define se o lote é liberado ou retido para retrabalho.',
    status: 'Homologado',
    revisao: 0,
    periodicidade: 24,
    dataEmissao: '2026-01-05',
    proximaRevisao: '2028-01-05',
    elaborador: 'qualidade@vickytex.com.br',
    revisor: 'gerencia@vickytex.com.br',
    aprovador: 'gerencia@vickytex.com.br',
    googleDriveId: '4I7K0l1M2n4O_p5Q-7r8s...',
    googleDriveLink: 'https://docs.google.com/viewer?url=https://raw.githubusercontent.com/mozilla/pdf.js/master/web/compressed.tracemonkey-pldi-09.pdf',
    qrCode: 'FOR-QLD-004',
    createdAt: '2026-01-05T11:00:00Z',
    updatedAt: '2026-01-05T12:00:00Z',
    revisoesHistorico: []
  },
  {
    id: 'MAN-QLD-001',
    codigo: 'MAN-QLD-001',
    titulo: 'Manual de Gestão Integrada da Qualidade Vickytex - ISO 9001:2015',
    tipo: 'MAN',
    setor: 'Qualidade',
    objetivo: 'Apresentar as diretrizes políticas, compromissos socioambientais e os macroprocessos da Vickytex para certificação oficial da qualidade.',
    descricao: 'O manual mestre que descreve o escopo do SGQ da Vickytex (fabricação de uniformes escolares e corporativos), a política da qualidade orientada à satisfação das escolas parceiras, e a estrutura do ciclo PDCA integrado na indústria têxtil.',
    status: 'Em Aprovação',
    revisao: 1,
    periodicidade: 24,
    dataEmissao: '2026-07-01',
    proximaRevisao: '2028-07-01',
    elaborador: 'qualidade@vickytex.com.br',
    revisor: 'gerencia@vickytex.com.br',
    aprovador: 'diretoria@vickytex.com.br',
    googleDriveId: '5J8L1m2N3o5P_q6R-8s9t...',
    googleDriveLink: 'https://docs.google.com/viewer?url=https://raw.githubusercontent.com/mozilla/pdf.js/master/web/compressed.tracemonkey-pldi-09.pdf',
    qrCode: 'MAN-QLD-001',
    createdAt: '2026-06-25T15:00:00Z',
    updatedAt: '2026-07-01T10:00:00Z',
    revisoesHistorico: []
  },
  {
    id: 'IT-ACA-002',
    codigo: 'IT-ACA-002',
    titulo: 'Instrução para Passadoria Industrial e Enfardamento de Calças de Brim',
    tipo: 'IT',
    setor: 'Acabamento',
    objetivo: 'Padronizar a passadoria com ferro a vapor industrial e dobra simétrica para calças de brim de uniformes de escolas militares e colégios técnicos.',
    descricao: 'Guia visual passo a passo para temperatura ideal de passadoria de brim 100% algodão, dobras reguladas por gabaritos de acrílico e embalamento a vácuo com saquetas antimofo de sílica gel.',
    status: 'Em Elaboração',
    revisao: 0,
    periodicidade: 12,
    dataEmissao: '2026-07-05',
    proximaRevisao: '2027-07-05',
    elaborador: 'supervisor.acabamento@vickytex.com.br',
    revisor: 'qualidade@vickytex.com.br',
    aprovador: 'gerencia@vickytex.com.br',
    googleDriveId: '6K9M2n3O4p6Q_r7S-9t0u...',
    googleDriveLink: 'https://docs.google.com/viewer?url=https://raw.githubusercontent.com/mozilla/pdf.js/master/web/compressed.tracemonkey-pldi-09.pdf',
    qrCode: 'IT-ACA-002',
    createdAt: '2026-07-05T09:30:00Z',
    updatedAt: '2026-07-05T09:30:00Z',
    revisoesHistorico: []
  }
];

export const INITIAL_LOGS: ActivityLog[] = [
  {
    id: 'log-1',
    usuarioEmail: 'qualidade@vickytex.com.br',
    usuarioNome: 'Mariana Silva',
    usuarioRole: 'Qualidade',
    acao: 'Aprovação de Documento',
    detalhes: 'O documento POP-COR-001 foi homologado na revisão 1.',
    timestamp: '2026-07-09T08:15:00-07:00',
    documentoId: 'POP-COR-001'
  },
  {
    id: 'log-2',
    usuarioEmail: 'supervisor.costura@vickytex.com.br',
    usuarioNome: 'Roberto Costa',
    usuarioRole: 'Supervisor',
    acao: 'Leitura de Documento',
    detalhes: 'Roberto acessou o visualizador do POP-COS-002 na fábrica.',
    timestamp: '2026-07-09T09:30:00-07:00',
    documentoId: 'POP-COS-002'
  },
  {
    id: 'log-3',
    usuarioEmail: 'qualidade@vickytex.com.br',
    usuarioNome: 'Mariana Silva',
    usuarioRole: 'Qualidade',
    acao: 'Criou Nova Revisão',
    detalhes: 'Iniciada revisão técnica do procedimento IT-EST-001.',
    timestamp: '2026-07-09T10:00:00-07:00',
    documentoId: 'IT-EST-001'
  },
  {
    id: 'log-4',
    usuarioEmail: 'gerencia@vickytex.com.br',
    usuarioNome: 'Fernando Oliveira',
    usuarioRole: 'Gestor',
    acao: 'Login Efetuado',
    detalhes: 'Autenticado via Google SSO corporativo Vickytex.',
    timestamp: '2026-07-09T10:45:00-07:00'
  }
];

export const INITIAL_AUDITORIAS: Auditoria[] = [
  {
    id: 'aud-001',
    codigo: 'AUD-2026-001',
    titulo: 'Auditoria de Processo no Setor de Corte e Modelagem',
    dataPlanejada: '2026-07-15',
    setor: 'Corte',
    auditor: 'Mariana Silva (Qualidade)',
    status: 'Agendada'
  },
  {
    id: 'aud-002',
    codigo: 'AUD-2026-002',
    titulo: 'Auditoria Semestral Exigência Cláusula 8.5 - Costura',
    dataPlanejada: '2026-07-22',
    setor: 'Costura',
    auditor: 'Carlos Eduardo (Auditor Externo ISO 9001)',
    status: 'Agendada'
  },
  {
    id: 'aud-003',
    codigo: 'AUD-2026-003',
    titulo: 'Verificação da Calibração e Manutenção de Flash Cure',
    dataPlanejada: '2026-07-01',
    setor: 'Estamparia',
    auditor: 'Mariana Silva (Qualidade)',
    status: 'Realizada'
  }
];

export const INITIAL_NAO_CONFORMIDADES: NaoConformidade[] = [
  {
    id: 'nc-001',
    codigo: 'NC-2026-001',
    titulo: 'Defeito de Tensão de Enfesto - Encolhimento de Peças',
    descricao: 'Detectado na inspeção pós-costura que as camisetas polo da Escola Adventista encolheram 3% a mais que o limite do projeto. Causa provisória: Tecido PV cortado logo após o enfesto, sem o tempo obrigatório de 24 horas de descanso.',
    dataAbertura: '2026-07-02',
    setor: 'Corte',
    responsavel: 'Roberto Costa (Supervisor Corte)',
    status: 'Em Execução',
    documentoRelacionadoId: 'POP-COR-001'
  },
  {
    id: 'nc-002',
    codigo: 'NC-2026-002',
    titulo: 'Falta de Registro de Limpeza Diária do Carrossel',
    descricao: 'Auditores internos constataram ausência de preenchimento do formulário diário de limpeza nas últimas duas semanas, desrespeitando o POP-EST-001.',
    dataAbertura: '2026-07-07',
    setor: 'Estamparia',
    responsavel: 'Jorge Dias (Estamparia)',
    status: 'Aberta',
    documentoRelacionadoId: 'IT-EST-001'
  }
];

export const INITIAL_PLANOS_ACAO: PlanoAcao[] = [
  {
    id: 'pa-001',
    codigo: 'PA-2026-001',
    titulo: 'Controle de Temperatura Flash Cure',
    setor: 'Estamparia',
    status: 'Em Andamento',
    dataCriacao: '2026-07-07',
    oQue: 'Instalar termômetros digitais infravermelhos nas garras do carrossel.',
    porQue: 'Garantir que a temperatura de cura esteja controlada a 140°C, avoiding borrões e perda de peças.',
    onde: 'Setor de Estamparia (Carrossel 1 e 2).',
    quando: '2026-08-15',
    quem: 'Jorge Dias (Estamparia)',
    como: 'Adquirir e fixar sensores infravermelhos com display digital e treinar os operadores.',
    quantoCusta: 1200.00,
    documentoId: 'IT-EST-001',
    auditoriaId: 'aud-003',
    naoConformidadeId: 'nc-002'
  },
  {
    id: 'pa-002',
    codigo: 'PA-2026-002',
    titulo: 'Treinamento sobre Descanso de Malha PV',
    setor: 'Corte',
    status: 'Planejado',
    dataCriacao: '2026-07-03',
    oQue: 'Ministrar treinamento operacional sobre a importância das 24h de descanso para malha PV.',
    porQue: 'Evitar encolhimento de tecidos de poliéster-viscose após o corte.',
    onde: 'Setor de Corte / Sala de Treinamento.',
    quando: '2026-07-25',
    quem: 'Roberto Costa (Supervisor Corte)',
    como: 'Elaborar apresentação técnica com exemplos reais de encolhimento, aplicar lista de presença e avaliação de eficácia.',
    quantoCusta: 300.00,
    documentoId: 'POP-COR-001',
    naoConformidadeId: 'nc-001'
  }
];

export const INITIAL_RISCOS: RiscoOportunidade[] = [
  {
    id: 'ro-001',
    codigo: 'RS-COR-001',
    titulo: 'Variação dimensional no descanso de tecidos sintéticos/PV',
    tipo: 'Risco',
    setor: 'Corte',
    descricao: 'Risco do tecido ser cortado sem completar o tempo mínimo de descanso de 24 horas, gerando peças encolhidas após costura ou lavagem.',
    probabilidade: 3,
    impacto: 4,
    nivelExposicao: 12,
    estrategia: 'Mitigar',
    planoAcaoId: 'pa-002',
    status: 'Em Tratamento',
    dataIdentificacao: '2026-07-02',
    responsavel: 'Roberto Costa (Supervisor Corte)'
  },
  {
    id: 'ro-002',
    codigo: 'RS-COS-001',
    titulo: 'Desgaste prematuro de agulhas e quebra de ponto',
    tipo: 'Risco',
    setor: 'Costura',
    descricao: 'Risco de agulhas cegas ou tortas danificarem as fibras da malha PV das golas polo, causando furos ou costuras desfeitas pós-lavagem.',
    probabilidade: 2,
    impacto: 3,
    nivelExposicao: 6,
    estrategia: 'Mitigar',
    status: 'Identificado',
    dataIdentificacao: '2026-07-05',
    responsavel: 'Silvia Ramos (Costura)'
  },
  {
    id: 'ro-003',
    codigo: 'RS-EST-001',
    titulo: 'Temperatura desregulada de cura do Plastisol no Flash Cure',
    tipo: 'Risco',
    setor: 'Estamparia',
    descricao: 'Risco da temperatura no carrossel cair abaixo de 140°C ou passar de 160°C, fazendo a estampa do logo da escola descascar ou queimar o tecido.',
    probabilidade: 4,
    impacto: 4,
    nivelExposicao: 16,
    estrategia: 'Mitigar',
    planoAcaoId: 'pa-001',
    status: 'Em Tratamento',
    dataIdentificacao: '2026-07-01',
    responsavel: 'Jorge Dias (Estamparia)'
  },
  {
    id: 'ro-004',
    codigo: 'OP-COS-002',
    titulo: 'Aquisição de Máquina de Travete Eletrônica para Reforço',
    tipo: 'Oportunidade',
    setor: 'Costura',
    descricao: 'Oportunidade de automatizar a costura de travete nos bolsos e aberturas laterais das calças escolares de brim, reduzindo o tempo de ciclo em 40% e garantindo resistência de 100% contra rasgos.',
    probabilidade: 4,
    impacto: 5,
    nivelExposicao: 20,
    estrategia: 'Explorar',
    status: 'Identificado',
    dataIdentificacao: '2026-07-08',
    responsavel: 'Silvia Ramos (Costura)'
  }
];

export const INITIAL_5S_AUDITS: Auditoria5S[] = [
  {
    id: 'aud5s-001',
    codigo: 'AUD5S-INS-001',
    setor: 'Estoque MP / Insumos',
    setorId: 'setor-2',
    cicloId: 'ciclo-1',
    auditor: 'Mariana Silva (Qualidade)',
    dataAuditoria: '2026-07-01',
    seiri: 80,
    seiton: 60,
    seiso: 100,
    seiketsu: 80,
    shitsuke: 80,
    mediaGeral: 80.0,
    observacoes: 'Excelente pontuação em Limpeza (Seiso). Organização de caixas de insumos (Seiton) ainda necessita de melhor demarcação visual.',
    status: 'Finalizada'
  },
  {
    id: 'aud5s-002',
    codigo: 'AUD5S-COR-001',
    setor: 'Corte',
    setorId: 'setor-3',
    cicloId: 'ciclo-1',
    auditor: 'Mariana Silva (Qualidade)',
    dataAuditoria: '2026-07-04',
    seiri: 100,
    seiton: 80,
    seiso: 80,
    seiketsu: 100,
    shitsuke: 100,
    mediaGeral: 92.0,
    observacoes: 'O setor de Corte mantém alto nível de conformidade 5S. A triagem de retalhos (Seiri) está impecável.',
    status: 'Finalizada'
  },
  {
    id: 'aud5s-003',
    codigo: 'AUD5S-COS-001',
    setor: 'Costura',
    setorId: 'setor-5',
    cicloId: 'ciclo-1',
    auditor: 'Roberto Costa (Corte)',
    dataAuditoria: '2026-07-08',
    seiri: 60,
    seiton: 40,
    seiso: 80,
    seiketsu: 60,
    shitsuke: 60,
    mediaGeral: 60.0,
    observacoes: 'Pontuação crítica em Seiton (Organização): carretéis de linha espalhados e golas escolares sem identificação de lote no chão. Requer plano de ação.',
    status: 'Finalizada',
    planoAcaoId: 'pa-002'
  }
];

export interface PersonalizacaoGeral {
  nomeEmpresa: string;
  versaoSistema: string;
  normaISO: string;
  sloganHome: string;
  descricaoHome: string;
  textoRodape: string;
  diretrizesRodape: string;
  documentosTitulo: string;
  documentosSubtitulo: string;
  auditoriasTitulo: string;
  auditoriasSubtitulo: string;
  planosTitulo: string;
  planosSubtitulo: string;
  treinamentosTitulo: string;
  treinamentosSubtitulo: string;
  calibracoesTitulo: string;
  calibracoesSubtitulo: string;
  calibracaoTitulo?: string;
  calibracaoSubtitulo?: string;
  riscosTitulo: string;
  riscosSubtitulo: string;
  auditorias5sTitulo: string;
  auditorias5sSubtitulo: string;
  fornecedoresTitulo?: string;
  fornecedoresSubtitulo?: string;
  registrosTitulo?: string;
  registrosSubtitulo?: string;
  treinamentosAjudaTitulo?: string;
  treinamentosAjudaSubtitulo?: string;
  auditorias5sAjudaTitulo?: string;
  auditorias5sAjudaSubtitulo?: string;
  auditoriasAjudaTitulo?: string;
  auditoriasAjudaSubtitulo?: string;
  calibracaoAjudaTitulo?: string;
  calibracaoAjudaSubtitulo?: string;
  documentosAjudaTitulo?: string;
  documentosAjudaSubtitulo?: string;
  fornecedoresAjudaTitulo?: string;
  fornecedoresAjudaSubtitulo?: string;
  planosAjudaTitulo?: string;
  planosAjudaSubtitulo?: string;
  registrosAjudaTitulo?: string;
  registrosAjudaSubtitulo?: string;
  riscosAjudaTitulo?: string;
  riscosAjudaSubtitulo?: string;
  auditorias5sMetaTitulo?: string;
  auditorias5sMetaSubtitulo?: string;
  auditorias5sMetaGrafico?: number;
  loginBadge?: string;
  loginTitulo?: string;
  loginDescricao?: string;
  loginVantagem1Titulo?: string;
  loginVantagem1Desc?: string;
  loginVantagem2Titulo?: string;
  loginVantagem2Desc?: string;
  loginVantagem3Titulo?: string;
  loginVantagem3Desc?: string;
  loginVantagem4Titulo?: string;
  loginVantagem4Desc?: string;
  loginFooterEsquerdoLinha1?: string;
  loginFooterEsquerdoLinha2?: string;
  loginVersaoTexto?: string;
  loginSuporteContatoTitulo?: string;
  loginSuporteContatoTexto?: string;
  loginDireitaTitulo?: string;
  loginDireitaSubtitulo?: string;
  loginSsoDescricao?: string;
  loginComplianceTexto?: string;
  loginFooterDireitoTexto?: string;
}

export const DEFAULT_PERSONALIZACAO: PersonalizacaoGeral = {
  nomeEmpresa: "VICKYTEX",
  versaoSistema: "SGQ WEB v1.0.0",
  normaISO: "Conformidade ISO 9001:2015",
  sloganHome: "Painel Geral do Sistema de Gestão da Qualidade",
  descricaoHome: "Acompanhe os principais indicadores de conformidade e as atividades em tempo real.",
  textoRodape: "© 2026 Vickytex S.A. — Sistema de Gestão da Qualidade (SGQ) Web Integrado.",
  diretrizesRodape: "Sistemas e diretrizes em conformidade com as normas internacionais de auditoria.",
  documentosTitulo: "Lista Mestra de Documentos",
  documentosSubtitulo: "Controle de documentos vigentes, revisões e links integrados do Google Drive.",
  auditoriasTitulo: "Gestão de Auditorias & Não Conformidades",
  auditoriasSubtitulo: "Programação de auditorias de processo e tratamento de desvios identificados.",
  planosTitulo: "Planos de Ação 5W2H",
  planosSubtitulo: "Planejamento e controle de eficácia das ações corretivas e preventivas.",
  treinamentosTitulo: "Treinamentos & Matriz de Competências",
  treinamentosSubtitulo: "Registro de treinamentos e monitoramento da competência do time de produção.",
  calibracoesTitulo: "Calibração e Controle Metrológico",
  calibracoesSubtitulo: "Inventário de equipamentos de medição e certificados de calibração vigentes.",
  calibracaoTitulo: "Recursos de Monitoramento e Medição (Metrologia)",
  calibracaoSubtitulo: "Monitore de forma centralizada e rastreável todos os instrumentos, sensores e balanças críticas.",
  riscosTitulo: "Gestão de Riscos & Oportunidades",
  riscosSubtitulo: "Identificação, análise e mitigação proativa de riscos operacionais e aproveitamento de oportunidades (ISO 9001:2015 - Cláusula 6.1).",
  auditorias5sTitulo: "Programa 5S & Auditoria de Organização",
  auditorias5sSubtitulo: "Avaliação do nível de maturidade dos 5 sensos (Utilização, Organização, Limpeza, Saúde e Autodisciplina) nas células produtivas.",
  fornecedoresTitulo: "Qualificação & Avaliação de Fornecedores (ISO 8.4)",
  fornecedoresSubtitulo: "Cadastro de fornecedores homologados, registros de auditorias, avaliação contínua e controle de insumos e compras críticas.",
  registrosTitulo: "Controle e Retenção de Registros da Qualidade (ISO 7.5.3)",
  registrosSubtitulo: "Gerenciamento sistemático do armazenamento, tempo de retenção, descarte e rastreabilidade de evidências físicas ou digitais.",
  treinamentosAjudaTitulo: "Como esta Matriz assegura aprovação em Auditorias Certificadoras?",
  treinamentosAjudaSubtitulo: "Durante uma auditoria da ABNT ou de órgão externo, o auditor selecionará um operador na fábrica e pedirá a evidência documentada de que ele foi treinado para a versão vigente da Instrução de Trabalho ou POP que está executando no momento. Este painel permite comprovar em tempo real a rastreabilidade perfeita de competências.",
  auditorias5sAjudaTitulo: "Maturidade Operacional e o Programa 5S",
  auditorias5sAjudaSubtitulo: "Embora o 5S não seja um requisito literal da ISO 9001, ele serve como base fundamental de infraestrutura (Requisito 7.1.3 e 7.1.4) de ambiente para a operação dos processos. A disciplina e a organização das células produtivas asseguram a mitigação de falhas operacionais e elevam o nível de excelência industrial.",
  auditoriasAjudaTitulo: "Auditorias Internas e Não Conformidades (ISO 9.2 & 10.2)",
  auditoriasAjudaSubtitulo: "A organização deve planejar, estabelecer e manter um programa de auditoria interna e, ao identificar não-conformidades, reagir imediatamente para controlar e corrigir o desvio, avaliando as causas raiz para evitar que voltem a ocorrer (ações corretivas robustas).",
  calibracaoAjudaTitulo: "Evidência de Rastreabilidade Metrológica (Requisito 7.1.5)",
  calibracaoAjudaSubtitulo: "A norma ISO 9001:2015 impõe que equipamentos usados para medir produtos (trena no corte, balança na expedição, termômetro na estamparia) sejam verificados a intervalos especificados contra padrões de medição rastreáveis a padrões nacionais ou internacionais (Inmetro/RBC). Os certificados desta aba atestam a rastreabilidade perfeita e garantem nota máxima nas auditorias.",
  documentosAjudaTitulo: "Controle de Informação Documentada (ISO 7.5)",
  documentosAjudaSubtitulo: "A norma ISO 9001:2015 exige a criação, atualização e controle de informações documentadas. Este módulo centraliza os procedimentos, instruções de trabalho e manuais com controle rígido de versões, permissões e histórico de revisões (obsolescência) para evitar o uso de documentos desatualizados na fábrica.",
  fornecedoresAjudaTitulo: "Controle de Processos, Produtos e Serviços Providos Externamente (ISO 8.4)",
  fornecedoresAjudaSubtitulo: "A organização deve assegurar que processos, produtos e serviços providos externamente estejam em conformidade com os requisitos. Isso inclui a definição e aplicação de critérios para a avaliação, seleção, monitoramento de desempenho e reavaliação de fornecedores externos.",
  planosAjudaTitulo: "Planejamento de Ações Corretivas e Preventivas (ISO 10.2)",
  planosAjudaSubtitulo: "A metodologia 5W2H (O que, Por que, Onde, Quem, Quando, Como, Quanto) garante que cada plano de ação de tratativa seja detalhado de forma inequívoca e auditable, demonstrando o controle rigoroso de prazos e responsabilidades exigidos pelos auditores externos do SGQ.",
  registrosAjudaTitulo: "Controle e Retenção de Registros da Qualidade (ISO 7.5.3)",
  registrosAjudaSubtitulo: "Os registros são evidências objetivas de que os processos foram executados conforme planejado. O controle sistemático de armazenamento, tempo de retenção, descarte e rastreabilidade assegura a proteção contra alterações não intencionais e facilita a recuperação imediata durante auditorias externas.",
  riscosAjudaTitulo: "Abordagem de Riscos e Oportunidades (Requisito ISO 6.1)",
  riscosAjudaSubtitulo: "O pensamento baseado em risco permite à organização determinar os fatores que poderiam causar desvios em seus processos e no SGQ, colocando em prática controles preventivos para minimizar efeitos negativos e maximizar as oportunidades que surgirem.",
  auditorias5sMetaTitulo: "Meta de Qualidade 5S Vickytex",
  auditorias5sMetaSubtitulo: "A Vickytex estabelece que toda célula ou setor que obtiver uma nota média geral abaixo de 3.5 deve abrir obrigatoriamente um Plano de Ação Corretiva 5W2H focado nos sensos deficientes, visando reestruturar a disposição física das máquinas, realizar mutirões de limpeza assistida ou reorientar a equipe em reuniões diárias (DDS).",
  auditorias5sMetaGrafico: 75,
  loginBadge: "Certificação ISO 9001:2015 em Implementação Ativa",
  loginTitulo: "A evolução do SGQ Vickytex começa aqui.",
  loginDescricao: "Substitua de forma definitiva as planilhas de controle em Excel por um ecossistema web modular integrado ao seu Google Workspace corporativo. Controle documentos, vistorias, não conformidades e processos têxteis em tempo real.",
  loginVantagem1Titulo: "Lista Mestra Inteligente",
  loginVantagem1Desc: "Procedimentos, instruções e formulários sob controle rígido e assinaturas eletrônicas.",
  loginVantagem2Titulo: "Rastreabilidade Absoluta",
  loginVantagem2Desc: "Controle estrito de cópias físicas (auditorias) e histórico completo de revisões.",
  loginVantagem3Titulo: "Auditorias Digitais & NCs",
  loginVantagem3Desc: "Gestão de Não Conformidades, Planos 5W2H e Auditorias 5S integradas.",
  loginVantagem4Titulo: "QR Code Integrado",
  loginVantagem4Desc: "Postos de costura e corte com acesso imediato à versão vigente dos documentos.",
  loginFooterEsquerdoLinha1: "© 2026 Vickytex S.A. — Uniformes Escolares e Profissionais de Alta Qualidade.",
  loginFooterEsquerdoLinha2: "Desenvolvido seguindo as diretrizes estruturais de Auditoria Têxtil ISO 9001.",
  loginVersaoTexto: "SGQ WEB • v1.0.0",
  loginSuporteContatoTitulo: "Suporte Técnico TI - Vickytex",
  loginSuporteContatoTexto: "Se você perdeu sua senha de acesso, precisa redefinir suas credenciais do Google Workspace corporativo, ou quer reportar uma instabilidade, fale com o suporte pelo e-mail suporte@vickytex.com.br ou abra um chamado pelo ramal interno 4100.",
  loginDireitaTitulo: "Acesse o Portal SGQ",
  loginDireitaSubtitulo: "Escolha a forma de acesso corporativo mais adequada para seu perfil de colaborador ou auditor.",
  loginSsoDescricao: "A Vickytex utiliza a plataforma corporativa do Google Workspace. Clique no botão abaixo para acessar usando sua conta de e-mail @vickytex.com.br sem precisar de nova senha.",
  loginComplianceTexto: "Acesso exclusivo a colaboradores autorizados da Vickytex. Todo acesso, alteração documental e auditoria são registrados e auditáveis pela comissão de conformidade em atendimento ao item 7.5 de Informação Documentada da ISO 9001.",
  loginFooterDireitoTexto: "SGQ WEB VICKYTEX • Netlify Production Build Ready"
};

export const getPersonalizacaoGeral = (): PersonalizacaoGeral => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('sgq_vickytex_personalizacao');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.versaoSistema === "SGQ WEB v0.3" || !parsed.versaoSistema) {
          parsed.versaoSistema = "SGQ WEB v1.0.0";
        }
        if (parsed.loginVersaoTexto === "SGQ WEB • V0.3" || parsed.loginVersaoTexto === "SGQ WEB • v0.3" || !parsed.loginVersaoTexto) {
          parsed.loginVersaoTexto = "SGQ WEB • v1.0.0";
        }
        savePersonalizacaoGeral({ ...DEFAULT_PERSONALIZACAO, ...parsed });
        return { ...DEFAULT_PERSONALIZACAO, ...parsed };
      } catch (e) {
        // ignore
      }
    }
  }
  return DEFAULT_PERSONALIZACAO;
};

export const savePersonalizacaoGeral = (config: PersonalizacaoGeral): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('sgq_vickytex_personalizacao', JSON.stringify(config));
  }
};

export const INITIAL_USER_ACCOUNTS: UserAccount[] = [
  {
    id: 'user-1',
    name: 'Mariana Silva (Qualidade)',
    email: 'qualidade@vickytex.com.br',
    role: 'Qualidade',
    sector: 'Qualidade',
    photoURL: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Mariana',
    status: 'Ativo',
    passwordHash: 'mariana2026',
    lastLogin: '2026-07-10 08:30',
    telefone: '(11) 98765-4321'
  },
  {
    id: 'user-2',
    name: 'Fernando Oliveira (Diretor)',
    email: 'gerencia@vickytex.com.br',
    role: 'Gestor',
    sector: 'Administração',
    photoURL: 'https://api.dicebear.com/7.x/bottts/svg?seed=Fernando',
    status: 'Ativo',
    passwordHash: 'fernando2026',
    lastLogin: '2026-07-09 14:15',
    telefone: '(11) 97654-3210'
  },
  {
    id: 'user-3',
    name: 'Roberto Costa (Líder de Costura)',
    email: 'supervisor.costura@vickytex.com.br',
    role: 'Supervisor',
    sector: 'Costura',
    photoURL: 'https://api.dicebear.com/7.x/lorelei/svg?seed=Roberto',
    status: 'Ativo',
    passwordHash: 'roberto2026',
    lastLogin: '2026-07-10 07:05',
    telefone: '(11) 96543-2109'
  },
  {
    id: 'user-4',
    name: 'Suporte TI Vickytex',
    email: 'admin@vickytex.com.br',
    role: 'Administrador',
    sector: 'Administração',
    photoURL: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=Buster',
    status: 'Ativo',
    passwordHash: 'admin123',
    lastLogin: '2026-07-10 09:12',
    telefone: '(11) 95432-1098'
  },
  {
    id: 'user-5',
    name: 'Ana Souza (Operadora Corte)',
    email: 'colaborador@vickytex.com.br',
    role: 'Colaborador',
    sector: 'Corte',
    photoURL: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ana',
    status: 'Ativo',
    passwordHash: 'ana2026',
    lastLogin: '2026-07-08 11:30',
    telefone: '(11) 94321-0987'
  },
  {
    id: 'user-6',
    name: 'Carlos Eduardo (Auditor ISO 9001)',
    email: 'auditor.externo@vickytex.com.br',
    role: 'Auditor',
    sector: 'Qualidade',
    photoURL: 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=Carlos',
    status: 'Ativo',
    passwordHash: 'carlos2026',
    lastLogin: '2026-07-07 16:45',
    telefone: '(11) 93210-9876'
  }
];

export const INITIAL_ROLE_PERMISSIONS: RolePermission[] = [
  {
    role: 'Administrador',
    allowedSections: ['dashboard', 'documentos', 'auditorias', 'riscos', '5s', 'treinamentos', 'calibracao', 'planos', 'configuracoes', 'usuarios', 'integracao', 'database', 'registros', 'fornecedores', 'ceo', 'indicadores']
  },
  {
    role: 'Gestor',
    allowedSections: ['dashboard', 'documentos', 'auditorias', 'riscos', '5s', 'treinamentos', 'calibracao', 'planos', 'configuracoes', 'usuarios', 'integracao', 'database', 'registros', 'fornecedores', 'ceo', 'indicadores']
  },
  {
    role: 'Qualidade',
    allowedSections: ['dashboard', 'documentos', 'auditorias', 'riscos', '5s', 'treinamentos', 'calibracao', 'planos', 'configuracoes', 'usuarios', 'registros', 'fornecedores', 'ceo', 'indicadores']
  },
  {
    role: 'Supervisor',
    allowedSections: ['dashboard', 'documentos', 'auditorias', '5s', 'treinamentos', 'calibracao', 'planos', 'registros', 'fornecedores', 'ceo', 'indicadores']
  },
  {
    role: 'Colaborador',
    allowedSections: ['dashboard', 'documentos', '5s', 'treinamentos', 'registros', 'ceo', 'indicadores']
  },
  {
    role: 'Auditor',
    allowedSections: ['dashboard', 'documentos', 'auditorias', 'riscos', '5s', 'planos', 'registros', 'fornecedores', 'ceo', 'indicadores']
  }
];

import { Fornecedor } from '../types';

export const INITIAL_FORNECEDORES: Fornecedor[] = [
  {
    id: 'forn-1',
    cnpj: '12.345.678/0001-90',
    razaoSocial: 'Fiação e Tecelagem Fios do Brasil S.A.',
    nomeFantasia: 'Fios do Brasil',
    contatoNome: 'Guilherme Mendes',
    contatoEmail: 'vendas@fiosdobrasil.com.br',
    contatoTelefone: '(11) 3221-8899',
    categoria: 'Fios e Fibras',
    criticidade: 'Alta',
    statusQualificacao: 'Qualificado',
    dataQualificacao: '2026-01-15',
    notaAvaliacao: 94,
    observacoes: 'Fornecedor homologado de fios de algodão e elastano. Excelente regularidade de lote.',
    historicoAvaliacoes: [
      {
        id: 'av-1-1',
        dataAvaliacao: '2026-01-15',
        avaliador: 'Vicky (Qualidade)',
        criterioQualidade: 95,
        criterioPrazo: 90,
        criterioAtendimento: 98,
        notaGeral: 94.3,
        resultado: 'Aprovado',
        parecerTecnico: 'Laudos de ensaio de tração apresentaram excelentes resultados. Documentação em conformidade.'
      },
      {
        id: 'av-1-2',
        dataAvaliacao: '2026-06-10',
        avaliador: 'Carlos (Qualidade)',
        criterioQualidade: 93,
        criterioPrazo: 95,
        criterioAtendimento: 95,
        notaGeral: 94.3,
        resultado: 'Aprovado',
        parecerTecnico: 'Entrega pontual e mercadoria livre de impurezas.'
      }
    ]
  },
  {
    id: 'forn-2',
    cnpj: '98.765.432/0001-10',
    razaoSocial: 'Tinturaria e Estamparia Textiluz Ltda',
    nomeFantasia: 'Tinturaria Textiluz',
    contatoNome: 'Marcela Silva',
    contatoEmail: 'contato@textiluz.com.br',
    contatoTelefone: '(47) 3355-1212',
    categoria: 'Serviços de Tinturaria',
    criticidade: 'Alta',
    statusQualificacao: 'Qualificado com Restrições',
    dataQualificacao: '2026-03-20',
    notaAvaliacao: 72,
    observacoes: 'Prestador de serviços terceirizados de beneficiamento têxtil. Necessita acompanhamento de solidez de cor.',
    historicoAvaliacoes: [
      {
        id: 'av-2-1',
        dataAvaliacao: '2026-03-20',
        avaliador: 'Vicky (Qualidade)',
        criterioQualidade: 65,
        criterioPrazo: 80,
        criterioAtendimento: 75,
        notaGeral: 72.3,
        resultado: 'Aprovado com Restrições',
        parecerTecnico: 'Ocorreram desvios de tonalidade no lote #A44. Exigido plano de ação de padronização de receitas químicas.'
      }
    ]
  },
  {
    id: 'forn-3',
    cnpj: '44.555.666/0001-22',
    razaoSocial: 'Química Norte-Sertão S.A.',
    nomeFantasia: 'Química Norte-Sertão',
    contatoNome: 'Eng. Roberto Rezende',
    contatoEmail: 'roberto@quimicans.com.br',
    contatoTelefone: '(81) 3456-7890',
    categoria: 'Produtos Químicos',
    criticidade: 'Média',
    statusQualificacao: 'Em Avaliação',
    notaAvaliacao: undefined,
    observacoes: 'Fornecedor de corantes e auxiliares químicos de processo. Enviando amostras para ensaio laboratorial.',
    historicoAvaliacoes: []
  },
  {
    id: 'forn-4',
    cnpj: '55.123.456/0001-77',
    razaoSocial: 'CalibraTex Metrologia Industrial Ltda',
    nomeFantasia: 'CalibraTex',
    contatoNome: 'Téc. Anderson Peixoto',
    contatoEmail: 'anderson@calibratex.com.br',
    contatoTelefone: '(11) 4567-1122',
    categoria: 'Calibração',
    criticidade: 'Alta',
    statusQualificacao: 'Qualificado',
    dataQualificacao: '2026-05-02',
    notaAvaliacao: 98,
    observacoes: 'Laboratório acreditado pela Cgcre (Inmetro) para calibração de balanças, termômetros e dinamômetros.',
    historicoAvaliacoes: [
      {
        id: 'av-4-1',
        dataAvaliacao: '2026-05-02',
        avaliador: 'Carlos (Qualidade)',
        criterioQualidade: 100,
        criterioPrazo: 95,
        criterioAtendimento: 100,
        notaGeral: 98.3,
        resultado: 'Aprovado',
        parecerTecnico: 'Certificados emitidos perfeitamente com rastreabilidade RBC. Prazo de execução muito ágil.'
      }
    ]
  }
];

