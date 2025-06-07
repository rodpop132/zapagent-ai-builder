
export interface QrCodeResponse {
  conectado: boolean;
  qr_code?: string;
  qrcodeUrl?: string;
  message?: string;
}

export interface CreateAgentResponse {
  status: string;
  msg?: string;
  error?: string;
  qrcodeUrl?: string;
  numero?: string;
}

export interface VerifyConnectionResponse {
  conectado: boolean;
  status?: string;
  message?: string;
}

export interface MessagesUsageResponse {
  mensagensUsadas: number;
  plano: string;
  agentesAtivos: number;
  limite?: number;
}

export interface HistoryResponse {
  conversas: Array<{
    user?: string;
    bot?: string;
    timestamp?: string;
  }>;
  memoria_ultima_mensagem?: string;
}

export interface AgentStatusResponse {
  status: 'conectado' | 'desconectado' | 'pendente';
  conectado: boolean;
  message?: string;
  mensagens_enviadas?: number;
  historico?: Array<{
    message: string;
    response: string;
    timestamp: string;
  }>;
  ultima_mensagem?: {
    user?: string;
    bot?: string;
    timestamp?: string;
  };
}

export class ZapAgentService {
  private static readonly BASE_URL = 'https://zapagent-bot.onrender.com';
  private static readonly API_URL = 'https://zapagent-api.onrender.com';
  private static readonly TIMEOUT = 30000; // 30 segundos
  private static readonly QUICK_TIMEOUT = 10000; // 10 segundos para verificação rápida

  private static async makeRequest<T>(url: string, options: RequestInit = {}): Promise<T> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.TIMEOUT);

    try {
      console.log(`🔗 ZapAgentService: Fazendo requisição para: ${url}`);

      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'User-Agent': 'ZapAgent-Client/1.0',
          ...options.headers,
        },
        mode: 'cors',
      });

      clearTimeout(timeoutId);

      console.log(`📊 ZapAgentService: Status da resposta: ${response.status}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ ZapAgentService: Erro HTTP ${response.status}:`, errorText);
        
        if (response.status >= 500) {
          throw new Error('Erro interno do servidor. Tente novamente em alguns momentos.');
        }
        if (response.status === 404) {
          throw new Error('Endpoint não encontrado.');
        }
        if (response.status === 403) {
          throw new Error('Acesso negado.');
        }
        
        throw new Error(`Erro do servidor: ${response.status}`);
      }

      const responseText = await response.text();
      console.log(`📥 ZapAgentService: Resposta recebida`);

      try {
        return JSON.parse(responseText);
      } catch (parseError) {
        console.error(`❌ ZapAgentService: Erro ao fazer parse do JSON:`, parseError);
        throw new Error('Resposta inválida do servidor');
      }
    } catch (error) {
      clearTimeout(timeoutId);
      console.error(`🚨 ZapAgentService: Erro na requisição:`, error);
      
      if (error.name === 'AbortError') {
        throw new Error('Timeout: Servidor demorou muito para responder.');
      }
      
      if (error.message?.includes('fetch') || error.message?.includes('NetworkError') || error.message?.includes('Failed to fetch')) {
        throw new Error('Erro de conectividade. Verifique sua internet.');
      }
      
      throw error;
    }
  }

  static async checkApiStatus(): Promise<boolean> {
    console.log('🔍 ZapAgentService: Verificando status da API...');
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.QUICK_TIMEOUT);

      const response = await fetch(`${this.BASE_URL}/`, {
        method: 'GET',
        mode: 'cors',
        signal: controller.signal,
        headers: {
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'User-Agent': 'ZapAgent-Client/1.0',
        }
      });
      
      clearTimeout(timeoutId);
      
      // Considerar como online se responder com status 200, 404 ou 405
      if (response.status === 200 || response.status === 404 || response.status === 405) {
        console.log('✅ ZapAgentService: API está online e funcional');
        return true;
      }
      
      console.log(`⚠️ ZapAgentService: Servidor respondeu mas com status inesperado: ${response.status}`);
      return false;
      
    } catch (error) {
      console.error('❌ ZapAgentService: Erro ao verificar status:', error);
      return false;
    }
  }

  // 1. Criar agente (POST /zapagent)
  static async createAgent(agentData: {
    nome: string;
    tipo: string;
    descricao: string;
    prompt: string;
    numero: string;
    plano: string;
    webhook?: string;
  }): Promise<CreateAgentResponse> {
    console.log('🚀 ZapAgentService: Criando agente:', agentData.nome);
    
    try {
      const isOnline = await this.checkApiStatus();
      if (!isOnline) {
        throw new Error('API não está disponível no momento. Tente novamente em alguns segundos.');
      }
      
      const url = `${this.BASE_URL}/zapagent`;
      const response = await this.makeRequest<CreateAgentResponse>(url, {
        method: 'POST',
        body: JSON.stringify(agentData),
      });
      
      console.log('✅ ZapAgentService: Agente criado com sucesso:', response);
      return response;
    } catch (error) {
      console.error('❌ ZapAgentService: Erro ao criar agente:', error);
      throw error;
    }
  }

  // 2. Verificar conexão do número (GET /verificar)
  static async verifyConnection(phoneNumber: string): Promise<VerifyConnectionResponse> {
    console.log('🔍 ZapAgentService: Verificando conexão para:', phoneNumber);
    
    if (!phoneNumber) {
      throw new Error('Número do telefone é obrigatório');
    }
    
    try {
      const encodedNumber = encodeURIComponent(phoneNumber);
      const url = `${this.BASE_URL}/verificar?numero=${encodedNumber}`;
      
      const response = await this.makeRequest<VerifyConnectionResponse>(url);
      console.log('📊 ZapAgentService: Status de conexão:', response);
      
      return response;
    } catch (error) {
      console.error('❌ ZapAgentService: Erro ao verificar conexão:', error);
      throw error;
    }
  }

  // 3. Consultar mensagens usadas (GET /mensagens-usadas)
  static async getMessagesUsage(phoneNumber: string): Promise<MessagesUsageResponse> {
    console.log('📊 ZapAgentService: Consultando uso de mensagens para:', phoneNumber);
    
    if (!phoneNumber) {
      throw new Error('Número do telefone é obrigatório');
    }
    
    try {
      const encodedNumber = encodeURIComponent(phoneNumber);
      const url = `${this.BASE_URL}/mensagens-usadas?numero=${encodedNumber}`;
      
      const response = await this.makeRequest<MessagesUsageResponse>(url);
      console.log('📊 ZapAgentService: Uso de mensagens:', response);
      
      return response;
    } catch (error) {
      console.error('❌ ZapAgentService: Erro ao consultar mensagens:', error);
      throw error;
    }
  }

  // 4. Obter histórico de IA (GET /historico)
  static async getHistory(phoneNumber: string): Promise<HistoryResponse> {
    console.log('📜 ZapAgentService: Obtendo histórico para:', phoneNumber);
    
    if (!phoneNumber) {
      throw new Error('Número do telefone é obrigatório');
    }
    
    try {
      const encodedNumber = encodeURIComponent(phoneNumber);
      const url = `${this.BASE_URL}/historico?numero=${encodedNumber}`;
      
      const response = await this.makeRequest<HistoryResponse>(url);
      console.log('📜 ZapAgentService: Histórico obtido:', response);
      
      return response;
    } catch (error) {
      console.error('❌ ZapAgentService: Erro ao obter histórico:', error);
      throw error;
    }
  }

  // 5. Status via API Flask (GET /status/<numero>)
  static async getAgentStatusFromFlask(phoneNumber: string): Promise<HistoryResponse> {
    console.log('🔍 ZapAgentService: Obtendo status Flask para:', phoneNumber);
    
    if (!phoneNumber) {
      throw new Error('Número do telefone é obrigatório');
    }
    
    try {
      const encodedNumber = encodeURIComponent(phoneNumber);
      const url = `${this.API_URL}/status/${encodedNumber}`;
      
      const response = await this.makeRequest<HistoryResponse>(url);
      console.log('📊 ZapAgentService: Status Flask:', response);
      
      return response;
    } catch (error) {
      console.error('❌ ZapAgentService: Erro ao obter status Flask:', error);
      throw error;
    }
  }

  // Métodos existentes mantidos para compatibilidade
  static async getAgentStatus(phoneNumber: string): Promise<AgentStatusResponse> {
    console.log('🔍 ZapAgentService: Verificando status para:', phoneNumber);
    
    try {
      const connectionData = await this.verifyConnection(phoneNumber);
      
      return {
        status: connectionData.conectado ? 'conectado' : 'pendente',
        conectado: connectionData.conectado,
        message: connectionData.message || (connectionData.conectado ? 'Agente conectado' : 'Aguardando conexão')
      };
    } catch (error) {
      console.error('❌ ZapAgentService: Erro ao verificar status:', error);
      return {
        status: 'desconectado',
        conectado: false,
        message: 'Não foi possível verificar o status do agente'
      };
    }
  }

  static async sendMessage(phoneNumber: string, message: string, prompt: string): Promise<any> {
    console.log('📤 ZapAgentService: Enviando mensagem para:', phoneNumber);
    
    try {
      const url = `${this.BASE_URL}/message`;
      const response = await this.makeRequest(url, {
        method: 'POST',
        body: JSON.stringify({
          numero: phoneNumber,
          mensagem: message,
          prompt: prompt
        }),
      });
      
      console.log('✅ ZapAgentService: Mensagem enviada com sucesso');
      return response;
    } catch (error) {
      console.error('❌ ZapAgentService: Erro ao enviar mensagem:', error);
      throw error;
    }
  }

  static async getQrCode(phoneNumber: string): Promise<QrCodeResponse> {
    console.log('📱 ZapAgentService: Buscando QR code para:', phoneNumber);
    
    try {
      const encodedNumber = encodeURIComponent(phoneNumber);
      const url = `${this.BASE_URL}/qrcode?numero=${encodedNumber}`;
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.TIMEOUT);

      console.log(`🔗 ZapAgentService: URL do QR code: ${url}`);

      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'Accept': 'text/html,application/json',
          'Cache-Control': 'no-cache',
          'User-Agent': 'ZapAgent-Client/1.0',
        },
        mode: 'cors'
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ ZapAgentService: Erro na resposta do QR:', response.status, errorText);
        
        if (response.status >= 500) {
          throw new Error('Servidor temporariamente indisponível');
        }
        if (response.status === 404) {
          throw new Error('QR code ainda não foi gerado');
        }
        
        throw new Error(`Erro ${response.status}: QR code indisponível`);
      }

      const contentType = response.headers.get('content-type');
      console.log('📄 ZapAgentService: Content-Type:', contentType);

      if (contentType?.includes('application/json')) {
        const jsonResponse = await response.json();
        console.log('📄 ZapAgentService: Resposta JSON do QR:', jsonResponse);
        return jsonResponse;
      }

      const htmlContent = await response.text();
      console.log('📄 ZapAgentService: HTML QR recebido (primeiros 200 chars):', htmlContent.substring(0, 200));

      if (htmlContent.includes('QR não encontrado') || htmlContent.includes('Agente já conectado')) {
        if (htmlContent.includes('Agente já conectado')) {
          return { conectado: true, message: 'Agente já está conectado' };
        }
        throw new Error('QR code ainda não foi gerado');
      }

      const imgMatch = htmlContent.match(/src\s*=\s*["'](data:image\/[^;]+;base64,[^"']+)["']/i);
      
      if (imgMatch && imgMatch[1]) {
        console.log('✅ ZapAgentService: QR code extraído com sucesso');
        return {
          conectado: false,
          qr_code: imgMatch[1]
        };
      } else {
        console.error('❌ ZapAgentService: QR code não encontrado no HTML');
        throw new Error('QR code não encontrado na resposta');
      }
    } catch (error) {
      console.error('❌ ZapAgentService: Erro ao buscar QR code:', error);
      if (error.name === 'AbortError') {
        throw new Error('Timeout: QR code demorou muito para carregar');
      }
      throw error;
    }
  }
}
