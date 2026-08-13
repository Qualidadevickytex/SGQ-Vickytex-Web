# Portal de Governança Documental e Engenharia — SGQ WEB VICKYTEX (v1.2.2)

> 🛡️ **BEM-VINDO AO ECOSSISTEMA TÉCNICO DO SGQ WEB VICKYTEX**
> Este portal é o ponto de entrada obrigatório para desenvolvedores, arquitetos, auditores e agentes de IA. Toda alteração no código ou infraestrutura deve manter este acervo documental 100% alinhado e sincronizado.

---

## 1. Visão Geral do Sistema

O **SGQ WEB VICKYTEX** é uma plataforma corporativa e industrial de Gestão da Qualidade, desenvolvida para garantir a conformidade com a norma **ISO 9001:2015** no segmento têxtil de confecção de uniformes escolares e profissionais. 

O sistema integra:
- **Gestão Documental (Lista Mestra, POPs, ITs e FORs)**
- **Fluxos Parametrizados de Aprovação por Perfil e Tipo**
- **Não Conformidades (RNCs) e Auditorias Internas/Processo (ISO 10.2)**
- **Metodologia 5S (Auditorias por Senso, Fotos, Notas e Planos de Ação)**
- **Planos de Ação 5W2H e Ações Corretivas com Responsáveis e Prazos**
- **Calibração de Equipamentos e Instrumentos Industriais (ISO 7.1.5)**
- **Treinamentos, Lançamento de Horas e Matriz de Competências (ISO 7.2)**
- **Indicadores Estratégicos (KPIs / BSC) com Metas por Setor**
- **Centro de Excelência Operacional (CEO): Projetos A3/Kaizen, Ideias e Gamificação Belt**
- **Qualificação e Avaliação Contínua de Fornecedores (ISO 8.4)**
- **Controle de Acessos RBAC Granular e Integração Google Workspace SSO**
- **Sincronização em Tempo Real (`onSnapshot`) e Inspetor Live de Banco de Dados com Painel Firebase**

---

## 2. Mapa de Navegação da Documentação e SSOT (Single Source of Truth)

Para evitar duplicidade, divergências e obsolescência, cada assunto possui **uma única fonte oficial da verdade (SSOT)**. Todos os demais documentos devem obrigatoriamente referenciar a fonte oficial.

| Assunto | Documento Fonte Oficial (SSOT) | Descrição do Conteúdo |
| :--- | :--- | :--- |
| **Mapa e Portal Principal** | [`/docs/README.md`](/docs/README.md) | Onboarding, índice de SSOT, regras de sincronização e estrutura. |
| **Contrato e Diretrizes** | [`/docs/SGQ_DEVELOPMENT_CONTRACT.md`](/docs/SGQ_DEVELOPMENT_CONTRACT.md) | "A Constituição" do projeto: padrões estritos de código, React 18, Tailwind e regras gerais. |
| **Padrões de Implementação** | [`/docs/IMPLEMENTATION_STANDARD.md`](/docs/IMPLEMENTATION_STANDARD.md) | Guia de estilização anti-slop, UI/UX, acessibilidade e componentes. |
| **Arquitetura de Software** | [`/docs/ARCHITECTURE.md`](/docs/ARCHITECTURE.md) | Estrutura de pastas, serviços, 21 repositórios Firebase, contextos, RBAC e instalações. |
| **Modelagem do Banco de Dados** | [`/docs/FIRESTORE_SCHEMA.md`](/docs/FIRESTORE_SCHEMA.md) | Schemas completos de todas as coleções e documentos do Firestore, tipos e fallback. |
| **Implantação e DevOps** | [`/docs/DEPLOYMENT.md`](/docs/DEPLOYMENT.md) | Pipelines de build, variáveis de ambiente, Firebase Firestore, Netlify/Cloud Run. |
| **Rastreabilidade End-to-End** | [`/docs/TRACEABILITY_MATRIX.md`](/docs/TRACEABILITY_MATRIX.md) | Matriz completa relacionando Módulo ➔ Código ➔ Coleção Firestore ➔ Repositórios. |
| **Histórico de Versões** | [`/docs/CHANGELOG.md`](/docs/CHANGELOG.md) | Registro histórico de versões (v0.1 a v1.2.1), atualizações de infraestrutura e releases. |
| **Requisitos de Produto** | [`/docs/PRD.md`](/docs/PRD.md) | Visão geral dos requisitos de produto, escopo funcional e objetivos de negócio. |
| **Manual do Usuário Final** | [`/docs/MANUAL_USUARIO.md`](/docs/MANUAL_USUARIO.md) | Guia passo a passo para colaboradores, auditores, gerentes e administradores. |
| **Guia de Compartilhamento** | [`/docs/COMPARTILHAR_ACESSO.md`](/docs/COMPARTILHAR_ACESSO.md) | Guia rápido de envio de links de acesso e configuração nos computadores da fábrica. |
| **Manual Técnico de Operação** | [`/docs/MANUAL_TECNICO.md`](/docs/MANUAL_TECNICO.md) | Guia de manutenção do sistema e sincronização de nuvem para a equipe de TI Vickytex. |

---

## 3. Onboarding Rápido para Novos Desenvolvedores

Para iniciar o desenvolvimento ou manutenção no projeto em menos de 5 minutos, siga esta sequência:

1. **Leia a Constituição**: [`/docs/SGQ_DEVELOPMENT_CONTRACT.md`](/docs/SGQ_DEVELOPMENT_CONTRACT.md)
2. **Entenda a Arquitetura**: [`/docs/ARCHITECTURE.md`](/docs/ARCHITECTURE.md)
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
- **Engenharia Frontend**: Manutenção do React 18, Vite, componentes UI e contratos de tipagem.
- **Engenharia de Dados & Infra**: Repositórios Firebase, Firestore, Cloud Integration e Google Workspace SSO.
- **Gestão da Qualidade (SGQ Admin)**: Homologação dos fluxos operacionais e manuais de usuário.
