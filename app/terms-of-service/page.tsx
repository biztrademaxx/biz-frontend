// app/terms-of-service/page.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';

interface Section {
  id: string;
  title: string;
}

interface DefinitionItemProps {
  term: string;
  definition: string;
}

export default function TermsOfService() {
  const [activeSection, setActiveSection] = useState<string>('acceptance');

  const sections: Section[] = [
    { id: 'acceptance', title: 'I. Acceptance of Terms' },
    { id: 'definitions', title: 'II. Definitions' },
    { id: 'eligibility', title: 'III. Eligibility to Use' },
    { id: 'changes', title: 'IV. Changes in Terms' },
    { id: 'provision', title: 'V. Provision of Services' },
    { id: 'disclaimer', title: 'VI. Disclaimer' },
    { id: 'use-of-services', title: 'VII. Use of Services' },
    { id: 'content', title: 'VIII. Content' },
    { id: 'guidelines', title: 'IX. Content Guidelines' },
    { id: 'restrictions', title: 'X. Restrictions on Use' },
    { id: 'feedback', title: 'XI. User Feedback' },
    { id: 'advertising', title: 'XII. Advertising' },
    { id: 'liability', title: 'XIII. Disclaimer & Liability' },
    { id: 'termination', title: 'XIV. Termination' },
    { id: 'general', title: 'XV. General Terms' },
    { id: 'grievance', title: 'XVI. Grievance Officer' },
    { id: 'copyright', title: 'XVII. Copyright' }
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
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Terms of Service</h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Last updated on November 20, 2025. Please read these terms carefully before using our services.
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
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:w-3/4">
            <div className="bg-white rounded-lg shadow-sm border">
              {/* Terms Content */}
              <div className="p-8 space-y-12">
                {/* Section I: Acceptance of Terms */}
                <section id="acceptance" className="scroll-mt-20">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">I. Acceptance of Terms</h2>
                  <div className="space-y-4 text-gray-700">
                    <p>
                      Thank you for using BizTradeFairs.com. These Terms of Service (the "Terms") are intended to make you aware of your legal rights and responsibilities with respect to your access to and use of the BizTradeFairs.com website at www.biztradefairs.com (the "Site") and any related mobile or software applications ("BizTradeFairs Platform"), including but not limited to the delivery of information via the website whether existing now or in the future that link to these Terms (collectively, the "Services").
                    </p>
                    <p>
                      These Terms are effective for all existing and future BizTradeFairs.com users, including but without limitation to users having access to any partner or organizer dashboard to manage their claimed listings.
                    </p>
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 my-4">
                      <p className="text-sm">
                        <strong>Important:</strong> By accessing or using the BizTradeFairs.com Platform, you are agreeing to these Terms and concluding a legally binding contract with BizTrade Fairs Private Limited and/or its affiliates.
                      </p>
                    </div>
                    <p>
                      We hold the sole right to modify the Terms of Service without prior permission from you or providing notice to you. It is your responsibility to periodically review the Terms of Service and stay updated.
                    </p>
                  </div>
                </section>

                {/* Section II: Definitions */}
                <section id="definitions" className="scroll-mt-20">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">II. Definitions</h2>
                  <div className="space-y-4">
                    <DefinitionItem term="We, Us, Our" definition="BizTradeFairs.com, the Website/App/portal, or the Company." />
                    <DefinitionItem term="Agreement" definition="These Terms of Service, including any amendments that may be incorporated into it." />
                    <DefinitionItem term="User or You" definition="Someone who accesses or uses the Services for sharing, displaying, hosting, publishing, transacting, or uploading information." />
                    <DefinitionItem term="Content" definition="Reviews, images, photos, audio, video, location data, and all other forms of information or data." />
                    <DefinitionItem term="Your Content" definition="Content that you upload, share, or transmit through the Services." />
                    <DefinitionItem term="BizTradeFairs Content" definition="Content that BizTradeFairs.com creates and makes available in connection with the Services." />
                    <DefinitionItem term="Third Party Content" definition="Content that comes from parties other than BizTradeFairs.com or its users." />
                  </div>
                </section>

                {/* Section III: Eligibility */}
                <section id="eligibility" className="scroll-mt-20">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">III. Eligibility to Use the Services</h2>
                  <div className="space-y-4 text-gray-700">
                    <p>
                      You hereby represent and warrant that you are at least eighteen (18) years of age or above and are fully able and competent to understand and agree to the terms, conditions, obligations, affirmations, representations, and warranties set forth in these Terms.
                    </p>
                    <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
                      <p className="text-sm font-medium">
                        Compliance with Laws: You agree to use the Services only in compliance with these Terms and applicable laws.
                      </p>
                    </div>
                  </div>
                </section>

                {/* Section IV: Changes */}
                <section id="changes" className="scroll-mt-20">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">IV. Changes in the Terms</h2>
                  <div className="space-y-4 text-gray-700">
                    <p>
                      BizTradeFairs.com may vary, amend, or update these Terms from time to time entirely at its own discretion. You shall be responsible for checking these Terms from time to time and ensuring continued compliance.
                    </p>
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                      <p className="text-sm">
                        Your use of the BizTradeFairs.com Platform after any amendment shall be deemed your acceptance of the updated Terms.
                      </p>
                    </div>
                  </div>
                </section>

                {/* Section V: Provision of Services */}
                <section id="provision" className="scroll-mt-20">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">V. Provision of the Services Being Offered</h2>
                  <div className="space-y-6 text-gray-700">
                    <p>
                      BizTradeFairs.com is constantly evolving to provide the best possible experience and information to its users. You acknowledge and agree that the form and nature of the Services provided by BizTradeFairs.com may change from time to time without prior notice.
                    </p>
                    
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-gray-900 mb-2">Service Changes</h4>
                        <p className="text-sm">
                          We reserve the right to suspend, cancel, or discontinue any or all products or services at any time without notice.
                        </p>
                      </div>
                      
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-gray-900 mb-2">Account Access</h4>
                        <p className="text-sm">
                          If BizTradeFairs.com disables access to your account, you may be prevented from accessing your account details or any content contained therein.
                        </p>
                      </div>
                    </div>

                    <div className="bg-purple-50 border-l-4 border-purple-400 p-4">
                      <h4 className="font-semibold text-gray-900 mb-2">Subscription Fees</h4>
                      <p className="text-sm">
                        BizTradeFairs.com reserves the right to charge subscription or membership fees from users, by giving reasonable prior notice.
                      </p>
                    </div>
                  </div>
                </section>

                {/* Section VI: Disclaimer */}
                <section id="disclaimer" className="scroll-mt-20">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">VI. Disclaimer</h2>
                  <div className="space-y-4 text-gray-700">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                      <h4 className="font-bold text-red-800 mb-3">Important Disclaimer</h4>
                      <p className="text-red-700">
                        The Content provided on these Services is for informational purposes only. BizTradeFairs.com disclaims any liability for outdated or incorrect information. The platform acts merely as a venue where users may act as organizers, exhibitors, or visitors.
                      </p>
                    </div>
                    <p>
                      While every effort is made to ensure accuracy, BizTradeFairs.com does not guarantee the correctness of event details such as dates, venues, timings, pricing, or other information.
                    </p>
                  </div>
                </section>

                {/* Section XIII: Disclaimer & Liability */}
                <section id="liability" className="scroll-mt-20">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">XIII. Disclaimer of Warranties, Limitation of Liability, and Indemnification</h2>
                  
                  <div className="space-y-6">
                    {/* Disclaimer of Warranties */}
                    <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                      <h3 className="text-xl font-semibold text-red-800 mb-4">Disclaimer of Warranties</h3>
                      <p className="text-red-700 mb-4">
                        YOU ACKNOWLEDGE AND AGREE THAT THE SERVICES ARE PROVIDED "AS IS" AND "AS AVAILABLE" AND THAT YOUR USE OF THE SERVICES SHALL BE AT YOUR SOLE RISK.
                      </p>
                      <ul className="text-red-700 space-y-2 text-sm">
                        <li>• Errors, mistakes, or inaccuracies of content</li>
                        <li>• Personal injury or property damage</li>
                        <li>• Unauthorized access to our servers</li>
                        <li>• Interruption or cessation of transmission</li>
                        <li>• Bugs, viruses, Trojan horses, or similar</li>
                        <li>• Loss of your data or content</li>
                      </ul>
                    </div>

                    {/* Limitation of Liability */}
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
                      <h3 className="text-xl font-semibold text-orange-800 mb-4">Limitation of Liability</h3>
                      <p className="text-orange-700 mb-4">
                        TO THE FULLEST EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL THE BIZTRADEFAIRS PARTIES BE LIABLE TO YOU FOR ANY DAMAGES...
                      </p>
                      <div className="bg-white p-4 rounded border">
                        <p className="text-center font-bold text-lg text-gray-900">
                          Total liability limited to: ₹100.00
                        </p>
                      </div>
                    </div>

                    {/* Indemnification */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                      <h3 className="text-xl font-semibold text-blue-800 mb-4">Indemnification</h3>
                      <p className="text-blue-700">
                        You agree to indemnify, defend, and hold harmless the BizTradeFairs Parties from and against any third-party claims, damages, actions, proceedings, demands, losses, liabilities, costs and expenses.
                      </p>
                    </div>
                  </div>
                </section>

                {/* Section XVI: Grievance Officer */}
                <section id="grievance" className="scroll-mt-20">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">XVI. Grievance Officer</h2>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                    <div className="text-center">
                      <h3 className="text-lg font-semibold text-green-800 mb-2">Contact Information</h3>
                      <p className="text-green-700 font-medium">Mr. Danish Ali Khan</p>
                      <p className="text-green-600">Email: nodalofficer@biztradefairs.com</p>
                    </div>
                  </div>
                </section>

                {/* Section XVII: Copyright */}
                <section id="copyright" className="scroll-mt-20">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">XVII. Notice of Copyright Infringement</h2>
                  <div className="space-y-4 text-gray-700">
                    <p>
                      If you believe that your copyright has been infringed, please follow the procedure below:
                    </p>
                    <ol className="list-decimal list-inside space-y-2 pl-4">
                      <li>Identify the copyrighted material that you claim has been infringed</li>
                      <li>Identify the material on our Services that you allege is infringing</li>
                      <li>Include specific statements as required</li>
                      <li>Provide your contact information</li>
                      <li>Provide your physical or electronic signature</li>
                    </ol>
                    <div className="bg-gray-100 p-4 rounded-lg">
                      <p className="font-semibold">Send written communication to:</p>
                      <p className="text-sm mt-2">
                        Maxx Business Media Private Limited<br />
                        T9, 3rd Floor, Swastik Manandi Arcade,<br />
                        Subedar Chatram Road, Seshadripuram,<br />
                        Bengaluru – 560020, India
                      </p>
                    </div>
                  </div>
                </section>

                {/* Acceptance Footer */}
                <div className="bg-gray-50 border-t pt-8 mt-8">
                  <div className="text-center">
                    <p className="text-gray-600 mb-4">
                      By using our services, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <Link 
                        href="/"
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Return to Homepage
                      </Link>
                      <Link 
                        href="/privacy-policy"
                        className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        View Privacy Policy
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

// Component for definition items
function DefinitionItem({ term, definition }: DefinitionItemProps) {
  return (
    <div className="border-l-4 border-blue-200 pl-4 py-1">
      <dt className="font-semibold text-gray-900">{term}</dt>
      <dd className="text-gray-600 text-sm mt-1">{definition}</dd>
    </div>
  );
}