import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { AuthLayout } from '@/layouts/AuthLayout';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { authService } from '@/services/auth.service';
import { apiErrorMessage } from '@/lib/api';

export default function VerifyOtpPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [email, setEmail] = useState(params.get('email') ?? '');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authService.verifyOtp(email.trim().toLowerCase(), otp.trim());
      toast.success('Email verified!');
      navigate('/');
    } catch (err) {
      toast.error(apiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const resend = async () => {
    try {
      await authService.resendOtp(email.trim().toLowerCase());
      toast.success('Code resent');
    } catch (err) {
      toast.error(apiErrorMessage(err));
    }
  };

  return (
    <AuthLayout title="Verify your email" subtitle="Enter the 6-digit code we sent you">
      <form onSubmit={submit} className="space-y-4">
        <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <Input
          label="Verification code"
          value={otp}
          onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
          placeholder="000000"
          className="text-center text-lg tracking-[0.5em]"
          inputMode="numeric"
          required
        />
        <Button type="submit" loading={loading} className="w-full" size="lg">
          Verify
        </Button>
      </form>
      <div className="mt-4 flex items-center justify-between text-sm">
        <button onClick={resend} className="text-brand-600 hover:underline dark:text-brand-400">
          Resend code
        </button>
        <Link to="/" className="text-slate-500 hover:underline dark:text-slate-400">
          Skip for now
        </Link>
      </div>
    </AuthLayout>
  );
}
