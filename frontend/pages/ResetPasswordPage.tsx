import React, { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { resetPasswordWithToken } from '@/services/api';
import { useToast } from '@/hooks/useToast';

const ResetPasswordPage: React.FC = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { token } = useParams<{ token: string }>();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!password || !confirmPassword) {
      setError('Please fill in both fields.');
      return;
    }
    if (password.length < 6) {
        setError('Password must be at least 6 characters long.');
        return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (!token) {
        setError('Reset token is missing. Please use the link from your email.');
        return;
    }
    
    setIsLoading(true);
    try {
      await resetPasswordWithToken(token, password);
      addToast('Your password has been reset successfully!', 'success');
      navigate('/login');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center py-12">
      <Card className="w-full max-w-md">
        <h2 className="text-3xl font-bold text-center text-slate-800 mb-2">Set New Password</h2>
        <p className="text-center text-slate-500 mb-6">Create a new secure password for your account.</p>
        
        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md mb-4" role="alert">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
            <Input id="password" label="New Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="••••••••" />
            <Input id="confirmPassword" label="Confirm New Password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required placeholder="••••••••" />
            <Button type="submit" className="w-full" isLoading={isLoading}>
              Update Password
            </Button>
        </form>
         <div className="text-center mt-6">
          <Link to="/login" className="text-sm text-blue-600 hover:underline">Back to Login</Link>
        </div>
      </Card>
    </div>
  );
};

export default ResetPasswordPage;
