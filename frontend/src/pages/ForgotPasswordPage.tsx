import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetToken, setResetToken] = useState('');
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/auth/forgot-password', { email });
      setResetToken(response.data.resetToken || '');
      setSent(true);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to send reset link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-8">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-primary-600 flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
            </svg>
          </div>
          <span className="text-xl font-bold text-gray-900">CreatorAI</span>
        </div>

        {!sent ? (
          <>
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Forgot password?</h1>
              <p className="text-gray-500 mt-2">Enter your email and we'll generate a reset token</p>
            </div>

            {error && (
              <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6">
                <span className="text-sm">{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email address</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input-field" placeholder="you@example.com" required />
              </div>
              <button type="submit" disabled={loading} className="w-full btn-primary py-3 text-base">
                {loading ? 'Sending...' : 'Send reset token'}
              </button>
            </form>
          </>
        ) : (
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900">Reset token generated</h2>
            <p className="text-sm text-gray-500">Since this is a demo app, here's your reset token:</p>
            <div className="bg-gray-50 rounded-xl p-3 font-mono text-xs break-all text-gray-700 border border-gray-200">
              {resetToken}
            </div>
            <Link
              to={`/reset-password?token=${resetToken}`}
              className="block w-full btn-primary py-3 text-base text-center"
            >
              Reset password
            </Link>
          </div>
        )}

        <p className="text-center text-sm text-gray-500 mt-6">
          <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">Back to sign in</Link>
        </p>
      </div>
    </div>
  );
}
