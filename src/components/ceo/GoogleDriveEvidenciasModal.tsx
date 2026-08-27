/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  X, 
  Folder, 
  ExternalLink, 
  Upload, 
  FileText, 
  Check, 
  Trash2, 
  ShieldCheck, 
  RefreshCw,
  Plus,
  Link2
} from 'lucide-react';
import { ProjetoCEO, FerramentasCEO, EvidenciaFile } from '../../types/ceo';

interface GoogleDriveEvidenciasModalProps {
  project: ProjetoCEO;
  tools: FerramentasCEO;
  onSaveEvidencias: (evidencias: EvidenciaFile[]) => void;
  onClose: () => void;
}

export const GoogleDriveEvidenciasModal: React.FC<GoogleDriveEvidenciasModalProps> = ({
  project,
  tools,
  onSaveEvidencias,
  onClose
}) => {
  const gdriveFolderId = typeof window !== 'undefined' 
    ? (localStorage.getItem('sgq_vickytex_gdrive_folder_id') || '1Vick_Official_QMS_Drive_Folder')
    : '1Vick_Official_QMS_Drive_Folder';

  const [newFileName, setNewFileName] = useState('');
  const [newFileUrl, setNewFileUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const driveWebUrl = `https://drive.google.com/drive/search?q=${encodeURIComponent(project.codigo)}`;

  const handleAddEvidencia = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFileName.trim()) return;

    const newEv: EvidenciaFile = {
      id: `evi-${Date.now()}`,
      nome: newFileName.trim(),
      url: newFileUrl.trim() || driveWebUrl,
      dataUpload: new Date().toISOString().split('T')[0],
      enviadoPor: 'qualidade@vickytex.com.br'
    };

    const updated = [newEv, ...(tools.evidencias || [])];
    onSaveEvidencias(updated);
    setNewFileName('');
    setNewFileUrl('');
  };

  const handleRemoveEvidencia = (id: string) => {
    const updated = (tools.evidencias || []).filter(e => e.id !== id);
    onSaveEvidencias(updated);
  };

  const handleOpenDrive = () => {
    window.open(driveWebUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* HEADER */}
        <div className="bg-blue-900 text-white px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-800 rounded-xl">
              <Folder className="w-5 h-5 text-blue-300" />
            </div>
            <div>
              <h2 className="text-sm font-bold flex items-center gap-2">
                <span>Pasta de Evidências Google Drive Corporativo</span>
              </h2>
              <p className="text-[11px] text-blue-200 font-mono">
                SGQ_CEO / {project.codigo} - {project.titulo}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-blue-200 hover:text-white rounded-lg hover:bg-blue-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* CONTENT */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* DRIVE STATUS CARD */}
          <div className="p-4 bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/60 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Google Workspace Conectado
                </span>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                  SINCRONIZADO
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                Pasta Raiz ID: {gdriveFolderId}
              </p>
            </div>

            <button
              onClick={handleOpenDrive}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-colors shrink-0 shadow-xs cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Abrir no Google Drive</span>
            </button>
          </div>

          {/* ADD EVIDENCE FORM */}
          <form onSubmit={handleAddEvidencia} className="space-y-3 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
            <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-blue-600" />
              <span>Vincular Nova Evidência / Laudo / Foto</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-1">Nome do Documento / Evidência *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Foto Antes e Depois do Setup de Costura"
                  value={newFileName}
                  onChange={(e) => setNewFileName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-1">Link do Google Drive (Opcional)</label>
                <input
                  type="text"
                  placeholder="https://drive.google.com/file/d/..."
                  value={newFileUrl}
                  onChange={(e) => setNewFileUrl(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 font-mono"
                />
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="submit"
                className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
              >
                Adicionar Registro
              </button>
            </div>
          </form>

          {/* LIST OF EVIDENCE FILES */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Arquivos e Evidências Sincronizadas ({tools.evidencias?.length || 0})
            </h3>

            {tools.evidencias && tools.evidencias.length > 0 ? (
              <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900">
                {tools.evidencias.map((ev) => (
                  <div key={ev.id} className="p-3 flex items-center justify-between gap-3 hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                    <div className="flex items-center space-x-3 min-w-0">
                      <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-400 shrink-0">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{ev.nome}</p>
                        <p className="text-[10px] text-slate-400">
                          Data: {ev.dataUpload} • Enviado por: {ev.enviadoPor}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0">
                      <a
                        href={ev.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-950/50 dark:text-blue-400 rounded-lg text-xs font-bold flex items-center gap-1"
                        title="Abrir anexo"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Visualizar</span>
                      </a>

                      <button
                        onClick={() => handleRemoveEvidencia(ev.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                        title="Remover anexo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                <Folder className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                <p className="text-xs font-medium text-slate-500">Nenhuma evidência vinculada a este projeto ainda.</p>
                <p className="text-[10px] text-slate-400 mt-1">Use o formulário acima para registrar fotos, laudos ou planilhas do Drive.</p>
              </div>
            )}
          </div>

        </div>

        {/* FOOTER */}
        <div className="bg-slate-50 dark:bg-slate-950 px-6 py-3 border-t border-slate-200 dark:border-slate-800 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-bold transition-colors cursor-pointer"
          >
            Fechar
          </button>
        </div>

      </div>
    </div>
  );
};
