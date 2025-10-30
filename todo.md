# MyLinguaLearn - TODO

## ✅ Concluído

- [x] **Corrigir Chrome Translator API** (IMPORTANTE!)
  - Usar `Translator` ao invés de `translation`
  - API correta conforme documentação oficial
  - Português (pt) é suportado nativamente!
  - Type definitions atualizadas
  
- [x] Implementar Chrome Translator API
  - Criado chromeTranslatorService.ts com API correta
  - Integrado no aiService.ts
  - Suporte para português confirmado
  
- [x] Adicionar fallback de tradução gratuita
  - Criado freeTranslateService.ts
  - Usa MyMemory API (gratuita, sem API key)
  - Fallback para LibreTranslate API (open-source)
  - Integrado no aiService.ts
  
- [x] Remover dependência de OPENAI_API_KEY
  - Cliente não usa mais servidor para tradução
  - Sistema funciona 100% com Chrome APIs + APIs gratuitas
  
- [x] Aplicar correções do QuizDialog
  - Aceita tanto "choices" (servidor) quanto "options" (Chrome AI)
  - Reset de selectedAnswer ao avançar pergunta
  - Normalização de answerKey (número ou string)
  
- [x] Aplicar melhorias de legibilidade do artigo
  - Título maior (text-4xl md:text-5xl)
  - Espaçamento entre linhas confortável (leading-8)
  - Parágrafos bem separados (mb-6)
  - Texto justificado (text-justify)
  - Fonte maior (text-lg = 18px)

## 🎯 Funcionalidades Principais

- ✅ Chrome AI (Gemini Nano) com LanguageModel API
- ✅ **Chrome Translator API** (português suportado!)
- ✅ Fallback para APIs gratuitas (MyMemory, LibreTranslate)
- ✅ Quiz interativo com Chrome AI
- ✅ Chat coach com Chrome AI
- ✅ Vocabulário com tradução automática
- ✅ Leitura de artigos em inglês
- ✅ Sistema de gamificação (XP, níveis)
- ✅ Firebase Authentication
- ✅ Firebase Realtime Database

## 🔄 Fluxo de Tradução (Correto!)

1. **Chrome Translator API** ⚡
   - Usa `Translator.availability()` e `Translator.create()`
   - Português (pt) é suportado nativamente
   - Tradução on-device, rápida e privada
   
2. **MyMemory API** 🌐 (fallback)
   - Gratuita, sem rate limit, sem API key
   
3. **LibreTranslate API** 🔓 (fallback secundário)
   - Open-source, gratuita
   
4. **Palavra original** (se tudo falhar)

## 📝 Idiomas Suportados pelo Chrome Translator

Usa códigos BCP 47:
- `'en'` - Inglês
- `'pt'` - **Português** ✅
- `'es'` - Espanhol
- `'fr'` - Francês
- E muitos outros...

## 📝 Notas Importantes

- **Chrome Translator API usa `Translator` (não `translation`)**
- **Português é suportado nativamente!**
- Chrome AI requer Chrome 131+ ou Chrome Canary
- Flags necessárias: #prompt-api-for-gemini-nano-multimodal-input
- Sem dependência de OpenAI ou servidor LLM
- APIs gratuitas funcionam em qualquer navegador
- Sem necessidade de API keys

## 🚀 Como Usar

1. Instale Chrome 131+ ou Chrome Canary (recomendado)
2. Habilite flags em chrome://flags
3. Execute `pnpm install`
4. Execute `pnpm dev`
5. Clique em qualquer palavra para traduzir!

**Tradução funciona perfeitamente com Chrome Translator API!** 🎉

- [x] Redesenhar Coach de Conversação como chat moderno
  - Layout de chat moderno com bolhas de mensagem
  - Avatares para usuário e coach
  - Cores e espaçamento melhorados
  - Header com gradiente
  
- [x] Implementar Speech-to-Text (Web Speech API) para falar
  - Botão de microfone
  - Reconhecimento de voz em inglês (en-US)
  - Indicação visual quando ouvindo
  - Transcrição automática para input
  
- [x] Implementar Text-to-Speech (Web Speech API) para ouvir respostas
  - Botão "Ouvir" em cada mensagem do coach
  - Áudio automático das respostas (pode ser desativado)
  - Voz em inglês (en-US)
  - Controle de reprodução
  
- [x] Corrigir layout quebrado do modal
  - Altura fixa (700px)
  - Scroll apenas na área de mensagens
  - Input fixo na parte inferior
  - Responsivo e moderno

- [x] Mostrar tradução do artigo em popup/modal ao invés de substituir texto original
  - Modal com scroll para texto longo
  - Botão "Copiar Tradução" para clipboard
  - Mostra título do artigo no header
  - Parágrafos formatados e justificados
  - Texto original permanece intacto
