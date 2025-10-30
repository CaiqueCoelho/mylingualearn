import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, BookmarkPlus, Check } from 'lucide-react';
import { useFirebaseAuth } from '@/contexts/FirebaseAuthContext';
import * as firebaseDb from '@/services/firebaseDatabase';
import { toast } from 'sonner';
import * as aiService from '@/services/aiService';

interface WordTranslationModalProps {
  word: string;
  onClose: () => void;
}

export function WordTranslationModal({ word, onClose }: WordTranslationModalProps) {
  const { user } = useFirebaseAuth();
  const [translation, setTranslation] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    translateWord();
  }, [word]);

  async function translateWord() {
    setLoading(true);
    try {
      const result = await aiService.translateWord(word);
      setTranslation(result.translation);
    } catch (error) {
      console.error('[Translation] Error:', error);
      setTranslation('Erro ao traduzir');
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!user) {
      toast.error('Faça login para salvar palavras');
      return;
    }
    
    try {
      await firebaseDb.saveWord(user.uid, {
        lemma: word,
        word: word,
        ptDef: translation,
        reviewCount: 0,
        createdAt: Date.now(),
      });
      toast.success('Palavra salva!');
      setIsSaved(true);
    } catch (error) {
      toast.error('Erro ao salvar');
    }
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-2xl">{word}</DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : (
            <div>
              <p className="text-lg mb-4">{translation}</p>
              
              {user ? (
                <Button
                  onClick={handleSave}
                  disabled={isSaved}
                  className="w-full"
                >
                  {isSaved ? (
                    <><Check className="w-4 h-4 mr-2" /> Salva</>
                  ) : (
                    <><BookmarkPlus className="w-4 h-4 mr-2" /> Salvar no Vocabulário</>
                  )}
                </Button>
              ) : (
                <p className="text-sm text-muted-foreground text-center">
                  Faça login para salvar palavras
                </p>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
