import { api } from '@/lib/api';

export interface CoupleView {
  id: string;
  inviteCode: string;
  linked: boolean;
  chatId: string | null;
  partnerNickname: string;
  partner: { _id: string; displayName: string; username: string; avatarUrl?: string } | null;
}

export const coupleService = {
  async get() {
    const { data } = await api.get<{ data: { couple: CoupleView } }>('/couple');
    return data.data.couple;
  },
  async join(inviteCode: string) {
    const { data } = await api.post<{ data: { couple: CoupleView } }>('/couple/join', { inviteCode });
    return data.data.couple;
  },
  async verifyCode(inviteCode: string) {
    const { data } = await api.post<{ data: { valid: boolean } }>('/couple/verify-code', { inviteCode });
    return data.data.valid;
  },
  async setNickname(nickname: string) {
    const { data } = await api.patch<{ data: { couple: CoupleView } }>('/couple/nickname', { nickname });
    return data.data.couple;
  },
};
