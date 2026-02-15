import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { LogIn, LogOut, Loader2 } from 'lucide-react';

export default function LoginButton() {
  const { login, clear, loginStatus, identity } = useInternetIdentity();
  const queryClient = useQueryClient();

  const isAuthenticated = !!identity;
  const disabled = loginStatus === 'logging-in';

  const handleAuth = async () => {
    if (isAuthenticated) {
      await clear();
      queryClient.clear();
    } else {
      try {
        await login();
      } catch (error: any) {
        console.error('Login error:', error);
        if (error.message === 'User is already authenticated') {
          await clear();
          setTimeout(() => login(), 300);
        }
      }
    }
  };

  return (
    <button
      onClick={handleAuth}
      disabled={disabled}
      className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium transition-all shadow-sm ${
        isAuthenticated
          ? 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
          : 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-soft'
      } disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      {loginStatus === 'logging-in' ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          Logging in...
        </>
      ) : isAuthenticated ? (
        <>
          <LogOut className="w-4 h-4" />
          Logout
        </>
      ) : (
        <>
          <LogIn className="w-4 h-4" />
          Login
        </>
      )}
    </button>
  );
}

