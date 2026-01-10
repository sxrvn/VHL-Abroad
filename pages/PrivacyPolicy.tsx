import React from 'react';
import { Link } from 'react-router-dom';

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-6 md:px-10 py-12 md:py-24">
      {/* Header */}
      <div className="mb-12">
        <Link to="/" className="inline-flex items-center gap-2 text-primary hover:underline mb-6">
          <span className="material-symbols-outlined">arrow_back</span>
          Back to Home
        </Link>
        <h1 className="text-4xl md:text-5xl font-black mb-4">Privacy Policy</h1>
        <p className="text-sm opacity-60">Last updated: January 11, 2026</p>
      </div>

      {/* Content */}
      <div className="prose prose-lg dark:prose-invert max-w-none space-y-8">
        <section>
          <h2 className="text-2xl font-bold mb-4">1. Introduction</h2>
          <p className="opacity-70 leading-relaxed mb-4">
            Welcome to VHL Abroad Career ("we," "our," or "us"). We are committed to protecting your personal information and your right to privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website and services related to German language education and study abroad consultancy.
          </p>
          <p className="opacity-70 leading-relaxed">
            By using our services, you agree to the collection and use of information in accordance with this policy. If you do not agree with our policies and practices, please do not use our services.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">2. Information We Collect</h2>
          
          <h3 className="text-xl font-semibold mb-3 mt-6">2.1 Personal Information</h3>
          <p className="opacity-70 leading-relaxed mb-4">
            We collect personal information that you voluntarily provide to us when you:
          </p>
          <ul className="list-disc ml-6 space-y-2 opacity-70">
            <li>Register for an account on our learning portal</li>
            <li>Request a consultation for study abroad services</li>
            <li>Enroll in German language courses (A1, A2, B1, B2)</li>
            <li>Submit applications through our platform</li>
            <li>Contact us via email, phone, or contact forms</li>
          </ul>
          <p className="opacity-70 leading-relaxed mt-4">
            This information may include:
          </p>
          <ul className="list-disc ml-6 space-y-2 opacity-70">
            <li>Full name, email address, phone number</li>
            <li>Educational background, academic transcripts, and CGPA</li>
            <li>Passport information and visa-related documents</li>
            <li>Financial information for blocked account services</li>
            <li>German language proficiency level</li>
            <li>University preferences and field of interest</li>
          </ul>

          <h3 className="text-xl font-semibold mb-3 mt-6">2.2 Automatically Collected Information</h3>
          <p className="opacity-70 leading-relaxed mb-4">
            When you access our platform, we automatically collect certain information, including:
          </p>
          <ul className="list-disc ml-6 space-y-2 opacity-70">
            <li>IP address, browser type, and operating system</li>
            <li>Pages viewed, time spent on pages, and navigation paths</li>
            <li>Device information and unique identifiers</li>
            <li>Login timestamps and course progress data</li>
          </ul>

          <h3 className="text-xl font-semibold mb-3 mt-6">2.3 Educational Data</h3>
          <p className="opacity-70 leading-relaxed">
            As an educational platform, we collect and process data related to your learning activities, including exam attempts, results, video viewing progress, live class attendance, and performance analytics.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">3. How We Use Your Information</h2>
          <p className="opacity-70 leading-relaxed mb-4">
            We use the information we collect for the following purposes:
          </p>
          <ul className="list-disc ml-6 space-y-2 opacity-70">
            <li><strong>Educational Services:</strong> Provide access to German language courses, track your learning progress, grade exams, and issue certificates</li>
            <li><strong>Study Abroad Consultancy:</strong> Process university applications, assist with APS appointments, visa applications, and blocked account setup</li>
            <li><strong>Communication:</strong> Send course updates, exam schedules, visa status notifications, and important announcements</li>
            <li><strong>Account Management:</strong> Create and manage your student or admin account, authentication, and access control</li>
            <li><strong>Platform Improvement:</strong> Analyze usage patterns to improve our educational content and user experience</li>
            <li><strong>Legal Compliance:</strong> Fulfill our legal obligations and protect our rights</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">4. Information Sharing and Disclosure</h2>
          <p className="opacity-70 leading-relaxed mb-4">
            We may share your information in the following circumstances:
          </p>
          <ul className="list-disc ml-6 space-y-2 opacity-70">
            <li><strong>Universities and Educational Institutions:</strong> Share application materials with German universities you apply to through our services</li>
            <li><strong>Visa and Administrative Services:</strong> Provide required information to German embassies, APS, and blocked account providers</li>
            <li><strong>Service Providers:</strong> Share data with trusted third-party service providers who assist in operating our platform (payment processors, email services, hosting providers)</li>
            <li><strong>Legal Requirements:</strong> Disclose information when required by law or to protect our rights and safety</li>
            <li><strong>Business Transfers:</strong> Transfer data in connection with a merger, acquisition, or sale of assets</li>
          </ul>
          <p className="opacity-70 leading-relaxed mt-4">
            <strong>We do not sell your personal information to third parties.</strong>
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">5. Data Security</h2>
          <p className="opacity-70 leading-relaxed mb-4">
            We implement appropriate technical and organizational security measures to protect your personal information, including:
          </p>
          <ul className="list-disc ml-6 space-y-2 opacity-70">
            <li>Encryption of data in transit and at rest</li>
            <li>Secure authentication mechanisms</li>
            <li>Regular security audits and updates</li>
            <li>Restricted access to personal data on a need-to-know basis</li>
            <li>Secure backup and disaster recovery procedures</li>
          </ul>
          <p className="opacity-70 leading-relaxed mt-4">
            However, no method of transmission over the Internet is 100% secure. While we strive to protect your information, we cannot guarantee absolute security.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">6. Data Retention</h2>
          <p className="opacity-70 leading-relaxed">
            We retain your personal information for as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required by law. Educational records, including exam results and certificates, are retained for a minimum of 7 years as per educational compliance standards. After the retention period, we securely delete or anonymize your information.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">7. Your Rights</h2>
          <p className="opacity-70 leading-relaxed mb-4">
            Depending on your location, you may have the following rights regarding your personal information:
          </p>
          <ul className="list-disc ml-6 space-y-2 opacity-70">
            <li><strong>Access:</strong> Request a copy of the personal information we hold about you</li>
            <li><strong>Correction:</strong> Request correction of inaccurate or incomplete information</li>
            <li><strong>Deletion:</strong> Request deletion of your personal information (subject to legal retention requirements)</li>
            <li><strong>Objection:</strong> Object to the processing of your personal information</li>
            <li><strong>Portability:</strong> Request transfer of your data to another service provider</li>
            <li><strong>Withdrawal of Consent:</strong> Withdraw consent for data processing at any time</li>
          </ul>
          <p className="opacity-70 leading-relaxed mt-4">
            To exercise these rights, please contact us at privacy@vhlabroad.com.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">8. Cookies and Tracking Technologies</h2>
          <p className="opacity-70 leading-relaxed mb-4">
            We use cookies and similar tracking technologies to track activity on our platform and store certain information. Cookies are files with a small amount of data that are sent to your browser from a website and stored on your device.
          </p>
          <p className="opacity-70 leading-relaxed mb-4">
            You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept cookies, you may not be able to use some portions of our service.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">9. Third-Party Links</h2>
          <p className="opacity-70 leading-relaxed">
            Our platform may contain links to third-party websites, including university portals, YouTube videos for educational content, and payment gateways. We are not responsible for the privacy practices of these external sites. We encourage you to read the privacy policies of any third-party sites you visit.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">10. Children's Privacy</h2>
          <p className="opacity-70 leading-relaxed">
            Our services are intended for individuals aged 16 and above. We do not knowingly collect personal information from children under 16. If you believe we have collected information from a child under 16, please contact us immediately.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">11. International Data Transfers</h2>
          <p className="opacity-70 leading-relaxed">
            Your information may be transferred to and processed in countries other than your country of residence. These countries may have data protection laws that are different from the laws of your country. We ensure appropriate safeguards are in place to protect your information in accordance with this Privacy Policy.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">12. Changes to This Privacy Policy</h2>
          <p className="opacity-70 leading-relaxed">
            We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date. You are advised to review this Privacy Policy periodically for any changes. Changes are effective when posted on this page.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">13. Contact Us</h2>
          <p className="opacity-70 leading-relaxed mb-4">
            If you have any questions about this Privacy Policy or our privacy practices, please contact us:
          </p>
          <div className="bg-gray-50 dark:bg-white/5 p-6 rounded-xl border border-charcoal/10 dark:border-white/10">
            <p className="font-semibold mb-2">VHL Abroad Career</p>
            <p className="opacity-70 mb-1">Email: privacy@vhlabroad.com</p>
            <p className="opacity-70 mb-1">Phone: +49 123 456789</p>
            <p className="opacity-70">Address: Berlin, Germany</p>
          </div>
        </section>

        <div className="mt-12 pt-8 border-t border-charcoal/10 dark:border-white/10">
          <p className="text-sm opacity-60 text-center">
            By using VHL Abroad Career's services, you acknowledge that you have read and understood this Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
