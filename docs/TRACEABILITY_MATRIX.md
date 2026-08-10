# Matriz de Rastreabilidade End-to-End — SGQ WEB VICKYTEX (v1.2.0)

> 🟢 **FONTE OFICIAL DA VERDADE (SSOT) - RASTREABILIDADE**
> Esta matriz mapeia a rastreabilidade completa de cada módulo funcional do SGQ Web Vickytex, relacionando os requisitos de negócio, código frontend, repositórios Firebase, coleções do Firestore e documentação oficial correspondente.

---

## 1. Matriz Módulo ➔ Código ➔ Coleção Firestore ➔ Documentação

| Módulo / Domínio | Componentes Frontend Principais | Repositórios Firebase | Coleção Firestore | SSOT Documental | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **0. Autenticação & SSO** | `LoginScreen.tsx` | `UserRepository` | `/users`, `/roles`, `/permissions` | [`ARCHITECTURE.md`](/docs/ARCHITECTURE.md) | 🟢 100% Sincronizado |
| **1. Lista Mestra de Documentos** | `Documentos.tsx`, `DocumentoAbasDetalhes.tsx`, `DocumentoListaMestra.tsx` | `DocumentRepository` | `/documents`, `/document_types`, `/departments` | [`ARCHITECTURE.md`](/docs/ARCHITECTURE.md) | 🟢 100% Sincronizado |
| **2. Solicitações & Revisões** | `FluxosParametrizados.tsx` | `DocumentRepository` | `/document_versions` | [`ARCHITECTURE.md`](/docs/ARCHITECTURE.md) | 🟢 100% Sincronizado |
| **3. Cópias Controladas & Leitura** | `RelatorioCopias.tsx` | `DocumentRepository` | `/documents` | [`ARCHITECTURE.md`](/docs/ARCHITECTURE.md) | 🟢 100% Sincronizado |
| **4. Não Conformidades (ISO 10.2)** | `AuditoriasNC.tsx` | `AuditRepository` | `/audits` | [`ARCHITECTURE.md`](/docs/ARCHITECTURE.md) | 🟢 100% Sincronizado |
| **5. Planos de Ação 5W2H** | `PlanosAcao.tsx` | `AuditRepository` | `/audits` | [`ARCHITECTURE.md`](/docs/ARCHITECTURE.md) | 🟢 100% Sincronizado |
| **6. Programa 5S (Auditorias)** | `fiveS/FiveSAudits.tsx`, `fiveS/FiveSDashboard.tsx` | `FiveSRepository` | `/fives_audits` | [`ARCHITECTURE.md`](/docs/ARCHITECTURE.md) | 🟢 100% Sincronizado |
| **7. Calibração (ISO 7.1.5)** | `Calibracao.tsx` | `AuditRepository` | `/audits` | [`ARCHITECTURE.md`](/docs/ARCHITECTURE.md) | 🟢 100% Sincronizado |
| **8. Treinamentos (ISO 7.2)** | `Treinamentos.tsx` | `TrainingRepository` | `/trainings` | [`ARCHITECTURE.md`](/docs/ARCHITECTURE.md) | 🟢 100% Sincronizado |
| **9. Indicadores KPIs / BSC** | `Indicadores.tsx` | `IndicatorRepository` | `/indicators` | [`ARCHITECTURE.md`](/docs/ARCHITECTURE.md) | 🟢 100% Sincronizado |
| **10. Avaliação Fornecedores** | `Fornecedores.tsx` | `SupplierRepository` | `/suppliers` | [`ARCHITECTURE.md`](/docs/ARCHITECTURE.md) | 🟢 100% Sincronizado |
| **11. Riscos & Oportunidades** | `RiscosOportunidades.tsx` | `AuditRepository` | `/audits` | [`ARCHITECTURE.md`](/docs/ARCHITECTURE.md) | 🟢 100% Sincronizado |
| **12. Painel Executivo CEO** | `ceo/DashboardCEO.tsx`, `ceo/ProjetoViewCEO.tsx` | `CeoRepository` | `/ceo_projects`, `/ceo_ideas`, `/ceo_gamification` | [`ARCHITECTURE.md`](/docs/ARCHITECTURE.md) | 🟢 100% Sincronizado |
| **13. Permissões e Usuários RBAC** | `UsuariosAcessos.tsx` | `UserRepository` | `/users`, `/roles`, `/permissions` | [`ARCHITECTURE.md`](/docs/ARCHITECTURE.md) | 🟢 100% Sincronizado |
| **14. Notificações & Alertas** | `MainLayout.tsx`, `Notificacoes.tsx` | `NotificationRepository` | `/notifications` | [`ARCHITECTURE.md`](/docs/ARCHITECTURE.md) | 🟢 100% Sincronizado |
| **15. Audit Log & Registro** | `DatabaseViewer.tsx`, `AuthContext.tsx` | `BaseRepository` | `/audit_logs` | [`ARCHITECTURE.md`](/docs/ARCHITECTURE.md) | 🟢 100% Sincronizado |
| **16. Configurações & Parâmetros** | `Configuracoes.tsx` | `BaseRepository` | `/settings` | [`MANUAL_TECNICO.md`](/docs/MANUAL_TECNICO.md) | 🟢 100% Sincronizado |
| **17. Inspetor Live & Integração com a Nuvem** | `DatabaseViewer.tsx` | Firebase SDK & Parser | Todas as coleções do Firestore | [`FIRESTORE_SCHEMA.md`](/docs/FIRESTORE_SCHEMA.md) | 🟢 100% Sincronizado |

---

## 2. Indicadores Objetivos de Cobertura da Infraestrutura

| Métrica de Auditoria | Meta de Qualidade | Resultado Atual |
| :--- | :--- | :--- |
| **Coleções Mapeadas no Firestore** | 12 Coleções | 12 / 12 (100%) |
| **Repositórios de Nuvem Implementados** | 10 Repositórios | 10 / 10 (100%) |
| **Coleções Documentadas no SSOT** | 12 Coleções | 12 / 12 (100%) |
| **Sincronia Módulo ➔ Código ➔ Nuvem** | 100% Cobertura | 100% Conforme |

