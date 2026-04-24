import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, Clock } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

/**
 * Full-screen modal shown when the user's session (refresh token) has expired.
 * Blocks all interaction until the user clicks "Sign in again".
 */
export default function SessionExpiredModal() {
  const { sessionExpired, dismissSessionExpired } = useAuthStore();
  const navigate = useNavigate();

  // Prevent body scroll while modal is open
  useEffect(() => {
    if (sessionExpired) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [sessionExpired]);

  if (!sessionExpired) return null;

  const handleSignIn = () => {
    dismissSessionExpired();
    navigate('/login');
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="session-expired-title"
    >
      {/* Blurred backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Modal card */}
      <div className="relative w-full max-w-sm bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        {/* Top accent bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-amber-400 via-orange-500 to-red-500" />

        <div className="p-8 text-center">
          {/* Icon */}
          <div className="mx-auto mb-5 w-16 h-16 rounded-full bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center">
            <Clock className="w-8 h-8 text-amber-500" />
          </div>

          {/* Heading */}
          <h2
            id="session-expired-title"
            className="text-xl font-bold text-gray-900 dark:text-white mb-2"
          >
            Session Expired
          </h2>

          {/* Body */}
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 leading-relaxed">
            Your session has timed out for security reasons. Please sign in again to continue
            where you left off.
          </p>

          {/* CTA */}
          <button
            onClick={handleSignIn}
            className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-white text-sm font-semibold rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            autoFocus
          >
            <LogIn className="w-4 h-4" />
            Sign in again
          </button>
        </div>
      </div>
    </div>
  );
}
