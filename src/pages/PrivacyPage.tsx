import { motion } from 'framer-motion';
import { Lock, Eye, Database, Bell, Globe, Mail, Calendar, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

const SECTIONS = [
  {
    icon: <Database className="h-5 w-5" />,
    color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
    title: '1. Information We Collect',
    content: `We collect information you provide directly to us, information generated through your use of the Platform, and limited technical information.

**Account Information**
When you register, we collect your name, email address, and profile picture via Clerk (our authentication provider). We also store your role (Citizen, Politician, Moderator, or Administrator) and any additional profile information you choose to provide.

**Issue & Activity Data**
When you report an issue, we store the issue title, description, category, location, images you upload, GPS coordinates (if provided), and timestamps. We also store upvotes you cast, petitions you sign, and comments you post.

**Technical Information**
We automatically collect your IP address, browser type, operating system, referring URLs, pages visited, and the date/time of your requests. This data is used solely for security, fraud prevention, and platform improvement.`
  },
  {
    icon: <Eye className="h-5 w-5" />,
    color: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    title: '2. How We Use Your Information',
    content: `We use the information collected to:

• Operate, maintain, and improve the PrajaConnect platform
• Process and display your civic issue reports to the appropriate authorities and the public
• Send you notifications about your reported issues (status changes, official responses, SLA alerts)
• Personalize your experience and show you relevant community issues in your area
• Detect, investigate, and prevent fraudulent transactions and abuse
• Analyze usage patterns to improve platform features and performance
• Comply with legal obligations and enforce our Terms of Service`
  },
  {
    icon: <Globe className="h-5 w-5" />,
    color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    title: '3. Information Sharing & Disclosure',
    content: `We do not sell, trade, or rent your personal information to third parties. We may share your information in the following limited circumstances:

**Public Issue Reports**
Issue reports you file are shared publicly on the Platform by design. Your display name appears on reports. If you wish to file anonymously, please use a pseudonym.

**Government Authorities**
Issue reports may be forwarded to relevant municipal corporations, government departments, or elected officials for resolution purposes. This sharing is core to the platform's mission.

**Service Providers**
We share data with trusted third-party service providers including:
• Clerk (authentication)
• Neon PostgreSQL (database hosting)
• Cloudflare R2 (image storage)
• Groq / Google Gemini (AI-assisted categorization)

All service providers are contractually bound to protect your data.

**Legal Requirements**
We may disclose your information if required by law, court order, or government request.`
  },
  {
    icon: <Lock className="h-5 w-5" />,
    color: 'text-violet-400 bg-violet-500/10 border-violet-500/20',
    title: '4. Data Security',
    content: `We implement industry-standard security measures to protect your personal data:

• All data is transmitted over HTTPS/TLS encryption
• Authentication is handled by Clerk, which uses industry-standard OAuth2 and JWT
• Database access is restricted and monitored
• Images are stored on Cloudflare R2 with private access controls
• We perform regular security reviews

No method of transmission over the Internet or electronic storage is 100% secure. While we strive to protect your data, we cannot guarantee absolute security.`
  },
  {
    icon: <Bell className="h-5 w-5" />,
    color: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    title: '5. Your Rights & Choices',
    content: `You have the following rights over your personal data:

**Access & Portability**
You can access your personal information through your account dashboard at any time.

**Correction**
You can update your profile information via the Settings page or through Clerk's account management.

**Deletion**
You may request deletion of your account by contacting us at privacy@prajaconnect.in. Note that issue reports you've filed may remain in an anonymized form for accountability purposes.

**Notification Preferences**
You can manage your notification preferences in the Settings page to control which alerts you receive.

**Opt-out of Analytics**
You may opt out of non-essential analytics tracking by disabling cookies in your browser settings.`
  },
  {
    icon: <Database className="h-5 w-5" />,
    color: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
    title: '6. Data Retention',
    content: `We retain your personal information for as long as your account is active or as needed to provide services and comply with legal obligations.

• Account data: Retained until account deletion is requested
• Issue reports: Retained indefinitely for civic accountability and historical record purposes (may be anonymized upon account deletion)
• Notification logs: Retained for 12 months
• Technical logs: Retained for 90 days`
  },
  {
    icon: <Globe className="h-5 w-5" />,
    color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
    title: '7. Cookies & Tracking Technologies',
    content: `We use cookies and similar technologies to:

• Maintain your authentication session
• Remember your preferences
• Analyze platform usage through anonymized analytics

You can control cookie settings through your browser. Disabling cookies may affect some platform functionality, including login persistence.

We do not use third-party advertising cookies or cross-site tracking technologies.`
  },
  {
    icon: <Shield className="h-5 w-5" />,
    color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
    title: '8. Children\'s Privacy',
    content: `PrajaConnect is not directed to individuals under the age of 18. We do not knowingly collect personal information from children. If we become aware that a child has provided us with personal information, we will take steps to delete such information.

If you believe a child has submitted information to our Platform, please contact us immediately at privacy@prajaconnect.in.`
  },
  {
    icon: <Bell className="h-5 w-5" />,
    color: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    title: '9. Changes to This Policy',
    content: `We may update this Privacy Policy periodically. We will notify you of significant changes by posting a notice on the Platform or sending an email to your registered address.

We encourage you to review this Policy regularly to stay informed about how we protect your information. Your continued use of the Platform after changes take effect constitutes your acceptance of the updated Policy.`
  },
  {
    icon: <Mail className="h-5 w-5" />,
    color: 'text-zinc-400 bg-zinc-500/10 border-zinc-500/20',
    title: '10. Contact Us',
    content: `For privacy-related questions, data requests, or concerns, please contact our Privacy Team:

Email: privacy@prajaconnect.in
Address: KL University Campus, Vijayawada, Andhra Pradesh, India - 522302

We will respond to your request within 30 days.`
  },
];

export function PrivacyPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 sm:py-24 space-y-16">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
              <Lock className="h-5 w-5 text-indigo-400" />
            </div>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-indigo-500/20 bg-indigo-500/5 text-indigo-400 text-[10px] font-black uppercase tracking-[0.2em]">
              Legal Document
            </div>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight">Privacy Policy</h1>
          <p className="text-zinc-500 font-medium leading-relaxed max-w-xl">
            Your privacy matters to us. This policy explains how PrajaConnect collects, uses, and protects your personal information.
          </p>
          <div className="flex flex-wrap items-center gap-6 text-[10px] font-black uppercase tracking-widest text-zinc-600">
            <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> Last Updated: 1 January 2026</span>
            <span className="flex items-center gap-1.5"><Shield className="h-3.5 w-3.5" /> Data Principal: India</span>
            <span className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" /> privacy@prajaconnect.in</span>
          </div>
        </motion.div>

        {/* Commitment banner */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
          className="p-8 rounded-[2rem] border border-indigo-500/10 bg-indigo-500/[0.03] space-y-4"
        >
          <div className="flex items-center gap-2 text-indigo-400">
            <Shield className="h-4 w-4" />
            <span className="text-[10px] font-black uppercase tracking-widest">Our Privacy Commitment</span>
          </div>
          <p className="text-zinc-400 text-sm leading-relaxed">
            PrajaConnect is built on the principles of transparency and public trust. We collect only what is necessary to provide the civic engagement service, we never sell your data, and we empower you with full control over your information.
          </p>
          <div className="grid grid-cols-3 gap-4 pt-2">
            {[
              { label: 'No Ads', icon: '🚫' },
              { label: 'No Data Sales', icon: '🔒' },
              { label: 'Full Control', icon: '⚙️' },
            ].map(p => (
              <div key={p.label} className="text-center space-y-1">
                <div className="text-2xl">{p.icon}</div>
                <div className="text-[9px] font-black uppercase tracking-widest text-zinc-500">{p.label}</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Sections */}
        <div className="space-y-12">
          {SECTIONS.map((section, i) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ delay: i * 0.02 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-3">
                <div className={`shrink-0 h-9 w-9 rounded-xl border flex items-center justify-center ${section.color}`}>
                  {section.icon}
                </div>
                <h2 className="text-lg font-black text-white">{section.title}</h2>
              </div>
              <div className="pl-12 text-zinc-500 text-sm leading-relaxed whitespace-pre-line">
                {section.content}
              </div>
              {i < SECTIONS.length - 1 && <div className="border-t border-white/[0.04] mt-4" />}
            </motion.div>
          ))}
        </div>

        {/* Footer nav */}
        <div className="pt-8 border-t border-white/[0.04] flex flex-wrap gap-4 text-[10px] font-black uppercase tracking-widest text-zinc-600">
          <Link to="/terms" className="hover:text-indigo-400 transition-colors">Terms of Service</Link>
          <Link to="/about" className="hover:text-white transition-colors">About Us</Link>
          <Link to="/" className="hover:text-white transition-colors">Home</Link>
          <span className="ml-auto">© 2026 PrajaConnect</span>
        </div>
      </div>
    </div>
  );
}
