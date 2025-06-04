const API_BASE_URL = 'https://zapagent-api.onrender.com';
const BOT_BASE_URL = 'https://zapagent-bot.onrender.com';

export interface ChatMessage {
  message: string;
  response: string;
  timestamp: string;
}

export interface ApiResponse {
  resposta: string;
  status?: string;
}

export interface StatusResponse {
  status: string;
  historico: ChatMessage[];
  mensagens_enviadas?: number;
  ultima_mensagem?: {
    user?: string;
    bot?: string;
    timestamp?: string;
  };
}

export interface QrCodeResponse {
  qr_code?: string;
  mensagem?: string;
  conectado?: boolean;
}

export interface CreateAgentResponse {
  success: boolean;
  message: string;
  data?: any;
}

export class ZapAgentService {
  static async checkApiStatus(): Promise<boolean> {
    try {
      console.log('🔍 SERVICE: Verificando status da API ZapAgent...');
      console.log('🔗 SERVICE: URL da API:', `${API_BASE_URL}/`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        console.error('⏰ SERVICE: Timeout na verificação de status (10s)');
        controller.abort();
      }, 10000);
      
      const startTime = performance.now();
      const response = await fetch(`${API_BASE_URL}/`, {
        signal: controller.signal,
        mode: 'cors'
      });
      
      clearTimeout(timeoutId);
      const endTime = performance.now();
      
      console.log(`⏱️ SERVICE: Tempo de resposta status: ${(endTime - startTime).toFixed(2)}ms`);
      console.log('📊 SERVICE: Status code:', response.status);
      
      const text = await response.text();
      console.log('📥 SERVICE: Resposta do status (primeiros 100 chars):', text.substring(0, 100));
      
      const isOnline = text.includes('ZapAgent IA está online');
      console.log(`📊 SERVICE: Status da API: ${isOnline ? 'Online' : 'Offline'}`);
      return isOnline;
    } catch (error) {
      console.error('❌ SERVICE: Erro ao verificar status da API:', error);
      if (error.name === 'AbortError') {
        console.error('❌ SERVICE: Timeout na verificação de status');
      }
      return false;
    }
  }

  static async sendMessage(numero: string, message: string, prompt: string): Promise<string> {
    try {
      console.log(`🤖 SERVICE: Enviando mensagem para ${numero}:`, message);
      
      const cleanNumber = numero.replace(/[\s+]/g, '');
      console.log('📞 SERVICE: Número limpo:', cleanNumber);
      console.log('🔗 SERVICE: URL:', `${API_BASE_URL}/responder/${cleanNumber}`);
      
      const payload = {
        msg: message,
        prompt: prompt
      };
      console.log('📦 SERVICE: Payload:', JSON.stringify(payload, null, 2));
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        console.error('⏰ SERVICE: Timeout no envio de mensagem (30s)');
        controller.abort();
      }, 30000);
      
      const startTime = performance.now();
      const response = await fetch(`${API_BASE_URL}/responder/${cleanNumber}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
        mode: 'cors'
      });

      clearTimeout(timeoutId);
      const endTime = performance.now();
      
      console.log(`⏱️ SERVICE: Tempo de resposta mensagem: ${(endTime - startTime).toFixed(2)}ms`);
      console.log('📊 SERVICE: Status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ SERVICE: Erro na resposta da API:', response.status, errorText);
        throw new Error(`Erro na API: ${response.status} - ${errorText}`);
      }

      const data: ApiResponse = await response.json();
      console.log('✅ SERVICE: Resposta da IA:', data.resposta);
      
      return data.resposta;
    } catch (error) {
      console.error('❌ SERVICE: Erro ao enviar mensagem:', error);
      if (error.name === 'AbortError') {
        throw new Error('Timeout: Mensagem demorou muito para ser enviada');
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
  }): Promise<CreateAgentResponse> {
    try {
      console.log('🚀 SERVICE: Criando agente na API ZapAgent...');
      console.log('📋 SERVICE: Dados do agente:', JSON.stringify(agentData, null, 2));
      console.log('🔗 SERVICE: URL:', `${BOT_BASE_URL}/zapagent`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        console.error('⏰ SERVICE: Timeout na criação do agente (60s)');
        controller.abort();
      }, 60000);
      
      const startTime = performance.now();
      console.log('📡 SERVICE: Enviando requisição...');
      
      const response = await fetch(`${BOT_BASE_URL}/zapagent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(agentData),
        signal: controller.signal,
        mode: 'cors'
      });

      clearTimeout(timeoutId);
      const endTime = performance.now();

      console.log(`⏱️ SERVICE: Tempo de resposta criação: ${(endTime - startTime).toFixed(2)}ms`);
      console.log('📊 SERVICE: Status da resposta:', response.status);
      console.log('📊 SERVICE: Headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ SERVICE: Erro na criação do agente:', response.status, errorText);
        
        if (response.status === 403) {
          throw new Error('Número já está sendo usado em outra conta. Use um número diferente.');
        } else if (response.status === 429) {
          throw new Error('Muitas tentativas. Aguarde alguns minutos antes de tentar novamente.');
        } else if (response.status >= 500) {
          throw new Error('Servidor temporariamente indisponível. Tente novamente em alguns minutos.');
        }
        
        throw new Error(`Erro ${response.status}: ${errorText || response.statusText}`);
      }

      const responseText = await response.text();
      console.log('📥 SERVICE: Resposta bruta (primeiros 200 chars):', responseText.substring(0, 200));
      
      let result;
      try {
        result = JSON.parse(responseText);
        console.log('✅ SERVICE: JSON parseado com sucesso:', result);
      } catch (parseError) {
        console.error('❌ SERVICE: Erro ao parsear JSON:', parseError);
        throw new Error(`Resposta inválida do servidor: ${responseText.substring(0, 100)}`);
      }
      
      return {
        success: true,
        message: 'Agente criado com sucesso',
        data: result
      };
    } catch (error) {
      console.error('❌ SERVICE: Erro completo na criação do agente:', error);
      
      if (error.name === 'AbortError') {
        throw new Error('Timeout: A criação do agente demorou muito. Tente novamente.');
      }
      
      if (error.message && error.message.toLowerCase().includes('fetch')) {
        console.error('🌐 SERVICE: Erro de rede detectado');
        throw new Error('Erro de conectividade. Verifique sua internet e tente novamente.');
      }
      
      throw error;
    }
  }

  static async getAgentStatus(numero: string): Promise<StatusResponse> {
    try {
      // Limpar número (remover + e espaços)
      const cleanNumber = numero.replace(/[\s+]/g, '');
      
      const response = await fetch(`${API_BASE_URL}/status/${cleanNumber}`);
      
      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status}`);
      }

      const data: StatusResponse = await response.json();
      return data;
    } catch (error) {
      console.error('❌ ERRO AO BUSCAR STATUS DO AGENTE:', error);
      throw error;
    }
  }

  static async getAgentHistory(numero: string): Promise<ChatMessage[]> {
    try {
      const statusData = await this.getAgentStatus(numero);
      return statusData.historico || [];
    } catch (error) {
      console.error('❌ ERRO AO BUSCAR HISTÓRICO:', error);
      return [];
    }
  }

  static async getQrCode(numero: string): Promise<QrCodeResponse> {
    try {
      console.log('🔄 BUSCANDO QR CODE PARA:', numero);
      
      const cleanNumber = numero.replace(/[\s+]/g, '');
      const response = await fetch(`${BOT_BASE_URL}/qrcode?numero=${encodeURIComponent(cleanNumber)}`);
      
      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status}`);
      }

      const contentType = response.headers.get('content-type');
      
      if (contentType?.includes('application/json')) {
        // Resposta JSON (provavelmente já conectado)
        const data = await response.json();
        return data;
      } else {
        // Resposta HTML com QR code
        const htmlContent = await response.text();
        
        // Verificar se já está conectado
        if (htmlContent.includes('Número já conectado') || htmlContent.includes('QR não encontrado')) {
          return {
            conectado: true,
            mensagem: 'Agente já está conectado'
          };
        }
        
        // Extrair QR code do HTML
        const imgMatch = htmlContent.match(/src\s*=\s*["'](data:image\/[^;]+;base64,[^"']+)["']/i);
        if (imgMatch && imgMatch[1]) {
          return {
            qr_code: imgMatch[1],
            conectado: false
          };
        }
        
        throw new Error('QR code não encontrado no HTML');
      }
    } catch (error) {
      console.error('❌ ERRO AO BUSCAR QR CODE:', error);
      throw error;
    }
  }

  static async sendSimpleMessage(message: string, prompt: string): Promise<string> {
    try {
      const response = await fetch(`${API_BASE_URL}/responder`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          msg: message,
          prompt: prompt
        })
      });

      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status}`);
      }

      const data: ApiResponse = await response.json();
      return data.resposta;
    } catch (error) {
      console.error('❌ ERRO AO ENVIAR MENSAGEM SIMPLES:', error);
      throw error;
    }
  }
}
