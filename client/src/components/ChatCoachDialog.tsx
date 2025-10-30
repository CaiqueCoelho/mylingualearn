import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Send, Mic, MicOff, Volume2, VolumeX } from "lucide-react";
import { toast } from "sonner";
import * as aiService from "@/services/aiService";

interface ChatCoachDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  articleTitle: string;
  articleBody: string;
}

interface Message {
  role: 'user' | 'assistant';
  text: string;
}

export default function ChatCoachDialog({ open, onOpenChange, articleTitle, articleBody }: ChatCoachDialogProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (open && !initialized) {
      initializeChat();
      initializeSpeechRecognition();
    }
    
    return () => {
      stopSpeaking();
      stopListening();
    };
  }, [open]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const initializeSpeechRecognition = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        if (event.error !== 'no-speech') {
          toast.error('Erro no reconhecimento de voz');
        }
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  };

  const startListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
        setIsListening(true);
        toast.info('Fale agora em inglês...');
      } catch (error) {
        console.error('Error starting recognition:', error);
        toast.error('Erro ao iniciar reconhecimento de voz');
      }
    } else {
      toast.error('Reconhecimento de voz não suportado neste navegador');
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      stopSpeaking();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 0.85; // Same as ArticleView "Ouvir" button
      
      // Wait for voices to load
      const setVoiceAndSpeak = () => {
        const voices = speechSynthesis.getVoices();
        
        // Try to find best voice in order of preference
        const preferredVoice = 
          voices.find(v => v.lang === 'en-US' && v.name.includes('Google US English')) ||
          voices.find(v => v.lang === 'en-US' && v.name.includes('Google')) ||
          voices.find(v => v.lang.startsWith('en-US') && v.name.includes('Natural')) ||
          voices.find(v => v.lang.startsWith('en') && v.name.includes('Google')) ||
          voices.find(v => v.lang.startsWith('en') && v.name.includes('Natural')) ||
          voices.find(v => v.lang.startsWith('en-US')) ||
          voices.find(v => v.lang.startsWith('en'));
        
        if (preferredVoice) {
          utterance.voice = preferredVoice;
          console.log('[Voice] Using:', preferredVoice.name);
        } else {
          console.log('[Voice] No preferred voice found, using default');
        }
        
        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);
        
        window.speechSynthesis.speak(utterance);
      };
      
      // Check if voices are already loaded
      const voices = speechSynthesis.getVoices();
      if (voices.length > 0) {
        setVoiceAndSpeak();
      } else {
        // Wait for voices to load
        speechSynthesis.addEventListener('voiceschanged', setVoiceAndSpeak, { once: true });
      }
    }
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const initializeChat = async () => {
    try {
      setIsLoading(true);
      
      const articleContext = `Article Title: ${articleTitle}\n\nArticle: ${articleBody.substring(0, 800)}`;
      
      const greeting = await aiService.chatWithCoach(
        [{ role: 'user', text: 'Start the conversation by greeting me and asking what I thought about the article.' }],
        articleContext
      );
      
      const assistantMessage = { role: 'assistant' as const, text: greeting };
      setMessages([assistantMessage]);
      setInitialized(true);
      
      // Auto-speak greeting
      if (autoSpeak) {
        speak(greeting);
      }
    } catch (err: any) {
      console.error('Chat initialization error:', err);
      setError(err.message || 'Erro ao inicializar coach. Tente novamente.');
      toast.error('Erro ao inicializar chat');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    
    const newMessages = [...messages, { role: 'user' as const, text: userMessage }];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const articleContext = `Article Title: ${articleTitle}\n\nArticle: ${articleBody.substring(0, 800)}`;
      
      const response = await aiService.chatWithCoach(newMessages, articleContext);
      
      const assistantMessage = { role: 'assistant' as const, text: response };
      setMessages([...newMessages, assistantMessage]);
      
      // Auto-speak response
      if (autoSpeak) {
        speak(response);
      }
    } catch (err: any) {
      console.error('Chat error:', err);
      toast.error('Erro ao enviar mensagem');
      setMessages(messages);
      setInput(userMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClose = () => {
    stopSpeaking();
    stopListening();
    setMessages([]);
    setInput("");
    setInitialized(false);
    setError(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl h-[700px] max-h-[85vh] flex flex-col p-0 gap-0 overflow-hidden min-h-0">
        {/* Header */}
        <DialogHeader className="px-6 py-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl">🗣️ Coach de Conversação</DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Pratique inglês conversando sobre: <span className="font-medium">{articleTitle}</span>
              </p>
            </div>
            <Button
              variant={autoSpeak ? "default" : "outline"}
              size="sm"
              onClick={() => setAutoSpeak(!autoSpeak)}
              title={autoSpeak ? "Desativar áudio automático" : "Ativar áudio automático"}
            >
              {autoSpeak ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </Button>
          </div>
        </DialogHeader>

        {error && (
          <div className="flex-1 flex items-center justify-center p-6">
            <div className="text-center space-y-4">
              <p className="text-sm text-red-600">{error}</p>
              <Button onClick={initializeChat} variant="outline">
                Tentar Novamente
              </Button>
            </div>
          </div>
        )}

        {!error && (
          <>
            {/* Messages */}
            <ScrollArea className="flex-1 px-6 py-4 overflow-y-auto min-h-0">
              <div ref={scrollRef} className="space-y-4">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex items-start gap-3 ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                  >
                    {/* Avatar */}
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      message.role === 'user' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gradient-to-br from-purple-500 to-indigo-600 text-white'
                    }`}>
                      {message.role === 'user' ? '👤' : '🤖'}
                    </div>
                    
                    {/* Message bubble */}
                    <div className={`flex flex-col gap-1 max-w-[75%] ${message.role === 'user' ? 'items-end' : 'items-start'}`}>
                      <div
                        className={`rounded-2xl px-4 py-3 ${
                          message.role === 'user'
                            ? 'bg-blue-600 text-white rounded-tr-sm'
                            : 'bg-gray-100 text-gray-900 rounded-tl-sm'
                        }`}
                      >
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.text}</p>
                      </div>
                      
                      {/* Speak button for assistant messages */}
                      {message.role === 'assistant' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2 text-xs"
                          onClick={() => speak(message.text)}
                        >
                          <Volume2 className="h-3 w-3 mr-1" />
                          Ouvir
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
                
                {isLoading && (
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-sm">
                      🤖
                    </div>
                    <div className="bg-gray-100 rounded-2xl rounded-tl-sm px-4 py-3">
                      <Loader2 className="h-4 w-4 animate-spin text-gray-600" />
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Input area */}
            <div className="px-6 py-4 border-t bg-gray-50">
              <div className="flex gap-2">
                <Button
                  variant={isListening ? "destructive" : "outline"}
                  size="icon"
                  onClick={isListening ? stopListening : startListening}
                  disabled={isLoading || !initialized}
                  title={isListening ? "Parar gravação" : "Falar com microfone"}
                  className="flex-shrink-0"
                >
                  {isListening ? (
                    <MicOff className="h-4 w-4 animate-pulse" />
                  ) : (
                    <Mic className="h-4 w-4" />
                  )}
                </Button>
                
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={isListening ? "Ouvindo..." : "Digite ou fale em inglês..."}
                  disabled={isLoading || !initialized || isListening}
                  className="flex-1"
                />
                
                <Button 
                  onClick={handleSend} 
                  disabled={isLoading || !input.trim() || !initialized}
                  size="icon"
                  className="flex-shrink-0"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
              
              <p className="text-xs text-muted-foreground mt-2 text-center">
                💡 Dica: Clique no microfone para falar ou digite sua mensagem
              </p>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
