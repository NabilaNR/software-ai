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
  public static resolveConfig(config: AIServiceConfig): AIServiceConfig {
    const provider = config?.provider || (process.env.AI_PROVIDER as any) || 'gemini';
    let apiKey = config?.apiKey || '';
    
    if (!apiKey || !apiKey.trim()) {
      if (provider === 'gemini') apiKey = process.env.GEMINI_API_KEY || '';
      else if (provider === 'openai') apiKey = process.env.OPENAI_API_KEY || '';
      else if (provider === 'claude') apiKey = process.env.ANTHROPIC_API_KEY || '';
      else if (provider === 'openrouter') apiKey = process.env.OPENROUTER_API_KEY || '';
    }

    const model = config?.model || process.env.AI_MODEL || '';

    return {
      provider,
      apiKey,
      model
    };
  }

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
    const resolvedConfig = this.resolveConfig(config);
    const fullSystemPrompt = `${systemPrompt}\n\nContext:\n${context || 'No specific document context provided.'}`;

    switch (resolvedConfig.provider) {
      case 'gemini':
        return this.callGemini({ config: resolvedConfig, prompt, systemPrompt: fullSystemPrompt, history });
      case 'openai':
        return this.callOpenAI({ config: resolvedConfig, prompt, systemPrompt: fullSystemPrompt, history });
      case 'claude':
        return this.callClaude({ config: resolvedConfig, prompt, systemPrompt: fullSystemPrompt, history });
      case 'openrouter':
        return this.callOpenRouter({ config: resolvedConfig, prompt, systemPrompt: fullSystemPrompt, history });
      default:
        throw new Error(`Unsupported provider: ${resolvedConfig.provider}`);
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
Your task is to audit the provided project tech stack and architecture. You must act as a professional systems analyst.

ANALYSIS COMPLIANCE & ACCURACY RULES:
1. Document Compliance: All your evaluations, findings, and scores must be based ONLY on the facts written directly inside the attached project document context. Do NOT assume, infer, or add outside information beyond what is stated in the context.
2. AI Audit Consistency: 
   - If the application you are auditing is mentioned in the attached AI Audit report context, your results and recommendations must strictly and ketat follow the findings and facts written in that AI Audit report.
   - If the application is not in the AI Audit report (but exists in other attached project documentation), you are permitted to analyze it freely based on the project documentation details or general industry standards.
3. Missing Information Rule: If a tech stack layer, version, or requirement cannot be found in the attached document context, do NOT speculate or invent any placeholder values. Instead, explicitly flag the missing data or use a blank value (""). In any descriptive text where information is completely missing, write: "Informasi tidak ditemukan dalam dokumen yang dilampirkan."

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
        temperature: 0.0
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
        temperature: 0.0
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
        temperature: 0.0
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
        temperature: 0.0
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
