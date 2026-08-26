# Manual de Operação do Usuário — SGQ WEB VICKYTEX (v1.2.3)

> 🟢 **FONTE OFICIAL DA VERDADE (SSOT) - OPERAÇÃO DO USUÁRIO**
> Este manual é o guia passo a passo para colaboradores, supervisores, auditores, gestores e administradores da fábrica. Para o mapa da documentação técnica, consulte [`/docs/README.md`](/docs/README.md).

## Bem-vindo ao SGQ Web Vickytex!
Este sistema foi desenvolvido especialmente para modernizar a gestão de qualidade da **Vickytex**, atendendo aos rigorosos requisitos da norma **ISO 9001:2015**. O software substitui a antiga Lista Mestra em formato Excel por um painel web ágil, seguro e integrado.

Este manual descreve de forma simples como navegar, consultar, criar e revisar documentos, gerenciar indicadores, auditar o 5S, registrar calibrações, planos 5W2H, projetos A3/Kaizen, gamificação Belt e gerenciar as alçadas de acesso em tempo real.

---

## 1. Login no Sistema (Acesso Unificado SSO)
Para acessar o sistema, você **não precisa criar ou digitar senhas**:
1. Certifique-se de estar conectado ao seu e-mail corporativo da Vickytex (Gmail corporativo ou conta do Google Workspace).
2. Na tela inicial do sistema, clique no botão **"Entrar com o Google"**.
3. O sistema reconhecerá automaticamente seu perfil de acesso (Administrador, Gestor, Qualidade, Supervisor, Auditor, Colaborador ou Visitante) e liberará as funções correspondentes à sua alçada.

---

## 2. O Painel Principal (Dashboard Executivo)
Ao fazer o login, você visualizará a central estratégica da qualidade:
- **Indicadores Principais**:
  - **Total de Documentos**: Quantidade de processos mapeados.
  - **Vencidos**: Documentos cuja data limite para revisão expirou (necessitam de ação imediata!).
  - **Em Revisão**: Documentos que estão sendo atualizados ou aguardam aprovação.
  - **Auditorias & Não Conformidades**: Indicadores de conformidade atualizados.
- **Gráficos de Desempenho**: Divisão visual dos documentos por setor de produção (Corte, Costura, Estamparia, etc.) e tipo (Procedimentos, Formulários, Instruções).
- **Calendário Integrado do SGQ (100% Dinâmico)**: Agenda que mapeia automaticamente as datas reais de auditorias agendadas, treinamentos da equipe, calibrações de instrumentos e planos de ação cadastrados no sistema. Se não houver eventos cadastrados para o período, o calendário exibirá um aviso amigável de agenda livre.
- **Atividades Recentes**: Linha do tempo mostrando quem atualizou cada processo na empresa, facilitando a rastreabilidade exigida pelos auditores da ISO.

---

## 3. Navegação na Lista Mestra de Documentos
A **Lista Mestra** é o coração do controle documental.
1. No menu esquerdo, clique em **"Lista Mestra"**.
2. **Visualizar Documento**: Clique em qualquer documento para abrir o visualizador inteligente. O sistema renderizará o PDF hospedado no Google Drive na tela e exibirá todos os dados como Elaborador, Revisor e Aprovador.
3. **Filtros Ágeis**: Filtre instantaneamente os documentos digitando o código ou selecionando o **Setor** (ex: Costura) ou o **Tipo** (ex: POP - Procedimento Operacional Padrão).
4. **QR Code de Validação**: Cada documento possui um QR Code exclusivo. Você pode imprimir essa etiqueta e afixá-la na fábrica. Qualquer colaborador pode apontar a câmera do celular para o QR Code para conferir instantaneamente se aquela instrução é a versão mais atualizada ("Válido") ou se já foi substituída ("Obsoleto").

---

## 4. Cadastro e Revisão de Documentos
Se você possui permissão de **Criar [C]** ou **Editar [E]**:
1. No painel de Lista Mestra, clique no botão **"+ Novo Documento"**.
2. Preencha os campos obrigatórios (Código, Título, Tipo, Setor, Objetivo, Periodicidade, Elaborador/Revisor/Aprovador e link do Google Drive).
3. Clique em **"Salvar"**.
4. Para atualizar um documento homologado, abra o detalhe e clique em **"Iniciar Nova Revisão"**. O sistema arquivará a versão anterior e criará o novo número de revisão (ex: de `00` para `01`) mantendo histórico completo.

---

## 5. Módulo de Não Conformidades (RNCs) e Planos de Ação 5W2H
1. **Não Conformidades**: Registro formal de desvios detectados em produtos, processos ou auditorias. Suporte completo a investigação de causa raiz (Método dos 5 Porquês e Diagrama de Ishikawa).
2. **Planos 5W2H**: Estruturação de ações corretivas e preventivas com o que será feito (What), por que (Why), onde (Where), quando (When), quem (Who), como (How) e quanto custa (How Much).

---

## 6. Programa 5S & Auditorias de Célula
1. Realização de auditorias periódicas dos 5 Sensos (Utilização, Organização, Limpeza, Saúde/Padronização e Autodisciplina).
2. Upload de fotos de evidência do chão de fábrica (Antes e Depois).
3. Cálculo automático do índice percentual de maturidade 5S e geração de planos de melhoria.

---

## 7. Metrologia & Calibração de Equipamentos (ISO 7.1.5)
1. Cadastro de instrumentos de medição (balanças, paquímetros, trenas industriais, termômetros).
2. Controle de datas de calibração, periodicidade e alertas automáticos de vencimento de certificados RBC/Inmetro.

---

## 8. Treinamentos e Matriz de Polivalência (ISO 7.2)
1. Agendamento e registro de treinamentos operacionais e capacitações da qualidade.
2. Lista de participantes e registro de horas para comprovação de competência em auditorias.

---

## 9. Melhoria Contínua, Projetos A3 e Gamificação CEO
Ao clicar em **"Melhoria Contínua"** no menu lateral:
1. **Projetos A3 / Kaizen**: Gestão visual de projetos Lean com portões de governança (Planejamento, Execução, Verificação e Padronização).
2. **Caixa de Ideias**: Espaço para envio de ideias de inovação pelos colaboradores.
3. **Gamificação Belt**: Leaderboard com cálculo de pontos, medalhas e graduação de faixas (White, Yellow, Green, Black e Master Black Belt).
4. **Lançar Horas**: Registro rápido de horas de capacitação que alimentam a pontuação do colaborador.

---

## 10. Gestão de Usuários e Matriz de Acessos RBAC em Tempo Real (Administradores)
No menu lateral, ao clicar em **"Perfis & Usuários"**:
1. **Aba "Por Colaborador & Setor [V, C, E, X]"**:
   - Permite ajustar permissões granulares para cada colaborador:
     - **[V] Ver**: Libera a visualização do módulo.
     - **[C] Criar**: Libera o botão de novo cadastro.
     - **[E] Editar**: Libera edição e homologações.
     - **[X] Excluir**: Libera exclusão de registros.
   - **Regra de Setor**: Alterne entre **"Restrito ao próprio setor"** (ex: o supervisor do corte só altera registros do corte) ou **"Todos os setores"** (acesso amplo à fábrica).
   - **Reatividade Instantânea**: O clique salva na hora no Firestore e atualiza a tela e o menu lateral imediatamente.
2. **Aba "Perfis Técnicos (Roles Herdadas)"**:
   - Ajusta a lista de módulos padrão liberados para cada cargo (Administrador, Gestor, Qualidade, Supervisor, Auditor, Colaborador, Visitante).

---

## 11. Banco de Dados & Integração com a Nuvem (Administradores)
No menu lateral, ao clicar em **"Banco de Dados"**:
1. **Painel Admin**: Monitoramento de memória, limpeza de cache, logs da aplicação e exportação/importação de dados JSON.
2. **Explorador de Coleções**: Visualização em tempo real de todas as 21 coleções no Firebase Firestore.
3. **Integração com a Nuvem**:
   - Permite colar o trecho de código `firebaseConfig` para conectar um novo projeto Firebase.
   - Botão **"Copiar Configuração"** para replicar as credenciais em outros computadores da fábrica.


