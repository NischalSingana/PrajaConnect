import { useState } from 'react';
import { motion, Variants } from 'framer-motion';
import { useUser, useClerk } from '@clerk/clerk-react';
import { useStore } from '@/context/StoreContext';
import { useTheme } from '@/context/ThemeContext';
import {
  Bell, Shield, Palette, User, Sun, Moon, Monitor,
  Check, ChevronRight, AlertTriangle, Loader2, Eye, EyeOff,
  Volume2, VolumeX, Globe, Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';

const container: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } }
};
const item: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 26 } }
};

type Tab = 'account' | 'notifications' | 'appearance' | 'privacy';

interface ToggleProps {
  value: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}
function Toggle({ value, onChange, disabled }: ToggleProps) {
  return (
    <button
      onClick={() => !disabled && onChange(!value)}
      disabled={disabled}
      className={cn(
        'relative h-6 w-11 rounded-full border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20',
        value ? 'bg-indigo-600 border-indigo-500' : 'bg-white/[0.04] border-white/[0.08]',
        disabled && 'opacity-40 cursor-not-allowed'
      )}
    >
      <span className={cn(
        'absolute top-0.5 left-0.5 h-5 w-5 rounded-full transition-all duration-200',
        value ? 'translate-x-5 bg-white shadow-lg' : 'translate-x-0 bg-zinc-500'
      )} />
    </button>
  );
}

interface SettingRowProps {
  icon?: React.ReactNode;
  label: string;
  description?: string;
  right: React.ReactNode;
  danger?: boolean;
}
function SettingRow({ icon, label, description, right, danger }: SettingRowProps) {
  return (
    <div className={cn(
      'flex items-center justify-between gap-6 p-5 rounded-2xl border transition-all',
      danger ? 'border-red-500/10 bg-red-500/[0.02] hover:bg-red-500/[0.04]' : 'border-white/[0.04] bg-white/[0.01] hover:bg-white/[0.02]'
    )}>
      <div className="flex items-start gap-3 flex-1 min-w-0">
        {icon && (
          <div className={cn('shrink-0 mt-0.5 p-2 rounded-xl', danger ? 'bg-red-500/10 text-red-400' : 'bg-white/[0.03] text-zinc-500')}>
            {icon}
          </div>
        )}
        <div>
          <p className={cn('text-sm font-black', danger ? 'text-red-400' : 'text-white')}>{label}</p>
          {description && <p className="text-[11px] text-zinc-600 font-medium mt-0.5 leading-relaxed">{description}</p>}
        </div>
      </div>
      <div className="shrink-0">{right}</div>
    </div>
  );
}

export function SettingsPage() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const { theme, toggleTheme } = useTheme();
  const { user: storeUser } = useStore();

  const [tab, setTab] = useState<Tab>('account');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Notification prefs (localStorage)
  const [notifs, setNotifs] = useState(() => {
    const stored = localStorage.getItem('prajaconnect-notifs');
    return stored ? JSON.parse(stored) : {
      slaWarnings: true,
      statusChanges: true,
      upvotes: false,
      petitionMilestones: true,
      emailDigest: false,
      soundEnabled: false,
    };
  });

  // Privacy prefs
  const [privacy, setPrivacy] = useState(() => {
    const stored = localStorage.getItem('prajaconnect-privacy');
    return stored ? JSON.parse(stored) : {
      publicProfile: true,
      showLocation: true,
      anonymousReports: false,
      dataAnalytics: true,
    };
  });

  const updateNotif = (key: string, val: boolean) => {
    const updated = { ...notifs, [key]: val };
    setNotifs(updated);
    localStorage.setItem('prajaconnect-notifs', JSON.stringify(updated));
  };

  const updatePrivacy = (key: string, val: boolean) => {
    const updated = { ...privacy, [key]: val };
    setPrivacy(updated);
    localStorage.setItem('prajaconnect-privacy', JSON.stringify(updated));
  };

  const handleSave = async () => {
    setSaving(true);
    await new Promise(res => setTimeout(res, 600));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'account',       label: 'Account',       icon: <User className="h-3.5 w-3.5" /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell className="h-3.5 w-3.5" /> },
    { id: 'appearance',    label: 'Appearance',    icon: <Palette className="h-3.5 w-3.5" /> },
    { id: 'privacy',       label: 'Privacy',       icon: <Shield className="h-3.5 w-3.5" /> },
  ];

  const role = (user?.publicMetadata?.role as string) || 'citizen';

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={container}
      className="max-w-3xl mx-auto px-4 sm:px-6 py-10 pb-32 space-y-8"
    >
      {/* Header */}
      <motion.div variants={item} className="space-y-2">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-indigo-500/20 bg-indigo-500/5 text-indigo-400 text-[10px] font-black uppercase tracking-[0.2em]">
          <Zap className="h-3 w-3" /> Settings
        </div>
        <h1 className="text-3xl font-black text-white tracking-tight">Preferences</h1>
        <p className="text-zinc-500 font-medium">Manage your account, notifications, and privacy settings.</p>
      </motion.div>

      {/* Tab Nav */}
      <motion.div variants={item} className="flex gap-1 p-1 rounded-2xl border border-white/[0.05] bg-zinc-900/20 w-fit flex-wrap">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              'flex items-center gap-2 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all',
              tab === t.id ? 'bg-white text-black' : 'text-zinc-500 hover:text-white'
            )}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </motion.div>

      {/* ── Account Tab ── */}
      {tab === 'account' && (
        <motion.div variants={container} initial="hidden" animate="show" className="space-y-4">
          <motion.div variants={item} className="p-6 rounded-[2rem] border border-white/[0.05] bg-zinc-900/10 space-y-6">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Profile Information</h3>

            <div className="flex items-center gap-4">
              <img
                src={user?.imageUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${user?.fullName}`}
                alt=""
                className="h-16 w-16 rounded-2xl object-cover ring-4 ring-white/5"
              />
              <div>
                <p className="text-lg font-black text-white">{user?.fullName || '—'}</p>
                <p className="text-sm text-zinc-500">{user?.primaryEmailAddress?.emailAddress}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="px-2 py-0.5 rounded-md border text-[9px] font-black uppercase tracking-widest border-indigo-500/20 bg-indigo-500/5 text-indigo-400 capitalize">
                    {role}
                  </span>
                  {storeUser?.reputationScore !== undefined && (
                    <span className="px-2 py-0.5 rounded-md border text-[9px] font-black uppercase tracking-widest border-yellow-500/20 bg-yellow-500/5 text-yellow-400">
                      {storeUser.reputationScore} pts
                    </span>
                  )}
                </div>
              </div>
            </div>

            <p className="text-xs text-zinc-600 bg-white/[0.02] border border-white/[0.04] rounded-xl p-4 leading-relaxed">
              Profile details are managed through Clerk. Click the user button in the top-right header to update your name, email, or profile photo.
            </p>
          </motion.div>

          {/* Danger zone */}
          <motion.div variants={item} className="p-6 rounded-[2rem] border border-red-500/10 bg-red-500/[0.02] space-y-4">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-red-500">Danger Zone</h3>
            <SettingRow
              label="Sign Out of All Devices"
              description="Revoke all active sessions. You will need to sign in again."
              danger
              right={
                <button
                  onClick={() => signOut()}
                  className="px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all"
                >
                  Sign Out
                </button>
              }
            />
            {!showDeleteConfirm ? (
              <SettingRow
                label="Delete Account"
                description="Permanently delete your account and all associated data. This is irreversible."
                danger
                right={
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all"
                  >
                    Delete
                  </button>
                }
              />
            ) : (
              <div className="p-5 rounded-2xl border border-red-500/20 bg-red-500/5 space-y-3">
                <div className="flex items-center gap-2 text-red-400">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="text-[11px] font-black uppercase tracking-widest">Are you absolutely sure?</span>
                </div>
                <p className="text-xs text-zinc-500">This will permanently delete your account, issues, and all data. Contact support for account deletion requests.</p>
                <div className="flex gap-2">
                  <a
                    href="mailto:support@prajaconnect.in?subject=Account Deletion Request"
                    className="px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all"
                  >
                    Contact Support
                  </a>
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border border-white/[0.05] text-zinc-500 hover:text-white transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}

      {/* ── Notifications Tab ── */}
      {tab === 'notifications' && (
        <motion.div variants={container} initial="hidden" animate="show" className="space-y-4">
          <motion.div variants={item} className="p-6 rounded-[2rem] border border-white/[0.05] bg-zinc-900/10 space-y-3">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 flex items-center gap-2">
              <Bell className="h-3.5 w-3.5" /> In-App Notifications
            </h3>
            {[
              { key: 'slaWarnings',       label: 'SLA Warning Alerts',     desc: 'Get notified when an issue is approaching its SLA deadline',   icon: <AlertTriangle className="h-3.5 w-3.5" /> },
              { key: 'statusChanges',     label: 'Status Change Updates',  desc: 'Notified when your issue status changes',                       icon: <ChevronRight className="h-3.5 w-3.5" /> },
              { key: 'upvotes',           label: 'Upvote Milestones',       desc: 'Celebrate when your issues reach upvote milestones',            icon: <Globe className="h-3.5 w-3.5" /> },
              { key: 'petitionMilestones',label: 'Petition Milestones',     desc: 'Updates when a petition you signed reaches its goals',          icon: <Check className="h-3.5 w-3.5" /> },
            ].map(s => (
              <SettingRow
                key={s.key}
                icon={s.icon}
                label={s.label}
                description={s.desc}
                right={<Toggle value={notifs[s.key]} onChange={v => updateNotif(s.key, v)} />}
              />
            ))}
          </motion.div>

          <motion.div variants={item} className="p-6 rounded-[2rem] border border-white/[0.05] bg-zinc-900/10 space-y-3">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 flex items-center gap-2">
              <Volume2 className="h-3.5 w-3.5" /> Sound & Email
            </h3>
            {[
              { key: 'soundEnabled', label: 'Sound Notifications',  desc: 'Play a sound when a new notification arrives', icon: notifs.soundEnabled ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" /> },
              { key: 'emailDigest',  label: 'Weekly Email Digest',  desc: 'Receive a weekly summary of your issue activity',  icon: <Globe className="h-3.5 w-3.5" /> },
            ].map(s => (
              <SettingRow
                key={s.key}
                icon={s.icon}
                label={s.label}
                description={s.desc}
                right={<Toggle value={notifs[s.key]} onChange={v => updateNotif(s.key, v)} />}
              />
            ))}
          </motion.div>
        </motion.div>
      )}

      {/* ── Appearance Tab ── */}
      {tab === 'appearance' && (
        <motion.div variants={container} initial="hidden" animate="show" className="space-y-4">
          <motion.div variants={item} className="p-6 rounded-[2rem] border border-white/[0.05] bg-zinc-900/10 space-y-6">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 flex items-center gap-2">
              <Palette className="h-3.5 w-3.5" /> Theme
            </h3>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'dark',   label: 'Dark',   icon: <Moon className="h-5 w-5" />,    active: theme === 'dark' },
                { id: 'light',  label: 'Light',  icon: <Sun className="h-5 w-5" />,     active: theme === 'light' },
                { id: 'system', label: 'System', icon: <Monitor className="h-5 w-5" />, active: false },
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => {
                    if (t.id === 'dark' && theme !== 'dark') toggleTheme();
                    if (t.id === 'light' && theme !== 'light') toggleTheme();
                  }}
                  className={cn(
                    'flex flex-col items-center gap-3 p-5 rounded-2xl border transition-all hover:scale-105 active:scale-95',
                    t.active
                      ? 'border-indigo-500/30 bg-indigo-500/10 text-indigo-400'
                      : 'border-white/[0.05] bg-white/[0.01] text-zinc-500 hover:text-white hover:border-white/10'
                  )}
                >
                  {t.icon}
                  <span className="text-[9px] font-black uppercase tracking-widest">{t.label}</span>
                  {t.active && <Check className="h-3 w-3" />}
                </button>
              ))}
            </div>
            <p className="text-xs text-zinc-600 bg-white/[0.01] border border-white/[0.04] rounded-xl p-4">
              The interface defaults to a pure dark theme optimised for long reading sessions. Light mode applies lighter backgrounds across the dashboard.
            </p>
          </motion.div>

          <motion.div variants={item} className="p-6 rounded-[2rem] border border-white/[0.05] bg-zinc-900/10 space-y-4">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Language & Region</h3>
            <SettingRow
              icon={<Globe className="h-3.5 w-3.5" />}
              label="Language"
              description="Interface language preference"
              right={<span className="px-3 py-1.5 rounded-xl border border-white/[0.05] text-[10px] font-black uppercase tracking-widest text-zinc-500">English (India)</span>}
            />
            <SettingRow
              icon={<Globe className="h-3.5 w-3.5" />}
              label="Date Format"
              description="How dates are displayed across the platform"
              right={<span className="px-3 py-1.5 rounded-xl border border-white/[0.05] text-[10px] font-black uppercase tracking-widest text-zinc-500">DD/MM/YYYY</span>}
            />
          </motion.div>
        </motion.div>
      )}

      {/* ── Privacy Tab ── */}
      {tab === 'privacy' && (
        <motion.div variants={container} initial="hidden" animate="show" className="space-y-4">
          <motion.div variants={item} className="p-6 rounded-[2rem] border border-white/[0.05] bg-zinc-900/10 space-y-3">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 flex items-center gap-2">
              <Eye className="h-3.5 w-3.5" /> Visibility
            </h3>
            {[
              { key: 'publicProfile',   label: 'Public Profile',      desc: 'Allow others to see your civic contributions on the leaderboard',  icon: <Eye className="h-3.5 w-3.5" /> },
              { key: 'showLocation',    label: 'Show Location',       desc: 'Display your general area on issue reports',                        icon: <Globe className="h-3.5 w-3.5" /> },
              { key: 'anonymousReports',label: 'Anonymous Reports',   desc: 'Hide your name on public issue reports (uses your display ID)',     icon: <EyeOff className="h-3.5 w-3.5" /> },
            ].map(s => (
              <SettingRow
                key={s.key}
                icon={s.icon}
                label={s.label}
                description={s.desc}
                right={<Toggle value={privacy[s.key]} onChange={v => updatePrivacy(s.key, v)} />}
              />
            ))}
          </motion.div>

          <motion.div variants={item} className="p-6 rounded-[2rem] border border-white/[0.05] bg-zinc-900/10 space-y-3">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 flex items-center gap-2">
              <Shield className="h-3.5 w-3.5" /> Data & Analytics
            </h3>
            <SettingRow
              icon={<Globe className="h-3.5 w-3.5" />}
              label="Usage Analytics"
              description="Help us improve PrajaConnect by sharing anonymized usage data"
              right={<Toggle value={privacy.dataAnalytics} onChange={v => updatePrivacy('dataAnalytics', v)} />}
            />
          </motion.div>

          <motion.div variants={item} className="p-5 rounded-2xl border border-indigo-500/10 bg-indigo-500/[0.02] flex items-start gap-3">
            <Shield className="h-4 w-4 text-indigo-400 shrink-0 mt-0.5" />
            <p className="text-xs text-zinc-500 leading-relaxed">
              Your data is protected under India's data protection laws. Read our{' '}
              <a href="/privacy" className="text-indigo-400 hover:underline font-bold">Privacy Policy</a> for full details.
            </p>
          </motion.div>
        </motion.div>
      )}

      {/* Save Button */}
      {(tab === 'notifications' || tab === 'privacy') && (
        <motion.div variants={item} className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving || saved}
            className={cn(
              'flex items-center gap-2 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all',
              saved
                ? 'bg-emerald-600/20 border border-emerald-500/30 text-emerald-400'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20 hover:scale-105 active:scale-95'
            )}
          >
            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : saved ? <Check className="h-3.5 w-3.5" /> : <Check className="h-3.5 w-3.5" />}
            {saved ? 'Saved!' : saving ? 'Saving…' : 'Save Preferences'}
          </button>
        </motion.div>
      )}
    </motion.div>
  );
}
