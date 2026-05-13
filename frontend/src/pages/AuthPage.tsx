import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import LoginForm from '@/components/auth/LoginForm';
import RegisterForm from '@/components/auth/RegisterForm';
import ForgotForm from '@/components/auth/ForgotForm';
import ResetForm from '@/components/auth/ResetForm';

type AuthView = 'login' | 'register' | 'forgot' | 'reset';

export function AuthPage() {
  const [searchParams] = useSearchParams();
  const initialView = (searchParams.get('view') as AuthView) || 'login';
  const emailFromUrl = searchParams.get('email') || '';

  const [view, setView] = useState<AuthView>(
    ['login', 'register', 'forgot', 'reset'].includes(initialView) ? initialView : 'login'
  );

  // Sync with URL query param when it changes (e.g. navigating from header buttons)
  useEffect(() => {
    const viewParam = searchParams.get('view') as AuthView;
    if (viewParam && ['login', 'register', 'forgot', 'reset'].includes(viewParam)) {
      setView(viewParam);
    }
  }, [searchParams]);

  const renderForm = () => {
    switch (view) {
      case 'login':
        return (
          <LoginForm />
        );
      case 'register':
        return (
          <RegisterForm />
        );
      case 'forgot':
        return (
          <ForgotForm />
        );
      case 'reset':
        return (
          <ResetForm email={emailFromUrl} />
        );
    }
  };

  return (
    <div
      id="auth-page"
      className="absolute inset-0 flex items-center justify-center px-4 -translate-y-5"
    >
      {/* Card container */}
      <div
        className="
          w-full max-w-[460px]
          bg-[#292929]
          rounded-[8px]
          px-12 py-8
          shadow-[0_0_10px_rgba(255,255,255,0.25)]
          animate-[fadeInUp_0.35s_ease-out]
        "
      >
        {renderForm()}
      </div>
    </div>
  );
}