import { useState } from 'react';
import { motion } from 'framer-motion';
import { useUser, useClerk } from '@clerk/clerk-react';
import { useLocalStore } from '@/hooks/useLocalStore';
import { Bell, Shield, LogOut, User, Mail, ChevronRight, Loader2, Moon, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ToggleProps {
  enabled: boolean;
  onChange: (v: boolean) => void;
}

function Toggle({ enabled, onChange }: ToggleProps) {
  return (
    <button
      onClick={() => onChange(!enabled)}
      className={cn(
        'relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 focus:outline-none',
        enabled ? 'bg-indigo-600' : 'bg-zinc-700'
      )}
    >
      <span className={cn(
        'inline-block h-4 w-4 transform rounded-full bg-white shadow-lg transition-transform duration-300',
        enabled ? 'translate-x-6' : 'translate-x-1'
      )} />
    </button>
  );
}

export function SettingsPage() {
  const { user: clerkUser } = useUser();
  const { signOut, openUserProfile } = useClerk();
  const { user } = useLocalStore();

  const [notifIssueUpdates, setNotifIssueUpdates] = useState(true);
  const [notifUpvotes, setNotifUpvotes] = useState(true);
  const [notifSlaAlerts, setNotifSlaAlerts] = useState(true);
  const [notifNewsletter, setNotifNewsletter] = useState(false);
  const [signingOut, setSigningOut] = useState(false);


  const handleSignOut = async () => {
    setSigningOut(true);
    await signOut({ redirectUrl: '/' });
  };


  const displayName = user?.name ?? clerkUser?.fullName ?? 'Citizen';
  const displayEmail = clerkUser?.primaryEmailAddress?.emailAddress ?? '—';
  const displayRole = (user?.role ?? clerkUser?.publicMetadata?.role as string ?? 'citizen');

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="space-y-3">
      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600 px-1">{title}</p>
      <div className="rounded-[1.5rem] border border-white/[0.05] bg-zinc-900/20 overflow-hidden divide-y divide-white/[0.04]">
        {children}
      </div>
    </div>
  );

  const Row = ({
    icon,
    label,
    value,
    right,
    danger,
    onClick,
  }: {
    icon: React.ReactNode;
    label: string;
    value?: string;
    right?: React.ReactNode;
    danger?: boolean;
    onClick?: () => void;
  }) => (
    <div
      onClick={onClick}
      className={cn(
        'flex items-center justify-between px-6 py-4 transition-colors',
        onClick ? 'cursor-pointer hover:bg-white/[0.03]' : '',
        danger ? 'hover:bg-red-500/5' : ''
      )}
    >
      <div className="flex items-center gap-4">
        <div className={cn('h-9 w-9 rounded-xl flex items-center justify-center', danger ? 'bg-red-500/10' : 'bg-white/[0.03]')}>
          <span className={danger ? 'text-red-400' : 'text-zinc-400'}>{icon}</span>
        </div>
        <div>
          <p className={cn('text-sm font-bold', danger ? 'text-red-400' : 'text-white')}>{label}</p>
          {value && <p className="text-[11px] text-zinc-500 font-medium mt-0.5">{value}</p>}
        </div>
      </div>
      {right ?? (onClick && !danger && <ChevronRight className="h-4 w-4 text-zinc-600" />)}
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-2xl mx-auto space-y-8 pb-20 pt-4 px-2"
    >
      <div>
        <h1 className="text-3xl font-black text-white tracking-tight">Settings</h1>
        <p className="text-zinc-500 text-sm font-medium mt-1">Manage your account preferences.</p>
      </div>

      {/* Account Info */}
      <Section title="Account">
        <Row icon={<User className="h-4 w-4" />} label="Full Name" value={displayName} />
        <Row icon={<Mail className="h-4 w-4" />} label="Email Address" value={displayEmail} />
        <Row icon={<Shield className="h-4 w-4" />} label="Role" value={displayRole.charAt(0).toUpperCase() + displayRole.slice(1)} />
        <Row
          icon={<Globe className="h-4 w-4" />}
          label="Manage Clerk Account"
          value="Update avatar, password & linked accounts"
          onClick={() => openUserProfile()}
        />
      </Section>

      {/* Notifications */}
      <Section title="Notifications">
        <Row
          icon={<Bell className="h-4 w-4" />}
          label="Issue Status Updates"
          value="Get notified when your reports change status"
          right={<Toggle enabled={notifIssueUpdates} onChange={setNotifIssueUpdates} />}
        />
        <Row
          icon={<Bell className="h-4 w-4" />}
          label="Community Upvotes"
          value="Notify when your issues gain support"
          right={<Toggle enabled={notifUpvotes} onChange={setNotifUpvotes} />}
        />
        <Row
          icon={<Bell className="h-4 w-4" />}
          label="SLA Deadline Alerts"
          value="Warn before resolution deadlines expire"
          right={<Toggle enabled={notifSlaAlerts} onChange={setNotifSlaAlerts} />}
        />
        <Row
          icon={<Moon className="h-4 w-4" />}
          label="Platform Newsletter"
          value="Monthly civic impact updates"
          right={<Toggle enabled={notifNewsletter} onChange={setNotifNewsletter} />}
        />
      </Section>

      {/* Danger Zone */}
      <Section title="Session">
        <Row
          icon={<LogOut className="h-4 w-4" />}
          label="Sign Out"
          value="End your current session"
          danger
          onClick={handleSignOut}
          right={
            signingOut
              ? <Loader2 className="h-4 w-4 animate-spin text-red-400" />
              : <ChevronRight className="h-4 w-4 text-red-400/50" />
          }
        />
      </Section>

      <p className="text-center text-[10px] font-bold text-zinc-700 uppercase tracking-widest">
        PrajaConnect · v0.1.0 · Secure & Encrypted
      </p>
    </motion.div>
  );
}
