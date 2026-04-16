import React from 'react';
import LegalLayout from './LegalLayout';
import { Mail, Phone, MapPin, Clock, MessageSquare } from 'lucide-react';

const ContactUs: React.FC = () => {
  return (
    <LegalLayout
      title="Contact Us"
      icon={<MessageSquare className="w-8 h-8" />}
    >
      <div className="space-y-10">
        <p className="text-gray-600 leading-relaxed">
          Have questions about the NG-Santvana Aptitude Quiz or need technical assistance?
          Our support team is here to help you excel. Reach out to us through any of the channels below.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Contact Methods */}
          <div className="space-y-6">
            <div className="flex items-start">
              <div className="flex-shrink-0 p-3 bg-blue-50 rounded-xl text-blue-600">
                <Mail className="w-6 h-6" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-bold text-gray-900">Email Us</h3>
                <p className="text-gray-600">For general inquiries and support:</p>
                <a href="mailto:help@nationalgroupindia.org" className="text-blue-600 font-medium hover:underline">
                  help@nationalgroupindia.org
                </a>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex-shrink-0 p-3 bg-green-50 rounded-xl text-green-600">
                <Phone className="w-6 h-6" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-bold text-gray-900">Call Us</h3>
                <p className="text-gray-600">Technical support hotline:</p>
                <a href="tel:+919377880093" className="text-green-600 font-medium hover:underline">
                  +91 93778 80093
                </a>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex-shrink-0 p-3 bg-purple-50 rounded-xl text-purple-600">
                <Clock className="w-6 h-6" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-bold text-gray-900">Support Hours</h3>
                <p className="text-gray-600">Monday - Friday</p>
                <p className="text-gray-900 font-medium">10:00 AM — 06:00 PM (IST)</p>
              </div>
            </div>
          </div>

          {/* Address / Location */}
          <div className="p-6 bg-slate-50 rounded-3xl border border-gray-100">
            <div className="flex items-center mb-4">
              <MapPin className="w-6 h-6 text-red-500 mr-2" />
              <h3 className="text-lg font-bold text-gray-900">Our Office</h3>
            </div>
            <div className="text-gray-600 space-y-2">
              <p className="font-semibold text-gray-900">National Computers (NG-Santvana)</p>
              <p>407 to 409, Aagam Emporio,</p>
              <p>Near J. H. Ambani School BRTS Bus stop,</p>
              <p>University Road, Surat-395007,</p>
              <p>Gujarat, India</p>
            </div>

          </div>
        </div>

        <div className="mt-12 p-8 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl text-white">
          <h3 className="text-xl font-bold mb-2">Need a faster response?</h3>
          <p className="opacity-90 mb-6">
            Log in to your student dashboard to create a support ticket directly.
            Registered students receive priority assistance.
          </p>
          <div className="flex space-x-4">
            <button
              className="px-6 py-2 bg-white text-blue-600 rounded-xl font-bold hover:bg-opacity-90 transition-all"
              onClick={() => window.location.href = '/'}
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    </LegalLayout>
  );
};

export default ContactUs;
