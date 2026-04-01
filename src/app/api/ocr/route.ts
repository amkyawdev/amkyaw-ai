import { NextRequest, NextResponse } from 'next/server';

// Simple OCR using Tesseract.js
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const image = formData.get('image') as File | null;
    
    if (!image) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    // Convert file to base64
    const bytes = await image.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString('base64');
    const mimeType = image.type || 'image/png';
    const dataUrl = `data:${mimeType};base64,${base64}`;

    // Dynamic import to avoid issues
    const Tesseract = await import('tesseract.js');
    
    const result = await Tesseract.recognize(dataUrl, 'eng+myan', {
      logger: () => {},
    });

    return NextResponse.json({
      success: true,
      text: result.data.text,
      confidence: result.data.confidence,
    });
  } catch (error) {
    console.error('OCR error:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Failed to process image',
    }, { status: 500 });
  }
}