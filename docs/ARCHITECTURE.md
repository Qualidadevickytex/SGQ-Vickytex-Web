# Arquitetura Técnica, Design System e Infraestrutura — SGQ WEB VICKYTEX (v1.2.0)

> 🟢 **FONTE OFICIAL DA VERDADE (SSOT) - ARQUITETURA E DESIGN SYSTEM**
> Este documento é a referência única para padrões arquiteturais, hierarquia de componentes e design system.
> - Para o mapeamento de coleções e documentos do banco de dados, consulte [`/docs/FIRESTORE_SCHEMA.md`](/docs/FIRESTORE_SCHEMA.md).
> - Para a matriz de rastreabilidade completa, consulte [`/docs/TRACEABILITY_MATRIX.md`](/docs/TRACEABILITY_MATRIX.md).
> - Para a regra soberana de desenvolvimento, consulte o [`Contrato de Desenvolvimento`](/docs/SGQ_DEVELOPMENT_CONTRACT.md).

## 1. Arquitetura de Software (Modular e Escalável)

O **SGQ Web Vickytex** segue uma estrutura de desenvolvimento modular (Screaming Architecture), separando as preocupações visuais, regras de negócios e serviços de infraestrutura externa (Firebase Firestore + LocalStorage Fallback e APIs do Google Workspace).

```
/src
├── assets/         # Recursos estáticos (Logotipos, vetores)
├── components/     # Componentes visuais atômicos e moleculares reaproveitáveis
│   ├── ui/         # Elementos de UI puros (Bordas, botões customizados)
│   ├── dashboard/  # Componentes internos da tela principal
│   ├── documentos/ # Componentes específicos da lista mestra e revisões
│   └── fiveS/      # Auditorias e Dashboard do Programa 5S
├── contexts/       # Gerenciamento de estado global (Tema, Autenticação, CEO)
├── firebase/       # Inicialização do Firebase, Firestore e Auth
├── layouts/        # Estruturas de grid e navegação da página (Sidebar, Header, Footer)
├── services/       # Repositórios Firebase, conectores REST/APIs e serviços do SGQ
│   └── firebase/repositories/ # Repositórios tipados do Firestore
├── styles/         # Estilização global do Tailwind
├── types/          # Arquivos de tipagem estrita do TypeScript
└── utils/          # Funções utilitárias e geradores de sementes (mockData)
```

### Decisão de Infraestrutura: Single Page Application (SPA) + Firebase Firestore & LocalStorage
O sistema é construído como uma aplicação em **React 18** compilada pelo **Vite** e integrada ao **Firebase Firestore**.
As interações com o banco de dados utilizam uma suíte de repositórios fortemente tipados (`BaseRepository<T>`), oferecendo:
1. **Sincronização em Nuvem em Tempo Real**: Persistência global em nuvem via Firestore.
2. **Resiliência e Fallback Offline**: Armazenamento paralelo transparente no `localStorage` do navegador para operações ininterruptas mesmo sem internet.
3. **Mecanismo Anti-Duplicação**: Desduplicação automática por `id` e atualização atômica de conjuntos de dados.
4. **Painel Dinâmico "Integração com a Nuvem"**: Permite aos administradores colar ou alterar a configuração do Firebase (`firebaseConfig`) diretamente pela interface sem recompilação do código.

---

## 2. Design System do SGQ Web Vickytex

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

## 3. Modelagem de Dados do Firestore (NoSQL Resiliente)

As coleções no Firebase Firestore estão estruturadas com foco em desacoplamento, indexação eficiente e rastreabilidade histórica completa.

### Coleção: `/documents`
Armazena os metadados do documento em vigência e o histórico de revisões em sub-objetos ou registros vinculados em `/document_versions`.

### Coleção: `/fives_audits`
Armazena auditorias completas do Programa 5S com pontuação dos 5 sensos, planos de ação e fotos da fábrica.

### Coleção: `/audit_logs`
Log imutável de ações executadas no sistema para fins de auditoria do SGQ corporativo.

---

## 4. Autenticação e Autorização: Google Workspace (SSO) & Engine RBAC

O SGQ Web Vickytex adota uma arquitetura de gerenciamento de identidade e controle de acesso (IAM) híbrida:

```
+-------------------------------------------------+
|              Fluxo de Acesso do Usuário         |
+-------------------------------------------------+
                         │
                         ▼
  [ 1. AUTENTICAÇÃO - Google Workspace OAuth2 / Firebase Auth ]
  - Colaborador faz login usando conta corporativa @vickytex.com.br
  - Confirmação segura de identidade via token criptográfico
                         │
                         ▼
  [ 2. SINCRONIZAÇÃO - Auto-Provisionamento ]
  - Primeiro login? Criação automática do registro na coleção '/users'
  - Login subsequente? Sincroniza e-mail, nome e avatar
                         │
                         ▼
  [ 3. AUTORIZAÇÃO - RBAC Engine ]
  - Perfil/papel (Administrador, Qualidade, Supervisor, Auditor, Colaborador) lido da base
  - Liberação/bloqueio granular de recursos no frontend e validação nas regras do Firestore
```

---

## 5. Integração com Google Workspace (Drive, Calendar, Gmail)

O repositório de documentos é oficialmente integrado com o **Google Workspace**:
- Cada documento homologado no SGQ possui seu arquivo PDF correspondente hospedado com segurança no Google Drive.
- A visualização e leitura são feitas através de leitores integrados com URLs protegidas.
- Agendamento de auditorias e treinamentos sincroniza eventos com o Google Agenda.

