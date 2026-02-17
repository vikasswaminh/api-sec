const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://llm-fw-edge.vikas4988.workers.dev';

class ApiService {
  private apiKey: string;

  constructor() {
    this.apiKey = localStorage.getItem('api_key') || '';
  }

  setApiKey(key: string) {
    this.apiKey = key;
    localStorage.setItem('api_key', key);
  }

  getApiKey(): string {
    return this.apiKey;
  }

  hasApiKey(): boolean {
    return this.apiKey.length > 0;
  }

  private async fetch(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE_URL}${endpoint}`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(this.apiKey ? { 'X-API-Key': this.apiKey } : {}),
      ...options.headers as Record<string, string>,
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(error.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  // Health check
  async health() {
    return this.fetch('/health');
  }

  // Stats
  async getStats() {
    return this.fetch('/v1/stats');
  }

  // Events
  async getEvents(limit: number = 50) {
    return this.fetch(`/v1/events?limit=${limit}`);
  }

  // API Keys
  async getApiKeys() {
    return this.fetch('/v1/admin/keys');
  }

  async createApiKey(data: { name: string; tier: string }) {
    return this.fetch('/v1/admin/keys', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async revokeApiKey(keyId: string) {
    return this.fetch(`/v1/admin/keys/${keyId}/revoke`, {
      method: 'POST',
    });
  }

  // Inspect prompt
  async inspectPrompt(prompt: string) {
    return this.fetch('/v1/inspect', {
      method: 'POST',
      body: JSON.stringify({ prompt }),
    });
  }

  // Analytics
  async getAnalytics(timeRange: string = '24h') {
    return this.fetch(`/v1/analytics?range=${timeRange}`);
  }
}

export const api = new ApiService();
export default api;
