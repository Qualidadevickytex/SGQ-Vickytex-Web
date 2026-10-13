/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  X, 
  Truck, 
  Building2, 
  Users, 
  ShieldAlert, 
  Layers, 
  Plus, 
  Trash2, 
  FileText, 
  Tag, 
  Save,
  CheckCircle2
} from 'lucide-react';
import { Fornecedor, ContatoFornecedor, GestaoRiscoFornecedor, CategoriaFornecedor, CriticidadeFornecedor } from '../../types/supplier';

interface FornecedorModalCadastroProps {
  fornecedorEditar?: Fornecedor | null;
  categoriasExistentes: string[];
  fornecedoresCadastrados: Fornecedor[];
  onClose: () => void;
  onSave: (fornecedor: Fornecedor) => void;
}

export const FornecedorModalCadastro: React.FC<FornecedorModalCadastroProps> = ({
  fornecedorEditar,
  categoriasExistentes,
  fornecedoresCadastrados,
  onClose,
  onSave
}) => {
  const isEditing = Boolean(fornecedorEditar);

  // Aba ativa do formulário
  const [activeTab, setActiveTab] = useState<'dados' | 'contatos' | 'produtos' | 'riscos'>('dados');

  // Dados Cadastrais
  const [razaoSocial, setRazaoSocial] = useState(fornecedorEditar?.razaoSocial || '');
  const [nomeFantasia, setNomeFantasia] = useState(fornecedorEditar?.nomeFantasia || '');
  const [cnpj, setCnpj] = useState(fornecedorEditar?.cnpj || '');
  const [inscricaoEstadual, setInscricaoEstadual] = useState(fornecedorEditar?.inscricaoEstadual || '');
  const [enderecoCompleto, setEnderecoCompleto] = useState(fornecedorEditar?.enderecoCompleto || '');
  const [cidade, setCidade] = useState(fornecedorEditar?.cidade || '');
  const [uf, setUf] = useState(fornecedorEditar?.uf || 'SC');
  const [cep, setCep] = useState(fornecedorEditar?.cep || '');
  
  const [categoria, setCategoria] = useState<string>(
    fornecedorEditar?.categoria || 'Malharias e Tinturarias'
  );
  const [subcategoria, setSubcategoria] = useState(fornecedorEditar?.subcategoria || '');
  const [criticidade, setCriticidade] = useState<CriticidadeFornecedor>(
    fornecedorEditar?.criticidade || 'Alta'
  );
  const [statusQualificacao, setStatusQualificacao] = useState<Fornecedor['statusQualificacao']>(
    fornecedorEditar?.statusQualificacao || 'Em Avaliação'
  );

  // Contato Principal
  const [contatoNome, setContatoNome] = useState(fornecedorEditar?.contatoNome || '');
  const [contatoEmail, setContatoEmail] = useState(fornecedorEditar?.contatoEmail || '');
  const [contatoTelefone, setContatoTelefone] = useState(fornecedorEditar?.contatoTelefone || '');

  // Contatos Adicionais
  const [contatosAdicionais, setContatosAdicionais] = useState<ContatoFornecedor[]>(
    fornecedorEditar?.contatosAdicionais || []
  );
  const [novoContatoNome, setNovoContatoNome] = useState('');
  const [novoContatoEmail, setNovoContatoEmail] = useState('');
  const [novoContatoTelefone, setNovoContatoTelefone] = useState('');
  const [novoContatoTipo, setNovoContatoTipo] = useState<ContatoFornecedor['tipo']>('Qualidade');
  const [novoContatoCargo, setNovoContatoCargo] = useState('');

  // Produtos e Serviços
  const [produtosServicos, setProdutosServicos] = useState<string[]>(
    fornecedorEditar?.produtosServicosFornecidos || []
  );
  const [novoProdutoTag, setNovoProdutoTag] = useState('');

  // Gestão de Risco & Contingência
  const [monossuprimento, setMonossuprimento] = useState<boolean>(
    fornecedorEditar?.gestaoRisco?.monossuprimento || false
  );
  const [impactoQualidade, setImpactoQualidade] = useState<GestaoRiscoFornecedor['impactoQualidade']>(
    fornecedorEditar?.gestaoRisco?.impactoQualidade || 'Crítico (Direto no Produto)'
  );
  const [riscoAbastecimento, setRiscoAbastecimento] = useState<GestaoRiscoFornecedor['riscoAbastecimento']>(
    fornecedorEditar?.gestaoRisco?.riscoAbastecimento || 'Médio'
  );
  const [planoContingencia, setPlanoContingencia] = useState(
    fornecedorEditar?.gestaoRisco?.planoContingencia || ''
  );
  const [fornecedorSubstitutoNome, setFornecedorSubstitutoNome] = useState(
    fornecedorEditar?.gestaoRisco?.fornecedorSubstitutoNome || ''
  );

  const [observacoes, setObservacoes] = useState(fornecedorEditar?.observacoes || '');
  const [erroCNPJ, setErroCNPJ] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddContatoAdicional = () => {
    if (!novoContatoNome.trim()) return;
    const novo: ContatoFornecedor = {
      id: `contato-${Date.now()}`,
      tipo: novoContatoTipo,
      nome: novoContatoNome.trim(),
      email: novoContatoEmail.trim(),
      telefone: novoContatoTelefone.trim(),
      cargo: novoContatoCargo.trim()
    };
    setContatosAdicionais(prev => [...prev, novo]);
    setNovoContatoNome('');
    setNovoContatoEmail('');
    setNovoContatoTelefone('');
    setNovoContatoCargo('');
  };

  const handleRemoveContato = (id: string) => {
    setContatosAdicionais(prev => prev.filter(c => c.id !== id));
  };

  const handleAddProduto = () => {
    if (!novoProdutoTag.trim()) return;
    const clean = novoProdutoTag.trim();
    if (!produtosServicos.includes(clean)) {
      setProdutosServicos(prev => [...prev, clean]);
    }
    setNovoProdutoTag('');
  };

  const handleRemoveProduto = (tag: string) => {
    setProdutosServicos(prev => prev.filter(p => p !== tag));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    const cleanCnpj = cnpj.trim();
    // Validar se CNPJ já existe cadastrado em outro fornecedor
    const cnpjExistente = fornecedoresCadastrados.find(f => 
      f.cnpj?.replace(/\D/g, '') === cleanCnpj.replace(/\D/g, '') &&
      (!fornecedorEditar || f.id !== fornecedorEditar.id)
    );

    if (cnpjExistente) {
      setErroCNPJ(`Este CNPJ já está cadastrado para "${cnpjExistente.nomeFantasia || cnpjExistente.razaoSocial}".`);
      setActiveTab('dados');
      return;
    }

    setErroCNPJ('');
    setIsSubmitting(true);

    const gestaoRisco: GestaoRiscoFornecedor = {
      monossuprimento,
      impactoQualidade,
      riscoAbastecimento,
      planoContingencia: planoContingencia.trim() || 'Plano de contingência em elaboração.',
      fornecedorSubstitutoNome: fornecedorSubstitutoNome.trim() || undefined
    };

    const payload: Fornecedor = {
      id: fornecedorEditar?.id || `forn-${Date.now()}`,
      razaoSocial: razaoSocial.trim(),
      nomeFantasia: nomeFantasia.trim() || razaoSocial.trim(),
      cnpj: cnpj.trim(),
      inscricaoEstadual: inscricaoEstadual.trim() || undefined,
      enderecoCompleto: enderecoCompleto.trim() || undefined,
      cidade: cidade.trim() || undefined,
      uf: uf.trim() || undefined,
      cep: cep.trim() || undefined,
      contatoNome: contatoNome.trim(),
      contatoEmail: contatoEmail.trim(),
      contatoTelefone: contatoTelefone.trim(),
      contatosAdicionais,
      categoria,
      subcategoria: subcategoria.trim() || undefined,
      produtosServicosFornecidos: produtosServicos,
      criticidade,
      statusQualificacao,
      dataQualificacao: fornecedorEditar?.dataQualificacao || (statusQualificacao === 'Qualificado' ? new Date().toISOString().split('T')[0] : undefined),
      notaAvaliacao: fornecedorEditar?.notaAvaliacao,
      documentos: fornecedorEditar?.documentos || [],
      qualificacaoInicial: fornecedorEditar?.qualificacaoInicial,
      fluxoAprovacao: fornecedorEditar?.fluxoAprovacao,
      historicoInspecoes: fornecedorEditar?.historicoInspecoes || [],
      ocorrenciasRNC: fornecedorEditar?.ocorrenciasRNC || [],
      planosAcao: fornecedorEditar?.planosAcao || [],
      gestaoRisco,
      historicoBloqueios: fornecedorEditar?.historicoBloqueios || [],
      auditorias: fornecedorEditar?.auditorias || [],
      reavaliacao: fornecedorEditar?.reavaliacao || {
        periodicidadeMeses: criticidade === 'Alta' ? 3 : criticidade === 'Média' ? 6 : 12,
        dataProximaReavaliacao: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'Em Dia'
      },
      historicoAvaliacoes: fornecedorEditar?.historicoAvaliacoes || [],
      observacoes: observacoes.trim(),
      atualizadoEm: new Date().toISOString()
    };

    onSave(payload);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-3xl w-full border border-slate-200 dark:border-slate-800 overflow-hidden my-8 animate-fade-in">
        
        {/* Header */}
        <div className="bg-linear-to-r from-blue-700 to-indigo-800 text-white p-5 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-white/10 rounded-xl backdrop-blur-xs">
              <Truck className="w-6 h-6 text-blue-200" />
            </div>
            <div>
              <h3 className="font-extrabold text-base tracking-tight">
                {isEditing ? `Editar Fornecedor: ${fornecedorEditar?.nomeFantasia || fornecedorEditar?.razaoSocial}` : 'Cadastrar Novo Fornecedor Têxtil (ISO 8.4)'}
              </h3>
              <p className="text-xs text-blue-100 mt-0.5">
                Cadastro Completo • Classificação • Rastreabilidade • Gestão de Riscos
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

        {/* Abas do Formulário */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('dados')}
            className={`px-4 py-2.5 text-xs font-bold transition-colors cursor-pointer border-b-2 flex items-center shrink-0 ${
              activeTab === 'dados' 
                ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-900' 
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Building2 className="w-3.5 h-3.5 mr-1.5" />
            1. Dados Cadastrais & Classificação
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('contatos')}
            className={`px-4 py-2.5 text-xs font-bold transition-colors cursor-pointer border-b-2 flex items-center shrink-0 ${
              activeTab === 'contatos' 
                ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-900' 
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Users className="w-3.5 h-3.5 mr-1.5" />
            2. Equipe de Contatos ({1 + contatosAdicionais.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('produtos')}
            className={`px-4 py-2.5 text-xs font-bold transition-colors cursor-pointer border-b-2 flex items-center shrink-0 ${
              activeTab === 'produtos' 
                ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-900' 
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5 mr-1.5" />
            3. Produtos e Serviços Fornecidos ({produtosServicos.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('riscos')}
            className={`px-4 py-2.5 text-xs font-bold transition-colors cursor-pointer border-b-2 flex items-center shrink-0 ${
              activeTab === 'riscos' 
                ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-900' 
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5 mr-1.5" />
            4. Gestão de Riscos & Contingência
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[72vh] overflow-y-auto">
          
          {/* ABA 1: DADOS CADASTRAIS & CLASSIFICAÇÃO */}
          {activeTab === 'dados' && (
            <div className="space-y-4 animate-fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">Razão Social *</label>
                  <input 
                    type="text" 
                    required
                    placeholder="Ex: Fiação e Tecelagem Vickytex S.A."
                    value={razaoSocial}
                    onChange={e => setRazaoSocial(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">Nome Fantasia *</label>
                  <input 
                    type="text" 
                    required
                    placeholder="Ex: Fiação Vickytex"
                    value={nomeFantasia}
                    onChange={e => setNomeFantasia(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">CNPJ *</label>
                  <input 
                    type="text" 
                    required
                    placeholder="00.000.000/0000-00"
                    value={cnpj}
                    onChange={e => {
                      setCnpj(e.target.value);
                      if (erroCNPJ) setErroCNPJ('');
                    }}
                    className={`w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-lg font-mono focus:ring-2 focus:ring-blue-500 ${
                      erroCNPJ ? 'border-rose-500 focus:ring-rose-500' : 'border-slate-200 dark:border-slate-700'
                    }`}
                  />
                  {erroCNPJ && (
                    <span className="text-[11px] text-rose-500 font-semibold block mt-1">
                      {erroCNPJ}
                    </span>
                  )}
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">Inscrição Estadual</label>
                  <input 
                    type="text" 
                    placeholder="Ex: 112.334.556.778"
                    value={inscricaoEstadual}
                    onChange={e => setInscricaoEstadual(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-mono focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">CEP</label>
                  <input 
                    type="text" 
                    placeholder="00000-000"
                    value={cep}
                    onChange={e => setCep(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-mono focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3.5">
                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">Endereço Completo</label>
                  <input 
                    type="text" 
                    placeholder="Rua, Número, Bairro"
                    value={enderecoCompleto}
                    onChange={e => setEnderecoCompleto(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">Cidade</label>
                  <input 
                    type="text" 
                    placeholder="Ex: Brusque"
                    value={cidade}
                    onChange={e => setCidade(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">UF</label>
                  <input 
                    type="text" 
                    maxLength={2}
                    placeholder="SC"
                    value={uf}
                    onChange={e => setUf(e.target.value.toUpperCase())}
                    className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-center uppercase focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Classificação & Criticidade */}
              <div className="pt-2 border-t border-slate-150 dark:border-slate-800">
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-3">
                  Classificação Operacional & Criticidade ISO 8.4
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  <div>
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">Categoria Principal *</label>
                    <select 
                      value={categoria}
                      onChange={e => setCategoria(e.target.value)}
                      className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 font-medium"
                    >
                      {categoriasExistentes.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">Subcategoria / Especialidade</label>
                    <input 
                      type="text" 
                      placeholder="Ex: Tingimento reativo / Overloque 4 fios"
                      value={subcategoria}
                      onChange={e => setSubcategoria(e.target.value)}
                      className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">Criticidade *</label>
                    <select 
                      value={criticidade}
                      onChange={e => setCriticidade(e.target.value as any)}
                      className={`w-full text-xs font-bold px-3 py-2 rounded-lg border ${
                        criticidade === 'Alta' ? 'bg-rose-50 text-rose-700 border-rose-300' :
                        criticidade === 'Média' ? 'bg-amber-50 text-amber-700 border-amber-300' :
                        'bg-emerald-50 text-emerald-700 border-emerald-300'
                      }`}
                    >
                      <option value="Alta">Alta (Impacto direto no produto final / cliente)</option>
                      <option value="Média">Média (Impacto operacional / processo)</option>
                      <option value="Baixa">Baixa (Insumos indiretos / suporte)</option>
                    </select>
                  </div>
                </div>

                <div className="mt-3">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">Status de Homologação Atual</label>
                  <select 
                    value={statusQualificacao}
                    onChange={e => setStatusQualificacao(e.target.value as any)}
                    className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 font-bold"
                  >
                    <option value="Qualificado">✓ Qualificado / Homologado Pleno</option>
                    <option value="Qualificado com Restrições">⚠ Qualificado com Restrições (Monitorado)</option>
                    <option value="Em Avaliação">⏳ Em Avaliação / Homologação Inicial</option>
                    <option value="Não Qualificado">✕ Não Qualificado / Reprovado</option>
                    <option value="Bloqueado">🚫 Bloqueado / Suspenso</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* ABA 2: EQUIPE DE CONTATOS */}
          {activeTab === 'contatos' && (
            <div className="space-y-4 animate-fade-in">
              {/* Contato Principal */}
              <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-150 dark:border-slate-800 space-y-3">
                <h4 className="text-xs font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider">
                  Contato Comercial Principal
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">Nome *</label>
                    <input 
                      type="text" 
                      required
                      placeholder="Ex: Guilherme Mendes"
                      value={contatoNome}
                      onChange={e => setContatoNome(e.target.value)}
                      className="w-full text-xs px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">Email *</label>
                    <input 
                      type="email" 
                      required
                      placeholder="vendas@empresa.com.br"
                      value={contatoEmail}
                      onChange={e => setContatoEmail(e.target.value)}
                      className="w-full text-xs px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">Telefone / WhatsApp *</label>
                    <input 
                      type="text" 
                      required
                      placeholder="(11) 98765-4321"
                      value={contatoTelefone}
                      onChange={e => setContatoTelefone(e.target.value)}
                      className="w-full text-xs px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg"
                    />
                  </div>
                </div>
              </div>

              {/* Contatos Adicionais (Qualidade, Técnico, Financeiro) */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center justify-between">
                  <span>Contatos por Área (Qualidade, Técnico, Financeiro, Diretoria)</span>
                  <span className="text-[10px] text-slate-400 font-normal">{contatosAdicionais.length} cadastrados</span>
                </h4>

                {/* Formulário de adicionar novo */}
                <div className="bg-blue-50/50 dark:bg-blue-950/20 p-3.5 rounded-xl border border-blue-150 dark:border-blue-900/40 grid grid-cols-1 sm:grid-cols-5 gap-2.5 items-end">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-1">Área / Tipo</label>
                    <select 
                      value={novoContatoTipo}
                      onChange={e => setNovoContatoTipo(e.target.value as any)}
                      className="w-full text-xs px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg"
                    >
                      <option value="Qualidade">Qualidade / SGQ</option>
                      <option value="Técnico">Técnico / Laboratório</option>
                      <option value="Comercial">Comercial</option>
                      <option value="Financeiro">Financeiro</option>
                      <option value="Diretoria">Diretoria</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-1">Nome</label>
                    <input 
                      type="text" 
                      placeholder="Ex: Eng. Paula"
                      value={novoContatoNome}
                      onChange={e => setNovoContatoNome(e.target.value)}
                      className="w-full text-xs px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-1">Cargo</label>
                    <input 
                      type="text" 
                      placeholder="Ex: Supervisora"
                      value={novoContatoCargo}
                      onChange={e => setNovoContatoCargo(e.target.value)}
                      className="w-full text-xs px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-1">Email / Telefone</label>
                    <input 
                      type="text" 
                      placeholder="email@empresa.com"
                      value={novoContatoEmail}
                      onChange={e => setNovoContatoEmail(e.target.value)}
                      className="w-full text-xs px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg"
                    />
                  </div>
                  <div>
                    <button
                      type="button"
                      onClick={handleAddContatoAdicional}
                      className="w-full py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center justify-center"
                    >
                      <Plus className="w-3.5 h-3.5 mr-1" />
                      Adicionar
                    </button>
                  </div>
                </div>

                {/* Lista de Contatos Adicionais */}
                {contatosAdicionais.length > 0 && (
                  <div className="space-y-2">
                    {contatosAdicionais.map(c => (
                      <div key={c.id} className="flex items-center justify-between p-2.5 bg-white dark:bg-slate-800 border border-slate-150 dark:border-slate-700 rounded-lg text-xs">
                        <div className="flex items-center space-x-2">
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700 text-[10px] font-bold text-slate-700 dark:text-slate-300">
                            {c.tipo}
                          </span>
                          <span className="font-bold text-slate-800 dark:text-slate-100">{c.nome}</span>
                          {c.cargo && <span className="text-slate-400 text-[11px]">({c.cargo})</span>}
                          <span className="text-slate-500">• {c.email || c.telefone}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveContato(c.id)}
                          className="text-rose-500 hover:text-rose-700 p-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ABA 3: PRODUTOS E SERVIÇOS FORNECIDOS */}
          {activeTab === 'produtos' && (
            <div className="space-y-4 animate-fade-in">
              <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-150 dark:border-slate-800 space-y-3">
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Itens, Artigos e Serviços Fornecidos para a Vickytex
                </h4>
                <p className="text-xs text-slate-500">
                  Cadastre as matérias-primas, malhas, tipos de costura ou insumos fornecidos para facilitar o rastreamento em auditorias e OPs.
                </p>

                <div className="flex items-center space-x-2">
                  <input 
                    type="text" 
                    placeholder="Ex: Fio Algodão 30/1 Penteado, Meia Malha Lisa, Galoneira de Gola Polo, Zíper Invisível..."
                    value={novoProdutoTag}
                    onChange={e => setNovoProdutoTag(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddProduto(); } }}
                    className="flex-1 text-xs px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddProduto}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5 mr-1" />
                    Adicionar Item
                  </button>
                </div>

                {/* Tags de Produtos */}
                <div className="pt-2">
                  {produtosServicos.length === 0 ? (
                    <div className="text-xs text-slate-400 italic p-3 text-center border border-dashed rounded-lg">
                      Nenhum item adicionado ainda. Digite acima e clique em "Adicionar Item".
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {produtosServicos.map(item => (
                        <span 
                          key={item}
                          className="inline-flex items-center px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-xs font-medium"
                        >
                          <Tag className="w-3 h-3 mr-1 text-blue-500" />
                          {item}
                          <button
                            type="button"
                            onClick={() => handleRemoveProduto(item)}
                            className="ml-2 text-blue-400 hover:text-rose-600 cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                  Instruções Técnicas & Observações Especiais
                </label>
                <textarea 
                  rows={3}
                  placeholder="Informações contratuais, peculiaridades de embarque, condições de armazenagem ou transporte..."
                  value={observacoes}
                  onChange={e => setObservacoes(e.target.value)}
                  className="w-full text-xs p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          {/* ABA 4: GESTÃO DE RISCOS & CONTINGÊNCIA */}
          {activeTab === 'riscos' && (
            <div className="space-y-4 animate-fade-in">
              <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-150 dark:border-slate-800 space-y-4">
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center">
                  <ShieldAlert className="w-4 h-4 mr-1.5 text-amber-600" />
                  Mapeamento de Riscos de Fornecimento (ISO 9001 - Cláusula 6.1 & 8.4)
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                      Impacto na Qualidade do Produto Vickytex *
                    </label>
                    <select 
                      value={impactoQualidade}
                      onChange={e => setImpactoQualidade(e.target.value as any)}
                      className="w-full text-xs px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg"
                    >
                      <option value="Crítico (Direto no Produto)">Crítico (Direto no Produto - Fio/Tecido/Peça)</option>
                      <option value="Moderado (Processo)">Moderado (Processo - Químicos/Aviamentos)</option>
                      <option value="Baixo (Suporte)">Baixo (Suporte - Embalagens/Manutenção)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                      Risco de Desabastecimento *
                    </label>
                    <select 
                      value={riscoAbastecimento}
                      onChange={e => setRiscoAbastecimento(e.target.value as any)}
                      className="w-full text-xs px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg"
                    >
                      <option value="Alto">Alto (Poucos fornecedores no mercado / Lead time longo)</option>
                      <option value="Médio">Médio (Capacidade sazonal / oscilação de matéria-prima)</option>
                      <option value="Baixo">Baixo (Múltiplas fontes de mercado disponíveis)</option>
                    </select>
                  </div>
                </div>

                <div className="pt-2">
                  <label className="flex items-center space-x-2 cursor-pointer text-xs font-semibold text-slate-700 dark:text-slate-300">
                    <input 
                      type="checkbox" 
                      checked={monossuprimento}
                      onChange={e => setMonossuprimento(e.target.checked)}
                      className="rounded text-rose-600 focus:ring-rose-500 w-4 h-4"
                    />
                    <span>Fornecedor Exclusivo / Fonte Única (Monossuprimento Crítico)?</span>
                  </label>
                  <p className="text-[11px] text-slate-400 ml-6 mt-0.5">
                    Fornecedores com monossuprimento exigem auditoria semestral obrigatória e estoque de segurança.
                  </p>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                    Fornecedor Substituto / Alternativa Homologada
                  </label>
                  <input 
                    type="text" 
                    placeholder="Ex: Tinturaria Estrela de Blumenau / Fiação Catarinense"
                    value={fornecedorSubstitutoNome}
                    onChange={e => setFornecedorSubstitutoNome(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                    Plano de Contingência Operacional *
                  </label>
                  <textarea 
                    rows={3}
                    placeholder="Descreva as medidas mitigadoras caso haja atraso grave, greve de transporte ou quebra de lote..."
                    value={planoContingencia}
                    onChange={e => setPlanoContingencia(e.target.value)}
                    className="w-full text-xs p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Rodapé com botões de navegação e salvar */}
          <div className="pt-4 border-t border-slate-150 dark:border-slate-800 flex items-center justify-between">
            <span className="text-[11px] text-slate-500">
              Todos os dados são auditados conforme ISO 9001.
            </span>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold rounded-lg transition-colors shadow-sm cursor-pointer flex items-center"
              >
                <Save className={`w-4 h-4 mr-1.5 ${isSubmitting ? 'animate-spin' : ''}`} />
                {isSubmitting ? 'Salvando...' : (isEditing ? 'Salvar Alterações' : 'Cadastrar Fornecedor')}
              </button>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
};
