import { NextRequest } from 'next/server';
import { callGroqStream } from '@/lib/groq';
import { callZAIStreaming } from '@/lib/ai-providers';
import { GROQ_MODELS, GroqModelType } from '@/lib/groq';
import { AGENTS, AgentType } from '@/lib/ai-providers';

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
      messages: chatMessages,
      streamProvider = 'groq', // 'groq' or 'zai'
      agent = 'general'
    } = body;

    if (!prompt && (!chatMessages || chatMessages.length === 0)) {
      return new Response(JSON.stringify({ error: 'Prompt or messages are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const modelKey = model as GroqModelType;
    if (!GROQ_MODELS[modelKey] && model !== 'auto') {
      return new Response(JSON.stringify({ error: 'Invalid model selected' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Build messages array with system prompt based on selected agent
    const selectedAgentData = AGENTS.find(a => a.id === (agent as AgentType)) || AGENTS[0];
    const agentSystemPrompt = `${AMKYAW_SYSTEM_PROMPT}\n\n## Current Agent Mode: ${selectedAgentData.name}\n${selectedAgentData.systemPrompt}`;

    const systemMessage = { role: 'system', content: agentSystemPrompt };
    const userMessage = { role: 'user', content: prompt };

    const messages = chatMessages
      ? [systemMessage, ...chatMessages]
      : [systemMessage, userMessage];

    // Determine which provider to use for streaming
    let stream: ReadableStream | null = null;
    let provider = 'Groq';

    if (streamProvider === 'zai') {
      // Try ZAI streaming first
      const zaiStream = await callZAIStreaming(messages);
      if (zaiStream) {
        stream = zaiStream;
        provider = 'ZAI (GLM-5)';
      } else {
        // Fallback to Groq if ZAI is not configured
        const modelConfig = GROQ_MODELS[modelKey] || GROQ_MODELS['llama-3.3-70b'];
        stream = await callGroqStream(messages, modelConfig.name, temperature, topP);
        provider = 'Groq';
      }
    } else {
      // Default to Groq streaming
      const modelConfig = GROQ_MODELS[modelKey] || GROQ_MODELS['llama-3.3-70b'];
      stream = await callGroqStream(messages, modelConfig.name, temperature, topP);
      provider = 'Groq';
    }

    if (!stream) {
      return new Response(JSON.stringify({ error: 'No streaming provider available' }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Create a streaming response
    const encoder = new TextEncoder();

    const transformStream = new TransformStream({
      transform(chunk, controller) {
        // Parse the SSE chunk
        const lines = chunk.split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') {
              controller.enqueue(encoder.encode('data: [DONE]\n\n'));
            } else {
              try {
                const parsed = JSON.parse(data);
                const content = parsed.choices?.[0]?.delta?.content;
                if (content) {
                  const jsonStr = JSON.stringify({ content });
                  controller.enqueue(encoder.encode(`data: ${jsonStr}\n\n`));
                }
              } catch {
                // Skip invalid JSON
              }
            }
          }
        }
      }
    });

    const responseStream = stream.pipeThrough(transformStream);

    return new Response(responseStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'X-Provider': provider,
      },
    });

  } catch (error) {
    console.error('Chat Stream API Error:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}