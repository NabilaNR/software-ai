import { NextRequest, NextResponse } from 'next/server';
import { AIService, AIServiceConfig } from '@/services/aiService';
import { RAGService, IndexedDocument } from '@/services/ragService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, history, project, config, documents } = body;

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    if (!config || !config.apiKey || !config.apiKey.trim()) {
      return NextResponse.json(
        { error: 'API Key is required for AI Chat. Please configure it in the Settings page.' },
        { status: 400 }
      );
    }

    const aiConfig: AIServiceConfig = {
      provider: config.provider,
      apiKey: config.apiKey,
      model: config.model
    };

    // 1. Perform RAG retrieval from project documents
    const docList = (documents || []) as IndexedDocument[];
    const relevantChunks = RAGService.retrieve(prompt, docList, 5);
    const retrievedContext = relevantChunks
      .map(c => `[From file: ${c.source}]\n${c.text}`)
      .join('\n\n');

    // 2. Build project tech stack description to provide as standard context
    let projectContext = '';
    if (project) {
      projectContext = `
Project Context:
Name: ${project.name}
Owner: ${project.owner}
Description: ${project.description}
Tech Stack Details:
${project.techStack.map((item: any) => `- ${item.layer}: ${item.technology} (Version: ${item.version}, Support: ${item.supportStatus}, Risk: ${item.risk})`).join('\n')}
`;
    }

    const systemPrompt = `You are a Senior Software Architect and IT Governance Consultant for Bank Negara Indonesia (BNI).
You must answer the user's questions in a highly professional, constructive, and analytical tone, acting as an expert software architect.
Base your answers on:
1. The project's tech stack (provided in the context).
2. The uploaded project documents (provided in the context).
3. Industry best practices, modern enterprise design, and cloud scalability standards.

If the user asks questions about specific files or documents, refer to the provided RAG context.
If the answer is not in the uploaded documents, use your general knowledge of the technologies, but prioritize the specific versions and details of the current project.
Always give specific reasons and technical trade-offs (e.g. why upgrading from Laravel 8 is critical, alternatives to RabbitMQ like Kafka, scaling strategies, etc.).`;

    const combinedContext = `${projectContext}\n\n=== RETRIEVED DOCUMENTATION ===\n${retrievedContext}`;

    const reply = await AIService.chat({
      config: aiConfig,
      prompt,
      systemPrompt,
      context: combinedContext,
      history: history || []
    });

    return NextResponse.json({ reply });
  } catch (error: any) {
    console.error('API Chat Route error:', error);
    return NextResponse.json(
      { error: error.message || 'An error occurred during AI chat.' },
      { status: 500 }
    );
  }
}
export const dynamic = 'force-dynamic';
