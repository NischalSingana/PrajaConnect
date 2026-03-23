import { motion } from 'framer-motion';
import { FileText } from 'lucide-react';

const section = (title: string, content: string) => ({ title, content });

const SECTIONS = [
  section('Acceptance of Terms', 'By accessing or using PrajaConnect, you agree to be bound by these Terms of Service. If you do not agree, please do not use the platform.'),
  section('Use of the Platform', 'PrajaConnect is a civic engagement platform for reporting and tracking public issues. You agree to use the platform only for lawful purposes and in a manner that does not infringe the rights of others.'),
  section('User Accounts', 'You are responsible for maintaining the confidentiality of your account credentials. You must provide accurate information during registration and keep your account details up to date.'),
  section('Prohibited Content', 'You must not post content that is false, defamatory, harassing, obscene, or that infringes any third-party intellectual property rights. PrajaConnect reserves the right to remove any content that violates these terms.'),
  section('Issue Reporting', 'All issues reported must be genuine civic concerns. Submitting false, misleading, or frivolous reports may result in account suspension. PrajaConnect does not guarantee resolution of any reported issue.'),
  section('Petitions', 'Petitions created on PrajaConnect are civic expressions of public opinion. They do not constitute legally binding obligations on any government body unless explicitly acknowledged by the relevant authority.'),
  section('Intellectual Property', 'All content, trademarks, and other intellectual property on this platform belong to PrajaConnect or its licensors. You may not reproduce or distribute platform content without prior written permission.'),
  section('Limitation of Liability', 'PrajaConnect is provided "as is" without warranties of any kind. We are not liable for any indirect, incidental, or consequential damages arising from your use of the platform.'),
  section('Modifications', 'We reserve the right to modify these terms at any time. Continued use of the platform after changes constitutes acceptance of the revised terms.'),
  section('Governing Law', 'These terms are governed by the laws of India. Any disputes shall be subject to the jurisdiction of the courts in Hyderabad, Telangana.'),
];

export function TermsPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 sm:py-24 space-y-12">

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/[0.03] text-zinc-400 text-[10px] font-black uppercase tracking-[0.2em]">
            <FileText className="h-3 w-3" /> Legal
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight">Terms of Service</h1>
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
          transition={{ delay: 0.6 }}
          className="text-center text-[10px] font-black uppercase tracking-widest text-zinc-700"
        >
          Questions? Contact us at legal@prajaconnect.in
        </motion.p>
      </div>
    </div>
  );
}
