import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useFirebaseAuth } from "@/contexts/FirebaseAuthContext";
import * as firebaseDb from "@/services/firebaseDatabase";
import { toast } from "sonner";

export default function Onboarding() {
  const [, setLocation] = useLocation();
  const { user } = useFirebaseAuth();
  const [selectedLevel, setSelectedLevel] = useState<string>("");
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);

  const levels = [
    { id: "A1", name: "Iniciante (A1)" },
    { id: "A2", name: "Básico (A2)" },
    { id: "B1", name: "Intermediário (B1)" },
    { id: "B2", name: "Intermediário Avançado (B2)" },
    { id: "C1", name: "Avançado (C1)" },
    { id: "C2", name: "Proficiente (C2)" },
  ];

  const topics = [
    "technology", "science", "business", "health", "sports",
    "entertainment", "fashion", "politics", "animals", "travel",
    "anime", "movies", "comedy"
  ];

  function toggleTopic(topic: string) {
    setSelectedTopics(prev =>
      prev.includes(topic)
        ? prev.filter(t => t !== topic)
        : [...prev, topic]
    );
  }

  async function handleComplete() {
    if (!user || !selectedLevel || selectedTopics.length === 0) {
      toast.error("Selecione um nível e pelo menos um tópico");
      return;
    }

    try {
      await firebaseDb.saveUserProfile(user.uid, {
        level: selectedLevel,
        topics: selectedTopics,
        onboardingCompleted: true,
        updatedAt: Date.now(),
      });

      await firebaseDb.saveProgress(user.uid, {
        xp: 0,
        level: 1,
        streak: 0,
        lastActivity: Date.now(),
      });

      toast.success("Perfil configurado!");
      setLocation("/news");
    } catch (error: any) {
      console.error("[Onboarding] Error:", error);
      toast.error("Erro ao salvar perfil");
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full">
        <CardHeader>
          <CardTitle className="text-2xl">Bem-vindo ao MyLinguaLearn!</CardTitle>
          <p className="text-muted-foreground">Configure seu perfil para começar</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-semibold mb-3">Qual é o seu nível de inglês?</h3>
            <div className="grid grid-cols-2 gap-2">
              {levels.map(level => (
                <Button
                  key={level.id}
                  variant={selectedLevel === level.id ? "default" : "outline"}
                  onClick={() => setSelectedLevel(level.id)}
                  className="justify-start"
                >
                  {level.name}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-3">Quais tópicos te interessam?</h3>
            <div className="flex flex-wrap gap-2">
              {topics.map(topic => (
                <Badge
                  key={topic}
                  variant={selectedTopics.includes(topic) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => toggleTopic(topic)}
                >
                  {topic}
                </Badge>
              ))}
            </div>
          </div>

          <Button
            onClick={handleComplete}
            disabled={!selectedLevel || selectedTopics.length === 0}
            className="w-full"
            size="lg"
          >
            Começar a Aprender
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
