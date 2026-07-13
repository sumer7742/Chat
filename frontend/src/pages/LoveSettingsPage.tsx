import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { LoveLayout } from '@/layouts/LoveLayout';
import { Button } from '@/components/ui/Button';
import { NicknamePicker } from '@/components/love/NicknamePicker';
import { useUIStore } from '@/store/uiStore';
import { useLoveStore } from '@/store/loveStore';
import { useAuth } from '@/hooks/useAuth';
import { useCouple } from '@/hooks/useCouple';
import { coupleService, type CoupleView } from '@/services/couple.service';
import { queryKeys } from '@/lib/queryClient';
import { THEMES, CHAT_BGS, themeGradientCss } from '@/lib/themes';
import { FONTS } from '@/lib/love';
import { apiErrorMessage } from '@/lib/api';
import { cn } from '@/lib/utils';

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="glass-card p-5">
      <h3 className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-100">{title}</h3>
      {children}
    </div>
  );
}

export default function LoveSettingsPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { logout, user } = useAuth();
  const { themeId, setThemeId, chatBgId, setChatBgId, theme, toggleTheme } = useUIStore();
  const { settings, setSettings } = useLoveStore();
  const { data: couple } = useCouple();
  const [pinInput, setPinInput] = useState('');
  const [editingNick, setEditingNick] = useState(false);

  const saveNick = useMutation({
    mutationFn: (nickname: string) => coupleService.setNickname(nickname),
    onSuccess: (c) => {
      if (user?._id) qc.setQueryData<CoupleView>(queryKeys.couple(user._id), c);
      setEditingNick(false);
      toast.success('Nickname updated 💕');
    },
    onError: (e) => toast.error(apiErrorMessage(e)),
  });

  const setPin = () => {
    if (!/^\d{4,6}$/.test(pinInput)) return toast.error('Enter a 4–6 digit PIN');
    setSettings({ pin: pinInput });
    setPinInput('');
    toast.success('Privacy lock enabled 🔒');
  };
  const removePin = () => {
    setSettings({ pin: '' });
    toast.success('Lock removed');
  };

  return (
    <LoveLayout title="Settings ⚙️" subtitle="Make this space truly ours">
      <div className="space-y-4">
        {/* Relationship → Partner Nickname */}
        {couple?.linked && (
          <Card title="💞 Relationship">
            {editingNick ? (
              <NicknamePicker
                initial={couple.partnerNickname}
                saving={saveNick.isPending}
                onSave={(n) => saveNick.mutate(n)}
                ctaLabel="Save nickname 💖"
              />
            ) : (
              <button
                onClick={() => setEditingNick(true)}
                className="flex w-full items-center justify-between rounded-xl bg-white/50 px-4 py-3 text-left text-sm dark:bg-white/10"
              >
                <span className="text-slate-500 dark:text-slate-300">Partner Nickname</span>
                <span key={couple.partnerNickname} className="animate-pop-in font-semibold love-text">
                  {couple.partnerNickname || 'Set a nickname'} ›
                </span>
              </button>
            )}
          </Card>
        )}

        {/* Appearance */}
        <Card title="🌗 Appearance">
          <button
            onClick={toggleTheme}
            className="flex w-full items-center justify-between rounded-xl bg-white/50 px-4 py-3 text-sm dark:bg-white/10"
          >
            <span className="text-slate-600 dark:text-slate-200">Mode</span>
            <span className="font-medium">{theme === 'dark' ? '🌙 Dark' : '☀️ Light'}</span>
          </button>
        </Card>

        {/* Theme colors */}
        <Card title="🎨 Theme">
          <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
            {THEMES.map((t) => (
              <button
                key={t.id}
                onClick={() => setThemeId(t.id)}
                className={cn(
                  'flex flex-col items-center gap-1 rounded-xl p-2 transition',
                  themeId === t.id && 'ring-2 ring-princess-pink',
                )}
              >
                <span className="h-9 w-9 rounded-full shadow ring-1 ring-black/5" style={{ backgroundImage: themeGradientCss(t) }} />
                <span className="truncate text-[10px] text-slate-500 dark:text-slate-300">{t.name}</span>
              </button>
            ))}
          </div>
        </Card>

        {/* Chat wallpaper */}
        <Card title="🖼️ Chat wallpaper">
          <div className="grid grid-cols-4 gap-2">
            {CHAT_BGS.map((bg) => (
              <button
                key={bg.id}
                onClick={() => setChatBgId(bg.id)}
                className={cn('rounded-xl p-1 transition', chatBgId === bg.id && 'ring-2 ring-princess-pink')}
              >
                <span className="block h-10 w-full rounded-lg shadow-sm ring-1 ring-black/5" style={{ background: bg.preview }} />
                <span className="mt-1 block truncate text-[10px] text-slate-500 dark:text-slate-300">{bg.name}</span>
              </button>
            ))}
          </div>
        </Card>

        {/* Fonts */}
        <Card title="🔤 Font">
          <div className="grid grid-cols-2 gap-2">
            {FONTS.map((f) => (
              <button
                key={f.id}
                onClick={() => setSettings({ fontId: f.id })}
                style={{ fontFamily: f.stack }}
                className={cn(
                  'rounded-xl bg-white/50 px-3 py-2.5 text-sm transition dark:bg-white/10',
                  settings.fontId === f.id ? 'ring-2 ring-princess-pink' : '',
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        </Card>

        {/* Privacy lock */}
        <Card title="🔒 Privacy lock">
          {settings.pin ? (
            <div className="flex items-center justify-between">
              <p className="text-sm text-emerald-500">● Lock is on — PIN required to enter.</p>
              <Button variant="danger" size="sm" onClick={removePin}>Remove</Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <input
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value.replace(/\D/g, '').slice(0, 6))}
                inputMode="numeric"
                placeholder="Set a 4–6 digit PIN"
                className="flex-1 rounded-xl border border-princess-purple/20 bg-white/70 px-3 py-2 text-sm tracking-widest outline-none focus:ring-2 focus:ring-princess-pink/40 dark:bg-white/10 dark:text-slate-100"
              />
              <Button onClick={setPin}>Lock 🔒</Button>
            </div>
          )}
          <p className="mt-2 text-[11px] text-slate-400">
            Locks the Love section on this device. (A private on-device PIN — not a security feature.)
          </p>
        </Card>

        {/* Account */}
        <Card title="👤 Account">
          <div className="space-y-2">
            <button
              onClick={() => {
                setSettings({ partnerChatId: '' });
                navigate('/');
              }}
              className="flex w-full items-center justify-between rounded-xl bg-white/50 px-4 py-3 text-sm text-slate-600 dark:bg-white/10 dark:text-slate-200"
            >
              <span>💑 Change my Princess</span>
              <span className="text-slate-400">›</span>
            </button>
            <button
              onClick={() => navigate('/couple')}
              className="flex w-full items-center justify-between rounded-xl bg-white/50 px-4 py-3 text-sm text-slate-600 dark:bg-white/10 dark:text-slate-200"
            >
              <span>💌 Couple invite code</span>
              <span className="text-slate-400">›</span>
            </button>
            <button
              onClick={() => navigate('/settings')}
              className="flex w-full items-center justify-between rounded-xl bg-white/50 px-4 py-3 text-sm text-slate-600 dark:bg-white/10 dark:text-slate-200"
            >
              <span>⚙️ Account settings</span>
              <span className="text-slate-400">›</span>
            </button>
            <Button variant="danger" className="w-full" onClick={logout}>
              Logout
            </Button>
          </div>
        </Card>
      </div>
    </LoveLayout>
  );
}
