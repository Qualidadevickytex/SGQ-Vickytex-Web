# Matriz de Rastreabilidade End-to-End — SGQ WEB VICKYTEX (v1.2.3)

> 🟢 **FONTE OFICIAL DA VERDADE (SSOT) - RASTREABILIDADE**
> Esta matriz mapeia a rastreabilidade completa de cada módulo funcional do SGQ Web Vickytex, relacionando os requisitos de negócio, código frontend, repositórios Firebase, coleções do Firestore e documentação oficial correspondente.

---

## 1. Matriz Módulo ➔ Código ➔ Coleção Firestore ➔ Documentação

| Módulo / Domínio | Componentes Frontend Principais | Repositórios Firebase | Coleção Firestore | SSOT Documental | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **0. Autenticação & SSO** | `LoginScreen.tsx` | `UserRepository`, `RolePermissionRepository` | `/users`, `/role_permissions` | [`ARCHITECTURE.md`](/docs/ARCHITECTURE.md) | 🟢 100% Sincronizado |
| **1. Lista Mestra de Documentos** | `Documentos.tsx`, `DocumentoAbasDetalhes.tsx`, `DocumentoListaMestra.tsx` | `DocumentRepository` | `/documents`, `/document_versions` | [`ARCHITECTURE.md`](/docs/ARCHITECTURE.md) | 🟢 100% Sincronizado |
| **2. Fluxos de Aprovação Parametrizados** | `FluxosParametrizados.tsx` | `SystemSettingsRepository` | `/system_settings` (`sgq_vickytex_fluxos_documentos`) | [`ARCHITECTURE.md`](/docs/ARCHITECTURE.md) | 🟢 100% Sincronizado |
| **3. Cópias Controladas & Protocolos de Leitura** | `RelatorioCopias.tsx` | `DocumentRepository` | `/documents` | [`ARCHITECTURE.md`](/docs/ARCHITECTURE.md) | 🟢 100% Sincronizado |
| **4. Não Conformidades (RNCs - ISO 10.2)** | `AuditoriasNC.tsx` | `NcRepository` | `/ncs` | [`ARCHITECTURE.md`](/docs/ARCHITECTURE.md) | 🟢 100% Sincronizado |
| **5. Planos de Ação 5W2H** | `PlanosAcao.tsx` | `ActionPlanRepository` | `/action_plans` | [`ARCHITECTURE.md`](/docs/ARCHITECTURE.md) | 🟢 100% Sincronizado |
| **6. Programa 5S (Auditorias & Fotos)** | `fiveS/FiveSAudits.tsx`, `fiveS/FiveSDashboard.tsx` | `FiveSRepository` | `/fives_audits` | [`ARCHITECTURE.md`](/docs/ARCHITECTURE.md) | 🟢 100% Sincronizado |
| **7. Calibração (ISO 7.1.5)** | `Calibracao.tsx` | `EquipmentRepository` | `/equipments` | [`ARCHITECTURE.md`](/docs/ARCHITECTURE.md) | 🟢 100% Sincronizado |
| **8. Treinamentos (ISO 7.2)** | `Treinamentos.tsx` | `TrainingRepository` | `/trainings` | [`ARCHITECTURE.md`](/docs/ARCHITECTURE.md) | 🟢 100% Sincronizado |
| **9. Indicadores KPIs / BSC** | `Indicadores.tsx` | `IndicatorRepository` | `/indicators` | [`ARCHITECTURE.md`](/docs/ARCHITECTURE.md) | 🟢 100% Sincronizado |
| **10. Avaliação Fornecedores (ISO 8.4)** | `Fornecedores.tsx` | `SupplierRepository` | `/suppliers` | [`ARCHITECTURE.md`](/docs/ARCHITECTURE.md) | 🟢 100% Sincronizado |
| **11. Riscos & Oportunidades (ISO 6.1)** | `RiscosOportunidades.tsx` | `RiskRepository` | `/risks` | [`ARCHITECTURE.md`](/docs/ARCHITECTURE.md) | 🟢 100% Sincronizado |
| **12. Análise Crítica Direção (ISO 9.3)** | `AnaliseCritica.tsx` | `CriticalAnalysisRepository` | `/critical_analyses` | [`ARCHITECTURE.md`](/docs/ARCHITECTURE.md) | 🟢 100% Sincronizado |
| **13. Colaboradores & Organograma** | `Colaboradores.tsx` | `CollaboratorRepository` | `/collaborators` | [`ARCHITECTURE.md`](/docs/ARCHITECTURE.md) | 🟢 100% Sincronizado |
| **14. Registros Arquivados (ISO 7.5.3)** | `Registros.tsx` | `RecordRepository` | `/records` | [`ARCHITECTURE.md`](/docs/ARCHITECTURE.md) | 🟢 100% Sincronizado |
| **15. Painel Executivo CEO** | `ceo/DashboardCEO.tsx`, `ceo/ProjetoViewCEO.tsx` | `CeoRepository` | `/ceo_projects`, `/ceo_ideas` | [`ARCHITECTURE.md`](/docs/ARCHITECTURE.md) | 🟢 100% Sincronizado |
| **16. Gamificação & Leaderboard CEO** | `ceo/GamificacaoCEO.tsx` | `SystemSettingsRepository` | `/system_settings` (`training_logs`, `gamification_adjustments`, `scores_zeroed`) | [`ARCHITECTURE.md`](/docs/ARCHITECTURE.md) | 🟢 100% Sincronizado |
| **17. Centro Excelência Operacional (A3)** | `ceo/CentroExcelenciaCEO.tsx` | `CeoRepository` | `/ceo_projects` | [`ARCHITECTURE.md`](/docs/ARCHITECTURE.md) | 🟢 100% Sincronizado |
| **18. Permissões e Usuários RBAC** | `UsuariosAcessos.tsx` | `UserRepository`, `RolePermissionRepository` | `/users`, `/role_permissions` | [`ARCHITECTURE.md`](/docs/ARCHITECTURE.md) | 🟢 100% Sincronizado |
| **19. Notificações & Alertas** | `MainLayout.tsx`, `Notificacoes.tsx` | `NotificationRepository` | `/notifications` | [`ARCHITECTURE.md`](/docs/ARCHITECTURE.md) | 🟢 100% Sincronizado |
| **20. Audit Log & Registro** | `DatabaseViewer.tsx`, `AuthContext.tsx` | `AuditLogRepository` | `/audit_logs` | [`ARCHITECTURE.md`](/docs/ARCHITECTURE.md) | 🟢 100% Sincronizado |
| **21. Personalização & Marca** | `Configuracoes.tsx` | `SystemSettingsRepository` | `/system_settings` (`sgq_vickytex_personalizacao`) | [`MANUAL_TECNICO.md`](/docs/MANUAL_TECNICO.md) | 🟢 100% Sincronizado |
| **22. Integração Google Drive** | `GoogleIntegrationPanel.tsx` | `SystemSettingsRepository` | `/system_settings` (`google_drive`) | [`MANUAL_TECNICO.md`](/docs/MANUAL_TECNICO.md) | 🟢 100% Sincronizado |
| **23. Inspetor Live & Integração Nuvem** | `DatabaseViewer.tsx` | Firebase SDK & Parser | Todas as coleções do Firestore | [`FIRESTORE_SCHEMA.md`](/docs/FIRESTORE_SCHEMA.md) | 🟢 100% Sincronizado |
| **24. Pesquisa Global Unificada** | `SearchGlobal.tsx` | Todos os Repositórios | Múltiplas coleções | [`ARCHITECTURE.md`](/docs/ARCHITECTURE.md) | 🟢 100% Sincronizado |

---

## 2. Indicadores Objetivos de Cobertura da Infraestrutura

| Métrica de Auditoria | Meta de Qualidade | Resultado Atual |
| :--- | :--- | :--- |
| **Coleções e Documentos Especializados no Firestore** | 21 Entidades | 21 / 21 (100%) |
| **Repositórios de Nuvem Tipados Implementados** | 21 Repositórios | 21 / 21 (100%) |
| **Coleções e Sub-documentos no SSOT** | 21 Mapeamentos | 21 / 21 (100%) |
| **Sincronia Módulo ➔ Código ➔ Nuvem** | 100% Cobertura | 100% Conforme |


