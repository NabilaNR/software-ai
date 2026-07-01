import { NextRequest, NextResponse } from 'next/server';
import { AIService, AIServiceConfig } from '@/services/aiService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { project, config, documentsText } = body;

    if (!project) {
      return NextResponse.json({ error: 'Project details are required' }, { status: 400 });
    }

    if (!config || !config.apiKey || !config.apiKey.trim()) {
      return NextResponse.json(
        { error: 'API Key is required for live AI Audits. Please add your key in the Settings page.' },
        { status: 400 }
      );
    }

    const aiConfig: AIServiceConfig = {
      provider: config.provider,
      apiKey: config.apiKey,
      model: config.model
    };

    const projectInfoString = `
Project Name: ${project.name}
Owner: ${project.owner}
Description: ${project.description}
Estimated Monthly Cloud Cost: $${project.estimatedMonthlyCost}
Tech Stack Details:
${project.techStack.map((item: any) => `- ${item.layer}: ${item.technology} (Version: ${item.version}, Support: ${item.supportStatus}, Risk: ${item.risk})`).join('\n')}
`;

    const auditResponse = await AIService.auditProject({
      config: aiConfig,
      projectInfo: projectInfoString,
      documentsText
    });

    return NextResponse.json(auditResponse);
  } catch (error: any) {
    console.error('API Audit Route error:', error);
    return NextResponse.json(
      { error: error.message || 'An error occurred during the AI audit.' },
      { status: 500 }
    );
  }
}
export const dynamic = 'force-dynamic';
