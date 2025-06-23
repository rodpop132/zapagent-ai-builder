
import React, { useState } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Search, HelpCircle, Mail, Phone, MessageCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';

const FAQPage = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const faqs = [
    {
      category: "Geral",
      questions: [
        {
          question: "O que é o ZapAgent AI?",
          answer: "O ZapAgent AI é uma plataforma de inteligência artificial que permite criar agentes virtuais para WhatsApp, automatizando atendimento ao cliente e vendas de forma inteligente e personalizada."
        },
        {
          question: "Como funciona o ZapAgent AI?",
          answer: "Nosso sistema utiliza IA avançada para criar agentes que podem conversar naturalmente com seus clientes via WhatsApp, responder perguntas, processar pedidos e fornecer suporte 24/7."
        },
        {
          question: "Preciso de conhecimentos técnicos para usar?",
          answer: "Não! O ZapAgent AI foi desenvolvido para ser simples e intuitivo. Você pode criar e configurar seu agente em poucos minutos sem precisar de conhecimentos técnicos."
        }
      ]
    },
    {
      category: "Planos e Preços",
      questions: [
        {
          question: "Quais são os planos disponíveis?",
          answer: "Oferecemos três planos: Básico (R$ 97/mês), Premium (R$ 197/mês) e Enterprise (R$ 497/mês). Cada plano inclui diferentes recursos e limites de mensagens."
        },
        {
          question: "Posso cancelar minha assinatura a qualquer momento?",
          answer: "Sim, você pode cancelar sua assinatura a qualquer momento através do portal do cliente ou entrando em contato conosco. Não há taxas de cancelamento."
        },
        {
          question: "Existe período de teste gratuito?",
          answer: "Sim, oferecemos 7 dias de teste gratuito para que você possa experimentar todas as funcionalidades antes de escolher um plano."
        },
        {
          question: "Como funciona o pagamento?",
          answer: "Os pagamentos são processados mensalmente via cartão de crédito através da plataforma Stripe, garantindo total segurança nas transações."
        }
      ]
    },
    {
      category: "Configuração e Uso",
      questions: [
        {
          question: "Como conectar meu WhatsApp?",
          answer: "Após criar sua conta, você receberá instruções detalhadas para conectar seu WhatsApp Business. O processo é simples e seguro, seguindo todas as diretrizes do WhatsApp."
        },
        {
          question: "Quantos agentes posso criar?",
          answer: "O número de agentes varia por plano: Básico (1 agente), Premium (3 agentes), Enterprise (10 agentes). Cada agente pode ser personalizado para diferentes propósitos."
        },
        {
          question: "Posso personalizar as respostas do meu agente?",
          answer: "Sim! Você pode treinar seu agente com informações específicas do seu negócio, personalizar tons de voz, e definir respostas para situações específicas."
        },
        {
          question: "O agente funciona 24 horas por dia?",
          answer: "Sim, seu agente funciona 24/7, respondendo automaticamente às mensagens dos clientes mesmo fora do horário comercial."
        }
      ]
    },
    {
      category: "Suporte Técnico",
      questions: [
        {
          question: "Como entro em contato com o suporte?",
          answer: "Você pode nos contatar através do email suporte@zapagent.ai, WhatsApp ou através do chat ao vivo disponível na plataforma."
        },
        {
          question: "Qual o tempo de resposta do suporte?",
          answer: "Nosso suporte responde em até 24 horas nos dias úteis. Para clientes Premium e Enterprise, oferecemos suporte prioritário com resposta em até 4 horas."
        },
        {
          question: "Vocês oferecem treinamento?",
          answer: "Sim, oferecemos materiais de treinamento completos, tutoriais em vídeo e sessões de onboarding para novos usuários."
        }
      ]
    },
    {
      category: "Segurança e Privacidade",
      questions: [
        {
          question: "Meus dados estão seguros?",
          answer: "Absolutamente! Utilizamos criptografia de ponta a ponta e seguimos rigorosamente a LGPD. Todos os dados são armazenados em servidores seguros e nunca são compartilhados."
        },
        {
          question: "Como funciona a integração com WhatsApp?",
          answer: "Nossa integração é oficial e segue todas as políticas do WhatsApp Business API. Não armazenamos conversas pessoais, apenas dados necessários para o funcionamento do agente."
        },
        {
          question: "Posso exportar meus dados?",
          answer: "Sim, você pode exportar todos os seus dados a qualquer momento através da plataforma ou solicitando ao nosso suporte."
        }
      ]
    }
  ];

  const filteredFaqs = faqs.map(category => ({
    ...category,
    questions: category.questions.filter(
      q => 
        q.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.answer.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(category => category.questions.length > 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <HelpCircle className="h-8 w-8 text-brand-green" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Central de Ajuda</h1>
                <p className="text-gray-600">Encontre respostas para suas dúvidas</p>
              </div>
            </div>
            <Button 
              variant="outline" 
              onClick={() => navigate('/dashboard')}
              className="flex items-center space-x-2"
            >
              <span>Voltar ao Dashboard</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              type="text"
              placeholder="Pesquisar perguntas frequentes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 py-3 text-lg border-2 border-gray-200 focus:border-brand-green rounded-lg"
            />
          </div>
          {searchTerm && (
            <p className="mt-2 text-sm text-gray-600">
              {filteredFaqs.reduce((acc, cat) => acc + cat.questions.length, 0)} resultado(s) encontrado(s)
            </p>
          )}
        </div>

        {/* FAQ Categories */}
        {filteredFaqs.length > 0 ? (
          <div className="space-y-8">
            {filteredFaqs.map((category, categoryIndex) => (
              <Card key={categoryIndex} className="shadow-lg border-0">
                <CardHeader className="bg-gradient-to-r from-brand-green to-green-600 text-white rounded-t-lg">
                  <CardTitle className="text-xl font-semibold">
                    {category.category}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <Accordion type="single" collapsible className="w-full">
                    {category.questions.map((faq, index) => (
                      <AccordionItem 
                        key={index} 
                        value={`${categoryIndex}-${index}`}
                        className="border-b border-gray-100 last:border-b-0"
                      >
                        <AccordionTrigger className="text-left px-6 py-4 hover:bg-gray-50 text-gray-800 font-medium">
                          {faq.question}
                        </AccordionTrigger>
                        <AccordionContent className="px-6 pb-4 text-gray-600 leading-relaxed">
                          {faq.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <HelpCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              Nenhum resultado encontrado
            </h3>
            <p className="text-gray-500">
              Tente pesquisar com outros termos ou entre em contato conosco.
            </p>
          </div>
        )}

        {/* Contact Section */}
        <Card className="mt-12 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-center text-2xl font-bold text-gray-800 mb-2">
              Ainda precisa de ajuda?
            </CardTitle>
            <p className="text-center text-gray-600">
              Nossa equipe está pronta para ajudar você
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="bg-white rounded-full p-4 w-16 h-16 mx-auto mb-3 shadow-md">
                  <Mail className="h-8 w-8 text-blue-600 mx-auto" />
                </div>
                <h4 className="font-semibold text-gray-800 mb-1">Email</h4>
                <p className="text-sm text-gray-600 mb-2">contacto@zap-agent.com</p>
                <p className="text-xs text-gray-500">Resposta em 24h</p>
              </div>
              
              <div className="text-center">
                <div className="bg-white rounded-full p-4 w-16 h-16 mx-auto mb-3 shadow-md">
                  <MessageCircle className="h-8 w-8 text-green-600 mx-auto" />
                </div>
                <h4 className="font-semibold text-gray-800 mb-1">WhatsApp</h4>
                <p className="text-sm text-gray-600 mb-2">+62 851-8953-6562</p>
                <p className="text-xs text-gray-500">Seg-Sex, 9h às 18h</p>
              </div>
              
              <div className="text-center">
                <div className="bg-white rounded-full p-4 w-16 h-16 mx-auto mb-3 shadow-md">
                  <Phone className="h-8 w-8 text-purple-600 mx-auto" />
                </div>
                <h4 className="font-semibold text-gray-800 mb-1">Telefone</h4>
                <p className="text-sm text-gray-600 mb-2">(11) 3333-4444</p>
                <p className="text-xs text-gray-500">Seg-Sex, 9h às 18h</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FAQPage;
