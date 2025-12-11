/**
 * n8n API Client
 * Wrapper per chiamate API a istanze n8n esterne
 */

export interface N8nWorkflow {
  id: string;
  name: string;
  active: boolean;
  nodes: any[];
  connections: any;
  settings?: any;
  staticData?: any;
  tags?: any[];
  pinData?: any;
  versionId?: string;
}

export interface N8nExecution {
  id: string;
  finished: boolean;
  mode: string;
  retryOf: string | null;
  retrySuccessId: string | null;
  status: 'success' | 'error' | 'running' | 'waiting';
  startedAt: string;
  stoppedAt: string | null;
  workflowId: string;
  data?: any;
}

export class N8nApiClient {
  private baseUrl: string;
  private apiKey: string;

  constructor(baseUrl: string, apiKey: string) {
    // Rimuovi trailing slash
    this.baseUrl = baseUrl.replace(/\/$/, '');
    this.apiKey = apiKey;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}/api/v1${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'X-N8N-API-KEY': this.apiKey,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`n8n API Error: ${response.status} - ${error}`);
    }

    return response.json();
  }

  /**
   * Ottiene tutti i workflow dall'istanza n8n
   */
  async getWorkflows(): Promise<N8nWorkflow[]> {
    return this.request<N8nWorkflow[]>('/workflows');
  }

  /**
   * Ottiene un workflow specifico per ID
   */
  async getWorkflow(id: string): Promise<N8nWorkflow> {
    return this.request<N8nWorkflow>(`/workflows/${id}`);
  }

  /**
   * Crea un nuovo workflow in n8n
   */
  async createWorkflow(workflow: Partial<N8nWorkflow>): Promise<N8nWorkflow> {
    return this.request<N8nWorkflow>('/workflows', {
      method: 'POST',
      body: JSON.stringify(workflow),
    });
  }

  /**
   * Aggiorna un workflow esistente
   */
  async updateWorkflow(
    id: string,
    workflow: Partial<N8nWorkflow>
  ): Promise<N8nWorkflow> {
    return this.request<N8nWorkflow>(`/workflows/${id}`, {
      method: 'PUT',
      body: JSON.stringify(workflow),
    });
  }

  /**
   * Attiva un workflow
   */
  async activateWorkflow(id: string): Promise<void> {
    await this.request(`/workflows/${id}/activate`, {
      method: 'POST',
    });
  }

  /**
   * Disattiva un workflow
   */
  async deactivateWorkflow(id: string): Promise<void> {
    await this.request(`/workflows/${id}/deactivate`, {
      method: 'POST',
    });
  }

  /**
   * Elimina un workflow
   */
  async deleteWorkflow(id: string): Promise<void> {
    await this.request(`/workflows/${id}`, {
      method: 'DELETE',
    });
  }

  /**
   * Ottiene le esecuzioni di un workflow
   */
  async getExecutions(
    workflowId?: string,
    limit: number = 20
  ): Promise<N8nExecution[]> {
    const params = new URLSearchParams();
    if (workflowId) params.append('workflowId', workflowId);
    params.append('limit', limit.toString());

    return this.request<N8nExecution[]>(`/executions?${params.toString()}`);
  }

  /**
   * Ottiene i dettagli di un'esecuzione specifica
   */
  async getExecution(id: string): Promise<N8nExecution> {
    return this.request<N8nExecution>(`/executions/${id}`);
  }

  /**
   * Testa la connessione all'istanza n8n
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.getWorkflows();
      return true;
    } catch (error) {
      return false;
    }
  }
}

