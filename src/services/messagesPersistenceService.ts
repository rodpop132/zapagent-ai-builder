
import { supabase } from '@/integrations/supabase/client';

export interface ConversationMessage {
  id: string;
  user_id: string;
  agent_id?: string;
  phone_number: string;
  agent_name: string;
  user_message: string;
  bot_response: string;
  created_at: string;
  updated_at: string;
}

export interface AgentStatistics {
  id: string;
  user_id: string;
  phone_number: string;
  agent_name: string;
  total_messages: number;
  last_message_at?: string;
  created_at: string;
  updated_at: string;
}

export const MessagesPersistenceService = {
  // Salvar uma nova conversa
  async saveConversation(
    userId: string,
    agentId: string | undefined,
    phoneNumber: string,
    agentName: string,
    userMessage: string,
    botResponse: string
  ): Promise<ConversationMessage | null> {
    try {
      console.log('💾 Salvando conversa no banco de dados:', {
        userId,
        agentId,
        phoneNumber,
        agentName,
        userMessage: userMessage.substring(0, 50) + '...',
        botResponse: botResponse.substring(0, 50) + '...'
      });

      const { data, error } = await supabase
        .from('agent_conversations')
        .insert({
          user_id: userId,
          agent_id: agentId,
          phone_number: phoneNumber.replace(/\D/g, ''),
          agent_name: agentName,
          user_message: userMessage,
          bot_response: botResponse
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Erro ao salvar conversa:', error);
        return null;
      }

      // Atualizar estatísticas
      await this.updateAgentStatistics(userId, phoneNumber, agentName);

      console.log('✅ Conversa salva com sucesso:', data.id);
      return data;
    } catch (error) {
      console.error('❌ Erro ao salvar conversa:', error);
      return null;
    }
  },

  // Atualizar estatísticas do agente
  async updateAgentStatistics(
    userId: string,
    phoneNumber: string,
    agentName: string
  ): Promise<void> {
    try {
      const cleanPhoneNumber = phoneNumber.replace(/\D/g, '');
      
      // Verificar se já existe estatística para este agente
      const { data: existingStats } = await supabase
        .from('agent_statistics')
        .select('*')
        .eq('user_id', userId)
        .eq('phone_number', cleanPhoneNumber)
        .single();

      if (existingStats) {
        // Atualizar estatística existente
        await supabase
          .from('agent_statistics')
          .update({
            total_messages: existingStats.total_messages + 1,
            last_message_at: new Date().toISOString(),
            agent_name: agentName // Atualizar nome caso tenha mudado
          })
          .eq('user_id', userId)
          .eq('phone_number', cleanPhoneNumber);
      } else {
        // Criar nova estatística
        await supabase
          .from('agent_statistics')
          .insert({
            user_id: userId,
            phone_number: cleanPhoneNumber,
            agent_name: agentName,
            total_messages: 1,
            last_message_at: new Date().toISOString()
          });
      }
    } catch (error) {
      console.error('❌ Erro ao atualizar estatísticas:', error);
    }
  },

  // Buscar conversas de um agente
  async getAgentConversations(
    userId: string,
    phoneNumber: string,
    limit: number = 50
  ): Promise<ConversationMessage[]> {
    try {
      console.log('📋 Buscando conversas do banco de dados:', { userId, phoneNumber, limit });

      const { data, error } = await supabase
        .from('agent_conversations')
        .select('*')
        .eq('user_id', userId)
        .eq('phone_number', phoneNumber.replace(/\D/g, ''))
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('❌ Erro ao buscar conversas:', error);
        return [];
      }

      console.log('✅ Conversas carregadas:', data?.length || 0);
      return data || [];
    } catch (error) {
      console.error('❌ Erro ao buscar conversas:', error);
      return [];
    }
  },

  // Buscar estatísticas de um agente
  async getAgentStatistics(
    userId: string,
    phoneNumber: string
  ): Promise<AgentStatistics | null> {
    try {
      const { data, error } = await supabase
        .from('agent_statistics')
        .select('*')
        .eq('user_id', userId)
        .eq('phone_number', phoneNumber.replace(/\D/g, ''))
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('❌ Erro ao buscar estatísticas:', error);
        return null;
      }

      return data || null;
    } catch (error) {
      console.error('❌ Erro ao buscar estatísticas:', error);
      return null;
    }
  },

  // Buscar estatísticas globais de todos os agentes do usuário
  async getUserGlobalStatistics(userId: string): Promise<{
    totalMessages: number;
    totalAgents: number;
    lastMessageAt?: string;
  }> {
    try {
      const { data, error } = await supabase
        .from('agent_statistics')
        .select('total_messages, last_message_at')
        .eq('user_id', userId);

      if (error) {
        console.error('❌ Erro ao buscar estatísticas globais:', error);
        return { totalMessages: 0, totalAgents: 0 };
      }

      const totalMessages = data?.reduce((sum, stat) => sum + stat.total_messages, 0) || 0;
      const totalAgents = data?.length || 0;
      const lastMessageAt = data?.reduce((latest, stat) => {
        if (!stat.last_message_at) return latest;
        if (!latest) return stat.last_message_at;
        return new Date(stat.last_message_at) > new Date(latest) ? stat.last_message_at : latest;
      }, null as string | null);

      return {
        totalMessages,
        totalAgents,
        lastMessageAt: lastMessageAt || undefined
      };
    } catch (error) {
      console.error('❌ Erro ao buscar estatísticas globais:', error);
      return { totalMessages: 0, totalAgents: 0 };
    }
  },

  // Limpar conversas de um agente (usado quando agente é excluído)
  async clearAgentConversations(
    userId: string,
    phoneNumber: string
  ): Promise<boolean> {
    try {
      console.log('🗑️ Limpando conversas do agente:', { userId, phoneNumber });

      // Note: NÃO vamos deletar as conversas, apenas marcar como inativas
      // Para manter o histórico mesmo após excluir o agente
      const { error } = await supabase
        .from('agent_conversations')
        .update({ agent_id: null }) // Remove referência ao agente excluído
        .eq('user_id', userId)
        .eq('phone_number', phoneNumber.replace(/\D/g, ''));

      if (error) {
        console.error('❌ Erro ao limpar conversas:', error);
        return false;
      }

      // Também manter estatísticas para histórico
      console.log('✅ Conversas mantidas no histórico');
      return true;
    } catch (error) {
      console.error('❌ Erro ao limpar conversas:', error);
      return false;
    }
  }
};
