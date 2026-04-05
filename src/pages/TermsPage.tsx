import { motion } from 'framer-motion';
import { Shield, FileText, Calendar, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

const SECTIONS = [
  {
    title: '1. Acceptance of Terms',
    content: `By accessing or using PrajaConnect ("the Platform"), you confirm that you have read, understood, and agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree to these terms, please do not use the Platform.

These Terms apply to all visitors, registered users, and all others who access or use the Platform. By using PrajaConnect, you represent that you are at least 18 years old or that you are using the Platform with the consent and supervision of a parent or guardian.`
  },
  {
    title: '2. Description of Service',
    content: `PrajaConnect is a civic engagement platform that allows citizens to report local governance issues (potholes, broken streetlights, sanitation problems, etc.), track their resolution through SLA deadlines, sign community petitions, and engage with elected representatives and municipal officials.

The Platform facilitates communication between citizens and public officials but does not guarantee that all reported issues will be resolved within specified timelines. PrajaConnect is not a government body and has no authority to compel any official action.`
  },
  {
    title: '3. User Accounts & Registration',
    content: `To access most features of PrajaConnect, you must create an account through our third-party authentication provider (Clerk). You are responsible for:

• Maintaining the confidentiality of your account credentials
• All activities that occur under your account
• Providing accurate and current information during registration
• Promptly notifying us of any unauthorized access to your account

We reserve the right to terminate or suspend accounts that violate these Terms, engage in fraudulent activity, or harm the community.`
  },
  {
    title: '4. User Conduct & Prohibited Activities',
    content: `You agree not to use PrajaConnect to:

• Submit false, misleading, or fabricated civic reports
• Harass, abuse, or threaten other users or public officials
• Upload content that is defamatory, obscene, or violates any third-party intellectual property rights
• Attempt to interfere with, compromise, or circumvent the security of the Platform
• Use automated tools, bots, or scripts to scrape content or create accounts
• Impersonate any person, government body, or official authority
• Use the Platform for commercial solicitation or spam

Violations may result in immediate account suspension and, where applicable, reporting to appropriate law enforcement authorities.`
  },
  {
    title: '5. Content & Intellectual Property',
    content: `All content you submit (issue reports, comments, images, petitions) remains your intellectual property. By submitting content to PrajaConnect, you grant us a non-exclusive, worldwide, royalty-free license to display, store, and share your content in connection with the Platform's purpose of civic engagement.

You represent that you have all rights necessary to grant this license, and that your content does not violate any third-party rights or applicable laws.

The PrajaConnect brand, logo, design system, and proprietary technology remain the exclusive property of PrajaConnect and its licensors.`
  },
  {
    title: '6. SLA & Resolution Commitments',
    content: `PrajaConnect publishes Service Level Agreement (SLA) targets for issue resolution based on severity classification. These targets represent our best-effort expectations communicated to relevant authorities.

We do not guarantee issue resolution within SLA timelines. The Platform serves as a transparency and accountability tool — actual resolution depends on the responsiveness and capacity of the relevant municipal or government departments.

Escalation notifications are automated and informational only. They do not constitute legal obligations on any government body.`
  },
  {
    title: '7. Privacy & Data Protection',
    content: `Your use of the Platform is also governed by our Privacy Policy, which is incorporated herein by reference. Please review our Privacy Policy at /privacy to understand our data collection and usage practices.

We comply with applicable Indian data protection laws and take reasonable measures to protect your personal information.`
  },
  {
    title: '8. Disclaimer of Warranties',
    content: `THE PLATFORM IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED. PRAJACONNECT DISCLAIMS ALL WARRANTIES INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, NON-INFRINGEMENT, AND UNINTERRUPTED OR ERROR-FREE SERVICE.

We do not warrant that the Platform will meet your requirements or that defects will be corrected. Your use of the Platform is at your sole risk.`
  },
  {
    title: '9. Limitation of Liability',
    content: `TO THE MAXIMUM EXTENT PERMITTED BY LAW, PRAJACONNECT SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING FROM YOUR USE OF OR INABILITY TO USE THE PLATFORM.

Our total liability to you for all claims arising from these Terms or your use of the Platform shall not exceed the amount you paid us (if any) in the 12 months preceding the claim.`
  },
  {
    title: '10. Governing Law & Dispute Resolution',
    content: `These Terms are governed by the laws of India. Any disputes arising from or related to these Terms shall be subject to the exclusive jurisdiction of the courts located in Andhra Pradesh, India.

Before initiating any formal legal proceedings, you agree to contact us at legal@prajaconnect.in and attempt to resolve the dispute informally.`
  },
  {
    title: '11. Modifications to Terms',
    content: `We reserve the right to update or modify these Terms at any time. We will notify you of material changes by posting an announcement on the Platform or by email. Your continued use of the Platform after any changes constitutes your acceptance of the updated Terms.

We recommend reviewing these Terms periodically to stay informed of updates.`
  },
  {
    title: '12. Contact Information',
    content: `If you have questions, concerns, or legal inquiries regarding these Terms of Service, please contact us at:

PrajaConnect Legal Team
Email: legal@prajaconnect.in
Address: KL University Campus, Vijayawada, Andhra Pradesh, India - 522302`
  },
];

export function TermsPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 sm:py-24 space-y-16">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
              <FileText className="h-5 w-5 text-indigo-400" />
            </div>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-indigo-500/20 bg-indigo-500/5 text-indigo-400 text-[10px] font-black uppercase tracking-[0.2em]">
              Legal Document
            </div>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight">Terms of Service</h1>
          <p className="text-zinc-500 font-medium leading-relaxed max-w-xl">
            Please read these terms carefully before using PrajaConnect. By using our platform, you agree to be bound by these terms.
          </p>
          <div className="flex flex-wrap items-center gap-6 text-[10px] font-black uppercase tracking-widest text-zinc-600">
            <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> Effective: 1 January 2026</span>
            <span className="flex items-center gap-1.5"><Shield className="h-3.5 w-3.5" /> Governing Law: India</span>
            <span className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" /> legal@prajaconnect.in</span>
          </div>
        </motion.div>

        {/* Summary box */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
          className="p-8 rounded-[2rem] border border-amber-500/10 bg-amber-500/[0.03]"
        >
          <p className="text-[10px] font-black uppercase tracking-widest text-amber-500 mb-3">TL;DR Summary</p>
          <ul className="space-y-2 text-sm text-zinc-400 leading-relaxed">
            <li className="flex items-start gap-2"><span className="text-amber-500 shrink-0 mt-0.5">→</span> Only submit real, verifiable civic issues. False reports may lead to account suspension.</li>
            <li className="flex items-start gap-2"><span className="text-amber-500 shrink-0 mt-0.5">→</span> We are a transparency platform, not a government body. We cannot guarantee issue resolution.</li>
            <li className="flex items-start gap-2"><span className="text-amber-500 shrink-0 mt-0.5">→</span> Your content stays yours, but you grant us a license to display it on the platform.</li>
            <li className="flex items-start gap-2"><span className="text-amber-500 shrink-0 mt-0.5">→</span> Disputes are governed by Indian law in Andhra Pradesh courts.</li>
          </ul>
        </motion.div>

        {/* Sections */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="space-y-10"
        >
          {SECTIONS.map((section, i) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ delay: i * 0.03 }}
              className="space-y-4"
            >
              <h2 className="text-lg font-black text-white">{section.title}</h2>
              <div className="text-zinc-500 text-sm leading-relaxed whitespace-pre-line">{section.content}</div>
              {i < SECTIONS.length - 1 && <div className="border-t border-white/[0.04] pt-2" />}
            </motion.div>
          ))}
        </motion.div>

        {/* Footer nav */}
        <div className="pt-8 border-t border-white/[0.04] flex flex-wrap gap-4 text-[10px] font-black uppercase tracking-widest text-zinc-600">
          <Link to="/privacy" className="hover:text-indigo-400 transition-colors">Privacy Policy</Link>
          <Link to="/about" className="hover:text-white transition-colors">About Us</Link>
          <Link to="/" className="hover:text-white transition-colors">Home</Link>
          <span className="ml-auto">© 2026 PrajaConnect</span>
        </div>
      </div>
    </div>
  );
}
