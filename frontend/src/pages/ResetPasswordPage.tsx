import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { AuthLayout } from '@/layouts/AuthLayout';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { authService } from '@/services/auth.service';
import { apiErrorMessage } from '@/lib/api';

export default function ResetPasswordPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [token, setToken] = useState(params.get('token') ?? '');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authService.resetPassword(token.trim(), password);
      toast.success('Password updated — sign in');
      navigate('/login');
    } catch (err) {
      toast.error(apiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Choose a new password">
      <form onSubmit={submit} className="space-y-4">
        {!params.get('token') && (
          <Input label="Reset token" value={token} onChange={(e) => setToken(e.target.value)} required />
        )}
        <Input
          label="New password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="8+ chars, upper, lower, number"
          required
        />
        <Button type="submit" loading={loading} className="w-full" size="lg">
          Update password
        </Button>
        <Link to="/login" className="block text-center text-sm text-slate-500 hover:underline dark:text-slate-400">
          Back to sign in
        </Link>
      </form>
    </AuthLayout>
  );
}
