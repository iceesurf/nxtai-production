import { useState, useEffect, useCallback } from 'react';
import { 
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  sendEmailVerification,
} from 'firebase/auth';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { auth } from '../config/firebase';
import { AuthUser, SignupData, LoginCredentials } from '@nxtai/shared';
import { useAuthStore } from '../store/authStore';
import { toast } from 'react-hot-toast';

const functions = getFunctions();

export const useAuth = () => {
  const { 
    user, 
    isLoading, 
    isAuthenticated, 
    error,
    setUser, 
    setLoading, 
    setError, 
    clearError 
  } = useAuthStore();

  const [initializing, setInitializing] = useState(true);

  // Monitor de estado de autenticação
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      
      try {
        if (firebaseUser) {
          // Obter dados completos do usuário via Cloud Function
          const getCurrentUser = httpsCallable(functions, 'getCurrentUser');
          const response = await getCurrentUser();
          
          if (response.data.success) {
            setUser(response.data.data as AuthUser);
          }
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Error getting user data:', error);
        setError('Failed to load user data');
      } finally {
        setLoading(false);
        if (initializing) setInitializing(false);
      }
    });

    return unsubscribe;
  }, [initializing, setUser, setLoading, setError]);

  // Login
  const login = useCallback(async (credentials: LoginCredentials) => {
    setLoading(true);
    clearError();

    try {
      await signInWithEmailAndPassword(auth, credentials.email, credentials.password);
      toast.success('Login realizado com sucesso!');
    } catch (error: any) {
      const errorMessage = getAuthErrorMessage(error.code);
      setError(errorMessage);
      toast.error(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError, clearError]);

  // Signup
  const signup = useCallback(async (data: SignupData) => {
    setLoading(true);
    clearError();

    try {
      const signupFunction = httpsCallable(functions, 'signup');
      const response = await signupFunction(data);
      
      if (response.data.success) {
        toast.success('Conta criada com sucesso! Verifique seu email.');
        return response.data.data;
      } else {
        throw new Error('Signup failed');
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Erro ao criar conta';
      setError(errorMessage);
      toast.error(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError, clearError]);

  // Logout
  const logout = useCallback(async () => {
    setLoading(true);
    clearError();

    try {
      await signOut(auth);
      toast.success('Logout realizado com sucesso!');
    } catch (error: any) {
      const errorMessage = 'Erro ao fazer logout';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError, clearError]);

  // Reset de senha
  const resetPassword = useCallback(async (email: string) => {
    setLoading(true);
    clearError();

    try {
      await sendPasswordResetEmail(auth, email);
      toast.success('Email de recuperação enviado!');
    } catch (error: any) {
      const errorMessage = getAuthErrorMessage(error.code);
      setError(errorMessage);
      toast.error(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError, clearError]);

  // Reenviar verificação de email
  const resendEmailVerification = useCallback(async () => {
    if (!auth.currentUser) return;

    setLoading(true);
    clearError();

    try {
      await sendEmailVerification(auth.currentUser);
      toast.success('Email de verificação reenviado!');
    } catch (error: any) {
      const errorMessage = 'Erro ao reenviar email de verificação';
      setError(errorMessage);
      toast.error(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError, clearError]);

  // Atualizar perfil
  const updateProfile = useCallback(async (data: any) => {
    setLoading(true);
    clearError();

    try {
      const updateProfileFunction = httpsCallable(functions, 'updateProfile');
      const response = await updateProfileFunction(data);
      
      if (response.data.success) {
        // Recarregar dados do usuário
        const getCurrentUser = httpsCallable(functions, 'getCurrentUser');
        const userResponse = await getCurrentUser();
        
        if (userResponse.data.success) {
          setUser(userResponse.data.data as AuthUser);
        }
        
        toast.success('Perfil atualizado com sucesso!');
      }
    } catch (error: any) {
      const errorMessage = 'Erro ao atualizar perfil';
      setError(errorMessage);
      toast.error(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError, clearError, setUser]);

  // Deletar conta
  const deleteAccount = useCallback(async () => {
    setLoading(true);
    clearError();

    try {
      const deleteAccountFunction = httpsCallable(functions, 'deleteAccount');
      const response = await deleteAccountFunction();
      
      if (response.data.success) {
        await signOut(auth);
        toast.success('Conta deletada com sucesso!');
      }
    } catch (error: any) {
      const errorMessage = 'Erro ao deletar conta';
      setError(errorMessage);
      toast.error(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError, clearError]);

  return {
    user,
    isLoading: isLoading || initializing,
    isAuthenticated,
    error,
    login,
    signup,
    logout,
    resetPassword,
    resendEmailVerification,
    updateProfile,
    deleteAccount,
    clearError,
  };
};

function getAuthErrorMessage(errorCode: string): string {
  const errorMessages: Record<string, string> = {
    'auth/invalid-email': 'Email inválido',
    'auth/user-disabled': 'Conta desabilitada',
    'auth/user-not-found': 'Usuário não encontrado',
    'auth/wrong-password': 'Senha incorreta',
    'auth/email-already-in-use': 'Email já está em uso',
    'auth/weak-password': 'Senha muito fraca',
    'auth/network-request-failed': 'Erro de conexão',
    'auth/too-many-requests': 'Muitas tentativas. Tente novamente mais tarde',
    'auth/operation-not-allowed': 'Operação não permitida',
    'auth/invalid-credential': 'Credenciais inválidas',
  };

  return errorMessages[errorCode] || 'Erro de autenticação';
}