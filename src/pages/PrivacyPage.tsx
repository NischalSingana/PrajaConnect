import { motion } from 'framer-motion';
import { Shield } from 'lucide-react';

const section = (title: string, content: string) => ({ title, content });

const SECTIONS = [
  section('Information We Collect', 'We collect information you provide directly (name, email, location) when you register, report issues, or contact us. We also collect usage data such as pages visited and features used, to improve the platform.'),
  section('How We Use Your Information', 'We use your information to operate and improve PrajaConnect, send notifications about your reported issues, personalise your experience, and comply with legal obligations.'),
  section('Issue and Petition Data', 'Issues and petitions you submit are visible to other users and relevant government representatives. Your name and contact details are not shared publicly unless you choose to display them.'),
  section('Location Data', 'If you provide location information for an issue, it is used solely to route the report to the appropriate authority and display it on the platform map. We do not track your real-time location.'),
  section('Data Sharing', 'We do not sell your personal data. We may share data with government bodies for the purpose of resolving civic issues, and with service providers who help us operate the platform under strict confidentiality agreements.'),
  section('Data Retention', 'We retain your account data for as long as your account is active. Issue data may be retained indefinitely for public record purposes. You may request deletion of your personal data at any time.'),
  section('Security', 'We implement industry-standard security measures including encryption in transit (TLS) and at rest. However, no method of electronic transmission is 100% secure, and we cannot guarantee absolute security.'),
  section('Cookies', 'We use cookies to maintain session state and analyse usage patterns. You can control cookie settings through your browser, though some features may not function correctly without them.'),
  section('Children\'s Privacy', 'PrajaConnect is not intended for use by anyone under the age of 13. We do not knowingly collect personal information from children under 13.'),
  section('Your Rights', 'You have the right to access, correct, or delete your personal data. To exercise these rights, contact us at privacy@prajaconnect.in. We will respond within 30 days.'),
  section('Changes to This Policy', 'We may update this Privacy Policy from time to time. We will notify you of significant changes via email or a prominent notice on the platform.'),
];

export function PrivacyPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 sm:py-24 space-y-12">

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/[0.03] text-zinc-400 text-[10px] font-black uppercase tracking-[0.2em]">
            <Shield className="h-3 w-3" /> Privacy
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight">Privacy Policy</h1>
          <p className="text-zinc-500 font-medium">Last updated: March 2026</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="space-y-8"
        >
          {SECTIONS.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 + i * 0.04 }}
              className="p-8 rounded-[2rem] border border-white/[0.04] bg-zinc-900/10 space-y-3"
            >
              <h2 className="text-sm font-black text-white uppercase tracking-widest">
                <span className="text-zinc-700 mr-2">{String(i + 1).padStart(2, '0')}.</span>{s.title}
              </h2>
              <p className="text-zinc-400 text-sm font-medium leading-relaxed">{s.content}</p>
            </motion.div>
          ))}
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="text-center text-[10px] font-black uppercase tracking-widest text-zinc-700"
        >
          Privacy enquiries: privacy@prajaconnect.in
        </motion.p>
      </div>
    </div>
  );
}
