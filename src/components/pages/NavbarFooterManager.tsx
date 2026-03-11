import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Trash2, GripVertical, Save, Eye, Loader2, ArrowUp, ArrowDown } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function NavbarFooterManager() {
  const [activeTab, setActiveTab] = useState<'navbar' | 'quicklinks' | 'footer' | 'footerSections'>('navbar');

  // Navbar state
  const [navItems, setNavItems] = useState<any[]>([]);
  const [navLoading, setNavLoading] = useState(false);

  // Quick Links state
  const [quickLinks, setQuickLinks] = useState<any[]>([]);
  const [quickLinksLoading, setQuickLinksLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [newLink, setNewLink] = useState({ title: "", url: "" });
  const [formErrors, setFormErrors] = useState({ title: '', url: '' });

  // Footer state
  const [footerData, setFooterData] = useState({
    description: '',
    socialMedia: { linkedin: '', x: '', facebook: '' },
    copyright: ''
  });
  const [footerLoading, setFooterLoading] = useState(false);

  // Footer Sections state
  const [footerSections, setFooterSections] = useState<any[]>([]);
  const [footerSectionsLoading, setFooterSectionsLoading] = useState(false);

  // Toast notification
  const [toast, setToast] = useState('');

  // Fetch navbar items on mount
  useEffect(() => {
    fetchNavbarItems();
  }, []);

  // Fetch quick links on mount
  useEffect(() => {
    fetchQuickLinks();
  }, []);

  // Fetch footer content on mount
  useEffect(() => {
    fetchFooterContent();
  }, []);

  // Fetch footer sections on mount
  useEffect(() => {
    fetchFooterSections();
  }, []);

  // ========== NAVBAR FUNCTIONS ==========
  const fetchNavbarItems = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/navbar`);
      setNavItems(res.data);
    } catch (error) {
      console.error('Error fetching navbar items:', error);
      showToast('Error loading navbar items');
    }
  };

  const handleNavItemChange = (index: number, field: string, value: any) => {
    setNavItems(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleAddNavItem = () => {
    const newItem = {
      label: 'New Item',
      link: '/',
      enabled: true,
      order: navItems.length
    };
    setNavItems([...navItems, newItem]);
  };

  const handleDeleteNavItem = async (id: string) => {
    if (!id || id.startsWith('temp-')) {
      // Remove from local state only (not yet saved)
      setNavItems(prev => prev.filter(item => item._id !== id));
      return;
    }

    try {
      await axios.delete(`${API_BASE_URL}/api/navbar/${id}`);
      setNavItems(prev => prev.filter(item => item._id !== id));
      showToast('Nav item deleted successfully');
    } catch (error) {
      console.error('Error deleting nav item:', error);
      showToast('Error deleting nav item');
    }
  };

  const handleMoveNavItem = (index: number, direction: 'up' | 'down') => {
    const updated = [...navItems];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex >= 0 && targetIndex < updated.length) {
      const [movedItem] = updated.splice(index, 1);
      updated.splice(targetIndex, 0, movedItem);
      // Update order property
      const finalItems = updated.map((item, idx) => ({ ...item, order: idx }));
      setNavItems(finalItems);
    }
  };

  const handleSaveNavbar = async () => {
    setNavLoading(true);
    try {
      await Promise.all(
        navItems.map(item =>
          item._id
            ? axios.put(`${API_BASE_URL}/api/navbar/${item._id}`, item)
            : axios.post(`${API_BASE_URL}/api/navbar`, item)
        )
      );
      showToast('Navbar menu saved successfully!');
      await fetchNavbarItems();
    } catch (error) {
      console.error('Error saving navbar:', error);
      showToast('Error saving navbar menu');
    } finally {
      setNavLoading(false);
    }
  };

  // ========== QUICK LINKS FUNCTIONS ==========
  const fetchQuickLinks = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/quick-links`);
      setQuickLinks(res.data);
    } catch (error) {
      console.error('Error fetching quick links:', error);
      showToast('Error loading quick links');
    }
  };

  const validateQuickLinkForm = () => {
    const errors = { title: '', url: '' };
    if (!newLink.title.trim()) errors.title = 'Title is required';
    if (!newLink.url.trim()) errors.url = 'URL is required';
    setFormErrors(errors);
    return !errors.title && !errors.url;
  };

  const handleAddLink = async () => {
    if (!validateQuickLinkForm()) return;

    try {
      await axios.post(`${API_BASE_URL}/api/quick-links`, {
        ...newLink,
        enabled: true
      });
      showToast('Quick link added successfully!');
      fetchQuickLinks();
      setShowModal(false);
      setNewLink({ title: "", url: "" });
      setFormErrors({ title: '', url: '' });
    } catch (error) {
      console.error("Add failed:", error);
      showToast('Error adding quick link');
    }
  };

  const handleInputChange = (id: string, field: string, value: string) => {
    setQuickLinks(prev =>
      prev.map(link => link._id === id ? { ...link, [field]: value } : link)
    );
  };

  const handleToggleLink = (id: string) => {
    setQuickLinks(prev =>
      prev.map(link => link._id === id ? { ...link, enabled: !link.enabled } : link)
    );
  };

  const handleDeleteLink = async (id: string) => {
    try {
      await axios.delete(`${API_BASE_URL}/api/quick-links/${id}`);
      showToast('Quick link deleted successfully');
      fetchQuickLinks();
    } catch (error) {
      console.error("Delete failed:", error);
      showToast('Error deleting quick link');
    }
  };

  const handleSaveQuickLinks = async () => {
    setQuickLinksLoading(true);
    try {
      await Promise.all(
        quickLinks.map(link =>
          axios.put(`${API_BASE_URL}/api/quick-links/${link._id}`, {
            title: link.title,
            url: link.url,
            enabled: link.enabled
          })
        )
      );
      showToast("Quick Links saved successfully!");
      fetchQuickLinks();
    } catch (error) {
      console.error(error);
      showToast("Error saving quick links");
    } finally {
      setQuickLinksLoading(false);
    }
  };

  // ========== FOOTER FUNCTIONS ==========
  const fetchFooterContent = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/footer-content`);
      if (res.data) {
        setFooterData(res.data);
      }
    } catch (error) {
      console.error(error);
      showToast('Error loading footer content');
    }
  };

  const handleFooterSave = async () => {
    setFooterLoading(true);
    try {
      await axios.put(`${API_BASE_URL}/api/footer-content`, footerData);
      showToast("Footer content saved successfully!");
    } catch (error) {
      console.error(error);
      showToast("Error saving footer content");
    } finally {
      setFooterLoading(false);
    }
  };

  // ========== FOOTER SECTIONS FUNCTIONS ==========
  const fetchFooterSections = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/footer-sections`);
      setFooterSections(res.data);
    } catch (error) {
      console.error('Error fetching footer sections:', error);
      showToast('Error loading footer sections');
    }
  };

  const handleAddFooterSection = () => {
    const newSection = {
      title: 'New Section',
      links: [{ label: 'Link 1', href: '#' }],
      enabled: true,
      order: footerSections.length
    };
    setFooterSections([...footerSections, newSection]);
  };

  const handleFooterSectionChange = (index: number, field: string, value: any) => {
    const updatedSections = [...footerSections];
    updatedSections[index] = { ...updatedSections[index], [field]: value };
    setFooterSections(updatedSections);
  };

  const handleFooterLinkChange = (sectionIndex: number, linkIndex: number, field: string, value: string) => {
    const updatedSections = [...footerSections];
    const updatedLinks = [...updatedSections[sectionIndex].links];
    updatedLinks[linkIndex] = { ...updatedLinks[linkIndex], [field]: value };
    updatedSections[sectionIndex] = { ...updatedSections[sectionIndex], links: updatedLinks };
    setFooterSections(updatedSections);
  };

  const handleAddFooterLink = (sectionIndex: number) => {
    const updatedSections = [...footerSections];
    updatedSections[sectionIndex].links.push({ label: 'New Link', href: '#' });
    setFooterSections(updatedSections);
  };

  const handleDeleteFooterLink = (sectionIndex: number, linkIndex: number) => {
    const updatedSections = [...footerSections];
    updatedSections[sectionIndex].links.splice(linkIndex, 1);
    setFooterSections(updatedSections);
  };

  const handleSaveFooterSections = async () => {
    setFooterSectionsLoading(true);
    try {
      await Promise.all(
        footerSections.map(section =>
          section._id
            ? axios.put(`${API_BASE_URL}/api/footer-sections/${section._id}`, section)
            : axios.post(`${API_BASE_URL}/api/footer-sections`, section)
        )
      );
      showToast('Footer sections saved successfully!');
      fetchFooterSections();
    } catch (error) {
      console.error('Error saving footer sections:', error);
      showToast('Error saving footer sections');
    } finally {
      setFooterSectionsLoading(false);
    }
  };

  const handleDeleteFooterSection = async (index: number) => {
    const section = footerSections[index];
    if (section._id) {
      try {
        await axios.delete(`${API_BASE_URL}/api/footer-sections/${section._id}`);
        showToast('Section deleted successfully');
      } catch (error) {
        console.error('Error deleting section:', error);
        showToast('Error deleting section');
        return;
      }
    }
    const updatedSections = footerSections.filter((_, i) => i !== index);
    setFooterSections(updatedSections);
  };

  // ========== UTILITY FUNCTIONS ==========
  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(''), 3000);
  };

  return (
    <div className="p-8 bg-gradient-to-br from-[#0F1115] via-[#0F1115] to-[#16181D] min-h-full">
      <div className="mb-8 animate-fade-in">
        <h1 className="text-3xl font-bold text-white mb-2">Navigation & Links Management</h1>
        <p className="text-[#888888]">Manage navbar, quick links, and footer content</p>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-2 border-b border-[rgba(136,136,136,0.25)] animate-fade-in">
        <button
          onClick={() => setActiveTab('navbar')}
          className={`px-6 py-3 font-medium transition-all duration-300 relative ${activeTab === 'navbar'
            ? 'text-white bg-gradient-to-r from-[#022683] via-[#022683] to-[#033aa0] rounded-t-lg shadow-lg animate-tab-active'
            : 'text-[#888888] hover:text-[#E6E6E6] hover:bg-[rgba(136,136,136,0.1)] rounded-t-lg'
            }`}
        >
          {activeTab === 'navbar' && (
            <div className="absolute inset-0 bg-gradient-to-r from-[rgba(136,136,136,0.2)] to-transparent opacity-50 rounded-t-lg"></div>
          )}
          <span className="relative z-10">Navbar Menu</span>
        </button>
        <button
          onClick={() => setActiveTab('quicklinks')}
          className={`px-6 py-3 font-medium transition-all duration-300 relative ${activeTab === 'quicklinks'
            ? 'text-white bg-gradient-to-r from-[#022683] via-[#022683] to-[#033aa0] rounded-t-lg shadow-lg animate-tab-active'
            : 'text-[#888888] hover:text-[#E6E6E6] hover:bg-[rgba(136,136,136,0.1)] rounded-t-lg'
            }`}
        >
          {activeTab === 'quicklinks' && (
            <div className="absolute inset-0 bg-gradient-to-r from-[rgba(136,136,136,0.2)] to-transparent opacity-50 rounded-t-lg"></div>
          )}
          <span className="relative z-10">Quick Links</span>
        </button>
        <button
          onClick={() => setActiveTab('footer')}
          className={`px-6 py-3 font-medium transition-all duration-300 relative ${activeTab === 'footer'
            ? 'text-white bg-gradient-to-r from-[#022683] via-[#022683] to-[#033aa0] rounded-t-lg shadow-lg animate-tab-active'
            : 'text-[#888888] hover:text-[#E6E6E6] hover:bg-[rgba(136,136,136,0.1)] rounded-t-lg'
            }`}
        >
          {activeTab === 'footer' && (
            <div className="absolute inset-0 bg-gradient-to-r from-[rgba(136,136,136,0.2)] to-transparent opacity-50 rounded-t-lg"></div>
          )}
          <span className="relative z-10">Footer Content</span>
        </button>
        <button
          onClick={() => setActiveTab('footerSections')}
          className={`px-6 py-3 font-medium transition-all duration-300 relative ${activeTab === 'footerSections'
            ? 'text-white bg-gradient-to-r from-[#022683] via-[#022683] to-[#033aa0] rounded-t-lg shadow-lg animate-tab-active'
            : 'text-[#888888] hover:text-[#E6E6E6] hover:bg-[rgba(136,136,136,0.1)] rounded-t-lg'
            }`}
        >
          {activeTab === 'footerSections' && (
            <div className="absolute inset-0 bg-gradient-to-r from-[rgba(136,136,136,0.2)] to-transparent opacity-50 rounded-t-lg"></div>
          )}
          <span className="relative z-10">Footer Sections</span>
        </button>
      </div>

      {/* Navigation Menu Tab */}
      {activeTab === 'navbar' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-gradient-to-br from-[#16181D] to-[#1a1d24] rounded-lg shadow-lg p-6 border border-[rgba(136,136,136,0.25)] hover-card-lift animate-fade-in">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <span className="w-1 h-6 bg-gradient-to-b from-[#888888] to-[#022683] rounded-full animate-pulse-slow"></span>
                Navigation Menu
              </h2>
              <button
                onClick={handleAddNavItem}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#022683] to-[#033aa0] text-white rounded-lg hover:from-[#033aa0] hover:to-[#022683] transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-[rgba(136,136,136,0.2)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <Plus className="w-4 h-4 relative z-10 transition-transform duration-300 group-hover:rotate-90" />
                <span className="relative z-10">Add Item</span>
              </button>
            </div>

            <div className="space-y-3">
              {navItems.map((item, index) => (
                <div key={item._id || index} className="flex items-center gap-3 p-4 bg-[#0F1115] border border-[rgba(136,136,136,0.25)] rounded-lg hover:border-[#888888] transition-all duration-300 animate-fade-in hover-card-lift" style={{ animationDelay: `${index * 0.05}s` }}>
                  <GripVertical className="w-5 h-5 text-[#888888] cursor-move hover:text-[#E6E6E6] transition-colors duration-300" />
                  <div className="flex-1 grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={item.label}
                      onChange={(e) => handleNavItemChange(index, 'label', e.target.value)}
                      className="px-3 py-2 bg-[#16181D] border border-[rgba(136,136,136,0.25)] rounded-lg focus:ring-2 focus:ring-[#022683] focus:border-[#022683] outline-none text-[#E6E6E6] transition-all duration-300"
                      placeholder="Label"
                    />
                    <input
                      type="text"
                      value={item.link}
                      onChange={(e) => handleNavItemChange(index, 'link', e.target.value)}
                      className="px-3 py-2 bg-[#16181D] border border-[rgba(136,136,136,0.25)] rounded-lg focus:ring-2 focus:ring-[#022683] focus:border-[#022683] outline-none text-[#E6E6E6] transition-all duration-300"
                      placeholder="Link"
                    />
                    <div className="col-span-2">
                      <select
                        value={item.parentId || ''}
                        onChange={(e) => handleNavItemChange(index, 'parentId', e.target.value || null)}
                        className="w-full px-3 py-2 bg-[#16181D] border border-[rgba(136,136,136,0.25)] rounded-lg focus:ring-2 focus:ring-[#022683] focus:border-[#022683] outline-none text-[#888888] transition-all duration-300 text-sm"
                      >
                        <option value="">Main Menu (No Parent)</option>
                        {navItems
                          .filter(p => p._id !== item._id && !p.parentId) // Only top level items can be parents
                          .map(p => (
                            <option key={p._id} value={p._id}>{p.label}</option>
                          ))
                        }
                      </select>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <button
                      onClick={() => handleMoveNavItem(index, 'up')}
                      disabled={index === 0}
                      className="p-1 text-[#888888] hover:text-white disabled:opacity-30"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleMoveNavItem(index, 'down')}
                      disabled={index === navItems.length - 1}
                      className="p-1 text-[#888888] hover:text-white disabled:opacity-30"
                    >
                      <ArrowDown className="w-4 h-4" />
                    </button>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={item.enabled}
                      onChange={(e) => handleNavItemChange(index, 'enabled', e.target.checked)}
                      className="sr-only"
                    />
                    <div className={`w-10 h-5 rounded-full transition-all duration-300 ${item.enabled ? 'bg-gradient-to-r from-green-500 to-green-600' : 'bg-[rgba(136,136,136,0.3)]'} group-hover:shadow-lg`}>
                      <div className={`w-4 h-4 bg-white rounded-full m-0.5 transition-all duration-300 shadow-md ${item.enabled ? 'translate-x-5' : ''} group-hover:scale-110`}></div>
                    </div>
                  </label>
                  <button
                    onClick={() => handleDeleteNavItem(item._id)}
                    className="p-2 text-red-400 hover:bg-[rgba(255,0,0,0.1)] rounded transition-all duration-300 hover:scale-110"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={handleSaveNavbar}
                disabled={navLoading}
                className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-[#022683] to-[#033aa0] text-white rounded-lg hover:from-[#033aa0] hover:to-[#022683] transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {navLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save Navbar Menu</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-gradient-to-br from-[#16181D] to-[#1a1d24] rounded-lg shadow-lg p-6 border border-[rgba(136,136,136,0.25)] sticky top-8 hover-card-lift animate-fade-in">
              <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                <Eye className="w-5 h-5 text-[#888888]" />
                Preview
              </h3>
              <div className="p-4 bg-gradient-to-r from-[#888888] to-[#022683] rounded-lg shadow-lg">
                <div className="flex gap-4 items-center flex-wrap">
                  {navItems.filter(i => i.enabled).map(item => (
                    <div key={item._id} className="text-white text-sm font-medium hover:scale-105 transition-transform duration-300 cursor-pointer">{item.label}</div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Links Tab */}
      {activeTab === 'quicklinks' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-gradient-to-br from-[#16181D] to-[#1a1d24] rounded-lg shadow-lg p-6 border border-[rgba(136,136,136,0.25)] hover-card-lift animate-fade-in">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <span className="w-1 h-6 bg-gradient-to-b from-[#888888] to-[#022683] rounded-full animate-pulse-slow"></span>
                  Quick Links Manager
                </h2>
                <button
                  onClick={() => setShowModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#022683] to-[#033aa0] text-white rounded-lg hover:from-[#033aa0] hover:to-[#022683] transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 relative overflow-hidden group"
                >
                  <Plus className="w-4 h-4" />
                  Add Quick Link
                </button>
              </div>

              <div className="space-y-3">
                {quickLinks.map((link) => (
                  <div key={link._id} className="border border-[rgba(136,136,136,0.25)] rounded-lg p-4 bg-[#0F1115] hover:border-[#888888] transition-all duration-300 hover-card-lift">
                    <div className="flex items-start gap-3">
                      <GripVertical className="w-5 h-5 text-[#888888] cursor-move mt-2" />

                      <div className="flex-1 space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-[#888888] mb-1">
                              Link Title
                            </label>
                            <input
                              type="text"
                              value={link.title}
                              onChange={(e) => handleInputChange(link._id, "title", e.target.value)}
                              className="w-full px-3 py-2 bg-[#16181D] border border-[rgba(136,136,136,0.25)] rounded-lg focus:ring-2 focus:ring-[#022683] focus:border-[#022683] outline-none text-[#E6E6E6] transition-all duration-300"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-[#888888] mb-1">
                              URL
                            </label>
                            <input
                              type="text"
                              value={link.url}
                              onChange={(e) => handleInputChange(link._id, "url", e.target.value)}
                              className="w-full px-3 py-2 bg-[#16181D] border border-[rgba(136,136,136,0.25)] rounded-lg focus:ring-2 focus:ring-[#022683] focus:border-[#022683] outline-none text-[#E6E6E6] transition-all duration-300"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={link.enabled}
                            onChange={() => handleToggleLink(link._id)}
                            className="sr-only"
                          />
                          <div className={`w-10 h-5 rounded-full transition-all duration-300 ${link.enabled ? 'bg-gradient-to-r from-green-500 to-green-600' : 'bg-[rgba(136,136,136,0.3)]'}`}>
                            <div className={`w-4 h-4 bg-white rounded-full m-0.5 transition-all duration-300 shadow-md ${link.enabled ? 'translate-x-5' : ''}`}></div>
                          </div>
                        </label>
                        <button
                          onClick={() => handleDeleteLink(link._id)}
                          className="p-2 text-red-400 hover:bg-[rgba(255,0,0,0.1)] rounded transition-all duration-300 hover:scale-110"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={handleSaveQuickLinks}
                  disabled={quickLinksLoading}
                  className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-[#022683] to-[#033aa0] text-white rounded-lg hover:from-[#033aa0] hover:to-[#022683] transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {quickLinksLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Save Quick Links</span>
                    </>
                  )}
                </button>
              </div>

              {/* <div className="mt-6 p-4 bg-gradient-to-r from-[rgba(2,38,131,0.2)] to-[rgba(136,136,136,0.2)] border border-[rgba(136,136,136,0.25)] rounded-lg">
                <p className="text-sm text-[#E6E6E6]">
                  <strong>💡 Tip:</strong> Drag links to reorder. Choose where each link appears (Footer, Sidebar, or Both). Links open in same tab by default.
                </p>
              </div> */}
            </div>
          </div>

          {/* Preview Panel */}
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-br from-[#16181D] to-[#1a1d24] rounded-lg shadow-lg p-6 border border-[rgba(136,136,136,0.25)] sticky top-8 hover-card-lift animate-fade-in">
              <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                <Eye className="w-5 h-5 text-[#888888]" />
                Live Preview
              </h3>

              <div className="mb-6">
                <h4 className="text-sm font-medium text-white mb-3">
                  Footer Quick Links
                </h4>

                <div className="p-4 bg-gradient-to-r from-[#888888] to-[#022683] rounded-lg">
                  <div className="space-y-2">
                    {quickLinks
                      .filter((l) => l.enabled)
                      .map((link) => (
                        <div
                          key={link._id}
                          className="flex items-center gap-2 text-white text-sm"
                        >
                          <span>•</span>
                          <span>{link.title}</span>
                        </div>
                      ))}
                  </div>
                </div>
              </div>

              <div className="mt-4 p-3 bg-[rgba(2,38,131,0.2)] rounded-lg border border-[rgba(136,136,136,0.25)]">
                <p className="text-xs text-[#E6E6E6]">
                  <strong>Active Links:</strong> {quickLinks.filter(l => l.enabled).length} of {quickLinks.length}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer Sections Tab */}
      {activeTab === 'footerSections' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center bg-gradient-to-br from-[#16181D] to-[#1a1d24] p-6 rounded-lg border border-[rgba(136,136,136,0.25)] animate-fade-in shadow-lg">
            <div>
              <h2 className="text-xl font-bold text-white">Dynamic Footer Sections</h2>
              <p className="text-[#888888] text-sm mt-1">Add custom link groups like "Services" to your footer</p>
            </div>
            <button
              onClick={handleAddFooterSection}
              className="px-4 py-2 bg-gradient-to-r from-[#022683] to-[#033aa0] text-white rounded-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Add New Section
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {footerSections.map((section, sIndex) => (
              <div key={section._id || sIndex} className="bg-[#16181D] rounded-lg border border-[rgba(136,136,136,0.2)] p-6 animate-scale-in">
                <div className="flex justify-between items-center mb-4">
                  <input
                    type="text"
                    value={section.title}
                    onChange={(e) => handleFooterSectionChange(sIndex, 'title', e.target.value)}
                    className="bg-transparent border-b border-white/10 text-lg font-bold text-white focus:border-[#022683] outline-none w-2/3 py-1"
                    placeholder="Section Title"
                  />
                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={section.enabled}
                        onChange={(e) => handleFooterSectionChange(sIndex, 'enabled', e.target.checked)}
                        className="sr-only"
                      />
                      <div className={`w-10 h-5 rounded-full ${section.enabled ? 'bg-green-500' : 'bg-gray-600'} transition-all`}>
                        <div className={`w-4 h-4 bg-white rounded-full m-0.5 transition-all ${section.enabled ? 'translate-x-5' : ''}`} />
                      </div>
                    </label>
                    <button
                      onClick={() => handleDeleteFooterSection(sIndex)}
                      className="p-1.5 text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  {section.links.map((link: any, lIndex: number) => (
                    <div key={lIndex} className="flex gap-2 items-center">
                      <input
                        type="text"
                        value={link.label}
                        onChange={(e) => handleFooterLinkChange(sIndex, lIndex, 'label', e.target.value)}
                        placeholder="Label"
                        className="flex-1 px-3 py-1.5 bg-[#0F1115] border border-white/5 rounded text-sm text-[#E6E6E6]"
                      />
                      <input
                        type="text"
                        value={link.href}
                        onChange={(e) => handleFooterLinkChange(sIndex, lIndex, 'href', e.target.value)}
                        placeholder="URL/Hash"
                        className="flex-1 px-3 py-1.5 bg-[#0F1115] border border-white/5 rounded text-sm text-[#E6E6E6]"
                      />
                      <button
                        onClick={() => handleDeleteFooterLink(sIndex, lIndex)}
                        className="p-1.5 text-red-500/50 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => handleAddFooterLink(sIndex)}
                    className="w-full py-2 border border-dashed border-white/10 rounded text-xs text-[#888888] hover:text-white hover:border-[#022683] transition-all"
                  >
                    + Add Link
                  </button>
                </div>
              </div>
            ))}
          </div>

          {footerSections.length > 0 && (
            <div className="flex justify-end pt-4">
              <button
                onClick={handleSaveFooterSections}
                className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-[#022683] to-[#033aa0] text-white rounded-lg shadow-xl hover:scale-105 transition-all"
              >
                {footerSectionsLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Footer Sections
              </button>
            </div>
          )}
        </div>
      )}
      {activeTab === 'footer' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-[#16181D] to-[#1a1d24] rounded-lg shadow-lg p-6 border border-[rgba(136,136,136,0.25)] hover-card-lift animate-fade-in">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <span className="w-1 h-6 bg-gradient-to-b from-[#888888] to-[#022683] rounded-full animate-pulse-slow"></span>
              Footer Content
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#888888] mb-2">
                  Footer Description
                </label>
                <textarea
                  value={footerData.description}
                  onChange={(e) => setFooterData({ ...footerData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 bg-[#16181D] border border-[rgba(136,136,136,0.25)] rounded-lg focus:ring-2 focus:ring-[#022683] focus:border-[#022683] outline-none text-[#E6E6E6] transition-all duration-300"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#888888] mb-2">
                  LinkedIn URL
                </label>
                <input
                  type="url"
                  value={footerData.socialMedia.linkedin}
                  onChange={(e) => setFooterData({
                    ...footerData,
                    socialMedia: { ...footerData.socialMedia, linkedin: e.target.value }
                  })}
                  className="w-full px-4 py-2 bg-[#16181D] border border-[rgba(136,136,136,0.25)] rounded-lg focus:ring-2 focus:ring-[#022683] focus:border-[#022683] outline-none text-[#E6E6E6] transition-all duration-300"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#888888] mb-2">
                  X.Com URL
                </label>
                <input
                  type="url"
                  value={footerData.socialMedia.x}
                  onChange={(e) => setFooterData({
                    ...footerData,
                    socialMedia: { ...footerData.socialMedia, x: e.target.value }
                  })}
                  className="w-full px-4 py-2 bg-[#16181D] border border-[rgba(136,136,136,0.25)] rounded-lg focus:ring-2 focus:ring-[#022683] focus:border-[#022683] outline-none text-[#E6E6E6] transition-all duration-300"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#888888] mb-2">
                  Facebook URL
                </label>
                <input
                  type="url"
                  value={footerData.socialMedia.facebook}
                  onChange={(e) => setFooterData({
                    ...footerData,
                    socialMedia: { ...footerData.socialMedia, facebook: e.target.value }
                  })}
                  className="w-full px-4 py-2 bg-[#16181D] border border-[rgba(136,136,136,0.25)] rounded-lg focus:ring-2 focus:ring-[#022683] focus:border-[#022683] outline-none text-[#E6E6E6] transition-all duration-300"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#888888] mb-2">
                  Copyright Text
                </label>
                <input
                  type="text"
                  value={footerData.copyright}
                  onChange={(e) => setFooterData({ ...footerData, copyright: e.target.value })}
                  className="w-full px-4 py-2 bg-[#16181D] border border-[rgba(136,136,136,0.25)] rounded-lg focus:ring-2 focus:ring-[#022683] focus:border-[#022683] outline-none text-[#E6E6E6] transition-all duration-300"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={handleFooterSave}
                disabled={footerLoading}
                className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-[#022683] to-[#033aa0] text-white rounded-lg hover:from-[#033aa0] hover:to-[#022683] transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {footerLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save Footer Content</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="bg-gradient-to-br from-[#16181D] to-[#1a1d24] rounded-lg shadow-lg p-6 border border-[rgba(136,136,136,0.25)] hover-card-lift animate-fade-in">
            <h3 className="font-bold text-white mb-4 flex items-center gap-2">
              <Eye className="w-5 h-5 text-[#888888]" />
              Footer Preview
            </h3>
            <div className="p-4 bg-gradient-to-r from-[#888888] to-[#022683] text-white rounded-lg">
              <p className="text-sm mb-4">{footerData.description}</p>
              <div className="flex gap-4 mb-4">
                <a href={footerData.socialMedia.linkedin} className="text-white hover:underline text-sm">LinkedIn</a>
                <a href={footerData.socialMedia.x} className="text-white hover:underline text-sm">X.com</a>
                <a href={footerData.socialMedia.facebook} className="text-white hover:underline text-sm">Facebook</a>
              </div>
              <p className="text-xs text-white/80">{footerData.copyright}</p>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-8 right-8 bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-lg shadow-lg animate-fade-in z-50">
          {toast}
        </div>
      )}

      {/* Add Quick Link Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-gradient-to-br from-[#16181D] to-[#1a1d24] p-12 rounded-lg w-96 border border-[rgba(136,136,136,0.25)] shadow-xl animate-scale-in">
            <h3 className="text-lg font-bold mb-4 text-white">Add Quick Link</h3>

            <div className="space-y-6 ">
              <div>
                <label className="block text-sm font-medium text-[#888888] mb-1">Title</label>
                <input
                  type="text"
                  placeholder="Enter link title"
                  value={newLink.title}
                  onChange={(e) => {
                    setNewLink({ ...newLink, title: e.target.value });
                    setFormErrors({ ...formErrors, title: '' });
                  }}
                  className={`w-full border ${formErrors.title ? 'border-red-500' : 'border-[rgba(136,136,136,0.25)]'} bg-[#0F1115] px-3 py-2 rounded text-[#E6E6E6] focus:ring-2 focus:ring-[#022683] outline-none transition-all duration-300`}
                />
                {formErrors.title && <p className="text-red-400 text-xs mt-1">{formErrors.title}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-[#888888] mb-1">URL</label>
                <input
                  type="text"
                  placeholder="Enter URL"
                  value={newLink.url}
                  onChange={(e) => {
                    setNewLink({ ...newLink, url: e.target.value });
                    setFormErrors({ ...formErrors, url: '' });
                  }}
                  className={`w-full border ${formErrors.url ? 'border-red-500' : 'border-[rgba(136,136,136,0.25)]'} bg-[#0F1115] px-3 py-2 rounded text-[#E6E6E6] focus:ring-2 focus:ring-[#022683] outline-none transition-all duration-300`}
                />
                {formErrors.url && <p className="text-red-400 text-xs mt-1">{formErrors.url}</p>}
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowModal(false);
                  setNewLink({ title: "", url: "" });
                  setFormErrors({ title: '', url: '' });
                }}
                className="px-4 py-2 bg-[rgba(136,136,136,0.3)] text-[#E6E6E6] rounded hover:bg-[rgba(136,136,136,0.4)] transition-all duration-300"
              >
                Cancel
              </button>

              <button
                onClick={handleAddLink}
                className="px-4 py-2 bg-gradient-to-r from-[#022683] to-[#033aa0] text-white rounded hover:from-[#033aa0] hover:to-[#022683] transition-all duration-300"
              >
                Add Link
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
