/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  ShieldCheck, 
  FileText, 
  CheckCircle2, 
  RefreshCw, 
  KeyRound, 
  Mail, 
  Eye, 
  EyeOff, 
  User, 
  ArrowRight, 
  Sparkles, 
  ShieldAlert, 
  Lock,
  Sun,
  Moon
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { getPersonalizacaoGeral, PersonalizacaoGeral } from '../utils/mockData';
import { motion, AnimatePresence } from 'motion/react';

interface LoginScreenProps {
  personalizacao?: PersonalizacaoGeral;
}

const PRESET_ACCOUNTS = [
  {
    name: 'Rodrigo Berto',
    email: 'qualidade@vickytex.com.br',
    role: 'Administrador',
    password: 'mariana2026',
    desc: 'Gestor do SGQ, controle de documentos, parametrizações e auditorias.',
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Rodrigo',
    color: 'border-blue-500/20 hover:border-blue-500 bg-blue-50/40 dark:bg-blue-950/20',
    badge: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300'
  },
  {
    name: 'Julia',
    email: 'julia@vickytex.com.br',
    role: 'Administrador',
    password: 'julia2026',
    desc: 'Gestão da Qualidade, aprovações estratégicas e administração geral.',
    avatar: 'https://api.dicebear.com/7.x/lorelei/svg?seed=Julia',
    color: 'border-emerald-500/20 hover:border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/20',
    badge: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
  }
];

export const LoginScreen: React.FC<LoginScreenProps> = ({ personalizacao: propPersonalizacao }) => {
  const { loginWithGoogle, loginWithEmail, isLoggingIn } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const personalizacao = propPersonalizacao || getPersonalizacaoGeral();
  
  // Tab: E-mail/Senha por padrão
  const [activeTab, setActiveTab] = useState<'password' | 'quick'>('password');
  
  // State do formulário
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [showSupportModal, setShowSupportModal] = useState(false);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    
    if (!email) {
      setErrorMsg('Por favor, informe seu e-mail corporativo.');
      return;
    }
    if (!password) {
      setErrorMsg('Por favor, digite sua senha de acesso.');
      return;
    }
    
    const success = await loginWithEmail(email, password);
    if (success) {
      setSuccessMsg('Acesso autorizado! Iniciando o SGQ Vickytex...');
    } else {
      setErrorMsg('E-mail ou senha incorretos. Verifique as credenciais ou use o Acesso Rápido.');
    }
  };

  const getLatestPassword = (acc: typeof PRESET_ACCOUNTS[0]) => {
    try {
      const savedUsersStr = localStorage.getItem('sgq_vickytex_users');
      if (savedUsersStr) {
        const savedUsers = JSON.parse(savedUsersStr);
        const found = savedUsers.find((u: any) => u.email.toLowerCase() === acc.email.toLowerCase());
        if (found && (found.passwordHash || found.password)) {
          return found.passwordHash || found.password;
        }
      }
    } catch (e) {
      // ignore
    }
    return acc.password;
  };

  const handleQuickLogin = async (acc: typeof PRESET_ACCOUNTS[0]) => {
    setErrorMsg('');
    setSuccessMsg('');
    const targetPass = getLatestPassword(acc);
    const success = await loginWithEmail(acc.email, targetPass);
    if (success) {
      setSuccessMsg(`Autenticado como ${acc.name}! Redirecionando...`);
    } else {
      setErrorMsg('Falha ao autenticar com o perfil rápido.');
    }
  };

  const fillCredentialsAndSwitch = (acc: typeof PRESET_ACCOUNTS[0]) => {
    setEmail(acc.email);
    setPassword(getLatestPassword(acc));
    setActiveTab('password');
    setErrorMsg('');
    setSuccessMsg('');
  };

  return (
    <div id="login-viewport" className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col lg:flex-row font-sans">
      
      {/* Coluna Esquerda: Apresentação Institucional Vickytex SGQ */}
      <div id="login-brand-panel" className="lg:w-1/2 xl:w-7/12 bg-[#0B3A63] text-white p-8 md:p-16 flex flex-col justify-between relative overflow-hidden shrink-0">
        
        {/* Background Ambient Vector Lines */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        {/* Brand Header */}
        <div className="relative flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-[#0B3A63] font-black text-lg shadow-lg">
            {personalizacao?.nomeEmpresa ? personalizacao.nomeEmpresa.substring(0, 2).toUpperCase() : 'VI'}
          </div>
          <div>
            <h1 className="text-base font-extrabold tracking-widest">{personalizacao?.nomeEmpresa || 'VICKYTEX'}</h1>
            <p className="text-[10px] text-blue-200 font-bold font-mono tracking-wider">SISTEMA DE GESTÃO DA QUALIDADE</p>
          </div>
        </div>

        {/* Core Value Proposition */}
        <div className="relative my-auto space-y-8 max-w-xl py-12 lg:py-0">
          <div className="inline-flex items-center space-x-2 bg-white/10 px-3.5 py-1.5 rounded-full text-xs font-bold text-blue-100 border border-white/10 backdrop-blur-xs">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>{personalizacao?.loginBadge || "Em conformidade com a ISO 9001:2015"}</span>
          </div>

          <div className="space-y-4">
            <h2 className="text-3xl md:text-4xl xl:text-5xl font-extrabold tracking-tight leading-tight">
              {personalizacao?.loginTitulo || "A evolução do SGQ Vickytex começa aqui."}
            </h2>
            <p className="text-sm md:text-base text-blue-100 leading-relaxed font-light">
              {personalizacao?.loginDescricao || "Ecossistema web modular SGQ Vickytex. Controle documentos, vistorias, não conformidades e processos têxteis em tempo real."}
            </p>
          </div>

          {/* Key Advantages Checklist */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 border-t border-white/15">
            <div className="flex items-start space-x-2.5 text-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-white">{personalizacao?.loginVantagem1Titulo || "Lista Mestra Inteligente"}</p>
                <p className="text-blue-200 text-[11px] mt-0.5 font-light">{personalizacao?.loginVantagem1Desc || "Procedimentos, instruções e formulários sob controle rígido e assinaturas eletrônicas."}</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-2.5 text-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-white">{personalizacao?.loginVantagem2Titulo || "Rastreabilidade Absoluta"}</p>
                <p className="text-blue-200 text-[11px] mt-0.5 font-light">{personalizacao?.loginVantagem2Desc || "Controle estrito de cópias físicas (auditorias) e histórico completo de revisões."}</p>
              </div>
            </div>

            <div className="flex items-start space-x-2.5 text-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-white">{personalizacao?.loginVantagem3Titulo || "Auditorias Digitais & NCs"}</p>
                <p className="text-blue-200 text-[11px] mt-0.5 font-light">{personalizacao?.loginVantagem3Desc || "Gestão de Não Conformidades, Planos 5W2H e Auditorias 5S integradas."}</p>
              </div>
            </div>

            <div className="flex items-start space-x-2.5 text-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-white">{personalizacao?.loginVantagem4Titulo || "QR Code Integrado"}</p>
                <p className="text-blue-200 text-[11px] mt-0.5 font-light">{personalizacao?.loginVantagem4Desc || "Postos com acesso imediato à versão vigente dos documentos."}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Brand copyright */}
        <div className="relative text-xs text-blue-200/60 font-medium">
          <p>{personalizacao?.loginFooterEsquerdoLinha1 || "© 2026 Vickytex — Uniformes escolares."}</p>
          <p className="mt-0.5 text-[10px] font-light">{personalizacao?.loginFooterEsquerdoLinha2 || "Desenvolvido seguindo as diretrizes estruturais de auditoria Têxtil ISO 9001."}</p>
        </div>

      </div>

      {/* Coluna Direita: Painel de Autenticação */}
      <div id="login-auth-panel" className="lg:w-1/2 xl:w-5/12 bg-white dark:bg-slate-900 flex flex-col justify-between p-8 md:p-16 overflow-y-auto">
        
        {/* Top Header / Suporte */}
        <div className="text-right text-xs flex justify-between items-center mb-8">
          <span className="text-slate-400 font-mono text-[11px]">{personalizacao?.loginVersaoTexto || "SGQ WEB • v1.0.0"}</span>
          <div className="flex items-center space-x-4">
            {/* Theme Toggle Button */}
            <button
              type="button"
              onClick={toggleTheme}
              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors cursor-pointer bg-transparent border-0 outline-hidden flex items-center justify-center"
              title="Alternar Tema"
            >
              {theme === 'dark' ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
            </button>
            <button 
              type="button" 
              onClick={() => setShowSupportModal(true)} 
              className="text-[#0B3A63] dark:text-blue-400 hover:underline font-bold cursor-pointer bg-transparent border-0 outline-hidden"
            >
              Suporte TI
            </button>
          </div>
        </div>

        {/* Área de Login */}
        <div className="my-auto max-w-md w-full mx-auto space-y-6">
          <div className="space-y-2">
            <h3 className="text-2xl font-black text-slate-800 dark:text-slate-100 flex items-center space-x-2">
              <span>{personalizacao?.loginDireitaTitulo || "Acesse o Portal SGQ"}</span>
              <Sparkles className="w-5 h-5 text-amber-500 fill-amber-500 animate-pulse" />
            </h3>
            <p className="text-xs text-slate-400 dark:text-slate-400">
              {personalizacao?.loginDireitaSubtitulo || "Informe suas credenciais de e-mail e senha corporativa para acessar o portal."}
            </p>
          </div>

          {/* Mensagens de Feedback */}
          <AnimatePresence mode="wait">
            {errorMsg && (
              <motion.div 
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 p-3 rounded-xl flex items-start space-x-2 text-rose-700 dark:text-rose-400 text-xs"
              >
                <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </motion.div>
            )}

            {successMsg && (
              <motion.div 
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/50 p-3 rounded-xl flex items-start space-x-2 text-emerald-700 dark:text-emerald-400 text-xs"
              >
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{successMsg}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Formulário E-mail e Senha */}
          <div className="min-h-[220px]">
            <AnimatePresence mode="wait">
              <motion.form
                key="form-password"
                onSubmit={handlePasswordSubmit}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.15 }}
                className="space-y-4 py-2"
              >
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block">E-mail Corporativo</label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                      <input 
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="nome@vickytex.com.br"
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#0B3A63] focus:border-transparent transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block">Senha do Portal</label>
                    <div className="relative">
                      <KeyRound className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                      <input 
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Digite sua senha de acesso"
                        className="w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#0B3A63] focus:border-transparent transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoggingIn}
                    className="w-full py-3 bg-[#0B3A63] hover:bg-[#082b4a] dark:bg-blue-600 dark:hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center space-x-2 cursor-pointer"
                  >
                    {isLoggingIn ? (
                      <RefreshCw className="w-4 h-4 animate-spin text-white" />
                    ) : (
                      <>
                        <span>Autenticar no Portal</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </motion.form>

            </AnimatePresence>
          </div>

          <div className="text-[10px] text-slate-400 leading-normal text-center bg-slate-50 dark:bg-slate-800/10 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/40 font-light">
            {personalizacao?.loginComplianceTexto || "Acesso exclusivo a colaboradores autorizados da Vickytex. Todo acesso, alteração documental e auditoria são registrados e auditáveis pela comissão de conformidade em atendimento ao item 7.5 de Informação Documentada da ISO 9001."}
          </div>
        </div>

        {/* Rodapé Direita */}
        <div className="text-center text-[10px] text-slate-400 font-medium mt-8 pt-4 border-t border-slate-100 dark:border-slate-800/50">
          {personalizacao?.loginFooterDireitoTexto || "SGQ WEB VICKYTEX • Netlify Production Build Ready"}
        </div>

      </div>

      {/* Support Modal (Popup) */}
      <AnimatePresence>
        {showSupportModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSupportModal(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs"
            />
            {/* Modal Box */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl relative z-10 space-y-4"
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center space-x-2.5">
                  <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center text-blue-600 dark:text-blue-400">
                    <Sparkles className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <h4 className="text-sm font-extrabold text-slate-800 dark:text-slate-100">
                      {personalizacao?.loginSuporteContatoTitulo || "Suporte Técnico TI - Vickytex"}
                    </h4>
                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">SGQ Central de Ajuda</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowSupportModal(false)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors cursor-pointer"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/20 p-4 rounded-xl border border-slate-100 dark:border-slate-800 font-light">
                {personalizacao?.loginSuporteContatoTexto || "Se você perdeu sua senha de acesso, precisa redefinir suas credenciais corporativas, ou quer reportar uma instabilidade, fale com o suporte pelo e-mail suporte@vickytex.com.br ou abra um chamado pelo ramal interno 4100."}
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowSupportModal(false)}
                  className="px-4 py-2 bg-[#0B3A63] hover:bg-[#082b4a] dark:bg-blue-600 dark:hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all shadow-sm cursor-pointer"
                >
                  Entendi, Fechar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
