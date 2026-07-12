import { useNavigate } from 'react-router-dom';
import { LoveLayout } from '@/layouts/LoveLayout';
import { Avatar } from '@/components/ui/Avatar';
import { Onboarding } from '@/components/love/Onboarding';
import { useAuth } from '@/hooks/useAuth';
import { useCouple, usePartnerNickname } from '@/hooks/useCouple';
import { useLoveStore } from '@/store/loveStore';
import { useNow } from '@/hooks/useNow';
import { daysSince } from '@/lib/love';

function greeting(h: number): string {
  if (h < 12) return 'Good Morning';
  if (h < 17) return 'Good Afternoon';
  if (h < 21) return 'Good Evening';
  return 'Good Night';
}

const TILES = [
  { to: '/love/dashboard', emoji: '💞', title: 'Love Dashboard', desc: 'Our story in numbers' },
  { to: '/love/memories', emoji: '📸', title: 'Memories', desc: 'Moments we treasure' },
  { to: '/love/letters', emoji: '💌', title: 'Love Letters', desc: 'Words from the heart' },
  { to: '/love/surprises', emoji: '🎁', title: 'Surprises', desc: 'A little something' },
  { to: '/love/wishlist', emoji: '⭐', title: 'Wishlist', desc: 'Dreams we share' },
  { to: '/love/calendar', emoji: '📅', title: 'Calendar', desc: 'Our special days' },
  { to: '/', emoji: '💬', title: 'Chat', desc: 'Talk to me' },
  { to: '/love/settings', emoji: '⚙️', title: 'Settings', desc: 'Make it ours' },
];

export default function LoveHomePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const now = useNow(1000);
  const { config } = useLoveStore();
  const { data: couple } = useCouple();
  const nickname = usePartnerNickname();
  const days = daysSince(config.firstMeet, now);

  return (
    <LoveLayout title={`${greeting(now.getHours())}, ${nickname}`} subtitle="Our little world, made with love">
      <Onboarding />
      {/* Hero card */}
      <div className="glass-card relative mb-4 overflow-hidden p-6 text-center">
        <div className="pointer-events-none absolute -right-8 -top-8 text-9xl opacity-10">💖</div>
        <div className="relative mx-auto mb-3 w-fit">
          <div className="rounded-full love-gradient p-1 shadow-glow">
            <Avatar name={nickname} src={couple?.partner?.avatarUrl} id={couple?.partner?._id ?? user?._id} size={84} />
          </div>
          <span className="absolute bottom-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-white">
            <span className="h-3 w-3 animate-pulse rounded-full bg-emerald-400" />
          </span>
        </div>
        <h2 key={nickname} className="animate-pop-in font-script text-3xl text-princess-pink">{nickname}</h2>
        <p className="mt-1 text-sm text-emerald-500">● online · thinking of you</p>
        {days !== null && (
          <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
            Together for <b className="love-text text-lg">{days}</b> beautiful days 💕
          </p>
        )}
      </div>

      {/* Feature grid */}
      <div className="grid grid-cols-2 gap-3">
        {TILES.map((t) => (
          <button
            key={t.to + t.title}
            onClick={() => navigate(t.to)}
            className="glass-card group flex flex-col items-start gap-1 p-4 text-left transition hover:-translate-y-1"
          >
            <span className="grid h-12 w-12 place-items-center rounded-2xl love-gradient text-2xl shadow-glow transition group-hover:scale-110">
              {t.emoji}
            </span>
            <span className="mt-1 text-sm font-semibold text-slate-700 dark:text-slate-100">{t.title}</span>
            <span className="text-[11px] text-slate-400">{t.desc}</span>
          </button>
        ))}
      </div>
    </LoveLayout>
  );
}
