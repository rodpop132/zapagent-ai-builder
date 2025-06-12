import axios from 'axios';
import { normalizarNumero } from '@/utils/phoneUtils';

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
  private static readonly TIMEOUT = 30000; // 30 segundos

  private static async makeRequest<T>(url: string, options: any = {}): Promise<T> {
    console.log(`🔗 ZapAgentService: Fazendo requisição para: ${url}`);

    try {
      const response = await axios({
        url,
        timeout: this.TIMEOUT,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'User-Agent': 'ZapAgent-Client/1.0',
        },
        ...options,
      });

      console.log(`📊 ZapAgentService: Status da resposta: ${response.status}`);
      return response.data;
    } catch (error) {
      console.error(`❌ ZapAgentService: Erro na requisição:`, error);
      
      if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNABORTED') {
          throw new Error('Timeout: Servidor demorou muito para responder.');
        }
        
        if (error.response) {
          const status = error.response.status;
          const data = error.response.data;
          
          // Tentar extrair mensagem de erro mais específica
          let errorMessage = `Erro do servidor (${status})`;
          
          if (data?.error) {
            errorMessage = data.error;
          } else if (data?.msg) {
            errorMessage = data.msg;
          } else if (data?.message) {
            errorMessage = data.message;
          } else if (status === 400) {
            errorMessage = 'Dados inválidos. Verifique se todos os campos obrigatórios estão preenchidos.';
          } else if (status === 401) {
            errorMessage = 'Acesso não autorizado. Verifique suas credenciais.';
          } else if (status === 403) {
            errorMessage = 'Acesso negado.';
          } else if (status === 404) {
            errorMessage = 'Endpoint não encontrado.';
          } else if (status >= 500) {
            errorMessage = 'Erro interno do servidor. Tente novamente em alguns momentos.';
          }
          
          const customError = new Error(errorMessage);
          (customError as any).response = error.response;
          throw customError;
        }
        
        if (error.request) {
          throw new Error('Erro de conectividade. Verifique sua conexão com a internet.');
        }
      }
      
      throw error;
    }
  }

  static async checkApiStatus(): Promise<boolean> {
    console.log('🔍 ZapAgentService: Verificando status da API...');
    
    try {
      const response = await axios.get(`${this.BASE_URL}/`, {
        timeout: 10000,
        headers: {
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'User-Agent': 'ZapAgent-Client/1.0',
        }
      });
      
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

  // Criar agente com melhor tratamento de erro
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
      // SEMPRE normalizar o número antes de enviar
      const numeroNormalizado = normalizarNumero(agentData.numero);
      
      if (!numeroNormalizado || numeroNormalizado.length < 10) {
        throw new Error('Número de telefone inválido. Deve ter pelo menos 10 dígitos.');
      }

      // Validar campos obrigatórios antes de enviar
      if (!agentData.nome?.trim()) {
        throw new Error('Nome do agente é obrigatório.');
      }

      if (!agentData.prompt?.trim()) {
        throw new Error('Prompt/personalidade do agente é obrigatório.');
      }
      
      const isOnline = await this.checkApiStatus();
      if (!isOnline) {
        throw new Error('API não está disponível no momento. Tente novamente em alguns segundos.');
      }
      
      // Payload com dados limpos e validados
      const payload = {
        nome: agentData.nome.trim(),
        tipo: agentData.tipo,
        descricao: agentData.descricao?.trim() || '',
        prompt: agentData.prompt.trim(),
        numero: numeroNormalizado,
        plano: agentData.plano || 'free',
        webhook: agentData.webhook || null
      };
      
      console.log('📦 ZapAgentService: Payload limpo:', payload);
      
      const response = await this.makeRequest<CreateAgentResponse>(`${this.BASE_URL}/zapagent`, {
        method: 'POST',
        data: payload,
      });
      
      // Validar resposta do backend
      if (!response) {
        throw new Error('Resposta vazia do servidor');
      }
      
      if (response.status !== 'success' && response.error) {
        throw new Error(`Erro do backend: ${response.error}`);
      }
      
      console.log('✅ ZapAgentService: Agente criado com sucesso:', response);
      return response;
    } catch (error) {
      console.error('❌ ZapAgentService: Erro ao criar agente:', error);
      // Re-throw para que o hook possa capturar e mostrar o erro
      throw error;
    }
  }

  // Obter QR code com melhor tratamento de erro
  static async getQrCode(phoneNumber: string): Promise<QrCodeResponse> {
    if (!phoneNumber) {
      throw new Error('Número do telefone é obrigatório');
    }
    
    try {
      // SEMPRE normalizar o número
      const numeroNormalizado = normalizarNumero(phoneNumber);
      console.log('📱 ZapAgentService: Buscando QR code para número normalizado:', numeroNormalizado);
      
      if (!numeroNormalizado || numeroNormalizado.length < 10) {
        throw new Error('Número de telefone inválido');
      }
      
      const response = await this.makeRequest<QrCodeResponse>(`${this.BASE_URL}/qrcode`, {
        method: 'GET',
        params: { numero: numeroNormalizado }
      });
      
      console.log('📊 ZapAgentService: Resposta QR code:', response);
      
      // Fallback para respostas inconsistentes
      if (!response) {
        return { conectado: false, message: "QR Code não disponível no momento." };
      }
      
      return response;
    } catch (error) {
      console.error('❌ ZapAgentService: Erro ao obter QR code:', error);
      // Retornar estado seguro em vez de quebrar a aplicação
      return { 
        conectado: false, 
        message: error instanceof Error ? error.message : "Erro ao obter QR Code." 
      };
    }
  }

  // Verificar conexão com fallback seguro
  static async verifyConnection(phoneNumber: string): Promise<VerifyConnectionResponse> {
    if (!phoneNumber) {
      throw new Error('Número do telefone é obrigatório');
    }
    
    try {
      // SEMPRE normalizar o número
      const numeroNormalizado = normalizarNumero(phoneNumber);
      console.log('🔍 ZapAgentService: Verificando conexão para número normalizado:', numeroNormalizado);
      
      if (!numeroNormalizado || numeroNormalizado.length < 10) {
        throw new Error('Número de telefone inválido');
      }
      
      const response = await this.makeRequest<VerifyConnectionResponse>(`${this.BASE_URL}/verificar`, {
        method: 'GET',
        params: { numero: numeroNormalizado }
      });
      
      console.log('📊 ZapAgentService: Status de conexão:', response);
      return response;
    } catch (error) {
      console.error('❌ ZapAgentService: Erro ao verificar conexão:', error);
      // Retornar estado desconectado em vez de quebrar
      return { 
        conectado: false, 
        message: error instanceof Error ? error.message : "Erro ao verificar conexão." 
      };
    }
  }

  // 4. Consultar mensagens usadas (GET /mensagens-usadas)
  static async getMessagesUsage(phoneNumber: string): Promise<MessagesUsageResponse> {
    if (!phoneNumber) {
      throw new Error('Número do telefone é obrigatório');
    }
    
    // SEMPRE normalizar o número
    const numeroNormalizado = normalizarNumero(phoneNumber);
    console.log('📊 ZapAgentService: Consultando uso de mensagens para número normalizado:', numeroNormalizado);
    
    try {
      const response = await this.makeRequest<MessagesUsageResponse>(`${this.BASE_URL}/mensagens-usadas`, {
        method: 'GET',
        params: { numero: numeroNormalizado }
      });
      
      console.log('📊 ZapAgentService: Uso de mensagens:', response);
      return response;
    } catch (error) {
      console.error('❌ ZapAgentService: Erro ao consultar mensagens:', error);
      throw error;
    }
  }

  // 5. Obter histórico (GET /historico)
  static async getHistory(phoneNumber: string): Promise<HistoryResponse> {
    if (!phoneNumber) {
      throw new Error('Número do telefone é obrigatório');
    }
    
    // SEMPRE normalizar o número
    const numeroNormalizado = normalizarNumero(phoneNumber);
    console.log('📜 ZapAgentService: Obtendo histórico para número normalizado:', numeroNormalizado);
    
    try {
      const response = await this.makeRequest<HistoryResponse>(`${this.BASE_URL}/historico`, {
        method: 'GET',
        params: { numero: numeroNormalizado }
      });
      
      console.log('📜 ZapAgentService: Histórico obtido:', response);
      return response;
    } catch (error) {
      console.error('❌ ZapAgentService: Erro ao obter histórico:', error);
      throw error;
    }
  }

  // Métodos existentes mantidos para compatibilidade
  static async getAgentStatus(phoneNumber: string): Promise<AgentStatusResponse> {
    if (!phoneNumber) {
      throw new Error('Número do telefone é obrigatório');
    }
    
    // SEMPRE normalizar o número
    const numeroNormalizado = normalizarNumero(phoneNumber);
    console.log('🔍 ZapAgentService: Verificando status para número normalizado:', numeroNormalizado);
    
    try {
      const connectionData = await this.verifyConnection(numeroNormalizado);
      
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
    if (!phoneNumber) {
      throw new Error('Número do telefone é obrigatório');
    }
    
    // SEMPRE normalizar o número
    const numeroNormalizado = normalizarNumero(phoneNumber);
    console.log('📤 ZapAgentService: Enviando mensagem para número normalizado:', numeroNormalizado);
    
    try {
      const response = await this.makeRequest(`${this.BASE_URL}/message`, {
        method: 'POST',
        data: {
          numero: numeroNormalizado,
          mensagem: message,
          prompt: prompt
        },
      });
      
      console.log('✅ ZapAgentService: Mensagem enviada com sucesso');
      return response;
    } catch (error) {
      console.error('❌ ZapAgentService: Erro ao enviar mensagem:', error);
      throw error;
    }
  }
}
