/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Trophy, 
  Award, 
  Star, 
  Flame, 
  Zap, 
  Users, 
  CheckCircle2, 
  Clock, 
  TrendingUp, 
  Plus, 
  ChevronRight, 
  Medal,
  Gem,
  BookOpen,
  Pencil,
  Settings,
  Trash2,
  X,
  Save,
  ShieldCheck,
  RotateCcw,
  Undo2,
  HelpCircle,
  Lightbulb,
  FileCheck,
  ClipboardList,
  GraduationCap,
  Sliders,
  ChevronDown,
  Info
} from 'lucide-react';
import { ProjetoCEO, SugestaoCEO } from '../../types/ceo';
import { Treinamento } from '../../types/training';
import { UserAccount } from '../../types/user';
import { useAuth } from '../../contexts/AuthContext';
import { ConfirmModal } from '../common/ConfirmModal';
import { INITIAL_USER_ACCOUNTS } from '../../utils/mockData';
import { INITIAL_TREINAMENTOS } from '../Treinamentos';
import { SystemSettingsRepository } from '../../services/database/repositories/systemSettings.repository';
import { TrainingRepository } from '../../services/database/repositories/training.repository';
import { UserRepository } from '../../services/database/repositories/user.repository';

interface GamificacaoCEOProps {
  projects: ProjetoCEO[];
  suggestions: SugestaoCEO[];
}

export interface ItemAuditoriaPontuacao {
  id: string;
  origem: 'Treinamento' | 'Ideia Submetida' | 'Ideia Aprovada' | 'Liderança de Projeto' | 'Projeto Concluído' | 'Etapa/Fase Concluída' | 'Membro de Equipe' | 'Tarefa do Cronograma' | 'Ajuste Manual / Bônus';
  titulo: string;
  detalhe?: string;
  pontos: number;
  data?: string;
  categoria: 'treinamentos' | 'ideias' | 'projetos' | 'ajustes';
}

export interface DetalhamentoPontos {
  treinamentos: number;
  ideiasSubmetidas: number;
  ideiasAprovadas: number;
  projetosLideranca: number;
  projetosConcluidos: number;
  etapasConcluidas: number;
  equipeProjetos: number;
  tarefasCronograma: number;
  ajusteManual: number;
  itens: ItemAuditoriaPontuacao[];
}

interface ColaboradorRank {
  nome: string;
  email: string;
  pontos: number;
  projetosAtivos: number;
  projetosConcluidos: number;
  ideiasSubmetidas: number;
  ideiasAprovadas: number;
  tarefasConcluidas: number;
  horasTreinamento: number;
  belt: 'Yellow Belt' | 'Green Belt' | 'Black Belt' | 'Master Black Belt' | 'Lean Practitioner';
  medalhas: string[];
  detalhamento: DetalhamentoPontos;
}

export const GamificacaoCEO: React.FC<GamificacaoCEOProps> = ({ projects, suggestions }) => {
  const { user } = useAuth();
  const [rankingList, setRankingList] = useState<ColaboradorRank[]>([]);
  const [dbTrainings, setDbTrainings] = useState<Treinamento[]>([]);
  const [dbUsers, setDbUsers] = useState<UserAccount[]>([]);
  const [logHoursModalOpen, setLogHoursModalOpen] = useState(false);
  const [trainingUserEmail, setTrainingUserEmail] = useState(user?.email || '');
  const [trainingUserName, setTrainingUserName] = useState(user?.name || '');
  const [trainingHoursInput, setTrainingHoursInput] = useState<number>(8);
  const [trainingTopic, setTrainingTopic] = useState('Fundamentos de Lean Manufacturing e Mapeamento VSM');
  const [loggedTrainings, setLoggedTrainings] = useState<any[]>(() => {
    const saved = localStorage.getItem('sgq_vickytex_ceo_training_logs');
    return saved ? JSON.parse(saved) : [];
  });

  // Estado para visualização do extrato / auditoria de pontuação detalhada
  const [selectedUserForAudit, setSelectedUserForAudit] = useState<ColaboradorRank | null>(null);
  const [auditFilterCategory, setAuditFilterCategory] = useState<'all' | 'treinamentos' | 'ideias' | 'projetos' | 'ajustes'>('all');

  // Manual adjustments state for Leaderboard Maintenance
  const [manualAdjustments, setManualAdjustments] = useState<Record<string, { pointsBonus: number; beltOverride?: string; customMedal?: string; reason?: string }>>(() => {
    const saved = localStorage.getItem('sgq_vickytex_ceo_gamification_adjustments');
    return saved ? JSON.parse(saved) : {};
  });

  // Zeroed scores state e reset timestamp para controle rigoroso do ciclo
  const [isScoresZeroed, setIsScoresZeroed] = useState<boolean>(() => {
    return localStorage.getItem('sgq_vickytex_ceo_scores_zeroed') === 'true';
  });
  const [resetTimestamp, setResetTimestamp] = useState<number>(() => {
    const saved = localStorage.getItem('sgq_vickytex_ceo_reset_timestamp');
    return saved ? Number(saved) : 0;
  });
  const [previousResetTimestamp, setPreviousResetTimestamp] = useState<number>(() => {
    const saved = localStorage.getItem('sgq_vickytex_ceo_prev_reset_timestamp');
    return saved ? Number(saved) : 0;
  });
  const [isZeroScoresModalOpen, setIsZeroScoresModalOpen] = useState(false);
  const [isRestoreScoresModalOpen, setIsRestoreScoresModalOpen] = useState(false);
  const [isUndoResetModalOpen, setIsUndoResetModalOpen] = useState(false);

  const [maintenanceModalOpen, setMaintenanceModalOpen] = useState(false);
  const [selectedUserForMaint, setSelectedUserForMaint] = useState<string>('');
  const [maintPointsBonus, setMaintPointsBonus] = useState<number>(0);
  const [maintBeltOverride, setMaintBeltOverride] = useState<string>('Auto');
  const [maintCustomMedal, setMaintCustomMedal] = useState<string>('');
  const [maintReason, setMaintReason] = useState<string>('');

  // Subscrição onSnapshot em tempo real no Firestore para sincronizar Leaderboard, Treinamentos e Usuários
  useEffect(() => {
    const unsubSettings = SystemSettingsRepository.subscribe((records) => {
      const logsDoc = records.find(r => r.id === 'sgq_vickytex_ceo_training_logs');
      if (logsDoc && Array.isArray(logsDoc.items)) {
        setLoggedTrainings(logsDoc.items);
      }

      const adjDoc = records.find(r => r.id === 'sgq_vickytex_ceo_gamification_adjustments');
      if (adjDoc && adjDoc.data) {
        setManualAdjustments(adjDoc.data);
      }

      const zeroDoc = records.find(r => r.id === 'sgq_vickytex_ceo_scores_zeroed');
      if (zeroDoc && zeroDoc.data !== undefined) {
        setIsScoresZeroed(Boolean(zeroDoc.data.zeroed));
        setResetTimestamp(Number(zeroDoc.data.timestamp || 0));
        if (zeroDoc.data.previousTimestamp !== undefined) {
          setPreviousResetTimestamp(Number(zeroDoc.data.previousTimestamp || 0));
        }
      }
    });

    const unsubTrainings = TrainingRepository.subscribe((items) => {
      if (Array.isArray(items)) {
        if (items.length > 0) {
          setDbTrainings(items);
        } else {
          // Se o banco estiver sem registros de treinamento, usar os treinamentos iniciais padrão
          setDbTrainings(INITIAL_TREINAMENTOS);
        }
      }
    });

    const unsubUsers = UserRepository.subscribe((items) => {
      if (Array.isArray(items) && items.length > 0) {
        setDbUsers(items);
      }
    });

    return () => {
      unsubSettings();
      unsubTrainings();
      unsubUsers();
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('sgq_vickytex_ceo_gamification_adjustments', JSON.stringify(manualAdjustments));
  }, [manualAdjustments]);

  useEffect(() => {
    localStorage.setItem('sgq_vickytex_ceo_scores_zeroed', isScoresZeroed ? 'true' : 'false');
    if (resetTimestamp) {
      localStorage.setItem('sgq_vickytex_ceo_reset_timestamp', resetTimestamp.toString());
    } else {
      localStorage.removeItem('sgq_vickytex_ceo_reset_timestamp');
    }
    if (previousResetTimestamp) {
      localStorage.setItem('sgq_vickytex_ceo_prev_reset_timestamp', previousResetTimestamp.toString());
    } else {
      localStorage.removeItem('sgq_vickytex_ceo_prev_reset_timestamp');
    }
  }, [isScoresZeroed, resetTimestamp, previousResetTimestamp]);

  // Recalculate ranking whenever projects, suggestions, trainings, or logged trainings change
  useEffect(() => {
    const calculateRankings = () => {
      const userMap = new Map<string, {
        nome: string;
        email: string;
        projetosAtivos: number;
        projetosConcluidos: number;
        ideiasSubmetidas: number;
        ideiasAprovadas: number;
        tarefasConcluidas: number;
        horasTreinamento: number;
        pontos: number;
        medalhas: Set<string>;
        detalhamento: DetalhamentoPontos;
      }>();

      const normalizeEmail = (em: string) => (em || '').trim().toLowerCase();
      const normalizeText = (txt: string) => (txt || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLowerCase();

      const createEmptyDetalhamento = (): DetalhamentoPontos => ({
        treinamentos: 0,
        ideiasSubmetidas: 0,
        ideiasAprovadas: 0,
        projetosLideranca: 0,
        projetosConcluidos: 0,
        etapasConcluidas: 0,
        equipeProjetos: 0,
        tarefasCronograma: 0,
        ajusteManual: 0,
        itens: []
      });

      // 1. Incluir os usuários cadastrados (dbUsers ou fallback INITIAL_USER_ACCOUNTS)
      const allRegisteredUsers = (dbUsers && dbUsers.length > 0) ? dbUsers : INITIAL_USER_ACCOUNTS;
      allRegisteredUsers.forEach(acc => {
        if (acc.email) {
          const norm = normalizeEmail(acc.email);
          if (norm && !userMap.has(norm)) {
            userMap.set(norm, {
              nome: acc.name || acc.email.split('@')[0],
              email: acc.email.trim(),
              projetosAtivos: 0,
              projetosConcluidos: 0,
              ideiasSubmetidas: 0,
              ideiasAprovadas: 0,
              tarefasConcluidas: 0,
              horasTreinamento: 0,
              pontos: 0,
              medalhas: new Set<string>(),
              detalhamento: createEmptyDetalhamento()
            });
          }
        }
      });

      // Adicionar o usuário logado se ainda não estiver na lista
      if (user && user.email) {
        const norm = normalizeEmail(user.email);
        if (norm && !userMap.has(norm)) {
          userMap.set(norm, {
            nome: user.name || user.email.split('@')[0],
            email: user.email.trim(),
            projetosAtivos: 0,
            projetosConcluidos: 0,
            ideiasSubmetidas: 0,
            ideiasAprovadas: 0,
            tarefasConcluidas: 0,
            horasTreinamento: 0,
            pontos: 0,
            medalhas: new Set<string>(),
            detalhamento: createEmptyDetalhamento()
          });
        }
      }

      // Localizador inteligente: SOMENTE encontra usuários cadastrados no userMap, NUNCA cria usuários fantasmas
      const findRegisteredUser = (input?: string) => {
        if (!input) return null;
        const rawInput = input.trim();
        if (!rawInput) return null;

        // Se for e-mail direto
        const norm = normalizeEmail(rawInput);
        if (userMap.has(norm)) return userMap.get(norm)!;

        const lowerInput = rawInput.toLowerCase();
        const normInput = normalizeText(rawInput);

        // 1. Match exato pelo prefixo do e-mail (ex: "qualidade" -> "qualidade@vickytex.com.br")
        for (const [key, val] of userMap.entries()) {
          const emailPrefix = key.split('@')[0].toLowerCase();
          if (emailPrefix === lowerInput || normalizeText(emailPrefix) === normInput) return val;
        }

        // 2. Match exato por nome completo cadastrado
        for (const val of userMap.values()) {
          if (val.nome.trim().toLowerCase() === lowerInput || normalizeText(val.nome) === normInput) return val;
        }

        // 3. Match por email sem domínio se input for um email ou login
        for (const val of userMap.values()) {
          if (val.email.toLowerCase() === lowerInput || normalizeText(val.email) === normInput) return val;
        }

        // 4. Match seguro por primeiro nome ou partes de nome caso não haja ambiguidade
        const matchingCandidates: typeof userMap extends Map<any, infer V> ? V[] : never = [];
        for (const val of userMap.values()) {
          const valNormName = normalizeText(val.nome);
          const valFirst = valNormName.split(' ')[0];
          const inputFirst = normInput.split(' ')[0];

          if (valFirst && valFirst.length >= 3 && (valFirst === inputFirst || valNormName.includes(normInput) || normInput.includes(valNormName))) {
            matchingCandidates.push(val);
          }
        }
        if (matchingCandidates.length === 1) {
          return matchingCandidates[0];
        }

        return null;
      };

      // Se as pontuações foram zeradas e não há timestamp ou está explicitamente congelado
      if (!isScoresZeroed) {
        // Função utilitária para verificar se o item pertence ao ciclo atual (após resetTimestamp se existir)
        const isItemFromCurrentCycle = (dateStr?: string, createdStr?: string) => {
          if (!resetTimestamp || resetTimestamp === 0) return true;
          try {
            if (createdStr) {
              const itemTime = new Date(createdStr).getTime();
              if (!isNaN(itemTime)) return itemTime >= resetTimestamp;
            }
            if (dateStr) {
              const itemTime = new Date(dateStr).getTime();
              if (!isNaN(itemTime)) return itemTime >= resetTimestamp;
            }
          } catch (e) {
            // Em caso de erro, ignorar
          }
          return false;
        };

        // 2. Add real trainings from TrainingRepository (ISO 7.2 & Treinamentos), desconsiderando duplicados criados via CEO logs
        dbTrainings.forEach(tr => {
          // Se for gerado pelo log do CEO ou CAP-CEO-LEAN, ignorar aqui para pontuar apenas uma vez via loggedTrainings
          if (tr.id?.startsWith('tr-ceo-') || tr.codigo?.startsWith('TRE-CEO-') || tr.documentoId === 'CAP-CEO-LEAN') {
            return;
          }

          // Se houver ciclo zerado anterior, apenas considerar treinamentos deste novo ciclo
          if (resetTimestamp > 0 && !isItemFromCurrentCycle(tr.dataTreinamento, (tr as any).criadoEm)) {
            return;
          }

          const hours = Number(tr.duracaoHoras || 1);
          if (tr.status === 'Realizado') {
            const pts = hours * 5;
            // Instrutor
            if (tr.instrutor) {
              const u = findRegisteredUser(tr.instrutor);
              if (u) {
                u.horasTreinamento += hours;
                u.pontos += pts;
                u.medalhas.add('Instrutor Lean');
                u.detalhamento.treinamentos += pts;
                u.detalhamento.itens.push({
                  id: `tr-inst-${tr.id}`,
                  origem: 'Treinamento',
                  titulo: tr.titulo || 'Treinamento Realizado',
                  detalhe: `Instrutor • ${hours}h de capacitação (${hours} × 5 pts)`,
                  pontos: pts,
                  data: tr.dataTreinamento,
                  categoria: 'treinamentos'
                });
              }
            }

            // Participantes (set para evitar duplicidade no mesmo treinamento)
            const uniqueParticipants = Array.from(new Set(tr.participantes || []));
            uniqueParticipants.forEach(part => {
              if (!part) return;
              const u = findRegisteredUser(part);
              if (u) {
                u.horasTreinamento += hours;
                u.pontos += pts;
                u.medalhas.add('Estudioso Lean');
                u.detalhamento.treinamentos += pts;
                u.detalhamento.itens.push({
                  id: `tr-part-${tr.id}-${u.email}`,
                  origem: 'Treinamento',
                  titulo: tr.titulo || 'Treinamento Participado',
                  detalhe: `Participante • ${hours}h de capacitação (${hours} × 5 pts)`,
                  pontos: pts,
                  data: tr.dataTreinamento,
                  categoria: 'treinamentos'
                });
              }
            });
          }
        });

        // 3. Add logged training hours from CEO Training Logs
        loggedTrainings.forEach(log => {
          if (!log) return;
          // Se houver ciclo zerado anterior, apenas considerar logs de treinamento do ciclo atual
          if (resetTimestamp > 0 && !isItemFromCurrentCycle(log.data, log.criadoEm || (log.id?.startsWith('log-') ? new Date(Number(log.id.replace('log-', ''))).toISOString() : undefined))) {
            return;
          }

          const u = (log.email ? findRegisteredUser(log.email) : null) || (log.nome ? findRegisteredUser(log.nome) : null);
          if (u) {
            const h = Number(log.horas || 0);
            const pts = h * 5; // 5 pts por hora de capacitação
            u.horasTreinamento += h;
            u.pontos += pts;
            u.medalhas.add('Estudioso Lean');
            u.detalhamento.treinamentos += pts;
            u.detalhamento.itens.push({
              id: log.id || `log-${Math.random()}`,
              origem: 'Treinamento',
              titulo: log.tema || 'Capacitação Lean Lançada',
              detalhe: `Registro Direto • ${h}h de capacitação (${h} × 5 pts)`,
              pontos: pts,
              data: log.data,
              categoria: 'treinamentos'
            });
          }
        });

        // 4. Map suggestions (Banco de Ideias)
        suggestions.forEach(sug => {
          if (!sug.autor) return;
          // Se houver ciclo zerado anterior, apenas considerar ideias submetidas no novo ciclo
          if (resetTimestamp > 0 && !isItemFromCurrentCycle(sug.dataSubmissao, sug.criadoEm)) {
            return;
          }

          const u = findRegisteredUser(sug.autor);

          if (u) {
            u.ideiasSubmetidas += 1;
            u.pontos += 15; // 15 pts per suggestion submitted
            u.detalhamento.ideiasSubmetidas += 15;
            u.detalhamento.itens.push({
              id: `sug-sub-${sug.id}`,
              origem: 'Ideia Submetida',
              titulo: sug.titulo || 'Sugestão de Melhoria',
              detalhe: `Submissão ao Banco de Ideias (${sug.setor || 'Geral'})`,
              pontos: 15,
              data: sug.dataSubmissao,
              categoria: 'ideias'
            });

            if (sug.status === 'Aprovada' || sug.status === 'Em Implantação' || sug.status === 'Concluída') {
              u.ideiasAprovadas += 1;
              u.pontos += 50; // 50 pts per approved idea
              u.medalhas.add('Mente Inovadora');
              u.detalhamento.ideiasAprovadas += 50;
              u.detalhamento.itens.push({
                id: `sug-app-${sug.id}`,
                origem: 'Ideia Aprovada',
                titulo: sug.titulo || 'Sugestão Aprovada',
                detalhe: `Status: ${sug.status} • Impacto/Viabilidade Validada (+50 pts)`,
                pontos: 50,
                data: sug.dataSubmissao,
                categoria: 'ideias'
              });
            }
          }
        });

        // 5. Map projects (Projetos de Melhoria A3 / DMAIC / Kaizen)
        projects.forEach(proj => {
          // Se houver ciclo zerado anterior, apenas considerar projetos do novo ciclo
          if (resetTimestamp > 0 && !isItemFromCurrentCycle(proj.dataInicio, proj.criadoEm)) {
            return;
          }

          // Project leader
          if (proj.lider) {
            const u = findRegisteredUser(proj.lider);

            if (u) {
              if (proj.status === 'Concluído') {
                u.projetosConcluidos += 1;
                u.pontos += 200; // 200 pts per completed project
                u.medalhas.add('Campeão Kaizen');
                u.detalhamento.projetosConcluidos += 200;
                u.detalhamento.itens.push({
                  id: `proj-concl-${proj.id}`,
                  origem: 'Projeto Concluído',
                  titulo: proj.titulo || 'Projeto de Melhoria',
                  detalhe: `Líder do Projeto • Metodologia ${proj.metodologia} finalizada (+200 pts)`,
                  pontos: 200,
                  data: proj.dataFimPrevista || proj.dataInicio,
                  categoria: 'projetos'
                });
              } else if (proj.status === 'Em Execução' || proj.status === 'Planejado') {
                u.projetosAtivos += 1;
                u.pontos += 50; // 50 pts for active leading
                u.detalhamento.projetosLideranca += 50;
                u.detalhamento.itens.push({
                  id: `proj-lead-${proj.id}`,
                  origem: 'Liderança de Projeto',
                  titulo: proj.titulo || 'Projeto em Andamento',
                  detalhe: `Líder Ativo • Metodologia ${proj.metodologia} (${proj.status}) (+50 pts)`,
                  pontos: 50,
                  data: proj.dataInicio,
                  categoria: 'projetos'
                });
              }

              // Stage completion counts
              const completedStages = proj.ferramentas?.etapas?.filter(e => e.status === 'Concluido') || [];
              completedStages.forEach((stage, sIdx) => {
                u.pontos += 30; // 30 pts per completed gate/stage
                u.detalhamento.etapasConcluidas += 30;
                u.detalhamento.itens.push({
                  id: `proj-stage-${proj.id}-${sIdx}`,
                  origem: 'Etapa/Fase Concluída',
                  titulo: `${proj.titulo}: Etapa "${stage.nome}"`,
                  detalhe: `Tollgate/Fase concluída no projeto ${proj.metodologia} (+30 pts)`,
                  pontos: 30,
                  data: stage.dataFim || proj.dataInicio,
                  categoria: 'projetos'
                });
              });
            }
          }

          // Project team members
          proj.ferramentas?.equipe?.forEach((m, mIdx) => {
            if (!m.email && !m.nome) return;
            const u = findRegisteredUser(m.email) || findRegisteredUser(m.nome);
            if (u) {
              u.pontos += 30; // 30 points for team collaboration
              u.medalhas.add('Trabalho em Equipe');
              u.detalhamento.equipeProjetos += 30;
              u.detalhamento.itens.push({
                id: `proj-team-${proj.id}-${mIdx}-${u.email}`,
                origem: 'Membro de Equipe',
                titulo: proj.titulo || 'Equipe de Projeto',
                detalhe: `Membro/Colaborador na equipe de ${proj.metodologia} • Função: ${m.funcao || 'Membro'} (+30 pts)`,
                pontos: 30,
                data: proj.dataInicio,
                categoria: 'projetos'
              });
            }
          });

          // Cronograma tasks
          proj.ferramentas?.cronograma?.forEach((task, tIdx) => {
            if (task.status === 'Concluido' && task.responsavel) {
              const u = findRegisteredUser(task.responsavel);
              if (u) {
                u.tarefasConcluidas += 1;
                u.pontos += 15; // 15 pts per finished task
                u.detalhamento.tarefasCronograma += 15;
                u.detalhamento.itens.push({
                  id: `proj-task-${proj.id}-${tIdx}`,
                  origem: 'Tarefa do Cronograma',
                  titulo: `${proj.titulo}: ${task.atividade || 'Atividade Concluída'}`,
                  detalhe: `Entrega de atividade no cronograma do projeto (+15 pts)`,
                  pontos: 15,
                  data: task.dataFim || proj.dataInicio,
                  categoria: 'projetos'
                });
              }
            }
          });
        });
      }

      // Convert map to list, assign belt, and sort
      const list: ColaboradorRank[] = Array.from(userMap.values()).map(u => {
        let belt: 'Yellow Belt' | 'Green Belt' | 'Black Belt' | 'Master Black Belt' | 'Lean Practitioner' = 'Lean Practitioner';
        
        // Apply manual adjustments if any
        const norm = normalizeEmail(u.email);
        const adj = manualAdjustments[u.email] || manualAdjustments[norm];
        const bonus = adj?.pointsBonus || 0;
        const totalPts = Math.max(0, u.pontos + bonus);

        if (bonus !== 0) {
          u.detalhamento.ajusteManual = bonus;
          u.detalhamento.itens.push({
            id: `adj-${u.email}`,
            origem: 'Ajuste Manual / Bônus',
            titulo: bonus > 0 ? `Bônus Manual (+${bonus} pts)` : `Ajuste Manual (${bonus} pts)`,
            detalhe: adj?.reason || 'Ajuste de pontuação efetuado pelo administrador do sistema',
            pontos: bonus,
            categoria: 'ajustes'
          });
        }

        if (totalPts >= 600 || u.projetosConcluidos >= 2) {
          belt = 'Master Black Belt';
          u.medalhas.add('Mestre de Processos');
        } else if (totalPts >= 350) {
          belt = 'Black Belt';
          u.medalhas.add('Expert Lean');
        } else if (totalPts >= 180) {
          belt = 'Green Belt';
          u.medalhas.add('Executor Kaizen');
        } else if (totalPts >= 60) {
          belt = 'Yellow Belt';
        }

        if (adj?.beltOverride && adj.beltOverride !== 'Auto') {
          belt = adj.beltOverride as any;
        }

        if (adj?.customMedal) {
          u.medalhas.add(adj.customMedal);
        }

        return {
          ...u,
          pontos: totalPts,
          belt,
          medalhas: Array.from(u.medalhas),
          detalhamento: u.detalhamento
        };
      });

      // Sort by points descending
      list.sort((a, b) => b.pontos - a.pontos);
      setRankingList(list);
    };

    calculateRankings();
  }, [projects, suggestions, dbTrainings, loggedTrainings, dbUsers, manualAdjustments, isScoresZeroed, resetTimestamp, user]);

  const handleConfirmResetScores = () => {
    const now = Date.now();
    const prev = resetTimestamp;
    setPreviousResetTimestamp(prev);
    setIsScoresZeroed(true);
    setResetTimestamp(now);
    setManualAdjustments({});
    localStorage.removeItem('sgq_vickytex_ceo_gamification_adjustments');
    localStorage.setItem('sgq_vickytex_ceo_scores_zeroed', 'true');
    localStorage.setItem('sgq_vickytex_ceo_reset_timestamp', now.toString());
    if (prev) {
      localStorage.setItem('sgq_vickytex_ceo_prev_reset_timestamp', prev.toString());
    }
    SystemSettingsRepository.create({ id: 'sgq_vickytex_ceo_gamification_adjustments', data: {} }).catch(console.error);
    SystemSettingsRepository.create({ 
      id: 'sgq_vickytex_ceo_scores_zeroed', 
      data: { zeroed: true, timestamp: now, previousTimestamp: prev } 
    }).catch(console.error);
    setIsZeroScoresModalOpen(false);
  };

  const handleUndoResetScores = async () => {
    const restoredTimestamp = previousResetTimestamp || 0;
    setIsScoresZeroed(false);
    setResetTimestamp(restoredTimestamp);
    setPreviousResetTimestamp(0);
    localStorage.setItem('sgq_vickytex_ceo_scores_zeroed', 'false');
    if (restoredTimestamp > 0) {
      localStorage.setItem('sgq_vickytex_ceo_reset_timestamp', restoredTimestamp.toString());
    } else {
      localStorage.removeItem('sgq_vickytex_ceo_reset_timestamp');
    }
    localStorage.removeItem('sgq_vickytex_ceo_prev_reset_timestamp');

    try {
      await SystemSettingsRepository.create({ 
        id: 'sgq_vickytex_ceo_scores_zeroed', 
        data: { zeroed: false, timestamp: restoredTimestamp, previousTimestamp: 0 } 
      });
    } catch (e) {
      console.error('Erro ao desfazer zeramento no Firestore:', e);
    } finally {
      setIsUndoResetModalOpen(false);
    }
  };

  const handleRestoreScores = async () => {
    // Reverter para o ciclo/timestamp anterior (última pontuação obtida antes do zeramento)
    const restoredTimestamp = previousResetTimestamp || 0;
    setIsScoresZeroed(false);
    setResetTimestamp(restoredTimestamp);
    setPreviousResetTimestamp(0);
    localStorage.setItem('sgq_vickytex_ceo_scores_zeroed', 'false');
    if (restoredTimestamp > 0) {
      localStorage.setItem('sgq_vickytex_ceo_reset_timestamp', restoredTimestamp.toString());
    } else {
      localStorage.removeItem('sgq_vickytex_ceo_reset_timestamp');
    }
    localStorage.removeItem('sgq_vickytex_ceo_prev_reset_timestamp');
    
    // Atualizar no Firestore mantendo os logs de treinamento e recuperando as pontuações registradas
    try {
      await SystemSettingsRepository.create({ 
        id: 'sgq_vickytex_ceo_scores_zeroed', 
        data: { zeroed: false, timestamp: restoredTimestamp, previousTimestamp: 0 } 
      });
    } catch (e) {
      console.error('Erro ao restaurar pontuações no Firestore:', e);
    } finally {
      setIsRestoreScoresModalOpen(false);
    }
  };

  const handleLogHours = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trainingUserEmail || !trainingUserName || !trainingTopic) return;

    const numericHours = Number(trainingHoursInput) || 1;

    const newLog = {
      id: `log-${Date.now()}`,
      nome: trainingUserName,
      email: trainingUserEmail,
      horas: numericHours,
      tema: trainingTopic,
      data: new Date().toISOString().split('T')[0]
    };

    const updatedLogs = [newLog, ...loggedTrainings];
    setLoggedTrainings(updatedLogs);
    localStorage.setItem('sgq_vickytex_ceo_training_logs', JSON.stringify(updatedLogs));

    // Se estiver zerado (congelado), reativar o cômputo para este novo ciclo mantendo o filtro a partir da data de zeramento
    if (isScoresZeroed) {
      setIsScoresZeroed(false);
      localStorage.setItem('sgq_vickytex_ceo_scores_zeroed', 'false');
      SystemSettingsRepository.create({ id: 'sgq_vickytex_ceo_scores_zeroed', data: { zeroed: false, timestamp: resetTimestamp } }).catch(console.error);
    }

    // Persistir em Firestore tanto no SystemSettings quanto no TrainingRepository oficial
    try {
      await Promise.all([
        SystemSettingsRepository.create({ id: 'sgq_vickytex_ceo_training_logs', items: updatedLogs }),
        TrainingRepository.create({
          id: `tr-ceo-${Date.now()}`,
          codigo: `TRE-CEO-${Date.now().toString().slice(-4)}`,
          documentoId: 'CAP-CEO-LEAN',
          titulo: trainingTopic,
          dataTreinamento: new Date().toISOString().split('T')[0],
          instrutor: 'Centro de Excelência Operacional (CEO)',
          setor: 'Geral',
          duracaoHoras: numericHours,
          participantes: [trainingUserName, trainingUserEmail],
          status: 'Realizado'
        })
      ]);
    } catch (err) {
      console.error('Falha ao persistir horas de treinamento:', err);
    }

    setLogHoursModalOpen(false);
    setTrainingTopic('Mapeamento de Fluxo de Valor (VSM) Avançado');
  };

  const handleSaveMaintenance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserForMaint) return;

    const updatedAdjustments = {
      ...manualAdjustments,
      [selectedUserForMaint]: {
        pointsBonus: Number(maintPointsBonus),
        beltOverride: maintBeltOverride,
        customMedal: maintCustomMedal.trim() || undefined,
        reason: maintReason.trim() || undefined
      }
    };

    setManualAdjustments(updatedAdjustments);
    SystemSettingsRepository.create({ id: 'sgq_vickytex_ceo_gamification_adjustments', data: updatedAdjustments }).catch(console.error);
    setMaintenanceModalOpen(false);
  };

  const handleResetMaintenance = (email: string) => {
    const updatedAdjustments = { ...manualAdjustments };
    delete updatedAdjustments[email];
    setManualAdjustments(updatedAdjustments);
    SystemSettingsRepository.create({ id: 'sgq_vickytex_ceo_gamification_adjustments', data: updatedAdjustments }).catch(console.error);
  };

  return (
    <div id="gamification-root" className="space-y-6">
      
      {/* 1. Header Hero Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white shadow-lg space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 border border-amber-500/20 text-amber-300">
              <Trophy className="w-3.5 h-3.5" />
              <span>Programa VickyTex de Excelência Operacional</span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-white">
              Gamificação, Reconhecimento e Ranks Belt
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Acumule pontos resolvendo problemas reais de fabricação, implementando Poka-Yokes, reduzindo lead times operacionais, concluindo etapas DMAIC e participando de treinamentos técnicos Lean Seis Sigma.
            </p>
          </div>
          
          <div className="flex items-center gap-3 shrink-0 self-start">
            <button
              onClick={() => {
                if (user) {
                  setTrainingUserEmail(user.email);
                  setTrainingUserName(user.name || '');
                }
                setLogHoursModalOpen(true);
              }}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-xs shadow-md transition-all active:scale-95 flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Lançar Horas de Treinamento</span>
            </button>
          </div>
        </div>

        {/* Secondary Admin Action Toolbar */}
        <div className="pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          <span className="text-slate-400 font-medium text-xs">
            Ações de Gestão do Ranking:
          </span>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => {
                if (rankingList.length > 0) {
                  const firstUser = rankingList[0];
                  setSelectedUserForMaint(firstUser.email);
                  const adj = manualAdjustments[firstUser.email];
                  setMaintPointsBonus(adj?.pointsBonus || 0);
                  setMaintBeltOverride(adj?.beltOverride || 'Auto');
                  setMaintCustomMedal(adj?.customMedal || '');
                  setMaintReason(adj?.reason || '');
                }
                setMaintenanceModalOpen(true);
              }}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium rounded-lg transition-colors flex items-center space-x-1.5"
            >
              <Settings className="w-3.5 h-3.5 text-slate-400" />
              <span>Manutenção do Leaderboard</span>
            </button>

            {previousResetTimestamp > 0 && (
              <button
                onClick={() => setIsUndoResetModalOpen(true)}
                className="px-3 py-1.5 bg-amber-950/60 hover:bg-amber-900/80 text-amber-300 border border-amber-800/50 font-medium rounded-lg transition-colors flex items-center space-x-1.5 animate-pulse"
                title="Reverter o último zeramento e restaurar os pontos e lançamentos do ciclo imediatamente anterior"
              >
                <Undo2 className="w-3.5 h-3.5 text-amber-400" />
                <span>Desfazer Zeramento</span>
              </button>
            )}

            <button
              onClick={() => setIsRestoreScoresModalOpen(true)}
              className="px-3 py-1.5 bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-800/50 font-medium rounded-lg transition-colors flex items-center space-x-1.5"
              title="Recalcular e restaurar pontos automáticos de todos os projetos, ideias e treinamentos"
            >
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              <span>Restaurar Pontuação Automática</span>
            </button>

            <button
              onClick={() => setIsZeroScoresModalOpen(true)}
              className="px-3 py-1.5 bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-800/50 font-medium rounded-lg transition-colors flex items-center space-x-1.5"
              title="Zerar todas as pontuações do leaderboard"
            >
              <RotateCcw className="w-3.5 h-3.5 text-rose-400" />
              <span>Zerar Pontuações</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Leaderboard and Achievements Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEADERBOARD LEADING COMPONENT */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider flex items-center space-x-1.5">
                <Star className="w-4 h-4 text-yellow-500" />
                <span>Leaderboard de Colaboradores (Melhoria Contínua)</span>
              </h3>
              {isScoresZeroed && (
                <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase bg-rose-500/10 text-rose-600 border border-rose-500/20">
                  Pontuações Zeradas (Novo Ciclo)
                </span>
              )}
            </div>

            <div className="space-y-2.5">
              {rankingList.map((rank, index) => {
                const isCurrentUser = rank.email === user?.email;
                const isSelectedForAudit = selectedUserForAudit?.email === rank.email;
                const medalColors = [
                  'bg-yellow-500/10 text-yellow-600', // 1st
                  'bg-slate-300 text-slate-700', // 2nd
                  'bg-amber-600/10 text-amber-700' // 3rd
                ];

                const beltColors = {
                  'Yellow Belt': 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-950/20 dark:text-yellow-400',
                  'Green Belt': 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400',
                  'Black Belt': 'bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-800 dark:text-slate-200',
                  'Master Black Belt': 'bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-950/20 dark:text-indigo-400',
                  'Lean Practitioner': 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950/20 dark:text-blue-400'
                };

                const det = rank.detalhamento || {
                  treinamentos: 0,
                  ideiasSubmetidas: 0,
                  ideiasAprovadas: 0,
                  projetosLideranca: 0,
                  projetosConcluidos: 0,
                  etapasConcluidas: 0,
                  equipeProjetos: 0,
                  tarefasCronograma: 0,
                  ajusteManual: 0,
                  itens: []
                };

                const totalIdeiasPts = (det.ideiasSubmetidas || 0) + (det.ideiasAprovadas || 0);
                const totalProjetosPts = (det.projetosLideranca || 0) + (det.projetosConcluidos || 0) + (det.etapasConcluidas || 0) + (det.equipeProjetos || 0) + (det.tarefasCronograma || 0);

                return (
                  <div 
                    key={rank.email} 
                    className={`p-3.5 border rounded-2xl transition-all ${
                      isSelectedForAudit
                        ? 'border-indigo-500 bg-indigo-50/20 dark:bg-indigo-950/30 ring-2 ring-indigo-500/20 shadow-sm'
                        : isCurrentUser 
                          ? 'border-indigo-400/50 bg-indigo-50/10 dark:bg-indigo-950/20 shadow-xs' 
                          : 'border-slate-100 dark:border-slate-800/80 hover:bg-slate-50/60 dark:hover:bg-slate-800/30'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center space-x-3 min-w-0">
                        {/* Trophy / Position */}
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center font-black font-mono text-xs shrink-0 ${
                          index < 3 ? medalColors[index] : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                        }`}>
                          {index + 1}
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center space-x-2">
                            <span className={`text-xs font-black truncate block ${isCurrentUser ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-800 dark:text-slate-200'}`}>
                              {rank.nome}
                            </span>
                            {isCurrentUser && (
                              <span className="px-1.5 py-0.5 rounded bg-indigo-500 text-white font-black text-[7px] uppercase">Você</span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-400 truncate block">
                            {rank.email} • {rank.projetosConcluidos} Proj. Concluídos • {rank.ideiasAprovadas} Ideias Aprovadas
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3 shrink-0">
                        <span className={`px-2 py-0.5 border rounded-lg text-[8px] font-bold uppercase tracking-wider ${beltColors[rank.belt]}`}>
                          {rank.belt}
                        </span>

                        <div className="text-right">
                          <span className="text-xs font-black text-slate-850 dark:text-slate-100 block font-mono">{rank.pontos} Pts</span>
                          <span className="text-[8px] text-slate-400 uppercase tracking-widest font-bold">Pontuação</span>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            setSelectedUserForAudit(rank);
                            setAuditFilterCategory('all');
                          }}
                          className={`px-2.5 py-1.5 rounded-xl text-[10px] font-extrabold flex items-center space-x-1.5 transition-all border ${
                            isSelectedForAudit
                              ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                              : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-indigo-300 hover:text-indigo-600 dark:hover:text-indigo-400'
                          }`}
                          title="Auditar e conferir extrato detalhado de pontuação por origem"
                        >
                          <Info className="w-3.5 h-3.5" />
                          <span>Auditar Origens</span>
                        </button>
                      </div>
                    </div>

                    {/* Resumo Rápido de Origem de Pontos (Mini Breakdown Bar) */}
                    <div className="mt-3 pt-2.5 border-t border-slate-100/80 dark:border-slate-800/60 flex flex-wrap items-center gap-1.5 text-[9px]">
                      <span className="text-slate-400 font-bold uppercase tracking-wider text-[8px] mr-1">Origens:</span>
                      
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedUserForAudit(rank);
                          setAuditFilterCategory('treinamentos');
                        }}
                        className="px-2 py-0.5 rounded-lg bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 font-bold hover:bg-indigo-500/20 transition-colors flex items-center space-x-1"
                        title="Ver pontos de Treinamentos e Capacitações"
                      >
                        <GraduationCap className="w-2.5 h-2.5" />
                        <span>Treinamentos: {det.treinamentos} pts</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setSelectedUserForAudit(rank);
                          setAuditFilterCategory('ideias');
                        }}
                        className="px-2 py-0.5 rounded-lg bg-amber-500/10 text-amber-700 dark:text-amber-300 font-bold hover:bg-amber-500/20 transition-colors flex items-center space-x-1"
                        title="Ver pontos do Banco de Ideias (Submissões e Aprovações)"
                      >
                        <Lightbulb className="w-2.5 h-2.5" />
                        <span>Ideias: {totalIdeiasPts} pts</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setSelectedUserForAudit(rank);
                          setAuditFilterCategory('projetos');
                        }}
                        className="px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-bold hover:bg-emerald-500/20 transition-colors flex items-center space-x-1"
                        title="Ver pontos de Projetos, Liderança, Etapas e Tarefas"
                      >
                        <FileCheck className="w-2.5 h-2.5" />
                        <span>Projetos & Tarefas: {totalProjetosPts} pts</span>
                      </button>

                      {det.ajusteManual !== 0 && (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedUserForAudit(rank);
                            setAuditFilterCategory('ajustes');
                          }}
                          className={`px-2 py-0.5 rounded-lg font-bold transition-colors flex items-center space-x-1 ${
                            det.ajusteManual > 0
                              ? 'bg-purple-500/10 text-purple-700 dark:text-purple-300 hover:bg-purple-500/20'
                              : 'bg-rose-500/10 text-rose-700 dark:text-rose-300 hover:bg-rose-500/20'
                          }`}
                          title="Ver Ajustes Manuais / Bônus do Administrador"
                        >
                          <Sliders className="w-2.5 h-2.5" />
                          <span>Ajuste Manual: {det.ajusteManual > 0 ? `+${det.ajusteManual}` : det.ajusteManual} pts</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="border-t border-slate-100 dark:border-slate-800 pt-3 mt-4 text-[10px] text-slate-400 text-center font-medium">
            Os pontos são computados em tempo real de acordo com as diretrizes do manual de melhoria contínua ISO 9001:2015.
          </div>
        </div>

        {/* LOGGED TRAINING SUMMARY & RECENT LOGS */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider flex items-center space-x-1.5">
              <BookOpen className="w-4 h-4 text-indigo-600" />
              <span>Log de Capacitações e Treinamentos</span>
            </h3>

            <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
              {loggedTrainings.map((log) => (
                <div key={log.id} className="p-3 border border-slate-100 dark:border-slate-800/80 rounded-xl bg-slate-50/50 dark:bg-slate-950/20 text-xs">
                  <div className="flex justify-between items-start gap-1">
                    <span className="font-bold text-slate-700 dark:text-slate-300 block leading-tight">{log.tema}</span>
                    <span className="px-1.5 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-bold text-[9px] whitespace-nowrap">{log.horas} horas</span>
                  </div>
                  <div className="flex justify-between items-center text-[9px] text-slate-400 mt-2">
                    <span>Participante: <b>{log.nome.split(' ')[0]}</b></span>
                    <span>{log.data}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 bg-indigo-500/5 dark:bg-indigo-500/10 border border-indigo-500/10 rounded-2xl space-y-4">
            <div>
              <span className="text-[10px] font-black uppercase text-indigo-600 dark:text-indigo-400 block mb-2">Como Pontuar (Regras Ativas)</span>
              <ul className="text-[10px] text-slate-600 dark:text-slate-400 space-y-1.5 list-disc pl-3">
                <li>Capacitação Lean / Treinamento: <b>+5 pts/hora</b></li>
                <li>Submeter sugestão ao banco de ideias: <b>+15 pts</b></li>
                <li>Sugestão de melhoria aprovada / implantada: <b>+50 pts</b></li>
                <li>Liderar projeto ativo (Planejado / Execução): <b>+50 pts</b></li>
                <li>Fazer parte da equipe de um projeto: <b>+30 pts</b></li>
                <li>Concluir etapas/tollgates da metodologia: <b>+30 pts/fase</b></li>
                <li>Concluir tarefa do cronograma de melhoria: <b>+15 pts/tarefa</b></li>
                <li>Finalizar com sucesso um projeto CEO: <b>+200 pts</b></li>
              </ul>
            </div>

            <div className="pt-3 border-t border-indigo-500/15 space-y-2">
              <span className="text-[10px] font-black uppercase text-indigo-600 dark:text-indigo-400 block">Níveis de Certificação Belt & Trilha Lean</span>
              <div className="grid grid-cols-1 gap-2 text-[10px]">
                <div className="flex items-start gap-2 bg-white/60 dark:bg-slate-900/60 p-2 rounded-xl border border-slate-200/60 dark:border-slate-800">
                  <span className="px-2 py-0.5 rounded text-[8px] font-black uppercase bg-blue-100 text-blue-800 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 shrink-0">Lean Practitioner (0 - 59 pts)</span>
                  <span className="text-slate-500 dark:text-slate-400 text-[9px] leading-tight">Nível inicial de entrada. Praticante em integração, participação em treinamentos e envio de sugestões.</span>
                </div>
                <div className="flex items-start gap-2 bg-white/60 dark:bg-slate-900/60 p-2 rounded-xl border border-slate-200/60 dark:border-slate-800">
                  <span className="px-2 py-0.5 rounded text-[8px] font-black uppercase bg-yellow-500 text-yellow-950 shrink-0">Yellow Belt (60+ pts)</span>
                  <span className="text-slate-500 dark:text-slate-400 text-[9px] leading-tight">Introdução ao Kaizen, preenchimento de GUT, Pareto e SWOT.</span>
                </div>
                <div className="flex items-start gap-2 bg-white/60 dark:bg-slate-900/60 p-2 rounded-xl border border-slate-200/60 dark:border-slate-800">
                  <span className="px-2 py-0.5 rounded text-[8px] font-black uppercase bg-emerald-500 text-white shrink-0">Green Belt (180+ pts)</span>
                  <span className="text-slate-500 dark:text-slate-400 text-[9px] leading-tight">Liderança de projetos PDCA, mapeamento SIPOC, Ishikawa e 5 Whys.</span>
                </div>
                <div className="flex items-start gap-2 bg-white/60 dark:bg-slate-900/60 p-2 rounded-xl border border-slate-200/60 dark:border-slate-800">
                  <span className="px-2 py-0.5 rounded text-[8px] font-black uppercase bg-slate-900 text-white shrink-0">Black Belt (350+ pts)</span>
                  <span className="text-slate-500 dark:text-slate-400 text-[9px] leading-tight">Liderança avançada DMAIC, cronogramas complexos e redução de tempos.</span>
                </div>
                <div className="flex items-start gap-2 bg-white/60 dark:bg-slate-900/60 p-2 rounded-xl border border-slate-200/60 dark:border-slate-800">
                  <span className="px-2 py-0.5 rounded text-[8px] font-black uppercase bg-indigo-600 text-white shrink-0">Master Black Belt (600+ pts)</span>
                  <span className="text-slate-500 dark:text-slate-400 text-[9px] leading-tight">Análise de ROI, Payback, consolidação de planos e mentoria Lean.</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* 4. Log Hours Modal Form */}
      {logHoursModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl relative space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <Medal className="w-5 h-5 text-indigo-600 animate-pulse" />
                <h3 className="text-xs font-black uppercase text-slate-850 dark:text-slate-100">Lançar Capacitação / Treinamento</h3>
              </div>
              <button 
                onClick={() => setLogHoursModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleLogHours} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Selecionar Colaborador Cadastrado</label>
                <select
                  value={trainingUserEmail}
                  onChange={(e) => {
                    const selectedEmail = e.target.value;
                    setTrainingUserEmail(selectedEmail);
                    const found = dbUsers.find(u => u.email.toLowerCase() === selectedEmail.toLowerCase());
                    if (found) {
                      setTrainingUserName(found.name);
                    } else if (selectedEmail === user?.email) {
                      setTrainingUserName(user.name);
                    }
                  }}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 font-bold"
                >
                  <option value="">-- Escolha um colaborador --</option>
                  {user && (
                    <option value={user.email}>{user.name} ({user.email}) - Usuário Atual</option>
                  )}
                  {dbUsers.map(u => (
                    u.email !== user?.email ? (
                      <option key={u.id} value={u.email}>{u.name} ({u.email})</option>
                    ) : null
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Nome Confirmado</label>
                  <input 
                    type="text" 
                    value={trainingUserName}
                    onChange={(e) => setTrainingUserName(e.target.value)}
                    placeholder="Nome Completo"
                    required
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Email Confirmado</label>
                  <input 
                    type="email" 
                    value={trainingUserEmail}
                    onChange={(e) => setTrainingUserEmail(e.target.value)}
                    placeholder="email@vickytex.com.br"
                    required
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1 col-span-2">
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Tema / Curso de Melhoria</label>
                  <select 
                    value={trainingTopic}
                    onChange={(e) => setTrainingTopic(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 font-bold"
                  >
                    <option value="Mapeamento de Fluxo de Valor (VSM) Avançado">Mapeamento VSM</option>
                    <option value="Práticas de SMED e Troca Rápida de Lote">Troca Rápida SMED</option>
                    <option value="Metodologia Kaizen e Práticas de 5S">Kaizen e 5S</option>
                    <option value="Certificação Green Belt Six Sigma - DMAIC">Green Belt Six Sigma</option>
                    <option value="Certificação Yellow Belt - Ferramentas Lean">Yellow Belt Seis Sigma</option>
                    <option value="Poka-Yoke e Prevenção de Erros de Processo">Poka-Yoke & Erro Zero</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Duração (h)</label>
                  <input 
                    type="number" 
                    value={trainingHoursInput}
                    onChange={(e) => setTrainingHoursInput(Number(e.target.value))}
                    min={1}
                    max={120}
                    required
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 font-black text-center"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-xl text-xs uppercase tracking-wider shadow-md transition-colors"
              >
                Confirmar Lançamento de Horas (+{trainingHoursInput * 5} pts)
              </button>
            </form>
          </div>
        </div>
      )}

      {/* LEADERBOARD MAINTENANCE MODAL */}
      {maintenanceModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-4 animate-scale-up">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 rounded-lg">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-100">Painel de Manutenção & Ajuste de Leaderboard</h3>
                  <p className="text-[10px] text-slate-400">Ajuste manual de pontos, belts e medalhas com salvamento local</p>
                </div>
              </div>
              <button
                onClick={() => setMaintenanceModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMaintenance} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase block">Selecionar Colaborador</label>
                <select
                  value={selectedUserForMaint}
                  onChange={(e) => {
                    const selected = e.target.value;
                    setSelectedUserForMaint(selected);
                    const adj = manualAdjustments[selected];
                    setMaintPointsBonus(adj?.pointsBonus || 0);
                    setMaintBeltOverride(adj?.beltOverride || 'Auto');
                    setMaintCustomMedal(adj?.customMedal || '');
                    setMaintReason(adj?.reason || '');
                  }}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-bold focus:outline-hidden focus:border-indigo-500"
                >
                  {rankingList.map(r => (
                    <option key={r.email} value={r.email}>
                      {r.nome} ({r.email}) — Atual: {r.pontos} pts
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase block">Ajuste de Pontos (+ / -)</label>
                  <input
                    type="number"
                    value={maintPointsBonus}
                    onChange={(e) => setMaintPointsBonus(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-black focus:outline-hidden focus:border-indigo-500"
                    placeholder="Ex: 50 ou -20"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase block">Sobrescrita de Belt</label>
                  <select
                    value={maintBeltOverride}
                    onChange={(e) => setMaintBeltOverride(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-bold focus:outline-hidden focus:border-indigo-500"
                  >
                    <option value="Auto">Automático (Baseado em Pts)</option>
                    <option value="Yellow Belt">Yellow Belt</option>
                    <option value="Green Belt">Green Belt</option>
                    <option value="Black Belt">Black Belt</option>
                    <option value="Master Black Belt">Master Black Belt</option>
                    <option value="Lean Practitioner">Lean Practitioner</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase block">Atribuir Medalha Personalizada (Opcional)</label>
                <input
                  type="text"
                  value={maintCustomMedal}
                  onChange={(e) => setMaintCustomMedal(e.target.value)}
                  placeholder="Ex: Campeão do Mês, Inovador SGQ, Audit Lider"
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase block">Justificativa da Alteração</label>
                <input
                  type="text"
                  value={maintReason}
                  onChange={(e) => setMaintReason(e.target.value)}
                  placeholder="Ex: Bônus por condução de evento Kaizen com economia auditada"
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => {
                      setMaintenanceModalOpen(false);
                      setIsZeroScoresModalOpen(true);
                    }}
                    className="px-3 py-2 bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-rose-950/40 dark:text-rose-400 rounded-xl text-xs font-bold transition-colors flex items-center space-x-1"
                    title="Zerar todas as pontuações de todos os colaboradores"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Zerar Leaderboard</span>
                  </button>

                  {manualAdjustments[selectedUserForMaint] && (
                    <button
                      type="button"
                      onClick={() => handleResetMaintenance(selectedUserForMaint)}
                      className="px-3 py-2 bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 rounded-xl text-xs font-bold transition-colors"
                    >
                      Resetar Usuário
                    </button>
                  )}
                </div>

                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => setMaintenanceModalOpen(false)}
                    className="px-4 py-2 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-bold rounded-xl text-xs"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs flex items-center space-x-1 shadow-xs"
                  >
                    <Save className="w-4 h-4" />
                    <span>Salvar Manutenção</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Zero Scores Modal */}
      <ConfirmModal
        isOpen={isZeroScoresModalOpen}
        title="Zerar Pontuações do Leaderboard"
        message="Tem certeza que deseja zerar todas as pontuações acumuladas no Leaderboard? Os pontos de todos os colaboradores serão reiniciados para 0 e o histórico de lançamentos anteriores será resetado. Novos treinamentos e projetos somarão pontos a partir de zero."
        confirmLabel="Zerar Pontuações"
        variant="danger"
        onConfirm={handleConfirmResetScores}
        onClose={() => setIsZeroScoresModalOpen(false)}
      />

      {/* Confirm Undo Reset Modal */}
      <ConfirmModal
        isOpen={isUndoResetModalOpen}
        title="Desfazer Último Zeramento"
        message="Deseja desfazer o último zeramento efetuado e restaurar as pontuações e lançamentos do ciclo anterior (como os 40 pontos lançados)? O ranking voltará ao estado imediatamente anterior ao último zeramento."
        confirmLabel="Desfazer e Restaurar Ciclo"
        variant="warning"
        onConfirm={handleUndoResetScores}
        onClose={() => setIsUndoResetModalOpen(false)}
      />

      {/* Confirm Restore Scores Modal */}
      <ConfirmModal
        isOpen={isRestoreScoresModalOpen}
        title="Restaurar Pontuação Automática"
        message="Deseja restaurar a pontuação para a última pontuação obtida? O sistema reverterá o estado de zeramento e recuperará as pontuações e lançamentos registrados no ciclo anterior."
        confirmLabel="Restaurar Última Pontuação"
        variant="warning"
        onConfirm={handleRestoreScores}
        onClose={() => setIsRestoreScoresModalOpen(false)}
      />

      {/* AUDIT & DETAILED POINTS ORIGIN MODAL */}
      {selectedUserForAudit && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-5 animate-scale-up max-h-[90vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-4 shrink-0">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 rounded-2xl">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-base font-black text-slate-850 dark:text-slate-100">
                      Auditoria & Extrato de Pontuação
                    </h3>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-indigo-500/10 text-indigo-600 border border-indigo-500/20">
                      {selectedUserForAudit.belt}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium">
                    {selectedUserForAudit.nome} • <span className="font-mono text-slate-400">{selectedUserForAudit.email}</span>
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedUserForAudit(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Score Breakdown Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 shrink-0">
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800/80">
                <div className="flex items-center justify-between text-indigo-600 dark:text-indigo-400 mb-1">
                  <span className="text-[10px] font-black uppercase tracking-wider">Treinamentos</span>
                  <GraduationCap className="w-3.5 h-3.5" />
                </div>
                <span className="text-lg font-black text-slate-800 dark:text-slate-100 font-mono block">
                  {selectedUserForAudit.detalhamento.treinamentos} <span className="text-[10px] font-bold text-slate-400">pts</span>
                </span>
                <span className="text-[9px] text-slate-400 block font-medium">
                  {selectedUserForAudit.horasTreinamento}h registradas
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800/80">
                <div className="flex items-center justify-between text-amber-600 dark:text-amber-400 mb-1">
                  <span className="text-[10px] font-black uppercase tracking-wider">Banco Ideias</span>
                  <Lightbulb className="w-3.5 h-3.5" />
                </div>
                <span className="text-lg font-black text-slate-800 dark:text-slate-100 font-mono block">
                  {selectedUserForAudit.detalhamento.ideiasSubmetidas + selectedUserForAudit.detalhamento.ideiasAprovadas} <span className="text-[10px] font-bold text-slate-400">pts</span>
                </span>
                <span className="text-[9px] text-slate-400 block font-medium">
                  {selectedUserForAudit.ideiasSubmetidas} submetidas ({selectedUserForAudit.ideiasAprovadas} aprov.)
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800/80">
                <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 mb-1">
                  <span className="text-[10px] font-black uppercase tracking-wider">Projetos & A3</span>
                  <FileCheck className="w-3.5 h-3.5" />
                </div>
                <span className="text-lg font-black text-slate-800 dark:text-slate-100 font-mono block">
                  {selectedUserForAudit.detalhamento.projetosLideranca + selectedUserForAudit.detalhamento.projetosConcluidos + selectedUserForAudit.detalhamento.etapasConcluidas + selectedUserForAudit.detalhamento.equipeProjetos + selectedUserForAudit.detalhamento.tarefasCronograma} <span className="text-[10px] font-bold text-slate-400">pts</span>
                </span>
                <span className="text-[9px] text-slate-400 block font-medium">
                  {selectedUserForAudit.projetosConcluidos} concluídos ({selectedUserForAudit.projetosAtivos} ativos)
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-indigo-600 text-white shadow-md">
                <div className="flex items-center justify-between text-indigo-200 mb-1">
                  <span className="text-[10px] font-black uppercase tracking-wider">Pontuação Total</span>
                  <Trophy className="w-3.5 h-3.5 text-yellow-300" />
                </div>
                <span className="text-xl font-black font-mono block text-white">
                  {selectedUserForAudit.pontos} <span className="text-[10px] font-bold text-indigo-200">pts</span>
                </span>
                <span className="text-[9px] text-indigo-100 block font-medium truncate">
                  {selectedUserForAudit.medalhas.length} medalhas ativas
                </span>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-2 shrink-0 overflow-x-auto">
              <div className="flex items-center space-x-1.5">
                <button
                  type="button"
                  onClick={() => setAuditFilterCategory('all')}
                  className={`px-3 py-1 rounded-xl text-xs font-black transition-all ${
                    auditFilterCategory === 'all'
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                      : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  Todos os Lançamentos ({selectedUserForAudit.detalhamento.itens.length})
                </button>
                <button
                  type="button"
                  onClick={() => setAuditFilterCategory('treinamentos')}
                  className={`px-3 py-1 rounded-xl text-xs font-black transition-all flex items-center space-x-1 ${
                    auditFilterCategory === 'treinamentos'
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/30'
                  }`}
                >
                  <GraduationCap className="w-3 h-3" />
                  <span>Treinamentos</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAuditFilterCategory('ideias')}
                  className={`px-3 py-1 rounded-xl text-xs font-black transition-all flex items-center space-x-1 ${
                    auditFilterCategory === 'ideias'
                      ? 'bg-amber-600 text-white'
                      : 'text-slate-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/30'
                  }`}
                >
                  <Lightbulb className="w-3 h-3" />
                  <span>Ideias</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAuditFilterCategory('projetos')}
                  className={`px-3 py-1 rounded-xl text-xs font-black transition-all flex items-center space-x-1 ${
                    auditFilterCategory === 'projetos'
                      ? 'bg-emerald-600 text-white'
                      : 'text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30'
                  }`}
                >
                  <FileCheck className="w-3 h-3" />
                  <span>Projetos</span>
                </button>
                {selectedUserForAudit.detalhamento.ajusteManual !== 0 && (
                  <button
                    type="button"
                    onClick={() => setAuditFilterCategory('ajustes')}
                    className={`px-3 py-1 rounded-xl text-xs font-black transition-all flex items-center space-x-1 ${
                      auditFilterCategory === 'ajustes'
                        ? 'bg-purple-600 text-white'
                        : 'text-slate-500 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950/30'
                    }`}
                  >
                    <Sliders className="w-3 h-3" />
                    <span>Ajustes</span>
                  </button>
                )}
              </div>

              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                Auditoria ISO 9001
              </span>
            </div>

            {/* List of Individual Audited Items */}
            <div className="overflow-y-auto flex-1 pr-1 space-y-2 max-h-72">
              {(() => {
                const filtered = selectedUserForAudit.detalhamento.itens.filter(item => {
                  if (auditFilterCategory === 'all') return true;
                  return item.categoria === auditFilterCategory;
                });

                if (filtered.length === 0) {
                  return (
                    <div className="py-8 text-center text-slate-400 text-xs font-medium bg-slate-50/50 dark:bg-slate-950/20 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                      Nenhum lançamento encontrado nesta categoria de auditoria.
                    </div>
                  );
                }

                return filtered.map((item, idx) => {
                  const getBadgeStyle = (origem: string) => {
                    switch (origem) {
                      case 'Treinamento':
                        return 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800';
                      case 'Ideia Submetida':
                      case 'Ideia Aprovada':
                        return 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border-amber-200 dark:border-amber-800';
                      case 'Projeto Concluído':
                      case 'Liderança de Projeto':
                      case 'Etapa/Fase Concluída':
                      case 'Membro de Equipe':
                      case 'Tarefa do Cronograma':
                        return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
                      default:
                        return 'bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300 border-purple-200 dark:border-purple-800';
                    }
                  };

                  return (
                    <div
                      key={item.id || idx}
                      className="p-3 border border-slate-100 dark:border-slate-800/80 rounded-2xl bg-white dark:bg-slate-950/20 hover:bg-slate-50/70 transition-colors flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0 space-y-0.5">
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-0.5 rounded-md border text-[9px] font-black uppercase tracking-wider ${getBadgeStyle(item.origem)}`}>
                            {item.origem}
                          </span>
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                            {item.titulo}
                          </span>
                        </div>
                        {item.detalhe && (
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 pl-0.5">
                            {item.detalhe}
                          </p>
                        )}
                        {item.data && (
                          <span className="text-[9px] text-slate-400 block pl-0.5">
                            Data do Registro: {item.data}
                          </span>
                        )}
                      </div>

                      <div className="text-right shrink-0">
                        <span className={`text-sm font-black font-mono block ${
                          item.pontos >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                        }`}>
                          {item.pontos > 0 ? `+${item.pontos}` : item.pontos} Pts
                        </span>
                        <span className="text-[8px] text-slate-400 uppercase tracking-widest font-bold">Auditado</span>
                      </div>
                    </div>
                  );
                });
              })()}
            </div>

            {/* Modal Footer */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
              <span className="text-[10px] text-slate-400 font-medium">
                Regras vigentes: Treinamento (+5/h), Ideia (+15), Ideia Aprovada (+50), Projeto (+200), Etapa (+30), Membro (+30), Tarefa (+15).
              </span>
              <button
                type="button"
                onClick={() => setSelectedUserForAudit(null)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-100 dark:hover:bg-slate-200 dark:text-slate-900 font-bold rounded-xl text-xs transition-colors"
              >
                Fechar Auditoria
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
export default GamificacaoCEO;
