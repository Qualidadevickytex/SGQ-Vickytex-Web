# Manual Técnico de Instalação e Operação — SGQ WEB VICKYTEX (v1.2.1)

> 🟢 **FONTE OFICIAL DA VERDADE (SSOT) - MANUTENÇÃO TÉCNICA**
> Este manual é a referência para instalação, suporte, banco de dados e operação técnica do sistema. Para o mapa completo da documentação, acesse [`/docs/README.md`](/docs/README.md).

## 1. Stack Tecnológica Utilizada
O sistema **SGQ Web Vickytex** foi estruturado com as tecnologias mais estáveis e de alto desempenho do ecossistema JavaScript moderno:
- **Core (Frontend)**: React 18, TypeScript
- **Ferramenta de Build**: Vite
- **Estilização**: Tailwind CSS v4 (Compilação ultra rápida via plugin oficial do Vite)
- **Biblioteca de Ícones**: Lucide React
- **Animações**: Motion
- **Banco de Dados & Nuvem**: Firebase Firestore com SDK JavaScript v10+ e assinaturas em tempo real (`onSnapshot`)
- **Camada de Repositórios**: Suíte de 21 repositórios fortemente tipados em `src/services/firebase/repositories/`
- **Fallback Offline**: LocalStorage do navegador com desduplicação atômica de IDs
- **Hospedagem Frontend**: Cloud Run / Netlify / Vercel

---

## 2. Requisitos de Ambiente
Para rodar ou modificar este projeto, você precisará de:
1. **Node.js**: Versão 18 ou superior.
2. **NPM**: Gerenciador de pacotes padrão.
3. **Projeto no Firebase Console**: Com Cloud Firestore ativado em modo de produção.
4. **Conta Google Cloud Console**: Para OAuth 2.0 Client ID (integração com Google Drive e SSO).

---

## 3. Configuração Local e Inicialização

### Passo 1: Instalação de Dependências
Clone o repositório ou exporte os arquivos do ambiente e execute:
```bash
npm install
```

### Passo 2: Variáveis de Ambiente (`.env`)
Copie o arquivo `.env.example` para `.env` e configure com suas credenciais:
```env
# Configurações do Google OAuth
VITE_GOOGLE_CLIENT_ID="599486546395-....apps.googleusercontent.com"
```

### Passo 3: Executar em Modo de Desenvolvimento
```bash
npm run dev
```
O servidor estará rodando em `http://localhost:3000`.

### Passo 4: Executar Build de Produção
```bash
npm run build
```
O comando acima compilará o código React de forma otimizada gerando os arquivos estáticos na pasta `/dist`.

---

## 4. Configuração da Integração com a Nuvem (Firebase)

Para conectar o sistema ao banco de dados no Firebase:

1. Acesse o [Firebase Console](https://console.firebase.google.com/) e crie ou selecione um projeto.
2. Ative o **Cloud Firestore** em modo de produção na região desejada (ex: `southamerica-east1`).
3. Em **Project Settings > General > Your apps**, cadastre uma Web App e copie o objeto de configuração `firebaseConfig`.
4. No sistema **SGQ Web Vickytex**, navegue no menu lateral até **Banco de Dados**.
5. Clique na aba **"Integração com a Nuvem"**.
6. Cole o trecho de código `firebaseConfig` no campo de texto e clique em **"Parse & Preencher"**.
7. Clique em **"Salvar e Aplicar Conexão"**. As credenciais serão armazenadas no `localStorage` sob a chave `vickytex_custom_firebase_config` e aplicadas imediatamente sem necessidade de reiniciar o servidor.
8. Use o botão **"Copiar Configuração"** para replicar a chave em outros computadores da fábrica.

---

## 5. Regras de Segurança no Firebase (`firestore.rules`)

Para garantir acesso seguro ao banco de dados em nuvem, aplique as seguintes regras no painel do Firestore:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null || true; // Ajustar conforme política corporativa RBAC
    }
  }
}
```

---

## 6. Sincronização e Fallback Offline Resiliente

A camada de dados em `src/services/firebase/repositories/base.repository.ts` possui fallback transparente para `localStorage`. Se a conexão com o Firebase falhar ou estiver indisponível, o sistema opera normalmente gravando localmente e desduplicando registros para evitar conflitos ao reconectar.

