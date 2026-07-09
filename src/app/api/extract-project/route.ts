import { NextRequest, NextResponse } from 'next/server';
import { AIService, AIServiceConfig } from '@/services/aiService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { projectName, documentText, config } = body;

    if (!projectName) {
      return NextResponse.json({ error: 'Project name is required' }, { status: 400 });
    }
    if (!documentText) {
      return NextResponse.json({ error: 'Specification document text is required' }, { status: 400 });
    }
    if (!config || !config.apiKey || !config.apiKey.trim()) {
      return NextResponse.json(
        { error: 'API Key is required to extract project profiles. Please configure it in Settings.' },
        { status: 400 }
      );
    }

    const aiConfig: AIServiceConfig = {
      provider: config.provider,
      apiKey: config.apiKey,
      model: config.model
    };

    const systemPrompt = `You are a Senior Software Architect and IT Governance Consultant for Bank Negara Indonesia (BNI).
Your task is to analyze the provided software specification document and extract the project architecture details.

CRITICAL INSTRUCTIONS:
- Do NOT make up or guess any technologies. If the document does not explicitly or implicitly mention any software technologies, databases, frameworks, or cloud providers, set the "techStack" array to an empty array ([])!
- Do NOT invent division owners. If not mentioned in the text, set the "owner" property to an empty string ("")!
- Do NOT guess cloud costs. If there are no infrastructure or technology details mentioned to suggest cloud costs, set the "estimatedMonthlyCost" to 0!
- Do NOT write placeholder descriptions. If the document has no readable description, set the "description" to an empty string ("")!
- Do NOT invent diagrams. If there are no architecture details, set the "architectureDiagram" to an empty string ("")!

You must respond strictly with a valid JSON object matching the following structure:
{
  "owner": "Division/Department owner (e.g. Core Banking Division, Transactional Banking Technology)",
  "description": "A concise 2-3 sentence overview of what the system does based on the spec",
  "estimatedMonthlyCost": number (suggest a realistic cloud hosting cost in USD based on database, queues, and container stack),
  "environments": {
    "production": "https://placeholder-url-for-prod",
    "staging": "https://placeholder-url-for-staging",
    "development": "https://placeholder-url-for-dev"
  },
  "repository": "https://github.com/bni-enterprise/placeholder-repo-name",
  "techStack": [
    {
      "layer": "Frontend" | "Backend" | "Database" | "Queue" | "Cache" | "Cloud" | "Container" | "CI/CD",
      "technology": "technology name",
      "version": "version number or LTS if not specified",
      "supportStatus": "Supported" | "Warning" | "Deprecated" | "End of Life",
      "risk": "Low" | "Medium" | "High" | "Critical"
    }
  ],
  "architectureDiagram": "A clean, valid Mermaid.js flowchart code (e.g. flowchart TD or flowchart LR). It must strictly model the actual architecture flow, system integrations, transaction lifecycle, request routes, or business processes described inside the document. Do NOT generate generic Client -> Backend -> DB diagrams. Instead: 1) Scan the document for specific system components, microservices, databases, file storage, queues, gateways, third-party APIs, or user roles. 2) Scrape the actual data flows, workflow sequences, or request/response loops described in the text. 3) Map these components and flows exactly into the Mermaid flowchart. 4) Use quoted labels for node descriptions (e.g., node1[\"Core Banking API\"]) to prevent syntax errors. 5) If the document describes a network zones architecture, group them using subgraphs. 6) If no architecture components, workflows, or data paths are described in the document, return an empty string (\"\")."
}

Do not include any markdown code block wrappers (like \`\`\`json) in your output, respond with raw JSON only. Ensure the diagram is valid Mermaid code.`;

    const prompt = `Project Name: ${projectName}\n\nDocument Text:\n${documentText}\n\nPlease parse this document and return the structured JSON project profile.`;

    const rawResponse = await AIService.chat({
      config: aiConfig,
      prompt,
      systemPrompt,
      context: documentText
    });

    try {
      let cleaned = rawResponse.trim();
      if (cleaned.startsWith('```json')) {
        cleaned = cleaned.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (cleaned.startsWith('```')) {
        cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }
      const projectData = JSON.parse(cleaned);
      return NextResponse.json(projectData);
    } catch (e) {
      console.error('Failed to parse extraction AI response:', rawResponse);
      return NextResponse.json(
        { error: 'AI returned invalid JSON. Please make sure the spec doc contains readable stack details.' },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('API Extract Route error:', error);
    return NextResponse.json(
      { error: error.message || 'An error occurred during AI extraction.' },
      { status: 500 }
    );
  }
}
export const dynamic = 'force-dynamic';
