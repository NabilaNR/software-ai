import { NextRequest, NextResponse } from 'next/server';
import { AIService, AIServiceConfig } from '@/services/aiService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { project, config, documentsText } = body;

    if (!project) {
      return NextResponse.json({ error: 'Project details are required' }, { status: 400 });
    }

    const configFromEnv: AIServiceConfig = {
      provider: config?.provider,
      apiKey: config?.apiKey,
      model: config?.model
    };

    const resolvedConfig = AIService.resolveConfig(configFromEnv);

    if (!resolvedConfig.apiKey || !resolvedConfig.apiKey.trim()) {
      return NextResponse.json(
        { error: 'API Key is required for live AI Audits. Please add your key in the Settings page or on the server.' },
        { status: 400 }
      );
    }

    const projectInfoString = `
Project Name: ${project.name}
Owner: ${project.owner}
Description: ${project.description}
Tech Stack Details:
${project.techStack.map((item: any) => `- ${item.layer}: ${item.technology} (Version: ${item.version}, Support: ${item.supportStatus}, Risk: ${item.risk})`).join('\n')}
`;

    const auditResponse = await AIService.auditProject({
      config: resolvedConfig,
      projectInfo: projectInfoString,
      documentsText
    });

    const cleanedString = JSON.stringify(auditResponse).replace(/\*/g, '');
    return NextResponse.json(JSON.parse(cleanedString));
  } catch (error: any) {
    console.error('API Audit Route error:', error);
    return NextResponse.json(
      { error: error.message || 'An error occurred during the AI audit.' },
      { status: 500 }
    );
  }
}
export const dynamic = 'force-dynamic';
