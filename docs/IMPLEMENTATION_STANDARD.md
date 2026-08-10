# PADRÃO DE IMPLEMENTAÇÃO DE NOVOS MÓDULOS (IMPLEMENTATION_STANDARD.md)
## Guia de Engenharia e Arquitetura de Software — SGQ WEB VICKYTEX

Este documento estabelece o **Padrão de Implementação Oficial (Blueprint)** para a criação de novos módulos no ecossistema **SGQ WEB VICKYTEX**. Todos os novos módulos (ex: CEO, Calibração, CEP, ESG, TPM) devem seguir rigorosamente este fluxo de desenvolvimento em duas etapas distintas: **Etapa 1 — Infraestrutura** e **Etapa 2 — Regras de Negócio e Interface**.

---

## 1. Visão Geral da Arquitetura do Módulo

Cada módulo é composto por camadas lógicas independentes que se integram de forma síncrona com os serviços globais do sistema:

```
┌────────────────────────────────────────────────────────┐
│                      Camada de UI                      │
│             (Telas, Componentes e Formulários)         │
└──────────────────────────┬─────────────────────────────┘
                           ▼
┌────────────────────────────────────────────────────────┐
│                 Camada de Estado e Hooks               │
│               (Context & Custom Hooks)                 │
└──────────────────────────┬─────────────────────────────┘
                           ▼
┌────────────────────────────────────────────────────────┐
│                  Camada de Repositório                 │
│         (Client API, CRUD & Local Persistence)         │
└──────────────────────────┬─────────────────────────────┘
                           ▼
┌────────────────────────────────────────────────────────┐
│                   Camada de Tipagem                    │
│            (Definição Estrita do TypeScript)           │
└────────────────────────────────────────────────────────┘
```

---

## 2. Passo a Passo da Implementação da Infraestrutura (Etapa 1)

Durante a **Etapa 1 (Infraestrutura)**, nenhum detalhe visual complexo ou regra de negócio final deve ser exposto na tela principal. O foco é garantir a integridade dos dados, conexões de API, persistência offline e segurança de acesso (RBAC).

### Passo 2.1: Modelagem e Tipagem do Módulo (`src/types/[modulo].ts`)
1. Crie um arquivo dedicado para as interfaces de dados do módulo em `/src/types/[modulo].ts`.
2. Exporte interfaces com tipagem estrita para todas as entidades persistidas no banco de dados.
3. Não utilize tipagens frouxas (`any`). Caso necessário, use Generics ou uniões de tipos.
4. Registre e exporte o novo arquivo no centralizador `/src/types/index.ts`.

### Passo 2.2: Repositório (`src/services/repositories/[modulo].repository.ts`)
1. Crie o arquivo de repositório que abstrai as chamadas ao banco de dados e persistência local.
2. Implemente obrigatoriamente:
   - `getLocalData()`: Busca local em `localStorage` para operação offline resiliente.
   - `saveLocalData()`: Gravação em `localStorage` quando houver falhas de rede.
   - `mapRecord()`: Tradutor que converte registros brutos de API para a interface TypeScript.
   - `mapToPayload()`: Tradutor que converte a interface TypeScript em dados aceitos pela API/Banco.
3. Instancie e exporte como singleton.

### Passo 2.3: Camada de Serviços do Módulo (`src/services/[modulo].service.ts`)
1. Crie um arquivo de serviço para expor operações agregadas de dados, integrando-o com outros serviços globais (como `cacheService`, etc.).
2. Funções assíncronas devem retornar a interface padronizada `ApiResponse<T>`.
3. Erros do serviço devem ser tratados utilizando a classe unificada `ErrorHandler.handle(error)`.

### Passo 2.4: Contexto Reativo e Provedor (`src/contexts/[modulo]Context.tsx`)
1. Crie um React Context e seu respectivo Provider para centralizar o estado operacional do módulo.
2. O Provider deve carregar os dados de forma assíncrona do repositório no momento de montagem e gerenciar estados de carregamento (`loading`) e erro (`error`).
3. O contexto deve expor métodos de alteração de dados (Criar, Editar, Deletar) garantindo que as mutações invalidem o cache.

### Passo 2.5: Custom Hooks para Consumo do Contexto (`src/hooks/use[Modulo].ts`)
1. Crie um Custom Hook para encapsular o consumo do contexto.
2. Garanta que o hook dispare um erro caso seja invocado fora do respectivo Provider.

---

## 3. Diretrizes de Integração no Layout e Roteador

A integração com o layout base, menu de navegação e roteador deve ocorrer de forma limpa, estendendo as configurações existentes sem alterar os fluxos homologados.

1. **Permissões (RBAC):** Adicione a nova chave de seção (ex: `'ceo'`) ao array `allowedSections` na interface `RolePermission` em `/src/types/index.ts`.
2. **Definição de Rotas:** Insira a nova rota condicional ou padrão no componente centralizador `/src/App.tsx`, envolvendo-a com o Provider recém-criado para limitar o escopo de carregamento.
3. **Navegação (Sidebar):** Adicione o item correspondente no menu de navegação lateral (respeitando as restrições de permissões baseadas nas roles de usuário logado).

---

## 4. Garantia de Regressão Zero e Testes de Integridade

Todas as alterações da infraestrutura do novo módulo devem obrigatoriamente passar por verificação de qualidade automatizada:
1. **Linter (`npm run lint`):** Validação de erros de sintaxe, imports inutilizados ou tipos ausentes.
2. **Build (`npm run build`):** Validação de compatibilidade estrita com o ambiente de produção.
3. **Integridade de Cache:** Confirmar que as novas chamadas de repositório utilizam `cacheService` e invalidam os escopos corretos após mutações.
4. **Resiliência Offline:** Garantir que o `localStorage` do módulo é populado de forma inicializada e responde sem quebras na ausência do servidor.
