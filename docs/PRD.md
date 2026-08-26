# Documento de Requisitos de Produto (PRD) — SGQ WEB VICKYTEX (v1.2.3)

## 1. Visão Geral do Produto
O **SGQ Web Vickytex** é uma plataforma corporativa e profissional para a Gestão da Qualidade da empresa Vickytex, voltada para a conformidade com a norma **ISO 9001:2015** no segmento de confecção têxtil de uniformes escolares e profissionais. 

Este sistema substitui planilhas isoladas do Excel e centraliza todas as informações críticas, garantindo integridade de dados, histórico de revisões, aprovações formais e rastreabilidade total exigida pelas auditorias de certificação.

---

## 2. Objetivos Estratégicos
- **Substituir a Lista Mestra em Excel**: Eliminar controles manuais, duplicidade de arquivos e o risco de utilização de documentos obsoletos.
- **Conformidade ISO 9001:2015**: Atender aos requisitos de controle de informação documentada (item 7.5), ações corretivas (item 10.2), auditorias internas (item 9.2), calibração (7.1.5), competências (7.2), indicadores (9.1.3), fornecedores (8.4), riscos (6.1) e análise crítica (9.3).
- **Integração com Google Workspace**: Aproveitar a infraestrutura corporativa existente (Google Drive e login via Google SSO).
- **Rastreabilidade Total**: Log de todas as ações de elaboração, revisão e aprovação de documentos sem nunca excluir registros anteriores.
- **Motor RBAC Granular em Tempo Real**: Alçadas customizadas de Ver [V], Criar [C], Editar [E] e Excluir [X] por colaborador e por setor, além de matriz de perfis técnicos.

---

## 3. Público-Alvo e Perfis de Usuário (Matriz RACI / Acessos em Tempo Real)

| Perfil | Descrição | Permissões Principais |
| :--- | :--- | :--- |
| **Administrador** | Gestão de TI e parametrizações globais | Acesso total e irrestrito, gerenciamento do banco de dados, matriz RBAC e logs. |
| **Qualidade** | Líder do SGQ (SGQ Admin) | Cadastro de documentos, definição de fluxos, controle de Lista Mestra e auditorias. |
| **Gestor** | Diretores e Gerentes de Áreas | Aprovação final de documentos, visualização de Dashboards estratégicos e Análise Crítica. |
| **Supervisor** | Líderes de Produção (Corte, Costura, etc.) | Elaboração, revisão técnica de POPs, controle de treinamentos operacionais e 5S. |
| **Auditor** | Auditores internos/externos | Acesso de leitura total aos documentos, relatórios, evidências e logs para auditoria. |
| **Colaborador** | Operadores, costureiras, auxiliares | Leitura de documentos homologados (via QRCode ou busca rápida), realização de treinamentos e envio de ideias. |
| **Visitante** | Acesso temporário / observador | Visualização básica restrita. |

---

## 4. Requisitos Funcionais (Módulo 1: Lista Mestra & Controle de Documentos)

### RF01 - Cadastro de Documentos (Metadados)
O sistema deve registrar cada documento com:
- **Código Único**: Ex: `POP-COR-001` (Procedimento Operacional Padrão - Setor Corte - Sequencial 001).
- **Título**: Ex: "Procedimento de Enfesto e Corte de Tecido de Malha PV".
- **Tipo de Documento**: POP, FOR (Formulário), MAN (Manual), IT (Instrução de Trabalho), LIST (Lista).
- **Setor Associado**: Administração, Corte, Costura, Estamparia, Acabamento, Expedição, Qualidade.
- **Objetivo e Descrição**: Detalhes textuais claros sobre a finalidade.
- **Status do Ciclo de Vida**: Em Elaboração, Em Revisão, Em Aprovação, Homologado, Obsoleto.
- **Revisão Corrente**: Iniciado em `00`.
- **Periodicidade de Revisão**: Em meses (ex: 12 meses).
- **Datas Cruciais**: Emissão, Aprovação e Próxima Revisão calculada.
- **Elaborador / Revisor / Aprovador**: Associação aos perfis da empresa.

### RF02 - Integração com Google Drive
- O arquivo físico PDF correspondente ao documento deve ser armazenado em uma pasta estruturada no Google Drive corporativo.
- O Firestore armazena o **Google Drive ID** e o link direto para visualização integrada.
- O sistema renderiza o PDF diretamente no painel do usuário sem necessidade de download.

### RF03 - Histórico de Revisões (Sem exclusão de dados)
- Quando uma nova revisão é criada, o registro anterior ganha status "Obsoleto" com data de expiração.
- O sistema mantém a rastreabilidade mostrando toda a linha do tempo do documento.

### RF04 - Geração Automática de QR Code
- Cada documento homologado ganha um QR Code único contendo a URL do sistema para verificação rápida de validade em dispositivos móveis na fábrica (combate ao uso de cópias obsoletas impressas).

### RF05 - Dashboard Executivo & Módulos da Qualidade Integrados
- **Indicadores Rápidos**: Total de documentos, documentos homologados, documentos vencidos ou em revisão.
- **Gráficos**: Distribuição de documentos por Setor e por Tipo.
- **Painel de Atividades**: Histórico em tempo real de ações no SGQ.
- **25 Módulos Operacionais Ativos**: Lista Mestra, Fluxos, RNCs, Planos 5W2H, Auditorias 5S, Calibração, Treinamentos, KPIs, Fornecedores, Riscos, Análise Crítica, Colaboradores, Registros, Centro de Excelência Operacional (CEO, A3, Ideias, Gamificação Belt), Usuários RBAC, Notificações, Audit Logs, Configurações, Google Drive e Inspetor de Banco de Dados.

### RF06 - Pesquisa Inteligente Global
- Campo de busca unificado que analisa código, título, palavras-chave e retorna resultados categorizados por tipo (POPs, Formulários, Não Conformidades, etc.).

---

## 5. Requisitos Não Funcionais
- **RNF01 - Segurança**: Autenticação unificada com Google SSO e controle de acesso RBAC granular.
- **RNF02 - Desempenho**: Tempo de resposta do buscador global menor que 200ms com assinaturas em tempo real via `onSnapshot` do Firebase Firestore.
- **RNF03 - Arquitetura**: Desenvolvimento modular em React 18, TypeScript e Tailwind CSS v4 com suíte de 21 repositórios desacoplados.
- **RNF04 - UI/UX**: Interface elegante, limpa, inspirada na Microsoft, SAP Fiori e ClickUp. Layout responsivo para tablets e computadores na fábrica.
- **RNF05 - Resiliência e Persistência**: Persistência dupla com salvamento atômico em Firebase Firestore e fallback offline em `localStorage`.
