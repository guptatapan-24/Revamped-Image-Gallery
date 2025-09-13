// src/pages/AuthCallback.tsx - HANDLE EMAIL CONFIRMATIONS
import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = React.useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = React.useState('');

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          console.error('Auth callback error:', error);
          setStatus('error');
          setMessage('Failed to confirm email. Please try again.');
          return;
        }

        if (data.session) {
          console.log('✅ Email confirmed and user logged in');
          setStatus('success');
          setMessage('Email confirmed successfully! You are now logged in.');
          
          // Redirect to profile after 2 seconds
          setTimeout(() => {
            navigate('/profile', { replace: true });
          }, 2000);
        } else {
          setStatus('error');
          setMessage('No active session found. Please try logging in again.');
        }
      } catch (err) {
        console.error('Unexpected error:', err);
        setStatus('error');
        setMessage('An unexpected error occurred.');
      }
    };

    handleAuthCallback();
  }, [navigate, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center max-w-md mx-auto p-8">
        {status === 'loading' && (
          <>
            <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
            <h2 className="text-2xl font-bold mb-2">Confirming Email...</h2>
            <p className="text-muted-foreground">Please wait while we confirm your email address.</p>
          </>
        )}
        
        {status === 'success' && (
          <>
            <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
            <h2 className="text-2xl font-bold text-green-600 mb-2">Email Confirmed!</h2>
            <p className="text-muted-foreground">{message}</p>
            <p className="text-sm text-muted-foreground mt-2">Redirecting you to your profile...</p>
          </>
        )}
        
        {status === 'error' && (
          <>
            <XCircle className="h-12 w-12 mx-auto mb-4 text-red-500" />
            <h2 className="text-2xl font-bold text-red-600 mb-2">Confirmation Failed</h2>
            <p className="text-muted-foreground mb-4">{message}</p>
            <button
              onClick={() => navigate('/login')}
              className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90"
            >
              Go to Login
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default AuthCallback;
