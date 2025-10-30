# Configuração do Firebase para MyLinguaLearn

## 0. Configurar Variáveis de Ambiente

Antes de começar, você precisa configurar as credenciais do Firebase em um arquivo `.env`.

### Passo 1: Criar Arquivo .env

1. Na raiz do projeto, copie o arquivo de exemplo:

```bash
cp .env.example .env
```

### Passo 2: Obter Credenciais do Firebase

1. Acesse https://console.firebase.google.com
2. Selecione seu projeto (ou crie um novo)
3. Clique no ícone de engrenagem ⚙️ > **Project settings**
4. Role até "Your apps" > **Web**
5. Se você já tem um app web, clique nele para ver as configurações
6. Se não tem, clique em "</>" para adicionar um novo app web
7. Copie os valores do objeto `firebaseConfig`

### Passo 3: Preencher o Arquivo .env

Abra o arquivo `.env` e substitua os valores placeholder pelos valores reais do Firebase:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
VITE_FIREBASE_AUTH_DOMAIN=seu-projeto.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://seu-projeto.firebaseio.com
VITE_FIREBASE_PROJECT_ID=seu-projeto-id
VITE_FIREBASE_STORAGE_BUCKET=seu-projeto.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef123456
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX

# NewsData.io API (opcional - chave padrão incluída)
VITE_NEWSDATA_API_KEY=pub_855fb746da0e4fc99115fd9551c3e0cb
```

**Importante:**
- Nunca faça commit do arquivo `.env` - ele já está no `.gitignore`
- O arquivo `.env` deve estar na raiz do projeto (mesmo nível que `package.json`)
- Após criar ou atualizar o `.env`, reinicie o servidor de desenvolvimento

## 1. Configurar Regras de Segurança e Índices

Acesse o Firebase Console: https://console.firebase.google.com

### Passo 1: Ir para Realtime Database

1. Selecione seu projeto: **alertu-1546021902504**
2. No menu lateral, clique em **Realtime Database**
3. Clique na aba **Rules** (Regras)

### Passo 2: Copiar e Colar as Regras

Copie o conteúdo do arquivo `firebase-rules.json` e cole no editor de regras:

```json
{
  "rules": {
    "articles": {
      ".read": true,
      ".write": "auth != null",
      ".indexOn": ["publishedAt", "createdAt"]
    },
    "users": {
      "$uid": {
        ".read": "$uid === auth.uid",
        ".write": "$uid === auth.uid",
        "vocabulary": {
          ".indexOn": ["createdAt", "nextReview"]
        },
        "readingHistory": {
          ".indexOn": ["readAt", "timestamp"]
        },
        "activities": {
          ".indexOn": ["timestamp"]
        },
        "quizResults": {
          ".indexOn": ["completedAt"]
        },
        "savedArticles": {
          ".indexOn": ["savedAt"]
        }
      }
    },
    "newsCache": {
      ".read": true,
      ".write": "auth != null",
      ".indexOn": ["fetchedAt"]
    }
  }
}
```

### Passo 3: Publicar as Regras

Clique no botão **Publish** (Publicar) para aplicar as regras.

## 2. Configurar Authentication

### Passo 1: Ir para Authentication

1. No menu lateral, clique em **Authentication**
2. Clique na aba **Sign-in method**

### Passo 2: Habilitar Provedores

Habilite os seguintes métodos de autenticação:

1. **Email/Password**
   - Clique em "Email/Password"
   - Ative o toggle "Enable"
   - Clique em "Save"

2. **Google**
   - Clique em "Google"
   - Ative o toggle "Enable"
   - Adicione um email de suporte do projeto
   - Clique em "Save"

3. **Anonymous** (para modo visitante)
   - Clique em "Anonymous"
   - Ative o toggle "Enable"
   - Clique em "Save"

## 3. Verificar Configuração

Após aplicar as regras e configurar a autenticação:

1. Recarregue a página do aplicativo
2. Faça login com Google ou Email
3. Tente acessar a página de notícias
4. O erro de índice deve desaparecer

## 4. Estrutura de Dados

O Firebase Realtime Database terá a seguinte estrutura:

```
/
├── articles/
│   └── {articleId}/
│       ├── title
│       ├── body
│       ├── publishedAt
│       └── ...
│
├── users/
│   └── {userId}/
│       ├── profile/
│       ├── vocabulary/
│       ├── readingHistory/
│       ├── progress/
│       └── ...
│
└── newsCache/
    └── {topic}/
        ├── articles[]
        └── fetchedAt
```

## 5. Troubleshooting

### Erro: "Index not defined"

Se você ainda ver erros de índice após aplicar as regras:

1. Aguarde 1-2 minutos para as regras propagarem
2. Limpe o cache do navegador
3. Recarregue a página

### Erro: "Permission denied"

Verifique se:

1. O usuário está autenticado (logado)
2. As regras foram publicadas corretamente
3. O UID do usuário corresponde ao caminho no banco

## 6. Configuração das Variáveis de Ambiente

Se você ainda não configurou as variáveis de ambiente, siga os passos na seção 0 deste documento. O arquivo `client/src/services/firebaseConfig.ts` está configurado para ler automaticamente as credenciais do Firebase a partir das variáveis de ambiente definidas no arquivo `.env`.

### Verificando a Configuração

Se você encontrar erros relacionados ao Firebase:

1. Verifique se o arquivo `.env` existe na raiz do projeto
2. Confirme que todas as variáveis `VITE_FIREBASE_*` estão definidas
3. Certifique-se de que não há espaços extras ou aspas ao redor dos valores no `.env`
4. Reinicie o servidor de desenvolvimento após fazer alterações no `.env`
5. Verifique o console do navegador para mensagens de erro específicas

## 7. Monitoramento

Para monitorar o uso do Firebase:

1. Acesse **Realtime Database** > **Usage**
2. Verifique:
   - Número de leituras/escritas
   - Armazenamento usado
   - Conexões simultâneas

## Limites do Plano Gratuito (Spark)

- **Armazenamento**: 1 GB
- **Transferência**: 10 GB/mês
- **Conexões simultâneas**: 100

Se ultrapassar, considere upgrade para plano Blaze (pay-as-you-go).

