import { NextRequest, NextResponse } from "next/server";

// Simple translation function using LibreTranslate API (free and open source)
// You can also use Google Translate, DeepL, etc.
async function translateText(text: string, targetLang: string): Promise<string> {
  try {
    // Using MyMemory Translation API (free, no API key required)
    // For production, you might want to use Google Translate API or DeepL
    const response = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|${targetLang}`
    );
    
    const data = await response.json();
    
    if (data.responseStatus === 200) {
      return data.responseData.translatedText;
    }
    
    // Fallback: return original text if translation fails
    return text;
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