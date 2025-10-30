# MyLinguaLearn - Arquitetura de Dados

## Visão Geral

O MyLinguaLearn utiliza **Firebase Realtime Database** como banco de dados principal para todos os dados da aplicação.

## Estrutura de Dados

```
firebase-realtime-database/
├── articles/
│   └── {articleId}/
│       ├── id
│       ├── title
│       ├── summary
│       ├── body
│       ├── topics[]
│       ├── publishedAt
│       ├── readingLevel
│       ├── source
│       ├── sourceUrl
│       ├── imageUrl
│       ├── isScraped
│       └── createdAt
│
├── users/
│   └── {userId}/
│       ├── profile/
│       │   ├── name
│       │   ├── email
│       │   ├── level
│       │   ├── topics[]
│       │   └── updatedAt
│       │
│       ├── vocabulary/
│       │   └── {wordId}/
│       │       ├── lemma
│       │       ├── word
│       │       ├── pos
│       │       ├── ipa
│       │       ├── enDef
│       │       ├── ptDef
│       │       ├── example
│       │       ├── reviewCount
│       │       ├── nextReview
│       │       └── createdAt
│       │
│       ├── readingHistory/
│       │   └── {articleId}/
│       │       ├── title
│       │       ├── readAt
│       │       └── timestamp
│       │
│       ├── progress/
│       │   ├── xp
│       │   ├── level
│       │   ├── streak
│       │   ├── lastActivity
│       │   └── lastUpdated
│       │
│       ├── activities/
│       │   └── {activityId}/
│       │       ├── type
│       │       ├── articleId
│       │       ├── title
│       │       └── timestamp
│       │
│       ├── quizResults/
│       │   └── {quizId}/
│       │       ├── articleId
│       │       ├── score
│       │       ├── totalQuestions
│       │       └── completedAt
│       │
│       └── savedArticles/
│           └── {articleId}/
│               ├── ... (article data)
│               └── savedAt
│
└── newsCache/
    └── {topic}/
        ├── topic
        ├── articles[]
        └── fetchedAt
```

## Operações Principais

### Artigos
- `getArticles(limit)` - Buscar artigos recentes
- `getArticleById(id)` - Buscar artigo específico
- `saveArticle(article)` - Salvar artigo
- `saveArticles(articles[])` - Salvar múltiplos artigos

### Vocabulário
- `saveWord(userId, word)` - Salvar palavra
- `getVocabulary(userId)` - Listar vocabulário
- `updateWord(userId, wordId, updates)` - Atualizar palavra
- `deleteWord(userId, wordId)` - Remover palavra

### Perfil e Progresso
- `saveUserProfile(userId, profile)` - Salvar perfil
- `getUserProfile(userId)` - Buscar perfil
- `saveProgress(userId, progress)` - Atualizar progresso
- `getProgress(userId)` - Buscar progresso

### Histórico e Atividades
- `saveReadingHistory(userId, articleId, data)` - Registrar leitura
- `getReadingHistory(userId)` - Buscar histórico
- `logActivity(userId, activity)` - Registrar atividade
- `getActivities(userId, limit)` - Buscar atividades

### Quizzes
- `saveQuizResult(userId, result)` - Salvar resultado
- `getQuizResults(userId)` - Buscar resultados

### Cache de Notícias
- `getNewsFetchCache(topic)` - Verificar cache
- `saveNewsFetchCache(topic, articles)` - Salvar cache

## Benefícios da Arquitetura Firebase

1. **Tempo Real**: Sincronização automática entre dispositivos
2. **Offline First**: Dados disponíveis mesmo sem internet
3. **Escalabilidade**: Firebase escala automaticamente
4. **Segurança**: Regras de segurança no Firebase Console
5. **Simplicidade**: Sem necessidade de servidor backend complexo
6. **Custo**: Plano gratuito generoso do Firebase

## Configuração de Segurança

Configure as regras no Firebase Console:

```json
{
  "rules": {
    "articles": {
      ".read": true,
      ".write": "auth != null"
    },
    "users": {
      "$uid": {
        ".read": "$uid === auth.uid",
        ".write": "$uid === auth.uid"
      }
    },
    "newsCache": {
      ".read": true,
      ".write": "auth != null"
    }
  }
}
```

## Operações Server-Side

Algumas operações ainda requerem o servidor (tRPC):
- Buscar notícias da NewsData.io API (requer API key)
- Fazer scraping de conteúdo completo de artigos
- Operações que não podem ser feitas no cliente por segurança

## IndexedDB (Cache Local)

Além do Firebase, o app usa IndexedDB (Dexie) para:
- Cache de artigos lidos recentemente
- Acesso offline a conteúdo
- Melhor performance em leituras frequentes

