// LLM Configuration Types

export type LLMProvider = 'deepseek' | 'openai' | 'claude' | 'gemini' | 'custom';

export interface LLMConfig {
  provider: LLMProvider;
  apiKey: string;
  apiUrl?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface LLMProviderConfig {
  name: string;
  provider: LLMProvider;
  defaultModel: string;
  apiUrl: string;
  requiresApiKey: boolean;
  documentationUrl: string;
}

export interface LLMResponse {
  text: string;
  provider: LLMProvider;
  model: string;
  usage?: {
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
  };
}

export interface GenerateRequest {
  prompt: string;
  llmConfig: LLMConfig;
  systemInstruction?: string;
  temperature?: number;
  maxTokens?: number;
}

// Built-in LLM Provider Configurations
export const LLM_PROVIDERS: Record<LLMProvider, LLMProviderConfig> = {
  deepseek: {
    name: 'DeepSeek',
    provider: 'deepseek',
    defaultModel: 'deepseek-chat',
    apiUrl: 'https://api.deepseek.com/v1',
    requiresApiKey: true,
    documentationUrl: 'https://platform.deepseek.com/docs'
  },
  openai: {
    name: 'OpenAI',
    provider: 'openai',
    defaultModel: 'gpt-4-turbo',
    apiUrl: 'https://api.openai.com/v1',
    requiresApiKey: true,
    documentationUrl: 'https://platform.openai.com/docs'
  },
  claude: {
    name: 'Claude (Anthropic)',
    provider: 'claude',
    defaultModel: 'claude-3-sonnet-20240229',
    apiUrl: 'https://api.anthropic.com/v1',
    requiresApiKey: true,
    documentationUrl: 'https://docs.anthropic.com/'
  },
  gemini: {
    name: 'Google Gemini',
    provider: 'gemini',
    defaultModel: 'gemini-pro',
    apiUrl: 'https://generativelanguage.googleapis.com/v1beta',
    requiresApiKey: true,
    documentationUrl: 'https://ai.google.dev/docs'
  },
  custom: {
    name: 'Custom LLM',
    provider: 'custom',
    defaultModel: 'custom-model',
    apiUrl: '',
    requiresApiKey: true,
    documentationUrl: ''
  }
};
