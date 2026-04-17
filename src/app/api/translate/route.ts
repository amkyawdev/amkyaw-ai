import { NextRequest, NextResponse } from "next/server";
import { callGroq } from "@/lib/groq";

// Groq translation function - uses AI to translate text
async function translateWithGroq(text: string, targetLang: string): Promise<string> {
  const systemPrompt = `You are a translator. Translate the given text accurately to the target language.
- Preserve the meaning and tone of the original text
- If target is Burmese (my), write in Myanmar script (Unicode)
- Provide only the translation, no explanations`;

  const userPrompt = targetLang === "my" 
    ? `Translate the following English text to Myanmar (Burmese):\n\n${text}`
    : `Translate the following text to ${targetLang}:\n\n${text}`;

  const messages = [
    { role: "system", content: systemPrompt },
    { role: "user", content: userPrompt }
  ];

  const result = await callGroq(messages, "llama-3.3-70b-instant", 0.3, 0.9);
  
  if (result.choices?.[0]?.message?.content) {
    return result.choices[0].message.content;
  }
  
  throw new Error("Translation failed");
}

// Main translation function - uses Groq
async function translateText(text: string, targetLang: string): Promise<string> {
  try {
    return await translateWithGroq(text, targetLang === "my" ? "my" : targetLang);
  } catch (error) {
    console.error("Translation error:", error);
    return text;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { text, targetLang } = await request.json();

    if (!text) {
      return NextResponse.json(
        { error: "No text to translate" },
        { status: 400 }
      );
    }

    // Split text into chunks to avoid hitting API limits
    const chunks = text.match(/.{1,500}/g) || [];
    const translatedChunks: string[] = [];

    for (const chunk of chunks) {
      const translated = await translateText(chunk, targetLang || "my");
      translatedChunks.push(translated);
    }

    const translatedText = translatedChunks.join("\n");

    return NextResponse.json({
      translatedText,
      sourceLang: "en",
      targetLang: targetLang || "my"
    });
  } catch (error: any) {
    console.error("Translation API error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to translate text" },
      { status: 500 }
    );
  }
}