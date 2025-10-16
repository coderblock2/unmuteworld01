

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { requestPasswordReset } from '@/services/api';

const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    if (!email) {
        setError('Please enter your email address.');
        setIsLoading(false);
        return;
    }
    
    try {
      await requestPasswordReset(email);
      setSuccess('If an account with that email exists, a password reset link has been sent. Please check your inbox.');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center py-12">
      <Card className="w-full max-w-md">
        <h2 className="text-3xl font-bold text-center text-slate-800 mb-2">Forgot Password</h2>
        <p className="text-center text-slate-500 mb-6">Enter your email and we'll send you a link to reset your password.</p>
        
        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md mb-4" role="alert">{error}</div>}
        {success && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-md mb-4" role="alert">{success}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
            <Input id="email" label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@example.com" />
            <Button type="submit" className="w-full" isLoading={isLoading} disabled={!!success}>
              Send Reset Link
            </Button>
        </form>

        <div className="text-center mt-6">
          <Link to="/login" className="text-sm text-blue-600 hover:underline">Back to Login</Link>
        </div>
      </Card>
    </div>
  );
};

export default ForgotPasswordPage;