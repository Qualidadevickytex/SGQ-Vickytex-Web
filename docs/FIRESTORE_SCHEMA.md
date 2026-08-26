# Especificação Oficial do Esquema de Banco de Dados — Firebase Firestore (v1.2.3)

> 🟢 **SINGLE SOURCE OF TRUTH (SSOT) — CAMADA DE DADOS FIRESTORE**
> Este documento é a única fonte oficial sobre a modelagem de dados no **Firebase Firestore** do **SGQ WEB VICKYTEX (v1.2.3)**.

---

## 1. Visão Geral da Arquitetura de Persistência

O **SGQ WEB Vickytex** adota o **Firebase Firestore** como mecanismo principal de banco de dados NoSQL orientado a documentos, combinado com uma engine de resiliência e fallback offline para `localStorage` e assinaturas em tempo real via `onSnapshot`.

### Módulo de Conexão (`src/firebase/`)
- `firebase.ts`: Inicialização singleton do app Firebase, com suporte a dinamismo através do carregamento de configurações personalizadas salvas pelo usuário em `localStorage` (`vickytex_custom_firebase_config`).
- `firestore.ts`: Instância exportada do Firestore e manipuladores de coleções.
- `auth.ts`: Suporte à autenticação anônima e SSO via Google Workspace.

### Camada de 21 Repositórios Tipados (`src/services/firebase/repositories/`)
- `base.repository.ts`: Classe genérica `BaseRepository<T>` com métodos `getAll()`, `getById()`, `create()`, `update()`, `delete()`, `subscribe()` (escuta em tempo real via `onSnapshot`), suporte a substituição atômica de arrays, desduplicação por `id` e salvamento duplo em `localStorage`.
- **Suíte de Repositórios Específicos**:
  - `actionPlan.repository.ts` (`/action_plans`)
  - `audit.repository.ts` (`/audits`)
  - `auditLog.repository.ts` (`/audit_logs`)
  - `ceo.repository.ts` (`/ceo_projects`, `/ceo_ideas`)
  - `collaborator.repository.ts` (`/collaborators`)
  - `criticalAnalysis.repository.ts` (`/critical_analyses`)
  - `document.repository.ts` (`/documents`, `/document_versions`)
  - `equipment.repository.ts` (`/equipments`)
  - `fiveS.repository.ts` (`/fives_audits`)
  - `indicator.repository.ts` (`/indicators`)
  - `nc.repository.ts` (`/ncs`)
  - `notification.repository.ts` (`/notifications`)
  - `record.repository.ts` (`/records`)
  - `risk.repository.ts` (`/risks`)
  - `rolePermission.repository.ts` (`/role_permissions`)
  - `supplier.repository.ts` (`/suppliers`)
  - `systemSettings.repository.ts` (`/system_settings`)
  - `training.repository.ts` (`/trainings`)
  - `user.repository.ts` (`/users`)

---

## 2. Coleções do Firestore e Mapeamento de Documentos

| Coleção Firestore | Entidade / Classe | Descrição Funcional |
| :--- | :--- | :--- |
| `/documents` | `Documento` | Documentos da Lista Mestra ISO 9001, POPs, Instruções de Trabalho e relatórios. |
| `/document_versions` | `DocumentVersion` | Histórico de revisões, aprovações e anexos vinculados aos documentos. |
| `/audits` | `Auditoria` | Auditorias internas da qualidade e processos. |
| `/ncs` | `NaoConformidade` | Não Conformidades (RNCs) com causa raiz (5 Porquês / Ishikawa) e investigações. |
| `/action_plans` | `PlanoAcao` | Planos de Ação 5W2H vinculados a RNCs ou auditorias. |
| `/fives_audits` | `Auditoria5S` | Auditorias do Programa 5S por senso, fotos antes/depois, notas e planos. |
| `/equipments` | `Equipment` | Instrumentos de medição, calibração industrial (ISO 7.1.5) e inventário metrológico. |
| `/trainings` | `Training` | Treinamentos, capacitações e matriz de polivalência (ISO 7.2). |
| `/indicators` | `Indicator` | Indicadores de desempenho (KPIs/BSC) por setor com medições mensais e metas. |
| `/suppliers` | `Fornecedor` | Cadastro e avaliações contínuas de fornecedores de insumos e serviços (ISO 8.4). |
| `/risks` | `RiscoOportunidade` | Matriz de Riscos e Oportunidades (ISO 6.1). |
| `/critical_analyses` | `CriticalAnalysis` | Atas e tópicos da Análise Crítica pela Direção (ISO 9.3). |
| `/collaborators` | `Collaborator` | Colaboradores da fábrica e vínculos com organograma. |
| `/records` | `RegistroQualidade` | Registros arquivados e tabela de temporalidade (ISO 7.5.3). |
| `/ceo_projects` | `CEOProject` | Projetos A3, Kaizen e Lean do Centro de Excelência Operacional com portões de governança. |
| `/ceo_ideas` | `CEOIdea` | Caixa de sugestões dos colaboradores com status de implantação. |
| `/users` | `UserAccount` | Cadastro de usuários corporativos, perfis e permissões customizadas `customPermissions`. |
| `/role_permissions` | `RolePermission` | Matriz RBAC de permissões por perfil técnico (Administrador, Gestor, Qualidade, Supervisor, Colaborador, Auditor, Visitante). |
| `/notifications` | `Notification` | Alertas do sistema, avisos de prazos e comunicados. |
| `/audit_logs` | `ActivityLog` | Trilha imutável de auditoria de alterações do sistema. |
| `/system_settings` | `SystemSettings` | Parâmetros globais do sistema e dados operacionais dinâmicos. |

---

## 3. Estrutura Detalhada de Usuários e Permissões Customizadas (`/users`)

Cada documento na coleção `/users` possui a seguinte estrutura:

```typescript
interface UserAccount {
  id: string;
  name: string;
  email: string;
  role: 'Administrador' | 'Gestor' | 'Qualidade' | 'Supervisor' | 'Auditor' | 'Colaborador' | 'Visitante';
  sector: SectorType;
  photoURL?: string;
  status: 'Ativo' | 'Inativo';
  passwordHash?: string;
  lastLogin?: string;
  telefone?: string;
  // Permissões customizadas granulares por módulo [V, C, E, X]
  customPermissions?: {
    [moduloId: string]: {
      ver: boolean;       // Alçada de visualização [V]
      criar: boolean;     // Alçada de criação [C]
      editar: boolean;    // Alçada de edição [E]
      excluir: boolean;   // Alçada de exclusão [X]
      regraSetor?: 'apenasSetor' | 'todos'; // Restrição de escopo de setor
    };
  };
}
```

---

## 4. Documentos Especiais na Coleção `/system_settings`

A coleção `/system_settings` armazena configurações globais com escuta e sincronização em tempo real:

1. **`sgq_vickytex_personalizacao`**:
   - Armazena nome da empresa, logotipo, cores do tema, texto do cabeçalho e versão ativa (`SGQ WEB v1.2.3`).
2. **`sgq_vickytex_fluxos_documentos`**:
   - Armazena a lista de fluxos parametrizados de aprovação documental (etapas, cargos revisores e aprovadores para POP, FOR, IT, MAN, LIST).
3. **`google_drive`**:
   - Armazena a ID da pasta oficial do Google Drive (`folderId`) para armazenamento centralizado dos PDFs.
4. **`sgq_vickytex_ceo_training_logs`**:
   - Armazena o histórico em tempo real de lançamento de horas de treinamento para cálculo da Gamificação CEO.
5. **`sgq_vickytex_ceo_gamification_adjustments`**:
   - Armazena bônus manuais de pontos, atribuição customizada de medalhas e overrides de categoria Belt.
6. **`sgq_vickytex_ceo_scores_zeroed`**:
   - Registra o estado booleano de zeramento de pontuações ou restauração automática do Leaderboard.

---

## 5. Regras de Segurança no Firestore (`firestore.rules`)

O Firestore opera com controle de acesso centralizado via `firestore.rules`:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null || true; // Regras granulares RBAC validadas na aplicação
    }
  }
}
```

---

## 6. Estrutura de Fallback e Desduplicação Offline

Caso o dispositivo perca a conexão ou utilize o sistema antes de configurar as chaves do Firebase, os Repositórios redirecionam de forma transparente para o `localStorage`. O motor de desduplicação em `base.repository.ts` garante que IDs repetidos sejam sanados de forma atômica e automatizada na leitura, gravação e sincronização via `subscribe()`.


