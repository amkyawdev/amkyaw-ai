import { NextRequest, NextResponse } from 'next/server';
import { callGroq, GROQ_MODELS, GroqModelType, BURMESE_SYSTEM_PROMPT, isValidResponse } from '@/lib/groq';
import { callWithFallback, AGENTS, AgentType } from '@/lib/ai-providers';
import { isHFConfigured } from '@/lib/huggingface';

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
      huggingface: true, // Always available for fallback
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
    let lastError = '';

    // Helper to check if response is valid and good quality
    const isPoorResponse = (text: string): boolean => {
      if (!text || text.trim().length === 0) return true;
      // Too short (likely an error message)
      if (text.trim().length < 10) return true;
      // Contains common error indicators
      const lower = text.toLowerCase();
      if (lower.includes('error') || lower.includes('failed') || 
          lower.includes('not found') || lower.includes('unable to') ||
          lower.includes('could not') || lower.includes('exception')) {
        // But allow legitimate short responses like "Yes", "No", "OK"
        if (text.trim().length < 5) return true;
      }
      return false;
    };

    // Try each provider in order until one succeeds (auto rotation)
    try {
      // 1. Try Groq first (primary)
      const modelConfig = GROQ_MODELS[modelKey] || GROQ_MODELS['llama-3.3-70b'];
      const groqResult = await callGroq(messages, modelConfig.name, temperature, topP);
      response = groqResult.choices?.[0]?.message?.content ?? '';
      provider = 'Groq';
      
      // If Groq fails or gives poor response, try other providers
      if (isPoorResponse(response)) {
        lastError = 'Groq: ' + (response || 'empty response');
        
        // 2. Try HuggingFace if configured
        if (!response) {
          try {
            const { callWithFallback } = await import('@/lib/ai-providers');
            const hfResult = await callWithFallback(messages, 'huggingface');
            if (hfResult.success && hfResult.response && !isPoorResponse(hfResult.response)) {
              response = hfResult.response;
              provider = hfResult.provider || 'HuggingFace';
              lastError = '';
            }
          } catch (e: any) { lastError += ', HuggingFace failed'; }
        }
        
        // 3. Try Groq with different model
        if (isPoorResponse(response)) {
          try {
            const altModel = modelKey === 'llama-3.3-70b' ? 'mixtral-8x7b' : 'llama-3.3-70b';
            const altGroqResult = await callGroq(messages, GROQ_MODELS[altModel as GroqModelType].name, temperature, topP);
            const altResponse = altGroqResult.choices?.[0]?.message?.content ?? '';
            if (!isPoorResponse(altResponse)) {
              response = altResponse;
              provider = `Groq (${altModel})`;
              lastError = '';
            }
          } catch (e: any) { lastError += ', Alt Groq failed'; }
        }
      }
    } catch (error) {
      console.error('Provider chain error:', error);
      lastError = String(error);
      // If primary fails, try fallback chain
      const fallbackResult = await callWithFallback(messages, 'groq');
      if (fallbackResult.success && fallbackResult.response) {
        response = fallbackResult.response;
        provider = fallbackResult.provider || 'Fallback';
      }
    }

    // Validate response
    if (isPoorResponse(response)) {
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
        huggingface: isHFConfigured(),
      },
    });

  } catch (error) {
    console.error('Chat API Error:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    if (errorMessage.includes('GROQ_API_KEY') || errorMessage.includes('key')) {
      // Try fallback to HuggingFace
      if (isHFConfigured()) {
        try {
          const result = await callWithFallback([], 'huggingface');
          if (result.success && result.response) {
            return NextResponse.json({
              response: result.response,
              model: 'hf-model',
              provider: 'HuggingFace (fallback)',
              availableProviders: {
                groq: false,
                huggingface: true,
              },
            });
          }
        } catch {}
      }
      return NextResponse.json(
        { error: 'No AI provider configured. Please add GROQ_API_KEY or HUGGINGFACE_API_KEY in environment variables.' },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}