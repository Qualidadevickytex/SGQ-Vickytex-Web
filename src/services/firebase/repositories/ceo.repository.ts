/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ProjetoCEO, SugestaoCEO, FerramentasCEO, MetodologiaCEO } from '../../../types/ceo';
import { BaseRepository } from './base.repository';

export function gerarEtapasPadrao(metodologia: MetodologiaCEO) {
  switch (metodologia) {
    case 'PDCA':
      return [
        { nome: 'Plan (Planejar)', status: 'Pendente' as const },
        { nome: 'Do (Executar)', status: 'Pendente' as const },
        { nome: 'Check (Verificar)', status: 'Pendente' as const },
        { nome: 'Act (Agir)', status: 'Pendente' as const }
      ];
    case 'DMAIC':
      return [
        { nome: 'Define (Definir)', status: 'Pendente' as const },
        { nome: 'Measure (Medir)', status: 'Pendente' as const },
        { nome: 'Analyze (Analisar)', status: 'Pendente' as const },
        { nome: 'Improve (Melhorar)', status: 'Pendente' as const },
        { nome: 'Control (Controlar)', status: 'Pendente' as const }
      ];
    case 'Kaizen':
      return [
        { nome: 'Identificar Oportunidade', status: 'Pendente' as const },
        { nome: 'Mapear Processo Atual', status: 'Pendente' as const },
        { nome: 'Executar Melhoria', status: 'Pendente' as const },
        { nome: 'Padronizar Solução', status: 'Pendente' as const }
      ];
    case 'A3':
      return [
        { nome: 'Contexto e Estado Atual', status: 'Pendente' as const },
        { nome: 'Metas e Alvo', status: 'Pendente' as const },
        { nome: 'Análise de Causa Raiz', status: 'Pendente' as const },
        { nome: 'Contramedidas e Plano', status: 'Pendente' as const },
        { nome: 'Acompanhamento', status: 'Pendente' as const }
      ];
    case 'Projeto Lean':
      return [
        { nome: 'VSM (Mapeamento do Fluxo de Valor)', status: 'Pendente' as const },
        { nome: 'Redução de Desperdícios', status: 'Pendente' as const },
        { nome: 'Fluxo Contínuo', status: 'Pendente' as const },
        { nome: 'Puxar Produção', status: 'Pendente' as const },
        { nome: 'Perfeição / Kaizen', status: 'Pendente' as const }
      ];
    case 'Projeto Estratégico':
      return [
        { nome: 'Alinhamento de Diretrizes', status: 'Pendente' as const },
        { nome: 'Definição de Metas', status: 'Pendente' as const },
        { nome: 'Desdobramento de Ações', status: 'Pendente' as const },
        { nome: 'Execução', status: 'Pendente' as const },
        { nome: 'Avaliação de Resultados', status: 'Pendente' as const }
      ];
    case 'Projeto Personalizado':
    default:
      return [
        { nome: 'Concepção', status: 'Pendente' as const },
        { nome: 'Planejamento', status: 'Pendente' as const },
        { nome: 'Execução', status: 'Pendente' as const },
        { nome: 'Monitoramento', status: 'Pendente' as const },
        { nome: 'Encerramento', status: 'Pendente' as const }
      ];
  }
}

export function getDefaultFerramentas(metodologia: MetodologiaCEO): FerramentasCEO {
  return {
    equipe: [],
    sipoc: { fornecedores: '', entradas: '', processo: [], saidas: '', clientes: '' },
    voc: [],
    brainstorming: [],
    gut: [],
    swot: { forcas: [], fraquezas: [], oportunidades: [], ameacas: [] },
    fiveWhys: [],
    ishikawa: { efeito: '', metodo: [], materiaPrima: [], maoDeObra: [], maquina: [], medicao: [], meioAmbiente: [] },
    fluxograma: [],
    cronograma: [],
    evidencias: [],
    etapas: gerarEtapasPadrao(metodologia)
  };
}

const INITIAL_CEO_PROJECTS: ProjetoCEO[] = [
  {
    id: 'proj-ceo-1',
    codigo: 'PROJ-CEO-2026-001',
    titulo: 'Redução de Set-up na Linha de Costura',
    descricao: 'Aplicação de técnicas SMED nas máquinas de costura eletrônicas para reduzir o tempo de troca de lote de 45 para 15 minutos.',
    setor: 'Costura' as any,
    lider: 'supervisor.costura@vickytex.com.br',
    patrocinador: 'qualidade@vickytex.com.br',
    status: 'Em Execução',
    dataInicio: '2026-05-15',
    dataFimPlanejada: '2026-08-15',
    metodologia: 'Projeto Lean',
    investimento: 2500,
    retornoEsperado: 12000,
    indicadoresImpactados: ['IND-OEE', 'IND-PROD'],
    acoesRealizadas: ['Mapeamento do processo atual (As-Is)', 'Identificação de atividades internas e externas', 'Desenvolvimento de novos suportes rápidos'],
    ferramentas: {
      equipe: [
        { nome: 'Mariana Santos', email: 'supervisor.costura@vickytex.com.br', funcao: 'Líder do Projeto' },
        { nome: 'Carlos Oliveira', email: 'colaborador.costura@vickytex.com.br', funcao: 'Facilitador Lean' }
      ],
      sipoc: {
        fornecedores: 'Almoxarifado de Tecidos, Planejamento',
        entradas: 'Ordem de Produção, Fios e Aviamentos, Moldes Cortados',
        processo: [
          'Preparar kit de costura antes da parada da máquina',
          'Retirar ferramentas de ajuste rápido do armário',
          'Ajustar pressão do calcador e guias de costura',
          'Executar primeira peça piloto de teste'
        ],
        saidas: 'Máquina de costura regulada, lote iniciado sem defeitos',
        clientes: 'Setor de Acabamento, Expedição'
      },
      voc: [
        { id: 'v1', cliente: 'Gerente Industrial', feedback: 'O tempo ocioso das máquinas na troca de referência está muito alto.', necessidade: 'Reduzir setup em 50% mínimo.', prioridade: 'Alta' }
      ],
      brainstorming: [
        { id: 'b1', ideia: 'Organizar ferramentas perto das máquinas', categoria: 'Organização', impacto: 4, esforc0: 2, pick: 'Implement', status: 'Aprovada' } as any
      ],
      gut: [
        { id: 'g1', problema: 'Demora para encontrar chaves de regulagem', G: 4, U: 4, T: 4, total: 64, acao: 'Criar quadro de ferramentas 5S' }
      ],
      swot: {
        forcas: ['Equipe de costura experiente', 'Máquinas modernas com ajuste eletrônico'],
        fraquezas: ['Falta de gabaritos padrão', 'Desorganização de chaves de regulagem'],
        oportunidades: ['Treinamento SMED pelo Senai', 'Parceria com fornecedor de guias rápidos'],
        ameacas: ['Rotatividade de costureiras', 'Aumento na variedade de modelos simultâneos']
      },
      fiveWhys: [
        { id: 'fw1', problema: 'Troca de linha demora muito', porques: ['As costureiras procuram as cores na prateleira central', 'Não há estoque local nas máquinas', 'O abastecimento não é planejado antecipadamente', 'Ninguém avisa qual o próximo lote', 'Falta de comunicação entre o corte e a costura'], causaRaiz: 'Ausência de fluxo puxado e kit de setup prévio', acaoProposta: 'Implantar kit de setup de costura 1h antes do término' }
      ],
      ishikawa: {
        efeito: 'Setup de máquina demorado (45 minutos)',
        metodo: ['Falta de roteiro padrão de setup', 'Falta de cronometragem formal'],
        materiaPrima: ['Lotes pequenos variados', 'Diferenças de espessura de fios'],
        maoDeObra: ['Falta de treinamento em SMED', 'Costureiras fazem regulagem individualizada'],
        maquina: ['Chaves manuais lentas', 'Ausência de travas rápidas nos guias'],
        medicao: ['Não há indicador de tempo de setup visível'],
        meioAmbiente: ['Iluminação deficiente no fundo das máquinas', 'Passagens obstruídas']
      },
      fluxograma: [
        { id: 'f1', titulo: 'Parada da Máquina', tipo: 'Inicio', nextId: 'f2', responsavel: 'Costureira' },
        { id: 'f2', titulo: 'Trocar Linha e Agulha', tipo: 'Processo', nextId: 'f3', responsavel: 'Costureira' },
        { id: 'f3', titulo: 'Ajuste de Tensão', tipo: 'Processo', nextId: 'f4', responsavel: 'Mecânico' },
        { id: 'f4', titulo: 'Teste de Costura OK?', tipo: 'Decisao', nextId: 'f5', responsavel: 'Mecânico' },
        { id: 'f5', titulo: 'Iniciar Produção', tipo: 'Fim', responsavel: 'Costureira' }
      ],
      cronograma: [
        { id: 'c1', tarefa: 'Mapeamento As-Is com Filmagem', etapa: 'VSM (Mapeamento do Fluxo de Valor)', responsavel: 'supervisor.costura@vickytex.com.br', dataInicio: '2026-05-15', dataFim: '2026-05-30', status: 'Concluido' },
        { id: 'c2', tarefa: 'Desenvolvimento de Suportes Rápidos', etapa: 'Redução de Desperdícios', responsavel: 'carlos.lean@vickytex.com.br' as any, dataInicio: '2026-06-01', dataFim: '2026-06-15', status: 'Concluido' },
        { id: 'c3', tarefa: 'Treinamento de SMED Prático', etapa: 'Fluxo Contínuo', responsavel: 'supervisor.costura@vickytex.com.br', dataInicio: '2026-06-20', dataFim: '2026-07-10', status: 'Em Andamento' }
      ],
      evidencias: [],
      etapas: [
        { nome: 'VSM (Mapeamento do Fluxo de Valor)', status: 'Concluido', dataConclusao: '2026-05-30' },
        { nome: 'Redução de Desperdícios', status: 'Concluido', dataConclusao: '2026-06-15' },
        { nome: 'Fluxo Contínuo', status: 'Em Andamento' },
        { nome: 'Puxar Produção', status: 'Pendente' },
        { nome: 'Perfeição / Kaizen', status: 'Pendente' }
      ]
    },
    criadoPor: 'qualidade@vickytex.com.br',
    criadoEm: '2026-05-15T08:00:00.000Z',
    atualizadoEm: '2026-07-10T14:30:00.000Z'
  }
];

const INITIAL_CEO_IDEAS: SugestaoCEO[] = [
  {
    id: 'idea-ceo-1',
    codigo: 'SUG-CEO-2026-001',
    titulo: 'Organização Visual de Linhas de Costura por Código de Cores',
    descricao: 'Utilizar etiquetas coloridas nos cones de linha e suportes na máquina para garantir que a cor correta do fio seja abastecida, evitando retrabalho por cores incorretas.',
    setor: 'Costura' as any,
    autor: 'colaborador.costura@vickytex.com.br',
    dataSubmissao: '2026-06-10',
    status: 'Aprovada',
    avaliacaoComite: 'Ideia excelente e de baixo custo. Será integrada a um plano de ação 5S.',
    notaImpacto: 4,
    notaFacilidade: 5,
    criadoEm: '2026-06-10T10:00:00.000Z'
  }
];

class CEOProjectsRepositoryClass extends BaseRepository<ProjetoCEO> {
  protected collectionName = 'ceo_projects';

  protected getLocalData(): ProjetoCEO[] {
    const saved = localStorage.getItem('sgq_vickytex_ceo_projects');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.map((p: any) => ({
          ...p,
          ferramentas: p.ferramentas || getDefaultFerramentas(p.metodologia || 'Projeto Personalizado')
        }));
      } catch (e) {
        console.error('Failed to parse CEO local projects', e);
      }
    }
    const isDemoMode = import.meta.env.VITE_DEMO_MODE === 'true';
    return isDemoMode ? INITIAL_CEO_PROJECTS : [];
  }

  protected saveLocalData(data: ProjetoCEO[]): void {
    localStorage.setItem('sgq_vickytex_ceo_projects', JSON.stringify(data));
  }

  protected mapRecord(rec: any): ProjetoCEO {
    const met = rec.metodologia || 'Projeto Personalizado';
    let ferramentasObj = getDefaultFerramentas(met);
    if (rec.ferramentas) {
      try {
        ferramentasObj = typeof rec.ferramentas === 'string' ? JSON.parse(rec.ferramentas) : rec.ferramentas;
      } catch (e) {
        console.error('Error parsing ferramentas json', e);
      }
    }

    return {
      id: rec.id,
      codigo: rec.codigo,
      titulo: rec.titulo,
      descricao: rec.descricao,
      setor: rec.sector || rec.setor,
      lider: rec.lider,
      patrocinador: rec.patrocinador,
      status: rec.status,
      dataInicio: rec.data_inicio || rec.dataInicio,
      dataFimPlanejada: rec.data_fim_planejada || rec.dataFimPlanejada,
      dataFimReal: rec.data_fim_real || rec.dataFimReal,
      metodologia: met,
      investimento: rec.investimento || 0,
      retornoEsperado: rec.retorno_esperado || rec.retornoEsperado || 0,
      retornoReal: rec.retorno_real || rec.retornoReal,
      indicadoresImpactados: rec.indicadores_impactados || rec.indicadoresImpactados || [],
      acoesRealizadas: rec.acoes_realizadas || rec.acoesRealizadas || [],
      documentosVinculados: rec.documentos_vinculados || rec.documentosVinculados || [],
      auditoriasVinculadas: rec.auditorias_vinculadas || rec.auditoriasVinculadas || [],
      ferramentas: ferramentasObj,
      criadoPor: rec.criado_por || rec.criadoPor || '',
      criadoEm: rec.createdAt || rec.created || rec.criadoEm || new Date().toISOString(),
      atualizadoEm: rec.updatedAt || rec.updated || rec.atualizadoEm || new Date().toISOString()
    };
  }

  protected mapToPayload(data: Partial<ProjetoCEO>): any {
    const payload: any = {
      codigo: data.codigo,
      titulo: data.titulo,
      descricao: data.descricao,
      sector: data.setor,
      lider: data.lider,
      patrocinador: data.patrocinador,
      status: data.status,
      data_inicio: data.dataInicio,
      data_fim_planejada: data.dataFimPlanejada,
      data_fim_real: data.dataFimReal,
      metodologia: data.metodologia,
      investimento: data.investimento,
      retorno_esperado: data.retornoEsperado,
      retorno_real: data.retornoReal,
      indicadores_impactados: data.indicadoresImpactados,
      acoes_realizadas: data.acoesRealizadas,
      documentos_vinculados: data.documentosVinculados,
      auditorias_vinculadas: data.auditoriasVinculadas,
      ferramentas: typeof data.ferramentas === 'object' ? JSON.stringify(data.ferramentas) : data.ferramentas,
      criado_por: data.criadoPor
    };

    Object.keys(payload).forEach(key => payload[key] === undefined && delete payload[key]);
    return payload;
  }

  protected getSearchFilter(query: string): string {
    return `codigo ~ "${query}" || titulo ~ "${query}" || sector ~ "${query}" || lider ~ "${query}"`;
  }

  protected localSearchMatch(item: ProjetoCEO, query: string): boolean {
    const q = query.toLowerCase();
    return (
      (item.codigo || '').toLowerCase().includes(q) ||
      (item.titulo || '').toLowerCase().includes(q) ||
      (item.setor || '').toLowerCase().includes(q) ||
      (item.lider || '').toLowerCase().includes(q)
    );
  }
}

class CEOSugestoesRepositoryClass extends BaseRepository<SugestaoCEO> {
  protected collectionName = 'ceo_ideas';

  protected getLocalData(): SugestaoCEO[] {
    const saved = localStorage.getItem('sgq_vickytex_ceo_ideas');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return [];
      }
    }
    const isDemoMode = import.meta.env.VITE_DEMO_MODE === 'true';
    return isDemoMode ? INITIAL_CEO_IDEAS : [];
  }

  protected saveLocalData(data: SugestaoCEO[]): void {
    localStorage.setItem('sgq_vickytex_ceo_ideas', JSON.stringify(data));
  }

  protected mapRecord(rec: any): SugestaoCEO {
    return {
      id: rec.id,
      codigo: rec.codigo,
      titulo: rec.titulo,
      descricao: rec.descricao,
      setor: rec.sector || rec.setor,
      autor: rec.autor,
      dataSubmissao: rec.data_submissao || rec.dataSubmissao,
      status: rec.status,
      avaliacaoComite: rec.avaliacao_comite || rec.avaliacaoComite,
      notaImpacto: rec.nota_impacto ?? rec.notaImpacto,
      notaFacilidade: rec.nota_facilidade ?? rec.notaFacilidade,
      projetoId: rec.projeto_id || rec.projetoId,
      planoAcaoId: rec.plano_acao_id || rec.planoAcaoId,
      criadoEm: rec.createdAt || rec.created || rec.criadoEm || new Date().toISOString()
    };
  }

  protected mapToPayload(data: Partial<SugestaoCEO>): any {
    const payload: any = {
      codigo: data.codigo,
      titulo: data.titulo,
      descricao: data.descricao,
      sector: data.setor,
      autor: data.autor,
      data_submissao: data.dataSubmissao,
      status: data.status,
      avaliacao_comite: data.avaliacaoComite,
      nota_impacto: data.notaImpacto,
      nota_facilidade: data.notaFacilidade,
      projeto_id: data.projetoId,
      plano_acao_id: data.planoAcaoId
    };

    Object.keys(payload).forEach(key => payload[key] === undefined && delete payload[key]);
    return payload;
  }

  protected getSearchFilter(query: string): string {
    return `codigo ~ "${query}" || titulo ~ "${query}" || sector ~ "${query}" || autor ~ "${query}"`;
  }

  protected localSearchMatch(item: SugestaoCEO, query: string): boolean {
    const q = query.toLowerCase();
    return (
      (item.codigo || '').toLowerCase().includes(q) ||
      (item.titulo || '').toLowerCase().includes(q) ||
      (item.setor || '').toLowerCase().includes(q) ||
      (item.autor || '').toLowerCase().includes(q)
    );
  }
}

export const CEOProjectsRepository = new CEOProjectsRepositoryClass();
export const CEOSugestoesRepository = new CEOSugestoesRepositoryClass();
