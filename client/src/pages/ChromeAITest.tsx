import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

export default function ChromeAITest() {
  const [testing, setTesting] = useState(false);
  const [status, setStatus] = useState<any>(null);
  const [downloading, setDownloading] = useState(false);

  async function checkStatus() {
    setTesting(true);
    try {
      // Check if LanguageModel global exists (Chrome 131+)
      if (typeof LanguageModel === 'undefined') {
        setStatus({
          availability: 'unavailable',
          message: '❌ LanguageModel não encontrado. Use Chrome 131+ ou Chrome Canary.',
          hint: 'Verifique chrome://flags e habilite #prompt-api-for-gemini-nano-multimodal-input',
        });
        toast.error('Chrome AI não encontrado');
        return;
      }

      // Check if availability() method exists
      if (!LanguageModel.availability) {
        setStatus({
          availability: 'unavailable',
          message: '❌ LanguageModel.availability() não encontrado.',
          hint: 'Atualize para Chrome 131+ ou Chrome Canary mais recente',
        });
        toast.error('API desatualizada');
        return;
      }

      // Get availability status
      const availability = await LanguageModel.availability();
      setStatus({
        availability,
        api: 'LanguageModel (global)',
        message: 
          availability === 'available' ? '✅ Chrome AI pronto!' :
          availability === 'downloadable' ? '⏳ Modelo precisa ser baixado' :
          availability === 'downloading' ? '⬇️ Baixando modelo...' :
          '❌ Chrome AI não disponível',
      });
      
      if (availability === 'available') {
        toast.success('Chrome AI está pronto para uso!');
      } else if (availability === 'downloadable') {
        toast.info('Modelo precisa ser baixado. Clique em "Forçar Download"');
      } else if (availability === 'downloading') {
        toast.info('Download em andamento...');
      } else {
        toast.warning('Chrome AI não disponível neste dispositivo');
      }
    } catch (error: any) {
      setStatus({
        availability: 'unavailable',
        error: error.message,
        message: '❌ Erro ao verificar status',
      });
      toast.error('Erro: ' + error.message);
    } finally {
      setTesting(false);
    }
  }

  async function forceDownload() {
    setDownloading(true);
    try {
      toast.info('Iniciando download do modelo... Isso pode levar alguns minutos.');

      if (typeof LanguageModel === 'undefined') {
        toast.error('Chrome AI não disponível - use Chrome 131+');
        return;
      }

      const session = await LanguageModel.create();
      
      toast.success('Modelo baixado! Testando...');

      const response = await session.prompt('Say hello in Portuguese');
      console.log('Test response:', response);

      toast.success('Funcionando! Resposta: ' + response.substring(0, 50));
      
      session.destroy();
      
      // Recheck status
      await checkStatus();
    } catch (error: any) {
      console.error('Download error:', error);
      toast.error('Erro ao baixar: ' + error.message);
    } finally {
      setDownloading(false);
    }
  }

  async function testTranslation() {
    try {
      toast.info('Testando tradução...');

      if (typeof LanguageModel === 'undefined') {
        toast.error('Chrome AI não disponível - use Chrome 131+');
        return;
      }

      const session = await LanguageModel.create({
        systemPrompt: 'You are a translator. Translate English to Portuguese.',
      });
      
      const response = await session.prompt('Translate to Portuguese: The quick brown fox jumps over the lazy dog');

      toast.success('Tradução: ' + response);
      console.log('Translation:', response);
      
      session.destroy();
    } catch (error: any) {
      console.error('Translation error:', error);
      toast.error('Erro: ' + error.message);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Chrome AI - Teste de Disponibilidade</CardTitle>
            <CardDescription>
              Verifique se o Chrome AI (Gemini Nano) está disponível e funcionando
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <Button onClick={checkStatus} disabled={testing}>
                {testing ? 'Verificando...' : 'Verificar Status'}
              </Button>
              
              <Button 
                onClick={forceDownload} 
                disabled={downloading}
                variant="secondary"
              >
                {downloading ? 'Baixando...' : 'Forçar Download do Modelo'}
              </Button>
              
              <Button 
                onClick={testTranslation}
                variant="outline"
              >
                Testar Tradução
              </Button>
            </div>

            {status && (
              <Card className="bg-slate-50">
                <CardHeader>
                  <CardTitle className="text-lg">Status Atual</CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="text-sm overflow-auto p-4 bg-white rounded border">
                    {JSON.stringify(status, null, 2)}
                  </pre>
                </CardContent>
              </Card>
            )}

            <Card className="bg-blue-50 border-blue-200">
              <CardHeader>
                <CardTitle className="text-lg">Como Habilitar</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p><strong>1.</strong> Use <strong>Chrome 131+</strong> ou <strong>Chrome Canary</strong></p>
                <p><strong>2.</strong> Abra <code className="bg-white px-2 py-1 rounded">chrome://flags/#prompt-api-for-gemini-nano-multimodal-input</code></p>
                <p><strong>3.</strong> Selecione <strong>Enabled</strong></p>
                <p><strong>4.</strong> Clique em <strong>Relaunch</strong></p>
                <p><strong>5.</strong> Aguarde alguns minutos para o modelo baixar</p>
                <p><strong>6.</strong> Verifique em <code className="bg-white px-2 py-1 rounded">chrome://on-device-internals</code></p>
                <p className="mt-4 text-blue-700">
                  <strong>Teste no Console:</strong> <code className="bg-white px-2 py-1 rounded">await LanguageModel.availability()</code>
                </p>
                <p className="text-blue-700">
                  Deve retornar: <code className="bg-white px-2 py-1 rounded">"available"</code>
                </p>
              </CardContent>
            </Card>

            <Card className="bg-amber-50 border-amber-200">
              <CardHeader>
                <CardTitle className="text-lg">Valores de availability()</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p>• <code className="bg-white px-2 py-1 rounded">"available"</code> - Pronto para usar</p>
                <p>• <code className="bg-white px-2 py-1 rounded">"downloadable"</code> - Precisa baixar (clique em "Forçar Download")</p>
                <p>• <code className="bg-white px-2 py-1 rounded">"downloading"</code> - Download em andamento</p>
                <p>• <code className="bg-white px-2 py-1 rounded">"unavailable"</code> - Não disponível neste dispositivo</p>
              </CardContent>
            </Card>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

