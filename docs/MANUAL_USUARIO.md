# Manual de Operação do Usuário — SGQ WEB VICKYTEX (v1.2.2)

> 🟢 **FONTE OFICIAL DA VERDADE (SSOT) - OPERAÇÃO DO USUÁRIO**
> Este manual é o guia passo a passo para colaboradores, supervisores, auditores, gestores e administradores da fábrica. Para o mapa da documentação técnica, consulte [`/docs/README.md`](/docs/README.md).

## Bem-vindo ao SGQ Web Vickytex!
Este sistema foi desenvolvido especialmente para modernizar a gestão de qualidade da **Vickytex**, atendendo aos rigorosos requisitos da norma **ISO 9001:2015**. O software substitui a antiga Lista Mestra em formato Excel por um painel web ágil, seguro e integrado.

Este manual descreve de forma simples como navegar, consultar, criar e revisar documentos, gerenciar os indicadores de qualidade da fábrica, acompanhar os projetos de melhoria contínua e a gamificação do CEO, além de realizar a configuração do banco de dados na nuvem.

---

## 1. Login no Sistema (Acesso Unificado SSO)
Para acessar o sistema, você **não precisa criar ou digitar senhas**:
1. Certifique-se de estar conectado ao seu e-mail corporativo da Vickytex (Gmail corporativo ou conta do Google Workspace).
2. Na tela inicial do sistema, clique no botão **"Entrar com o Google"**.
3. O sistema reconhecerá automaticamente seu perfil de acesso (Administrador, Gestão, Qualidade, Supervisor ou Colaborador) e liberará as funções correspondentes à sua função.

---

## 2. O Painel Principal (Dashboard Executivo)
Ao fazer o login, você visualizará a central estratégica da qualidade, que inclui:
- **Indicadores Principais**:
  - **Total de Documentos**: Quantidade de processos mapeados.
  - **Vencidos**: Documentos cuja data limite para revisão expirou (necessitam de ação imediata!).
  - **Em Revisão**: Documentos que estão sendo atualizados ou aguardam aprovação.
  - **Auditorias & Não Conformidades**: Indicadores de conformidade atualizados.
- **Gráficos de Desempenho**: Divisão visual dos documentos por setor de produção (Corte, Costura, Estamparia, etc.) e tipo (Procedimentos, Formulários, Instruções).
- **Calendário Integrado do SGQ**: Agenda dinâmica em tempo real que mapeia automaticamente as datas de auditorias agendadas, treinamentos da equipe e calibrações de instrumentos cadastradas no sistema. Se não houver eventos cadastrados para o período, o calendário exibirá um aviso amigável de agenda livre.
- **Atividades Recentes**: Linha do tempo mostrando quem atualizou cada processo na empresa, facilitando a rastreabilidade exigida pelos auditores da ISO.

---

## 3. Navegação na Lista Mestra de Documentos
A **Lista Mestra** é o coração do controle documental.
1. No menu esquerdo, clique em **"Lista Mestra"**.
2. **Visualizar Documento**: Clique em qualquer documento para abrir o visualizador inteligente. O sistema renderizará o PDF hospedado no Google Drive na tela e exibirá todos os dados como Elaborador, Revisor e Aprovador.
3. **Filtros Ágeis**: Filtre instantaneamente os documentos digitando o código ou selecionando o **Setor** (ex: Costura) ou o **Tipo** (ex: POP - Procedimento Operacional Padrão).
4. **QR Code de Validação**: Cada documento possui um QR Code exclusivo. Você pode imprimir essa etiqueta e afixá-la na fábrica (ex: na mesa de corte ou bancadas de costura). Qualquer colaborador pode apontar a câmera do celular para o QR Code para conferir instantaneamente se aquela instrução é a versão mais atualizada ("Válido") ou se já foi substituída ("Obsoleto").

---

## 4. Cadastro de Novo Documento (Exclusivo para Gestores e Qualidade)
Se você possui o perfil de **Qualidade** ou **Gerência**, poderá adicionar documentos:
1. No painel de Lista Mestra, clique no botão **"+ Novo Documento"**.
2. Preencha os campos obrigatórios:
   - **Código**: Exemplo `POP-COS-003` (Procedimento Operacional Padrão - Costura - Sequencial 3).
   - **Título**: Exemplo "Procedimento de Costura de Gola Polo".
   - **Tipo e Setor**: Selecione nas opções.
   - **Objetivo**: Descrição sucinta do propósito do processo.
   - **Periodicidade**: Tempo para revisão periódica (ex: 12 meses).
   - **Elaborador/Revisor/Aprovador**: Vincule as contas responsáveis.
   - **Link do Google Drive**: Cole o link do arquivo PDF homologado na pasta oficial do Drive.
3. Clique em **"Salvar"**. O sistema gerará o registro e notificará os envolvidos sobre a nova vigência.

---

## 5. Como Atualizar ou Revisar um Documento (Controle de Revisões)
A ISO 9001:2015 exige que documentos antigos **nunca sejam apagados**.
1. No detalhe de um documento ativo, clique no botão **"Iniciar Nova Revisão"**.
2. Insira o **Motivo da Revisão** (ex: "Inclusão de máquina de travete automática para reforço de costura").
3. O sistema elevará o número da revisão automaticamente (ex: de `00` para `01`), manterá o arquivo antigo arquivado no histórico de revisões anteriores para fins de auditoria, e publicará a nova versão como o documento vigente.

---

## 6. Pesquisa Rápida Inteligente
No cabeçalho do sistema, há um campo de **Pesquisa Global**. 
- Digite qualquer termo (ex: "malha", "gola", "POP", "corte") para obter resultados imediatos divididos entre documentos operacionais, auditorias, não conformidades e equipamentos vinculados ao termo pesquisado.

---

## 7. Módulo de Melhoria Contínua & Gamificação CEO
Ao clicar em **"Melhoria Contínua"** no menu lateral, colaboradores e gestores acessam a suíte do Centro de Excelência Operacional (CEO):
1. **Projetos A3 e Kaizen**: Acompanhamento de projetos Lean por setor, metas de economia e progresso das etapas.
2. **Caixa de Ideias**: Registro de sugestões de inovação por qualquer colaborador.
3. **Gamificação Belt & Lançamento de Horas**:
   - **Graduação Belt**: O sistema calcula a pontuação acumulada (White Belt, Yellow Belt, Green Belt, Black Belt, Master Black Belt) com base em cursos, projetos concluídos e horas de treinamento.
   - **Lançar Horas**: Botão no topo da tela para registrar horas de treinamento técnico de cada colaborador.
   - **Manutenção de Pontuação (Gestores)**: Opção de zerar pontuações em auditorias anuais com recurso de restauração garantida.

---

## 8. Banco de Dados & Integração com a Nuvem (Administradores)
No menu lateral, ao clicar em **"Banco de Dados"**, os administradores têm acesso a três módulos principais:
1. **Painel Admin**: Monitoramento de memória, limpeza de cache, logs da aplicação e exportação/importação de dados em formato JSON.
2. **Explorador de Coleções**: Visualização em tempo real de todas as coleções no Firebase Firestore (`/documents`, `/audits`, `/fives_audits`, etc.), tamanho das cargas úteis e consulta detalhada dos documentos.
3. **Integração com a Nuvem**:
   - Permite colar o trecho de código do projeto Firebase (`firebaseConfig`) e extrair automaticamente as chaves de API.
   - Salva a conexão na nuvem para acesso compartilhado em toda a fábrica.
   - Fornece botão de cópia formatada para replicar as credenciais em outros computadores.
   - Apresenta um guia passo a passo ilustrado para criação de projetos no Firebase Console e regras de segurança do Firestore.

