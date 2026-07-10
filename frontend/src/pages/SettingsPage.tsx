import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useAuth } from '@/hooks/useAuth';
import { userService, uploadService } from '@/services/user.service';
import { authService } from '@/services/auth.service';
import { queryKeys } from '@/lib/queryClient';
import { apiErrorMessage } from '@/lib/api';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Spinner } from '@/components/ui/Spinner';
import { BackIcon } from '@/components/ui/icons';
import { formatChatTimestamp } from '@/lib/utils';

export default function SettingsPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { user, setUser, logout } = useAuth();
  const [displayName, setDisplayName] = useState(user?.displayName ?? '');
  const [bio, setBio] = useState(user?.bio ?? '');
  const [username, setUsername] = useState(user?.username ?? '');
  const [savingProfile, setSavingProfile] = useState(false);
  const [pw, setPw] = useState({ current: '', next: '' });

  const { data: sessions, isLoading: sessionsLoading } = useQuery({
    queryKey: queryKeys.sessions,
    queryFn: () => userService.sessions(),
  });

  const saveProfile = async () => {
    setSavingProfile(true);
    try {
      const updated = await userService.updateProfile({ displayName, bio, username });
      setUser(updated);
      toast.success('Profile updated');
    } catch (e) {
      toast.error(apiErrorMessage(e));
    } finally {
      setSavingProfile(false);
    }
  };

  const onAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const uploaded = await uploadService.upload(file);
      const updated = await userService.updateProfile({ avatarUrl: uploaded.url });
      setUser(updated);
      toast.success('Avatar updated');
    } catch (err) {
      toast.error(apiErrorMessage(err));
    }
  };

  const changePassword = async () => {
    if (!pw.current || !pw.next) return;
    try {
      await authService.changePassword(pw.current, pw.next);
      setPw({ current: '', next: '' });
      toast.success('Password changed');
    } catch (e) {
      toast.error(apiErrorMessage(e));
    }
  };

  const togglePrivacy = async (key: string, value: unknown) => {
    try {
      const updated = await userService.updatePrivacy({ [key]: value });
      setUser(updated);
    } catch (e) {
      toast.error(apiErrorMessage(e));
    }
  };

  const revoke = async (id: string) => {
    try {
      await userService.revokeSession(id);
      qc.invalidateQueries({ queryKey: queryKeys.sessions });
      toast.success('Session revoked');
    } catch (e) {
      toast.error(apiErrorMessage(e));
    }
  };

  const logoutAll = async () => {
    try {
      await authService.logoutAll();
      toast.success('Signed out everywhere');
      logout();
    } catch (e) {
      toast.error(apiErrorMessage(e));
    }
  };

  return (
    <div className="mx-auto h-full max-w-2xl overflow-y-auto bg-white p-4 dark:bg-surface-dark md:p-8">
      <header className="mb-6 flex items-center gap-3">
        <button onClick={() => navigate('/')} className="rounded-full p-2 hover:bg-slate-100 dark:hover:bg-surface-hover">
          <BackIcon />
        </button>
        <h1 className="text-xl font-semibold text-slate-800 dark:text-slate-100">Settings</h1>
      </header>

      {/* Profile */}
      <section className="mb-8">
        <div className="mb-4 flex items-center gap-4">
          <label className="relative cursor-pointer">
            <Avatar name={user?.displayName ?? '?'} src={user?.avatarUrl} id={user?._id} size={72} />
            <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 text-xs text-white opacity-0 transition hover:opacity-100">
              Change
            </span>
            <input type="file" accept="image/*" hidden onChange={onAvatar} />
          </label>
          <div>
            <p className="font-semibold text-slate-800 dark:text-slate-100">{user?.displayName}</p>
            <p className="text-sm text-slate-400">{user?.email}</p>
          </div>
        </div>
        <div className="space-y-3">
          <Input label="Display name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
          <Input label="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
          <Input label="Bio" value={bio} onChange={(e) => setBio(e.target.value)} />
          <Button onClick={saveProfile} loading={savingProfile}>Save profile</Button>
        </div>
      </section>

      {/* Privacy */}
      <section className="mb-8">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">Privacy</h2>
        <div className="space-y-3 rounded-xl bg-surface-muted p-4 dark:bg-surface-panel">
          <label className="flex items-center justify-between text-sm">
            <span>Read receipts</span>
            <input
              type="checkbox"
              checked={user?.privacy.readReceipts ?? true}
              onChange={(e) => togglePrivacy('readReceipts', e.target.checked)}
              className="h-4 w-4 accent-brand-500"
            />
          </label>
          <label className="flex items-center justify-between text-sm">
            <span>Last seen visible to</span>
            <select
              value={user?.privacy.lastSeen ?? 'everyone'}
              onChange={(e) => togglePrivacy('lastSeen', e.target.value)}
              className="rounded-md bg-white px-2 py-1 text-sm dark:bg-surface-hover"
            >
              <option value="everyone">Everyone</option>
              <option value="contacts">Contacts</option>
              <option value="nobody">Nobody</option>
            </select>
          </label>
        </div>
      </section>

      {/* Security */}
      <section className="mb-8">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">Change password</h2>
        <div className="space-y-3">
          <Input label="Current password" type="password" value={pw.current} onChange={(e) => setPw({ ...pw, current: e.target.value })} />
          <Input label="New password" type="password" value={pw.next} onChange={(e) => setPw({ ...pw, next: e.target.value })} />
          <Button variant="secondary" onClick={changePassword}>Update password</Button>
        </div>
      </section>

      {/* Sessions */}
      <section className="mb-8">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">Active devices</h2>
        <div className="space-y-2">
          {sessionsLoading ? (
            <Spinner />
          ) : (
            (sessions ?? []).map((s) => (
              <div key={s.id} className="flex items-center justify-between rounded-lg bg-surface-muted px-4 py-3 dark:bg-surface-panel">
                <div>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                    {s.deviceName} {s.current && <span className="text-brand-500">· this device</span>}
                  </p>
                  <p className="text-xs text-slate-400">{s.ip} · {formatChatTimestamp(s.lastActiveAt)}</p>
                </div>
                {!s.current && (
                  <button onClick={() => revoke(s.id)} className="text-xs font-medium text-red-500 hover:underline">
                    Revoke
                  </button>
                )}
              </div>
            ))
          )}
        </div>
        <Button variant="danger" className="mt-4" onClick={logoutAll}>
          Log out of all devices
        </Button>
      </section>
    </div>
  );
}
