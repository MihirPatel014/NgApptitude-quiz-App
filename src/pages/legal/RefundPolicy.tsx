import React from 'react';
import LegalLayout from './LegalLayout';
import { RefreshCcw } from 'lucide-react';

const RefundPolicy: React.FC = () => {
  return (
    <LegalLayout title="Refund Policy" icon={<RefreshCcw className="w-8 h-8" />}>
      <div className="space-y-8">
        <section>
          <p className="text-gray-600 leading-relaxed">
            This Refund Policy governs the terms under which refunds are issued for services provided by https://ng-santvana-test.com/, operated by National Computers Partnership Firm.
            <br />
            <span className="inline-block mt-2 font-semibold">Effective Date: 01/04/2026</span>
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-4 flex items-center text-gray-900">
            <span className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center mr-3 text-sm">1</span>
            Overview
          </h2>
          <div className="ml-11">
            <p className="text-gray-600">
              https://ng-santvana-test.com/ is an online platform that provides aptitude tests, NEET online tests, assessments, and related services. By purchasing any test, package, or service on our platform, you agree to this Refund Policy.
            </p>
          </div>
        </section>

        <section className="bg-orange-50 p-6 rounded-2xl border border-orange-100">
          <h2 className="text-xl font-bold mb-4 flex items-center text-orange-900">
            <span className="w-8 h-8 bg-orange-100 text-orange-600 rounded-lg flex items-center justify-center mr-3 text-sm uppercase">2</span>
            No Refund After Test Attempt
          </h2>
          <div className="ml-11">
            <p className="text-orange-800 font-medium mb-3">Once a user has:</p>
            <ul className="list-disc list-inside space-y-2 text-orange-700">
              <li>Started a test, or</li>
              <li>Attempted any part of the test</li>
            </ul>
            <p className="mt-4 text-orange-900 font-bold">No refund will be issued under any circumstances.</p>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-4 flex items-center text-gray-900">
            <span className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center mr-3 text-sm">3</span>
            Refund Eligibility
          </h2>
          <div className="ml-11">
            <p className="text-gray-600 mb-3">Refunds may be considered only under the following conditions:</p>
            <ul className="list-disc list-inside space-y-2 text-gray-600">
              <li>Duplicate payment made for the same test/package</li>
              <li>Technical error from our side preventing access to the purchased test</li>
              <li>Payment deducted but test not activated in user account</li>
              <li>Wrong Test package purchased</li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-4 flex items-center text-gray-900">
            <span className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center mr-3 text-sm">4</span>
            Non-Refundable Cases
          </h2>
          <div className="ml-11">
            <p className="text-gray-600 mb-3">Refunds will not be provided in the following situations:</p>
            <ul className="list-disc list-inside space-y-2 text-gray-600">
              <li>User changes mind after purchase</li>
              <li>Failure to complete the test within the validity period</li>
              <li>Poor performance or dissatisfaction with results</li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-4 flex items-center text-gray-900">
            <span className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center mr-3 text-sm">5</span>
            Refund Request Process
          </h2>
          <div className="ml-11">
            <p className="text-gray-600 mb-4">To request a refund, users must email us at <a href="mailto:account@nationalgroupindia.org" className="text-blue-600 font-semibold underline">account@nationalgroupindia.org</a> with the following details:</p>
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-gray-700">Registered Name</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-gray-700">Registered Mobile & Email</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-gray-700">Transaction ID</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-gray-700">Reason for refund request</span>
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-4 flex items-center text-gray-900">
            <span className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center mr-3 text-sm">6</span>
            Refund Processing Time
          </h2>
          <div className="ml-11 text-gray-600">
            <ul className="list-disc list-inside space-y-2">
              <li>Approved refunds will be processed within 10–15 business days</li>
              <li>Refund will be credited via the original payment method (via Razorpay)</li>
            </ul>
          </div>
        </section>


      </div>
    </LegalLayout>
  );
};

export default RefundPolicy;
