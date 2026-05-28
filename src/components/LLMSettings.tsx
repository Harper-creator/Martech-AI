import React, { useState } from 'react';
import { LLMProvider, LLM_PROVIDERS } from '../types/llm';
import { Save, Plus, Trash2, Key } from 'lucide-react';

interface SavedLLMConfig {
  id: string;
  name: string;
  provider: LLMProvider;
  apiKey: string;
  apiUrl?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  isDefault: boolean;
}

interface LLMSettingsProps {
  onConfigChange?: (config: SavedLLMConfig) => void;
}

export const LLMSettings: React.FC<LLMSettingsProps> = ({ onConfigChange }) => {
  const [configs, setConfigs] = useState<SavedLLMConfig[]>(() => {
    const saved = localStorage.getItem('llm_configs');
    return saved ? JSON.parse(saved) : [];
  });

  const [selectedProvider, setSelectedProvider] = useState<LLMProvider>('deepseek');
  const [configName, setConfigName] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [apiUrl, setApiUrl] = useState(LLM_PROVIDERS[selectedProvider].apiUrl);
  const [model, setModel] = useState(LLM_PROVIDERS[selectedProvider].defaultModel);
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(2000);
  const [showApiKey, setShowApiKey] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleProviderChange = (provider: LLMProvider) => {
    setSelectedProvider(provider);
    setApiUrl(LLM_PROVIDERS[provider].apiUrl);
    setModel(LLM_PROVIDERS[provider].defaultModel);
  };

  const handleSaveConfig = () => {
    if (!configName.trim() || !apiKey.trim()) {
      alert('请填写配置名称和 API Key');
      return;
    }

    const newConfig: SavedLLMConfig = {
      id: editingId || Date.now().toString(),
      name: configName,
      provider: selectedProvider,
      apiKey,
      apiUrl: apiUrl || undefined,
      model: model || undefined,
      temperature,
      maxTokens,
      isDefault: configs.length === 0 && !editingId,
    };

    let updatedConfigs;
    if (editingId) {
      updatedConfigs = configs.map(c => c.id === editingId ? newConfig : c);
    } else {
      updatedConfigs = [...configs, newConfig];
    }

    setConfigs(updatedConfigs);
    localStorage.setItem('llm_configs', JSON.stringify(updatedConfigs));

    // 重置表单
    resetForm();
    onConfigChange?.(newConfig);
  };

  const handleDeleteConfig = (id: string) => {
    if (confirm('确定要删除此配置吗？')) {
      const updatedConfigs = configs.filter(c => c.id !== id);
      setConfigs(updatedConfigs);
      localStorage.setItem('llm_configs', JSON.stringify(updatedConfigs));
    }
  };

  const handleSetDefault = (id: string) => {
    const updatedConfigs = configs.map(c => ({
      ...c,
      isDefault: c.id === id
    }));
    setConfigs(updatedConfigs);
    localStorage.setItem('llm_configs', JSON.stringify(updatedConfigs));

    const defaultConfig = updatedConfigs.find(c => c.id === id);
    if (defaultConfig) {
      onConfigChange?.(defaultConfig);
    }
  };

  const handleEditConfig = (config: SavedLLMConfig) => {
    setEditingId(config.id);
    setConfigName(config.name);
    setSelectedProvider(config.provider);
    setApiKey(config.apiKey);
    setApiUrl(config.apiUrl || LLM_PROVIDERS[config.provider].apiUrl);
    setModel(config.model || LLM_PROVIDERS[config.provider].defaultModel);
    setTemperature(config.temperature || 0.7);
    setMaxTokens(config.maxTokens || 2000);
  };

  const resetForm = () => {
    setEditingId(null);
    setConfigName('');
    setApiKey('');
    setSelectedProvider('deepseek');
    setApiUrl(LLM_PROVIDERS.deepseek.apiUrl);
    setModel(LLM_PROVIDERS.deepseek.defaultModel);
    setTemperature(0.7);
    setMaxTokens(2000);
  };

  const defaultConfig = configs.find(c => c.isDefault);

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg">
        {/* Header */}
        <div className="border-b px-6 py-4">
          <h2 className="text-2xl font-bold text-gray-800">🔧 LLM 配置管理</h2>
          <p className="text-gray-600 mt-1">配置和切换不同的大语言模型提供商</p>
        </div>

        <div className="p-6">
          {/* 配置表单 */}
          <div className="bg-gray-50 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              {editingId ? '✏️ 编辑配置' : '➕ 添加新配置'}
            </h3>

            {/* 配置名称 */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                配置名称 *
              </label>
              <input
                type="text"
                value={configName}
                onChange={(e) => setConfigName(e.target.value)}
                placeholder="例如：我的 DeepSeek 配置"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* LLM 提供商选择 */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                LLM 提供商 *
              </label>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
                {(Object.entries(LLM_PROVIDERS) as [LLMProvider, any][]).map(([key, provider]) => (
                  <button
                    key={key}
                    onClick={() => handleProviderChange(key)}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      selectedProvider === key
                        ? 'border-blue-500 bg-blue-50 text-blue-700 font-medium'
                        : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                    }`}
                  >
                    {provider.name}
                  </button>
                ))}
              </div>
            </div>

            {/* API Key */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                API Key *
              </label>
              <div className="relative">
                <input
                  type={showApiKey ? 'text' : 'password'}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="输入你的 API Key"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                />
                <button
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600 hover:text-gray-900"
                >
                  <Key size={18} />
                </button>
              </div>
              <p className="text-xs text-gray-600 mt-1">
                🔒 API Key 将被安全地保存在本地浏览器存储中
              </p>
            </div>

            {/* API URL */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                API URL
              </label>
              <input
                type="url"
                value={apiUrl}
                onChange={(e) => setApiUrl(e.target.value)}
                placeholder="https://api.example.com/v1"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* 模型选择 */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                模型
              </label>
              <input
                type="text"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="输入模型名称"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* 温度和 Max Tokens */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  温度 (Temperature): {temperature.toFixed(2)}
                </label>
                <input
                  type="range"
                  min="0"
                  max="2"
                  step="0.1"
                  value={temperature}
                  onChange={(e) => setTemperature(parseFloat(e.target.value))}
                  className="w-full"
                />
                <p className="text-xs text-gray-600 mt-1">
                  0 = 确定性, 2 = 创意性
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  最大 Token: {maxTokens}
                </label>
                <input
                  type="range"
                  min="100"
                  max="4000"
                  step="100"
                  value={maxTokens}
                  onChange={(e) => setMaxTokens(parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>

            {/* 按钮 */}
            <div className="flex gap-2">
              <button
                onClick={handleSaveConfig}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
              >
                <Save size={18} />
                {editingId ? '更新配置' : '保存配置'}
              </button>
              {editingId && (
                <button
                  onClick={resetForm}
                  className="bg-gray-400 hover:bg-gray-500 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  取消
                </button>
              )}
            </div>
          </div>

          {/* 已保存的配置列表 */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              已保存的配置 ({configs.length})
            </h3>

            {configs.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <Plus size={32} className="mx-auto text-gray-400 mb-2" />
                <p className="text-gray-600">还没有配置，请上方添加一个配置</p>
              </div>
            ) : (
              <div className="space-y-3">
                {configs.map((config) => (
                  <div
                    key={config.id}
                    className={`p-4 border-2 rounded-lg transition-all ${
                      config.isDefault
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-gray-800">{config.name}</h4>
                          {config.isDefault && (
                            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                              默认
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          <span className="font-medium">提供商:</span> {LLM_PROVIDERS[config.provider].name}
                        </p>
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">模型:</span> {config.model}
                        </p>
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">API URL:</span> {config.apiUrl}
                        </p>
                      </div>

                      <div className="flex gap-2">
                        {!config.isDefault && (
                          <button
                            onClick={() => handleSetDefault(config.id)}
                            className="bg-green-500 hover:bg-green-600 text-white py-2 px-3 rounded text-sm transition-colors"
                          >
                            设为默认
                          </button>
                        )}
                        <button
                          onClick={() => handleEditConfig(config)}
                          className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-3 rounded text-sm transition-colors"
                        >
                          编辑
                        </button>
                        <button
                          onClick={() => handleDeleteConfig(config.id)}
                          className="bg-red-500 hover:bg-red-600 text-white py-2 px-3 rounded text-sm transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 当前默认配置信息 */}
          {defaultConfig && (
            <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">📌 当前使用配置</h4>
              <p className="text-blue-800">
                <span className="font-medium">配置名称:</span> {defaultConfig.name}
              </p>
              <p className="text-blue-800">
                <span className="font-medium">提供商:</span> {LLM_PROVIDERS[defaultConfig.provider].name}
              </p>
              <p className="text-blue-800">
                <span className="font-medium">模型:</span> {defaultConfig.model}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LLMSettings;
