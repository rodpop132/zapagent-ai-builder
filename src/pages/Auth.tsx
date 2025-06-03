
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  // Redirecionar se já estiver autenticado
  useEffect(() => {
    if (user) {
      const from = location.state?.from?.pathname || '/dashboard';
      console.log('User authenticated, redirecting to:', from);
      navigate(from, { replace: true });
    }
  }, [user, navigate, location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        console.log('Tentando fazer login...');
        const { error } = await signIn(email, password);
        if (error) {
          console.error('Erro no login:', error.message);
          toast({
            title: "Erro no login",
            description: error.message,
            variant: "destructive"
          });
        } else {
          console.log('Login realizado com sucesso!');
          toast({
            title: "Login realizado com sucesso!",
            description: "Bem-vindo de volta ao ZapAgent AI"
          });
          // O redirecionamento será feito pelo useEffect acima
        }
      } else {
        console.log('Tentando fazer cadastro...');
        const { error } = await signUp(email, password, fullName);
        if (error) {
          console.error('Erro no cadastro:', error.message);
          toast({
            title: "Erro no cadastro",
            description: error.message,
            variant: "destructive"
          });
        } else {
          console.log('Cadastro realizado com sucesso!');
          toast({
            title: "Cadastro realizado!",
            description: "Verifique seu email para confirmar a conta"
          });
        }
      }
    } catch (error) {
      console.error('Erro geral:', error);
      toast({
        title: "Erro",
        description: "Algo deu errado. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-10 h-10 bg-brand-green rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">ZA</span>
            </div>
            <span className="text-2xl font-bold text-brand-dark">ZapAgent AI</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">
            {isLogin ? 'Faça login' : 'Crie sua conta'}
          </h2>
          <p className="mt-2 text-gray-600">
            {isLogin ? 'Acesse seu painel de agentes IA' : 'Comece a criar agentes IA gratuitamente'}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{isLogin ? 'Entrar' : 'Cadastrar'}</CardTitle>
            <CardDescription>
              {isLogin ? 'Digite suas credenciais para acessar' : 'Preencha os dados para começar'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                    Nome completo
                  </label>
                  <Input
                    id="fullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required={!isLogin}
                    placeholder="Seu nome completo"
                  />
                </div>
              )}
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="seu@email.com"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Senha
                </label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Sua senha"
                  minLength={6}
                />
              </div>

              <Button 
                type="submit" 
                className="w-full bg-brand-green hover:bg-brand-green/90 text-white"
                disabled={loading}
              >
                {loading ? 'Processando...' : (isLogin ? 'Entrar' : 'Criar conta')}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-brand-green hover:text-brand-green/80 text-sm font-medium"
              >
                {isLogin ? 'Não tem conta? Cadastre-se' : 'Já tem conta? Faça login'}
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
