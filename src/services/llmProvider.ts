import { LLMConfig, LLMResponse, LLMProvider, GenerateRequest } from '../types/llm';

/**
 * DeepSeek LLM 提供商
 */
export class DeepSeekProvider {
  private apiKey: string;
  private apiUrl: string;
  private model: string;

  constructor(apiKey: string, model: string = 'deepseek-chat', apiUrl: string = 'https://api.deepseek.com/v1') {
    this.apiKey = apiKey;
    this.model = model;
    this.apiUrl = apiUrl;
  }

  async generate(request: GenerateRequest): Promise<LLMResponse> {
    try {
      const response = await fetch(`${this.apiUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            ...(request.systemInstruction ? [{
              role: 'system',
              content: request.systemInstruction
            }] : []),
            {
              role: 'user',
              content: request.prompt
            }
          ],
          temperature: request.temperature ?? 0.7,
          max_tokens: request.maxTokens ?? 2000,
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`DeepSeek API Error: ${error.message || response.statusText}`);
      }

      const data = await response.json();
      return {
        text: data.choices[0].message.content,
        provider: 'deepseek' as LLMProvider,
        model: this.model,
        usage: {
          promptTokens: data.usage?.prompt_tokens,
          completionTokens: data.usage?.completion_tokens,
          totalTokens: data.usage?.total_tokens,
        }
      };
    } catch (error: any) {
      throw new Error(`DeepSeek Generation Error: ${error.message}`);
    }
  }
}

/**
 * OpenAI LLM 提供商
 */
export class OpenAIProvider {
  private apiKey: string;
  private apiUrl: string;
  private model: string;

  constructor(apiKey: string, model: string = 'gpt-4-turbo', apiUrl: string = 'https://api.openai.com/v1') {
    this.apiKey = apiKey;
    this.model = model;
    this.apiUrl = apiUrl;
  }

  async generate(request: GenerateRequest): Promise<LLMResponse> {
    try {
      const response = await fetch(`${this.apiUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            ...(request.systemInstruction ? [{
              role: 'system',
              content: request.systemInstruction
            }] : []),
            {
              role: 'user',
              content: request.prompt
            }
          ],
          temperature: request.temperature ?? 0.7,
          max_tokens: request.maxTokens ?? 2000,
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`OpenAI API Error: ${error.error?.message || response.statusText}`);
      }

      const data = await response.json();
      return {
        text: data.choices[0].message.content,
        provider: 'openai' as LLMProvider,
        model: this.model,
        usage: {
          promptTokens: data.usage?.prompt_tokens,
          completionTokens: data.usage?.completion_tokens,
          totalTokens: data.usage?.total_tokens,
        }
      };
    } catch (error: any) {
      throw new Error(`OpenAI Generation Error: ${error.message}`);
    }
  }
}

/**
 * Claude (Anthropic) LLM 提供商
 */
export class ClaudeProvider {
  private apiKey: string;
  private apiUrl: string;
  private model: string;

  constructor(apiKey: string, model: string = 'claude-3-sonnet-20240229', apiUrl: string = 'https://api.anthropic.com/v1') {
    this.apiKey = apiKey;
    this.model = model;
    this.apiUrl = apiUrl;
  }

  async generate(request: GenerateRequest): Promise<LLMResponse> {
    try {
      const response = await fetch(`${this.apiUrl}/messages`, {
        method: 'POST',
        headers: {
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.model,
          max_tokens: request.maxTokens ?? 2000,
          system: request.systemInstruction,
          messages: [{
            role: 'user',
            content: request.prompt
          }],
          temperature: request.temperature ?? 0.7,
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Claude API Error: ${error.error?.message || response.statusText}`);
      }

      const data = await response.json();
      return {
        text: data.content[0].text,
        provider: 'claude' as LLMProvider,
        model: this.model,
        usage: {
          promptTokens: data.usage?.input_tokens,
          completionTokens: data.usage?.output_tokens,
          totalTokens: (data.usage?.input_tokens || 0) + (data.usage?.output_tokens || 0),
        }
      };
    } catch (error: any) {
      throw new Error(`Claude Generation Error: ${error.message}`);
    }
  }
}

/**
 * LLM 工厂类 - 根据配置创建对应的提供商
 */
export class LLMFactory {
  static createProvider(config: LLMConfig) {
    switch (config.provider) {
      case 'deepseek':
        return new DeepSeekProvider(config.apiKey, config.model, config.apiUrl);
      case 'openai':
        return new OpenAIProvider(config.apiKey, config.model, config.apiUrl);
      case 'claude':
        return new ClaudeProvider(config.apiKey, config.model, config.apiUrl);
      default:
        throw new Error(`Unsupported LLM provider: ${config.provider}`);
    }
  }
}
