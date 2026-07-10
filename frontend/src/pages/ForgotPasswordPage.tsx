import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { AuthLayout } from '@/layouts/AuthLayout';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { authService } from '@/services/auth.service';
import { apiErrorMessage } from '@/lib/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authService.forgotPassword(email.trim().toLowerCase());
      setSent(true);
    } catch (err) {
      toast.error(apiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Reset password" subtitle="We'll email you a reset link">
      {sent ? (
        <div className="space-y-4 text-sm text-slate-600 dark:text-slate-300">
          <p>If an account exists for <b>{email}</b>, a reset link is on its way.</p>
          <Link to="/login" className="inline-block font-medium text-brand-600 hover:underline dark:text-brand-400">
            Back to sign in
          </Link>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <Button type="submit" loading={loading} className="w-full" size="lg">
            Send reset link
          </Button>
          <Link to="/login" className="block text-center text-sm text-slate-500 hover:underline dark:text-slate-400">
            Back to sign in
          </Link>
        </form>
      )}
    </AuthLayout>
  );
}
