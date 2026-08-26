# Processo de Implantação e Deploy — SGQ WEB VICKYTEX (v1.2.3)

> 🟢 **FONTE OFICIAL DA VERDADE (SSOT) - DEPLOY E INFRAESTRUTURA**
> Este documento é a referência única para build, pipelines de publicação, variáveis de ambiente, Firebase e hospedagem do SGQ Web Vickytex. Para a visão geral do sistema, consulte [`/docs/README.md`](/docs/README.md).

## 1. Visão Geral do Fluxo de Publicação
Como o **SGQ Web Vickytex** é uma aplicação baseada em React (SPA) integrada ao Firebase Firestore e Google Workspace, seu deploy é de baixo custo, alta escala e suporte a múltiplos nós operacionais.

O fluxo recomendado consiste em:
```
[Código Local / Git] ──> [Build Vite (`npm run build`)] ──> [Hospedagem Netlify / Cloud Run] ──> [Firebase Firestore / Workspace SSO]
```

---

## 2. Passo a Passo de Implantação no Netlify / Cloud Run

### Passo 1: Preparar o Repositório no GitHub
1. Crie um repositório privado no seu GitHub corporativo (ex: `vickytex-sgq-web`).
2. Adicione os arquivos do projeto e faça o commit inicial.
```bash
git init
git add .
git commit -m "feat: SGQ Vickytex com Firebase Firestore e Painel de Integração com Nuvem"
git branch -M main
git remote add origin <link-do-seu-repositorio-github>
git push -u origin main
```

### Passo 2: Conectar o Repositório ao Netlify ou Cloud Run
1. No painel do [Netlify](https://www.netlify.com), adicione o novo site importando o repositório `vickytex-sgq-web`.
2. Configure os parâmetros de build:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`

### Passo 3: Definir Variáveis de Ambiente
Cadastre as variáveis no provedor de hospedagem:
- `VITE_GOOGLE_CLIENT_ID` (OAuth 2.0 Client ID do Google Cloud Console para o SSO corporativo)

### Passo 4: Configuração da Integração com o Firebase Firestore
Você pode optar por:
1. Inserir as credenciais em `.env.example` / variáveis de ambiente do provedor.
2. **Ou** utilizar o painel integrado **Banco de Dados ➔ Integração com a Nuvem** diretamente pela interface do sistema após o deploy, colando o trecho `firebaseConfig`.

---

## 3. Checklist Pós-Deploy (Homologação)
Após o término do deploy automático:
- [ ] **Configuração do Domínio**: Vincule o domínio oficial da empresa (ex: `sgq.vickytex.com.br`) e ative o certificado de segurança SSL.
- [ ] **Google Cloud Console**: Adicione a URL oficial na lista de **"Authorized JavaScript Origins"** e **"Authorized Redirect URIs"**.
- [ ] **Validação do Firestore**: Acesse a aba **Banco de Dados ➔ Integração com a Nuvem**, valide a conexão com o Firebase e execute um teste de gravação.

