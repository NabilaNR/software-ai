process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
import { GoogleGenerativeAI } from '@google/generative-ai';

export interface AIServiceConfig {
  provider: 'gemini' | 'openai' | 'claude' | 'openrouter';
  apiKey: string;
  model: string;
}

export interface AuditResponse {
  overallScore: number;
  technologyHealth: string;
  security: string;
  scalability: string;
  maintainability: string;
  estimatedMonthlyCost: number;
  outdatedComponentsCount: number;
  topRisks: string[];
  recommendations: {
    layer: string;
    currentTech: string;
    recommendedTech: string;
    benefit: string;
    type: 'cost' | 'performance' | 'database' | 'queue' | 'search';
  }[];
  migrationSteps: {
    title: string;
    description: string;
    effort: string; // e.g. "Low (1-2 weeks)", "Medium (1-2 months)"
  }[];
  potentialSavingPercent: number;
}

export class AIService {
  static async chat({
    config,
    prompt,
    systemPrompt,
    context,
    history = []
  }: {
    config: AIServiceConfig;
    prompt: string;
    systemPrompt: string;
    context?: string;
    history?: { role: 'user' | 'assistant'; content: string }[];
  }): Promise<string> {
    const fullSystemPrompt = `${systemPrompt}\n\nContext:\n${context || 'No specific document context provided.'}`;

    switch (config.provider) {
      case 'gemini':
        return this.callGemini({ config, prompt, systemPrompt: fullSystemPrompt, history });
      case 'openai':
        return this.callOpenAI({ config, prompt, systemPrompt: fullSystemPrompt, history });
      case 'claude':
        return this.callClaude({ config, prompt, systemPrompt: fullSystemPrompt, history });
      case 'openrouter':
        return this.callOpenRouter({ config, prompt, systemPrompt: fullSystemPrompt, history });
      default:
        throw new Error(`Unsupported provider: ${config.provider}`);
    }
  }

  static async auditProject({
    config,
    projectInfo,
    documentsText
  }: {
    config: AIServiceConfig;
    projectInfo: string;
    documentsText?: string;
  }): Promise<AuditResponse> {
    const systemPrompt = `You are a Senior Software Architect, Security Auditor, and IT Governance Consultant. 
Your task is to audit the provided project tech stack and architecture.

CRITICAL AUDIT INSTRUCTIONS:
- The "benefit" field under each recommendation MUST be highly argumentative, technical, and comparative.
- You must explicitly compare the currentTech (old version) with the recommendedTech (new version), stating exactly why the modern version is superior (e.g., specific CVE security vulnerabilities resolved, major database indexing optimization, cloud compute cost savings, or key architectural upgrades like virtual threads in Java 21).
- Avoid generic descriptions like "improved security". Cite technical details, features, or compliance goals.

You must respond strictly with a valid JSON object matching the following structure:
{
  "overallScore": number (0-100),
  "technologyHealth": "Excellent" | "Good" | "Fair" | "Poor" | "Critical",
  "security": "Good" | "Needs Improvement" | "Critical Vulnerabilities",
  "scalability": "Scalable" | "Moderately Scalable" | "Poor Scalability",
  "maintainability": "High" | "Medium" | "Low",
  "estimatedMonthlyCost": number (in USD),
  "outdatedComponentsCount": number,
  "topRisks": ["risk 1 description", "risk 2 description", ...],
  "recommendations": [
    {
      "layer": "Frontend" | "Backend" | "Database" | "Queue" | "Cache" | "Cloud" | "Container" | "CI/CD",
      "currentTech": "tech name and version",
      "recommendedTech": "tech name recommended",
      "benefit": "Highly technical, comparative reason of new version vs old version, citing specific advantages",
      "type": "cost" | "performance" | "database" | "queue" | "search"
    }
  ],
  "migrationSteps": [
    {
      "title": "step title",
      "description": "what needs to be done",
      "effort": "Low" | "Medium" | "High"
    }
  ],
  "potentialSavingPercent": number (0-100)
}

Do not include any markdown formatting wrappers (like \`\`\`json) in your output, respond with raw JSON only. Ensure the analysis is highly technical and specific to the versions provided.`;

    const prompt = `Project Info:\n${projectInfo}\n\nUploaded Documentation / Knowledge Base:\n${documentsText || 'No documents uploaded.'}\n\nPlease audit this project and return the JSON response.`;

    const rawResponse = await this.chat({
      config,
      prompt,
      systemPrompt,
      context: documentsText
    });

    try {
      // Strip any markdown syntax if the LLM ignored instructions
      let cleaned = rawResponse.trim();
      if (cleaned.startsWith('```json')) {
        cleaned = cleaned.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (cleaned.startsWith('```')) {
        cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }
      return JSON.parse(cleaned) as AuditResponse;
    } catch (e) {
      console.error('Failed to parse AI response as JSON:', rawResponse);
      throw new Error('AI returned an invalid JSON structure. Raw response: ' + rawResponse);
    }
  }

  private static async callGemini({
    config,
    prompt,
    systemPrompt,
    history
  }: {
    config: AIServiceConfig;
    prompt: string;
    systemPrompt: string;
    history: { role: 'user' | 'assistant'; content: string }[];
  }): Promise<string> {
    const genAI = new GoogleGenerativeAI(config.apiKey);
    const modelName = config.model || 'gemini-1.5-flash';
    const model = genAI.getGenerativeModel({
      model: modelName,
      systemInstruction: systemPrompt,
      generationConfig: {
        temperature: 0.2
      }
    });

    const chatSession = model.startChat({
      history: history.map(h => ({
        role: h.role === 'user' ? 'user' : 'model',
        parts: [{ text: h.content }]
      }))
    });

    const result = await chatSession.sendMessage(prompt);
    const text = result.response.text();
    if (!text) {
      throw new Error('No response from Gemini API.');
    }
    return text;
  }

  private static async callOpenAI({
    config,
    prompt,
    systemPrompt,
    history
  }: {
    config: AIServiceConfig;
    prompt: string;
    systemPrompt: string;
    history: { role: 'user' | 'assistant'; content: string }[];
  }): Promise<string> {
    const modelName = config.model || 'gpt-4o-mini';
    const messages = [
      { role: 'system', content: systemPrompt },
      ...history.map(h => ({ role: h.role, content: h.content })),
      { role: 'user', content: prompt }
    ];

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`
      },
      body: JSON.stringify({
        model: modelName,
        messages,
        temperature: 0.2
      })
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`OpenAI API error: ${response.statusText} - ${err}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }

  private static async callClaude({
    config,
    prompt,
    systemPrompt,
    history
  }: {
    config: AIServiceConfig;
    prompt: string;
    systemPrompt: string;
    history: { role: 'user' | 'assistant'; content: string }[];
  }): Promise<string> {
    const modelName = config.model || 'claude-3-5-sonnet-latest';
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': config.apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: modelName,
        system: systemPrompt,
        messages: [
          ...history.map(h => ({ role: h.role, content: h.content })),
          { role: 'user', content: prompt }
        ],
        max_tokens: 4096,
        temperature: 0.2
      })
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Claude API error: ${response.statusText} - ${err}`);
    }

    const data = await response.json();
    return data.content[0].text;
  }

  private static async callOpenRouter({
    config,
    prompt,
    systemPrompt,
    history
  }: {
    config: AIServiceConfig;
    prompt: string;
    systemPrompt: string;
    history: { role: 'user' | 'assistant'; content: string }[];
  }): Promise<string> {
    const modelName = config.model || 'meta-llama/llama-3.1-70b-instruct:free';
    const messages = [
      { role: 'system', content: systemPrompt },
      ...history.map(h => ({ role: h.role, content: h.content })),
      { role: 'user', content: prompt }
    ];

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`
      },
      body: JSON.stringify({
        model: modelName,
        messages,
        temperature: 0.2
      })
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`OpenRouter API error: ${response.statusText} - ${err}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }
}
