import { api } from '@/lib/api';
import type { User } from '@/types';

interface AuthResponse {
  user: User;
  accessToken: string;
}

export const authService = {
  async register(input: { email: string; username: string; displayName: string; password: string }) {
    const { data } = await api.post<{ data: AuthResponse }>('/auth/register', input);
    return data.data;
  },
  async login(identifier: string, password: string) {
    const { data } = await api.post<{ data: AuthResponse }>('/auth/login', { identifier, password });
    return data.data;
  },
  async me() {
    const { data } = await api.get<{ data: { user: User } }>('/auth/me');
    return data.data.user;
  },
  async logout() {
    await api.post('/auth/logout');
  },
  async logoutAll() {
    await api.post('/auth/logout-all');
  },
  async verifyOtp(email: string, otp: string) {
    await api.post('/auth/verify-otp', { email, otp });
  },
  async resendOtp(email: string) {
    await api.post('/auth/resend-otp', { email });
  },
  async forgotPassword(email: string) {
    await api.post('/auth/forgot-password', { email });
  },
  async resetPassword(token: string, password: string) {
    await api.post('/auth/reset-password', { token, password });
  },
  async changePassword(currentPassword: string, newPassword: string) {
    await api.post('/auth/change-password', { currentPassword, newPassword });
  },
};
