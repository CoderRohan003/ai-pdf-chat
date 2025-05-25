import { processAndStorePDFText } from '@/lib/chunk-and-embed';
import { NextRequest, NextResponse } from 'next/server';
import pdfParse from 'pdf-parse';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const userId = formData.get('userId') as string | null;

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file uploaded' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const result = await pdfParse(buffer);
    const text = result.text;

    // Optional: associate with user
    await processAndStorePDFText(text); // You can add userId handling here if needed

    return NextResponse.json({
      success: true,
      extractedText: text,
    });
  } catch (err) {
    console.error('PDF upload error:', err);
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}
