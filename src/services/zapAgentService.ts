
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
      console.log('📊 SERVICE: Buscando status do agente:', numero);
      
      // Limpar número (remover + e espaços)
      const cleanNumber = numero.replace(/[\s+]/g, '');
      console.log('📞 SERVICE: Número limpo para status:', cleanNumber);
      console.log('🔗 SERVICE: URL status:', `${API_BASE_URL}/status/${cleanNumber}`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        console.error('⏰ SERVICE: Timeout no status (15s)');
        controller.abort();
      }, 15000);
      
      const startTime = performance.now();
      const response = await fetch(`${API_BASE_URL}/status/${cleanNumber}`, {
        signal: controller.signal,
        mode: 'cors'
      });
      
      clearTimeout(timeoutId);
      const endTime = performance.now();
      
      console.log(`⏱️ SERVICE: Tempo de resposta status: ${(endTime - startTime).toFixed(2)}ms`);
      console.log('📊 SERVICE: Status code:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ SERVICE: Erro na resposta do status:', response.status, errorText);
        throw new Error(`Erro na API status: ${response.status} - ${errorText}`);
      }

      const data: StatusResponse = await response.json();
      console.log('✅ SERVICE: Status recebido:', data);
      return data;
    } catch (error) {
      console.error('❌ SERVICE: Erro ao buscar status do agente:', error);
      if (error.name === 'AbortError') {
        throw new Error('Timeout: Status demorou muito para responder');
      }
      throw error;
    }
  }

  static async getAgentHistory(numero: string): Promise<ChatMessage[]> {
    try {
      console.log('📜 SERVICE: Buscando histórico do agente:', numero);
      const statusData = await this.getAgentStatus(numero);
      console.log('✅ SERVICE: Histórico obtido:', statusData.historico?.length || 0, 'mensagens');
      return statusData.historico || [];
    } catch (error) {
      console.error('❌ SERVICE: Erro ao buscar histórico:', error);
      return [];
    }
  }

  static async getQrCode(numero: string): Promise<QrCodeResponse> {
    try {
      console.log('🔄 SERVICE: Buscando QR code para:', numero);
      
      const cleanNumber = numero.replace(/[\s+]/g, '');
      console.log('📞 SERVICE: Número limpo para QR:', cleanNumber);
      console.log('🔗 SERVICE: URL QR:', `${BOT_BASE_URL}/qrcode?numero=${encodeURIComponent(cleanNumber)}`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        console.error('⏰ SERVICE: Timeout no QR code (20s)');
        controller.abort();
      }, 20000);
      
      const startTime = performance.now();
      const response = await fetch(`${BOT_BASE_URL}/qrcode?numero=${encodeURIComponent(cleanNumber)}`, {
        signal: controller.signal,
        mode: 'cors',
        headers: {
          'Accept': 'text/html,application/json',
          'Cache-Control': 'no-cache',
        }
      });
      
      clearTimeout(timeoutId);
      const endTime = performance.now();
      
      console.log(`⏱️ SERVICE: Tempo de resposta QR: ${(endTime - startTime).toFixed(2)}ms`);
      console.log('📊 SERVICE: Status QR:', response.status);
      console.log('📊 SERVICE: Headers QR:', Object.fromEntries(response.headers.entries()));
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ SERVICE: Erro na resposta do QR:', response.status, errorText);
        
        if (response.status === 404 && errorText.includes('QR não encontrado')) {
          console.log('⚠️ SERVICE: QR code ainda não gerado');
          return {
            conectado: false,
            mensagem: 'QR code ainda não foi gerado. Aguarde alguns segundos.'
          };
        }
        
        throw new Error(`Erro na API QR: ${response.status} - ${errorText}`);
      }

      const contentType = response.headers.get('content-type');
      console.log('📄 SERVICE: Content-Type:', contentType);
      
      if (contentType?.includes('application/json')) {
        // Resposta JSON (provavelmente já conectado)
        const data = await response.json();
        console.log('✅ SERVICE: QR response (JSON):', data);
        return data;
      } else {
        // Resposta HTML com QR code
        const htmlContent = await response.text();
        console.log('📄 SERVICE: HTML QR recebido (primeiros 200 chars):', htmlContent.substring(0, 200));
        
        // Verificar se já está conectado
        if (htmlContent.includes('Número já conectado') || htmlContent.includes('já está conectado')) {
          console.log('✅ SERVICE: Agente já conectado (HTML)');
          return {
            conectado: true,
            mensagem: 'Agente já está conectado'
          };
        }
        
        if (htmlContent.includes('QR não encontrado')) {
          console.log('⚠️ SERVICE: QR não encontrado (HTML)');
          return {
            conectado: false,
            mensagem: 'QR code ainda não foi gerado'
          };
        }
        
        // Extrair QR code do HTML
        const imgMatch = htmlContent.match(/src\s*=\s*["'](data:image\/[^;]+;base64,[^"']+)["']/i);
        if (imgMatch && imgMatch[1]) {
          console.log('✅ SERVICE: QR code extraído com sucesso, tamanho:', imgMatch[1].length);
          return {
            qr_code: imgMatch[1],
            conectado: false
          };
        }
        
        console.error('❌ SERVICE: QR code não encontrado no HTML');
        throw new Error('QR code não encontrado no HTML');
      }
    } catch (error) {
      console.error('❌ SERVICE: Erro ao buscar QR code:', error);
      if (error.name === 'AbortError') {
        throw new Error('Timeout: QR code demorou muito para carregar');
      }
      throw error;
    }
  }

  static async sendSimpleMessage(message: string, prompt: string): Promise<string> {
    try {
      console.log('📤 SERVICE: Enviando mensagem simples à API');
      console.log('🔗 SERVICE: URL simples:', `${API_BASE_URL}/responder`);
      
      const payload = {
        msg: message,
        prompt: prompt
      };
      console.log('📦 SERVICE: Payload simples:', JSON.stringify(payload, null, 2));
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        console.error('⏰ SERVICE: Timeout na mensagem simples (30s)');
        controller.abort();
      }, 30000);
      
      const startTime = performance.now();
      const response = await fetch(`${API_BASE_URL}/responder`, {
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
      
      console.log(`⏱️ SERVICE: Tempo de resposta simples: ${(endTime - startTime).toFixed(2)}ms`);
      console.log('📊 SERVICE: Status simples:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ SERVICE: Erro na resposta simples:', response.status, errorText);
        throw new Error(`Erro na API simples: ${response.status} - ${errorText}`);
      }

      const data: ApiResponse = await response.json();
      console.log('✅ SERVICE: Resposta simples:', data.resposta);
      return data.resposta;
    } catch (error) {
      console.error('❌ SERVICE: Erro ao enviar mensagem simples:', error);
      if (error.name === 'AbortError') {
        throw new Error('Timeout: Mensagem simples demorou muito');
      }
      throw error;
    }
  }
}
