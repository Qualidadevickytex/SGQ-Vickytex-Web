# CONTRATO DE DESENVOLVIMENTO DO SGQ WEB VICKYTEX
## Diretriz de Governança de Código, Arquitetura e Engenharia de Software

Este documento estabelece o **Contrato de Desenvolvimento Oficial (a "Constituição")** para o sistema **SGQ WEB VICKYTEX**. Ele serve como a única referência obrigatória e imutável para todas as futuras implementações, extensões, manutenções ou modificações no ecossistema do software.

Qualquer desenvolvedor ou agente de inteligência artificial que atuar neste repositório está **estritamente obrigado** a seguir as regras, padrões, arquiteturas e restrições aqui contidas.

---

## 1. Objetivo do Projeto

O **SGQ WEB VICKYTEX** é uma plataforma corporativa integrada de alta performance voltada para a gestão de conformidade industrial, rastreabilidade e garantia de qualidade (ISO 9001 e sub-requisitos de manufatura de vestuário/uniformes escolares). O objetivo principal do projeto é prover um ambiente unificado, offline-first resiliente e de alta usabilidade que garanta conformidade documental, auditorias rastreáveis e monitoramento de indicadores em tempo real.

Este documento tem por finalidade formalizar os padrões técnicos já existentes para impedir o surgimento de "AI Slop" (padrões genéricos de baixa qualidade), fragmentação arquitetural ou regressões de funcionalidades homologadas.

---

## 2. Arquitetura Oficial do Sistema

A infraestrutura e stack tecnológica homologada do sistema compreende os seguintes componentes principais:

*   **React (v18.x / v19.x):** Biblioteca declarativa principal utilizando componentes funcionais estritos baseados em React Hooks. Todas as renderizações e fluxos de dados de tela devem seguir os ciclos de vida modernos do React.
*   **Vite (v6.2.3):** Bundler ultra-rápido para o ambiente de desenvolvimento e build de produção de Single Page Application (SPA).
*   **TypeScript (~v5.8.2):** Linguagem de tipagem estática obrigatória. O compilador está configurado para emitir erros em caso de tipagens ausentes ou implicitamente fracas (`any` sem justificativa).
*   **Tailwind CSS (v4.x):** Motor de estilização visual baseado em classes utilitárias. A importação é feita no arquivo global por meio de `@import "tailwindcss";`. Nenhum CSS personalizado ou folha separada é permitida, exceto as especificadas nas diretrizes de design do sistema.
*   **Firebase Firestore NoSQL + Suíte de 21 Repositórios Tipados:** Camada de banco de dados nativa em tempo real (`onSnapshot`) e com fallback transparente para `localStorage`. O backend gerencia autenticação, controle de permissões por roles/colaborador, documentos estruturados e logs imutáveis de auditoria.
*   **Google Workspace (OIDC SSO):** Protocolo corporativo de login único (Single Sign-On). A autenticação é restrita ao domínio corporativo `@vickytex.com.br`.
*   **Google Drive API (v3):** Repositório físico seguro para PDFs dos Procedimentos Operacionais Padrão (POPs), instruções de trabalho (ITs) e formulários. A integração mapeia e sincroniza identificadores físicos de arquivos (`googleDriveId`) diretamente com a base de dados.
*   **Cloud Run / Netlify CDN:** Plataforma de hospedagem oficial para distribuição estática global com compactação e certificado SSL.

---

## 3. Estrutura Oficial de Diretórios

O projeto segue estritamente a arquitetura de módulos autônomos e separação de responsabilidades (Separation of Concerns). Nenhuma pasta nova na raiz deve ser criada sem aprovação.

```
/ (Raiz do Projeto)
├── .env.example                     # Modelo das variáveis de ambiente obrigatórias
├── .gitignore                       # Ignora builds, node_modules e arquivos temporários
├── package.json                     # Manifesto do projeto e dependências homologadas
├── tsconfig.json                    # Configuração de compilação estrita do TypeScript
├── vite.config.ts                   # Configurações do Vite e servidores locais de desenvolvimento
│
├── /docs/                           # Repositório de Documentações Técnicas e de Usuário
│   ├── README.md                    # PORTAL CENTRAL & SSOT MAP (Ponto de entrada obrigatório)
│   ├── ARCHITECTURE.md              # Visão geral da arquitetura do software
│   ├── CHANGELOG.md                 # Histórico imutável de versões e migrations (v1.0.0)
│   ├── DEPLOYMENT.md                # Diretrizes de build, Netlify e Cloud Run deploy
│   ├── IMPLEMENTATION_STANDARD.md   # Padrão de desenvolvimento e guias de UI/UX anti-slop
│   ├── MANUAL_TECNICO.md            # Manual técnico de instalação e manutenção
│   ├── MANUAL_USUARIO.md            # Manual operacional do usuário final
│   ├── FIRESTORE_SCHEMA.md          # SSOT de Coleções, documentos, regras e tipos Firestore
│   ├── PRD.md                       # Documento de Especificação de Requisitos de Produto
│   ├── SGQ_DEVELOPMENT_CONTRACT.md  # Este Contrato (Constituição do Projeto)
│   └── TRACEABILITY_MATRIX.md       # Matriz de Rastreabilidade Módulo ➔ Código ➔ Banco ➔ Doc
│
└── /src/                            # Código-Fonte do Aplicativo
    ├── App.tsx                      # Componente central, roteador e orquestrador de estado global
    ├── main.tsx                     # Ponto de entrada de renderização DOM do React
    ├── index.css                    # Estilos globais e configurações de tema do Tailwind CSS
    │
    ├── /assets/                     # Recursos visuais estáticos (Logos, imagens, vetores)
    │
    ├── /components/                 # Componentes Visuais React
    │   ├── /Documentos/             # Componentes modulares da Gestão Documental (Lista Mestra)
    │   ├── /fiveS/                  # Componentes do Programa 5S (Dashboard, Audits, Action Plans)
    │   ├── Auditorias5S.tsx         # Tela central e gerenciador de Auditorias 5S
    │   ├── AuditoriasNC.tsx         # Tela e controles de Não Conformidades (ISO 10218 / 9001)
    │   ├── Calibracao.tsx           # Tela de Controle de Equipamentos e Instrumentos de Medição
    │   ├── Configuracoes.tsx        # Painel de parametrização dinâmica de metas e visuais
    │   ├── Dashboard.tsx            # Painel central consolidado com indicadores gerenciais
    │   ├── DatabaseViewer.tsx       # Monitor de integridade do Banco de Dados Prisma, caches e logs
    │   ├── Documentos.tsx           # Tela de entrada do módulo de Gestão Documental
    │   ├── Fornecedores.tsx         # Tela de Avaliação e Qualificação de Fornecedores (ISO 8.4)
    │   ├── GoogleIntegrationPanel.tsx # Monitor de conexões com Google Drive e Workspace
    │   ├── Indicadores.tsx          # Gestão e gráficos de Indicadores de Qualidade por setor
    │   ├── LoginScreen.tsx          # Interface de autenticação segura baseada em SSO
    │   ├── PlanosAcao.tsx           # Gerenciador de Planos de Ação corporativos (5W2H)
    │   ├── Registros.tsx            # Gestão e controle de registros arquivados (ISO 7.5.3)
    │   ├── RelatorioCopias.tsx      # Rastreabilidade de cópias físicas controladas
    │   ├── RiscosOportunidades.tsx  # Matriz de Gestão de Riscos (ISO 9001:2015)
    │   ├── SearchGlobal.tsx         # Painel de busca e indexação global do SGQ
    │   ├── Treinamentos.tsx         # Matriz de Treinamentos e Competências (ISO 7.2)
    │   └── UsuariosAcessos.tsx      # Gestão de perfis e níveis de acessos de usuários (RBAC)
    │
    ├── /contexts/                   # Estados globais (Ex: Tema Dark/Light, Auth Context)
    ├── /layouts/                    # Grids estruturais de tela, Sidebar e Navegação Principal
    │
    ├── /services/                   # Serviços e Conectores de Infraestrutura Externa
    │   ├── api.types.ts             # Tipos de respostas unificadas de API (ApiResponse)
    │   ├── audit.service.ts         # Orquestrador de auditorias de NC e logs de sistema
    │   ├── cache.service.ts         # Motor de cache em memória local com expiração TTL (120s)
    │   ├── errorHandler.ts          # Normalizador unificado de exceções e erros HTTP
    │   ├── /auth/                   # Lógica de login, escuta de tokens e expiração de sessões
    │   ├── /dashboard/              # Queries agregadas para montagem rápida do painel central
    │   ├── /google/                 # Conectores OAuth2 com Google Drive e Google Sheets
    │   └── /database/               # Cliente Prisma e Repositórios de dados
    │       ├── client.ts            # Inicialização e exportação da instância única do SDK do PB
    │       └── /repositories/       # Abstrações de acesso a dados (Repository Pattern)
    │           ├── base.repository.ts       # Classe base genérica com fallback offline
    │           ├── audit.repository.ts      # Repositório de Auditorias de NC
    │           ├── document.repository.ts   # Repositório de metadados de Documentos
    │           ├── fiveS.repository.ts      # Repositório de Auditorias do Programa 5S
    │           ├── indicator.repository.ts  # Repositório de metas e leituras de Indicadores
    │           ├── supplier.repository.ts   # Repositório de parceiros e Notas de Fornecedores
    │           ├── training.repository.ts   # Repositório de Matrizes de Treinamento
    │           └── user.repository.ts       # Repositório de Perfis e Permissões de Usuário
    │
    ├── /types/                      # Arquivos de Tipagem Estrita do TypeScript (.ts)
    │   └── [modulo].ts              # Interfaces estruturais de cada entidade do SGQ
    │
    └── /utils/                      # Funções utilitárias e geradores de mockData
```

---

## 4. Convenções de Código Existentes

Qualquer adição de código deve refletir exatamente as convenções consolidadas do sistema. **É expressamente proibido adotar estilos que fujam aos seguintes critérios:**

### 4.1 Nomenclaturas
*   **Arquivos de Componentes (.tsx):** PascalCase (ex: `DatabaseViewer.tsx`, `FiveSAudits.tsx`).
*   **Arquivos de Serviços, Repositórios e Utilitários (.ts):** camelCase (ex: `base.repository.ts`, `cache.service.ts`).
*   **Interfaces e Tipos:** PascalCase (ex: `Auditoria5S`, `DocumentoMetadata`).
*   **Constantes e Enums:** UPPER_CASE ou PascalCase para o enum e UPPER_CASE para seus membros (ex: `enum DocumentoStatus { HOMOLOGADO = 'Homologado' }`).

### 4.2 Organização de Componentes React 19
Todos os componentes funcionais do sistema devem respeitar a seguinte ordem de escrita para manter a uniformidade de leitura:
1.  **Imports:** Primeiramente bibliotecas externas (React, Motion, Lucide), seguidas de caminhos internos (Serviços, Tipos, Sub-componentes).
2.  **Definição de Tipos / Interfaces:** Tipagem estrita das Props do componente.
3.  **Corpo do Componente:**
    *   Definições de Hooks de estado (`useState`, `useRef`).
    *   Definições de Hooks de efeitos colaterais (`useEffect` - com dependências estritas de tipos primitivos para evitar loops).
    *   Handlers de eventos (ex: `handleSubmit`, `handleDelete` - devidamente anotados e tipados).
    *   Retorno JSX/TSX sem componentes aninhados declarados dentro do mesmo escopo de função.

### 4.3 Padrão das Tipagens e Interfaces (`src/types/`)
*   Todas as propriedades vindas do banco de dados devem ser tipadas exatamente conforme o schema.
*   Evitar uso de `any` em tipagens de produção. Em casos específicos onde a tipagem é muito dinâmica ou genérica, deve-se usar Generics (`<T>`) ou `unknown`.

### 4.4 Padrão de Serviços (`src/services/`)
*   Devem ser declarados como classes singleton ou funções exportadas puras.
*   Retornos de chamadas de rede ou queries complexas devem sempre retornar a interface unificada `ApiResponse<T>` definida em `api.types.ts`:
    ```typescript
    export interface ApiResponse<T> {
      success: boolean;
      data: T;
      error?: string;
      timestamp: string;
    }
    ```

### 4.5 Padrão de Repositórios (`src/services/repositories/`)
*   Todos os repositórios de dados devem ser padronizados.
*   Eles devem implementar os métodos padrão CRUD e tratamento resiliente de contingência.

---

## 5. Regras Obrigatórias e Proibições Estritas

Este sistema possui certificação interna de conformidade. Com o objetivo de mitigar falhas operacionais críticas, aplicam-se as seguintes restrições absolutas de engenharia:

1.  **Proibido Alterar Módulos Homologados:** Toda e qualquer lógica de negócio que esteja funcionando perfeitamente em produção (Documentos, 5S, Treinamentos, Indicadores, Fornecedores, Riscos) não pode ser alterada ou refatorada sem aprovação prévia detalhada.
2.  **Proibido Alterar Layouts e Identidade Visual:** O sistema segue um Design System específico descrito no `ARCHITECTURE.md`. Geração de interfaces com cores fora da paleta corporativa (`#0B3A63`, `#1C6DD0`, `#28A745`), cantos excessivamente arredondados (>16px), gradientes desnecessários, "glassmorphism", neon ou temas que desrespeitem a paleta atual são estritamente considerados falha de conformidade (AI Slop).
3.  **Proibido Criar ou Alterar Componentes de UI sem Motivo:** Não invente novas variações de botões, inputs, modais ou tabelas caso já existam componentes ou estilos globais consolidados nos arquivos de componentes.
4.  **Proibido Alterar Permissões Existentes:** O modelo de permissões baseados em perfis (Administrador, Qualidade, Supervisor, Auditor, Colaborador) é crítico e define os níveis de visibilidade de dados no frontend e no backend. Modificações que burlem este RBAC para facilitar acesso temporário são estritamente banidas.
5.  **Proibido Alterar Integrações Existentes:** As conexões e tokens do Google Drive e Google Workspace SSO não devem ser alterados de suas rotas e payloads homologados para evitar interrupções de rastreabilidade de arquivos e logins corporativos.

---

## 6. Diretrizes de Reutilização de Código

O princípio da **Reutilização Extrema** é um pilar deste Contrato de Desenvolvimento. Antes de digitar uma única linha de código novo, o desenvolvedor deve escanear o projeto em busca de componentes, services, repositories ou hooks já implementados:

*   **Tabelas e Listagens:** Utilizar as estruturas de grids de Tailwind, filtros unificados de busca e paginação embutidos em arquivos como `Documentos.tsx` e `AuditoriasNC.tsx`.
*   **Formulários e Inputs:** Reutilizar o design e estilos de validação de formulários presentes no projeto, tais como inputs estilizados com foco cinza, bordas nítidas sem cantos arredondados gigantes, e validação de erros com texto vermelho `text-sm text-red-500`.
*   **Modais de Cadastro/Edição:** Reutilizar os modelos de modais responsivos com desfoque de fundo (`backdrop-blur-sm`), títulos claros, botões alinhados à direita e botão de fechar (`X`) no canto superior direito.
*   **Serviços de Cache e Erro:** Usar obrigatoriamente `cacheService` para evitar requisições redundantes de APIs de consulta lenta e `ErrorHandler` para centralizar as mensagens de erro ao usuário.

---

## 7. Desenvolvimento de Novos Módulos

Se houver solicitação explícita para o desenvolvimento de um novo módulo no SGQ WEB VICKYTEX:

1.  **Respeito aos Padrões Existentes:** O módulo deve ser planejado para utilizar as estruturas atuais.
2.  **Definição do Tipo:** Criar um arquivo correspondente dentro de `/src/types/[novoModulo].ts` detalhando a interface de dados e os enums do módulo de forma estrita.
3.  **Desenvolvimento do Repositório:** Criar `/src/services/repositories/[novoModulo].repository.ts`.
4.  **Sincronização de Estado:** Integrar o repositório no index.ts de repositórios e instanciar seu carregamento síncrono no carregador central (`App.tsx`).
5.  **Uso de Layout e Componentes:** Acoplar as novas interfaces visuais dentro do layout de navegação lateral (Sidebar) e cabeçalhos já homologados do sistema, preservando o fluxo SPA.

---

## 8. Checklist Pré-Desenvolvimento (Obrigatório)

Antes de implementar qualquer alteração, o desenvolvedor (ou IA) deve responder mentalmente e documentar em seu CoT o seguinte checklist de conformidade:

*   [ ] Já existe um componente visual semelhante que realiza essa renderização ou ação?
*   [ ] Já existe um Service ou Repository que consome ou escreve dados nessa tabela ou coleção?
*   [ ] Esse código desrespeita alguma regra visual do Design System (Gradients artificiais, cantos incorretos, contraste fraco)?
*   [ ] O tratamento de erros de API está utilizando a estrutura unificada `ErrorHandler.handle(error)`?
*   [ ] A tipagem de dados foi definida de forma estrita em `/src/types/` ou herda tipos primitivos seguros?

Se houver itens reutilizáveis disponíveis, **eles devem ser importados e estendidos**, sendo vetada a duplicação de lógicas semelhantes.

---

## 9. Política de Alterações e Modificação de Código

Para modificar qualquer arquivo de produção homologado existente (como `App.tsx`, `Dashboard.tsx`, `Documentos.tsx` etc.), o desenvolvedor deve justificar com clareza a intervenção, analisando previamente:

1.  **Arquivo:** Qual arquivo exato será modificado.
2.  **Motivo:** Qual o problema técnico ou solicitação explícita do usuário motivou a alteração.
3.  **Impacto:** Quais outros módulos que importam ou dependem deste arquivo serão afetados.
4.  **Risco de Regressão:** Se há chance de quebrar lógicas de filtragem, estados reativos, persistência de dados local ou sincronização.
5.  **Justificativa Técnica:** Por que essa modificação cirúrgica foi escolhida em vez de criar um utilitário isolado ou estender uma herança existente.

---

## 10. Relatório de Implementação e Entrega

Toda modificação realizada ou nova funcionalidade inserida deve, ao término de sua compilação bem-sucedida, apresentar ao comitê de qualidade ou usuário um relatório estruturado informando exatamente:

1.  **Arquivos Criados:** Lista de novos componentes, repositórios ou tipos criados.
2.  **Arquivos Alterados:** Lista de modificações cirúrgicas em arquivos homologados.
3.  **Componentes Reutilizados:** Quais modais, botões, tabelas ou formulários padrão foram reaproveitados.
4.  **Repositories e Services Reutilizados:** Quais provedores de dados herdados da camada de infraestrutura foram consumidos.
5.  **Confirmação de Integridade do Padrão:** Declaração explícita de conformidade de que o Design System e padrões TypeScript foram mantidos sem adição de redundâncias ("AI Slop").
6.  **Garantia de Regressão Zero:** Teste lógico e visual declarando que nenhum módulo homologado preexistente sofreu alteração colateral ou perdeu suas funcionalidades normais.

---

## 11. Conclusão

Este Contrato é o documento supremo de qualidade técnica do **SGQ WEB VICKYTEX**. Ele protege o investimento de código do sistema, garante que o software se mantenha extremamente rápido, escalável, livre de bugs de regressão e operável por qualquer engenheiro de qualidade têxtil ou de software.

**Desenvolva com rigor. Preze pela reutilização extrema. Mantenha o padrão.**
