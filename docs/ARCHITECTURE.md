# Arquitetura Técnica, Design System e Infraestrutura — SGQ WEB VICKYTEX (v1.2.3)

> 🟢 **FONTE OFICIAL DA VERDADE (SSOT) - ARQUITETURA E DESIGN SYSTEM**
> Este documento é a referência única para padrões arquiteturais, hierarquia de componentes, motor RBAC em tempo real e design system.
> - Para o mapeamento de coleções e documentos do banco de dados, consulte [`/docs/FIRESTORE_SCHEMA.md`](/docs/FIRESTORE_SCHEMA.md).
> - Para a matriz de rastreabilidade completa, consulte [`/docs/TRACEABILITY_MATRIX.md`](/docs/TRACEABILITY_MATRIX.md).
> - Para a regra soberana de desenvolvimento, consulte o [`Contrato de Desenvolvimento`](/docs/SGQ_DEVELOPMENT_CONTRACT.md).

## 1. Arquitetura de Software (Modular e Escalável)

O **SGQ Web Vickytex** segue uma estrutura de desenvolvimento modular (Screaming Architecture), separando as preocupações visuais, regras de negócios, controle de alçadas em tempo real e serviços de infraestrutura externa (Firebase Firestore com assinaturas em tempo real + LocalStorage Fallback e APIs do Google Workspace).

```
/src
├── assets/         # Recursos estáticos (Logotipos, vetores e ícones)
├── components/     # Componentes visuais atômicos e moleculares reaproveitáveis
│   ├── Documentos/ # Componentes da gestão documental (Detalhes, Abas, Lista Mestra, Fluxos)
│   ├── ceo/        # Painel Executivo CEO, Projetos A3/DMAIC, Ideias e Gamificação Belt
│   ├── common/     # Modais genéricos, feedbacks e componentes base
│   ├── dashboard/  # Componentes internos da tela principal e Calendário SGQ Dinâmico
│   ├── fiveS/      # Auditorias e Dashboard do Programa 5S (Radar, Fotos e Planos)
│   ├── ui/         # Elementos de UI puros (Bordas, botões customizados, badges)
│   ├── Auditorias5S.tsx
│   ├── AuditoriasNC.tsx
│   ├── Calibracao.tsx
│   ├── CentroExcelencia.tsx
│   ├── Configuracoes.tsx
│   ├── Dashboard.tsx
│   ├── DatabaseViewer.tsx
│   ├── Documentos.tsx
│   ├── Fornecedores.tsx
│   ├── GoogleIntegrationPanel.tsx
│   ├── Indicadores.tsx
│   ├── LoginScreen.tsx
│   ├── PlanosAcao.tsx
│   ├── Registros.tsx
│   ├── RelatorioCopias.tsx
│   ├── RiscosOportunidades.tsx
│   ├── SearchGlobal.tsx
│   ├── Treinamentos.tsx
│   └── UsuariosAcessos.tsx
├── contexts/       # Gerenciamento de estado global (AuthContext, ThemeContext, CEOContext)
├── firebase/       # Inicialização singleton do Firebase, Firestore e Auth
├── hooks/          # Custom hooks reaproveitáveis
├── layouts/        # Estruturas de grid e navegação da página (MainLayout, Sidebar, Header, Footer)
├── services/       # Repositórios Firebase, conectores REST/APIs e serviços do SGQ
│   ├── database/repositories/ # Alias e suíte de 21 Repositórios tipados
│   └── firebase/repositories/ # Implementações BaseRepository<T>
├── types/          # Arquivos de tipagem estrita do TypeScript (index.ts, personalizacao.ts, etc.)
└── utils/          # Funções utilitárias, calculadoras de score, datas e sementes (mockData)
```

### Decisão de Infraestrutura: Single Page Application (SPA) + Firebase Firestore & LocalStorage
O sistema é construído como uma aplicação em **React 18** compilada pelo **Vite** e integrada ao **Firebase Firestore**.
As interações com o banco de dados utilizam uma suíte de 21 repositórios fortemente tipados (`BaseRepository<T>`), oferecendo:
1. **Sincronização em Nuvem em Tempo Real (`onSnapshot`)**: Persistência global instantânea em todas as telas e estações da fábrica via Firestore.
2. **Resiliência e Fallback Offline**: Armazenamento paralelo transparente no `localStorage` do navegador para operações ininterruptas mesmo sem internet.
3. **Mecanismo Anti-Duplicação e Estado Limpo**: Desduplicação automática por `id`, atualização atômica de conjuntos de dados e suporte a rotina completa de zeramento de base.
4. **Blindagem do DOM contra Tradução Automática**: Marcação `translate="no"` e meta tag `<meta name="google" content="notranslate" />` que impede extensões e navegadores de corromper os nós de texto do Virtual DOM do React.
5. **Persistência de Configurações do Sistema (`/system_settings`)**: Armazenamento em nuvem para personalização visual, fluxos parametrizados, apontamento do Google Drive e gamificação.
6. **Painel Dinâmico "Integração com a Nuvem"**: Permite aos administradores colar ou alterar a configuração do Firebase (`firebaseConfig`) diretamente pela interface sem recompilação do código.

---

## 2. Motor de Controle de Acesso RBAC em Tempo Real (Engine RBAC v1.2.3)

O sistema conta com um motor de alçadas em tempo real com duas visões complementares gerenciadas em `UsuariosAcessos.tsx`:

### 2.1 Visão "Por Colaborador & Setor [V, C, E, X]"
- **Alçadas Granulares**: Cada colaborador possui customizações por módulo para:
  - **[V] Ver**: Permite visualizar o módulo e seus registros.
  - **[C] Criar**: Permite abrir novos cadastros (POPs, RNCs, 5W2H, etc.).
  - **[E] Editar**: Permite alterar dados, aprovar etapas ou revisar registros.
  - **[X] Excluir**: Permite excluir registros do sistema.
- **Regras de Escopo de Setor**:
  - **Restringir ao próprio setor (`apenasSetor`)**: O usuário só interage com registros do seu setor de lotação (ex: Corte, Costura).
  - **Acesso a todos os setores (`todos`)**: O usuário pode gerenciar dados de qualquer setor da empresa.
- **Reatividade Instantânea**: Alterações são salvas diretamente no documento do usuário em `/users` via `UserRepository.update()` e propagadas via `UserRepository.subscribe()`. Se o usuário logado sofrer alteração, a sessão ativa (`AuthContext`) é atualizada imediatamente via `refreshUser()`.

### 2.2 Visão "Perfis Técnicos (Roles Herdadas)"
- **Cargos Padronizados**: Administrador, Gestor, Qualidade, Supervisor, Auditor, Colaborador, Visitante.
- **Herança Global Dinâmica**: A coleção `/role_permissions` armazena a lista de seções permitidas para cada perfil técnico.
- **Validação Unificada**: A função utilitária `canUserPerform(user, permissions, moduloId, action)` consolida as permissões customizadas individuais e as permissões do perfil técnico para decidir a liberação de cada botão e rota.

---

## 3. Design System do SGQ Web Vickytex

A interface foi projetada para transmitir autoridade, clareza e conformidade industrial (indústria de uniformes escolares e profissionais).

### Paleta de Cores (ISO Color Palette)
- **Primary Azul Corporativo (`#0B3A63`)**: Utilizado para menus laterais, títulos estruturais e botões primários. Evoca confiança e credibilidade (ISO 9001).
- **Secondary Azul Ação (`#1C6DD0`)**: Utilizado para interações ativas, links, botões de edição e badges informativas de progresso.
- **Success Verde Conformidade (`#28A745`)**: Utilizado para documentos Homologados, auditorias sem conformidade, metas batidas.
- **Alert Amarelo Atenção (`#F2A900`)**: Utilizado para documentos em revisão ou processos próximos ao vencimento.
- **Error Vermelho Não-Conformidade (`#DC3545`)**: Utilizado para documentos obsoletos, não conformidades abertas e calibrações vencidas.
- **Fundo Dark Slate (`bg-slate-950` / `bg-slate-900`)**: Base industrial para o Inspetor de Banco de Dados e componentes de alta performance com contraste otimizado.

### Tipografia
- **Família Principal: Inter / Plus Jakarta Sans** — Alta legibilidade em telas de computadores industriais e dispositivos móveis.
- **Família de Dados: JetBrains Mono** — Utilizada para códigos de documentos, status de logs, consultas Firestore e visualização técnica para auditores.

---

## 4. Modelagem de Dados do Firestore (NoSQL Resiliente)

As coleções no Firebase Firestore estão estruturadas com foco em desacoplamento, indexação eficiente, suporte a `onSnapshot` e rastreabilidade histórica completa.

- **`/documents` & `/document_versions`**: Documentos da Lista Mestra e histórico imutável de revisões.
- **`/audits`, `/ncs` & `/action_plans`**: Auditorias de processo, RNCs e planos de ação 5W2H.
- **`/fives_audits`**: Auditorias do Programa 5S com pontuação dos 5 sensos, radar e evidências fotográficas.
- **`/equipments` & `/trainings`**: Instrumentos de medição calibrados e matriz de competências/polivalência.
- **`/indicators`, `/suppliers` & `/risks`**: KPIs estratégicos, qualificação de fornecedores e matriz de riscos.
- **`/users` & `/role_permissions`**: Contas de usuários corporativos, permissões customizadas `[V, C, E, X]` e matriz de perfis.
- **`/ceo_projects` & `/ceo_ideas`**: Projetos A3 de melhoria contínua, governança de portões e caixa de sugestões.
- **`/system_settings`**: Parâmetros globais em tempo real (Personalização, Fluxos, Drive, Treinamentos CEO e Gamificação).
- **`/audit_logs`**: Log imutável de ações executadas no sistema para fins de auditoria ISO.

---

## 5. Autenticação e Autorização: Google Workspace (SSO) & Engine RBAC

O SGQ Web Vickytex adota uma arquitetura de gerenciamento de identidade e controle de acesso (IAM) híbrida:

```
+-----------------------------------------------------------------+
|                    Fluxo de Acesso do Usuário                   |
+-----------------------------------------------------------------+
                                │
                                ▼
  [ 1. AUTENTICAÇÃO - Google Workspace OAuth2 / Firebase Auth ]
  - Colaborador faz login usando conta corporativa @vickytex.com.br
  - Confirmação segura de identidade via token criptográfico
                                │
                                ▼
  [ 2. SINCRONIZAÇÃO - Auto-Provisionamento & Listeners ]
  - Criação ou sincronização do registro na coleção '/users'
  - Listener onSnapshot ativo atualiza a sessão local (refreshUser)
                                │
                                ▼
  [ 3. AUTORIZAÇÃO - Engine RBAC em Tempo Real ]
  - Avaliação de canUserPerform(user, permissions, moduloId, action)
  - Resolução de alçadas [V, C, E, X] e regras de escopo de setor
  - Liberação de rotas no MainLayout e botões operacionais
```

---

## 6. Integração com Google Workspace (Drive, Calendar, Gmail)

O repositório de documentos é oficialmente integrado com o **Google Workspace**:
- Cada documento homologado no SGQ possui seu arquivo PDF correspondente hospedado com segurança no Google Drive.
- A visualização e leitura são feitas através de leitores integrados com URLs protegidas.
- Calendário SGQ Dinâmico lê as datas de auditorias, calibrações, treinamentos e planos do próprio banco de dados, sem dependência de chaves externas.


