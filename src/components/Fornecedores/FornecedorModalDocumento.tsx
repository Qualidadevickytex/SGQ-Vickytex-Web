/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  X, 
  FileCheck2, 
  Calendar, 
  ExternalLink, 
  Plus, 
  Info
} from 'lucide-react';
import { Fornecedor, DocumentoFornecedor, TipoDocumentoFornecedor } from '../../types/supplier';

interface FornecedorModalDocumentoProps {
  fornecedor: Fornecedor;
  onClose: () => void;
  onSaveDocumento: (doc: DocumentoFornecedor) => void;
}

export const FornecedorModalDocumento: React.FC<FornecedorModalDocumentoProps> = ({
  fornecedor,
  onClose,
  onSaveDocumento
}) => {
  const [tipo, setTipo] = useState<TipoDocumentoFornecedor>('Certificado OEKO-TEX');
  const [titulo, setTitulo] = useState('');
  const [numeroDocumento, setNumeroDocumento] = useState('');
  const [dataEmissao, setDataEmissao] = useState(new Date().toISOString().split('T')[0]);
  const [dataValidade, setDataValidade] = useState(
    new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [anexoUrl, setAnexoUrl] = useState('');
  const [observacoes, setObservacoes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const hoje = new Date().toISOString().split('T')[0];
    let status: DocumentoFornecedor['status'] = 'Vigente';
    if (dataValidade) {
      const diffDays = Math.ceil((new Date(dataValidade).getTime() - new Date(hoje).getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays < 0) status = 'Vencido';
      else if (diffDays <= 30) status = 'Vencendo em 30 dias';
    }

    const novoDoc: DocumentoFornecedor = {
      id: `doc-${Date.now()}`,
      tipo,
      titulo: titulo.trim() || `${tipo} - ${fornecedor.nomeFantasia}`,
      numeroDocumento: numeroDocumento.trim() || undefined,
      dataEmissao: dataEmissao || undefined,
      dataValidade: dataValidade || undefined,
      anexoUrl: anexoUrl.trim() || undefined,
      status,
      observacoes: observacoes.trim() || undefined
    };

    onSaveDocumento(novoDoc);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 dark:border-slate-800 overflow-hidden my-8 animate-fade-in">
        
        {/* Header */}
        <div className="bg-linear-to-r from-blue-700 to-indigo-800 text-white p-5 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/10 rounded-xl backdrop-blur-xs">
              <FileCheck2 className="w-5 h-5 text-blue-200" />
            </div>
            <div>
              <h3 className="font-extrabold text-base tracking-tight">Anexar Documento & Certificação (ISO 8.4)</h3>
              <p className="text-xs text-blue-100 mt-0.5">
                {fornecedor.nomeFantasia || fornecedor.razaoSocial}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          <div>
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">
              Tipo de Documento *
            </label>
            <select 
              value={tipo}
              onChange={e => setTipo(e.target.value as any)}
              className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-medium"
            >
              <option value="Certificado OEKO-TEX">Certificado OEKO-TEX Standard 100</option>
              <option value="Licença Ambiental">Licença Ambiental de Operação (IMA / CETESB / etc.)</option>
              <option value="FISPQ / FDS">FISPQ / FDS (Ficha de Segurança de Químicos)</option>
              <option value="Certificado de Calibração">Certificado de Calibração RBC / Inmetro</option>
              <option value="Certificado ISO 9001">Certificado ISO 9001 / ISO 14001</option>
              <option value="Ficha Cadastral / CNPJ">Cartão CNPJ / Ficha Cadastral</option>
              <option value="Contrato Social">Contrato Social / Prestação de Serviço</option>
              <option value="Termo de Confidencialidade">Termo de Confidencialidade (NDA)</option>
              <option value="Outro">Outro Laudo / Certidão</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">
              Título / Descrição do Documento *
            </label>
            <input 
              type="text" 
              required
              placeholder="Ex: Certificado OEKO-TEX Fios Livres de Substâncias Tóxicas"
              value={titulo}
              onChange={e => setTitulo(e.target.value)}
              className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                Nº Registro / Laudo
              </label>
              <input 
                type="text" 
                placeholder="Ex: BR-99210"
                value={numeroDocumento}
                onChange={e => setNumeroDocumento(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-mono"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                Data de Emissão
              </label>
              <input 
                type="date" 
                value={dataEmissao}
                onChange={e => setDataEmissao(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-mono"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                Data de Validade *
              </label>
              <input 
                type="date" 
                required
                value={dataValidade}
                onChange={e => setDataValidade(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-mono focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">
              Link do Anexo (Google Drive / Arquivo Digital)
            </label>
            <input 
              type="url" 
              placeholder="https://drive.google.com/file/d/... ou link de nuvem"
              value={anexoUrl}
              onChange={e => setAnexoUrl(e.target.value)}
              className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">
              Observações
            </label>
            <textarea 
              rows={2}
              placeholder="Ex: Documento de renovação protocolado junto ao órgão em 10/05..."
              value={observacoes}
              onChange={e => setObservacoes(e.target.value)}
              className="w-full text-xs p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
            />
          </div>

          {/* Rodapé */}
          <div className="pt-3 border-t border-slate-150 dark:border-slate-800 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-colors shadow-sm cursor-pointer flex items-center"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              Salvar Documento
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
