import { useRef, useState, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { AuthLayout } from '@/layouts/AuthLayout';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/hooks/useAuth';
import { uploadService } from '@/services/user.service';
import { coupleService } from '@/services/couple.service';
import { useLoveStore } from '@/store/loveStore';
import { apiErrorMessage } from '@/lib/api';
import { assetUrl } from '@/lib/utils';
import { markUnlocked } from '@/lib/coupleLock';
import { Spinner } from '@/components/ui/Spinner';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const invite = (params.get('invite') ?? sessionStorage.getItem('pendingInvite') ?? '').toUpperCase();
  const isPartner = invite.length >= 4;
  const setSettings = useLoveStore((s) => s.setSettings);
  const fileInput = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({ displayName: '', username: '', email: '', password: '', confirm: '' });
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>();
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const onPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const uploaded = await uploadService.upload(file);
      setAvatarUrl(uploaded.url);
    } catch (err) {
      toast.error(apiErrorMessage(err));
    } finally {
      setUploading(false);
    }
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirm) return toast.error('Passwords do not match 💔');
    setLoading(true);
    try {
      await register({
        displayName: form.displayName.trim(),
        username: form.username.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        avatarUrl,
      });
      markUnlocked(); // don't lock them out right after signing up
      if (isPartner) {
        // Partner: immediately link to the owner's couple, then enter the app.
        try {
          const couple = await coupleService.join(invite);
          if (couple.chatId) setSettings({ partnerChatId: couple.chatId });
          sessionStorage.removeItem('pendingInvite');
          toast.success('Two hearts, linked forever 💞');
          navigate('/love');
          return;
        } catch (joinErr) {
          toast.error(apiErrorMessage(joinErr));
          navigate('/couple'); // let them retry the code manually
          return;
        }
      }
      toast.success('Welcome, my love 💖');
      navigate('/couple');
    } catch (err) {
      toast.error(apiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title={isPartner ? 'Join your partner 💕' : 'Create our private space'}
      subtitle={isPartner ? `Linking with code ${invite}` : 'Begin our forever, together'}
    >
      <form onSubmit={submit} className="space-y-4">
        {/* Profile photo */}
        <div className="flex flex-col items-center gap-2">
          <button
            type="button"
            onClick={() => fileInput.current?.click()}
            className="relative grid h-20 w-20 place-items-center overflow-hidden rounded-full love-gradient p-0.5 shadow-glow"
          >
            <span className="grid h-full w-full place-items-center overflow-hidden rounded-full bg-white/80 text-2xl dark:bg-surface-panel">
              {uploading ? (
                <Spinner size={20} />
              ) : avatarUrl ? (
                <img src={assetUrl(avatarUrl)} alt="" className="h-full w-full object-cover" />
              ) : (
                '📷'
              )}
            </span>
          </button>
          <span className="text-xs text-princess-purple">Add a profile photo</span>
          <input ref={fileInput} type="file" accept="image/*" hidden onChange={onPhoto} />
        </div>

        <Input label="Full name" value={form.displayName} onChange={set('displayName')} placeholder="Your beautiful name" required />
        <Input label="Username" value={form.username} onChange={set('username')} placeholder="e.g. princess" required />
        <Input label="Email" type="email" value={form.email} onChange={set('email')} placeholder="you@example.com" required />
        <Input label="Password" type="password" value={form.password} onChange={set('password')} placeholder="8+ chars, upper, lower, number" required />
        <Input label="Confirm password" type="password" value={form.confirm} onChange={set('confirm')} placeholder="Repeat your password" required />

        <button
          type="submit"
          disabled={loading || uploading}
          className="heart-btn flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-base font-semibold text-white transition disabled:opacity-60"
        >
          {loading && <Spinner size={18} className="text-white" />}
          Create account 💖
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-300">
        Already have an account?{' '}
        <Link to="/login" className="font-semibold love-text">Sign in</Link>
      </p>
    </AuthLayout>
  );
}
