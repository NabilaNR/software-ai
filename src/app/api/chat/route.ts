import { NextRequest, NextResponse } from 'next/server';
import { AIService, AIServiceConfig } from '@/services/aiService';
import { RAGService, IndexedDocument } from '@/services/ragService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, history, project, audit, projects, config, documents } = body;

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const configFromEnv: AIServiceConfig = {
      provider: config?.provider,
      apiKey: config?.apiKey,
      model: config?.model
    };

    const resolvedConfig = AIService.resolveConfig(configFromEnv);

    if (!resolvedConfig.apiKey || !resolvedConfig.apiKey.trim()) {
      return NextResponse.json(
        { error: 'API Key is required for AI Chat. Please configure it in the Settings page or on the server.' },
        { status: 400 }
      );
    }

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
- Name: ${project.name}
- Owner: ${project.owner}
- Description: ${project.description}
- Tech Stack Details:
${project.techStack.map((item: any) => `  * ${item.layer}: ${item.technology} (Version: ${item.version}, Support: ${item.supportStatus}, Risk: ${item.risk})`).join('\n')}
`;

      if (audit) {
        projectContext += `
Existing AI Audit Findings & Recommendations:
- Overall Compliance Score: ${audit.overallScore}/100
- Technology Health: ${audit.technologyHealth}
- Security Grade: ${audit.security}
- Scalability: ${audit.scalability}
- Maintainability: ${audit.maintainability}
- Critical Stack Risks:
${(audit.topRisks || []).map((risk: string) => `  * ${risk}`).join('\n')}
- Audit Recommendations & Approved Version Upgrades:
${(audit.recommendations || []).map((rec: any) => `  * Layer: ${rec.layer} | Current Tech: ${rec.currentTech} | Recommended Upgrade: ${rec.recommendedTech} (Benefit: ${rec.benefit})`).join('\n')}
`;
      }
    } else if (projects && projects.length > 0) {
      projectContext = `
Ecosystem Project Catalog Context:
${projects.map((p: any) => `
Project: ${p.name} (Owner: ${p.owner})
Description: ${p.description}
Tech Stack Details:
${p.techStack.map((item: any) => `  * ${item.layer}: ${item.technology} (Version: ${item.version}, Support: ${item.supportStatus}, Risk: ${item.risk})`).join('\n')}
${p.audit ? `AI Audit Report findings:
- Tech Health: ${p.audit.technologyHealth}
- Security: ${p.audit.security}
- Overall Score: ${p.audit.overallScore}/100
- Approved Recommendations:
${(p.audit.recommendations || []).map((rec: any) => `  * Layer: ${rec.layer} | Current Tech: ${rec.currentTech} | Recommended Upgrade: ${rec.recommendedTech} (Benefit: ${rec.benefit})`).join('\n')}
` : '- No AI Audit Report has been generated for this project yet.'}
`).join('\n\n')}
`;
    }

    const systemPrompt = `You are a Senior Software Architect, Security Auditor, and IT Governance Consultant for Bank Negara Indonesia (BNI).
You must answer the user's questions in a highly professional, constructive, and analytical tone, acting as an expert software architect/system auditor.

KNOWLEDGE BASE & ECOSYSTEM AUDIT RULE:
- You MUST read, analyze, and comprehend the entire provided project ecosystem details, technology stack configurations, and retrieved documentation context BEFORE making any evaluation or giving recommendations.
- Always retrieve context from the provided lists of projects and their attached documents.

PERSONA & AUDIT ASSESSMENT COMPLIANCE RULES:
1. For Systems/Applications listed in the AI Audit report (and having audit findings):
   - Your answers, assessments, and recommendations MUST strictly conform to the exact findings, metrics, and details stated in the AI Audit documents for that project.
   - Do NOT assume, speculate, or deviate from the audit context for these systems. Stick 100% to the audit details.
2. For Other Systems/Applications (Not listed/having audit findings in the AI Audit report):
   - If the system exists in the project lists/documents but has no AI Audit report yet, you are free to formulate independent analyses, answers, or recommendations based on the available project documentation or your general industry knowledge.

CRITICAL CONVERSATIONAL INSTRUCTIONS:
- You must reply with highly argumentative, detail-oriented, and comparative answers.
- When suggesting version updates, migration paths, or system changes, explicitly compare the current/old version of the technology (e.g., Spring Boot 2.1, WildFly 14, Jenkins 2.2) with the recommended modern version (e.g., Spring Boot 3.2, WildFly 31, Jenkins 2.452 LTS).
- For every comparison, state exactly what makes the new version superior (such as security patches, CVE vulnerability mitigations, JVM performance, garbage collection improvements, concurrency handling like Java Virtual Threads, cloud scaling optimizations, or library deprecations).
- Avoid generic advice; give exact version numbers, concrete technology trade-offs, and BNI compliance justifications.`;

    const combinedContext = `${projectContext}\n\n=== RETRIEVED DOCUMENTATION ===\n${retrievedContext}`;

    const reply = await AIService.chat({
      config: resolvedConfig,
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
