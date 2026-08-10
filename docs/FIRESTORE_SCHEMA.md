# Especificação Oficial do Esquema de Banco de Dados — Firebase Firestore

> 🟢 **SINGLE SOURCE OF TRUTH (SSOT) — CAMADA DE DADOS FIRESTORE**
> Este documento é a única fonte oficial sobre a modelagem de dados no **Firebase Firestore** do **SGQ WEB VICKYTEX (v1.2.0)**.

---

## 1. Visão Geral da Arquitetura de Persistência

O **SGQ WEB Vickytex** adota o **Firebase Firestore** como mecanismo principal de banco de dados NoSQL orientada a documentos, combinado com uma engine de resiliência e fallback offline para `localStorage`.

### Módulo de Conexão (`src/firebase/`)
- `firebase.ts`: Inicialização singleton do app Firebase, com suporte a dinamismo através do carregamento de configurações personalizadas salvas pelo usuário em `localStorage` (`vickytex_custom_firebase_config`).
- `firestore.ts`: Instância exportada do Firestore e manipuladores de coleções.
- `auth.ts`: Suporte à autenticação anônima e SSO via Google Workspace.

### Camada de Repositórios (`src/services/firebase/repositories/`)
- `base.repository.ts`: Classe genérica `BaseRepository<T>` com métodos desacoplados `getAll()`, `getById()`, `create()`, `update()`, `delete()`, suporte a substituição atômica de arrays, desduplicação por `id` e salvamento duplo em `localStorage`.
- Repositórios Específicos:
  - `document.repository.ts`
  - `fiveS.repository.ts`
  - `audit.repository.ts`
  - `user.repository.ts`
  - `indicator.repository.ts`
  - `supplier.repository.ts`
  - `training.repository.ts`
  - `ceo.repository.ts`
  - `notification.repository.ts`

---

## 2. Coleções do Firestore e Mapeamento de Documentos

| Coleção Firestore | Entidade | Descrição Funcional |
| :--- | :--- | :--- |
| `/documents` | `Document` | Documentos da Lista Mestra ISO 9001, POPs, Instruções de Trabalho e relatórios. |
| `/document_versions` | `DocumentVersion` | Histórico de revisões, aprovações e anexos vinculados aos documentos. |
| `/audit_logs` | `AuditLog` | Trilha de auditoria imutável registrando ações e modificações de usuários. |
| `/audits` | `Audit` | Auditorias internas, Não-Conformidades (RNCs), Planos de Ação 5W2H e Equipamentos/Calibrações. |
| `/fives_audits` | `FiveSAudits` | Auditorias do Programa 5S com pontuação dos 5 sensos, fotos e planos de ação. |
| `/indicators` | `Indicator` | Indicadores de desempenho (KPIs/BSC) por setor. |
| `/suppliers` | `Supplier` | Cadastro e avaliações contínuas de fornecedores de insumos (ISO 8.4). |
| `/trainings` | `Training` | Treinamentos, capacitações e matriz de polivalência (ISO 7.2). |
| `/ceo_projects` | `CEOProject` | Projetos de melhoria contínua (A3, Kaizen, Lean) do módulo executivo. |
| `/ceo_ideas` | `CEOIdea` | Ideias e sugestões registradas pelos colaboradores. |
| `/ceo_gamification` | `CEOGamification` | Ranking de engajamento e pontuação dos usuários. |
| `/users` | `User` | Cadastro de colaboradores, vínculos de setores e perfis de acesso. |
| `/roles` | `Role` | Matriz de perfis (Administrador, Qualidade, Supervisor, Auditor, Colaborador). |
| `/permissions` | `Permission` | Permissões granulares para ações no sistema. |
| `/notifications` | `Notification` | Alertas do sistema, avisos de prazos e atualizações. |
| `/settings` | `Setting` | Parâmetros globais do sistema e personalizações da Vickytex. |

---

## 3. Regras de Segurança e Permissões (`firestore.rules`)

O Firestore opera com controle estrito via `firestore.rules`:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

---

## 4. Estrutura de Fallback e Desduplicação Offline

Caso o dispositivo perca a conexão ou utilize o sistema antes de configurar as chaves do Firebase, os Repositórios redirecionam transparentemente para o `localStorage`. O motor de desduplicação em `base.repository.ts` garante que IDs repetidos sejam sanados de forma atômica e automatizada na leitura e gravação.
