# Histórico de Alterações (Changelog) — SGQ WEB VICKYTEX

> 🟢 **REGISTRO HISTÓRICO DE RELEASES E MIGRATIONS**
> Todas as atualizações significativas de versão, alterações em banco de dados, migrações e sincronizações da documentação devem ser registradas aqui.

---

## [v1.2.0] - 2026-08-07 (Migração para Firebase Firestore + LocalStorage Resiliente & Painel de Integração com a Nuvem)

### 🚀 Destaques da Arquitetura Firebase + Cloud Integration
- **Persistência Global e Multiusuário com Firebase Firestore**:
  - Implementada a suíte completa de Repositórios Firebase (`src/services/firebase/repositories/`): `audit.repository.ts`, `base.repository.ts`, `ceo.repository.ts`, `document.repository.ts`, `fiveS.repository.ts`, `indicator.repository.ts`, `notification.repository.ts`, `supplier.repository.ts`, `training.repository.ts` e `user.repository.ts`.
  - Estruturadas e sincronizadas todas as coleções nativas do Firestore: `/documents`, `/document_versions`, `/audit_logs`, `/audits`, `/fives_audits`, `/indicators`, `/suppliers`, `/trainings`, `/ceo_projects`, `/users`, `/notifications` e `/settings`.
- **Mecanismo Anti-Duplicação e Fallback Resiliente Offline**:
  - Implementada substituição atômica de arrays e desduplicação por `id` em `base.repository.ts`, `fiveS.repository.ts` e componentes de auditoria 5S (`FiveSAudits.tsx`), garantindo atualização consistente sem duplicatas em modo online e offline.
  - Sincronização e fallback transparente para `localStorage` quando a conexão com o Firebase estiver indisponível ou em fase de configuração.
- **Painel de Integração com a Nuvem (`DatabaseViewer.tsx`)**:
  - Adicionada a nova aba **"Integração com a Nuvem"** no Inspetor de Banco de Dados (`DatabaseViewer.tsx`).
  - **Auto-Parser de `firebaseConfig`**: Permite colar o bloco de código JavaScript do console do Firebase e extrair automaticamente `apiKey`, `authDomain`, `projectId`, `storageBucket`, `messagingSenderId` e `appId`.
  - **Sincronização entre Estações**: Armazenamento seguro das credenciais em `localStorage` (`vickytex_custom_firebase_config`) com botão para copiar a configuração formatada e colar nos demais computadores da fábrica.
  - **Guia Passo a Passo**: Tutorial interativo detalhando a criação de projeto no Firebase, ativação do Firestore em modo de produção, configuração de regras de segurança (`firestore.rules`) e ativação de autenticação anônima.
- **Padronização Visual Anti-Slop (Dark Mode Slate & Emerald)**:
  - Unificada a estilização de todas as abas do `DatabaseViewer.tsx` (Painel Admin, Explorador de Coleções e Integração) utilizando palette escura industrial com `bg-slate-950`, `bg-slate-900`, `border-slate-800` e destaques em Emerald/Blue.
- **Sincronização Completa de Documentação**:
  - Atualizada toda a suíte de 11 documentos em `/docs` (`README.md`, `ARCHITECTURE.md`, `FIRESTORE_SCHEMA.md`, `MANUAL_TECNICO.md`, `MANUAL_USUARIO.md`, `TRACEABILITY_MATRIX.md`, `DEPLOYMENT.md`, `PRD.md`, `SGQ_DEVELOPMENT_CONTRACT.md`, `IMPLEMENTATION_STANDARD.md`).

---

## [v1.1.0] - 2026-07-29 (Migração Completa de Camada de Dados: PocketBase -> Prisma ORM + SQLite)

### 🚀 Destaques da Migração do Banco de Dados
- **Substituição Completa da Camada de Persistência**:
  - Removida integralmente a dependência do PocketBase (SDK, AuthStore, `pb.collection()`, `pb_migrations`).
  - Instalado e configurado o **Prisma ORM (v5.22.0)** utilizando **SQLite** (`prisma/sgq.db`) como mecanismo relacional de alta performance e baixa latência.
- **Modelagem Relacional de Dados (`prisma/schema.prisma`)**:
  - Mapeadas as **22 entidades** da aplicação: `User`, `Role`, `Permission`, `RolePermission`, `Department`, `DocumentType`, `Document`, `DocumentVersion`, `DocumentFile`, `DocumentDistribution`, `DocumentReading`, `Audit`, `FiveSAudit`, `Indicator`, `Supplier`, `Training`, `CEOProject`, `CEOIdea`, `CEOGamification`, `Notification`, `AuditLog`, e `Setting`.
- **Refatoração Completa da Camada de Repositórios & Serviços**:
  - Refatorados todos os repositórios em `src/services/database/repositories/` para utilizar o singleton Prisma Client (`src/lib/prisma.ts`), mantendo fallback gracioso offline para `localStorage`.
  - Refatorados `document.service.ts` com `prisma.$transaction`, `revision.service.ts`, `audit.service.ts`, `ceo.service.ts`, `user.service.ts`, `dashboard.service.ts`, `notification.service.ts` e integrações Google Workspace.
- **Contexto de Autenticação & Visualizador**:
  - Refatorado `src/contexts/AuthContext.tsx` removendo qualquer acoplamento com PocketBase AuthStore.
  - Atualizado `DatabaseViewer.tsx` para exibir a arquitetura atualizada com Prisma ORM e métricas SQLite.
- **Preservação de Regras e Interface**:
  - Mantidos 100% intactos os fluxos de negócio, componentes React, permissões RBAC, layout visual e rotas do sistema.
  - Testes e compilação final (`lint_applet` e `compile_applet`) executados com **zero erros**.

---

## [v1.0.3] - 2026-07-29 (Reescrita Integral da Camada de Migrations para PocketBase v0.39.7 & Standalone Seed Data)

### 🚀 Destaques da Reescrita de Migrações
- **Reescrita Integral do Zero**: Reconstruída toda a camada de migrações em `pb_migrations/` sem reaproveitamento de código antigo, garantindo conformidade total com as especificações oficiais do PocketBase v0.39.7.
- **Isolamento de Carga Inicial (Standalone Seed Data)**:
  - Criado o arquivo independente `pb_migrations/20260729000000_seed_data.js` para gerenciar 100% da carga inicial de registros.
  - Carga automatizada e isolada para: `roles` (7 papéis), `permissions` (9 permissões granulares), `role_permissions` (24 vínculos de matriz RBAC) e `settings` (3 parâmetros globais do sistema).
  - Removida qualquer criação de registros de dentro das migrações de esquemas de coleções.
- **Pipeline de Migrations em 5 Etapas Encadeadas**:
  1. `20260717000000_initial_schema.js`: Coleções base e alteração da coleção nativa `users`.
  2. `20260722000000_ceo_schema.js`: Coleções do módulo CEO (`ceo_projects`, `ceo_ideas`).
  3. `20260728000000_operational_schema.js`: Coleções operacionais complementares (7 coleções).
  4. `20260728000001_rbac_rules.js`: Aplicação de regras de acesso API Rules/RBAC.
  5. `20260729000000_seed_data.js`: Carga inicial de dados de referência via `new Record()` e `app.save()`.
- **Eliminação Completa de APIs Depreciadas**:
  - Removidas chamadas a `db.saveCollection()`, `db.saveRecord()`, `SchemaField` e instanciacões legadas.
  - Utilizados exclusivamente `new Collection(...)`, `new Record(...)`, `app.save(...)` e `app.delete(...)`.
- **Validação de Up/Down Rollback**:
  - Testada e validada a execução dos comandos de migração (Up e Down) sem erros e com limpeza completa no rollback.
- **Atualização da Documentação SSOT**:
  - Atualizados `POCKETBASE_SCHEMA.md`, `TRACEABILITY_MATRIX.md` e `CHANGELOG.md`.

---

## [v1.0.2] - 2026-07-28 (Atualização da Infraestrutura PocketBase para a Versão 0.39.7 & Desacoplamento do RBAC)

### 🚀 Destaques da Migração de Infraestrutura
- **Reestruturação da Ordem de Execução do Pipeline de Migrations**:
  1. **Criação de Coleções & Estrutura**: As coleções e campos das migrations iniciais (`20260717000000_initial_schema.js`, `20260722000000_ceo_schema.js`, `20260728000000_operational_schema.js`) são instanciadas com regras de API básicas, eliminando dependências circulares entre coleções (como `@collection.role_permissions.role`).
  2. **Relacionamentos & Índices**: Criação de todas as chaves estrangeiras e índices compostos em ambiente livre de restrições relacionais.
  3. **Dados Seed**: Inserção de registros de referência (`roles`, `permissions`, `role_permissions`).
  4. **Aplicação de API Rules RBAC**: Criada a nova migration dedicada `20260728000001_rbac_rules.js` que roda por último e aplica todas as regras de controle de acesso complexas e filtros granulares por permissão.
- **Migração Completa para a API Oficial do PocketBase v0.39.7**:
  - Atualizadas todas as migrations em `pb_migrations/` para eliminar APIs e construtores obsoletos (`db.saveCollection()`, `db.saveRecord()`, `SchemaField`, etc.).
  - Migrado o parâmetro global de execução das migrations de `(db)` para `(app)`.
  - Substituídas chamadas legadas de persistência por `app.save(collection)` e `app.save(record)`.
  - Substituída a propriedade descontinuada `schema` por `fields` com mapeamento plano de tipos (`text`, `number`, `bool`, `date`, `select`, `relation`, `json`, `file`), mantendo `schema` para retrocompatibilidade.
  - Atualizado o método de alteração da coleção nativa `users` para utilizar a API `usersCollection.fields.add()`.
  - Atualizada a função de rollback (down migration) utilizando `app.delete(collection)`.
- **Garantia de Integridade e Conformidade**:
  - Preservadas integralmente todas as regras de negócio, nomes de coleções (22 coleções), nomes de campos, relacionamentos, regras de segurança RBAC, componentes React, repositórios e serviços.
  - Validada a execução ponta a ponta dos comandos `pocketbase migrate up` e `pocketbase migrate down` em ambiente de teste simulado PocketBase v0.39.7.

---

## [v1.0.1] - 2026-07-28 (Auditoria & Sincronização Integral da Camada PocketBase)

### 🚀 Destaques da Auditoria & Sincronização
- **Auditoria End-to-End da Camada de Dados**:
  - Realizada verificação automatizada entre `pb_migrations/`, código de serviços (`src/services/`), repositórios (`src/services/pocketbase/repositories/`), visualizadores (`DatabaseViewer.tsx`) e documentação (`POCKETBASE_SCHEMA.md`, `TRACEABILITY_MATRIX.md`).
- **Sincronização do Banco de Dados Físico**:
  - Criada a nova migração `pb_migrations/20260728000000_operational_schema.js` adicionando as 7 coleções operacionais que faltavam nas migrations (`document_readings`, `audits`, `fives_audits`, `indicators`, `suppliers`, `trainings`, `ceo_gamification`).
  - Total de **22 coleções físicas no PocketBase** perfeitamente migradas, mapeadas e operacionais.
- **Correção de Divergências de Código**:
  - Unificado `src/services/audit.service.ts` para persistir e consultar na coleção oficial `audit_logs` (corrigindo o nome legado `activity_logs`), alinhando os nomes de campos com a migration física.
- **Sincronização SSOT**:
  - Atualizado `POCKETBASE_SCHEMA.md` com o mapeamento das 22 coleções físicas e regras de API.
  - Atualizado `TRACEABILITY_MATRIX.md` relacionando os 17 módulos funcionais aos seus respectivos componentes, repositórios e coleções físicas.

---

## [v1.0.0] - 2026-07-27 (Release Oficial da Versão Homologada)

### 🚀 Destaques da Versão
- **Atualização Global de Identidade de Versão**:
  - Atualizado todo o ecossistema e componentes de UI para exibir `SGQ WEB v1.0.0`.
  - Auto-migração transparente do `localStorage` e dados salvos de versões legadas (`SGQ WEB v0.3`) para `v1.0.0`.
- **Implantação do Sistema de Governança Documental**:
  - Criado o portal central de documentação em [`/docs/README.md`](/docs/README.md).
  - Estabelecida a arquitetura SSOT (Single Source of Truth) para eliminar redundâncias e conflitos.
  - Criada a Matriz de Rastreabilidade End-to-End em [`/docs/TRACEABILITY_MATRIX.md`](/docs/TRACEABILITY_MATRIX.md).
  - Criado o documento SSOT do banco de dados PocketBase em [`/docs/POCKETBASE_SCHEMA.md`](/docs/POCKETBASE_SCHEMA.md).
- **Aprimoramento da Interface de Configurações**:
  - Renomeado e clareado o item de menu "Parâmetros Auxiliares" para **"Configurações (Parâmetros)"** no menu lateral (`MainLayout.tsx`) e na tabela de permissões (`UsuariosAcessos.tsx`).

### 🛠️ Modificações no Código e Infraestrutura
- `src/utils/mockData.ts`:
  - Atualizada a propriedade `versaoSistema` no `DEFAULT_PERSONALIZACAO` de `"SGQ WEB v0.3"` para `"SGQ WEB v1.0.0"`.
  - Atualizada a propriedade `loginVersaoTexto` para `"SGQ WEB • v1.0.0"`.
  - Adicionada lógica de autocorreção em `getPersonalizacaoGeral()` para converter chaves legadas e salvar o novo estado sem perdas.
- `src/layouts/MainLayout.tsx`:
  - Fallback visual atualizado para `'SGQ WEB v1.0.0'`.
  - Rótulo de menu atualizado para `'Configurações (Parâmetros)'`.
- `src/components/SearchGlobal.tsx`:
  - Fallback no modal de pesquisa global atualizado para `'SGQ WEB v1.0.0'`.
- `src/components/LoginScreen.tsx`:
  - Fallback no login atualizado para `'SGQ WEB • v1.0.0'`.
- `src/components/Registros.tsx`:
  - Rodapé de impressão de relatórios atualizado para `'SGQ Vickytex Web v1.0.0'`.

---

## [v0.3.0] - 2026-07-22 (Expansão Painel CEO & Gamificação)

### 🚀 Destaques da Versão
- **Módulo Gestão CEO**:
  - Implementação de `ProjetoViewCEO.tsx`, `DashboardCEO.tsx`, `SugestoesCEO.tsx` e `GamificacaoCEO.tsx`.
- **Banco de Dados**:
  - Adicionada a migração `pb_migrations/20260722000000_ceo_schema.js` com suporte a projetos Kaizen/Lean A3, caixa de sugestões e pontuação de engajamento dos colaboradores.

---

## [v0.1.0] - 2026-07-17 (Release Inicial do Banco Relacional e Migrações)

### 🚀 Destaques da Versão
- **Estrutura Base do PocketBase**:
  - Adicionada a migração `pb_migrations/20260717000000_initial_schema.js` com a criação de 19 coleções base para documentos, revisões, auditorias, 5S, calibrações, treinamentos e fornecedores.
- **Modo Híbrido Resiliente**:
  - Implementação da camada de repositórios com suporte a fallback offline em `LocalStorage`.
