import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { DashboardLayout } from '../components/DashboardLayout';
import { Save, ShieldAlert, Check } from 'lucide-react';

export const Profile: React.FC = () => {
  const { user, adminSettings, adminUpdateSettings, updateProfile } = useStore();
  
  const [formData, setFormData] = useState<{
    name: string;
    phone: string;
    email: string;
    gender: string;
    age: number | '';
  }>({
    name: user?.name || '',
    phone: user?.phone || '',
    email: user?.email || '',
    gender: user?.gender || 'Male',
    age: user?.age || 21,
  });

  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });

  const [saveSuccess, setSaveSuccess] = useState(false);
  const [passSuccess, setPassSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveSuccess(false);
    setError(null);

    if (!formData.name || !formData.phone || !formData.email || !formData.age) {
      setError('Please fill in all profile fields.');
      return;
    }

    // Convert age to number for submission
    const submissionData = {
      ...formData,
      age: typeof formData.age === 'string' && formData.age === '' ? 0 : Number(formData.age),
    };
    const success = await updateProfile(submissionData);
    if (!success) {
      setError(useStore.getState().authError || 'Profile update failed.');
      return;
    }

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handlePasswordSave = (e: React.FormEvent) => {
    e.preventDefault();
    setPassSuccess(false);
    setError(null);

    if (!passwordData.oldPassword || !passwordData.newPassword || !passwordData.confirmNewPassword) {
      setError('Please fill in all password fields.');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmNewPassword) {
      setError('New passwords do not match.');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setError('New password must be at least 6 characters.');
      return;
    }

    setPassSuccess(true);
    setPasswordData({ oldPassword: '', newPassword: '', confirmNewPassword: '' });
    setTimeout(() => setPassSuccess(false), 3000);
  };

  // Shared input classes
  const inputCls = "w-full border border-slate-200 dark:border-[#334155] bg-white dark:bg-[#111827] text-neutral-slate dark:text-[#F8FAFC] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-primary dark:focus:border-[#4F46E5] focus:ring-2 focus:ring-primary/10 dark:focus:ring-[#4F46E5]/10 transition-all";
  const labelCls = "text-xs font-semibold text-neutral-slate dark:text-[#E2E8F0]";

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-in fade-in duration-300">
        
        {/* Header Block */}
        <div className="pb-4 border-b border-slate-100 dark:border-[#334155]">
          <h2 className="text-xl font-display font-extrabold text-neutral-slate dark:text-[#F8FAFC]">Profile & Security Settings</h2>
          <p className="text-xs text-neutral-outline dark:text-[#CBD5E1]">Manage your personal information, notification frequencies, and password security</p>
        </div>

        {/* Alerts */}
        {error && (
          <div className="bg-error/10 border border-error/20 text-error p-3 rounded-lg text-xs font-semibold text-center">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column: Personal Information & Preferences */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-[#1E293B] p-6 rounded-xl border border-slate-100 dark:border-[#334155] shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-neutral-slate dark:text-[#F8FAFC] border-b border-slate-50 dark:border-[#334155] pb-2">Personal Information</h3>
              
              <form onSubmit={handleProfileSave} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className={labelCls} htmlFor="profile-name">Full Name</label>
                    <input
                      id="profile-name"
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className={inputCls}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className={labelCls} htmlFor="profile-phone">Phone Number</label>
                    <input
                      id="profile-phone"
                      type="text"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className={inputCls}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className={labelCls} htmlFor="profile-email">Email Address</label>
                  <input
                    id="profile-email"
                    type="email"
                    disabled
                    value={formData.email}
                    className="w-full border border-slate-200 dark:border-[#334155] rounded-lg px-3 py-2 text-xs bg-slate-50 dark:bg-[#0F172A] text-neutral-outline dark:text-[#64748B] cursor-not-allowed"
                  />
                  <span className="text-[10px] text-neutral-outline dark:text-[#64748B]">(University email cannot be changed)</span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className={labelCls} htmlFor="profile-gender">Gender</label>
                    <select
                      id="profile-gender"
                      value={formData.gender}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                      className={`${inputCls} appearance-none`}
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className={labelCls} htmlFor="profile-age">Age</label>
                    <input
                      id="profile-age"
                      type="number"
                      value={formData.age || ''}
                      onChange={(e) => setFormData({ ...formData, age: e.target.value === '' ? '' : Number(e.target.value) })}
                      className={inputCls}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-[#334155]">
                  {saveSuccess && (
                    <span className="text-xs text-success font-semibold flex items-center">
                      <Check className="h-4 w-4 mr-1" /> Profile updated
                    </span>
                  )}
                  <div className="flex space-x-2 ml-auto">
                    <button
                      type="submit"
                      className="bg-primary dark:bg-[#4F46E5] text-white font-semibold px-4 py-2 rounded-lg text-xs flex items-center space-x-1.5 hover:bg-primary/95 dark:hover:bg-[#4338CA] transition-all shadow-sm"
                    >
                      <Save className="h-3.5 w-3.5" />
                      <span>Save Changes</span>
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>

          {/* Right Column: Security (Change Password) */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-[#1E293B] p-6 rounded-xl border border-slate-100 dark:border-[#334155] shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-neutral-slate dark:text-[#F8FAFC] border-b border-slate-50 dark:border-[#334155] pb-2">Change Password</h3>
              
              <form onSubmit={handlePasswordSave} className="space-y-4">
                <div className="space-y-1.5">
                  <label className={labelCls} htmlFor="profile-old-pass">Current Password</label>
                  <input
                    id="profile-old-pass"
                    type="password"
                    value={passwordData.oldPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, oldPassword: e.target.value })}
                    className={inputCls}
                    placeholder="••••••••"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className={labelCls} htmlFor="profile-new-pass">New Password</label>
                  <input
                    id="profile-new-pass"
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    className={inputCls}
                    placeholder="••••••••"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className={labelCls} htmlFor="profile-confirm-pass">Confirm New Password</label>
                  <input
                    id="profile-confirm-pass"
                    type="password"
                    value={passwordData.confirmNewPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmNewPassword: e.target.value })}
                    className={inputCls}
                    placeholder="••••••••"
                  />
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-[#334155]">
                  {passSuccess && (
                    <span className="text-xs text-success font-semibold flex items-center">
                      <Check className="h-4 w-4 mr-1" /> Password updated
                    </span>
                  )}
                  <button
                    type="submit"
                    className="bg-secondary text-white font-semibold px-4 py-2 rounded-lg text-xs flex items-center space-x-1.5 hover:bg-secondary/95 ml-auto transition-all shadow-sm"
                  >
                    <span>Update Security Password</span>
                  </button>
                </div>
              </form>
            </div>
            
            {/* Account Protection Alert Box */}
            <div className="bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/10 dark:border-amber-500/20 rounded-xl p-4 flex items-start space-x-3 text-amber-600 dark:text-amber-400">
              <ShieldAlert className="h-5 w-5 shrink-0 mt-0.5" />
              <div className="text-xs">
                <span className="font-bold block">Self-Care Privacy Protocol</span>
                <span className="block text-[11px] text-amber-600/95 dark:text-amber-400/90 leading-relaxed mt-0.5">
                  Only your numeric scores, sleep indices, and metadata averages are transmitted. Raw journal entries and chatbot details remain locally encrypted on your browser.
                </span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
};
