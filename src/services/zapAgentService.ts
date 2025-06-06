
export interface QrCodeResponse {
  conectado: boolean;
  qr_code?: string;
  message?: string;
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
  private static readonly TIMEOUT = 30000; // 30 segundos

  private static async makeRequest<T>(url: string, options: RequestInit = {}): Promise<T> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.TIMEOUT);

    try {
      console.log(`🔗 ZapAgentService: Fazendo requisição para: ${url}`);
      console.log(`📦 ZapAgentService: Opções da requisição:`, options);

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
      console.log(`📊 ZapAgentService: Headers da resposta:`, Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ ZapAgentService: Erro HTTP ${response.status}:`, errorText);
        throw new Error(`Erro HTTP ${response.status}: ${errorText || response.statusText}`);
      }

      const responseText = await response.text();
      console.log(`📥 ZapAgentService: Resposta recebida (primeiros 200 chars):`, responseText.substring(0, 200));

      try {
        return JSON.parse(responseText);
      } catch (parseError) {
        console.error(`❌ ZapAgentService: Erro ao fazer parse do JSON:`, parseError);
        throw new Error(`Resposta inválida do servidor: ${responseText.substring(0, 100)}`);
      }
    } catch (error) {
      clearTimeout(timeoutId);
      console.error(`🚨 ZapAgentService: Erro na requisição:`, error);
      
      if (error.name === 'AbortError') {
        throw new Error('Timeout: A requisição demorou muito para responder. Tente novamente.');
      }
      
      if (error.message?.includes('fetch') || error.message?.includes('NetworkError') || error.message?.includes('Failed to fetch')) {
        throw new Error('Erro de conectividade. Verifique sua internet e tente novamente.');
      }
      
      throw error;
    }
  }

  static async checkApiStatus(): Promise<boolean> {
    console.log('🔍 ZapAgentService: Verificando status da API...');
    
    try {
      const url = `${this.BASE_URL}/health`;
      await this.makeRequest(url);
      console.log('✅ ZapAgentService: API está online');
      return true;
    } catch (error) {
      console.error('❌ ZapAgentService: API está offline:', error);
      return false;
    }
  }

  static async getAgentStatus(phoneNumber: string): Promise<AgentStatusResponse> {
    console.log('🔍 ZapAgentService: Verificando status para:', phoneNumber);
    
    try {
      const encodedNumber = encodeURIComponent(phoneNumber);
      const url = `${this.BASE_URL}/status?numero=${encodedNumber}`;
      
      const response = await this.makeRequest<AgentStatusResponse>(url);
      console.log('📊 ZapAgentService: Status recebido:', response);
      
      return response;
    } catch (error) {
      console.error('❌ ZapAgentService: Erro ao verificar status:', error);
      throw error;
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
        throw new Error(`Erro ${response.status}: ${errorText}`);
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

  static async createAgent(agentData: {
    nome: string;
    tipo: string;
    descricao: string;
    prompt: string;
    numero: string;
    plano: string;
  }): Promise<any> {
    console.log('🚀 ZapAgentService: Criando agente:', agentData.nome);
    console.log('📋 ZapAgentService: Dados do agente:', JSON.stringify(agentData, null, 2));
    
    try {
      // Verificar se a API está online primeiro
      console.log('🔍 ZapAgentService: Verificando se API está online...');
      const isOnline = await this.checkApiStatus();
      if (!isOnline) {
        throw new Error('Serviço temporariamente indisponível. Tente novamente em alguns minutos.');
      }

      const url = `${this.BASE_URL}/zapagent`;
      const response = await this.makeRequest(url, {
        method: 'POST',
        body: JSON.stringify(agentData),
      });
      
      console.log('✅ ZapAgentService: Agente criado com sucesso:', response);
      return response;
    } catch (error) {
      console.error('❌ ZapAgentService: Erro ao criar agente:', error);
      
      // Melhorar as mensagens de erro
      if (error.message?.includes('Erro de conectividade')) {
        throw new Error('Não foi possível conectar ao servidor. Verifique sua conexão com a internet e tente novamente.');
      }
      
      if (error.message?.includes('403')) {
        throw new Error('Número já está sendo usado. Use um número diferente.');
      }
      
      if (error.message?.includes('429')) {
        throw new Error('Muitas tentativas. Aguarde alguns minutos antes de tentar novamente.');
      }
      
      if (error.message?.includes('500') || error.message?.includes('502') || error.message?.includes('503')) {
        throw new Error('Servidor temporariamente indisponível. Tente novamente em alguns minutos.');
      }
      
      throw error;
    }
  }
}
