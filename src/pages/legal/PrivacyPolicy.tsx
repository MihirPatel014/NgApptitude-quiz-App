import React from 'react';
import LegalLayout from './LegalLayout';
import { ShieldCheck } from 'lucide-react';

const PrivacyPolicy: React.FC = () => {
  return (
    <LegalLayout title="Privacy Policy" icon={<ShieldCheck className="w-8 h-8" />}>
      <div className="space-y-8">
        <section>
          <p className="text-gray-600 leading-relaxed">
            Welcome to NG-Santvana (accessible at https://ng-santvana-test.com/), operated by National Computers. We value your privacy and are committed to protecting your personal information.
            <br />
            <span className="inline-block mt-2 font-semibold">Effective Date: 01/04/2026</span>
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-4 flex items-center text-gray-900">
            <span className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center mr-3 text-sm">1</span>
            Information We Collect
          </h2>
          <div className="ml-11 space-y-4">
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">a) Personal Information</h3>
              <ul className="list-disc list-inside space-y-1 text-gray-600">
                <li>Full Name</li>
                <li>Email Address</li>
                <li>Phone Number</li>
                <li>Date of Birth</li>
                <li>Address/City</li>
                <li>Educational details with School/College Name (if required for tests)</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">b) Payment Information</h3>
              <ul className="list-disc list-inside space-y-1 text-gray-600">
                <li>When you make a payment, your payment details are processed securely through third-party payment gateways (such as Razorpay).</li>
                <li>We do not store your card or banking information.</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">c) Technical Data</h3>
              <ul className="list-disc list-inside space-y-1 text-gray-600">
                <li>IP Address</li>
                <li>Browser type</li>
                <li>Device information</li>
                <li>Usage data (pages visited, time spent)</li>
              </ul>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-4 flex items-center text-gray-900">
            <span className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center mr-3 text-sm">2</span>
            How We Use Your Information
          </h2>
          <div className="ml-11">
            <ul className="list-disc list-inside space-y-2 text-gray-600">
              <li>Conducting and managing aptitude tests</li>
              <li>User authentication and account management</li>
              <li>Processing payments</li>
              <li>Improving our platform and services</li>
              <li>Communicating important updates</li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-4 flex items-center text-gray-900">
            <span className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center mr-3 text-sm">3</span>
            Sharing of Information
          </h2>
          <div className="ml-11">
            <p className="text-gray-600 mb-3">We do not sell or rent your personal data. We may share your data with:</p>
            <ul className="list-disc list-inside space-y-2 text-gray-600">
              <li>Payment gateway providers (e.g., Razorpay)</li>
              <li>Hosting and technical service providers</li>
              <li>Legal authorities if required by law</li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-4 flex items-center text-gray-900">
            <span className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center mr-3 text-sm">4</span>
            Data Security
          </h2>
          <div className="ml-11">
            <p className="text-gray-600">We implement appropriate security measures to protect your data from unauthorized access, misuse, or disclosure.</p>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-4 flex items-center text-gray-900">
            <span className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center mr-3 text-sm">5</span>
            Cookies
          </h2>
          <div className="ml-11">
            <p className="text-gray-600 mb-3">We may use cookies to:</p>
            <ul className="list-disc list-inside space-y-2 text-gray-600">
              <li>Improve user experience</li>
              <li>Track usage patterns</li>
              <li>Maintain session information</li>
            </ul>
            <p className="mt-4 text-sm text-gray-500 italic">You can disable cookies through your browser settings.</p>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-4 flex items-center text-gray-900">
            <span className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center mr-3 text-sm">6</span>
            User Rights
          </h2>
          <div className="ml-11">
            <p className="text-gray-600 mb-3">You have the right to:</p>
            <ul className="list-disc list-inside space-y-2 text-gray-600">
              <li>Access your personal data</li>
              <li>Request correction or deletion</li>
              <li>Withdraw consent</li>
            </ul>
            <p className="mt-4 text-blue-600">To exercise these rights, contact us at: <a href="mailto:account@nationalgroupindia.org" className="underline font-semibold">account@nationalgroupindia.org</a></p>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-4 flex items-center text-gray-900">
            <span className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center mr-3 text-sm">7</span>
            Third-Party Links
          </h2>
          <div className="ml-11">
            <p className="text-gray-600">Our website may contain links to third-party websites. We are not responsible for their privacy practices.</p>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-4 flex items-center text-gray-900">
            <span className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center mr-3 text-sm">8</span>
            Changes to This Policy
          </h2>
          <div className="ml-11">
            <p className="text-gray-600">We may update this Privacy Policy from time to time. Updates will be posted on this page.</p>
          </div>
        </section>


      </div>
    </LegalLayout>
  );
};

export default PrivacyPolicy;
