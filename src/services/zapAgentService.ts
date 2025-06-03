
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

export class ZapAgentService {
  static async checkApiStatus(): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/`);
      const text = await response.text();
      return text.includes('ZapAgent IA está online');
    } catch (error) {
      console.error('❌ Erro ao verificar status da API:', error);
      return false;
    }
  }

  static async sendMessage(numero: string, message: string, prompt: string): Promise<string> {
    try {
      console.log(`🤖 Enviando mensagem para ${numero}:`, message);
      
      // Limpar número (remover + e espaços)
      const cleanNumber = numero.replace(/[\s+]/g, '');
      
      const response = await fetch(`${API_BASE_URL}/responder/${cleanNumber}`, {
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
      console.log('✅ Resposta da IA:', data.resposta);
      
      return data.resposta;
    } catch (error) {
      console.error('❌ Erro ao enviar mensagem:', error);
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
      console.error('❌ Erro ao buscar status do agente:', error);
      throw error;
    }
  }

  static async getAgentHistory(numero: string): Promise<ChatMessage[]> {
    try {
      const statusData = await this.getAgentStatus(numero);
      return statusData.historico || [];
    } catch (error) {
      console.error('❌ Erro ao buscar histórico:', error);
      return [];
    }
  }

  static async getQrCode(numero: string): Promise<QrCodeResponse> {
    try {
      console.log('🔄 Buscando QR code para:', numero);
      
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
      console.error('❌ Erro ao buscar QR code:', error);
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
      console.error('❌ Erro ao enviar mensagem simples:', error);
      throw error;
    }
  }
}
