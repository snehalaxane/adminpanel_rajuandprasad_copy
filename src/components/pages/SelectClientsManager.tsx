import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Plus,
  Trash2,
  ChevronDown,
  ChevronRight,
  Save,
  Loader2,
  Layout,
  PieChart,
  Sparkles,
  Factory,
  Briefcase,
  Building2,
  Landmark,
  Heart,
  User,
  Globe,
  Check
} from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const resolveImageUrl = (url: string | undefined) => {
  if (!url) return '';
  if (url.startsWith('http') || url.startsWith('data:')) return url;
  return `${API_BASE_URL.replace(/\/$/, '')}/${url.replace(/^\//, '')}`;
};

// Icon mapping for preview
const iconMap: Record<string, any> = {
  Factory,
  Briefcase,
  Building2,
  Landmark,
  Heart,
  User,
  Globe
};

export default function SelectClientsManager() {
  const [sectors, setSectors] = useState<any[]>([]);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [introData, setIntroData] = useState({
    title: 'Select Clients',
    subtitle: 'Serving clients across diverse industries with trust and commitment.',
    introTitle: 'Our Portfolio',
    introDescription1: 'The Firm represents a diversified portfolio of clients across various sectors.',
    introDescription2: 'Our expertise spans multiple industries and we take pride in delivering customized solutions.',
    backgroundImage: '',
    stats: [
      { label: 'Industry Sectors', value: '7', enabled: true },
      { label: 'Service Categories', value: '76+', enabled: true },
      { label: 'Years of Trust', value: '46+', enabled: true }
    ],
    introEnabled: true,
    statsEnabled: true,
    enabled: true
  });
  const [loading, setLoading] = useState(false);
  const [savingIntro, setSavingIntro] = useState(false);
  const [expandedSector, setExpandedSector] = useState<string | null>(null);
  const [toast, setToast] = useState('');
  const [deleteSectorId, setDeleteSectorId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const introFileInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchSectors();
    fetchIntro();
  }, []);

  const fetchSectors = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/sectors`);
      setSectors(res.data);
    } catch (error) {
      showToast('Error fetching sectors');
    }
  };

  const fetchIntro = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/select-clients-intro`);
      if (res.data) setIntroData(res.data);
    } catch (error) {
      showToast('Error fetching intro data');
    }
  };

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(''), 3000);
  };

  const handleSaveIntro = async () => {
    try {
      setSavingIntro(true);
      await axios.put(`${API_BASE_URL}/api/select-clients-intro`, introData);
      showToast('Page settings saved!');
    } catch (error) {
      showToast('Error saving settings');
    } finally {
      setSavingIntro(false);
    }
  };

  const handleHeaderFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setIntroData(prev => ({ ...prev, backgroundImage: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddSector = async () => {
    const newSector = {
      name: 'New Sector',
      icon: 'Factory',
      color: 'from-blue-500 to-indigo-600',
      enabled: true,
      industries: [],
      order: sectors.length
    };

    try {
      const res = await axios.post(`${API_BASE_URL}/api/sectors`, newSector);
      setSectors([...sectors, res.data]);
      setExpandedSector(res.data._id);
      showToast('New sector added!');
    } catch (error) {
      showToast('Error adding sector');
    }
  };

  const handleUpdateSector = async (sectorId: string, updates: any) => {
    try {
      const res = await axios.put(`${API_BASE_URL}/api/sectors/${sectorId}`, updates);
      setSectors(sectors.map(s => s._id === sectorId ? res.data : s));
    } catch (error) {
      showToast('Error updating sector');
    }
  };

  const handleDeleteSector = (id: string) => {
    setDeleteSectorId(id);
  };

  const confirmDeleteSector = async () => {
    if (!deleteSectorId) return;
    try {
      setDeleting(true);
      await axios.delete(`${API_BASE_URL}/api/sectors/${deleteSectorId}`);
      setSectors(sectors.filter(s => s._id !== deleteSectorId));
      showToast('Sector deleted');
    } catch (error) {
      showToast('Error deleting sector');
    } finally {
      setDeleting(false);
      setDeleteSectorId(null);
    }
  };

  const handleAddIndustry = async (sector: any) => {
    const updatedIndustries = [...sector.industries, { name: 'New Industry', enabled: true }];
    handleUpdateSector(sector._id, { industries: updatedIndustries });
  };

  const handleUpdateIndustry = (sector: any, industryIndex: number, updates: any) => {
    const updatedIndustries = [...sector.industries];
    updatedIndustries[industryIndex] = { ...updatedIndustries[industryIndex], ...updates };
    setSectors(sectors.map(s => s._id === sector._id ? { ...s, industries: updatedIndustries } : s));
  };

  const handleUpdateStat = (index: number, updates: any) => {
    const newStats = [...introData.stats];
    newStats[index] = { ...newStats[index], ...updates };
    setIntroData({ ...introData, stats: newStats });
  };

  return (
    <div className="p-8 bg-[#0F1115] min-h-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Select Clients Management</h1>
        <p className="text-[#888888]">Manage page header, intro, stats and client sectors</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">

          {/* Page Header & Intro Settings */}
          <div className="bg-[#16181D] rounded-lg shadow-lg p-6 border border-[rgba(136,136,136,0.25)]">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Layout className="w-6 h-6 text-[#888888]" />
                <h2 className="text-xl font-bold text-[#E6E6E6]">Page Branding & Intro</h2>
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={introData.introEnabled}
                    onChange={() => setIntroData({ ...introData, introEnabled: !introData.introEnabled })}
                    className="sr-only"
                  />
                  <div className={`w-10 h-5 rounded-full transition-all ${introData.introEnabled ? 'bg-green-500' : 'bg-gray-600'}`}>
                    <div className={`w-4 h-4 bg-white rounded-full m-0.5 transition-all ${introData.introEnabled ? 'translate-x-5' : ''}`}></div>
                  </div>
                  <span className="text-xs text-[#888888] font-medium uppercase tracking-wider">{introData.introEnabled ? 'Enabled' : 'Disabled'}</span>
                </label>
                <button
                  onClick={handleSaveIntro}
                  disabled={savingIntro}
                  className="flex items-center gap-2 px-4 py-2 bg-[#022683] text-white rounded-lg hover:bg-[#033aa0] transition-colors disabled:opacity-50 font-semibold"
                >
                  {savingIntro ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save Settings
                </button>
              </div>
            </div>

            <div className={`space-y-4 transition-all duration-300 ${!introData.introEnabled ? 'opacity-40 grayscale pointer-events-none' : ''}`}>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#888888] mb-2">Header Title</label>
                  <input
                    type="text"
                    value={introData.title}
                    onChange={(e) => setIntroData({ ...introData, title: e.target.value })}
                    className="w-full px-4 py-2 bg-[#0F1115] border border-[rgba(136,136,136,0.25)] rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#888888] mb-2">Intro Badge Title</label>
                  <input
                    type="text"
                    value={introData.introTitle}
                    onChange={(e) => setIntroData({ ...introData, introTitle: e.target.value })}
                    className="w-full px-4 py-2 bg-[#0F1115] border border-[rgba(136,136,136,0.25)] rounded-lg text-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#888888] mb-2">Background Image</label>
                <div className="flex gap-4 items-start">
                  <div className="flex-1 space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={introData.backgroundImage?.startsWith('data:') ? 'Local Image Selected' : introData.backgroundImage}
                        onChange={(e) => setIntroData({ ...introData, backgroundImage: e.target.value })}
                        readOnly={introData.backgroundImage?.startsWith('data:')}
                        className="flex-1 px-4 py-2 bg-[#0F1115] border border-[rgba(136,136,136,0.25)] rounded-lg text-[#E6E6E6] focus:ring-2 focus:ring-[#022683] outline-none"
                        placeholder="Enter Image URL or upload..."
                      />
                      <input
                        type="file"
                        ref={introFileInputRef}
                        onChange={handleHeaderFileSelect}
                        accept="image/*"
                        className="hidden"
                      />
                      <button
                        onClick={() => introFileInputRef.current?.click()}
                        className="px-4 py-2 bg-[rgba(136,136,136,0.1)] text-white rounded-lg hover:bg-[rgba(136,136,136,0.2)] transition-colors flex items-center gap-2"
                      >
                        <Plus className="w-4 h-4 rotate-45" />
                        Upload
                      </button>
                      {introData.backgroundImage && (
                        <button
                          onClick={() => setIntroData({ ...introData, backgroundImage: '' })}
                          className="px-4 py-2 bg-red-900/30 text-red-500 border border-red-500/30 rounded-lg hover:bg-red-900/50 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    <p className="text-[10px] text-[#888888] font-medium">Recommended size: 1920x375px for best display</p>
                  </div>
                  {introData.backgroundImage && (
                    <div className="w-20 h-12 rounded-lg overflow-hidden border border-[rgba(136,136,136,0.25)] bg-[#0F1115] flex-shrink-0">
                      <img
                        src={resolveImageUrl(introData.backgroundImage)}
                        alt="Header Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#888888] mb-2">Header Subtitle</label>
                <textarea
                  value={introData.subtitle}
                  onChange={(e) => setIntroData({ ...introData, subtitle: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-2 bg-[#0F1115] border border-[rgba(136,136,136,0.25)] rounded-lg text-white"
                />
              </div>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#888888] mb-2">Intro Description Paragraph 1</label>
                  <textarea
                    value={introData.introDescription1}
                    onChange={(e) => setIntroData({ ...introData, introDescription1: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 bg-[#0F1115] border border-[rgba(136,136,136,0.25)] rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#888888] mb-2">Intro Description Paragraph 2</label>
                  <textarea
                    value={introData.introDescription2}
                    onChange={(e) => setIntroData({ ...introData, introDescription2: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 bg-[#0F1115] border border-[rgba(136,136,136,0.25)] rounded-lg text-white"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Stats Section */}
          <div className="bg-[#16181D] rounded-lg shadow-lg p-6 border border-[rgba(136,136,136,0.25)]">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <PieChart className="w-6 h-6 text-[#888888]" />
                <h2 className="text-xl font-bold text-[#E6E6E6]">Stats Cards</h2>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={introData.statsEnabled}
                  onChange={() => setIntroData({ ...introData, statsEnabled: !introData.statsEnabled })}
                  className="sr-only"
                />
                <div className={`w-10 h-5 rounded-full transition-all ${introData.statsEnabled ? 'bg-green-500' : 'bg-gray-600'}`}>
                  <div className={`w-4 h-4 bg-white rounded-full m-0.5 transition-all ${introData.statsEnabled ? 'translate-x-5' : ''}`}></div>
                </div>
                <span className="text-xs text-[#888888] font-medium uppercase tracking-wider">{introData.statsEnabled ? 'Enabled' : 'Disabled'}</span>
              </label>
            </div>
            <div className={`grid grid-cols-3 gap-4 transition-all duration-300 ${!introData.statsEnabled ? 'opacity-40 grayscale pointer-events-none' : ''}`}>
              {introData.stats.map((stat, idx) => (
                <div key={idx} className="space-y-3 p-4 bg-[#0F1115] rounded-xl border border-[rgba(136,136,136,0.1)]">
                  <div className="flex items-center justify-between">
                    <input
                      type="text"
                      value={stat.label}
                      onChange={(e) => handleUpdateStat(idx, { label: e.target.value })}
                      className="w-full px-3 py-1 bg-transparent border-b border-[rgba(136,136,136,0.2)] text-sm text-[#888888]"
                      placeholder="Label"
                    />
                    <label className="ml-2 flex items-center gap-1 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={stat.enabled}
                        onChange={() => handleUpdateStat(idx, { enabled: !stat.enabled })}
                        className="sr-only"
                      />
                      <div className={`w-6 h-3 rounded-full transition-all ${stat.enabled ? 'bg-green-500' : 'bg-gray-600'}`}>
                        <div className={`w-2 h-2 bg-white rounded-full m-0.5 transition-all ${stat.enabled ? 'translate-x-3' : ''}`}></div>
                      </div>
                    </label>
                  </div>
                  <input
                    type="text"
                    value={stat.value}
                    onChange={(e) => handleUpdateStat(idx, { value: e.target.value })}
                    className="w-full px-3 py-1 bg-transparent text-2xl font-bold text-[#022683]"
                    placeholder="Value"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Sectors Section */}
          <div className="bg-[#16181D] rounded-lg shadow-lg p-6 border border-[rgba(136,136,136,0.25)]">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Sparkles className="w-6 h-6 text-[#888888]" />
                <h2 className="text-xl font-bold text-[#E6E6E6]">Client Sectors</h2>
              </div>
              <button
                onClick={handleAddSector}
                className="flex items-center gap-2 px-4 py-2 bg-[#022683] text-white rounded-lg hover:bg-[#033aa0] transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Sector
              </button>
            </div>

            <div className="space-y-4">
              {sectors.map((sector) => (
                <div key={sector._id} className="bg-[#0F1115] rounded-lg border border-[rgba(136,136,136,0.15)] overflow-hidden">
                  <div className="p-4 flex items-center justify-between cursor-pointer hover:bg-white/5" onClick={() => setExpandedSector(expandedSector === sector._id ? null : sector._id)}>
                    <div className="flex items-center gap-3 flex-1">
                      {expandedSector === sector._id ? <ChevronDown className="w-5 h-5 text-[#888888]" /> : <ChevronRight className="w-5 h-5 text-[#888888]" />}
                      <span className="font-bold text-white">{sector.name}</span>
                    </div>
                    <div className="flex items-center gap-4" onClick={e => e.stopPropagation()}>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={sector.enabled}
                          onChange={() => handleUpdateSector(sector._id, { enabled: !sector.enabled })}
                          className="sr-only"
                        />
                        <div className={`w-10 h-5 rounded-full transition-all ${sector.enabled ? 'bg-green-500' : 'bg-gray-600'}`}>
                          <div className={`w-4 h-4 bg-white rounded-full m-0.5 transition-all ${sector.enabled ? 'translate-x-5' : ''}`}></div>
                        </div>
                      </label>
                      <button onClick={() => handleDeleteSector(sector._id)} className="text-red-400 hover:text-red-300 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {expandedSector === sector._id && (
                    <div className="p-4 border-t border-[rgba(136,136,136,0.1)] space-y-4 bg-[#16181D]/30">
                      <div className="grid grid-cols-3 gap-4">
                        <div className="col-span-1">
                          <label className="block text-xs font-medium text-[#888888] mb-1">Sector Name</label>
                          <input
                            type="text"
                            value={sector.name}
                            onChange={(e) => handleUpdateSector(sector._id, { name: e.target.value })}
                            className="w-full px-3 py-2 bg-[#0F1115] border border-[rgba(136,136,136,0.25)] rounded text-sm text-white"
                          />
                        </div>
                        <div className="col-span-1">
                          <label className="block text-xs font-medium text-[#888888] mb-1">Icon Name (Lucide)</label>
                          <input
                            type="text"
                            value={sector.icon}
                            onChange={(e) => handleUpdateSector(sector._id, { icon: e.target.value })}
                            className="w-full px-3 py-2 bg-[#0F1115] border border-[rgba(136,136,136,0.25)] rounded text-sm text-white"
                          />
                        </div>
                        <div className="col-span-1">
                          <label className="block text-xs font-medium text-[#888888] mb-1">Color Gradient</label>
                          <input
                            type="text"
                            value={sector.color}
                            onChange={(e) => handleUpdateSector(sector._id, { color: e.target.value })}
                            className="w-full px-3 py-2 bg-[#0F1115] border border-[rgba(136,136,136,0.25)] rounded text-sm text-white"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-xs font-bold text-[#888888] uppercase">Industries</h4>
                          <button onClick={() => handleAddIndustry(sector)} className="text-xs text-[#022683] hover:underline flex items-center gap-1">
                            <Plus className="w-3 h-3" /> Add Industry
                          </button>
                        </div>
                        {sector.industries.map((ind: any, idx: number) => (
                          <div key={idx} className="flex items-center gap-2">
                            <input
                              type="text"
                              value={ind.name}
                              onChange={(e) => handleUpdateIndustry(sector, idx, { name: e.target.value })}
                              onBlur={() => handleUpdateSector(sector._id, { industries: sector.industries })}
                              className="flex-1 px-3 py-1.5 bg-[#0F1115] border border-[rgba(136,136,136,0.25)] rounded text-xs text-white"
                            />
                            <button onClick={() => {
                              const newInds = sector.industries.filter((_: any, i: number) => i !== idx);
                              handleUpdateSector(sector._id, { industries: newInds });
                            }} className="text-red-400 p-1 hover:text-red-300">
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Preview Column */}
        <div className="lg:col-span-1">
          <div className="bg-gradient-to-br from-[#16181D] to-[#1a1d24] rounded-lg shadow-xl p-6 border border-[rgba(136,136,136,0.25)] sticky top-8 animate-fade-in">
            <h3 className="font-bold text-white mb-6 flex items-center gap-2">
              <span className="w-1.5 h-6 bg-[#022683] rounded-full"></span>
              Frontend Preview
            </h3>

            <div className="space-y-4">
              {sectors.filter(s => s.enabled).map((sector) => {
                const Icon = iconMap[sector.icon] || Factory;
                return (
                  <div key={sector._id} className="border border-[rgba(136,136,136,0.15)] rounded-xl overflow-hidden group">
                    <div className={`w-full p-4 flex items-center justify-between bg-gradient-to-r ${sector.color || 'from-[#022683] to-[#033aa0]'} text-white`}>
                      <div className="flex items-center gap-3">
                        <Icon className="w-4 h-4 opacity-70" />
                        <span className="font-bold text-sm tracking-tight">{sector.name}</span>
                      </div>
                      <ChevronDown className="w-4 h-4 opacity-70" />
                    </div>
                    <div className="p-4 bg-[#0F1115] space-y-2">
                      {sector.industries.filter((i: any) => i.enabled).slice(0, 3).map((industry: any, idx: number) => (
                        <div key={idx} className="text-xs text-[#E6E6E6] flex items-center gap-2 font-medium">
                          <Check className="w-3 h-3 text-[#5b8fff]" />
                          {industry.name}
                        </div>
                      ))}
                      {sector.industries.filter((i: any) => i.enabled).length > 3 && (
                        <div className="text-[10px] text-[#888888]  px-3 pt-1 border-t border-[rgba(136,136,136,0.1)] mt-2">
                          +{sector.industries.filter((i: any) => i.enabled).length - 3} more sectors
                        </div>
                      )}
                      {sector.industries.filter((i: any) => i.enabled).length === 0 && (
                        <div className="text-[10px] text-[#555555] ">No active industries</div>
                      )}
                    </div>
                  </div>
                );
              })}
              {sectors.filter(s => s.enabled).length === 0 && (
                <div className="text-center py-10 opacity-30">
                  <p className="text-xs text-white  tracking-widest">NO ACTIVE SECTORS</p>
                </div>
              )}
            </div>

            <div className="mt-8 grid grid-cols-2 gap-3">
              <div className="p-4 bg-[rgba(2,38,131,0.15)] rounded-xl border border-[rgba(2,38,131,0.3)]">
                <div className="text-[10px] text-[#888888] mb-1 font-bold uppercase tracking-tighter">Sectors</div>
                <div className="text-2xl font-black text-[#5b8fff] font-mono tracking-tighter">
                  {sectors.filter(s => s.enabled).length}
                </div>
              </div>
              <div className="p-4 bg-[rgba(34,197,94,0.1)] rounded-xl border border-[rgba(34,197,94,0.2)]">
                <div className="text-[10px] text-[#888888] mb-1 font-bold uppercase tracking-tighter">Industries</div>
                <div className="text-2xl font-black text-green-400 font-mono tracking-tighter">
                  {sectors.reduce((acc, s) => acc + s.industries.filter((i: any) => i.enabled).length, 0)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {toast && (
        <div className="fixed bottom-8 right-8 bg-[#022683] text-white px-6 py-3 rounded-lg shadow-2xl animate-fade-in z-50">
          {toast}
        </div>
      )}

      {deleteSectorId && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">

          {/* Modal Box */}
          <div
            className="relative 
                 bg-gradient-to-br from-[#16181D] to-[#1a1d24] 
                 border border-red-500/30
                 shadow-[0_20px_60px_rgba(0,0,0,0.6)] 
                 rounded-2xl 
                 p-8 
                 w-full 
                 max-w-md 
                 animate-[scaleIn_.25s_ease-out]"
          >

            {/* Top Red Glow */}
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-32 h-32 bg-red-500/20 blur-3xl rounded-full" />

            {/* Title */}
            <h3 className="text-xl font-semibold text-white mb-3">
              Delete this item?
            </h3>

            {/* Description */}
            <p className="text-sm text-[#888888] mb-6 leading-relaxed">
              This action will permanently remove this record from the database.
              <span className="text-red-400 font-medium">
                {" "}This cannot be undone.
              </span>
            </p>

            {/* Buttons */}
            <div className="flex justify-end gap-3">

              {/* Cancel */}
              <button
                onClick={() => setDeleteSectorId(null)}
                disabled={deleting}
                className="px-5 py-2 rounded-lg 
                     bg-[rgba(136,136,136,0.15)] 
                     text-white 
                     hover:bg-[rgba(136,136,136,0.25)] 
                     transition-all duration-200"
              >
                Cancel
              </button>

              {/* Delete */}
              <button
                onClick={confirmDeleteSector}
                disabled={deleting}
                className="px-6 py-2 rounded-lg 
                     bg-red-500 
                     text-white 
                     hover:bg-red-600 
                     transition-all duration-200 
                     disabled:opacity-50 
                     flex items-center gap-2"
              >
                {deleting && <Loader2 className="w-4 h-4 animate-spin" />}
                {deleting ? "Deleting..." : "Delete"}
              </button>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
