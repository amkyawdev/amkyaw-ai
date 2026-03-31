import { NextRequest, NextResponse } from 'next/server';
import { callGroq, GROQ_MODELS, GroqModelType, BURMESE_SYSTEM_PROMPT, isValidResponse } from '@/lib/groq';
import { callWithFallback, isZAIConfigured, isStabilityConfigured } from '@/lib/ai-providers';

export const runtime = 'nodejs';

// Enhanced system prompt with Amkyaw AI identity
const AMKYAW_SYSTEM_PROMPT = `You are Amkyaw AI, a professional AI assistant created by Aung Myo Kyaw.

## Your Identity:
- Name: Amkyaw AI
- Created by: Aung Myo Kyaw
- When asked "What AI are you?" or "ဘာ AI လဲ", respond: "နောက်ဆုံးစားပါး မှာ Amkyaw AI ဖြစ်ပါတယ်။ သင့်ကို ကူညီဖို့ အသင့်အတွက် ရှိပါပါ။"
- Always be helpful, friendly, and professional

## Your Capabilities (when asked "what can you do?" or "ဘာလုပ်နိုင်လည်း"):
1. 💬 စကားပြောခြင်း - Conversation, Q&A, casual chat
2. 💻 ကုဒ်ရေးခြင်း - Write, debug, explain code (use markdown code blocks with copy button)
3. 🌐 ဘာသာပြန်ခြင်း - English ↔ Burmese translation
4. ✍️ စာရေးခြင်း - Articles, stories, content writing
5. 🔍 ခွဲခြမ်းစိတ်ဖြာခြင်း - Data analysis, sentiment analysis
6. 📝 အနှစ်ချုပ်ခြင်း - Quick summarization
7. 🎨 ပုံဆွဲခြင်း - Image generation

## Myanmar Text Rules:
- Respond in the same language as user input
- If Burmese Unicode (ကခဂဃ...), respond in Burmese
- Use proper Myanmar Unicode characters (U+1000 to U+109F)

## Code Response Guidelines:
- Always use markdown code blocks with language specification
- Example: \`\`\`javascript\n// code here\n\`\`\`
- Add brief explanations before or after code
- Make code well-formatted and copyable

## Important:
- If unsure, say "မသေချာပါပါ။" (I'm not sure)
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
      forceProvider 
    } = body;

    if (!prompt && (!chatMessages || chatMessages.length === 0)) {
      return NextResponse.json(
        { error: 'Prompt or messages are required' },
        { status: 400 }
      );
    }

    // Get available providers
    const availableProviders = {
      groq: true, // Groq is primary
      zai: isZAIConfigured(),
    };

    const modelKey = model as GroqModelType;
    if (!GROQ_MODELS[modelKey] && model !== 'auto') {
      return NextResponse.json(
        { error: 'Invalid model selected' },
        { status: 400 }
      );
    }

    // Build messages array with system prompt
    const systemMessage = { role: 'system', content: AMKYAW_SYSTEM_PROMPT };
    const userMessage = { role: 'user', content: prompt };
    
    const messages = chatMessages 
      ? [systemMessage, ...chatMessages]
      : [systemMessage, userMessage];

    let response = '';
    let provider = 'Groq';

    // Use fallback system if preferred provider fails
    if (forceProvider === 'zai' && isZAIConfigured()) {
      const result = await callWithFallback(messages, 'zai');
      if (result.success && result.response) {
        response = result.response;
        provider = result.provider || 'ZAI';
      } else {
        // Fallback to Groq
        const groqResult = await callGroq(messages, GROQ_MODELS['llama-3.3-70b'].name, temperature, topP);
        response = groqResult.choices?.[0]?.message?.content ?? '';
        provider = 'Groq (fallback)';
      }
    } else {
      // Try Groq first (primary)
      try {
        const modelConfig = GROQ_MODELS[modelKey] || GROQ_MODELS['llama-3.3-70b'];
        const groqResult = await callGroq(messages, modelConfig.name, temperature, topP);
        response = groqResult.choices?.[0]?.message?.content ?? '';
        provider = 'Groq';
      } catch (groqError) {
        // If Groq fails and ZAI is available, try ZAI
        if (isZAIConfigured()) {
          const zaiResult = await callWithFallback(messages, 'zai');
          if (zaiResult.success && zaiResult.response) {
            response = zaiResult.response;
            provider = zaiResult.provider || 'ZAI';
          }
        }
      }
    }

    // Validate response
    if (!isValidResponse(response)) {
      response = 'ပြန်ဖြေနိုင်သည်မရှိပါ။ ကျေးဇူးပြု၍ မေးခွန်းအား ပြန်လည်ရိုက်ထည့်ပါ။';
    }

    return NextResponse.json({
      response,
      model: modelKey,
      provider,
      chatId,
      availableProviders: {
        groq: true,
        zai: isZAIConfigured(),
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