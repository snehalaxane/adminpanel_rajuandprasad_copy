import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Trash2, Save, Download, Eye, Building2, Users } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const resolveImageUrl = (url: string | undefined) => {
  if (!url) return '';
  if (url.startsWith('http') || url.startsWith('data:')) return url;
  return `${API_BASE_URL.replace(/\/$/, '')}/${url.replace(/^\//, '')}`;
};

export default function NetworkingManager() {
  const [domesticContent, setDomesticContent] = useState({
    pageTitle: 'Networking',
    pageSubtitle: 'Connect with us to expand professional collaboration across India.',
    backgroundImage: '',
    title: 'Domestic Networking',
    description: '',
    icon: 'Network',
    enabled: true
  });

  const [associates, setAssociates] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [toast, setToast] = useState('');
  const [deleteState, setDeleteState] = useState<{
    type: 'associate' | 'submission' | null;
    id?: string;
  }>({ type: null });

  const [deleting, setDeleting] = useState(false);
  const introFileInputRef = React.useRef<HTMLInputElement>(null);


  useEffect(() => {
    fetchContent();
    fetchAssociates();
    fetchSubmissions();
  }, []);

  const fetchContent = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/networking-content`);
      if (res.data) setDomesticContent(res.data);
    } catch (err) {
      console.error("Error fetching content:", err);
    }
  };

  const fetchAssociates = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/networking-associates`);
      setAssociates(res.data);
    } catch (err) {
      console.error("Error fetching associates:", err);
    }
  };

  const fetchSubmissions = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/networking-submissions`);
      setSubmissions(res.data);
    } catch (err) {
      console.error("Error fetching submissions:", err);
    }
  };

  const handleSaveContent = async () => {
    try {
      await axios.put(`${API_BASE_URL}/api/networking-content`, domesticContent);
      setToast('Networking content saved!');
      setTimeout(() => setToast(''), 3000);
    } catch (err) {
      setToast('Error saving content');
    }
  };

  const handleHeaderFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setDomesticContent(prev => ({ ...prev, backgroundImage: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddAssociate = async () => {
    try {
      const res = await axios.post(`${API_BASE_URL}/api/networking-associates`, { name: 'New Firm', icon: 'Building2', enabled: true });
      setAssociates([...associates, res.data]);
    } catch (err) {
      setToast('Error adding associate');
    }
  };

  const updateAssociate = async (id: string, field: string, value: any) => {
    const item = associates.find(a => a._id === id);
    if (!item) return;
    const newItem = { ...item, [field]: value };
    setAssociates(associates.map(a => a._id === id ? newItem : a));
    try {
      await axios.put(`${API_BASE_URL}/api/networking-associates/${id}`, newItem);
    } catch (err) {
      console.error("Error updating associate:", err);
    }
  };

  const openDeleteAssociate = (id: string) => {
    setDeleteState({ type: 'associate', id });
  };

  const openDeleteSubmission = (id: string) => {
    setDeleteState({ type: 'submission', id });
  };

  const confirmDelete = async () => {
    if (!deleteState.id || !deleteState.type) return;

    setDeleting(true);

    try {
      if (deleteState.type === 'associate') {
        await axios.delete(`${API_BASE_URL}/api/networking-associates/${deleteState.id}`);
        setAssociates(prev => prev.filter(a => a._id !== deleteState.id));
        setToast('Associate deleted');
      }

      if (deleteState.type === 'submission') {
        await axios.delete(`${API_BASE_URL}/api/networking-submissions/${deleteState.id}`);
        setSubmissions(prev => prev.filter(s => s._id !== deleteState.id));
        setToast('Submission deleted');
      }

    } catch (err) {
      setToast(`Error deleting ${deleteState.type}`);
    } finally {
      setDeleting(false);
      setDeleteState({ type: null });
      setTimeout(() => setToast(''), 3000);
    }
  };

  const updateSubmissionStatus = async (id: string, newStatus: string) => {
    try {
      await axios.put(`${API_BASE_URL}/api/networking-submissions/${id}`, { status: newStatus });
      setSubmissions(submissions.map(s => s._id === id ? { ...s, status: newStatus } : s));
      setToast(`Status updated to ${newStatus}`);
      setTimeout(() => setToast(''), 3000);
    } catch (err) {
      setToast('Error updating status');
    }
  };


  const handleExport = () => {
    if (submissions.length === 0) return setToast('No submissions to export');

    const headers = ['Full Name', 'Organisation', 'Email', 'Mobile', 'Date', 'Status'];
    const rows = submissions.map(s => [
      s.fullName,
      s.organisation,
      s.email,
      s.mobile,
      new Date(s.submissionDate).toLocaleDateString(),
      s.status
    ]);

    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `networking_submissions_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setToast('Submissions exported to CSV!');
    setTimeout(() => setToast(''), 3000);
  };

  return (
    <div className="p-8 bg-gradient-to-br from-[#0F1115] via-[#0F1115] to-[#16181D] min-h-full">
      <div className="mb-8 animate-fade-in">
        <h1 className="text-3xl font-bold text-white mb-2">Networking Page Management</h1>
        <p className="text-[#888888]">Manage networking content and partnership inquiries</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Editor Section */}
        <div className="lg:col-span-2 space-y-6 text-left">
          {/* Page Header Settings */}
          <div className="bg-[#16181D] rounded-lg shadow-lg p-6 border border-[rgba(136,136,136,0.25)] hover-card-lift animate-fade-in">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-[#E6E6E6] flex items-center gap-2">
                <Eye className="w-5 h-5 text-[#022683]" />
                Page Header Settings
              </h2>
              <button
                onClick={handleSaveContent}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#022683] to-[#033aa0] text-white rounded-lg hover:from-[#033aa0] hover:to-[#022683] shadow-md transition-all active:scale-95"
              >
                <Save className="w-4 h-4" />
                Save Header
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#888888] mb-2">Main Page Title</label>
                <input
                  type="text"
                  value={domesticContent.pageTitle}
                  onChange={(e) => setDomesticContent({ ...domesticContent, pageTitle: e.target.value })}
                  className="w-full px-4 py-2 bg-[#0F1115] border border-[rgba(136,136,136,0.25)] rounded-lg focus:ring-2 focus:ring-[#022683] focus:border-[#022683] outline-none text-[#E6E6E6] transition-all duration-300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#888888] mb-2">Main Page Subtitle</label>
                <textarea
                  value={domesticContent.pageSubtitle}
                  onChange={(e) => setDomesticContent({ ...domesticContent, pageSubtitle: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-2 bg-[#0F1115] border border-[rgba(136,136,136,0.25)] rounded-lg focus:ring-2 focus:ring-[#022683] focus:border-[#022683] outline-none text-[#E6E6E6] transition-all duration-300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#888888] mb-2">Background Image</label>
                <div className="flex gap-4 items-start">
                  <div className="flex-1 space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={domesticContent.backgroundImage?.startsWith('data:') ? 'Local Image Selected' : domesticContent.backgroundImage}
                        onChange={(e) => setDomesticContent({ ...domesticContent, backgroundImage: e.target.value })}
                        readOnly={domesticContent.backgroundImage?.startsWith('data:')}
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
                      {domesticContent.backgroundImage && (
                        <button
                          onClick={() => setDomesticContent({ ...domesticContent, backgroundImage: '' })}
                          className="px-4 py-2 bg-red-900/30 text-red-500 border border-red-500/30 rounded-lg hover:bg-red-900/50 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    <p className="text-[10px] text-[#888888] font-medium">Recommended size: 1920x375px for best display</p>
                  </div>
                  {domesticContent.backgroundImage && (
                    <div className="w-20 h-12 rounded-lg overflow-hidden border border-[rgba(136,136,136,0.25)] bg-[#0F1115] flex-shrink-0">
                      <img
                        src={resolveImageUrl(domesticContent.backgroundImage)}
                        alt="Header Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          {/* Domestic Networking */}
          <div className="bg-[#16181D] rounded-lg shadow-lg p-6 border border-[rgba(136,136,136,0.25)] hover-card-lift animate-fade-in">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-[#E6E6E6]">Domestic Networking Section</h2>
              <div className="flex items-center gap-4">
                <button
                  onClick={handleSaveContent}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#022683] to-[#033aa0] text-white rounded-lg hover:from-[#033aa0] hover:to-[#022683] shadow-md transition-all active:scale-95"
                >
                  <Save className="w-4 h-4" />
                  Save Section
                </button>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={domesticContent.enabled}
                    onChange={(e) => setDomesticContent({ ...domesticContent, enabled: e.target.checked })}
                    className="sr-only"
                  />
                  <div className={`w-10 h-5 rounded-full duration-300 ${domesticContent.enabled ? 'bg-gradient-to-r from-green-500 to-green-600' : 'bg-gradient-to-r from-gray-600 to-gray-700'}`}>
                    <div className={`w-4 h-4 bg-white rounded-full m-0.5 transition-transform duration-300 ${domesticContent.enabled ? 'translate-x-5' : ''}`}></div>
                  </div>
                </label>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#888888] mb-2">
                    Section Title
                  </label>
                  <input
                    type="text"
                    value={domesticContent.title}
                    onChange={(e) => setDomesticContent({ ...domesticContent, title: e.target.value })}
                    className="w-full px-4 py-2 bg-[#0F1115] border border-[rgba(136,136,136,0.25)] rounded-lg focus:ring-2 focus:ring-[#022683] focus:border-[#022683] outline-none text-[#E6E6E6] transition-all duration-300 hover:border-[#888888]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#888888] mb-2">
                    Icon (Lucide)
                  </label>
                  <input
                    type="text"
                    value={domesticContent.icon}
                    onChange={(e) => setDomesticContent({ ...domesticContent, icon: e.target.value })}
                    className="w-full px-4 py-2 bg-[#0F1115] border border-[rgba(136,136,136,0.25)] rounded-lg focus:ring-2 focus:ring-[#022683] focus:border-[#022683] outline-none text-[#E6E6E6] transition-all duration-300 hover:border-[#888888]"
                    placeholder="e.g., Network, Globe, Users"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#888888] mb-2">
                  Description
                </label>
                <textarea
                  value={domesticContent.description}
                  onChange={(e) => setDomesticContent({ ...domesticContent, description: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 bg-[#0F1115] border border-[rgba(136,136,136,0.25)] rounded-lg focus:ring-2 focus:ring-[#022683] focus:border-[#022683] outline-none text-[#E6E6E6] transition-all duration-300 hover:border-[#888888]"
                />
              </div>
            </div>
          </div>

          {/* Associates List */}
          <div className="bg-[#16181D] rounded-lg shadow-lg p-6 border border-[rgba(136,136,136,0.25)] hover-card-lift animate-fade-in">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-[#E6E6E6]">Associate Firms</h2>
              <button
                onClick={handleAddAssociate}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#022683] to-[#033aa0] text-white rounded-lg hover:from-[#033aa0] hover:to-[#022683] shadow-md transition-all active:scale-95"
              >
                <Plus className="w-4 h-4" />
                Add Associate
              </button>
            </div>

            <div className="space-y-3">
              {associates.map((associate) => (
                <div key={associate._id} className="flex items-center gap-3 p-4 bg-[#0F1115] border border-[rgba(136,136,136,0.25)] rounded-lg hover:border-[#888888] transition-colors">
                  <div className="flex-1 grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={associate.name}
                      onChange={(e) => updateAssociate(associate._id, 'name', e.target.value)}
                      className="px-3 py-2 bg-[#16181D] border border-[rgba(136,136,136,0.25)] rounded-lg focus:ring-2 focus:ring-[#022683] focus:border-[#022683] outline-none text-[#E6E6E6]"
                      placeholder="Firm Name"
                    />
                    <input
                      type="text"
                      value={associate.icon}
                      onChange={(e) => updateAssociate(associate._id, 'icon', e.target.value)}
                      className="px-3 py-2 bg-[#16181D] border border-[rgba(136,136,136,0.25)] rounded-lg focus:ring-2 focus:ring-[#022683] focus:border-[#022683] outline-none text-[#E6E6E6]"
                      placeholder="Icon (Building2, Shield, etc.)"
                    />
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={associate.enabled}
                      onChange={(e) => updateAssociate(associate._id, 'enabled', e.target.checked)}
                      className="sr-only"
                    />
                    <div className={`w-10 h-5 rounded-full duration-300 ${associate.enabled ? 'bg-gradient-to-r from-green-500 to-green-600' : 'bg-gradient-to-r from-gray-600 to-gray-700'}`}>
                      <div className={`w-4 h-4 bg-white rounded-full m-0.5 transition-transform duration-300 ${associate.enabled ? 'translate-x-5' : ''}`}></div>
                    </div>
                  </label>
                  <button
                    onClick={() => openDeleteAssociate(associate._id)}
                    className="p-2 text-red-500 hover:bg-red-500/10 rounded transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>


          {/* Form Submissions */}
          <div className="bg-[#16181D] rounded-lg shadow-lg p-6 border border-[rgba(136,136,136,0.25)] hover-card-lift animate-fade-in">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-[#E6E6E6]">Form Submissions</h2>
              <button
                onClick={handleExport}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-600 shadow-md transition-all active:scale-95"
              >
                <Download className="w-4 h-4" />
                Export to Excel
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#0F1115]">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-[#888888] uppercase tracking-wider">Full Name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-[#888888] uppercase tracking-wider">Organisation</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-[#888888] uppercase tracking-wider">Email</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-[#888888] uppercase tracking-wider">Mobile</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-[#888888] uppercase tracking-wider">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-[#888888] uppercase tracking-wider">Profile</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-[#888888] uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-[#888888] uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[rgba(136,136,136,0.1)]">
                  {submissions.map((sub) => (
                    <tr key={sub._id} className="hover:bg-[rgba(136,136,136,0.05)] transition-colors">
                      <td className="px-4 py-3 text-sm text-[#E6E6E6] font-medium">{sub.fullName}</td>
                      <td className="px-4 py-3 text-sm text-[#888888]">{sub.organisation}</td>
                      <td className="px-4 py-3 text-sm text-[#888888]">{sub.email}</td>
                      <td className="px-4 py-3 text-sm text-[#888888]">{sub.mobile}</td>
                      <td className="px-4 py-3 text-sm text-[#888888] font-mono">
                        {new Date(sub.submissionDate).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {sub.profileFile ? (
                          <a href={`${API_BASE_URL}/${sub.profileFile}`} target="_blank" className="text-[#0077b5] hover:text-[#005a8c] hover:underline flex items-center gap-1 transition-colors">
                            <Download className="w-3 h-3" /> View
                          </a>
                        ) : <span className="text-[#888888]">No File</span>}
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={sub.status}
                          onChange={(e) => updateSubmissionStatus(sub._id, e.target.value)}
                          className={`px-2 py-1 text-xs rounded-full border-none outline-none cursor-pointer transition-all ${sub.status === 'Replied' ? 'bg-green-500/20 text-green-500' :
                            sub.status === 'Rejected' ? 'bg-red-500/20 text-red-500' :
                              'bg-yellow-500/20 text-yellow-500'
                            }`}
                        >
                          <option value="Pending" className="bg-[#16181D]">Pending</option>
                          <option value="Replied" className="bg-[#16181D]">Replied</option>
                          <option value="Rejected" className="bg-[#16181D]">Rejected</option>
                        </select>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => openDeleteSubmission(sub._id)}
                          className="p-1.5 text-red-500/70 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                          title="Delete Submission"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Preview Panel */}
        <div className="lg:col-span-1">
          <div className="bg-[#16181D] rounded-lg shadow-lg p-6 sticky top-8 border border-[rgba(136,136,136,0.25)] hover-card-lift animate-fade-in">
            <h3 className="font-bold text-[#E6E6E6] mb-4 flex items-center gap-2">
              <Eye className="w-5 h-5 text-[#022683]" />
              Page Preview
            </h3>

            {/* Domestic Preview */}
            {domesticContent.enabled && (
              <div className="mb-8 bg-gradient-to-r from-[#888888] to-[#022683] rounded-3xl shadow-2xl p-8 relative overflow-hidden group animate-fade-in transition-all duration-300 hover:scale-105">
                <div className="flex items-center gap-5 mb-6">
                  <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center text-white backdrop-blur-sm shadow-inner">
                    {/* Icon would normally be rendered dynamically based on domesticContent.icon string */}
                    <div className="text-white"><Building2 className="w-7 h-7" /></div>
                  </div>
                  <h4 className="text-2xl font-bold text-white tracking-tight">{domesticContent.title}</h4>
                </div>
                <p className="text-white/90 leading-relaxed text-sm font-medium">
                  {domesticContent.description}
                </p>
              </div>
            )}

            {/* Other Associates Preview */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-[rgba(2,38,131,0.2)] rounded-xl flex items-center justify-center text-[#022683]">
                  <Users className="w-5 h-5 text-[#3b82f6]" />
                </div>
                <h4 className="text-xl font-bold text-[#E6E6E6]">Other Associates</h4>
              </div>

              <div className="space-y-3">
                {associates.filter(a => a.enabled).map((associate) => (
                  <div key={associate._id} className="group bg-[#0F1115] hover:bg-[#1A1D24] shadow-md border border-transparent hover:border-[rgba(136,136,136,0.25)] p-4 rounded-2xl transition-all duration-300 flex items-center gap-4">
                    <div className="w-10 h-10 bg-[#16181D] shadow-sm border border-[rgba(136,136,136,0.1)] rounded-lg flex items-center justify-center text-[#022683]">
                      <Building2 className="w-5 h-5 text-[#3b82f6]" />
                    </div>
                    <span className="font-semibold text-[#888888] text-sm group-hover:text-[#E6E6E6]">
                      {associate.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Stats Summary */}
            <div className="p-4 bg-[#0F1115] rounded-2xl border border-[rgba(136,136,136,0.25)]">
              <h5 className="text-xs font-bold text-[#888888] uppercase mb-3 tracking-wider">Submissions Overview</h5>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-[#888888]">Total Applications</span>
                <span className="font-bold text-[#E6E6E6]">{submissions.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-[#888888]">Pending Review</span>
                <span className="font-bold text-orange-500">{submissions.filter(s => s.status === 'Pending').length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        {/* Toast is handled automatically by individual save buttons now, keeping this for consistency if needed */}
      </div>

      {toast && (
        <div className="fixed bottom-8 right-8 bg-[#16181D] text-white px-6 py-3 rounded-lg shadow-2xl border border-[rgba(136,136,136,0.25)] animate-fade-in flex items-center gap-3 z-50">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          {toast}
        </div>
      )}

      {deleteState.type && (
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
              Confirm Deletion
            </h3>

            <p className="text-sm text-[#888888] mb-6">
              This action cannot be undone.
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteState({ type: null })}
                disabled={deleting}
                className="px-4 py-2 rounded-lg bg-[rgba(136,136,136,0.2)] text-white hover:bg-[rgba(136,136,136,0.3)] transition-all"
              >
                Cancel
              </button>

              <button
                onClick={confirmDelete}
                disabled={deleting}
                className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-all font-medium"
              >
                {deleting ? "Deleting..." : "Delete Permanently"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
