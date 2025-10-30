# Configuração do Firebase para MyLinguaLearn

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

## 6. Monitoramento

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

