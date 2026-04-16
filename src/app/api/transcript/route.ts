import { NextRequest, NextResponse } from "next/server";
import { promisify } from "util";
import { exec } from "child_process";

const execAsync = promisify(exec);

// Extract YouTube video ID
function extractVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/shorts\/([^&\n?#]+)/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

export async function POST(request: NextRequest) {
  try {
    const { youtubeUrl, videoId } = await request.json();

    if (!videoId) {
      return NextResponse.json(
        { error: "Invalid YouTube URL" },
        { status: 400 }
      );
    }

    // Get the absolute path to the transcribe script
    const scriptPath = `${process.cwd()}/scripts/transcribe.py`;
    
    // Run the Python script
    const { stdout, stderr } = await execAsync(
      `python3 "${scriptPath}" "${youtubeUrl}"`,
      { maxBuffer: 10 * 1024 * 1024 } // 10MB buffer for large transcripts
    );

    // Parse the JSON output from the script
    const result = JSON.parse(stdout);

    if (result.error) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      transcript: result.transcript,
      title: result.title,
      videoId
    });
  } catch (error: any) {
    console.error("Transcript extraction error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to extract transcript" },
      { status: 500 }
    );
  }
}