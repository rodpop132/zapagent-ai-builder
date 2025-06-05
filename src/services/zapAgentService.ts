
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
  private static readonly TIMEOUT = 15000; // 15 segundos

  private static async makeRequest<T>(url: string, options: RequestInit = {}): Promise<T> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.TIMEOUT);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error('Timeout: Requisição demorou muito para responder');
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
      
      // Para QR code, precisamos buscar HTML e extrair a imagem
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.TIMEOUT);

      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'Accept': 'text/html',
          'Cache-Control': 'no-cache',
        }
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ ZapAgentService: Erro na resposta do QR:', response.status, errorText);
        throw new Error(`Erro ${response.status}: ${errorText}`);
      }

      const htmlContent = await response.text();
      console.log('📄 ZapAgentService: HTML QR recebido (primeiros 200 chars):', htmlContent.substring(0, 200));

      // Verificar se retornou mensagem de erro
      if (htmlContent.includes('QR não encontrado') || htmlContent.includes('Agente já conectado')) {
        if (htmlContent.includes('Agente já conectado')) {
          return { conectado: true, message: 'Agente já está conectado' };
        }
        throw new Error('QR code ainda não foi gerado');
      }

      // Extrair a imagem base64 do HTML
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
    
    try {
      const url = `${this.BASE_URL}/zapagent`;
      const response = await this.makeRequest(url, {
        method: 'POST',
        body: JSON.stringify(agentData),
      });
      
      console.log('✅ ZapAgentService: Agente criado com sucesso');
      return response;
    } catch (error) {
      console.error('❌ ZapAgentService: Erro ao criar agente:', error);
      throw error;
    }
  }
}
