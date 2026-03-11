import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, GripVertical, Save, X, Briefcase, MapPin, User, Upload, Image as ImageIcon } from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const resolveImageUrl = (url: string | undefined) => {
  if (!url) return '';
  if (url.startsWith('http') || url.startsWith('data:')) return url;
  return `${API_BASE_URL.replace(/\/$/, '')}/${url.replace(/^\//, '')}`;
};

interface Alumni {
  _id?: string;
  name: string;
  company: string;
  designation: string;
  industry: string;
  enabled: boolean;
  order: number;
}

export default function AlumniManager() {
  const [alumni, setAlumni] = useState<Alumni[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingAlumni, setEditingAlumni] = useState<Alumni | null>(null);
  const [toast, setToast] = useState('');
  const [uploadingFile, setUploadingFile] = useState<File | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [headerData, setHeaderData] = useState({
    title: '',
    subtitle: '',
    backgroundImage: '',
    enabled: true
  });
  const introFileInputRef = React.useRef<HTMLInputElement>(null);
  const [savingHeader, setSavingHeader] = useState(false);


  const [formData, setFormData] = useState({
    name: '',
    company: '',
    designation: '',
    industry: '',
    enabled: true
  });

  useEffect(() => {
    fetchAlumni();
    fetchHeader();
  }, []);

  const fetchHeader = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/alumni-intro`);
      if (response.data) {
        setHeaderData({
          title: response.data.title || '',
          subtitle: response.data.subtitle || '',
          backgroundImage: response.data.backgroundImage || '',
          enabled: response.data.enabled !== undefined ? response.data.enabled : true
        });
      }
    } catch (err) {
      console.error('Error fetching header:', err);
    }
  };

  const handleHeaderFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setHeaderData(prev => ({ ...prev, backgroundImage: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const fetchAlumni = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/alumni`);
      setAlumni(response.data);
    } catch (err) {
      console.error('Error fetching alumni:', err);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setToast('File size must be less than 5MB');
        setTimeout(() => setToast(''), 3000);
        return;
      }
      setUploadingFile(file);
    }
  };

  const handleAddNew = () => {
    setEditingAlumni(null);
    setUploadingFile(null);
    setFormData({
      name: '',
      company: '',
      designation: '',
      industry: '',
      enabled: true
    });
    setShowModal(true);
  };

  const handleEdit = (alum: Alumni) => {
    setEditingAlumni(alum);
    setUploadingFile(null);
    setFormData({
      name: alum.name,
      company: alum.company,
      designation: alum.designation,
      industry: alum.industry || '',
      enabled: alum.enabled
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.company || !formData.designation) {
      setToast('Please fill in all required fields');
      setTimeout(() => setToast(''), 3000);
      return;
    }

    const data = {
      name: formData.name,
      company: formData.company,
      designation: formData.designation,
      industry: formData.industry,
      enabled: formData.enabled,
    };

    try {
      if (editingAlumni) {
        await axios.put(`${API_BASE_URL}/api/alumni/${editingAlumni._id}`, data);
        setToast('Alumni updated successfully!');
      } else {
        await axios.post(`${API_BASE_URL}/api/alumni`, data);
        setToast('Alumni added successfully!');
      }
      fetchAlumni();
      setShowModal(false);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Error saving alumni';
      setToast(errorMessage);
    }
    setTimeout(() => setToast(''), 3000);
  };

  const handleDelete = (id: string) => {
    setDeleteId(id);
  };
  const confirmDelete = async () => {
    if (!deleteId) return;

    try {
      setDeleting(true);
      await axios.delete(`${API_BASE_URL}/api/alumni/${deleteId}`);
      setToast('Alumni deleted successfully!');
      fetchAlumni();
    } catch (err) {
      setToast('Error deleting alumni');
    } finally {
      setDeleting(false);
      setDeleteId(null);
      setTimeout(() => setToast(''), 3000);
    }
  };

  const handleHeaderSave = async () => {
    setSavingHeader(true);
    try {
      await axios.put(`${API_BASE_URL}/api/alumni-intro`, headerData);
      setToast('Page header updated successfully!');
    } catch (err) {
      setToast('Error updating page header');
    } finally {
      setSavingHeader(false);
      setTimeout(() => setToast(''), 3000);
    }
  };


  return (
    <div className="p-8 bg-gradient-to-br from-[#0F1115] via-[#0F1115] to-[#16181D] min-h-full">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Alumni Management</h1>
          <p className="text-[#888888]">Manage alumni profiles and achievements</p>
        </div>
        <button
          onClick={handleAddNew}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#022683] to-[#033aa0] text-white rounded-lg hover:from-[#033aa0] hover:to-[#022683] transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 relative overflow-hidden group"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-[rgba(136,136,136,0.2)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <Plus className="w-4 h-4 relative z-10 transition-transform duration-300 group-hover:rotate-90" />
          <span className="relative z-10">Add Alumni</span>
        </button>
      </div>

      {/* Page Header Section */}
      <div className="mb-8 bg-gradient-to-br from-[#16181D] to-[#1a1d24] rounded-lg shadow-lg border border-[rgba(136,136,136,0.25)] overflow-hidden animate-fade-in">
        <div className="p-4 border-b border-[rgba(136,136,136,0.25)] bg-gradient-to-r from-[rgba(136,136,136,0.05)] to-transparent flex items-center justify-between">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Edit className="w-5 h-5 text-[#022683]" />
            Alumni Page Header
          </h2>
          <button
            onClick={handleHeaderSave}
            disabled={savingHeader}
            className="flex items-center gap-2 px-4 py-2 bg-[#022683] text-white rounded-lg hover:bg-[#033aa0] transition-all duration-300 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {savingHeader ? 'Saving...' : 'Save Header'}
          </button>
        </div>
        <div className="p-6 space-y-6">

          {/* Top Row: Heading + Actions */}
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-[#E6E6E6]">
              Page Header Settings
            </h2>

            <div className="flex items-center gap-4">

              {/* Enable Toggle */}
              <div
                onClick={() =>
                  setHeaderData({ ...headerData, enabled: !headerData.enabled })
                }
                className={`w-12 h-7 flex items-center rounded-full cursor-pointer transition-all duration-300 px-1 ${headerData.enabled ? "bg-green-500" : "bg-gray-600"
                  }`}
              >
                <div
                  className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-all duration-300 ${headerData.enabled ? "translate-x-5" : "translate-x-0"
                    }`}
                />
              </div>


            </div>
          </div>

          {/* Title + Subtitle Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* Page Title */}
            <div>
              <label className="block text-sm font-medium text-[#888888] mb-2">
                Page Title
              </label>
              <input
                type="text"
                value={headerData.title}
                onChange={(e) =>
                  setHeaderData({ ...headerData, title: e.target.value })
                }
                className="w-full px-4 py-3 bg-[#0F1115] border border-[rgba(136,136,136,0.25)] rounded-lg focus:ring-2 focus:ring-[#022683] outline-none text-[#E6E6E6] transition-all"
                placeholder="e.g. Our Alumni Students"
              />
            </div>

            {/* Subtitle */}
            <div>
              <label className="block text-sm font-medium text-[#888888] mb-2">
                Subtitle / Description
              </label>
              <input
                type="text"
                value={headerData.subtitle}
                onChange={(e) =>
                  setHeaderData({ ...headerData, subtitle: e.target.value })
                }
                className="w-full px-4 py-3 bg-[#0F1115] border border-[rgba(136,136,136,0.25)] rounded-lg focus:ring-2 focus:ring-[#022683] outline-none text-[#E6E6E6] transition-all"
                placeholder="e.g. Over the years, Raju and Prasad has produced over 200 Chartered Accountants..."
              />
            </div>

          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-[#888888] mb-2">Background Image</label>
            <div className="flex gap-4 items-start">
              <div className="flex-1 space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={headerData.backgroundImage?.startsWith('data:') ? 'Local Image Selected' : headerData.backgroundImage}
                    onChange={(e) => setHeaderData({ ...headerData, backgroundImage: e.target.value })}
                    readOnly={headerData.backgroundImage?.startsWith('data:')}
                    className="flex-1 px-4 py-3 bg-[#0F1115] border border-[rgba(136,136,136,0.25)] rounded-lg text-white outline-none focus:ring-2 focus:ring-[#022683]"
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
                    className="px-6 py-3 bg-[rgba(136,136,136,0.1)] text-white rounded-lg hover:bg-[rgba(136,136,136,0.2)] transition-colors flex items-center gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    Upload
                  </button>
                  {headerData.backgroundImage && (
                    <button
                      onClick={() => setHeaderData({ ...headerData, backgroundImage: '' })}
                      className="px-4 py-3 bg-red-900/30 text-red-500 border border-red-500/30 rounded-lg hover:bg-red-900/50 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <p className="text-[10px] text-[#888888] font-medium">Recommended size: 1920x375px for best display</p>
              </div>
              {headerData.backgroundImage && (
                <div className="w-20 h-12 rounded-lg overflow-hidden border border-[rgba(136,136,136,0.25)] bg-[#0F1115] flex-shrink-0">
                  <img
                    src={resolveImageUrl(headerData.backgroundImage)}
                    alt="Header Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Alumni Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {alumni.map((alum, index) => (
          <div
            key={alum._id}
            className="bg-gradient-to-br from-[#16181D] to-[#1a1d24] rounded-lg shadow-lg border border-[rgba(136,136,136,0.25)] overflow-hidden hover-card-lift animate-fade-in transition-all duration-300"
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            {/* Header with drag handle and status */}
            <div className="flex items-center justify-between p-4 border-b border-[rgba(136,136,136,0.25)] bg-gradient-to-r from-[rgba(136,136,136,0.05)] to-transparent">
              <GripVertical className="w-5 h-5 text-[#888888] cursor-move hover:text-[#E6E6E6] transition-colors duration-300" />
              <span className={`px-2 py-1 text-xs rounded ${alum.enabled
                ? 'bg-gradient-to-r from-green-500/20 to-green-600/20 text-green-400 border border-green-500/30'
                : 'bg-gradient-to-r from-gray-500/20 to-gray-600/20 text-gray-400 border border-gray-500/30'
                }`}>
                {alum.enabled ? 'Active' : 'Inactive'}
              </span>
            </div>

            {/* Photo and Basic Info */}
            <div className="p-6">
              <div className="flex items-start gap-4 mb-4">


                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold text-white mb-1 truncate">{alum.name}</h3>
                  <div className="flex items-center gap-2 text-sm text-[#888888] mb-1">
                    <Briefcase className="w-3.5 h-3.5 flex-shrink-0" />
                    <span className="truncate">{alum.designation}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-[#888888]">
                    <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                    <span className="truncate">{alum.industry}</span>
                  </div>

                </div>
              </div>

              {/* Company and Years */}
              <div className="mb-4 p-3 bg-[#0F1115] rounded-lg border border-[rgba(136,136,136,0.25)]">
                <p className="text-sm font-medium text-white mb-1">{alum.company}</p>

              </div>



              {/* Actions */}
              <div className="flex items-center gap-2 pt-4 border-t border-[rgba(136,136,136,0.25)]">
                <button
                  onClick={() => handleEdit(alum)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-[rgba(136,136,136,0.1)] text-[#888888] rounded hover:bg-[rgba(136,136,136,0.2)] hover:text-[#E6E6E6] transition-all duration-300 hover:scale-105"
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span className="text-sm">Edit</span>
                </button>
                <button
                  onClick={() => handleDelete(alum._id!)}
                  className="p-2 text-red-400 hover:bg-[rgba(255,0,0,0.1)] rounded transition-all duration-300 hover:scale-110"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {alumni.length === 0 && (
          <div className="col-span-full text-center py-12">
            <User className="w-12 h-12 mx-auto mb-3 text-[#888888] opacity-50" />
            <p className="text-[#888888]">No alumni records found</p>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in p-4">
          <div className="bg-gradient-to-br from-[#0F1115] via-[#16181D] to-[#0F1115] rounded-lg shadow-2xl border border-[rgba(136,136,136,0.25)] w-full max-w-3xl max-h-[90vh] overflow-y-auto animate-scale-in">
            {/* Modal Header */}
            <div className="sticky top-0 bg-gradient-to-r from-[#16181D] to-[#1a1d24] px-6 py-4 flex items-center justify-between border-b border-[rgba(136,136,136,0.25)] z-10">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <User className="w-5 h-5" />
                {editingAlumni ? 'Edit Alumni' : 'Add New Alumni'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-[rgba(136,136,136,0.1)] rounded-lg transition-all duration-300 hover:rotate-90"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Name and Photo URL */}
              <div className="grid grid-cols-2 gap-4">
                <div className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
                  <label className="block text-sm font-medium text-[#888888] mb-2">
                    Full Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Vikram Singh"
                    className="w-full px-4 py-3 bg-[#0F1115] border border-[rgba(136,136,136,0.25)] rounded-lg focus:ring-2 focus:ring-[#022683] focus:border-[#022683] outline-none text-[#E6E6E6] transition-all duration-300 hover:border-[#888888]"
                  />
                </div>


              </div>

              {/* Company and Designation */}
              <div className="grid grid-cols-2 gap-4">
                <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
                  <label className="block text-sm font-medium text-[#888888] mb-2">
                    Current Company <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    placeholder="e.g., Deloitte"
                    className="w-full px-4 py-3 bg-[#0F1115] border border-[rgba(136,136,136,0.25)] rounded-lg focus:ring-2 focus:ring-[#022683] focus:border-[#022683] outline-none text-[#E6E6E6] transition-all duration-300 hover:border-[#888888]"
                  />
                </div>

                <div className="animate-fade-in" style={{ animationDelay: '0.25s' }}>
                  <label className="block text-sm font-medium text-[#888888] mb-2">
                    Designation <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.designation}
                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                    placeholder="e.g., Senior Manager - Tax"
                    className="w-full px-4 py-3 bg-[#0F1115] border border-[rgba(136,136,136,0.25)] rounded-lg focus:ring-2 focus:ring-[#022683] focus:border-[#022683] outline-none text-[#E6E6E6] transition-all duration-300 hover:border-[#888888]"
                  />
                </div>
              </div>

              {/* Industry */}
              <div className="animate-fade-in" style={{ animationDelay: '0.3s' }}>
                <label className="block text-sm font-medium text-[#888888] mb-2">
                  Industry
                </label>
                <input
                  type="text"
                  value={formData.industry}
                  onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                  placeholder="e.g., Manufacturing, Finance"
                  className="w-full px-4 py-3 bg-[#0F1115] border border-[rgba(136,136,136,0.25)] rounded-lg focus:ring-2 focus:ring-[#022683] focus:border-[#022683] outline-none text-[#E6E6E6] transition-all duration-300 hover:border-[#888888]"
                />
              </div>

              {/* Country and LinkedIn */}
              <div className="grid grid-cols-2 gap-4">

              </div>

              {/* Years */}
              <div className="grid grid-cols-2 gap-4">

              </div>



              {/* Active Toggle */}
              <div className="animate-fade-in" style={{ animationDelay: '0.6s' }}>
                <label className="flex items-center gap-3 cursor-pointer group p-4 bg-[#0F1115] rounded-lg border border-[rgba(136,136,136,0.25)] hover:border-[#888888] transition-all duration-300">
                  <input
                    type="checkbox"
                    checked={formData.enabled}
                    onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
                    className="sr-only"
                  />
                  <div className={`w-12 h-6 rounded-full transition-all duration-300 ${formData.enabled ? 'bg-gradient-to-r from-green-500 to-green-600' : 'bg-[rgba(136,136,136,0.3)]'} group-hover:shadow-lg`}>
                    <div className={`w-5 h-5 bg-white rounded-full m-0.5 transition-all duration-300 shadow-md ${formData.enabled ? 'translate-x-6' : ''} group-hover:scale-110`}></div>
                  </div>
                  <div className="flex-1">
                    <span className="text-[#E6E6E6] font-medium">Active on Website</span>
                    <p className="text-xs text-[#888888] mt-1">Display this alumni on the website</p>
                  </div>
                </label>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-gradient-to-r from-[#16181D] to-[#1a1d24] px-6 py-4 flex items-center justify-end gap-3 border-t border-[rgba(136,136,136,0.25)]">
              <button
                onClick={() => setShowModal(false)}
                className="px-6 py-2.5 border border-[rgba(136,136,136,0.25)] text-[#888888] rounded-lg hover:bg-[rgba(136,136,136,0.1)] hover:text-[#E6E6E6] transition-all duration-300 hover:scale-105"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-[#022683] to-[#033aa0] text-white rounded-lg hover:from-[#033aa0] hover:to-[#022683] transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-[rgba(136,136,136,0.2)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <Save className="w-4 h-4 relative z-10 transition-transform duration-300 group-hover:rotate-12" />
                <span className="relative z-10">{editingAlumni ? 'Update' : 'Add'} Alumni</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-8 right-8 bg-gradient-to-r from-[#888888] to-[#022683] text-white px-6 py-3 rounded-lg shadow-lg animate-fade-in border border-[rgba(255,255,255,0.2)] animate-glow-pulse z-50">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            {toast}
          </div>
        </div>
      )}
      {deleteId && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">

          <div className="bg-gradient-to-br from-[#16181D] to-[#1a1d24] 
      border border-red-500/30 
      shadow-2xl 
      rounded-xl 
      p-8 
      w-full 
      max-w-md 
      animate-scale-in">

            <h3 className="text-lg font-semibold text-white mb-3">
              Delete this alumni?
            </h3>

            <p className="text-sm text-[#888888] mb-6">
              This action cannot be undone.
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteId(null)}
                disabled={deleting}
                className="px-4 py-2 rounded-lg bg-[rgba(136,136,136,0.2)] text-white hover:bg-[rgba(136,136,136,0.3)] transition-all"
              >
                Cancel
              </button>

              <button
                onClick={confirmDelete}
                disabled={deleting}
                className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-all"
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>

          </div>
        </div>
      )}


    </div>
  );
}
