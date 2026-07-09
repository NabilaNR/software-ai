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

    // 1. Intelligent RAG context retrieval
    const docList = (documents || []) as IndexedDocument[];
    let retrievedContext = '';
    const totalLength = docList.reduce((sum, d) => sum + (d.text?.length || 0), 0);

    if (totalLength > 0) {
      if (totalLength < 35000) {
        // For small/medium documents, pass the complete file contents to guarantee 100% reading accuracy
        retrievedContext = docList
          .map(d => `[Full content of file: ${d.filename}]\n${d.text}`)
          .join('\n\n');
      } else {
        // For larger knowledge bases, retrieve the top 6 most relevant chunks
        const relevantChunks = RAGService.retrieve(prompt, docList, 6);
        retrievedContext = relevantChunks
          .map(c => `[From file: ${c.source}]\n${c.text}`)
          .join('\n\n');
      }
    }

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

CRITICAL CONVERSATIONAL INSTRUCTIONS:
- You must reply with highly argumentative, detail-oriented, and comparative answers.
- When suggesting version updates, migration paths, or system changes, explicitly compare the current/old version of the technology (e.g., Spring Boot 2.1, WildFly 14, Jenkins 2.2) with the recommended modern version (e.g., Spring Boot 3.2, WildFly 31, Jenkins 2.452 LTS).
- For every comparison, state exactly what makes the new version superior (such as security patches, CVE vulnerability mitigations, JVM performance, garbage collection improvements, concurrency handling like Java Virtual Threads, cloud scaling optimizations, or library deprecations).
- Avoid generic advice; give exact version numbers, concrete technology trade-offs, and BNI compliance justifications.`;

    const combinedContext = `${projectContext}\n\n=== RETRIEVED DOCUMENTATION ===\n${retrievedContext}`;

    const reply = await AIService.chat({
      config: aiConfig,
      prompt,
      systemPrompt,
      context: combinedContext,
      history: history || []
    });

    return NextResponse.json({ reply: reply.replace(/\*/g, '') });
  } catch (error: any) {
    console.error('API Chat Route error:', error);
    return NextResponse.json(
      { error: error.message || 'An error occurred during AI chat.' },
      { status: 500 }
    );
  }
}
export const dynamic = 'force-dynamic';
