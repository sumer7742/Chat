import { Navigate, Route, Routes } from 'react-router-dom';
import { useSessionBootstrap } from '@/hooks/useSessionBootstrap';
import { useAuthStore } from '@/store/authStore';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Spinner } from '@/components/ui/Spinner';
import WelcomePage from '@/pages/WelcomePage';
import InvitePage from '@/pages/InvitePage';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import CoupleInvitePage from '@/pages/CoupleInvitePage';
import VerifyOtpPage from '@/pages/VerifyOtpPage';
import ForgotPasswordPage from '@/pages/ForgotPasswordPage';
import ResetPasswordPage from '@/pages/ResetPasswordPage';
import ChatPage from '@/pages/ChatPage';
import SettingsPage from '@/pages/SettingsPage';
import LoveHomePage from '@/pages/LoveHomePage';
import LoveDashboardPage from '@/pages/LoveDashboardPage';
import LoveLettersPage from '@/pages/LoveLettersPage';
import SurprisesPage from '@/pages/SurprisesPage';
import MemoriesPage from '@/pages/MemoriesPage';
import WishlistPage from '@/pages/WishlistPage';
import CoupleCalendarPage from '@/pages/CoupleCalendarPage';
import LoveSettingsPage from '@/pages/LoveSettingsPage';
import { SplashScreen } from '@/components/love/SplashScreen';

export default function App() {
  useSessionBootstrap();
  const status = useAuthStore((s) => s.status);

  if (status === 'idle' || status === 'loading') {
    return (
      <div className="flex h-full items-center justify-center">
        <Spinner size={32} />
      </div>
    );
  }

  return (
    <>
      <SplashScreen />
      <Routes>
      <Route path="/welcome" element={<WelcomePage />} />
      <Route path="/invite/:code" element={<InvitePage />} />
      <Route path="/signin" element={<LoginPage />} />
      <Route path="/login" element={<Navigate to="/welcome" replace />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/verify-otp" element={<VerifyOtpPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<ChatPage />} />
        <Route path="/chat/:chatId" element={<ChatPage />} />
        <Route path="/couple" element={<CoupleInvitePage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/love" element={<LoveHomePage />} />
        <Route path="/love/dashboard" element={<LoveDashboardPage />} />
        <Route path="/love/memories" element={<MemoriesPage />} />
        <Route path="/love/letters" element={<LoveLettersPage />} />
        <Route path="/love/surprises" element={<SurprisesPage />} />
        <Route path="/love/wishlist" element={<WishlistPage />} />
        <Route path="/love/calendar" element={<CoupleCalendarPage />} />
        <Route path="/love/settings" element={<LoveSettingsPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
