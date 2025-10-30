import { z } from 'zod';
import { publicProcedure, router } from '../_core/trpc';
import { invokeLLM } from '../_core/llm';

export const aiRouter = router({
  /**
   * Traduz texto de inglês para português
   */
  translate: publicProcedure
    .input(z.object({ text: z.string() }))
    .mutation(async ({ input }) => {
      try {
        const response = await invokeLLM({
          messages: [
            {
              role: 'system',
              content: 'You are a translator. Translate English text to Brazilian Portuguese. Return ONLY the translation, no explanations.',
            },
            {
              role: 'user',
              content: input.text,
            },
          ],
        });

        const content = response.choices[0]?.message?.content;
        const translation = typeof content === 'string' ? content.trim() : input.text;
        return { translation };
      } catch (error: any) {
        console.error('[AI Router] Translation error:', error);
        throw new Error('Falha na tradução');
      }
    }),

  /**
   * Traduz uma palavra com contexto adicional
   */
  translateWord: publicProcedure
  .input(z.object({ word: z.string() }))
  .mutation(async ({ input }) => {
    try {
      // Check if LLM is available
      if (!process.env.BUILT_IN_FORGE_API_KEY && !process.env.OPENAI_API_KEY) {
        console.log('[AI Router] No API key configured, returning word as-is');
        return {
          translation: input.word,
          examples: [],
        };
      }
      
      const response = await invokeLLM({
        messages: [
          {
            role: 'system',
            content: `You are a language learning assistant. For the given English word, provide:
1. Brazilian Portuguese translation
2. IPA phonetic transcription (if applicable)
3. 2-3 example sentences in English

Return as JSON: { "translation": "...", "phonetic": "...", "examples": ["...", "..."] }`,
          },
          {
            role: 'user',
            content: input.word,
          },
        ],
      });

      const content = response.choices[0]?.message?.content;
      
      // Se não houver conteúdo, retorne fallback simples
      if (!content) {
        return {
          translation: input.word,
          examples: [],
        };
      }
      
      const contentStr = typeof content === 'string' ? content : '{}';
      
      try {
        const parsed = JSON.parse(contentStr);
        return {
          translation: parsed.translation || input.word,
          phonetic: parsed.phonetic,
          examples: parsed.examples || [],
        };
      } catch {
        // Fallback se não for JSON válido
        return {
          translation: contentStr.trim() || input.word,
          examples: [],
        };
      }
    } catch (error: any) {
      console.error('[AI Router] Word translation error:', error);
      // Retornar fallback ao invés de throw
      return {
        translation: input.word,
        examples: [],
      };
    }
  }),

  /**
   * Gera quiz de compreensão
   */
  generateQuiz: publicProcedure
    .input(z.object({
      article: z.object({
        title: z.string(),
        body: z.string(),
      }),
    }))
    .mutation(async ({ input }) => {
      try {
        const response = await invokeLLM({
          messages: [
            {
              role: 'system',
              content: `You are an ESL quiz generator. Create 5 multiple-choice questions about the article.
Return ONLY a JSON array with this format:
[
  {
    "type": "mcq",
    "question": "Question text?",
    "choices": ["Option A", "Option B", "Option C", "Option D"],
    "answerKey": 0,
    "rationale": "Explanation"
  }
]`,
            },
            {
              role: 'user',
              content: `Article Title: ${input.article.title}\n\nArticle Body: ${input.article.body.substring(0, 2000)}`,
            },
          ],
        });

        const content = response.choices[0]?.message?.content;
        const contentStr = typeof content === 'string' ? content : '[]';
        
        try {
          const jsonMatch = contentStr.match(/\[[\s\S]*\]/);
          if (jsonMatch) {
            const questions = JSON.parse(jsonMatch[0]);
            return { questions };
          }
        } catch (parseError) {
          console.error('[AI Router] Quiz JSON parse error:', parseError);
        }
        
        return { questions: [] };
      } catch (error: any) {
        console.error('[AI Router] Quiz generation error:', error);
        throw new Error('Falha na geração do quiz');
      }
    }),

  /**
   * Chat com coach de conversação
   */
  chat: publicProcedure
    .input(z.object({
      messages: z.array(z.object({
        role: z.enum(['user', 'assistant']),
        text: z.string(),
      })),
      articleContext: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      try {
        const systemPrompt = `You are a friendly English conversation coach for Brazilian learners.
Speak in simple English (A2–B1 level). Correct mistakes gently.
Add Portuguese hints only when the user asks ('em português').
Always end your response with a follow-up question to keep the conversation going.`;

        const messages: any[] = [
          { role: 'system', content: systemPrompt },
        ];

        if (input.articleContext) {
          messages.push({
            role: 'system',
            content: `Article context: ${input.articleContext.substring(0, 500)}`,
          });
        }

        input.messages.forEach(msg => {
          messages.push({
            role: msg.role,
            content: msg.text,
          });
        });

        const response = await invokeLLM({ messages });

        const assistantResponse = response.choices[0]?.message?.content || 
          "I'm sorry, I couldn't process that. Can you try again?";

        return { response: assistantResponse };
      } catch (error: any) {
        console.error('[AI Router] Chat error:', error);
        throw new Error('Falha no chat');
      }
    }),
});

