import { NextRequest, NextResponse } from 'next/server';
import { AIService, AIServiceConfig } from '@/services/aiService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, config } = body;

    if (!name) {
      return NextResponse.json({ error: 'Project name is required' }, { status: 400 });
    }
    if (!config || !config.apiKey || !config.apiKey.trim()) {
      return NextResponse.json(
        { error: 'API Key is required to generate recommendations. Please configure it in Settings.' },
        { status: 400 }
      );
    }

    const aiConfig: AIServiceConfig = {
      provider: config.provider,
      apiKey: config.apiKey,
      model: config.model
    };

    const systemPrompt = `You are a Senior Enterprise Architect and IT Strategy Consultant for Bank Negara Indonesia (BNI).
Your task is to recommend a modern, robust, secure, and compliant technology stack for a BNI banking system based on its name and description.
You must choose from standard BNI banking technologies:
- Frontend: React, Next.js, Flutter, Swift, Kotlin, Angular
- Backend: Java (Spring Boot), Go (Golang), C# (.NET Core), Node.js (NestJS)
- Database: PostgreSQL, Oracle Database, MySQL, MongoDB
- Message Broker: Apache Kafka, RabbitMQ
- Caching: Redis
- DevOps/Container: Docker, Kubernetes, Red Hat OpenShift, CI/CD Jenkins/GitLab

You must respond strictly with a valid JSON object matching the following structure:
{
  "recommendations": [
    {
      "layer": "Frontend" | "Backend" | "Database" | "Queue" | "Cache" | "Container" | "CI/CD",
      "technology": "Technology Name (e.g. Spring Boot, PostgreSQL)",
      "version": "Suggested stable version (e.g. 3.2.0, 15.0)",
      "supportStatus": "Supported",
      "risk": "Low",
      "reason": "Brief explanation of why this technology fits BNI security and this system's requirements"
    }
  ]
}

Do not include any markdown code block wrappers (like \`\`\`json) in your output, respond with raw JSON only. Ensure the recommendations follow strict high-availability banking standards.`;

    const prompt = `System Name: ${name}\nSystem Description: ${description || 'No description provided.'}\n\nPlease recommend a suitable technology stack for this system.`;

    const rawResponse = await AIService.chat({
      config: aiConfig,
      prompt,
      systemPrompt
    });

    try {
      let cleaned = rawResponse.trim();
      if (cleaned.startsWith('```json')) {
        cleaned = cleaned.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (cleaned.startsWith('```')) {
        cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }
      const parsedData = JSON.parse(cleaned);
      return NextResponse.json(parsedData);
    } catch (e) {
      console.error('Failed to parse recommendation AI response:', rawResponse);
      return NextResponse.json(
        { error: 'AI returned invalid JSON. Please try again.' },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('API Recommend Stack error:', error);
    return NextResponse.json(
      { error: error.message || 'An error occurred while generating recommendations.' },
      { status: 500 }
    );
  }
}
export const dynamic = 'force-dynamic';
