import React from 'react';
import { FileCheck, ShieldAlert, Clock, Bell, Trash2, ChevronRight, Activity, ArrowRight } from 'lucide-react';
import { Documento, DocumentLog } from '../../types';

interface DocumentoDashboardProps {
  documents: Documento[];
  onSelectDocument: (id: string) => void;
}

export const DocumentoDashboard: React.FC<DocumentoDashboardProps> = ({ documents, onSelectDocument }) => {
  
  const hoje = new Date();

  // 1. Documentos Vigentes
  const vigentes = documents.filter(doc => 
    doc.status === 'Publicação' || 
    doc.status === 'Distribuição' || 
    doc.status === 'Aceite' || 
    doc.status === 'Homologado'
  );

  // 2. Documentos em Revisão
  const emRevisao = documents.filter(doc => 
    doc.status === 'Revisão Técnica' || 
    doc.status === 'Em Revisão'
  );

  // 3. Documentos Vencidos (Próxima revisão no passado e não obsoleto)
  const vencidas = documents.filter(doc => {
    if (!doc.proximaRevisao || doc.status === 'Obsoleto') return false;
    const prox = new Date(doc.proximaRevisao);
    return prox < hoje;
  });

  // 4. Documentos Pendentes (Elaboração, Aprovação, Rascunho)
  const pendentes = documents.filter(doc => 
    doc.status === 'Rascunho' ||
    doc.status === 'Elaboração' || 
    doc.status === 'Aprovação' || 
    doc.status === 'Em Aprovação' ||
    doc.status === 'Nova Revisão'
  );

  // 5. Documentos Obsoletos
  const obsoletos = documents.filter(doc => doc.status === 'Obsoleto');

  // 6. Últimas Alterações (reunir logs de todos os documentos e ordenar)
  const todasAlteracoes: { docId: string; codigo: string; titulo: string; usuario: string; acao: string; data: string }[] = [];
  
  documents.forEach(doc => {
    if (doc.documentLogs && doc.documentLogs.length > 0) {
      doc.documentLogs.forEach(log => {
        todasAlteracoes.push({
          docId: doc.id,
          codigo: doc.codigo,
          titulo: doc.titulo,
          usuario: log.usuario,
          acao: log.acao,
          data: log.data
        });
      });
    } else {
      todasAlteracoes.push({
        docId: doc.id,
        codigo: doc.codigo,
        titulo: doc.titulo,
        usuario: doc.elaborador,
        acao: `Atualização: Status ${doc.status}`,
        data: doc.updatedAt?.split('T')[0] || doc.createdAt?.split('T')[0] || new Date().toISOString().split('T')[0]
      });
    }
  });

  const ultimasAlteracoes = todasAlteracoes
    .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Cards de Indicadores do Dashboard */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        
        {/* Card 1: Vigentes */}
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Vigentes</span>
            <div className="p-1.5 bg-emerald-500/10 rounded-lg text-emerald-600 dark:text-emerald-400">
              <FileCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <h4 className="text-2xl font-extrabold text-slate-800 dark:text-white font-mono">{vigentes.length}</h4>
            <p className="text-[10px] text-slate-400 mt-0.5">Ativos na fábrica (ISO 9001)</p>
          </div>
        </div>

        {/* Card 2: Em Revisão */}
        <div className="p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Em Revisão</span>
            <div className="p-1.5 bg-blue-500/10 rounded-lg text-blue-600 dark:text-blue-400">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <h4 className="text-2xl font-extrabold text-slate-800 dark:text-white font-mono">{emRevisao.length}</h4>
            <p className="text-[10px] text-slate-400 mt-0.5">Em revisão técnica ativa</p>
          </div>
        </div>

        {/* Card 3: Vencidas */}
        <div className="p-4 bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold text-rose-600 dark:text-rose-400 uppercase tracking-wider">Vencidas</span>
            <div className="p-1.5 bg-rose-500/10 rounded-lg text-rose-600 dark:text-rose-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <h4 className="text-2xl font-extrabold text-slate-800 dark:text-white font-mono">{vencidas.length}</h4>
            <p className="text-[10px] text-slate-400 mt-0.5">Revisão periódica atrasada</p>
          </div>
        </div>

        {/* Card 4: Pendentes */}
        <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold text-amber-600 dark:text-amber-400 uppercase tracking-wider">Pendentes</span>
            <div className="p-1.5 bg-amber-500/10 rounded-lg text-amber-600 dark:text-amber-400">
              <Bell className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <h4 className="text-2xl font-extrabold text-slate-800 dark:text-white font-mono">{pendentes.length}</h4>
            <p className="text-[10px] text-slate-400 mt-0.5">Em rascunho, elaboração/aprov</p>
          </div>
        </div>

        {/* Card 5: Obsoletos */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Obsoletos</span>
            <div className="p-1.5 bg-slate-500/10 rounded-lg text-slate-600 dark:text-slate-400">
              <Trash2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <h4 className="text-2xl font-extrabold text-slate-800 dark:text-white font-mono">{obsoletos.length}</h4>
            <p className="text-[10px] text-slate-400 mt-0.5">Arquivados para histórico</p>
          </div>
        </div>

      </div>

      {/* Seção das Últimas Alterações */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
        <h4 className="text-xs font-extrabold text-slate-900 dark:text-white mb-4 uppercase tracking-wider flex items-center">
          <Activity className="w-4 h-4 mr-1.5 text-blue-500" />
          Últimas Alterações de Ciclo de Vida do SGQ Documental
        </h4>
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {ultimasAlteracoes.length > 0 ? (
            ultimasAlteracoes.map((alt, idx) => (
              <div 
                key={idx} 
                onClick={() => onSelectDocument(alt.docId)}
                className="py-3 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/40 px-2 rounded-xl transition-all cursor-pointer group"
              >
                <div className="flex items-center space-x-3 min-w-0">
                  <div className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-[9px] font-extrabold font-mono text-slate-600 dark:text-slate-300">
                    {alt.codigo}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {alt.titulo}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5 flex items-center space-x-1.5">
                      <span>Ação: <strong>{alt.acao}</strong></span>
                      <span>•</span>
                      <span>Por: <strong className="font-semibold text-slate-500">{alt.usuario}</strong></span>
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2 shrink-0">
                  <span className="text-[10px] text-slate-400 font-mono">{alt.data}</span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-blue-500 transition-colors" />
                </div>
              </div>
            ))
          ) : (
            <p className="text-xs text-slate-400 italic py-4 text-center">Nenhuma alteração registrada ainda.</p>
          )}
        </div>
      </div>
    </div>
  );
};
