import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";
import * as aiService from "@/services/aiService";

interface QuizDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  articleTitle: string;
  articleBody: string;
}

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
}

interface GeneratedQuestion {
  type?: string;
  question: string;
  choices?: string[];
  answerKey?: number | string;
  rationale?: string;
}

export default function QuizDialog({ open, onOpenChange, articleTitle, articleBody }: QuizDialogProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && questions.length === 0) {
      generateQuiz();
    }
    if (!open) {
      // Reset quiz state when dialog closes
      setQuestions([]);
      setCurrentQuestion(0);
      setSelectedAnswer(null);
      setShowResult(false);
      setScore(0);
      setError(null);
    }
  }, [open]);

  // Reset selected answer when question changes
  useEffect(() => {
    setSelectedAnswer(null);
    setShowResult(false);
  }, [currentQuestion]);

  const generateQuiz = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      // Use unified AI service with automatic fallback
      const generatedQuestions = await aiService.generateQuiz({
        title: articleTitle,
        body: articleBody,
      });

      console.log('[QuizDialog] Generated questions:', generatedQuestions);
      console.log('[QuizDialog] First question structure:', JSON.stringify(generatedQuestions[0], null, 2));

      if (generatedQuestions && generatedQuestions.length > 0) {
        // Convert to our format - accept both "choices" (server) and "options" (Chrome AI)
        const formattedQuestions: QuizQuestion[] = generatedQuestions
          .map((q, index) => {
            // Normalize: Chrome AI uses "options", server uses "choices"
            const choices = q.choices || q.options;
            const answerKey = typeof q.answerKey === 'number' ? q.answerKey : 
                             (q.answer && choices ? choices.indexOf(q.answer) : 0);
            
            console.log(`[QuizDialog] Question ${index}:`, {
              hasChoices: !!choices,
              choicesType: typeof choices,
              choicesIsArray: Array.isArray(choices),
              choicesLength: choices?.length,
              allKeys: Object.keys(q)
            });
            
            return {
              question: q.question,
              options: choices || [],
              correctAnswer: answerKey >= 0 ? answerKey : 0,
            };
          })
          .filter(q => q.options && Array.isArray(q.options) && q.options.length >= 2)
          .slice(0, 5); // Max 5 questions

        console.log('[QuizDialog] Formatted questions:', formattedQuestions);

        if (formattedQuestions.length > 0) {
          setQuestions(formattedQuestions);
        } else {
          console.error('[QuizDialog] No valid MCQ questions after filtering');
          throw new Error('Nenhuma pergunta válida foi gerada. Tente novamente.');
        }
      } else {
        console.error('[QuizDialog] No questions returned from AI service');
        throw new Error('Nenhuma pergunta foi gerada. Tente novamente.');
      }
    } catch (err: any) {
      console.error('[QuizDialog] Quiz generation error:', err);
      const errorMessage = err.message || 'Erro ao gerar quiz. Tente novamente.';
      console.error('[QuizDialog] Error message:', errorMessage);
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null) return;

    const isCorrect = selectedAnswer === questions[currentQuestion].correctAnswer;
    if (isCorrect) {
      setScore(score + 1);
      toast.success('Correto! 🎉');
    } else {
      toast.error('Incorreto. A resposta certa era: ' + questions[currentQuestion].options[questions[currentQuestion].correctAnswer]);
    }

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null); // Reset selection for next question
    } else {
      setShowResult(true);
    }
  };

  const handleRestart = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setScore(0);
    setQuestions([]);
    generateQuiz();
  };

  const handleClose = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setScore(0);
    setQuestions([]);
    setError(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Quiz de Compreensão</DialogTitle>
          <DialogDescription>
            Teste sua compreensão do artigo: {articleTitle}
          </DialogDescription>
        </DialogHeader>

        {isGenerating && (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <p className="text-sm text-gray-600">Gerando perguntas...</p>
          </div>
        )}

        {error && !isGenerating && (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <XCircle className="h-12 w-12 text-red-500" />
            <p className="text-sm text-red-600 text-center">{error}</p>
            <Button onClick={generateQuiz} variant="outline">
              Tentar Novamente
            </Button>
          </div>
        )}

        {!isGenerating && !error && questions.length > 0 && !showResult && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">
                Pergunta {currentQuestion + 1} de {questions.length}
              </span>
              <span className="text-sm font-medium text-blue-600">
                Pontuação: {score}
              </span>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">{questions[currentQuestion].question}</h3>

              <RadioGroup 
                value={selectedAnswer !== null ? selectedAnswer.toString() : undefined} 
                onValueChange={(val) => setSelectedAnswer(parseInt(val))}
              >
                {questions[currentQuestion].options.map((option, index) => (
                  <div key={index} className="flex items-center space-x-2 p-3 rounded-lg border hover:bg-gray-50">
                    <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                    <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                      {option}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <Button 
              onClick={handleSubmitAnswer} 
              disabled={selectedAnswer === null}
              className="w-full"
            >
              {currentQuestion < questions.length - 1 ? 'Próxima Pergunta' : 'Finalizar Quiz'}
            </Button>
          </div>
        )}

        {showResult && (
          <div className="flex flex-col items-center justify-center py-12 space-y-6">
            <CheckCircle2 className="h-16 w-16 text-green-500" />
            <div className="text-center space-y-2">
              <h3 className="text-2xl font-bold">Quiz Concluído!</h3>
              <p className="text-lg">
                Você acertou <span className="font-bold text-blue-600">{score}</span> de{' '}
                <span className="font-bold">{questions.length}</span> perguntas
              </p>
              <p className="text-sm text-gray-600">
                {score === questions.length
                  ? '🎉 Perfeito! Você dominou este artigo!'
                  : score >= questions.length * 0.7
                  ? '👏 Muito bem! Boa compreensão!'
                  : score >= questions.length * 0.5
                  ? '👍 Bom trabalho! Continue praticando!'
                  : '💪 Continue estudando! Você vai melhorar!'}
              </p>
            </div>

            <div className="flex gap-3">
              <Button onClick={handleRestart} variant="outline">
                Fazer Novo Quiz
              </Button>
              <Button onClick={handleClose}>
                Fechar
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

