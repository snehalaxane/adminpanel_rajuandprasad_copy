import React, { useState, useEffect } from 'react';
import { Save, Globe, Palette, Mail, Download, RefreshCw } from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface SettingsType {
  websiteStatus: string;
  siteName: string;
  tagline: string;
  primaryColor: string;
  secondaryColor: string;
  emailHost: string;
  emailPort: string;
  emailUser: string;
  emailFrom: string;
  maintenanceMode: boolean;
  googleAnalytics: string;
  facebookPixel: string;
  logoUrl: string;
  emailPassword?: string;
  emailSecure?: boolean;
}

export default function Settings() {
  const [settings, setSettings] = useState<SettingsType>({
    websiteStatus: 'Live',
    siteName: 'Raju & Prasad – Chartered Accountants',
    tagline: 'Excellence in Financial Services',
    primaryColor: '#022683',
    secondaryColor: '#888888',
    emailHost: 'smtp.gmail.com',
    emailPort: '587',
    emailUser: 'notifications@rajuprasad.com',
    emailFrom: 'Raju & Prasad',
    maintenanceMode: false,
    googleAnalytics: 'UA-XXXXXXXXX-X',
    facebookPixel: '',
    logoUrl: '',
    emailPassword: '',
    emailSecure: false
  });

  const [toast, setToast] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllSettings();
  }, []);

  const fetchAllSettings = async () => {
    setLoading(true);
    try {
      const [generalRes, themeRes, emailRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/settings/general`),
        axios.get(`${API_BASE_URL}/api/settings/theme`),
        axios.get(`${API_BASE_URL}/api/settings/email`)
      ]);

      setSettings(prev => ({
        ...prev,
        ...generalRes.data,
        ...themeRes.data,
        ...emailRes.data
      }));

    } catch (err) {
      console.error('Error fetching settings:', err);
      setToast('Error loading settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveGeneral = async () => {
    try {
      const { websiteStatus, siteName, tagline, maintenanceMode } = settings;
      await axios.put(`${API_BASE_URL}/api/settings/general`, { websiteStatus, siteName, tagline, maintenanceMode });
      setToast('General settings saved!');
    } catch (err) {
      setToast('Error saving general settings');
    }
    setTimeout(() => setToast(''), 3000);
  };

  const handleSaveTheme = async () => {
    try {
      const { primaryColor, secondaryColor } = settings;
      await axios.put(`${API_BASE_URL}/api/settings/theme`, { primaryColor, secondaryColor });
      setToast('Theme colors saved!');
    } catch (err) {
      setToast('Error saving theme colors');
    }
    setTimeout(() => setToast(''), 3000);
  };

  const handleSaveEmail = async () => {
    try {
      const { emailHost, emailPort, emailUser, emailFrom, emailPassword, emailSecure } = settings;
      await axios.put(`${API_BASE_URL}/api/settings/email`, { emailHost, emailPort, emailUser, emailFrom, emailPassword, emailSecure });
      setToast('Email configuration saved!');
    } catch (err) {
      setToast('Error saving email config');
    }
    setTimeout(() => setToast(''), 3000);
  };

  const handleSaveAll = async () => {
    setToast('Saving all settings...');
    try {
      await Promise.all([
        handleSaveGeneral(),
        handleSaveTheme(),
        handleSaveEmail()
      ]);
      setToast('All settings saved successfully!');
    } catch (err) {
      setToast('Error saving some settings');
    }
    setTimeout(() => setToast(''), 3000);
  };

  // const handleBackup = () => {
  //   setToast('Backup created successfully!');
  //   setTimeout(() => setToast(''), 3000);
  // };

  const handleClearCache = async () => {
    setToast('Clearing cache...');
    try {
      let clearedItems = [];

      // Clear browser service worker caches
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        if (cacheNames.length > 0) {
          await Promise.all(
            cacheNames.map(cacheName => caches.delete(cacheName))
          );
          clearedItems.push(`${cacheNames.length} cache(s)`);
          console.log('Cleared service worker caches:', cacheNames);
        }
      }

      // Clear sessionStorage
      const sessionSize = JSON.stringify(sessionStorage).length;
      sessionStorage.clear();
      if (sessionSize > 0) {
        clearedItems.push('session storage');
        console.log('Cleared session storage');
      }

      // Clear localStorage
      const localSize = JSON.stringify(localStorage).length;
      localStorage.clear();
      if (localSize > 0) {
        clearedItems.push('local storage');
        console.log('Cleared local storage');
      }


      const message = clearedItems.length > 0
        ? `Cache cleared`
        : 'No cache found to clear';

      setToast(message);
      console.log('✅ Cache clear completed:', message);
    } catch (err) {
      console.error('Error clearing cache:', err);
      setToast('Error clearing cache: ' + err);
    }
    setTimeout(() => setToast(''), 4000);
  };


  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("logo", file);

    try {
      const res = await axios.post(
        `${API_BASE_URL}/api/settings/general/logo`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      setSettings(prev => ({
        ...prev,
        logoUrl: res.data.logoUrl
      }));

      setToast("Logo updated successfully!");
    } catch (err) {
      setToast("Error uploading logo");
    }

    setTimeout(() => setToast(''), 3000);
  };


  return (
    <div className="p-8 bg-gradient-to-br from-[#0F1115] via-[#0F1115] to-[#16181D] min-h-full">
      <div className="mb-8 animate-fade-in">
        <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
        <p className="text-[#888888]">Manage global website settings and configurations</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Settings Panels */}
        <div className="lg:col-span-2 space-y-6">
          {/* General Settings */}
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-[#E6E6E6] flex items-center gap-2">
                <Globe className="w-5 h-5" />
                General Settings
              </h2>
              <button
                onClick={handleSaveGeneral}
                className="flex items-center gap-2 px-3 py-1.5 bg-[#022683] text-white rounded hover:bg-[#033aa0] text-sm font-medium transition-colors shadow-md"
              >
                <Save className="w-4 h-4" />
                Save General
              </button>
            </div>

            <div className="space-y-4 bg-gradient-to-br from-[#16181D] to-[#1a1d24] rounded-lg shadow-lg p-6 border border-[rgba(136,136,136,0.25)] hover-card-lift">
              <div>
                <label className="block text-sm font-medium text-[#888888] mb-2">
                  Website Status
                </label>
                <select
                  value={settings.websiteStatus}
                  onChange={(e) => setSettings({ ...settings, websiteStatus: e.target.value })}
                  className="w-full px-4 py-2 bg-[#0F1115] border border-[rgba(136,136,136,0.25)] rounded-lg focus:ring-2 focus:ring-[#022683] focus:border-transparent outline-none transition-all text-[#E6E6E6]"
                >
                  <option value="Live">Live</option>
                  <option value="Maintenance">Maintenance Mode</option>
                  <option value="Draft">Draft</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#888888] mb-2">
                  Site Name
                </label>
                <input
                  type="text"
                  value={settings.siteName}
                  onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                  className="w-full px-4 py-2 bg-[#0F1115] border border-[rgba(136,136,136,0.25)] rounded-lg focus:ring-2 focus:ring-[#022683] focus:border-transparent outline-none transition-all text-[#E6E6E6]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#888888] mb-2">
                  Tagline
                </label>
                <input
                  type="text"
                  value={settings.tagline}
                  onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
                  className="w-full px-4 py-2 bg-[#0F1115] border border-[rgba(136,136,136,0.25)] rounded-lg focus:ring-2 focus:ring-[#022683] focus:border-transparent outline-none transition-all text-[#E6E6E6]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#888888] mb-2">
                  Website Logo
                </label>

                {settings.logoUrl && (
                  <img
                    src={`${API_BASE_URL}${settings.logoUrl}`}
                    alt="Logo Preview"
                    className="h-16 mb-3 object-contain bg-[#0F1115] p-2 rounded"
                  />
                )}

                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                />
              </div>


              {/* <div>
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={settings.maintenanceMode}
                    onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })}
                    className="w-4 h-4 text-[#022683] border-gray-300 rounded focus:ring-[#022683] transition-all"
                  />
                  <span className="text-sm text-[#888888] group-hover:text-[#E6E6E6] transition-colors">Enable Maintenance Mode</span>
                </label>
              </div> */}
            </div>
          </div>

          {/* Theme Colors */}
          <div className="bg-gradient-to-br from-[#16181D] to-[#1a1d24] rounded-lg shadow-lg p-6 border border-[rgba(136,136,136,0.25)] hover-card-lift">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-[#E6E6E6] flex items-center gap-2">
                <Palette className="w-5 h-5" />
                Theme Colors
              </h2>
              <button
                onClick={handleSaveTheme}
                className="flex items-center gap-2 px-3 py-1.5 bg-[#022683] text-white rounded hover:bg-[#033aa0] text-sm font-medium transition-colors shadow-md"
              >
                <Save className="w-4 h-4" />
                Save Colors
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#888888] mb-2">
                  Primary Color
                </label>
                <div className="flex gap-3">
                  <input
                    type="color"
                    value={settings.primaryColor}
                    onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                    className="w-20 h-12 border border-[rgba(136,136,136,0.25)] rounded cursor-pointer transition-transform hover:scale-105 bg-[#0F1115]"
                  />
                  <input
                    type="text"
                    value={settings.primaryColor}
                    onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                    className="flex-1 px-4 py-2 bg-[#0F1115] border border-[rgba(136,136,136,0.25)] rounded-lg focus:ring-2 focus:ring-[#022683] focus:border-transparent outline-none transition-all uppercase text-[#E6E6E6]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#888888] mb-2">
                  Secondary Color
                </label>
                <div className="flex gap-3">
                  <input
                    type="color"
                    value={settings.secondaryColor}
                    onChange={(e) => setSettings({ ...settings, secondaryColor: e.target.value })}
                    className="w-20 h-12 border border-[rgba(136,136,136,0.25)] rounded cursor-pointer transition-transform hover:scale-105 bg-[#0F1115]"
                  />
                  <input
                    type="text"
                    value={settings.secondaryColor}
                    onChange={(e) => setSettings({ ...settings, secondaryColor: e.target.value })}
                    className="flex-1 px-4 py-2 bg-[#0F1115] border border-[rgba(136,136,136,0.25)] rounded-lg focus:ring-2 focus:ring-[#022683] focus:border-transparent outline-none transition-all uppercase text-[#E6E6E6]"
                  />
                </div>
              </div>

              <div className="p-4 bg-[rgba(136,136,136,0.05)] rounded-lg border border-[rgba(136,136,136,0.25)] shadow-inner">
                <p className="text-sm text-[#888888] mb-3 font-medium">Color Preview:</p>
                <div className="flex gap-3">
                  <div
                    className="flex-1 h-16 rounded-lg flex items-center justify-center text-white font-bold shadow-sm transition-all"
                    style={{ backgroundColor: settings.primaryColor }}
                  >
                    Primary
                  </div>
                  <div
                    className="flex-1 h-16 rounded-lg flex items-center justify-center text-white font-bold shadow-sm transition-all"
                    style={{ backgroundColor: settings.secondaryColor }}
                  >
                    Secondary
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Email Configuration */}
          <div className="bg-gradient-to-br from-[#16181D] to-[#1a1d24] rounded-lg shadow-lg p-6 border border-[rgba(136,136,136,0.25)] hover-card-lift">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-[#E6E6E6] flex items-center gap-2">
                <Mail className="w-5 h-5" />
                Email Configuration (SMTP)
              </h2>
              <button
                onClick={handleSaveEmail}
                className="flex items-center gap-2 px-3 py-1.5 bg-[#022683] text-white rounded hover:bg-[#033aa0] text-sm font-medium transition-colors shadow-md"
              >
                <Save className="w-4 h-4" />
                Save Email Config
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#888888] mb-2">
                    SMTP Host
                  </label>
                  <input
                    type="text"
                    value={settings.emailHost}
                    onChange={(e) => setSettings({ ...settings, emailHost: e.target.value })}
                    className="w-full px-4 py-2 bg-[#0F1115] border border-[rgba(136,136,136,0.25)] rounded-lg focus:ring-2 focus:ring-[#022683] focus:border-transparent outline-none transition-all text-[#E6E6E6]"
                    placeholder="e.g. smtp.gmail.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#888888] mb-2">
                    SMTP Port
                  </label>
                  <input
                    type="text"
                    value={settings.emailPort}
                    onChange={(e) => setSettings({ ...settings, emailPort: e.target.value })}
                    className="w-full px-4 py-2 bg-[#0F1115] border border-[rgba(136,136,136,0.25)] rounded-lg focus:ring-2 focus:ring-[#022683] focus:border-transparent outline-none transition-all text-[#E6E6E6]"
                    placeholder="e.g. 587"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#888888] mb-2">
                  Email User
                </label>
                <input
                  type="email"
                  value={settings.emailUser}
                  onChange={(e) => setSettings({ ...settings, emailUser: e.target.value })}
                  className="w-full px-4 py-2 bg-[#0F1115] border border-[rgba(136,136,136,0.25)] rounded-lg focus:ring-2 focus:ring-[#022683] focus:border-transparent outline-none transition-all text-[#E6E6E6]"
                  placeholder="admin@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#888888] mb-2">
                  From Name
                </label>
                <input
                  type="text"
                  value={settings.emailFrom}
                  onChange={(e) => setSettings({ ...settings, emailFrom: e.target.value })}
                  className="w-full px-4 py-2 bg-[#0F1115] border border-[rgba(136,136,136,0.25)] rounded-lg focus:ring-2 focus:ring-[#022683] focus:border-transparent outline-none transition-all text-[#E6E6E6]"
                  placeholder="Raju & Prasad"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#888888] mb-2">
                  SMTP Password
                </label>
                <input
                  type="password"
                  value={settings.emailPassword}
                  onChange={(e) => setSettings({ ...settings, emailPassword: e.target.value })}
                  className="w-full px-4 py-2 bg-[#0F1115] border border-[rgba(136,136,136,0.25)] rounded-lg focus:ring-2 focus:ring-[#022683] focus:border-transparent outline-none transition-all text-[#E6E6E6]"
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label className="flex items-center gap-3 cursor-pointer group mt-4">
                  <input
                    type="checkbox"
                    checked={settings.emailSecure}
                    onChange={(e) => setSettings({ ...settings, emailSecure: e.target.checked })}
                    className="w-4 h-4 text-[#022683] border-[rgba(136,136,136,0.25)] rounded focus:ring-[#022683] transition-all bg-[#0F1115]"
                  />
                  <span className="text-sm text-[#888888] group-hover:text-[#E6E6E6] transition-colors">
                    Secure Connection (SSL/TLS - use for Port 465)
                  </span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Actions Panel */}
        <div className="lg:col-span-1 space-y-6">
          {/* Quick Actions */}
          <div className="bg-gradient-to-br from-[#16181D] to-[#1a1d24] rounded-lg shadow-lg p-6 border border-[rgba(136,136,136,0.25)] hover-card-lift">
            <h3 className="font-bold text-[#E6E6E6] mb-4">Quick Actions</h3>

            <div className="space-y-3">
              <button
                onClick={handleSaveAll}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-[#022683] to-[#033aa0] text-white rounded-lg hover:from-[#033aa0] hover:to-[#022683] shadow-lg transition-all active:scale-95 font-bold"
              >
                <Save className="w-4 h-4" />
                Save All Settings
              </button>

              {/* <button
                onClick={handleBackup}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-500 shadow-lg transition-all active:scale-95 font-bold"
              >
                <Download className="w-4 h-4" />
                Create Backup
              </button> */}

              <button
                onClick={handleClearCache}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[rgba(136,136,136,0.1)] text-[#E6E6E6] rounded-lg hover:bg-[rgba(136,136,136,0.2)] transition-all active:scale-95 border border-[rgba(136,136,136,0.25)]"
              >
                <RefreshCw className="w-4 h-4" />
                Clear Cache
              </button>
            </div>
          </div>

          {/* System Info */}
          {/* <div className="bg-gradient-to-br from-[#16181D] to-[#1a1d24] rounded-lg shadow-lg p-6 border border-[rgba(136,136,136,0.25)] hover-card-lift">
            <h3 className="font-bold text-[#E6E6E6] mb-4">System Information</h3>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-[#888888]">Version</span>
                <span className="font-medium text-[#E6E6E6]">2.5.0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#888888]">Last Backup</span>
                <span className="font-medium text-[#E6E6E6]">2026-02-06</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#888888]">Database Size</span>
                <span className="font-medium text-[#E6E6E6]">45.2 MB</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#888888]">Media Size</span>
                <span className="font-medium text-[#E6E6E6]">1.8 GB</span>
              </div>
            </div>
          </div> */}

          {/* Warning */}
          <div className="bg-[rgba(234,179,8,0.1)] border border-yellow-800/50 rounded-lg p-4">
            <p className="text-sm text-yellow-500">
              <strong>Note:</strong> Changes to theme colors and email settings require saving to take effect across the website.
            </p>
          </div>
        </div>
      </div>

      {toast && (
        <div className="fixed bottom-8 right-8 bg-[#1a1d24] text-[#E6E6E6] px-6 py-3 rounded-lg shadow-2xl border border-[#022683]/50 flex items-center gap-3 z-50 animate-fade-in">
          <div className="w-2 h-2 bg-[#022683] rounded-full animate-ping"></div>
          {toast}
        </div>
      )}
    </div>
  );
}
