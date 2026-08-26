# Portal de Governança Documental e Engenharia — SGQ WEB VICKYTEX (v1.2.3)

> 🛡️ **BEM-VINDO AO ECOSSISTEMA TÉCNICO DO SGQ WEB VICKYTEX**
> Este portal é o ponto de entrada obrigatório para desenvolvedores, arquitetos, auditores e agentes de IA. Toda alteração no código ou infraestrutura deve manter este acervo documental 100% alinhado e sincronizado com a realidade operacional do sistema.

---

## 1. Visão Geral do Sistema

O **SGQ WEB VICKYTEX** é uma plataforma corporativa e industrial de Gestão da Qualidade, desenvolvida para garantir a conformidade integral com a norma **ISO 9001:2015** no segmento têxtil de confecção de uniformes escolares e profissionais da **Vickytex**. 

O sistema integra 25 módulos operacionais e de governança:
- **Gestão Documental (Lista Mestra, POPs, ITs, MANs e FORs)** com controle de revisões, QR Code e pré-visualização de PDFs do Google Drive
- **Fluxos Parametrizados de Aprovação por Perfil e Tipo Documental**
- **Cópias Controladas e Protocolos de Leitura Obrigatória**
- **Não Conformidades (RNCs) e Auditorias Internas/Processo (ISO 10.2 / 9.2)** com análise de causa raiz 5 Porquês e Ishikawa
- **Planos de Ação 5W2H e Ações Corretivas** com responsáveis, prazos e controle de eficácia
- **Metodologia 5S** (Auditorias por Senso, Fotos Antes/Depois, Notas, Radar e Planos de Ação)
- **Calibração e Controle Metrológico de Equipamentos e Instrumentos Industriais (ISO 7.1.5)**
- **Treinamentos, Lançamento de Horas e Matriz de Competências / Polivalência (ISO 7.2)**
- **Indicadores Estratégicos (KPIs / BSC - ISO 9.1.3)** com histórico mensal persistido e metas por setor
- **Qualificação e Avaliação Contínua de Fornecedores de Insumos e Serviços (ISO 8.4)**
- **Gestão de Riscos e Oportunidades (ISO 6.1)** com matriz de probabilidade x impacto
- **Análise Crítica pela Direção (ISO 9.3)** com registro de atas e decisões estratégicas
- **Colaboradores e Organograma da Fábrica**
- **Controle e Retenção de Registros da Qualidade (ISO 7.5.3)** com tabela de temporalidade
- **Centro de Excelência Operacional (CEO)**: Projetos A3 (PDCA / DMAIC), Portões de Governança e Metas de Economia
- **Caixa de Sugestões e Ideias de Inovação**
- **Gamificação Belt & Leaderboard** (White, Yellow, Green, Black e Master Black Belt) com pontuação em tempo real
- **Controle de Acessos RBAC Granular em Tempo Real**:
  - Aba **Por Colaborador & Setor [V, C, E, X]**: alçadas de Ver, Criar, Editar, Excluir e restrição de escopo de setor
  - Aba **Perfis Técnicos (Roles Herdadas)**: alçadas padrão de Administrador, Gestor, Qualidade, Supervisor, Auditor, Colaborador e Visitante
- **Central de Notificações e Prazos do SGQ**
- **Trilha Imutável de Auditoria (Audit Logs)**
- **Personalização Visual e Marca Corporativa** sincronizada na nuvem (`/system_settings`)
- **Integração Google Workspace SSO e Google Drive**
- **Calendário SGQ 100% Dinâmico** consolidando auditorias, calibrações, treinamentos e planos de ação
- **Blindagem do DOM contra Tradução Automática** (`translate="no"` e meta notranslate)
- **Sincronização em Tempo Real (`onSnapshot`) e Inspetor Live de Banco de Dados** com Painel Firebase

---

## 2. Mapa de Navegação da Documentação e SSOT (Single Source of Truth)

Para evitar duplicidade, divergências e obsolescência, cada assunto possui **uma única fonte oficial da verdade (SSOT)**. Todos os demais documentos devem obrigatoriamente referenciar a fonte oficial.

| Assunto | Documento Fonte Oficial (SSOT) | Descrição do Conteúdo |
| :--- | :--- | :--- |
| **Mapa e Portal Principal** | [`/docs/README.md`](/docs/README.md) | Onboarding, índice de SSOT, regras de sincronização e estrutura geral. |
| **Contrato e Diretrizes** | [`/docs/SGQ_DEVELOPMENT_CONTRACT.md`](/docs/SGQ_DEVELOPMENT_CONTRACT.md) | "A Constituição" do projeto: padrões estritos de código, React 18, Tailwind e regras gerais. |
| **Padrões de Implementação** | [`/docs/IMPLEMENTATION_STANDARD.md`](/docs/IMPLEMENTATION_STANDARD.md) | Blueprint de engenharia, arquitetura em 2 etapas, resiliência offline e tipagem. |
| **Arquitetura de Software** | [`/docs/ARCHITECTURE.md`](/docs/ARCHITECTURE.md) | Estrutura de pastas, serviços, suíte de 21 repositórios Firebase, engine RBAC em tempo real e SSO. |
| **Modelagem do Banco de Dados** | [`/docs/FIRESTORE_SCHEMA.md`](/docs/FIRESTORE_SCHEMA.md) | Schemas completos de todas as 21 coleções e documentos do Firestore, permissões customizadas e fallback. |
| **Implantação e DevOps** | [`/docs/DEPLOYMENT.md`](/docs/DEPLOYMENT.md) | Pipelines de build, variáveis de ambiente, Firebase Firestore, Netlify e Cloud Run. |
| **Rastreabilidade End-to-End** | [`/docs/TRACEABILITY_MATRIX.md`](/docs/TRACEABILITY_MATRIX.md) | Matriz completa relacionando os 25 Módulos ➔ Código ➔ Coleção Firestore ➔ Repositórios. |
| **Histórico de Versões** | [`/docs/CHANGELOG.md`](/docs/CHANGELOG.md) | Registro histórico de versões (v0.1 a v1.2.3), atualizações de infraestrutura e releases. |
| **Requisitos de Produto** | [`/docs/PRD.md`](/docs/PRD.md) | Visão geral dos requisitos de produto, escopo funcional e objetivos de negócio ISO 9001. |
| **Manual do Usuário Final** | [`/docs/MANUAL_USUARIO.md`](/docs/MANUAL_USUARIO.md) | Guia passo a passo para colaboradores, auditores, gerentes, supervisores e administradores. |
| **Guia de Compartilhamento** | [`/docs/COMPARTILHAR_ACESSO.md`](/docs/COMPARTILHAR_ACESSO.md) | Guia rápido de envio de links de acesso e sincronização nos computadores da fábrica. |
| **Manual Técnico de Operação** | [`/docs/MANUAL_TECNICO.md`](/docs/MANUAL_TECNICO.md) | Guia de suporte, ciclo de vida do RBAC, banco de dados e sincronização de nuvem para TI. |

---

## 3. Onboarding Rápido para Novos Desenvolvedores

Para iniciar o desenvolvimento ou manutenção no projeto em menos de 5 minutos, siga esta sequência:

1. **Leia a Constituição**: [`/docs/SGQ_DEVELOPMENT_CONTRACT.md`](/docs/SGQ_DEVELOPMENT_CONTRACT.md)
2. **Entenda a Arquitetura e o RBAC**: [`/docs/ARCHITECTURE.md`](/docs/ARCHITECTURE.md)
3. **Execute o Projeto Localmente**:
   ```bash
   # 1. Instale as dependências
   npm install

   # 2. Inicie o servidor de desenvolvimento (Vite na porta 3000)
   npm run dev

   # 3. Abra no navegador em http://localhost:3000
   ```
4. **Camada de Dados & Integração com a Nuvem**:
   - O sistema utiliza **Firebase Firestore** com fallback gracioso e transparente para `localStorage`.
   - Para conectar um novo projeto Firebase, acesse no sistema o menu **Banco de Dados ➔ Integração com a Nuvem** e cole o trecho `firebaseConfig`.

---

## 4. Política de Governança Documental Obrigatória

### Regras de Atualização Sincronizada
Nenhuma funcionalidade, correção ou refatoração será considerada **concluída** sem a correspondente atualização da documentação técnica.

1. **Alteração em Coleções ou Estrutura de Banco**:
   - Atualizar obrigatoriamente [`/docs/FIRESTORE_SCHEMA.md`](/docs/FIRESTORE_SCHEMA.md) e as regras em `firestore.rules`.
2. **Nova Tela ou Componente Principal**:
   - Atualizar [`/docs/ARCHITECTURE.md`](/docs/ARCHITECTURE.md) e a [`/docs/TRACEABILITY_MATRIX.md`](/docs/TRACEABILITY_MATRIX.md).
3. **Alteração na Pipeline ou Variáveis de Ambiente**:
   - Atualizar [`/docs/DEPLOYMENT.md`](/docs/DEPLOYMENT.md) e `.env.example`.
4. **Nova Versão / Release**:
   - Registrar as modificações em [`/docs/CHANGELOG.md`](/docs/CHANGELOG.md) e atualizar os títulos visuais.

---

## 5. Checklist Obrigatório para Pull Requests & Deploys

Antes de realizar o deploy ou finalizar uma tarefa, certifique-se de validar:

- [ ] **Linter & Compilação sem Erros**: `npm run lint` e `npm run build` executados com sucesso.
- [ ] **SSOT Respeitada**: Nenhuma informação foi duplicada em local divergente da sua fonte oficial.
- [ ] **Padrão Estético Anti-Slop**: Seguiu as diretrizes de visual e tipografia contidas em [`/docs/IMPLEMENTATION_STANDARD.md`](/docs/IMPLEMENTATION_STANDARD.md).
- [ ] **Rastreabilidade Atualizada**: Matriz em [`/docs/TRACEABILITY_MATRIX.md`](/docs/TRACEABILITY_MATRIX.md) atualizada com novas rotas/entidades.
- [ ] **Changelog Alimentado**: Versão e notas de alteração descritas em [`/docs/CHANGELOG.md`](/docs/CHANGELOG.md).

---

## 6. Proprietários e Responsabilidades

- **Tech Lead / Arquiteto de Software**: Governança da arquitetura, contratos e SSOT.
- **Engenharia Frontend**: Manutenção do React 18, Vite, componentes UI, RBAC e contratos de tipagem.
- **Engenharia de Dados & Infra**: Repositórios Firebase, Firestore, Cloud Integration e Google Workspace SSO.
- **Gestão da Qualidade (SGQ Admin)**: Homologação dos fluxos operacionais e manuais de usuário.

