import React from 'react';
import LegalLayout from './LegalLayout';
import { FileText } from 'lucide-react';

const TermsAndConditions: React.FC = () => {
  return (
    <LegalLayout title="Terms and Conditions" icon={<FileText className="w-8 h-8" />}>
      <div className="space-y-8">
        <section>
          <p className="text-gray-600 leading-relaxed">
            Welcome to NG-Santvana Aptitude Test Portal ("Platform"), operated by National Computers ("Partnership Firm").
            By accessing or using our website https://ng-santvana-test.com/ ("Website"), you agree to comply with and be bound by the following Terms and Conditions.
            <br />
            <span className="inline-block mt-2 font-semibold">Effective Date: 01/04/2026</span>
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-4 flex items-center text-gray-900">
            <span className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center mr-3 text-sm">1</span>
            Use of the Platform
          </h2>
          <div className="ml-11">
            <ul className="list-disc list-inside space-y-2 text-gray-600">
              <li>The Platform provides online Aptitude Test, NEET Test, Assessments, and related services.</li>
              <li>Users must be at least 18 years old or use the Platform under parental/guardian supervision.</li>
              <li>You agree to provide accurate and complete information during registration.</li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-4 flex items-center text-gray-900">
            <span className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center mr-3 text-sm">2</span>
            User Account
          </h2>
          <div className="ml-11">
            <ul className="list-disc list-inside space-y-2 text-gray-600">
              <li>You are responsible for maintaining the confidentiality of your login credentials.</li>
              <li>Any activity under your account will be considered your responsibility.</li>
              <li>We reserve the right to suspend or terminate accounts for misuse or violation of terms.</li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-4 flex items-center text-gray-900">
            <span className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center mr-3 text-sm">3</span>
            Payments and Fees
          </h2>
          <div className="ml-11">
            <ul className="list-disc list-inside space-y-2 text-gray-600">
              <li>Certain tests or services on the Platform may require payment.</li>
              <li>Payments are processed securely through third-party payment gateways such as Razorpay.</li>
              <li>By making a payment, you agree to the pricing, billing, and refund terms.</li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-4 flex items-center text-gray-900">
            <span className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center mr-3 text-sm">4</span>
            Refund Policy
          </h2>
          <div className="ml-11">
            <ul className="list-disc list-inside space-y-2 text-gray-600">
              <li>All payments made are non-refundable, unless otherwise stated.</li>
              <li>In case of technical errors or failed transactions, users may contact support for resolution.</li>
              <li>Refunds, if applicable, will be processed within a reasonable timeframe.</li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-4 flex items-center text-gray-900">
            <span className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center mr-3 text-sm">5</span>
            Intellectual Property
          </h2>
          <div className="ml-11">
            <ul className="list-disc list-inside space-y-2 text-gray-600">
              <li>All content on the Platform (tests, questions, design, logos, etc.) is the property of National Computers.</li>
              <li>Users may not copy, reproduce, or distribute content without prior written permission.</li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-4 flex items-center text-gray-900">
            <span className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center mr-3 text-sm">6</span>
            Prohibited Activities
          </h2>
          <div className="ml-11">
            <p className="text-gray-600 mb-3">Users agree not to:</p>
            <ul className="list-disc list-inside space-y-2 text-gray-600">
              <li>Use unfair means during tests (cheating, impersonation, etc.)</li>
              <li>Attempt to hack, disrupt, or damage the Platform</li>
              <li>Upload harmful or malicious content</li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-4 flex items-center text-gray-900">
            <span className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center mr-3 text-sm">7</span>
            Limitation of Liability
          </h2>
          <div className="ml-11">
            <ul className="list-disc list-inside space-y-2 text-gray-600">
              <li>We do not guarantee uninterrupted or error-free service.</li>
              <li>National Computers shall not be held liable for any direct, indirect, or incidental damages arising from use of the Platform.</li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-4 flex items-center text-gray-900">
            <span className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center mr-3 text-sm">8</span>
            Governing Law
          </h2>
          <div className="ml-11">
            <p className="text-gray-600">
              These Terms shall be governed by the laws of India. Any disputes shall be subject to the jurisdiction of courts in Surat, Gujarat.
            </p>
          </div>
        </section>


        <p className="text-center text-gray-500 italic text-sm">
          By using our Platform, you acknowledge that you have read, understood, and agreed to these Terms and Conditions.
        </p>
      </div>
    </LegalLayout>
  );
};

export default TermsAndConditions;
