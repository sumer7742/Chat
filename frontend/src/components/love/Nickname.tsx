import { usePartnerNickname } from '@/hooks/useCouple';

/**
 * Displays the current user's nickname for their partner, animating whenever it
 * changes (keyed by value → remounts with a soft pop-in). Use inline anywhere.
 */
export function Nickname({ className }: { className?: string }) {
  const nickname = usePartnerNickname();
  return (
    <span key={nickname} className={`inline-block animate-pop-in ${className ?? ''}`}>
      {nickname}
    </span>
  );
}
