import { NextRequest, NextResponse } from "next/server";

// Using LibreTranslate with open API instance
// Try multiple instances for better reliability
const LIBRE_TRANSLATE_URLS = [
  "https://libretranslate.com/translate",
  "https://translate.argosdeepl.com/translate", 
  "https://translate.terraprint.co/translate"
];

async function translateWithLibreTranslate(text: string, targetLang: string): Promise<string> {
  let lastError: Error | null = null;
  
  for (const url of LIBRE_TRANSLATE_URLS) {
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          q: text,
          source: "en",
          target: targetLang === "my" ? "my" : targetLang,
          format: "text"
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.translatedText) {
          return data.translatedText;
        }
      }
    } catch (error) {
      lastError = error as Error;
      continue;
    }
  }
  
  throw lastError || new Error("All translation services failed");
}

// Main translation function
async function translateText(text: string, targetLang: string): Promise<string> {
  try {
    return await translateWithLibreTranslate(text, targetLang === "my" ? "my" : targetLang);
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