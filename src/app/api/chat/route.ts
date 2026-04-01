import { NextRequest, NextResponse } from 'next/server';
import { callGroq, GROQ_MODELS, GroqModelType, BURMESE_SYSTEM_PROMPT, isValidResponse } from '@/lib/groq';
import { callWithFallback, isZAIConfigured, isStabilityConfigured, isOllamaConfigured, isAlibabaConfigured, AGENTS, AgentType } from '@/lib/ai-providers';

export const runtime = 'nodejs';

// Enhanced system prompt with Amkyaw AI identity
const AMKYAW_SYSTEM_PROMPT = `You are Amkyaw AI, a professional AI assistant created by Aung Myo Kyaw.

## Your Identity:
- Name: Amkyaw AI
- Created by: Aung Myo Kyaw
- When asked "What AI are you?", respond: "I am Amkyaw AI, here to help you."
- Always be helpful, friendly, and professional

## Your Capabilities (when asked "what can you do?"):
1. 💬 Conversation - Conversation, Q&A, casual chat
2. 💻 Coding - Write, debug, explain code (use markdown code blocks with copy button)
3. 🌐 Translation - English ↔ Burmese translation
4. ✍️ Writing - Articles, stories, content writing
5. 🔍 Analysis - Data analysis, sentiment analysis
6. 📝 Summarization - Quick summarization
7. 🎨 Image Generation - Image generation

## Language Rules:
- Respond in the same language as user input

## Code Response Guidelines:
- Always use markdown code blocks with language specification
- Example: \`\`\`javascript\n// code here\n\`\`\`
- Add brief explanations before or after code
- Make code well-formatted and copyable

## Important:
- If unsure, say "I'm not sure"
- Keep responses concise but complete
- Be friendly and conversational`;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      prompt, 
      model = 'llama-3.3-70b', 
      temperature = 0.2, 
      topP = 0.8,
      chatId,
      messages: chatMessages,
      forceProvider,
      agent = 'general'
    } = body;

    if (!prompt && (!chatMessages || chatMessages.length === 0)) {
      return NextResponse.json(
        { error: 'Prompt or messages are required' },
        { status: 400 }
      );
    }

    // Get available providers
    const availableProviders = {
      groq: true,
      zai: isZAIConfigured(),
      ollama: isOllamaConfigured(),
      alibaba: isAlibabaConfigured(),
    };

    const modelKey = model as GroqModelType;
    if (!GROQ_MODELS[modelKey] && model !== 'auto') {
      return NextResponse.json(
        { error: 'Invalid model selected' },
        { status: 400 }
      );
    }

    // Build messages array with system prompt based on selected agent
    const selectedAgentData = AGENTS.find(a => a.id === (agent as AgentType)) || AGENTS[0];
    const agentSystemPrompt = `${AMKYAW_SYSTEM_PROMPT}\n\n## Current Agent Mode: ${selectedAgentData.name}\n${selectedAgentData.systemPrompt}`;
    
    const systemMessage = { role: 'system', content: agentSystemPrompt };
    const userMessage = { role: 'user', content: prompt };
    
    const messages = chatMessages 
      ? [systemMessage, ...chatMessages]
      : [systemMessage, userMessage];

    let response = '';
    let provider = 'Groq';

    // Try each provider in order until one succeeds (auto rotation)
    try {
      // 1. Try Groq first (primary)
      const modelConfig = GROQ_MODELS[modelKey] || GROQ_MODELS['llama-3.3-70b'];
      const groqResult = await callGroq(messages, modelConfig.name, temperature, topP);
      response = groqResult.choices?.[0]?.message?.content ?? '';
      provider = 'Groq';
      
      // If Groq fails, try other providers
      if (!response || !isValidResponse(response)) {
        // 2. Try ZAI if configured
        if (isZAIConfigured()) {
          const zaiResult = await callWithFallback(messages, 'zai');
          if (zaiResult.success && zaiResult.response) {
            response = zaiResult.response;
            provider = zaiResult.provider || 'ZAI';
          }
        }
        
        // 3. Try Ollama if configured
        if (!response && isOllamaConfigured()) {
          const { callOllama } = await import('@/lib/ai-providers');
          const ollamaResult = await callOllama(messages, 'llama3');
          if (ollamaResult.success && ollamaResult.response) {
            response = ollamaResult.response;
            provider = 'Ollama (Llama 3)';
          }
        }
        
        // 4. Try Alibaba if configured
        if (!response && isAlibabaConfigured()) {
          const { callAlibaba } = await import('@/lib/ai-providers');
          const alibabaResult = await callAlibaba(messages, 'qwen-plus');
          if (alibabaResult.success && alibabaResult.response) {
            response = alibabaResult.response;
            provider = 'Alibaba (Qwen Plus)';
          }
        }
      }
    } catch (error) {
      console.error('Provider chain error:', error);
      // If primary fails, try fallback chain
      const fallbackResult = await callWithFallback(messages, 'groq');
      if (fallbackResult.success && fallbackResult.response) {
        response = fallbackResult.response;
        provider = fallbackResult.provider || 'Fallback';
      }
    }

    // Validate response
    if (!isValidResponse(response)) {
      response = 'Sorry, I could not generate a response. Please try again.';
    }

    return NextResponse.json({
      response,
      model: modelKey,
      provider,
      agent: selectedAgentData.name,
      chatId,
      availableProviders: {
        groq: true,
        zai: isZAIConfigured(),
        ollama: isOllamaConfigured(),
        alibaba: isAlibabaConfigured(),
        stability: isStabilityConfigured(),
      },
    });

  } catch (error) {
    console.error('Chat API Error:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    if (errorMessage.includes('GROQ_API_KEY') || errorMessage.includes('key')) {
      // Try fallback to ZAI
      if (isZAIConfigured()) {
        try {
          const { callWithFallback } = await import('@/lib/ai-providers');
          const result = await callWithFallback([], 'zai');
          if (result.success && result.response) {
            return NextResponse.json({
              response: result.response,
              model: 'glm-5',
              provider: 'ZAI (fallback)',
              availableProviders: {
                groq: false,
                zai: true,
                stability: isStabilityConfigured(),
              },
            });
          }
        } catch {}
      }
      return NextResponse.json(
        { error: 'No AI provider configured. Please add GROQ_API_KEY or ZAI_API_KEY in environment variables.' },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}