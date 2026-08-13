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
  RotateCcw
} from 'lucide-react';
import { ProjetoCEO, SugestaoCEO } from '../../types/ceo';
import { useAuth } from '../../contexts/AuthContext';
import { ConfirmModal } from '../common/ConfirmModal';
import { SystemSettingsRepository } from '../../services/database/repositories/systemSettings.repository';

interface GamificacaoCEOProps {
  projects: ProjetoCEO[];
  suggestions: SugestaoCEO[];
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
}

export const GamificacaoCEO: React.FC<GamificacaoCEOProps> = ({ projects, suggestions }) => {
  const { user } = useAuth();
  const [rankingList, setRankingList] = useState<ColaboradorRank[]>([]);
  const [logHoursModalOpen, setLogHoursModalOpen] = useState(false);
  const [trainingUserEmail, setTrainingUserEmail] = useState(user?.email || '');
  const [trainingUserName, setTrainingUserName] = useState(user?.name || '');
  const [trainingHoursInput, setTrainingHoursInput] = useState<number>(8);
  const [trainingTopic, setTrainingTopic] = useState('Fundamentos de Lean Manufacturing e Mapeamento VSM');
  const [loggedTrainings, setLoggedTrainings] = useState<any[]>(() => {
    const saved = localStorage.getItem('sgq_vickytex_ceo_training_logs');
    return saved ? JSON.parse(saved) : [
      { id: '1', nome: 'Mariana Santos', email: 'supervisor.costura@vickytex.com.br', horas: 16, tema: 'Certificação Green Belt Six Sigma', data: '2026-06-15' },
      { id: '2', nome: 'Carlos Oliveira', email: 'colaborador.costura@vickytex.com.br', horas: 8, tema: 'Práticas de SMED e Troca Rápida', data: '2026-05-20' },
      { id: '3', nome: 'Ana Costa', email: 'supervisor.qualidade@vickytex.com.br', horas: 24, tema: 'Liderança Kaizen e Ferramentas de Causa Raiz', data: '2026-07-01' }
    ];
  });

  // Manual adjustments state for Leaderboard Maintenance
  const [manualAdjustments, setManualAdjustments] = useState<Record<string, { pointsBonus: number; beltOverride?: string; customMedal?: string; reason?: string }>>(() => {
    const saved = localStorage.getItem('sgq_vickytex_ceo_gamification_adjustments');
    return saved ? JSON.parse(saved) : {};
  });

  // Zeroed scores state
  const [isScoresZeroed, setIsScoresZeroed] = useState<boolean>(() => {
    return localStorage.getItem('sgq_vickytex_ceo_scores_zeroed') === 'true';
  });
  const [isZeroScoresModalOpen, setIsZeroScoresModalOpen] = useState(false);

  const [maintenanceModalOpen, setMaintenanceModalOpen] = useState(false);
  const [selectedUserForMaint, setSelectedUserForMaint] = useState<string>('');
  const [maintPointsBonus, setMaintPointsBonus] = useState<number>(0);
  const [maintBeltOverride, setMaintBeltOverride] = useState<string>('Auto');
  const [maintCustomMedal, setMaintCustomMedal] = useState<string>('');
  const [maintReason, setMaintReason] = useState<string>('');

  // Subscrição onSnapshot em tempo real no Firestore para sincronizar Leaderboard entre usuários
  useEffect(() => {
    const unsub = SystemSettingsRepository.subscribe((records) => {
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
      }
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    localStorage.setItem('sgq_vickytex_ceo_gamification_adjustments', JSON.stringify(manualAdjustments));
  }, [manualAdjustments]);

  useEffect(() => {
    localStorage.setItem('sgq_vickytex_ceo_scores_zeroed', isScoresZeroed ? 'true' : 'false');
  }, [isScoresZeroed]);

  // Recalculate ranking whenever projects, suggestions, or logged trainings change
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
      }>();

      // Pre-seed known users from collaborations or logged trainings to build a rich leaderboard
      const seedUsers = [
        { email: 'supervisor.costura@vickytex.com.br', nome: 'Mariana Santos' },
        { email: 'colaborador.costura@vickytex.com.br', nome: 'Carlos Oliveira' },
        { email: 'qualidade@vickytex.com.br', nome: 'Ana Costa (Qualidade)' },
        { email: 'colaborador.corte@vickytex.com.br', nome: 'Roberto Silva' },
        { email: 'gerencia@vickytex.com.br', nome: 'Diretoria Executiva' }
      ];

      seedUsers.forEach(su => {
        userMap.set(su.email, {
          nome: su.nome,
          email: su.email,
          projetosAtivos: 0,
          projetosConcluidos: 0,
          ideiasSubmetidas: 0,
          ideiasAprovadas: 0,
          tarefasConcluidas: 0,
          horasTreinamento: 0,
          pontos: 0,
          medalhas: new Set<string>()
        });
      });

      // Add active user if not already seeded
      if (user && !userMap.has(user.email)) {
        userMap.set(user.email, {
          nome: user.name || user.email.split('@')[0],
          email: user.email,
          projetosAtivos: 0,
          projetosConcluidos: 0,
          ideiasSubmetidas: 0,
          ideiasAprovadas: 0,
          tarefasConcluidas: 0,
          horasTreinamento: 0,
          pontos: 0,
          medalhas: new Set<string>()
        });
      }

      // Add logged training hours
      loggedTrainings.forEach(log => {
        const u = userMap.get(log.email) || {
          nome: log.nome,
          email: log.email,
          projetosAtivos: 0,
          projetosConcluidos: 0,
          ideiasSubmetidas: 0,
          ideiasAprovadas: 0,
          tarefasConcluidas: 0,
          horasTreinamento: 0,
          pontos: 0,
          medalhas: new Set<string>()
        };
        u.horasTreinamento += log.horas;
        u.pontos += log.horas * 5; // 5 pts per hour of continuous improvement training
        u.medalhas.add('Estudioso Lean');
        userMap.set(log.email, u);
      });

      // Map suggestions
      suggestions.forEach(sug => {
        if (!sug.autor) return;
        const u = userMap.get(sug.autor) || {
          nome: sug.autor.split('@')[0],
          email: sug.autor,
          projetosAtivos: 0,
          projetosConcluidos: 0,
          ideiasSubmetidas: 0,
          ideiasAprovadas: 0,
          tarefasConcluidas: 0,
          horasTreinamento: 0,
          pontos: 0,
          medalhas: new Set<string>()
        };

        u.ideiasSubmetidas += 1;
        u.pontos += 15; // 15 pts per suggestion submitted

        if (sug.status === 'Aprovada' || sug.status === 'Em Implantação' || sug.status === 'Concluída') {
          u.ideiasAprovadas += 1;
          u.pontos += 50; // 50 pts per approved idea
          u.medalhas.add('Mente Inovadora');
        }

        userMap.set(sug.autor, u);
      });

      // Map projects
      projects.forEach(proj => {
        // Project leader
        if (proj.lider) {
          const u = userMap.get(proj.lider) || {
            nome: proj.lider.split('@')[0],
            email: proj.lider,
            projetosAtivos: 0,
            projetosConcluidos: 0,
            ideiasSubmetidas: 0,
            ideiasAprovadas: 0,
            tarefasConcluidas: 0,
            horasTreinamento: 0,
            pontos: 0,
            medalhas: new Set<string>()
          };

          if (proj.status === 'Concluído') {
            u.projetosConcluidos += 1;
            u.pontos += 200; // 200 pts per completed project
            u.medalhas.add('Campeão Kaizen');
          } else if (proj.status === 'Em Execução' || proj.status === 'Planejado') {
            u.projetosAtivos += 1;
            u.pontos += 50; // 50 pts for active leading
          }

          // Stage completion counts
          const completedStages = proj.ferramentas?.etapas?.filter(e => e.status === 'Concluido').length || 0;
          u.pontos += completedStages * 30; // 30 pts per completed gate/stage

          userMap.set(proj.lider, u);
        }

        // Project team members
        proj.ferramentas?.equipe?.forEach(m => {
          if (!m.email) return;
          const u = userMap.get(m.email) || {
            nome: m.nome,
            email: m.email,
            projetosAtivos: 0,
            projetosConcluidos: 0,
            ideiasSubmetidas: 0,
            ideiasAprovadas: 0,
            tarefasConcluidas: 0,
            horasTreinamento: 0,
            pontos: 0,
            medalhas: new Set<string>()
          };
          u.pontos += 30; // 30 points for team collaboration
          u.medalhas.add('Trabalho em Equipe');
          userMap.set(m.email, u);
        });

        // Cronograma tasks
        proj.ferramentas?.cronograma?.forEach(task => {
          if (task.status === 'Concluido' && task.responsavel) {
            const u = userMap.get(task.responsavel) || {
              nome: task.responsavel.split('@')[0],
              email: task.responsavel,
              projetosAtivos: 0,
              projetosConcluidos: 0,
              ideiasSubmetidas: 0,
              ideiasAprovadas: 0,
              tarefasConcluidas: 0,
              horasTreinamento: 0,
              pontos: 0,
              medalhas: new Set<string>()
            };
            u.tarefasConcluidas += 1;
            u.pontos += 15; // 15 pts per finished task
            userMap.set(task.responsavel, u);
          }
        });
      });

      // Convert map to list, assign belt, and sort
      const list: ColaboradorRank[] = Array.from(userMap.values()).map(u => {
        let belt: 'Yellow Belt' | 'Green Belt' | 'Black Belt' | 'Master Black Belt' | 'Lean Practitioner' = 'Lean Practitioner';
        
        // Apply manual adjustments if any
        const adj = manualAdjustments[u.email];
        let totalPts = isScoresZeroed 
          ? Math.max(0, adj?.pointsBonus || 0)
          : Math.max(0, u.pontos + (adj?.pointsBonus || 0));

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
          medalhas: Array.from(u.medalhas)
        };
      });

      // Sort by points descending
      list.sort((a, b) => b.pontos - a.pontos);
      setRankingList(list);
    };

    calculateRankings();
  }, [projects, suggestions, loggedTrainings, manualAdjustments, isScoresZeroed, user]);

  const handleConfirmResetScores = () => {
    setIsScoresZeroed(true);
    setLoggedTrainings([]);
    setManualAdjustments({});
    localStorage.setItem('sgq_vickytex_ceo_training_logs', '[]');
    localStorage.removeItem('sgq_vickytex_ceo_gamification_adjustments');
    localStorage.setItem('sgq_vickytex_ceo_scores_zeroed', 'true');
    SystemSettingsRepository.create({ id: 'sgq_vickytex_ceo_training_logs', items: [] }).catch(console.error);
    SystemSettingsRepository.create({ id: 'sgq_vickytex_ceo_gamification_adjustments', data: {} }).catch(console.error);
    SystemSettingsRepository.create({ id: 'sgq_vickytex_ceo_scores_zeroed', data: { zeroed: true } }).catch(console.error);
    setIsZeroScoresModalOpen(false);
  };

  const handleRestoreScores = () => {
    setIsScoresZeroed(false);
    localStorage.removeItem('sgq_vickytex_ceo_scores_zeroed');
    SystemSettingsRepository.create({ id: 'sgq_vickytex_ceo_scores_zeroed', data: { zeroed: false } }).catch(console.error);
  };

  const handleLogHours = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trainingUserEmail || !trainingUserName || !trainingTopic) return;

    const newLog = {
      id: `log-${Date.now()}`,
      nome: trainingUserName,
      email: trainingUserEmail,
      horas: Number(trainingHoursInput),
      tema: trainingTopic,
      data: new Date().toISOString().split('T')[0]
    };

    const updatedLogs = [newLog, ...loggedTrainings];
    setLoggedTrainings(updatedLogs);
    SystemSettingsRepository.create({ id: 'sgq_vickytex_ceo_training_logs', items: updatedLogs }).catch(console.error);
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

            {isScoresZeroed && (
              <button
                onClick={handleRestoreScores}
                className="px-3 py-1.5 bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-800/50 font-medium rounded-lg transition-colors flex items-center space-x-1.5"
                title="Recalcular pontos automáticos de projetos e treinamentos"
              >
                <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                <span>Restaurar Pontuação Automática</span>
              </button>
            )}

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

      {/* 2. Ranks Summary / Info Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: 'Yellow Belt', pts: '60+ pts', desc: 'Introdução ao Kaizen, preenchimento de GUT, Pareto e SWOT.', color: 'bg-yellow-500', text: 'text-yellow-800' },
          { title: 'Green Belt', pts: '180+ pts', desc: 'Liderança de projetos PDCA, mapeamento SIPOC, Ishikawa e 5 Whys.', color: 'bg-emerald-500', text: 'text-emerald-800' },
          { title: 'Black Belt', pts: '350+ pts', desc: 'Liderança avançada DMAIC, cronogramas complexos e redução de tempos.', color: 'bg-slate-900', text: 'text-slate-100' },
          { title: 'Master Black Belt', pts: '600+ pts', desc: 'Análise de ROI, Payback, consolidação de planos e mentoria Lean.', color: 'bg-indigo-600', text: 'text-indigo-100' }
        ].map(r => (
          <div key={r.title} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className={`inline-block px-2.5 py-1 rounded-lg text-[9px] font-black uppercase ${r.color} ${r.text}`}>
                {r.title}
              </span>
              <span className="text-[10px] font-bold text-slate-400">{r.pts}</span>
            </div>
            <p className="text-[10px] text-slate-500 leading-relaxed font-medium">{r.desc}</p>
          </div>
        ))}
      </div>

      {/* 3. Leaderboard and Achievements Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEADERBOARD LEADING COMPONENT */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider mb-4 flex items-center space-x-1.5">
              <Star className="w-4 h-4 text-yellow-500" />
              <span>Leaderboard de Colaboradores (Melhoria Contínua)</span>
            </h3>

            <div className="space-y-2.5">
              {rankingList.map((rank, index) => {
                const isCurrentUser = rank.email === user?.email;
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

                return (
                  <div 
                    key={rank.email} 
                    className={`flex items-center justify-between p-3.5 border rounded-2xl transition-all ${
                      isCurrentUser 
                        ? 'border-indigo-500 bg-indigo-50/10 dark:bg-indigo-950/20 shadow-xs' 
                        : 'border-slate-100 dark:border-slate-800/80 hover:bg-slate-50/50'
                    }`}
                  >
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

            <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
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

          <div className="p-4 bg-indigo-500/5 dark:bg-indigo-500/10 border border-indigo-500/10 rounded-2xl space-y-2">
            <span className="text-[10px] font-black uppercase text-indigo-600 dark:text-indigo-400 block">Como Pontuar</span>
            <ul className="text-[10px] text-slate-500 dark:text-slate-400 space-y-1.5 list-disc pl-3">
              <li>Lançar horas de capacitação Lean: <b>+5 pts/hora</b></li>
              <li>Submeter sugestão ao banco de ideias: <b>+15 pts</b></li>
              <li>Ter uma sugestão de melhoria aprovada: <b>+50 pts</b></li>
              <li>Fazer parte da equipe de um projeto: <b>+30 pts</b></li>
              <li>Concluir etapas/tollgates da metodologia: <b>+30 pts/fase</b></li>
              <li>Finalizar com sucesso um projeto CEO: <b>+200 pts</b></li>
            </ul>
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
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Colaborador</label>
                <input 
                  type="text" 
                  value={trainingUserName}
                  onChange={(e) => setTrainingUserName(e.target.value)}
                  placeholder="Nome Completo"
                  required
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Email Institucional</label>
                <input 
                  type="email" 
                  value={trainingUserEmail}
                  onChange={(e) => setTrainingUserEmail(e.target.value)}
                  placeholder="email@vickytex.com.br"
                  required
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50"
                />
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

    </div>
  );
};
export default GamificacaoCEO;
