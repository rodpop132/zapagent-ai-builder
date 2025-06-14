
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import LanguageSelector from '@/components/LanguageSelector';
import { useTranslation } from 'react-i18next';

const Auth = () => {
  const { t } = useTranslation();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { signIn, signUp, user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  useEffect(() => {
    if (user && !loading) {
      navigate(from, { replace: true });
    }
  }, [user, loading, navigate, from]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }
    
    if (!isLogin && !fullName) {
      toast.error('Nome completo é obrigatório para cadastro');
      return;
    }
    
    setIsSubmitting(true);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        
        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            toast.error('Email ou senha incorretos');
          } else {
            toast.error(`Erro no login: ${error.message}`);
          }
        } else {
          toast.success('Login realizado com sucesso!');
        }
      } else {
        const { error } = await signUp(email, password, fullName);
        
        if (error) {
          if (error.message.includes('User already registered')) {
            toast.error('Este email já está cadastrado. Tente fazer login.');
          } else {
            toast.error(`Erro no cadastro: ${error.message}`);
          }
        } else {
          toast.success('Cadastro realizado com sucesso!');
        }
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Algo deu errado. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t('auth.loading')}</p>
        </div>
      </div>
    );
  }

  if (user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Language Selector - Fixed position */}
      <div className="fixed top-4 right-4 z-50">
        <LanguageSelector />
      </div>

      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">ZA</span>
            </div>
            <span className="text-2xl font-bold text-gray-900">ZapAgent AI</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">
            {isLogin ? t('auth.loginTitle') : t('auth.signupTitle')}
          </h2>
          <p className="mt-2 text-gray-600">
            {isLogin ? t('auth.loginSubtitle') : t('auth.signupSubtitle')}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{isLogin ? t('auth.loginButton') : t('auth.signupButton')}</CardTitle>
            <CardDescription>
              {isLogin ? t('auth.loginDescription') : t('auth.signupDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                    {t('auth.fullName')}
                  </label>
                  <Input
                    id="fullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required={!isLogin}
                    placeholder={t('auth.fullNamePlaceholder')}
                    disabled={isSubmitting}
                  />
                </div>
              )}
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('auth.email')}
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder={t('auth.emailPlaceholder')}
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('auth.password')}
                </label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder={t('auth.passwordPlaceholder')}
                  minLength={6}
                  disabled={isSubmitting}
                />
              </div>

              <Button 
                type="submit" 
                className="w-full bg-green-600 hover:bg-green-700 text-white"
                disabled={isSubmitting}
              >
                {isSubmitting ? t('auth.processing') : (isLogin ? t('auth.loginButton') : t('auth.createAccount'))}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-green-600 hover:text-green-700 text-sm font-medium"
                disabled={isSubmitting}
              >
                {isLogin ? t('auth.switchToSignup') : t('auth.switchToLogin')}
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
