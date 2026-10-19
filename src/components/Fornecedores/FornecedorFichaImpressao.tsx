/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  Printer, 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Award, 
  Building2, 
  ShieldCheck,
  Calendar
} from 'lucide-react';
import { Fornecedor } from '../../types/supplier';
import { calcularEstatisticasReaisFornecedor } from '../../utils/supplierEvaluationEngine';

interface FornecedorFichaImpressaoProps {
  fornecedor: Fornecedor;
  onClose: () => void;
}

export const FornecedorFichaImpressao: React.FC<FornecedorFichaImpressaoProps> = ({
  fornecedor,
  onClose
}) => {
  const stats = calcularEstatisticasReaisFornecedor(fornecedor);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto print:p-0 print:bg-white print:static">
      <div className="bg-white text-slate-900 rounded-2xl shadow-2xl max-w-4xl w-full border border-slate-200 overflow-hidden my-6 print:border-none print:shadow-none print:max-w-none print:m-0">
        
        {/* Barra superior de ações (oculta na impressão) */}
        <div className="bg-slate-900 text-white p-4 flex items-center justify-between print:hidden">
          <div className="flex items-center space-x-2">
            <Award className="w-5 h-5 text-emerald-400" />
            <span className="font-bold text-sm">Visualização de Impressão • Ficha Cadastral & Homologação ISO 9001</span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-colors flex items-center cursor-pointer shadow-sm"
            >
              <Printer className="w-4 h-4 mr-1.5" />
              Imprimir / Salvar PDF
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Conteúdo da Ficha Técnica para Impressão */}
        <div className="p-8 space-y-6 font-sans">
          
          {/* Cabeçalho Oficial Vickytex */}
          <div className="border-b-2 border-slate-900 pb-4 flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-slate-500">
                VICKYTEX INDÚSTRIA TÊXTIL LTDA • SISTEMA DE GESTÃO DA QUALIDADE
              </span>
              <h1 className="text-xl font-black text-slate-900 tracking-tight">
                FICHA DE HOMOLOGAÇÃO & DESEMPENHO DE FORNECEDOR (ISO 9001:2015 - 8.4)
              </h1>
              <p className="text-xs text-slate-600">
                Controle de Processos, Produtos e Serviços Providos Externamente
              </p>
            </div>
            <div className="text-right border border-slate-300 p-2.5 rounded-lg bg-slate-50">
              <span className="text-[10px] block font-mono text-slate-500">CÓDIGO DOC:</span>
              <span className="text-xs font-bold font-mono">FOR-SUP-084</span>
              <span className="text-[10px] block font-mono text-slate-500 mt-1">EMISSÃO:</span>
              <span className="text-xs font-bold font-mono">{new Date().toLocaleDateString('pt-BR')}</span>
            </div>
          </div>

          {/* Dados Gerais da Empresa */}
          <div className="space-y-2">
            <h2 className="text-xs font-extrabold uppercase tracking-wider bg-slate-100 p-1.5 border-l-4 border-slate-800">
              1. IDENTIFICAÇÃO DO FORNECEDOR
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs border border-slate-200 p-3 rounded-lg">
              <div>
                <span className="text-[10px] text-slate-500 block uppercase">Razão Social:</span>
                <span className="font-bold text-slate-800">{fornecedor.razaoSocial}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block uppercase">Nome Fantasia:</span>
                <span className="font-bold text-slate-800">{fornecedor.nomeFantasia}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block uppercase">CNPJ:</span>
                <span className="font-mono font-bold text-slate-800">{fornecedor.cnpj}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block uppercase">Inscrição Estadual:</span>
                <span className="font-mono font-bold text-slate-800">{fornecedor.inscricaoEstadual || 'Isento / Não inf.'}</span>
              </div>
              <div className="sm:col-span-2">
                <span className="text-[10px] text-slate-500 block uppercase">Endereço Completo:</span>
                <span className="text-slate-800">{fornecedor.enderecoCompleto || 'Não informado'} - {fornecedor.cidade}/{fornecedor.uf}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block uppercase">Categoria Têxtil:</span>
                <span className="font-bold text-slate-800">{fornecedor.categoria}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block uppercase">Criticidade:</span>
                <span className={`font-bold ${fornecedor.criticidade === 'Alta' ? 'text-rose-700' : 'text-slate-800'}`}>
                  {fornecedor.criticidade}
                </span>
              </div>
            </div>
          </div>

          {/* Status e Indicadores Operacionais Reais */}
          <div className="space-y-2">
            <h2 className="text-xs font-extrabold uppercase tracking-wider bg-slate-100 p-1.5 border-l-4 border-slate-800">
              2. DESEMPENHO OPERACIONAL & IQF (DADOS REAIS DE INSPEÇÕES)
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 border border-slate-200 p-3 rounded-lg text-xs">
              <div className="text-center p-2 bg-slate-50 rounded border border-slate-150">
                <span className="text-[10px] text-slate-500 block uppercase">Status Homologação</span>
                <span className="text-xs font-bold text-slate-900 mt-1 block">{fornecedor.statusQualificacao}</span>
              </div>
              <div className="text-center p-2 bg-slate-50 rounded border border-slate-150">
                <span className="text-[10px] text-slate-500 block uppercase">IQF Atual (Geral)</span>
                <span className="text-lg font-black font-mono text-slate-900 mt-0.5 block">{stats.iqfGeral}%</span>
                <span className="text-[10px] font-semibold text-slate-600">Faixa {stats.faixaIQF}</span>
              </div>
              <div className="text-center p-2 bg-slate-50 rounded border border-slate-150">
                <span className="text-[10px] text-slate-500 block uppercase">Taxa de Aprovação Lotes</span>
                <span className="text-lg font-black font-mono text-slate-900 mt-0.5 block">{stats.taxaAprovacao}%</span>
                <span className="text-[10px] text-slate-500">{stats.lotesAprovados} de {stats.totalLotes} lotes</span>
              </div>
              <div className="text-center p-2 bg-slate-50 rounded border border-slate-150">
                <span className="text-[10px] text-slate-500 block uppercase">Pontualidade (OTIF)</span>
                <span className="text-lg font-black font-mono text-slate-900 mt-0.5 block">{stats.taxaPontualidade}%</span>
                <span className="text-[10px] text-slate-500">{stats.entregasNoPrazo} entregas no prazo</span>
              </div>
            </div>
          </div>

          {/* Produtos e Serviços Fornecidos */}
          {fornecedor.produtosServicosFornecidos && fornecedor.produtosServicosFornecidos.length > 0 && (
            <div className="space-y-1">
              <h3 className="text-[11px] font-bold uppercase text-slate-700">Artigos e Serviços Homologados:</h3>
              <p className="text-xs text-slate-800 bg-slate-50 p-2 rounded border border-slate-200">
                {fornecedor.produtosServicosFornecidos.join(' • ')}
              </p>
            </div>
          )}

          {/* Histórico das Últimas Inspeções */}
          <div className="space-y-2">
            <h2 className="text-xs font-extrabold uppercase tracking-wider bg-slate-100 p-1.5 border-l-4 border-slate-800">
              3. REGISTROS RECENTES DE INSPEÇÃO DE RECEBIMENTO
            </h2>
            {fornecedor.historicoInspecoes && fornecedor.historicoInspecoes.length > 0 ? (
              <table className="w-full text-left text-xs border border-slate-200 border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <th className="p-2">Lote</th>
                    <th className="p-2">Data</th>
                    <th className="p-2">Quantidade</th>
                    <th className="p-2">Resultado</th>
                    <th className="p-2">Defeito (%)</th>
                    <th className="p-2">Observações</th>
                  </tr>
                </thead>
                <tbody>
                  {fornecedor.historicoInspecoes.slice(0, 5).map(insp => (
                    <tr key={insp.id} className="border-b border-slate-200">
                      <td className="p-2 font-mono font-bold">{insp.numeroLote}</td>
                      <td className="p-2 font-mono">{insp.dataRecebimento}</td>
                      <td className="p-2 font-mono">{insp.quantidadeRecebida} {insp.unidade}</td>
                      <td className="p-2 font-bold">{insp.resultado}</td>
                      <td className="p-2 font-mono">{insp.taxaDefeitoPercentual}%</td>
                      <td className="p-2 text-slate-600">
                        {insp.parametrosTexteis?.itensParametros && insp.parametrosTexteis.itensParametros.length > 0 ? (
                          <div className="space-y-0.5 text-[10px]">
                            {insp.parametrosTexteis.itensParametros.slice(0, 3).map((it, idx) => (
                              <div key={idx}>
                                <strong>{it.nome}:</strong> {it.valorResultado} {it.unidadeMedida} (Padrão: {it.valorPadrao} {it.unidadeMedida}) - {it.statusConformidade}
                              </div>
                            ))}
                            {insp.observacoes && <p className="italic mt-0.5">{insp.observacoes}</p>}
                          </div>
                        ) : (
                          insp.observacoes || '-'
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-xs text-slate-500 italic">Nenhum lote registrado.</p>
            )}
          </div>

          {/* Documentos e Certificações */}
          <div className="space-y-2">
            <h2 className="text-xs font-extrabold uppercase tracking-wider bg-slate-100 p-1.5 border-l-4 border-slate-800">
              4. CERTIFICAÇÕES & DOCUMENTAÇÃO LEGAL VIGENTE
            </h2>
            {fornecedor.documentos && fornecedor.documentos.length > 0 ? (
              <table className="w-full text-left text-xs border border-slate-200 border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <th className="p-2">Tipo de Documento</th>
                    <th className="p-2">Título</th>
                    <th className="p-2">Nº Registro</th>
                    <th className="p-2">Validade</th>
                    <th className="p-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {fornecedor.documentos.map(doc => (
                    <tr key={doc.id} className="border-b border-slate-200">
                      <td className="p-2 font-bold">{doc.tipo}</td>
                      <td className="p-2">{doc.titulo}</td>
                      <td className="p-2 font-mono">{doc.numeroDocumento || '-'}</td>
                      <td className="p-2 font-mono">{doc.dataValidade || 'Indeterminada'}</td>
                      <td className="p-2 font-semibold">{doc.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-xs text-slate-500 italic">Nenhum documento cadastrado.</p>
            )}
          </div>

          {/* Assinaturas Formais ISO 9001 */}
          <div className="pt-8 border-t-2 border-slate-900 grid grid-cols-3 gap-6 text-center text-xs">
            <div className="space-y-8">
              <div className="border-b border-slate-400 pb-1"></div>
              <div>
                <span className="font-bold text-slate-800 block">Garantia da Qualidade</span>
                <span className="text-[10px] text-slate-500">Vickytex Têxtil</span>
              </div>
            </div>
            <div className="space-y-8">
              <div className="border-b border-slate-400 pb-1"></div>
              <div>
                <span className="font-bold text-slate-800 block">Gestão de Suprimentos / Compras</span>
                <span className="text-[10px] text-slate-500">Vickytex Têxtil</span>
              </div>
            </div>
            <div className="space-y-8">
              <div className="border-b border-slate-400 pb-1"></div>
              <div>
                <span className="font-bold text-slate-800 block">Diretoria Industrial</span>
                <span className="text-[10px] text-slate-500">Homologação Final</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
