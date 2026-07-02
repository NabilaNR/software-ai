import { NextRequest, NextResponse } from 'next/server';
import { decodePDFText } from 'unpdf';
import { extractRawText } from 'mammoth';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const projectId = formData.get('projectId') as string;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const filename = file.name;
    const extension = filename.split('.').pop()?.toLowerCase();
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    let extractedText = '';

    if (extension === 'pdf') {
      try {
        const parsed = await decodePDFText(arrayBuffer, { mergePages: true });
        extractedText = (parsed.text as string) || '';
      } catch (err: any) {
        console.error('PDF parsing error:', err);
        return NextResponse.json({ error: 'Failed to parse PDF document: ' + err.message }, { status: 500 });
      }
    } else if (extension === 'docx') {
      try {
        const parsed = await extractRawText({ buffer });
        extractedText = parsed.value;
      } catch (err: any) {
        console.error('DOCX parsing error:', err);
        return NextResponse.json({ error: 'Failed to parse DOCX document: ' + err.message }, { status: 500 });
      }
    } else if (['txt', 'md', 'json', 'yaml', 'yml'].includes(extension || '')) {
      extractedText = buffer.toString('utf-8');
    } else {
      return NextResponse.json({ error: `Unsupported file type: .${extension}` }, { status: 400 });
    }

    if (!extractedText.trim()) {
      return NextResponse.json({ error: 'File contains no extractable text.' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      filename,
      projectId: projectId || 'global',
      text: extractedText,
      sizeBytes: file.size,
      status: 'Indexed'
    });
  } catch (error: any) {
    console.error('File upload/extract error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
export const dynamic = 'force-dynamic';
