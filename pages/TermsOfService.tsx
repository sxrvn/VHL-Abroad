import React from 'react';
import { Link } from 'react-router-dom';

const TermsOfService: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-6 md:px-10 py-12 md:py-24">
      {/* Header */}
      <div className="mb-12">
        <Link to="/" className="inline-flex items-center gap-2 text-primary hover:underline mb-6">
          <span className="material-symbols-outlined">arrow_back</span>
          Back to Home
        </Link>
        <h1 className="text-4xl md:text-5xl font-black mb-4">Terms of Service</h1>
        <p className="text-sm opacity-60">Last updated: January 11, 2026</p>
      </div>

      {/* Content */}
      <div className="prose prose-lg dark:prose-invert max-w-none space-y-8">
        <section>
          <h2 className="text-2xl font-bold mb-4">1. Agreement to Terms</h2>
          <p className="opacity-70 leading-relaxed mb-4">
            Welcome to VHL Abroad Career. These Terms of Service ("Terms") govern your access to and use of our website, educational platform, and consultancy services (collectively, the "Services"). By accessing or using our Services, you agree to be bound by these Terms.
          </p>
          <p className="opacity-70 leading-relaxed">
            If you do not agree to these Terms, you may not access or use our Services. We reserve the right to modify these Terms at any time, and your continued use of the Services constitutes acceptance of any changes.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">2. Description of Services</h2>
          <p className="opacity-70 leading-relaxed mb-4">
            VHL Abroad Career provides:
          </p>
          <ul className="list-disc ml-6 space-y-2 opacity-70">
            <li><strong>German Language Education:</strong> Online courses for levels A1, A2, B1, and B2 including video lectures, live classes, study materials, and examinations</li>
            <li><strong>Study Abroad Consultancy:</strong> Expert guidance for studying in Germany, including university selection, application assistance, APS preparation, and visa support</li>
            <li><strong>Administrative Services:</strong> Support with blocked account setup, document verification, and pre-departure guidance</li>
            <li><strong>Student Portal:</strong> Access to course materials, exam results, live class schedules, and progress tracking</li>
            <li><strong>Career Support:</strong> Guidance for job search visa and career opportunities in Germany</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">3. Account Registration and Eligibility</h2>
          
          <h3 className="text-xl font-semibold mb-3 mt-6">3.1 Account Creation</h3>
          <p className="opacity-70 leading-relaxed mb-4">
            To access our educational platform, you must create an account by providing accurate and complete information. You are responsible for:
          </p>
          <ul className="list-disc ml-6 space-y-2 opacity-70">
            <li>Maintaining the confidentiality of your account credentials</li>
            <li>All activities that occur under your account</li>
            <li>Notifying us immediately of any unauthorized access</li>
            <li>Ensuring your contact information is current and accurate</li>
          </ul>

          <h3 className="text-xl font-semibold mb-3 mt-6">3.2 Eligibility</h3>
          <p className="opacity-70 leading-relaxed">
            You must be at least 16 years old to use our Services. By using our Services, you represent and warrant that you meet this age requirement and have the legal capacity to enter into these Terms.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">4. Course Enrollment and Payment Terms</h2>
          
          <h3 className="text-xl font-semibold mb-3 mt-6">4.1 Course Access</h3>
          <p className="opacity-70 leading-relaxed mb-4">
            Upon enrollment in a German language course or consultancy package:
          </p>
          <ul className="list-disc ml-6 space-y-2 opacity-70">
            <li>You receive a license to access course materials for the duration specified in your enrollment agreement</li>
            <li>Access is personal and non-transferable</li>
            <li>Course content is for your personal educational use only</li>
            <li>You may not share, reproduce, or distribute course materials without written permission</li>
          </ul>

          <h3 className="text-xl font-semibold mb-3 mt-6">4.2 Payment and Fees</h3>
          <p className="opacity-70 leading-relaxed mb-4">
            All fees are clearly stated before enrollment and are due according to the payment schedule agreed upon. Payment terms include:
          </p>
          <ul className="list-disc ml-6 space-y-2 opacity-70">
            <li>Fees are non-refundable unless otherwise specified in writing</li>
            <li>Late payments may result in suspension of access to Services</li>
            <li>We reserve the right to modify fees with 30 days' notice</li>
            <li>Additional charges may apply for premium services such as APS preparation or visa consultancy</li>
          </ul>

          <h3 className="text-xl font-semibold mb-3 mt-6">4.3 Refund Policy</h3>
          <p className="opacity-70 leading-relaxed mb-4">
            Refund eligibility:
          </p>
          <ul className="list-disc ml-6 space-y-2 opacity-70">
            <li>Full refund available within 7 days of enrollment if no course content has been accessed</li>
            <li>No refunds after attending live classes or taking exams</li>
            <li>Consultancy service fees are non-refundable once application processing has begun</li>
            <li>Refund requests must be submitted in writing to support@vhlabroad.com</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">5. Academic Integrity and Conduct</h2>
          
          <h3 className="text-xl font-semibold mb-3 mt-6">5.1 Student Responsibilities</h3>
          <p className="opacity-70 leading-relaxed mb-4">
            As a student, you agree to:
          </p>
          <ul className="list-disc ml-6 space-y-2 opacity-70">
            <li>Complete all exams and assessments honestly without unauthorized assistance</li>
            <li>Attend scheduled live classes or notify instructors of absences</li>
            <li>Respect fellow students and instructors in all interactions</li>
            <li>Not engage in cheating, plagiarism, or academic dishonesty</li>
            <li>Follow all course guidelines and deadlines</li>
          </ul>

          <h3 className="text-xl font-semibold mb-3 mt-6">5.2 Consequences of Violations</h3>
          <p className="opacity-70 leading-relaxed">
            Violations of academic integrity or conduct policies may result in exam failure, course expulsion, account termination, and forfeiture of all fees paid, with no refund.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">6. Intellectual Property Rights</h2>
          
          <h3 className="text-xl font-semibold mb-3 mt-6">6.1 Our Content</h3>
          <p className="opacity-70 leading-relaxed mb-4">
            All content on our platform, including but not limited to:
          </p>
          <ul className="list-disc ml-6 space-y-2 opacity-70">
            <li>Video lectures, recorded classes, and live session materials</li>
            <li>Study notes, practice exercises, and exam questions</li>
            <li>Text, graphics, logos, and software</li>
            <li>Course structure, curriculum, and teaching methodologies</li>
          </ul>
          <p className="opacity-70 leading-relaxed mt-4">
            is the exclusive property of VHL Abroad Career and is protected by copyright, trademark, and other intellectual property laws. You may not copy, reproduce, distribute, or create derivative works without our express written permission.
          </p>

          <h3 className="text-xl font-semibold mb-3 mt-6">6.2 Your Content</h3>
          <p className="opacity-70 leading-relaxed">
            By submitting assignments, participating in forums, or providing feedback, you grant us a non-exclusive, worldwide, royalty-free license to use, display, and distribute your content for educational and promotional purposes.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">7. Consultancy Services Disclaimer</h2>
          
          <h3 className="text-xl font-semibold mb-3 mt-6">7.1 No Guarantee of Results</h3>
          <p className="opacity-70 leading-relaxed mb-4">
            While we strive to provide the highest quality consultancy services, we cannot guarantee:
          </p>
          <ul className="list-disc ml-6 space-y-2 opacity-70">
            <li>Acceptance to any specific university or program</li>
            <li>Approval of visa applications</li>
            <li>Success in APS interviews</li>
            <li>Specific Goethe exam scores or certification results</li>
            <li>Job placement or career outcomes in Germany</li>
          </ul>
          <p className="opacity-70 leading-relaxed mt-4">
            Final decisions are made by universities, embassies, and examination authorities. Our role is to guide and support you through the application process.
          </p>

          <h3 className="text-xl font-semibold mb-3 mt-6">7.2 Document Accuracy</h3>
          <p className="opacity-70 leading-relaxed">
            You are responsible for providing accurate, complete, and authentic documents. We are not liable for application rejections or delays caused by inaccurate or fraudulent information provided by you.
          </p>

          <h3 className="text-xl font-semibold mb-3 mt-6">7.3 Third-Party Services</h3>
          <p className="opacity-70 leading-relaxed">
            We work with partner institutions, blocked account providers, and translation services. We are not responsible for the actions, delays, or failures of these third parties.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">8. Limitation of Liability</h2>
          <p className="opacity-70 leading-relaxed mb-4">
            To the maximum extent permitted by law, VHL Abroad Career shall not be liable for:
          </p>
          <ul className="list-disc ml-6 space-y-2 opacity-70">
            <li>Indirect, incidental, special, or consequential damages</li>
            <li>Loss of profits, data, or business opportunities</li>
            <li>Technical failures, platform downtime, or data breaches</li>
            <li>Actions or decisions made by third-party institutions</li>
            <li>Changes in immigration laws, university policies, or exam requirements</li>
          </ul>
          <p className="opacity-70 leading-relaxed mt-4">
            Our total liability for any claim arising from these Terms or your use of the Services shall not exceed the amount you paid to us in the 12 months preceding the claim.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">9. Prohibited Conduct</h2>
          <p className="opacity-70 leading-relaxed mb-4">
            You agree not to:
          </p>
          <ul className="list-disc ml-6 space-y-2 opacity-70">
            <li>Use the Services for any illegal or unauthorized purpose</li>
            <li>Impersonate another person or entity</li>
            <li>Share your account credentials with others</li>
            <li>Attempt to hack, disrupt, or damage our platform</li>
            <li>Download, copy, or distribute course content without permission</li>
            <li>Use automated systems (bots, scrapers) to access the platform</li>
            <li>Post offensive, defamatory, or inappropriate content</li>
            <li>Interfere with other users' access to the Services</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">10. Termination</h2>
          <p className="opacity-70 leading-relaxed mb-4">
            We reserve the right to suspend or terminate your account and access to Services at our sole discretion, without notice, for:
          </p>
          <ul className="list-disc ml-6 space-y-2 opacity-70">
            <li>Violation of these Terms</li>
            <li>Fraudulent or illegal activity</li>
            <li>Non-payment of fees</li>
            <li>Academic dishonesty or misconduct</li>
            <li>Abusive behavior toward staff or other students</li>
          </ul>
          <p className="opacity-70 leading-relaxed mt-4">
            Upon termination, your right to access the platform ceases immediately, and we are not liable for any loss resulting from termination.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">11. Privacy and Data Protection</h2>
          <p className="opacity-70 leading-relaxed">
            Your use of the Services is also governed by our Privacy Policy, which describes how we collect, use, and protect your personal information. By using our Services, you consent to our data practices as described in the Privacy Policy.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">12. Dispute Resolution</h2>
          
          <h3 className="text-xl font-semibold mb-3 mt-6">12.1 Governing Law</h3>
          <p className="opacity-70 leading-relaxed">
            These Terms shall be governed by and construed in accordance with the laws of Germany, without regard to its conflict of law provisions.
          </p>

          <h3 className="text-xl font-semibold mb-3 mt-6">12.2 Arbitration</h3>
          <p className="opacity-70 leading-relaxed">
            Any dispute arising from these Terms shall first be resolved through good-faith negotiation. If unresolved within 30 days, disputes shall be submitted to binding arbitration in Berlin, Germany.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">13. Changes to Terms</h2>
          <p className="opacity-70 leading-relaxed">
            We reserve the right to modify these Terms at any time. We will notify you of significant changes by email or through a prominent notice on our platform. Your continued use of the Services after changes take effect constitutes acceptance of the revised Terms.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">14. Miscellaneous</h2>
          
          <h3 className="text-xl font-semibold mb-3 mt-6">14.1 Entire Agreement</h3>
          <p className="opacity-70 leading-relaxed mb-4">
            These Terms constitute the entire agreement between you and VHL Abroad Career regarding the Services and supersede all prior agreements.
          </p>

          <h3 className="text-xl font-semibold mb-3 mt-6">14.2 Severability</h3>
          <p className="opacity-70 leading-relaxed mb-4">
            If any provision of these Terms is found to be invalid or unenforceable, the remaining provisions shall remain in full force and effect.
          </p>

          <h3 className="text-xl font-semibold mb-3 mt-6">14.3 Waiver</h3>
          <p className="opacity-70 leading-relaxed mb-4">
            Our failure to enforce any right or provision of these Terms shall not constitute a waiver of such right or provision.
          </p>

          <h3 className="text-xl font-semibold mb-3 mt-6">14.4 Assignment</h3>
          <p className="opacity-70 leading-relaxed">
            You may not assign or transfer these Terms without our prior written consent. We may assign these Terms without restriction.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">15. Contact Information</h2>
          <p className="opacity-70 leading-relaxed mb-4">
            For questions about these Terms of Service, please contact us:
          </p>
          <div className="bg-gray-50 dark:bg-white/5 p-6 rounded-xl border border-charcoal/10 dark:border-white/10">
            <p className="font-semibold mb-2">VHL Abroad Career</p>
            <p className="opacity-70 mb-1">Email: legal@vhlabroad.com</p>
            <p className="opacity-70 mb-1">Support: support@vhlabroad.com</p>
            <p className="opacity-70 mb-1">Phone: +49 123 456789</p>
            <p className="opacity-70">Address: Berlin, Germany</p>
          </div>
        </section>

        <div className="mt-12 pt-8 border-t border-charcoal/10 dark:border-white/10">
          <p className="text-sm opacity-60 text-center">
            By using VHL Abroad Career's services, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
