import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import {
  Plus,
  Edit,
  Trash2,
  ChevronDown,
  ChevronRight,
  Save,
  Eye,
  Upload,
  Search,
  Loader2,
  X,
  Layout,
  CheckCircle2,
  FileCheck,
  Calculator,
  TrendingUp,
  DollarSign,
  FileText,
  Building2,
  Landmark,
  FileSignature,
  Target,
  Briefcase,
  Globe,
  RefreshCw,
  Wallet,
  Shield,
  ClipboardList
} from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const resolveImageUrl = (url: string | undefined) => {
  if (!url) return '';
  if (url.startsWith('http') || url.startsWith('data:')) return url;
  return `${API_BASE_URL.replace(/\/$/, '')}/${url.replace(/^\//, '')}`;
};

const iconMap: Record<string, any> = {
  FileCheck,
  Calculator,
  TrendingUp,
  DollarSign,
  FileText,
  Search,
  CheckCircle2,
  Building2,
  Landmark,
  FileSignature,
  Target,
  Briefcase,
  Globe,
  RefreshCw,
  Wallet,
  Shield,
  ClipboardList
};

export default function ServicesManager() {
  const [services, setServices] = useState<any[]>([]);
  const [introData, setIntroData] = useState({
    title: 'Services',
    subtitle: 'We deliver professional services with commitment, competence and clarity.',
    introDescription: 'The Firm provides Audit & Assurance, Tax Consultancy and Advisory services to clients ranging from Small and Medium Enterprises to Large Multi-National Organizations across various industry sectors.',
    backgroundImage: '',
    ctaTitle: 'Need professional advisory services?',
    ctaSubtitle: 'Our team of experts is ready to provide customized solutions for your business',
    introEnabled: true,
    ctaEnabled: true,
    enabled: true
  });
  const [loading, setLoading] = useState(false);
  const [savingIntro, setSavingIntro] = useState(false);
  const [expandedService, setExpandedService] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const iconFileInputRef = useRef<HTMLInputElement>(null);
  const introFileInputRef = useRef<HTMLInputElement>(null);
  const sectionIconFileInputRef = useRef<{ [key: number]: HTMLInputElement | null }>({});
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Form State for Editing/Adding
  const [formData, setFormData] = useState<any>({
    name: '',
    title: '',
    category: 'Core Services',
    icon: 'FileCheck',
    shortDescription: '',
    detailedDescription: '',
    slug: '',
    enabled: true,
    image: '',
    subServices: []
  });

  useEffect(() => {
    fetchServices();
    fetchIntro();
  }, []);

  const fetchServices = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/services`);
      setServices(res.data);
    } catch (error) {
      showToast('Error loading services');
    }
  };

  const fetchIntro = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/service-intro`);
      if (res.data) setIntroData(res.data);
    } catch (error) {
      showToast('Error fetching intro data');
    }
  };

  const categories = Array.from(new Set(services.map(s => s.category)));
  if (!categories.includes('Core Services')) categories.push('Core Services');
  if (!categories.includes('Advisory Services')) categories.push('Advisory Services');

  const filteredServices = services.filter(service =>
    service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    service.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(''), 3000);
  };

  const handleSaveIntro = async () => {
    try {
      setSavingIntro(true);
      await axios.put(`${API_BASE_URL}/api/service-intro`, introData);
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

  const handleEdit = (service: any) => {
    if (editingId === service._id) {
      setEditingId(null);
    } else {
      setEditingId(service._id);
      setFormData({ ...service });
      setExpandedService(service._id);
    }
  };

  const handleSave = async () => {
    if (!formData.name?.trim() || !formData.slug?.trim()) {
      showToast('Name and Slug are required');
      return;
    }

    setLoading(true);
    try {
      const dataToSave = { ...formData };
      if (dataToSave._id === 'new') {
        delete dataToSave._id;
      }

      if (editingId && editingId !== 'new' && editingId.length > 5) {
        await axios.put(`${API_BASE_URL}/api/services/${editingId}`, dataToSave);
        showToast('Service updated successfully!');
      } else {
        await axios.post(`${API_BASE_URL}/api/services`, dataToSave);
        showToast('Service added successfully!');
      }
      setEditingId(null);
      fetchServices();
      setExpandedService(null);
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Error saving service');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteService = (id: string) => {
    setDeleteId(id);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await axios.delete(`${API_BASE_URL}/api/services/${deleteId}`);
      showToast('Service deleted successfully!');
      fetchServices();
    } catch (error) {
      showToast('Error deleting service');
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  };

  const handleAddService = () => {
    const newService = {
      name: 'New Service Category',
      title: 'New Service Title',
      category: 'Core Services',
      icon: 'FileCheck',
      shortDescription: '',
      detailedDescription: '',
      slug: `/services/new-service-${Date.now()}`,
      enabled: true,
      image: '',
      subServices: []
    };
    setEditingId('new');
    setFormData(newService);
    setExpandedService('new');
  };

  const handleToggleService = async (service: any) => {
    try {
      await axios.put(`${API_BASE_URL}/api/services/${service._id}`, { ...service, enabled: !service.enabled });
      fetchServices();
    } catch (error) {
      showToast('Error updating status');
    }
  };

  const handleAddSubService = () => {
    const updatedSubServices = [...formData.subServices, { heading: 'New Section', content: 'Section description...', icon: 'CheckCircle2', enabled: true }];
    setFormData({ ...formData, subServices: updatedSubServices });
  };

  const handleRemoveSubService = (index: number) => {
    const updatedSubServices = formData.subServices.filter((_: any, i: number) => i !== index);
    setFormData({ ...formData, subServices: updatedSubServices });
  };

  const handleSubServiceChange = (index: number, field: string, value: any) => {
    const updatedSubServices = [...formData.subServices];
    updatedSubServices[index] = { ...updatedSubServices[index], [field]: value };
    setFormData({ ...formData, subServices: updatedSubServices });
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        showToast('Image size should be less than 2MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, image: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleIconFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1 * 1024 * 1024) {
        showToast('Icon size should be less than 1MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, icon: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSectionIconFileSelect = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 500 * 1024) {
        showToast('Section icon size should be less than 500KB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        handleSubServiceChange(index, 'icon', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="p-8 bg-[#0F1115] min-h-full">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Services Management</h1>
          <p className="text-[#888888]">Manage page header, intro, and service categories</p>
        </div>
        <button
          onClick={handleAddService}
          className="flex items-center gap-2 px-6 py-3 bg-[#022683] text-white rounded-xl hover:bg-[#033aa0] transition-all shadow-lg font-bold"
        >
          <Plus className="w-5 h-5" />
          Add Service Category
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">

          {/* Page Header & Intro Settings */}
          <div className="bg-[#16181D] rounded-xl shadow-lg p-6 border border-[rgba(136,136,136,0.25)]">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <Layout className="w-6 h-6 text-[#888888]" />
                <h2 className="text-xl font-bold text-[#E6E6E6]">Page Global Settings</h2>
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={introData.enabled}
                    onChange={() => setIntroData({ ...introData, enabled: !introData.enabled })}
                    className="sr-only"
                  />
                  <div className={`w-10 h-5 rounded-full transition-all ${introData.enabled ? 'bg-green-500' : 'bg-gray-600'}`}>
                    <div className={`w-4 h-4 bg-white rounded-full m-0.5 transition-all ${introData.enabled ? 'translate-x-5' : ''}`}></div>
                  </div>
                  <span className="text-xs text-[#888888] font-bold uppercase tracking-wider">{introData.enabled ? 'Enabled' : 'Disabled'}</span>
                </label>
                <button
                  onClick={handleSaveIntro}
                  disabled={savingIntro}
                  className="flex items-center gap-2 px-4 py-2 bg-[#022683] text-white rounded-lg hover:bg-[#033aa0] transition-colors disabled:opacity-50 font-semibold"
                >
                  {savingIntro ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save Changes
                </button>
              </div>
            </div>

            <div className={`space-y-6 transition-all duration-300 ${!introData.enabled ? 'opacity-40 grayscale pointer-events-none' : ''}`}>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-[#888888] mb-2  tracking-wider">Main Banner Title</label>
                  <input
                    type="text"
                    value={introData.title}
                    onChange={(e) => setIntroData({ ...introData, title: e.target.value })}
                    className="w-full px-4 py-3 bg-[#0F1115] border border-[rgba(136,136,136,0.25)] rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#888888] mb-2  tracking-wider">Main Banner Subtitle</label>
                  <input
                    type="text"
                    value={introData.subtitle}
                    onChange={(e) => setIntroData({ ...introData, subtitle: e.target.value })}
                    className="w-full px-4 py-3 bg-[#0F1115] border border-[rgba(136,136,136,0.25)] rounded-lg text-white"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-[#888888] mb-2  tracking-wider">Background Image</label>
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
                          <Upload className="w-4 h-4" />
                          Upload
                        </button>
                        {introData.backgroundImage && (
                          <button
                            onClick={() => setIntroData({ ...introData, backgroundImage: '' })}
                            className="px-4 py-2 bg-red-900/30 text-red-500 border border-red-500/30 rounded-lg hover:bg-red-900/50 transition-colors"
                          >
                            <X className="w-4 h-4" />
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
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-[#888888] mb-1  tracking-wider">Intro Mission Text</label>
                  <label className="flex items-center gap-2 cursor-pointer scale-75 origin-right">
                    <input
                      type="checkbox"
                      checked={introData.introEnabled}
                      onChange={() => setIntroData({ ...introData, introEnabled: !introData.introEnabled })}
                      className="sr-only"
                    />
                    <div className={`w-10 h-5 rounded-full transition-all ${introData.introEnabled ? 'bg-[#022683]' : 'bg-gray-600'}`}>
                      <div className={`w-4 h-4 bg-white rounded-full m-0.5 transition-all ${introData.introEnabled ? 'translate-x-5' : ''}`}></div>
                    </div>
                  </label>
                </div>
                <textarea
                  value={introData.introDescription}
                  onChange={(e) => setIntroData({ ...introData, introDescription: e.target.value })}
                  rows={3}
                  className={`w-full px-4 py-3 bg-[#0F1115] border border-[rgba(136,136,136,0.25)] rounded-lg text-white transition-opacity ${!introData.introEnabled ? 'opacity-30' : ''}`}
                />
              </div>

              <div className="p-6 bg-[#0F1115] rounded-xl border border-[rgba(136,136,136,0.1)]">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-white font-bold flex items-center gap-2">
                    CTA Section Settings
                  </h3>
                  <label className="flex items-center gap-2 cursor-pointer scale-75 origin-right">
                    <input
                      type="checkbox"
                      checked={introData.ctaEnabled}
                      onChange={() => setIntroData({ ...introData, ctaEnabled: !introData.ctaEnabled })}
                      className="sr-only"
                    />
                    <div className={`w-10 h-5 rounded-full transition-all ${introData.ctaEnabled ? 'bg-[#022683]' : 'bg-gray-600'}`}>
                      <div className={`w-4 h-4 bg-white rounded-full m-0.5 transition-all ${introData.ctaEnabled ? 'translate-x-5' : ''}`}></div>
                    </div>
                  </label>
                </div>
                <div className={`space-y-4 ${!introData.ctaEnabled ? 'opacity-30 grayscale pointer-events-none' : ''}`}>
                  <input
                    type="text"
                    value={introData.ctaTitle}
                    onChange={(e) => setIntroData({ ...introData, ctaTitle: e.target.value })}
                    className="w-full px-4 py-2 bg-[#16181D] border border-[rgba(136,136,136,0.25)] rounded-lg text-white mb-2"
                    placeholder="CTA Title"
                  />
                  <textarea
                    value={introData.ctaSubtitle}
                    onChange={(e) => setIntroData({ ...introData, ctaSubtitle: e.target.value })}
                    rows={2}
                    className="w-full px-4 py-2 bg-[#16181D] border border-[rgba(136,136,136,0.25)] rounded-lg text-white"
                    placeholder="CTA Subtitle"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="bg-[#16181D] rounded-xl shadow-lg p-4 border border-[rgba(136,136,136,0.25)] flex items-center gap-4">
            <Search className="w-5 h-5 text-[#888888]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter services by name or category..."
              className="flex-1 bg-transparent border-none outline-none text-[#E6E6E6] text-lg"
            />
          </div>

          {/* Services List */}
          <div className="space-y-4">
            {(editingId === 'new' ? [{ _id: 'new', ...formData }, ...filteredServices] : filteredServices).map((service) => (
              <div
                key={service._id}
                className={`bg-[#16181D] rounded-xl shadow-lg border border-[rgba(136,136,136,0.15)] overflow-hidden transition-all ${expandedService === service._id ? 'ring-2 ring-[#022683]' : ''}`}
              >
                <div
                  className="p-5 flex items-center justify-between cursor-pointer hover:bg-white/5"
                  onClick={() => setExpandedService(expandedService === service._id ? null : service._id)}
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-10 h-10 rounded-lg bg-[#0F1115] flex items-center justify-center text-xl border border-[rgba(136,136,136,0.1)] overflow-hidden">
                      {service.icon?.startsWith('data:') ? (
                        <img src={service.icon} alt="icon" className="w-full h-full object-contain p-1" />
                      ) : (
                        (() => {
                          const Icon = iconMap[service.icon] || FileCheck;
                          return <Icon className="w-6 h-6 text-[#5b8fff]" />;
                        })()
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-white tracking-tight">{service.name}</h3>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-[10px] font-black  tracking-widest text-[#5b8fff] bg-[#022683]/20 px-2 py-0.5 rounded">
                          {service.category}
                        </span>
                        <span className="text-[10px] font-bold text-[#888888] flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-green-500" />
                          {service.subServices?.length || 0} Sections
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4" onClick={e => e.stopPropagation()}>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={service.enabled}
                        onChange={() => service._id !== 'new' && handleToggleService(service)}
                        className="sr-only"
                      />
                      <div className={`w-10 h-5 rounded-full transition-all ${service.enabled ? 'bg-green-500' : 'bg-gray-600'}`}>
                        <div className={`w-4 h-4 bg-white rounded-full m-0.5 transition-all ${service.enabled ? 'translate-x-5' : ''}`}></div>
                      </div>
                    </label>
                    <button onClick={() => handleEdit(service)} className={`p-2 rounded-lg transition-colors ${editingId === service._id ? 'bg-[#022683] text-white' : 'text-[#888888] hover:bg-white/10'}`}>
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => service._id !== 'new' && handleDeleteService(service._id)} className="p-2 text-red-500/70 hover:text-red-500 hover:bg-red-500/10 rounded-lg">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {expandedService === service._id && (
                  <div className="p-8 border-t border-[rgba(136,136,136,0.1)] bg-[#0F1115]/50 space-y-8 animate-fade-in">
                    {editingId === service._id ? (
                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div>
                            <label className="block text-xs font-bold text-[#888888]  mb-1">Category Name</label>
                            <input
                              type="text"
                              value={formData.name}
                              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                              className="w-full px-4 py-2 bg-[#0F1115] border border-[rgba(136,136,136,0.25)] rounded-lg text-white"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-[#888888]  mb-1">Details Panel Title</label>
                            <input
                              type="text"
                              value={formData.title}
                              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                              className="w-full px-4 py-2 bg-[#0F1115] border border-[rgba(136,136,136,0.25)] rounded-lg text-white"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-[#888888]  mb-1">Parent Category</label>
                            <select
                              value={formData.category}
                              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                              className="w-full px-4 py-2 bg-[#0F1115] border border-[rgba(136,136,136,0.25)] rounded-lg text-white"
                            >
                              {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                            </select>
                          </div>
                        </div>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-xs font-bold text-[#888888]  mb-1">Service Icon</label>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={formData.icon?.startsWith('data:') ? 'Custom Icon Uploaded' : formData.icon}
                                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                                className="flex-1 px-4 py-2 bg-[#0F1115] border border-[rgba(136,136,136,0.25)] rounded-lg text-white"
                                placeholder="Icon name or upload..."
                              />
                              <input
                                type="file"
                                ref={iconFileInputRef}
                                className="hidden"
                                accept="image/*"
                                onChange={handleIconFileSelect}
                              />
                              <button
                                onClick={() => iconFileInputRef.current?.click()}
                                className="p-2 bg-[rgba(136,136,136,0.1)] text-white rounded-lg hover:bg-[rgba(136,136,136,0.2)] border border-[rgba(136,136,136,0.25)]"
                                title="Upload Custom Icon"
                              >
                                <Upload className="w-4 h-4" />
                              </button>
                            </div>
                            {formData.icon?.startsWith('data:') && (
                              <div className="mt-2 flex items-center gap-2">
                                <div className="w-8 h-8 rounded border border-white/10 bg-black/20 p-1">
                                  <img src={formData.icon} alt="Preview" className="w-full h-full object-contain" />
                                </div>
                                <button
                                  onClick={() => setFormData({ ...formData, icon: 'FileCheck' })}
                                  className="text-[10px] text-red-400 hover:underline"
                                >
                                  Remove custom icon
                                </button>
                              </div>
                            )}
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-[#888888]  mb-1">Page Slug</label>
                            <input
                              type="text"
                              value={formData.slug}
                              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                              className="w-full px-4 py-2 bg-[#0F1115] border border-[rgba(136,136,136,0.25)] rounded-lg text-white"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-[#888888]  mb-1">Short Description</label>
                            <input
                              type="text"
                              value={formData.shortDescription}
                              onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                              className="w-full px-4 py-2 bg-[#0F1115] border border-[rgba(136,136,136,0.25)] rounded-lg text-white"
                            />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-3 gap-6">
                        <div className="p-4 bg-[#0F1115] rounded-xl border border-[rgba(136,136,136,0.1)]">
                          <label className="text-[10px] font-black text-[#5b8fff]  tracking-tighter">Icon Class</label>
                          <div className="text-white font-mono text-sm mt-1">{service.icon}</div>
                        </div>
                        <div className="p-4 bg-[#0F1115] rounded-xl border border-[rgba(136,136,136,0.1)]">
                          <label className="text-[10px] font-black text-[#5b8fff]  tracking-tighter">Route Slug</label>
                          <div className="text-white font-mono text-sm mt-1">{service.slug}</div>
                        </div>
                        <div className="p-4 bg-[#0F1115] rounded-xl border border-[rgba(136,136,136,0.1)]">
                          <label className="text-[10px] font-black text-[#5b8fff]  tracking-tighter">Status</label>
                          <div className={`font-bold text-sm mt-1 ${service.enabled ? 'text-green-500' : 'text-red-500'}`}>{service.enabled ? 'ACTIVE' : 'INACTIVE'}</div>
                        </div>
                      </div>
                    )}

                    {/* Sub-Services / Sections */}
                    <div className="space-y-4 pt-6 border-t border-[rgba(136,136,136,0.1)]">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-white flex items-center gap-2">
                          Detailed Service Sections
                          <span className="text-[10px] px-2 py-0.5 bg-white/10 rounded-full text-[#888888]">
                            {editingId === service._id ? formData.subServices.length : service.subServices?.length || 0} Total
                          </span>
                        </h4>
                        {editingId === service._id && (
                          <button onClick={handleAddSubService} className="flex items-center gap-2 px-3 py-1.5 text-xs bg-[#022683] text-white rounded-lg hover:bg-[#033aa0] transition-all font-bold">
                            <Plus className="w-3 h-3" /> Add Section
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 gap-4">
                        {(editingId === service._id ? formData.subServices : service.subServices || []).map((sub: any, idx: number) => (
                          <div key={idx} className="p-6 bg-[#0F1115] rounded-xl border border-[rgba(136,136,136,0.15)] space-y-4">
                            {editingId === service._id ? (
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <label className="block text-xs font-bold text-[#888888]  mb-1">Section Heading</label>
                                    <input
                                      type="text"
                                      value={sub.heading}
                                      onChange={(e) => handleSubServiceChange(idx, 'heading', e.target.value)}
                                      className="w-full px-3 py-2 bg-[#16181D] border border-[rgba(136,136,136,0.25)] rounded text-sm text-white"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-xs font-bold text-[#888888]  mb-1">Section Icon</label>
                                    <div className="flex gap-2">
                                      <input
                                        type="text"
                                        value={sub.icon?.startsWith('data:') ? 'Custom Icon' : sub.icon}
                                        onChange={(e) => handleSubServiceChange(idx, 'icon', e.target.value)}
                                        className="flex-1 px-3 py-2 bg-[#16181D] border border-[rgba(136,136,136,0.25)] rounded text-sm text-white"
                                        placeholder="Icon name or upload..."
                                      />
                                      <input
                                        type="file"
                                        className="hidden"
                                        accept="image/*"
                                        onChange={(e) => handleSectionIconFileSelect(e, idx)}
                                        ref={(el) => { sectionIconFileInputRef.current[idx] = el; }}
                                      />
                                      <button
                                        onClick={() => sectionIconFileInputRef.current[idx]?.click()}
                                        className="p-2 bg-[rgba(136,136,136,0.1)] text-white rounded border border-[rgba(136,136,136,0.25)]"
                                      >
                                        <Upload className="w-3 h-3" />
                                      </button>
                                    </div>
                                    {sub.icon?.startsWith('data:') && (
                                      <div className="mt-1 flex items-center gap-2">
                                        <img src={sub.icon} className="w-5 h-5 object-contain bg-black/20 p-0.5 rounded" />
                                        <button
                                          onClick={() => handleSubServiceChange(idx, 'icon', 'CheckCircle2')}
                                          className="text-[9px] text-red-400 hover:underline"
                                        >
                                          Remove
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                </div>
                                <div>
                                  <label className="block text-xs font-bold text-[#888888]  mb-1">Section Content</label>
                                  <textarea
                                    value={sub.content}
                                    onChange={(e) => handleSubServiceChange(idx, 'content', e.target.value)}
                                    rows={3}
                                    className="w-full px-3 py-2 bg-[#16181D] border border-[rgba(136,136,136,0.25)] rounded text-sm text-white"
                                  />
                                </div>
                                <div className="flex justify-end gap-2">
                                  <button onClick={() => handleRemoveSubService(idx)} className="text-red-500 text-xs flex items-center gap-1 hover:underline">
                                    <Trash2 className="w-3 h-3" /> Remove Section
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0 overflow-hidden">
                                  {sub.icon?.startsWith('data:') ? (
                                    <img src={sub.icon} alt="icon" className="w-full h-full object-contain p-1.5" />
                                  ) : (
                                    (() => {
                                      const Icon = iconMap[sub.icon] || CheckCircle2;
                                      return <Icon className="w-5 h-5 text-[#5b8fff]" />;
                                    })()
                                  )}
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center justify-between mb-1">
                                    <h5 className="font-bold text-white text-sm">{sub.heading}</h5>
                                    {!sub.enabled && <span className="text-[10px] text-red-400 font-bold uppercase">Hidden</span>}
                                  </div>
                                  <p className="text-xs text-[#888888] leading-relaxed">{sub.content}</p>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {editingId === service._id && (
                      <div className="flex justify-end pt-4 gap-3 border-t border-[rgba(136,136,136,0.1)]">

                        {/* Cancel Button */}
                        <button
                          onClick={() => setEditingId(null)}
                          className="px-6 py-2 text-[#888888] hover:text-white transition-colors font-semibold whitespace-nowrap"
                        >
                          Cancel
                        </button>

                        {/* Save Button */}
                        <button
                          onClick={handleSave}
                          className="px-6 h-11 bg-[#022683] hover:bg-[#0130a3] text-white rounded-lg font-semibold flex items-center gap-2 whitespace-nowrap transition-all"
                        >
                          <Save className="w-4 h-4" />
                          <span>Save Service Data</span>
                        </button>

                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Live Preview Panel */}
        <div className="lg:col-span-1">
          <div className="bg-gradient-to-br from-[#16181D] to-[#1a1d24] rounded-xl shadow-2xl p-6 border border-[rgba(136,136,136,0.25)] sticky top-8">
            <h3 className="font-bold text-white mb-6 flex items-center gap-2">
              <span className="w-1.5 h-6 bg-[#022683] rounded-full"></span>
              Public View Preview
            </h3>

            {(editingId ? formData : services.find(s => s.enabled)) && (
              <div className="space-y-6">
                {/* Card Preview */}
                <div className="p-5 bg-white rounded-2xl shadow-lg border border-gray-100 group overflow-hidden relative">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-[#022683]/5 rounded-bl-full -mr-10 -mt-10 group-hover:bg-[#022683]/10 transition-all"></div>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-[#022683]/10 flex items-center justify-center group-hover:bg-[#022683] group-hover:scale-110 transition-all duration-300 overflow-hidden">
                      {(() => {
                        const previewItem = editingId ? formData : services.find(s => s.enabled);
                        if (previewItem.icon?.startsWith('data:')) {
                          return <img src={previewItem.icon} className="w-full h-full object-contain p-2 group-hover:invert transition-all" />;
                        }
                        const Icon = iconMap[previewItem.icon] || FileCheck;
                        return <Icon className="w-6 h-6 text-[#022683] group-hover:text-white" />;
                      })()}
                    </div>
                    <div className="text-left">
                      <h4 className="font-bold text-gray-900 line-clamp-1">{(editingId ? formData : services.find(s => s.enabled)).name}</h4>
                      <span className="text-[10px] uppercase font-black tracking-widest text-[#022683]/60">Card Preview</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed italic border-l-2 border-[#022683]/20 pl-3">
                    {(editingId ? formData : services.find(s => s.enabled)).shortDescription || 'No description provided...'}
                  </p>
                </div>

                {/* Detail Preview */}
                <div className="bg-[#0F1115] rounded-2xl border border-[rgba(136,136,136,0.15)] overflow-hidden shadow-inner">
                  <div className="bg-[#022683] p-4 text-white">
                    <h5 className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">Details Panel</h5>
                    <div className="text-sm font-bold truncate">{(editingId ? formData : services.find(s => s.enabled)).title || (editingId ? formData : services.find(s => s.enabled)).name}</div>
                  </div>
                  <div className="p-4 space-y-3">
                    {(editingId ? formData.subServices : (services.find(s => s.enabled)?.subServices || [])).filter((s: any) => s.enabled).slice(0, 2).map((sub: any, i: number) => (
                      <div key={i} className="space-y-1">
                        <div className="flex items-center gap-2">
                          {(editingId ? formData : services.find(s => s.enabled))?.icon?.startsWith('data:') ? (
                            <img src={(editingId ? formData : services.find(s => s.enabled))?.icon} className="w-3 h-3 object-contain invert" />
                          ) : (
                            <CheckCircle2 className="w-3 h-3 text-[#5b8fff]" />
                          )}
                          <span className="text-[11px] font-bold text-white tracking-tight">{sub.heading}</span>
                        </div>
                        <p className="text-[10px] text-[#888888] line-clamp-2 leading-tight pl-5">{sub.content}</p>
                      </div>
                    ))}
                    {(editingId ? formData.subServices : (services.find(s => s.enabled)?.subServices || [])).filter((s: any) => s.enabled).length > 2 && (
                      <div className="pt-2 text-[10px] text-[#5b8fff] font-bold border-t border-white/5">
                        + {(editingId ? formData.subServices : services.find(s => s.enabled).subServices).length - 2} more detail sections...
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="mt-10 grid grid-cols-2 gap-4">
              <div className="p-4 bg-[rgba(2,38,131,0.1)] rounded-xl border border-[rgba(2,38,131,0.2)]">
                <div className="text-xl font-black text-[#5b8fff]">{services.filter(s => s.enabled).length}</div>
                <div className="text-[10px] font-bold text-[#888888] tracking-widest uppercase">Categories</div>
              </div>
              <div className="p-4 bg-[rgba(34,197,94,0.1)] rounded-xl border border-[rgba(34,197,94,0.2)]">
                <div className="text-xl font-black text-green-500">
                  {services.reduce((acc, s) => acc + (s.subServices?.filter((sub: any) => sub.enabled).length || 0), 0)}
                </div>
                <div className="text-[10px] font-bold text-[#888888] tracking-widest uppercase">Total Facts</div>
              </div>
            </div>

            <div className="mt-8 space-y-2 p-4 bg-[#0F1115] rounded-xl border border-white/5 opacity-50 grayscale hover:opacity-100 transition-all">
              <h5 className="text-[10px] font-bold text-[#888888] uppercase mb-2">Category Overview</h5>
              {categories.map(cat => {
                const count = services.filter(s => s.category === cat).length;
                return (
                  <div key={cat} className="flex justify-between text-[11px]">
                    <span className="text-[#888888]">{cat}</span>
                    <span className="text-white font-mono">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {toast && (
        <div className="fixed bottom-8 right-8 bg-[#022683] text-white px-6 py-3 rounded-lg shadow-2xl animate-fade-in z-50 font-bold border border-white/20">
          {toast}
        </div>
      )}

      {deleteId && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div
            className="bg-gradient-to-br from-[#16181D] to-[#1a1d24] 
               border border-red-500/30 
               shadow-2xl 
               rounded-xl 
               p-8 
               w-full 
               max-w-md 
               animate-scale-in"
          >
            <h3 className="text-lg font-semibold text-white mb-3">
              Delete this service category?
            </h3>

            <p className="text-sm text-[#888888] mb-6">
              This will permanently remove the category and all its detailed sections
              from the database. This action cannot be undone.
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteId(null)}
                disabled={deleting}
                className="px-4 py-2 rounded-lg 
                   bg-[rgba(136,136,136,0.2)] 
                   text-white 
                   hover:bg-[rgba(136,136,136,0.3)] 
                   transition-all"
              >
                Cancel
              </button>

              <button
                onClick={confirmDelete}
                disabled={deleting}
                className="px-4 py-2 rounded-lg 
                   bg-red-500 
                   text-white 
                   hover:bg-red-600 
                   transition-all 
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
