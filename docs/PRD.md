# Documento de Requisitos de Produto (PRD) - SGQ Web Vickytex

## 1. Visão Geral do Produto
O **SGQ Web Vickytex** é uma plataforma corporativa e profissional para a Gestão da Qualidade da empresa Vickytex, voltada para a conformidade com a norma **ISO 9001:2015** no segmento de confecção têxtil de uniformes escolares. 

Este sistema substituirá planilhas isoladas do Excel e centralizará todas as informações críticas, garantindo a integridade dos dados, histórico de revisões, aprovações formais e rastreabilidade total exigida pelas auditorias de certificação.

---

## 2. Objetivos Estratégicos
- **Substituir a Lista Mestra em Excel**: Eliminar controles manuais, duplicidade de arquivos e o risco de utilização de documentos obsoletos.
- **Conformidade ISO 9001:2015**: Atender aos requisitos de controle de informação documentada (item 7.5), ações corretivas (item 10.2) e auditorias internas (item 9.2).
- **Integração com Google Workspace**: Aproveitar a infraestrutura corporativa existente (Google Drive, Calendar, Gmail e login via Google SSO).
- **Rastreabilidade Total**: Log de todas as ações de elaboração, revisão e aprovação de documentos sem nunca excluir registros anteriores.

---

## 3. Público-Alvo e Perfis de Usuário (Matriz RACI/Acessos)

| Perfil | Descrição | Permissões Principais |
| :--- | :--- | :--- |
| **Administrador** | Gestão de TI e parametrizações | Acesso total, configurações de sistema, logs globais. |
| **Qualidade** | Líder do SGQ (SGQ Admin) | Cadastro de documentos, definição de fluxos, controle de Lista Mestra. |
| **Gerência** | Diretores e Gerentes de Áreas | Aprovação final de documentos, visualização de Dashboards estratégicos. |
| **Supervisor** | Líderes de Produção/Corte/Costura | Elaboração, revisão técnica de POPs, controle de treinamentos operacionais. |
| **Colaborador** | Operadores, costureiras, auxiliares | Leitura de documentos homologados (via QRCode ou busca rápida), realização de treinamentos. |
| **Auditor** | Auditores internos/externos | Acesso de leitura total aos documentos, relatórios e logs para auditoria. |

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

### RF05 - Dashboard Executivo
- **Indicadores Rápidos**: Total de documentos, documentos homologados, documentos vencidos ou em revisão.
- **Gráficos**: Distribuição de documentos por Setor e por Tipo.
- **Painel de Atividades**: Histórico em tempo real de ações no SGQ.
- **Seção de Módulos Futuros**: Indicadores provisórios para Auditorias, NC (Não Conformidades), Treinamentos para demonstração de prontidão comercial.

### RF06 - Pesquisa Inteligente Global
- Campo de busca unificado que analisa código, título, palavras-chave e retorna resultados categorizados por tipo (POPs, Formulários, Não Conformidades, etc.).

---

## 5. Requisitos Não Funcionais
- **RNF01 - Segurança**: Autenticação unificada com Google SSO.
- **RNF02 - Desempenho**: Tempo de resposta do buscador global menor que 200ms.
- **RNF03 - Arquitetura**: Desenvolvimento modular em React com separação rigorosa de pastas.
- **RNF04 - UI/UX**: Interface elegante, limpa, inspirada na Microsoft, SAP Fiori e ClickUp. Layout responsivo para tablets e computadores na fábrica.
- **RNF05 - Escalabilidade**: Estrutura preparada para receber os módulos de Auditoria, Planos de Ação, Calibração e Treinamentos nas próximas sprints.
