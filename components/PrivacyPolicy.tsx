// app/privacy-policy/page.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';

interface Section {
  id: string;
  title: string;
  content: string;
}

export default function PrivacyPolicy() {
  const [activeSection, setActiveSection] = useState<string>('preliminary');

  const sections: Section[] = [
    {
      id: 'preliminary',
      title: 'Preliminary',
      content: `BizTradeFairs.com Online Private Limited ("BizTradeFairs.com," the "Company," "we," "us," and "our") respects your privacy and is committed to protecting it through compliance with this privacy policy. This policy describes the types of information we may collect from you or that you may provide when you use our Services and our practices for collecting, using, maintaining, protecting, and disclosing that information.`
    },
    {
      id: 'information-collection',
      title: 'I. The Information We Collect and How We Use It',
      content: `We collect several types of information from and about users of our Services, including:

• Personal Information: Information by which you may be personally identified, such as name, postal address, email address, telephone number, or any other identifier by which you may be contacted online or offline.

• Technical Information: Information about your internet connection, the equipment you use to access our Services, and usage details.

• Usage Information: Details of your visits to our Services, including traffic data, location data, logs, and other communication data and the resources that you access and use on the Services.

We collect this information:
• Directly from you when you provide it to us
• Automatically as you navigate through the site using cookies and other tracking technologies
• From third parties, for example, our business partners`
    },
    {
      id: 'information-use',
      title: 'II. How We Use the Information',
      content: `We use the information that we collect about you or that you provide to us, including any personal information:

• To present our Services and their contents to you
• To provide you with information, products, or services that you request from us
• To respond to your queries and provide customer support
• To improve the content and features of our Services
• To administer our Services and diagnose technical issues
• To send you communications, including promotional communications (with your consent)
• To display relevant advertisements and content
• To conduct research and analytics to improve our Services
• To fulfill any other purpose for which you provide it
• To carry out our obligations and enforce our rights
• In any other way we may describe when you provide the information`
    },
    {
      id: 'legal-basis',
      title: 'III. Legal Basis for Processing',
      content: `We rely on the following legal bases for processing your personal information:

• Consent: Where you have given us clear consent to process your personal data for a specific purpose. You can withdraw your consent at any time.

• Performance of a Contract: When the processing is necessary for a contract we have with you, or because you have asked us to take specific steps before entering into a contract.

• Legitimate Interests: When the processing is necessary for our legitimate interests or the legitimate interests of a third party, provided those interests are not overridden by your rights and interests.

• Legal Obligation: When the processing is necessary for us to comply with the law.`
    },
    {
      id: 'sharing',
      title: 'IV. Sharing Information',
      content: `We may share personal information that we collect or you provide as described in this privacy policy:

• With our subsidiaries and affiliates for business purposes
• With contractors, service providers, and other third parties we use to support our business
• In connection with a merger, divestiture, restructuring, reorganization, dissolution, or other sale or transfer of some or all of our assets
• With third parties for their own marketing purposes (with your consent)
• To fulfill the purpose for which you provide it
• For any other purpose disclosed by us when you provide the information
• With your consent

We may also disclose your personal information:
• To comply with any court order, law, or legal process
• To enforce or apply our terms of use and other agreements
• If we believe disclosure is necessary or appropriate to protect the rights, property, or safety of our company, our customers, or others`
    },
    {
      id: 'choices',
      title: 'V. Choices About Use and Disclosure',
      content: `We strive to provide you with choices regarding the personal information you provide to us. You can set your browser or device to refuse all or some browser cookies, or to alert you when cookies are being sent. If you disable or refuse cookies, please note that some parts of our Services may then be inaccessible or not function properly.

We do not control third parties' collection or use of your information to serve interest-based advertising. However, these third parties may provide you with ways to choose not to have your information collected or used in this way.`
    },
    {
      id: 'communications',
      title: 'VI. Communications Choices',
      content: `We may use your personal information to contact you with newsletters, marketing or promotional materials, and other information that may be of interest to you. You may opt out of receiving any, or all, of these communications from us by following the unsubscribe link or instructions provided in any email we send or by contacting us.

Please note that you may not opt out of Service-related communications (e.g., account verification, changes/updates to features of the Service, technical and security notices).`
    },
    {
      id: 'user-rights',
      title: 'VII. User Rights',
      content: `Depending on your location, you may have the following rights regarding your personal information:

• Access and Portability: You can review and update your account information via your account settings. You may also request a copy of the personal information we hold about you.

• Correction: You can request correction of any inaccurate or incomplete personal information.

• Deletion: You can request deletion of your personal information, subject to certain exceptions prescribed by law.

• Restriction and Objection: You can request that we restrict the processing of your personal information or object to certain types of processing.

Please note that if you choose to delete your content, it may persist in backup copies for a reasonable period of time but will not be available to others.`
    },
    {
      id: 'security',
      title: 'IX. Security',
      content: `We have implemented measures designed to secure your personal information from accidental loss and from unauthorized access, use, alteration, and disclosure. All information you provide to us is stored on our secure servers behind firewalls.

The safety and security of your information also depends on you. Where we have given you (or where you have chosen) a password for access to certain parts of our Services, you are responsible for keeping this password confidential. We ask you not to share your password with anyone.

Unfortunately, the transmission of information via the internet is not completely secure. Although we do our best to protect your personal information, we cannot guarantee the security of your personal information transmitted to our Services. Any transmission of personal information is at your own risk.`
    },
    {
      id: 'children',
      title: 'X. Children Under 16',
      content: `Our Services are not intended for children under 16 years of age. No one under age 16 may provide any personal information to or on the Services. We do not knowingly collect personal information from children under 16. If you are under 16, do not use or provide any information on our Services or through any of its features.

If we learn we have collected or received personal information from a child under 16 without verification of parental consent, we will delete that information. If you believe we might have any information from or about a child under 16, please contact us at help@biztradefairs.com.`
    },
    {
      id: 'data-transfers',
      title: 'XII. Data Transfers',
      content: `Your information, including personal information, may be transferred to — and maintained on — computers located outside of your state, province, country, or other governmental jurisdiction where the data protection laws may differ from those of your jurisdiction.

If you are located outside India and choose to provide information to us, please note that we transfer the information, including personal information, to India and process it there.

Your consent to this Privacy Policy followed by your submission of such information represents your agreement to that transfer.`
    },
    {
      id: 'contact',
      title: 'XVI. Contact Us',
      content: `If you have any questions about this Privacy Policy or our privacy practices, please contact us at:

Maxx Business Media Private Limited
T9, 3rd Floor, Swastik Manandi Arcade, 
Subedar Chatram Road, Seshadripuram, 
Bengaluru – 560020, India

Email: help@biztradefairs.com

Grievance Officer: Mr. Padmanabham
Email: nodalofficer@biztradefairs.com

We will respond to your inquiry within 30 days.`
    }
  ];

  const scrollToSection = (sectionId: string): void => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="text-center mb-12">
          {/* <Link href="/" className="inline-block mb-6">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg"></div>
              <span className="text-xl font-bold text-gray-900">BizTradeFairs</span>
            </div>
          </Link> */}
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Last updated on November 20, 2025. Learn how we collect, use, and protect your personal information.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:w-1/4">
            <div className="sticky top-8 bg-white rounded-lg shadow-sm border p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Table of Contents</h3>
              <nav className="space-y-2">
                {sections.map((section: Section) => (
                  <button
                    key={section.id}
                    onClick={() => scrollToSection(section.id)}
                    className={`block w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                      activeSection === section.id
                        ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    {section.title}
                  </button>
                ))}
              </nav>

              {/* Quick Actions */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-3">Quick Actions</h4>
                <div className="space-y-2">
                  <button
                    onClick={() => window.open('mailto:help@biztradefairs.com')}
                    className="w-full text-left px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                  >
                    Contact Support
                  </button>
                  <button
                    onClick={() => window.open('mailto:nodalofficer@biztradefairs.com')}
                    className="w-full text-left px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                  >
                    Contact Grievance Officer
                  </button>
                  <Link
                    href="/terms-of-service"
                    className="block w-full text-left px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                  >
                    View Terms of Service
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:w-3/4">
            <div className="bg-white rounded-lg shadow-sm border">
              {/* Important Notice */}
              <div className="bg-blue-50 border-b border-blue-200 p-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-lg font-semibold text-blue-800">
                      Important Information
                    </h3>
                    <div className="mt-2 text-blue-700">
                      <p>
                        By accessing or using our Services, you agree to this Privacy Policy. 
                        If you do not agree with our policies and practices, you may choose not to use our Services.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Privacy Policy Content */}
              <div className="p-8 space-y-12">
                {sections.map((section: Section) => (
                  <section key={section.id} id={section.id} className="scroll-mt-20">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">{section.title}</h2>
                    <div className="prose prose-gray max-w-none text-gray-700">
                      {section.content.split('\n\n').map((paragraph, index) => (
                        <div key={index} className="mb-4">
                          {paragraph.split('\n').map((line, lineIndex) => (
                            <p key={lineIndex} className={line.startsWith('•') ? 'ml-4' : ''}>
                              {line}
                            </p>
                          ))}
                        </div>
                      ))}
                    </div>
                  </section>
                ))}

                {/* Acceptance Footer */}
                <div className="bg-gray-50 border-t pt-8 mt-8">
                  <div className="text-center">
                    <p className="text-gray-600 mb-4">
                      By using our services, you acknowledge that you have read, understood, and agree to be bound by this Privacy Policy.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <Link 
                        href="/"
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Return to Homepage
                      </Link>
                      <Link 
                        href="/terms-of-service"
                        className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        View Terms of Service
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}