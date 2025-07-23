import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  BoltIcon, 
  EyeIcon, 
  EyeSlashIcon,
  EnvelopeIcon,
  LockClosedIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Senha é obrigatória'),
  rememberMe: z.boolean().optional()
});

type LoginFormData = z.infer<typeof loginSchema>;

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login, loginWithGoogle, loginWithGithub } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema)
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      await login({
        email: data.email,
        password: data.password,
        rememberMe: data.rememberMe
      });
      
      toast.success('Login realizado com sucesso!');
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(error.message || 'Erro ao fazer login');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'github') => {
    setSocialLoading(provider);
    try {
      if (provider === 'google') {
        await loginWithGoogle();
      } else {
        await loginWithGithub();
      }
      
      toast.success('Login realizado com sucesso!');
      navigate('/dashboard');
    } catch (error: any) {
      console.error(`${provider} login error:`, error);
      toast.error(error.message || `Erro ao fazer login com ${provider}`);
    } finally {
      setSocialLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        {/* Logo */}
        <div className="text-center">
          <Link to="/" className="inline-flex items-center space-x-2">
            <BoltIcon className="h-12 w-12 text-blue-500" />
            <span className="text-3xl font-bold">NXT.AI</span>
          </Link>
          <h2 className="mt-6 text-3xl font-bold">Bem-vindo de volta</h2>
          <p className="mt-2 text-gray-400">
            Não tem uma conta?{' '}
            <Link to="/register" className="text-blue-500 hover:text-blue-400">
              Criar conta
            </Link>
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-2">
              Email
            </label>
            <div className="relative">
              <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                {...register('email')}
                type="email"
                autoComplete="email"
                className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                placeholder="seu@email.com"
              />
            </div>
            {errors.email && (
              <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-2">
              Senha
            </label>
            <div className="relative">
              <LockClosedIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                {...register('password')}
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                className="w-full pl-10 pr-10 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                placeholder="Sua senha"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition"
              >
                {showPassword ? (
                  <EyeSlashIcon className="h-5 w-5" />
                ) : (
                  <EyeIcon className="h-5 w-5" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>
            )}
          </div>

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                {...register('rememberMe')}
                type="checkbox"
                className="h-4 w-4 bg-gray-800 border-gray-700 rounded text-blue-600 focus:ring-blue-500"
              />
              <label className="ml-2 text-sm text-gray-400">
                Lembrar de mim
              </label>
            </div>
            <Link 
              to="/forgot-password" 
              className="text-sm text-blue-500 hover:text-blue-400 transition"
            >
              Esqueceu a senha?
            </Link>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isLoading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Entrando...
              </div>
            ) : (
              'Entrar'
            )}
          </button>
        </form>

        {/* Social Login */}
        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-900 text-gray-400">Ou continue com</span>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <button 
              onClick={() => handleSocialLogin('google')}
              disabled={socialLoading === 'google'}
              className="w-full py-2 px-4 bg-gray-800 hover:bg-gray-700 rounded-lg font-medium transition flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {socialLoading === 'google' ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <>
                  <img src="/google.svg" alt="Google" className="h-5 w-5 mr-2" />
                  Google
                </>
              )}
            </button>
            <button 
              onClick={() => handleSocialLogin('github')}
              disabled={socialLoading === 'github'}
              className="w-full py-2 px-4 bg-gray-800 hover:bg-gray-700 rounded-lg font-medium transition flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {socialLoading === 'github' ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <>
                  <img src="/github.svg" alt="GitHub" className="h-5 w-5 mr-2" />
                  GitHub
                </>
              )}
            </button>
          </div>
        </div>

        {/* Demo Account */}
        <div className="mt-6 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
          <h3 className="text-sm font-medium text-gray-300 mb-2">Conta de demonstração</h3>
          <p className="text-xs text-gray-400 mb-3">
            Teste o sistema com dados de exemplo
          </p>
          <button
            onClick={() => {
              // Fill form with demo credentials
              const form = document.querySelector('form') as HTMLFormElement;
              const emailInput = form.querySelector('input[type="email"]') as HTMLInputElement;
              const passwordInput = form.querySelector('input[type="password"]') as HTMLInputElement;
              
              emailInput.value = 'demo@nxtai.com';
              passwordInput.value = 'demo123456';
              
              // Trigger form validation
              emailInput.dispatchEvent(new Event('input', { bubbles: true }));
              passwordInput.dispatchEvent(new Event('input', { bubbles: true }));
            }}
            className="w-full py-2 px-4 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm font-medium transition"
          >
            Usar conta demo
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;