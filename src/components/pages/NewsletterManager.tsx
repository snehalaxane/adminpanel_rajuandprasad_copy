import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Edit, Trash2, Save, Download, Upload, X, Calendar, FileText, Search, Filter, Loader2 } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const resolveImageUrl = (url: string | undefined) => {
  if (!url) return '';
  if (url.startsWith('http') || url.startsWith('data:')) return url;
  return `${API_BASE_URL.replace(/\/$/, '')}/${url.replace(/^\//, '')}`;
};

interface Newsletter {
  _id?: string;
  month: string;
  year: string;
  title: string;
  industryReview: string;
  otherContents: string;
  pdfFile: string;
  enabled: boolean;
  createdAt?: string;
}

export default function NewsletterManager() {
  const [newsletters, setNewsletters] = useState<Newsletter[]>([]);

  const [showModal, setShowModal] = useState(false);
  const [editingNewsletter, setEditingNewsletter] = useState<Newsletter | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterYear, setFilterYear] = useState('all');
  const [toast, setToast] = useState('');
  const [uploadingFile, setUploadingFile] = useState<File | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [headerData, setHeaderData] = useState({ title: '', subtitle: '', backgroundImage: '' });
  const [savingHeader, setSavingHeader] = useState(false);
  const introFileInputRef = React.useRef<HTMLInputElement>(null);



  const [formData, setFormData] = useState({
    month: '',
    year: new Date().getFullYear().toString(),
    title: '',
    industryReview: '',
    otherContents: '',
    pdfFile: '',
    enabled: true
  });

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const years = Array.from({ length: 10 }, (_, i) => (new Date().getFullYear() - i).toString());

  useEffect(() => {
    fetchNewsletters();
    fetchHeader();
  }, []);

  const fetchHeader = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/newsletter-intro`);
      setHeaderData({
        title: res.data.title,
        subtitle: res.data.subtitle,
        backgroundImage: res.data.backgroundImage || ''
      });
    } catch (err) {
      console.error("Error fetching header:", err);
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


  const fetchNewsletters = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/newsletters`);
      setNewsletters(res.data);
    } catch (err) {
      console.error("Error fetching newsletters:", err);
    }
  };

  const handleAddNew = () => {
    setEditingNewsletter(null);
    setUploadingFile(null);
    setFormData({
      month: '',
      year: new Date().getFullYear().toString(),
      title: '',
      industryReview: '',
      otherContents: '',
      pdfFile: '',
      enabled: true
    });
    setShowModal(true);
  };

  const handleEdit = (newsletter: Newsletter) => {
    setEditingNewsletter(newsletter);
    setUploadingFile(null);
    setFormData({
      month: newsletter.month,
      year: newsletter.year,
      title: newsletter.title,
      industryReview: newsletter.industryReview,
      otherContents: newsletter.otherContents,
      pdfFile: newsletter.pdfFile,
      enabled: newsletter.enabled
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formData.month || !formData.year || !formData.title || (!formData.pdfFile && !uploadingFile)) {
      setToast('Please fill in all required fields and upload a PDF file');
      setTimeout(() => setToast(''), 3000);
      return;
    }

    const data = new FormData();
    data.append('month', formData.month);
    data.append('year', formData.year);
    data.append('title', formData.title);
    data.append('industryReview', formData.industryReview);
    data.append('otherContents', formData.otherContents);
    data.append('enabled', String(formData.enabled));
    if (uploadingFile) {
      data.append('pdfFile', uploadingFile);
    }

    try {
      if (editingNewsletter) {
        await axios.put(`${API_BASE_URL}/api/newsletters/${editingNewsletter._id}`, data);
        setToast('Newsletter updated successfully!');
      } else {
        await axios.post(`${API_BASE_URL}/api/newsletters`, data);
        setToast('Newsletter added successfully!');
      }
      fetchNewsletters();
      setShowModal(false);
    } catch (err) {
      setToast('Error saving newsletter');
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
      await axios.delete(`${API_BASE_URL}/api/newsletters/${deleteId}`);
      setNewsletters(newsletters.filter(n => n._id !== deleteId));
      setToast('Newsletter deleted successfully!');
    } catch (err) {
      setToast('Error deleting newsletter');
    } finally {
      setDeleting(false);
      setDeleteId(null);
      setTimeout(() => setToast(''), 3000);
    }
  };

  const handleUpdateHeader = async () => {
    try {
      setSavingHeader(true);
      await axios.put(`${API_BASE_URL}/api/newsletter-intro`, headerData);
      setToast('Header updated successfully!');
    } catch (err) {
      setToast('Error updating header');
    } finally {
      setSavingHeader(false);
      setTimeout(() => setToast(''), 3000);
    }
  };




  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type === 'application/pdf') {
        setUploadingFile(file);
      } else {
        setToast('Please upload a PDF file only');
        setTimeout(() => setToast(''), 3000);
      }
    }
  };

  const filteredNewsletters = newsletters.filter(n => {
    const matchesSearch =
      n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      n.industryReview.toLowerCase().includes(searchTerm.toLowerCase()) ||
      n.otherContents.toLowerCase().includes(searchTerm.toLowerCase()) ||
      n.month.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesYear = filterYear === 'all' || n.year === filterYear;

    return matchesSearch && matchesYear;
  });

  return (
    <div className="p-8 bg-gradient-to-br from-[#0F1115] via-[#0F1115] to-[#16181D] min-h-full">
      {/* Page Header Section */}
      <div className="mb-8 bg-[#16181D] rounded-xl p-6 border border-[rgba(136,136,136,0.2)] shadow-xl animate-fade-in">
        <div className="flex items-center gap-2 mb-6">
          <Filter className="w-5 h-5 text-[#022683]" />
          <h2 className="text-xl font-bold text-white uppercase tracking-wider">Page Header Settings</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-[#888888] uppercase tracking-wider block">Page Title</label>
            <input
              type="text"
              value={headerData.title}
              onChange={(e) => setHeaderData({ ...headerData, title: e.target.value })}
              placeholder="e.g., Newsletters"
              className="w-full px-4 py-3 bg-[#0F1115] border border-[rgba(136,136,136,0.15)] rounded-lg text-[#E6E6E6] focus:ring-2 focus:ring-[#022683] outline-none transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-[#888888] uppercase tracking-wider block">Page Subtitle</label>
            <input
              type="text"
              value={headerData.subtitle}
              onChange={(e) => setHeaderData({ ...headerData, subtitle: e.target.value })}
              placeholder="e.g., Stay updated with our latest industry insights..."
              className="w-full px-4 py-3 bg-[#0F1115] border border-[rgba(136,136,136,0.15)] rounded-lg text-[#E6E6E6] focus:ring-2 focus:ring-[#022683] outline-none transition-all"
            />
          </div>
          <div className="col-span-1 md:col-span-2 space-y-2">
            <label className="text-xs font-semibold text-[#888888] uppercase tracking-wider block">Background Image</label>
            <div className="flex gap-4 items-start">
              <div className="flex-1 space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={headerData.backgroundImage?.startsWith('data:') ? 'Local Image Selected' : headerData.backgroundImage}
                    onChange={(e) => setHeaderData({ ...headerData, backgroundImage: e.target.value })}
                    readOnly={headerData.backgroundImage?.startsWith('data:')}
                    className="flex-1 px-4 py-3 bg-[#0F1115] border border-[rgba(136,136,136,0.15)] rounded-lg text-white outline-none focus:ring-2 focus:ring-[#022683]"
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

        <div className="flex justify-end">
          <button
            onClick={handleUpdateHeader}
            disabled={savingHeader}
            className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-500 transition-all duration-300 shadow-lg hover:shadow-green-500/20 active:scale-95 disabled:opacity-50"
          >
            {savingHeader ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>{savingHeader ? 'Updating...' : 'Update Header'}</span>
          </button>
        </div>
      </div>

      {/* Main Content Header */}
      <div className="mb-8 flex items-center justify-between animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Newsletter Management</h1>
          <p className="text-[#888888]">Manage monthly newsletters with PDFs and content summaries</p>
        </div>
        <button
          onClick={handleAddNew}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#022683] to-[#033aa0] text-white rounded-lg hover:from-[#033aa0] hover:to-[#022683] transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 relative overflow-hidden group"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-[rgba(136,136,136,0.2)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <Plus className="w-4 h-4 relative z-10 transition-transform duration-300 group-hover:rotate-90" />
          <span className="relative z-10">Add Newsletter</span>
        </button>
      </div>


      {/* Filters */}
      <div className="mb-6 flex gap-4 animate-fade-in">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#888888]" />
          <input
            type="text"
            placeholder="Search by month, editorial, or content..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-[#16181D] border border-[rgba(136,136,136,0.25)] rounded-lg focus:ring-2 focus:ring-[#022683] focus:border-[#022683] outline-none text-[#E6E6E6] transition-all duration-300 hover:border-[#888888]"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#888888]" />
          <select
            value={filterYear}
            onChange={(e) => setFilterYear(e.target.value)}
            className="pl-10 pr-8 py-3 bg-[#16181D] border border-[rgba(136,136,136,0.25)] rounded-lg focus:ring-2 focus:ring-[#022683] focus:border-[#022683] outline-none text-[#E6E6E6] transition-all duration-300 hover:border-[#888888] cursor-pointer"
          >
            <option value="all">All Years</option>
            {years.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Newsletter Table */}
      <div className="bg-gradient-to-br from-[#16181D] to-[#1a1d24] rounded-lg shadow-lg border border-[rgba(136,136,136,0.25)] overflow-hidden animate-fade-in hover-card-lift">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-[#022683] to-[#033aa0]">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white">Month / Year</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white">Title</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white">Industry Review</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white">Other Contents</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white">File</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white">Status</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-white">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(136,136,136,0.25)]">
              {filteredNewsletters.map((newsletter, index) => (
                <tr
                  key={newsletter._id}
                  className="hover:bg-[rgba(136,136,136,0.05)] transition-all duration-300 animate-fade-in"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-[#888888]" />
                      <span className="text-[#E6E6E6] font-medium">{newsletter.month} {newsletter.year}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-[#E6E6E6] line-clamp-2">{newsletter.title}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-[#888888] text-sm line-clamp-2">{newsletter.industryReview}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-[#888888] text-sm line-clamp-2">{newsletter.otherContents}</p>
                  </td>
                  <td className="px-6 py-4">
                    {newsletter.pdfFile ? (
                      <a
                        href={`http://localhost:5000/${newsletter.pdfFile}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-[#888888] to-[#022683] text-white rounded text-sm hover:from-[#022683] hover:to-[#888888] transition-all duration-300 hover:scale-105"
                      >
                        <Download className="w-3 h-3" />
                        Download
                      </a>
                    ) : (
                      <span className="text-[#888888] text-sm italic">No File</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs rounded ${newsletter.enabled
                      ? 'bg-gradient-to-r from-green-500/20 to-green-600/20 text-green-400 border border-green-500/30'
                      : 'bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 text-yellow-400 border border-yellow-500/30'
                      }`}>
                      {newsletter.enabled ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleEdit(newsletter)}
                        className="p-2 text-[#022683] hover:bg-[rgba(2,38,131,0.1)] rounded transition-all duration-300 hover:scale-110"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(newsletter._id!)}
                        className="p-2 text-red-400 hover:bg-[rgba(255,0,0,0.1)] rounded transition-all duration-300 hover:scale-110"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredNewsletters.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-[#888888]">
                    <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No newsletters found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-gradient-to-br from-[#0F1115] via-[#16181D] to-[#0F1115] rounded-lg shadow-2xl border border-[rgba(136,136,136,0.25)] w-full max-w-3xl max-h-[90vh] overflow-y-auto m-4 animate-scale-in">
            {/* Modal Header */}
            <div className="sticky top-0 bg-gradient-to-r from-[#16181D] to-[#1a1d24] px-6 py-4 flex items-center justify-between border-b border-[rgba(136,136,136,0.25)] z-10">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <FileText className="w-5 h-5" />
                {editingNewsletter ? 'Edit Newsletter' : 'Add New Newsletter'}
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
              {/* Month & Year */}
              <div className="grid grid-cols-2 gap-4">
                <div className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
                  <label className="block text-sm font-medium text-[#888888] mb-2">
                    Month <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={formData.month}
                    onChange={(e) => setFormData({ ...formData, month: e.target.value })}
                    className="w-full px-4 py-3 bg-[#0F1115] border border-[rgba(136,136,136,0.25)] rounded-lg focus:ring-2 focus:ring-[#022683] focus:border-[#022683] outline-none text-[#E6E6E6] transition-all duration-300 hover:border-[#888888]"
                  >
                    <option value="">Select Month</option>
                    {months.map(month => (
                      <option key={month} value={month}>{month}</option>
                    ))}
                  </select>
                </div>

                <div className="animate-fade-in" style={{ animationDelay: '0.15s' }}>
                  <label className="block text-sm font-medium text-[#888888] mb-2">
                    Year <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                    className="w-full px-4 py-3 bg-[#0F1115] border border-[rgba(136,136,136,0.25)] rounded-lg focus:ring-2 focus:ring-[#022683] focus:border-[#022683] outline-none text-[#E6E6E6] transition-all duration-300 hover:border-[#888888]"
                  >
                    {years.map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Title */}
              <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
                <label className="block text-sm font-medium text-[#888888] mb-2">
                  Title <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Year-End Tax Planning Strategies"
                  className="w-full px-4 py-3 bg-[#0F1115] border border-[rgba(136,136,136,0.25)] rounded-lg focus:ring-2 focus:ring-[#022683] focus:border-[#022683] outline-none text-[#E6E6E6] transition-all duration-300 hover:border-[#888888]"
                />
              </div>

              {/* Industry Review */}
              <div className="animate-fade-in" style={{ animationDelay: '0.25s' }}>
                <label className="block text-sm font-medium text-[#888888] mb-2">
                  Industry Review
                </label>
                <input
                  type="text"
                  value={formData.industryReview}
                  onChange={(e) => setFormData({ ...formData, industryReview: e.target.value })}
                  placeholder="e.g., Manufacturing Sector Growth Analysis"
                  className="w-full px-4 py-3 bg-[#0F1115] border border-[rgba(136,136,136,0.25)] rounded-lg focus:ring-2 focus:ring-[#022683] focus:border-[#022683] outline-none text-[#E6E6E6] transition-all duration-300 hover:border-[#888888]"
                />
              </div>

              {/* Other Contents */}
              <div className="animate-fade-in" style={{ animationDelay: '0.3s' }}>
                <label className="block text-sm font-medium text-[#888888] mb-2">
                  Other Contents
                </label>
                <textarea
                  value={formData.otherContents}
                  onChange={(e) => setFormData({ ...formData, otherContents: e.target.value })}
                  placeholder="e.g., GST Updates, Budget Highlights, Compliance Checklists"
                  rows={3}
                  className="w-full px-4 py-3 bg-[#0F1115] border border-[rgba(136,136,136,0.25)] rounded-lg focus:ring-2 focus:ring-[#022683] focus:border-[#022683] outline-none text-[#E6E6E6] transition-all duration-300 hover:border-[#888888]"
                />
              </div>

              {/* File Upload */}
              <div className="animate-fade-in" style={{ animationDelay: '0.35s' }}>
                <label className="block text-sm font-medium text-[#888888] mb-2">
                  Newsletter PDF <span className="text-red-400">*</span>
                </label>
                <div className="border-2 border-dashed border-[rgba(136,136,136,0.25)] rounded-lg p-6 text-center hover:border-[#888888] transition-all duration-300 bg-[#0F1115]">
                  <Upload className="w-8 h-8 mx-auto mb-3 text-[#888888]" />
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="pdf-upload"
                  />
                  <label
                    htmlFor="pdf-upload"
                    className="cursor-pointer text-[#022683] hover:text-[#033aa0] font-medium"
                  >
                    Click to upload PDF
                  </label>
                  {(uploadingFile || formData.pdfFile) && (
                    <p className="mt-2 text-sm text-green-400 flex items-center justify-center gap-2">
                      <FileText className="w-4 h-4" />
                      {uploadingFile ? uploadingFile.name : (formData.pdfFile.split('/').pop())}
                    </p>
                  )}
                  <p className="text-xs text-[#888888] mt-2">PDF files only, max 10MB</p>
                </div>
              </div>

              {/* Enabled Toggle */}
              <div className="animate-fade-in" style={{ animationDelay: '0.4s' }}>
                <label className="flex items-center gap-3 cursor-pointer group p-4 bg-[#0F1115] rounded-lg border border-[rgba(136,136,136,0.25)] hover:border-[#888888] transition-all duration-300">
                  <input
                    type="checkbox"
                    checked={formData.enabled}
                    onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
                    className="sr-only"
                  />
                  <div className={`w-12 h-6 rounded-full transition-all duration-300 ${formData.enabled ? 'bg-gradient-to-r from-green-500 to-green-600' : 'bg-[rgba(136,136,136,0.3)]'} group-hover:shadow-lg `}>
                    <div className={`w-5 h-5 bg-white rounded-full m-0.5 transition-all duration-300 shadow-md ${formData.enabled ? 'translate-x-6' : ''} group-hover:scale-110`}></div>
                  </div>
                  <div className="flex-1">
                    <span className="text-[#E6E6E6] font-medium">Publish Newsletter</span>
                    <p className="text-xs text-[#888888] mt-1">Make this newsletter visible on the website</p>
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
                <span className="relative z-10">{editingNewsletter ? 'Update' : 'Save'} Newsletter</span>
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
              Delete this image?
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
