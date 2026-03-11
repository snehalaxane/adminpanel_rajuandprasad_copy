import React, { useState, useEffect } from 'react';
import axios from "axios";
import { Save, MapPin, Phone, Mail, Eye } from 'lucide-react';


const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
export default function FooterContactManager() {

  const [contactData, setContactData] = useState({
    sectionTitle: '',
    address: '',
    phone: '',
    email: ''
  });

  const [toast, setToast] = useState('');

   useEffect(() => {
    fetchFooter();
  }, []);

  const fetchFooter = async () => {
    try {
     const res = await axios.get(
  `${API_BASE_URL}/api/footer-contact`
);

      if (res.data) {
        setContactData(res.data);
      }
    } catch (error) {
      console.error(error);
    }
  };
  
  const handleSave = async () => {
    try {
     await axios.put(
  `${API_BASE_URL}/api/footer-contact`,
  contactData
);
      setToast('Footer Contact saved successfully!');
      setTimeout(() => setToast(''), 3000);
    } catch (error) {
      console.error(error);
    }
  };

  

  return (
    <div className="p-8 bg-gradient-to-br from-[#0F1115] via-[#0F1115] to-[#16181D] min-h-full">
      <div className="mb-8 animate-fade-in">
        <h1 className="text-3xl font-bold text-white mb-2">Footer – Contact Us</h1>
        <p className="text-[#888888]">Manage contact information displayed in website footer</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Editor Section */}
        <div className="bg-gradient-to-br from-[#16181D] to-[#1a1d24] rounded-lg shadow-lg p-6 border border-[rgba(136,136,136,0.25)] hover-card-lift animate-fade-in">
          <h2 className="text-xl font-bold text-[#E6E6E6] mb-6 flex items-center gap-2">
            <span className="w-1 h-6 bg-gradient-to-b from-[#888888] to-[#022683] rounded-full"></span>
            Contact Information
          </h2>

          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-[#888888] mb-2">
                Section Title
              </label>
              <input
                type="text"
                value={contactData.sectionTitle}
                onChange={(e) => setContactData({ ...contactData, sectionTitle: e.target.value })}
                className="w-full px-4 py-2.5 bg-[#0F1115] border border-[rgba(136,136,136,0.25)] rounded-lg focus:ring-2 focus:ring-[#022683] focus:border-[#022683] outline-none text-[#E6E6E6]"
                placeholder="Contact Us"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#888888] mb-2">
                Address
              </label>
              <textarea
                value={contactData.address}
                onChange={(e) => setContactData({ ...contactData, address: e.target.value })}
                rows={3}
                className="w-full px-4 py-2.5 bg-[#0F1115] border border-[rgba(136,136,136,0.25)] rounded-lg focus:ring-2 focus:ring-[#022683] focus:border-[#022683] outline-none text-[#E6E6E6]"
                placeholder="Enter complete address"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#888888] mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                value={contactData.phone}
                onChange={(e) => setContactData({ ...contactData, phone: e.target.value })}
                className="w-full px-4 py-2.5 bg-[#0F1115] border border-[rgba(136,136,136,0.25)] rounded-lg focus:ring-2 focus:ring-[#022683] focus:border-[#022683] outline-none text-[#E6E6E6]"
                placeholder="+91 40 2331 6023"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#888888] mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={contactData.email}
                onChange={(e) => setContactData({ ...contactData, email: e.target.value })}
                className="w-full px-4 py-2.5 bg-[#0F1115] border border-[rgba(136,136,136,0.25)] rounded-lg focus:ring-2 focus:ring-[#022683] focus:border-[#022683] outline-none text-[#E6E6E6]"
                placeholder="info@rajuprasad.com"
              />
            </div>

            <div className="pt-4">
              <button
                onClick={handleSave}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-[#022683] to-[#033aa0] text-white rounded-lg hover:from-[#033aa0] hover:to-[#022683] transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
              >
                <Save className="w-5 h-5" />
                Save & Publish
              </button>
            </div>

            <div className="p-4 bg-[rgba(2,38,131,0.1)] border border-[rgba(136,136,136,0.25)] rounded-lg">
              <p className="text-sm text-[#E6E6E6]">
                <strong>ℹ️ Note:</strong> This contact information is always visible in the website footer. Changes are published instantly after saving.
              </p>
            </div>
          </div>
        </div>

        {/* Preview Section */}
        <div className="bg-gradient-to-br from-[#16181D] to-[#1a1d24] rounded-lg shadow-lg p-6 border border-[rgba(136,136,136,0.25)] hover-card-lift animate-fade-in">
          <h3 className="font-bold text-[#E6E6E6] mb-4 flex items-center gap-2">
            <Eye className="w-5 h-5 text-[#888888]" />
            Footer Preview
          </h3>

          <div className="p-6 bg-gradient-to-r from-[#888888] to-[#022683] rounded-lg shadow-lg">
            <h4 className="text-lg font-bold text-white mb-4">{contactData.sectionTitle}</h4>
            
            <div className="space-y-3">
              <div className="flex items-start gap-3 text-white">
                <MapPin className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm whitespace-pre-line">{contactData.address}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-white">
                <Phone className="w-5 h-5 flex-shrink-0" />
                <a 
                  href={`tel:${contactData.phone.replace(/\s/g, '')}`}
                  className="text-sm hover:underline cursor-pointer"
                >
                  {contactData.phone}
                </a>
              </div>

              <div className="flex items-center gap-3 text-white">
                <Mail className="w-5 h-5 flex-shrink-0" />
                <a 
                  href={`mailto:${contactData.email}`}
                  className="text-sm hover:underline cursor-pointer"
                >
                  {contactData.email}
                </a>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-[#0F1115] rounded-lg border border-[rgba(136,136,136,0.25)]">
            <h4 className="text-sm font-bold text-[#E6E6E6] mb-3">Display Information</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[#888888]">Section:</span>
                <span className="font-medium text-[#E6E6E6]">Website Footer</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#888888]">Visibility:</span>
                <span className="font-medium text-green-400">Always Visible</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#888888]">Phone Action:</span>
                <span className="font-medium text-[#E6E6E6]">Click-to-Call</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#888888]">Email Action:</span>
                <span className="font-medium text-[#E6E6E6]">Click-to-Mail</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Success Toast */}
      {toast && (
        <div className="fixed bottom-8 right-8 bg-gradient-to-r from-[#888888] to-[#022683] text-white px-6 py-3 rounded-lg shadow-lg animate-fade-in border border-[rgba(255,255,255,0.2)]">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-white rounded-full"></div>
            {toast}
          </div>
        </div>
      )}
    </div>
  );
}
