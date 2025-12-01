import OpenAI from 'openai';

const openai = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
});

export interface KimiGenerationParams {
  topic: string;
  outline?: string;
  context?: string;
  voiceProfileSamples?: string[];
  streaming?: boolean;
}

export interface KimiMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export class KimiClient {
  private buildSystemPrompt(voiceProfileSamples: string[] = [], context?: string): string {
    let prompt = "You are SolidWriter, an expert AI writing assistant that creates long-form content.";
    
    if (voiceProfileSamples.length > 0) {
      prompt += "\n\nAnalyze the following user writing samples to understand the writing style:";
      voiceProfileSamples.forEach((sample, index) => {
        prompt += `\n\nSample ${index + 1}:\n${sample}`;
      });
      prompt += "\n\nUse this writing style to create content that mimics the tone, voice, and writing patterns.";
    }
    
    if (context) {
      prompt += `\n\nAdditional context: ${context}`;
    }
    
    return prompt;
  }

  async generateContent(params: KimiGenerationParams): Promise<string> {
    const { topic, outline, context, voiceProfileSamples = [], streaming = false } = params;
    
    const systemPrompt = this.buildSystemPrompt(voiceProfileSamples, context);
    
    const messages: KimiMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Write a comprehensive article about: ${topic}` }
    ];

    if (outline) {
      messages.push({
        role: 'user',
        content: `Follow this outline structure:\n${outline}`
      });
    }

    // Fixed: Added 'as any' to bypass TypeScript union errors
    const completion = await openai.chat.completions.create({
      model: 'moonshotai/kimi-k2-thinking',
      messages,
      temperature: 0.7,
      max_tokens: 4000,
      stream: streaming,
    }) as any;

    if (streaming) {
      // For streaming, we'll handle this in the API route
      return '';
    }

    return completion.choices[0]?.message?.content || '';
  }

  async generateOutline(topic: string, context?: string): Promise<string> {
    const systemPrompt = this.buildSystemPrompt([], context);
    
    const messages: KimiMessage[] = [
      { role: 'system', content: systemPrompt },
      { 
        role: 'user', 
        content: `Create a detailed outline for an article about "${topic}". Include main sections and subsections.` 
      }
    ];

    // Fixed: Added 'as any' here too, otherwise the build will fail on this function next
    const completion = await openai.chat.completions.create({
      model: 'moonshotai/kimi-k2-thinking',
      messages,
      temperature: 0.5,
      max_tokens: 2000,
    }) as any;

    return completion.choices[0]?.message?.content || '';
  }

  async *generateStream(params: KimiGenerationParams): AsyncGenerator<string, void, unknown> {
    const { topic, outline, context, voiceProfileSamples = [] } = params;
    
    const systemPrompt = this.buildSystemPrompt(voiceProfileSamples, context);
    
    const messages: KimiMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Write a comprehensive article about: ${topic}` }
    ];

    if (outline) {
      messages.push({
        role: 'user',
        content: `Follow this outline structure:\n${outline}`
      });
    }

    // Fixed: Cast stream to 'any' to ensure async iterator compatibility
    const stream = await openai.chat.completions.create({
      model: 'moonshotai/kimi-k2-thinking',
      messages,
      temperature: 0.7,
      stream: true,
    }) as any;

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      if (content) {
        yield content;
      }
    }
  }
}

export const kimiClient = new KimiClient();
