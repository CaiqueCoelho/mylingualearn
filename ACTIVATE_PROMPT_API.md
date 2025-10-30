# Como Ativar o Prompt API do Chrome AI

## 🔍 Diagnóstico

Você tem o modelo instalado (`Ready`), mas o **PromptApi** não está ativo:

```
PromptApi: Version 0, Recently Used: false
```

Isso significa que a API existe mas nunca foi usada ainda.

## ✅ Solução: Forçar Ativação do PromptApi

### Método 1: Via Console (Mais Rápido)

1. **Abra o DevTools** (F12)

2. **Cole este código no Console:**

```javascript
// Ativar PromptApi forçando uso
(async () => {
  console.log('🔍 Verificando window.ai...');
  console.log('window.ai existe?', !!window.ai);
  console.log('window.ai.languageModel existe?', !!window.ai?.languageModel);
  
  if (!window.ai?.languageModel) {
    console.error('❌ window.ai.languageModel não encontrado!');
    console.log('📋 Flags necessárias:');
    console.log('1. chrome://flags/#prompt-api-for-gemini-nano → Enabled');
    console.log('2. chrome://flags/#optimization-guide-on-device-model → Enabled BypassPerfRequirement');
    console.log('3. Reinicie o Chrome completamente');
    return;
  }
  
  console.log('✅ window.ai.languageModel encontrado!');
  console.log('🔄 Verificando capabilities...');
  
  const capabilities = await window.ai.languageModel.capabilities();
  console.log('📊 Capabilities:', capabilities);
  
  if (capabilities.available === 'no') {
    console.error('❌ Modelo não disponível');
    return;
  }
  
  if (capabilities.available === 'after-download') {
    console.log('⏳ Modelo precisa ser baixado. Criando sessão para forçar download...');
  }
  
  console.log('🚀 Criando sessão de IA...');
  const session = await window.ai.languageModel.create();
  console.log('✅ Sessão criada!');
  
  console.log('💬 Testando prompt...');
  const response = await session.prompt('Say "Hello from Chrome AI!" in Portuguese');
  console.log('🎉 Resposta:', response);
  
  console.log('✅ PromptApi ativado com sucesso!');
  console.log('🔄 Agora vá em chrome://on-device-internals/ e veja que PromptApi está ativo');
})();
```

3. **Aguarde a execução** (pode levar 1-2 minutos na primeira vez)

4. **Verifique em** `chrome://on-device-internals/`
   - `PromptApi` deve mostrar `Recently Used: true`
   - `Version` deve ser maior que 0

### Método 2: Via Página de Teste

1. Acesse: `http://localhost:3000/chrome-ai-test`

2. Clique em **"Verificar Status"**
   - Deve mostrar detalhes sobre `window.ai`

3. Clique em **"Forçar Download do Modelo"**
   - Isso criará uma sessão e ativará o PromptApi

4. Aguarde a mensagem de sucesso

5. Clique em **"Testar Tradução"**

### Método 3: Ativar Manualmente via chrome://on-device-internals/

1. Acesse: `chrome://on-device-internals/`

2. Na seção **Feature Adaptations**, encontre **PromptApi**

3. Clique em **"set to true"** ao lado de `Recently Used`

4. Aguarde alguns segundos

5. Recarregue a página e verifique se `Version` mudou

## 🔧 Troubleshooting

### "window.ai não encontrado"

**Causa:** Flags não habilitadas ou Chrome muito antigo

**Solução:**
1. Abra `chrome://flags`
2. Busque e habilite:
   - `#prompt-api-for-gemini-nano` → **Enabled**
   - `#optimization-guide-on-device-model` → **Enabled BypassPerfRequirement**
3. Clique em "Relaunch" para reiniciar o Chrome
4. Aguarde 1-2 minutos após reiniciar

### "window.ai.languageModel não encontrado"

**Causa:** Flag específica do Prompt API não habilitada

**Solução:**
1. `chrome://flags/#prompt-api-for-gemini-nano` → **Enabled**
2. Reinicie o Chrome
3. Aguarde o modelo baixar (verifique em `chrome://components`)

### "available: after-download"

**Causa:** Modelo não foi baixado ainda

**Solução:**
1. Execute o Método 1 (Console) - isso forçará o download
2. OU vá em `chrome://components`
3. Procure "Optimization Guide On Device Model"
4. Clique em "Check for update"
5. Aguarde download (2-10 minutos)

### "available: no"

**Causa:** Requisitos de hardware não atendidos ou modelo corrompido

**Solução:**
1. Verifique VRAM: `chrome://on-device-internals/` deve mostrar VRAM > 3000 MiB
2. Se VRAM OK, tente remover e reinstalar:
   ```bash
   # Feche o Chrome completamente
   # Remova a pasta do modelo:
   # Mac: ~/Library/Application Support/Google/Chrome/OptGuideOnDeviceModel
   # Windows: %LOCALAPPDATA%\Google\Chrome\User Data\OptGuideOnDeviceModel
   # Linux: ~/.config/google-chrome/OptGuideOnDeviceModel
   
   # Reabra o Chrome e force download novamente
   ```

### PromptApi continua com "Recently Used: false"

**Causa:** API nunca foi chamada ainda

**Solução:**
1. Execute o código do Método 1 no Console
2. Isso criará uma sessão e fará um prompt
3. O Chrome marcará automaticamente como "Recently Used: true"
4. Após isso, a API ficará disponível permanentemente

## 🎯 Verificação Final

Após seguir os passos, execute no Console:

```javascript
(async () => {
  const caps = await window.ai.languageModel.capabilities();
  console.log('Status:', caps.available); // Deve ser "readily"
  
  if (caps.available === 'readily') {
    const session = await window.ai.languageModel.create();
    const result = await session.prompt('Translate to Portuguese: Hello World');
    console.log('Tradução:', result);
    console.log('✅ Tudo funcionando!');
  }
})();
```

Se aparecer a tradução, está tudo OK! 🎉

## 📚 Referências

- Chrome AI Origin Trial: https://developer.chrome.com/docs/ai/built-in
- Prompt API Docs: https://github.com/explainers-by-googlers/prompt-api
- Chrome Canary: https://www.google.com/chrome/canary/

## 💡 Dica

Depois de ativar uma vez, o PromptApi fica disponível permanentemente (enquanto você usar o Chrome regularmente). Se ficar muito tempo sem usar, pode ser desativado automaticamente para economizar recursos.

