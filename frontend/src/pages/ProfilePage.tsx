import { useState, useEffect } from 'react';
import PageLayout from '../components/PageLayout';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { api } from '../services/api';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const { addToast } = useToast();

  // Profile form
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [profileSaving, setProfileSaving] = useState(false);

  // Password form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);

  // 2FA
  const [qrCode, setQrCode] = useState('');
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [setting2FA, setSetting2FA] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(user?.twoFactorEnabled || false);

  // Activity logs
  const [logs, setLogs] = useState<any[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);

  useEffect(() => {
    fetchProfile();
    fetchLogs();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get('/auth/profile');
      const u = res.data.user;
      setName(u.name);
      setEmail(u.email);
      setTwoFactorEnabled(u.twoFactorEnabled || false);
    } catch {
      // use local state
    }
  };

  const fetchLogs = async () => {
    setLogsLoading(true);
    try {
      const res = await api.get('/activity-logs?limit=10');
      setLogs(res.data.data || []);
    } catch {
      // ignore
    } finally {
      setLogsLoading(false);
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaving(true);
    try {
      const res = await api.put('/auth/profile', { name, email });
      updateUser(res.data.user);
      addToast('Profile updated successfully', 'success');
    } catch (err: any) {
      addToast(err.response?.data?.error || 'Failed to update profile', 'error');
    } finally {
      setProfileSaving(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmNewPassword) {
      addToast('Passwords do not match', 'error');
      return;
    }
    setPasswordSaving(true);
    try {
      await api.put('/auth/password', { currentPassword, newPassword });
      addToast('Password changed successfully', 'success');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (err: any) {
      addToast(err.response?.data?.error || 'Failed to change password', 'error');
    } finally {
      setPasswordSaving(false);
    }
  };

  const handleSetup2FA = async () => {
    setSetting2FA(true);
    try {
      const res = await api.post('/auth/2fa/setup', {});
      setQrCode(res.data.qrCode);
    } catch (err: any) {
      addToast(err.response?.data?.error || 'Failed to setup 2FA', 'error');
      setSetting2FA(false);
    }
  };

  const handleVerify2FA = async () => {
    try {
      await api.post('/auth/2fa/verify', { code: twoFactorCode });
      setTwoFactorEnabled(true);
      setQrCode('');
      setTwoFactorCode('');
      setSetting2FA(false);
      addToast('2FA enabled successfully', 'success');
    } catch (err: any) {
      addToast(err.response?.data?.error || 'Invalid code', 'error');
    }
  };

  const handleDisable2FA = async () => {
    try {
      await api.post('/auth/2fa/disable', {});
      setTwoFactorEnabled(false);
      addToast('2FA disabled', 'info');
    } catch (err: any) {
      addToast(err.response?.data?.error || 'Failed to disable 2FA', 'error');
    }
  };

  return (
    <PageLayout title="Profile" subtitle="Manage your account settings" icon="">
      <div className="max-w-2xl space-y-6">
        {/* Profile Info */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6" style={{ boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.04)' }}>
          <h3 className="text-base font-semibold text-gray-900 mb-4">Profile Information</h3>
          <form onSubmit={handleProfileUpdate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="input-field" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input-field" required />
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Role</span>
              <span className="px-2.5 py-1 text-xs font-medium bg-primary-50 text-primary-700 rounded-lg">{user?.role || 'user'}</span>
            </div>
            <div className="flex justify-end">
              <button type="submit" disabled={profileSaving} className="btn-primary text-sm">
                {profileSaving ? 'Saving...' : 'Save changes'}
              </button>
            </div>
          </form>
        </div>

        {/* Change Password */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6" style={{ boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.04)' }}>
          <h3 className="text-base font-semibold text-gray-900 mb-4">Change Password</h3>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Current password</label>
              <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="input-field" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">New password</label>
              <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="input-field" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm new password</label>
              <input type="password" value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} className="input-field" required />
            </div>
            <div className="flex justify-end">
              <button type="submit" disabled={passwordSaving} className="btn-primary text-sm">
                {passwordSaving ? 'Changing...' : 'Change password'}
              </button>
            </div>
          </form>
        </div>

        {/* 2FA */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6" style={{ boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.04)' }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-gray-900">Two-Factor Authentication</h3>
            {twoFactorEnabled && (
              <span className="px-2.5 py-1 text-xs font-medium bg-emerald-50 text-emerald-700 rounded-lg">Enabled</span>
            )}
          </div>

          {twoFactorEnabled ? (
            <div>
              <p className="text-sm text-gray-500 mb-4">2FA is currently enabled on your account.</p>
              <button onClick={handleDisable2FA} className="text-sm text-red-500 hover:text-red-700 font-medium">
                Disable 2FA
              </button>
            </div>
          ) : qrCode ? (
            <div className="space-y-4">
              <p className="text-sm text-gray-500">Scan this QR code with your authenticator app:</p>
              <div className="flex justify-center">
                <img src={qrCode} alt="2FA QR Code" className="rounded-xl border border-gray-200" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Verification code</label>
                <input type="text" value={twoFactorCode} onChange={(e) => setTwoFactorCode(e.target.value)} className="input-field" placeholder="Enter 6-digit code" maxLength={6} />
              </div>
              <div className="flex gap-3">
                <button onClick={() => { setQrCode(''); setSetting2FA(false); }} className="btn-secondary text-sm">Cancel</button>
                <button onClick={handleVerify2FA} disabled={twoFactorCode.length !== 6} className="btn-primary text-sm">Verify & Enable</button>
              </div>
            </div>
          ) : (
            <div>
              <p className="text-sm text-gray-500 mb-4">Add an extra layer of security to your account.</p>
              <button onClick={handleSetup2FA} disabled={setting2FA} className="btn-primary text-sm">
                {setting2FA ? 'Setting up...' : 'Set up 2FA'}
              </button>
            </div>
          )}
        </div>

        {/* Activity Log */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6" style={{ boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.04)' }}>
          <h3 className="text-base font-semibold text-gray-900 mb-4">Recent Activity</h3>
          {logsLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gray-100" />
                  <div className="flex-1">
                    <div className="h-3 w-1/2 bg-gray-100 rounded mb-1" />
                    <div className="h-2 w-1/3 bg-gray-100 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : logs.length === 0 ? (
            <p className="text-sm text-gray-400">No activity recorded yet.</p>
          ) : (
            <div className="space-y-3">
              {logs.map((log: any) => (
                <div key={log.id} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                  <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-xs text-gray-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">{log.action}</span> {log.resource}
                    </p>
                    <p className="text-xs text-gray-400">{new Date(log.createdAt).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
}
